import { Editor, mergeAttributes, generateHTML, Extension, Node } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

import Heading from "@tiptap/extension-heading";
window.tiptapHeading = Heading;

import Bold from "@tiptap/extension-bold";
window.tiptapBold = Bold;

import Code from "@tiptap/extension-code";
window.tiptapCode = Code;

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
window.tiptapCodeBlockLowlight = CodeBlockLowlight;

// import { lowlight } from 'lowlight';
// window.tiptapLowlight = lowlight;

import Italic from "@tiptap/extension-italic";
window.tiptapItalic = Italic;

import Strike from "@tiptap/extension-strike";
window.tiptapStrike = Strike;

import Dropcursor from "@tiptap/extension-dropcursor";
window.tiptapDropcursor = Dropcursor;

import Gapcursor from "@tiptap/extension-gapcursor";
window.tiptapGapcursor = Gapcursor;

import History from "@tiptap/extension-history";
window.tiptapHistory = History;

import Blockquote from "@tiptap/extension-blockquote";
window.tiptapBlockquote = Blockquote;

import BulletList from "@tiptap/extension-bullet-list";
window.tiptapBulletList = BulletList;

import CodeBlock from "@tiptap/extension-code-block";
window.tiptapCodeBlock = CodeBlock;

import HorizontalRule from "@tiptap/extension-horizontal-rule";
window.tiptapHorizontalRule = HorizontalRule;

import ListItem from "@tiptap/extension-list-item";
window.tiptapListItem = ListItem;

import OrderedList from "@tiptap/extension-ordered-list";
window.tiptapOrderedList = OrderedList;

import CharacterCount from "@tiptap/extension-character-count";
window.tiptapCharacterCount = CharacterCount;

import Youtube from "@tiptap/extension-youtube";
window.tiptapYoutube = Youtube;

import Underline from "@tiptap/extension-underline";
window.tiptapUnderline = Underline;

import { TableKit } from "@tiptap/extension-table";

import Image from "@tiptap/extension-image";
// import Resizable from "@tiptap/extension-resizable";

import Link from "@tiptap/extension-link";
window.tiptapLink = Link;

import TaskList from "@tiptap/extension-task-list";
window.tiptapTaskList = TaskList;

import TaskItem from "@tiptap/extension-task-item";
window.tiptapTaskItem = TaskItem;

import Placeholder from "@tiptap/extension-placeholder";
window.tiptapPlaceholder = Placeholder;

import BubbleMenu from "@tiptap/extension-bubble-menu";
window.tiptapBubbleMenu = BubbleMenu;

import FloatingMenu from "@tiptap/extension-floating-menu";
window.tiptapFloatingMenu = FloatingMenu;

import TextAlign from "@tiptap/extension-text-align";
window.tiptapTextAlign = TextAlign;

import Highlight from "@tiptap/extension-highlight";
window.tiptapHighlight = Highlight;

import Mention from "@tiptap/extension-mention";
window.tiptapMention = Mention;

import Suggestion from "@tiptap/suggestion";
window.tiptapSuggestion = Suggestion;

import FontFamily from "@tiptap/extension-font-family";

import { TextStyle } from "@tiptap/extension-text-style";

import Color from "@tiptap/extension-color";

import tippy from "tippy.js";
window.tiptapTippy = tippy;

import FileHandler from "@tiptap/extension-file-handler";

import UniqueID from "@tiptap/extension-unique-id";

// Collab libraries

import Collaboration from "@tiptap/extension-collaboration";
window.tiptapCollaboration = Collaboration;

// import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
// window.tiptapCollaborationCursor = CollaborationCursor;
import CollaborationCaret from "@tiptap/extension-collaboration-caret";

import { HocuspocusProvider as TiptapCollabProvider } from "@hocuspocus/provider";
window.tiptapCollabProvider = TiptapCollabProvider;

import { HocuspocusProvider } from "@hocuspocus/provider";
window.tiptapHocuspocusProvider = HocuspocusProvider;

import * as Y from "yjs";
window.tiptapY = Y;

import { createClient } from "@liveblocks/client";
window.tiptapCreateClient = createClient;

import { LiveblocksYjsProvider as LiveblocksProvider } from "@liveblocks/yjs";
window.tiptapLiveblocksProvider = LiveblocksProvider;

window.tiptap = {
    Editor,
    Node,
    Extension,
    mergeAttributes,
    Document,
    HardBreak,
    Paragraph,
    Text,
    FontFamily,
    Color,
    TextStyle,
    FileHandler,
    generateHTML,
    UniqueID,
    Image,
    // Resizable,
    TableKit,
    CollaborationCaret,
};
