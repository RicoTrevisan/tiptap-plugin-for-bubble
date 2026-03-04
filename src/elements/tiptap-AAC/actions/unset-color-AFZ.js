if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Unset color");

  if (instance.data.ext.color) {
    instance.data.editor.chain().unsetColor().focus().run();
  }