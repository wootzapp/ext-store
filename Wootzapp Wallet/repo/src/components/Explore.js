import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaChevronDown, FaWallet, FaBolt, FaUserCircle, FaCompass } from 'react-icons/fa';
import { SiBitcoin, SiEthereum } from 'react-icons/si';
import { FaGem, FaCoins } from 'react-icons/fa';

const Explore = () => {
  const [showBackupAlert, setShowBackupAlert] = useState(true);
  const [activeTab, setActiveTab] = useState('Market');
  const location = useLocation();

  const cryptoAssets = [
    { name: 'Bitcoin', symbol: 'BTC', price: '$64,436.0', change: '-1.91%', icon: SiBitcoin, iconColor: 'text-[#F7931A]' },
    { name: 'Ethereum', symbol: 'ETH', price: '$2,626.93', change: '-1.53%', icon: SiEthereum, iconColor: 'text-[#627EEA]' },
    { name: 'Tether', symbol: 'USDT', price: '$0.9998', change: '+0.01%', icon: FaGem, iconColor: 'text-[#26A17B]' },
    { name: 'BNB', symbol: 'BNB', price: '$576.97', change: '-3.44%', icon: FaCoins, iconColor: 'text-[#F3BA2F]' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6 flex flex-col">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-transparent bg-clip-text">
        Explore
      </h1>

      <div className="flex space-x-2 mb-6">
        {['Market', 'Web3'].map((tab) => (
          <button
            key={tab}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab 
                ? 'bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-white shadow-lg' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {showBackupAlert && (
        <div className="bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] p-4 rounded-xl mb-6 text-white shadow-lg">
          <p className="text-sm">Back up your wallet now to protect your assets and ensure you never lose access.</p>
          <div className="mt-2 flex justify-end space-x-4">
            <button className="text-sm font-medium hover:opacity-80 transition-opacity">
              Back up now
            </button>
            <button 
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              onClick={() => setShowBackupAlert(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
            <span className="text-gray-800">All Assets</span>
            <FaChevronDown className="text-gray-400" />
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search assets"
            className="bg-gray-50 rounded-xl py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] transition-all duration-200"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="mb-4 flex justify-between text-sm text-gray-500 px-2">
        <span>Assets</span>
        <div className="flex space-x-8">
          <span>Price</span>
          <span>24h</span>
        </div>
      </div>

      <div className="flex-grow">
        {cryptoAssets.map((asset, index) => (
          <div key={index} 
            className="flex justify-between items-center p-4 mb-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#FF8C00] transition-colors cursor-pointer"
          >
            <div className="flex items-center">
              <asset.icon className={`text-2xl mr-3 ${asset.iconColor}`} />
              <div>
                <div className="font-semibold">{asset.name}</div>
                <div className="text-sm text-gray-500">{asset.symbol}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{asset.price}</div>
              <div className={`text-sm ${
                asset.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
              }`}>
                {asset.change}
              </div>
            </div>
          </div>
        ))}
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

export default Explore;