/* global chrome */
// Background script for handling API calls
console.log('Background script loaded');

// Get extension ID
const extensionId = chrome.runtime.id;
console.log('Extension ID:', extensionId);

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  // Initialize any required storage
  chrome.storage.local.set({ extensionId: extensionId }, () => {
    console.log('Extension ID saved');
  });
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  // Handle other message types if needed
  return false;
}); 