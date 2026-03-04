if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Outdent Item");

  if (
    instance.data.ext.bulletlist ||
    instance.data.ext.orderedlist ||
    instance.data.ext.tasklist
  ) {
    instance.data.editor.chain().focus().liftListItem("listItem").run();
  } else {
    console.log(
      "tried to indent a list item, but no list extensions are not active."
    );
  }