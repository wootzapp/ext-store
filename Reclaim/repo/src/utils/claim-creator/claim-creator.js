import { 
    extractParamsFromUrl, 
    extractParamsFromBody, 
    extractParamsFromResponse,
    separateParams
} from './params-extractor';
import { MESSAGE_ACTIONS, MESSAGE_SOURCES } from '../constants';
import { ensureOffscreenDocument } from '../offscreen-manager';
import { debugLogger, DebugLogType } from '../logger';

// Generate Chrome Android user agent (adapted from reference code)
const generateChromeAndroidUserAgent = (chromeMajorVersion = 135, isMobile = true) => {
    if (chromeMajorVersion <= 0) {
        chromeMajorVersion = 135;
    }

    const platform = "(Linux; Android 10; K)";
    const engine = "AppleWebKit/537.36 (KHTML, like Gecko)";
    const chromeVersionString = `Chrome/${chromeMajorVersion}.0.0.0`;
    const mobileToken = isMobile ? " Mobile" : "";
    const safariCompat = "Safari/537.36";

    return `Mozilla/5.0 ${platform} ${engine} ${chromeVersionString}${mobileToken} ${safariCompat}`;
};

const getPrivateKeyFromOffscreen = () => {
    return new Promise((resolve, reject) => {
        // Timeout after 30 seconds
        const callTimeout = setTimeout(() => {
            chrome.runtime.onMessage.removeListener(messageListener);
            reject(new Error('Timeout: No response from offscreen document for private key request.'));
        }, 30000);

        const messageListener = (message, sender) => {
            // Ensure the message is from the offscreen document and is the expected response
            if (message.action === MESSAGE_ACTIONS.GET_PRIVATE_KEY_RESPONSE &&
                message.source === MESSAGE_SOURCES.OFFSCREEN &&
                message.target === MESSAGE_SOURCES.BACKGROUND) {

                clearTimeout(callTimeout);
                chrome.runtime.onMessage.removeListener(messageListener);

                if (message.success && message.privateKey) {
                    debugLogger.info(DebugLogType.CLAIM, '[CLAIM-CREATOR] Received private key from offscreen document');
                    resolve(message.privateKey);
                } else {
                    debugLogger.error(DebugLogType.CLAIM, '[CLAIM-CREATOR] Failed to get private key from offscreen:', message.error);
                    reject(new Error(message.error || 'Unknown error getting private key from offscreen document.'));
                }
                return false; // Indicate message has been handled
            }
            return true; // Keep listener active for other messages
        };

        chrome.runtime.onMessage.addListener(messageListener);

        debugLogger.info(DebugLogType.CLAIM, '[CLAIM-CREATOR] Requesting private key from offscreen document');
        chrome.runtime.sendMessage({
            action: MESSAGE_ACTIONS.GET_PRIVATE_KEY,
            source: MESSAGE_SOURCES.BACKGROUND,
            target: MESSAGE_SOURCES.OFFSCREEN
        }, response => {
            if (chrome.runtime.lastError) {
                clearTimeout(callTimeout);
                chrome.runtime.onMessage.removeListener(messageListener);
                debugLogger.error(DebugLogType.CLAIM, '[CLAIM-CREATOR] Error sending GET_PRIVATE_KEY message:', chrome.runtime.lastError.message);
                reject(new Error(`Error sending message to offscreen document: ${chrome.runtime.lastError.message}`));
            }
        });
    });
};

export const createClaimObject = async (request, providerData, sessionId, loginUrl, callbackUrl = null) => {
    debugLogger.info(DebugLogType.CLAIM, '[CLAIM-CREATOR] Creating claim object from request data');
    
    // Ensure offscreen document is ready
    try {
        debugLogger.info(DebugLogType.CLAIM, '[CLAIM-CREATOR] Ensuring offscreen document is ready...');
        await ensureOffscreenDocument();
        debugLogger.info(DebugLogType.CLAIM, '[CLAIM-CREATOR] Offscreen document is ready.');
    } catch (error) {
        debugLogger.error(DebugLogType.CLAIM, '[CLAIM-CREATOR] Failed to ensure offscreen document:', error);
        throw new Error(`Failed to initialize offscreen document: ${error.message}`);
    }
    
    // Generate appropriate user agent for the platform
    const userAgent = await generateChromeAndroidUserAgent();
    
    // Define public headers that should be in params
    const PUBLIC_HEADERS = [
        "user-agent",
        "accept",
        "accept-language",
        "accept-encoding",
        "sec-fetch-mode",
        "sec-fetch-site",
        "sec-fetch-user",
        "origin",
        "x-requested-with",
        "sec-ch-ua",
        "sec-ch-ua-mobile",
    ];
    
    // Initialize params and secretParams objects
    const params = {};
    const secretParams = {};
    
    // Process URL
    params.url = providerData.urlType === 'TEMPLATE' ? providerData.url : request.url;
    params.method = request.method || 'GET';
    
    // Process headers - split between public and secret
    if (request.headers) {
        debugLogger.info(DebugLogType.CLAIM, '[CLAIM-CREATOR] request.headers: ', request.headers);
        const publicHeaders = {
            'Sec-Fetch-Mode': 'same-origin',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': userAgent
        };
        const secretHeaders = {
            'Referer': loginUrl ?? ''
        };
        
        Object.entries(request.headers).forEach(([key, value]) => {
            const lowerKey = key.toLowerCase();
            if (PUBLIC_HEADERS.includes(lowerKey)) {
                publicHeaders[key] = value;
            } else {
                secretHeaders[key] = value;
            }
        });
        
        if (Object.keys(publicHeaders).length > 0) {
            params.headers = publicHeaders;
        }
        
        if (Object.keys(secretHeaders).length > 0) {
            secretParams.headers = secretHeaders;
        }
    } 
    
    // Process body if available
    if (providerData?.bodySniff?.enabled && request.body) {
        params.body = providerData?.bodySniff?.template
    }
    
    // Process cookie string if available in request
    if (request.cookieStr) {
        secretParams.cookieStr = request.cookieStr;
    } 
    
    // Extract dynamic parameters from various sources
    let allParamValues = {};
    
    // 1. Extract params from URL if provider has URL template
    if (providerData.urlType === 'TEMPLATE' && request.url) {
        const urlParams = extractParamsFromUrl(providerData.url, request.url);
        allParamValues = { ...allParamValues, ...urlParams };
    }
    
    // 2. Extract params from request body if provider has body template
    if (providerData?.bodySniff?.enabled && request.body) {
        const bodyParams = extractParamsFromBody(providerData.bodySniff.template, request.body);
        allParamValues = { ...allParamValues, ...bodyParams };
    }
    
    // 3. Extract params from response if available
    if (request.responseText) {
        
        // ⭐ ENHANCED: Show full response content for debugging ⭐
        
        // ⭐ ENHANCED: Use provider-specific extraction patterns ⭐
        const providerName = providerData.name?.toLowerCase() || 'unknown';
        
        // Get provider-specific patterns from constants
        const { PROVIDERS } = await import('../constants/constants.js');
        const providerConfig = Object.values(PROVIDERS).find(p => 
            p.name.toLowerCase() === providerName || 
            p.id === providerData.id
        );
        
        let providerSpecificPatterns = [];
        if (providerConfig?.extractionPatterns) {
            
            // Flatten all patterns from the provider
            Object.values(providerConfig.extractionPatterns).forEach(patternArray => {
                providerSpecificPatterns.push(...patternArray);
            });
        }
        
        // ⭐ ENHANCED: Search for provider-specific patterns in response ⭐
        
        providerSpecificPatterns.forEach((pattern, index) => {
            if (pattern.type === 'regex' && pattern.regex) {
                const match = request.responseText.match(new RegExp(pattern.regex));
                if (match) {
                    foundPatterns.push({
                        pattern: pattern.regex,
                        match: match[1],
                        type: 'regex'
                    });
                }
            }
        });
        
        // ⭐ ENHANCED: Show any potential user data found in response ⭐
        
        // Look for common user data indicators across all providers
        const potentialUserData = [];
        
        // Check for common JSON patterns
        const jsonPatterns = [
            /"username":"([^"]+)"/,
            /"user":"([^"]+)"/,
            /"login":"([^"]+)"/,
            /"email":"([^"]+)"/,
            /"name":"([^"]+)"/,
            /"screen_name":"([^"]+)"/,
            /"publicIdentifier":"([^"]+)"/,
            /"full_name":"([^"]+)"/,
            /"firstName":"([^"]+)"/,
            /"lastName":"([^"]+)"/
        ];
        
        jsonPatterns.forEach(pattern => {
            const match = request.responseText.match(pattern);
            if (match) {
                potentialUserData.push({ source: pattern.source, value: match[1] });
            }
        });
        
        // Check for URL patterns
        const urlPatterns = [
            /github\.com\/([^\/\s]+)/,
            /linkedin\.com\/in\/([^\/\s]+)/,
            /instagram\.com\/([^\/\s]+)/,
            /twitter\.com\/([^\/\s]+)/,
            /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
        ];
        
        urlPatterns.forEach(pattern => {
            const match = request.responseText.match(pattern);
            if (match) {
                potentialUserData.push({ source: pattern.source, value: match[1] });
            }
        });
        
        // ⭐ ENHANCED: Always try to extract params, even without responseMatches ⭐
        let responseParams = {};
        
        // ⭐ NEW: Auto-create response matches if missing ⭐
        if (!providerData.responseMatches || providerData.responseMatches.length === 0) {
            
            // Create automatic response matches based on found data
            const autoResponseMatches = [
                {
                    value: '{{username}}',
                    type: 'contains',
                    invert: false
                },
                {
                    value: '{{email}}',
                    type: 'contains',
                    invert: false
                },
                {
                    value: '{{profile}}',
                    type: 'contains',
                    invert: false
                }
            ];
            
            const autoResponseRedactions = [];
            
            // Add provider-specific patterns
            autoResponseRedactions.push(...providerSpecificPatterns);
            
            // Add found user data as patterns
            potentialUserData.forEach(data => {
                if (data.value && data.value.length > 0) {
                    autoResponseRedactions.push({
                        regex: data.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                        type: 'regex'
                    });
                }
            });
            
            // Use the auto-created config
            responseParams = extractParamsFromResponse(
                request.responseText, 
                autoResponseMatches, 
                autoResponseRedactions
            );
            
        } else {
            // Use existing config
            responseParams = extractParamsFromResponse(
            request.responseText, 
            providerData.responseMatches, 
            providerData.responseRedactions || []
            );
        }
        
        allParamValues = { ...allParamValues, ...responseParams };
    }
    
    // 5. Separate parameters into public and secret
    const { publicParams, secretParams: secretParamValues } = separateParams(allParamValues);

    // Add parameter values to respective objects
    if (Object.keys(publicParams).length > 0) {
        params.paramValues = publicParams;
    }
    
    if (Object.keys(secretParamValues).length > 0) {
        secretParams.paramValues = secretParamValues;
    }
    
    // Process response matches if available
    if (providerData.responseMatches) {
        params.responseMatches = providerData.responseMatches.map(match => {
            // Create a clean object with only the required fields
            const cleanMatch = {
                value: match.value,
                type: match.type || 'contains',
                invert: match.invert || false
            };
            
            return cleanMatch;
        });
    }
    
    // Process response redactions if available
    if (providerData.responseRedactions) {
        params.responseRedactions = providerData.responseRedactions.map(redaction => {
            // Create a new object without hash field and empty jsonPath/xPath
            const cleanedRedaction = {};
            
            Object.entries(redaction).forEach(([key, value]) => {
                // Skip the hash field
                if (key === 'hash') {
                    return;
                }
                
                // Skip empty jsonPath and xPath
                if ((key === 'jsonPath' || key === 'xPath') && (!value || value === '')) {
                    return;
                }
                
                // Keep all other fields
                cleanedRedaction[key] = value;
            });
            
            return cleanedRedaction;
        });
    }
    
    // Process response selections if available
    if (providerData.responseSelections) {
        params.responseSelections = providerData.responseSelections.map(selection => {
            // Only include value, type, and invert fields
            const cleanedSelection = {};
            
            if ('value' in selection) {
                cleanedSelection.value = selection.value;
            }
            
            if ('type' in selection) {
                cleanedSelection.type = selection.type;
            }
            
            if ('invert' in selection) {
                cleanedSelection.invert = selection.invert;
            }
            
            return cleanedSelection;
        });
    }
    
    // Add any additional client options if available
    if (providerData.additionalClientOptions) {
        params.additionalClientOptions = providerData.additionalClientOptions;
    }

    // ⭐ MODIFIED: Skip private key for WootzApp API flow ⭐
    
    // Create the final claim object
    const claimObject = {
        name: 'http',
        sessionId: sessionId,
        params,
        secretParams,
        // ownerPrivateKey: ownerPrivateKey, // Removed - not needed for WootzApp API
        client: {
            url: 'wss://attestor.reclaimprotocol.org/ws'
        }
    };

    // Add callback URL if provided
    if (callbackUrl) {
        claimObject.callbackUrl = callbackUrl;
    }
    
    debugLogger.info(DebugLogType.CLAIM, '[CLAIM-CREATOR] Claim object created successfully');
    
    return claimObject;
};