// Store the original fetch function
const originalFetch = window.fetch;

// Interceptor function
window.fetch = async function (...args) {
    const [resource, config] = args;

    // Check if this is the Firebase signup request
    if (resource.includes('identitytoolkit.googleapis.com/v1/accounts:signUp')) {
        try {
            // Make the actual request
            const response = await originalFetch.apply(this, args);

            // Clone the response to read it
            const clone = response.clone();
            const responseData = await clone.json();

            // Prepare the data to send
            const tokenData = {
                timestamp: '2025-02-08 10:01:48', // Current timestamp from the context
                idToken: responseData.idToken,
                refreshToken: responseData.refreshToken,
                email: responseData.email
            };

            // Send data to content script using Custom Event
            const event = new CustomEvent('firebaseAuthTokens', {
                detail: tokenData
            });
            document.dispatchEvent(event);

            // Log success message
            console.log('🔑 Firebase Signup Tokens Intercepted');

            return response;
        } catch (error) {
            console.error('❌ Interceptor Error:', error);
            return originalFetch.apply(this, args);
        }
    }

    // For all other requests, proceed normally
    return originalFetch.apply(this, args);
};

// Log installation message
console.log('🎯 Firebase Signup Token Interceptor Installed');

// Add listener for any potential errors
window.addEventListener('error', (event) => {
    console.error('🚨 Interceptor Global Error:', event.error);
});