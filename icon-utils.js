function getIsoWeekNumber(date) {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    return Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);
}

export function drawWeekIcon(ctx, size, bgColor, textColor, week, style = "calendar") {
    ctx.clearRect(0, 0, size, size);

    const drawCalendar = () => {
        const radius = Math.round(size * 0.12);
        const headerCut = Math.round(size * 0.16);
        const borderWidth = Math.max(1, Math.round(size * 0.05));

        const hangerWidth = Math.max(2, Math.round(size * 0.16));
        const hangerHeight = Math.max(3, Math.round(size * 0.22));
        const hangerTop = Math.max(0, Math.round(size * 0.02));
        const hangerBorder = Math.max(1, Math.round(size * 0.05));

        const leftHangerX = Math.round(size * 0.30 - hangerWidth / 2);
        const rightHangerX = Math.round(size * 0.70 - hangerWidth / 2);

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

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = borderWidth;
        ctx.stroke();

        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillRect(0, 0, size, headerCut);
        ctx.restore();

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(leftHangerX, hangerTop, hangerWidth, hangerHeight);
        ctx.fillRect(rightHangerX, hangerTop, hangerWidth, hangerHeight);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = hangerBorder;
        ctx.strokeRect(leftHangerX, hangerTop, hangerWidth, hangerHeight);
        ctx.strokeRect(rightHangerX, hangerTop, hangerWidth, hangerHeight);
    };

    const drawRounded = () => {
        const radius = Math.round(size * 0.14);
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
    };

    if (style === "calendar") {
        drawCalendar();
    } else if (style === "rounded") {
        drawRounded();
    }

    // Week number
    ctx.fillStyle = textColor;
    const fontSize =
        style === "plain"
            ? (week >= 10 ? Math.round(size * 0.74) : Math.round(size * 0.82))
            : (week >= 10 ? Math.round(size * 0.60) : Math.round(size * 0.68));
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textY =
        style === "calendar"
            ? Math.round(size * 0.64)
            : Math.round(size * 0.55);
    ctx.fillText(String(week), size / 2, textY);
}

function renderWeekIcon(week, size, bgColor, textColor, style = "calendar") {
    let canvas = null;
    if (typeof OffscreenCanvas !== "undefined") {
        canvas = new OffscreenCanvas(size, size);
    } else if (typeof document !== "undefined") {
        canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
    } else {
        throw new Error("No canvas implementation available");
    }
    const ctx = canvas.getContext("2d");
    drawWeekIcon(ctx, size, bgColor, textColor, week, style);
    return ctx.getImageData(0, 0, size, size);
}



export async function updateIcon() {
    const { bgColor, textColor, style } = await chrome.storage.sync.get({
        bgColor: "#3a86ff",
        textColor: "#ffffff",
        style: "calendar",
    });

    const week = getIsoWeekNumber(new Date());
    const imageData = {
        16: renderWeekIcon(week, 16, bgColor, textColor, style),
        32: renderWeekIcon(week, 32, bgColor, textColor, style),
    };

    try {
        await chrome.action.setIcon({ imageData });
    } catch (error) {
        console.warn("setIcon error:", error?.message || error);
    }
}
