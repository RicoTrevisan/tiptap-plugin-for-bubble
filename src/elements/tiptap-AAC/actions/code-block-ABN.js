if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Code Block");

  if (instance.data.ext.codeblock) {
    instance.data.editor.chain().focus().toggleCodeBlock().run();
  } else {
    console.log("tried to add CodeBlock, but extension is not active.");
  }