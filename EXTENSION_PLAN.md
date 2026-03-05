# Tiptap Extensions — Audit & Expansion Plan

## Table of Contents
- [Part 1: Installed Extensions — Unexposed Options](#part-1-installed-extensions--unexposed-options)
- [Part 2: New Extensions to Add](#part-2-new-extensions-to-add)
- [Part 3: Implementation Priority](#part-3-implementation-priority)

---

## Part 1: Installed Extensions — Unexposed Options

For each installed extension, I compared the Tiptap default options against what's currently exposed in `plugin.json` fields and `initialize.js` configuration. Below are the **gaps** — options that exist but are not yet exposed to the Bubble user.

> **Note:** Items already implemented have been removed. See git history for the original audit.

### 1. Link
**Current config:** Fully configured with `openOnClick`, `autolink`, `linkOnPaste`, `defaultProtocol`, `HTMLAttributes.target`, `HTMLAttributes.rel`.
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `protocols` | `[]` | ❌ | **Consider** — allows custom protocols (e.g., `tel:`, `mailto:`). Could be a comma-separated text field. |

### 2. Image
**Current config:** `Image.configure({ inline: false, allowBase64: properties.allowBase64 })`
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `inline` | `false` | ❌ (hardcoded) | **Expose** — inline images flow with text. Checkbox. |

### 3. YouTube
**Current config:** `Youtube.configure({ nocookie, allowFullscreen, addPasteHandler })` — these three are exposed.
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `width` | `640` | ❌ (commented out in action) | **Expose** — default embed width. Number field. |
| `height` | `480` | ❌ (commented out in action) | **Expose** — default embed height. Number field. |
| `controls` | `true` | ❌ | **Consider** — hide YouTube controls. Checkbox. |
| `autoplay` | `false` | ❌ | **Consider** — most browsers block this anyway. Low priority. |
| `loop` | `false` | ❌ | **Consider** — niche use case. Low priority. |

### 4. Table
**Current config:** `Table.configure({ resizable: true })`
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `resizable` | hardcoded `true` | ❌ | Could expose as checkbox (currently always on). |
| `handleWidth` | `5` | ❌ | **Low priority** — resize handle width in px. |
| `cellMinWidth` | `25` | ❌ | **Consider** — minimum column width in px. Number field. |
| `lastColumnResizable` | `true` | ❌ | **Low priority.** |
| `allowTableNodeSelection` | `false` | ❌ | **Consider** — allows selecting the entire table as a node. |

### 5. TextAlign
**Current config:** `TextAlign.configure({ types: ["heading", "paragraph"] })`
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `types` | hardcoded `["heading", "paragraph"]` | ❌ | **Consider** — let users add more types (e.g., `image`). Comma-separated text. |
| `defaultAlignment` | `null` | ❌ | **Consider** — set a default alignment. Dropdown. |
| `alignments` | `["left","center","right","justify"]` | ❌ | **Low priority** — restrict available alignments. |

### 6. CodeBlock
**Current config:** `CodeBlock.configure({ exitOnTripleEnter, exitOnArrowDown, defaultLanguage })` — these three are exposed.
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `enableTabIndentation` | `false` | ❌ | **Expose** — Tab key indents inside code blocks instead of moving focus. Checkbox. Very useful. |
| `tabSize` | `4` | ❌ | **Expose** (if `enableTabIndentation` is on) — number of spaces per tab. Number field. |
| `languageClassPrefix` | `"language-"` | ❌ | **Low priority** — CSS class prefix. |

### 7. CharacterCount
**Current config:** `CharacterCount.configure({ limit: properties.characterLimit || null })`
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `mode` | `"textSize"` | ❌ | **Consider** — `"nodeSize"` counts nodes instead of characters. Dropdown: `textSize,nodeSize`. |

### 8. Mention
**Current config:** Custom render, suggestion.
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `suggestion.char` | `"@"` | ❌ | **Expose** — the trigger character. Text field. Users might want `#` or other triggers. |
| `suggestion.allowSpaces` | `false` | ❌ | **Consider** — allow spaces in mention queries. Checkbox. |

### 9. HorizontalRule
**Current config:** no `.configure()`
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| _No high-value options to expose._ | | | CSS override field would be the main ask (add `hr_adv` CSS override). |

### 10. TrailingNode (from @tiptap/extensions)
**Current config:** Included in bundle but not explicitly configured.
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `node` | `"paragraph"` | ❌ | **Low priority.** |

---

## Part 2: New Extensions to Add

### Tier 2 — Medium Value, Medium Effort

#### 1. **Details / Accordion** (`@tiptap/extension-details`) ⭐⭐
- **What:** Collapsible `<details>/<summary>` blocks. Useful for FAQs, documentation.
- **Options:** `persist` (keep open state), `openClassName`.
- **Expose:** Extension toggle, actions "Insert details block" / "Toggle details open", maybe a state `details` (boolean).
- **Effort:** Medium — needs 3 sub-extensions (Details, DetailsContent, DetailsSummary), new actions, CSS styling field.

#### 2. **Invisible Characters** (`@tiptap/extension-invisible-characters`) ⭐
- **What:** Shows paragraph marks (¶), spaces (·), and hard breaks visually. Useful for power users / content editors.
- **Options:** `visible` (toggle on/off), `builders` (which characters to show).
- **Expose:** Extension toggle (default off), action "Toggle invisible characters", state `invisible_characters_visible` (boolean).
- **Effort:** Small-medium — needs the toggle action and some CSS.

### Tier 3 — High Value, High Effort

#### 3. **Table of Contents** (`@tiptap/extension-table-of-contents`) ⭐⭐
- **What:** Automatically generates a table of contents from headings. Exposed as data, not as a rendered node.
- **Options:** `anchorTypes: ["heading"]`.
- **Expose:** Extension toggle, state `table_of_contents` (JSON text of heading tree). Users could use this to build a sidebar TOC in Bubble.
- **Effort:** Medium — mainly about extracting and publishing the heading data as a state.

#### 4. **Drag Handle** (`@tiptap/extension-drag-handle`) ⭐
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

1. **CodeBlock: `enableTabIndentation`** + `tabSize` — important for code editing
2. **Link: `protocols`** — allows `tel:`, `mailto:`, etc.
3. **YouTube: `width`** + `height` — complete the YouTube configuration
4. **Mention: `suggestion.char`** — allow `#` tags etc.
5. **Image: `inline`** — inline images flow with text
6. **Table: `cellMinWidth`** — common table request

### Phase 2 — Medium Effort Enhancements
1. **Details/Accordion** — popular for FAQ/docs use cases
2. **Invisible Characters** — power-user feature

### Phase 3 — Advanced Features
1. **Table of Contents** — data extraction for sidebar TOCs
2. **Drag Handle** — drag-to-reorder blocks
3. **CodeBlock Lowlight** — syntax highlighting (already imported, just needs activation path)

---

## Summary of New Fields Needed

### Phase 1 (existing extensions, new fields only)

| Extension | New Field | Type | Default |
|---|---|---|---|
| CodeBlock | Tab indentation | Checkbox | `false` |
| CodeBlock | Tab size | Number | `4` |
| Link | Protocols | Text (comma-separated) | _(empty)_ |
| YouTube | Default width | Number | `640` |
| YouTube | Default height | Number | `480` |
| Mention | Trigger character | Text | `@` |
| Image | Inline | Checkbox | `false` |
| Table | Cell min width | Number | `25` |

---

## CSS Override Fields to Add (Stylesheet)

| Element | Field Name | Current State |
|---|---|---|
| `hr` (horizontal rule) | `hr_adv` | ❌ Missing |
| `code` (inline code) | `code_adv` | ❌ Missing |
| `pre` / `code` block | `codeblock_adv` | ❌ Missing |
| `sub` (subscript) | `sub_adv` | ❌ Missing |
| `sup` (superscript) | `sup_adv` | ❌ Missing |
| `details` | `details_adv` | ❌ Missing (if added) |
| Task list checkbox | `tasklist_checkbox_adv` | ❌ Missing |
