# Plan: Implement Drag Handle Extension

## Overview
Add the Tiptap [Drag Handle](https://tiptap.dev/docs/editor/extensions/functionality/drag-handle) extension to the plugin, allowing users to drag and reorder blocks in the editor.

The extension renders a small handle (e.g. a grip icon) that appears when hovering over a block node. Users can click and drag it to move the block to a new position. It also supports nested content (list items, blockquotes, etc.) via a configurable scoring system.

---

## Step 1 — Install npm packages ✅ (done during research)

The packages are already installed during planning:

```bash
cd lib
npm install @tiptap/extension-drag-handle@3.20.0 @tiptap/extension-node-range@3.20.0 --save
```

- `@tiptap/extension-drag-handle` — the main extension
- `@tiptap/extension-node-range` — required peer dependency

**Note:** This also bumped `@tiptap/extension-collaboration` from 3.6.5 → 3.20.0 and `@tiptap/y-tiptap` from 3.0.0 → 3.0.2 as transitive dependencies. Verify no collab regressions.

---

## Step 2 — Update `lib/index.js`

Add the DragHandle import and expose it on `window.tiptap`:

```js
// Add to imports:
import DragHandle from "@tiptap/extension-drag-handle";

// Add to window.tiptap object, in the "Utilities" section:
DragHandle,
```

---

## Step 3 — Build & upload the bundle

```bash
cd lib
npm run build          # → bundles into dist.js
cd ..
pled upload lib/dist.js   # → returns a CDN URL
```

Update the header that references the library CDN URL to point to the new `dist.js`.

---

## Step 4 — Add plugin properties (Bubble editor fields)

Add the following fields to `src/elements/tiptap-AAC/fields.txt` under the **Editor Behavior** section (after `Invisible characters CSS override`):

```
----- Drag Handle ----- (ext_draghandle_label)
Drag Handle (ext_draghandle)                         # yes/no toggle
Nested drag (draghandle_nested)                      # yes/no — enable dragging inside lists, blockquotes, etc.
Drag handle CSS override (draghandle_adv)            # text — custom CSS for the handle element
```

These fields must also be created in the Bubble plugin editor (via `pled push` or manually) with:
- `ext_draghandle` — Checkbox (yes/no), default: **no**
- `draghandle_nested` — Checkbox (yes/no), default: **no** (only shown when ext_draghandle is yes)
- `draghandle_adv` — Text, optional (CSS override for the handle element)

---

## Step 5 — Update `src/elements/tiptap-AAC/initialize.js`

### 5a. Pull DragHandle from `window.tiptap`

In the `setupEditor` function, add `DragHandle` to the destructured imports from `window.tiptap` (around line 1310):

```js
DragHandle,
```

### 5b. Track extension state

Add to `instance.data.ext` object (around line 1340):

```js
draghandle: properties.ext_draghandle,
```

### 5c. Push the extension conditionally

Add after the invisible characters block (around line 1486), in the "Phase 2 extensions" section:

```js
if (properties.ext_draghandle) {
    const dragHandleConfig = {
        render() {
            const el = document.createElement("div");
            el.classList.add("tiptap-drag-handle");
            el.innerHTML = "⠿";  // grip icon (or use an SVG)
            return el;
        },
    };

    if (properties.draghandle_nested) {
        dragHandleConfig.nested = true;
    }

    extensions.push(DragHandle.configure(dragHandleConfig));
}
```

### 5d. Update the stylesheet

The CSS for `.tiptap-drag-handle` already exists in `applyStylesheet` (line ~272). Update it to include the user's CSS override:

```css
.tiptap-drag-handle {
    align-items: center;
    background: white;
    border-radius: .25rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    cursor: grab;
    display: flex;
    height: 1.5rem;
    justify-content: center;
    width: 1.5rem;
    ${properties.draghandle_adv || ""}
}
```

Note: Changed default `background` from `black` to `white` for better default UX.

---

## Step 6 — Push to Bubble

```bash
pled push
```

---

## Step 7 — Configure fields in Bubble plugin editor

After pushing, go to the Bubble plugin editor and:
1. Verify the new fields appear on the element
2. Set default values:
   - `ext_draghandle` → No (opt-in)
   - `draghandle_nested` → No
3. Add conditional visibility: only show `draghandle_nested` and `draghandle_adv` when `ext_draghandle` is Yes
4. Add helpful descriptions/tooltips

---

## Step 8 — Test

1. Enable the Drag Handle extension in the Bubble editor
2. Verify:
   - [ ] Handle appears on hover over blocks (paragraphs, headings, etc.)
   - [ ] Drag and drop repositions the block correctly
   - [ ] With `nested: true`, handle appears for list items and nested content
   - [ ] CSS override property works
   - [ ] Collaboration mode still works correctly (regression check)
   - [ ] Editor without drag handle enabled works as before
   - [ ] No console errors

---

## Files Changed

| File | Change |
|------|--------|
| `lib/package.json` | Added `@tiptap/extension-drag-handle`, `@tiptap/extension-node-range` |
| `lib/index.js` | Import + export `DragHandle` to `window.tiptap` |
| `lib/dist.js` | Rebuilt bundle |
| `src/elements/tiptap-AAC/fields.txt` | New fields: `ext_draghandle`, `draghandle_nested`, `draghandle_adv` |
| `src/elements/tiptap-AAC/initialize.js` | Pull extension, track state, push to extensions array, update CSS |

---

## Risks & Considerations

- **Bundle size increase**: The drag handle extension + node-range add ~260KB unpacked. After bundling + minification this should be modest.
- **Collaboration version bump**: `@tiptap/extension-collaboration` was bumped from 3.6.5 → 3.20.0. Test collaboration thoroughly.
- **No new element actions needed**: The drag handle is purely interactive (hover + drag). The only commands it exposes are `lockDragHandle`, `unlockDragHandle`, and `toggleDragHandle` — these could be added as element actions in a future iteration if users request programmatic control.
- **Handle icon**: Using the Unicode braille pattern `⠿` as a simple grip icon. Could be replaced with an SVG for a more polished look — can be customized via the CSS override.
