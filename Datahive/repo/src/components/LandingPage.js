import React from 'react';
import { useNavigate } from 'react-router-dom';
import wootzImage from '../images/wootz.png';
import { FaCoins, FaShieldAlt } from 'react-icons/fa';

function LandingPage() {
    const navigate = useNavigate();

    const handleSignUp = () => {
        navigate('/signup');
    };

    return (
        <div className="bg-gray-900 min-h-screen w-full text-white font-sans flex flex-col justify-between p-4 overflow-auto">
            <header className="text-center mb-4">
                <div className="w-1/2 h-auto mx-auto mb-2">
                    <img
                        src={wootzImage}
                        alt="WootzApp Logo"
                        className="w-full h-full object-contain max-h-16"
                    />
                </div>
                <h1 className="text-xl font-bold mb-1">Welcome to WootzApp</h1>
                <p className="text-xs text-gray-300">
                    Discover amazing features and boost your productivity!
                </p>
            </header>

            <section className="bg-gray-800 rounded-lg p-4 my-4 flex-grow flex flex-col justify-around">
                <div className="text-3xl font-bold mb-0 text-purple-400">Datahive</div>
                <div className="text-sm font-normal -mt-1 mb-2 text-purple-100">Your Digital Goldmine</div>
                <div className="flex justify-around items-center mb-4">
                    <div className="text-center">
                        <FaCoins className="text-yellow-400 text-2xl mb-1 mx-auto" />
                        <h3 className="text-sm font-semibold">Earn Rewards</h3>
                    </div>
                    <div className="text-center">
                        <FaShieldAlt className="text-blue-400 text-2xl mb-1 mx-auto" />
                        <h3 className="text-sm font-semibold">Data Control</h3>
                    </div>
                </div>
                <button
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-4 rounded-full w-full transition-colors duration-300 text-sm"
                    onClick={handleSignUp}
                >
                    Start Mining Your Data Now!
                </button>
            </section>
        </div>
    );
}

export default LandingPage;
