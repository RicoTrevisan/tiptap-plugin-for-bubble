# Tiptap plugin for Bubble

Bubble plugin. Two code piles:

- `src/` — decoded Bubble plugin source. Pled uploads this.
- `lib/` — bundled Tiptap runtime and lifecycle tests.

## Plugin (Pled)

`BUBBLE_COOKIE` is already in the shell. Keep it out of the repo.

```sh
pled status
pled pull      # first, if status says "No baseline"
pled push
pled watch     # auto-push src/ changes
```

If `pled status` reports a divergence, inspect both sides and choose the safe direction. Preserve intentional local changes.

In `initialize.js` / `update.js`, omit Bubble's outer `function(...)`; Pled adds it.

- `initialize.js` → `instance`, `context`
- `update.js` → `instance`, `properties`, `context`
- `secure` shared keys are server-only. Elements never see them.

## Tiptap bundle (`lib`)

From `lib/`:

```sh
npm ci
npm test       # builds lib/dist.js, then runs lifecycle tests
```

When runtime dependencies or `lib/index.js` change, upload the rebuilt bundle with `pled upload` and update `src/elements/tiptap-AAC/headers.html` to its new CDN URL before pushing the plugin.

## Demo app (Buildprint CLI)

App: `tiptap-plugin`. The plugin is already installed.

Run-mode login (not a real secret): **tippy** / **tappy**

Lifecycle lab: branch `plugin-lifecycle-lab` (`83ie9`). Use it as the source for lifecycle-focused demos; otherwise branch from `test`.

Issue 27 demo: branch `27-history-demo` (`73ixc`), page `issue-27-history-disabled`.

Create an isolated Bubble branch for an issue demo. Use a short name containing the issue number. Outside a Buildprint workspace, include the app ID:

```sh
buildprint branch create tiptap-plugin 27-history-demo --from plugin-lifecycle-lab
buildprint project clone tiptap-plugin --branch 27-history-demo --dir /home/rico/tiptap-plugin
cd /home/rico/tiptap-plugin/27-history-demo
# inspect and edit the page files
buildprint check
buildprint apply
```

Bubble assigns the branch id. Share run-mode links as:

`https://tippy:tappy@tiptap-plugin.bubbleapps.io/version-<id>/<page>`

Inspect available pages with `buildprint summary` and element structure with `buildprint tree <page>` before editing. Prefer adapting an existing focused demo or lifecycle lab over creating unrelated UI.

## Verify the demo

Use `buildprint screenshot` or available browser preview tools against the real run-mode URL. Exercise the real Bubble UI. Injected JavaScript clicks do not update Bubble click states.
