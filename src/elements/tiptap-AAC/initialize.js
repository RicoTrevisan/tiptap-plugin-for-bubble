try {
    // Debug logging helper — only logs when debug_mode is enabled
    instance.data.debug = function (...args) {
        if (instance.data._debug_mode) {
            console.log("[Tiptap]", ...args);
        }
    };

    // add display: flex to main element
    instance.canvas.css("display", "flex");

    // this boolean turns true after the setup has been done, but the editor might not yet be initialized.
    // if the setup runs twice, it can add double initial data, etc.
    instance.data.isEditorSetup = false;

    // this boolean turns true when the editor is initialized and ready.
    instance.data.editor_is_ready = false;

    instance.publishState("is_ready", false);
    instance.publishState("is_empty", true);
    instance.publishState("can_undo", false);
    instance.publishState("can_redo", false);
    instance.publishState("collab_status", "disconnected");
    instance.publishState("collab_synced", false);
    instance.publishState("collab_connected_users", 0);

    //    instance.canvas.cfss({'overflow':'scroll'});

    instance.data.stylesheet = document.createElement("style");
    instance.canvas.append(instance.data.stylesheet);

    // Reusable function to populate the editor stylesheet.
    // Called from update.js on every property change and from the collab retry path.
    instance.data.applyStylesheet = function (properties) {
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
        display: block;
        position: absolute;
        z-index: 1000;
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
    };

    // function to find the nearest parent.
    // useful when Tiptap is used inside a repeating group
    function findElement(elementID) {
        let $parent = instance.canvas.parent();
        while ($parent.length > 0) {
            var $foundMenu = $parent.find("#" + elementID);

            if ($foundMenu.length > 0) {
                return $foundMenu[0];
            }

            $parent = $parent.parent();
        }
    }
    instance.data.findElement = findElement;

    instance.data.isProgrammaticUpdate = false;
    instance.data.delay = 300;

    instance.data.debounce = function debounce(cb, delay = instance.data.delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout); // Clear the existing timeout
            timeout = setTimeout(() => {
                cb(...args);
            }, instance.data.delay);
            instance.data.debounceTimeout = timeout; // Store the timeout ID
        };
    };

    instance.data.isDebouncingDone = true;
    instance.data.updateContent = instance.data.debounce((content) => {
        instance.data.debug("debounce done, updating content");
        instance.publishAutobinding(content);
        instance.triggerEvent("contentUpdated");
        instance.data.isDebouncingDone = true;
    }, instance.data.delay);

    // throttle function: to take it easy on the autobinding.
    // 1. writes to autobinding
    // 2. then waits a certain delay
    // 3. then writes again if the user created more changes
    // source: from https://blog.webdevsimplified.com/2022-03/debounce-vs-throttle

    function throttle(mainFunction, delay = 2000) {
        let timerFlag = null; // Variable to keep track of the timer

        // Returning a throttled version
        return (...args) => {
            if (timerFlag === null) {
                // If there is no timer currently running
                mainFunction(...args); // Execute the main function
                timerFlag = setTimeout(() => {
                    // Set a timer to clear the timerFlag after the specified delay
                    mainFunction(...args);
                    timerFlag = null; // Clear the timerFlag to allow the main function to be executed again
                }, delay);
            }
        };
    }
    instance.data.throttle = throttle;

    instance.data.throttledContentUpdated = instance.data.throttle(() => {
        instance.triggerEvent("contentUpdated");
        // console.log("getHTML", instance.data.editor.getHTML());
        instance.data.throttle(instance.publishAutobinding(instance.data.editor.getHTML()));
    });

    function returnAndReportErrorIfEditorNotReady(errorFragment = "error") {
        const message = "Tried to run " + errorFragment + " before editor was ready. Crash prevented. Returning";
        instance.data.debug(message);
        context.reportDebugger(message);
        return;
    }
    instance.data.returnAndReportErrorIfEditorNotReady = returnAndReportErrorIfEditorNotReady;

    // Helper to set initial content on a new (empty) collab document.
    // Called from both the provider's onSynced and the editor's onCreate,
    // because either can fire first depending on network timing.
    instance.data.maybeSetCollabInitialContent = function () {
        if (!instance.data.collabHasSynced) return;
        if (!instance.data.editor_is_ready) return;
        if (!instance.data.collabInitialContent) return;
        if (instance.data.collabInitialContentSet) return;

        if (instance.data.editor.isEmpty) {
            instance.data.debug("collab document is empty after sync — setting initial content");
            instance.data.collabInitialContentSet = true;
            instance.data.editor.commands.setContent(instance.data.collabInitialContent);
        } else {
            instance.data.collabInitialContentSet = true; // prevent further checks
        }
    };

    // Helper to publish collab status as a state and fire the status changed event
    instance.data.publishCollabStatus = function (status) {
        instance.data.debug("collab status:", status);
        instance.publishState("collab_status", status);
        instance.triggerEvent("collab_status_changed");
    };

    // ── Collab auth-failure retry mechanism ──────────────────
    // When authentication fails (e.g. JWT not yet valid on server), tear down
    // the editor + provider and let the next update() cycle re-create everything.
    instance.data._collabRetryCount = 0;
    const COLLAB_MAX_RETRIES = 5;
    const COLLAB_RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000]; // exponential backoff

    instance.data.handleCollabAuthFailure = function (providerLabel, reason) {
        instance.data._collabRetryCount++;
        const attempt = instance.data._collabRetryCount;
        const message =
            providerLabel +
            " authentication failed (attempt " +
            attempt +
            "/" +
            COLLAB_MAX_RETRIES +
            "): " +
            reason;
        instance.data.debug(message);
        console.warn("[Tiptap]", message);

        if (attempt >= COLLAB_MAX_RETRIES) {
            const giveUpMsg =
                providerLabel +
                " authentication failed after " +
                COLLAB_MAX_RETRIES +
                " attempts. Giving up. Please check your JWT token configuration.";
            instance.data.debug(giveUpMsg);
            context.reportDebugger(giveUpMsg);
            return;
        }

        // Clear the collab sync polling interval (set in onCreate)
        if (instance.data._collabSyncPollInterval) {
            clearInterval(instance.data._collabSyncPollInterval);
            instance.data._collabSyncPollInterval = null;
        }

        // Tear down provider
        if (instance.data.provider) {
            try {
                instance.data.provider.destroy();
            } catch (e) {
                instance.data.debug("error destroying provider during auth retry:", e);
            }
            instance.data.provider = null;
        }

        // Tear down editor
        if (instance.data.editor) {
            try {
                instance.data.editor.destroy();
            } catch (e) {
                instance.data.debug("error destroying editor during auth retry:", e);
            }
            instance.data.editor = null;
        }

        // Remove the editor DOM element so setupEditor can recreate it
        const editorEl = document.getElementById(instance.data.tiptapEditorID);
        if (editorEl) editorEl.remove();

        // Reset flags so the next update() cycle re-runs setupEditor
        instance.data.isEditorSetup = false;
        instance.data.editor_is_ready = false;
        instance.publishState("is_ready", false);
        instance.publishState("collab_synced", false);
        instance.data.publishCollabStatus("disconnected");

        // Schedule a re-trigger after a backoff delay.
        // We call setupEditor directly because publishState does not trigger update() in Bubble.
        const delay = COLLAB_RETRY_DELAYS[attempt - 1] || COLLAB_RETRY_DELAYS[COLLAB_RETRY_DELAYS.length - 1];
        instance.data.debug("scheduling collab retry in " + delay + "ms");
        instance.data._collabRetryPending = true;
        instance.data._collabRetryTimer = setTimeout(() => {
            instance.data._collabRetryPending = false;
            instance.data.debug("collab retry timer fired — re-running setupEditor");
            instance.data.publishCollabStatus("retrying");
            if (instance.data._lastProperties && instance.data._lastContext) {
                instance.data.setupEditor(instance.data._lastProperties, instance.data._lastContext);
                instance.data.applyStylesheet(instance.data._lastProperties);
            }
        }, delay);
    };

    function maybeSetupCollaboration(instance, properties, options, extensions) {
        if (properties.collab_active === false) return;
        instance.data.debug("collaboration is active, provider:", properties.collabProvider);
        // Store initial content before removing — used to populate new (empty) collab documents
        instance.data.collabInitialContent = options.content;
        instance.data.collabHasSynced = false;
        instance.data.collabInitialContentSet = false;
        // removes initialContent -- normally a collab document will have some document in the cloud.
        delete options.content;

        if (!properties.collab_active) {
            instance.data.debug("collab is not active");
            return;
        }
        if (properties.collabProvider === "liveblocks") {
            setupLiveblocks(extensions, properties);
            return;
        }

        if (properties.collabProvider === "tiptap") {
            setupTiptapCloud(extensions, properties);
            return;
        }

        if (properties.collabProvider === "custom") {
            setupCustomHocuspocus(extensions, properties);
            return;
        }
    }
    instance.data.maybeSetupCollaboration = maybeSetupCollaboration;

    function setupCustomHocuspocus(extensions, properties) {
        instance.data.debug("setting up custom Hocuspocus collab");
        const { HocuspocusProvider, Collaboration, CollaborationCaret, Y } = window.tiptap;
        if (!properties.collab_url.endsWith("/")) {
            properties.collab_url += "/";
        }

        const custom_url = properties.collab_url + properties.collab_app_id;
        instance.data.debug("custom collab URL:", custom_url, "doc:", properties.collab_doc_id);
        try {
            instance.data.provider = new HocuspocusProvider({
                url: custom_url,
                name: properties.collab_doc_id,
                token: properties.collab_jwt,
                onStatus: ({ status }) => {
                    instance.data.publishCollabStatus(status);
                },
                onConnect() {
                    instance.data.publishCollabStatus("connected");
                },
                onAuthenticated() {
                    instance.data.debug("custom collab authenticated");
                    instance.data._collabRetryCount = 0; // reset on success
                },
                onAuthenticationFailed: ({ reason }) => {
                    instance.data.handleCollabAuthFailure("Custom collab", reason);
                },
                onSynced: () => {
                    instance.data.debug("custom collab synced");
                    instance.data.collabHasSynced = true;
                    instance.publishState("collab_synced", true);
                    instance.triggerEvent("collab_synced");
                    instance.data.maybeSetCollabInitialContent();
                },
                onDisconnect: () => {
                    instance.data.publishCollabStatus("disconnected");
                    instance.publishState("collab_synced", false);
                    instance.data.collabHasSynced = false;
                },
                onDestroy() {
                    instance.data.debug("custom collab destroyed");
                },
                onAwarenessChange: ({ states }) => {
                    instance.publishState("collab_connected_users", states.length);
                },
                onStateless: ({ payload }) => {
                    instance.data.debug("custom collab stateless message:", payload);
                },
            });

            // Also register synced handler via .on() as backup
            instance.data.provider.on("synced", () => {
                instance.data.collabHasSynced = true;
                instance.publishState("collab_synced", true);
                instance.data.maybeSetCollabInitialContent();
            });

            extensions.push(
                Collaboration.configure({
                    document: instance.data.provider.document,
                }),
                CollaborationCaret.configure({
                    provider: instance.data.provider,
                }),
            );
            instance.data.debug("custom Hocuspocus provider created successfully");
        } catch (error) {
            const message = "Error setting up custom collab: ";
            context.reportDebugger(message + error);
            console.error("[Tiptap]", message, error);
        }
        return;
    }

    function setupTiptapCloud(extensions, properties) {
        instance.data.debug("setting up Tiptap Cloud collab");

        const { HocuspocusProvider, Collaboration, CollaborationCaret } = window.tiptap;
        const url = `wss://${properties.collab_app_id}.collab.tiptap.cloud`;
        instance.data.debug("Tiptap Cloud URL:", url, "doc:", properties.collab_doc_id);
        try {
            instance.data.provider = new HocuspocusProvider({
                url: url,
                name: properties.collab_doc_id,
                token: properties.collab_jwt,
                onConnect: () => {
                    instance.data.publishCollabStatus("connected");
                },
                onAuthenticated: () => {
                    instance.data.debug("Tiptap Cloud authenticated");
                    instance.data._collabRetryCount = 0; // reset on success
                },
                onAuthenticationFailed: ({ reason }) => {
                    instance.data.handleCollabAuthFailure("Tiptap Cloud", reason);
                },
                onStatus: ({ status }) => {
                    instance.data.publishCollabStatus(status);
                },
                onSynced: () => {
                    instance.data.debug("Tiptap Cloud synced");
                    instance.data.collabHasSynced = true;
                    instance.publishState("collab_synced", true);
                    instance.triggerEvent("collab_synced");
                    instance.data.maybeSetCollabInitialContent();
                },
                onDisconnect: () => {
                    instance.data.publishCollabStatus("disconnected");
                    instance.publishState("collab_synced", false);
                    instance.data.collabHasSynced = false;
                },
                onAwarenessChange: ({ states }) => {
                    instance.publishState("collab_connected_users", states.length);
                },
            });

            // Also register synced handler via .on() as backup
            instance.data.provider.on("synced", () => {
                instance.data.collabHasSynced = true;
                instance.publishState("collab_synced", true);
                instance.data.maybeSetCollabInitialContent();
            });

            instance.data.debug("Tiptap Cloud provider created successfully");
        } catch (error) {
            const message = "Error setting up Tiptap Cloud collab: ";
            context.reportDebugger(message + error);
            console.error("[Tiptap]", message, error);
        }

        extensions.push(
            Collaboration.configure({
                document: instance.data.provider.document,
            }),
            CollaborationCaret.configure({
                provider: instance.data.provider,
            }),
        );

        return;
    }

    function setupLiveblocks(extensions, properties) {
        instance.data.debug("setting up collab with Liveblocks");
        if (!properties.liveblocksPublicApiKey) {
            context.reportDebugger("Liveblocks is selected but there's no plublic API key");
            return;
        }

        const { createClient, LiveblocksProvider, Collaboration, CollaborationCaret, Y } = window.tiptap;

        try {
            const client = createClient({
                publicApiKey: properties.liveblocksPublicApiKey,
            });

            const { room, leave } = client.enterRoom(properties.collab_doc_id, {
                initialPresence: {},
            });

            const yDoc = new Y.Doc();
            const Text = yDoc.getText("tiptap");
            const Provider = new LiveblocksProvider(room, yDoc);

            extensions.push(
                Collaboration.configure({
                    document: yDoc,
                }),
                CollaborationCaret.configure({
                    provider: Provider,
                }),
            );
        } catch (error) {
            context.reportDebugger("There was an error setting up Liveblocks. " + error);
        }

        return extensions;
    }
    instance.data.setupLiveblocks = setupLiveblocks;
} catch (error) {
    console.error("[Tiptap] error in initialize:", error);
}

// MentionList
instance.data.MentionList = class MentionList {
    constructor(stuff) {
        const { props, editor } = stuff;
        this.items = props.items;
        this.command = props.command;
        this.selectedIndex = 0;
        this.randomId = props.randomId;
        this.editor = editor;
        this.initElement();
        this.updateItems(this);
    }

    initElement() {
        this.element = document.createElement("div");
        this.element.className = "items_" + this.randomId;

        this.element.addEventListener("click", this.handleClick.bind(this));
        this.element.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    handleClick(event) {
        const target = event.target.closest(".item");
        const index = Array.from(this.element.children).indexOf(target);
        if (index !== -1) {
            this.selectItem(index);
            this.updateSelection(index);
        }
    }

    updateItems(props) {
        this.items = props.items;
        this.selectedIndex = 0;
        this.redraw();
    }

    updateProps(props) {
        this.range = props.range;
        this.editor = props.editor;
    }

    redraw() {
        this.element.innerHTML = "";
        const fragment = document.createDocumentFragment();

        this.items.forEach((item, index) => {
            const button = document.createElement("button");
            button.textContent = item.label;
            button.className = "item" + (index === this.selectedIndex ? " is-selected" : "");
            fragment.appendChild(button);
        });

        this.element.appendChild(fragment);
    }

    selectItem(index) {
        const item = this.items[index];
        const editor = this.editor;
        const range = this.range;

        if (item && range) {
            editor.commands.insertContentAt(range, {
                type: "mention",
                attrs: {
                    label: item.label,
                    id: item.id,
                },
            });
            editor.commands.insertContent(" ");
            editor.commands.setTextSelection(range.from + 1);
        } else {
            this.command(item);
        }
    }

    updateSelection(index) {
        const previouslySelected = this.element.querySelector(".is-selected");
        if (previouslySelected) previouslySelected.classList.remove("is-selected");

        const newSelected = this.element.children[index];
        if (newSelected) newSelected.classList.add("is-selected");

        this.selectedIndex = index;
    }

    handleKeyDown(event) {
        switch (event.key) {
            case "ArrowUp":
                this.moveSelection(-1);
                event.preventDefault();
                break;
            case "ArrowDown":
                this.moveSelection(1);
                event.preventDefault();
                break;
            case "Enter":
                this.selectItem(this.selectedIndex);
                event.preventDefault();
                break;
            case "Tab":
                this.selectItem(this.selectedIndex);
                event.preventDefault();
                break;
        }
    }

    moveSelection(direction) {
        const itemLength = this.items.length;
        const newIndex = (this.selectedIndex + direction + itemLength) % itemLength;
        this.updateSelection(newIndex);
        this.redraw();
    }
};

function configureSuggestion(instance, properties) {
    return {
        items: ({ query }) => {
            if (typeof query !== "string") {
                // console.log("thing passed to Mention is not a string, returning. Typeof query: ", typeof query);
                return [];
            }
            const length = properties.mention_list.length();
            const source_list = properties.mention_list.get(0, length);
            const mention_list = source_list.map((item) => {
                return {
                    label: item.get(properties.mention_field_label),
                    id: item.get(properties.mention_field_id),
                };
            });
            // console.log("mention_list", mention_list);
            const query_result = mention_list.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

            return query_result;
        },

        render: () => {
            let popup, component;

            return {
                onStart: (props) => {
                    props.randomId = instance.data.randomId;
                    component = new instance.data.MentionList({
                        props,
                        editor: props.editor,
                    });
                    popup = window.tiptap.tippy("body", {
                        getReferenceClientRect: props.clientRect,
                        appendTo: () => document.body,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: "manual",
                        placement: "bottom-start",
                    });
                },

                onUpdate: (props) => {
                    if (!props.clientRect) {
                        return;
                    }

                    component.updateProps(props);

                    popup[0].setProps({
                        getReferenceClientRect: props.clientRect,
                    });

                    const newItems = component.updateItems(props);
                    popup[0].setContent(newItems);
                },

                onKeyDown: ({ event, editor }) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        component.selectItem(component.selectedIndex);
                        return true;
                    }

                    return component.handleKeyDown(event);
                },

                onExit: () => {
                    popup[0].destroy();
                    component.element.remove();
                },
            };
        },
    };
}
instance.data.configureSuggestion = configureSuggestion;

instance.data.rgbToHex = function (colorString) {
    instance.data.debug("rgbToHex", colorString);

    // Regular expressions for RGB and RGBA
    const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
    const rgbaRegex = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/;

    let match = colorString.match(rgbRegex) || colorString.match(rgbaRegex);

    if (!match) {
        console.error('Invalid color string format. Expected "rgb(r, g, b)" or "rgba(r, g, b, a)"');
        return null;
    }

    // Convert the extracted values to integers
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    // Handle alpha if present (for RGBA)
    let a = match[4] ? parseFloat(match[4]) : 1;

    // Ensure the values are within the valid range
    const clamp = (val) => Math.min(255, Math.max(0, val));

    // Convert to hex and pad with zeros if necessary
    const toHex = (val) => clamp(val).toString(16).padStart(2, "0");

    // Combine the hex values
    let hex = "#" + toHex(r) + toHex(g) + toHex(b);

    // Add alpha to hex if it's less than 1
    if (a < 1) {
        const alpha = Math.round(a * 255)
            .toString(16)
            .padStart(2, "0");
        hex += alpha;
    }

    return hex;
};

// Publish all formatting-related active states for the current cursor/selection.
// Called from both onTransaction and onSelectionUpdate to avoid duplication.
function publishActiveStates(editor) {
    instance.publishState("bold", editor.isActive("bold"));
    instance.publishState("italic", editor.isActive("italic"));
    instance.publishState("strike", editor.isActive("strike"));
    instance.publishState("h1", editor.isActive("heading", { level: 1 }));
    instance.publishState("h2", editor.isActive("heading", { level: 2 }));
    instance.publishState("h3", editor.isActive("heading", { level: 3 }));
    instance.publishState("h4", editor.isActive("heading", { level: 4 }));
    instance.publishState("h5", editor.isActive("heading", { level: 5 }));
    instance.publishState("h6", editor.isActive("heading", { level: 6 }));
    instance.publishState("body", !editor.isActive("heading"));
    instance.publishState("orderedList", editor.isActive("orderedList"));
    instance.publishState("bulletList", editor.isActive("bulletList"));
    instance.publishState("sinkListItem", editor.can().sinkListItem("listItem"));
    instance.publishState("liftListItem", editor.can().liftListItem("listItem"));
    instance.publishState("blockquote", editor.isActive("blockquote"));
    instance.publishState("codeBlock", editor.isActive("codeBlock"));
    instance.publishState("taskList", editor.isActive("taskList"));
    instance.publishState("taskItem", editor.isActive("taskItem"));
    instance.publishState("link", editor.isActive("link"));
    instance.publishState("url", editor.getAttributes("link").href);
    instance.publishState("align_left", editor.isActive({ textAlign: "left" }));
    instance.publishState("align_center", editor.isActive({ textAlign: "center" }));
    instance.publishState("align_right", editor.isActive({ textAlign: "right" }));
    instance.publishState("align_justified", editor.isActive({ textAlign: "justify" }));
    instance.publishState("highlight", editor.isActive("highlight"));
    instance.publishState("underline", editor.isActive("underline"));
    instance.publishState("table", editor.isActive("table"));

    const textStyle = editor.getAttributes("textStyle");
    if (textStyle && textStyle.color) {
        const color = textStyle.color;
        try {
            const hexColor = instance.data.rgbToHex(color);
            instance.data.textStyleColor = hexColor;
        } catch (error) {
            console.warn(`Failed to convert color to hex: ${color}`, error);
            instance.data.textStyleColor = color; // Fallback to original color value
        }
    } else {
        instance.data.textStyleColor = "";
    }
    instance.publishState("color", instance.data.textStyleColor);

    if (textStyle && textStyle.fontFamily) {
        instance.publishState("font_family", textStyle.fontFamily);
    } else {
        instance.publishState("font_family", "");
    }
}
instance.data.publishActiveStates = publishActiveStates;

function findParentBlock(state, pos) {
    const $pos = state.doc.resolve(pos);
    for (let depth = $pos.depth; depth > 0; depth--) {
        const node = $pos.node(depth);
        if (node.type.isBlock) {
            return { node, pos: $pos.before(depth), depth };
        }
    }
    return null;
}
instance.data.findParentBlock = findParentBlock;

function getSelection(editor) {
    const { state, view } = editor;
    const { from, to } = view.state.selection;
    const text = state.doc.textBetween(from, to, "");
    instance.publishState("selected_text", text);
    instance.publishState("from", from);
    instance.publishState("to", to);

    if (from === to) {
        // No selection, clear states
        instance.publishState("selectedContent", null);
        instance.publishState("selectedHTML", null);
        instance.publishState("selectedJSON", null);
        return;
    }

    try {
        const $from = state.doc.resolve(from);
        const $to = state.doc.resolve(to);
        let parentNode = $from.parent;
        let parentNodeType = parentNode.type.name;

        // Map ProseMirror node types to HTML tags
        const nodeTypeToHtmlTag = {
            paragraph: "p",
            heading: "h" + (parentNode.attrs.level || "1"), // h1, h2, etc.
            bulletList: "ul",
            orderedList: "ol",
            listItem: "li",
            blockquote: "blockquote",
            codeBlock: "pre",
            horizontalRule: "hr",
            table: "table",
            tableRow: "tr",
            tableCell: "td",
            tableHeader: "th",
        };

        const selectedNode = state.doc.slice(from, to);
        const selectedJSON = selectedNode.toJSON();
        const content = selectedJSON.content;

        // Use the same extensions the editor was built with
        const extensions = instance.data.editorExtensions;

        // Generate HTML from the JSON using the utility function
        let selectedHTML = window.tiptap.generateHTML({ type: "doc", content: content }, extensions);

        // If the selection is just text, wrap it with the appropriate HTML tag
        if (content.length === 1 && content[0].type === "text") {
            const htmlTag = nodeTypeToHtmlTag[parentNodeType] || "p";
            selectedHTML = `<${htmlTag}>${selectedHTML}</${htmlTag}>`;
        }

        instance.publishState("selectedContent", text);
        instance.publishState("selectedHTML", selectedHTML);
        instance.publishState("selectedJSON", JSON.stringify(selectedJSON));
    } catch (error) {
        console.error("Error generating JSON or HTML:", error);
    }
}
instance.data.getSelection = getSelection;

// ─────────────────────────────────────────────────────────────
// setupEditor — called once from update.js on first property load
// ─────────────────────────────────────────────────────────────
instance.data.setupEditor = function (properties, context) {
    instance.data.debug("starting editor setup");

    let initialContent = properties.bubble.auto_binding() ? properties.autobinding : properties.initialContent;
    instance.data.initialContent = initialContent;
    let content = properties.content_is_json ? JSON.parse(initialContent) : initialContent;

    let placeholder = properties.placeholder;
    let bubbleMenu = properties.bubbleMenu;
    let floatingMenu = properties.floatingMenu;

    let preserveWhitespace =
        properties.parseOptions_preserveWhitespace === "true" ? true : properties.parseOptions_preserveWhitespace === "false" ? false : "full";

    // create the editor div
    const randomId = (Math.random() + 1).toString(36).substring(3);
    instance.data.randomId = randomId;
    var d = document.createElement("div");
    d.id = "tiptapEditor-" + randomId;
    d.style = "flex-grow: 1; display: flex;";
    instance.data.tiptapEditorID = d.id;
    instance.canvas.append(d);

    // pull libraries from window.tiptap
    const {
        Editor,
        Node,
        Extension,
        mergeAttributes,
        Document,
        HardBreak,
        Paragraph,
        Text,
        Bold,
        Italic,
        Strike,
        Underline,
        Code,
        Heading,
        Blockquote,
        CodeBlock,
        HorizontalRule,
        BulletList,
        OrderedList,
        ListItem,
        TaskList,
        TaskItem,
        FontFamily,
        Color,
        TextStyle,
        TextAlign,
        Highlight,
        Image,
        Resizable,
        Link,
        Youtube,
        Table,
        TableRow,
        TableHeader,
        TableCell,
        Mention,
        CharacterCount,
        Dropcursor,
        Gapcursor,
        UndoRedo,
        Placeholder,
        BubbleMenu,
        FloatingMenu,
        FileHandler,
        UniqueID,
    } = window.tiptap;

    // parse heading levels
    instance.data.headings = [];
    properties.headings.split(",").map((item) => {
        instance.data.headings.push(parseInt(item));
    });

    instance.data.active_nodes = properties.nodes.split(",").map((item) => item.trim());
    instance.data.debug("active nodes:", instance.data.active_nodes.join(", "));

    // ── Build extensions ─────────────────────────────────────

    const extensions = [
        Document,
        Paragraph,
        Text,
        ListItem,
        TextStyle,
        CharacterCount.configure({
            limit: properties.characterLimit || null,
        }),
    ];

    if (properties.extension_uniqueid) {
        if (!properties.extension_uniqueid_types) {
            context.reportDebugger("UniqueID extension is active but the types are empty. You could target `paragraph, heading`, for example.");
            return;
        }
        let unique_id_types = properties.extension_uniqueid_types.split(",").map((item) => {
            return item.trim();
        });

        if (unique_id_types.length === 0) {
            context.reportDebugger(
                "UniqueID extension is active but there are no types for it to target. You could target `paragraph, heading`, for example.",
            );
            return;
        }

        let attributeName = properties.extension_uniqueid_attrName || "id";
        instance.data.debug("UniqueID attributeName:", attributeName);

        extensions.push(
            UniqueID.configure({
                types: unique_id_types,
                attributeName: attributeName,
            }),
        );
    }

    if (instance.data.active_nodes.includes("Dropcursor")) extensions.push(Dropcursor);
    if (instance.data.active_nodes.includes("Gapcursor")) extensions.push(Gapcursor);
    if (instance.data.active_nodes.includes("HardBreak")) {
        extensions.push(HardBreak.configure({ keepMarks: properties.hardBreakKeepMarks }));
    }
    if (instance.data.active_nodes.includes("History") && !properties.collab_active) extensions.push(UndoRedo);
    if (instance.data.active_nodes.includes("Bold")) extensions.push(Bold);
    if (instance.data.active_nodes.includes("Italic")) extensions.push(Italic);
    if (instance.data.active_nodes.includes("Strike")) extensions.push(Strike);
    if (instance.data.active_nodes.includes("FontFamily")) extensions.push(FontFamily);
    if (instance.data.active_nodes.includes("Color")) extensions.push(Color);
    if (instance.data.active_nodes.includes("Heading")) extensions.push(Heading.configure({ levels: instance.data.headings }));
    if (instance.data.active_nodes.includes("BulletList")) extensions.push(BulletList);
    if (instance.data.active_nodes.includes("OrderedList")) extensions.push(OrderedList);
    if (instance.data.active_nodes.includes("TaskList")) extensions.push(TaskList, TaskItem.configure({ nested: true }));

    if (instance.data.active_nodes.includes("Mention")) {
        if (!properties.mention_list) {
            instance.data.debug("tried to use Mention extension, but mention_list is empty. Mention extension not loaded");
        } else {
            const suggestion_config = instance.data.configureSuggestion(instance, properties);
            extensions.push(
                Mention.configure({
                    HTMLAttributes: {
                        class: "mention",
                    },
                    renderHTML({ options, node }) {
                        return [
                            "a",
                            mergeAttributes({ href: `${properties.mention_base_url}${node.attrs.id}` }, options.HTMLAttributes),
                            `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`,
                        ];
                    },
                    deleteTriggerWithBackspace: true,
                    suggestion: suggestion_config,
                }),
            );
        }
    }

    if (instance.data.active_nodes.includes("Highlight")) extensions.push(Highlight);
    if (instance.data.active_nodes.includes("Underline")) extensions.push(Underline);
    if (instance.data.active_nodes.includes("CodeBlock")) extensions.push(CodeBlock);
    if (instance.data.active_nodes.includes("Code")) extensions.push(Code);
    if (instance.data.active_nodes.includes("Blockquote")) extensions.push(Blockquote);
    if (instance.data.active_nodes.includes("HorizontalRule")) extensions.push(HorizontalRule);
    if (instance.data.active_nodes.includes("Youtube")) extensions.push(Youtube.configure({ nocookie: true }));
    if (instance.data.active_nodes.includes("Table")) extensions.push(Table.configure({ resizable: true }), TableRow, TableHeader, TableCell);
    if (instance.data.active_nodes.includes("Image")) {
        extensions.push(Image.configure({ inline: false, allowBase64: properties.allowBase64 }), Resizable);
    }
    if (instance.data.active_nodes.includes("Link")) extensions.push(Link);
    if (instance.data.active_nodes.includes("Placeholder")) extensions.push(Placeholder.configure({ placeholder: placeholder }));
    if (instance.data.active_nodes.includes("TextAlign")) extensions.push(TextAlign.configure({ types: ["heading", "paragraph"] }));

    // ── PreserveAttributes extension ─────────────────────────

    const PreserveAttributes = Extension.create({
        name: "preserveAttributes",

        addGlobalAttributes() {
            return [
                {
                    // Apply to all block nodes
                    types: ["paragraph", "heading", "blockquote", "codeBlock", "listItem", "table", "tableRow", "tableCell", "tableHeader"],
                    attributes: {
                        class: {
                            default: null,
                            parseHTML: (element) => element.getAttribute("class"),
                            renderHTML: (attributes) => {
                                if (!attributes.class) return {};
                                return { class: attributes.class };
                            },
                        },
                        style: {
                            default: null,
                            parseHTML: (element) => element.getAttribute("style"),
                            renderHTML: (attributes) => {
                                if (!attributes.style) return {};
                                return { style: attributes.style };
                            },
                        },
                        id: {
                            default: null,
                            parseHTML: (element) => element.getAttribute("id"),
                            renderHTML: (attributes) => {
                                if (!attributes.id) return {};
                                return { id: attributes.id };
                            },
                        },
                        "data-attributes": {
                            default: null,
                            parseHTML: (element) => {
                                const dataAttrs = {};
                                Array.from(element.attributes).forEach((attr) => {
                                    if (attr.name.startsWith("data-")) {
                                        dataAttrs[attr.name] = attr.value;
                                    }
                                });
                                return Object.keys(dataAttrs).length ? dataAttrs : null;
                            },
                            renderHTML: (attributes) => {
                                if (!attributes["data-attributes"]) return {};
                                return attributes["data-attributes"];
                            },
                        },
                    },
                },
                {
                    // Apply to inline marks
                    types: ["bold", "italic", "strike", "code", "link"],
                    attributes: {
                        class: {
                            default: null,
                            parseHTML: (element) => element.getAttribute("class"),
                            renderHTML: (attributes) => {
                                if (!attributes.class) return {};
                                return { class: attributes.class };
                            },
                        },
                        style: {
                            default: null,
                            parseHTML: (element) => element.getAttribute("style"),
                            renderHTML: (attributes) => {
                                if (!attributes.style) return {};
                                return { style: attributes.style };
                            },
                        },
                    },
                },
            ];
        },
    });

    // ── CustomDiv extension ──────────────────────────────────

    const CustomDivExtension = Node.create({
        name: "customDiv",
        group: "block",
        content: "block*",
        defining: true,

        addAttributes() {
            return {
                class: {
                    default: null,
                    parseHTML: (element) => element.getAttribute("class"),
                },
                style: {
                    default: null,
                    parseHTML: (element) => element.getAttribute("style"),
                },
                id: {
                    default: null,
                    parseHTML: (element) => element.getAttribute("id"),
                },
                "data-attributes": {
                    default: null,
                    parseHTML: (element) => {
                        const dataAttrs = {};
                        Array.from(element.attributes).forEach((attr) => {
                            if (attr.name.startsWith("data-")) {
                                dataAttrs[attr.name] = attr.value;
                            }
                        });
                        return Object.keys(dataAttrs).length ? dataAttrs : null;
                    },
                },
            };
        },

        parseHTML() {
            return [{ tag: "div" }];
        },

        renderHTML({ node, HTMLAttributes }) {
            const attrs = { ...node.attrs };

            // Merge data attributes
            if (attrs["data-attributes"]) {
                Object.assign(attrs, attrs["data-attributes"]);
                delete attrs["data-attributes"];
            }

            // Remove null/undefined attributes
            Object.keys(attrs).forEach((key) => {
                if (attrs[key] === null || attrs[key] === undefined) {
                    delete attrs[key];
                }
            });

            return ["div", { ...attrs, ...HTMLAttributes }, 0];
        },
    });

    if (properties.preserve_attributes) {
        extensions.push(PreserveAttributes);

        if (properties.preserve_unknown_tags) {
            // Add custom div support
            extensions.push(CustomDivExtension);
        }
    }

    // ── File upload handling ─────────────────────────────────

    function handleUpload(file, editor, pos) {
        const attachFilesTo = properties.attachFilesTo || null;
        return new Promise((resolve, reject) => {
            if (!instance.canUploadFile(file)) {
                const message = "Not allowed to upload this file";
                context.reportDebugger(message);
                instance.publishState("fileUploadErrorMessage", message);
                reject(new Error(message));
                return;
            }
            if (!properties.attachFilesTo) {
                context.reportDebugger(
                    "Uploading a file, but there's no object to attach to. This file could be accessible by anyone. Consider the privacy implications.",
                );
            }

            instance.publishState("fileUploadProgress", 0);
            const uploadedFile = instance.uploadFile(
                file,
                (err, url) => {
                    if (err) {
                        context.reportDebugger(err.message);
                        instance.publishState("fileUploadErrorMessage", err.message);
                        reject(err);
                        return;
                    }

                    if (file.type.startsWith("image/")) {
                        // Insert at the drop position
                        if (pos) {
                            editor.commands.insertContentAt(pos, {
                                type: "image",
                                attrs: { src: url },
                            });
                        } else {
                            // Fallback to regular image insertion if no position specified
                            editor.commands.setImage({ src: url });
                        }
                    }
                    instance.data.fileUploadUrls.push(url);
                    instance.triggerEvent("fileUploaded");
                    instance.publishState("fileUploadUrls", instance.data.fileUploadUrls);
                    resolve(url);
                },
                properties.attachFilesTo,
                (progress) => {
                    instance.publishState("fileUploadProgress", progress);
                },
            );
        });
    }

    let allowedMimeTypes = undefined;
    if (properties.allowedMimeTypes) {
        allowedMimeTypes = properties.allowedMimeTypes.get(0, properties.allowedMimeTypes.length());
    }

    extensions.push(
        FileHandler.configure({
            onDrop: async (editor, files, pos) => {
                instance.data.fileUploadUrls = [];
                try {
                    const uploadPromises = Array.from(files).map((file) => handleUpload(file, editor, pos));

                    // Wait for all uploads to complete
                    const urls = await Promise.all(uploadPromises);
                    instance.data.debug("file upload URLs:", urls);
                    instance.publishState("fileUploadUrls", urls);
                } catch (error) {
                    instance.triggerEvent("fileUploadError");
                    console.error("Upload error:", error);
                    context.reportDebugger(error.message);
                    instance.publishState("fileUploadErrorMessage", error.message);
                }
            },

            onPaste: async (editor, files, htmlContent) => {
                instance.data.fileUploadUrls = [];
                if (htmlContent) return;
                try {
                    const uploadPromises = Array.from(files).map((file) => handleUpload(file, editor));

                    // Wait for all uploads to complete
                    const urls = await Promise.all(uploadPromises);
                    instance.publishState("fileUploadUrls", urls);
                } catch (error) {
                    instance.triggerEvent("fileUploadError");
                    console.error("Upload error:", error);
                    context.reportDebugger(error.message);
                    instance.publishState("fileUploadErrorMessage", error.message);
                }
            },
            allowedMimeTypes: allowedMimeTypes,
        }),
    );

    // Store extensions for use by getSelection's generateHTML
    instance.data.editorExtensions = extensions;

    // ── Parse options ────────────────────────────────────────

    const parseOptions = {
        preserveWhitespace: preserveWhitespace,
    };

    // If attribute preservation is enabled, add custom parsing
    if (properties.preserve_html_attributes) {
        parseOptions.transformPastedHTML = (html) => {
            // Pre-process HTML to ensure better attribute preservation
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // Find all div elements and ensure they're properly structured
            const divs = doc.querySelectorAll("div");
            divs.forEach((div) => {
                // Mark divs for preservation
                if (div.hasAttribute("style") || div.hasAttribute("class")) {
                    div.setAttribute("data-preserve-div", "true");
                }
            });

            return doc.body.innerHTML;
        };
    }

    // ── Editor options & callbacks ───────────────────────────

    const options = {
        element: d,
        editable: properties.isEditable,
        content: content,
        extensions: extensions,
        parseOptions: parseOptions,
        injectCSS: true,
        onCreate({ editor }) {
            instance.data.debug("editor created and ready");
            instance.data.editor_is_ready = true;
            instance.triggerEvent("is_ready");
            instance.publishState("is_ready", true);

            instance.publishState("contentHTML", editor.getHTML());
            instance.publishState("contentText", editor.getText());
            instance.publishState("contentJSON", JSON.stringify(instance.data.editor.getJSON()));
            instance.publishState("isEditable", editor.isEditable);
            instance.publishState("is_empty", editor.isEmpty);
            instance.publishState("can_undo", editor.can().undo());
            instance.publishState("can_redo", editor.can().redo());
            if (instance.data.active_nodes.includes("CharacterCount")) {
                instance.publishState("characterCount", editor.storage.characterCount.characters());
                instance.publishState("wordCount", editor.storage.characterCount.words());
            }

            // If collaboration is active, try to set initial content
            if (properties.collab_active && instance.data.maybeSetCollabInitialContent) {
                // Try immediately (in case provider already synced)
                instance.data.maybeSetCollabInitialContent();

                // Poll as a fallback — onSynced may not fire reliably in all providers
                if (instance.data.provider && !instance.data.collabInitialContentSet) {
                    let pollAttempts = 0;
                    const maxAttempts = 50; // 50 * 200ms = 10 seconds
                    instance.data._collabSyncPollInterval = setInterval(() => {
                        pollAttempts++;
                        // Safety: stop polling if provider was destroyed (e.g. auth retry teardown)
                        if (!instance.data.provider) {
                            clearInterval(instance.data._collabSyncPollInterval);
                            instance.data._collabSyncPollInterval = null;
                            return;
                        }
                        const providerSynced = instance.data.provider.synced || instance.data.provider.isSynced;
                        if (providerSynced && !instance.data.collabHasSynced) {
                            instance.data.debug("collab sync detected via polling");
                            instance.data.collabHasSynced = true;
                            instance.publishState("collab_synced", true);
                            instance.triggerEvent("collab_synced");
                        }
                        if (instance.data.collabHasSynced) {
                            instance.data.maybeSetCollabInitialContent();
                        }
                        if (instance.data.collabInitialContentSet || pollAttempts >= maxAttempts) {
                            clearInterval(instance.data._collabSyncPollInterval);
                            instance.data._collabSyncPollInterval = null;
                        }
                    }, 200);
                }
            }
        },
        onUpdate({ editor }) {
            const contentHTML = editor.getHTML();
            instance.publishState("contentHTML", contentHTML);
            instance.publishState("contentText", editor.getText());
            instance.publishState("contentJSON", JSON.stringify(editor.getJSON()));
            instance.publishState("isEditable", editor.isEditable);
            instance.publishState("is_empty", editor.isEmpty);
            instance.publishState("can_undo", editor.can().undo());
            instance.publishState("can_redo", editor.can().redo());
            instance.publishState("characterCount", editor.storage.characterCount.characters());
            instance.publishState("wordCount", editor.storage.characterCount.words());

            if (!instance.data.isProgrammaticUpdate) {
                instance.data.updateContent(contentHTML);
                instance.data.isDebouncingDone = false;
            }
        },
        onFocus({ editor, event }) {
            instance.data.debug("editor focused");
            instance.triggerEvent("isFocused");
            instance.publishState("isFocused", true);
            instance.data.is_focused = true;
        },
        onBlur({ editor, event }) {
            instance.data.debug("editor blurred");
            instance.triggerEvent("isntFocused");
            instance.publishState("isFocused", false);
            instance.data.is_focused = false;
            instance.publishAutobinding(editor.getHTML());
        },
        onTransaction({ editor, transaction }) {
            instance.data.getSelection(editor);
            instance.data.publishActiveStates(editor);
            instance.publishState("is_empty", editor.isEmpty);
            instance.publishState("can_undo", editor.can().undo());
            instance.publishState("can_redo", editor.can().redo());
            instance.publishState("characterCount", editor.storage.characterCount.characters());
            instance.publishState("wordCount", editor.storage.characterCount.words());
        },
        onSelectionUpdate({ editor }) {
            instance.data.getSelection(editor);
            instance.data.publishActiveStates(editor);
        },
    };

    // ── Menu setup ───────────────────────────────────────────

    const menuErrorMessage = " not found. Is the entered id correct? FYI: the Bubble element should default to visible.";

    // Helper: Tiptap v3 uses Floating UI instead of tippy.js for BubbleMenu/FloatingMenu.
    // v3 does NOT initially hide the element (isVisible starts false, so hide() is a no-op).
    // We must hide menu elements ourselves before passing them to the extension.
    function hideMenuElement(el) {
        el.style.visibility = "hidden";
        el.style.opacity = "0";
    }

    if (bubbleMenu && instance.data.active_nodes.includes("BubbleMenu")) {
        // Find all elements with the id matching properties.bubbleMenu
        let bubbleMenuElements = document.querySelectorAll(`#${bubbleMenu}`);

        // If no elements found, log an error
        if (bubbleMenuElements.length === 0) {
            const errorMessage = "BubbleMenu" + menuErrorMessage;
            context.reportDebugger(errorMessage);
            instance.data.debug(errorMessage);
        } else if (bubbleMenuElements.length === 1) {
            // If only one element is found, make that the bubble menu.
            hideMenuElement(bubbleMenuElements[0]);
            options.extensions.push(
                BubbleMenu.configure({
                    element: bubbleMenuElements[0],
                    appendTo: () => document.body,
                }),
            );
        } else if (bubbleMenuElements.length >= 2) {
            // If multiple elements found, try to find the closest and warn the developer
            const errorMessage = `Bubble Menu: found multiple elements with the same ID ${bubbleMenu}. Assuming that the closest one is the correct one. However, the developer should update the code to ensure that the IDs are unique. Tiptap ID: ${instance.data.randomId}.`;
            context.reportDebugger(errorMessage);
            instance.data.debug(errorMessage);
            let bubbleMenuDiv = instance.data.findElement(bubbleMenu);
            hideMenuElement(bubbleMenuDiv);
            options.extensions.push(
                BubbleMenu.configure({
                    element: bubbleMenuDiv,
                    appendTo: () => document.body,
                }),
            );
        }
    }

    if (floatingMenu && instance.data.active_nodes.includes("FloatingMenu")) {
        // Find all elements with the id matching properties.floatingMenu
        let floatingMenuElements = document.querySelectorAll(`#${floatingMenu}`);

        // If no elements found, log an error
        if (floatingMenuElements.length === 0) {
            const errorMessage = "FloatingMenu" + menuErrorMessage;
            context.reportDebugger(errorMessage);
            instance.data.debug(errorMessage);
        } else if (floatingMenuElements.length === 1) {
            // If only one element is found, make that the floating menu.
            hideMenuElement(floatingMenuElements[0]);
            options.extensions.push(
                FloatingMenu.configure({
                    element: floatingMenuElements[0],
                    appendTo: () => document.body,
                }),
            );
        } else if (floatingMenuElements.length >= 2) {
            // If multiple elements found, try to find the closest and warn the developer
            const errorMessage = `Floating Menu: found multiple elements with the same ID ${floatingMenu}. Assuming that the closest one is the correct one. However, the developer should update the code to ensure that the IDs are unique. Tiptap ID: ${instance.data.randomId}.`;
            context.reportDebugger(errorMessage);
            instance.data.debug(errorMessage);
            let floatingMenuDiv = instance.data.findElement(floatingMenu);
            hideMenuElement(floatingMenuDiv);
            options.extensions.push(
                FloatingMenu.configure({
                    element: floatingMenuDiv,
                    appendTo: () => document.body,
                }),
            );
        }
    }

    // ── Collaboration ────────────────────────────────────────

    instance.data.maybeSetupCollaboration(instance, properties, options, extensions);

    // ── Create the editor ────────────────────────────────────

    try {
        instance.data.editor = new Editor(options);
        instance.data.isEditorSetup = true;
        instance.data.debug("editor instance created, waiting for onCreate");
    } catch (error) {
        console.error("[Tiptap] failed trying to create the Editor:", error);
    }
};
