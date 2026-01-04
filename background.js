import { updateIcon } from "./icon-utils.js";

const triggerUpdate = () => {
    updateIcon();
};

chrome.runtime.onInstalled.addListener(updateIcon);
chrome.runtime.onStartup.addListener(updateIcon);

chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId !== chrome.windows.WINDOW_ID_NONE) {
        updateIcon();
    }
});

chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "updateIcon") {
        updateIcon();
    }
});

triggerUpdate();
