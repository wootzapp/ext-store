/* global chrome */
console.log('Background script loaded');

let pendingSignRequest = null;
let pendingTransaction = null;
let pendingSolanaTransaction = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('Wootz Wallet extension installed');
  console.log('Extension ID:', chrome.runtime.id);
});

chrome.wootz.onSignMessageRequested.addListener((request) => {
  console.log('Sign message request received in background:', request);
  pendingSignRequest = request;
  chrome.runtime.sendMessage({ type: 'signMessageRequest', data: request });
});

chrome.wootz.OnNewUnapprovedTxAPI.addListener((txInfo) => {
  console.log('New unapproved transaction received in background:', txInfo);
  pendingTransaction = txInfo;
  chrome.runtime.sendMessage({ type: 'newTransactionRequest', data: txInfo });
});

chrome.wootz.onTransactionStatusChangedAPI.addListener((txInfo) => {
  console.log('Transaction status changed:', txInfo);
  if (txInfo.status === 'signed' || txInfo.status === 'failed') {
    pendingTransaction = null;
  }
  chrome.runtime.sendMessage({ type: 'transactionStatusChanged', data: txInfo });
});

// Fix the Solana transaction listener
chrome.wootz.onSolanaSignTransactionRequested.addListener((request) => {
  console.log('🌟 Solana transaction sign request received:', request);
  
  // Format the request data properly
  const formattedRequest = {
    id: request.id,
    address: request.address,
    origin: request.origin,
    chainId: request.chainId,
    encodedMessage: request.encodedMessage
  };

  console.log('Formatted Solana request:', formattedRequest);
  pendingSolanaTransaction = formattedRequest;

  // Broadcast to UI immediately
  chrome.runtime.sendMessage({ 
    type: 'solanaSignTransactionRequest', 
    data: formattedRequest 
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending Solana request to UI:', chrome.runtime.lastError);
    } else {
      console.log('Solana request sent to UI successfully:', response);
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📩 Message received in background:', message);
  
  switch (message.type) {
    case 'getSignRequest':
      if (pendingSignRequest) {
        sendResponse({ type: 'signMessageRequest', data: pendingSignRequest });
      } else {
        sendResponse({ type: 'noRequest' });
      }
      break;

    case 'signMessage':
      chrome.wootz.signMessage(message.requestId, message.approved, message.signature, (result) => {
        console.log('Sign message result:', result);
        pendingSignRequest = null;
        sendResponse(result);
      });
      return true; // Indicates async response

    case 'getPendingTransaction':
      if (pendingTransaction) {
        sendResponse({ type: 'newTransactionRequest', data: pendingTransaction });
      } else {
        sendResponse({ type: 'noTransaction' });
      }
      break;

    case 'signTransaction':
      console.log('Signing transaction:', message.txMetaId, message.approved, message.chainId, message.coinType);
      chrome.wootz.signTransaction(
        message.txMetaId,
        message.chainId,
        message.coinType,
        message.approved,
        (result) => {
          console.log('Sign transaction result:', result);
          pendingTransaction = null;
          sendResponse(result);
        }
      );
      return true; // Indicates async response

    case 'getPendingSolanaTransaction':
      console.log('Getting pending Solana transaction:', pendingSolanaTransaction);
      if (pendingSolanaTransaction) {
        sendResponse({ 
          type: 'solanaSignTransactionRequest', 
          data: pendingSolanaTransaction 
        });
      } else {
        sendResponse({ type: 'noRequest' });
      }
      break;

    case 'signSolanaTransaction':
      console.log('Signing Solana transaction:', message);

      chrome.wootz.signSolanaTransaction(
        message.requestId,
        message.approved,
        (result) => {
          console.log('Sign Solana transaction result:', result);
          if (result && result.success) {
            pendingSolanaTransaction = null;
          }
          sendResponse(result);
        }
      );
      return true;
  }
});

// Add connection status check
chrome.runtime.onConnect.addListener((port) => {
  console.log('New connection established:', port.name);
});