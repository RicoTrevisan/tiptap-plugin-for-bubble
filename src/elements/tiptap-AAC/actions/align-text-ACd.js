if (!instance.data.editor_is_ready) {
  return instance.data.returnAndReportErrorIfEditorNotReady("Align Text");
}

if (instance.data.ext.textalign) {
  const editor = instance.data.editor;
  const alignment = properties.alignment;
  const selectedImage = editor.state.selection.node?.type.name === "image";

  if (selectedImage && alignment === "justify") {
    return;
  }

  if (alignment === "reset") {
    editor.chain().focus().unsetTextAlign().run();
  } else {
    editor.chain().focus().setTextAlign(alignment).run();
  }
} else {
  console.log("tried to TextAlign, but extension is not active.");
}
