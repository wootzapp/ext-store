/* global chrome */
import React from 'react';
import ReactDOM from 'react-dom/client';
import SignMessageComponent from './components/SignMessage';

export function renderSignMessage(request) {
  const root = ReactDOM.createRoot(document.getElementById('signMessageRoot'));
  root.render(
    <React.StrictMode>
      <SignMessageComponent 
        request={request} 
        onComplete={() => {
          chrome.storage.local.remove('currentSignRequest', () => {
            root.unmount();
            chrome.runtime.sendMessage({type: 'signMessageComplete'});
          });
        }} 
      />
    </React.StrictMode>
  );
}

export function checkAndRenderSignMessage() {
  chrome.storage.local.get('currentSignRequest', (result) => {
    if (result.currentSignRequest) {
      console.log('Sign request found in storage:', result.currentSignRequest);
      renderSignMessage(result.currentSignRequest);
    }
  });
}