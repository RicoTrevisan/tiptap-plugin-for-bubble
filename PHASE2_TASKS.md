# Phase 2 — Task List

## A. Details / Accordion Extension

### npm & lib
- [x] 1. Install packages: `@tiptap/extension-details@3.20.0` (bundles DetailsContent & DetailsSummary)
- [x] 2. Add imports to `lib/index.js`: `Details`, `DetailsContent`, `DetailsSummary`
- [x] 3. Expose on `window.tiptap`: `Details`, `DetailsContent`, `DetailsSummary`

### Fields in AAC.json
- [x] 4. Section label: `----- Details / Accordion -----` (between Preserve Attributes and Collaboration)
- [x] 5. `ext_details` — Checkbox (default: false) + documentation
- [x] 6. `details_persist` — Checkbox (default: false) + documentation
- [x] 7. `details_adv` — DynamicValue/text — CSS override for `<details>` elements
- [x] 8. `details_summary_adv` — DynamicValue/text — CSS override for `<summary>` elements

### Wire in initialize.js
- [x] 9. Destructure `Details`, `DetailsContent`, `DetailsSummary` from `window.tiptap`
- [x] 10. Add extension toggle block: push `Details.configure({ persist })`, `DetailsContent`, `DetailsSummary`
- [x] 11. Store `ext.details` in `instance.data.ext`

### CSS in initialize.js (applyStylesheet)
- [x] 12. Add `[data-type="details"]` rule (border, border-radius, padding, margin + `details_adv` override)
- [x] 13. Add `[data-type="details"] > button` and summary rules (cursor, font-weight + `details_summary_adv` override)
- [x] 14. Add `[data-type="details"].is-open` rules (toggle arrow, margin-bottom spacing)

### Exposed state
- [x] 15. Add `details` boolean to `publishActiveStates()`: `editor.isActive("details")`

### Action: Toggle Details
- [x] 16. Create action in Bubble (via AAC.json): "Toggle Details"
- [x] 17. Write action JS: `toggle-details-toggle_details.js` — uses `setDetails()` / `unsetDetails()` based on current state

---

## B. Invisible Characters Extension

### npm & lib
- [x] 18. Install package: `@tiptap/extension-invisible-characters@3.20.0`
- [x] 19. Add import to `lib/index.js`: `InvisibleCharacters`
- [x] 20. Expose on `window.tiptap`: `InvisibleCharacters`

### Fields in AAC.json
- [x] 21. `ext_invisiblecharacters` — Checkbox (default: false) in Editor Behavior section + documentation
- [x] 22. `invisiblecharacters_visible` — Checkbox (default: true) — start visible on load + documentation
- [x] 23. `invisiblecharacters_adv` — DynamicValue/text — CSS override for invisible character decorations

### Wire in initialize.js
- [x] 24. Destructure `InvisibleCharacters` from `window.tiptap`
- [x] 25. Add extension toggle block: push `InvisibleCharacters.configure({ visible })`

### CSS in initialize.js (applyStylesheet)
- [x] 26. Add `.tiptap-invisible-character` rule with `invisiblecharacters_adv` override

### Action: Toggle Invisible Characters
- [x] 27. Create action in Bubble: "Toggle Invisible Characters"
- [x] 28. Write action JS: `toggle-invisible-characters-toggle_invisible_characters.js` — `editor.commands.toggleInvisibleCharacters()`

### Exposed state
- [x] 29. Add `invisible_characters_visible` boolean state — publish on toggle and initial load

---

## C. Build, Push & Test

- [x] 30. Run `npm run build` to bundle updated `lib/index.js` → `dist.js`
- [x] 31. Run `pled upload dist.js` and update the URL in `headers.html` (new URL: `f1772704780782x124130157781027200`)
- [x] 32. Update `fields.txt` with new fields
- [x] 33. `pled push`
- [ ] 34. Test on demo page: https://tiptap-demo.bubbleapps.io/version-test/doc/demo
  - [ ] 34a. Details: toggle on, insert a details block, type summary + content, collapse/expand
  - [ ] 34b. Details: test persist option (open state preserved on re-render)
  - [ ] 34c. Details: CSS override fields apply correctly
  - [ ] 34d. Invisible Characters: toggle on, verify ¶ / · / hard break markers appear
  - [ ] 34e. Invisible Characters: toggle action shows/hides markers
  - [ ] 34f. Invisible Characters: CSS override field applies correctly
  - [ ] 34g. Verify no regressions on existing extensions

## D. Changelog
- [ ] 35. Add v4.3.0 entry to CHANGELOG.md

## E. Commit
- [ ] 36. Git commit: `v4.3.0 — Phase 2: Details/Accordion + Invisible Characters`

---

## Notes
- `@tiptap/extension-details@3.20.0` bundles all three sub-extensions (Details, DetailsContent, DetailsSummary) — no need for separate packages
- Details extension uses `[data-type="details"]` NodeView (not native `<details>` tag) with `.is-open` class toggle
- Fixed pre-existing duplicate `stylesheet_info` field names during push (renamed to unique names)
