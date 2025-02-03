(function() {
    console.log('🎯 Profile Visit Interceptor script injected');
    
    // Initialize data in window scope
    window.profileVisitData = {
        lastVisitedProfile: null,
        lastVisitTime: null
    };

    // Special paths to ignore
    const IGNORED_PATHS = [
        'home', 'explore', 'notifications', 'messages', 'i', 'settings',
        'jobs', 'search', 'lists', 'communities'
    ];

    // Profile sections to ignore (when appended to username)
    const IGNORED_SECTIONS = [
        'with_replies', 'media', 'likes', 'highlights',
        'articles', 'communities', 'lists', 'followers',
        'following', 'topics'
    ];

    // Function to check if a path should be ignored
    function isIgnoredPath(path) {
        return IGNORED_PATHS.includes(path) || 
               IGNORED_SECTIONS.some(section => path.endsWith('/' + section));
    }

    // Function to extract clean profile handle
    function extractProfileHandle(url) {
        try {
            const urlObj = new URL(url);
            // Only match x.com domain
            if (!urlObj.hostname.endsWith('x.com')) {
                return null;
            }
            
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            
            // If no path parts or first part is an ignored path, return null
            if (!pathParts.length || isIgnoredPath(pathParts[0])) {
                return null;
            }

            // Get the base handle (first path segment)
            const handle = pathParts[0];

            // If it's a profile section (like /username/with_replies), ignore it
            if (pathParts.length > 1 && IGNORED_SECTIONS.includes(pathParts[1])) {
                return null;
            }

            return handle;
        } catch (error) {
            console.error('Error extracting profile handle:', error);
            return null;
        }
    }

    // Function to send data to content script
    function sendToContentScript(data) {
        console.log('📤 Sending profile visit data to content script:', data);
        window.dispatchEvent(new CustomEvent('profileVisitDataCaptured', {
            detail: {
                type: 'PROFILE_VISIT',
                data: data
            }
        }));
    }

    // Function to handle profile visits
    function handleProfileVisit(url) {
        const handle = extractProfileHandle(url);
        
        // Skip if no valid handle or same profile within debounce period
        if (!handle) {
            return;
        }

        const now = Date.now();
        // Debounce period of 5 seconds for the same profile
        if (handle === window.profileVisitData.lastVisitedProfile &&
            now - (window.profileVisitData.lastVisitTime || 0) < 5000) {
            return;
        }

        // Update last visit data
        window.profileVisitData.lastVisitedProfile = handle;
        window.profileVisitData.lastVisitTime = now;

        // Send visit data
        sendToContentScript({
            handle: handle,
            timestamp: new Date().toISOString(),
            url: url
        });
    }

    // Monitor URL changes using History API
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function() {
        originalPushState.apply(this, arguments);
        handleProfileVisit(window.location.href);
    };

    window.history.replaceState = function() {
        originalReplaceState.apply(this, arguments);
        handleProfileVisit(window.location.href);
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', () => {
        handleProfileVisit(window.location.href);
    });

    // Check initial URL
    handleProfileVisit(window.location.href);

    console.log('✅ Profile visit interceptor ready');
})(); 