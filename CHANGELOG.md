# Changelog

All notable changes to the Rich Text Editor (Tiptap.dev) Bubble plugin will be documented in this file.

---

## Unreleased

### ✨ New Extensions

- **Trailing Node** (on by default) — Automatically inserts an empty paragraph at the end of the document when the last node is a block element (table, image, code block, etc.). Prevents users from getting trapped with no way to continue typing below block-level content.
- **Focus** (off by default) — Adds a `has-focus` CSS class to the node where the cursor is currently positioned. Enables styling the active block — e.g., a subtle background or left border on the focused paragraph. Configurable mode: `deepest` (default, innermost node only), `shallowest` (outermost node only), or `all` (all ancestor nodes).
- **Selection** (off by default) — Keeps the text selection visually highlighted when the editor loses focus. Useful when users click toolbar buttons outside the editor — the selection remains visible instead of disappearing. A default blue highlight style (`.selection { background: #accef7 }`) is provided automatically. Includes a **Selection CSS override** field to customize the highlight styling.

---

## v4.0.0

### ⚡ Tiptap v3 Upgrade

The entire plugin has been upgraded from Tiptap v2 to **Tiptap v3** (`@tiptap/core ^3.0.9` and all extensions). This is a major upgrade that brings performance improvements, new APIs, and better extensibility.

- **Tiptap v3 core and all extensions** updated to `^3.0.9`
- **Hocuspocus provider** updated from `^3.2.2` to `^3.4.4`
- **BubbleMenu / FloatingMenu** now use Floating UI (Tiptap v3) instead of tippy.js — menus are now explicitly hidden before being passed to the extension to prevent flash-of-unstyled-content
- **History → UndoRedo**: Replaced the `History` extension with Tiptap v3's `UndoRedo` extension (History is automatically disabled when collaboration is active)
- **TableKit → Individual table extensions**: Replaced the bundled `TableKit` with individual `Table`, `TableRow`, `TableHeader`, and `TableCell` extensions for finer control
- **CollaborationCursor → CollaborationCaret**: Updated to Tiptap v3's renamed collaboration cursor extension

### 🏗️ Architecture Refactor

Major refactoring of the plugin's internal architecture for better maintainability, reliability, and performance.

#### Library management overhaul
- **Consolidated `window.tiptap` namespace**: All libraries are now exported as a single organized `window.tiptap` object instead of scattered `window.tiptapXyz` globals. The object is structured by category (Core, Basic nodes, Formatting, Block elements, Lists, Advanced, Styling, Interaction, Utilities, Collaboration, Third-party)
- **New extensions exported**: `UndoRedo`, `TrailingNode`, `Focus`, `Selection` now available from `@tiptap/extensions`

#### Code reorganization
- **Editor setup moved to `initialize.js`**: The ~760-line editor creation logic that previously lived in `update.js` has been moved to `initialize.js` as `instance.data.setupEditor()`. `update.js` is now a lean ~110-line file that handles property changes only
- **Stylesheet logic extracted**: CSS generation is now a reusable `instance.data.applyStylesheet(properties)` function callable from both `update.js` and the collab retry path, eliminating duplication

#### Script loading
- **Moved from `shared.html` to `headers.html`**: All scripts (dist.js, lodash, tippy.js styles) moved from the plugin-level `shared.html` to the element-level `headers.html` with `defer` attributes for better loading performance
- **`shared.html` cleared**: No longer loads any scripts at the plugin level

### 🤝 Collaboration Improvements

Substantial improvements to the real-time collaboration system across all three providers (Tiptap Cloud, Custom Hocuspocus, Liveblocks).

- **Auth failure retry with exponential backoff**: When collaboration authentication fails (e.g., JWT not yet valid on the server), the plugin now automatically retries up to 5 times with exponential backoff delays (1s, 2s, 4s, 8s, 16s). The editor and provider are torn down and re-created on each retry
- **Initial content for empty collab documents**: New `maybeSetCollabInitialContent()` helper handles the race condition between provider sync and editor creation — initial content is set on whichever fires last
- **Collab sync polling fallback**: Added an interval-based polling fallback for detecting sync completion, since `onSynced` may not fire reliably in all providers
- **Graceful JWT waiting**: When collaboration is enabled but the JWT token isn't ready yet, the editor now waits gracefully instead of erroring. A one-time debug warning is shown

#### New collaboration exposed states
- **`collab_status`** (text) — current connection status (e.g., "connected", "disconnected")
- **`collab_synced`** (boolean) — whether the document has synced with the server
- **`collab_connected_users`** (number) — count of connected collaboration users
- **`collab_status_changed`** (event) — fires when the collaboration status changes
- **`collab_synced`** (event) — fires when the document syncs

### 🔐 Auth Token Action Rewrite

The server-side JWT action has been completely rewritten and renamed.

- **Renamed**: "Generate JWT Key" → **"Generate Auth Token"**
- **New fields**:
  - `Document names (comma-separated)` — replaces the old `Doc ID` + `Doc ID (list)` fields. Now accepts a comma-separated string of allowed document names
  - `App ID` — included as the `aud` (audience) claim in the token for security
  - `User ID (sub)` — included as the `sub` (subject) claim for traceability and auditing
  - `Expiration (seconds)` — configurable token lifetime (default: 86400 / 1 day). Previous version had no expiration
- **Plugin secret keys renamed**: "Tiptap Cloud JWT secret" → "Tiptap Cloud document server secret", "Custom collab JWT secret" → "Custom collab document server secret"
- **Improved error handling**: Secret keys are now trimmed before use; error messages are more descriptive

### ✨ New Features

- **New action: Unset All Marks** — removes all formatting marks (bold, italic, etc.) from the current selection
- **New exposed state: `is_empty`** (boolean) — reflects whether the editor content is empty, updated on every transaction
- **New exposed state: `can_undo`** (boolean) — whether an undo operation is available
- **New exposed state: `can_redo`** (boolean) — whether a redo operation is available
- **New field: Debug Mode** — toggleable debug logging. When enabled, logs detailed `[Tiptap]` messages to the console. When disabled, no console output is produced (replaces scattered `console.log` calls)

### 🐛 Bug Fixes

- **Cursor position preservation**: When content is updated programmatically (via autobinding or initialContent change), the cursor position is now saved and restored (clamped to document bounds) instead of jumping to the start
- **Menu elements not found on time**: Fixed a race condition where bubble menu and floating menu elements weren't detected during initialization
- **`getSelection` fixed**: The `selectedHTML` state now uses `generateHTML` from the `window.tiptap` namespace with the editor's actual extensions, producing correct HTML output
- **CSS loading condition**: Fixed a condition where editor styles weren't applied correctly
- **Debounce timeout cleared on programmatic updates**: Prevents stale debounced writes from overwriting programmatic content changes

### 🔧 Extensions Refactor

The old error-prone comma-separated list of extension names has been replaced with individual yes/no toggles for each extension. Each toggle is organized into its own labeled section, making extensions easy to discover, toggle on/off, and control dynamically with Bubble expressions.

- **29 individual yes/no toggles** replace the old text field where you had to type exact extension names
- **Organized into sections** — Text Formatting, Highlight, Heading (with H1–H6 styling), Blockquote, Structure, Lists, Image, YouTube, Link, Table, Menus, Editor Behavior, Hard Break, Mention, Unique ID, Preserve Attributes
- **Extensions with settings** have their related options grouped directly below the toggle (e.g., Table toggle + cell padding, border colors; Link toggle + link colors/CSS; Heading toggle + heading levels + H1–H6 styling)
- **Every toggle has documentation** explaining what the extension does, how to use it, and relevant keyboard/markdown shortcuts

### 🎨 CSS Override Fields Cleanup

All advanced CSS override fields have been renamed, documented, and converted from large textareas to compact single-line inputs.

| Before | After |
|--------|-------|
| `h1_adv` – `h6_adv` | **H1 CSS override** – **H6 CSS override** |
| `p_adv` | **Paragraph CSS override** |
| `Image properties` | **Image CSS override** |
| `YouTube` (duplicate name) | **YouTube CSS override** |
| `Blockquote styling` | **Blockquote CSS override** |
| `Highlight CSS` | **Highlight CSS override** |
| `Bullet lists CSS` / `Number list CSS` | **Bullet list CSS override** / **Ordered list CSS override** |
| `link_adv`, `link_unvisited_adv`, etc. | **Link CSS override**, **Unvisited link CSS override**, etc. |
| `CSS for base div // override` | **Base div CSS override** |

All CSS override fields now use compact inputs (use `arbitrary text` for more room), and have documentation explaining that they inject raw CSS that overrides the preceding settings (size, color, weight, etc.).

### 📝 Preserve Attributes Fields Renamed

| Before | After |
|--------|-------|
| `preserve_attributes` | **Preserve HTML attributes** |
| `preserved_attributes` | **Preserved attributes (read-only)** |
| `preserve_unknown_ta...` (truncated) | **Preserve unknown HTML tags** |

All three fields now have documentation explaining what they do and how they relate to each other.

### 🗂️ Property Panel Reorganization

The entire property panel has been reorganized into a clean hierarchy: General config → Stylesheet → Extensions (with toggles + related settings) → Collaboration → Debug mode.

### 🧹 Cleanup

- **Proper reset handling**: `reset.js` now cleans up collab retry timers and sync polling intervals instead of just logging
- **All element actions** updated with consistent editor-ready guards (`returnAndReportErrorIfEditorNotReady`)
- **Console logging gated**: All `console.log` calls replaced with the `instance.data.debug()` helper, controlled by the Debug Mode field
