import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronRight, FaWallet, FaBolt, FaUserCircle, FaCompass } from 'react-icons/fa';

const SendWallet = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col">
      <div className="flex-grow">
        <div className="mb-8">
          <p className="text-gray-500 mb-2">From</p>
          <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
            <span className="text-lg">Choose asset</span>
            <div className="flex items-center">
              <span className="text-2xl mr-2">0.0</span>
              <FaChevronRight className="text-gray-500" />
            </div>
          </div>
        </div>

        <div>
          <p className="text-gray-500 mb-2">To</p>
          <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
            <span className="text-lg">Choose recipient</span>
            <FaChevronRight className="text-gray-500" />
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex justify-around border-t border-gray-800 pt-4">
          {[
            { icon: <FaWallet />, label: 'Portfolio', path: '/portfolio' },
            { icon: <FaBolt />, label: 'Activity', path: '/activity' },
            { icon: <FaUserCircle />, label: 'Accounts', path: '/accounts' },
            { icon: <FaCompass />, label: 'Explore', path: '/explore' },
          ].map((item, index) => (
            <Link key={index} to={item.path} className={`flex flex-col items-center ${
              location.pathname === item.path ? 'text-white' : 'text-gray-500'
            }`}>
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SendWallet;