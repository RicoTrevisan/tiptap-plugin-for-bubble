# Tiptap Extensions — Audit & Expansion Plan

## Table of Contents
- [Part 1: Installed Extensions — Unexposed Options](#part-1-installed-extensions--unexposed-options)
- [Part 2: New Extensions to Add](#part-2-new-extensions-to-add)
- [Part 3: Implementation Priority](#part-3-implementation-priority)

---

## Part 1: Installed Extensions — Unexposed Options

For each installed extension, I compared the Tiptap default options against what's currently exposed in `plugin.json` fields and `initialize.js` configuration. Below are the **remaining gaps** — options that exist but are not yet exposed to the Bubble user.

> **Phase 1 (v4.2.0) — COMPLETED.** All quick-win option exposures and CSS override fields shipped. See CHANGELOG.md for details.

### 1. YouTube
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `controls` | `true` | ❌ | **Consider** — hide YouTube controls. Checkbox. |
| `autoplay` | `false` | ❌ | **Low priority** — most browsers block this anyway. |
| `loop` | `false` | ❌ | **Low priority** — niche use case. |

### 2. Table
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `resizable` | hardcoded `true` | ❌ | Could expose as checkbox (currently always on). |
| `handleWidth` | `5` | ❌ | **Low priority** — resize handle width in px. |
| `lastColumnResizable` | `true` | ❌ | **Low priority.** |
| `allowTableNodeSelection` | `false` | ❌ | **Consider** — allows selecting the entire table as a node. |

### 3. TextAlign
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `types` | hardcoded `["heading", "paragraph"]` | ❌ | **Consider** — let users add more types (e.g., `image`). |
| `defaultAlignment` | `null` | ❌ | **Consider** — set a default alignment. Dropdown. |
| `alignments` | `["left","center","right","justify"]` | ❌ | **Low priority** — restrict available alignments. |

### 4. CharacterCount
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `mode` | `"textSize"` | ❌ | **Consider** — `"nodeSize"` counts nodes instead of characters. |

### 5. Mention
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `suggestion.allowSpaces` | `false` | ❌ | **Consider** — allow spaces in mention queries. Checkbox. |

### 6. Link
| Option | Default | Currently Exposed | Recommendation |
|---|---|---|---|
| `protocols` | `[]` | ✅ v4.2.0 | Done — comma-separated with `optionalSlashes`. |

---

## Part 2: New Extensions to Add

### Phase 2 — Details/Accordion + Invisible Characters

#### 1. **Details / Accordion** (`@tiptap/extension-details`) ⭐⭐
- **What:** Collapsible `<details>/<summary>` blocks. Useful for FAQs, documentation.
- **Packages:** `@tiptap/extension-details` (v3.20.0), `@tiptap/extension-details-content` (v2.26.2), `@tiptap/extension-details-summary` (v2.26.2)
- **Sub-extensions:** Details, DetailsContent, DetailsSummary — all three must be registered.
- **Options:** `persist` (keep open state across editor recreations), `HTMLAttributes`.
- **Expose:**
  - Extension toggle: `ext_details` (Checkbox, default off)
  - Persist open state: `details_persist` (Checkbox, default false)
  - CSS override: `details_adv` (text field)
  - Action: "Toggle Details" — wraps selection in a `<details>` block or unwraps it
  - Exposed state: `details` (boolean) — whether cursor is inside a details block
- **Effort:** Medium — needs 3 npm packages, new field section, new action, CSS rules, state publishing.

#### 2. **Invisible Characters** (`@tiptap/extension-invisible-characters`) ⭐
- **What:** Shows paragraph marks (¶), spaces (·), and hard breaks visually. Useful for power users / content editors who need to see whitespace.
- **Package:** `@tiptap/extension-invisible-characters` (v3.20.0)
- **Options:** `visible` (boolean, start visible or not), `builders` (which characters to render).
- **Expose:**
  - Extension toggle: `ext_invisiblecharacters` (Checkbox, default off)
  - Start visible: `invisiblecharacters_visible` (Checkbox, default true)
  - CSS override: `invisiblecharacters_adv` (text field)
  - Action: "Toggle Invisible Characters" — toggles visibility on/off
  - Exposed state: `invisible_characters_visible` (boolean)
- **Effort:** Small-medium — single package, toggle action, CSS styling.

### Phase 3 — Advanced Features

#### 3. **Table of Contents** (`@tiptap/extension-table-of-contents`) ⭐⭐
- **What:** Automatically generates a table of contents from headings. Exposed as data, not as a rendered node.
- **Expose:** Extension toggle, state `table_of_contents` (JSON text of heading tree).
- **Effort:** Medium — mainly about extracting and publishing the heading data as a state.

#### 4. **Drag Handle** (`@tiptap/extension-drag-handle`) ⭐
- **What:** Shows a drag handle on hover for block-level nodes, enabling drag-and-drop reordering.
- **Expose:** Extension toggle, CSS styling for the handle.
- **Effort:** Medium — needs CSS customization fields, possibly tricky positioning in Bubble's DOM.

#### 5. **CodeBlock Lowlight** (syntax highlighting)
- **What:** Already imported in `lib/index.js` but not wired up. Adds syntax highlighting to code blocks via lowlight/highlight.js.
- **Effort:** Medium — needs a lowlight instance, language imports, and an option to choose between CodeBlock and CodeBlockLowlight.

### Not Recommended (for now)

| Extension | Reason |
|---|---|
| **Emoji** (`@tiptap/extension-emoji`) | Requires emoji data source & suggestion UI. Heavy. OS emoji pickers work fine. |
| **Mathematics** (`@tiptap/extension-mathematics`) | Very niche (LaTeX rendering). Adds KaTeX dependency (~300KB). |
| **Node Range** (`@tiptap/extension-node-range`) | Developer utility for multi-node selection. Not user-facing. |

---

## Part 3: Implementation Priority

### ✅ Phase 1 — Quick Wins (COMPLETED in v4.2.0)
Exposed options on existing extensions + CSS override fields. No new npm packages or actions needed.

1. ✅ CodeBlock: `enableTabIndentation` + `tabSize`
2. ✅ Link: `protocols`
3. ✅ YouTube: `width` + `height`
4. ✅ Mention: `suggestion.char`
5. ✅ Image: `inline`
6. ✅ Table: `cellMinWidth`
7. ✅ CSS overrides: horizontal rule, inline code, code block, subscript, superscript, task list

### 🔜 Phase 2 — New Extensions (next up)
1. **Details/Accordion** — collapsible `<details>/<summary>` blocks (FAQ/docs)
2. **Invisible Characters** — show paragraph marks, spaces, hard breaks

### Phase 3 — Advanced Features (future)
1. Table of Contents — data extraction for sidebar TOCs
2. Drag Handle — drag-to-reorder blocks
3. CodeBlock Lowlight — syntax highlighting

---

## Phase 2: Detailed Implementation Notes

### Details/Accordion

**npm packages to install:**
```bash
npm install @tiptap/extension-details @tiptap/extension-details-content @tiptap/extension-details-summary
```

**lib/index.js additions:**
```js
import Details from "@tiptap/extension-details";
import DetailsContent from "@tiptap/extension-details-content";
import DetailsSummary from "@tiptap/extension-details-summary";
// Add to window.tiptap: Details, DetailsContent, DetailsSummary
```

**Fields in AAC.json (new section between Preserve Attributes and Collaboration):**
- Section label: `----- Details / Accordion -----`
- `ext_details` — Checkbox (default: false). Documentation: "Adds collapsible `<details>/<summary>` blocks. Useful for FAQs, toggleable sections, and accordion-style content. Users can type a summary line and expand/collapse the body."
- `details_persist` — Checkbox (default: false). Documentation: "Keep `<details>` blocks open/closed state. When enabled, the open/closed state of each block is preserved."
- `details_adv` — DynamicValue/text. Documentation: "Inject custom CSS for `<details>` elements. Overrides the default styling."
- `details_summary_adv` — DynamicValue/text. Documentation: "Inject custom CSS for `<summary>` elements inside details blocks."

**initialize.js wiring:**
```js
if (properties.ext_details) {
    extensions.push(
        Details.configure({ persist: properties.details_persist || false }),
        DetailsContent,
        DetailsSummary,
    );
}
```

**CSS in applyStylesheet:**
```css
details {
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 0.5rem;
    margin: 0.5rem 0;
    ${properties.details_adv || ""}
}

details summary {
    cursor: pointer;
    font-weight: 600;
    padding: 0.25rem 0;
    ${properties.details_summary_adv || ""}
}

details[open] summary {
    margin-bottom: 0.5rem;
}
```

**New action: "Toggle Details"**
```js
// toggle-details-XXX.js
if (!instance.data.editor) { instance.data.returnAndReportErrorIfEditorNotReady("Toggle Details"); return; }
instance.data.editor.chain().focus().toggleDetails().run();
```

**Exposed state in publishActiveStates:**
```js
instance.publishState("details", editor.isActive("details"));
```

### Invisible Characters

**npm package to install:**
```bash
npm install @tiptap/extension-invisible-characters
```

**lib/index.js additions:**
```js
import InvisibleCharacters from "@tiptap/extension-invisible-characters";
// Add to window.tiptap: InvisibleCharacters
```

**Fields in AAC.json (in Editor Behavior section):**
- `ext_invisiblecharacters` — Checkbox (default: false). Documentation: "Shows invisible characters like paragraph marks (¶), spaces (·), and hard breaks. Useful for power users and content editors who need to see whitespace formatting."
- `invisiblecharacters_visible` — Checkbox (default: true). Documentation: "Whether invisible characters are visible when the extension loads. Can be toggled at runtime with the 'Toggle Invisible Characters' action."
- `invisiblecharacters_adv` — DynamicValue/text. Documentation: "Inject custom CSS for invisible character decorations."

**initialize.js wiring:**
```js
if (properties.ext_invisiblecharacters) {
    extensions.push(InvisibleCharacters.configure({
        visible: properties.invisiblecharacters_visible !== false,
    }));
}
```

**CSS in applyStylesheet:**
```css
.tiptap-invisible-character {
    ${properties.invisiblecharacters_adv || ""}
}
```

**New action: "Toggle Invisible Characters"**
```js
// toggle-invisible-characters-XXX.js
if (!instance.data.editor) { instance.data.returnAndReportErrorIfEditorNotReady("Toggle Invisible Characters"); return; }
instance.data.editor.commands.toggleInvisibleCharacters();
```

**Exposed state:**
- `invisible_characters_visible` (boolean) — updated when toggled
