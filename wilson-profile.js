'use strict';

(() => {
  const key = 'ttk-wilson-profile-v1';
  const avatars = Object.freeze({ octopus: '🐙', crown: '♛', owl: '🦉', panda: '🐼', fox: '🦊' });
  const validNickname = value => typeof value === 'string' && value.trim() === value
    && value.length > 0 && value.length <= 32 && !/[\p{Cc}\p{Bidi_Control}]/u.test(value);

  function read() {
    const raw = localStorage.getItem(key);
    let value;
    try { value = JSON.parse(raw); } catch { return null; }
    if (value?.version === 1 && typeof value.id === 'string' && validNickname(value.nickname)
        && Object.hasOwn(avatars, value.avatar)) return value;
    return null;
  }

  const labels = {
    de: { title: 'Mein Lernstand', continueAs: name => 'Weiterlernen als ' + name },
    en: { title: 'My progress', continueAs: name => 'Keep learning as ' + name },
    zh: { title: '我的学习进度', continueAs: name => '继续练习 · ' + name }
  };
  const language = value => Object.hasOwn(labels, value) ? value : 'zh';
  const localized = (page, locale) => page + '.html?lang=' + language(locale);
  window.WilsonProfile = Object.freeze({
    key, avatars, read, labels, language, localized, validNickname,
    save(nickname, avatar) {
      if (!validNickname(nickname) || !Object.hasOwn(avatars, avatar)) throw new Error('Invalid profile');
      const current = read();
      const profile = { version: 1, id: current?.id || crypto.randomUUID(), nickname, avatar };
      localStorage.setItem(key, JSON.stringify(profile));
      return profile;
    },
    remove() { localStorage.removeItem(key); }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const link = document.querySelector('[data-wilson-progress]');
    if (!link) return;
    const select = document.querySelector('#ui, #lang');
    const continueLink = document.querySelector('[data-wilson-continue]');
    function paint() {
      const locale = language(select.value);
      link.href = localized('wilson-progress', locale);
      link.textContent = labels[locale].title;
      if (!continueLink) return;
      let profile;
      try { profile = read(); } catch {}
      continueLink.hidden = !profile;
      if (!profile) return;
      continueLink.href = localized('wilson-input', locale);
      continueLink.textContent = avatars[profile.avatar] + ' ' + labels[locale].continueAs(profile.nickname);
    }
    paint();
    select.addEventListener('change', paint);
    window.addEventListener('pageshow', paint);
    window.addEventListener('storage', event => { if (event.key === key || event.key === null) paint(); });
  });
})();
