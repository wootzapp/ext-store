// src/utils/constants/interfaces.js

/**
 * @typedef {Object} TemplateData
 * @property {string} sessionId - Unique identifier for the session
 * @property {string} providerId - Provider identifier
 * @property {string} applicationId - Application identifier
 * @property {string} signature - Signature for authentication
 * @property {string} timestamp - Timestamp of the request
 * @property {string} callbackUrl - URL to call back after verification
 * @property {string} context - Context data as JSON string
 * @property {Object} parameters - Additional parameters
 * @property {string} redirectUrl - URL to redirect after completion
 * @property {boolean} acceptAiProviders - Whether to accept AI providers
 * @property {string} sdkVersion - SDK version
 * @property {boolean} jsonProofResponse - Whether to return proof as JSON
 */

/**
 * @typedef {Object} ProviderData
 * @property {string} httpProviderId - Provider ID
 * @property {string} name - Provider name
 * @property {string} description - Provider description
 * @property {string} logoUrl - URL to provider logo
 * @property {boolean} disableRequestReplay - Whether request replay is disabled
 * @property {string} loginUrl - URL to provider login page
 * @property {string} customInjection - Custom injection code
 * @property {boolean} isApproved - Whether provider is approved
 * @property {string} geoLocation - Geo location
 * @property {string} providerType - Provider type
 * @property {boolean} isVerified - Whether provider is verified
 * @property {string} injectionType - Injection type
 * @property {Object} userAgent - User agent info
 * @property {string} userAgent.ios - iOS user agent
 * @property {string} userAgent.android - Android user agent
 * @property {boolean} isActive - Whether provider is active
 * @string|null} expectedPageUrl - Expected page URL
 * @string|null} pageTitle - Page title
 * @string|null} stepsToFollow - Steps to follow
 * @number} usedInCount - Number of times used
 * @string|null} overseerUid - Overseer UID
 * @string|null} overseerNote - Overseer note
 * @Array<RequestData>} requestData - Request data
 */

/**
 * @typedef {Object} RequestData
 * @property {string} url - Request URL
 * @property {string} expectedPageUrl - Expected page URL
 * @property {string} urlType - URL type
 * @string} method - HTTP method
 * @Array<ResponseMatch>} responseMatches - Response matches
 * @Array<ResponseRedaction>} responseRedactions - Response redactions
 * @BodySniff} bodySniff - Body sniff
 * @string} requestHash - Request hash
 * @string|null} additionalClientOptions - Additional client options
 */

/**
 * @typedef {Object} ResponseMatch
 * @property {string} value - Match value
 * @string} type - Match type
 * @boolean} invert - Whether to invert the match
 * @string|null} description - Match description
 * @number|null} order - Match order
 */

/**
 * @typedef {Object} ResponseRedaction
 * @property {string} xPath - XPath
 * @string} jsonPath - JSON path
 * @string} regex - Regular expression
 * @string} hash - Hash
 */

/**
 * @typedef {Object} BodySniff
 * @property {boolean} enabled - Whether body sniffing is enabled
 * @string} template - Body template
 */