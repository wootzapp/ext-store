/* global chrome */
import React, { useState, useEffect } from 'react';
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
import { loadWallet } from '../lib/api';
import twitterBanner from '../images/rb_45418.png';
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
                RelicDAO has 2 types of points for Wootz users: WootzRelics and RelicPoints.
            </p>

            <h3 className="text-xl font-semibold mb-2">Native points</h3>

            <div className="bg-[#191d21] rounded-lg p-4 mb-3">
                <div className="flex items-center mb-2">
                    <img src={starIcon} alt="Star" className="w-6 h-6 mr-2 rounded-full" />
                    <span className="text-lg font-semibold">WootzRelics</span>
                </div>
                <p className="text-gray-400 mb-2">
                    WootzRelics are points exclusive only to Wootz, and can be converted into USDT.
                </p>
                <p className="text-gray-400">
                    You can earn WootzRelics by watching featured ads on Wootz, and participating in other quests.
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


const SettingsSheet = ({ onClose,onLogout }) => {
    const navigate = useNavigate();
    const handleProfileButton = async () => {
        console.log("Profile button pressed");
        const token = localStorage.getItem('authToken');
        // const data = await loadWallet(token);
        // console.log(data);
        navigate('/relicdao/dashboard/profile');
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
                className="w-full bg-[#272a2f] text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition duration-300"
                onClick={() => navigate('/relicdao')}
            >
                Go to RelicDAO
            </button>
            <button
                className="w-full bg-[#272a2f] text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition duration-300 mt-2"
                // onClick={() => navigate('/relicdao/dashboard/profile')}
                onClick={handleProfileButton}
            >
                Profile
            </button>
            <button
                className="w-full bg-[#272a2f] text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition duration-300 mt-2"
                onClick={onLogout}
                // onClick={()=>{
                //     // onLogout();
                //     localStorage.removeItem('authToken');
                //     setTimeout(() => {
                //         navigate('/relicdao', { replace: true });
                //     }, 100);
                // }}
            >
                Logout
            </button>
        </div>
    );
}

const RelicDAODashboard = ({onLogout}) => {
    const navigate = useNavigate();
    const [isPressed, setIsPressed] = useState(false);
    const [isInfoSheetOpen, setInfoSheetOpen] = useState(false);
    const [isSettingsSheetOpen, setSettingsSheetOpen] = useState(false);

    // State to hold dynamic points and level data
    const [points, setPoints] = useState(null);
    const [level, setLevel] = useState(null);
    const [referralCode, setReferralCode] = useState(null);
    const [isDataStakingOn, setIsDataStakingOn] = useState(false);
    const [isTwitterConnected, setIsTwitterConnected] = useState(false);

    useEffect(() => {
        const apiUrl = process.env.REACT_APP_CORE_API_URL;
        // Fetch points and level data when the component mounts
        const fetchUserData = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const response = await axios.get(`${apiUrl}/v2/xp/me`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (response.data.success) {
                        setPoints(response.data.points);
                        setLevel(response.data.level);
                    }

                    const userResponse = await axios.get(`${apiUrl}/v2/users/me`, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    });
        
                    if (userResponse.data.success) {
                        setReferralCode(userResponse.data.profile.referral_code);
                    } 

                    const stakingResponse = await axios.post(`${apiUrl}/v2/externals/data-staking/verify`,
                        {
                          reward: "TELEGRAM_FEATURED_AD_REWARD",
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                    );
              
                    if (stakingResponse.data.success) {
                        console.log(stakingResponse.data);
                        setIsDataStakingOn(stakingResponse.data.success); 
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };
        fetchUserData();

        // TODO: Can use websocket instead of calling the api on an interval.
        const intervalId = setInterval(fetchUserData, 30000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        // Check both localStorage and chrome storage for Twitter status
        const checkTwitterStatus = async () => {
            // Check localStorage
            const localStatus = localStorage.getItem('twitterConnected');
            
            // Check chrome storage
            chrome.storage.local.get(['isTwitterAuthenticated', 'initialUsername'], (result) => {
                console.log('🔍 Checking Twitter status:', result);
                const isAuthenticated = result.isTwitterAuthenticated || localStatus === 'true';
                
                if (isAuthenticated && result.initialUsername) {
                    console.log('✅ Twitter is connected for user:', result.initialUsername);
                    setIsTwitterConnected(true);
                    localStorage.setItem('twitterConnected', 'true');
                }
            });
        };

        checkTwitterStatus();

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
        const signupUrl = "https://dev.relicdao.com/offer-landing?offer_id=eclipse-relicdao&utm_term=test_test_test_test";
        window.location.href = signupUrl;
    };

    const handleBackClick = () => {
        //
    };

    const handleCopyReferralCode = () => {
        const referralUrl = `https://app.relicdao.com/web3-landing?offer_id=artifact-relicdao-launch&utm_term=test_test_test_test?referral=${referralCode}`;
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
                        <button className="text-2xl mr-4" onClick={handleBackButton}>
                            <IoArrowBack />
                        </button>
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
                                <span className="text-2xl font-bold">500</span>
                                <img src={starIcon} alt="Star" className="w-6 h-6" />
                            </div>
                            <span className="text-gray-400 text-sm mt-1">WootzRelics</span>
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
                    <p className="text-sm mb-4">Watch today's ad to earn 25 WootzRelics</p>
                    <div className="relative rounded-lg p-0 flex justify-between items-center">
                        <img src={starbucksLogo} alt="Starbucks" className="w-full h-full object-contain rounded-lg" />
                        <div
                            className={`absolute bottom-4 right-4 bg-green-700 rounded-full p-2 shadow-xl border-4 border-white
                        transition-all duration-150 ease-in-out transform
                        ${isPressed ? 'scale-95 bg-green-800' : 'hover:scale-105'}`}
                            onClick={() => {
                                console.log("Watch ad");
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
                    </div>
                </div>

                <div className="bg-[#101727] rounded-lg p-4 mt-4 mb-6">
                    <h3 className="font-bold mb-2">Twitter Integration</h3>
                    <p className="text-sm mb-4">
                        {isTwitterConnected 
                            ? 'Manage your Twitter data scraping settings and view collected data.'
                            : 'Connect your Twitter account to earn additional RelicPoints! We\'ll analyze your Twitter activity to provide personalized rewards and insights.'}
                    </p>
                    <div className="flex flex-col">
                        <div className="text-sm text-gray-400 mb-3">
                            {isTwitterConnected 
                                ? 'Twitter account connected successfully!'
                                : 'Start earning points from Twitter'}
                        </div>

                        <img src={twitterBanner} alt="Twitter Integration" className="w-full h-36 object-cover rounded-lg mb-4" />
                        <button
                            onClick={isTwitterConnected ? handleTwitterControls : handleTwitterAuth}
                            className={`py-2 px-4 rounded-lg hover:bg-opacity-90 transition duration-300 font-semibold w-full ${
                                isTwitterConnected 
                                    ? 'bg-green-600 text-white hover:bg-green-700' 
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                        >
                            {isTwitterConnected ? 'Twitter Scraping Controls' : 'Connect Twitter'}
                        </button>
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
                            <SettingsSheet onClose={() => setSettingsSheetOpen(false)} onLogout={onLogout} />
                        </Sheet.Content>
                    </Sheet.Container>
                    <Sheet.Backdrop />
                </Sheet>
            </div>
            
    );
};

export default RelicDAODashboard;