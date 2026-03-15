/**
 * Vendored and patched version of tiptap-extension-resizable
 * Original: https://www.npmjs.com/package/tiptap-extension-resizable
 *
 * PATCH: Fixed image resize not persisting after page refresh.
 * The original extension directly mutated node.attrs.width which doesn't
 * create a ProseMirror transaction. Now uses editor.chain().updateAttributes()
 * on mouseup to properly persist the width change.
 */
import { Extension } from "@tiptap/core";
import throttle from "lodash-es/throttle";

export default Extension.create({
  name: "resizable",
  priority: 1000,
  addOptions() {
    return {
      types: ["image"],
      handlerStyle: {
        width: "8px",
        height: "8px",
        background: "#07c160",
      },
      layerStyle: {
        border: "2px solid #07c160",
      },
    };
  },

  addStorage() {
    return {
      resizeElement: null,
      resizeNode: null,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          width: {
            default: null,
            parseHTML: (element) => element.style.width,
            renderHTML: (attributes) => {
              if (!attributes.width) return {};
              return { style: `width: ${attributes.width}` };
            },
          },
        },
      },
    ];
  },

  onCreate({ editor }) {
    const element = editor.options.element;
    element.style.position = "relative";

    // Initialize resizeLayer
    const resizeLayer = document.createElement("div");
    resizeLayer.className = "resize-layer";
    resizeLayer.style.display = "none";
    resizeLayer.style.position = "absolute";
    // Set styles
    Object.entries(this.options.layerStyle).forEach(([key, value]) => {
      resizeLayer.style[key] = value;
    });
    // Event handling
    resizeLayer.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const resizeElement = this.storage.resizeElement;
      const resizeNode = this.storage.resizeNode;
      if (!resizeElement) return;
      if (/bottom/.test(e.target.className)) {
        let startX = e.screenX;
        const dir = e.target.classList.contains("bottom-left") ? -1 : 1;
        const mousemoveHandle = (e) => {
          const width = resizeElement.clientWidth;
          const distanceX = e.screenX - startX;
          const total = width + dir * distanceX;
          // Update visual width during drag
          resizeElement.style.width = total + "px";
          // resizeLayer
          const clientWidth = resizeElement.clientWidth;
          const clientHeight = resizeElement.clientHeight;
          const pos = getRelativePosition(resizeElement, element);
          resizeLayer.style.top = pos.top + "px";
          resizeLayer.style.left = pos.left + "px";
          resizeLayer.style.width = clientWidth + "px";
          resizeLayer.style.height = clientHeight + "px";
          startX = e.screenX;
        };
        document.addEventListener("mousemove", mousemoveHandle);
        document.addEventListener("mouseup", () => {
          document.removeEventListener("mousemove", mousemoveHandle);
          // Persist the width via proper ProseMirror transaction
          const finalWidth = resizeElement.style.width;
          if (finalWidth) {
            editor.chain().updateAttributes('image', { width: finalWidth }).run();
          }
        });
      }
    });
    // Handlers
    const handlers = ["top-left", "top-right", "bottom-left", "bottom-right"];
    const fragment = document.createDocumentFragment();
    for (let name of handlers) {
      const item = document.createElement("div");
      item.className = `handler ${name}`;
      item.style.position = "absolute";
      Object.entries(this.options.handlerStyle).forEach(([key, value]) => {
        item.style[key] = value;
      });
      const dir = name.split("-");
      item.style[dir[0]] = parseInt(item.style.width) / -2 + "px";
      item.style[dir[1]] = parseInt(item.style.height) / -2 + "px";
      if (name === "bottom-left") item.style.cursor = "sw-resize";
      if (name === "bottom-right") item.style.cursor = "se-resize";
      fragment.appendChild(item);
    }
    resizeLayer.appendChild(fragment);
    editor.resizeLayer = resizeLayer;
    element.appendChild(resizeLayer);
  },

  onTransaction: throttle(function ({ editor }) {
    const resizeLayer = editor.resizeLayer;
    if (resizeLayer && resizeLayer.style.display === "block") {
      const dom = this.storage.resizeElement;
      const element = editor.options.element;
      const pos = getRelativePosition(dom, element);
      resizeLayer.style.top = pos.top + "px";
      resizeLayer.style.left = pos.left + "px";
      resizeLayer.style.width = dom.clientWidth + "px";
      resizeLayer.style.height = dom.clientHeight + "px";
    }
  }, 240),

  onSelectionUpdate: function ({ editor, transaction }) {
    const element = editor.options.element;
    const node = transaction.curSelection.node;
    const resizeLayer = editor.resizeLayer;
    // When selecting a resizable node
    if (node && this.options.types.includes(node.type.name)) {
      // resizeLayer position and size
      resizeLayer.style.display = "block";
      let dom = editor.view.domAtPos(transaction.curSelection.from).node;
      dom = dom.querySelector(".ProseMirror-selectednode");
      this.storage.resizeElement = dom;
      this.storage.resizeNode = node;
      const pos = getRelativePosition(dom, element);
      resizeLayer.style.top = pos.top + "px";
      resizeLayer.style.left = pos.left + "px";
      resizeLayer.style.width = dom.clientWidth + "px";
      resizeLayer.style.height = dom.clientHeight + "px";
    } else {
      resizeLayer.style.display = "none";
    }
  },
});

// Calculate relative position
function getRelativePosition(element, ancestor) {
  const elementRect = element.getBoundingClientRect();
  const ancestorRect = ancestor.getBoundingClientRect();
  const relativePosition = {
    top: parseInt(elementRect.top - ancestorRect.top + ancestor.scrollTop),
    left: parseInt(elementRect.left - ancestorRect.left + ancestor.scrollLeft),
  };
  return relativePosition;
}
