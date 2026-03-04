if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady(
      "Horizontal Rule"
    );

  if (instance.data.ext.horizontalrule) {
    instance.data.editor.chain().focus().setHorizontalRule().run();
  } else {
    console.log("tried to add HorizontalRule, but extension is not active.");
  }