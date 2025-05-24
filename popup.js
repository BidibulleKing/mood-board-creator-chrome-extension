document.addEventListener("DOMContentLoaded", init);

function init() {
    loadThumbnails();

    document.getElementById("clear").addEventListener("click", clearMoodBoard);
    document.getElementById("save").addEventListener("click", saveMoodBoard);
}

function loadThumbnails() {
    chrome.storage.local.get(["moodBoard"], function (result) {
        const moodBoard = result.moodBoard || [];
        const container = document.getElementById("thumbnails");
        container.innerHTML = "";
        moodBoard.forEach((url) => {
            const thumbnail = document.createElement("div");
            thumbnail.className = "thumbnail";

            const cross = document.createElement("span");
            cross.textContent = "✖";
            cross.className = "cross";
            cross.addEventListener("click", () => {
                chrome.storage.local.get(["moodBoard"], function (result) {
                    const updatedMoodBoard = result.moodBoard.filter(
                        (item) => item !== url
                    );
                    chrome.storage.local.set({ moodBoard: updatedMoodBoard });
                    loadThumbnails();
                });
            });
            thumbnail.appendChild(cross);

            const img = document.createElement("img");
            img.src = url;
            img.addEventListener("click", () => {
                window.open(url, "_blank");
            });
            thumbnail.appendChild(img);

            container.appendChild(thumbnail);
        });
    });
}

function clearMoodBoard() {
    chrome.storage.local.set({ moodBoard: [] });
    loadThumbnails();
}

async function saveMoodBoard() {
    const containerWidth = 1920;
    const targetRowHeight = 400;
    const spacing = 10;

    const imageUrls = await new Promise((resolve) => {
        chrome.storage.local.get(["moodBoard"], function (result) {
            const moodBoard = result.moodBoard || [];
            resolve(moodBoard);
        });
    });
    if (!imageUrls.length) console.error("No image found.");

    const loadImage = (url) =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () =>
                resolve({
                    img,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                });
            img.onerror = reject;
            img.src = url;
        });

    const imageData = await Promise.all(imageUrls.map(loadImage));

    // generate the layout
    const sizes = imageData.map(({ width, height }) => ({ width, height }));
    const justifiedLayout = require("justified-layout");
    const layout = justifiedLayout(sizes, {
        containerWidth,
        targetRowHeight,
        boxSpacing: spacing,
        targetRowHeightTolerance: 0.1,
    });

    const canvas = document.createElement("canvas");
    canvas.width = containerWidth;
    canvas.height = layout.containerHeight;
    const ctx = canvas.getContext("2d");

    // draw the images
    layout.boxes.forEach((box, i) => {
        const { top, left, width, height } = box;
        ctx.drawImage(imageData[i].img, left, top, width, height);
    });

    // download the jpeg mood board
    const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const link = document.createElement("a");
    link.href = jpgDataUrl;
    link.download = "moodboard.jpg";
    link.click();
}
