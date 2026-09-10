import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "acorn";

const sourceRoot = fileURLToPath(new URL("../../src/", import.meta.url));

function filesUnder(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? filesUnder(path) : [path];
    });
}

function walk(node, visit) {
    if (!node || typeof node !== "object") return;
    if (typeof node.type === "string") visit(node);
    for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach((child) => walk(child, visit));
        else if (value && typeof value === "object") walk(value, visit);
    }
}

export function validatePlugin(root = sourceRoot) {
    const errors = [];
    const warnings = [];
    const files = filesUnder(root);
    const json = new Map();
    const fail = (file, message) => errors.push(`${relative(root, file)}: ${message}`);
    for (const file of files.filter((file) => file.endsWith(".json"))) {
        try {
            const value = JSON.parse(readFileSync(file, "utf8"));
            if (!value || Array.isArray(value) || typeof value !== "object") {
                throw new Error("metadata must be a JSON object");
            }
            json.set(file, value);
            if (value.code?.package?.fn) JSON.parse(value.code.package.fn);
        } catch (error) {
            fail(file, error.message);
        }
    }
    if (!json.has(join(root, "plugin.json"))) fail(join(root, "plugin.json"), "missing or invalid plugin metadata");

    const elements = new Map();
    for (const [file, metadata] of json) {
        if (relative(root, file).split(/[\\/]/)[0] !== "elements") continue;
        const directory = dirname(file);
        if (elements.has(directory)) fail(file, "multiple element metadata files");
        const names = {};
        for (const kind of ["states", "events"]) {
            names[kind] = new Set();
            for (const [id, definition] of Object.entries(metadata[kind] ?? {})) {
                if (typeof definition.name !== "string" || !definition.name) fail(file, `${kind}.${id} needs a name`);
                else if (names[kind].has(definition.name)) fail(file, `duplicate ${kind} name: ${definition.name}`);
                names[kind].add(definition.name);
            }
        }
        elements.set(directory, { metadata, ...names });
        for (const required of ["initialize.js", "update.js", ...(metadata.has_reset_fn ? ["reset.js"] : [])]) {
            if (!files.includes(join(directory, required))) fail(file, `missing ${required}`);
        }
        const actionFiles = files.filter((path) => dirname(path) === join(directory, "actions") && path.endsWith(".js"));
        const declarations = Object.keys(metadata.actions ?? {});
        for (const id of declarations) {
            const matches = actionFiles.filter((path) => basename(path).endsWith(`-${id}.js`));
            if (matches.length !== 1) fail(file, `action ${id} requires exactly one implementation; found ${matches.length}`);
        }
        for (const actionFile of actionFiles) {
            if (!declarations.some((id) => basename(actionFile).endsWith(`-${id}.js`))) fail(actionFile, "action has no metadata declaration");
        }
    }
    for (const [file, metadata] of json) {
        if (relative(root, file).split(/[\\/]/)[0] === "actions" && metadata.type === "server_side") {
            if (!files.includes(join(dirname(file), "server.js"))) fail(file, "missing server.js");
        }
    }

    let scripts = 0;
    for (const file of files.filter((file) => file.endsWith(".js"))) {
        const parts = relative(root, file).split(/[\\/]/);
        const element = parts[0] === "elements" ? elements.get(join(root, parts[0], parts[1])) : undefined;
        let signature;
        if (element) {
            const lifecycle = {
                "initialize.js": "function(instance, context)",
                "update.js": "function(instance, properties, context)",
                "reset.js": "function(instance, context)",
                "preview.js": "function(instance, properties)",
            };
            signature = parts[2] === "actions" ? "function(instance, properties, context)" : lifecycle[basename(file)];
        } else if (parts[0] === "actions" && basename(file) === "server.js") {
            const metadata = [...json.entries()].find(([path]) => dirname(path) === dirname(file))?.[1];
            signature = metadata?.code?.server?.fn;
            if (!/^(async\s+)?function\s*\(\s*properties\s*,\s*context\s*\)\s*$/.test(signature ?? "")) signature = undefined;
        }
        if (!signature) {
            fail(file, "unrecognized Bubble function body or missing signature metadata");
            continue;
        }
        try {
            // Pled stores bodies without Bubble's outer function; parsing never executes them.
            const ast = parse(`(${signature} {\n${readFileSync(file, "utf8")}\n})`, { ecmaVersion: "latest", locations: true });
            scripts++;
            if (!element) continue;
            walk(ast, (node) => {
                if (node.type !== "CallExpression" || node.callee.type !== "MemberExpression") return;
                const member = node.callee;
                if (member.object.type !== "Identifier" || member.object.name !== "instance") return;
                const method = member.computed ? member.property.value : member.property.name;
                const kind = { publishState: "states", triggerEvent: "events" }[method];
                if (!kind) return;
                const argument = node.arguments[0];
                const name = argument?.type === "Literal" ? argument.value
                    : argument?.type === "TemplateLiteral" && argument.expressions.length === 0 ? argument.quasis[0].value.cooked : undefined;
                const location = `${relative(root, file)}:${node.loc.start.line - 1}`;
                if (typeof name !== "string") warnings.push(`${location}: computed ${method} name not statically checked`);
                else if (!element[kind].has(name)) errors.push(`${location}: undeclared ${kind} name ${JSON.stringify(name)}`);
            });
        } catch (error) {
            fail(file, `invalid function body: ${error.message}`);
        }
    }
    return { errors, warnings, scripts, metadataFiles: json.size };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const result = validatePlugin();
    result.warnings.forEach((warning) => console.warn(`NOTE ${warning}`));
    result.errors.forEach((error) => console.error(`ERROR ${error}`));
    if (result.errors.length) process.exitCode = 1;
    else console.log(`Plugin validation passed: ${result.metadataFiles} metadata files, ${result.scripts} function bodies.`);
}
