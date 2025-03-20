/* global chrome */
import React from 'react';
import { FaSignature } from 'react-icons/fa';

function SignMessage({ request, onComplete }) {
  const handleSignMessage = (approved) => {
    if (request) {
      chrome.wootz.signMessage(
        request.id,
        approved,
        null,
        (result) => {
          if (result.success) {
            console.log('Message signed successfully');
          } else {
            console.error('Failed to sign message:', result.error);
          }
          onComplete();
        }
      );
    } else {
      console.error('No sign request available');
      onComplete();
    }
  };

  if (!request) {
    return <div className="p-4">No sign request available.</div>;
  }

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Sign Message Request</h1>
      <div className="bg-gray-800 rounded-lg p-4 shadow">
        <p><strong>From:</strong> {request.origin}</p>
        <p><strong>Address:</strong> {request.address}</p>
        <p><strong>Chain ID:</strong> {request.chainId}</p>
        <p><strong>Is EIP712:</strong> {request.isEip712 ? 'Yes' : 'No'}</p>
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => handleSignMessage(false)}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Reject
          </button>
          <button
            onClick={() => handleSignMessage(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <FaSignature className="mr-2" /> Sign
          </button>
        </div>
      </div>
    </div>
  );
}
export default SignMessage;