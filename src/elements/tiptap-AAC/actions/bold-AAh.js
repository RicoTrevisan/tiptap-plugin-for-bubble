if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Bold");
  // test sagain
  if (instance.data.ext.bold) {
    instance.data.editor.chain().toggleBold().focus().run();
  } else {
    console.log("tried to Bold, but extension is not active.");
  }