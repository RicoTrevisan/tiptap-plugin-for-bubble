# Phase 1 — Task List

## Fields in AAC.json
- [x] 1. CodeBlock: `codeblock_tabIndentation` (Checkbox, default false)
- [x] 2. CodeBlock: `codeblock_tabSize` (StaticNumber, default 4)
- [x] 3. Link: `link_protocols` (DynamicValue/text, empty)
- [x] 4. YouTube: `youtube_defaultWidth` (StaticNumber, default 640)
- [x] 5. YouTube: `youtube_defaultHeight` (StaticNumber, default 480)
- [x] 6. Mention: `mention_triggerChar` (DynamicValue/text, default @)
- [x] 7. Image: `image_inline` (Checkbox, default false)
- [x] 8. Table: `table_cellMinWidth` (StaticNumber, default 25)

## CSS Override Fields in AAC.json
- [x] 9. `hr_adv` — Horizontal rule CSS override
- [x] 10. `code_adv` — Inline code CSS override
- [x] 11. `codeblock_adv` — Code block CSS override
- [x] 12. `sub_adv` — Subscript CSS override
- [x] 13. `sup_adv` — Superscript CSS override
- [x] 14. `tasklist_checkbox_adv` — Task list CSS override

## Wire in initialize.js
- [x] 15. CodeBlock: wire `enableTabIndentation` + `tabSize`
- [x] 16. Link: wire `protocols` (parse comma-separated)
- [x] 17. YouTube: wire `width` + `height`
- [x] 18. Mention: wire `suggestion.char` (trigger character)
- [x] 19. Image: wire `inline`
- [x] 20. Table: wire `cellMinWidth`

## CSS in initialize.js (applyStylesheet)
- [x] 21. Add `hr` rule
- [x] 22. Add `code` rule (inline code — `:not(pre) > code` to avoid code-inside-pre)
- [x] 23. Add `pre` rule (code block)
- [x] 24. Add `sub` rule
- [x] 25. Add `sup` rule
- [x] 26. Add task list checkbox rule
- [x] 27. Check CSS: verified all rules inside `.ProseMirror` scope, no conflicts, inline code selector refined

## Changelog
- [x] 28. Add v4.2.0 entry to CHANGELOG.md

## Push & Test
- [x] 29. `pled push`
