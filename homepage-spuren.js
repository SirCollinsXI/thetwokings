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
  const { t, languageIndex } = previewSpuren;
  const samples = {
    spiele: ['Ein Wegweiser am Start könnte zeigen, wo es zum ersten Ziel geht.', 'A sign at the start could point to the first goal.', '可以在起点放一个路标，指向第一个目标。'],
    comics: ['Wie würde die Szene aus Piets Blickwinkel aussehen?', 'What would the scene look like from Piet’s point of view?', '从 Piet 的视角看，这一幕会是什么样子？'],
    lernen: ['Ein Beispielsatz könnte zeigen, wann man dieses Wort benutzt.', 'An example sentence could show when to use the word.', '可以加个例句，说明这个词该在什么时候用。'],
    werkstatt: ['Kann man die Versandkosten im Vergleich deutlicher zeigen?', 'Could the comparison make shipping costs easier to spot?', '能不能在对比时更醒目地显示运费？'],
  };

  let parentId = null;
  let message = '';
  let activeSection = category.value;
  const drafts = new Map();

  function renderTrace(trace, sample = false) {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    const text = document.createElement('p');
    const extend = document.createElement('button');
    if (trace.parentId) item.className = 'trace-reply';
    const labels = [t(sample ? 'sample' : 'own')];
    if (trace.project) labels.push(t(trace.project));
    labels.push(t(trace.parentId ? 'continuation' : trace.kind));
    title.textContent = labels.join(' · ');
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
      remove.addEventListener('click', async () => {
        message = await previewSpuren.remove(trace.id);
        if (parentId === trace.id) parentId = null;
        render();
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
    const own = previewSpuren.read().filter(trace => trace.category === section);
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

  async function add(kind, text = '', parent = null) {
    const section = category.value;
    const result = await previewSpuren.add({ category: section, kind, note: text, parentId: parent });
    if (category.value === section) {
      message = result;
      if (kind === 'idea' && (result === 'saved' || result === 'temporary')) parentId = null;
      render();
    }
    return result === 'saved' || result === 'temporary';
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
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const text = note.value.trim();
    if (!text) {
      note.value = '';
      note.reportValidity();
      return;
    }
    const submit = form.querySelector('[type="submit"]');
    if (submit.disabled) return;
    const section = category.value;
    const draft = note.value;
    submit.disabled = true;
    try {
      if (await add('idea', text.slice(0, 180), parentId)) {
        if (category.value === section && note.value === draft) note.value = '';
        else if (drafts.get(section) === draft) drafts.delete(section);
      }
    } finally {
      submit.disabled = false;
    }
  });
  new MutationObserver(render).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  });
  function openFromLink() {
    if (location.hash !== '#spuren') return;
    const section = new URLSearchParams(location.search).get('section');
    if (categories.has(section) && category.value !== section) {
      category.value = section;
      switchCategory();
    }
    panel.open = true;
  }
  window.addEventListener('storage', event => {
    if (event.key === null || event.key === previewSpuren.key) render();
  });
  window.addEventListener('pageshow', render);
  openFromLink();
  render();
})();
