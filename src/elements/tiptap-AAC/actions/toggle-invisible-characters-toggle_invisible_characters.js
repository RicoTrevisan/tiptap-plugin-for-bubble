if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Toggle Invisible Characters");

if (instance.data.ext.invisiblecharacters) {
    instance.data.editor.commands.toggleInvisibleCharacters();
    // Update exposed state
    const storage = instance.data.editor.extensionStorage.invisibleCharacters;
    if (storage) {
        instance.publishState("invisible_characters_visible", storage.visible);
    }
} else {
    console.log("tried to toggle Invisible Characters but extension is not active.");
}