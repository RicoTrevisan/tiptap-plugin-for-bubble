if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Italic");

  if (instance.data.ext.italic) {
    instance.data.editor.chain().focus().toggleItalic().run();
  } else {
    console.log("tried to Italic, but extension is not active.");
  }