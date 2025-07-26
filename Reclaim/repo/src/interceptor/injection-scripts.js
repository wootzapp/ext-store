/**
 * Dynamic Injection Script Loader
 * Fetches provider-specific injection scripts from the backend and executes them
 * This script is injected into the main world of the website
 */

(function() {
    'use strict';

    /**
     * IMPORTANT: localStorage Context Isolation
     * 
     * - background.js runs in extension context (chrome-extension://extension-id/)
     * - This injection script runs in website context (https://example.com/)
     * - These have SEPARATE localStorage spaces - they cannot share data directly
     * 
     * Solutions:
     * 1. Content script acts as bridge (can access both contexts)
     * 2. Use chrome.storage API via content script
     * 3. Use postMessage communication between content script and injection script
     */

    /**
     * Safely retrieve provider ID from localStorage
     * Note: This only works if the provider ID was set by the website itself
     * or by a content script that has access to the website's localStorage
     */
    function getProviderIdFromStorage() {
        try {
            // Simplified to single key as per user's modification
            const keyValue = 'reclaimProviderId';
 
            const value = localStorage.getItem(keyValue);
            if (value) {
                return value;
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Alternative: Get provider ID from extension via content script bridge
     * This method uses postMessage to communicate with content script
     */
    function getProviderIdFromExtension() {
        return new Promise((resolve) => {
            // Listen for response from content script
            const handleMessage = (event) => {
                if (event.source !== window) return;
                
                if (event.data.action === 'RECLAIM_PROVIDER_ID_RESPONSE') {
                    window.removeEventListener('message', handleMessage);
                    resolve(event.data.providerId);
                }
            };

            window.addEventListener('message', handleMessage);

            // Request provider ID from content script
            window.postMessage({
                action: 'RECLAIM_GET_PROVIDER_ID',
                source: 'injection-script'
            }, '*');

            // Timeout after 5 seconds
            setTimeout(() => {
                window.removeEventListener('message', handleMessage);
                resolve(null);
            }, 5000);
        });
    }

    /**
     * Fetch provider data including custom injection script from backend via content script
     */
    async function fetchProviderInjectionScript(providerId) {
        try {
            return new Promise((resolve, reject) => {
                // Listen for response from content script
                const handleMessage = (event) => {
                    if (event.source !== window) return;
                    
                    if (event.data.action === 'RECLAIM_INJECTION_SCRIPT_RESPONSE') {
                        window.removeEventListener('message', handleMessage);
                        
                        if (event.data.error) {
                            resolve(null);
                        } else {
                            resolve({
                                script: event.data.scriptContent,
                                providerData: { 
                                    httpProviderId: providerId, 
                                    name: event.data.providerName || 'Unknown Provider' 
                                }
                            });
                        }
                    }
                };

                window.addEventListener('message', handleMessage);

                // Request injection script from content script
                window.postMessage({
                    action: 'RECLAIM_FETCH_INJECTION_SCRIPT',
                    providerId: providerId,
                    source: 'injection-script'
                }, '*');

                // Timeout after 10 seconds
                setTimeout(() => {
                    window.removeEventListener('message', handleMessage);
                    resolve(null);
                }, 10000);
            });

        } catch (error) {
            return null;
        }
    }

    /**
     * Execute the fetched injection script safely
     */
    function executeInjectionScript(scriptContent, providerData) {
        try {
            // LinkedIn has extremely strict CSP that blocks all script execution
            // Instead of trying to execute scripts, we'll use a different approach:
            // 1. Store the script content and provider data in a safe location
            // 2. Use postMessage to communicate with content script
            // 3. Let the content script handle the actual execution in extension context

            // Store the injection data in a way that doesn't violate CSP
            const injectionData = {
                scriptContent: scriptContent,
                providerData: providerData,
                timestamp: Date.now()
            };

            // Use postMessage to send the injection data to content script
            window.postMessage({
                action: 'RECLAIM_EXECUTE_INJECTION_SCRIPT',
                source: 'injection-script',
                data: injectionData
            }, '*');

            // Dispatch a custom event to notify that injection script data has been sent
            window.dispatchEvent(new CustomEvent('reclaimInjectionScriptSent', {
                detail: {
                    providerId: providerData.httpProviderId,
                    providerName: providerData.name,
                    timestamp: Date.now()
                }
            }));

        } catch (error) {
            // Dispatch error event
            window.dispatchEvent(new CustomEvent('reclaimInjectionScriptError', {
                detail: {
                    providerId: providerData.httpProviderId,
                    providerName: providerData.name,
                    error: error.message,
                    timestamp: Date.now()
                }
            }));
        }
    }

    /**
     * Main function to load and execute injection script
     */
    async function loadAndExecuteInjectionScript() {
        try {
            // Try to get provider ID from localStorage first
            let providerId = getProviderIdFromStorage();
            // const providerId = "8f8f3def-7864-4dae-890d-9e95c5e45bec"
            
            // If not found in localStorage, try to get from extension
            if (!providerId) {
                providerId = await getProviderIdFromExtension();
            }
            
            if (!providerId) {
                return;
            }

            // Fetch the injection script from backend
            const injectionData = await fetchProviderInjectionScript(providerId);
            
            if (!injectionData) {
                return;
            }

            // Execute the fetched script
            executeInjectionScript(injectionData.script, injectionData.providerData);

        } catch (error) {
        }
    }

    /**
     * Initialize the injection script loader
     * Waits for DOM to be ready before executing
     */
    function initializeInjectionLoader() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadAndExecuteInjectionScript);
        } else {
            // DOM is already ready
            loadAndExecuteInjectionScript();
        }
    }

    // Expose utilities globally for debugging and external access
    window.reclaimInjectionLoader = {
        loadAndExecuteInjectionScript,
        getProviderIdFromStorage,
        getProviderIdFromExtension,
        fetchProviderInjectionScript,
        executeInjectionScript
    };

    // Initialize the loader
    initializeInjectionLoader();

})();
