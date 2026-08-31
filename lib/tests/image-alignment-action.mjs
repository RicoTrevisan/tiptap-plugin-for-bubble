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
const alignText = new Function(
    "instance",
    "properties",
    "context",
    readFileSync(resolve(root, "src/elements/tiptap-AAC/actions/align-text-ACd.js"), "utf8"),
);

async function makeHarness(content, contentIsJson = false) {
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
            initialContent: content,
            content_is_json: contentIsJson,
            isEditable: true,
            collab_active: false,
            ext_image: true,
            ext_textalign: true,
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
    return { instance, states, debuggerMessages, rootElement };
}

function imageEntry(editor, src = "https://example.test/image-b.png") {
    let entry;
    editor.state.doc.descendants((node, pos) => {
        if (!entry && node.type.name === "image" && node.attrs.src === src) entry = { node, pos };
    });
    assert.ok(entry, `fixture must contain image ${src}`);
    return entry;
}

async function selectImage(harness, src = "https://example.test/image-b.png") {
    const entry = imageEntry(harness.instance.data.editor, src);
    harness.instance.data.editor.commands.setNodeSelection(entry.pos);
    await window.happyDOM.whenAsyncComplete();
    return imageEntry(harness.instance.data.editor, src);
}

async function alignSelected(harness, alignment) {
    alignText(harness.instance, { alignment }, {});
    await window.happyDOM.whenAsyncComplete();
}

const initialHTML = '<p>Before images</p><img src="https://example.test/image-a.png"><img src="https://example.test/image-b.png">';
const harness = await makeHarness(initialHTML);

for (const alignment of ["left", "center", "right"]) {
    await selectImage(harness);
    await alignSelected(harness, alignment);
    assert.equal(imageEntry(harness.instance.data.editor).node.attrs.textAlign, alignment);
    assert.equal(imageEntry(harness.instance.data.editor, "https://example.test/image-a.png").node.attrs.textAlign, null);
    assert.equal(harness.states.get(`align_${alignment}`), true);
}

// Justify stays text-only and does not disturb an already aligned image.
await selectImage(harness);
const imageAlignmentBeforeJustify = imageEntry(harness.instance.data.editor).node.attrs.textAlign;
await alignSelected(harness, "justify");
assert.equal(imageEntry(harness.instance.data.editor).node.attrs.textAlign, imageAlignmentBeforeJustify);

// Reset removes the new attribute so old image content remains backward-compatible.
await selectImage(harness);
await alignSelected(harness, "reset");
assert.equal(imageEntry(harness.instance.data.editor).node.attrs.textAlign, null);
assert.doesNotMatch(harness.instance.data.editor.getHTML(), /text-align:/);

// Alignment survives the same width transaction used by the resizable image extension.
await selectImage(harness);
await alignSelected(harness, "center");
harness.instance.data.editor.chain().updateAttributes("image", { width: "240px" }).run();
await window.happyDOM.whenAsyncComplete();
const resizedImage = imageEntry(harness.instance.data.editor).node;
assert.equal(resizedImage.attrs.textAlign, "center");
assert.equal(resizedImage.attrs.width, "240px");
const alignedHTML = harness.states.get("contentHTML");
assert.match(alignedHTML, /text-align:\s*center/);
assert.match(alignedHTML, /width:\s*240px/);
const alignedJSON = harness.states.get("contentJSON");
assert.equal(typeof alignedJSON, "string");

// Selecting text still aligns only its paragraph and leaves the image unchanged.
harness.instance.data.editor.commands.setTextSelection(1);
await alignSelected(harness, "right");
assert.equal(harness.instance.data.editor.getJSON().content[0].attrs.textAlign, "right");
assert.equal(imageEntry(harness.instance.data.editor).node.attrs.textAlign, "center");
await alignSelected(harness, "justify");
assert.equal(harness.instance.data.editor.getJSON().content[0].attrs.textAlign, "justify");
assert.equal(imageEntry(harness.instance.data.editor).node.attrs.textAlign, "center");
await alignSelected(harness, "reset");
assert.equal(harness.instance.data.editor.getJSON().content[0].attrs.textAlign, null);
assert.equal(imageEntry(harness.instance.data.editor).node.attrs.textAlign, "center");

// Both supported content formats restore the image alignment and published state.
for (const [content, isJson] of [
    [alignedHTML, false],
    [alignedJSON, true],
]) {
    const reloaded = await makeHarness(content, isJson);
    const image = await selectImage(reloaded);
    assert.equal(image.node.attrs.textAlign, "center");
    assert.equal(image.node.attrs.width, "240px");
    assert.equal(reloaded.states.get("align_center"), true);
    reloaded.instance.data.teardownEditor("test");
}

assert.deepEqual(harness.debuggerMessages, []);
harness.instance.data.teardownEditor("test");

console.log(
    JSON.stringify({
        selectedImageAligns: true,
        alignmentStatesPublish: true,
        textAlignmentUnchanged: true,
        htmlAndJsonRoundTrip: true,
        resizingPreservesAlignment: true,
        unalignedImagesRemainCompatible: true,
    }),
);
