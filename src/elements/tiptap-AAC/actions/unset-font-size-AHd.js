if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Unset font size");

if (instance.data.ext.fontsize) {
    instance.data.editor.chain().focus().unsetFontSize().run();
} else {
    console.log("tried to unset font size but Font Size extension is not active.");
}