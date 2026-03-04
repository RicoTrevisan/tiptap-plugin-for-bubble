if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Align Text");

  if (instance.data.ext.textalign) {
    let alignment = properties.alignment;
    console.log(alignment);
    if (alignment == "reset") {
      console.log(alignment == "reset");
      instance.data.editor.chain().focus().unsetTextAlign().run();
    } else {
      console.log(alignment != "reset");
      instance.data.editor.chain().focus().setTextAlign(alignment).run();
    }
  } else {
    console.log("tried to TextAlign, but extension is not active.");
  }