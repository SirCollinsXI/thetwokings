'use strict';

(() => {
  const reader = document.getElementById('saga-reader');
  const select = document.getElementById('saga-select');
  const previous = document.getElementById('saga-prev');
  const next = document.getElementById('saga-next');
  const image = document.getElementById('comic-page');
  const zoom = document.getElementById('saga-zoom');
  const viewport = document.getElementById('saga-viewport');
  const number = document.getElementById('saga-number');
  const caption = document.getElementById('saga-title');
  const links = Array.from(document.querySelectorAll('.saga-contents ol a'));
  const pages = links.map(link => ({ title: link.textContent, src: link.getAttribute('href') }));
  let current = 0;

  function pageFromHash() {
    const match = /^#seite-(\d{1,2})$/.exec(location.hash);
    const page = match ? Number(match[1]) : 1;
    return Math.max(1, Math.min(pages.length, page));
  }

  function setZoom(enlarged) {
    zoom.setAttribute('aria-pressed', String(enlarged));
    if (!enlarged) viewport.scrollLeft = 0;
  }

  function show(page, navigate = false) {
    if (page < 1 || page > pages.length || page === current) return;
    current = page;
    const entry = pages[page - 1];
    setZoom(false);
    image.alt = entry.title;
    image.src = entry.src;
    caption.textContent = entry.title;
    number.textContent = page + ' / ' + pages.length;
    select.value = String(page);
    previous.disabled = page === 1;
    next.disabled = page === pages.length;
    if (navigate) {
      const url = new URL(location.href);
      url.hash = 'seite-' + page;
      history.pushState(null, '', url);
      viewport.scrollIntoView({ block: 'start' });
    }
  }

  links.forEach((link, index) => {
    const page = index + 1;
    select.add(new Option(String(page).padStart(2, '0') + ' · ' + pages[index].title, String(page)));
    link.setAttribute('href', '#seite-' + page);
    link.addEventListener('click', event => {
      if (event.button || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      if (current === page) viewport.scrollIntoView({ block: 'start' });
      else show(page, true);
      zoom.focus({ preventScroll: true });
    });
  });
  previous.addEventListener('click', () => show(current - 1, true));
  next.addEventListener('click', () => show(current + 1, true));
  select.addEventListener('change', () => show(Number(select.value), true));
  zoom.addEventListener('click', () => setZoom(zoom.getAttribute('aria-pressed') !== 'true'));
  document.addEventListener('keydown', event => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step || event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.target === zoom && zoom.getAttribute('aria-pressed') === 'true' && viewport.scrollWidth > viewport.clientWidth) {
      event.preventDefault();
      viewport.scrollLeft += step * viewport.clientWidth / 2;
    } else if (!event.target.closest('input,select,textarea,button') || event.target === zoom) {
      event.preventDefault();
      show(current + step, true);
    }
  });
  window.addEventListener('hashchange', () => show(pageFromHash()));
  reader.hidden = false;
  show(pageFromHash());
})();
