(() => {
  'use strict';

  const panel = document.getElementById('spuren');
  const category = document.getElementById('trace-context');
  const form = document.getElementById('trace-form');
  const note = document.getElementById('trace-note');
  const list = document.getElementById('trace-list');
  const status = document.getElementById('trace-status');
  const parentNotice = document.getElementById('trace-parent');
  const cancel = document.getElementById('trace-cancel');
  const categories = new Set([...category.options].map(option => option.value));
  const kinds = new Set(['presence', 'helpful', 'idea']);
  const key = 'ttk-spuren-preview-v1';
  const limit = 36;
  const messages = {
    presence: ['Ich war hier', 'I was here', '我来过'],
    helpful: ['Hat mir geholfen', 'This helped me', '对我有帮助'],
    idea: ['Idee', 'Idea', '点子'],
    sample: ['Beispiel', 'Example', '示例'],
    own: ['Deine Spur', 'Your trace', '你的印记'],
    continuation: ['Weiterführung', 'Follow-up', '续写'],
    extend: ['Weiterbauen', 'Build on this', '接着完善'],
    remove: ['Löschen', 'Delete', '删除'],
    saved: ['Hier im Browser gespeichert.', 'Saved in this browser.', '已保存在当前浏览器中。'],
    temporary: ['Für diesen Tab gespeichert. Nach dem Schließen geht die Spur verloren.', 'Saved in this tab until you close it.', '仅保存在当前标签页中，关闭后会丢失。'],
    duplicate: ['Dieses Zeichen hast du hier schon gesetzt.', 'You already left this mark here.', '你已经在这里留下过这个印记。'],
    deleted: ['Spur gelöscht.', 'Trace deleted.', '印记已删除。'],
    full: ['Lösche eine eigene Spur, um eine neue zu speichern.', 'Delete one of your traces to save a new one.', '请先删除一条自己的印记，再保存新的。'],
  };
  const samples = {
    spiele: ['Ein Wegweiser am Start könnte zeigen, wo es zum ersten Ziel geht.', 'A sign at the start could point to the first goal.', '可以在起点放一个路标，指向第一个目标。'],
    comics: ['Wie würde die Szene aus Piets Blickwinkel aussehen?', 'What would the scene look like from Piet’s point of view?', '从 Piet 的视角看，这一幕会是什么样子？'],
    lernen: ['Ein Beispielsatz könnte zeigen, wann man dieses Wort benutzt.', 'An example sentence could show when to use the word.', '可以加个例句，说明这个词该在什么时候用。'],
    werkstatt: ['Kann man die Versandkosten im Vergleich deutlicher zeigen?', 'Could the comparison make shipping costs easier to spot?', '能不能在对比时更醒目地显示运费？'],
  };

  let traces = load();
  let parentId = null;
  let message = '';
  let activeSection = category.value;
  const drafts = new Map();

  function languageIndex() {
    const language = document.documentElement.lang;
    return language.startsWith('zh') ? 2 : language === 'en' ? 1 : 0;
  }

  function t(name) {
    return messages[name][languageIndex()];
  }

  function valid(entry) {
    return entry && typeof entry.id === 'string' && categories.has(entry.category) &&
      kinds.has(entry.kind) && typeof entry.note === 'string' && entry.note.length <= 180 &&
      (entry.parentId === null || typeof entry.parentId === 'string');
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      return Array.isArray(saved) ? saved.filter(valid).slice(0, limit) : [];
    } catch {
      return [];
    }
  }

  function save(success) {
    try {
      localStorage.setItem(key, JSON.stringify(traces));
      message = success;
    } catch {
      message = 'temporary';
    }
    render();
  }

  function renderTrace(trace, sample = false) {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    const text = document.createElement('p');
    const extend = document.createElement('button');
    if (trace.parentId) item.className = 'trace-reply';
    title.textContent = t(sample ? 'sample' : 'own') + ' · ' + t(trace.parentId ? 'continuation' : trace.kind);
    text.textContent = trace.note || t(trace.kind);
    extend.type = 'button';
    extend.textContent = t('extend');
    extend.addEventListener('click', () => {
      parentId = trace.id;
      updateParent();
      note.focus();
    });
    item.append(title, text, extend);
    if (!sample) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = t('remove');
      remove.addEventListener('click', () => {
        traces = traces.filter(entry => entry.id !== trace.id);
        if (parentId === trace.id) parentId = null;
        save('deleted');
        panel.querySelector('summary').focus();
      });
      item.append(remove);
    }
    return item;
  }

  function updateParent() {
    parentNotice.hidden = !parentId;
  }

  function render() {
    const section = category.value;
    const example = { id: 'sample-' + section, kind: 'idea', note: samples[section][languageIndex()] };
    const own = traces.filter(trace => trace.category === section);
    const children = new Map();
    for (const trace of own) {
      if (!children.has(trace.parentId)) children.set(trace.parentId, []);
      children.get(trace.parentId).push(trace);
    }
    const visible = [];
    const shown = new Set();
    function appendBranch(trace, sample = false) {
      if (shown.has(trace.id)) return;
      shown.add(trace.id);
      visible.push(renderTrace(trace, sample));
      for (const child of children.get(trace.id) ?? []) appendBranch(child);
    }
    appendBranch(example, true);
    for (const trace of own.filter(entry => !entry.parentId)) appendBranch(trace);
    for (const trace of own) appendBranch(trace);
    list.replaceChildren(...visible);
    status.textContent = message ? t(message) : '';
    updateParent();
  }

  function add(kind, text = '', parent = null) {
    const section = category.value;
    if (kind !== 'idea' && traces.some(trace => trace.category === section && trace.kind === kind)) {
      message = 'duplicate';
      render();
      return false;
    }
    if (traces.length >= limit) {
      message = 'full';
      render();
      return false;
    }
    const id = crypto.randomUUID?.() ?? Date.now() + '-' + Math.random().toString(36).slice(2);
    traces.unshift({ id, category: section, kind, note: text, parentId: parent });
    if (kind === 'idea') parentId = null;
    save('saved');
    return true;
  }

  function switchCategory() {
    parentId = null;
    message = '';
    drafts.set(activeSection, note.value);
    activeSection = category.value;
    note.value = drafts.get(activeSection) ?? '';
    render();
  }

  category.addEventListener('change', switchCategory);
  for (const link of document.querySelectorAll('[data-trace-context]')) {
    link.addEventListener('click', () => {
      if (category.value !== link.dataset.traceContext) {
        category.value = link.dataset.traceContext;
        switchCategory();
      }
      panel.open = true;
      requestAnimationFrame(() => panel.querySelector('summary').focus({preventScroll: true}));
    });
  }
  for (const button of panel.querySelectorAll('[data-trace-add]')) {
    button.addEventListener('click', () => add(button.dataset.traceAdd));
  }
  cancel.addEventListener('click', () => {
    parentId = null;
    updateParent();
    note.focus();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = note.value.trim();
    if (!text) {
      note.value = '';
      note.reportValidity();
      return;
    }
    if (add('idea', text.slice(0, 180), parentId)) note.value = '';
  });
  new MutationObserver(render).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  });
  render();
})();
