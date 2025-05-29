// Posts and Replies Interceptor Script - Improved Version
(function() {
    'use strict';
  
    console.log('🔧 Posts and Replies Interceptor initialized (v2.0)');
  
    // Store original fetch and XMLHttpRequest
    const originalFetch = window.fetch;
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
  
    // Target API endpoint pattern
    const REPLIES_API_PATTERN = /UserTweetsAndReplies/;
    const GRAPHQL_BASE = 'https://x.com/i/api/graphql/';
  
    // Helper function to safely navigate nested objects
    function safeGet(obj, path, defaultValue = null) {
      return path.split('.').reduce((current, key) => {
        return (current && current[key] !== undefined) ? current[key] : defaultValue;
      }, obj);
    }
  
    // Helper function to extract tweets from response data
    function extractTweetsFromResponse(data) {
      const tweets = [];
      
      try {
        console.log('🔍 Processing response data structure...');
        
        // Multiple possible paths for timeline data
        const possiblePaths = [
          'data.user.result.timeline.timeline',
          'data.user.result.timeline_v2.timeline',
          'data.user.result.timeline',
          'timeline.timeline',
          'timeline'
        ];
        
        let timeline = null;
        for (const path of possiblePaths) {
          timeline = safeGet(data, path);
          if (timeline && timeline.instructions) {
            console.log(`✅ Found timeline at path: ${path}`);
            break;
          }
        }
        
        if (!timeline || !timeline.instructions) {
          console.log('📝 No timeline instructions found, checking alternative structures...');
          console.log('🐛 Available data keys:', Object.keys(data?.data || {}));
          
          // Log the structure for debugging
          if (data?.data?.user?.result) {
            console.log('🐛 User result keys:', Object.keys(data.data.user.result));
          }
          
          return tweets;
        }
  
        console.log(`📋 Processing ${timeline.instructions.length} timeline instructions`);
        
        // Process all instructions, not just TimelineAddEntries
        timeline.instructions.forEach((instruction, idx) => {
          console.log(`📌 Processing instruction ${idx}: ${instruction.type}`);
          
          if (instruction.type === 'TimelineAddEntries' && instruction.entries) {
            processTimelineEntries(instruction.entries, tweets);
          } else if (instruction.type === 'TimelineReplaceEntry' && instruction.entry) {
            processTimelineEntries([instruction.entry], tweets);
          } else if (instruction.type === 'TimelinePinEntry' && instruction.entry) {
            processTimelineEntries([instruction.entry], tweets);
          }
        });
  
        console.log(`📊 Extracted ${tweets.length} tweets from response`);
        return tweets;
  
      } catch (error) {
        console.error('❌ Error extracting tweets:', error);
        console.error('🐛 Full error details:', error.stack);
        return tweets;
      }
    }
    
    // Helper function to process timeline entries
    function processTimelineEntries(entries, tweets) {
      entries.forEach((entry, entryIdx) => {
        console.log(`📄 Processing entry ${entryIdx}: ${entry.entryId}`);
        
        // Skip cursors and non-tweet entries
        if (entry.entryId.startsWith('cursor-') || 
            entry.entryId.startsWith('who-to-follow-') ||
            entry.entryId.startsWith('promoted-')) {
          return;
        }
  
        // Handle different entry content types
        let tweetResult = null;
        
        // Standard tweet entry
        if (entry.content?.itemContent?.tweet_results?.result) {
          tweetResult = entry.content.itemContent.tweet_results.result;
        }
        // Thread/conversation entry
        else if (entry.content?.items) {
          entry.content.items.forEach(item => {
            if (item.item?.itemContent?.tweet_results?.result) {
              const threadTweet = item.item.itemContent.tweet_results.result;
              processTweetResult(threadTweet, tweets);
            }
          });
          return;
        }
        // Module entry (for promoted content, etc.)
        else if (entry.content?.clientEventInfo) {
          console.log('📢 Skipping promotional/module entry');
          return;
        }
        
        if (tweetResult) {
          processTweetResult(tweetResult, tweets);
        } else {
          console.log(`⚠️ No tweet result found in entry: ${entry.entryId}`);
          console.log('🐛 Entry content keys:', Object.keys(entry.content || {}));
        }
      });
    }
    
    // Helper function to process individual tweet results
    function processTweetResult(tweetResult, tweets) {
      if (tweetResult.__typename === 'Tweet' && tweetResult.rest_id) {
        const tweet = {
          id: tweetResult.rest_id,
          text: safeGet(tweetResult, 'legacy.full_text', ''),
          created_at: safeGet(tweetResult, 'legacy.created_at', ''),
          user: {
            id: safeGet(tweetResult, 'core.user_results.result.rest_id', ''),
            name: safeGet(tweetResult, 'core.user_results.result.legacy.name', ''),
            screen_name: safeGet(tweetResult, 'core.user_results.result.legacy.screen_name', ''),
            profile_image_url: safeGet(tweetResult, 'core.user_results.result.legacy.profile_image_url_https', '')
          },
          metrics: {
            retweet_count: safeGet(tweetResult, 'legacy.retweet_count', 0),
            favorite_count: safeGet(tweetResult, 'legacy.favorite_count', 0),
            reply_count: safeGet(tweetResult, 'legacy.reply_count', 0),
            quote_count: safeGet(tweetResult, 'legacy.quote_count', 0),
            view_count: safeGet(tweetResult, 'views.count', '0')
          },
          entities: safeGet(tweetResult, 'legacy.entities', {}),
          is_quote_status: safeGet(tweetResult, 'legacy.is_quote_status', false),
          lang: safeGet(tweetResult, 'legacy.lang', 'en'),
          conversation_id: safeGet(tweetResult, 'legacy.conversation_id_str', ''),
          source: safeGet(tweetResult, 'source', ''),
          edit_control: safeGet(tweetResult, 'edit_control', null),
          // Additional fields that might be useful
          in_reply_to_status_id: safeGet(tweetResult, 'legacy.in_reply_to_status_id_str', null),
          in_reply_to_user_id: safeGet(tweetResult, 'legacy.in_reply_to_user_id_str', null),
          in_reply_to_screen_name: safeGet(tweetResult, 'legacy.in_reply_to_screen_name', null)
        };

        // Only add tweets with actual content
        if (tweet.text || tweet.id) {
          tweets.push(tweet);
          console.log(`✅ Added tweet: ${tweet.id} - "${tweet.text.substring(0, 50)}..."`);
        }
      } else if (tweetResult.__typename === 'TweetWithVisibilityResults') {
        // Handle tweets with visibility restrictions
        const innerTweet = tweetResult.tweet;
        if (innerTweet) {
          processTweetResult(innerTweet, tweets);
        }
      } else {
        console.log(`⚠️ Skipping non-tweet result: ${tweetResult.__typename || 'unknown'}`);
      }
    }
  
    // Helper function to capture request headers
    function captureRequestHeaders(headers) {
      const capturedHeaders = {};
      
      if (headers instanceof Headers) {
        for (const [key, value] of headers.entries()) {
          capturedHeaders[key] = value;
        }
      } else if (typeof headers === 'object' && headers !== null) {
        Object.assign(capturedHeaders, headers);
      }
      
      return capturedHeaders;
    }
  
    // Intercept fetch requests
    window.fetch = async function(...args) {
      const [resource, config] = args;
      const url = typeof resource === 'string' ? resource : resource.url;

      try {
        const response = await originalFetch.apply(this, args);
        
        // Check if this is a UserTweetsAndReplies request
        if (url.includes(GRAPHQL_BASE) && REPLIES_API_PATTERN.test(url)) {
          console.log('🎯 Intercepted UserTweetsAndReplies request:', url);
          
          // Clone the response to avoid consuming it
          const responseClone = response.clone();
          
          try {
            const responseData = await responseClone.json();
            console.log('📦 Raw response data keys:', Object.keys(responseData));
            
            const tweets = extractTweetsFromResponse(responseData);
            
            // Always dispatch event, even with 0 tweets for debugging
            const event = new CustomEvent('postsAndRepliesDataCaptured', {
              detail: {
                tweets: tweets,
                requestUrl: url,
                requestHeaders: captureRequestHeaders(config?.headers || {}),
                responseData: responseData, // Include full response for debugging
                extractionSuccess: tweets.length > 0
              }
            });
            
            window.dispatchEvent(event);
            console.log(`✅ Dispatched postsAndRepliesDataCaptured event with ${tweets.length} tweets`);
            
            // Additional debugging for empty responses
            if (tweets.length === 0) {
              console.log('🐛 Zero tweets extracted - debugging info:');
              console.log('🐛 Response structure:', JSON.stringify(responseData, null, 2).substring(0, 500) + '...');
            }
            
          } catch (parseError) {
            console.error('❌ Error parsing UserTweetsAndReplies response:', parseError);
          }
        }
        
        return response;
      } catch (error) {
        console.error('❌ Fetch interception error:', error);
        throw error;
      }
    };
  
    // Intercept XMLHttpRequest for additional coverage
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._interceptedUrl = url;
      this._interceptedMethod = method;
      return originalXHROpen.call(this, method, url, ...args);
    };
  
    XMLHttpRequest.prototype.send = function(data) {
      const xhr = this;
      const url = this._interceptedUrl;

      // Check if this is a UserTweetsAndReplies request
      if (url && url.includes(GRAPHQL_BASE) && REPLIES_API_PATTERN.test(url)) {
        console.log('🎯 Intercepted XHR UserTweetsAndReplies request:', url);
        
        // Store original onreadystatechange
        const originalOnReadyStateChange = xhr.onreadystatechange;
        
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
            try {
              const responseData = JSON.parse(xhr.responseText);
              console.log('📦 XHR Raw response data keys:', Object.keys(responseData));
              
              const tweets = extractTweetsFromResponse(responseData);
              
              // Always dispatch event, even with 0 tweets for debugging
              const event = new CustomEvent('postsAndRepliesDataCaptured', {
                detail: {
                  tweets: tweets,
                  requestUrl: url,
                  requestHeaders: {}, // XHR headers are harder to capture
                  responseData: responseData,
                  extractionSuccess: tweets.length > 0
                }
              });
              
              window.dispatchEvent(event);
              console.log(`✅ Dispatched XHR postsAndRepliesDataCaptured event with ${tweets.length} tweets`);
              
              // Additional debugging for empty responses
              if (tweets.length === 0) {
                console.log('🐛 XHR Zero tweets extracted - debugging info:');
                console.log('🐛 Response structure preview:', JSON.stringify(responseData, null, 2).substring(0, 500) + '...');
              }
              
            } catch (parseError) {
              console.error('❌ Error parsing XHR UserTweetsAndReplies response:', parseError);
            }
          }
          
          // Call original handler
          if (originalOnReadyStateChange) {
            originalOnReadyStateChange.apply(xhr, arguments);
          }
        };
      }
      
      return originalXHRSend.call(this, data);
    };
  
    // Listen for page navigation to re-initialize if needed
    let currentUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        console.log('🔄 Page navigation detected, interceptor still active');
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('✅ Posts and Replies Interceptor setup complete (v2.0)');

})();