function getDefaultColors() {
    const bgInput = document.getElementById("bgColorPicker");
    const textInput = document.getElementById("textColorPicker");

    return {
        bgColor: bgInput?.value || "#ffffff",
        textColor: textInput?.value || "#000000",
    };
}

function applyColors({ bgColor, textColor }) {
    const bgInput = document.getElementById("bgColorPicker");
    const textInput = document.getElementById("textColorPicker");

    if (bgInput) bgInput.value = bgColor;
    if (textInput) textInput.value = textColor;
}

function saveAndUpdate() {
    const { bgColor, textColor } = getDefaultColors();

    chrome.storage.sync.set({ bgColor, textColor }, () => {
        chrome.runtime.sendMessage({ type: "updateIcon" });
    });
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
    const label = String(week);
    presets.forEach((button) => {
        button.textContent = label;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const bgInput = document.getElementById("bgColorPicker");
    const textInput = document.getElementById("textColorPicker");
    const presets = document.querySelectorAll(".preset");

    chrome.storage.sync.get(getDefaultColors(), (values) => {
        applyColors(values);
    });

    updatePresetLabels(presets);

    bgInput?.addEventListener("input", saveAndUpdate);
    textInput?.addEventListener("input", saveAndUpdate);
    bgInput?.addEventListener("change", saveAndUpdate);
    textInput?.addEventListener("change", saveAndUpdate);

    presets.forEach((button) => {
        button.addEventListener("click", () => {
            const styles = getComputedStyle(button);
            const bgColor = styles.getPropertyValue("--bg").trim();
            const textColor = styles.getPropertyValue("--text").trim();

            applyColors({
                bgColor: bgColor || getDefaultColors().bgColor,
                textColor: textColor || getDefaultColors().textColor,
            });

            saveAndUpdate();
        });
    });
});
