browser.runtime.getPlatformInfo().then((info) => {
    if (info.os === 'android') {
        browser.browserAction.onClicked.addListener(async () => {
            try {
                const tab = await browser.tabs.create({ url: browser.runtime.getURL("popup.html") });
                if (!tab) {
                    console.error("Failed to open new tab on Android.");
                }
            } catch (error) {
                console.error("Error opening new tab on Android:", error);
            }
        });
    } else {
        browser.browserAction.onClicked.addListener(() => {
            try {
                browser.browserAction.setPopup({ popup: "popup.html" });
            } catch (error) {
                console.error("Error setting popup on desktop:", error);
            }
        });
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

const CLIENT_ID = '1091885613829-sgj5utgcfmfq6553ve3ca95nmtkfvdui.apps.googleusercontent.com';
const REDIRECT_URI = browser.identity.getRedirectURL();
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
let accessToken = null;
let tokenExpiry = null;
const FOLDER_NAME = 'Link Collection Manager';

function createAuthUrl() {
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('response_type', 'token');
    params.append('scope', SCOPES);

    return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
}

async function authorize() {
    const authUrl = createAuthUrl();

    const redirectUrl = await browser.identity.launchWebAuthFlow({
        interactive: true,
        url: authUrl
    });

    const url = new URL(redirectUrl);
    const params = new URLSearchParams(url.hash.substring(1)); // Get params from hash

    accessToken = params.get('access_token');
    tokenExpiry = Date.now() + parseInt(params.get('expires_in'), 10) * 1000;

    return accessToken;
}

function isTokenValid() {
    return accessToken && tokenExpiry && Date.now() < tokenExpiry;
}

async function getFolderId() {
    const query = `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
        headers: new Headers({
            'Authorization': 'Bearer ' + accessToken
        })
    });

    const files = await response.json();
    if (files.files.length > 0) {
        return files.files[0].id;
    } else {
        const folderMetadata = {
            name: FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder'
        };

        const folderResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(folderMetadata)
        });

        const folderData = await folderResponse.json();
        return folderData.id;
    }
}

async function uploadToDrive(fileContent, fileName) {
    if (!isTokenValid()) {
        await authorize();
    }

    const folderId = await getFolderId();

    const metadata = {
        name: fileName,
        mimeType: 'application/json',
        parents: [folderId]  // This ensures the file is saved inside the folder
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
        body: form
    });

    return await response.json();
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'exportDrive') {
        uploadToDrive(message.fileContent, message.fileName)
            .then(response => {
                console.log('File uploaded:', response);
                sendResponse({ success: true, response });
            })
            .catch(error => {
                console.error('Error uploading file:', error);
                sendResponse({ success: false, error });
            });
        return true; // Keep the message channel open for async response
    }
});

