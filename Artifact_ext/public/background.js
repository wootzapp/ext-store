/* global chrome */
// import './config.js';
// // Storage functions
// function saveToken(token) {
//     return new Promise((resolve) => {
//         chrome.storage.local.set({ authToken: token }, () => {
//             resolve({ success: true });
//         });
//     });
// }

// function getToken() {
//     return new Promise((resolve) => {
//         chrome.storage.local.get(['authToken'], (result) => {
//             resolve(result.authToken);
//         });
//     });
// }

// async function logUrl(token, url) {
//     try {
//         const response = await fetch(
//             `${self.config.CORE_API_URL}/v2/logs/url`,
//             {
//                 method: 'POST',
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     encrypted_url: url,
//                 }),
//             },
//         );
//         console.log('response', response);
//         const body = await response.json();
//         console.log('body', body);
//         return body;
//     } catch (error) {
//         console.error('Error logging URL:', error);
//         throw error;
//     }
// }

// // Listen for navigation events
// chrome.webNavigation.onCompleted.addListener(async (details) => {
//     if (details.frameId === 0) {
//         try {
//             const token = await getToken();
//             console.log('token', token);
//             if (token) {
//                 const result = await logUrl(token, new URL(details.url).toString());
//                 console.info(`URL logged:`, result);
//             } else {
//                 console.warn('No token available, URL not logged');
//             }
//         } catch (error) {
//             console.error('Error logging URL:', error);
//         }
//     }
// });

// // Listen for messages from the React app
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     switch (request.type) {
//         case 'SAVE_TOKEN':
//             saveToken(request.token)
//                 .then(() => sendResponse({ success: true }))
//                 .catch(error => sendResponse({ success: false, error: error.message }));
//             return true; // Indicates that the response is sent asynchronously

//         case 'GET_TOKEN':
//             getToken()
//                 .then(token => sendResponse({ success: true, token }))
//                 .catch(error => sendResponse({ success: false, error: error.message }));
//             return true; // Indicates that the response is sent asynchronously

//         case 'LOG_URL':
//             logUrl(request.token, request.url)
//                 .then(result => sendResponse({ success: true, result }))
//                 .catch(error => sendResponse({ success: false, error: error.message }));
//             return true; // Indicates that the response is sent asynchronously

//         default:
//             sendResponse({ success: false, error: 'Unknown request type' });
//     }
// });

// // Optional: Log when the service worker starts
// console.log('Background service worker started');

/* global chrome */
import './config.js';

function getToken() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['token'], (result) => {
            resolve(result.token);
        });
    });
}

// async function logUrl(token, url) {
//     try {
//         const response = await fetch(
//             `${self.config.CORE_API_URL}/v2/logs/url`,
//             {
//                 method: 'POST',
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     encrypted_url: url,
//                 }),
//             },
//         );
//         console.log('response', response);
//         const body = await response.json();
//         console.log('body', body);
//         return body;
//     } catch (error) {
//         console.error('Error logging URL:', error);
//         throw error;
//     }
// }

// // Listen for navigation events
// chrome.webNavigation.onCompleted.addListener(async (details) => {
//     if (details.frameId === 0) {
//         try {
//             const token = await getToken();
//             console.log('token', token);
//             if (token) {
//                 const result = await logUrl(token, new URL(details.url).toString());
//                 console.info(`URL logged:`, result);
//             } else {
//                 console.warn('No token available, URL not logged');
//             }
//         } catch (error) {
//             console.error('Error logging URL:', error);
//         }
//     }
// });

console.log('Background script loaded and running');

async function logUrl(token, url) {
    try {
        const response = await fetch(
            `${self.config.CORE_API_URL}/v2/logs/url`,
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
        console.log('response', response);
        const body = await response.json();
        console.log('body', body);
        return body;
    } catch (error) {
        console.error('Error logging URL:', error);
        throw error;
    }
}


// Listen for history items being added
chrome.history.onVisited.addListener(async (historyItem) => {
    const token = await getToken();
    if (!token) {
        console.warn('No token available, URL not logged:', historyItem.url);
        return;
    }

    try {
        const result = await logUrl(token, historyItem.url);
        console.info('URL logged:', historyItem.url, 'Result:', result);
    } catch (error) {
        console.error('Error logging URL:', historyItem.url, error);
    }
});

console.log('Background service worker started');