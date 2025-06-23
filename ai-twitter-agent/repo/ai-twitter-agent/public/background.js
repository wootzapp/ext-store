/* global chrome */

class BackgroundTwitterAgent {
  constructor() {
    this.setupMessageHandlers();
    this.twitterTab = null; // Track the Twitter tab
    this.pendingTweets = new Map(); // Track pending tweets by tab ID
    this.lastTweetTime = null;
    this.isRunning = false;
    this.checkInterval = null;
    this.isProcessing = false; // Add lock for processing
    this.lastCheckTime = 0; // Add last check time tracking
    this.minCheckInterval = 30000; // Minimum time between checks (30 seconds)
    this.initializePersistentState();
    this.tweetPrompts = [
      `Create an engaging tweet about topic. Keep it under 280 characters with relevant hashtags. Make it original and thought-provoking.`,
      `Create a humorous tweet about topic. Keep it under 280 characters with clever wordplay or puns. Make it light-hearted and witty with relevant hashtags.`,
      `Create an engaging tweet about topic. Use poetic language or metaphor. Keep it under 280 characters. Add hashtags that reflect a creative or emotional tone.`,
      `Create an educational tweet about topic. Include a surprising fact or stat. Keep it under 280 characters. Use informative hashtags.`,
      `Create a futuristic tweet about topic. Imagine the year is 2040. Keep it under 280 characters. Use hashtags to reflect innovation and vision.`,
      `Create a tweet about topic in the voice of a fictional character. Keep it under 280 characters. Make it fun and character-driven with unique hashtags.`,
      `Create a thought-provoking tweet about topic using a question. Keep it under 280 characters. Encourage replies and add conversation-starting hashtags.`,
      `Create a sarcastic tweet about topic. Keep it under 280 characters with biting humor. Use relevant satirical hashtags.`,
      `Create an engaging tweet about topic from a beginner's perspective. Keep it under 280 characters. Use encouraging and relatable hashtags.`,
      `Create a tweet about topic as if it's breaking news. Keep it under 280 characters. Use dramatic flair and trending news hashtags.`
    ];
  }

  async initializePersistentState() {
    try {
      // Load last tweet time and running state from storage
      const data = await chrome.storage.local.get(['lastTweetTime', 'isRunning', 'agentConfig', 'pendingTweet', 'currentApiAttempt']);
      this.lastTweetTime = data.lastTweetTime || null;
      this.isRunning = data.isRunning || false;
      
      console.log('Background: Initialized state:', {
        isRunning: this.isRunning,
        lastTweetTime: this.lastTweetTime,
        hasConfig: !!data.agentConfig,
        hasPendingTweet: !!data.pendingTweet,
        hasCurrentApiAttempt: !!data.currentApiAttempt
      });

      // If agent was running, restart the scheduler
      if (this.isRunning && data.agentConfig) {
        console.log('Background: Restarting agent with saved config');
        await this.startAgent(data.agentConfig);
      } else if (this.isRunning && !data.agentConfig) {
        // If running but no config, try to get from sync storage
        const syncData = await chrome.storage.sync.get(['agentConfig']);
        if (syncData.agentConfig) {
          console.log('Background: Found config in sync storage, restarting agent');
          await this.startAgent(syncData.agentConfig);
        } else {
          console.log('Background: No config found, stopping agent');
          await this.stopAgent();
        }
      } else if (this.isRunning) {
        // If agent is running, ensure keep-alive mechanisms are active
        console.log('Background: Agent is running, ensuring keep-alive mechanisms');
        await this.ensureServiceWorkerActive();
        this.keepAlive();
      }
      
      // Handle any pending operations from previous session
      if (data.pendingTweet && this.isRunning) {
        console.log('Background: Found pending tweet from previous session, attempting to post');
        setTimeout(async () => {
          try {
            const postResult = await this.postTweetViaTab(data.pendingTweet.content);
            if (postResult.success) {
              await chrome.storage.local.remove(['pendingTweet']);
              console.log('Background: Pending tweet from previous session posted successfully');
            }
          } catch (error) {
            console.error('Background: Error posting pending tweet from previous session:', error);
          }
        }, 5000); // Wait 5 seconds before attempting to post
      }
      
      if (data.currentApiAttempt && this.isRunning) {
        console.log('Background: Found incomplete API attempt from previous session, continuing...');
        // The alarm handler will take care of this
      }
    } catch (error) {
      console.error('Background: Error initializing persistent state:', error);
    }
  }  

  setupMessageHandlers() {
    // Handle messages from popup/content scripts
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const handleMessage = async () => {
        console.log('Background: Received message:', request.action);
        
        switch (request.action) {
          case 'AGENT_INITIALIZE':
            sendResponse({ success: true, message: 'Agent initialized' });
            break;

          case 'AGENT_START':
            const startResult = await this.startAgent(request.config);
            sendResponse(startResult);
            break;

          case 'AGENT_STOP':
            const stopResult = await this.stopAgent();
            sendResponse(stopResult);
            break;

          case 'AGENT_STATUS':
            const status = await this.getAgentStatus();
            sendResponse(status);
            break;

          case 'CHECK_SCHEDULE':
            await this.checkAndPostTweet();
            sendResponse({ success: true });
            break;

          case 'TEST_CLAUDE':
          case 'CLAUDE_GENERATE':
            const claudeResult = await this.testClaudeAPIWithRetry(request.apiKey, request.topic);
            sendResponse(claudeResult);
            break;

          case 'GENERATE_AND_POST_TWEET':
            try {
              console.log('Background: GENERATE_AND_POST_TWEET received');
              const result = await this.generateAndPostTweetManual();
              sendResponse(result);
            } catch (error) {
              console.error('Background: Error in GENERATE_AND_POST_TWEET:', error);
              sendResponse({ 
                success: false, 
                error: error.message,
                posted: false 
              });
            }
            break;

          case 'UPDATE_CONFIG':
            const configResult = await this.updateConfig(request.config);
            sendResponse(configResult);
            break;

          case 'CLAUDE_IMPROVE':
            const improveResult = await this.improveClaudeAPI(request.apiKey, request.originalTweet);
            sendResponse(improveResult);
            break;

          case 'CLAUDE_MULTIPLE':
            const multipleResult = await this.generateMultipleTweets(request.apiKey, request.topic, request.count);
            sendResponse(multipleResult);
            break;

          case 'OPENAI_GENERATE':
            const openaiResult = await this.testOpenAIAPI(request.apiKey, request.topic);
            sendResponse(openaiResult);
            break;

          case 'OPENAI_IMPROVE':
            const openaiImproveResult = await this.improveOpenAIAPI(request.apiKey, request.originalTweet);
            sendResponse(openaiImproveResult);
            break;

          case 'OPENAI_MULTIPLE':
            const openaiMultipleResult = await this.generateMultipleOpenAITweets(request.apiKey, request.topic, request.count);
            sendResponse(openaiMultipleResult);
            break;

          case 'GEMINI_GENERATE':
            const geminiResult = await this.testGeminiAPI(request.apiKey, request.topic);
            sendResponse(geminiResult);
            break;

          case 'GEMINI_IMPROVE':
            const geminiImproveResult = await this.improveGeminiAPI(request.apiKey, request.originalTweet);
            sendResponse(geminiImproveResult);
            break;

          case 'GEMINI_MULTIPLE':
            const geminiMultipleResult = await this.generateMultipleGeminiTweets(request.apiKey, request.topic, request.count);
            sendResponse(geminiMultipleResult);
            break;

          case 'AUTHORIZE_TWITTER':
            try {
              // This would coordinate Twitter authorization
              // For now, just acknowledge the request
              sendResponse({ success: true, message: 'Twitter authorization initiated' });
            } catch (error) {
              sendResponse({ success: false, error: error.message });
            }
            break;
          // NEW: Handle direct tweet posting via tab automation
          case 'POST_TWEET_VIA_TAB':
            try {
              console.log('Background: POST_TWEET_VIA_TAB received');
              const result = await this.postTweetViaTab(request.content);
              sendResponse(result);
            } catch (error) {
              console.error('Background: Error in POST_TWEET_VIA_TAB:', error);
              sendResponse({ 
                success: false, 
                error: error.message,
                posted: false 
              });
            }
            break;

          case 'PING':
            // Simple ping response to keep connection alive
            sendResponse({ success: true });
            break;

          default:
            console.log('Unknown action:', request.action);
            sendResponse({ success: false, error: 'Unknown action' });
        }
      };

      handleMessage().catch(console.error);
      return true;
    });

    // Handle alarms for scheduled tweets
    chrome.alarms.onAlarm.addListener(async (alarm) => {
      if (alarm.name === 'tweet-generator') {
        console.log('Background: Alarm triggered for tweet generation');
        try {
          // Get latest state from both storages
          const [localData, syncData] = await Promise.all([
            chrome.storage.local.get(['isRunning', 'agentConfig', 'currentApiAttempt', 'isProcessing']),
            chrome.storage.sync.get(['agentConfig'])
          ]);

          // If there's an ongoing API attempt, don't start a new one
          if (localData.currentApiAttempt) {
            console.log('Background: API attempt in progress, skipping');
            return;
          }

          // Use config from either storage
          const config = localData.agentConfig || syncData.agentConfig;
          
          if (!config) {
            console.log('Background: No config found in any storage');
            return;
          }

          // If agent is not running but we have config, restart it
          if (!localData.isRunning && config) {
            console.log('Background: Restarting agent with existing config');
            await this.startAgent(config);
            return;
          }

          // If agent is running and not processing, proceed with tweet check
          if (localData.isRunning && !localData.isProcessing) {
            console.log('Background: Starting tweet check');
            await this.checkAndPostTweet();
          } else {
            console.log('Background: Agent not running or already processing, skipping alarm');
          }
        } catch (error) {
          console.error('Background: Error handling alarm:', error);
        }
      } else if (alarm.name === 'api-call') {
        console.log('Background: API call alarm triggered');
        try {
          const { currentApiAttempt } = await chrome.storage.local.get(['currentApiAttempt']);
          if (!currentApiAttempt) {
            console.log('Background: No current API attempt found');
            return;
          }

          console.log('Background: Processing API call attempt:', currentApiAttempt.attempt);
          
          // Execute the API call directly in the alarm handler
          try {
            console.log('Background: Executing API call via alarm...');
            
            // Use direct fetch (most reliable method)
            const result = await this.directFetchAPI(currentApiAttempt.apiKey, currentApiAttempt.topic);
            
            console.log('Background: API call completed successfully via alarm');
            
            // Store the result for retrieval
            await chrome.storage.local.set({ lastApiResult: result });
            
            // Clear the current attempt
            await chrome.storage.local.remove(['currentApiAttempt']);
            
            // If this was part of a scheduled tweet, continue with posting
            const { isRunning } = await chrome.storage.local.get(['isRunning']);
            if (isRunning) {
              console.log('Background: Continuing with tweet posting after successful API call');
              // Trigger the next step in the tweet generation process
              setTimeout(() => {
                this.checkAndPostTweet().catch(error => {
                  console.error('Background: Error continuing tweet process:', error);
                });
              }, 1000);
            }
          } catch (error) {
            console.error('Background: API call failed in alarm handler:', error);
            
            // Handle retry logic
            if (currentApiAttempt.attempt < 3) {
              console.log('Background: Scheduling retry attempt:', currentApiAttempt.attempt + 1);
              // Increment attempt count
              await chrome.storage.local.set({
                currentApiAttempt: {
                  ...currentApiAttempt,
                  attempt: currentApiAttempt.attempt + 1
                }
              });
              
              // Create new alarm for retry
              await chrome.alarms.create('api-call', {
                delayInMinutes: 0.1 // 6 seconds
              });
            } else {
              console.log('Background: Max retries reached, giving up');
              // Clear the current attempt
              await chrome.storage.local.remove(['currentApiAttempt']);
            }
          }
        } catch (error) {
          console.error('Background: Error handling API call alarm:', error);
        }
      } else if (alarm.name === 'wake-up-check') {
        console.log('Background: Wake-up check alarm triggered');
        try {
          // First check if agent is running before doing anything
          const { isRunning } = await chrome.storage.local.get(['isRunning']);
          
          if (!isRunning) {
            console.log('Background: Wake-up check - agent not running, skipping all operations');
            return;
          }
          
          // Perform keep-alive operations only if agent is running
          await this.keepAlive();
          
          // Check if we need to continue any pending operations
          const { currentApiAttempt, pendingTweet } = await chrome.storage.local.get(['currentApiAttempt', 'pendingTweet']);
          
          if (!currentApiAttempt) {
            // If agent is running but no API attempt in progress, check if we need to post a tweet
            console.log('Background: Wake-up check - agent running, checking tweet schedule');
            await this.checkAndPostTweet();
          } else {
            console.log('Background: Wake-up check - API attempt in progress, continuing...');
          }
          
          // Check for pending tweets that need to be posted
          if (pendingTweet) {
            console.log('Background: Wake-up check - found pending tweet, attempting to post');
            try {
              const postResult = await this.postTweetViaTab(pendingTweet.content);
              if (postResult.success) {
                await chrome.storage.local.remove(['pendingTweet']);
                console.log('Background: Pending tweet posted successfully');
              }
            } catch (error) {
              console.error('Background: Error posting pending tweet:', error);
            }
          }
        } catch (error) {
          console.error('Background: Error handling wake-up check alarm:', error);
        }
      }
    });

    // Handle tab updates to check schedule
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        const data = await chrome.storage.local.get(['isRunning']);
        if (data.isRunning) {
          await this.checkAndPostTweet();
        }
      }
    });

    // Handle browser wake up
    chrome.runtime.onStartup.addListener(async () => {
      const data = await chrome.storage.local.get(['isRunning']);
      if (data.isRunning) {
        await this.checkAndPostTweet();
      }
    });

    // Handle tab removal - cleanup pending tweets
    chrome.tabs.onRemoved.addListener((tabId) => {
      if (this.pendingTweets.has(tabId)) {
        console.log(`Background: Tab ${tabId} closed, cleaning up pending tweet`);
        this.pendingTweets.delete(tabId);
      }
      if (this.twitterTab && this.twitterTab.id === tabId) {
        this.twitterTab = null;
      }
    });
  }

  async startAgent(config) {
    try {
      console.log('Background: Starting agent with config:', config);
      
      if (!config) {
        console.error('Background: No config provided to start agent');
        return { success: false, error: 'No config provided' };
      }

      // Store config and running state in both storages
      await Promise.all([
        chrome.storage.sync.set({ agentConfig: config }),
        chrome.storage.local.set({ 
          isRunning: true,
          lastTweetTime: this.lastTweetTime || Date.now(),
          agentConfig: config
        })
      ]);
      
      // Set up alarm for scheduled tweets
      const intervalMinutes = config?.settings?.interval || 240;
      
      // Clear any existing alarms
      await chrome.alarms.clearAll();
      
      // Create new alarm
      await chrome.alarms.create('tweet-generator', {
        delayInMinutes: 1,
        periodInMinutes: intervalMinutes
      });

      // Update in-memory state
      this.isRunning = true;
      
      // Start periodic checks
      this.startPeriodicChecks(intervalMinutes);
      
      // Activate keep-alive mechanisms
      await this.ensureServiceWorkerActive();
      this.keepAlive();
      
      // NEW: Perform initial login check before the first interval
      console.log('Background: Performing initial login check at startup...');
      const initialLoginResult = await this.performInitialLoginCheck();
      console.log('Background: Initial login check result:', initialLoginResult);
      
      // Note: We don't fail the agent startup if initial login fails
      // The regular interval flow will handle login attempts as before
      if (!initialLoginResult.success) {
        console.log('Background: Initial login check failed, but continuing with agent startup');
        console.log('Background: Regular interval flow will handle login attempts as needed');
      }
      
      // Trigger initial check (this will now skip login if already logged in)
      await this.checkAndPostTweet();
      
      console.log(`Background: Agent started with ${intervalMinutes} minute intervals`);
      return { success: true, message: 'Agent started successfully' };
    } catch (error) {
      console.error('Background: Error starting agent:', error);
      await this.stopAgent();
      return { success: false, error: error.message };
    }
  }

  async stopAgent() {
    try {
      console.log('Background: Stopping agent...');
      
      // Clear all alarms including wake-up-check and persistent alarms
      await chrome.alarms.clearAll();
      
      // Clear interval
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
      
      // Clear keep-alive interval
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = null;
      }
      
      // Reset processing state
      this.isProcessing = false;
      
      // Clear any pending operations
      await chrome.storage.local.remove([
        'currentApiAttempt',
        'lastApiResult',
        'pendingTweet',
        'lastLoginCheck'
      ]);
      
      // Update both storage and memory state
      await chrome.storage.local.set({ 
        isRunning: false,
        lastTweetTime: null,
        isProcessing: false
      });
      
      // Reset in-memory state
      this.isRunning = false;
      this.lastTweetTime = null;
      this.isProcessing = false;
      
      // Clear any pending tweets
      this.pendingTweets.clear();
      
      // Close any open Twitter tabs
      if (this.twitterTab) {
        try {
          await chrome.tabs.remove(this.twitterTab.id);
        } catch (error) {
          console.log('Background: Error closing Twitter tab:', error);
        }
        this.twitterTab = null;
      }
      
      console.log('Background: Agent stopped successfully - all alarms cleared and state reset');
      return { success: true, message: 'Agent stopped successfully' };
    } catch (error) {
      console.error('Background: Error stopping agent:', error);
      return { success: false, error: error.message };
    }
  }

  async getAgentStatus() {
    try {
      const alarms = await chrome.alarms.getAll();
      const config = await chrome.storage.sync.get(['agentConfig']);
      
      // Get current AI configuration
      const aiModel = config.agentConfig?.ai?.model || 'claude';
      const apiKey = config.agentConfig?.ai?.apiKeys?.[aiModel] || config.agentConfig?.anthropicApiKey;
      const hasValidAIKey = !!apiKey;
      
      return {
        isRunning: alarms.length > 0,
        hasAgent: true,
        config: config.agentConfig ? {
          hasAnthropicKey: hasValidAIKey, // Backward compatibility
          hasTwitterCredentials: !!(config.agentConfig.twitter?.username && config.agentConfig.twitter?.password),
          topicsCount: config.agentConfig.topics?.length || 0,
          interval: config.agentConfig.settings?.interval || 240,
          style: config.agentConfig.settings?.style || 'professional but engaging',
          aiModel: aiModel,
          hasValidAIKey: hasValidAIKey
        } : {},
        schedules: alarms.map(alarm => ({
          name: alarm.name,
          periodInMinutes: alarm.periodInMinutes
        }))
      };
    } catch (error) {
      console.error('Error getting agent status:', error);
      return { isRunning: false, hasAgent: false, config: {} };
    }
  }

  async updateConfig(config) {
    try {
      await chrome.storage.sync.set({ agentConfig: config });
      return { success: true, message: 'Configuration updated successfully' };
    } catch (error) {
      console.error('Error updating config:', error);
      return { success: false, error: error.message };
    }
  }

  async testClaudeAPI(apiKey, topic = 'Artificial Intelligence') {
    try {
      console.log('Testing Claude API from background script...');
      console.log('Topic:', topic);
      console.log('API Key present:', !!apiKey);
      
      if (!apiKey) {
        throw new Error('API key is required');
      }

      // Store the current attempt in storage
      await chrome.storage.local.set({ 
        currentApiAttempt: {
          timestamp: Date.now(),
          topic: topic,
          attempt: 1,
          apiKey: apiKey // Store API key for alarm-based execution
        }
      });

      // Create a new alarm for this API call
      await chrome.alarms.create('api-call', {
        delayInMinutes: 0.1 // 6 seconds
      });

      // Also try immediate execution for better responsiveness
      try {
        console.log('Background: Attempting immediate API call...');
        const result = await this.executeClaudeAPICall(apiKey, topic);
        
        // Clear the current attempt since we succeeded immediately
        await chrome.storage.local.remove(['currentApiAttempt']);
        
        return result;
      } catch (error) {
        console.log('Background: Immediate API call failed, will retry via alarm:', error.message);
        // Don't clear currentApiAttempt - let the alarm handle it
        return new Promise((resolve, reject) => {
          // Set up a one-time listener for the API call result
          const listener = async (alarm) => {
            if (alarm.name === 'api-call') {
              try {
                console.log('Background: Executing API call via alarm...');
                const { currentApiAttempt } = await chrome.storage.local.get(['currentApiAttempt']);
                
                if (!currentApiAttempt) {
                  reject(new Error('No current API attempt found'));
                  return;
                }

                const result = await this.executeClaudeAPICall(currentApiAttempt.apiKey, currentApiAttempt.topic);
                
                // Clear the current attempt
                await chrome.storage.local.remove(['currentApiAttempt']);
                
                resolve(result);
              } catch (error) {
                console.error('API call failed via alarm:', error);
                
                // Get current attempt info
                const { currentApiAttempt } = await chrome.storage.local.get(['currentApiAttempt']);
                
                if (currentApiAttempt && currentApiAttempt.attempt < 3) {
                  console.log('Background: Scheduling retry attempt:', currentApiAttempt.attempt + 1);
                  // Increment attempt count
                  await chrome.storage.local.set({
                    currentApiAttempt: {
                      ...currentApiAttempt,
                      attempt: currentApiAttempt.attempt + 1
                    }
                  });
                  
                  // Create new alarm for retry
                  await chrome.alarms.create('api-call', {
                    delayInMinutes: 0.1 // 6 seconds
                  });
                } else {
                  console.log('Background: Max retries reached, giving up');
                  // Clear the current attempt
                  await chrome.storage.local.remove(['currentApiAttempt']);
                  reject(error);
                }
              }
            }
          };

          // Add the listener
          chrome.alarms.onAlarm.addListener(listener);

          // Clean up listener after 30 seconds
          setTimeout(() => {
            chrome.alarms.onAlarm.removeListener(listener);
            reject(new Error('API call timeout'));
          }, 30000);
        });
      }
    } catch (error) {
      console.error('Error testing Claude API:', error);
      return { success: false, error: error.message };
    }
  }

  // NEW: Separate method for executing the actual API call
  async executeClaudeAPICall(apiKey, topic) {
    console.log('Background: Executing Claude API call...');
    
    // Add retry logic for network issues
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Background: API call attempt ${attempt}/${maxRetries}`);
        
        // Use direct fetch with timeout (most reliable method)
        const result = await this.directFetchAPI(apiKey, topic);
        if (result) {
          console.log('Background: Direct fetch successful');
          return result;
        }
        
      } catch (error) {
        lastError = error;
        console.error(`Background: API call attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`Background: Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  // Direct fetch method (simplified - this is working well)
  async directFetchAPI(apiKey, topic) {
    console.log('Background: Attempting direct fetch...');
    
    // Add timeout to prevent hanging
    const timeoutMs = 15000; // 15 seconds timeout
    
    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        console.log('Background: Direct fetch timed out after', timeoutMs, 'ms');
        reject(new Error('Direct fetch timed out - service worker may be suspended or network unavailable'));
      }, timeoutMs);
      
      // Attempt the fetch
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Connection': 'keep-alive'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 150,
          temperature: 0.7,
          messages: [{
            role: 'user',
            content: this.tweetPrompts[Math.floor(Math.random() * this.tweetPrompts.length)].replace('topic', topic)
          }]
        }),
        cache: 'no-store',
        mode: 'cors',
        credentials: 'omit',
        keepalive: true
      })
      .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          return response.text().then(errorText => {
            throw new Error(`Claude API error: ${response.status} - ${errorText}`);
          });
        }
        return response.json();
      })
      .then(data => {
        const tweet = data.content[0].text.trim();
        console.log('Generated tweet via direct fetch:', tweet);
        resolve({
          success: true,
          tweet: tweet,
          topic: topic,
          message: 'Claude API test successful'
        });
      })
      .catch(error => {
        clearTimeout(timeoutId);
        console.log('Background: Direct fetch failed with error:', error.message);
        reject(error);
      });
    });
  }

  async testClaudeAPIWithRetry(apiKey, topic, retries = 3, delay = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Testing Claude API (attempt ${attempt}/${retries})...`);
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 150,
            temperature: 0.7,
            messages: [{
              role: 'user',
              content: this.tweetPrompts[Math.floor(Math.random() * this.tweetPrompts.length)].replace('topic', topic)
            }]
          })
        });

        console.log('API Response status:', response.status);

        if (response.status === 529) {
          // Overloaded - wait longer before retry
          if (attempt < retries) {
            const backoffDelay = delay * Math.pow(2, attempt - 1); // Exponential backoff
            console.log(`API overloaded, waiting ${backoffDelay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            continue;
          }
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`Claude API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const tweet = data.content[0].text.trim();
        
        console.log('Generated tweet:', tweet);
        
        return {
          success: true,
          tweet: tweet,
          topic: topic,
          message: 'Claude API test successful'
        };
      } catch (error) {
        if (attempt === retries) {
          console.error('Error testing Claude API after all retries:', error);
          return { success: false, error: error.message };
        }
        console.log(`Attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async improveClaudeAPI(apiKey, originalTweet) {
    try {
      console.log('Improving tweet with Claude API from background script...');
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true' // Add this required header
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 150,
          temperature: 0.7,
          messages: [{
            role: 'user',
            content: `Improve this tweet to make it more engaging and concise: "${originalTweet}". Keep it under 280 characters.`
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const improvedTweet = data.content[0].text.trim();
      
      return {
        success: true,
        tweet: improvedTweet,
        message: 'Tweet improvement successful'
      };
    } catch (error) {
      console.error('Error improving tweet with Claude API:', error);
      return { success: false, error: error.message };
    }
  }

  async generateMultipleTweets(apiKey, topic, count = 3) {
    try {
      console.log(`Generating ${count} tweets about: ${topic}`);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true' // Add this required header
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          temperature: 0.8,
          messages: [{
            role: 'user',
            content: `Create ${count} different engaging tweets about "${topic}". Each tweet should be under 280 characters, include relevant hashtags, and have a different angle. Separate each tweet with "---".`
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const tweets = data.content[0].text
        .split('---')
        .map(tweet => tweet.trim())
        .filter(tweet => tweet.length > 0);
      
      return {
        success: true,
        tweets: tweets,
        message: 'Multiple tweets generated successfully'
      };
    } catch (error) {
      console.error('Error generating multiple tweets:', error);
      return { success: false, error: error.message };
    }
  }

  // NEW: Main method to post tweet via tab automation
  async postTweetViaTab(content) {
    try {
      console.log('Background: Starting tweet posting via tab automation');
      console.log('Background: Tweet content:', content);

      // First check if we have Twitter credentials
      const config = await chrome.storage.sync.get(['agentConfig']);
      if (!config.agentConfig?.twitter?.username || !config.agentConfig?.twitter?.password || !config.agentConfig?.twitter?.email) {
        console.error('Background: Twitter credentials not configured (requires username, password, and email)');
        return {
          success: false,
          error: 'Twitter credentials not configured (requires username, password, and email)',
          posted: false
        };
      }

      // Create new tab for Twitter
      const tab = await chrome.tabs.create({
        url: 'https://x.com',
        active: true // Make it active for proper login functionality
      });

      console.log('Background: Created Twitter tab:', tab.id);
      this.twitterTab = tab;

      // Store the tweet content for this tab
      this.pendingTweets.set(tab.id, content);

      // Wait for tab to load and content script to be ready
      return new Promise((resolve) => {
        let loginAttempted = false;
        const timeout = setTimeout(() => {
          this.pendingTweets.delete(tab.id);
          chrome.tabs.remove(tab.id).catch(() => {});
          resolve({
            success: false,
            error: 'Timeout waiting for content script to be ready',
            posted: false
          });
        }, 60000); // Increased timeout to 60 seconds for login process

        // Listen for success/failure from content script
        const messageListener = async (request, sender) => {
          if (sender.tab?.id === tab.id) {
            console.log('Background: Received message from content script:', request.action);
            
            if (request.action === 'CONTENT_SCRIPT_READY') {
              console.log('Background: Content script ready, checking login status...');
              
              // Send message to check login status
              chrome.tabs.sendMessage(tab.id, {
                action: 'CHECK_LOGIN'
              }, async (response) => {
                if (chrome.runtime.lastError) {
                  console.error('Background: Error checking login:', chrome.runtime.lastError);
                  return;
                }

                console.log('Background: Login check response:', response);

                if (!response || !response.loggedIn) {
                  if (!loginAttempted) {
                    console.log('Background: Not logged in, navigating to login page...');
                    
                    // First navigate to the proper login page
                    chrome.tabs.update(tab.id, {
                      url: 'https://x.com/i/flow/login'
                    }, () => {
                      // Wait for the login page to load before attempting login
                      const waitForLoginPage = () => {
                        chrome.tabs.get(tab.id, (tabInfo) => {
                          if (chrome.runtime.lastError) {
                            console.error('Background: Error getting tab info during login page load:', chrome.runtime.lastError);
                            return;
                          }
                          
                          console.log('Background: Login page status:', tabInfo.status, 'URL:', tabInfo.url);
                          
                          if (tabInfo.status === 'complete' && tabInfo.url && tabInfo.url.includes('/i/flow/login')) {
                            console.log('Background: Login page loaded completely, attempting login...');
                            loginAttempted = true;
                            
                            // Send login credentials including email
                            chrome.tabs.sendMessage(tab.id, {
                              action: 'LOGIN',
                              credentials: {
                                username: config.agentConfig.twitter.username,
                                password: config.agentConfig.twitter.password,
                                email: config.agentConfig.twitter.email
                              }
                            });
                          } else if (tabInfo.status === 'loading') {
                            console.log('Background: Login page still loading, waiting...');
                            setTimeout(waitForLoginPage, 1000);
                          } else {
                            console.log('Background: Login page not ready yet, waiting...');
                            setTimeout(waitForLoginPage, 1000);
                          }
                        });
                      };
                      
                      // Start waiting for login page to load
                      setTimeout(waitForLoginPage, 2000);
                    });
                  } else {
                    console.error('Background: Login failed after attempt');
                    clearTimeout(timeout);
                    chrome.runtime.onMessage.removeListener(messageListener);
                    resolve({
                      success: false,
                      error: 'Login failed',
                      posted: false
                    });
                  }
                } else {
                  console.log('Background: Login verified, proceeding to post tweet...');
                  // Send tweet content to post
                  chrome.tabs.sendMessage(tab.id, {
                    action: 'POST_TWEET',
                    content: content
                  });
                }
              });
            } else if (request.action === 'TWEET_RESULT') {
              console.log('Background: Tweet result received:', request.result);
              clearTimeout(timeout);
              chrome.runtime.onMessage.removeListener(messageListener);
              
              // Close the Twitter tab after successful tweet posting
              if (request.result.success) {
                console.log('Background: Tweet posted successfully, closing Twitter tab');
                setTimeout(() => {
                  chrome.tabs.remove(tab.id).catch(err => {
                    console.log('Background: Error closing Twitter tab:', err);
                  });
                  this.twitterTab = null;
                }, 3000); // Wait 3 seconds before closing to ensure tweet is fully posted
              }
              
              resolve(request.result);
            } else if (request.action === 'LOGIN_RESULT') {
              console.log('Background: Login result received:', request.result);
              if (request.result.success) {
                // Wait a bit for the page to stabilize after login
                await new Promise(resolve => setTimeout(resolve, 5000));
                // Send tweet content to post
                chrome.tabs.sendMessage(tab.id, {
                  action: 'POST_TWEET',
                  content: content
                });
              } else {
                clearTimeout(timeout);
                chrome.runtime.onMessage.removeListener(messageListener);
                resolve({
                  success: false,
                  error: 'Login failed: ' + request.result.error,
                  posted: false
                });
              }
            }
          }
        };

        chrome.runtime.onMessage.addListener(messageListener);
      });

    } catch (error) {
      console.error('Background: Error in postTweetViaTab:', error);
      return {
        success: false,
        error: error.message,
        posted: false
      };
    }
  }

  async generateAndPostTweet() {
    try {
      console.log('Generating scheduled tweet...');
      
      // Check if agent is still running before proceeding
      const { isRunning } = await chrome.storage.local.get(['isRunning']);
      if (!isRunning) {
        console.log('Background: Agent stopped, aborting tweet generation');
        return { success: false, error: 'Agent stopped' };
      }
      
      const { agentConfig } = await chrome.storage.sync.get(['agentConfig']);
      if (!agentConfig) {
        console.error('No config found');
        return { success: false, error: 'No config found' };
      }

      // Get current AI configuration
      const aiModel = agentConfig.ai?.model || 'claude';
      const apiKey = agentConfig.ai?.apiKeys?.[aiModel] || agentConfig.anthropicApiKey;
      
      if (!apiKey) {
        console.error('No API key found');
        return { success: false, error: `${aiModel} API key not configured` };
      }

      const topics = agentConfig.topics || ['Technology'];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      // Check if there's already an API attempt in progress
      const { currentApiAttempt } = await chrome.storage.local.get(['currentApiAttempt']);
      
      let result;
      if (currentApiAttempt) {
        console.log('Background: API attempt already in progress, waiting for completion...');
        // Wait for the API call to complete via alarm
        result = await this.waitForAPICompletion();
      } else {
        // Use the appropriate API based on model
        switch (aiModel) {
          case 'claude':
            result = await this.testClaudeAPI(apiKey, randomTopic);
            break;
          case 'openai':
            result = await this.testOpenAIAPI(apiKey, randomTopic);
            break;
          case 'gemini':
            result = await this.testGeminiAPI(apiKey, randomTopic);
            break;
          default:
            return { success: false, error: `Unsupported AI model: ${aiModel}` };
        }
      }
      
      // Check again if agent is still running after API call
      const { isRunning: stillRunning } = await chrome.storage.local.get(['isRunning']);
      if (!stillRunning) {
        console.log('Background: Agent stopped during API call, aborting tweet posting');
        return { success: false, error: 'Agent stopped during processing' };
      }
      
      if (result && result.success) {
        console.log('Scheduled tweet generated:', result.tweet);
        
        // Store the tweet for posting in case service worker is suspended
        await chrome.storage.local.set({
          pendingTweet: {
            content: result.tweet,
            timestamp: Date.now(),
            topic: randomTopic
          }
        });
        
        // Post via tab automation
        const postResult = await this.postTweetViaTab(result.tweet);
        console.log('Background: Scheduled tweet posting result:', postResult);
        
        // Clear pending tweet if successful
        if (postResult.success) {
          await chrome.storage.local.remove(['pendingTweet']);
        }
        
        return {
          success: true,
          tweet: result.tweet,
          posted: postResult.success,
          postError: postResult.success ? null : postResult.error
        };
      } else {
        console.error('Failed to generate scheduled tweet:', result?.error || 'Unknown error');
        return result || { success: false, error: 'Failed to generate tweet' };
      }
      
    } catch (error) {
      console.error('Error in generateAndPostTweet:', error);
      return { success: false, error: error.message };
    }
  }

  // NEW: Method to wait for API completion when called via alarm
  async waitForAPICompletion(timeoutMs = 60000) {
    console.log('Background: Waiting for API completion...');
    
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkCompletion = async () => {
        try {
          const { currentApiAttempt } = await chrome.storage.local.get(['currentApiAttempt']);
          
          if (!currentApiAttempt) {
            // API attempt completed, check if we have a result stored
            const { lastApiResult } = await chrome.storage.local.get(['lastApiResult']);
            if (lastApiResult) {
              await chrome.storage.local.remove(['lastApiResult']);
              resolve(lastApiResult);
            } else {
              reject(new Error('API attempt completed but no result found'));
            }
            return;
          }
          
          // Check timeout
          if (Date.now() - startTime > timeoutMs) {
            reject(new Error('Timeout waiting for API completion'));
            return;
          }
          
          // Continue checking
          setTimeout(checkCompletion, 1000);
        } catch (error) {
          reject(error);
        }
      };
      
      checkCompletion();
    });
  }

  // New method to handle background fetch with wake lock
  async performBackgroundFetch(url, options) {
    try {
      // Request wake lock if available
      let wakeLock = null;
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
        } catch (error) {
          console.log('Wake lock request failed:', error);
        }
      }

      try {
        const response = await fetch(url, {
          ...options,
          keepalive: true,
          signal: options.signal
        });
        return response;
      } finally {
        // Release wake lock if acquired
        if (wakeLock) {
          try {
            await wakeLock.release();
          } catch (error) {
            console.log('Wake lock release failed:', error);
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // Enhanced keep-alive mechanism
  async keepAlive() {
    try {
      // Check if agent is running before performing keep-alive operations
      const { isRunning } = await chrome.storage.local.get(['isRunning']);
      if (!isRunning) {
        console.log('Background: Agent not running, skipping keep-alive operations');
        return;
      }
      
      if (!this.keepAliveInterval) {
        this.keepAliveInterval = setInterval(async () => {
          try {
            // Check if agent is still running before each keep-alive operation
            const { isRunning: stillRunning } = await chrome.storage.local.get(['isRunning']);
            if (!stillRunning) {
              console.log('Background: Agent stopped, clearing keep-alive interval');
              clearInterval(this.keepAliveInterval);
              this.keepAliveInterval = null;
              return;
            }
            
            // Perform a lightweight operation to keep the service worker active
            await chrome.storage.local.get(['isRunning']);
            
            // If we have a Twitter tab, send a ping to it
            if (this.twitterTab) {
              try {
                await chrome.tabs.sendMessage(this.twitterTab.id, { action: 'PING' });
              } catch (error) {
                // Ignore errors from tab messaging
              }
            }

            // Request wake lock if available
            if ('wakeLock' in navigator) {
              try {
                const wakeLock = await navigator.wakeLock.request('screen');
                setTimeout(() => wakeLock.release(), 1000);
              } catch (error) {
                // Ignore wake lock errors
              }
            }

            // Keep the service worker active with a simple ping
            try {
              await chrome.runtime.sendMessage({ action: 'PING' });
            } catch (error) {
              // Ignore ping errors
            }

            // Additional keep-alive: Create a temporary alarm and clear it
            try {
              const tempAlarmName = `keep-alive-${Date.now()}`;
              await chrome.alarms.create(tempAlarmName, { delayInMinutes: 0.01 });
              setTimeout(() => {
                chrome.alarms.clear(tempAlarmName).catch(() => {});
              }, 100);
            } catch (error) {
              // Ignore alarm errors
            }
          } catch (error) {
            console.log('Keep alive operation failed:', error);
          }
        }, 10000); // Keep alive every 10 seconds
      }
    } catch (error) {
      console.log('Error in keepAlive:', error);
    }
  }

  // NEW: Additional method to ensure service worker stays active
  async ensureServiceWorkerActive() {
    try {
      // Create a persistent alarm that never fires but keeps the service worker alive
      await chrome.alarms.create('persistent-keep-alive', {
        delayInMinutes: 525600 // 1 year - effectively never
      });

      // Set up periodic wake-up alarms
      await chrome.alarms.create('wake-up-check', {
        delayInMinutes: 1,
        periodInMinutes: 5 // Check every 5 minutes
      });

      console.log('Background: Service worker keep-alive mechanisms activated');
    } catch (error) {
      console.error('Background: Error setting up service worker keep-alive:', error);
    }
  }

  async shouldCheckTweet() {
    const now = Date.now();
    if (now - this.lastCheckTime < this.minCheckInterval) {
      console.log('Background: Too soon since last check, skipping');
      return false;
    }
    this.lastCheckTime = now;
    return true;
  }

  async checkAndPostTweet() {
    // Early check: if agent is not running, don't proceed
    const { isRunning } = await chrome.storage.local.get(['isRunning']);
    if (!isRunning) {
      console.log('Background: Agent not running, skipping checkAndPostTweet');
      return;
    }
    
    // Check if already processing or too soon since last check
    if (this.isProcessing) {
      console.log('Background: Already processing a tweet, skipping check');
      return;
    }

    if (!await this.shouldCheckTweet()) {
      return;
    }

    try {
      this.isProcessing = true;
      
      // Get latest state from both storages
      const [localData, syncData] = await Promise.all([
        chrome.storage.local.get(['isRunning', 'agentConfig', 'lastTweetTime']),
        chrome.storage.sync.get(['agentConfig'])
      ]);
      
      // Double-check running state
      if (!localData.isRunning) {
        console.log('Background: Agent stopped during processing, aborting');
        return;
      }
      
      // Use config from either storage
      const config = localData.agentConfig || syncData.agentConfig;
      
      if (!config) {
        console.log('Background: No config found in any storage');
        return;
      }

      // If agent is not running but we have config, restart it
      if (!localData.isRunning && config) {
        console.log('Background: Restarting agent with existing config');
        await this.startAgent(config);
        return;
      }

      if (!localData.isRunning) {
        console.log('Background: Agent not running, skipping check');
        return;
      }

      const now = Date.now();
      const lastTweetTime = localData.lastTweetTime || 0;
      const intervalMs = (config.settings?.interval || 240) * 60 * 1000;

      console.log('Background: Checking tweet schedule:', {
        now,
        lastTweetTime,
        intervalMs,
        timeSinceLastTweet: now - lastTweetTime,
        isRunning: localData.isRunning,
        timeSinceLastCheck: now - this.lastCheckTime
      });

      // Check if enough time has passed since last tweet
      if (now - lastTweetTime >= intervalMs) {
        console.log('Background: Time to post a new tweet');
        const result = await this.generateAndPostTweet();
        
        if (result.success) {
          // Update both memory and storage
          this.lastTweetTime = now;
          await chrome.storage.local.set({ 
            lastTweetTime: now,
            isRunning: true,
            agentConfig: config
          });
          console.log('Background: Tweet posted successfully');
        } else {
          console.error('Background: Failed to post tweet:', result.error);
        }
      } else {
        console.log('Background: Not enough time has passed since last tweet');
      }
    } catch (error) {
      console.error('Background: Error in checkAndPostTweet:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  startPeriodicChecks(intervalMinutes) {
    // Clear any existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Convert minutes to milliseconds
    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Start periodic checks
    this.checkInterval = setInterval(async () => {
      console.log('Background: Periodic check triggered');
      try {
        // First check if agent is still running
        const { isRunning } = await chrome.storage.local.get(['isRunning']);
        if (!isRunning) {
          console.log('Background: Agent not running, clearing interval');
          clearInterval(this.checkInterval);
          this.checkInterval = null;
          return;
        }
        
        // Ensure service worker stays active
        this.keepAlive();
        
        // Only proceed if not already processing
        if (!this.isProcessing) {
          await this.checkAndPostTweet();
        }
      } catch (error) {
        console.error('Background: Error in periodic check:', error);
      }
    }, intervalMs);

    // Also set up a more frequent check (every minute) to catch up if we missed any
    const frequentCheckInterval = setInterval(async () => {
      try {
        // First check if agent is still running
        const { isRunning } = await chrome.storage.local.get(['isRunning']);
        if (!isRunning) {
          console.log('Background: Agent not running, clearing frequent check interval');
          clearInterval(frequentCheckInterval);
          return;
        }
        
        // Ensure service worker stays active
        this.keepAlive();
        
        // Only proceed if not already processing
        if (!this.isProcessing) {
          await this.checkAndPostTweet();
        }
      } catch (error) {
        console.error('Background: Error in frequent check:', error);
      }
    }, 60000); // Check every minute
  }

  // NEW: Method for manual tweet generation and posting (doesn't require agent to be running)
  async generateAndPostTweetManual() {
    try {
      console.log('Background: Generating manual tweet...');
      
      // Get config from storage
      const config = await chrome.storage.sync.get(['agentConfig']);
      if (!config.agentConfig) {
        console.error('Background: No config found for manual tweet');
        return { success: false, error: 'No config found' };
      }

      // Get current AI configuration
      const aiModel = config.agentConfig.ai?.model || 'claude';
      const apiKey = config.agentConfig.ai?.apiKeys?.[aiModel] || config.agentConfig.anthropicApiKey;
      
      if (!apiKey) {
        console.error('Background: No API key found for manual tweet');
        return { success: false, error: `${aiModel} API key not configured` };
      }

      const topics = config.agentConfig.topics || ['Technology'];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      console.log('Background: Generating tweet about:', randomTopic, 'using', aiModel);
      
      // Generate tweet using the appropriate API based on model
      let result;
      switch (aiModel) {
        case 'claude':
          result = await this.testClaudeAPIWithRetry(apiKey, randomTopic);
          break;
        case 'openai':
          result = await this.testOpenAIAPI(apiKey, randomTopic);
          break;
        case 'gemini':
          result = await this.testGeminiAPI(apiKey, randomTopic);
          break;
        default:
          return { success: false, error: `Unsupported AI model: ${aiModel}` };
      }
      
      if (result && result.success) {
        console.log('Background: Manual tweet generated:', result.tweet);
        
        // Post the generated tweet via tab automation
        const postResult = await this.postTweetViaTab(result.tweet);
        console.log('Background: Manual tweet posting result:', postResult);
        
        return {
          success: true,
          tweet: result.tweet,
          topic: randomTopic,
          posted: postResult.success,
          postError: postResult.success ? null : postResult.error
        };
      } else {
        console.error('Background: Failed to generate manual tweet:', result?.error || 'Unknown error');
        return result || { success: false, error: 'Failed to generate tweet' };
      }
      
    } catch (error) {
      console.error('Background: Error in generateAndPostTweetManual:', error);
      return { success: false, error: error.message };
    }
  }

  // OpenAI API methods
  async testOpenAIAPI(apiKey, topic = 'Artificial Intelligence') {
    try {
      console.log('Testing OpenAI API from background script...');
      console.log('Topic:', topic);
      console.log('API Key present:', !!apiKey);
      
      if (!apiKey) {
        throw new Error('API key is required');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          max_tokens: 150,
          temperature: 0.7,
          messages: [{
            role: 'user',
            content: this.tweetPrompts[Math.floor(Math.random() * this.tweetPrompts.length)].replace('topic', topic)
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const tweet = data.choices[0].message.content.trim();
      
      console.log('Generated tweet via OpenAI:', tweet);
      
      return {
        success: true,
        tweet: tweet,
        topic: topic,
        message: 'OpenAI API test successful'
      };
    } catch (error) {
      console.error('Error testing OpenAI API:', error);
      return { success: false, error: error.message };
    }
  }

  async improveOpenAIAPI(apiKey, originalTweet) {
    try {
      console.log('Improving tweet with OpenAI API from background script...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          max_tokens: 150,
          temperature: 0.7,
          messages: [{
            role: 'user',
            content: `Improve this tweet to make it more engaging and concise: "${originalTweet}". Keep it under 280 characters.`
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const improvedTweet = data.choices[0].message.content.trim();
      
      return {
        success: true,
        tweet: improvedTweet,
        message: 'Tweet improvement successful'
      };
    } catch (error) {
      console.error('Error improving tweet with OpenAI API:', error);
      return { success: false, error: error.message };
    }
  }

  async generateMultipleOpenAITweets(apiKey, topic, count = 3) {
    try {
      console.log(`Generating ${count} tweets with OpenAI about: ${topic}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          max_tokens: 500,
          temperature: 0.8,
          messages: [{
            role: 'user',
            content: `Create ${count} different engaging tweets about "${topic}". Each tweet should be under 280 characters, include relevant hashtags, and have a different angle. Separate each tweet with "---".`
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const tweets = data.choices[0].message.content
        .split('---')
        .map(tweet => tweet.trim())
        .filter(tweet => tweet.length > 0);
      
      return {
        success: true,
        tweets: tweets,
        message: 'Multiple tweets generated successfully'
      };
    } catch (error) {
      console.error('Error generating multiple tweets with OpenAI:', error);
      return { success: false, error: error.message };
    }
  }

  // Gemini API methods
  async testGeminiAPI(apiKey, topic = 'Artificial Intelligence') {
    try {
      console.log('Testing Gemini API from background script...');
      console.log('Topic:', topic);
      console.log('API Key present:', !!apiKey);
      
      if (!apiKey) {
        throw new Error('API key is required');
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: this.tweetPrompts[Math.floor(Math.random() * this.tweetPrompts.length)].replace('topic', topic)
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const tweet = data.candidates[0].content.parts[0].text.trim();
      
      console.log('Generated tweet via Gemini:', tweet);
      
      return {
        success: true,
        tweet: tweet,
        topic: topic,
        message: 'Gemini API test successful'
      };
    } catch (error) {
      console.error('Error testing Gemini API:', error);
      return { success: false, error: error.message };
    }
  }

  async improveGeminiAPI(apiKey, originalTweet) {
    try {
      console.log('Improving tweet with Gemini API from background script...');
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Improve this tweet to make it more engaging and concise: "${originalTweet}". Keep it under 280 characters.`
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const improvedTweet = data.candidates[0].content.parts[0].text.trim();
      
      return {
        success: true,
        tweet: improvedTweet,
        message: 'Tweet improvement successful'
      };
    } catch (error) {
      console.error('Error improving tweet with Gemini API:', error);
      return { success: false, error: error.message };
    }
  }

  async generateMultipleGeminiTweets(apiKey, topic, count = 3) {
    try {
      console.log(`Generating ${count} tweets with Gemini about: ${topic}`);
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create ${count} different engaging tweets about "${topic}". Each tweet should be under 280 characters, include relevant hashtags, and have a different angle. Separate each tweet with "---".`
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const tweets = data.candidates[0].content.parts[0].text
        .split('---')
        .map(tweet => tweet.trim())
        .filter(tweet => tweet.length > 0);
      
      return {
        success: true,
        tweets: tweets,
        message: 'Multiple tweets generated successfully'
      };
    } catch (error) {
      console.error('Error generating multiple tweets with Gemini:', error);
      return { success: false, error: error.message };
    }
  }

  // NEW: Method to perform initial login check at startup
  async performInitialLoginCheck() {
    try {
      console.log('Background: Performing initial login check...');
      
      // Check if we have Twitter credentials
      const config = await chrome.storage.sync.get(['agentConfig']);
      if (!config.agentConfig?.twitter?.username || !config.agentConfig?.twitter?.password || !config.agentConfig?.twitter?.email) {
        console.log('Background: Twitter credentials not configured, skipping initial login check');
        return { success: true, message: 'No Twitter credentials configured' };
      }

      // Create new tab for Twitter home page
      const tab = await chrome.tabs.create({
        url: 'https://x.com/home',
        active: true // Make it active for proper login functionality
      });

      console.log('Background: Created Twitter tab for initial login check:', tab.id);

      // Wait for tab to load and content script to be ready
      return new Promise((resolve) => {
        let loginAttempted = false;
        const timeout = setTimeout(() => {
          chrome.tabs.remove(tab.id).catch(() => {});
          resolve({
            success: false,
            error: 'Timeout during initial login check',
            loggedIn: false
          });
        }, 60000); // Increased timeout to 60 seconds for login process

        // First, wait for the tab to be fully loaded
        const checkTabLoaded = () => {
          chrome.tabs.get(tab.id, (tabInfo) => {
            if (chrome.runtime.lastError) {
              console.error('Background: Error getting tab info:', chrome.runtime.lastError);
              clearTimeout(timeout);
              resolve({
                success: false,
                error: 'Tab not found',
                loggedIn: false
              });
              return;
            }
            
            console.log('Background: Tab status:', tabInfo.status, 'URL:', tabInfo.url);
            
            if (tabInfo.status === 'complete') {
              console.log('Background: Tab loaded completely, checking URL...');
              
              // Check if we're still on home page (logged in) or redirected to login
              if (tabInfo.url && tabInfo.url.includes('/home')) {
                console.log('Background: Successfully accessed home page - user is logged in');
                clearTimeout(timeout);
                chrome.tabs.remove(tab.id).catch(() => {});
                
                // Store login status for future reference
                chrome.storage.local.set({ 
                  lastLoginCheck: {
                    timestamp: Date.now(),
                    loggedIn: true,
                    success: true
                  }
                });
                
                resolve({
                  success: true,
                  message: 'Already logged in (confirmed via home page access)',
                  loggedIn: true
                });
              } else if (tabInfo.url && (tabInfo.url.includes('/login') || tabInfo.url.includes('/i/flow/login'))) {
                console.log('Background: Redirected to login page - user is not logged in');
                // User is not logged in, proceed with login
                performLogin();
              } else {
                console.log('Background: Unknown URL, checking again in 2 seconds...');
                setTimeout(checkTabLoaded, 2000);
              }
            } else if (tabInfo.status === 'loading') {
              console.log('Background: Tab still loading, checking again in 1 second...');
              setTimeout(checkTabLoaded, 1000);
              return;
            } else {
              console.log('Background: Tab status unknown:', tabInfo.status);
            }
          });
        };
        
        // Function to perform login
        const performLogin = () => {
          console.log('Background: Not logged in, navigating to login page...');
          
          // First navigate to the proper login page
          chrome.tabs.update(tab.id, {
            url: 'https://x.com/i/flow/login'
          }, () => {
            // Wait for the login page to load before attempting login
            const waitForLoginPage = () => {
              chrome.tabs.get(tab.id, (tabInfo) => {
                if (chrome.runtime.lastError) {
                  console.error('Background: Error getting tab info during login page load:', chrome.runtime.lastError);
                  return;
                }
                
                console.log('Background: Login page status:', tabInfo.status, 'URL:', tabInfo.url);
                
                if (tabInfo.status === 'complete' && tabInfo.url && tabInfo.url.includes('/i/flow/login')) {
                  console.log('Background: Login page loaded completely, attempting login...');
                  loginAttempted = true;
                  
                  // Send login credentials including email
                  chrome.tabs.sendMessage(tab.id, {
                    action: 'LOGIN',
                    credentials: {
                      username: config.agentConfig.twitter.username,
                      password: config.agentConfig.twitter.password,
                      email: config.agentConfig.twitter.email
                    }
                  });
                } else if (tabInfo.status === 'loading') {
                  console.log('Background: Login page still loading, waiting...');
                  setTimeout(waitForLoginPage, 1000);
                } else {
                  console.log('Background: Login page not ready yet, waiting...');
                  setTimeout(waitForLoginPage, 1000);
                }
              });
            };
            
            // Start waiting for login page to load
            setTimeout(waitForLoginPage, 2000);
          });
        };
        
        // Start checking tab status
        setTimeout(checkTabLoaded, 2000); // Wait 2 seconds before first check

        // Listen for success/failure from content script
        const messageListener = async (request, sender) => {
          if (sender.tab?.id === tab.id) {
            console.log('Background: Initial login check - received message:', request.action);
            
            if (request.action === 'CONTENT_SCRIPT_READY') {
              console.log('Background: Content script ready for initial login check...');
              // Don't immediately check login status, let the URL check handle it
            } else if (request.action === 'LOGIN_RESULT') {
              console.log('Background: Initial login result received:', request.result);
              clearTimeout(timeout);
              chrome.runtime.onMessage.removeListener(messageListener);
              chrome.tabs.remove(tab.id).catch(() => {});
              
              // Store login status for future reference
              await chrome.storage.local.set({ 
                lastLoginCheck: {
                  timestamp: Date.now(),
                  loggedIn: request.result.success,
                  success: request.result.success
                }
              });
              
              if (request.result.success) {
                resolve({
                  success: true,
                  message: 'Initial login successful',
                  loggedIn: true
                });
              } else {
                resolve({
                  success: false,
                  error: 'Initial login failed: ' + request.result.error,
                  loggedIn: false
                });
              }
            } else {
              // Log any other messages for debugging
              console.log('Background: Initial login check - unexpected message:', request.action);
            }
          }
        };

        chrome.runtime.onMessage.addListener(messageListener);
      });

    } catch (error) {
      console.error('Background: Error in performInitialLoginCheck:', error);
      return {
        success: false,
        error: error.message,
        loggedIn: false
      };
    }
  }
}

// Initialize the background agent
console.log('Background script loading...');
// eslint-disable-next-line no-unused-vars
const backgroundAgent = new BackgroundTwitterAgent();
console.log('Background agent initialized');