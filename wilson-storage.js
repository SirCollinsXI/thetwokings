'use strict';

(() => {
  const pointer = 'ttk-wilson-backup-active-v1';
  const keys = Object.freeze({
    course: 'ttk-wilson-v1',
    learning: 'ttk-wilson-learning-v2',
    pictures: 'ttk-wilson-picture-input-v1',
    pictureLanguage: 'ttk-wilson-picture-input-v1-lang',
    kids: 'ttk-wilson-child-v1',
    path: 'ttk-wilson-path-v1'
  });
  const legacy = 'legacy';
  const generation = value => value === legacy || /^[0-9a-f-]{36}$/.test(value);
  function active() {
    const raw = localStorage.getItem(pointer);
    if (!raw) return { id: legacy };
    const value = JSON.parse(raw);
    if (!value || typeof value.id !== 'string' || !generation(value.id)
        || typeof value.previous !== 'string' || !generation(value.previous)) throw new Error('Invalid active backup');
    return value;
  }
  const keyAt = (id, key) => id === legacy ? key : 'ttk-wilson-restore:' + id + ':' + key;
  // A trainer tab keeps its original generation until it reloads. Stale tabs
  // cannot write to the restored generation.
  let opened = legacy;
  try { opened = active().id; } catch {}
  const key = name => keyAt(opened, name);
  function writable() {
    if (active().id !== opened) throw new Error('Learning progress changed in another tab');
  }
  function snapshot(id = active().id) {
    const parts = {};
    for (const [section, name] of Object.entries(keys)) {
      const entry = localStorage.getItem(keyAt(id, name));
      if (entry !== null) parts[section] = section === 'pictureLanguage' ? entry : JSON.parse(entry);
    }
    return parts;
  }
  const locked = operation => globalThis.navigator?.locks?.request
    ? navigator.locks.request(pointer, operation) : operation();
  function remove(id) {
    if (!id || id === legacy) return;
    for (const name of Object.values(keys)) {
      try { localStorage.removeItem(keyAt(id, name)); } catch {}
    }
  }
  function restore(parts, expected) {
    return locked(() => {
      const before = active();
      if (before.id !== expected) throw new Error('Backup selection changed');
      const id = crypto.randomUUID();
      try {
        for (const [section, name] of Object.entries(keys)) {
          const value = Object.hasOwn(parts, section)
            ? (section === 'pictureLanguage' ? parts[section] : JSON.stringify(parts[section]))
            : localStorage.getItem(keyAt(before.id, name));
          if (value !== null) localStorage.setItem(keyAt(id, name), value);
        }
        if (active().id !== before.id) throw new Error('Backup selection changed');
        localStorage.setItem(pointer, JSON.stringify({ id, previous: before.id }));
      } catch (error) {
        remove(id);
        throw error;
      }
      if (globalThis.navigator?.locks?.request) remove(before.previous);
    });
  }
  function swap(expected) {
    return locked(() => {
      const before = active();
      if (before.id !== expected || !before.previous) throw new Error('Backup selection changed');
      localStorage.setItem(pointer, JSON.stringify({ id: before.previous, previous: before.id }));
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    const link = document.querySelector('[data-wilson-backup]');
    if (!link) return;
    const select = document.querySelector('#ui, #lang');
    const labels = {
      de: ['Lernstand sichern', 'Ein anderer Tab hat den Lernstand gewechselt. Lade diese Seite neu, um weiterzulernen.'],
      en: ['Back up progress', 'Progress changed in another tab. Reload this page to keep learning.'],
      zh: ['备份学习进度', '另一个标签页切换了学习进度。请重新加载此页面后再继续练习。']
    };
    function update() {
      const locale = Object.hasOwn(labels, select.value) ? select.value : 'zh';
      link.href = 'wilson-backup.html?lang=' + locale;
      link.textContent = labels[locale][0];
    }
    update();
    select.addEventListener('change', update);
    window.addEventListener('storage', event => {
      if (event.key !== pointer) return;
      let warning = document.getElementById('wilson-backup-changed');
      if (!warning) {
        warning = document.createElement('p');
        warning.id = 'wilson-backup-changed';
        warning.setAttribute('role', 'alert');
        document.querySelector('main').prepend(warning);
      }
      warning.hidden = active().id === opened;
      warning.textContent = (labels[select.value] || labels.zh)[1];
    });
  });

  globalThis.WilsonStorage = Object.freeze({
    pointer, active, snapshot, restore, swap, key,
    getItem: name => localStorage.getItem(key(name)),
    setItem(name, value) { writable(); localStorage.setItem(key(name), value); }
  });
})();
