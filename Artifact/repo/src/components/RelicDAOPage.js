import React from 'react'
import wootzImage from '../images/wootz.png';
import relicImage from '../images/start_earning.png';
import { useNavigate } from 'react-router-dom';


const RelicDAOPage = () => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/relicdao');
    }
    return (
        <div className="bg-gray-900 text-white font-sans p-6 w-full min-h-screen flex flex-col overflow-auto">
            <header className="text-center mb-8">
                <div className="w-12 h-12 mx-auto mb-4">
                    <img
                        src={wootzImage}
                        alt="WootzApp Logo"
                        className="w-full h-full object-contain"
                    />
                </div>
                <h1 className="text-2xl font-bold mb-2">WootzApp Rewards</h1>
                <p className="text-sm text-gray-300">
                    Discover exclusive rewards with our partners, exclusively for Wootz users.
                </p>
            </header>

            <section className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">RelicDAO</h2>
                <p className="text-sm text-gray-300 mb-4">
                    Watch daily ads and earn points and $$ from your digital footprint!
                </p>
                <div className="mb-4">
                    <img
                        src={relicImage}
                        alt="RelicDAO characters"
                        className="w-full rounded-lg"
                    />
                </div>
                <button className="text-purple-400 text-left w-full py-2 text-sm font-medium text-center" onClick={handleClick}>
                    Start earning on RelicDAO &gt;
                </button>
            </section>

            {/* <section className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">Other partners for Wootz</h2>
                <p className="text-sm text-gray-300 mb-4">Other partner description</p>
                <div className="bg-gray-700 h-24 rounded-lg mb-4"></div>
                <button className="text-purple-400 text-left w-full py-2 text-sm font-medium text-center">
                    CTA &gt;
                </button>
            </section>

            <footer>
                <button className="text-white text-center w-full py-3 text-sm font-medium bg-purple-600 rounded-lg">
                    Manage my Wootz account
                </button>
            </footer> */}
        </div>
    );
}

export default RelicDAOPage