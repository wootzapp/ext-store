// src/utils/constants/constants.js

import { getMaxListeners } from "events";

// Backend URLs and API Endpoints for Reclaim Protocol
export const BACKEND_URL = 'https://api.reclaimprotocol.org';

export const API_ENDPOINTS = {
  PROVIDER_URL: (providerId) => `${BACKEND_URL}/api/providers/${providerId}`,
  SUBMIT_PROOF: (sessionId) => `${BACKEND_URL}/session/${sessionId}/proof`,
  UPDATE_SESSION_STATUS: () => `${BACKEND_URL}/api/sdk/update/session/`
};

// Provider configurations
export const PROVIDERS = {
  GITHUB: {
    id: "6d3f6753-7ee6-49ee-a545-62f1b1822ae5",
    name: "GitHub",
    description: "GitHub Username",
    icon: "🐙",
    loginUrl: "https://github.com/settings/profile",
    dataRequired: "Username and profile information",
    // GitHub-specific extraction patterns
    extractionPatterns: {
      username: [
        { regex: '"octolytics-actor-login":"([^"]+)"', type: 'regex' },
        { xPath: '//meta[@name="octolytics-actor-login"]/@content', type: 'xpath' },
        { xPath: '//span[@data-testid="user-profile-name"]/text()', type: 'xpath' },
        { regex: 'GitHub - ([^\\s]+)', type: 'regex' }
      ],
      profile: [
        { regex: '"user":"([^"]+)"', type: 'regex' },
        { regex: 'data-username="([^"]+)"', type: 'regex' }
      ]
    }
  },
  LINKEDIN: {
    id: "a9f1063c-06b7-476a-8410-9ff6e427e637",
    name: "LinkedIn", 
    description: "LinkedIn Profile",
    icon: "💼",
    loginUrl: "https://www.linkedin.com/feed/",
    dataRequired: "Profile information and connections",
    // LinkedIn-specific extraction patterns
    extractionPatterns: {
      username: [
        { regex: '"publicIdentifier":"([^"]+)"', type: 'regex' },
        { xPath: '//meta[@property="og:title"]/@content', type: 'xpath' },
        { regex: 'linkedin\\.com/in/([^/\\s]+)', type: 'regex' }
      ],
      profile: [
        { regex: '"firstName":"([^"]+)"', type: 'regex' },
        { regex: '"lastName":"([^"]+)"', type: 'regex' },
        { xPath: '//h1[@class="text-heading-xlarge"]/text()', type: 'xpath' }
      ]
    }
  },
  INSTAGRAM: {
    id: "3ad6946f-88f4-4958-9a8e-5271a831b5b8",
    name: "Instagram", 
    description: "Instagram Profile",
    icon: "📸",
    loginUrl: "https://www.instagram.com/",
    dataRequired: "Profile information and posts",
    // Instagram-specific extraction patterns
    extractionPatterns: {
      username: [
        { regex: '"username":"([^"]+)"', type: 'regex' },
        { xPath: '//meta[@property="og:title"]/@content', type: 'xpath' },
        { regex: 'instagram\\.com/([^/\\s]+)', type: 'regex' }
      ],
      profile: [
        { regex: '"full_name":"([^"]+)"', type: 'regex' },
        { regex: '"biography":"([^"]+)"', type: 'regex' },
        { xPath: '//h2[@class="_aacl _aacs _aact _aacx _aada"]/text()', type: 'xpath' }
      ]
    }
  },
  TWITTER: {
    id: "e6fe962d-8b4e-4ce5-abcc-3d21c88bd64a",
    name: "Twitter", 
    description: "Twitter Profile",
    icon: "🐦",
    loginUrl: "https://twitter.com/home",
    dataRequired: "Profile information and tweets",
    // Twitter/X-specific extraction patterns
    extractionPatterns: {
      username: [
        { regex: '"screen_name":"([^"]+)"', type: 'regex' },
        { xPath: '//meta[@name="twitter:site"]/@content', type: 'xpath' },
        { regex: 'twitter\\.com/([^/\\s]+)', type: 'regex' },
        { regex: 'x\\.com/([^/\\s]+)', type: 'regex' },
        { xPath: '//meta[@property="og:title"]/@content', type: 'xpath' },
        { xPath: '//title/text()', type: 'xpath' }
      ],
      profile: [
        { regex: '"name":"([^"]+)"', type: 'regex' },
        { regex: '"description":"([^"]+)"', type: 'regex' },
        { xPath: '//h1[@data-testid="UserName"]/text()', type: 'xpath' },
        { xPath: '//div[@data-testid="UserName"]/text()', type: 'xpath' },
        { xPath: '//span[@data-testid="UserName"]/text()', type: 'xpath' }
      ]
    }
  },
  GMAIL: {
    id: "f9f383fd-32d9-4c54-942f-5e9fda349762",
    name: "Gmail", 
    description: "Gmail Account", 
    icon: "📧",
    loginUrl: "https://mail.google.com/",
    dataRequired: "Email address and account information",
    // Gmail-specific extraction patterns
    extractionPatterns: {
      email: [
        { regex: '"email":"([^"]+)"', type: 'regex' },
        { xPath: '//meta[@name="google-signin"]/@content', type: 'xpath' },
        { regex: '([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})', type: 'regex' }
      ],
      profile: [
        { regex: '"name":"([^"]+)"', type: 'regex' },
        { xPath: '//div[@data-email]//text()', type: 'xpath' }
      ]
    }
  }
};

// Actions used by the Reclaim SDK for various operations
export const RECLAIM_SDK_ACTIONS = {
  CHECK_EXTENSION: 'RECLAIM_EXTENSION_CHECK',
  EXTENSION_RESPONSE: 'RECLAIM_EXTENSION_RESPONSE',
  START_VERIFICATION: 'RECLAIM_START_VERIFICATION', // SDK initiated verification
  VERIFICATION_STARTED: 'RECLAIM_VERIFICATION_STARTED',
  VERIFICATION_COMPLETED: 'RECLAIM_VERIFICATION_COMPLETED',
  VERIFICATION_FAILED: 'RECLAIM_VERIFICATION_FAILED'
};

// Status updates for a Reclaim verification session
export const RECLAIM_SESSION_STATUS = {
  SESSION_INIT: 'SESSION_INIT',
  SESSION_STARTED: 'SESSION_STARTED',
  USER_INIT_VERIFICATION: 'USER_INIT_VERIFICATION',
  USER_STARTED_VERIFICATION: 'USER_STARTED_VERIFICATION',
  PROOF_GENERATION_STARTED: 'PROOF_GENERATION_STARTED',
  PROOF_GENERATION_SUCCESS: 'PROOF_GENERATION_SUCCESS',
  PROOF_GENERATION_FAILED: 'PROOF_GENERATION_FAILED',
  PROOF_SUBMITTED: 'PROOF_SUBMITTED',
  PROOF_SUBMISSION_FAILED: 'PROOF_SUBMISSION_FAILED',
  PROOF_MANUAL_VERIFICATION_SUBMITED: 'PROOF_MANUAL_VERIFICATION_SUBMITED'
};

// Defines the source of a message within the extension (e.g., who sent it)
export const MESSAGE_SOURCES = {
  CONTENT_SCRIPT: 'content-script',
  BACKGROUND: 'background',
  OFFSCREEN: 'offscreen',
  POPUP: 'popup',
  INTERCEPTOR_INJECTED: 'interceptor-injected'
};

// Specific actions/commands communicated between different parts of the extension
export const MESSAGE_ACTIONS = {
  // Proof generation related actions
  START_VERIFICATION: 'START_VERIFICATION', // Action from popup to background to start Reclaim flow
  GENERATE_PROOF_REQUEST: 'GENERATE_PROOF_REQUEST',
  CLAIM_CREATION_REQUESTED: 'CLAIM_CREATION_REQUESTED',
  CLAIM_CREATION_SUCCESS: 'CLAIM_CREATION_SUCCESS',
  CLAIM_CREATION_FAILED: 'CLAIM_CREATION_FAILED',
  PROOF_GENERATION_STARTED: 'PROOF_GENERATION_STARTED',
  PROOF_GENERATION_SUCCESS: 'PROOF_GENERATION_SUCCESS',
  PROOF_GENERATION_FAILED: 'PROOF_GENERATION_FAILED',
  PROOF_SUBMITTED: 'PROOF_SUBMITTED',
  PROOF_SUBMISSION_FAILED: 'PROOF_SUBMISSION_FAILED',
  GENERATE_PROOF: 'GENERATE_PROOF', // For background to offscreen to trigger proof gen
  GENERATED_PROOF_RESPONSE: 'GENERATED_PROOF_RESPONSE', // For offscreen to background response
  GENERATE_CLAIM_ON_ATTESTOR: 'GENERATE_CLAIM_ON_ATTESTOR',
  GET_PRIVATE_KEY: 'GET_PRIVATE_KEY',
  GET_PRIVATE_KEY_RESPONSE: 'GET_PRIVATE_KEY_RESPONSE',
  PROXY_RECLAIM_API_CALL: 'PROXY_RECLAIM_API_CALL',    // From interceptor/content to background
  RELAY_PROXIED_RESPONSE: 'RELAY_PROXIED_RESPONSE',

  // UI related actions
  SHOW_PROVIDER_VERIFICATION_POPUP: 'SHOW_PROVIDER_VERIFICATION_POPUP',
  OFFSCREEN_DOCUMENT_READY: 'OFFSCREEN_DOCUMENT_READY',
  
  // Actions for the popup to update its UI based on background events
  VERIFICATION_STATUS: 'verificationStatus',      // Generic status update (from background to popup)
  VERIFICATION_COMPLETE: 'verificationComplete',  // Verification finished successfully (from background to popup)
  VERIFICATION_ERROR: 'verificationError',        // Verification encountered an error (from background to popup)
  OPEN_RECLAIM_URL_IN_NEW_TAB: 'OPEN_RECLAIM_URL_IN_NEW_TAB', // New action for background to open URL

  // Offscreen document related actions
  GENERATE_PROOF_RESPONSE: 'GENERATE_PROOF_RESPONSE',
  PING_OFFSCREEN: 'PING_OFFSCREEN',

  // Background script related actions
  CLOSE_CURRENT_TAB: 'CLOSE_CURRENT_TAB',
  GET_CURRENT_TAB_ID: 'GET_CURRENT_TAB_ID',

  // Content script related actions
  REQUEST_PROVIDER_DATA: 'REQUEST_PROVIDER_DATA',
  PROVIDER_DATA_READY: 'PROVIDER_DATA_READY',
  CONTENT_SCRIPT_LOADED: 'CONTENT_SCRIPT_LOADED',
  SHOULD_INITIALIZE: 'SHOULD_INITIALIZE',
  CHECK_IF_MANAGED_TAB: 'CHECK_IF_MANAGED_TAB',

  // Interceptor related actions
  FILTERED_REQUEST_FOUND: 'FILTERED_REQUEST_FOUND',
  INTERCEPTED_REQUEST: 'INTERCEPTED_REQUEST',
  INTERCEPTED_RESPONSE: 'INTERCEPTED_RESPONSE',
 
 // ⭐ NEW: Network data bridge actions ⭐
 SEND_NETWORK_DATA_TO_OFFSCREEN: 'SEND_NETWORK_DATA_TO_OFFSCREEN',
 NETWORK_DATA_FOR_RECLAIM: 'NETWORK_DATA_FOR_RECLAIM',
 
 // ⭐ NEW: Page data actions ⭐
 GET_PAGE_DATA: 'GET_PAGE_DATA',
 
 // ⭐ NEW: Session management actions ⭐
 RESET_SESSION: 'RESET_SESSION',
};