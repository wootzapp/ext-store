import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaChevronDown, FaWallet, FaBolt, FaUserCircle, FaCompass } from 'react-icons/fa';
import { SiBitcoin, SiEthereum } from 'react-icons/si';
import { FaGem, FaCoins } from 'react-icons/fa';

const Buy = () => {
  const location = useLocation();
  const [amount, setAmount] = useState('');
  
  const cryptoAssets = [
    { name: 'Bitcoin', symbol: 'BTC', network: 'Bitcoin', price: '$64,445.00', icon: SiBitcoin, iconColor: 'text-[#F7931A]' },
    { name: 'Ethereum', symbol: 'ETH', network: 'Ethereum', price: '$2,626.93', icon: SiEthereum, iconColor: 'text-[#627EEA]' },
    { name: 'BNB', symbol: 'BNB', network: 'BNB Chain', price: '$577.28', icon: FaCoins, iconColor: 'text-[#F3BA2F]' },
    { name: 'USDT', symbol: 'USDT', network: 'Tether', price: '$1.00', icon: FaGem, iconColor: 'text-[#26A17B]' },
  ];

  return (
    <div className="relative min-h-screen bg-white text-gray-800">
      <div className="p-6 pb-20">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-transparent bg-clip-text">
          Buy Crypto
        </h1>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200 focus-within:border-[#FF8C00] transition-colors">
          <div className="flex items-center">
            <span className="text-2xl font-medium text-gray-400 mr-2">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="bg-transparent flex-grow text-2xl outline-none text-gray-800"
            />
            <button className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <span>USD</span>
              <FaChevronDown className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex space-x-3 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search assets"
              className="w-full bg-gray-50 rounded-xl py-3 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition-all duration-200"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
            <span className="text-gray-800">Networks</span>
            <FaChevronDown className="text-gray-400" />
          </button>
        </div>

        <div className="flex-grow">
          {cryptoAssets.map((asset, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 mb-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#FF8C00] transition-colors cursor-pointer"
            >
              <div className="flex items-center">
                <asset.icon className={`text-2xl mr-3 ${asset.iconColor}`} />
                <div>
                  <div className="font-semibold text-gray-800">{asset.name}</div>
                  <div className="text-sm text-gray-500">{asset.symbol} on {asset.network}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-800">{asset.price}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button 
            className="w-full bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
            disabled={!amount}
          >
            Continue
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
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
  );
};

export default Buy;