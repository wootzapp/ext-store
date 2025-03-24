console.log('Content script initialized');

const FIREBASE_BASE_URL = "firebase_url";

if (window.location.href.includes('tap.eclipse.xyz')) {

    // Function to modify _blank links
    function processLinks() {
        const links = document.getElementsByTagName('a');
        let modifiedCount = 0;
        
        for (const link of links) {
            if (link.getAttribute('target') === '_blank' && !link.hasAttribute('data-processed')) {
                // Mark as processed to avoid duplicate handlers
                link.setAttribute('data-processed', 'true');
                
                // Add click handler
                link.addEventListener('click', handleLinkClick);
                modifiedCount++;
            }
        }
        
        if (modifiedCount > 0) {
            console.log(`Processed ${modifiedCount} new _blank links`);
        }
    }

    // Function to handle link clicks
    function handleLinkClick(event) {
        event.preventDefault();
        
        const url = this.href;
        console.log('Intercepted _blank link click:', url);
        
        // Send message to background script to create new tab
        chrome.runtime.sendMessage({
            action: "createTab",
            url: url
        }, (response) => {
            if (response?.success) {
                console.log('Successfully opened in new tab:', response.tabId);
            } else {
                console.error('Failed to open in new tab:', response?.error);
                // Fallback to default behavior if tab creation fails
                window.open(url, '_blank');
            }
        });
    }

    // Process existing links
    processLinks();

    // Watch for dynamically added links
    const observer = new MutationObserver((mutations) => {
        let hasNewLinks = false;
        
        for (const mutation of mutations) {
            // Check for added nodes
            if (mutation.addedNodes.length > 0) {
                hasNewLinks = true;
                break;
            }
        }
        
        if (hasNewLinks) {
            console.log('DOM changed - checking for new _blank links');
            processLinks();
        }
    });

    // Start observing with configuration
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('Link handler and observer started for tap.eclipse.xyz');

    function getOnboardingInviteCode(){
        console.log("getting onboarding invite code");
        const onboardingInviteCode = localStorage.getItem('onboarding-invite-code');
        const onboardingInviteCodeValue = onboardingInviteCode.replace(/['"]+/g, '');
        console.log("onboarding invite code", onboardingInviteCodeValue);
        return onboardingInviteCodeValue;
    }

    // Function to get wallet address
    function getWalletAddress() {
        console.log("getting wallet address");
        try {
            const dynamicStore = localStorage.getItem('dynamic_store');
            const walletInfo = JSON.parse(dynamicStore || '{}');
            const walletId = walletInfo.state?.connectedWalletsInfo?.[0]?.id;
            
            if (!walletId) return null;

            // Extract address from ID format: backpacksol-{address}-SOL
            const addressMatch = walletId.match(/backpacksol-(.*)-SOL/);
            const address = addressMatch ? addressMatch[1] : null;

            console.log('Extracted wallet address:', address);
            return address;

        } catch (error) {
            console.error('Error getting wallet address:', error);
            return null;
        }
    }

    function getInitialData() {
        console.log("getting initial data");
        return {
            walletAddress: getWalletAddress(),
            inviteCode: getOnboardingInviteCode()
        };
    }

    // Function to get connection statuses
    function getConnectionStatuses() {
        console.log("getting connection statuses");
        try {
            const onboarding = localStorage.getItem('onboarding-2');
            let onboardingData = {};
            
            if (onboarding) {
                try {
                    onboardingData = JSON.parse(onboarding);
                } catch {
                    console.log('Could not parse onboarding-2');
                }
            }

            return {
                'connect-twitter': onboardingData['connect-twitter'] || false,
                'connect-discord': onboardingData['connect-discord'] || false,
                'connect-wallet': onboardingData['connect-wallet'] || false,
                'domain-setup': onboardingData['domain-setup'] || false,
                'bridge': onboardingData['bridge'] || false
            };
        } catch (error) {
            console.error('Error getting connection statuses:', error);
            return null;
        }
    }

    // Helper function to get formatted IST time
    function getISTDateTime() {
        const options = {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return new Date().toLocaleString('en-IN', options);
    }

    // Function to get current data from Firebase
    async function getCurrentFirebaseData(walletAddress) {
        try {
            const response = await fetch(`${FIREBASE_BASE_URL}/users/${walletAddress}.json`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching Firebase data:', error);
            return null;
        }
    }

    // Function to send data only if it's different
    async function sendToFirebase(data) {
        const walletAddress = getWalletAddress();
        if (!walletAddress) {
            console.log('No wallet address available');
            return;
        }

        // Get current Firebase data
        const currentData = await getCurrentFirebaseData(walletAddress);
        console.log("current data", currentData);

        const newStatuses = getConnectionStatuses();

        console.log("new statuses", newStatuses);

        if (!newStatuses) {
            console.log('No status data available');
            return;
        }

        // Check if data is different
        if (currentData) {
            const isDifferent = 
                currentData.inviteCode !== data.inviteCode || 
                currentData.walletAddress !== data.walletAddress ||
                currentData['connect-twitter'] !== newStatuses['connect-twitter'] ||
                currentData['connect-discord'] !== newStatuses['connect-discord'] ||
                currentData['connect-wallet'] !== newStatuses['connect-wallet'] ||
                currentData['domain-setup'] !== newStatuses['domain-setup'] ||
                currentData['bridge'] !== newStatuses['bridge'] ||
                currentData.lastUpdateTime !== getISTDateTime() ||
                currentData.creationTime !== currentData.creationTime;
            
            if (!isDifferent) {
                console.log('Data unchanged, skipping update');
                return;
            }
        }

        // Send clean data without random values
        const cleanData = {
            walletAddress,
            'connect-twitter': newStatuses['connect-twitter'],
            'connect-discord': newStatuses['connect-discord'],
            'connect-wallet': newStatuses['connect-wallet'],
            'domain-setup': newStatuses['domain-setup'],
            'bridge': newStatuses['bridge'],
            inviteCode: data.inviteCode,
            lastUpdateTime: getISTDateTime(),
            creationTime: currentData?.creationTime || getISTDateTime()
        };

        console.log('Sending new data to Firebase:', cleanData);

        try {
            const response = await fetch(`${FIREBASE_BASE_URL}/users/${walletAddress}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanData)
            });

            if (!response.ok) throw new Error('Network response was not ok');
            console.log('Data updated successfully');
        } catch (error) {
            console.error('Error updating Firebase:', error);
        }
    }

    // Initial check when script loads
    const initialData = getInitialData();
    if (initialData.walletAddress && initialData.inviteCode) {
        console.log("sending data");
        sendToFirebase(initialData);
    }

} else {
    console.log('Not on tap.eclipse.xyz - no modifications needed');
} 