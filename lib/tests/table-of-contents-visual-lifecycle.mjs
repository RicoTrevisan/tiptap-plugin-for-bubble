import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Window } from "happy-dom";

const libRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(libRoot, "..");
const sourceRoot = resolve(root, "src/elements/tiptap-table-of-contents-toc_element");
const window = new Window({ url: "https://example.test" });
Object.assign(globalThis, { window, document: window.document });

const update = new Function("instance", "properties", "context", readFileSync(resolve(sourceRoot, "update.js"), "utf8"));
const reset = new Function("instance", "context", readFileSync(resolve(sourceRoot, "reset.js"), "utf8"));

function makeHarness() {
    const canvas = document.createElement("div");
    document.body.appendChild(canvas);
    const states = new Map();
    const instance = {
        data: {},
        canvas: { 0: canvas, get: () => canvas },
        publishState: (name, value) => states.set(name, value),
        triggerEvent() {},
    };
    const properties = {
        contents_json: JSON.stringify([
            { id: "alpha", textContent: "Alpha", level: 3, isActive: true, isScrolledOver: false },
            { id: "details", textContent: "Details", level: 5, isActive: false, isScrolledOver: false },
        ]),
        accessible_label: "On this page",
        auto_scroll: true,
        scroll_behavior: "smooth",
        scroll_block: "start",
    };
    return { canvas, instance, properties, states };
}

const directUpdate = makeHarness();
assert.doesNotThrow(() => update(directUpdate.instance, directUpdate.properties, {}));
assert.deepEqual([...directUpdate.canvas.querySelectorAll("a")].map((anchor) => anchor.textContent), ["Alpha", "Details"]);

reset(directUpdate.instance, {});
directUpdate.properties.contents_json = JSON.stringify([
    { id: "beta", textContent: "Beta", level: 1, isActive: true, isScrolledOver: false },
]);
assert.doesNotThrow(() => update(directUpdate.instance, directUpdate.properties, {}));
assert.deepEqual([...directUpdate.canvas.querySelectorAll("a")].map((anchor) => anchor.textContent), ["Beta"]);

console.log(JSON.stringify({ updateWithoutInitialize: true, updateAfterReset: true }));
