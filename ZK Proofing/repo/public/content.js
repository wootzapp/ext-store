console.log("ZK Proof Generator content script loaded");
/*global chrome*/

// Function to extract the page content
function extractPageContent() {
  // Get the URL directly from webpage context
  const currentUrl = window.location.href;
  console.log("Extracting page content from:", currentUrl);
  
  // Get comprehensive page content
  const pageContent = {
    title: document.title,
    url: currentUrl,  // Include URL in the content object
    fullHTML: document.documentElement.outerHTML,
    textContent: document.body.innerText,
    // Get all text content including hidden elements
    allText: document.body.textContent,
    // Get meta data
    meta: {
      description: document.querySelector('meta[name="description"]')?.content || '',
      keywords: document.querySelector('meta[name="keywords"]')?.content || '',
      author: document.querySelector('meta[name="author"]')?.content || ''
    },
    // Get all links
    links: Array.from(document.links).map(link => ({
      href: link.href,
      text: link.textContent.trim()
    })),
    // Get all images
    images: Array.from(document.images).map(img => ({
      src: img.src,
      alt: img.alt,
      width: img.width,
      height: img.height
    })),
    // Get structured data if available
    structuredData: Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map(script => {
        try {
          return JSON.parse(script.textContent);
        } catch (e) {
          return null;
        }
      }).filter(data => data !== null),
    // Get main content areas
    mainContent: {
      articles: Array.from(document.getElementsByTagName('article')).map(article => article.innerText),
      sections: Array.from(document.getElementsByTagName('section')).map(section => section.innerText),
      headings: {
        h1: Array.from(document.getElementsByTagName('h1')).map(h => h.innerText),
        h2: Array.from(document.getElementsByTagName('h2')).map(h => h.innerText),
        h3: Array.from(document.getElementsByTagName('h3')).map(h => h.innerText)
      }
    },
    // Get form data (excluding sensitive fields)
    forms: Array.from(document.forms).map(form => ({
      id: form.id,
      name: form.name,
      action: form.action,
      method: form.method,
      fields: Array.from(form.elements)
        .filter(el => !['password', 'hidden'].includes(el.type))
        .map(el => ({
          type: el.type,
          name: el.name,
          id: el.id
        }))
    })),
    // Timestamp of extraction
    timestamp: new Date().toISOString()
  };

  // Convert the content to a string
  const contentString = JSON.stringify(pageContent);

  // Send both URL and content to background script
  chrome.runtime.sendMessage({
    type: "PAGE_CONTENT",
    data: {
      url: currentUrl,
      content: contentString
    }
  });
  
  console.log("Enhanced page content extracted and sent to background script");
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EXTRACT_CONTENT") {
    extractPageContent();
    sendResponse({ status: "Content extraction completed" });
  }
  return true;
});

// Function to wait for element
async function waitForElement(selector) {
  let retries = 0;
  const maxRetries = 10;
  
  while (retries < maxRetries) {
    const element = document.querySelector(selector);
    if (element) return element;
    await new Promise(resolve => setTimeout(resolve, 1000));
    retries++;
  }
  return null;
}

async function checkTwitterAuth() {
  console.log("🔍 Checking Twitter auth status...");

  try {
    // Check if we're on Twitter
    if (!window.location.href.includes("x.com")) {
      console.log("Not on Twitter, skipping auth check");
      return false;
    }

    // Check for ct0 cookie (Twitter auth cookie)
    const cookies = document.cookie;
    const hasCt0 = cookies.includes("ct0=");

    // Check if this is first-time authentication
    chrome.storage.local.get(["hasInitialAuth"], async (result) => {
      if (hasCt0 && !result.hasInitialAuth) {
        console.log("🎉 First-time Twitter authentication detected!");

        // Set the flag to prevent future initial auth handling
        chrome.storage.local.set({ hasInitialAuth: true }, async () => {
          // Get username from navigation
          const communitiesLink = await waitForElement(
            'nav[aria-label="Primary"] a[href*="/communities"]'
          );
          if (communitiesLink) {
            const username = communitiesLink.getAttribute("href").split("/")[1];
            // Send username to background
            chrome.runtime.sendMessage({
              type: "INITIAL_AUTH_USERNAME",
              data: { username },
            });
          }
        });
      }
    });

    // Send auth status to background
    chrome.runtime.sendMessage({
      type: "TWITTER_AUTH_STATUS",
      data: {
        isAuthenticated: hasCt0,
        url: window.location.href,
      },
    });

    return hasCt0;
  } catch (error) {
    console.error("❌ Error checking Twitter auth:", error);
    return false;
  }
}

// Check auth on page load
window.addEventListener('load', () => {
  checkTwitterAuth();
});
