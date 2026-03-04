if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady(
      "Unset font family"
    );

  if (instance.data.ext.fontfamily) {
    instance.data.editor.chain().unsetFontFamily().focus().run();
  }