/**
 * Save Widget — shared behaviour for the unsaved-changes banner.
 *
 * Usage:
 *   1. Include save-widget.css in your <head>.
 *   2. Add the save-banner HTML (see save-widget.md).
 *   3. Include this script at the end of <body>.
 *
 * The script auto-initialises: it discovers every .field-input,
 * .field-select, .field-input-with-suffix input, and .switch-toggle
 * inside the page and wires up dirty-checking, reset, save-morph,
 * and the navigation-guard shake.
 *
 * Navigation links that trigger the shake are identified by the
 * selector stored in `NAV_SELECTOR`. Extend it if your page has
 * additional nav elements.
 */
(function () {
  const banner = document.querySelector('.save-banner');
  if (!banner) return;                       // nothing to do

  const btnReset = banner.querySelector('.btn-reset');
  const btnSave  = banner.querySelector('.btn-save');

  const NAV_SELECTOR =
    '.tab, .back-btn, .breadcrumb-dim, .breadcrumb-bold, ' +
    '.attachments-link, .dots-btn, [data-nav]';

  // ── helpers ──────────────────────────────────────────────
  let originals = {};

  function getFieldKey(el) {
    if (el.dataset.field) return el.dataset.field;
    const group = el.closest('.field-group, .switch-row');
    if (group) {
      const lbl = group.querySelector('.field-label, .switch-label');
      if (lbl) return lbl.textContent.trim();
    }
    return el.name || el.placeholder || Math.random().toString();
  }

  const inputSel = '.field-input, .field-select, .field-input-with-suffix input';

  function snapshotValues() {
    originals = {};
    document.querySelectorAll(inputSel).forEach(el => {
      originals[getFieldKey(el)] = el.value;
    });
    document.querySelectorAll('.switch-toggle').forEach(el => {
      originals[getFieldKey(el)] = el.classList.contains('on');
    });
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      originals['ce:' + (el.dataset.field || el.className)] = el.textContent;
    });
  }

  function hasChanges() {
    let dirty = false;
    document.querySelectorAll(inputSel).forEach(el => {
      if (originals[getFieldKey(el)] !== el.value) dirty = true;
    });
    document.querySelectorAll('.switch-toggle').forEach(el => {
      if (originals[getFieldKey(el)] !== el.classList.contains('on')) dirty = true;
    });
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      if (originals['ce:' + (el.dataset.field || el.className)] !== el.textContent) dirty = true;
    });
    return dirty;
  }

  // ── banner visibility ───────────────────────────────────
  let bannerVisible = false;

  function showBanner() {
    if (bannerVisible) return;
    bannerVisible = true;
    banner.classList.remove('hiding');
    void banner.offsetHeight;
    banner.classList.add('visible');
  }

  function hideBanner() {
    bannerVisible = false;
    banner.classList.remove('visible');
    banner.classList.add('hiding');
  }

  function checkDirty() {
    if (hasChanges()) showBanner();
    else              hideBanner();
  }

  // ── change listeners ────────────────────────────────────
  document.querySelectorAll(inputSel).forEach(el => {
    el.addEventListener('input', checkDirty);
    el.addEventListener('change', checkDirty);
  });

  document.querySelectorAll('[contenteditable="true"]').forEach(el => {
    el.addEventListener('input', checkDirty);
  });

  document.querySelectorAll('.switch-toggle').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('on');
      checkDirty();
    });
  });

  // ── reset ───────────────────────────────────────────────
  btnReset.addEventListener('click', () => {
    document.querySelectorAll(inputSel).forEach(el => {
      el.value = originals[getFieldKey(el)] ?? el.value;
    });
    document.querySelectorAll('.switch-toggle').forEach(el => {
      el.classList.toggle('on', !!originals[getFieldKey(el)]);
    });
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      const key = 'ce:' + (el.dataset.field || el.className);
      if (originals[key] != null) el.textContent = originals[key];
    });
    hideBanner();
  });

  // ── save (morph → saved pill → slide out) ───────────────
  btnSave.addEventListener('click', () => {
    snapshotValues();
    banner.classList.add('saved');

    setTimeout(() => {
      bannerVisible = false;
      banner.classList.remove('visible');
      banner.classList.add('hiding');
      setTimeout(() => banner.classList.remove('saved', 'hiding'), 400);
    }, 1200);
  });

  // ── navigation guard (shake) ────────────────────────────
  function shakeBanner(e) {
    if (!bannerVisible) return;
    e.preventDefault();
    banner.classList.remove('shake');
    void banner.offsetHeight;
    banner.classList.add('shake');
    banner.addEventListener('animationend', () => {
      banner.classList.remove('shake');
    }, { once: true });
  }

  document.querySelectorAll(NAV_SELECTOR).forEach(el => {
    el.addEventListener('click', shakeBanner);
  });

  // ── init ────────────────────────────────────────────────
  snapshotValues();
})();
