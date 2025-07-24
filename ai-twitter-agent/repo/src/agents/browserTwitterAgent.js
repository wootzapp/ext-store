import AIClientFactory from '../services/ai/aiClientFactory';
import BrowserTwitterService from '../services/twitter/browserTwitter';
import BrowserStorage from '../services/storage/browserStorage';
import WebScheduler from '../services/scheduler/webScheduler';
import { getCurrentAIConfig } from '../utils/browserHelpers';

class BrowserTwitterAgent {
  constructor() {
    this.storage = new BrowserStorage();
    this.scheduler = new WebScheduler();
    this.twitter = new BrowserTwitterService();
    this.aiClient = null;
    this.isRunning = false;
    this.config = null;
  }

  async initialize() {
    try {
      console.log('BrowserTwitterAgent: Starting initialization...');
      this.config = await this.storage.getConfig();
      
      // Get current AI configuration
      const aiConfig = getCurrentAIConfig(this.config);
      
      console.log('BrowserTwitterAgent: Config loaded:', {
        model: aiConfig.model,
        hasApiKey: !!aiConfig.apiKey,
        isValid: aiConfig.isValid
      });
      
      if (!aiConfig.isValid) {
        throw new Error(`${aiConfig.model} API key not configured or invalid`);
      }
      
      // Create AI client using factory
      this.aiClient = AIClientFactory.createClient(aiConfig.model, aiConfig.apiKey);
      
      // Initialize Twitter service with config
      console.log('BrowserTwitterAgent: Initializing Twitter service...');
      const twitterInitResult = await this.twitter.initialize(this.config);
      console.log('BrowserTwitterAgent: Twitter service init result:', twitterInitResult);
      
      if (!twitterInitResult.success) {
        console.warn('Twitter service initialization failed:', twitterInitResult.error);
        // Don't throw error, continue with limited functionality
      }
      
      console.log('Browser Twitter Agent initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('Error initializing agent:', error);
      return { success: false, error: error.message };
    }
  }

  async start() {
    try {
      if (!this.aiClient) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          throw new Error(initResult.error);
        }
      }

      const intervalMinutes = this.config.settings.interval || 240;
      
      await this.scheduler.scheduleRepeating(
        'tweet-generator',
        intervalMinutes,
        () => this.generateAndPostTweet()
      );

      this.isRunning = true;
      
      // Update config
      this.config.settings.enabled = true;
      await this.storage.setConfig(this.config);

      console.log(`Agent started with ${intervalMinutes} minute intervals`);
      return { success: true, message: 'Agent started successfully' };
    } catch (error) {
      console.error('Error starting agent:', error);
      return { success: false, error: error.message };
    }
  }

  async stop() {
    try {
      await this.scheduler.cancelAll();
      this.isRunning = false;
      
      // Update config
      if (this.config) {
        this.config.settings.enabled = false;
        await this.storage.setConfig(this.config);
      }

      console.log('Agent stopped successfully');
      return { success: true, message: 'Agent stopped successfully' };
    } catch (error) {
      console.error('Error stopping agent:', error);
      return { success: false, error: error.message };
    }
  }

  async generateAndPostTweet() {
    try {
      if (!this.aiClient || !this.config) {
        throw new Error('Agent not properly initialized');
      }

      // Get current AI configuration
      const aiConfig = getCurrentAIConfig(this.config);

      // Select random topic
      const topics = this.config.topics || ['Technology'];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      console.log(`Generating tweet about: ${randomTopic} using ${aiConfig.model}`);
      
      // Generate tweet using current AI model
      const tweet = await this.aiClient.generateTweet(randomTopic, {
        style: this.config.settings.style || 'professional but engaging'
      });
      
      console.log('Generated tweet:', tweet);
      
      // Validate and improve if needed
      let finalTweet = tweet;
      if (finalTweet.length > 280) {
        console.warn('Tweet too long, improving...');
        finalTweet = await this.aiClient.improveTweet(finalTweet);
        
        if (finalTweet.length > 280) {
          finalTweet = finalTweet.substring(0, 277) + '...';
        }
      }
      
      // Save to history
      await this.storage.addTweetToHistory(finalTweet);
      
      // Post to Twitter using tab automation
      let posted = false;
      let postError = null;
      
      try {
        console.log('BrowserTwitterAgent: Attempting to post tweet...');
        const result = await this.twitter.postTweet(finalTweet, this.config);
        
        console.log('BrowserTwitterAgent: Post result:', result);
        
        if (result.success && result.posted) {
          posted = true;
          console.log('Tweet posted successfully!');
          
          // Mark as posted in history
          const history = await this.storage.getTweetHistory();
          if (history.length > 0) {
            await this.storage.markTweetAsPosted(history[0].id);
          }
        } else {
          postError = result.error || 'Posting failed';
          console.log('Tweet posting failed:', postError);
        }
      } catch (error) {
        postError = error.message;
        console.error('Error posting tweet:', error);
      }
      
      return {
        success: true,
        tweet: finalTweet,
        topic: randomTopic,
        posted: posted,
        error: postError,
        method: 'tab-automation'
      };
      
    } catch (error) {
      console.error('Error in generateAndPostTweet:', error);
      return { success: false, error: error.message };
    }
  }

  async postTweet(content) {
    try {
      if (!this.twitter || !this.config) {
        throw new Error('Agent not properly initialized');
      }

      console.log('Posting custom tweet:', content);
      
      // Validate tweet length
      if (content.length > 280) {
        throw new Error('Tweet exceeds 280 character limit');
      }
      
      // Save to history
      await this.storage.addTweetToHistory(content);
      
      // Post to Twitter using tab automation
      let posted = false;
      let postError = null;
      
      try {
        console.log('BrowserTwitterAgent: Attempting to post tweet...');
        const result = await this.twitter.postTweet(content, this.config);
        
        console.log('BrowserTwitterAgent: Post result:', result);
        
        if (result.success && result.posted) {
          posted = true;
          console.log('Tweet posted successfully!');
          
          // Mark as posted in history
          const history = await this.storage.getTweetHistory();
          if (history.length > 0) {
            await this.storage.markTweetAsPosted(history[0].id);
          }
        } else {
          postError = result.error || 'Posting failed';
          console.log('Tweet posting failed:', postError);
        }
      } catch (error) {
        postError = error.message;
        console.error('Error posting tweet:', error);
      }
      
      return {
        success: true,
        tweet: content,
        posted: posted,
        error: postError,
        method: 'tab-automation'
      };
      
    } catch (error) {
      console.error('Error in postTweet:', error);
      return { success: false, error: error.message };
    }
  }

  async testTweet() {
    return await this.generateAndPostTweet();
  }

  async testClaude() {
    try {
      if (!this.aiClient) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          throw new Error(initResult.error);
        }
      }

      const testTopic = 'Artificial Intelligence';
      const tweet = await this.aiClient.generateTweet(testTopic);
      
      return {
        success: true,
        tweet: tweet,
        topic: testTopic,
        message: 'Claude API test successful'
      };
    } catch (error) {
      console.error('Error testing Claude:', error);
      return { success: false, error: error.message };
    }
  }

  async updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      await this.storage.setConfig(this.config);
      
      // Reinitialize AI client if model or API key changed
      const aiConfig = getCurrentAIConfig(this.config);
      if (aiConfig.isValid) {
        this.aiClient = AIClientFactory.createClient(aiConfig.model, aiConfig.apiKey);
      }
      
      return { success: true, message: 'Configuration updated successfully' };
    } catch (error) {
      console.error('Error updating config:', error);
      return { success: false, error: error.message };
    }
  }

  async getStatus() {
    const schedules = await this.scheduler.getActiveSchedules();
    const aiConfig = getCurrentAIConfig(this.config);
    
    return {
      isRunning: this.isRunning,
      hasAgent: !!this.aiClient,
      config: this.config ? {
        hasAnthropicKey: aiConfig.isValid, // Backward compatibility
        hasTwitterCredentials: !!(this.config.twitter?.username && this.config.twitter?.password),
        topicsCount: this.config.topics?.length || 0,
        interval: this.config.settings?.interval || 240,
        style: this.config.settings?.style || 'professional but engaging',
        aiModel: aiConfig.model,
        hasValidAIKey: aiConfig.isValid
      } : {},
      schedules: schedules
    };
  }

  // Add the missing postTweetViaTab method
  async postTweetViaTab(content) {
    try {
      console.log('BrowserTwitterAgent: Posting tweet via tab automation...');
      
      if (!this.twitter) {
        throw new Error('Twitter service not initialized');
      }
      
      // Use the twitter service's postViaTabAutomation method
      const result = await this.twitter.postViaTabAutomation(content);
      
      console.log('BrowserTwitterAgent: Tab automation result:', result);
      return result;
      
    } catch (error) {
      console.error('BrowserTwitterAgent: Error in postTweetViaTab:', error);
      return { 
        success: false, 
        error: error.message, 
        posted: false 
      };
    }
  }

  // NEW: Method for manual tweet generation and posting (doesn't require agent to be running)
  async generateAndPostTweetManual() {
    try {
      console.log('BrowserTwitterAgent: Generating manual tweet...');
      
      if (!this.aiClient || !this.config) {
        // Try to initialize if not already done
        const initResult = await this.initialize();
        if (!initResult.success) {
          throw new Error(initResult.error || 'Agent initialization failed');
        }
      }

      // Select random topic
      const topics = this.config.topics || ['Technology'];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      console.log(`BrowserTwitterAgent: Generating tweet about: ${randomTopic}`);
      
      // Generate tweet
      const tweet = await this.aiClient.generateTweet(randomTopic, {
        style: this.config.settings.style || 'professional but engaging'
      });
      
      console.log('BrowserTwitterAgent: Generated tweet:', tweet);
      
      // Validate and improve if needed
      let finalTweet = tweet;
      if (finalTweet.length > 280) {
        console.warn('Tweet too long, improving...');
        finalTweet = await this.aiClient.improveTweet(finalTweet);
        
        if (finalTweet.length > 280) {
          finalTweet = finalTweet.substring(0, 277) + '...';
        }
      }
      
      // Save to history
      await this.storage.addTweetToHistory(finalTweet);
      
      // Post to Twitter using tab automation
      let posted = false;
      let postError = null;
      
      try {
        console.log('BrowserTwitterAgent: Attempting to post manual tweet...');
        const result = await this.twitter.postTweet(finalTweet, this.config);
        
        console.log('BrowserTwitterAgent: Manual post result:', result);
        
        if (result.success && result.posted) {
          posted = true;
          console.log('Manual tweet posted successfully!');
          
          // Mark as posted in history
          const history = await this.storage.getTweetHistory();
          if (history.length > 0) {
            await this.storage.markTweetAsPosted(history[0].id);
          }
        } else {
          postError = result.error || 'Posting failed';
          console.log('Manual tweet posting failed:', postError);
        }
      } catch (error) {
        postError = error.message;
        console.error('Error posting manual tweet:', error);
      }
      
      return {
        success: true,
        tweet: finalTweet,
        topic: randomTopic,
        posted: posted,
        error: postError,
        method: 'tab-automation'
      };
      
    } catch (error) {
      console.error('BrowserTwitterAgent: Error in generateAndPostTweetManual:', error);
      return { success: false, error: error.message };
    }
  }
}

export default BrowserTwitterAgent;