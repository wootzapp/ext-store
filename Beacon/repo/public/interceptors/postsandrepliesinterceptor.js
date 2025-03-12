/*global chrome*/
// Create a new file: public/postsandrepliesinterceptor.js
(function() {
    console.log('🎯 Posts and Replies Interceptor script injected');
    
    let xhrRequestComplete = false;
    let processedTweetIds = new Set();
    
    // Initialize requestData in window scope
    window.postsAndRepliesRequestData = {
        headers: null,
        url: null,
        params: null
    };

    // Function to process tweets from response
    function processTweetsFromResponse(responseData) {
        if (!responseData?.data?.user?.result?.timeline_v2?.timeline?.instructions) {
            return [];
        }

        const tweets = [];
        const instructions = responseData.data.user.result.timeline_v2.timeline.instructions;

        instructions.forEach(instruction => {
            if (instruction.type === "TimelineAddEntries") {
                instruction.entries.forEach(entry => {
                    // Handle both direct tweets and conversation modules
                    if (entry.content?.itemContent?.tweet_results?.result) {
                        const tweet = entry.content.itemContent.tweet_results.result;
                        if (tweet.rest_id && !processedTweetIds.has(tweet.rest_id)) {
                            processedTweetIds.add(tweet.rest_id);
                            tweets.push(tweet);
                        }
                    } else if (entry.content?.items) {
                        // Handle conversation modules
                        entry.content.items.forEach(item => {
                            if (item.item?.itemContent?.tweet_results?.result) {
                                const tweet = item.item.itemContent.tweet_results.result;
                                if (tweet.rest_id && !processedTweetIds.has(tweet.rest_id)) {
                                    processedTweetIds.add(tweet.rest_id);
                                    tweets.push(tweet);
                                }
                            }
                        });
                    }
                });
            }
        });

        return tweets;
    }

    // Function to send data to content script
    function sendToContentScript(tweets) {
        console.log('📤 Sending data to content script:', {
            tweetsCount: tweets.length
        });
        
        window.dispatchEvent(new CustomEvent('postsAndRepliesDataCaptured', {
            detail: {
                type: 'POSTS_AND_REPLIES_DATA',
                tweets: tweets,
                requestUrl: window.postsAndRepliesRequestData.url,
                requestHeaders: window.postsAndRepliesRequestData.headers
            }
        }));
    }

    // Helper function to identify relevant URLs
    function isRelevantUrl(url) {
        return url && (
            url.includes('UserTweetsAndReplies') ||
            url.includes('with_replies')
        );
    }

    // Process tweets data
    function processTweetsData(jsonResponse) {
        try {
            const tweets = new Map(); // Use Map to prevent duplicates
            console.log('Processing response:', jsonResponse);
            
            if (jsonResponse?.data?.user?.result?.timeline_v2?.timeline?.instructions) {
                const instructions = jsonResponse.data.user.result.timeline_v2.timeline.instructions;
                
                instructions.forEach(instruction => {
                    if (instruction.type === 'TimelineAddEntries') {
                        instruction.entries.forEach(entry => {
                            // Skip cursor entries
                            if (entry.entryId.startsWith('cursor-')) {
                                return;
                            }

                            // Handle conversation modules
                            if (entry.content?.entryType === "TimelineTimelineModule" && entry.content.items) {
                                // Process conversation as a group
                                entry.content.items.forEach(item => {
                                    if (item.item?.itemContent?.tweet_results?.result) {
                                        const tweet = processTweetResult(item.item.itemContent.tweet_results.result);
                                        if (tweet) {
                                            tweets.set(tweet.id, tweet);
                                        }
                                    }
                                });
                            }
                            // Handle single tweets
                            else if (entry.content?.itemContent?.tweet_results?.result) {
                                const tweet = processTweetResult(entry.content.itemContent.tweet_results.result);
                                if (tweet) {
                                    tweets.set(tweet.id, tweet);
                                }
                            }
                        });
                    }
                });
            }

            const uniqueTweets = Array.from(tweets.values());
            console.log(`Found ${uniqueTweets.length} unique tweets`);
            return { tweets: uniqueTweets };
        } catch (error) {
            console.error('❌ Error processing tweets:', error);
            return { tweets: [] };
        }
    }

    // Helper function to process individual tweet result
    function processTweetResult(tweetResult) {
        try {
            if (!tweetResult.core?.user_results?.result?.legacy?.screen_name) {
                return null;
            }

            return {
                id: tweetResult.rest_id,
                text: tweetResult.legacy?.full_text || tweetResult.legacy?.text,
                timestamp: tweetResult.legacy?.created_at,
                metrics: {
                    replies: tweetResult.legacy?.reply_count || 0,
                    retweets: tweetResult.legacy?.retweet_count || 0,
                    likes: tweetResult.legacy?.favorite_count || 0,
                    views: tweetResult.views?.count || 0
                },
                user: {
                    name: tweetResult.core.user_results.result.legacy.name,
                    handle: tweetResult.core.user_results.result.legacy.screen_name,
                    avatar: tweetResult.core.user_results.result.legacy.profile_image_url_https
                },
                in_reply_to_status_id: tweetResult.legacy?.in_reply_to_status_id_str,
                in_reply_to_screen_name: tweetResult.legacy?.in_reply_to_screen_name,
                is_quote_status: tweetResult.legacy?.is_quote_status || false,
                quoted_status_id: tweetResult.legacy?.quoted_status_id_str,
                conversation_id: tweetResult.legacy?.conversation_id_str,
                media: processMedia(tweetResult.legacy?.extended_entities?.media)
            };
        } catch (error) {
            console.error('Error processing tweet result:', error);
            return null;
        }
    }

    // Helper function to process media
    function processMedia(media) {
        if (!media || !Array.isArray(media)) return null;
        
        return media.map(item => ({
            type: item.type,
            url: item.media_url_https,
            display_url: item.display_url,
            expanded_url: item.expanded_url
        }));
    }

    // Capture XHR requests
    const originalXHR = window.XMLHttpRequest;
    console.log('📌 Original XMLHttpRequest:', !!originalXHR);
    
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        const originalSetRequestHeader = xhr.setRequestHeader;
        const originalSend = xhr.send;
        let currentUrl = '';
        let allHeaders = {};

        xhr.open = function() {
            const method = arguments[0];
            const url = arguments[1];
            currentUrl = url;
            
            if (url && url.includes('UserTweetsAndReplies')) {
                console.log('🎯 XHR Captured URL:', url);
                window.postsAndRepliesRequestData.url = url;
                window.postsAndRepliesRequestData.method = method;
            }
            return originalOpen.apply(this, arguments);
        };

        xhr.setRequestHeader = function(header, value) {
            if (currentUrl && currentUrl.includes('UserTweetsAndReplies')) {
                allHeaders[header] = value;
                window.postsAndRepliesRequestData.headers = allHeaders;
                console.log('🏷️ Setting header:', header);
            }
            return originalSetRequestHeader.apply(this, arguments);
        };

        xhr.addEventListener('load', function() {
            if (currentUrl && currentUrl.includes('UserTweetsAndReplies')) {
                try {
                    console.log('✅ XHR request complete, processing data');
                    const responseData = JSON.parse(xhr.responseText);
                    const tweets = processTweetsFromResponse(responseData);
                    
                    if (tweets.length > 0) {
                        sendToContentScript(tweets);
                    }
                } catch (error) {
                    console.error('❌ Error processing response:', error);
                    window.dispatchEvent(new CustomEvent('postsAndRepliesError', {
                        detail: { error: error.message }
                    }));
                }
            }
        });

        xhr.send = function(body) {
            if (currentUrl && currentUrl.includes('UserTweetsAndReplies')) {
                try {
                    window.postsAndRepliesRequestData.body = body;
                    console.log('📦 Sending XHR with data:', window.postsAndRepliesRequestData);
                } catch (e) {
                    console.error('Error with request body:', e);
                }
            }
            return originalSend.apply(this, arguments);
        };

        return xhr;
    };

    console.log('✅ Posts and Replies interceptor ready - waiting for XHR');
})();