const marks = new Set(['wave', 'star', 'crown']);
const kinds = new Set(['', 'human', 'ai']);
const regions = new Set(('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
  'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT ' +
  'JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ ' +
  'NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW ' +
  'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ ' +
  'UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW').split(' '));
const fields = ['mark', 'nick', 'region', 'kind', 'consent', 'requestId'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const berlinDay = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit'
});
const daySeconds = 86400;
const pendingLifetime = 30 * daySeconds;
const expired = 'published_at IS NULL AND submitted_at <= ?';
const approved = `SELECT published_at, mark, nick, region, kind FROM guest_greetings
  WHERE published_at IS NOT NULL ORDER BY published_at DESC, id DESC LIMIT 100`;
const schema = [
  `CREATE TABLE IF NOT EXISTS guest_greetings (
    id INTEGER PRIMARY KEY, request_key TEXT NOT NULL UNIQUE,
    submitted_at INTEGER NOT NULL, mark TEXT NOT NULL CHECK(mark IN ('wave','star','crown')),
    nick TEXT NOT NULL, region TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('','human','ai')),
    consent_version INTEGER NOT NULL DEFAULT 1 CHECK(consent_version = 1),
    published_at INTEGER CHECK(published_at IS NULL OR published_at >= submitted_at)
  )`,
  'CREATE INDEX IF NOT EXISTS guest_review_time ON guest_greetings(published_at, submitted_at)',
  'CREATE INDEX IF NOT EXISTS guest_submitted_time ON guest_greetings(submitted_at)'
];

function json(status, body, headers = {}) {
  return Response.json(body, {status, headers: {
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers
  }});
}

// Cloudflare wraps SQLite errors in Error.cause in some D1 runtimes.
function missingTable(error) {
  for (let cause = error; cause; cause = cause.cause) {
    if (/no such table:\s*(?:main\.)?guest_greetings\b/i.test(cause.message || '')) return true;
    if (cause === cause.cause) break;
  }
  return false;
}

function validNick(value) {
  if (typeof value !== 'string' || value.length > 40) return false;
  const checked = value.normalize('NFKC');
  // These are public labels, not contact or URL fields.
  return !/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}<>@]/u.test(checked)
    && !/(?:https?:|www\.|mailto:|[\p{L}\p{N}-]+\.[\p{L}]{2,}(?:\b|$))/iu.test(checked)
    && !/(?:\+?\d[() .-]*){7,}/.test(checked);
}

async function parseSubmission(request) {
  const limit = 1536;
  if (!request.body || Number(request.headers.get('Content-Length')) > limit) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let text = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, {stream: true});
    }
    const data = JSON.parse(text + decoder.decode());
    if (!data || Object.keys(data).length !== fields.length || !fields.every(k => Object.hasOwn(data, k))
      || data.consent !== true || !marks.has(data.mark) || !kinds.has(data.kind)
      || typeof data.requestId !== 'string' || !uuid.test(data.requestId)
      || !validNick(data.nick) || (data.region !== '' && !regions.has(data.region))) return null;
    return { ...data, nick: data.nick.trim().normalize('NFC') };
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

async function listCards(db, cutoff) {
  const stale = await db.prepare('SELECT 1 FROM guest_greetings WHERE ' + expired + ' LIMIT 1').bind(cutoff).first();
  if (stale) await db.prepare('DELETE FROM guest_greetings WHERE ' + expired).bind(cutoff).run();
  const { results } = await db.prepare(approved).all();
  const cards = results.map(({published_at, mark, nick, region, kind}) => ({
    day: berlinDay.format(new Date(published_at * 1000)), mark, nick, region, kind
  }));
  return json(200, { cards });
}

async function enqueue(db, data, seconds, cutoff) {
  // D1 runs batch statements in a single transaction. One-time keys make network
  // retries idempotent and never connect one visitor's different submissions.
  const insert = db.prepare(`INSERT INTO guest_greetings
    (request_key, submitted_at, mark, nick, region, kind)
    SELECT ?, ?, ?, ?, ?, ?
    WHERE (SELECT COUNT(*) FROM guest_greetings WHERE published_at IS NULL) < 150
      AND (SELECT COUNT(*) FROM guest_greetings WHERE submitted_at > ?) < 10
      AND (SELECT COUNT(*) FROM guest_greetings WHERE submitted_at > ?) < 100
    ON CONFLICT(request_key) DO NOTHING`);
  const key = data.requestId.toLowerCase();
  const [, , found] = await db.batch([
    db.prepare('DELETE FROM guest_greetings WHERE ' + expired).bind(cutoff),
    insert.bind(key, seconds, data.mark, data.nick,
      data.region, data.kind, seconds - 60, seconds - daySeconds),
    db.prepare('SELECT mark, nick, region, kind FROM guest_greetings WHERE request_key = ?').bind(key)
  ]);
  const card = found.results[0];
  if (!card) return json(429, { error: 'quota' }, { 'Retry-After': '60' });
  if (['mark', 'nick', 'region', 'kind'].some(k => card[k] !== data[k])) {
    return json(409, { error: 'conflict' });
  }
  return json(202, { status: 'pending' });
}

export async function serveGuestCards(request, db, now = Date.now()) {
  const isPost = request.method === 'POST';
  if (!isPost && request.method !== 'GET') return json(405, {error: 'method'}, {Allow: 'GET, POST'});
  if (isPost) {
    if (request.headers.get('Origin') !== new URL(request.url).origin ||
        request.headers.get('Sec-Fetch-Site') === 'cross-site') return json(403, {error: 'origin'});
    if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return json(415, {error: 'type'});
    }
  }
  if (!db) return json(503, {error: 'unavailable'});
  const data = isPost ? await parseSubmission(request) : null;
  if (isPost && !data) return json(400, {error: 'validation'});
  const seconds = Math.floor(now / 1000);
  const cutoff = seconds - pendingLifetime;
  const perform = () => isPost ? enqueue(db, data, seconds, cutoff) : listCards(db, cutoff);
  try {
    try {
      return await perform();
    } catch (error) {
      if (!missingTable(error)) throw error;
      await db.batch(schema.map(sql => db.prepare(sql)));
      return await perform();
    }
  } catch {
    return json(503, {error: 'unavailable'});
  }
}

export function onRequest({request, env}) {
  return serveGuestCards(request, env.PUBLIC_TRACES_DB);
}
