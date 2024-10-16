import React, { useState } from 'react';
import { IoArrowBack } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { IoCloseOutline } from "react-icons/io5";
import { IoInformationCircleOutline } from "react-icons/io5";
import starbucksLogo from '../images/starbucks.jpg';
import starIcon from '../images/star.png';
import reliclogo from '../images/RelicDAOLogo.png'
import referralImage from '../images/banner.png';
import relicDAOLogo from '../images/RelicDAOLogo.png';
import { useNavigate } from 'react-router-dom';
import { Sheet } from 'react-modal-sheet';
import { loadWallet } from '../lib/api';
const InfoSheet = ({ onClose }) => {
    return (
        <div className="bg-black text-white p-3 rounded-t-2xl max-w-md mx-auto">
            <div className='flex justify-end items-center'>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <IoCloseOutline size={24} />
                </button>
            </div>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold">Understanding RelicDAO points system</h2>
            </div>

            <p className="text-gray-400 mb-2">
                RelicDAO has 2 type of points for Wootz users, WootzRelics and RelicPoints.
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
}

const SettingsSheet = ({ onClose }) => {
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
                onClick={() => window.open('https://app.relicdao.com', '_blank')}
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
        </div>
    );
}

const RelicDAODashboard = () => {
    const navigate = useNavigate();
    const [isPressed, setIsPressed] = useState(false);
    const [isInfoSheetOpen, setInfoSheetOpen] = useState(false);
    const [isSettingsSheetOpen, setSettingsSheetOpen] = useState(false);
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
            <div className="bg-black text-white pl-4 flex flex-col items-center justify-around">
                <div className="flex flex-row items-center justify-between mb-4 w-full">
                    <div className="bg-[#272a2f] rounded-xl pl-3 p-2 flex flex-col items-start flex-1 mr-2">
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold">500</span>
                            <img src={starIcon} alt="Star" className="w-6 h-6" />
                        </div>
                        <span className="text-gray-400 text-sm mt-1">WootzRelics</span>
                    </div>
                    <div className="bg-[#272a2f] rounded-xl pl-3 p-2 flex flex-col items-start flex-1 ml-2">
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold">100</span>
                            <img src={reliclogo} alt="Hexagon" className="w-6 h-6 rounded-full" />
                        </div>
                        <span className="text-gray-400 text-sm mt-1">RelicPoints</span>
                    </div>
                    <IoInformationCircleOutline size={20} className="text-gray-400 ml-2" onClick={handleInfoButton} />
                </div>

                <div className="flex flex-row items-center justify-center mb-6">
                    <div className="flex items-baseline">
                        <span className="text-xl font-bold mr-2">Relic Explorer.</span>
                        <span className="text-xl font-normal text-gray-400">Level 1</span>
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

            <div className="bg-[#101727] rounded-lg p-4">
                <h3 className="font-bold mb-2">Refer and earn</h3>
                <p className="text-sm mb-4">
                    Unlock unlimited earning potential with RelicDAO's referral program! Earn 20% from primary, 10% from secondary, and 5% from tertiary referrals' total points
                </p>
                <p className="text-sm mb-2">Your referral link:</p>
                <div className="text-purple-400 rounded-lg text-sm mb-4">Link</div>
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
                        <SettingsSheet onClose={() => setSettingsSheetOpen(false)} />
                    </Sheet.Content>
                </Sheet.Container>
                <Sheet.Backdrop />
            </Sheet>
        </div>
    );
};

export default RelicDAODashboard;