if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Set font size");

if (instance.data.ext.fontsize) {
    let fontSize = properties.font_size;
    if (!fontSize) return;
    instance.data.editor.chain().focus().setFontSize(fontSize).run();
} else {
    console.log("tried to set font size but Font Size extension is not active.");
}