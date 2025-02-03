(function() {
    console.log('🎯 Profile Visit Interceptor script injected');
    
    // Initialize data in window scope
    window.profileVisitData = {
        currentProfileHandle: null,
        lastVisitedProfile: null,
        lastVisitTime: null
    };

    // Function to send data to content script
    function sendToContentScript(data, type = 'PROFILE_VISIT') {
        try {
            console.log(`📤 Sending profile visit data to content script:`, data);
            window.dispatchEvent(new CustomEvent('profileVisitCaptured', {
                detail: {
                    type: type,
                    data: data
                }
            }));
        } catch (error) {
            console.error('Error sending data to content script:', error);
        }
    }

    // Helper function to extract profile handle from URL
    function extractProfileHandle(url) {
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            
            // Ignore non-profile paths and subpages
            const ignorePaths = ['home', 'explore', 'notifications', 'messages', 'i', 'settings', 
                               'following', 'followers', 'likes', 'media', 'search', 'lists'];
            
            // Check if it's a valid profile path
            if (pathParts.length > 0 && 
                !ignorePaths.includes(pathParts[0]) && 
                !pathParts[0].startsWith('?') && 
                !pathParts[0].startsWith('#')) {
                return pathParts[0];
            }
            return null;
        } catch (error) {
            console.error('Error extracting profile handle:', error);
            return null;
        }
    }

    // Function to check if URL is a profile page
    function isProfilePage(url) {
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            
            // Ignore specific Twitter routes and empty paths
            const ignorePaths = ['home', 'explore', 'notifications', 'messages', 'i', 'settings',
                               'following', 'followers', 'likes', 'media', 'search', 'lists'];
            
            // Additional checks for valid profile URL
            return pathParts.length > 0 && 
                   !ignorePaths.includes(pathParts[0]) &&
                   !pathParts[0].startsWith('?') &&
                   !pathParts[0].startsWith('#');
        } catch {
            return false;
        }
    }

    // Function to handle profile visits with debouncing
    let visitTimeout = null;
    function handleProfileVisit(url) {
        try {
            if (!isProfilePage(url)) return;

            const profileHandle = extractProfileHandle(url);
            if (!profileHandle) return;

            // Avoid duplicate events for the same profile within 2 seconds
            const now = Date.now();
            if (profileHandle === window.profileVisitData.lastVisitedProfile &&
                now - (window.profileVisitData.lastVisitTime || 0) < 2000) {
                return;
            }

            // Clear any pending timeout
            if (visitTimeout) {
                clearTimeout(visitTimeout);
            }

            // Set a timeout to ensure the page has loaded
            visitTimeout = setTimeout(() => {
                console.log(`🔍 Detected visit to profile: @${profileHandle}`);
                window.profileVisitData.lastVisitedProfile = profileHandle;
                window.profileVisitData.currentProfileHandle = profileHandle;
                window.profileVisitData.lastVisitTime = now;

                sendToContentScript({
                    handle: profileHandle,
                    timestamp: new Date().toISOString(),
                    url: url
                }, 'PROFILE_VISIT');
            }, 500);

        } catch (error) {
            console.error('Error handling profile visit:', error);
        }
    }

    try {
        // Set up URL change monitoring using History API
        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;

        // Monitor pushState
        window.history.pushState = function() {
            try {
                originalPushState.apply(this, arguments);
            } catch (error) {
                console.error('Error in pushState:', error);
            }
            handleProfileVisit(window.location.href);
        };

        // Monitor replaceState
        window.history.replaceState = function() {
            try {
                originalReplaceState.apply(this, arguments);
            } catch (error) {
                console.error('Error in replaceState:', error);
            }
            handleProfileVisit(window.location.href);
        };

        // Monitor URL changes through popstate event
        window.addEventListener('popstate', function() {
            handleProfileVisit(window.location.href);
        });

        // Monitor URL changes through navigation events
        window.addEventListener('navigationend', function() {
            handleProfileVisit(window.location.href);
        });

        // Check initial page load
        handleProfileVisit(window.location.href);

        console.log('✅ Profile visit interceptor ready - monitoring profile visits');
    } catch (error) {
        console.error('Error setting up profile visit interceptor:', error);
    }
})(); 