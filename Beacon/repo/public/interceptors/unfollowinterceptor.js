(function() {
    console.log('🎯 Unfollow Interceptor script injected');
    
    // Add deduplication tracking
    const processedUnfollows = new Set();
    
    // Store original XHR
    const originalXHR = window.XMLHttpRequest;

    // Override XHR
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        const originalSetRequestHeader = xhr.setRequestHeader;
        const originalSend = xhr.send;
        let requestData = {
            url: '',
            method: '',
            headers: {},
            body: null
        };

        // Override open
        xhr.open = function() {
            requestData.method = arguments[0];
            requestData.url = arguments[1];
            return originalOpen.apply(this, arguments);
        };

        // Override setRequestHeader
        xhr.setRequestHeader = function(header, value) {
            requestData.headers[header] = value;
            return originalSetRequestHeader.apply(this, arguments);
        };

        // Override send
        xhr.send = function(body) {
            if (requestData.url.includes('/friendships/destroy.json')) {
                requestData.body = body;
                console.log('🔍 Intercepted unfollow request:', requestData);

                // Add response handler
                xhr.addEventListener('load', function() {
                    if (xhr.status === 200) {
                        try {
                            const responseData = JSON.parse(xhr.responseText);
                            console.log('✅ Unfollow response:', responseData);

                            // Check if we've already processed this unfollow
                            if (processedUnfollows.has(responseData.id_str)) {
                                console.log('🔄 Skipping duplicate unfollow for:', responseData.screen_name);
                                return;
                            }

                            // Add to processed set
                            processedUnfollows.add(responseData.id_str);

                            // Extract relevant data
                            const unfollowData = {
                                userId: responseData.id_str,
                                screenName: responseData.screen_name,
                                name: responseData.name,
                                profileImageUrl: responseData.profile_image_url_https,
                                followersCount: responseData.followers_count,
                                followingCount: responseData.friends_count,
                                isVerified: responseData.ext_is_blue_verified,
                                timestamp: new Date().toISOString(),
                                bio: responseData.description,
                                location: responseData.location
                            };

                            // Send data to content script
                            window.dispatchEvent(new CustomEvent('unfollowProfileCaptured', {
                                detail: {
                                    type: 'UNFOLLOW_PROFILE',
                                    data: unfollowData,
                                    requestData: {
                                        url: requestData.url,
                                        headers: requestData.headers,
                                        body: requestData.body
                                    }
                                }
                            }));

                            // Clean up old entries from processedUnfollows after 5 minutes
                            setTimeout(() => {
                                processedUnfollows.delete(responseData.id_str);
                            }, 5 * 60 * 1000);

                        } catch (error) {
                            console.error('❌ Error processing unfollow response:', error);
                        }
                    } else {
                        console.error('❌ Unfollow request failed:', xhr.status, xhr.statusText);
                    }
                });
            }
            return originalSend.apply(this, arguments);
        };

        return xhr;
    };

    console.log('✅ Unfollow interceptor ready');
})(); 