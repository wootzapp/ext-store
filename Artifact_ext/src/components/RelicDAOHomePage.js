import React from 'react';
import relicDAOLogo from '../images/RelicDAOLogo.png';
import relicDAOCharacters from '../images/RelicDAOCharacters.png';
import { IoArrowBack } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useAuthToken } from '../hooks/useAuthToken';


const RelicDAOHomePage = () => {
    const navigate = useNavigate();
    const { token } = useAuthToken();
    const handleSignUp = () => {
        // Add your sign-up logic here
        console.log("Sign up");
        navigate('/signup');
    };
    const handleBackButton = () => {
        console.log("Back button pressed");
        navigate('/rewards');
    };
    return (
        <div className="bg-black text-white min-h-screen p-6">
            <header className="flex items-center mb-6 justify-between">
                <div className="flex items-center">
                    <button className="text-2xl mr-4" onClick={handleBackButton}>
                        <IoArrowBack/>
                    </button>
                    <img src={relicDAOLogo} alt="RelicDAO Logo" className="w-8 h-8" />
                    <span className="ml-2 text-xl font-bold">RelicDAO</span>
                </div>
            </header>

            <main>
                <h1 className="text-2xl font-semibold mb-4 mt-4">
                    Ready to embark on an epic adventure and unlock daily rewards?
                </h1>

                <p className="mb-4">
                    RelicDAO is an ads rewards platform where can earn points and cash by watching ads and
                    completing daily quests. The more you engage, the more you earn!
                </p>

                <p className="mb-6">
                    Earn from your online digital footprint by staking your "data assets". Your data is
                    anonymous and secure.
                </p>

                <div className="relative mb-6">
                    <img
                        src={relicDAOCharacters}
                        alt="RelicDAO Characters"
                        className="w-full rounded-lg"
                    />
                </div>

                <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold" onClick={handleSignUp}>
                    {token ? "Continue to RelicDAO Dashboard" : "Sign up/ Login to RelicDAO"}
                </button>
            </main>
        </div>
    );
};

export default RelicDAOHomePage;