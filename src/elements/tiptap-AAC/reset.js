if (instance.data.debug) {
    instance.data.debug("reset running");
}
// Clean up any pending collab retry timer
if (instance.data._collabRetryTimer) {
    clearTimeout(instance.data._collabRetryTimer);
    instance.data._collabRetryTimer = null;
}
// Clean up collab sync polling interval
if (instance.data._collabSyncPollInterval) {
    clearInterval(instance.data._collabSyncPollInterval);
    instance.data._collabSyncPollInterval = null;
}