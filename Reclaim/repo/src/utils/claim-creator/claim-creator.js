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
        // ⭐ INCREASED: Timeout after 30 seconds (was 10 seconds) ⭐
        const callTimeout = setTimeout(() => {
            chrome.runtime.onMessage.removeListener(messageListener);
            console.error('❌ [CLAIM-CREATOR] Private key request timed out after 30 seconds');
            reject(new Error('Timeout: No response from offscreen document for private key request.'));
        }, 30000); // Increased from 10000 to 30000

        const messageListener = (message, sender) => {
            // Ensure the message is from the offscreen document and is the expected response
            if (message.action === MESSAGE_ACTIONS.GET_PRIVATE_KEY_RESPONSE &&
                message.source === MESSAGE_SOURCES.OFFSCREEN &&
                message.target === MESSAGE_SOURCES.BACKGROUND) { // Assuming this script runs in background context

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
            source: MESSAGE_SOURCES.BACKGROUND, // Assuming this script runs in background context
            target: MESSAGE_SOURCES.OFFSCREEN
        }, response => {
            if (chrome.runtime.lastError) {
                clearTimeout(callTimeout);
                chrome.runtime.onMessage.removeListener(messageListener);
                debugLogger.error(DebugLogType.CLAIM, '[CLAIM-CREATOR] Error sending GET_PRIVATE_KEY message:', chrome.runtime.lastError.message);
                reject(new Error(`Error sending message to offscreen document: ${chrome.runtime.lastError.message}`));
            }
            // If offscreen.js calls sendResponse synchronously, it can be handled here
            // but the main logic relies on the async messageListener
        });
    });
};

export const createClaimObject = async (request, providerData, sessionId, loginUrl, callbackUrl = null) => {
    debugLogger.info(DebugLogType.CLAIM, '[CLAIM-CREATOR] Creating claim object from request data');
    
    // ⭐ DEBUG: Log detailed claim creation process ⭐
    console.log('🔍 [CLAIM-CREATOR] Starting claim object creation...');
    console.log('📊 [CLAIM-CREATOR] Input data:', {
        requestUrl: request.url,
        requestMethod: request.method,
        hasBody: !!request.body,
        hasResponse: !!request.responseText,
        responseLength: request.responseText ? request.responseText.length : 0,
        hasCookies: !!request.cookieStr,
        providerId: providerData?.id,
        sessionId: sessionId
    });
    
    // ⭐ DEBUG: Check for CSP errors in the request ⭐
    if (request.headers) {
        const cspHeaders = Object.entries(request.headers).filter(([key]) => 
            key.toLowerCase().includes('csp') || 
            key.toLowerCase().includes('content-security-policy')
        );
        if (cspHeaders.length > 0) {
            console.log('⚠️ [CLAIM-CREATOR] CSP headers detected:', cspHeaders);
        }
    }
    
    // Ensure offscreen document is ready
    try {
        debugLogger.info(DebugLogType.CLAIM, '[CLAIM-CREATOR] Ensuring offscreen document is ready...');
        await ensureOffscreenDocument();
        debugLogger.info(DebugLogType.CLAIM, '[CLAIM-CREATOR] Offscreen document is ready.');
    } catch (error) {
        debugLogger.error(DebugLogType.CLAIM, '[CLAIM-CREATOR] Failed to ensure offscreen document:', error);
        console.error('❌ [CLAIM-CREATOR] Offscreen document error:', error.message);
        // Depending on requirements, you might want to throw error or handle differently
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
    
    console.log('🔍 [CLAIM-CREATOR] Starting parameter extraction...');
    console.log('📋 [CLAIM-CREATOR] Provider configuration:', {
        urlType: providerData.urlType,
        hasBodySniff: !!providerData?.bodySniff?.enabled,
        bodyTemplate: providerData?.bodySniff?.template,
        hasResponseMatches: !!providerData.responseMatches,
        responseMatchesCount: providerData.responseMatches?.length || 0,
        hasResponseRedactions: !!providerData.responseRedactions,
        responseRedactionsCount: providerData.responseRedactions?.length || 0
    });
    
    // 1. Extract params from URL if provider has URL template
    if (providerData.urlType === 'TEMPLATE' && request.url) {
        console.log('🔍 [CLAIM-CREATOR] Extracting params from URL template...');
        const urlParams = extractParamsFromUrl(providerData.url, request.url);
        console.log('📊 [CLAIM-CREATOR] URL params extracted:', urlParams);
        allParamValues = { ...allParamValues, ...urlParams };
    }
    
    // 2. Extract params from request body if provider has body template
    if (providerData?.bodySniff?.enabled && request.body) {
        console.log('🔍 [CLAIM-CREATOR] Extracting params from request body...');
        console.log('📋 [CLAIM-CREATOR] Body template:', providerData.bodySniff.template);
        console.log('📋 [CLAIM-CREATOR] Request body preview:', typeof request.body === 'string' ? 
            request.body.substring(0, 200) + '...' : '[Object]');
        
        const bodyParams = extractParamsFromBody(providerData.bodySniff.template, request.body);
        console.log('📊 [CLAIM-CREATOR] Body params extracted:', bodyParams);
        allParamValues = { ...allParamValues, ...bodyParams };
    }
    
    // 3. Extract params from response if available
    if (request.responseText) {
        console.log('🔍 [CLAIM-CREATOR] Extracting params from response...');
        console.log('📋 [CLAIM-CREATOR] Response preview:', request.responseText.substring(0, 200) + '...');
        console.log('📋 [CLAIM-CREATOR] Response matches:', providerData.responseMatches);
        
        // ⭐ ENHANCED: Show full response content for debugging ⭐
        console.log('📄 [CLAIM-CREATOR] FULL RESPONSE CONTENT (first 1000 chars):', request.responseText.substring(0, 1000));
        console.log('📄 [CLAIM-CREATOR] FULL RESPONSE CONTENT (last 1000 chars):', request.responseText.substring(request.responseText.length - 1000));
        
        // ⭐ NEW: Search for common GitHub username patterns in response ⭐
        const usernamePatterns = [
            /"octolytics-actor-login":"([^"]+)"/,
            /data-username="([^"]+)"/,
            /GitHub - ([^\s]+)/,
            /"user":"([^"]+)"/,
            /"username":"([^"]+)"/,
            /"login":"([^"]+)"/,
            /<meta[^>]*name="octolytics-actor-login"[^>]*content="([^"]+)"/,
            /<span[^>]*data-testid="user-profile-name"[^>]*>([^<]+)</,
            /<title[^>]*>([^<]+)</
        ];
        
        console.log('🔍 [CLAIM-CREATOR] Searching for username patterns in response...');
        usernamePatterns.forEach((pattern, index) => {
            const match = request.responseText.match(pattern);
            if (match) {
                console.log(`✅ [CLAIM-CREATOR] Pattern ${index + 1} matched:`, pattern.source, '->', match[1]);
            } else {
                console.log(`❌ [CLAIM-CREATOR] Pattern ${index + 1} no match:`, pattern.source);
            }
        });
        
        // ⭐ ENHANCED: Show any potential username-like content in response ⭐
        console.log('🔍 [CLAIM-CREATOR] Looking for any username-like content in response...');
        
        // Look for common GitHub username indicators
        const potentialUsernames = [];
        
        // Check for octolytics-actor-login
        const octolyticsMatch = request.responseText.match(/"octolytics-actor-login":"([^"]+)"/);
        if (octolyticsMatch) {
            potentialUsernames.push({ source: 'octolytics-actor-login', value: octolyticsMatch[1] });
        }
        
        // Check for data-username attribute
        const dataUsernameMatch = request.responseText.match(/data-username="([^"]+)"/);
        if (dataUsernameMatch) {
            potentialUsernames.push({ source: 'data-username', value: dataUsernameMatch[1] });
        }
        
        // Check for GitHub title pattern
        const titleMatch = request.responseText.match(/<title[^>]*>([^<]+)</);
        if (titleMatch) {
            potentialUsernames.push({ source: 'title', value: titleMatch[1] });
        }
        
        // Check for any text that looks like a GitHub username (alphanumeric + hyphens)
        const usernameRegex = /([a-zA-Z0-9-]+)/g;
        const allMatches = request.responseText.match(usernameRegex);
        if (allMatches) {
            // Filter for potential usernames (3-39 characters, common GitHub username pattern)
            const filteredUsernames = allMatches.filter(match => 
                match.length >= 3 && 
                match.length <= 39 && 
                /^[a-zA-Z0-9-]+$/.test(match) &&
                !match.includes('github') &&
                !match.includes('http') &&
                !match.includes('www')
            );
            
            // Take first few unique matches
            const uniqueUsernames = [...new Set(filteredUsernames)].slice(0, 5);
            uniqueUsernames.forEach(username => {
                potentialUsernames.push({ source: 'regex-match', value: username });
            });
        }
        
        console.log('📊 [CLAIM-CREATOR] Potential usernames found:', potentialUsernames);
        
        // ⭐ ENHANCED: Always try to extract params, even without responseMatches ⭐
        let responseParams = {};
        
        // ⭐ NEW: Auto-create response matches if missing ⭐
        if (!providerData.responseMatches || providerData.responseMatches.length === 0) {
            console.log('🔧 [CLAIM-CREATOR] No response matches found - creating automatic extraction config...');
            
            // Create automatic response matches based on found usernames
            const autoResponseMatches = [
                {
                    value: '{{username}}',
                    type: 'contains',
                    invert: false
                }
            ];
            
            const autoResponseRedactions = [];
            
            // Add the specific patterns that actually found the username
            autoResponseRedactions.push(
                {
                    regex: `"login":"([^"]+)"`,
                    type: 'regex'
                },
                {
                    regex: `"octolytics-actor-login":"([^"]+)"`,
                    type: 'regex'
                },
                {
                    xPath: '//meta[@name="octolytics-actor-login"]/@content',
                    type: 'xpath'
                }
            );
            
            console.log('📝 [CLAIM-CREATOR] Created automatic extraction config:', {
                responseMatches: autoResponseMatches,
                responseRedactions: autoResponseRedactions
            });
            
            // Use the auto-created config
            responseParams = extractParamsFromResponse(
                request.responseText, 
                autoResponseMatches, 
                autoResponseRedactions
            );
            
            console.log('🔍 [CLAIM-CREATOR] Parameter extraction result:', responseParams);
        } else {
            // Use existing config
            responseParams = extractParamsFromResponse(
            request.responseText, 
            providerData.responseMatches, 
            providerData.responseRedactions || []
            );
            console.log('🔍 [CLAIM-CREATOR] Existing config extraction result:', responseParams);
        }
        
        console.log('📊 [CLAIM-CREATOR] Response params extracted:', responseParams);
        

        
        allParamValues = { ...allParamValues, ...responseParams };
    }
    
    console.log('📊 [CLAIM-CREATOR] All extracted parameters:', allParamValues);
    
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

    console.log('🔍 [CLAIM-CREATOR] Final claim parameters:', {
        url: params.url,
        method: params.method,
        hasHeaders: !!params.headers,
        hasParamValues: !!params.paramValues,
        paramValuesCount: params.paramValues ? Object.keys(params.paramValues).length : 0,
        hasResponseMatches: !!params.responseMatches,
        responseMatchesCount: params.responseMatches?.length || 0,
        hasResponseRedactions: !!params.responseRedactions,
        responseRedactionsCount: params.responseRedactions?.length || 0,
        hasResponseSelections: !!params.responseSelections,
        responseSelectionsCount: params.responseSelections?.length || 0
    });

    console.log('🔍 [CLAIM-CREATOR] Secret parameters:', {
        hasSecretHeaders: !!secretParams.headers,
        hasSecretParamValues: !!secretParams.paramValues,
        secretParamValuesCount: secretParams.paramValues ? Object.keys(secretParams.paramValues).length : 0,
        hasCookieStr: !!secretParams.cookieStr
    });

    // ⭐ MODIFIED: Skip private key for WootzApp API flow ⭐
    console.log('🔍 [CLAIM-CREATOR] Skipping private key generation - using WootzApp API for ZK proof generation');
    
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
        console.log('🔗 [CLAIM-CREATOR] Added callback URL to claim object:', callbackUrl);
    }
    
    console.log('🎉 [CLAIM-CREATOR] Final claim object created:', {
        name: claimObject.name,
        sessionId: claimObject.sessionId,
        hasParams: !!claimObject.params,
        hasSecretParams: !!claimObject.secretParams,
        hasPrivateKey: false, // WootzApp API doesn't need private key
        clientUrl: claimObject.client.url
    });
    
    debugLogger.info(DebugLogType.CLAIM, '[CLAIM-CREATOR] Claim object created successfully');
    
    return claimObject;
};