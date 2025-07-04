// Instagram Automation Content Script
// This script is automatically injected into Instagram pages via manifest
// and controlled by background.js using WebContent messaging

console.log("Instagram Automation Content Script loaded");

let automationState = {
  isActive: false,
  isPaused: false,
  currentTask: null,
  pageType: null,
  htmlType: 1,
  timeout: 5000,
};

// Add tracking variables to prevent duplicate submissions
let isProcessingSubmission = false;
let lastSubmittedUrl = null;
let submittedUrls = new Set(); // Track all submitted URLs
let taskInProgress = false; // Track if any task is in progress
let lastTaskStartTime = 0; // Track when last task started

// Listen for messages from background script via WebContent API
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content Script: Received message:", message);

  switch (message.id) {
    case "start-task-processing":
      handleStartTaskProcessing(message, sendResponse);
      break;
    case "process-current-task":
      handleProcessCurrentTask(message, sendResponse);
      break;
    case "pause-automation":
      handlePauseAutomation(message, sendResponse);
      break;
    case "resume-automation":
      handleResumeAutomation(message, sendResponse);
      break;
    case "extract-content":
      handleExtractContent(message, sendResponse);
      break;
    case "check-instagram-login":
      handleCheckInstagramLogin(message, sendResponse);
      break;
    default:
      console.log("Content Script: Unknown message:", message.id);
      sendResponse({ success: false, message: "Unknown command" });
  }

  return true; // Keep the message channel open for async responses
});

// Handle starting task processing
async function handleStartTaskProcessing(message, sendResponse) {
  console.log("Content Script: Starting task processing");

  // Reset submission tracking when starting new tasks
  isProcessingSubmission = false;
  lastSubmittedUrl = null;
  console.log("Content Script: Reset submission tracking for new task session");

  automationState.isActive = true;
  automationState.isPaused = false;
  automationState.pageType = message.pageType || "3";
  automationState.htmlType = message.htmlType || 1;
  automationState.timeout = message.timeout || 5000;

  console.log("Content Script: Automation state updated:", automationState);

  sendResponse({
    success: true,
    message: "Task processing started",
    url: window.location.href,
    title: document.title,
  });
}

// Handle processing current task
async function handleProcessCurrentTask(message, sendResponse) {
  if (automationState.isPaused) {
    console.log("Content Script: Automation paused, not processing task");
    sendResponse({ success: false, message: "Automation paused" });
    return;
  }

  console.log("Content Script: Processing current task");

  try {
    const currentUrl = window.location.href;
    
    // Enhanced deduplication checks
    if (isProcessingSubmission) {
      console.log("Content Script: Already processing a submission, skipping duplicate");
      sendResponse({ success: false, message: "Already processing submission" });
      return;
    }
    
    if (submittedUrls.has(currentUrl)) {
      console.log("Content Script: URL already in submitted set, skipping duplicate:", currentUrl);
      sendResponse({ success: false, message: "URL already submitted" });
      return;
    }
    
    if (lastSubmittedUrl === currentUrl) {
      console.log("Content Script: URL matches last submitted, skipping duplicate:", currentUrl);
      sendResponse({ success: false, message: "URL already submitted" });
      return;
    }

    // Set processing flag and add to submitted URLs
    isProcessingSubmission = true;
    submittedUrls.add(currentUrl);
    console.log("Content Script: Added URL to submitted set:", currentUrl);

    // Wait before processing
    await wait(Math.floor(2000 + Math.random() * 2000));

    if (automationState.isPaused) {
      console.log("Content Script: Paused during wait, stopping");
      isProcessingSubmission = false; // Reset flag
      sendResponse({
        success: false,
        message: "Automation paused during wait",
      });
      return;
    }

    // Extract content based on page type
    let content;
    if (automationState.pageType === "2") {
      content = await extractPostContent(automationState.htmlType);
    } else {
      content = await extractProfileContent(automationState.htmlType);
    }

    // Update tracking variables before sending
    lastSubmittedUrl = currentUrl;
    console.log("Content Script: Sending save-crawl-content for URL:", currentUrl);

    // Send extracted content to background
    chrome.runtime.sendMessage({
      id: "save-crawl-content",
      data: { env: automationState.pageType, ...content },
    });

    // Reset processing flag
    isProcessingSubmission = false;

    sendResponse({
      success: true,
      message: "Task processed successfully",
      content: content,
    });
  } catch (error) {
    console.error("Content Script: Error processing task:", error);
    isProcessingSubmission = false; // Reset flag on error
    sendResponse({ success: false, error: error.message });
  }
}

// Handle pause automation
function handlePauseAutomation(message, sendResponse) {
  console.log("Content Script: Pausing automation");
  automationState.isPaused = true;
  sendResponse({ success: true, message: "Automation paused" });
}

// Handle resume automation
function handleResumeAutomation(message, sendResponse) {
  console.log("Content Script: Resuming automation");
  automationState.isPaused = false;
  sendResponse({ success: true, message: "Automation resumed" });
}

// Handle content extraction
async function handleExtractContent(message, sendResponse) {
  try {
    const pageType = message.pageType || automationState.pageType;
    const htmlType = message.htmlType || automationState.htmlType;

    let content;
    if (pageType === "2") {
      content = await extractPostContent(htmlType);
    } else {
      content = await extractProfileContent(htmlType);
    }

    sendResponse({ success: true, content: content });
  } catch (error) {
    console.error("Content Script: Error extracting content:", error);
    sendResponse({ success: false, error: error.message });
  }
}

// Extract post content
async function extractPostContent(htmlType) {
  console.log("Content Script: Extracting post content");

  // Scroll through comments if needed
  await scrollAndLoadComments();

  const content = {
    title: document.title,
    content: getPageHTML(htmlType),
    url: document.URL,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  return content;
}

// Extract profile content
async function extractProfileContent(htmlType) {
  console.log("Content Script: Extracting profile content");

  const content = {
    title: document.title,
    content: getPageHTML(htmlType),
    url: document.URL,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  return content;
}

// Scroll and load comments for posts
async function scrollAndLoadComments() {
  const scrollContainer = findScrollContainer();
  if (!scrollContainer) return;

  let scrollCount = 0;
  const maxScrolls = 10;

  while (scrollCount < maxScrolls) {
    const oldHeight = scrollContainer.scrollHeight;
    scrollContainer.scrollBy(0, 1000);
    await wait(1000);

    // Check if more content loaded
    if (scrollContainer.scrollHeight === oldHeight) {
      break;
    }
    scrollCount++;
  }
}

// Find scroll container for Instagram
function findScrollContainer() {
  const selectors = ["main", '[role="main"]', "article", "section"];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.scrollHeight > element.clientHeight) {
      return element;
    }
  }

  return document.documentElement;
}

// Get page HTML based on type
function getPageHTML(htmlType) {
  const clonedDoc = new DOMParser().parseFromString(
    document.documentElement.outerHTML,
    "text/html"
  );

  if (htmlType !== 4 && htmlType !== 2) {
    clonedDoc.querySelectorAll("style").forEach((el) => el.remove());
  }

  if (htmlType !== 4 && htmlType !== 3) {
    clonedDoc.querySelectorAll("script").forEach((el) => el.remove());
  }

  return clonedDoc.documentElement.outerHTML;
}

// Utility wait function
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Notify background that content script is ready
console.log(
  "Content Script: Notifying background that Instagram automation is ready"
);
chrome.runtime.sendMessage({
  id: "instagram-automation-ready",
  url: window.location.href,
  title: document.title,
});

// Handle Instagram login check
async function handleCheckInstagramLogin(message, sendResponse) {
  console.log("Content Script: Checking Instagram login status");
  console.log("Content Script: Current URL:", window.location.href);
  console.log("Content Script: Purpose:", message.purpose);

  try {
    // Wait a bit for page to load completely
    await wait(2000);

    // Check for login indicators
    const loginForm = document.querySelector("#loginForm");
    const loginLinks = document.querySelectorAll('a[href^="/accounts/login"');
    const loginButton = document.querySelector('button[type="submit"]');
    const usernameInput = document.querySelector('input[name="username"]');
    const passwordInput = document.querySelector('input[name="password"]');

    // Check for appeal/suspension indicators
    const appealButton = document.querySelector(
      '[aria-label="申诉"], [aria-label="Appeal"]'
    );
    const suspendedText = document.body.innerText
      .toLowerCase()
      .includes("suspended");

    // Check for logged-in indicators
    const profileMenu = document.querySelector('[aria-label="Profile"]');
    const userMenu = document.querySelector('[data-testid="user-avatar"]');
    const homeIcon = document.querySelector('a[href="/"]');
    const feedContent = document.querySelector("article");

    console.log("Content Script: Login check elements found:", {
      loginForm: !!loginForm,
      loginLinks: loginLinks.length,
      loginButton: !!loginButton,
      usernameInput: !!usernameInput,
      passwordInput: !!passwordInput,
      appealButton: !!appealButton,
      suspendedText: suspendedText,
      profileMenu: !!profileMenu,
      userMenu: !!userMenu,
      homeIcon: !!homeIcon,
      feedContent: !!feedContent,
    });

    let isLoggedIn = false;
    let accountStatus = "unknown";

    // Check for account suspension first
    if (appealButton || suspendedText) {
      accountStatus = "suspended";
      console.log(
        "Content Script: ❌ Instagram account appears to be suspended"
      );

      // Send appeal message to background
      chrome.runtime.sendMessage({ id: "ins-appeal" });

      sendResponse({
        success: true,
        loggedIn: false,
        accountStatus: "suspended",
        message: "Account suspended",
      });
      return;
    }

    // Check for login requirement
    if (
      loginForm ||
      loginLinks.length > 0 ||
      (usernameInput && passwordInput)
    ) {
      accountStatus = "login-required";
      isLoggedIn = false;
      console.log("Content Script: ❌ Instagram login required");

      // Send login required message to background
      chrome.runtime.sendMessage({ id: "ins-login" });
    }
    // Check for logged-in status
    else if (profileMenu || userMenu || (homeIcon && feedContent)) {
      accountStatus = "logged-in";
      isLoggedIn = true;
      console.log("Content Script: ✅ Instagram login confirmed");
    }
    // Fallback check - if we don't see login elements and we're on Instagram, assume logged in
    else if (
      window.location.hostname === "www.instagram.com" &&
      !loginForm &&
      loginLinks.length === 0 &&
      !usernameInput
    ) {
      accountStatus = "probably-logged-in";
      isLoggedIn = true;
      console.log(
        "Content Script: ✅ Instagram probably logged in (no login elements found)"
      );
    } else {
      accountStatus = "uncertain";
      isLoggedIn = false;
      console.log("Content Script: ⚠️ Instagram login status uncertain");
    }

    console.log("Content Script: Final login check result:", {
      isLoggedIn: isLoggedIn,
      accountStatus: accountStatus,
      url: window.location.href,
    });

    sendResponse({
      success: true,
      loggedIn: isLoggedIn,
      accountStatus: accountStatus,
      message: `Login check complete: ${accountStatus}`,
    });
  } catch (error) {
    console.error("Content Script: Error checking Instagram login:", error);
    sendResponse({
      success: false,
      loggedIn: false,
      error: error.message,
    });
  }
}
