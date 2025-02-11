import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/artifact.png';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/relicdao/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#191d21] p-4 sm:p-6">
      <div className="w-full max-w-sm sm:max-w-md">
        <img src={logo} alt="Artifact logo" className="mx-auto h-10 sm:h-12 mb-6 sm:mb-8" />
        
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Signup Successful!</h2>
          <p className="text-gray-400">Welcome to RelicDAO. You're all set to start earning rewards!</p>
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-purple-600 text-white py-3 px-4 text-sm sm:text-base rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-300"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
