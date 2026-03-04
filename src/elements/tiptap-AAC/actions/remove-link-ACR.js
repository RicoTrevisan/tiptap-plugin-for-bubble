if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Remove Link");

  if (instance.data.ext.link) {
    instance.data.editor.commands.unsetLink();
  } else {
    console.log("tried to add Link, but extension is not active.");
  }