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

async function authenticate() {
    const clientId = '1091885613829-sgj5utgcfmfq6553ve3ca95nmtkfvdui.apps.googleusercontent.com';
    const redirectUri = browser.identity.getRedirectURL();
    const scopes = 'https://www.googleapis.com/auth/drive.file';
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

    try {
        const redirectUrl = await browser.identity.launchWebAuthFlow({
            interactive: true,
            url: authUrl
        });

        const params = new URL(redirectUrl).hash.substring(1);
        const tokenInfo = new URLSearchParams(params);
        const accessToken = tokenInfo.get('access_token');
        const expiryTime = Date.now() + parseInt(tokenInfo.get('expires_in')) * 1000;

        // Store token and expiry time
        await browser.storage.local.set({ accessToken, expiryTime });
        return accessToken;
    } catch (error) {
        console.error('Authentication failed:', error);
        throw new Error('Authentication failed');
    }
}

async function getAccessToken() {
    const result = await browser.storage.local.get(['accessToken', 'expiryTime']);
    const { accessToken, expiryTime } = result;

    if (accessToken && expiryTime > Date.now()) {
        // Token is valid
        return accessToken;
    } else {
        // Token is invalid or expired, re-authenticate
        return authenticate();
    }
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getAccessToken') {
        console.log('Received message to get access token');

        getAccessToken()
            .then((token) => {
                console.log('Sending Access Token:', token);
                sendResponse({ token }); // Send the token as an object
            })
            .catch((error) => {
                console.error('Error getting access token:', error);
                sendResponse({ token: null }); // Send null if there's an error
            });

        return true; // Keeps the message channel open for sendResponse
    }
});





async function uploadFileToDrive(accessToken, fileContent) {
    const metadata = {
        name: 'collections.json',
        mimeType: 'application/json'
    };

    console.log(accessToken);

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', new Blob([fileContent], { type: 'application/json' }));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to upload file to Google Drive');
    }

    const data = await response.json();
    return data;
}

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'uploadFileToDrive') {
        try {
            const result = await uploadFileToDrive(message.accessToken, message.fileContent);
            sendResponse({ success: true, result });
        } catch (error) {
            console.error('Error uploading file:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true; // Keep the message channel open for async response
    }
});

async function downloadFileFromDrive(accessToken, fileId) {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const fileContent = await response.json();
    return fileContent;
}

async function listFilesInAppDataFolder(accessToken) {
    const response = await fetch('https://www.googleapis.com/drive/v3/files?q=\'appDataFolder\' in parents', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const files = await response.json();
    return files.files;
}

document.getElementById('exportDrive').addEventListener('click', async () => {
    try {
        console.log('Requesting access token');
        const accessToken = await getAccessToken();

        if (!accessToken) {
            console.log('No access token available');
            return;
        }

        console.log('Access Token Received:', accessToken);

        if (!response || !response.token) {
            console.log('noaccesstoken');
            return;
        }

        browser.storage.local.get({ collections: [] }, async function (result) {
            let retrievedCollections = result.collections || [];
            const fileContent = JSON.stringify({ retrievedCollections });
            const response = await browser.runtime.sendMessage({
                action: 'uploadFileToDrive',
                accessToken,
                fileContent
            });

            if (response.success) {
                console.log('File uploaded successfully:', response.result);
            } else {
                console.error('Failed to upload file:', response.error);
            }
        });

    } catch (error) {
        console.error('Error during backup:', error);
    }
});


document.getElementById('importDrive').addEventListener('click', async () => {
    await browser.runtime.getBackgroundPage().then(async (bg) => {
        const accessToken = await bg.authenticate();
        const files = await bg.listFilesInAppDataFolder(accessToken);
        if (files.length > 0) {
            const fileId = files[0].id;
            const content = await bg.downloadFileFromDrive(accessToken, fileId);
            console.log('Restored content:', content);
        } else {
            console.log('No backup found.');
        }
    });
});

