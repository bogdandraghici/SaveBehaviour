/**
 * Floating Page Navigation — injected into every prototype page.
 *
 * Reads the page registry from `PAGE_NAV_PAGES` (set before this script)
 * and renders a toggle button + dropdown panel in the top-right corner.
 *
 * Each page should define before including this script:
 *   window.PAGE_NAV_PAGES = [
 *     { id: 'email-connections', label: 'Email Connections', href: 'index.html' },
 *     { id: 'oracle-db',        label: 'Oracle DB',         href: 'oracle-db.html' },
 *   ];
 *   window.PAGE_NAV_CURRENT = 'email-connections';
 */
(function () {
  const pages   = window.PAGE_NAV_PAGES   || [];
  const current = window.PAGE_NAV_CURRENT || '';
  if (!pages.length) return;

  // ── Build toggle button ──
  const toggle = document.createElement('button');
  toggle.className = 'page-nav-toggle';
  toggle.setAttribute('aria-label', 'Page navigation');
  toggle.innerHTML = `
    <svg viewBox="0 0 18 18">
      <line x1="3" y1="5" x2="15" y2="5"/>
      <line x1="3" y1="9" x2="15" y2="9"/>
      <line x1="3" y1="13" x2="15" y2="13"/>
    </svg>`;

  // ── Build panel ──
  const panel = document.createElement('div');
  panel.className = 'page-nav-panel';

  const title = document.createElement('div');
  title.className = 'page-nav-title';
  title.textContent = 'Prototype Pages';
  panel.appendChild(title);

  pages.forEach(p => {
    const a = document.createElement('a');
    a.className = 'page-nav-link' + (p.id === current ? ' active' : '');
    a.href = p.href;
    a.innerHTML = `<span class="page-nav-dot"></span>${p.label}`;
    panel.appendChild(a);
  });

  document.body.appendChild(toggle);
  document.body.appendChild(panel);

  // ── Toggle behaviour ──
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== toggle) {
      panel.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') panel.classList.remove('open');
  });
})();
