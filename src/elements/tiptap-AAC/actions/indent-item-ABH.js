if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Indent Item");

  if (
    instance.data.ext.bulletlist ||
    instance.data.ext.orderedlist ||
    instance.data.ext.tasklist
  ) {
    instance.data.editor.chain().focus().sinkListItem("listItem").run();
  } else {
    console.log(
      "tried to indent a list item, but no list extensions are not active."
    );
  }