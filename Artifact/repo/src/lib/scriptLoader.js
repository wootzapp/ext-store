/* global chrome */
import { injectScript, scriptMap } from './scriptInterceptor';

// Script loader service for handling external scripts
export const scriptUrls = {
  uid2SecureSignal: 'https://cdn.integ.uidapi.com/uid2SecureSignal.js',
  uid2Sdk: 'https://cdn.integ.uidapi.com/uid2-sdk-3.9.0.js',
  gpt: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
  ima: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js'
};

// Function to inject script using our interceptor
export async function fetchAndInjectScript(url) {
  console.log('🔄 Starting script injection for:', url);
  const scriptName = scriptMap[url];
  if (!scriptName) {
    console.error('❌ No script mapping found for:', url);
    throw new Error(`No script mapping found for: ${url}`);
  }

  try {
    console.log('🚀 Injecting script:', scriptName);
    injectScript(scriptName);
    console.log('✅ Script injected successfully:', scriptName);
    return { content: 'Script injected successfully' };
  } catch (error) {
    console.error('❌ Error injecting script:', scriptName, error);
    throw error;
  }
}

// This function is now a no-op since scripts are injected directly
export async function executeScript(content, url) {
  console.log('📝 Executing script for:', url);
  // No need to actually execute since we're using our interceptor
  console.log('✅ Script execution completed for:', url);
  return true;
} 