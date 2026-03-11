# Implementation Plan: Editor Rebuild on Document ID Change

## Overview

When the collaborative document ID (`collab_doc_id`) changes, the editor must be completely rebuilt with a new HocuspocusProvider connected to the new document. This requires proper teardown of existing resources to prevent memory leaks and zombie connections.

## Key Findings

### Menu DIV Reuse Analysis

**Question:** If we teardown the provider and the editor has a bubble or floating menu, will that destroy those menu divs OR will the rebuilt editor be able to reuse them?

**Answer:** The rebuilt editor **CAN reuse the menu divs**. Here's why:

1. Menu elements are Bubble.io elements, not created by Tiptap
2. When `editor.destroy()` is called, the BubbleMenu/FloatingMenu plugins call `destroy()` which:
   - Hides the element (sets `visibility: hidden`, `opacity: 0`)
   - Calls `element.remove()` (detaches from DOM but doesn't delete)
   - Removes event listeners
3. The element still exists in Bubble's DOM tree (just detached from its parent)
4. When `setupEditor()` runs again, it queries `document.querySelectorAll('#${bubbleMenu}')` and finds the same element
5. The `hideMenuElement()` helper already sets the same hidden styles, so no conflict

**No special handling needed** - the existing `setupEditor()` menu logic will work correctly on rebuild.

---

## Implementation Steps

### Step 1: Track the Current Document ID

**File:** `src/elements/tiptap-AAC/initialize.js`

Add storage for the current document ID after editor setup completes:

```javascript
// Inside setupEditor(), after instance.data.isEditorSetup = true;
instance.data._currentCollabDocId = properties.collab_doc_id;
```

### Step 2: Create Teardown Helper Function

**File:** `src/elements/tiptap-AAC/initialize.js`

Create a reusable teardown function (can be extracted from existing `handleCollabAuthFailure`):

```javascript
// Add after the handleCollabAuthFailure function definition (~line 601)

instance.data.teardownEditor = function (reason) {
    instance.data.debug("tearing down editor:", reason);

    // Clear the collab sync polling interval
    if (instance.data._collabSyncPollInterval) {
        clearInterval(instance.data._collabSyncPollInterval);
        instance.data._collabSyncPollInterval = null;
    }

    // Clear any pending collab retry timer
    if (instance.data._collabRetryTimer) {
        clearTimeout(instance.data._collabRetryTimer);
        instance.data._collabRetryTimer = null;
    }

    // Clear debounce timeout
    if (instance.data.debounceTimeout) {
        clearTimeout(instance.data.debounceTimeout);
        instance.data.debounceTimeout = null;
    }

    // Tear down provider (if in collab mode)
    if (instance.data.provider) {
        try {
            instance.data.provider.destroy();
        } catch (e) {
            instance.data.debug("error destroying provider:", e);
        }
        instance.data.provider = null;
    }

    // Tear down editor
    if (instance.data.editor) {
        try {
            instance.data.editor.destroy();
        } catch (e) {
            instance.data.debug("error destroying editor:", e);
        }
        instance.data.editor = null;
    }

    // Remove the editor DOM element so setupEditor can recreate it
    const editorEl = document.getElementById(instance.data.tiptapEditorID);
    if (editorEl) editorEl.remove();

    // Reset collab state
    instance.data.collabHasSynced = false;
    instance.data.collabInitialContentSet = false;
    instance.data._collabRetryCount = 0;
    instance.data._collabRetryPending = false;
    instance.data._currentCollabDocId = null;

    // Reset flags for re-initialization
    instance.data.isEditorSetup = false;
    instance.data.editor_is_ready = false;

    // Publish states - reset to initial values (see initialize.js:19-25)
    instance.publishState("is_ready", false);
    instance.publishState("is_empty", true);
    instance.publishState("can_undo", false);
    instance.publishState("can_redo", false);
    instance.publishState("collab_synced", false);
    instance.publishState("collab_connected_users", 0);
    instance.data.publishCollabStatus("disconnected");
};
```

### Step 3: Refactor handleCollabAuthFailure to Use Shared Teardown

**File:** `src/elements/tiptap-AAC/initialize.js`

Modify `handleCollabAuthFailure` to use the new `teardownEditor` function:

```javascript
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
            " attempts. Giving up.";
        instance.data.debug(giveUpMsg);
        context.reportDebugger(giveUpMsg);
        return;
    }

    // Use shared teardown
    instance.data.teardownEditor("collab auth failure, attempt " + attempt);

    // Schedule retry with exponential backoff
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
```

### Step 4: Add Document ID Change Detection in update.js

**File:** `src/elements/tiptap-AAC/update.js`

Add detection logic after the existing collab prerequisite checks (~after line 43):

```javascript
// Detect collab_doc_id change and rebuild editor if needed
if (
    instance.data.editor_is_ready &&
    properties.collab_active &&
    instance.data._currentCollabDocId &&
    properties.collab_doc_id &&
    instance.data._currentCollabDocId !== properties.collab_doc_id
) {
    instance.data.debug(
        "collab_doc_id changed from",
        instance.data._currentCollabDocId,
        "to",
        properties.collab_doc_id,
        "— rebuilding editor"
    );

    // Trigger the document change event before teardown
    instance.triggerEvent("collab_doc_changed");

    // Teardown the current editor
    instance.data.teardownEditor("collab_doc_id changed");

    // The next update cycle (or continuation of this one) will re-setup
    // because isEditorSetup is now false
}

// First run: set up the editor (defined in initialize.js)
// ...existing code...
```

### Step 5: Add New Event for Document Change

**File:** `src/elements/tiptap-AAC/AAC.json`

Add a new event to notify Bubble when the document changes:

```json
"collab_doc_changed": {
    "caption": "Collaboration document changed",
    "name": "collab_doc_changed"
}
```

### Step 6: Update reset.js for Complete Cleanup

**File:** `src/elements/tiptap-AAC/reset.js`

Enhance reset to use the new teardown function:

```javascript
if (instance.data.debug) {
    instance.data.debug("reset running");
}

// Use the teardown function if available
if (instance.data.teardownEditor) {
    instance.data.teardownEditor("element reset");
} else {
    // Fallback for legacy cleanup
    if (instance.data._collabRetryTimer) {
        clearTimeout(instance.data._collabRetryTimer);
        instance.data._collabRetryTimer = null;
    }
    if (instance.data._collabSyncPollInterval) {
        clearInterval(instance.data._collabSyncPollInterval);
        instance.data._collabSyncPollInterval = null;
    }
}
```

---

## Edge Cases to Handle

1. **Document ID changes while connecting:** If the doc ID changes during initial connection, the teardown should still work correctly.

2. **Rapid document ID changes:** The debounce/update mechanism in Bubble should naturally coalesce rapid changes, but the teardown is idempotent.

3. **Empty document ID:** Already handled by existing prerequisite check (lines 19-25 in update.js).

4. **Non-collab mode:** The change detection only triggers when `properties.collab_active` is true.

5. **Same document ID:** The comparison ensures we only rebuild on actual changes.

---

## Testing Checklist

- [ ] Change `collab_doc_id` while editor is active - editor should rebuild
- [ ] Verify BubbleMenu still works after rebuild
- [ ] Verify FloatingMenu still works after rebuild
- [ ] Verify collab sync states are reset correctly
- [ ] Verify provider connection closes cleanly (check network tab)
- [ ] Verify new provider connects to correct document
- [ ] Test rapid document ID changes
- [ ] Test changing from empty doc ID to valid doc ID
- [ ] Verify `collab_doc_changed` event fires

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/elements/tiptap-AAC/initialize.js` | Add `teardownEditor()` helper, track `_currentCollabDocId`, refactor `handleCollabAuthFailure` |
| `src/elements/tiptap-AAC/update.js` | Add document ID change detection logic |
| `src/elements/tiptap-AAC/reset.js` | Update to use new teardown function |
| `src/elements/tiptap-AAC/AAC.json` | Add `collab_doc_changed` event |
