(() => {
  'use strict';
  const recipient = 'kontakt@thetwokings.de';
  const languages = ['de', 'en', 'zh'];
  const symbols = { wave: '👋', star: '★', crown: '♛' };
  // ISO 3166-1 codes; the browser supplies their names in the selected language.
  const regions = new Set((
    'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ ' +
    'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
    'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT ' +
    'JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ ' +
    'NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW ' +
    'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ ' +
    'UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'
  ).split(' '));
  const words = {
    intro: ['Freigegebene Grüße sind für alle sichtbar. Name, Herkunft und Mensch oder KI geben die Absender selbst an.', 'Anyone can read approved greetings. Visitors choose their own name, location and human or AI description.', '审核通过的问候对所有人可见。姓名、来自哪里，以及是人类还是人工智能，均由访客自行填写。'],
    empty: ['Noch keine veröffentlichten Grüße.', 'No greetings have been published yet.', '目前还没有已公开的问候。'],
    emptyEditorial: ['Hier ist noch kein redaktionell eingetragener Gruß veröffentlicht.', 'There are no greetings on the editorial list yet.', '编辑列表中暂时还没有已公开的问候。'],
    offlineRead: ['Direkte Einreichungen sind gerade nicht verfügbar. Einen Gruß kannst du per E-Mail vorschlagen.', 'Direct submissions are currently unavailable. You can still suggest a greeting by email.', '目前无法直接提交，你仍可以通过邮件提交问候。'],
    lastRead: ['Du siehst die zuletzt geladenen Grüße. Die Aktualisierung ist fehlgeschlagen.', 'You are seeing the last greetings loaded. The refresh did not succeed.', '更新未成功，现在显示上次加载的问候。'],
    create: ['Öffentlichen Gruß vorschlagen', 'Submit a public greeting', '提交公开问候'],
    symbol: ['Bildzeichen', 'Symbol', '图标'],
    wave: ['👋 Winken', '👋 Wave', '👋 挥手'],
    star: ['★ Stern', '★ Star', '★ 星星'],
    crown: ['♛ Krone', '♛ Crown', '♛ 王冠'],
    nickname: ['Name oder Nickname (freiwillig)', 'Name or nickname (optional)', '姓名或昵称（选填）'],
    region: ['Land oder Region (freiwillig)', 'Country or region (optional)', '国家或地区（选填）'],
    kind: ['Wer grüßt? (freiwillig)', 'Who is saying hello? (optional)', '谁在打招呼？（选填）'],
    none: ['Keine Angabe', 'Prefer not to say', '不填写'],
    human: ['Mensch', 'Human', '人类'],
    ai: ['KI', 'AI', '人工智能'],
    consent: ['Das Team darf mein Bildzeichen und meine gewählten Angaben nach Prüfung mit dem Veröffentlichungsdatum öffentlich zeigen.', 'The team may publish my symbol and the details I chose with the publication date after review.', '我同意团队审核后，将我选择的图标和填写的信息连同发布日期一起公开。'],
    sendHint: ['Schicke den Entwurf an', 'Send the draft to', '请将草稿发送至'],
    addressHint: ['Deine E-Mail-Adresse sieht das Team. Sie erscheint nicht auf der Wand.', 'The team can see your email address. It stays off the wall.', '团队可以看到你的邮箱地址。问候墙不会公开邮箱。'],
    submit: ['Gruß zur Prüfung einreichen', 'Submit for review', '提交审核'],
    directHint: ['Nach dem Einreichen prüft das Team deinen Gruß. Erst danach kann er hier erscheinen.', 'The team reviews submissions before publishing them here.', '提交后，团队会先审核，再决定是否公开。'],
    mailAlternative: ['Alternativer Weg per E-Mail an', 'Alternatively, email your greeting to', '也可以用邮件发送至'],
    refreshGuests: ['Freigegebene Grüße aktualisieren', 'Refresh published greetings', '刷新已公开的问候'],
    more: ['Weitere Grüße zeigen', 'Show more greetings', '显示更多问候'],
    submitting: ['Dein Gruß wird eingereicht.', 'Submitting your greeting.', '正在提交问候。'],
    pending: ['Dein Gruß liegt dem Team zur Prüfung vor. Öffentlich erscheint er erst nach Freigabe.', 'Your greeting is awaiting review. It becomes public only if approved.', '团队已收到问候，审核通过后才会公开。'],
    uncertain: ['Eine Bestätigung fehlt. Wiederhole die direkte Einreichung mit denselben Angaben, um eine doppelte Einsendung zu vermeiden.', 'No confirmation arrived. Retry the same direct submission to avoid sending a duplicate.', '暂未收到确认。请保留相同信息，重试直接提交，以免重复发送。'],
    rejected: ['Prüfe deine Angaben, insbesondere den Nicknamen. Verwende keine Links oder E-Mail-Adressen.', 'Please check your details, especially the nickname. Leave out links and email addresses.', '请检查填写的信息，尤其是昵称。请勿包含链接或邮箱地址。'],
    rate: ['Gerade kommen viele Grüße an. Versuch es später wieder.', 'Many greetings are arriving. Please try again later.', '当前提交较多，请稍后重试。'],
    unavailable: ['Die direkte Einreichung ist gerade nicht verfügbar. Du kannst es später erneut versuchen.', 'Direct submission is currently unavailable. You can try again later.', '目前无法直接提交，请稍后重试。'],
    conflict: ['Diese Einreichung wurde bereits mit anderen Angaben verwendet. Prüfe deinen Gruß und öffne einen neuen Entwurf.', 'This submission was used for different details. Check your greeting and start a new draft.', '此提交编号已用于其他内容。请检查问候，并重新填写草稿。'],
    compose: ['E-Mail-Entwurf öffnen', 'Open email draft', '打开邮件草稿'],
    copy: ['Für Webmail kopieren', 'Copy for webmail', '复制到网页邮箱'],
    manual: ['Entwurf zum Kopieren', 'Draft to copy', '可复制的草稿'],
    privacy: ['Datenschutz für öffentliche Grüße', 'Privacy for public greetings', '公开问候的隐私说明'],
    report: ['Gruß melden oder entfernen lassen', 'Report or request removal of a greeting', '举报或申请移除问候'],
    reportSubject: ['TheTwoKings – öffentliche Grußwand', 'TheTwoKings – public greeting wall', 'TheTwoKings – 公开问候墙'],
    reportBody: ['Um welchen Gruß geht es? Nenne bitte das Datum und das Bildzeichen oder den Nicknamen.', 'Which greeting is this about? Please include its date and symbol or nickname.', '请注明相关问候的日期，以及图标或昵称。'],
    subject: ['TheTwoKings – Gruß zur Veröffentlichung', 'TheTwoKings – greeting for publication', 'TheTwoKings – 申请公开问候'],
    to: ['An', 'To', '收件人'],
    subjectLabel: ['Betreff', 'Subject', '主题'],
    nickLabel: ['Name oder Nickname', 'Name or nickname', '姓名或昵称'],
    regionLabel: ['Land oder Region', 'Country or region', '国家或地区'],
    kindLabel: ['Selbstauskunft', 'Self-description', '自我描述'],
    published: ['Veröffentlicht', 'Published', '发布日期'],
    nickError: ['Nutze einen Namen oder Nicknamen mit höchstens 40 Zeichen. E-Mail-Adressen gehören nicht auf die Wand.', 'Use a name or nickname of up to 40 characters. Leave email addresses off the wall.', '请填写不超过40个字符的姓名或昵称，请勿填写邮箱地址。'],
    consentError: ['Um einen öffentlichen Gruß vorzuschlagen, bestätige bitte die Veröffentlichung.', 'Please give your permission before submitting a public greeting.', '提交前，请勾选同意公开问候。'],
    draftOpened: ['Sende den Entwurf in deinem E-Mail-Programm. Falls es sich nicht öffnet, nutze „Für Webmail kopieren“.', 'Send the draft in your email app. If it does not open, use “Copy for webmail”.', '请在邮件应用里发送草稿。若应用没有打开，可选择“复制到网页邮箱”。'],
    copied: ['Entwurf kopiert. Füge ihn in deine E-Mail ein und sende sie ab.', 'Draft copied. Paste it into an email and send it.', '草稿已复制。请粘贴到邮件中并发送。'],
    select: ['Der Entwurf ist zum manuellen Kopieren markiert.', 'The draft is selected for copying.', '草稿已选中，可手动复制。']
  };
  const byId = id => document.getElementById(id);
  const wall = byId('gastgruesse');
  if (!wall) return;
  const editor = byId('guest-editor');
  const form = byId('guest-form');
  const nick = byId('guest-nick');
  const region = byId('guest-region');
  const kind = byId('guest-kind');
  const mark = byId('guest-mark');
  const consent = byId('guest-consent');
  const manual = byId('guest-manual');
  const status = byId('guest-status');
  let dictionaryIndex = 0;
  let regionNames;
  let statusKey = '';
  let nativeCards = [];
  let directAvailable = false;
  let reading = false;
  let hadNativeRead = false;
  let readFailed = false;
  let sending = false;
  let attempt = null;
  let visibleCount = 4;

  const word = key => words[key][dictionaryIndex];
  const regionName = code => regionNames?.of(code) || code;

  function setStatus(key) {
    statusKey = key;
    status.textContent = key ? word(key) : '';
  }

  function resetDraft() {
    clearCopy();
    paintChannels();
  }

  function clearCopy() {
    byId('guest-manual-box').hidden = true;
    manual.value = '';
    setStatus('');
    nick.setCustomValidity('');
    consent.setCustomValidity('');
  }

  function validName(value) {
    return typeof value === 'string' && value.length <= nick.maxLength &&
      !/[\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069\ud800-\udfff]/u.test(value) &&
      !/(?:[^\s@]+@[^\s@]+\.[^\s@]+|https?:\/\/|www\.)/iu.test(value);
  }

  function renderGreetings(locale) {
    const dates = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' });
    const entries = [];
    const staticCards = globalThis.freigegebeneGastgruesse;
    const records = [...(Array.isArray(staticCards) ? staticCards : []), ...nativeCards];
    records.sort((a, b) => String(b?.day).localeCompare(String(a?.day)));
    let validRecords = 0;
    for (const record of records) {
      if (!record || !Object.hasOwn(symbols, record.mark) || !/^\d{4}-\d{2}-\d{2}$/.test(record.day)
          || record.day.startsWith('0000') || !validName(record.nick ?? '') ||
          (record.region && !regions.has(record.region)) || (record.kind && !['human', 'ai'].includes(record.kind))) continue;
      const day = new Date(record.day + 'T00:00:00Z');
      if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== record.day) continue;
      if (++validRecords > visibleCount) continue;
      const item = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = word(record.mark);
      if (record.nick?.trim()) {
        const nickname = document.createElement('bdi');
        nickname.textContent = record.nick.trim();
        title.append(' · ', nickname);
      }
      item.append(title);
      const details = [record.region && regionName(record.region), record.kind && word(record.kind)].filter(Boolean);
      if (details.length) {
        const line = document.createElement('span');
        line.textContent = details.join(' · ');
        item.append(line);
      }
      const time = document.createElement('time');
      time.dateTime = record.day;
      time.textContent = word('published') + ' · ' + dates.format(day);
      item.append(time);
      entries.push(item);
    }
    const list = byId('guest-list');
    list.replaceChildren(...entries);
    list.hidden = !entries.length;
    byId('guest-empty').hidden = Boolean(entries.length);
    byId('guest-empty').textContent = word(hadNativeRead ? 'empty' : 'emptyEditorial');
    byId('guest-more').hidden = validRecords <= visibleCount;
  }

  function mailDraft(subject, body) {
    return 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  function translate() {
    const short = document.documentElement.lang.split('-')[0];
    dictionaryIndex = Math.max(0, languages.indexOf(short));
    const locale = ['de', 'en', 'zh-Hans'][dictionaryIndex];
    for (const el of wall.querySelectorAll('[data-guest-word]')) el.textContent = word(el.dataset.guestWord);
    regionNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames([locale], { type: 'region' }) : null;
    const chosen = region.value;
    const collator = new Intl.Collator(locale);
    const options = [...regions].map(code => new Option(regionName(code), code));
    options.sort((a, b) => collator.compare(a.text, b.text));
    region.replaceChildren(new Option(word('none'), ''), ...options);
    region.value = chosen;
    const privacy = new URL(byId('guest-privacy').href);
    privacy.searchParams.set('lang', languages[dictionaryIndex]);
    privacy.hash = dictionaryIndex ? 'gastgruesse-' + languages[dictionaryIndex] : 'gastgruesse';
    byId('guest-privacy').href = privacy.href;
    byId('guest-report').href = mailDraft(word('reportSubject'), word('reportBody'));
    if (manual.value) clearCopy();
    else if (statusKey) setStatus(statusKey);
    if (consent.validity.customError) consent.setCustomValidity(word('consentError'));
    if (nick.validity.customError) nick.setCustomValidity(word('nickError'));
    renderGreetings(locale);
    paintChannels();
  }

  function paintChannels() {
    const canSubmit = directAvailable && typeof globalThis.crypto?.randomUUID === 'function';
    byId('guest-submit').hidden = !canSubmit;
    byId('guest-submit').disabled = sending || (attempt?.accepted && attempt.key === currentKey());
    byId('guest-direct-hint').hidden = !canSubmit;
    byId('guest-refresh').hidden = !hadNativeRead;
    const readStatus = byId('guest-read-status');
    readStatus.hidden = !readFailed;
    readStatus.textContent = readFailed ? word(hadNativeRead ? 'lastRead' : 'offlineRead') : '';
    byId('guest-refresh').disabled = reading;
    wall.querySelector('[data-guest-word="sendHint"]').textContent = word(canSubmit ? 'mailAlternative' : 'sendHint');
  }

  function fields() {
    return { mark: mark.value, nick: nick.value.trim(), region: region.value, kind: kind.value, consent: consent.checked };
  }

  function currentKey() {
    return JSON.stringify(fields());
  }

  async function readNative() {
    if (reading) return;
    reading = true;
    paintChannels();
    try {
      const response = await fetch('/api/gastgruesse', {
        credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(12000)
      });
      if (!response.ok) throw new Error('Unavailable');
      const data = await response.json();
      if (!Array.isArray(data.cards)) throw new Error('Invalid response');
      nativeCards = data.cards;
      hadNativeRead = true;
      readFailed = false;
      directAvailable = true;
    } catch {
      readFailed = true;
      directAvailable = false;
    } finally {
      reading = false;
      renderGreetings(['de', 'en', 'zh-Hans'][dictionaryIndex]);
      paintChannels();
    }
  }

  function checkFields() {
    nick.setCustomValidity(validName(nick.value) ? '' : word('nickError'));
    consent.setCustomValidity(consent.checked ? '' : word('consentError'));
    if (!form.reportValidity()) {
      setStatus(nick.validity.valid ? 'consentError' : 'nickError');
      return false;
    }
    return true;
  }

  function prepare() {
    if (!checkFields()) return;
    const lines = [word('symbol') + ': ' + word(mark.value)];
    if (nick.value.trim()) lines.push(word('nickLabel') + ': ' + nick.value.trim());
    if (region.value) lines.push(word('regionLabel') + ': ' + regionName(region.value) + ' (' + region.value + ')');
    if (kind.value) lines.push(word('kindLabel') + ': ' + word(kind.value));
    lines.push('', word('consent'));
    return { subject: word('subject'), body: lines.join('\r\n') };
  }

  form.noValidate = true;
  form.addEventListener('input', resetDraft);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !checkFields()) return;
    if (!directAvailable || typeof globalThis.crypto?.randomUUID !== 'function') return;
    const key = currentKey();
    if (attempt?.key !== key) attempt = { key, id: crypto.randomUUID(), accepted: false };
    if (attempt.accepted) return;
    const payload = { ...fields(), requestId: attempt.id };
    const editable = [nick, region, kind, mark, consent, byId('guest-copy'), byId('guest-compose')];
    sending = true;
    editable.forEach(el => { el.disabled = true; });
    paintChannels();
    setStatus('submitting');
    try {
      const response = await fetch('/api/gastgruesse', { method: 'POST', credentials: 'omit', cache: 'no-store',
        referrerPolicy: 'no-referrer', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(12000) });
      if (response.status === 202 && (await response.json()).status === 'pending') {
        attempt.accepted = true;
        setStatus('pending');
      } else {
        const errors = { 400: 'rejected', 409: 'conflict', 429: 'rate', 503: 'unavailable' };
        setStatus(errors[response.status] || 'uncertain');
      }
    } catch {
      setStatus('uncertain');
    } finally {
      sending = false;
      editable.forEach(el => { el.disabled = false; });
      paintChannels();
    }
  });
  byId('guest-compose').addEventListener('click', () => {
    const draft = prepare();
    if (!draft) return;
    const link = document.createElement('a');
    link.href = mailDraft(draft.subject, draft.body);
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    setStatus('draftOpened');
  });
  byId('guest-copy').addEventListener('click', async () => {
    const draft = prepare();
    if (!draft) return;
    const text = word('to') + ': ' + recipient + '\n' + word('subjectLabel') + ': ' + draft.subject + '\n\n' + draft.body;
    try {
      await navigator.clipboard.writeText(text);
      byId('guest-manual-box').hidden = true;
      manual.value = '';
      setStatus('copied');
    } catch {
      byId('guest-manual-box').hidden = false;
      manual.value = text;
      manual.focus();
      manual.select();
      setStatus('select');
    }
  });

  function openEditor() {
    if (location.hash === '#guest-editor') editor.open = true;
  }
  new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('hashchange', openEditor);
  byId('guest-refresh').addEventListener('click', readNative);
  byId('guest-more').addEventListener('click', () => {
    visibleCount += 8;
    renderGreetings(['de', 'en', 'zh-Hans'][dictionaryIndex]);
  });
  translate();
  editor.hidden = false;
  readNative();
  openEditor();
})();
