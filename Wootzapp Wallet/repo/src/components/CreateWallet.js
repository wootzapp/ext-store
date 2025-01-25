import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import wootzIcon from '../assets/wootz.png';

const CreateWallet = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // Store password in sessionStorage (more secure than localStorage)
    sessionStorage.setItem('tempPassword', password);
    navigate('/select-chains');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <img
            src={wootzIcon}
            alt="Wootz Logo"
            className="mx-auto h-20 w-20"
          />
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">
            Create Your <span className="bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-transparent bg-clip-text">Wallet</span>
          </h2>
          <p className="mt-2 text-base text-gray-600">
            Set a strong password to secure your wallet
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Enter password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FF3B30] focus:border-[#FF3B30] focus:z-10 sm:text-sm"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FF3B30] focus:border-[#FF3B30] sm:text-sm"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border-0 text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] hover:from-[#FF5E3A] hover:to-[#FFA726] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C00] transition-all duration-200 shadow-md"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWallet;