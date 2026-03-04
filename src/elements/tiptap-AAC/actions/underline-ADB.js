if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Underline");

  if (instance.data.ext.underline) {
    instance.data.editor.chain().focus().toggleUnderline().run();
  } else {
    console.log("tried to underline but feature is off.");
  }