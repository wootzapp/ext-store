/* global chrome */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backImage from '../images/back.svg';
import wootzImage from '../images/wootz.png';

// Define GPT ad configuration constants
const GPT_AD_CONFIG = {
  adUnitPath: '/22988389496/Wootzapp',
  sizes: [
    { width: 728, height: 90 },   // Leaderboard (Desktop)
    { width: 468, height: 60 },   // Banner (Desktop)
    { width: 300, height: 250 },  // Medium Rectangle (Desktop/Mobile)
    { width: 320, height: 50 },   // Mobile Banner (Most common mobile)
    // { width: 300, height: 50 },   // Mobile Banner Alternative
    { width: 320, height: 100 },  // Large Mobile Banner
    { width: 336, height: 280 },  // Large Rectangle
    { width: 250, height: 250 },  // Square
    // { width: 320, height: 250 }   // Mobile Rectangle
  ],
  idPrefix: 'div-gpt-ad-1747671853981-',
  scriptUrl: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js'
};

export const AdControlPage = () => {
  const navigate = useNavigate();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adSelectors, setAdSelectors] = useState([]);

  // Load initial state from chrome.storage
  useEffect(() => {
    chrome.storage.local.get(['adReplacementEnabled'], (result) => {
      setIsEnabled(!!result.adReplacementEnabled);
    });
  }, []);

  // Load selectors from chrome.storage
  useEffect(() => {
    chrome.storage.local.get(['easylistSelectors'], (result) => {
      setAdSelectors(result.easylistSelectors || []);
    });
  }, []);

  const handleToggle = async () => {
    const newValue = !isEnabled;
    setLoading(true);
    setIsEnabled(newValue);

    // Save state
    chrome.storage.local.set({ adReplacementEnabled: newValue });

    // Always get latest selectors before calling replaceAd
    chrome.storage.local.get(['easylistSelectors'], (result) => {
      const selectors = result.easylistSelectors || [];
      if (chrome.wootz && typeof chrome.wootz.replaceAd === 'function') {
        if (newValue) {
          chrome.wootz.replaceAd(true, GPT_AD_CONFIG, selectors);
        } else {
          chrome.wootz.replaceAd(false, GPT_AD_CONFIG, []);
        }
      }
      setTimeout(() => setLoading(false), 500);
    });
  };

  return (
    <div className="min-h-screen bg-black pt-16">
      <header className="bg-[#191d21] shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button className="w-6 h-6" onClick={() => navigate(-1)}>
            <img src={backImage} alt="Back" className="w-full h-full text-white" />
          </button>
          <h1 className="text-xl text-white font-semibold">Ad Control</h1>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        <div className="bg-black shadow overflow-hidden sm:rounded-lg mt-4">
          <div className="px-4 py-5 sm:px-6 flex flex-col items-center">
            <div
              className="w-24 h-24 bg-gray-300 border-4 border-white rounded-full mb-4"
              style={{
                backgroundImage: `url(${wootzImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
            <h2 className="text-xl font-bold mb-2 text-white">Replace Ads & Earn</h2>
            <p className="text-gray-400 text-center mb-4">
              Enable this feature to replace ads on websites with Artifact-powered ads.
              <br /><br />
              {/* <span className="text-purple-400 font-semibold">How does it work?</span><br />
              We detect standard ad slots (like 468x60, 300x250, 728x90) and swap them with our own. You, Wootz, and Artifact all share the ad revenue generated!
              <br /><br /> */}
              <span className="text-green-400 font-semibold">Earn passively</span> as you browse, just by keeping this switch ON.
            </p>
            <div className="flex items-center justify-between w-full bg-[#191d21] rounded-lg px-4 py-3 mb-4">
              <span className="text-white font-medium">Ad Replacement</span>
              <button
                className={`relative inline-flex items-center h-6 rounded-full w-12 transition-colors duration-300 focus:outline-none ${isEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                onClick={handleToggle}
                disabled={loading}
                aria-pressed={isEnabled}
                aria-label="Toggle ad replacement"
              >
                <span
                  className={`inline-block w-6 h-6 transform bg-white rounded-full shadow transition-transform duration-300 ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`}
                />
              </button>
            </div>
            <div className="text-xs text-gray-500 text-center">
              {isEnabled
                ? "Ad replacement is enabled. You are now earning from Artifact ads!"
                : "Ad replacement is disabled. Turn it on to start earning."}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdControlPage;