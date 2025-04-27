/*global chrome*/
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [twitterStatus, setTwitterStatus] = useState("login"); // 'login' or 'ready'
  const [username, setUsername] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isOnTwitter, setIsOnTwitter] = useState(false);

  useEffect(() => {
    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs[0]) {
        const tabUrl = tabs[0].url;
        setCurrentUrl(tabUrl);
        setIsOnTwitter(
          tabUrl.startsWith("https://x.com") ||
            tabUrl.startsWith("https://twitter.com")
        );
      }
    });

    // Check initial status
    chrome.storage.local.get(
      ["isTwitterAuthenticated", "twitterUsername"],
      (result) => {
        setTwitterStatus(result.isTwitterAuthenticated ? "ready" : "login");
        if (result.twitterUsername) {
          setUsername(result.twitterUsername);
        }
      }
    );
  }, []);

  const handleTwitterAuth = async () => {
    console.log("🔄 Starting Twitter auth process...");
    chrome.tabs.create({ url: "https://x.com" }, (tab) => {
      console.log("📱 Opened Twitter tab:", tab.id);
    });
  };

  const handleZKProofing = () => {
    navigate("/zkproof");
  };

  const openTwitterTab = () => {
    chrome.tabs.create({ url: "https://x.com/home" });
  };

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="app-bar">
        <div className="header-content">
          <div className="header-title">
            <span className="icon shield-icon"></span>
            <h1 className="app-title">ZK Proof Dashboard</h1>
            {/* {twitterStatus === "ready" && (
            <div className="user-badge">
              <span className="icon user-icon"></span>
              <span>@{username}</span>
            </div>
          )} */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="card-container">
          {/* Welcome Card */}
          <div className="card welcome-card">
            <div className="orange-bar"></div>
            <div className="card-header">
              <div className="card-title">
                <span className="icon lock-icon"></span>
                Zero-Knowledge Proofing
              </div>
              <p className="card-description">
                Generate cryptographic proofs of your Twitter interactions
                without revealing sensitive data.
              </p>
            </div>
          </div>

          {/* Status Card */}
          {twitterStatus === "login" ? (
            <div className="card status-card">
              <div className="card-header">
                <div className="card-title">Authentication Required</div>
                <p className="card-description">
                  Connect your Twitter account to generate Zero-Knowledge proofs.
                </p>
              </div>
              <div className="card-content">
                <div className="alert info-alert">
                  <span className="icon info-icon"></span>
                  <div>
                    <div className="alert-title">Connect to Twitter</div>
                    <p className="alert-description">
                      You'll need to authenticate with Twitter to use this
                      extension.
                    </p>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <button
                  className="auth-button twitter-button"
                  onClick={handleTwitterAuth}
                >
                  <span className="icon twitter-icon"></span>
                  Connect Twitter Account
                </button>
              </div>
            </div>
          ) : isOnTwitter ? (
            <div className="card status-card success-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon check-icon"></span>
                  Ready to Generate Proofs
                </div>
                <p className="card-description">
                  You're connected to Twitter and on a compatible page.
                </p>
              </div>
              <div className="card-content">
                <div className="alert success-alert">
                  <span className="icon check-icon"></span>
                  <div>
                    <div className="alert-title">All Set!</div>
                    <p className="alert-description">
                      You can now generate zero-knowledge proofs for this page.
                    </p>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <button
                  className="auth-button proceed-button"
                  onClick={handleZKProofing}
                >
                  Generate ZK Proof
                  <span className="icon arrow-icon"></span>
                </button>
              </div>
            </div>
          ) : (
            <div className="card status-card warning-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="icon alert-icon"></span>
                  Not on Twitter
                </div>
                <p className="card-description">
                  You need to be on X.com (Twitter) to generate proofs.
                </p>
              </div>
              <div className="card-content">
                <div className="alert warning-alert">
                  <span className="icon info-icon"></span>
                  <div>
                    <div className="alert-title">Action Required</div>
                    <p className="alert-description">
                      Navigate to Twitter to use the zero-knowledge proof
                      features.
                    </p>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <button
                  className="auth-button twitter-button"
                  onClick={openTwitterTab}
                >
                  <span className="icon twitter-icon"></span>
                  Open Twitter in New Tab
                </button>
              </div>
            </div>
          )}

          {/* How It Works Card */}
          <div className="card how-it-works-card">
            <div className="card-header">
              <div className="card-title">How It Works</div>
              <p className="card-description">
                A simple guide to using zero-knowledge proofs with Twitter:
              </p>
            </div>
            <div className="card-content">
              <div className="steps-container">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-text">Connect your Twitter account.</div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-text">
                    Navigate to x.com in your browser.
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-text">
                    Generate a zero-knowledge proof.
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-text">
                    Use your proof to verify interactions while protecting
                    privacy.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
