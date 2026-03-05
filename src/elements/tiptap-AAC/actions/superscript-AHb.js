if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Superscript");

if (instance.data.ext.superscript) {
    instance.data.editor.chain().focus().toggleSuperscript().run();
} else {
    console.log("tried to toggle Superscript but extension is not active.");
}