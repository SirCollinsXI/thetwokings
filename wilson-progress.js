'use strict';

(() => {
  const profile = WilsonProfile;
  const copy = {
    de: {
      back: '← Trainingsecke', backup: 'Lernstand sichern', profile: 'Profil auf diesem Gerät',
      local: 'Profil und Lernstand liegen in diesem Browser.', create: 'Lokales Profil anlegen',
      edit: 'Profil bearbeiten', nickname: 'Nickname', avatar: 'Avatar',
      adoptNote: 'Dieses Profil übernimmt den Lernstand dieses Browsers.',
      adopt: 'Diesen Lernstand übernehmen', save: 'Änderungen speichern', cancel: 'Abbrechen',
      remove: 'Nickname und Avatar entfernen', saved: 'Profil gespeichert.', removed: 'Nickname und Avatar entfernt.',
      invalid: 'Gib einen Nickname mit bis zu 32 Zeichen ein.', failure: 'Der Browser konnte die Änderung nicht speichern.',
      unreadable: 'Der Lernstand konnte gerade nicht gelesen werden.',
      continue: 'Bildtraining fortsetzen', choose: 'Lernmodus wählen',
      picture: 'Bild-Eingabetraining', cards: 'Verschiedene geübte Bildkarten', attempts: 'Abgeschlossene Aufgaben',
      first: 'Im ersten Versuch richtig', due: 'Zur Wiederholung fällig', other: 'Weitere Lernmodi',
      days: 'Simple und Pro · Lerntage', kids: 'Kindermodus · abgeschlossene Runden',
      avatars: { octopus: 'Oktopus', crown: 'Krone', owl: 'Eule', panda: 'Panda', fox: 'Fuchs' }
    },
    en: {
      back: '← Learning corner', backup: 'Back up progress', profile: 'Profile on this device',
      local: 'Your profile and progress are saved in this browser.', create: 'Create a local profile',
      edit: 'Edit profile', nickname: 'Nickname', avatar: 'Avatar',
      adoptNote: 'This profile will use the existing progress in this browser.',
      adopt: 'Use this learning progress', save: 'Save changes', cancel: 'Cancel',
      remove: 'Remove nickname and avatar', saved: 'Profile saved.', removed: 'Nickname and avatar removed.',
      invalid: 'Enter a nickname of up to 32 characters.', failure: 'The browser could not save your changes.',
      unreadable: 'Your progress could not be read right now.',
      continue: 'Continue picture practice', choose: 'Choose a learning mode',
      picture: 'Picture typing practice', cards: 'Different picture cards practised', attempts: 'Completed exercises',
      first: 'Correct on the first try', due: 'Due for review', other: 'Other learning modes',
      days: 'Simple and Pro · learning days', kids: 'Kids’ mode · completed rounds',
      avatars: { octopus: 'Octopus', crown: 'Crown', owl: 'Owl', panda: 'Panda', fox: 'Fox' }
    },
    zh: {
      back: '← 学习角', backup: '备份学习进度', profile: '此设备上的学习档案',
      local: '档案和学习进度保存在当前浏览器中。', create: '创建本地学习档案',
      edit: '编辑学习档案', nickname: '昵称', avatar: '头像',
      adoptNote: '此档案会沿用当前浏览器中的学习进度。',
      adopt: '使用此学习进度', save: '保存修改', cancel: '取消',
      remove: '移除昵称和头像', saved: '学习档案已保存。', removed: '昵称和头像已移除。',
      invalid: '请输入最多 32 个字符的昵称。', failure: '浏览器无法保存此次修改。',
      unreadable: '暂时无法读取学习进度。',
      continue: '继续看图练习', choose: '选择学习方式',
      picture: '看图输入练习', cards: '已练习的不同图片卡', attempts: '已完成的练习',
      first: '首次正确率', due: '待复习', other: '其他学习方式',
      days: '轻松学习和进阶学习 · 学习日', kids: '儿童模式 · 已完成的轮数',
      avatars: { octopus: '章鱼', crown: '王冠', owl: '猫头鹰', panda: '熊猫', fox: '狐狸' }
    }
  };
  const locale = profile.language(new URLSearchParams(location.search).get('lang'));
  const shared = profile.labels[locale];
  const text = { ...copy[locale], title: shared.title };
  const $ = id => document.getElementById(id);
  const form = $('profile-form');
  const edit = $('profile-edit');
  const status = $('profile-status');
  const nickname = $('nickname');
  const avatar = $('avatar');
  const training = $('continue-training');
  const count = value => Number.isSafeInteger(value) && value >= 0;
  const intl = locale === 'zh' ? 'zh-Hans' : locale;
  const integer = new Intl.NumberFormat(intl);
  const percent = new Intl.NumberFormat(intl, { style: 'percent' });
  let current;

  document.documentElement.lang = intl;
  document.title = text.title + ' · Wilson · TheTwoKings';
  for (const node of document.querySelectorAll('[data-copy]')) node.textContent = text[node.dataset.copy];
  for (const [id, page] of [['corner-link', 'wilson'], ['choose-training', 'wilson'],
    ['backup-link', 'wilson-backup'], ['continue-training', 'wilson-input']]) {
    $(id).href = profile.localized(page, locale);
  }
  for (const [value, icon] of Object.entries(profile.avatars)) {
    const label = icon + ' ' + text.avatars[value];
    avatar.add(new Option(label, value));
  }

  function readProfile() {
    try { current = profile.read(); }
    catch { current = null; status.textContent = text.failure; }
  }
  function paintProfile() {
    $('learner').hidden = !current;
    $('learner-avatar').textContent = current ? profile.avatars[current.avatar] : '';
    $('learner-name').textContent = current?.nickname || '';
    training.textContent = current ? shared.continueAs(current.nickname) : text.continue;
    edit.textContent = current ? text.edit : text.create;
  }
  function closeForm() {
    form.hidden = true;
    edit.hidden = false;
    edit.focus();
  }
  function paintStats() {
    const put = (id, value) => { $('stat-' + id).textContent = count(value) ? integer.format(value) : '—'; };
    try {
      const state = WilsonStorage.snapshot();
      const pictures = state.pictures;
      const items = pictures?.items || {};
      const words = typeof WILSON_VOCABULARY === 'object' ? WILSON_VOCABULARY.inputWords : null;
      const now = Date.now();
      put('cards', words?.filter(word => items[word.id]?.seen > 0).length);
      put('due', words?.filter(word => items[word.id] && items[word.id].due <= now).length);
      const tested = pictures?.tested ?? 0;
      const correct = pictures?.firstCorrect ?? 0;
      put('attempts', tested);
      $('stat-first').textContent = count(tested) && tested > 0 && count(correct) && correct <= tested
        ? percent.format(correct / tested) : '—';
      put('days', Object.values(state.course?.days || {}).filter(days => days > 0).length);
      put('kids', state.kids?.rounds ?? 0);
      $('stats-status').textContent = words ? '' : text.unreadable;
    } catch {
      for (const value of document.querySelectorAll('.metrics dd')) value.textContent = '—';
      $('stats-status').textContent = text.unreadable;
    }
  }

  edit.onclick = () => {
    readProfile();
    status.textContent = '';
    nickname.setCustomValidity('');
    nickname.value = current?.nickname || '';
    avatar.value = current?.avatar || 'octopus';
    $('adopt-note').hidden = Boolean(current);
    $('profile-save').textContent = current ? text.save : text.adopt;
    $('profile-remove').hidden = !current;
    edit.hidden = true;
    form.hidden = false;
    nickname.focus();
  };
  nickname.addEventListener('input', () => nickname.setCustomValidity(''));
  form.onsubmit = event => {
    event.preventDefault();
    const name = nickname.value.trim();
    if (!profile.validNickname(name)) {
      nickname.setCustomValidity(text.invalid);
      nickname.reportValidity();
      return;
    }
    try {
      current = profile.save(name, avatar.value);
      closeForm();
      paintProfile();
      status.textContent = text.saved;
    } catch { status.textContent = text.failure; }
  };
  $('profile-cancel').onclick = closeForm;
  $('profile-remove').onclick = () => {
    try {
      profile.remove();
      current = null;
      closeForm();
      paintProfile();
      status.textContent = text.removed;
    } catch { status.textContent = text.failure; }
  };
  function refresh() { readProfile(); paintProfile(); paintStats(); }
  refresh();
  window.addEventListener('pageshow', refresh);
  window.addEventListener('storage', event => {
    if (event.key === profile.key || event.key === null) { readProfile(); paintProfile(); }
    if (event.key !== profile.key) paintStats();
  });
})();
