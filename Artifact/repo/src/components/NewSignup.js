/*global chrome*/
import React, { useEffect, useState } from 'react';

const NewSignup = () => {
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState(null);
  


  useEffect(() => {
    // Send message to background script if token exists
      window.location.href = 'https://join.relicdao.com/';

  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-[#191d21] rounded-lg p-6 max-w-md w-full text-white">
        <h2 className="text-xl font-semibold mb-4">Redirecting...</h2>
        <p>Please wait while we redirect you to the signup page.</p>
      </div>
    </div>
  );
};
  
export default NewSignup;
