if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Set Link");

  if (instance.data.ext.link) {
    let url = properties.url;
    instance.data.editor.commands.toggleLink({ href: url });
  } else {
    console.log("tried to add Link, but extension is not active.");
  }