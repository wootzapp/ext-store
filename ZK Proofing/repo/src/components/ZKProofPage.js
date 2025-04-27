/* global chrome */
import { useState, useEffect } from 'react';
import '../styles/ZKProofPage.css';

function ZKProofPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastProof, setLastProof] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [expanded, setExpanded] = useState({
    proof: false,
    verificationKey: false,
    publicInputs: false
  });
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [noTlsData, setNoTlsData] = useState(false);

  useEffect(() => {
    // Always get current tab URL first
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs && tabs[0]) {
        setUrl(tabs[0].url);
      }
    });

    // Then check for existing proof in storage
    chrome.storage.local.get(['lastProof', 'lastProofError'], function(result) {
      const currentUrl = url;
      
      // Only set proof/error if URL is valid and matches current URL
      if (isValidHttpUrl(currentUrl)) {
        if (result.lastProof && result.lastProof.url === currentUrl) {
          setLastProof(result.lastProof);
          setLastError(null);
        } else if (result.lastProofError && result.lastProofError.url === currentUrl) {
          setLastError(result.lastProofError);
          setLastProof(null);
        } else {
          // No proof exists for this URL
          setLastProof(null);
          setLastError(null);
        }
      } else {
        // Invalid URL, clear all proofs/errors
        setLastProof(null);
        setLastError(null);
      }
    });

    // Listen for proof generation messages
    const handleMessage = (message) => {
      if (message.type === "PROOF_GENERATED") {
        setLoading(false);
        setLastProof(message.data);
        setLastError(null);
        setNoTlsData(false);
      } else if (message.type === "PROOF_GENERATION_STARTED") {
        setLoading(true);
        setNoTlsData(false);
      } else if (message.type === "PROOF_GENERATION_ERROR") {
        setLoading(false);
        setLastError(message.data);
        setLastProof(null);
        setNoTlsData(message.data.error === "No TLS data found for the specified URL");
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  useEffect(() => {
    // Update URL validity whenever URL changes
    setIsValidUrl(url.startsWith('http://') || url.startsWith('https://'));
  }, [url]);

  const generateProofForCurrentTab = () => {
    setLoading(true);
    setLastError(null);
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      chrome.tabs.sendMessage(currentTab.id, {
        type: "EXTRACT_CONTENT"
      });
    });
  };

  const toggleExpanded = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatJsonOrText = (jsonString) => {
    if (!jsonString) return "";
    try {
      const jsonObj = JSON.parse(jsonString);
      const formatted = JSON.stringify(jsonObj, null, 2);
      
      // Enhanced syntax highlighting with proper indentation
      return formatted.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        function (match) {
          let cls = 'number';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'key';
              // Remove quotes from keys and add colon
              return `<span class="${cls}">${match.replace(/"/g, '').replace(':', '')}</span>:`;
            } else {
              cls = 'string';
            }
          } else if (/true|false/.test(match)) {
            cls = 'boolean';
          } else if (/null/.test(match)) {
            cls = 'null';
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
    } catch (e) {
      return jsonString;
    }
  };

  const filterForGaraga = (jsonString, type) => {
    if (!jsonString) return "";
    try {
      const fullJson = JSON.parse(jsonString);
      let garagaJson = {};
      
      // Filter based on type of data
      switch(type) {
        case "proof":
          garagaJson = {
            pi_a: fullJson.pi_a || [],
            pi_b: fullJson.pi_b || [],
            pi_c: fullJson.pi_c || [],
            protocol: fullJson.protocol || "groth16",
            curve: fullJson.curve || "bn128"
          };
          break;
        case "verification_key":
          garagaJson = {
            protocol: fullJson.protocol || "groth16",
            curve: fullJson.curve || "bn128",
            nPublic: fullJson.nPublic || 0,
            vk_alpha_1: fullJson.vk_alpha_1 || [],
            vk_beta_2: fullJson.vk_beta_2 || [],
            vk_gamma_2: fullJson.vk_gamma_2 || [],
            vk_delta_2: fullJson.vk_delta_2 || [],
            vk_alphabeta_12: fullJson.vk_alphabeta_12 || [],
            IC: fullJson.IC || []
          };
          break;
        case "public_inputs":
          garagaJson =  Array.isArray(fullJson) ? fullJson : [] ;
          break;
        default:
          return jsonString;
      }
      
      return JSON.stringify(garagaJson, null, 2);
    } catch (e) {
      console.error("Error filtering JSON for Garaga:", e);
      return jsonString;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Optional: Add a temporary "Copied!" feedback
        const copyButton = document.activeElement;
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = "Copied!";
        setTimeout(() => {
          copyButton.innerHTML = originalText;
        }, 2000);
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      }
    );
  };

  const JsonDisplay = ({ content, title }) => {
    const garagaContent = filterForGaraga(content, title);
    const formattedContent = formatJsonOrText(garagaContent);
    
    return (
      <div className="json-section">
        <div className="section-header" onClick={() => toggleExpanded(title)}>
          <div className="header-content">
            <span className={`expander ${expanded[title] ? 'expanded' : ''}`}>▶</span>
            <span className="json-title">{title}.json</span>
          </div>
          {expanded[title] && (
            <button 
              className="copy-button"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(garagaContent);
              }}
              title="Copy to clipboard"
            >
              <span className="copy-icon"></span>
            </button>
          )}
        </div>
        {expanded[title] && (
          <div className="json-content-wrapper">
            <pre className="json-content">
              <code dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </pre>
          </div>
        )}
      </div>
    );
  };

  // Function to check if URL is valid http/https
  const isValidHttpUrl = (url) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const handleOpenTab = () => {
    chrome.tabs.create({ url: url }, (tab) => {
      console.log("Opened new tab with URL:", url);
    });
  };

  return (
    <div className="zkproof-container">
      {/* App Bar */}
      <header className="app-bar">
        <div className="app-header-content">
          <span className="shield-icon"></span>
          <h1 className="app-title">Zero Knowledge Proofing</h1>
        </div>
      </header>

      <main className="zkproof-content">
        {/* URL Display Section */}
        <section className="url-card">
          <h2 className="section-title">
            <span className="globe-icon"></span>
            Current URL
          </h2>
          <p className="url-value">{url}</p>
        </section>

        {/* Generate Button Section */}
        <section className="button-section">
          <button 
            className={`generate-btn ${!isValidHttpUrl(url) ? 'disabled' : ''} ${loading ? 'loading' : ''}`}
            onClick={generateProofForCurrentTab} 
            disabled={loading || !isValidHttpUrl(url)}
          >
            {/* <span className="button-icon shield-icon-smw"></span> */}
            {loading ? 'Generating...' : 'Generate ZK Proof'}
          </button>
          {!isValidHttpUrl(url) && (
            <div className="validation-message">
              <span className="alert-icon"></span>
              <p>Not a valid HTTP/HTTPS page. Please navigate to a webpage to generate proof.</p>
            </div>
          )}
        </section>

        {/* Only show proofs section if URL is valid */}
        {isValidHttpUrl(url) && (
          <>
            {/* Loading Indicator */}
            {loading && (
              <div className="loader-container">
                <div className="loader"></div>
                <p>Generating ZK proof...</p>
              </div>
            )}

            {/* Error Message with Open Tab option */}
            {lastError && !loading && (
              <div className="error-card">
                <div className="error-header">
                  <span className="alert-icon"></span>
                  <p>Error: {lastError.error}</p>
                </div>
                {noTlsData && (
                  <div className="open-tab-section">
                    <p>To generate a proof, you need to visit the page first. Click below to open it:</p>
                    <button 
                      className="open-tab-button"
                      onClick={handleOpenTab}
                    >
                      Visit Page
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Proof Results Section - Only shown if proofs exist for current URL */}
            {lastProof && !loading && (
              <div className="results-card">
                <h2 className="results-title">
                  {/* <span className="shield-icon-smb"></span> */}
                  Generated Proofs
                </h2>
                <JsonDisplay content={lastProof.proof} title="proof" />
                <JsonDisplay content={lastProof.verificationKey} title="verification_key" />
                <JsonDisplay content={lastProof.publicInputs} title="public_inputs" />
              </div>
            )}

            {/* No proofs message - Show when valid URL but no proofs exist */}
            {!lastProof && !loading && !lastError && (
              <div className="empty-state-card">
                <div className="empty-state-icon">
                  <span className="shield-icon-lg"></span>
                </div>
                <p>No proofs generated for this page yet. Click the button above to generate a ZK proof.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ZKProofPage;
