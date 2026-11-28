'use strict';

(() => {
  const format = 'thetwokings-wilson';
  const languages = ['de', 'en', 'zh'];
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const number = value => Number.isFinite(value) && value >= 0;
  const count = value => Number.isSafeInteger(value) && value >= 0;
  const lang = value => languages.includes(value);
  const day = /^\d{4}-\d{2}-\d{2}$/;
  const id = /^[a-zA-Z0-9_-]{1,80}$/;
  const safeId = key => id.test(key) && !['__proto__', 'constructor', 'prototype'].includes(key);
  const map = (value, valid) => object(value) && Object.entries(value).every(([key, entry]) => valid(key, entry));
  const numbers = (value, fields, check = number) => object(value) && fields.every(field => check(value[field]));
  const validators = {
    course: value => object(value) && value.version === 1 && lang(value.ui) && lang(value.target)
      && map(value.records, (key, record) => /^[\w-]{1,80}:(de|en|zh)(:(translate|hearing|recall|typing|articles|plural|singular|pronouns|mixed))?$/.test(key)
        && numbers(record, ['attempts', 'correct', 'streak', 'due']) && record.correct <= record.attempts)
      && map(value.days, (key, total) => day.test(key) && number(total)),
    learning: value => object(value) && value.version === 2 && count(value.goal) && value.goal >= 1 && value.goal <= 7
      && map(value.notes, (key, note) => safeId(key) && typeof note === 'string' && note.length <= 600)
      && map(value.evidence, (key, entry) => /^[\w-]{1,80}:(de|en|zh)$/.test(key) && numbers(entry, ['seen', 'recalled', 'delayed', 'last']))
      && Array.isArray(value.sessions) && value.sessions.length <= 500
      && value.sessions.every(entry => object(entry) && day.test(entry.day) && number(entry.answers))
      && map(value.missions, (key, entry) => /^(breakfast|home|travel):(de|en|zh)$/.test(key) && number(entry)),
    pictures: value => object(value) && value.version === 1 && count(value.tested) && count(value.firstCorrect)
      && value.firstCorrect <= value.tested
      && map(value.items, (key, entry) => safeId(key) && numbers(entry, ['seen', 'streak'], count) && numbers(entry, ['due', 'last'])),
    pictureLanguage: lang,
    kids: value => object(value) && value.version === 1 && count(value.rounds),
    path: value => ['', 'simple', 'pro', 'kids'].includes(value)
  };

  function check(parts) {
    if (!object(parts) || !Object.keys(parts).length || !map(parts, (key, value) =>
      Object.hasOwn(validators, key) && validators[key](value))) throw new Error('Invalid backup');
    return parts;
  }
  function decode(value) {
    if (!object(value) || value.version !== 1) throw new Error('Unknown backup');
    if (value.format === format) return check(value.parts);
    if (Object.hasOwn(value, 'format')) throw new Error('Unknown backup');
    if (Object.hasOwn(value, 'items')) return check({ pictures: value });
    const { learning, ...course } = value;
    return check(Object.hasOwn(value, 'learning') ? { course, learning } : { course });
  }

  const copy = {
    de: {
      title: 'Lernstand sichern', intro: 'Sichere Fortschritt, Einstellungen und Lernnotizen aus diesem Browser in einer Datei.',
      current: 'Aktueller Lernstand', download: 'Vollständige Sicherung herunterladen', restore: 'Lernstand wiederherstellen',
      read: 'Wähle eine JSON-Sicherung und prüfe den Inhalt vor dem Wiederherstellen.', file: 'Sicherungsdatei', preview: 'Vorschau der Sicherung',
      applyNote: 'Die enthaltenen Bereiche werden übernommen. Fehlende Bereiche bleiben erhalten. Zum bisherigen Stand kannst du hier zurückwechseln.',
      apply: 'Sicherung wiederherstellen', cancel: 'Abbrechen', previous: 'Zum vorherigen Lernstand wechseln',
      back: '← Trainingsecke', trainer: 'Bild-Eingabetrainer', empty: 'Hier ist noch kein Lernstand gespeichert.',
      invalid: 'Diese Datei ist beschädigt oder verwendet ein unbekanntes Sicherungsformat.', failed: 'Der Browser konnte den Vorgang nicht ausführen. Lade die Seite neu und versuche es noch einmal.',
      saved: 'Sicherung heruntergeladen.', applied: 'Lernstand wiederhergestellt. Öffne jetzt deine nächste Übung.', switched: 'Vorheriger Lernstand geöffnet.',
      course: 'Simple und Pro', learning: 'Lernplan und Notizen', pictures: 'Bild-Eingabetrainer', kids: 'Kindermodus',
      pictureLanguage: 'Sprache im Eingabetrainer', path: 'Gewählter Lernmodus',
      records: 'Lerneinträge', days: 'Lerntage', notes: 'Notizen', attempts: 'abgeschlossene Aufgaben', first: 'richtige Erstversuche', rounds: 'Runden'
    },
    en: {
      title: 'Back up learning progress', intro: 'Save this browser’s progress, settings and learning notes in one file.',
      current: 'Current progress', download: 'Download full backup', restore: 'Restore learning progress',
      read: 'Choose a JSON backup and review its contents before restoring.', file: 'Backup file', preview: 'Backup preview',
      applyNote: 'The sections in this file will be restored. Other sections are kept. You can switch back to your previous progress here.',
      apply: 'Restore backup', cancel: 'Cancel', previous: 'Switch to previous progress',
      back: '← Learning corner', trainer: 'Picture typing trainer', empty: 'No learning progress is saved here yet.',
      invalid: 'This file is damaged or has an unknown backup format.', failed: 'The browser could not complete the operation. Reload the page and try again.',
      saved: 'Backup downloaded.', applied: 'Progress restored. Open your next exercise.', switched: 'Previous progress opened.',
      course: 'Simple and Pro', learning: 'Learning plan and notes', pictures: 'Picture typing trainer', kids: 'Kids’ mode',
      pictureLanguage: 'Typing trainer language', path: 'Selected learning mode',
      records: 'learning records', days: 'learning days', notes: 'notes', attempts: 'completed exercises', first: 'correct on first try', rounds: 'rounds'
    },
    zh: {
      title: '学习进度备份', intro: '把此浏览器中的学习进度、设置和笔记保存到一个文件。',
      current: '当前进度', download: '下载完整备份', restore: '恢复学习进度',
      read: '选择 JSON 备份文件。先查看内容，再决定是否恢复。', file: '备份文件', preview: '备份预览',
      applyNote: '此文件包含的项目将成为当前进度。文件中没有的项目会保留。你可以在此切换回上一个学习进度。',
      apply: '恢复备份', cancel: '取消', previous: '切换到上一个学习进度',
      back: '← 学习角', trainer: '看图练习', empty: '此浏览器中还没有学习记录。',
      invalid: '文件已损坏或使用了未知的备份格式。', failed: '浏览器无法完成此操作。请重新加载页面再试。',
      saved: '备份已下载。', applied: '学习进度已恢复。现在可以继续练习。', switched: '已打开上一个学习进度。',
      course: '轻松学习和进阶学习', learning: '学习计划和笔记', pictures: '看图练习', kids: '儿童模式',
      pictureLanguage: '看图练习的界面语言', path: '已选学习方式',
      records: '条学习记录', days: '个学习日', notes: '条笔记', attempts: '道已完成的题', first: '道首次答对的题', rounds: '轮'
    }
  };
  const requested = new URLSearchParams(location.search).get('lang');
  const locale = lang(requested) ? requested : 'zh';
  const text = copy[locale];
  const $ = id => document.getElementById(id);
  const status = $('backup-status');
  const input = $('backup-file');
  const filePreview = $('preview');
  let pending;
  let selection = 0;
  let current;
  let activeId;
  document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : locale;
  document.title = text.title + ' · Wilson · TheTwoKings';
  for (const element of document.querySelectorAll('[data-copy]')) element.textContent = text[element.dataset.copy];
  for (const id of ['back', 'trainer']) {
    const link = $(id);
    link.href += '?lang=' + locale;
    link.textContent = text[id];
  }
  const integer = new Intl.NumberFormat(locale);
  const metric = (value, label) => integer.format(value) + ' ' + text[label];

  function renderList(list, parts) {
    const summaries = {
      course: value => [metric(Object.keys(value.records).length, 'records'), metric(Object.keys(value.days).length, 'days')],
      learning: value => [metric(Object.keys(value.notes).length, 'notes')],
      pictures: value => [metric(value.tested, 'attempts'), metric(value.firstCorrect, 'first')],
      kids: value => [metric(value.rounds, 'rounds')]
    };
    list.replaceChildren();
    for (const [section, value] of Object.entries(parts)) {
      const row = document.createElement('li');
      const detail = summaries[section]?.(value).join(' · ');
      row.textContent = detail ? text[section] + ' · ' + detail : text[section];
      list.append(row);
    }
    if (!list.children.length) {
      const row = document.createElement('li');
      row.textContent = text.empty;
      list.append(row);
    }
  }

  function refresh() {
    const active = WilsonStorage.active();
    activeId = active.id;
    current = WilsonStorage.snapshot(activeId);
    if (Object.keys(current).length) check(current);
    renderList($('current-list'), current);
    $('download').disabled = !Object.keys(current).length;
    $('swap').hidden = !active.previous;
  }
  function clearPreview() {
    selection++;
    pending = undefined;
    input.value = '';
    filePreview.hidden = true;
  }
  try { refresh(); } catch { status.textContent = text.failed; }
  input.addEventListener('change', async () => {
    const file = input.files[0];
    const request = ++selection;
    pending = undefined;
    filePreview.hidden = true;
    status.textContent = '';
    if (!file) return;
    try {
      if (file.size > 10_000_000) throw new Error('Oversized backup');
      const parts = decode(JSON.parse(await file.text()));
      if (request !== selection) return;
      pending = { parts, expected: WilsonStorage.active().id };
      renderList($('preview-list'), parts);
      filePreview.hidden = false;
      $('preview-title').focus();
    } catch {
      if (request !== selection) return;
      input.value = '';
      status.textContent = text.invalid;
    }
  });
  $('cancel').onclick = () => { clearPreview(); input.focus(); };
  $('download').onclick = () => {
    try {
      refresh();
      const blob = new Blob([JSON.stringify({ format, version: 1, parts: check(current) }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'wilson-lernstand-' + new Date().toISOString().slice(0, 10) + '.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = text.saved;
    } catch { status.textContent = text.failed; }
  };

  async function change(button, update, message) {
    input.disabled = true;
    $('apply').disabled = true;
    $('cancel').disabled = true;
    $('swap').disabled = true;
    try {
      await update();
      clearPreview();
      refresh();
      status.textContent = message;
      (button === $('apply') ? $('back') : button).focus();
    } catch { status.textContent = text.failed; }
    finally {
      input.disabled = false;
      $('apply').disabled = false;
      $('cancel').disabled = false;
      $('swap').disabled = false;
    }
  }
  $('apply').onclick = () => {
    if (pending) change($('apply'), () => WilsonStorage.restore(pending.parts, pending.expected), text.applied);
  };
  $('swap').onclick = () => change($('swap'), () => WilsonStorage.swap(activeId), text.switched);
  window.addEventListener('storage', event => {
    if (event.key !== WilsonStorage.pointer) return;
    const hadPreview = Boolean(pending);
    clearPreview();
    try { refresh(); } catch { status.textContent = text.failed; }
    if (hadPreview) status.textContent = text.failed;
  });
})();
