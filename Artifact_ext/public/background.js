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

// console.log('Background script loaded and running');

// function shouldLogUrl(url) {
//     // Don't log chrome:// URLs
//     if (url.startsWith('chrome://')) return false;

//     // Add any other URL patterns you want to exclude here
//     // For example, to exclude chrome-extension:// URLs:
//     // if (url.startsWith('chrome-extension://')) return false;

//     return true;
// }

// async function logUrl(url) {
//     if (!shouldLogUrl(url)) {
//         console.log('Skipping logging for URL:', url);
//         return;
//     }

//     try {
//         const response = await fetch('https://extension.free.beeceptor.com/log', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ url: url, timestamp: new Date().toISOString() })
//         });

//         console.log('URL logged, response status:', response.status);
//         const responseText = await response.text();
//         console.log('Log response:', responseText);

//         return { status: response.status, body: responseText };
//     } catch (error) {
//         console.error('Error logging URL:', error);
//         throw error;
//     }
// }

// // Listen for navigation events
// chrome.webNavigation.onCompleted.addListener(async (details) => {
//     if (details.frameId === 0) {  // Only for main frame navigation
//         console.log('Navigation completed to:', details.url);

//         try {
//             await logUrl(details.url);
//         } catch (error) {
//             console.error('Error logging URL:', error);
//         }
//     }
// });

// // Optional: Listen for tab updates as well
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (changeInfo.status === 'complete' && tab.url) {
//         console.log('Tab updated, URL:', tab.url);
//         logUrl(tab.url).catch(error => console.error('Error logging tab URL:', error));
//     }
// });

// console.log('Background service worker started');

// console.log('Background script loaded and running');

// async function sendHeartbeat() {
//     try {
//         const response = await fetch('https://extension.free.beeceptor.com/heartbeat', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 message: "Service worker is running",
//                 timestamp: new Date().toISOString()
//             })
//         });

//         console.log('Heartbeat sent, response status:', response.status);
//         const responseText = await response.text();
//         console.log('Heartbeat response:', responseText);

//         return { status: response.status, body: responseText };
//     } catch (error) {
//         console.error('Error sending heartbeat:', error);
//         throw error;
//     }
// }

// // Periodic heartbeat function
// async function periodicHeartbeat() {
//     console.log('Sending periodic heartbeat');
//     try {
//         await sendHeartbeat();
//     } catch (error) {
//         console.error('Error in periodic heartbeat:', error);
//     }
// }

// // Set up periodic heartbeat (every 1 minute)
// const TEN_SECONDS = 10 * 1000;
// setInterval(periodicHeartbeat, TEN_SECONDS);

// // Send an initial heartbeat when the service worker starts
// sendHeartbeat().catch(error => console.error('Error sending initial heartbeat:', error));

// // Keep the service worker alive
// function keepAlive() {
//     setInterval(chrome.runtime.getPlatformInfo, 20e3);
// }

// keepAlive();

// console.log('Background service worker started');

console.log('Background script loaded and running');

async function sendHeartbeat() {
    try {
        const response = await fetch('https://extensions.free.beeceptor.com/heartbeat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: "Service worker is running",
                timestamp: new Date().toISOString()
            })
        });

        console.log('Heartbeat sent, response status:', response.status);
        const responseText = await response.text();
        console.log('Heartbeat response:', responseText);

        return { status: response.status, body: responseText };
    } catch (error) {
        console.error('Error sending heartbeat:', error);
        throw error;
    }
}

// Function to update storage
function updateStorage() {
    const timestamp = new Date().toISOString();
    chrome.storage.local.set({ lastUpdate: timestamp }, () => {
        console.log('Storage updated with timestamp:', timestamp);
    });
}

// Set up periodic storage update (every 10 seconds)
const TEN_SECONDS = 10 * 1000;
setInterval(updateStorage, TEN_SECONDS);

// Listen for changes in storage
chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === 'lastUpdate') {
            console.log('Last update changed from', oldValue, 'to', newValue);
            sendHeartbeat().catch(error => console.error('Error sending heartbeat:', error));
        }
    }
});

// Initial storage set and heartbeat
updateStorage();
sendHeartbeat().catch(error => console.error('Error sending initial heartbeat:', error));

console.log('Background service worker started');