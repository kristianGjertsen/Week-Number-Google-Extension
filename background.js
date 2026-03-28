import { updateIcon } from "./icon-utils.js";


async function ensureAlarm() {
    const existing = await chrome.alarms.get("weeklyIconRefresh");
    if (!existing) {
        chrome.alarms.create("weeklyIconRefresh", {
            delayInMinutes: 1,
            periodInMinutes: 60,
        });
    }
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "weeklyIconRefresh") {
        updateIcon();
    }
});

chrome.runtime.onInstalled.addListener(() => {
    ensureAlarm();
    updateIcon();
});

chrome.runtime.onStartup.addListener(() => {
    ensureAlarm();
    updateIcon();
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId !== chrome.windows.WINDOW_ID_NONE) {
        updateIcon();
    }
});

chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "updateIcon") {
        updateIcon();
    }
});

ensureAlarm();
updateIcon();