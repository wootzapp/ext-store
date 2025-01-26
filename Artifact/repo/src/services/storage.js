/* global chrome */

export function saveToken(token) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ authToken: token }, () => {
            resolve();
        });
    });
}

export function getToken() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['authToken'], (result) => {
            resolve(result.authToken);
        });
    });
}

export async function logUrl(token, url) {
    const response = await fetch(
        `${self.REACT_APP_CORE_API_URL}/logs/url`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                encrypted_url: url,
            }),
        },
    );
    const body = await response.json();
    return body;
}