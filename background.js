import { updateIcon } from "./icon-utils.js";

const triggerUpdate = () => {
    updateIcon();
};

chrome.runtime.onInstalled.addListener(triggerUpdate);
chrome.runtime.onStartup.addListener(triggerUpdate);
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId !== chrome.windows.WINDOW_ID_NONE) triggerUpdate();
});
chrome.tabs.onActivated.addListener(triggerUpdate);
chrome.tabs.onUpdated.addListener((_, info) => {
    if (info.status === "complete") triggerUpdate();
});

chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "updateIcon") triggerUpdate();
});

triggerUpdate();
