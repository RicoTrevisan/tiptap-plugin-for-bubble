if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Highlight");

  if (instance.data.ext.highlight) {
    const color = properties.color;
    if (color) {
      instance.data.editor.chain().focus().toggleHighlight({ color: color }).run();
    } else {
      instance.data.editor.chain().focus().toggleHighlight().run();
    }
  } else {
    console.log("tried to Highlight but extension is not active.");
  }