// src/services/ai/providers/backend.js
// Streams from your backend. Expects SSE or fetch streaming of plain text/markdown.

import { parseSSE } from '../sse';
import { ensureMarkdown } from '../markdown';

export async function* stream({ kind, req, ctx }) {
  const { backendBaseUrl, signal, organizationId, screenshotData } = ctx;

  // Get organization ID - this is critical for the API to work
  let orgId = organizationId;
  
  // If no organization ID provided, we need to get it from the user's data
  if (!orgId) {
    try {
      if (typeof window !== 'undefined') {
        // First, try to get from the user service
        const userService = require('@/services/user');
        const selectedOrgId = userService.getLocalSelectedOrgId();
        
        if (selectedOrgId) {
          orgId = selectedOrgId;
          console.log('🔧 Backend - Using selected org ID from localStorage:', orgId);
        } else {
          // If no local selection, try to get user data and pick organization
          console.log('🔧 Backend - No local org ID, fetching user data...');
          const userData = await userService.getCurrentUser({ force: true });
          
          if (userData?.organizations && userData.organizations.length > 0) {
            // Use the pickOrganization logic to get the best organization
            const pickedOrg = userService.pickOrganization({
              user: userData.user,
              organizations: userData.organizations
            });
            
            if (pickedOrg) {
              orgId = pickedOrg.id || pickedOrg.organizationId;
              console.log('🔧 Backend - Picked organization:', { orgId, orgName: pickedOrg.name });
            }
          }
        }
      }
    } catch (e) {
      console.error('🔧 Backend - Error getting organization ID:', e);
    }
  }

  // If we still don't have an org ID, we can't proceed
  if (!orgId) {
    throw new Error('No organization ID available. Please ensure you are authenticated and have access to an organization.');
  }

  console.log('🔧 Backend - Using organization ID:', orgId);

  // Use Direct Response Mode but simulate streaming by chunking the response
  console.log('🔧 Backend - Using Direct Response Mode with simulated streaming...');
  const chatUrl = `${backendBaseUrl}/streamMobile/startChat/`;
  const requestBody = {
    prompt: req.prompt,
    orgId: orgId
    // Omitting clientId to use Direct Response Mode
  };

  // Add screenshot data if available (auto-captured)
  if (screenshotData) {
    // Extract base64 data from data URL
    const base64Data = screenshotData.split(',')[1];
    const mimeType = screenshotData.split(';')[0].split(':')[1];
    
    requestBody.imageData = base64Data;
    requestBody.imageMimeType = mimeType;
    
    console.log('🔧 Backend - Including auto-captured screenshot data:', { 
      hasImage: true, 
      mimeType, 
      dataLength: base64Data.length,
      autoCaptured: true
    });
  }

  const res = await fetch(chatUrl, {
    method: 'POST',
    signal,
    credentials: 'include', // Include session cookies for authentication
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Backend error ${res.status}: ${text || res.statusText}`);
  }

  const responseData = await res.json();
  
  if (responseData.success && responseData.response) {
    // Simulate streaming by yielding the response in chunks
    const fullResponse = responseData.response;
    console.log('🔧 Backend - Received complete response, simulating streaming...');
    
    // Split response into words and yield them in chunks of 5-6 words for better streaming
    const words = fullResponse.split(' ');
    const chunkSize = 5; // Show 5 words at a time
    
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      yield ensureMarkdown(chunk + (i + chunkSize < words.length ? ' ' : ''));
      
      // Add a small delay to simulate real-time streaming (faster than word-by-word)
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  } else {
    throw new Error('Invalid response format from backend');
  }
}