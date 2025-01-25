import React from 'react';
import wootzIcon from '../assets/wootz.png';

const TransitionScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="flex flex-col items-center max-w-sm w-full">
        <div className="relative mb-8 ml-3">
          <img
            src={wootzIcon}
            alt="Wootz"
            className="w-24 h-24"
          />
        </div>

        <h2 className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-transparent bg-clip-text">
          Please wait
        </h2>

        <p className="text-gray-600 text-center text-lg mb-6">
          Your Wootzapp wallet is being created...
        </p>
        <div className="flex items-center space-x-2 text-gray-400">
          <span className="text-sm">Setting up your secure wallet</span>
        </div>

        <div className="flex space-x-2 mt-8">
                <div 
                    className="w-2 h-2 rounded-full animate-bounce transition-colors duration-1000" 
                    style={{ 
                        animationDelay: '0ms',
                        backgroundColor: '#FF3B30',
                        animation: 'bounce 1s infinite, colorChange 5s infinite'
                    }} 
                />
                <div 
                    className="w-2 h-2 rounded-full animate-bounce transition-colors duration-1000" 
                    style={{ 
                        animationDelay: '100ms',
                        backgroundColor: '#FF8C00',
                        animation: 'bounce 1s infinite 0.1s, colorChange 5s infinite'
                    }} 
                />
                <div 
                    className="w-2 h-2 rounded-full animate-bounce transition-colors duration-1000" 
                    style={{ 
                        animationDelay: '200ms',
                        backgroundColor: '#FF3B30',
                        animation: 'bounce 1s infinite 0.2s, colorChange 5s infinite'
                    }} 
                />
            </div>
      </div>
    </div>
  );
};

export default TransitionScreen;