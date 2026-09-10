import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Window } from "happy-dom";

const libRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
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

const { Editor, Document, Paragraph, Text, Image, Resizable } = window.tiptap;
const settle = () => new Promise((resolve) => setTimeout(resolve, 300));

async function makeEditor() {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const editor = new Editor({
        element,
        extensions: [Document, Paragraph, Text, Image, Resizable],
        content: '<img src="https://example.test/image.png" style="width: 100px"><p>After</p>',
    });
    await window.happyDOM.whenAsyncComplete();
    editor.commands.setTextSelection(2);
    editor.commands.setNodeSelection(0);
    await settle();
    return editor;
}

function mouse(target, type, screenX) {
    target.dispatchEvent(new window.MouseEvent(type, { bubbles: true, screenX }));
}

function startDrag(editor) {
    const image = editor.storage.resizable.resizeElement;
    Object.defineProperty(image, "clientWidth", {
        configurable: true,
        get: () => parseInt(image.style.width) || 100,
    });
    mouse(editor.resizeLayer.querySelector(".bottom-right"), "mousedown", 100);
    return image;
}

// Track the actual document listeners, including ones whose callbacks merely bail out.
const listeners = new Map([["mousemove", new Set()], ["mouseup", new Set()]]);
const add = document.addEventListener.bind(document);
const remove = document.removeEventListener.bind(document);
document.addEventListener = (type, handler, options) => {
    listeners.get(type)?.add(handler);
    return add(type, handler, options);
};
document.removeEventListener = (type, handler, options) => {
    listeners.get(type)?.delete(handler);
    return remove(type, handler, options);
};
const editor = await makeEditor();
const baseline = [...listeners.values()].map((handlers) => handlers.size);
function assertNoDragListeners() {
    assert.deepEqual([...listeners.values()].map((handlers) => handlers.size), baseline);
}
let persistCalls = 0;
const chain = editor.chain.bind(editor);
editor.chain = () => { persistCalls++; return chain(); };
for (let i = 0; i < 5; i++) {
    startDrag(editor);
    mouse(document, "mousemove", 120);
    mouse(document, "mouseup", 120);
    assertNoDragListeners();
    assert.equal(persistCalls, i + 1, "each drag must persist exactly once");
    assert.equal(editor.state.doc.firstChild.attrs.width, `${100 + 20 * (i + 1)}px`);
    await settle();
}
mouse(document, "mouseup", 120);
assert.equal(persistCalls, 5, "completed drags must ignore later mouseup events");

// Starting again cancels the previous drag; teardown cancels the active one.
startDrag(editor);
const image = startDrag(editor);
mouse(document, "mousemove", 125);
assert.equal(image.style.width, "225px");
const layer = editor.resizeLayer;
const detachedHandle = layer.querySelector(".bottom-right");
const other = await makeEditor();
let oldReads = 0;
let otherReads = 0;
const oldRect = image.getBoundingClientRect.bind(image);
image.getBoundingClientRect = () => { oldReads++; return oldRect(); };
const otherImage = other.storage.resizable.resizeElement;
const otherRect = otherImage.getBoundingClientRect.bind(otherImage);
otherImage.getBoundingClientRect = () => { otherReads++; return otherRect(); };
editor.commands.setMeta("resize-test", 1);
editor.commands.setMeta("resize-test", 2);
other.commands.setMeta("resize-test", 1);
other.commands.setMeta("resize-test", 2);
assert.ok(oldReads > 0 && otherReads > 0, "each editor needs an independent leading throttle call");
const previousOldReads = oldReads;
const previousOtherReads = otherReads;
const storage = editor.storage.resizable;
const pendingThrottle = storage.transactionHandler;
editor.destroy();
assertNoDragListeners();
let destroyedCallbackChecks = 0;
Object.defineProperty(editor, "isDestroyed", {
    configurable: true,
    get: () => { destroyedCallbackChecks++; return true; },
});
pendingThrottle.flush();
assert.equal(destroyedCallbackChecks, 0, "teardown must cancel queued work, not just guard its callback");
mouse(document, "mousemove", 160);
mouse(document, "mouseup", 160);
mouse(detachedHandle, "mousedown", 100);
mouse(document, "mousemove", 200);
mouse(document, "mouseup", 200);
await settle();
assert.equal(oldReads, previousOldReads, "destroyed editor must not measure old DOM");
assert.equal(image.style.width, "225px", "destroyed drag must not mutate old DOM");
assert.equal(persistCalls, 5, "destroyed editor must not receive old mouseup callbacks");
assert.equal(layer.isConnected, false, "destroy removes the resize overlay");
assert.equal(storage.resizeElement, null);
assert.equal(storage.resizeNode, null);
assert.ok(otherReads > previousOtherReads, "destroying one editor preserves another's trailing work");
startDrag(other);
mouse(document, "mousemove", 130);
mouse(document, "mouseup", 130);
assert.equal(other.state.doc.firstChild.attrs.width, "130px");
other.destroy();
console.log("Resizable lifecycle: repeated drags, active teardown, and independent throttles pass");
