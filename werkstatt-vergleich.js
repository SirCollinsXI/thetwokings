(() => {
  'use strict';

  const workshop = document.getElementById('compare-workshop-template');
  const upgrade = document.getElementById('upgrade');
  if (!workshop || !upgrade) return;

  upgrade.after(workshop.content.cloneNode(true));
  const root = document.getElementById('upgrade-vergleich');
  const navLink = document.createElement('a');
  navLink.href = '#upgrade-vergleich';
  document.querySelector('nav a[href="#system"]')?.after(navLink);

  const copy = {
    nav: ['Aufrüstvergleich', 'Upgrade comparison', '升级方案对比'],
    title: ['A/B-Aufrüstvergleich', 'A/B upgrade comparison', 'A/B 升级方案对比'],
    intro: [
      'Vergleiche zwei Aufrüstpläne aus eigenen Angeboten. EUR und CNY werden getrennt gerechnet.',
      'Compare two upgrade plans using your own quotes. EUR and CNY are calculated separately.',
      '用自己收集的报价对比两套升级方案。欧元与人民币分别计算。',
    ],
    openDemo: ['Beispiel ausprobieren', 'Try the example', '试用示例'],
    closeDemo: ['Zu meinen Plänen', 'Back to my plans', '返回我的方案'],
    own: [
      'Deine Pläne werden in diesem Browser gespeichert.',
      'Your plans are saved in this browser.',
      '你的方案保存在当前浏览器中。',
    ],
    demo: [
      'Fiktive Angebote zum Ausprobieren. Änderungen am Beispiel sind vorübergehend.',
      'Fictional quotes to try out. Example changes are temporary.',
      '以下是虚构报价，仅供试用。对示例的修改不会保存。',
    ],
    blocked: [
      'Der Browser speichert deine Pläne derzeit nicht. Sie bleiben in diesem Tab verfügbar.',
      'The browser cannot save your plans right now. They remain available in this tab.',
      '浏览器暂时无法保存方案。方案仅在此标签页内可用。',
    ],
    plan: ['Plan', 'Plan', '方案'],
    budgetEUR: ['Budget in EUR', 'Budget in EUR', '预算（欧元）'],
    budgetCNY: ['Budget in CNY', 'Budget in CNY', '预算（人民币）'],
    totalEUR: ['Summe inkl. Versand (EUR)', 'Total incl. shipping (EUR)', '含运费合计（欧元）'],
    totalCNY: ['Summe inkl. Versand (CNY)', 'Total incl. shipping (CNY)', '含运费合计（人民币）'],
    under: ['im Budget übrig', 'left in budget', '预算余额'],
    over: ['über Budget', 'over budget', '超出预算'],
    offer: ['Angebot', 'Quote', '报价'],
    model: ['Bauteil und Modell', 'Component and model', '配件和型号'],
    price: ['Angebotspreis', 'Quoted price', '报价金额'],
    shipping: ['Versand (optional)', 'Shipping (optional)', '运费（选填）'],
    currency: ['Währung', 'Currency', '币种'],
    market: ['Markt', 'Market', '市场'],
    chooseMarket: ['Bitte wählen', 'Select a market', '请选择市场'],
    germany: ['Deutschland', 'Germany', '德国'],
    china: ['China', 'China', '中国'],
    otherMarket: ['Anderer Markt', 'Other market', '其他市场'],
    date: ['Angebotsdatum', 'Quote date', '报价日期'],
    source: ['Quelle (Händler oder Link)', 'Source (seller or link)', '来源（商家或链接）'],
    addOffer: ['Angebot hinzufügen', 'Add a quote', '添加报价'],
    removeOffer: ['Angebot entfernen', 'Remove quote', '删除报价'],
    partial: [
      'Unvollständige Angebote fehlen in der Summe. Beträge erlauben bis zu zwei Nachkommastellen.',
      'Incomplete quotes are excluded from the total. Enter amounts with up to two decimal places.',
      '未填完整的报价不计入总额。金额最多可填两位小数。',
    ],
    invalidBudget: [
      'Gib das Budget mit bis zu zwei Nachkommastellen an.',
      'Enter the budget with up to two decimal places.',
      '预算金额最多可填两位小数。',
    ],
    cheaper: ['günstiger um', 'costs less by', '节省'],
    equal: ['Beide Pläne kosten gleich viel', 'Both plans cost the same', '两套方案费用相同'],
  };
  const languages = ['de-DE', 'en-GB', 'zh-CN'];
  const currencies = ['EUR', 'CNY'];
  const plans = ['A', 'B'];
  const markets = ['DE', 'CN', 'other'];
  const storageKey = 'ttk-upgrade-vergleich-v1';
  const emptyOffer = {model: '', price: '', shipping: '', currency: 'EUR', market: '', date: '', source: ''};
  const editor = root.querySelector('.compare-plans');
  const button = root.querySelector('[data-compare-demo]');
  const mode = root.querySelector('[data-compare-mode]');
  const result = root.querySelector('.compare-result');
  const planTemplate = root.querySelector('#compare-plan-template');
  const offerTemplate = root.querySelector('#compare-offer-template');
  const view = {};

  function languageIndex() {
    const lang = document.documentElement.lang;
    if (lang.startsWith('zh')) return 2;
    return lang.startsWith('en') ? 1 : 0;
  }

  let language = languageIndex();
  let showingDemo = false;
  let storageBlocked = false;
  const own = read();
  let state = own;

  function t(key) {
    return copy[key][language];
  }

  function localize(parent) {
    for (const node of parent.querySelectorAll('[data-compare-text]')) {
      node.textContent = t(node.dataset.compareText);
    }
  }

  function digits(value) {
    const match = /^(\d{1,10})(?:[.,](\d{1,2}))?$/.exec(value.trim());
    return match ? Number(match[1]) * 100 + Number((match[2] || '').padEnd(2, '0')) : null;
  }

  function display(cents, currency) {
    return new Intl.NumberFormat(languages[language], {
      style: 'currency', currency, currencyDisplay: 'code',
    }).format(cents / 100);
  }

  function sanitizeOffer(offer) {
    const clean = {...emptyOffer};
    for (const key of Object.keys(emptyOffer)) {
      if (typeof offer?.[key] === 'string') clean[key] = offer[key].slice(0, 240);
    }
    if (!currencies.includes(clean.currency)) clean.currency = 'EUR';
    if (!markets.includes(clean.market)) clean.market = '';
    return clean;
  }

  function read() {
    let saved;
    try {
      saved = localStorage.getItem(storageKey);
    } catch {
      storageBlocked = true;
    }
    let stored;
    try { stored = JSON.parse(saved); } catch {}
    return Object.fromEntries(plans.map(id => {
      const plan = stored?.[id];
      const budgets = Object.fromEntries(currencies.map(currency => [
        currency,
        typeof plan?.budgets?.[currency] === 'string' ? plan.budgets[currency].slice(0, 14) : '',
      ]));
      const offers = Array.isArray(plan?.offers) ? plan.offers.map(sanitizeOffer) : [];
      return [id, {budgets, offers}];
    }));
  }

  function updateMode() {
    button.textContent = t(showingDemo ? 'closeDemo' : 'openDemo');
    mode.textContent = t(showingDemo ? 'demo' : storageBlocked ? 'blocked' : 'own');
  }

  function save() {
    if (showingDemo) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(own));
      storageBlocked = false;
    } catch {
      storageBlocked = true;
    }
    updateMode();
  }

  function demo() {
    const sample = [
      ['1 TB PCIe 4.0 NVMe SSD', '68', '5', 'EUR', 'DE'],
      ['32 GB DDR5-5600', '535', '12', 'CNY', 'CN'],
      ['2 TB PCIe 4.0 NVMe SSD', '108', '6', 'EUR', 'DE'],
      ['32 GB DDR5-6000', '615', '15', 'CNY', 'CN'],
    ].map(([model, price, shipping, currency, market]) => ({
      model, price, shipping, currency, market, date: '2026-11-27', source: 'Demo',
    }));
    return {
      A: {budgets: {EUR: '100', CNY: '600'}, offers: sample.slice(0, 2)},
      B: {budgets: {EUR: '100', CNY: '600'}, offers: sample.slice(2)},
    };
  }

  function summary(plan) {
    const totals = Object.fromEntries(currencies.map(currency => [
      currency, {amount: 0, count: 0, partial: false},
    ]));
    for (const offer of plan.offers) {
      const total = totals[offer.currency];
      const price = digits(offer.price);
      const shipping = offer.shipping.trim() ? digits(offer.shipping) : 0;
      const date = Date.parse(offer.date);
      const complete = offer.model.trim() && offer.source.trim() && offer.market &&
        Number.isFinite(date) && new Date(date).toISOString().slice(0, 10) === offer.date &&
        price !== null && shipping !== null;
      if (!complete) {
        total.partial = true;
        continue;
      }
      total.amount += price + shipping;
      total.count += 1;
    }
    return totals;
  }

  function updateTotals() {
    const sums = {};
    for (const id of plans) {
      const plan = state[id];
      const panel = view[id];
      const totals = summary(plan);
      sums[id] = totals;
      const notices = [];
      if (currencies.some(currency => totals[currency].partial)) notices.push(t('partial'));
      for (const currency of currencies) {
        const {amount, count, partial} = totals[currency];
        const budget = digits(plan.budgets[currency]);
        const delta = budget === null ? null : budget - amount;
        const invalid = budget === null && plan.budgets[currency].trim() !== '';
        panel.querySelector('[data-budget="' + currency + '"]').setAttribute('aria-invalid', String(invalid));
        if (invalid && !notices.includes(t('invalidBudget'))) notices.push(t('invalidBudget'));
        panel.querySelector('[data-total="' + currency + '"]').textContent = count ? display(amount, currency) : '—';
        panel.querySelector('[data-remaining="' + currency + '"]').textContent =
          count && !partial && delta !== null
            ? display(Math.abs(delta), currency) + ' ' + t(delta < 0 ? 'over' : 'under')
            : '';
      }
      panel.querySelector('[data-compare-completeness]').textContent = notices.join(' ');
    }
    const comparison = currencies.flatMap(currency => {
      const {A, B} = sums;
      if (!A[currency].count || !B[currency].count || A[currency].partial || B[currency].partial) return [];
      const difference = A[currency].amount - B[currency].amount;
      if (!difference) return [t('equal') + ' (' + currency + ').'];
      const name = planLabel(difference > 0 ? 'B' : 'A');
      return [name + ' ' + t('cheaper') + ' ' + display(Math.abs(difference), currency) + '.'];
    }).join(' ');
    if (result.textContent !== comparison) result.textContent = comparison;
  }

  function planLabel(id) {
    return t('plan') + ' ' + id;
  }

  function offerRow(id, offer, index) {
    const row = offerTemplate.content.firstElementChild.cloneNode(true);
    const legend = row.querySelector('legend');
    legend.removeAttribute('data-compare-text');
    legend.textContent = t('offer') + ' ' + (index + 1);
    for (const input of row.querySelectorAll('input, select')) {
      const field = input.name;
      input.value = offer[field];
      input.addEventListener('input', () => {
        offer[field] = input.value;
        save();
        updateTotals();
      });
    }
    row.querySelector('[data-compare-remove]').addEventListener('click', () => {
      state[id].offers.splice(state[id].offers.indexOf(offer), 1);
      save();
      render();
      view[id].querySelector('[data-compare-add]').focus();
    });
    return row;
  }

  function render(focusOffer) {
    for (const id of plans) {
      const plan = state[id];
      const panel = planTemplate.content.firstElementChild.cloneNode(true);
      panel.querySelector('h3').textContent = planLabel(id);
      for (const input of panel.querySelectorAll('[data-budget]')) {
        const currency = input.dataset.budget;
        input.value = plan.budgets[currency];
        input.addEventListener('input', () => {
          plan.budgets[currency] = input.value;
          save();
          updateTotals();
        });
      }
      const add = panel.querySelector('[data-compare-add]');
      add.addEventListener('click', () => {
        plan.offers.push({...emptyOffer});
        save();
        render(id);
      });
      const rows = plan.offers.map((offer, index) => offerRow(id, offer, index));
      panel.querySelector('.compare-offers').append(...rows);
      view[id] = panel;
    }
    editor.replaceChildren(...plans.map(id => view[id]));
    localize(root);
    navLink.textContent = t('nav');
    updateMode();
    updateTotals();
    if (focusOffer) {
      view[focusOffer].querySelector('.compare-offer:last-child input[name="model"]')?.focus();
    }
  }

  button.addEventListener('click', () => {
    showingDemo = !showingDemo;
    state = showingDemo ? demo() : own;
    render();
  });

  const watchLanguage = new MutationObserver(() => {
    const next = languageIndex();
    if (next === language) return;
    language = next;
    render();
  });
  watchLanguage.observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  render();
  if (location.hash === '#upgrade-vergleich') window.requestAnimationFrame(() => root.scrollIntoView());
})();
