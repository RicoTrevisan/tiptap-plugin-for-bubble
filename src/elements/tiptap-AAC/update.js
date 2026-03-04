// Update debug mode flag so the debug helper picks it up
instance.data._debug_mode = properties.debug_mode;

// Store latest properties/context for collab auth retry mechanism
instance.data._lastProperties = properties;
instance.data._lastContext = context;

if (properties.collab_active === true && !properties.collab_jwt) {
    instance.data.debug("collab is active but auth token is not yet loaded. Returning...");
    if (!instance.data._jwtEmptyWarningShown) {
        instance.data._jwtEmptyWarningShown = true;
        context.reportDebugger(
            "Collaboration is enabled but the JWT token is empty. The editor will initialize once the token is provided.",
        );
    }
    return;
}

if (properties.collab_active === true && !properties.collab_doc_id) {
    instance.data.debug("collab is active but document name (collab_doc_id) is not yet loaded. Returning...");
    context.reportDebugger(
        "Collaboration is enabled but the Document name field is empty. Please provide a unique document name (e.g. a slug or unique ID) for collaboration to work.",
    );
    return;
}

// First run: set up the editor (defined in initialize.js)
// Also re-runs after a collab auth failure retry (isEditorSetup is reset to false)
if (!instance.data.isEditorSetup) {
    // If a retry is pending (timer hasn't fired yet), wait for it
    if (instance.data._collabRetryPending) {
        instance.data.debug("collab retry pending — waiting for backoff timer before re-setup");
        return;
    }
    instance.data.setupEditor(properties, context);
}

/*
    PROPERTY CHANGE HANDLERS
    (run on every update after the editor is ready)
*/

if (!!instance.data.editor_is_ready && properties.isEditable != instance.data.editor.isEditable) {
    instance.data.debug("editable state changing to:", properties.isEditable);
    let isEditable = properties.isEditable;
    instance.data.editor.setEditable(isEditable);
}

if (
    instance.data.editor_is_ready &&
    properties.initialContent !== "" &&
    instance.data.initialContent !== properties.initialContent &&
    !properties.bubble.auto_binding()
) {
    instance.data.debug("initialContent has changed");

    if (!properties.collab_active) {
        instance.data.initialContent = properties.initialContent;
        let content = properties.content_is_json ? JSON.parse(instance.data.initialContent) : instance.data.initialContent;

        // Clear any pending debounce timeout before programmatic update
        clearTimeout(instance.data.debounceTimeout);

        // Save cursor position before setContent
        const { from, to } = instance.data.editor.state.selection;

        instance.data.editor.commands.setContent(content, true);

        // Restore cursor position (clamped to document bounds)
        const docSize = instance.data.editor.state.doc.content.size;
        const newFrom = Math.min(from, Math.max(1, docSize - 1));
        const newTo = Math.min(to, Math.max(1, docSize - 1));
        instance.data.editor.commands.setTextSelection({ from: newFrom, to: newTo });
    } else {
        instance.data.debug("initialContent has changed but collaboration is active -- not updating content");
    }
}

if (instance.data.editor_is_ready && instance.data.delay !== properties.update_delay) {
    instance.data.debug("updating debounce delay from", instance.data.delay + "ms to", properties.update_delay + "ms");
    instance.data.delay = properties.update_delay;
}

if (
    instance.data.editor_is_ready &&
    properties.bubble.auto_binding() &&
    instance.data.isDebouncingDone &&
    properties.autobinding !== instance.data.editor.getHTML()
) {
    // Clear any pending debounce timeout before programmatic update
    clearTimeout(instance.data.debounceTimeout);
    let editor = instance.data.editor;

    // Save cursor position before setContent
    const { from, to } = editor.state.selection;

    editor.commands.setContent(properties.autobinding, false);

    // Restore cursor position (clamped to document bounds)
    const docSize = editor.state.doc.content.size;
    const newFrom = Math.min(from, Math.max(1, docSize - 1));
    const newTo = Math.min(to, Math.max(1, docSize - 1));
    editor.commands.setTextSelection({ from: newFrom, to: newTo });

    const contentHTML = editor.getHTML();
    instance.publishState("contentHTML", contentHTML);
    instance.publishState("contentText", editor.getText());
    instance.publishState("contentJSON", JSON.stringify(editor.getJSON()));
    instance.publishState("isEditable", editor.isEditable);
    instance.publishState("characterCount", editor.storage.characterCount.characters());
    instance.publishState("wordCount", editor.storage.characterCount.words());
}

if (!!instance.data.editor_is_ready) {
    if (!properties.bubble.fit_height()) {
        instance.canvas.css({ overflow: "scroll" });
    } else {
        instance.canvas.css({ overflow: "auto" });
    }
}

if (!!instance.data.editor_is_ready && !!properties.collab_active) {
    instance.data.debug("updating collab user:", properties.collab_user_name, "color:", properties.collab_cursor_color);
    instance.data.editor.commands.updateUser({
        name: properties.collab_user_name,
        color: properties.collab_cursor_color,
    });
}

instance.data.stylesheet.innerHTML = `
#tiptapEditor-${instance.data.randomId} {


    .ProseMirror {



        h1 {
            font-size: ${properties.h1_size};
            color: ${properties.h1_color};
            margin: ${properties.h1_margin};
            font-weight: ${properties.h1_font_weight};
            ${properties.h1_adv}
        }

		h2 {
            font-size: ${properties.h2_size};
            color: ${properties.h2_color};
            margin: ${properties.h2_margin};
            font-weight: ${properties.h2_font_weight};
            ${properties.h2_adv}
		}

		h3 {
            font-size: ${properties.h3_size};
            color: ${properties.h3_color};
            margin: ${properties.h3_margin};
            font-weight: ${properties.h3_font_weight};
            ${properties.h3_adv}
        }

		h4 {
            font-size: ${properties.h4_size};
            color: ${properties.h4_color};
            margin: ${properties.h4_margin};
            font-weight: ${properties.h4_font_weight};
            ${properties.h4_adv}
        }

        h5 {
            font-size: ${properties.h5_size};
            color: ${properties.h5_color};
            margin: ${properties.h5_margin};
            font-weight: ${properties.h5_font_weight};
            ${properties.h5_adv}
        }

        h6 {
            font-size: ${properties.h6_size};
            color: ${properties.h6_color};
            margin: ${properties.h6_margin};
            font-weight: ${properties.h6_font_weight};
            ${properties.h6_adv}
        }

        p {
            font-size: ${properties.bubble.font_size()};
            color: ${properties.bubble.font_color()};
            font-family: ${properties.bubble.font_face().match(/^(.*?):/)[1]};
            margin: 1rem 0;
            font-weight: 400;
            ${properties.p_adv}
		}

        p.is-editor-empty:first-child::before {
            color: ${properties.placeholder_color || "#adb5bd"};
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
        }

        mark {
	        ${properties.mark_adv || ""}
        }

        a {
            text-decoration: underline;
            cursor: pointer;
            ${properties.link_adv}
        }

        a:link {
            color: ${properties.link_color};
            ${properties.link_unvisited_adv}
        }

        a:visited {
            color: ${properties.link_color_visited};
            ${properties.link_visited_adv}
        }

        a:focus {
	        ${properties.link_focus_adv}
        }

        a:hover {
            color: ${properties.link_color_hover};
            ${properties.link_hover_adv};
        }

	        a:active {
        }

        iframe {
	        ${properties.iframe}
        }

        img {
    	    ${properties.image_css}
        }

		blockquote {
        	${properties.blockquote_adv}
        }

		ul[data-type="taskList"] {
            list-style: none;
            padding: 0;
        }

		ul[data-type="taskList"] p {
        	margin: 0;
        }

		ul[data-type="taskList"] li {
        	display: flex;
        }

		ul[data-type="taskList"] li > label {
            flex: 0 0 auto;
            margin-right: 0.5rem;
            user-select: none;
        }

		ul[data-type="taskList"] li > div {
        	flex: 1 1 auto;
        }

		ul:not([data-type="taskList"]) {
        	${properties.ul_adv}
        }

		ol {
        	${properties.ol_adv}
        }

		table {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
            text-indent: 0;
        }
		th, td {
            padding: ${properties.table_th_td_padding};
            text-align: start;
            border-bottom: ${properties.table_th_td_border_bottom} ${properties.table_row_border_color};
        }

		th {
            font-weight: ${properties.table_th_font_weight};
            text-align: left;
            background: ${properties.table_th_background};
        }

		th * {
            color: ${properties.table_header_font_color};
            font-weight: ${properties.table_th_font_weight};
        }

		tr:nth-of-type(odd) {
        	background: ${properties.table_zebra_background};
        }

        .tiptap-drag-handle {
          align-items: center;
          background: black;
          border-radius: .25rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          cursor: grab;
          display: flex;
          height: 1.5rem;
          justify-content: center;
          width: 1.5rem;

        }




            ${properties.baseDiv || ""}

    }

    .mention {
        border: 1px solid;
        border-color: ${properties.mention_border_color};
        background-color: ${properties.mention_background_color || "transparent"};
        border-radius: 0.4rem;
        padding: 0.1rem 0.3rem;
        box-decoration-break: clone;
    }

    .suggestions {
        border: 1px solid #ccc;
        background-color: white;
        padding: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        border-radius: 4px;
        display: block; /* make sure it is visible */
        position: absolute;
        z-index: 1000; /* Ensure it is on top */
    }

    .suggestion-item {
        padding: 8px 10px;
        cursor: pointer;
        list-style: none;
    }

    .suggestion-item:hover {
	    background-color: #eee;
    }

    .suggestion {
        background-color: black;
        color: white;
    }
}



.selectedCell:after {
    z-index: 2;
    position: absolute;
    content: "";
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(200, 200, 255, 0.4);
    pointer-events: none;
}

.column-resize-handle {
    position: absolute;
    right: -2px;
    top: 0;
    bottom: -2px;
    width: 4px;
    background-color: #adf;
    pointer-events: none;
}

.tableWrapper {
    overflow-x: auto;
}

.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
}



.collaboration-cursor__caret {
    position: relative;
    margin-left: -1px;
    margin-right: -1px;
    border-left: 1px solid #0D0D0D;
    border-right: 1px solid #0D0D0D;
    word-break: normal;
    pointer-events: none;
}

.collaboration-cursor__label {
    position: absolute;
    top: -1.4em;
    left: -1px;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    user-select: none;
    color: #0D0D0D;
    padding: 0.1rem 0.3rem;
    border-radius: 3px 3px 3px 0;
    white-space: nowrap;
}

.items_${instance.data.randomId} {
    padding: 0.2rem;
    position: relative;
    border-radius: 0.5rem;
    background: #FFF;
    color: rgba(0, 0, 0, 0.8);
    overflow: hidden;
    font-size: 0.9rem;
    box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0px 10px 20px rgba(0, 0, 0, 0.1);

    .item {
        display: block;
        margin: 0;
        width: 100%;
        text-align: left;
        background: transparent;
        border-radius: 0.4rem;
        border: 1px solid transparent;
        padding: 0.2rem 0.4rem;

        &.is-selected {
        	border-color: #000;
        }
    }
}
`;
