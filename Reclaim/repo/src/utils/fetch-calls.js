import { API_ENDPOINTS, RECLAIM_SESSION_STATUS } from './constants';
import { loggerService, LOG_TYPES, debugLogger, DebugLogType } from './logger';

export const fetchProviderData = async (providerId, sessionId, appId, appSecret) => { 
    
    try {
        debugLogger.log(DebugLogType.FETCH, `Attempting to fetch provider data for ${providerId}, appId: ${appId}`); // Added debug log
        const response = await fetch(`${API_ENDPOINTS.PROVIDER_URL(providerId)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // ⭐ ADDED: Authorization headers for Reclaim API ⭐
                'X-App-Id': appId, // Reclaim specific header for App ID
                'X-App-Secret': appSecret,
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get response body for more details
            debugLogger.error(DebugLogType.FETCH, `Failed to fetch provider data: HTTP ${response.status} - ${response.statusText}`, errorText); // Detailed error log
            throw new Error(`Failed to fetch provider data: ${response.statusText || response.status}. Details: ${errorText.substring(0, 200)}`);
        }
        loggerService.log({
            message: 'Successfully fetched provider data from the backend: ' + JSON.stringify(response.headers.get('content-type')), // Log content type, response object is too big
            type: LOG_TYPES.FETCH_DATA,
            sessionId,
            providerId,
            appId
        });
        const data = await response.json();
        debugLogger.log(DebugLogType.FETCH, 'Provider data received:', data); // Log actual data
        return data?.providers; // Reclaim API returns { message: "...", providers: { ... } }
    } catch (error) {
        loggerService.logError({
            error: 'Error fetching provider data: ' + error.toString(),
            type: LOG_TYPES.FETCH_DATA,
            sessionId,
            providerId,
            appId
        });
        debugLogger.error(DebugLogType.FETCH, 'Error fetching provider data (caught):', error); // Added debug log
        throw error;
    }
}

export const updateSessionStatus = async (sessionId, status, providerId, appId) => {
    // ⭐ ADDED: Debug logs for the payload ⭐
    debugLogger.log(DebugLogType.FETCH, `Attempting to update session status.`);
    debugLogger.log(DebugLogType.FETCH, `Updating Session ID: ${sessionId}, Status: ${status}`);
    
    try {
        const response = await fetch(`${API_ENDPOINTS.UPDATE_SESSION_STATUS()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, status })
          });

        if (!response.ok) {
            const errorText = await response.text();
            debugLogger.error(DebugLogType.FETCH, `Failed to update session status: HTTP ${response.status} - ${response.statusText}`, errorText);
            throw new Error(`Failed to update session status: ${response.statusText || response.status}. Details: ${errorText.substring(0, 200)}`);
        }
        loggerService.log({
            message: 'Successfully updated session status: ' + status,
            type: LOG_TYPES.FETCH_DATA,
            sessionId,
            providerId,
            appId
        });

        const res = await response.json();
        return res;
    } catch (error) {
        loggerService.logError({
            error: 'Error updating session status: ' + error.toString(),
            type: LOG_TYPES.FETCH_DATA,
            sessionId,
            providerId,
            appId
        });
        debugLogger.error(DebugLogType.FETCH, 'Error updating session status (caught):', error);
        throw error;
    }
}



export const submitProofOnCallback = async (proofs, submitUrl, sessionId, providerId, appId) => {
    try {
        const jsonStringOfProofs = JSON.stringify(proofs);
        const urlEncodedProofs = encodeURIComponent(jsonStringOfProofs);
        
        const response = await fetch(submitUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' }, // Reclaim callback expects text/plain or application/x-www-form-urlencoded
            body: urlEncodedProofs, 
        });
        
        const res = await response.text(); // Read as text, as callback might not return JSON
        
        if (!response.ok) {
            await updateSessionStatus(sessionId, RECLAIM_SESSION_STATUS.PROOF_SUBMISSION_FAILED, providerId, appId); // Pass all IDs
            debugLogger.error(DebugLogType.FETCH, `Failed to submit proof to Callback: HTTP ${response.status} - ${response.statusText}. Response: ${res.substring(0, 200)}`);
            throw new Error(`Failed to submit proof to Callback: ${response.statusText || response.status}. Details: ${res.substring(0, 200)}`);
        }
        loggerService.log({
            message: 'Successfully submitted proof to Callback and updated session status',
            type: LOG_TYPES.FETCH_DATA,
            sessionId,
            providerId,
            appId
        });
        await updateSessionStatus(sessionId, RECLAIM_SESSION_STATUS.PROOF_SUBMITTED, providerId, appId); // Pass all IDs
        return res;
    } catch (error) {
        loggerService.logError({
            error: 'Error submitting proof to Callback: ' + error.toString(),
            type: LOG_TYPES.FETCH_DATA,
            sessionId,
            providerId,
            appId
        });
        debugLogger.error(DebugLogType.FETCH, 'Error submitting proof to Callback (caught):', error);
        throw error;
    }
}