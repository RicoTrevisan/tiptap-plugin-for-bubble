if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Subscript");

if (instance.data.ext.subscript) {
    instance.data.editor.chain().focus().toggleSubscript().run();
} else {
    console.log("tried to toggle Subscript but extension is not active.");
}