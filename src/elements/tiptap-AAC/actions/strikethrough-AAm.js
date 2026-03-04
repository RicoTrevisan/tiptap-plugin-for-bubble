if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Strikethrough");

  if (instance.data.ext.strike) {
    instance.data.editor.chain().focus().toggleStrike().run();
  } else {
    console.log("tried to Strike, but extension is not active.");
  }