/* global chrome */
/* global google */
import React, { useState, useEffect, useCallback } from 'react';
import { IoArrowBack, IoSettingsOutline, IoCloseOutline, IoInformationCircleOutline } from "react-icons/io5";
import dataStakingOn from '../images/dataStakingOn.png';
import dataStakingOff from '../images/dataStakingOff.png';
import starbucksLogo from '../images/starbucks.jpg';
import starIcon from '../images/star.png';
import reliclogo from '../images/RelicDAOLogo.png'
import referralImage from '../images/banner.png';
import relicDAOLogo from '../images/RelicDAOLogo.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Sheet } from 'react-modal-sheet';
import { ArrowLeftIcon } from '@heroicons/react/24/solid'; 
import { getUserProfile, loadWallet } from '../lib/api';
import twitterBanner from '../images/rb_45418.png';
import { createThirdwebClient } from 'thirdweb';
import { VideoPlayer } from './VideoPlayer';
// import { useActiveAccount } from 'thirdweb/react';
// import { createWallet } from 'thirdweb/wallets';
// import { darkTheme } from 'thirdweb/react';
// import { SecretKeyGenerator } from '../lib/secret_key';
import { loadWallets } from '../lib/thirdweb_controller';
import { useSecretKey } from '../lib/useSecretKey';
import { omniAbi } from '../lib/omni';
import { useAuthToken } from '../hooks/useAuthToken';


const InfoSheet = ({ onClose }) => {
    return (
        <div className="bg-black text-white p-3 rounded-t-2xl max-w-md mx-auto h-[90vh] overflow-y-auto">
            <div className="flex justify-end items-center">
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-white" 
                    aria-label="Close Information Sheet"
                >
                    <IoCloseOutline size={24} />
                </button>
            </div>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold">Understanding RelicDAO points system</h2>
            </div>

            <p className="text-gray-400 mb-2">
                RelicDAO has 2 types of points for Wootz users: Sparks and RelicPoints.
            </p>

            <h3 className="text-xl font-semibold mb-2">Native points</h3>

            <div className="bg-[#191d21] rounded-lg p-4 mb-3">
                <div className="flex items-center mb-2">
                    <img src={starIcon} alt="Star" className="w-6 h-6 mr-2 rounded-full" />
                    <span className="text-lg font-semibold">Sparks</span>
                </div>
                <p className="text-gray-400 mb-2">
                    Sparks are points exclusive only to Wootz, and can be converted into USDT.
                </p>
                <p className="text-gray-400">
                    You can earn Sparks by watching featured ads on Wootz, and participating in other quests.
                </p>
            </div>

            <div className="bg-[#191d21] rounded-lg p-4">
                <div className="flex items-center mb-2">
                    <img src={reliclogo} alt="Hexagon" className="w-6 h-6 mr-2 rounded-full" />
                    <span className="text-lg font-semibold">RelicPoints</span>
                </div>
                <p className="text-gray-400">
                    Relic points can be earned by watching daily ads and staking your data. These points help you level up for some special rewards we have planned later on! 🚀🌕
                </p>
            </div>
        </div>
    );
};


const SettingsSheet = ({ onClose, profileData }) => {
    const navigate = useNavigate();
    const { clearToken } = useAuthToken();
    
    const handleProfileButton = async () => {
        console.log("Profile button pressed", { profileData });
        
        if (!profileData) {
            try {
                console.log("Fetching profile data before navigation");
                const profile = await getUserProfile();
                if (profile) {
                    console.log("Profile data fetched successfully:", profile);
                    navigate('/relicdao/dashboard/profile', { 
                        state: { profileData: profile } 
                    });
                } else {
                    console.error("Profile data could not be loaded");
                    alert("Unable to load profile data. Please try again later.");
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
                alert("Could not access your profile. Please try again.");
            }
        } else {
            // If profileData already exists, navigate directly
            navigate('/relicdao/dashboard/profile', { 
                state: { profileData } 
            });
        }
    };

    const onLogout_clearStorage = () => {
        console.log("Logging out");
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('dataStakingStatus');
        localStorage.removeItem('twitterConnected');
        navigate('/logout');
    };
    
    const handleLogout = async () => {
        try {
            // Check if current tab is chrome new tab
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const isNewTab = activeTab?.url === 'chrome-native://newtab/';

            // Clear token using the hook
            await clearToken();

            localStorage.setItem('authToken', null);
            localStorage.setItem('refreshToken', null);
            localStorage.setItem('secretKey', null);
            localStorage.setItem('twitterConnected', false);
            localStorage.setItem('dataStakingStatus', false);

            // Clear ALL relevant storage
            await chrome.storage.local.clear();
            
            // Set specific logout flags
            await chrome.storage.local.set({
                isLoggedIn: false,
                authToken: null,
                refreshToken: null,
                secretKey: null,
                twitterConnected: false,
                dataStakingStatus: false
            });

            console.log('Logged out, storage updated');
            
            // If we're on a new tab page, close it and open a new one
            if (isNewTab) {
                await chrome.tabs.remove(activeTab.id);
                await chrome.tabs.create({ url: 'chrome-native://newtab/' });
            }
            
            onLogout_clearStorage();
        } catch (error) {
            console.error('Error during logout:', error);
            // Fallback logout - ensure user is still logged out even if there's an error
            onLogout_clearStorage();
        }
    };

    return (
        <div className="bg-black text-white p-6 rounded-t-2xl max-w-md mx-auto">
            <div className='flex justify-between items-center mb-6'>
                <h2 className="text-2xl font-bold">Settings</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <IoCloseOutline size={24} />
                </button>
            </div>
            <p className="text-gray-400 mb-6">
                To manage your account settings, please visit app.relicdao.com
            </p>
            <button
                className="w-full bg-[#272a2f] text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition duration-300 mt-2"
                onClick={handleProfileButton}
            >
                Profile
            </button>
            <button
                className="w-full bg-[#272a2f] text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition duration-300 mt-2"
                onClick={handleLogout}
            >
                Logout
            </button>
        </div>
    );
}

const RelicDAODashboard = () => {
    const navigate = useNavigate();
    const [isPressed, setIsPressed] = useState(false);
    const [isInfoSheetOpen, setInfoSheetOpen] = useState(false);
    const [isSettingsSheetOpen, setSettingsSheetOpen] = useState(false);
    const [showAd, setShowAd] = useState(false);
    const [advertisingToken, setAdvertisingToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);

    // State to hold dynamic points and level data
    const [points, setPoints] = useState(null);
    const [level, setLevel] = useState(null);
    const [sparks, setSparks] = useState(null);
    const [referralCode, setReferralCode] = useState(null);
    const [isDataStakingOn, setIsDataStakingOn] = useState(false);
    const [isTwitterConnected, setIsTwitterConnected] = useState(false);

    const [walletAddress, setWalletAddress] = useState(null);
    const [account, setAccount] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [hasInitiatedKeyGeneration, setHasInitiatedKeyGeneration] = useState(false);
    const [prf, setPrf] = useState(null);   
    const [isRetrying, setIsRetrying] = useState(false);
    const [retryTimeout, setRetryTimeout] = useState(null);
    
    // Add retry mechanism for profile fetching
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 10;
    const RETRY_DELAY = 10000; // 10 seconds
    
    // Initialize the useSecretKey hook
    const { handleGetKey, secretKey, isLoading } = useSecretKey({
        userIdentity: prf?.omnikey_id,
        account: account,
        userAddress: walletAddress,
        omniKeyStore: process.env.REACT_APP_ENVIRONMENT === "production"
            ? "0x23B71aA8ac3325070611099667B04556958e09Cb"
            : "0x2a935BE53f0b7Ce44E1CDaE81f200582eBd2f8a8",
        omniAbi,
        authUser: { uid: profileData?.user_uid },
        onSuccess: useCallback((secretKey, uid) => {
            console.log('🔐 Secret key generated:', {
                success: !!secretKey,
                secretKey: secretKey,
                keyLength: secretKey ? secretKey.length : 0
            });
            // Store in chrome storage if needed
            const token = localStorage.getItem('authToken');
            chrome.storage.local.set({ 
                authToken: token,
                isLoggedIn: true,
                secretKey: secretKey
            }, () => {
                console.log('💾 Secret key stored in chrome storage');
            });
        }, [])
    });

    // Add new function to sync tokens
    const syncAuthToken = async () => {
        const localToken = localStorage.getItem('authToken');
        
        const chromeStorage = await chrome.storage.local.get(['authToken']);
        
        const chromeToken = chromeStorage.authToken;


        const localrefreshToken = localStorage.getItem('refreshToken');
        const chromerefreshToken = chromeStorage.refreshToken;

        if (chromeToken && chromeToken !== localToken) {
            console.log('🔄 Syncing auth token from chrome storage to local storage');
            console.log('🔑 Chrome storage , local storage and chrome token:',{chromeToken,localToken,chromeStorage,localrefreshToken,chromerefreshToken});
        
            localStorage.setItem('authToken', chromeToken);
            localStorage.setItem('refreshToken', chromerefreshToken);
            console.log('✅ Auth token synced');
            return chromeToken;
        }
        return localToken;
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // First sync the auth token
                await syncAuthToken();
                const token = localStorage.getItem('authToken');
                console.log('Current auth token:', token ? 'Present' : 'Missing');

                if (!token) {
                    console.error('No auth token available');
                    return;
                }

                // Log headers being sent
                const headers = {
                    Authorization: `Bearer ${token}`
                };
                console.log('Request headers:', headers);

                try {
                    const response = await axios.get(`${process.env.REACT_APP_CORE_API_URL}/v2/xp/me`, {
                        headers: headers
                    });
                    console.log('XP response:', response.data);
                    if (response.data.success) {
                        setPoints(response.data.points);
                        setLevel(response.data.level);
                    }
                } catch (error) {
                    console.error('Error fetching XP data:', error.response?.data || error.message);
                }

                try {
                    const response_Sparks = await axios.get(`${process.env.REACT_APP_CORE_API_URL}/v2/xp/platform/points/WEBSITE`, {
                        headers: headers
                    });
                    console.log('Sparks response:', response_Sparks.data);
                    if (response_Sparks?.data) {
                        setSparks(response_Sparks.data.user_platform.points);
                    }
                } catch (error) {
                    console.error('Error fetching Sparks data:', error.response?.data || error.message);
                }

                try {
                    // Get user profile and advertising tokens
                    const userProfile = await getUserProfile();
                    console.log('User Profile full response:', userProfile);
                    
                    // Find UID2 operator in identity_services
                    const uid2Operator = userProfile?.identity_services?.find(service => service.operator_name === 'UID2');
                    console.log('UID2 Operator found:', uid2Operator);
                    
                    if (uid2Operator) {
                        console.log('Setting advertising tokens:', {
                            advertising_token: uid2Operator.advertising_token,
                            refresh_token: uid2Operator.refresh_token
                        });
                        setAdvertisingToken(uid2Operator.advertising_token);
                        setRefreshToken(uid2Operator.refresh_token);
                    } else {
                        console.warn('No UID2 operator found in identity_services');
                        // Log the full profile structure to debug
                        console.log('Full profile structure:', JSON.stringify(userProfile, null, 2));
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error.response?.data || error.message);
                }

            } catch (error) {
                console.error('Error in fetchUserData:', error);
                if (error.response?.status === 401) {
                    console.log('Unauthorized error - clearing tokens');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('refreshToken');
                    chrome.storage.local.set({
                        authToken: null,
                        isLoggedIn: false
                    });
                }
            }
        };

        fetchUserData();
        const intervalId = setInterval(fetchUserData, 30000);
        return () => clearInterval(intervalId);
    }, []);

    const client = createThirdwebClient({
        clientId: process.env.REACT_APP_THIRDWEB_CLIENT_ID
      });

    // const account = useActiveAccount();

    // const { thirdwebAuth } = useThirdwebController();

    useEffect(() => {
        let isSubscribed = true;

        const initializeWallet = async () => {
            if (!isSubscribed) return;
            
            console.log('🔄 Starting wallet initialization...');
            try {
                const token = await chrome.storage.local.get('authToken');
                localStorage.setItem('authToken', token.authToken);
                console.log('🔑 Token Aaditesh:', token);
                
                // Store getUserProfile response in a local variable
                const userProfileResponse = await getUserProfile();
                console.log('🔑 Profile Aaditesh for wallet initialization:', userProfileResponse);
                if (!isSubscribed) return;

                if (!token || !userProfileResponse) {
                    console.warn('⚠️ Missing required data:', {
                        hasToken: !!token,
                        hasProfile: !!userProfileResponse
                    });
                    return;
                }

                setProfileData(userProfileResponse);

                console.log('🔑 Initializing ThirdWeb with:', {
                    hasUid: !!userProfileResponse.uid,
                    hasToken: !!token
                });

                console.log('🔑 Token:', token);
                console.log('🔑 Profile UID:', userProfileResponse.user_uid);
                const wallet = await loadWallets();
                if (!isSubscribed) return;

                const address = wallet.address;
              
                setWalletAddress(address);
                console.log('✅ Wallet initialized:', { address });
                setAccount(wallet);
            } catch (error) {
                if (!isSubscribed) return;
                console.error('❌ Wallet initialization failed:', {
                    errorType: error.name,
                    errorMessage: error.message,
                    stack: error.stack
                });
            }
        };

        initializeWallet();

        return () => {
            isSubscribed = false;
        };
    }, []);

    // Modify the secret key generation effect
    useEffect(() => {
        const generateSecretKey = async () => {
            try {
                // If we don't have a profile yet, fetch it
                if (!prf) {
                    const profile = await getUserProfile();
                    console.log('🔑 Profile fetched for secret key generation:', profile);
                    
                    // If profile doesn't have omnikey_id and we haven't exceeded retries
                    if (!profile?.omnikey_id && retryCount < MAX_RETRIES) {
                        console.log(`⏳ No omnikey_id found, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
                        setTimeout(() => {
                            setRetryCount(prev => prev + 1);
                        }, RETRY_DELAY);
                        return;
                    }
                    
                    setPrf(profile);
                    
                    // Early return if we still don't have what we need
                    if (!profile?.omnikey_id) {
                        console.error('❌ Failed to get omnikey_id after retries');
                        return;
                    }
                }

                // Only proceed with key generation if we have both wallet and omnikey_id
                if (!walletAddress || !prf?.omnikey_id || hasInitiatedKeyGeneration) {
                    return;
                }

                console.log('🏗️ Triggering secret key generation...', {
                    hasWallet: !!walletAddress,
                    hasOmniKeyId: !!prf?.omnikey_id,
                    hasInitiated: hasInitiatedKeyGeneration
                });

                setHasInitiatedKeyGeneration(true);
                await handleGetKey();
            } catch (error) {
                console.error('Error in generateSecretKey:', error);
                // Retry on error if we haven't exceeded max retries
                if (retryCount < MAX_RETRIES) {
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                    }, RETRY_DELAY);
                }
            }
        };

        generateSecretKey();
    }, [walletAddress, prf, hasInitiatedKeyGeneration, retryCount]);

    useEffect(() => {
        // Check both localStorage and chrome storage for Twitter status
      

        // Listen for Twitter auth updates from background script
        const authListener = (message) => {
            console.log('📨 Received message in dashboard:', message);
            
            if (message.type === 'TWITTER_AUTH_UPDATED') {
                console.log('🔐 Twitter auth updated:', message.data);
                
                if (message.data.isAuthenticated) {
                    console.log('✅ Twitter authenticated, updating UI');
                    setIsTwitterConnected(true);
                    localStorage.setItem('twitterConnected', 'true');
                }
            } else if (message.type === 'INITIAL_AUTH_USERNAME') {
                console.log('👤 Initial username received:', message.data.username);
                setIsTwitterConnected(true);
                localStorage.setItem('twitterConnected', 'true');
            }
        };

        // Add message listener
        chrome.runtime.onMessage.addListener(authListener);

        // Cleanup
        return () => {
            chrome.runtime.onMessage.removeListener(authListener);
        };
    }, []);

    const handleDataStakingToggle = () => {
            const signupUrl = "https://app.relicdao.com/staking";
            window.location.href = signupUrl;
    };

    const handleBackClick = () => {
        //
    };

    const handleCopyReferralCode = () => {
        const referralUrl = `https://app.relicdao.com/chain/landing?referral=${referralCode}`;
        navigator.clipboard.writeText(referralUrl)
            .then(() => {
                alert('Referral code copied to clipboard!');
            })
            .catch((error) => {
                console.error('Error copying referral code:', error);
            });
    };

    const handlePressStart = () => setIsPressed(true);
    const handlePressEnd = () => setIsPressed(false);
    const [Content, setContent] = useState(null);
    const handleBackButton = () => {
        console.log("Back button pressed");
        navigate('/relicdao');

    };
    const handleInfoButton = () => {
        console.log("Info button pressed");
        setSettingsSheetOpen(false); // Close settings sheet if open
        setInfoSheetOpen(true);
    };
    const handleSettingsButton = () => {
        console.log("Settings button pressed");
        setInfoSheetOpen(false); // Close info sheet if open
        setSettingsSheetOpen(true);
    };

    const handleTwitterAuth = async () => {
        console.log('🔄 Starting Twitter auth process...');
        
        try {
            // Check current status
            const twitterStatus = localStorage.getItem('twitterConnected');
            
            if (twitterStatus === 'true') {
                console.log('✅ Twitter already connected, navigating to controls');
                navigate('/twitter-control');
                return;
            }

            // Reset storage states
            await chrome.storage.local.set({ 
                isScrapingEnabled: false,
                hasScrapedProfile: false,
                hasScrapedLikes: false,
                hasScrapedFollowing: false,
                hasInitialAuth: false,
                initialUsername: null,
                tweets: [],
                profileData: null,
                likesCount: null
            });

            // Open Twitter in a new tab
            const tab = await chrome.tabs.create({
                url: 'https://x.com',
                active: true
            });

            // Send message to check Twitter auth
            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === tab.id && info.status === 'complete') {
                    chrome.tabs.sendMessage(tabId, { type: 'CHECK_TWITTER_AUTH' });
                }
            });

        } catch (error) {
            console.error('❌ Error in Twitter auth process:', error);
        }
    };

    const handleTwitterControls = () => {
        console.log('📱 Navigating to Twitter controls...');
        navigate('/twitter-control');
    };

    return (
            <div className="bg-black text-white min-h-screen p-4">
                <header className="flex items-center mb-6 justify-between py-4">
                    <div className="flex items-center">
                        <img src={relicDAOLogo} alt="RelicDAO Logo" className="w-8 h-8" />
                        <span className="ml-2 text-xl font-bold">RelicDAO</span>
                    </div>
                    <IoSettingsOutline className='text-2xl' onClick={handleSettingsButton} />
                </header>
                <div className="bg-black text-white flex flex-col items-center justify-around">
                    <div className="bg-[#101727] rounded-lg p-2 mb-8 flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                            <img src={isDataStakingOn ? dataStakingOn : dataStakingOff} alt="Data Icon" className="w-[60px] h-[60px] mr-2" />
                            <div>
                                <h3 className="font-bold text-white text-base mb-1">
                                    Data Staking is{' '}
                                    <span className={isDataStakingOn ? 'text-green-400' : 'text-red-400'}>
                                       {isDataStakingOn ? 'ON' : 'OFF'}
                                    </span>
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {isDataStakingOn
                                        ? (
                                            <>
                                                100 daily points <br />
                                                (50 x 2X multiplier)
                                            </>
                                          )
                                        : 'Stake data, earn 100 points daily!'}
                                </p>
                            </div>
                        </div>
                        {!isDataStakingOn && (
                            <button
                                className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300 font-semibold ml-1 whitespace-nowrap"
                                onClick={handleDataStakingToggle}
                            >
                                Turn ON
                            </button>
                        )}
                    </div>
    
                    <div className="flex flex-row items-center justify-between mb-4 w-full">
                        <div className="bg-[#272a2f] rounded-xl pl-3 p-2 flex flex-col items-start flex-1 mr-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold">{sparks || "0"}</span>
                                <img src={starIcon} alt="Star" className="w-6 h-6" />
                            </div>
                            <span className="text-gray-400 text-sm mt-1">Sparks</span>
                        </div>
                        <div className="bg-[#272a2f] rounded-xl pl-3 p-2 flex flex-col items-start flex-1 ml-2 relative">
                            <div className="flex items-center">
                                <span
                                    className={`font-bold ${
                                        (points || 0).toString().length > 3 ? "text-xl" : "text-2xl"
                                    }`}
                                    style={{ minWidth: "3ch", textAlign: "left" }}
                                >
                                    {points || "0"}
                                </span>
                                <img
                                    src={reliclogo}
                                    alt="Hexagon"
                                    className="w-6 h-6 rounded-full"                        
                                />
                            </div>
                            <span className="text-gray-400 text-sm mt-1">RelicPoints</span>
                        </div>

                        <IoInformationCircleOutline size={20} className="text-gray-400 ml-2" onClick={handleInfoButton} />
                    </div>
    
                    <div className="flex flex-row items-center justify-center mb-6">
                        <div className="flex items-baseline">
                            <span className="text-xl font-bold mr-2">Relic Explorer.</span>
                            <span className="text-xl font-normal text-gray-400">Level {level || "0"}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#191d21] rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-2">
                        <span className="text-gray-400 mr-2">+25</span>
                        <img src={starIcon} alt="Star" className="w-6 h-6 rounded-full" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Daily Ad</h1>
                    <p className="text-sm mb-4">Watch today's ad to earn 25 Sparks</p>
                    <div className="relative rounded-lg p-0 flex justify-between items-center">
                        {!showAd ? (
                            <>
                                <img src={starbucksLogo} alt="Starbucks" className="w-full h-full object-contain rounded-lg" />
                                <div
                                    className={`absolute bottom-4 right-4 bg-green-700 rounded-full p-2 shadow-xl border-4 border-white
                                transition-all duration-150 ease-in-out transform
                                ${isPressed ? 'scale-95 bg-green-800' : 'hover:scale-105'}`}
                                    onClick={() => {
                                        console.log('going to show ad');
                                        console.log('Advertising token:', advertisingToken);
                                        console.log('Refresh token:', refreshToken);
                                        if (advertisingToken && refreshToken) {
                                            setShowAd(true);
                                        }
                                    }}
                                    onMouseDown={handlePressStart}
                                    onMouseUp={handlePressEnd}
                                    onMouseLeave={handlePressEnd}
                                    onTouchStart={handlePressStart}
                                    onTouchEnd={handlePressEnd}
                                    onTouchCancel={handlePressEnd}
                                >
                                    <svg className="w-8 h-8 scale-150 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    </svg>
                                </div>
                            </>
                        ) : (
                            <VideoPlayer
                                uid2Token={advertisingToken}
                                refreshToken={refreshToken}
                                adTag="https://pubads.g.doubleclick.net/gampad/live/ads?iu=/22988389496/Telegram/Reward_Video&tfcd=0&npa=0&sz=400x300%7C406x720%7C640x480&gdfp_req=1&unviewed_position_start=1&output=vast&env=vp&impl=s&correlator=12"
                                posterImage={starbucksLogo}
                                onAdWatched={() => {
                                    console.log('ad watched');
                                    setShowAd(false);
                                }}
                            />
                        )}
                    </div>
                </div>


                <div className="bg-[#101727] rounded-lg p-4">
                    <h3 className="font-bold mb-2">Refer and earn</h3>
                    <p className="text-sm mb-4">
                        Unlock unlimited earning potential with RelicDAO's referral program! Earn 20% from primary, 10% from secondary, and 5% from tertiary referrals' total points
                    </p>
                    <p className="text-sm mb-2">Your referral link:</p>
                    <div className="text-purple-400 rounded-lg text-sm mb-4">
                    {referralCode ? (
                            <button 
                              onClick={handleCopyReferralCode}
                              className="hover:text-purple-300"
                            >
                              Click here to copy your referral link
                            </button>
                        ) : (
                           "No referral link available"
                        )}
                    </div>
                    <img src={referralImage} alt="Referral" className="w-full rounded-lg" />
                </div>


                
                
                <Sheet isOpen={isInfoSheetOpen}
                    onClose={() => setInfoSheetOpen(false)}
                    detent='content-height'
                >
                    <Sheet.Container>
                        <Sheet.Header />
                        <Sheet.Content>
                            <InfoSheet onClose={() => setInfoSheetOpen(false)} />
                        </Sheet.Content>
                    </Sheet.Container>
                    <Sheet.Backdrop />
                </Sheet>
                <Sheet isOpen={isSettingsSheetOpen}
                    onClose={() => setSettingsSheetOpen(false)}
                    detent='content-height'
                >
                    <Sheet.Container>
                        <Sheet.Header />
                        <Sheet.Content>
                            <SettingsSheet 
                                onClose={() => setSettingsSheetOpen(false)} 
                                profileData={profileData}
                            />
                        </Sheet.Content>
                    </Sheet.Container>
                    <Sheet.Backdrop />
                </Sheet>
            </div>
            
    );
};

export default RelicDAODashboard;