(() => {
  'use strict';

  const panelStatus = document.getElementById('pirate-status');
  const finishStatus = document.getElementById('pirate-finish-status');
  const note = document.getElementById('pirate-note');
  const form = document.getElementById('pirate-form');
  const source = { category: 'spiele', project: 'piratenjagd' };
  const feedback = new Map();

  function showStatus(node, code) {
    feedback.set(node, code);
    node.textContent = previewSpuren.t(code);
  }

  for (const button of document.querySelectorAll('[data-pirate-signal]')) {
    button.addEventListener('click', async () => {
      const result = await previewSpuren.add({ ...source, kind: 'controls' });
      showStatus(button.closest('#finish-panel') ? finishStatus : panelStatus, result);
    });
  }

  document.getElementById('pirate-idea-link').addEventListener('click', event => {
    event.preventDefault();
    note.focus();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const draft = note.value;
    const text = draft.trim();
    if (!text) {
      note.value = '';
      note.reportValidity();
      return;
    }
    const submit = form.querySelector('[type="submit"]');
    if (submit.disabled) return;
    submit.disabled = true;
    try {
      const result = await previewSpuren.add({ ...source, kind: 'idea', note: text.slice(0, 180) });
      showStatus(panelStatus, result);
      if ((result === 'saved' || result === 'temporary') && note.value === draft) note.value = '';
    } finally {
      submit.disabled = false;
    }
  });

  new MutationObserver(() => {
    for (const [node, code] of feedback) node.textContent = previewSpuren.t(code);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
