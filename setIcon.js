import { updateIcon, drawWeekIcon } from "./icon-utils.js";

const DEFAULTS = {
    bgColor: "#3a86ff",
    textColor: "#ffffff",
    style: "calendar",
};

const SAVE_DEBOUNCE_MS = 600; // keep storage.sync under 120 writes/min
let saveTimeoutId = null;

function getDefaults() {
    const bgInput = document.getElementById("bgColorPicker");
    const textInput = document.getElementById("textColorPicker");
    return {
        bgColor: bgInput?.value || DEFAULTS.bgColor,
        textColor: textInput?.value || DEFAULTS.textColor,
        style: DEFAULTS.style,
    };
}

function applyColors({ bgColor, textColor }) {
    const bgInput = document.getElementById("bgColorPicker");
    const textInput = document.getElementById("textColorPicker");
    if (bgInput) bgInput.value = bgColor;
    if (textInput) textInput.value = textColor;
}

function applyStyle(style) {
    const buttons = document.querySelectorAll("[data-style]");
    buttons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.style === style);
    });
}

function scheduleSaveColorsAndUpdate(immediate = false) {
    const performSave = async () => {
        const { bgColor, textColor } = getDefaults();
        await new Promise((resolve) => chrome.storage.sync.set({ bgColor, textColor }, resolve));
        renderStylePreviews();
        await updateIcon();
    };

    if (immediate) {
        clearTimeout(saveTimeoutId);
        saveTimeoutId = null;
        performSave();
        return;
    }

    clearTimeout(saveTimeoutId);
    saveTimeoutId = setTimeout(performSave, SAVE_DEBOUNCE_MS);
}

function getIsoWeekNumber(date) {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    return Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);
}

function updatePresetLabels(presets) {
    const week = getIsoWeekNumber(new Date());
    presets.forEach((button) => { button.textContent = String(week); });
}

function renderStylePreviews() {
    const previewCanvases = document.querySelectorAll("[data-style] canvas");
    const { bgColor, textColor } = getDefaults();
    const week = getIsoWeekNumber(new Date());
    previewCanvases.forEach((canvas) => {
        const style = canvas.parentElement?.dataset.style || "calendar";
        const size = canvas.width || 32;
        const ctx = canvas.getContext("2d");
        drawWeekIcon(ctx, size, bgColor, textColor, week, style);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const bgInput = document.getElementById("bgColorPicker");
    const textInput = document.getElementById("textColorPicker");
    const presets = document.querySelectorAll(".preset");
    const styleButtons = document.querySelectorAll("[data-style]");

    chrome.storage.sync.get(DEFAULTS, (values) => {
        applyColors(values);
        applyStyle(values.style);
        renderStylePreviews();
    });

    updatePresetLabels(presets);

    bgInput?.addEventListener("input", () => scheduleSaveColorsAndUpdate(false));
    textInput?.addEventListener("input", () => scheduleSaveColorsAndUpdate(false));
    bgInput?.addEventListener("change", () => scheduleSaveColorsAndUpdate(true));
    textInput?.addEventListener("change", () => scheduleSaveColorsAndUpdate(true));

    presets.forEach((button) => {
        button.addEventListener("click", () => {
            const styles = getComputedStyle(button);
            const bgColor = styles.getPropertyValue("--bg").trim();
            const textColor = styles.getPropertyValue("--text").trim();
            applyColors({
                bgColor: bgColor || getDefaults().bgColor,
                textColor: textColor || getDefaults().textColor,
            });
            scheduleSaveColorsAndUpdate(true);
        });
    });

    styleButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const style = button.dataset.style || "calendar";
            applyStyle(style);
            await new Promise((resolve) => chrome.storage.sync.set({ style }, resolve));
            renderStylePreviews();
            await updateIcon();
        });
    });
});
