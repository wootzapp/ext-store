import React from 'react';
import relicDAOLogo from '../images/RelicDAOLogo.png';
import relicDAOCharacters from '../images/RelicDAOCharacters.png';
import { IoArrowBack } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useAuthToken } from '../hooks/useAuthToken';
import { createThirdwebClient } from 'thirdweb';
import { ConnectButton, useConnect } from 'thirdweb/react';
import { createWallet } from 'thirdweb/wallets';
import { darkTheme } from 'thirdweb/react';

const RelicDAOHomePage = () => {
    const navigate = useNavigate();
    const { token } = useAuthToken();
    const connect = useConnect();
    const client = createThirdwebClient({ clientId: "12332434234" });
    
    const handleSignUp = () => {
        const signupUrl = "https://dev.relicdao.com";
        window.location.href = signupUrl;
        console.log("trying to connect");
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleBackButton = () => {
        console.log("Back button pressed");
        navigate(-1);
    };

    const handleConnect = async () => {
        try {
            const wallet = await connect();
            console.log("Connected wallet:", wallet);
        } catch (error) {
            console.error("Failed to connect wallet:", error);
        }
    };

    return (
        <div className="bg-black text-white min-h-screen p-6">
            <header className="flex items-center mb-6 justify-between">
                <div className="flex items-center">
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

                {token ? (
                    <button 
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold" 
                        onClick={() => navigate('/relicdao/dashboard')}
                    >
                        Continue to RelicDAO Dashboard
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-center mb-4">
                            <ConnectButton
                                client={client}
                                wallets={[
                                    createWallet("io.metamask"),
                                    createWallet("com.coinbase.wallet"),
                                    createWallet("me.rainbow"),
                                ]}
                                theme={darkTheme({
                                    colors: {
                                      separatorLine: "hsl(258, 90%, 66%)",
                                      modalBg: "hsl(228, 12%, 8%)",
                                      secondaryButtonBg: "hsl(233, 12%, 15%)",
                                      secondaryButtonText: "hsl(240, 6%, 94%)",
                                      secondaryButtonHoverBg: "hsl(228, 12%, 17%)",
                                      secondaryIconHoverColor: "hsl(240, 6%, 94%)",
                                      inputAutofillBg: "hsl(228, 12%, 8%)",
                                      scrollbarBg: "hsl(231, 11%, 12%)",
                                      accentText: "hsl(216, 100%, 60%)",
                                    },
                                  })}
                                connectButton={{ label: "Connect Wallet" }}
                                connectModal={{ size: "wide" }}
                            />
                        </div>
                        <button 
                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors duration-300" 
                            onClick={handleSignUp}
                        >
                            Sign up
                        </button>
                        <div className="text-center text-gray-400">
                            Already have an account? 
                            <button 
                                className="text-purple-500 hover:text-purple-400 ml-1 font-medium"
                                onClick={handleLogin}
                            >
                                Log in
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RelicDAOHomePage;