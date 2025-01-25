import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaWallet, FaBolt, FaUserCircle, FaCompass } from 'react-icons/fa';

const Activity = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6 flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-transparent bg-clip-text">
          Activity
        </h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search transactions"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all duration-200"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <div className="bg-gray-50 rounded-2xl p-8 max-w-sm w-full">
          <p className="text-xl font-semibold mb-2 text-gray-800">No transactions yet</p>
          <p className="text-sm text-gray-600">
            Your transaction history will appear here once you start using your wallet.
          </p>
        </div>
      </div>

      <div className="mt-auto">
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-between max-w-sm mx-auto">
            {[
              { icon: <FaWallet size={16} />, label: 'Portfolio', path: '/portfolio' },
              { icon: <FaBolt size={16} />, label: 'Activity', path: '/activity' },
              { icon: <FaUserCircle size={16} />, label: 'Accounts', path: '/accounts' },
              { icon: <FaCompass size={16} />, label: 'Explore', path: '/explore' },
            ].map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`flex flex-col items-center px-2 ${
                  location.pathname === item.path 
                    ? 'text-[#FF8C00]' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {item.icon}
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Activity;