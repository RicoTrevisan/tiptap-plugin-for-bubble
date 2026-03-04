# Changelog

All notable changes to the Rich Text Editor (Tiptap.dev) Bubble plugin will be documented in this file.

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

### 🧹 Cleanup

- **Proper reset handling**: `reset.js` now cleans up collab retry timers and sync polling intervals instead of just logging
- **All element actions** updated with consistent editor-ready guards (`returnAndReportErrorIfEditorNotReady`)
- **Removed `.key` files** from source tracking (pled internals)
- **Console logging gated**: All `console.log` calls replaced with the `instance.data.debug()` helper, controlled by the Debug Mode field
