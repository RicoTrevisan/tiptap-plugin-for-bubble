if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady(
      "Set font family"
    );

  if (instance.data.ext.fontfamily) {
    let font_family = properties.font_family;
    instance.data.editor.chain().setFontFamily(font_family).focus().run();
  }