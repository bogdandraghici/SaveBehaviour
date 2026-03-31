# Save Widget

A floating banner that alerts users to unsaved changes and provides save/reset actions, with animated transitions.

## Visual States

### 1. Unsaved Changes (Default)

- **Background:** `#2A313A`
- **Border radius:** `16px`
- **Padding:** `12px 16px`
- **Width:** `563px`
- **Shadow:** `2px 2px 24px 0px rgba(22, 52, 98, 0.08)`
- **Position:** Fixed, centered horizontally, `40px` from the bottom of the viewport

**Content layout:** Row, space-between, vertically centered, `32px` gap.

| Element | Style |
|---------|-------|
| Text: "Careful , you have unsaved changes!" | Open Sans 600 14px, `#FFFFFF` |
| Reset button | Open Sans 600 14px, `#3389E0` text, transparent bg, `1px solid #5B6A7E` border, `8px` radius, `6px 12px` padding |
| Save Changes button | Open Sans 600 14px, `#FFFFFF` text, `#3389E0` bg, no border, `8px` radius, `6px 12px` padding |

### 2. Saved Confirmation

- **Background:** `#008060` (Colors/Green/green-500)
- **Border radius:** `8px`
- **Padding:** `8px 12px`
- **Width:** Auto (hug content)
- **Shadow:** `0px 10px 24px 0px rgba(15, 17, 20, 0.1)`

**Content layout:** Row, vertically centered, `8px` gap.

| Element | Style |
|---------|-------|
| Checkmark circle icon | `24x24px`, white circle with green check (see `assets/check-circle.svg`) |
| Text: "Saved" | Open Sans 600 14px, `#FFFFFF` |

## Behaviour

### Appearance

- The widget starts **hidden below the viewport**.
- It **slides up** with a spring ease (`cubic-bezier(0.34, 1.56, 0.64, 1)`, 400ms) when any tracked form element changes from its saved value.
- Tracked elements: text inputs, selects, toggle switches.

### Dirty Detection

- On page load, a snapshot of all form values is stored.
- On every `input`/`change` event (or toggle click), the current values are compared to the snapshot.
- If any value differs, the widget appears. If all values match the snapshot, it hides.

### Reset

1. All form fields revert to their snapshot values.
2. The widget **slides down** out of view (`cubic-bezier(0.55, 0, 1, 0.45)`, 350ms).

### Save Changes

1. The current values are stored as the new snapshot.
2. The widget **morphs** into the green "Saved" pill:
   - Background transitions from `#2A313A` to `#008060`.
   - Width shrinks from `563px` to hug content.
   - Border radius changes from `16px` to `8px`.
   - Padding changes from `12px 16px` to `8px 12px`.
   - Unsaved content is replaced by the checkmark + "Saved" text.
   - Morph duration: `400ms` ease.
3. The pill **holds** for `1200ms` so the user can read the confirmation.
4. The pill **slides down** out of view (350ms).
5. The widget resets internally to its unsaved state, ready for the next change.

### Navigation Guard

- Clicking any navigation element (tabs, back button, breadcrumbs, menu buttons, links) while the widget is visible triggers a **shake animation** (500ms horizontal oscillation) to draw attention back to the required action.
- The shake does not block the click permanently; it is a visual nudge.

## Assets

| File | Description |
|------|-------------|
| `assets/check-circle.svg` | White checkmark inside a circle, used in the "Saved" state |

## Adding the Save Widget to a New Page

### 1. Include shared files in `<head>`

```html
<link rel="stylesheet" href="shared/save-widget.css">
<link rel="stylesheet" href="shared/page-nav.css">
```

### 2. Add the banner HTML before `</body>`

```html
<div class="save-banner">
  <div class="save-banner-unsaved">
    <span class="save-banner-text">Careful , you have unsaved changes!</span>
    <div class="save-banner-actions">
      <button class="btn-reset">Reset</button>
      <button class="btn-save">Save Changes</button>
    </div>
  </div>
  <div class="save-banner-saved">
    <img src="assets/check-circle.svg" alt="Saved" class="saved-icon">
    <span class="saved-text">Saved</span>
  </div>
</div>
```

### 3. Include scripts before `</body>`

```html
<script>
  window.PAGE_NAV_PAGES = [
    { id: 'email-connections', label: 'Email Connections', href: 'index.html' },
    // add more pages here as they are created
  ];
  window.PAGE_NAV_CURRENT = 'this-page-id';
</script>
<script src="shared/save-widget.js"></script>
<script src="shared/page-nav.js"></script>
```

### 4. Mark form elements

The save widget auto-discovers these selectors:
- `.field-input` — text inputs
- `.field-select` — select dropdowns
- `.field-input-with-suffix input` — inputs inside a suffix wrapper
- `.switch-toggle` — toggle switches (must toggle `.on` class on click)
- `[contenteditable="true"]` — contenteditable elements (e.g. code editors)

#### Field identity and `data-field`

The save widget snapshots every tracked element's value on page load and compares on each change. For reset to work correctly, each element needs a **stable, unique key**.

The key is resolved in this order:
1. `data-field="unique-key"` attribute (preferred)
2. Text content of the nearest `.field-label` or `.switch-label` ancestor
3. `name` attribute
4. `placeholder` attribute
5. Random fallback (reset will not work)

**Always add `data-field` when elements lack a unique label**, especially:
- **Table cells** — inputs inside `<td>` have no label ancestor. Use a row+column convention: `data-field="r1-name"`, `data-field="r1-type"`, etc.
- **Repeated patterns** — filter rows, projection rows, sort rows. Use section+index: `data-field="f1-field"`, `data-field="f1-op"`, `data-field="f1-value"`, etc.
- **Contenteditable elements** — keyed by `ce:` + `data-field` or `className`.

Without stable keys, the snapshot cannot match elements on reset, and changed values will not revert.

#### Contenteditable support

Elements with `contenteditable="true"` are tracked by their `textContent`. On reset, `textContent` is restored to the snapshot. On save, the current content becomes the new baseline.

### 5. Mark navigation elements

Elements matching these selectors trigger the shake guard:
`.tab`, `.back-btn`, `.breadcrumb-dim`, `.breadcrumb-bold`, `.attachments-link`, `.dots-btn`, `[data-nav]`

Add `data-nav` to any extra navigation elements specific to your page.

## Floating Page Navigation

A hamburger menu in the top-right corner lets users jump between prototype pages. It is injected by `shared/page-nav.js` based on the `PAGE_NAV_PAGES` array. When adding a new page, update the array in every existing page's `<script>` block.

**Files:** `shared/page-nav.css`, `shared/page-nav.js`

## Shared Files

| File | Purpose |
|------|---------|
| `shared/save-widget.css` | Save banner styles and animations |
| `shared/save-widget.js` | Dirty detection, reset, save morph, shake guard |
| `shared/page-nav.css` | Floating page navigation styles |
| `shared/page-nav.js` | Floating page navigation logic |
| `assets/check-circle.svg` | Checkmark icon for the "Saved" state |

## Technical Notes

- The widget uses `position: fixed` with `z-index: 100` and is centered with `left: 50%; transform: translateX(-50%)`.
- All transitions use CSS (`transition` property on `.save-banner`). State changes are driven by toggling CSS classes: `visible`, `hiding`, `saved`, `shake`.
- The JavaScript is self-contained: it snapshots values on load, listens for changes, and manages banner state. No external dependencies.
- Font: Open Sans (400, 600, 700) loaded from Google Fonts.
- The page nav uses `z-index: 200` to sit above the save banner.
