function getIsoWeekNumber(date) {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    return Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);
}

function renderWeekIcon(week, size, bgColor, textColor) {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d");

    // ---------- PROPORSJONER ----------
    const radius = Math.round(size * 0.12);
    const headerCut = Math.round(size * 0.16);
    const borderWidth = Math.max(1, Math.round(size * 0.05));

    const hangerWidth = Math.max(2, Math.round(size * 0.16));
    const hangerHeight = Math.max(3, Math.round(size * 0.22));
    const hangerTop = Math.max(0, Math.round(size * 0.02));
    const hangerBorder = Math.max(1, Math.round(size * 0.05));

    const leftHangerX = Math.round(size * 0.30 - hangerWidth / 2);
    const rightHangerX = Math.round(size * 0.70 - hangerWidth / 2);

    // ---------- KALENDER-KROPP (rounded rect) ----------
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();

    ctx.fillStyle = bgColor;
    ctx.fill();

    // Valgfri outline
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = borderWidth;
    ctx.stroke();

    // ---------- HELT ÅPEN TOPP ----------
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillRect(0, 0, size, headerCut);
    ctx.restore();

    // ---------- TYDELIGE HENGLER ----------
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(leftHangerX, hangerTop, hangerWidth, hangerHeight);
    ctx.fillRect(rightHangerX, hangerTop, hangerWidth, hangerHeight);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = hangerBorder;
    ctx.strokeRect(leftHangerX, hangerTop, hangerWidth, hangerHeight);
    ctx.strokeRect(rightHangerX, hangerTop, hangerWidth, hangerHeight);


    // ---------- UKENUMMER ----------
    ctx.fillStyle = textColor;
    ctx.font =
        week >= 10
            ? `bold ${Math.round(size * 0.60)}px system-ui, sans-serif`
            : `bold ${Math.round(size * 0.68)}px system-ui, sans-serif`;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
        String(week),
        size / 2,
        Math.round(size * 0.64)
    );

    return ctx.getImageData(0, 0, size, size);
}



export async function updateIcon() {
    if (typeof OffscreenCanvas === "undefined") {
        console.warn("OffscreenCanvas not available");
        return;
    }

    const { bgColor, textColor } = await chrome.storage.sync.get({
        bgColor: "#3a86ff",
        textColor: "#ffffff",
    });

    const week = getIsoWeekNumber(new Date());
    const imageData = {
        16: renderWeekIcon(week, 16, bgColor, textColor),
        32: renderWeekIcon(week, 32, bgColor, textColor),
    };

    try {
        await chrome.action.setIcon({ imageData });
    } catch (error) {
        console.warn("setIcon error:", error?.message || error);
    }
}
