// X (Twitter) Platform Constants
/* global chrome */
export const PLATFORM_URLS = {
  HOME: 'https://x.com/home',
  LOGIN: 'https://x.com/i/flow/login',
  COMPOSE: 'https://x.com/compose/post',
  PROFILE: 'https://x.com/settings/profile',
  NOTIFICATIONS: 'https://x.com/notifications'
};

// DOM Selectors for X
export const SELECTORS = {
  // Compose/Post selectors
  COMPOSE_TEXT: '[data-testid="tweetTextarea_0"]',
  COMPOSE_BUTTON: '[data-testid="tweetButtonInline"]',
  POST_BUTTON: '[data-testid="tweetButton"]',
  COMPOSE_FALLBACK: 'div[contenteditable="true"]',
  
  // Navigation selectors
  LOGIN_BUTTON: '[data-testid="loginButton"]',
  HOME_TIMELINE: '[data-testid="primaryColumn"]',
  SIDE_NAV: '[data-testid="SideNav"]',
  
  // User interface
  USER_MENU: '[data-testid="SideNav_AccountSwitcher_Button"]',
  PROFILE_LINK: '[data-testid="AppTabBar_Profile_Link"]',
  
  // Content interaction
  LIKE_BUTTON: '[data-testid="like"]',
  RETWEET_BUTTON: '[data-testid="retweet"]',
  REPLY_BUTTON: '[data-testid="reply"]',
  
  // Media and attachments
  MEDIA_BUTTON: '[data-testid="attachMedia"]',
  GIF_BUTTON: '[data-testid="gif"]',
  EMOJI_BUTTON: '[data-testid="emoji"]'
};

// Action types
export const ACTION_TYPES = {
  LOGIN: 'LOGIN',
  NAVIGATE: 'NAVIGATE',
  NAVIGATE_TO_COMPOSE: 'NAVIGATE_TO_COMPOSE',
  FILL_CONTENT: 'FILL_CONTENT',
  CLICK_POST_BUTTON: 'CLICK_POST_BUTTON',
  CLICK_ELEMENT: 'CLICK_ELEMENT',
  WAIT: 'WAIT',
  SCROLL_DOWN: 'SCROLL_DOWN',
  SCROLL_UP: 'SCROLL_UP',
  POST_CONTENT: 'POST_CONTENT',
  LIKE_POST: 'LIKE_POST',
  RETWEET: 'RETWEET',
  REPLY: 'REPLY',
  GENERATE_CONTENT: 'GENERATE_CONTENT'
};

// Task statuses
export const TASK_STATUS = {
  IDLE: 'idle',
  PLANNING: 'planning',
  EXECUTING: 'executing',
  VALIDATING: 'validating',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ERROR: 'error',
  CANCELLED: 'cancelled'
};

// Timing constants (in milliseconds)
export const TIMING = {
  SHORT_DELAY: 1000,
  MEDIUM_DELAY: 2000,
  LONG_DELAY: 5000,
  PAGE_LOAD_WAIT: 3000,
  ELEMENT_WAIT: 500,
  HUMAN_DELAY_MIN: 800,
  HUMAN_DELAY_MAX: 2500,
  LOGIN_TIMEOUT: 120000, // 2 minutes
  ACTION_TIMEOUT: 30000   // 30 seconds
};

// Content limits
export const CONTENT_LIMITS = {
  POST_MAX_LENGTH: 280,
  BIO_MAX_LENGTH: 160,
  USERNAME_MAX_LENGTH: 15,
  DISPLAY_NAME_MAX_LENGTH: 50,
  MAX_HASHTAGS: 3,
  MAX_MENTIONS: 10
};

// AI Model configurations
export const AI_MODELS = {
  ANTHROPIC: {
    CLAUDE_SONNET: 'claude-3-sonnet-20240229',
    CLAUDE_HAIKU: 'claude-3-haiku-20240307',
    CLAUDE_OPUS: 'claude-3-opus-20240229'
  },
  OPENAI: {
    GPT4: 'gpt-4',
    GPT4_TURBO: 'gpt-4-turbo-preview',
    GPT35_TURBO: 'gpt-3.5-turbo'
  },
  GOOGLE: {
    GEMINI_PRO: 'gemini-pro',
    GEMINI_PRO_VISION: 'gemini-pro-vision'
  }
};

// Error messages
export const ERROR_MESSAGES = {
  NO_API_KEY: 'No API key configured for the selected AI provider',
  AUTHENTICATION_FAILED: 'Failed to authenticate with X. Please try logging in manually.',
  CONTENT_TOO_LONG: 'Content exceeds platform character limit',
  ELEMENT_NOT_FOUND: 'Required page element not found',
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  RATE_LIMITED: 'Rate limited by platform. Please wait before trying again.',
  TASK_TIMEOUT: 'Task execution timed out',
  INVALID_ACTION: 'Invalid action type provided'
};

// Success messages
export const SUCCESS_MESSAGES = {
  TASK_COMPLETED: 'Task completed successfully!',
  LOGIN_SUCCESS: 'Successfully logged into X',
  POST_SUCCESS: 'Post published successfully',
  CONTENT_GENERATED: 'Content generated successfully',
  SETTINGS_SAVED: 'Settings saved successfully'
};

// Browser detection
export const BROWSER_INFO = {
  isExtension: () => typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id,
  isMobile: () => /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isChrome: () => /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
  isEdge: () => /Edg/.test(navigator.userAgent),
  isFirefox: () => /Firefox/.test(navigator.userAgent)
};

// Configuration defaults
export const DEFAULT_CONFIG = {
  aiProvider: 'anthropic',
  navigatorModel: 'claude-3-sonnet-20240229',
  plannerModel: 'claude-3-sonnet-20240229',
  validatorModel: 'claude-3-haiku-20240307',
  autoLogin: false,
  safeMode: true,
  voiceInput: true,
  humanDelay: true,
  debugMode: false,
  maxRetries: 3,
  timeout: 30000
};

export default {
  PLATFORM_URLS,
  SELECTORS,
  ACTION_TYPES,
  TASK_STATUS,
  TIMING,
  CONTENT_LIMITS,
  AI_MODELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  BROWSER_INFO,
  DEFAULT_CONFIG
};