import { updateIcon } from "./icon-utils.js";

const ALARM_NAME = "weeklyIconRefresh";
const ALARM_PERIOD_MIN = 45;

async function ensureAlarm() {
    const existing = await chrome.alarms.get(ALARM_NAME);
    if (!existing || existing.periodInMinutes !== ALARM_PERIOD_MIN) {
        if (existing) {
            await chrome.alarms.clear(ALARM_NAME);
        }
        chrome.alarms.create(ALARM_NAME, {
            delayInMinutes: 1,
            periodInMinutes: ALARM_PERIOD_MIN,
        });
    }
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
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

chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "updateIcon") {
        updateIcon();
    }
});

ensureAlarm();
updateIcon();
