(() => {
  'use strict';

  const words = {
    fresh: ["Neuen Vorschlag ans Team schreiben", "Write a new suggestion for the team", "向团队写一条新建议"],
    jump: ["Idee ans Team schicken", "Send an idea to the team", "向团队提建议"],
    title: ["Mitgestalten", "Help shape the site", "一起改进网站"],
    intro: ["Was können wir hier verbessern? Schreib dem Team eine Idee.", "What could work better here? Tell the team your idea.", "你觉得哪里还可以改进？把你的想法告诉我们。"],
    editor: ["E-Mail vorbereiten", "Prepare an email", "准备邮件"],
    recipient: ["An", "To", "收件人"],
    category: ["Bereich", "Section", "版块"],
    startseite: ["Startseite", "Homepage", "首页"],
    spiele: ["Spiele", "Games", "游戏"],
    comics: ["Comics", "Comics", "漫画"],
    lernen: ["Lernen", "Learning", "学习"],
    werkstatt: ["PC-Werkstatt", "PC workshop", "电脑工坊"],
    note: ["Dein Vorschlag (bis zu 600 Zeichen)", "Your suggestion (up to 600 characters)", "你的建议（最多 600 个字符）"],
    permission: ["Das Team darf meinen Vorschlag nach Prüfung hier ohne meinen Namen veröffentlichen.", "After review, the team may publish my suggestion here without my name.", "经审核后，团队可以在这里公开我的建议，不署我的名字。"],
    explain: ["Erst wenn du die E-Mail abschickst, erhält das Team deinen Vorschlag und deine Absenderadresse. Ohne den Haken bleibt dein Vorschlag beim Team.", "The team receives your suggestion and email address when you send the email. Leave the box unchecked to keep your suggestion within the team.", "你发送邮件后，团队才会收到建议和你的邮箱地址。不勾选上面的方框，建议就只供团队阅读。"],
    compose: ["Im E-Mail-Programm öffnen", "Open in email app", "在邮件应用中打开"],
    copy: ["Für Webmail kopieren", "Copy for webmail", "复制到网页邮箱"],
    manual: ["E-Mail-Text zum Kopieren", "Email text to copy", "可复制的邮件内容"],
    privacy: ["Datenschutz für Entwicklungsideen", "Privacy for suggestions", "建议反馈的隐私说明"],
    wall: ["Öffentliche Ideenwand", "Public ideas board", "公开建议墙"],
    empty: ["Bisher wurde hier noch keine Gastidee veröffentlicht.", "No visitor suggestions have been published here yet.", "这里暂时还没有已公开的访客建议。"],
    team: ["Vom Team", "From the team", "团队动态"],
    change: ["Sams Piratenszene füllt jetzt seine Comic-Kachel.", "Sam’s pirate scene now fills his comic tile.", "现在，Sam 的漫画卡片完整铺开了海盗场景。"],
    invalid: ["Schreib bitte einen Vorschlag mit 1 bis 600 Zeichen.", "Please write a suggestion between 1 and 600 characters long.", "请写下 1 到 600 个字符的建议。"],
    private: ["Nur für das Team.", "For the team only.", "仅供团队阅读。"],
    public: ["Mein Vorschlag darf nach Prüfung ohne meinen Namen veröffentlicht werden.", "After review, my suggestion may be published without my name.", "经审核后，可以不署我的名字公开这条建议。"],
    subject: ["TheTwoKings – Vorschlag", "TheTwoKings – Suggestion", "TheTwoKings – 网站建议"],
    subjectLabel: ["Betreff", "Subject", "主题"],
    scope: ["Veröffentlichung", "Publication", "是否公开"],
    launched: ["Sende den Entwurf in deinem E-Mail-Programm. Falls es sich nicht öffnet, nutze „Für Webmail kopieren“.", "Send the draft in your email app. If it does not open, use “Copy for webmail”.", "请在邮件应用中发送草稿。如果没有打开应用，请选择“复制到网页邮箱”。"],
    copied: ["Entwurf mit Empfänger kopiert. Füge ihn in deine E-Mail ein.", "Draft and recipient copied. Paste them into your email.", "已复制草稿和收件人。请粘贴到你的邮箱中。"],
    select: ["Der Entwurf ist zum manuellen Kopieren markiert.", "The draft is selected so you can copy it manually.", "草稿已选中，可以手动复制。"],
  };
  const byId = id => document.getElementById(id);
  const editor = byId('feedback-editor');
  const form = byId('feedback-form');
  const category = byId('feedback-category');
  const note = byId('feedback-note');
  const permission = byId('feedback-permission');
  const status = byId('feedback-status');
  const manualBox = byId('feedback-manual-box');
  const manualText = byId('feedback-manual');
  const published = byId('feedback-published');
  const recipient = byId('feedback-recipient').textContent.trim();
  const categories = new Set([...category.options].map(option => option.value));
  const languages = ['de', 'en', 'zh'];
  let chosenCategory = false;
  let statusKey = '';

  function language() {
    return document.documentElement.lang.split('-')[0];
  }

  function word(key) {
    const index = languages.indexOf(language());
    return words[key][index < 0 ? 0 : index];
  }

  function tell(key) {
    statusKey = key;
    status.textContent = key ? word(key) : '';
  }

  function clearDraftCopy() {
    manualBox.hidden = true;
    manualText.value = '';
    note.setCustomValidity('');
    tell('');
  }

  function useCategory(value) {
    if (categories.has(value) && !chosenCategory && !note.value && !permission.checked) category.value = value;
  }

  function openFromLink() {
    if (location.hash === '#mitgestalten') editor.open = true;
    if (location.hash === '#spuren' || location.hash === '#mitgestalten') {
      useCategory(new URLSearchParams(location.search).get('section'));
    }
  }

  function renderApproved() {
    const dateFormat = new Intl.DateTimeFormat(document.documentElement.lang, { dateStyle: 'medium', timeZone: 'UTC' });
    const items = [];
    const approvals = globalThis.freigegebeneEntwicklungsideen;
    for (const idea of Array.isArray(approvals) ? approvals : []) {
      if (!idea || !categories.has(idea.category) || !/^\d{4}-\d{2}-\d{2}$/.test(idea.day)
          || !languages.every(lang => typeof idea.text?.[lang] === 'string' && idea.text[lang].trim())) continue;
      const day = new Date(idea.day + 'T00:00:00Z');
      if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== idea.day) continue;
      const item = document.createElement('li');
      const meta = document.createElement('span');
      meta.className = 'next';
      const time = document.createElement('time');
      time.dateTime = idea.day;
      time.textContent = dateFormat.format(day);
      meta.append(time, ' · ' + word(idea.category));
      const suggestion = document.createElement('p');
      suggestion.textContent = idea.text[language()] || idea.text.de;
      item.append(meta, suggestion);
      items.push(item);
    }
    published.replaceChildren(...items);
    published.hidden = !items.length;
    byId('feedback-empty').hidden = items.length > 0;
  }

  function translate() {
    for (const node of document.querySelectorAll('[data-feedback-word]')) node.textContent = word(node.dataset.feedbackWord);
    const lang = language();
    byId('feedback-privacy').hash = lang === 'de' ? 'entwicklungsideen' : 'entwicklungsideen-' + lang;
    if (manualBox.hidden) tell(statusKey);
    else clearDraftCopy();
    if (note.validity.customError) note.setCustomValidity(word('invalid'));
    renderApproved();
  }

  function makeDraft() {
    const suggestion = note.value.trim();
    if (!suggestion || note.value.length > note.maxLength) {
      note.setCustomValidity(word('invalid'));
      tell('invalid');
      note.reportValidity();
      return null;
    }
    const section = word(category.value);
    const subject = word('subject') + ' · ' + section;
    const body = [word('category') + ': ' + section, '', suggestion, '',
      word('scope') + ': ' + word(permission.checked ? 'public' : 'private')].join('\n').replace(/\r\n?|\n/g, '\r\n');
    return { subject, body };
  }

  form.noValidate = true;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const draft = makeDraft();
    if (!draft) return;
    const link = document.createElement('a');
    link.href = 'mailto:' + recipient + '?subject=' + encodeURIComponent(draft.subject)
      + '&body=' + encodeURIComponent(draft.body.toWellFormed ? draft.body.toWellFormed() : draft.body);
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    tell('launched');
  });

  byId('feedback-copy').addEventListener('click', async () => {
    const draft = makeDraft();
    if (!draft) return;
    const text = word('recipient') + ': ' + recipient + '\n' + word('subjectLabel') + ': '
      + draft.subject + '\n\n' + draft.body;
    try {
      await navigator.clipboard.writeText(text);
      manualBox.hidden = true;
      manualText.value = '';
      tell('copied');
    } catch {
      manualBox.hidden = false;
      manualText.value = text;
      manualText.focus();
      manualText.select();
      tell('select');
    }
  });

  form.addEventListener('input', event => {
    if (event.target === category) chosenCategory = true;
    clearDraftCopy();
  });
  category.addEventListener('change', () => { chosenCategory = true; });
  for (const link of document.querySelectorAll('[data-trace-context]')) {
    link.addEventListener('click', () => useCategory(link.dataset.traceContext));
  }
  byId('trace-context').addEventListener('change', event => useCategory(event.target.value));
  for (const link of document.querySelectorAll('.feedback-jump')) {
    link.addEventListener('click', () => { editor.open = true; });
  }
  window.addEventListener('hashchange', openFromLink);
  new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  translate();
  editor.hidden = false;
  openFromLink();
})();
