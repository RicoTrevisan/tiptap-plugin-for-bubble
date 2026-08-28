import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Window } from "happy-dom";

const libRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(libRoot, "..");
const window = new Window({ url: "https://example.test" });

Object.assign(globalThis, {
    window,
    document: window.document,
    Node: window.Node,
    HTMLElement: window.HTMLElement,
    ShadowRoot: window.ShadowRoot,
    MutationObserver: window.MutationObserver,
    DOMParser: window.DOMParser,
    getComputedStyle: window.getComputedStyle.bind(window),
    requestAnimationFrame: (callback) => setTimeout(() => callback(Date.now()), 0),
    cancelAnimationFrame: (handle) => clearTimeout(handle),
});
Object.defineProperty(globalThis, "navigator", { value: window.navigator, configurable: true });

await import(pathToFileURL(resolve(libRoot, "dist.js")));

const metadata = JSON.parse(readFileSync(resolve(root, "src/elements/tiptap-AAC/AAC.json"), "utf8"));
const defaults = Object.fromEntries(Object.values(metadata.fields).map((field) => [field.name, field.default_val]));
const initialize = new Function(
    "instance",
    "context",
    readFileSync(resolve(root, "src/elements/tiptap-AAC/initialize.js"), "utf8"),
);

async function makeHarness(propertyOverrides = {}) {
    const rootElement = document.createElement("div");
    document.body.appendChild(rootElement);
    const states = new Map();
    const debuggerMessages = [];
    const instance = {
        data: {},
        canvas: {
            css() {},
            append(element) {
                rootElement.appendChild(element);
            },
            parent() {
                return { length: 0 };
            },
            height() {},
        },
        publishState(name, value) {
            states.set(name, value);
        },
        triggerEvent() {},
        publishAutobinding() {},
        canUploadFile() {
            return true;
        },
        uploadFile() {},
    };
    const context = {
        reportDebugger(message) {
            debuggerMessages.push(String(message));
        },
    };
    initialize(instance, context);

    const properties = new Proxy(
        {
            ...defaults,
            initialContent: "<p>Hello</p>",
            content_is_json: false,
            isEditable: true,
            collab_active: false,
            ...propertyOverrides,
            bubble: {
                auto_binding: () => false,
                fit_height: () => false,
                font_size: () => 16,
                font_color: () => "#111111",
                font_face: () => "Arial:400",
            },
        },
        {
            get(target, key) {
                return key in target ? target[key] : undefined;
            },
        },
    );

    instance.data.setupEditor(properties, context);
    await window.happyDOM.whenAsyncComplete();
    return { instance, states, debuggerMessages, properties, context };
}

// ── History disabled: lifecycle callbacks must not throw ─────
const disabled = await makeHarness({ ext_history: false });
assert.equal(disabled.states.get("is_ready"), true);
assert.equal(disabled.states.get("can_undo"), false);
assert.equal(disabled.states.get("can_redo"), false);
assert.deepEqual(disabled.debuggerMessages, []);

// Edits and transactions must keep working and keep publishing false.
disabled.instance.data.editor.commands.insertContent("<p>edit without history</p>");
await window.happyDOM.whenAsyncComplete();
assert.match(disabled.states.get("contentHTML"), /edit without history/);
assert.equal(disabled.states.get("can_undo"), false);
assert.equal(disabled.states.get("can_redo"), false);
assert.deepEqual(disabled.debuggerMessages, []);
disabled.instance.data.teardownEditor("test");

// ── History enabled: real undo/redo availability is published ─
const enabled = await makeHarness({ ext_history: true });
assert.equal(enabled.states.get("is_ready"), true);
assert.equal(enabled.states.get("can_undo"), false);
assert.equal(enabled.states.get("can_redo"), false);

enabled.instance.data.editor.commands.insertContent("<p>edit with history</p>");
await window.happyDOM.whenAsyncComplete();
assert.equal(enabled.states.get("can_undo"), true);
assert.equal(enabled.states.get("can_redo"), false);

enabled.instance.data.editor.commands.undo();
await window.happyDOM.whenAsyncComplete();
assert.equal(enabled.states.get("can_undo"), false);
assert.equal(enabled.states.get("can_redo"), true);
enabled.instance.data.teardownEditor("test");

console.log(
    JSON.stringify({
        historyDisabledReady: true,
        historyDisabledPublishesFalse: true,
        historyDisabledEditsDoNotThrow: true,
        historyEnabledPublishesRealState: true,
    }),
);
