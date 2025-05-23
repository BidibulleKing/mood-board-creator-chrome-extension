chrome.runtime.onInstalled.addListener(init);
chrome.contextMenus.onClicked.addListener(handleContextClick);

function handleContextClick(info, tab) {
    if (info.menuItemId === "imageContext") {
        const imageUrl = info.srcUrl;

        // save the image URL to local storage
        chrome.storage.local.get(["moodBoard"], function (result) {
            const moodBoard = result.moodBoard || [];
            if (moodBoard.includes(imageUrl)) {
                return;
            }

            moodBoard.push(imageUrl);
            chrome.storage.local.set({ moodBoard: moodBoard });
        });
    }
}

function init() {
    chrome.storage.local.set({ moodBoard: [] });
    chrome.contextMenus.create({
        id: "imageContext",
        title: "Add image to mood board",
        contexts: ["image"],
    });
}
