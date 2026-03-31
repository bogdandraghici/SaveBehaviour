/**
 * Floating Page Navigation — injected into every prototype page.
 *
 * Reads the page registry from `PAGE_NAV_PAGES` (set before this script)
 * and renders a toggle button + dropdown panel in the top-right corner.
 * Also renders a widget variant switcher.
 *
 * Each page should define before including this script:
 *   window.PAGE_NAV_PAGES = [
 *     { id: 'email-connections', label: 'Email Connections', href: 'index.html' },
 *   ];
 *   window.PAGE_NAV_CURRENT = 'email-connections';
 */
(function () {
  const pages   = window.PAGE_NAV_PAGES   || [];
  const current = window.PAGE_NAV_CURRENT || '';
  if (!pages.length) return;

  const VARIANTS = [
    { id: 'dark',  label: 'Dark' },
    { id: 'blue',  label: 'Blue' },
    { id: 'light', label: 'Light' },
  ];

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

  // Pages section
  const pagesTitle = document.createElement('div');
  pagesTitle.className = 'page-nav-title';
  pagesTitle.textContent = 'Pages';
  panel.appendChild(pagesTitle);

  pages.forEach(p => {
    const a = document.createElement('a');
    a.className = 'page-nav-link' + (p.id === current ? ' active' : '');
    a.href = p.href;
    a.innerHTML = `<span class="page-nav-dot"></span>${p.label}`;
    panel.appendChild(a);
  });

  // Divider
  const divider = document.createElement('div');
  divider.className = 'page-nav-divider';
  panel.appendChild(divider);

  // Variants section
  const varTitle = document.createElement('div');
  varTitle.className = 'page-nav-title';
  varTitle.textContent = 'Widget Variant';
  panel.appendChild(varTitle);

  const varContainer = document.createElement('div');
  varContainer.className = 'page-nav-variants';

  VARIANTS.forEach(v => {
    const btn = document.createElement('button');
    btn.className = 'page-nav-variant' + (v.id === 'dark' ? ' active' : '');
    btn.dataset.variant = v.id;
    btn.title = v.label;
    btn.innerHTML = `<span class="page-nav-variant-swatch" data-variant="${v.id}"></span>`;
    varContainer.appendChild(btn);
  });

  panel.appendChild(varContainer);

  // Spec link
  const specDivider = document.createElement('div');
  specDivider.className = 'page-nav-divider';
  panel.appendChild(specDivider);

  const specLink = document.createElement('a');
  specLink.className = 'page-nav-link';
  specLink.href = 'widget-spec.html';
  specLink.innerHTML = '<span class="page-nav-dot"></span>Widget Spec';
  panel.appendChild(specLink);

  document.body.appendChild(toggle);
  document.body.appendChild(panel);
  panel.classList.add('open');

  // ── Toggle behaviour ──
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });

  // ── Variant switching ──
  const banner = document.querySelector('.save-banner');

  varContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.page-nav-variant');
    if (!btn) return;

    const variant = btn.dataset.variant;

    // Update active state in menu
    varContainer.querySelectorAll('.page-nav-variant').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Apply variant to banner
    if (banner) {
      if (variant === 'dark') {
        banner.removeAttribute('data-variant');
      } else {
        banner.setAttribute('data-variant', variant);
      }
    }

    // Apply variant to widget-preview on spec page
    document.querySelectorAll('.widget-preview').forEach(el => {
      el.classList.remove('dark', 'blue', 'light');
      el.classList.add(variant);
    });
  });
})();
