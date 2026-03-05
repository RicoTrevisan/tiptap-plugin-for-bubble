if (!instance.data.editor_is_ready)
    return instance.data.returnAndReportErrorIfEditorNotReady("Add YouTube");

  let url = properties.url;
  let width = properties.width;
  let height = properties.height;

  const opts = { src: url };
  if (width) opts.width = width;
  if (height) opts.height = height;

  instance.data.editor
    .chain()
    .focus()
    .setYoutubeVideo(opts)
    .run();