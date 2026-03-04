// Update debug mode flag so the debug helper picks it up
instance.data._debug_mode = properties.debug_mode;

// Store latest properties/context for collab auth retry mechanism
instance.data._lastProperties = properties;
instance.data._lastContext = context;

if (properties.collab_active === true && !properties.collab_jwt) {
    instance.data.debug("collab is active but auth token is not yet loaded. Returning...");
    if (!instance.data._jwtEmptyWarningShown) {
        instance.data._jwtEmptyWarningShown = true;
        context.reportDebugger(
            "Collaboration is enabled but the JWT token is empty. The editor will initialize once the token is provided.",
        );
    }
    return;
}

if (properties.collab_active === true && !properties.collab_doc_id) {
    instance.data.debug("collab is active but document name (collab_doc_id) is not yet loaded. Returning...");
    context.reportDebugger(
        "Collaboration is enabled but the Document name field is empty. Please provide a unique document name (e.g. a slug or unique ID) for collaboration to work.",
    );
    return;
}

// First run: set up the editor (defined in initialize.js)
// Also re-runs after a collab auth failure retry (isEditorSetup is reset to false)
if (!instance.data.isEditorSetup) {
    // If a retry is pending (timer hasn't fired yet), wait for it
    if (instance.data._collabRetryPending) {
        instance.data.debug("collab retry pending — waiting for backoff timer before re-setup");
        return;
    }
    instance.data.setupEditor(properties, context);
}

/*
    PROPERTY CHANGE HANDLERS
    (run on every update after the editor is ready)
*/

if (!!instance.data.editor_is_ready && properties.isEditable != instance.data.editor.isEditable) {
    instance.data.debug("editable state changing to:", properties.isEditable);
    let isEditable = properties.isEditable;
    instance.data.editor.setEditable(isEditable);
}

if (
    instance.data.editor_is_ready &&
    properties.initialContent !== "" &&
    instance.data.initialContent !== properties.initialContent &&
    !properties.bubble.auto_binding()
) {
    instance.data.debug("initialContent has changed");

    if (!properties.collab_active) {
        instance.data.initialContent = properties.initialContent;
        let content = properties.content_is_json ? JSON.parse(instance.data.initialContent) : instance.data.initialContent;

        // Clear any pending debounce timeout before programmatic update
        clearTimeout(instance.data.debounceTimeout);

        // Save cursor position before setContent
        const { from, to } = instance.data.editor.state.selection;

        instance.data.editor.commands.setContent(content, true);

        // Restore cursor position (clamped to document bounds)
        const docSize = instance.data.editor.state.doc.content.size;
        const newFrom = Math.min(from, Math.max(1, docSize - 1));
        const newTo = Math.min(to, Math.max(1, docSize - 1));
        instance.data.editor.commands.setTextSelection({ from: newFrom, to: newTo });
    } else {
        instance.data.debug("initialContent has changed but collaboration is active -- not updating content");
    }
}

if (instance.data.editor_is_ready && instance.data.delay !== properties.update_delay) {
    instance.data.debug("updating debounce delay from", instance.data.delay + "ms to", properties.update_delay + "ms");
    instance.data.delay = properties.update_delay;
}

if (
    instance.data.editor_is_ready &&
    properties.bubble.auto_binding() &&
    instance.data.isDebouncingDone &&
    properties.autobinding !== instance.data.editor.getHTML()
) {
    // Clear any pending debounce timeout before programmatic update
    clearTimeout(instance.data.debounceTimeout);
    let editor = instance.data.editor;

    // Save cursor position before setContent
    const { from, to } = editor.state.selection;

    editor.commands.setContent(properties.autobinding, false);

    // Restore cursor position (clamped to document bounds)
    const docSize = editor.state.doc.content.size;
    const newFrom = Math.min(from, Math.max(1, docSize - 1));
    const newTo = Math.min(to, Math.max(1, docSize - 1));
    editor.commands.setTextSelection({ from: newFrom, to: newTo });

    const contentHTML = editor.getHTML();
    instance.publishState("contentHTML", contentHTML);
    instance.publishState("contentText", editor.getText());
    instance.publishState("contentJSON", JSON.stringify(editor.getJSON()));
    instance.publishState("isEditable", editor.isEditable);
    instance.publishState("characterCount", editor.storage.characterCount.characters());
    instance.publishState("wordCount", editor.storage.characterCount.words());
}

if (!!instance.data.editor_is_ready) {
    if (!properties.bubble.fit_height()) {
        instance.canvas.css({ overflow: "scroll" });
    } else {
        instance.canvas.css({ overflow: "auto" });
    }
}

if (!!instance.data.editor_is_ready && !!properties.collab_active) {
    instance.data.debug("updating collab user:", properties.collab_user_name, "color:", properties.collab_cursor_color);
    instance.data.editor.commands.updateUser({
        name: properties.collab_user_name,
        color: properties.collab_cursor_color,
    });
}

instance.data.applyStylesheet(properties);