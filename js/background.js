browser.runtime.getPlatformInfo().then((info) => {
    if (info.os === 'android') {
        browser.browserAction.onClicked.addListener(() => {
            browser.tabs.create({ url: browser.runtime.getURL("popup.html") });
        });
    } else {
        browser.browserAction.setPopup({ popup: "popup.html" });
    }
});

// Create a context menu item
browser.menus.create({
    id: "tab-collection-copy-links",
    title: "Copy all Tab Links",
    contexts: ["all"], // Show the context menu on all contexts (page, selection, link, etc.)
    icons: {
        "16": "icons/icon-16.png",
        "32": "icons/icon-32.png",
        "48": "icons/icon-48.png"
    }
});

// Add a click handler for the context menu
browser.menus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "tab-collection-copy-links") {
        // Get all open tabs
        browser.tabs.query({}).then(tabs => {
            // Extract the URLs and join them with a newline
            const tabLinks = tabs.map(t => t.url).join('\n');

            // Copy the URLs to the clipboard using the Clipboard API
            navigator.clipboard.writeText(tabLinks).then(() => {
            }).catch(err => {
                console.error("Failed to copy tab links to clipboard: ", err);
            });
        });
    }
});
