const marks = ['wave', 'star', 'crown'];
const dayInBerlin = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit'
});
const minuteLimit = 60;
const selectDay = 'SELECT day, wave, star, crown, window_minute, window_count FROM public_trace_day WHERE id = 1';

// One atomic update. Replaying the same visible counter cannot add another mark.
// Updating the single row on the next day replaces the previous aggregate.
const addMark = `
  UPDATE public_trace_day SET
    day = ?1,
    wave = (CASE WHEN day = ?1 THEN wave ELSE 0 END) + (?2 = 'wave'),
    star = (CASE WHEN day = ?1 THEN star ELSE 0 END) + (?2 = 'star'),
    crown = (CASE WHEN day = ?1 THEN crown ELSE 0 END) + (?2 = 'crown'),
    window_count = CASE WHEN day = ?1 AND window_minute = ?3 THEN window_count + 1 ELSE 1 END,
    window_minute = ?3
  WHERE id = 1 AND day <= ?1
    AND (day < ?1 OR window_minute <> ?3 OR window_count < ?5)
    AND (CASE WHEN day < ?1 THEN 0 WHEN ?2 = 'wave' THEN wave
              WHEN ?2 = 'star' THEN star ELSE crown END) = ?4
`;

// Keep these idempotent statements in sync with migrations/0002_public_trace_day.sql.
// Pages Functions can receive a newly bound database before migrations run.
const initializeDay = [
  `CREATE TABLE IF NOT EXISTS public_trace_day (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  day TEXT NOT NULL,
  wave INTEGER NOT NULL CHECK (wave >= 0),
  star INTEGER NOT NULL CHECK (star >= 0),
  crown INTEGER NOT NULL CHECK (crown >= 0),
  window_minute INTEGER NOT NULL,
  window_count INTEGER NOT NULL CHECK (window_count BETWEEN 0 AND 60)
)`,
  'INSERT OR IGNORE INTO public_trace_day VALUES (1, \'\', 0, 0, 0, 0, 0)'
];

async function readOrCount(db, write) {
  const read = db.prepare(selectDay);
  if (!write) return { row: await read.first(), changes: 0 };
  const [updated, current] = await db.batch([write, read]);
  return { row: current.results[0], changes: updated.meta.changes };
}

async function wallRow(db, write) {
  try {
    const result = await readOrCount(db, write);
    if (result.row) return result;
  } catch (error) {
    const missingTable = [error?.message, error?.cause?.message].some(message =>
      typeof message === 'string' && /\bno such table:\s*(?:main\.)?public_trace_day\b/i.test(message));
    if (!missingTable) throw error;
  }
  // Two simultaneous first requests may initialize the same table and sentinel row.
  // The batch never replaces an existing count. Retry the original operation once.
  await db.batch(initializeDay.map(sql => db.prepare(sql)));
  return readOrCount(db, write);
}

function json(status, body, extraHeaders = {}) {
  return Response.json(body, { status, headers: {
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extraHeaders
  } });
}

function snapshot(row, day) {
  if (!row || row.day > day) throw new Error('Wall unavailable');
  const counts = Object.fromEntries(marks.map(mark => [mark, row.day === day ? row[mark] : 0]));
  return { day, counts };
}

async function submission(request) {
  const limit = 160;
  if (Number(request.headers.get('Content-Length')) > limit) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  let size = 0;
  const decoder = new TextDecoder('utf-8', { fatal: true });
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
      text += decoder.decode(value, { stream: true });
    }
    const input = JSON.parse(text + decoder.decode());
    if (!input || Object.keys(input).length !== 3 || !marks.includes(input.mark)
        || !Number.isSafeInteger(input.seen) || input.seen < 0
        || typeof input.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.day)) return null;
    return input;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export async function serveWall(request, db, now = Date.now()) {
  const { method } = request;
  if (method !== 'GET' && method !== 'POST') return json(405, { error: 'method' }, { Allow: 'GET, POST' });
  if (method === 'POST') {
    if (request.headers.get('Origin') !== new URL(request.url).origin
        || request.headers.get('Sec-Fetch-Site') === 'cross-site') return json(403, { error: 'origin' });
    if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return json(415, { error: 'type' });
    }
  }
  if (!db) return json(503, { error: 'unavailable' });
  const day = dayInBerlin.format(now);
  const minute = Math.floor(now / 60_000);
  try {
    const input = method === 'POST' ? await submission(request) : null;
    if (method === 'POST' && !input) return json(400, { error: 'submission' });
    const write = input?.day === day
      ? db.prepare(addMark).bind(day, input.mark, minute, input.seen, minuteLimit)
      : null;
    const { row, changes } = await wallRow(db, write);
    const board = snapshot(row, day);
    if (method === 'GET' || changes === 1) return json(200, board);
    if (input.day !== day) return json(409, board);
    if (row.window_minute === minute && row.window_count >= minuteLimit) {
      return json(429, board, { 'Retry-After': String(60 - (Math.floor(now / 1000) % 60)) });
    }
    return json(409, board);
  } catch {
    return json(503, { error: 'unavailable' });
  }
}

export function onRequest({ request, env }) {
  return serveWall(request, env.PUBLIC_TRACES_DB);
}
