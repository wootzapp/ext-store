/* global chrome */
import React, { useEffect, useState, useCallback } from 'react';
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreateWallet from './components/CreateWallet';
import ChainSelection from './components/ChainSelection';
import UnlockWallet from './components/UnlockWallet';
import RecoveryPhrase from './components/RecoveryPhrase';
import Portfolio from './components/Portfolio';
import Loading from './components/Loading';
import Activity from './components/Activity';
import Explore from './components/Explore';
import Buy from './components/Buy';
// import SendWallet from './components/SendWallet';
import Accounts from './components/Accounts';

function App() {
  const [walletCreated, setWalletCreated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const [hasSignRequest, setHasSignRequest] = useState(false);
  const [hasPendingTransaction, setHasPendingTransaction] = useState(false);
  const [hasSolanaTransaction, setHasSolanaTransaction] = useState(false);

  const checkWalletStatus = useCallback(() => {
    // First check if wallet is created using the Chrome API
    chrome.wootzapp.isWalletCreated((result) => {
      if (chrome.runtime.lastError) {
        console.error('Error checking wallet creation status:', chrome.runtime.lastError);
        setWalletCreated(false);
        setIsInitialized(true);
        return;
      }

      setWalletCreated(result.isCreated);

      if (result.isCreated) {
        // Check for sign request and pending transactions
        chrome.runtime.sendMessage({ type: 'getSignRequest' }, (response) => {
          console.log('Sign request check response:', response);
          if (response && response.type === 'signMessageRequest') {
            setHasSignRequest(true);
          }
        });

        chrome.runtime.sendMessage({ type: 'getPendingTransaction' }, (response) => {
          if (response && response.type === 'newTransactionRequest') {
            setHasPendingTransaction(true);
          }
        });

        // Add check for pending Solana transactions
        chrome.runtime.sendMessage({ type: 'getPendingSolanaTransaction' }, (response) => {
          console.log('Solana transaction check response:', response);
          if (response && response.type === 'solanaSignTransactionRequest') {
            setHasSolanaTransaction(true);
          }
        });

        // Then check lock status
        chrome.wootzapp.isLocked((lockResult) => {
          if (chrome.runtime.lastError) {
            console.error('Error checking lock status:', chrome.runtime.lastError);
            setIsLocked(true);
          } else {
            setIsLocked(lockResult.isLocked);
          }
          setIsInitialized(true);
        });
      } else {
        setIsInitialized(true);
      }
    });
  }, []);

  useEffect(() => {
    checkWalletStatus();

    const handleBackgroundMessage = (message) => {
      console.log('Received message:', message);
      switch (message.type) {
        case 'signMessageRequest':
          setHasSignRequest(true);
          break;
        case 'newTransactionRequest':
          setHasPendingTransaction(true);
          break;
        case 'solanaSignTransactionRequest':
          console.log('Solana transaction request received in App');
          setHasSolanaTransaction(true);
          break;
        case 'transactionStatusChanged':
          if (message.data.status === 'signed' || message.data.status === 'failed') {
            setHasPendingTransaction(false);
          }
          break;
      }
    };

    chrome.runtime.onMessage.addListener(handleBackgroundMessage);

    if (!isInitialized) {
      setTimeout(() => {
        setShowLoading(false);
      }, 1000);
    }

    return () => {
      chrome.runtime.onMessage.removeListener(handleBackgroundMessage);
    };
  }, [checkWalletStatus]);

  if (!isInitialized || showLoading) {
    return (
      <div style={{ minWidth: '300px', minHeight: '400px' }}>
        <Loading />
      </div>
    );
  }

  return (
    <Router>
      <div style={{ minWidth: '300px', minHeight: '400px' }}>
        <Routes>
          <Route 
            path="/" 
            element={(() => {
              console.log("Route decision:", {
                walletCreated,
                isLocked,
                hasSignRequest,
                hasPendingTransaction,
                hasSolanaTransaction
              });

              // If there's any pending request and wallet is unlocked
              if ((hasSignRequest || hasPendingTransaction || hasSolanaTransaction) && !isLocked) {
                console.log("Redirecting to portfolio due to pending request");
                return <Navigate to="/portfolio" replace />;
              }

              // If wallet isn't created, go to create
              if (!walletCreated) {
                console.log("Redirecting to create");
                return <Navigate to="/create" replace />;
              }

              // If wallet is locked, go to unlock
              if (isLocked) {
                console.log("Redirecting to unlock");
                return <Navigate to="/unlock" replace />;
              }

              // Default to accounts
              console.log("Redirecting to accounts");
              return <Navigate to="/accounts" replace />;
            })()}
          />
          <Route path="/create" element={<CreateWallet setWalletCreated={setWalletCreated} />} />
          <Route path="/select-chains" element={<ChainSelection setWalletCreated={setWalletCreated} />} />
          <Route path="/unlock" element={<UnlockWallet setIsLocked={setIsLocked} />} />
          <Route path="/recovery-phrase" element={<RecoveryPhrase />} />
          <Route path="/portfolio" element={<Portfolio setIsLocked={setIsLocked} />} />
          {/* <Route path="/activity" element={<Activity />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/buy" element={<Buy />} /> */}
          {/* <Route path="/send" element={<SendWallet />} /> */}
          <Route path="/accounts" element={<Accounts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
