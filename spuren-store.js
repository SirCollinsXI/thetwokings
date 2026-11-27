const previewSpuren = (() => {
  'use strict';
  const key = 'ttk-spuren-preview-v1';
  const limit = 36;
  const categories = new Set(['spiele', 'comics', 'lernen', 'werkstatt']);
  const kinds = new Set(['presence', 'helpful', 'idea', 'controls']);
  const messages = {
    presence: ['Ich war hier', 'I was here', '我来过'],
    helpful: ['Hat mir geholfen', 'This helped me', '对我有帮助'],
    controls: ['Steuerung war knifflig', 'The controls were tricky', '操作有点难'],
    piratenjagd: ['Piratenjagd', 'Pirate Hunt', '海盗冒险'],
    idea: ['Idee', 'Idea', '点子'],
    sample: ['Beispiel', 'Example', '示例'],
    own: ['Deine Spur', 'Your trace', '你的印记'],
    continuation: ['Weiterführung', 'Follow-up', '续写'],
    extend: ['Weiterbauen', 'Build on this', '接着完善'],
    remove: ['Löschen', 'Delete', '删除'],
    saved: ['Hier im Browser gespeichert.', 'Saved in this browser.', '已保存在当前浏览器中。'],
    temporary: ['Nur auf dieser Seite verfügbar. Beim Verlassen geht die Änderung verloren.', 'Available only on this page. Changes are lost when you leave.', '仅在当前页面可用，离开后更改将丢失。'],
    duplicate: ['Dieses Zeichen hast du hier schon gesetzt.', 'You already left this mark here.', '你已经在这里留下过这个印记。'],
    deleted: ['Spur gelöscht.', 'Trace deleted.', '印记已删除。'],
    full: ['Lösche eine eigene Spur, um eine neue zu speichern.', 'Delete one of your traces to save a new one.', '请先删除一条自己的印记，再保存新的。'],
  };

  function languageIndex() {
    const language = document.documentElement.lang;
    return language.startsWith('zh') ? 2 : language === 'en' ? 1 : 0;
  }

  function t(name) {
    return messages[name][languageIndex()];
  }

  let memory = [];
  let memoryOnly = false;

  function valid(entry) {
    return entry && typeof entry.id === 'string' && categories.has(entry.category) &&
      kinds.has(entry.kind) && typeof entry.note === 'string' && entry.note.length <= 180 &&
      (entry.parentId === null || typeof entry.parentId === 'string') &&
      (entry.project === undefined || (entry.project === 'piratenjagd' && entry.category === 'spiele')) &&
      (entry.kind !== 'controls' || entry.project === 'piratenjagd');
  }

  function read() {
    if (memoryOnly) return memory;
    let raw;
    try {
      raw = localStorage.getItem(key);
    } catch {
      memoryOnly = true;
      return memory;
    }
    try {
      const entries = JSON.parse(raw);
      memory = Array.isArray(entries) ? entries.filter(valid).slice(0, limit) : [];
    } catch {
      memory = [];
    }
    return memory;
  }

  function write(entries, success) {
    memory = entries;
    if (!memoryOnly) {
      try {
        localStorage.setItem(key, JSON.stringify(entries));
        return success;
      } catch {
        memoryOnly = true;
      }
    }
    return 'temporary';
  }

  // Serialize read/modify/write across tabs where Web Locks are available.
  async function edit(action) {
    if (!memoryOnly) {
      try {
        if (navigator.locks) return await navigator.locks.request(key, () => action(read()));
      } catch (error) {
        if (error.name !== 'SecurityError') throw error;
      }
    }
    return action(read());
  }

  function add({ category, kind, note = '', parentId = null, project }) {
    return edit(entries => {
      const parent = entries.find(entry => entry.id === parentId && entry.category === category);
      const origin = project ?? parent?.project;
      if (kind !== 'idea' && entries.some(entry => entry.category === category && entry.project === origin && entry.kind === kind)) {
        return 'duplicate';
      }
      if (entries.length >= limit) return 'full';
      const id = crypto.randomUUID?.() ?? Date.now() + '-' + Math.random().toString(36).slice(2);
      const trace = { id, category, kind, note, parentId, project: origin };
      return write([trace, ...entries], 'saved');
    });
  }

  function remove(id) {
    return edit(entries => write(entries.filter(entry => entry.id !== id), 'deleted'));
  }

  return { key, read, add, remove, t, languageIndex };
})();
