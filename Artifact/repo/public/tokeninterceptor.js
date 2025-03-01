// Reset the fetch function if it was previously modified
if (window.originalFetch) {
    window.fetch = window.originalFetch;
}

// Store the original fetch function
window.originalFetch = window.originalFetch || window.fetch;

// Helper function to validate tokens
function areTokensValid(idToken, refreshToken) {
    return Boolean(idToken && refreshToken && 
           typeof idToken === 'string' && 
           typeof refreshToken === 'string' &&
           idToken.length > 0 && 
           refreshToken.length > 0);
}

// Helper function to log tokens safely
function logTokens(tokenType, idToken, refreshToken) {
    console.log(`${tokenType} Tokens:`);
    console.log('ID Token:', idToken);
    console.log('Refresh Token:', refreshToken);
}

// Interceptor function
window.fetch = async function (...args) {
    const [resource, config] = args;

    // Check if this is the Firebase signup request
    if (resource.includes('identitytoolkit.googleapis.com/v1/accounts:signUp')) {
        try {
            const response = await originalFetch.apply(this, args);
            const clone = response.clone();
            const responseData = await clone.json();

            if (areTokensValid(responseData.idToken, responseData.refreshToken)) {
                const tokenData = {
                    timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
                    idToken: responseData.idToken,
                    refreshToken: responseData.refreshToken,
                    email: responseData.email
                };

                // Log tokens
                logTokens('Signup', responseData.idToken, responseData.refreshToken);

                // Dispatch event only if tokens are valid
                document.dispatchEvent(new CustomEvent('firebaseAuthTokens', {
                    detail: tokenData
                }));

                console.log('🔑 Firebase Signup Tokens Intercepted');
            } else {
                console.warn('⚠️ Invalid or missing tokens in signup response');
            }
            
            return response;
        } catch (error) {
            console.error('❌ Interceptor Error:', error);
            return originalFetch.apply(this, args);
        }
    }

    // Check if this is the Firebase signin request
    if (resource.includes('identitytoolkit.googleapis.com/v1/accounts:signInWithPassword')) {
        try {
            const response = await originalFetch.apply(this, args);
            const clone = response.clone();
            const responseData = await clone.json();

            if (areTokensValid(responseData.idToken, responseData.refreshToken)) {
                const tokens = {
                    user: responseData.email,
                    timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
                    idToken: responseData.idToken,
                    refreshToken: responseData.refreshToken
                };

                // Log tokens
                logTokens('Sign In', responseData.idToken, responseData.refreshToken);

                // Dispatch event only if tokens are valid
                document.dispatchEvent(new CustomEvent('firebaseSignInTokens', {
                    detail: tokens
                }));

                console.log('🔐 Firebase Sign In Tokens Intercepted');
            } else {
                console.warn('⚠️ Invalid or missing tokens in signin response');
            }

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
console.log('🎯 Firebase Auth Token Interceptor Installed');

// Add listener for any potential errors
window.addEventListener('error', (event) => {
    console.error('🚨 Interceptor Global Error:', event.error);
});