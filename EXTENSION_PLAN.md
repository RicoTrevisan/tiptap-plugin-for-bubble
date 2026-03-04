# Tiptap Extensions — Audit & Expansion Plan

## Table of Contents
- [Part 1: Installed Extensions — Unexposed Options](#part-1-installed-extensions--unexposed-options)
- [Part 2: New Extensions to Add](#part-2-new-extensions-to-add)
- [Part 3: Implementation Priority](#part-3-implementation-priority)

---

## Part 1: Installed Extensions — Unexposed Options

For each installed extension, I compared the Tiptap default options against what's currently exposed in `plugin.json` fields and `initialize.js` configuration. Below are the **gaps** — options that exist but are not yet exposed to the Bubble user.

### 1. Link ⭐ HIGH VALUE
**Current config:** No `.configure()` — uses all defaults.
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `openOnClick` | `true` | ❌ | **Expose** — very commonly requested. Users want to control whether clicking a link navigates or just selects it. Checkbox. |
| `autolink` | `true` | ❌ | **Expose** — auto-converts typed URLs to links. Some users want this off. Checkbox. |
| `linkOnPaste` | `true` | ❌ | **Expose** — auto-converts pasted URLs. Checkbox. |
| `protocols` | `[]` | ❌ | **Consider** — allows custom protocols (e.g., `tel:`, `mailto:`). Could be a comma-separated text field. |
| `defaultProtocol` | `"http"` | ❌ | **Expose** — useful to default to `https`. Dropdown: `http,https`. |
| `HTMLAttributes.target` | `"_blank"` | ❌ | **Expose** — common request: open in same tab vs new tab. Dropdown: `_blank,_self,_parent,_top`. |
| `HTMLAttributes.rel` | `"noopener noreferrer nofollow"` | ❌ | **Consider** — advanced users may want to remove `nofollow` for SEO. Text field. |

### 2. Highlight
**Current config:** `Highlight` (no configure)
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `multicolor` | `false` | ❌ | **Expose** — enables multiple highlight colors. Currently the Highlight action accepts a color but `multicolor` is off, so only one color works at a time. Checkbox. |

### 3. Image
**Current config:** `Image.configure({ inline: false, allowBase64: properties.allowBase64 })`
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `inline` | `false` | ❌ (hardcoded) | **Expose** — inline images flow with text. Checkbox. |

### 4. YouTube
**Current config:** `Youtube.configure({ nocookie: true })`
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `width` | `640` | ❌ (commented out in action) | **Expose** — default embed width. Number field. |
| `height` | `480` | ❌ (commented out in action) | **Expose** — default embed height. Number field. |
| `allowFullscreen` | `true` | ❌ | **Expose** — checkbox. |
| `controls` | `true` | ❌ | **Consider** — hide YouTube controls. Checkbox. |
| `nocookie` | hardcoded `true` | ❌ | **Expose** — privacy-focused cookie-less embedding is hardcoded on. Let users choose. Checkbox. |
| `autoplay` | `false` | ❌ | **Consider** — most browsers block this anyway. Low priority. |
| `loop` | `false` | ❌ | **Consider** — niche use case. Low priority. |
| `addPasteHandler` | `true` | ❌ | **Consider** — auto-converts pasted YT URLs to embeds. Checkbox. |

### 5. Table
**Current config:** `Table.configure({ resizable: true })`
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `resizable` | hardcoded `true` | ❌ | Could expose as checkbox (currently always on). |
| `handleWidth` | `5` | ❌ | **Low priority** — resize handle width in px. |
| `cellMinWidth` | `25` | ❌ | **Consider** — minimum column width in px. Number field. |
| `lastColumnResizable` | `true` | ❌ | **Low priority.** |
| `allowTableNodeSelection` | `false` | ❌ | **Consider** — allows selecting the entire table as a node. |

### 6. Placeholder
**Current config:** `Placeholder.configure({ placeholder: placeholder })`
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `showOnlyWhenEditable` | `true` | ❌ | **Expose** — when false, shows placeholder even in read-only mode. Checkbox. |
| `showOnlyCurrent` | `true` | ❌ | **Consider** — shows placeholder on all empty nodes, not just the first one. Checkbox. |
| `includeChildren` | `false` | ❌ | **Consider** — shows placeholder inside nested nodes (e.g., inside list items). |

### 7. TextAlign
**Current config:** `TextAlign.configure({ types: ["heading", "paragraph"] })`
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `types` | hardcoded `["heading", "paragraph"]` | ❌ | **Consider** — let users add more types (e.g., `image`). Comma-separated text. |
| `defaultAlignment` | `null` | ❌ | **Consider** — set a default alignment. Dropdown. |
| `alignments` | `["left","center","right","justify"]` | ❌ | **Low priority** — restrict available alignments. |

### 8. Dropcursor
**Current config:** `Dropcursor` (no configure)
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `color` | `"currentColor"` | ❌ | **Expose** — color of the drop indicator. Color picker. |
| `width` | `1` | ❌ | **Expose** — width of the drop indicator in px. Number field. |

### 9. CodeBlock
**Current config:** `CodeBlock` (no configure)
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `exitOnTripleEnter` | `true` | ❌ | **Consider** — pressing Enter 3× exits the code block. |
| `exitOnArrowDown` | `true` | ❌ | **Low priority.** |
| `defaultLanguage` | `null` | ❌ | **Consider** — set a default syntax language. Text field. |
| `enableTabIndentation` | `false` | ❌ | **Expose** — Tab key indents inside code blocks instead of moving focus. Checkbox. Very useful. |
| `tabSize` | `4` | ❌ | **Expose** (if `enableTabIndentation` is on) — number of spaces per tab. Number field. |
| `languageClassPrefix` | `"language-"` | ❌ | **Low priority** — CSS class prefix. |

### 10. BulletList & OrderedList
**Current config:** no `.configure()`
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `keepMarks` | `false` | ❌ | **Expose** — preserves text formatting (bold, etc.) when creating a new list item. Checkbox. |
| `keepAttributes` | `false` | ❌ | **Expose** — preserves attributes (like text alignment) on new list items. Checkbox. |

### 11. CharacterCount
**Current config:** `CharacterCount.configure({ limit: properties.characterLimit || null })`
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `mode` | `"textSize"` | ❌ | **Consider** — `"nodeSize"` counts nodes instead of characters. Dropdown: `textSize,nodeSize`. |

### 12. Mention
**Current config:** Custom render, suggestion.
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `suggestion.char` | `"@"` | ❌ | **Expose** — the trigger character. Text field. Users might want `#` or other triggers. |
| `suggestion.allowSpaces` | `false` | ❌ | **Consider** — allow spaces in mention queries. Checkbox. |

### 13. HorizontalRule
**Current config:** no `.configure()`
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| _No high-value options to expose._ | | | CSS override field would be the main ask (add `hr_adv` CSS override). |

### 14. Focus (from @tiptap/extensions)
**Current config:** Not explicitly used/configured.
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `className` | `"has-focus"` | ❌ | **Consider** — let users customize the focus CSS class. |
| `mode` | `"all"` | ❌ | **Consider** — `"all"`, `"shallowest"`, `"deepest"`. |

### 15. TrailingNode (from @tiptap/extensions)
**Current config:** Included in bundle but not explicitly configured.
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `node` | `"paragraph"` | ❌ | **Low priority.** |

---

## Part 2: New Extensions to Add

### Tier 1 — High Value, Low Effort (simple marks/nodes)

#### 1. **Subscript** (`@tiptap/extension-subscript`) ⭐⭐⭐
- **What:** Renders `<sub>` tags. Essential for scientific/academic content (H₂O, CO₂).
- **Options:** Only `HTMLAttributes` (nothing to expose).
- **Expose:** Extension toggle (checkbox), new action "Toggle Subscript", new state `subscript` (boolean).
- **Effort:** Very small — identical pattern to Bold/Italic/Underline.

#### 2. **Superscript** (`@tiptap/extension-superscript`) ⭐⭐⭐
- **What:** Renders `<sup>` tags. Essential for footnotes, math (x², E=mc²).
- **Options:** Only `HTMLAttributes` (nothing to expose).
- **Expose:** Extension toggle (checkbox), new action "Toggle Superscript", new state `superscript` (boolean).
- **Effort:** Very small — identical pattern to Bold/Italic/Underline.

#### 3. **Font Size** (`@tiptap/extension-font-size`) ⭐⭐⭐
- **What:** Sets font size on text selections (via `TextStyle`). Frequently requested.
- **Options:** `types: ["textStyle"]` — nothing to expose.
- **Expose:** Extension toggle (checkbox, default off like FontFamily), new action "Set font size" (text param e.g. `"16px"`, `"1.2rem"`), new action "Unset font size", new state `font_size` (text).
- **Effort:** Small — same pattern as FontFamily/Color.

#### 4. **Typography** (`@tiptap/extension-typography`) ⭐⭐
- **What:** Auto-replaces common text patterns: `--` → `—`, `...` → `…`, `(c)` → `©`, `!=` → `≠`, smart quotes, etc.
- **Options:** 20+ individual replacements, all can be disabled by setting to `false`.
- **Expose:** Extension toggle (checkbox, default off). No need to expose individual rules initially — CSS override style isn't applicable.
- **Effort:** Tiny — just add the toggle, no actions or states needed.

### Tier 2 — Medium Value, Medium Effort

#### 5. **List Keymap** (`@tiptap/extension-list-keymap`) ⭐⭐
- **What:** Improves list keyboard behavior — Backspace at the start of a list item lifts it out properly. Fixes a common UX pain point with lists.
- **Options:** `listTypes` array (sensible defaults covering bulletList, orderedList, taskList).
- **Expose:** Extension toggle (checkbox, default on). No additional options needed.
- **Effort:** Tiny — behavioral improvement, no actions or states.

#### 6. **Details / Accordion** (`@tiptap/extension-details`) ⭐⭐
- **What:** Collapsible `<details>/<summary>` blocks. Useful for FAQs, documentation.
- **Options:** `persist` (keep open state), `openClassName`.
- **Expose:** Extension toggle, actions "Insert details block" / "Toggle details open", maybe a state `details` (boolean).
- **Effort:** Medium — needs 3 sub-extensions (Details, DetailsContent, DetailsSummary), new actions, CSS styling field.

#### 7. **Invisible Characters** (`@tiptap/extension-invisible-characters`) ⭐
- **What:** Shows paragraph marks (¶), spaces (·), and hard breaks visually. Useful for power users / content editors.
- **Options:** `visible` (toggle on/off), `builders` (which characters to show).
- **Expose:** Extension toggle (default off), action "Toggle invisible characters", state `invisible_characters_visible` (boolean).
- **Effort:** Small-medium — needs the toggle action and some CSS.

### Tier 3 — High Value, High Effort

#### 8. **Table of Contents** (`@tiptap/extension-table-of-contents`) ⭐⭐
- **What:** Automatically generates a table of contents from headings. Exposed as data, not as a rendered node.
- **Options:** `anchorTypes: ["heading"]`.
- **Expose:** Extension toggle, state `table_of_contents` (JSON text of heading tree). Users could use this to build a sidebar TOC in Bubble.
- **Effort:** Medium — mainly about extracting and publishing the heading data as a state.

#### 9. **Drag Handle** (`@tiptap/extension-drag-handle`) ⭐
- **What:** Shows a drag handle on hover for block-level nodes, enabling drag-and-drop reordering.
- **Options:** `locked`, `nested`.
- **Expose:** Extension toggle, CSS styling for the handle.
- **Effort:** Medium — needs CSS customization fields, possibly tricky positioning in Bubble's DOM.

### Not Recommended (for now)

| Extension | Reason |
|---|---|
| **Emoji** (`@tiptap/extension-emoji`) | Requires emoji data source & suggestion UI. Heavy. OS emoji pickers work fine. |
| **Mathematics** (`@tiptap/extension-mathematics`) | Very niche (LaTeX rendering). Adds KaTeX dependency (~300KB). |
| **Node Range** (`@tiptap/extension-node-range`) | Developer utility for multi-node selection. Not user-facing. |
| **CodeBlockLowlight** | Already imported but not used (regular CodeBlock is used). Could be a future enhancement for syntax highlighting. |

---

## Part 3: Implementation Priority

### Phase 1 — Quick Wins (expose options on existing extensions)
These require **no new npm packages** and **no new actions** — just new fields in `plugin.json` and wiring in `initialize.js`.

1. **Link: `openOnClick`** — #1 most requested feature gap
2. **Link: `autolink`** — commonly needed toggle
3. **Link: `linkOnPaste`** — commonly needed toggle
4. **Link: `defaultProtocol`** — `https` should probably be the default
5. **Link: `HTMLAttributes.target`** — open in same/new tab
6. **Highlight: `multicolor`** — currently broken if users try multiple colors
7. **CodeBlock: `enableTabIndentation`** + `tabSize` — important for code editing
8. **BulletList/OrderedList: `keepMarks`** — quality-of-life improvement
9. **Placeholder: `showOnlyWhenEditable`** — useful for read-only preview mode

### Phase 2 — New Simple Extensions
These need **npm install + lib/index.js + build**, new fields, actions, and states.

1. **Subscript** — tiny effort, high demand for academic/science content
2. **Superscript** — tiny effort, same as above
3. **Font Size** — small effort, very frequently requested
4. **Typography** — tiny effort, nice-to-have polish
5. **List Keymap** — tiny effort, fixes UX annoyance

### Phase 3 — Medium Effort Enhancements
1. **Details/Accordion** — popular for FAQ/docs use cases
2. **More Link options** (protocols, rel)
3. **Table: `cellMinWidth`** — common table request
4. **Dropcursor color/width** — visual polish
5. **YouTube: width/height/allowFullscreen** — complete the YouTube configuration
6. **Mention: trigger character** — allow `#` tags etc.
7. **Invisible Characters** — power-user feature

### Phase 4 — Advanced Features
1. **Table of Contents** — data extraction for sidebar TOCs
2. **Drag Handle** — drag-to-reorder blocks
3. **CodeBlock Lowlight** — syntax highlighting (already imported, just needs activation path)

---

## Summary of New Fields Needed

### Phase 1 (existing extensions, new fields only)

| Extension | New Field | Type | Default |
|---|---|---|---|
| Link | Open on click | Checkbox | `true` |
| Link | Autolink | Checkbox | `true` |
| Link | Link on paste | Checkbox | `true` |
| Link | Default protocol | Dropdown: `http,https` | `https` |
| Link | Open link in | Dropdown: `_blank,_self` | `_blank` |
| Highlight | Multicolor | Checkbox | `true` |
| CodeBlock | Tab indentation | Checkbox | `false` |
| CodeBlock | Tab size | Number | `4` |
| BulletList | Keep marks | Checkbox | `false` |
| OrderedList | Keep marks | Checkbox | `false` |
| Placeholder | Show only when editable | Checkbox | `true` |

### Phase 2 (new extensions)

| Extension | New Field | New Actions | New States |
|---|---|---|---|
| Subscript | Toggle (checkbox) | Toggle Subscript | `subscript` (bool) |
| Superscript | Toggle (checkbox) | Toggle Superscript | `superscript` (bool) |
| Font Size | Toggle (checkbox) | Set font size, Unset font size | `font_size` (text) |
| Typography | Toggle (checkbox) | — | — |
| List Keymap | Toggle (checkbox) | — | — |

---

## CSS Override Fields to Add (Stylesheet)

| Element | Field Name | Current State |
|---|---|---|
| `hr` (horizontal rule) | `hr_adv` | ❌ Missing |
| `code` (inline code) | `code_adv` | ❌ Missing |
| `pre` / `code` block | `codeblock_adv` | ❌ Missing |
| `sub` (subscript) | `sub_adv` | ❌ Missing (if added) |
| `sup` (superscript) | `sup_adv` | ❌ Missing (if added) |
| `details` | `details_adv` | ❌ Missing (if added) |
| Task list checkbox | `tasklist_checkbox_adv` | ❌ Missing |
