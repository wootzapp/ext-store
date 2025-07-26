// Utility functions for parameter extraction from various sources
import { convertTemplateToRegex } from './network-filter';
import { getValueFromJsonPath, getValueFromXPath, isJsonFormat, safeJsonParse } from './params-extractor-utils.js';
import { debugLogger, DebugLogType } from '../logger';

/**
 * Extract dynamic parameters from a string by matching {{PARAM_NAME}} patterns
 * @param {string} text - Text to extract parameters from
 * @returns {string[]} Array of parameter names without braces
 */
export const extractDynamicParamNames = (text) => {
    if (!text) return [];
    const matches = text.match(/{{([^}]+)}}/g) || [];
    return matches.map(match => match.substring(2, match.length - 2));
};

/**
 * Extract parameter values from URL using template matching
 * @param {string} urlTemplate - URL template with {{param}} placeholders
 * @param {string} actualUrl - Actual URL with values
 * @param {Object} paramValues - Object to store extracted parameter values
 * @returns {Object} Updated paramValues object
 */
export const extractParamsFromUrl = (urlTemplate, actualUrl, paramValues = {}) => {
    if (!urlTemplate || !actualUrl) return paramValues;

    // Extract param names from template
    const paramNames = extractDynamicParamNames(urlTemplate);
    const regex = convertTemplateToRegex(urlTemplate, paramNames).pattern;

    // Match actual URL against the pattern
    const match = actualUrl.match(regex);
    if (match && match.length > 1) {
        // Start from index 1 to skip the full match
        for (let i = 0; i < paramNames.length; i++) {
            if (match[i + 1]) {
                paramValues[paramNames[i]] = match[i + 1];
            }
        }
    }

    return paramValues;
};

/**
 * Extract parameter values from request body using template matching
 * @param {string} bodyTemplate - Body template with {{param}} placeholders
 * @param {string} actualBody - Actual request body with values
 * @param {Object} paramValues - Object to store extracted parameter values
 * @returns {Object} Updated paramValues object
 */
export const extractParamsFromBody = (bodyTemplate, actualBody, paramValues = {}) => {
    if (!bodyTemplate || !actualBody) return paramValues;


    // Extract param names from template
    const paramNames = extractDynamicParamNames(bodyTemplate);

    const regex = convertTemplateToRegex(bodyTemplate, paramNames).pattern;

    // Match actual body against the pattern
    const match = actualBody.match(regex);
    if (match && match.length > 1) {
        // Start from index 1 to skip the full match
        for (let i = 0; i < paramNames.length; i++) {
            if (match[i + 1]) {
                paramValues[paramNames[i]] = match[i + 1];
            }
        }
    }

    return paramValues;
};

/**
 * Extract parameter values from response text using responseMatches and responseRedactions
 * @param {string} responseText - Response body text
 * @param {Array} responseMatches - Array of response match objects
 * @param {Array} responseRedactions - Array of response redaction objects
 * @param {Object} paramValues - Object to store extracted parameter values
 * @returns {Object} Updated paramValues object
 */
export const extractParamsFromResponse = (responseText, responseMatches, responseRedactions, paramValues = {}) => {
    if (!responseText) return paramValues;

    try {
        // First, determine if the response is JSON or HTML
        let jsonData = null;
        const isJson = isJsonFormat(responseText);

        if (isJson) {
            jsonData = safeJsonParse(responseText);
        }

        // ⭐ ENHANCED: More flexible parameter extraction - try all redactions for each match ⭐
        if (responseMatches && responseMatches.length > 0 && responseRedactions && responseRedactions.length > 0) {
            
            // iterate over the responseMatches and try ALL responseRedactions for each match
            for (let i = 0; i < responseMatches.length; i++) {
                const match = responseMatches[i];

                if (!match.value) {
                    continue;
                }

                // Extract param names from match value expect one parameter per responseMatch
                const paramNames = extractDynamicParamNames(match.value);

                if (paramNames.length === 0) {
                    continue;
                }

                // ⭐ ENHANCED: Try ALL redactions for this match, not just the corresponding one ⭐
                for (let j = 0; j < responseRedactions.length; j++) {
                    const redaction = responseRedactions[j];
                    
                    let extractedValue = null;

                    // Try to extract using jsonPath if available and response is JSON
                    if (redaction.jsonPath && jsonData) {
                        try {
                            extractedValue = getValueFromJsonPath(jsonData, redaction.jsonPath);
                        } catch (error) {
                            debugLogger.error(DebugLogType.CLAIM, `[PARAM-EXTRACTOR] Error extracting with jsonPath ${redaction.jsonPath}:`, error);
                        }
                    }
                    // Try to extract using xPath if available and response is HTML
                    else if (redaction.xPath && !isJson) {
                        try {
                            extractedValue = getValueFromXPath(responseText, redaction.xPath);
                        } catch (error) {
                            debugLogger.error(DebugLogType.CLAIM, `[PARAM-EXTRACTOR] Error extracting with xPath ${redaction.xPath}:`, error);
                        }
                    }
                    // Fall back to regex extraction
                    else if (redaction.regex) {
                        try {
                            const regexMatch = responseText.match(new RegExp(redaction.regex));
                        if (regexMatch && regexMatch.length > 1) {
                            extractedValue = regexMatch[1];
                            }
                        } catch (error) {
                            debugLogger.error(DebugLogType.CLAIM, `[PARAM-EXTRACTOR] Error extracting with regex ${redaction.regex}:`, error);
                        }
                    }

                    // Store the extracted value as string if we found something
                    if (extractedValue !== null && extractedValue !== undefined) {
                        // Convert objects and arrays to JSON string, primitives to regular string
                        if (typeof extractedValue === 'object' && extractedValue !== null) {
                            paramValues[paramNames[0]] = JSON.stringify(extractedValue);
                        } else {
                            paramValues[paramNames[0]] = String(extractedValue);
                        }
                        
                        debugLogger.log(DebugLogType.CLAIM, `[PARAM-EXTRACTOR] Successfully extracted ${paramNames[0]}: ${paramValues[paramNames[0]]} using ${JSON.stringify(redaction)}`);
                        break; // Found a value for this parameter, move to next match
                    }
                }
            }
        } else {
            debugLogger.log(DebugLogType.CLAIM, '❌ [PARAM-EXTRACTOR] No response matches or redactions available');
        }
    } catch (error) {
        debugLogger.error(DebugLogType.CLAIM, "[PARAM-EXTRACTOR] Error extracting params from response:", error);
    }

    return paramValues;
};

/**
 * Separate parameters into public and secret based on names
 * @param {Object} paramValues - All parameter values
 * @returns {Object} Object with publicParams and secretParams
 */
export const separateParams = (paramValues) => {
    const publicParams = {};
    const secretParams = {};

    Object.entries(paramValues || {}).forEach(([key, value]) => {
        if (key.toLowerCase().includes('secret')) {
            secretParams[key] = value;
        } else {
            publicParams[key] = value;
        }
    });

    return { publicParams, secretParams };
};
