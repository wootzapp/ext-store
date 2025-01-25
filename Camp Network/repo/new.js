// Listen for navigation changes
let currentPath = window.location.pathname;

// Function to check if we're on a profile page
function isProfilePage() {
    return /^\/[^/]+$/.test(window.location.pathname);
}

// Function to check if we're on a following page
function isFollowingPage() {
    return window.location.pathname.endsWith('/following');
}

// Main following fetch logic
async function handleFollowingFetch() {
    console.log('Starting following fetch process...');
    
    // Send message to background script to start capturing requests
    chrome.runtime.sendMessage({ 
        type: 'START_CAPTURE',
        url: window.location.href 
    });

    // Click the Following tab if not already on following page
    if (!isFollowingPage()) {
        const followingButtons = Array.from(document.querySelectorAll('div[role="button"]')).filter(btn => 
            btn.textContent.includes('Following')
        );

        if (followingButtons.length > 0) {
            console.log('Found Following button, clicking...');
            followingButtons[0].click();
        }
    }
}

// Listen for page changes
const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        if (isProfilePage()) {
            console.log('Profile page detected');
            // Add Following fetch button
            addFollowingFetchButton();
        }
    }
});

// Add the Following fetch button to the profile page
function addFollowingFetchButton() {
    const existingButton = document.getElementById('fetch-following-btn');
    if (existingButton) return;

    const button = document.createElement('button');
    button.id = 'fetch-following-btn';
    button.textContent = 'Fetch Following';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        padding: 10px;
        background: #1DA1F2;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
    `;

    button.addEventListener('click', handleFollowingFetch);
    document.body.appendChild(button);
}

// Start observing page changes
observer.observe(document.body, { subtree: true, childList: true });

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'FOLLOWING_DATA') {
        console.log('Received following data:', message.data);
        // Handle the following data (e.g., download CSV)
        downloadCSV(message.data, `${window.location.pathname.split('/')[1]}_following.csv`);
    }
});

// Utility function to download CSV
function downloadCSV(data, filename) {
    const csv = [
        ['ID', 'Username', 'Name', 'Bio', 'Followers', 'Following'],
        ...data.map(f => [
            f.id,
            f.username,
            f.name,
            f.bio,
            f.followers_count,
            f.following_count
        ])
    ].map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}