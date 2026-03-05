if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Toggle Details");

if (instance.data.ext.details) {
    if (instance.data.editor.isActive("details")) {
        instance.data.editor.chain().focus().unsetDetails().run();
    } else {
        instance.data.editor.chain().focus().setDetails().run();
    }
} else {
    console.log("tried to toggle Details but extension is not active.");
}