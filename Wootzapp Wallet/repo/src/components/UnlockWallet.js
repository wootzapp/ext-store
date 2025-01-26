/* global chrome */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {  FaUnlock, FaEye, FaEyeSlash } from 'react-icons/fa';
import wootzIcon from '../assets/wootz.png'

const UnlockWallet = ({ setIsLocked }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const unlockWalletAsync = (password) => {
    console.log('Attempting to unlock wallet with password length:', password.length);
    return new Promise((resolve, reject) => {
      chrome.wootz.unlockWallet(password, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  };

  const handleUnlock = async () => {
    try {
      const result = await unlockWalletAsync(password);
      if (result.success) {
        console.log('Wallet unlocked successfully');
        setIsLocked(false);
        // navigate('/portfolio');
        navigate('/accounts');
      } else {
        console.error('Failed to unlock wallet:', result.error);
        setError('Incorrect password');
      }
    } catch (error) {
      console.error('Error unlocking wallet:', error);
      setError('Incorrect password');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUnlock();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            src={wootzIcon}
            alt="Wootz Logo"
            className="mx-auto h-24 w-24"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Unlock <span className="bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-transparent bg-clip-text">Wallet</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">Enter your password to unlock the wallet</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FF6347] focus:border-[#FF6347] focus:z-10 sm:text-sm pr-10"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 z-20"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <button
              onClick={handleUnlock}
              className="w-full bg-gradient-to-r from-[#FF3B30] via-[#FF6B00] to-[#FF8C00] hover:from-[#FF7F50] hover:to-[#FFB347] text-white font-bold py-2 px-4 rounded flex items-center justify-center shadow-md transition-all duration-200"
            >
              <FaUnlock className="mr-2" /> Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnlockWallet;