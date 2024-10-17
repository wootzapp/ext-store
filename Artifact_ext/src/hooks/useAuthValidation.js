// import { useEffect, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuthToken } from './useAuthToken';
// import { isTokenExpired } from '../services/tokenUtils';

// export const useAuthValidation = () => {
//     const { token, clearToken } = useAuthToken();
//     const [isValidating, setIsValidating] = useState(true);
//     const navigate = useNavigate();
//     const location = useLocation();

//     useEffect(() => {
//         const validateToken = async () => {
//             setIsValidating(true);
//             if (!token || isTokenExpired(token)) {
//                 await clearToken();
//                 navigate('/login', { state: { from: location }, replace: true });
//             }
//             setIsValidating(false);
//         };

//         validateToken();
//     }, [token, clearToken, navigate, location]);

//     return isValidating;
// };