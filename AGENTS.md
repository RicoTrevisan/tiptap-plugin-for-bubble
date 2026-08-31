# Tiptap plugin for Bubble

Use the **bubble-plugin-development** skill for the shared workflow (Pled, code piles, lib releases, Buildprint branching, verifying against the real Bubble UI).

Plugin-specific facts:

- Two code piles: `src/` — decoded Bubble plugin source (Pled uploads this); `lib/` — bundled Tiptap runtime and lifecycle tests.
- From `lib/`: `npm ci && npm test` — builds `lib/dist.js`, then runs lifecycle tests.
- When runtime dependencies or `lib/index.js` change, release the rebuilt bundle: unique versioned filename, `pled upload`, update `src/elements/tiptap-AAC/headers.html` to the new CDN URL, then `pled push`.
- Dev app: `tiptap-plugin`. Changes in the plugin auto-reload page code.
- Run-mode login (not a real secret): **tippy** / **tappy**
- Existing demo page: `tiptap-demo` — `https://tippy:tappy@tiptap-plugin.bubbleapps.io/version-test/tiptap-demo`
- The demo page uses the plugin version published in the Bubble marketplace. It shows off the plugin in simple user-facing language, assuming a medior Bubble developer.
