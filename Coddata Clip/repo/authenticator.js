// Codatta Wallet Elements Remover Script (Improved)
// This script removes wallet connection options while preserving email login functionality and card styling

(function () {
  "use strict";

  // Function to remove wallet elements while preserving card structure
  function removeWalletElements() {
    console.log("Scanning for wallet elements to remove...");

    // More specific selectors to avoid removing the main card
    const walletSelectors = [
      // Look for wallet-specific buttons/divs but not the main container
      'div:not([class*="card"]):not([class*="container"]):not([class*="modal"]) [class*="MetaMask"]',
      'div:not([class*="card"]):not([class*="container"]):not([class*="modal"]) [class*="metamask"]',
      'div:not([class*="card"]):not([class*="container"]):not([class*="modal"]) [class*="OKX"]',
      'div:not([class*="card"]):not([class*="container"]):not([class*="modal"]) [class*="okx"]',
      'div:not([class*="card"]):not([class*="container"]):not([class*="modal"]) [class*="WalletConnect"]',
      'div:not([class*="card"]):not([class*="container"]):not([class*="modal"]) [class*="wallet-connect"]',
      'div:not([class*="card"]):not([class*="container"]):not([class*="modal"]) [class*="Coinbase"]',
      'div:not([class*="card"]):not([class*="container"]):not([class*="modal"]) [class*="coinbase"]',
      'div:not([class*="card"]):not([class*="container"]):not([class*="modal"]) [class*="Backpack"]',
      'div:not([class*="card"]):not([class*="container"]):not([class*="modal"]) [class*="backpack"]',
      'div:not([class*="card"]):not([class*="container"]):not([class*="modal"]) [class*="TON"]',
      'div:not([class*="card"]):not([class*="container"]):not([class*="modal"]) [class*="ton-connect"]',
    ];

    // Remove wallet elements
    walletSelectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          console.log("Removing wallet element:", element);
          element.remove();
        });
      } catch (e) {
        // Skip invalid selectors
      }
    });

    // Find and remove wallet elements by text content (more surgical approach)
    const walletTexts = [
      "MetaMask",
      "OKX Wallet",
      "WalletConnect",
      "Coinbase Wallet",
      "Backpack",
      "TON Connect",
      "View more wallets",
    ];

    // Look for elements containing wallet text
    const allElements = Array.from(document.querySelectorAll("*"));
    allElements.forEach((element) => {
      const text = element.textContent?.trim();

      // Check if this element contains wallet text
      const containsWalletText = walletTexts.some(
        (walletText) =>
          text === walletText || (text && text.includes(walletText))
      );

      if (containsWalletText) {
        // Don't remove if it's the main container or contains email elements
        const isMainContainer =
          element.querySelector('input[type="email"]') ||
          element.closest('[class*="modal"]') ||
          element.closest('[class*="card"]') === element;

        if (!isMainContainer && element.children.length <= 3) {
          console.log("Removing wallet text element:", text, element);
          element.remove();
        }
      }
    });

    // Remove "OR" divider
    const orElements = Array.from(document.querySelectorAll("*"));
    orElements.forEach((element) => {
      if (
        element.textContent?.trim() === "OR" &&
        element.children.length === 0
      ) {
        console.log("Removing OR divider");
        element.remove();
      }
    });
  }

  // Function to ensure the email form has proper styling
  function ensureEmailFormStyling() {
    const emailInput = document.querySelector(
      'input[type="email"], input[placeholder*="email" i]'
    );
    if (emailInput) {
      const form = emailInput.closest("form, div");
      if (form) {
        // Ensure the form container has proper styling
        const style = document.createElement("style");
        style.id = "codatta-email-form-fix";
        style.textContent = `
                    /* Ensure email form container maintains card appearance */
                    .email-container, [class*="auth"], [class*="login"], [class*="signin"] {
                        background: var(--background-color, #1a1a1a) !important;
                        border-radius: 12px !important;
                        padding: 24px !important;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
                        border: 1px solid rgba(255,255,255,0.1) !important;
                        min-height: 200px !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: center !important;
                    }
                    
                    /* Style the email input */
                    input[type="email"], input[placeholder*="email" i] {
                        width: 100% !important;
                        padding: 12px 16px !important;
                        background: rgba(255,255,255,0.05) !important;
                        border: 1px solid rgba(255,255,255,0.2) !important;
                        border-radius: 8px !important;
                        color: white !important;
                        font-size: 14px !important;
                        margin-bottom: 16px !important;
                    }
                    
                    /* Style the continue button */
                    button:contains("Continue"), button[type="submit"], .continue-btn {
                        width: 100% !important;
                        padding: 12px 16px !important;
                        background: #007bff !important;
                        border: none !important;
                        border-radius: 8px !important;
                        color: white !important;
                        font-weight: 500 !important;
                        cursor: pointer !important;
                    }
                    
                    button:contains("Continue"):hover, button[type="submit"]:hover {
                        background: #0056b3 !important;
                    }
                `;

        // Remove existing style if present
        const existingStyle = document.getElementById("codatta-email-form-fix");
        if (existingStyle) existingStyle.remove();

        document.head.appendChild(style);
      }
    }
  }

  // Main execution function
  function executeRemoval() {
    console.log("Starting wallet removal process...");
    removeWalletElements();
    ensureEmailFormStyling();
    console.log(
      "Wallet elements removed, email functionality and styling preserved"
    );
  }

  // Execute immediately if page is already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", executeRemoval);
  } else {
    executeRemoval();
  }

  // Also run after a short delay to catch dynamically loaded content
  setTimeout(executeRemoval, 500);
  setTimeout(executeRemoval, 1500);

  // Set up a mutation observer to handle dynamically added wallet elements
  const observer = new MutationObserver(function (mutations) {
    let shouldCheck = false;
    mutations.forEach(function (mutation) {
      if (mutation.type === "childList" && mutation.addedNodes.length) {
        // Check if any added nodes contain wallet-related content
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Element node
            const text = node.textContent || "";
            if (
              text.includes("MetaMask") ||
              text.includes("Wallet") ||
              text.includes("Connect")
            ) {
              shouldCheck = true;
            }
          }
        });
      }
    });

    if (shouldCheck) {
      setTimeout(removeWalletElements, 100);
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("Codatta Wallet Remover script loaded and monitoring");
})();
