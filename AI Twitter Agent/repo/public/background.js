/* global chrome */

const ALARMS = {
  KEEP_ALIVE: 'service-worker-keep-alive',
  TWEET_GENERATOR: 'tweet-generator',
  WAKE_UP: 'wake-up-check'
};

class BackgroundTwitterAgent {
  constructor() {
    this.setupMessageHandlers();
    this.webContentsId = 2;  // Fixed WebContents ID for Twitter operations
    this.lastTweetTime = null;
    this.isRunning = false;
    this.checkInterval = null;
    this.isProcessing = false;
    this.lastCheckTime = 0;
    this.minCheckInterval = 30000;
    this.initializePersistentState();
    this.tweetPrompts = [
      `Create an engaging tweet about topic. Keep it under 280 characters with relevant hashtags. Make it original and thought-provoking. Never exceed 280 characters including hashtags. Output only the tweet and nothing else.`,
      `Create a humorous tweet about topic. Keep it under 280 characters with clever wordplay or puns. Make it light-hearted and witty with relevant hashtags. Never exceed 280 characters including hashtags. Output only the tweet and nothing else.`,
      `Create an engaging tweet about topic. Use poetic language or metaphor. Keep it under 280 characters. Add hashtags that reflect a creative or emotional tone. Never exceed 280 characters including hashtags. Output only the tweet and nothing else.`,
      `Create an educational tweet about topic. Include a surprising fact or stat. Keep it under 280 characters. Use informative hashtags. Never exceed 280 characters including hashtags. Output only the tweet and nothing else.`,
      `Create a futuristic tweet about topic. Imagine the year is 2040. Keep it under 280 characters. Use hashtags to reflect innovation and vision. Never exceed 280 characters including hashtags. Output only the tweet and nothing else.`,
      `Create a tweet about topic in the voice of a fictional character. Keep it under 280 characters. Make it fun and character-driven with unique hashtags. Never exceed 280 characters including hashtags. Output only the tweet and nothing else.`,
      `Create a thought-provoking tweet about topic using a question. Keep it under 280 characters. Encourage replies and add conversation-starting hashtags. Never exceed 280 characters including hashtags. Output only the tweet and nothing else.`,
      `Create a sarcastic tweet about topic. Keep it under 280 characters with biting humor. Use relevant satirical hashtags. Never exceed 280 characters including hashtags. Output only the tweet and nothing else.`,
      `Create an engaging tweet about topic from a beginner's perspective. Keep it under 280 characters. Use encouraging and relatable hashtags. Never exceed 280 characters including hashtags. Output only the tweet and nothing else.`,
      `Create a tweet about topic as if it's breaking news. Keep it under 280 characters. Use dramatic flair and trending news hashtags. Never exceed 280 characters including hashtags. Output only the tweet and nothing else.`
    ];    
    this.loginCheckValidityMs = 5 * 60 * 1000; // 5 minutes
    this.lastLoginCheck = null;
    this.setupKeepAlive();
  }

  setupKeepAlive() {
    chrome.alarms.create(ALARMS.KEEP_ALIVE, { 
      periodInMinutes: 0.1
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === ALARMS.KEEP_ALIVE) {
        console.log("🟢 Background Service Worker Active:", new Date().toISOString());
        if (this.isRunning) {
          console.log("📊 Agent Status: Running");
        } else {
          console.log("📊 Agent Status: Not Running");
        }
      }
    });
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
        console.log('Background: Agent is running, ensuring keep-alive mechanisms');
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

          case 'CLAUDE_GENERATE':
            const claudeResult = await this.claudeGenerate(request.apiKey, request.topic);
            sendResponse(claudeResult);
            break;
              
          case 'OPENAI_GENERATE':
            const openaiResult = await this.openaiGenerate(request.apiKey, request.topic);
            sendResponse(openaiResult);
            break;

          case 'GEMINI_GENERATE':
            const geminiResult = await this.geminiGenerate(request.apiKey, request.topic);
            sendResponse(geminiResult);
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

          case 'CONTENT_SCRIPT_READY':
            sendResponse({ success: true });
            return false;

          case 'TWEET_RESULT':
            sendResponse({ success: true });
            return false;

          case 'LOGIN_RESULT':
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
      if (alarm.name === ALARMS.TWEET_GENERATOR) {
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
      } else if (alarm.name === ALARMS.WAKE_UP) {
        console.log('Background: Wake-up check alarm triggered');
        try {
          const { isRunning } = await chrome.storage.local.get(['isRunning']);
          
          if (!isRunning) {
            console.log('Background: Wake-up check - agent not running, skipping all operations');
            return;
          }
          
          const { currentApiAttempt } = await chrome.storage.local.get(['currentApiAttempt']);
          
          if (!currentApiAttempt) {
            console.log('Background: Wake-up check - agent running, checking tweet schedule');
            await this.checkAndPostTweet();
          } else {
            console.log('Background: Wake-up check - API attempt in progress, continuing...');
          }
        } catch (error) {
          console.error('Background: Error handling wake-up check alarm:', error);
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
  }

  async startAgent(config) {
    try {
      console.log('Background: Starting agent with config:', config);
      
      if (!config) {
        console.error('Background: No config provided to start agent');
        return { success: false, error: 'No config provided' };
      }

      // Clear only agent-related alarms
      await this.clearAgentAlarms();

      // Create tweet generator alarm - trigger 20 seconds before the interval
      const intervalInSeconds = config.settings.interval * 60;
      const targetSeconds = Math.max(intervalInSeconds - 20, 10); // Minimum 10 seconds
      const targetMinutes = targetSeconds / 60;

      await chrome.alarms.create(ALARMS.TWEET_GENERATOR, {
        delayInMinutes: targetMinutes,
        periodInMinutes: config.settings.interval,
      });

      // Create wake-up check alarm
      await chrome.alarms.create(ALARMS.WAKE_UP, {
        delayInMinutes: 1,
        periodInMinutes: 5
      });
      
      // Store config and running state in both storages
      await Promise.all([
        chrome.storage.sync.set({ agentConfig: config }),
        chrome.storage.local.set({ 
          isRunning: true,
          lastTweetTime: this.lastTweetTime || Date.now(),
          agentConfig: config
        })
      ]);
      
      // Update in-memory state
      this.isRunning = true;
      
      // Start periodic checks
      this.startPeriodicChecks(config.settings.interval);
      
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
      
      console.log(`Background: Agent started with ${config.settings.interval} minute intervals`);
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
      
      // Clear only agent-related alarms
      await this.clearAgentAlarms();
      
      // Set running state to false first to prevent new operations
      this.isRunning = false;
      await chrome.storage.local.set({ isRunning: false });
      
      // Clear all intervals
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
      
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = null;
      }
      
      // Reset all state
      this.isProcessing = false;
      this.lastTweetTime = null;
      this.lastLoginCheck = null;
      
      // Clear storage
      await chrome.storage.local.remove([
        'isRunning',
        'lastTweetTime',
        'pendingTweet',
        'currentApiAttempt',
        'lastApiResult',
        'lastLoginCheck',
        'isProcessing'
      ]);
      
      // Destroy any existing WebContents
      await this.destroyTwitterWebContents().catch(() => {});
      
      // Remove all message listeners
      chrome.runtime.onMessage.removeListener(this.messageListener);
      
      console.log('Background: Agent stopped successfully - all state cleared');
      return { success: true, message: 'Agent stopped successfully' };
    } catch (error) {
      console.error('Background: Error stopping agent:', error);
      return { success: false, error: error.message };
    }
  }

  async getAgentStatus() {
    try {
      const [localData, alarms, config] = await Promise.all([
        chrome.storage.local.get(['isRunning']),
        chrome.alarms.getAll(),
        chrome.storage.sync.get(['agentConfig'])
      ]);
      
      const aiModel = config.agentConfig?.ai?.model;
      const apiKey = config.agentConfig?.ai?.apiKeys?.[aiModel];
      const hasValidAIKey = !!apiKey;

      const hasTweetGeneratorAlarm = alarms.some(
        alarm => alarm.name === ALARMS.TWEET_GENERATOR
      );
      
      const isRunning = !!(
        localData.isRunning &&
        hasTweetGeneratorAlarm && 
        config.agentConfig 
      );
      
      return {
        isRunning,
        hasAgent: true,
        config: config.agentConfig ? {
          hasTwitterCredentials: !!(config.agentConfig.twitter?.username && config.agentConfig.twitter?.password),
          topicsCount: config.agentConfig.topics?.length,
          interval: config.agentConfig.settings?.interval,
          style: config.agentConfig.settings?.style || 'professional but engaging',
          aiModel: aiModel,
          hasValidAIKey: hasValidAIKey
        } : {},
        schedules: alarms
          .filter(alarm => alarm.name !== ALARMS.KEEP_ALIVE) // Filter out keep-alive alarm
          .map(alarm => ({
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
      
      // If agent is running, restart with new config
      const { isRunning } = await chrome.storage.local.get(['isRunning']);
      if (isRunning) {
        await this.stopAgent();
        await this.startAgent(config);
      }
      
      return { success: true, message: 'Configuration updated successfully' };
    } catch (error) {
      console.error('Error updating config:', error);
      return { success: false, error: error.message };
    }
  }

  async postTweetViaTab(content, retryCount = 0, maxAttempts = 2) {
    try {
      console.log('Background: Starting tweet posting via WebContents');
      console.log('Background: Starting tweet posting attempt', { retryCount });
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

      // Check login status
      const loginStatus = await this.checkLoginStatusInWebContents();

      if (!loginStatus.success || !loginStatus.loggedIn) {
        console.log('Background: Not logged in, checking login status again...');
        const loginStatus2 = await this.checkLoginStatusInWebContents();
        if (!loginStatus2.success || !loginStatus2.loggedIn) {
          console.log('Background: Not logged in, performing login...');
          const loginResult = await this.performLoginInVisibleTab();
          if (!loginResult.success) {
            return { 
              success: false, 
              error: 'Login failed: ' + loginResult.error, 
              posted: false 
            };
          }
        }
      }

      // Create WebContents for posting
      await this.createTwitterWebContents();

      return new Promise((resolve) => {
        const timeout = setTimeout(async () => {
          // await this.destroyTwitterWebContents();
          if (retryCount < maxAttempts) {
            // Check if agent is still running before retry
            const { isRunning } = await chrome.storage.local.get(['isRunning']);
            if (!isRunning) {
              console.log('Background: Agent stopped, aborting retry');
              resolve({
                success: false,
                error: 'Agent stopped',
                posted: false
              });
              return;
            }
            console.log('Background: Tweet posting timeout, retrying...', {
              attempt: retryCount + 1
            });
            resolve(this.postTweetViaTab(content, retryCount + 1));
          } else {
            resolve({
              success: false,
              error: 'Timeout waiting for tweet posting after all retries',
              posted: false
            });
          }
        }, 90000);

        const messageListener = async (request) => {
          console.log('Background: Received message during tweet posting:', {
            action: request.action,
            timestamp: new Date().toISOString()
          });

          let hasReceivedReady = false;
          if (request.action === 'CONTENT_SCRIPT_READY' && !hasReceivedReady) {
            hasReceivedReady = true;
            console.log('Background: Content script ready, sending tweet content...');
            chrome.tabs.sendMessage(this.webContentsId, {
              action: 'POST_TWEET',
              content: content
            });
          } else if (request.action === 'TWEET_RESULT') {
            clearTimeout(timeout);
            chrome.runtime.onMessage.removeListener(messageListener);
            
            // Enhanced result verification
            const tweetResult = request.result;
            console.log('Background: Received tweet result:', {
              success: tweetResult.success,
              posted: tweetResult.posted,
              message: tweetResult.message,
              verificationDetails: tweetResult.verificationDetails
            });

            if (tweetResult.success && tweetResult.posted) {
              if (tweetResult.verificationDetails?.contentCleared ||
                  tweetResult.verificationDetails?.onHomePage) {
                console.log('Background: Tweet posted successfully with verification:', {
                  contentCleared: tweetResult.verificationDetails?.contentCleared,
                  onHomePage: tweetResult.verificationDetails?.onHomePage
                });
              } else {
                console.warn('Background: Tweet marked as posted but without verification details');
                tweetResult.success = false;
                tweetResult.message = 'Tweet status uncertain - no verification';
              }
            } else {
              console.error('Background: Tweet posting failed:', {
                error: tweetResult.error,
                message: tweetResult.message
              });
              if (retryCount < maxAttempts) {
                console.log('Background: Tweet posting failed, retrying...', {
                  attempt: retryCount + 1,
                  error: tweetResult.error,
                  message: tweetResult.message
                });
                const { isRunning } = await chrome.storage.local.get(['isRunning']);
                if (!isRunning) {
                  console.log('Background: Agent stopped, aborting retry');
                  resolve({
                    success: false,
                    error: 'Agent stopped',
                    posted: false
                  });
                  return;
                }
                resolve(this.postTweetViaTab(content, retryCount + 1));
                return;
              }
            }

            // Store the result with verification details
            await chrome.storage.local.set({
              lastTweetAttempt: {
                timestamp: Date.now(),
                success: tweetResult.success,
                posted: tweetResult.posted,
                verificationDetails: tweetResult.verificationDetails,
                error: tweetResult.error
              }
            });

            resolve(tweetResult);
          } else {
            console.log('Request action: ' + request.action);
          }
        };

        chrome.runtime.onMessage.addListener(messageListener);
      });

    } catch (error) {
      console.error('Background: Error in postTweetViaTab:', error);
      if (retryCount < 3) {
        console.log('Background: Tweet posting error, retrying...', {
          attempt: retryCount + 1,
          error: error.message
        });
        const { isRunning } = await chrome.storage.local.get(['isRunning']);
          if (!isRunning) {
            console.log('Background: Agent stopped, aborting retry');
            return ;
          }
        return this.postTweetViaTab(content, retryCount + 1);
      }
      throw error;
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
      const aiModel = agentConfig.ai?.model;
      const apiKey = agentConfig.ai?.apiKeys?.[aiModel];
      
      if (!apiKey) {
        console.error('No API key found');
        return { success: false, error: `${aiModel} API key not configured` };
      }

      const topics = agentConfig.topics;
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      // Check if there's already an API attempt in progress
      const { currentApiAttempt } = await chrome.storage.local.get(['currentApiAttempt']);
      
      let result;
      if (currentApiAttempt) {
        console.log('Background: API attempt already in progress, waiting for completion...');
        // Wait for the API call to complete via alarm
        result = await this.waitForAPICompletion();
      } else {
        // Map model names to their corresponding API methods
        const modelToApiMap = {
          'claude-3': 'claude',
          'claude': 'claude',
          'gpt-4': 'openai',
          'gpt-3.5-turbo': 'openai',
          'openai': 'openai',
          'gemini-pro': 'gemini',
          'gemini': 'gemini'
        };
        
        const apiMethod = modelToApiMap[aiModel];
        
        if (!apiMethod) {
          return { success: false, error: `Unsupported AI model: ${aiModel}` };
        }
        
        // Use the appropriate API based on model
        switch (apiMethod) {
          case 'claude':
            result = await this.claudeGenerate(apiKey, randomTopic);
            break;
          case 'openai':
            result = await this.openaiGenerate(apiKey, randomTopic);
            break;
          case 'gemini':
            result = await this.geminiGenerate(apiKey, randomTopic);
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
        
        // Store the tweet for posting
        await chrome.storage.local.set({
          pendingTweet: {
            content: result.tweet,
            timestamp: Date.now(),
            topic: randomTopic
          }
        });
        
        // Post via tab automation
        const postResult = await this.postTweetViaTab(result.tweet);
        console.log('Background: Tweet posting attempt completed:', {
          success: postResult.success,
          posted: postResult.posted,
          hasVerification: !!postResult.verificationDetails
        });

        if (postResult.success && postResult.posted) {
          console.log('Background: Scheduled tweet posted successfully');
          this.lastTweetTime = Date.now(); // This ensures next interval starts from successful attempt
          await chrome.storage.local.set({ lastTweetTime: this.lastTweetTime });
          await chrome.storage.local.remove(['pendingTweet']);
        } else {
          console.error('Background: Scheduled tweet posting failed or unverified:', {
            error: postResult.error,
            message: postResult.message,
            verificationDetails: postResult.verificationDetails
          });
          console.error('Background: All retry attempts failed');
        }
        
        return {
          success: postResult.success && postResult.posted,
          tweet: result.tweet,
          posted: postResult.posted,
          postError: postResult.error,
          verificationDetails: postResult.verificationDetails
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
      const intervalMs = (config.settings?.interval) * 60 * 1000;

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
    // Clear ALL intervals
    if (this.checkInterval) clearInterval(this.checkInterval);
    
    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Only use one interval based on config
    this.checkInterval = setInterval(async () => {
      const { isRunning } = await chrome.storage.local.get(['isRunning']);
      if (!isRunning) {
        clearInterval(this.checkInterval);
        return;
      }
      
      if (!this.isProcessing) {
        await this.checkAndPostTweet();
      }
    }, intervalMs);
  }

  // NEW: Method for manual tweet generation and posting (doesn't require agent to be running)
  async generateAndPostTweetManual() {
    try {
      console.log('Background: Generating manual tweet...');
      
      // Get config from storage
      const config = await chrome.storage.sync.get(['agentConfig']);
      console.log('Background: Retrieved config from storage:', config);
      
      if (!config.agentConfig) {
        console.error('Background: No config found for manual tweet');
        return { success: false, error: 'No config found' };
      }

      // Get current AI configuration
      const aiModel = config.agentConfig.ai?.model;
      const apiKey = config.agentConfig.ai?.apiKeys?.[aiModel];
      
      console.log('Background: AI configuration:', {
        aiModel: aiModel,
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0,
        availableModels: config.agentConfig.ai?.apiKeys ? Object.keys(config.agentConfig.ai.apiKeys) : []
      });
      
      if (!aiModel) {
        console.error('Background: No AI model configured');
        return { success: false, error: 'No AI model configured' };
      }
      
      if (!apiKey) {
        console.error('Background: No API key found for manual tweet');
        return { success: false, error: `${aiModel} API key not configured` };
      }

      const topics = config.agentConfig.topics;
      if (!topics || topics.length === 0) {
        console.error('Background: No topics configured');
        return { success: false, error: 'No topics configured' };
      }
      
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      console.log('Background: Generating tweet about:', randomTopic, 'using', aiModel);
      
      // Generate tweet using the appropriate API based on model
      let result;
      
      // Map model names to their corresponding API methods
      const modelToApiMap = {
        'claude-3': 'claude',
        'claude': 'claude',
        'gpt-4': 'openai',
        'gpt-3.5-turbo': 'openai',
        'openai': 'openai',
        'gemini-pro': 'gemini',
        'gemini': 'gemini'
      };
      
      const apiMethod = modelToApiMap[aiModel];
      
      if (!apiMethod) {
        return { success: false, error: `Unsupported AI model: ${aiModel}` };
      }
      
      switch (apiMethod) {
        case 'claude':
          result = await this.claudeGenerate(apiKey, randomTopic);
          break;
        case 'openai':
          result = await this.openaiGenerate(apiKey, randomTopic);
          break;
        case 'gemini':
          result = await this.geminiGenerate(apiKey, randomTopic);
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

  // Claude API methods
  async claudeGenerate(apiKey, topic, retries = 3, delay = 2000) {
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
            model: 'claude-3-5-haiku-latest',
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
        let tweet = data.content[0].text.trim();
        // it the tweet is over 280 characters, keep only 280 characters
        if (tweet.length > 280) {
          tweet = tweet.slice(0, 280);
          console.log('Tweet is over 280 characters, keeping only 280 characters:', tweet);
        }
        
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

  // OpenAI API methods
  async openaiGenerate(apiKey, topic , retries = 3, delay = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Testing OpenAI API (attempt ${attempt}/${retries})...`);
        console.log('Topic:', topic);
        
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

        console.log('API Response status:', response.status);

        if (response.status === 429) { // Rate limit for OpenAI
          if (attempt < retries) {
            const backoffDelay = delay * Math.pow(2, attempt - 1);
            console.log(`API rate limited, waiting ${backoffDelay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            continue;
          }
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        let tweet = data.choices[0].message.content.trim();
        
        if (tweet.length > 280) {
          tweet = tweet.slice(0, 280);
          console.log('Tweet is over 280 characters, keeping only 280 characters:', tweet);
        }
        
        console.log('Generated tweet via OpenAI:', tweet);
        
        return {
          success: true,
          tweet: tweet,
          topic: topic,
          message: 'OpenAI API test successful'
        };
      } catch (error) {
        if (attempt === retries) {
          console.error('Error testing OpenAI API after all retries:', error);
          return { success: false, error: error.message };
        }
        console.log(`Attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Gemini API methods
  async geminiGenerate(apiKey, topic , retries = 3, delay = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Testing Gemini API (attempt ${attempt}/${retries})...`);
        console.log('Topic:', topic);
        
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

        console.log('API Response status:', response.status);

        if (response.status === 429) { // Rate limit for Gemini
          if (attempt < retries) {
            const backoffDelay = delay * Math.pow(2, attempt - 1);
            console.log(`API rate limited, waiting ${backoffDelay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            continue;
          }
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        let tweet = data.candidates[0].content.parts[0].text.trim();
        
        if (tweet.length > 280) {
          tweet = tweet.slice(0, 280);
          console.log('Tweet is over 280 characters, keeping only 280 characters:', tweet);
        }
        
        console.log('Generated tweet via Gemini:', tweet);
        
        return {
          success: true,
          tweet: tweet,
          topic: topic,
          message: 'Gemini API test successful'
        };
      } catch (error) {
        if (attempt === retries) {
          console.error('Error testing Gemini API after all retries:', error);
          return { success: false, error: error.message };
        }
        console.log(`Attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
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

      // Check login status
      const loginStatus = await this.checkLoginStatusInWebContents();
      
      if (loginStatus.success && loginStatus.loggedIn) {
        return { success: true, message: 'Already logged in', loggedIn: true };
      }

      // Perform login if needed
      const loginResult = await this.performLoginInVisibleTab();
      return {
        success: loginResult.success,
        message: loginResult.message || loginResult.error,
        loggedIn: loginResult.loggedIn
      };

    } catch (error) {
      console.error('Background: Error in performInitialLoginCheck:', error);
      return {
        success: false,
        error: error.message,
        loggedIn: false
      };
    }
  }

  async checkLoginStatusInWebContents() {
    try {
      // Check cached login status first
      if (await this.isLoginCheckValid()) {
        console.log('Background: Using cached login status');
        const data = await chrome.storage.local.get(['lastLoginCheck']);
        return {
          success: true,
          loggedIn: data.lastLoginCheck.loggedIn
        };
      }

      console.log('Background: Checking login status via WebContents...');
      await this.createTwitterWebContents();

      return new Promise((resolve) => {
        const checkTimeout = setTimeout(async () => {
          console.log('Background: Login check timeout');
          // await this.destroyTwitterWebContents();
          resolve({
            success: false,
            error: 'Login check timeout',
            loggedIn: false
          });
        }, 30000);

        const messageListener = async (request) => {
          if (request.action === 'CONTENT_SCRIPT_READY') {
            try {
              const loginResponse = await new Promise((checkResolve) => {
                chrome.tabs.sendMessage(this.webContentsId, { action: 'CHECK_LOGIN' }, (response) => {
                  checkResolve(response || { loggedIn: false });
                });
              });

              clearTimeout(checkTimeout);
              chrome.runtime.onMessage.removeListener(messageListener);
              // await this.destroyTwitterWebContents();

              // Cache the login status
              await chrome.storage.local.set({
                lastLoginCheck: {
                  timestamp: Date.now(),
                  loggedIn: loginResponse.loggedIn
                }
              });

              console.log('Background: Login check complete:', loginResponse);
              resolve({
                success: true,
                loggedIn: loginResponse.loggedIn
              });

            } catch (error) {
              console.error('Background: Error during login check:', error);
              clearTimeout(checkTimeout);
              chrome.runtime.onMessage.removeListener(messageListener);
              // await this.destroyTwitterWebContents();
              resolve({
                success: false,
                error: error.message,
                loggedIn: false
              });
            }
          }
        };

        chrome.runtime.onMessage.addListener(messageListener);
      });

    } catch (error) {
      console.error('Background: Error in checkLoginStatusInWebContents:', error);
      // await this.destroyTwitterWebContents();
      return {
        success: false,
        error: error.message,
        loggedIn: false
      };
    }
  }

  async performLoginInVisibleTab() {
    try {
      console.log('Background: Starting login process in visible tab...');
      
      // Get credentials
      const config = await chrome.storage.sync.get(['agentConfig']);
      if (!config.agentConfig?.twitter?.username || !config.agentConfig?.twitter?.password || !config.agentConfig?.twitter?.email) {
        throw new Error('Twitter credentials not configured');
      }

      // Create visible tab for login
      const tab = await chrome.tabs.create({
        url: 'https://x.com/i/flow/login',
        active: true
      });

      return new Promise((resolve) => {
        let hasStartedLogin = false;
        const loginTimeout = setTimeout(async () => {
          console.log('Background: Login timeout');
          if (messageListener) {
            chrome.runtime.onMessage.removeListener(messageListener);
          }
          await chrome.tabs.remove(tab.id).catch(() => {});
          resolve({
            success: false,
            error: 'Login timeout',
            loggedIn: false
          });
        }, 60000);

        const messageListener = async (request, sender, sendResponse) => {
          if (sender.tab?.id !== tab.id) return;
          
          console.log('Background: Login tab message:', request.action);
          
          if (request.action === 'CONTENT_SCRIPT_READY' && !hasStartedLogin) {
            hasStartedLogin = true;
            // Send login credentials and wait for response
            chrome.tabs.sendMessage(tab.id, {
              action: 'LOGIN',
              credentials: {
                username: config.agentConfig.twitter.username,
                password: config.agentConfig.twitter.password,
                email: config.agentConfig.twitter.email
              }
            });
            // Important: Send response to CONTENT_SCRIPT_READY
            sendResponse({ received: true });
          } 
          else if (request.action === 'LOGIN_RESULT') {
            clearTimeout(loginTimeout);
            chrome.runtime.onMessage.removeListener(messageListener);
            
            // Wait before closing tab
            await new Promise(resolve => setTimeout(resolve, 2000));
            await chrome.tabs.remove(tab.id).catch(() => {});

            // Store login result in storage
            await chrome.storage.local.set({
              lastLoginCheck: {
                timestamp: Date.now(),
                loggedIn: request.result.success,
                success: request.result.success
              }
            });

            // Send response to LOGIN_RESULT
            sendResponse({ received: true });

            resolve({
              success: request.result.success,
              message: request.result.success ? 'Login successful' : 'Login failed',
              error: request.result.error,
              loggedIn: request.result.success
            });
          }
          
          // Return true to indicate we'll send response asynchronously
          return true;
        };

        chrome.runtime.onMessage.addListener(messageListener);
      });

    } catch (error) {
      console.error('Background: Error in performLoginInVisibleTab:', error);
      return {
        success: false,
        error: error.message,
        loggedIn: false
      };
    }
  }

  async createTwitterWebContents() {
    return new Promise((resolve, reject) => {
      chrome.wootz.createBackgroundWebContents(this.webContentsId, 'https://x.com/home', (result) => {
        if (result.success) {
          console.log('Background: Created Twitter WebContents:', this.webContentsId);
          resolve(true);
        } else {
          console.error('Background: Failed to create WebContents:', result.error);
          reject(new Error(result.error));
        }
      });
    });
  }

  async destroyTwitterWebContents() {
    return new Promise((resolve) => {
      chrome.wootz.destroyBackgroundWebContents(this.webContentsId, (result) => {
        if (result.success) {
          console.log('Background: Destroyed Twitter WebContents');
        } else {
          console.error('Background: Error destroying WebContents:', result.error);
        }
        resolve(result.success);
      });
    });
  }

  // Update isLoginCheckValid to use storage instead of memory
  async isLoginCheckValid() {
    try {
      const data = await chrome.storage.local.get(['lastLoginCheck']);
      if (!data.lastLoginCheck) return false;
      
      const isValid = Date.now() - data.lastLoginCheck.timestamp < this.loginCheckValidityMs;
      console.log('Background: Login check validity:', {
        isValid,
        lastCheck: new Date(data.lastLoginCheck.timestamp),
        loggedIn: data.lastLoginCheck.loggedIn
      });
      
      return isValid && data.lastLoginCheck.loggedIn;
    } catch (error) {
      console.error('Background: Error checking login validity:', error);
      return false;
    }
  }

  async clearAgentAlarms() {
    const alarms = await chrome.alarms.getAll();
    for (const alarm of alarms) {
      if (alarm.name !== ALARMS.KEEP_ALIVE) {
        await chrome.alarms.clear(alarm.name);
      }
    }
  }
}

// Initialize the background agent
console.log('Background script loading...');
// eslint-disable-next-line no-unused-vars
const backgroundAgent = new BackgroundTwitterAgent();
console.log('Background agent initialized');
