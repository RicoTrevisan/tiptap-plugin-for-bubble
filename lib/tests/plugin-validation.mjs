import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { validatePlugin } from "../scripts/validate-plugin.mjs";

function fixture(t, overrides = {}) {
    const root = mkdtempSync(join(tmpdir(), "bubble-validation-"));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const files = {
        "plugin.json": "{}",
        "elements/editor-ABC/ABC.json": JSON.stringify({
            actions: { do_thing: { caption: "Do thing" } },
            states: { state_id: { name: "content" } },
            events: { event_id: { name: "changed" } },
        }),
        "elements/editor-ABC/initialize.js": 'instance.publishState("content", "");',
        "elements/editor-ABC/update.js": 'instance.triggerEvent("changed");',
        "elements/editor-ABC/actions/do-thing-do_thing.js": "return;",
        "actions/example-DEF/example.json": JSON.stringify({
            type: "server_side", code: { server: { fn: "async function(properties, context)" } },
        }),
        "actions/example-DEF/server.js": "return await Promise.resolve(properties);",
        ...overrides,
    };
    for (const [path, source] of Object.entries(files)) {
        if (source === null) continue;
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), source);
    }
    return validatePlugin(root);
}

test("accepts Bubble bodies, async server actions, and IDs containing underscores", (t) => {
    const result = fixture(t);
    assert.deepEqual(result.errors, []);
    assert.equal(result.scripts, 4);
});

for (const [name, overrides, expected] of [
    ["malformed JSON", { "plugin.json": "{" }, /plugin.json:/],
    ["invalid syntax", { "elements/editor-ABC/update.js": "const = ;" }, /invalid function body/],
    ["missing action", { "elements/editor-ABC/actions/do-thing-do_thing.js": null }, /requires exactly one implementation/],
    ["orphan action", { "elements/editor-ABC/actions/unknown-XYZ.js": "return;" }, /no metadata declaration/],
    ["undeclared state", { "elements/editor-ABC/update.js": 'instance.publishState("typo", 1);' }, /undeclared states name "typo"/],
    ["undeclared event", { "elements/editor-ABC/update.js": 'instance["triggerEvent"](`typo`);' }, /undeclared events name "typo"/],
    ["missing server body", { "actions/example-DEF/server.js": null }, /missing server.js/],
    ["missing element metadata", { "elements/editor-ABC/ABC.json": null }, /missing signature metadata/],
    ["duplicate state name", { "elements/editor-ABC/ABC.json": JSON.stringify({ states: { a: { name: "content" }, b: { name: "content" } } }) }, /duplicate states name/],
]) {
    test(`rejects ${name}`, (t) => {
        assert.match(fixture(t, overrides).errors.join("\n"), expected);
    });
}

test("ignores comments and strings, reports computed names, and never executes source", (t) => {
    const result = fixture(t, {
        "elements/editor-ABC/update.js": `
            // instance.publishState("not_declared", 0);
            const example = 'instance.triggerEvent("not_declared")';
            instance.publishState(properties.stateName, 1);
            throw new Error("must not execute");
        `,
    });
    assert.deepEqual(result.errors, []);
    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0], /computed publishState/);
});
