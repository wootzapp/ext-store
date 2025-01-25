import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaCopy } from 'react-icons/fa';
import wootzIcon from '../assets/wootz.png'

const RecoveryPhrase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPhrase, setShowPhrase] = useState(false);
  const recoveryPhrase = location.state?.recoveryPhrase || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(recoveryPhrase);
  };

  // const handleContinue = () => {
  //   navigate('/portfolio');
  // };
  const handleContinue = () => {
    navigate('/accounts');
  };

  const renderPhraseWords = () => {
    return (
      <div className="grid grid-cols-3 gap-2">
        {recoveryPhrase.split(' ').map((word, index) => (
          <div key={index} className="bg-gray-100 p-1.5 rounded-md flex items-center">
            <span className="text-gray-500 text-xs mr-1.5 w-4 text-right">#{index + 1}</span>
            <span className="text-[#FF8C00] font-bold flex-grow text-left text-sm">
              {word.charAt(0).toUpperCase() + word.slice(1)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white px-4 py-6 overflow-y-auto">
      <div className="flex-grow flex flex-col justify-between max-w-md mx-auto w-full">
        <div className="text-center">
          <img src={wootzIcon} alt="Logo" className="w-16 h-16 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 mt-2">Here is your Recovery Phrase</h2>
        </div>

        <div className="w-full max-w-sm mx-auto">
          {showPhrase ? (
            <div className="bg-white shadow-lg rounded-lg p-4">
              {renderPhraseWords()}
            </div>
          ) : (
            <div className="bg-black bg-opacity-80 rounded-lg p-8 text-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 blur-sm opacity-30">
                {Array.from({ length: 12 }, (_, i) => (
                  <span key={i} className="absolute text-white text-opacity-20" style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    fontSize: `${Math.random() * 16 + 8}px`
                  }}>
                    •••••
                  </span>
                ))}
              </div>
              <FaEye className="mx-auto h-12 w-12 text-white mb-6 relative z-10" />
              <p className="text-white text-sm relative z-10">Make sure no one is watching your screen.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-4 mt-8">
          {showPhrase ? (
            <button
              onClick={handleCopy}
              className="w-full px-4 py-2 border-0 text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#FF3B30] via-[#FF6B00] to-[#FF8C00] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C00] flex items-center justify-center shadow-lg transition-all duration-200"
            >
              <FaCopy className="mr-2" /> Click to copy
            </button>
          ) : (
            <button
              onClick={() => setShowPhrase(true)}
              className="w-full px-4 py-2 border-0 text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#FF3B30] via-[#FF6B00] to-[#FF8C00] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C00] flex items-center justify-center shadow-lg transition-all duration-200"
            >
              <FaEye className="mr-2" /> View
            </button>
          )}
          <button
            onClick={handleContinue}
            className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 shadow-md"
          >
            {showPhrase ? 'Continue' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecoveryPhrase;