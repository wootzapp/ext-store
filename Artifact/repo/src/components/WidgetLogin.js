import React from 'react';
import relicDAOLogo from '../images/RelicDAOLogo.png';

function WidgetLogin() {
  return (
    <div className="bg-gray-900 text-white font-sans p-4 w-full min-h-screen flex items-center justify-center">
      <div className="text-center max-w-xs w-full">
        <div className="flex justify-center mb-4">
          <div className="w-8 h-8">
            <img
              src={relicDAOLogo}
              alt="RelicDAO Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <h1 className="text-lg font-medium mb-4">Login to Artifact</h1>
        <button className="w-24 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm">
          Login
        </button>
      </div>
    </div>
  );
}

export default WidgetLogin; 