if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Task List");

  if (instance.data.ext.tasklist) {
    instance.data.editor.chain().focus().toggleTaskList().run();
  } else {
    console.log("tried to add TaskList, but extension is not active.");
  }