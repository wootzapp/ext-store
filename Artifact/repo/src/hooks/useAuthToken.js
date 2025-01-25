/* global chrome */
// import { useState, useEffect, useCallback } from 'react';
// // import { isTokenExpired } from '../services/tokenUtils';
// import { useNavigate } from 'react-router-dom';

// export function useAuthToken() {
//     const [token, setToken] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const navigate = useNavigate();
//     const fetchToken = useCallback(async () => {
//         setLoading(true);
//         try {
//             const response = await new Promise((resolve) => {
//                 chrome.runtime.sendMessage({ type: 'GET_TOKEN' }, resolve);
//             });

//             if (response.success) {
//                 setToken(response.token);
//                 setError(null);
//             } else {
//                 setToken(null);
//                 setError(response.error || 'Failed to retrieve token');
//             }
//         } catch (err) {
//             setToken(null);
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchToken();
//     }, [fetchToken]);

//     const saveToken = useCallback(async (newToken) => {
//         setLoading(true);
//         try {
//             const response = await new Promise((resolve) => {
//                 chrome.runtime.sendMessage({ type: 'SAVE_TOKEN', token: newToken }, resolve);
//             });

//             if (response.success) {
//                 setToken(newToken);
//                 setError(null);
//                 return true;
//             } else {
//                 setError(response.error || 'Failed to save token');
//                 return false;
//             }
//         } catch (err) {
//             setError(err.message);
//             return false;
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     const clearToken = useCallback(async () => {
//         return await saveToken(null);
//     }, [saveToken]);

//     // Check token expiration periodically
//     // useEffect(() => {
//     //     const checkTokenExpiration = async () => {
//     //         if (token && isTokenExpired(token)) {
//     //             await clearToken();
//     //             setToken(null);
//     //             navigate('/login', { replace: true });
//     //         }
//     //         else if(!token){
//     //             navigate('/login', { replace: true });
//     //         }
//     //     };

//     //     const intervalId = setInterval(checkTokenExpiration, 60000); // Check every minute

//     //     return () => clearInterval(intervalId);
//     // }, [token, navigate]);

//     return { token, loading, error, saveToken, clearToken, refreshToken: fetchToken };
// }


import { useState, useEffect, useCallback } from 'react';

export function useAuthToken() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchToken = useCallback(async () => {
        setLoading(true);
        try {
            const result = await new Promise((resolve) => {
                chrome.storage.sync.get(['token'], resolve);
            });

            if (result.token) {
                setToken(result.token);
                setError(null);
            } else {
                setToken(null);
                setError('No token found');
            }
        } catch (err) {
            setToken(null);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchToken();
    }, [fetchToken]);

    const saveToken = useCallback(async (newToken) => {
        setLoading(true);
        try {
            await new Promise((resolve) => {
                chrome.storage.sync.set({ token: newToken }, resolve);
            });
            setToken(newToken);
            setError(null);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearToken = useCallback(async () => {
        return await saveToken(null);
    }, [saveToken]);

    return { token, loading, error, saveToken, clearToken, refreshToken: fetchToken };
}
