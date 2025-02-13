/* global chrome */
import throttle from './throttle.js';

// API configuration
export const API_CONFIG = {
  BASE_URL: "https://camp-wootzapp.up.railway.app/api/events",
  HEADERS: {
    "Content-Type": "application/json",
    // 'x-extension-password': 'w00tz_APP2Camp*Auth@297'
  },
};

// Store for tracking sent events to prevent duplicates
const sentEvents = new Map();
const unsentEvents = new Map();
const pendingEvents = new Map(); // Track events currently being processed

// Helper function to generate event key
function generateEventKey(eventType, uniqueId) {
  return `${eventType}_${uniqueId}`;
}

// Helper function to check if event was already sent
async function wasEventSent(eventType, uniqueId) {
  const key = generateEventKey(eventType, uniqueId);

  // Check if event is currently being processed
  if (pendingEvents.has(key)) {
    console.log("⏳ Event is currently being processed:", { eventType, uniqueId });
    return true;
  }

  // Check in-memory cache first
  if (sentEvents.has(key)) {
    console.log("🔄 Found event in memory cache:", { eventType, uniqueId });
    return true;
  }

  // Check chrome storage with timestamp
  const result = await chrome.storage.local.get(["sentEvents"]);
  const storedEvents = result.sentEvents || {};
  
  if (storedEvents[key]) {
    // Check if the event was sent in the last 24 hours
    const timeSinceSent = Date.now() - storedEvents[key];
    const wasSentRecently = timeSinceSent < 24 * 60 * 60 * 1000; // 24 hours
    
    if (wasSentRecently) {
      console.log("🔄 Found recent event in storage:", { eventType, uniqueId });
      // Add to memory cache to avoid future storage checks
      sentEvents.set(key, storedEvents[key]);
      return true;
    } else {
      // Remove old event from storage
      delete storedEvents[key];
      await chrome.storage.local.set({ sentEvents: storedEvents });
    }
  }
  
  return false;
}

// Helper function to mark event as sent
async function markEventAsSent(eventType, uniqueId) {
  const key = generateEventKey(eventType, uniqueId);
  const timestamp = Date.now();

  // Add to in-memory cache
  sentEvents.set(key, timestamp);

  // Add to chrome storage
  const result = await chrome.storage.local.get(["sentEvents"]);
  const storedEvents = result.sentEvents || {};
  storedEvents[key] = timestamp;
  await chrome.storage.local.set({ sentEvents: storedEvents });

  // Remove from unsent and pending events
  unsentEvents.delete(key);
  pendingEvents.delete(key);
  
  // Clean up storage
  const result2 = await chrome.storage.local.get(["unsentEvents"]);
  const storedUnsentEvents = result2.unsentEvents || {};
  delete storedUnsentEvents[key];
  await chrome.storage.local.set({ unsentEvents: storedUnsentEvents });
}

// Helper function to mark event as unsent
async function markEventAsUnsent(eventType, uniqueId, data) {
  const key = generateEventKey(eventType, uniqueId);

  // Don't add if already sent or pending
  if (sentEvents.has(key) || pendingEvents.has(key)) {
    return;
  }

  // Add to in-memory cache
  unsentEvents.set(key, { data, timestamp: Date.now() });

  // Add to chrome storage
  const result = await chrome.storage.local.get(["unsentEvents"]);
  const storedUnsentEvents = result.unsentEvents || {};
  storedUnsentEvents[key] = { data, timestamp: Date.now() };
  await chrome.storage.local.set({ unsentEvents: storedUnsentEvents });
}

// Function to retry unsent events
async function retryUnsentEvents() {
  const result = await chrome.storage.local.get(["unsentEvents"]);
  const storedUnsentEvents = result.unsentEvents || {};
  const currentTime = Date.now();

  console.log("🔄 Starting retry of unsent events:", {
    totalEvents: Object.keys(storedUnsentEvents).length
  });

  for (const [key, eventData] of Object.entries(storedUnsentEvents)) {
    // Skip if event is currently being processed
    if (pendingEvents.has(key)) {
      console.log("⏳ Skipping retry - event is currently being processed:", key);
      continue;
    }

    // Skip if event was sent recently
    if (await wasEventSent(eventData.data.event.name, eventData.data.event.id || eventData.data.event.handle || eventData.data.event.text)) {
      console.log("✅ Skipping retry - event was already sent:", key);
      delete storedUnsentEvents[key];
      continue;
    }

    // Only retry events less than 24h old
    if (currentTime - eventData.timestamp < 24 * 60 * 60 * 1000) {
      console.log("🔄 Retrying event:", key);
      
      try {
        // Mark as pending before retry
        pendingEvents.set(key, Date.now());
        
        await throttle(async () => {
          try {
            const response = await fetch(API_CONFIG.BASE_URL, {
              method: "POST",
              headers: {
                ...API_CONFIG.HEADERS,
                Origin: chrome.runtime.getURL(""),
                Accept: "application/json",
              },
              body: JSON.stringify(eventData.data),
              credentials: "omit",
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
              console.log("✅ Retry successful for event:", key);
              await markEventAsSent(eventData.data.event.name, eventData.data.event.id || eventData.data.event.handle || eventData.data.event.text);
              delete storedUnsentEvents[key];
            } else {
              console.log("❌ Retry failed (API error) for event:", key);
              // Keep in unsent events but update timestamp
              eventData.timestamp = Date.now();
              storedUnsentEvents[key] = eventData;
            }
          } catch (error) {
            console.error("❌ Retry failed for event:", key, error);
            // Keep in unsent events but update timestamp
            eventData.timestamp = Date.now();
            storedUnsentEvents[key] = eventData;
          } finally {
            pendingEvents.delete(key);
          }
        });
      } catch (error) {
        console.error("❌ Error during retry of event:", key, error);
        pendingEvents.delete(key);
      }
    } else {
      console.log("⏰ Removing old unsent event:", key);
      delete storedUnsentEvents[key];
    }
  }

  // Update storage with cleaned up unsent events
  await chrome.storage.local.set({ unsentEvents: storedUnsentEvents });
  
  console.log("✅ Retry cycle completed. Remaining unsent events:", Object.keys(storedUnsentEvents).length);
}

// Generic function to send data to API with throttling and retry
async function sendToAPI(data) {
  // Don't send if wallet address is pending
  if (data.walletAddress === "pending") {
    console.log("⏳ Skipping API call - waiting for wallet address:", {
      eventType: data.event.name,
      userHandle: data.userHandle,
    });
    return null;
  }

  // Check if this event was already sent
  const uniqueId = data.event.id || data.event.handle || data.event.text;
  const eventType = data.event.name;
  const key = generateEventKey(eventType, uniqueId);

  if (await wasEventSent(eventType, uniqueId)) {
    console.log("🔄 Skipping duplicate event:", {
      eventType,
      uniqueId,
    });
    return null;
  }

  // Mark as pending before making API call
  pendingEvents.set(key, Date.now());

  // Save to storage before making API call
  await markEventAsUnsent(eventType, uniqueId, data);

  return throttle(async () => {
    try {
      console.log("🚀 Making API request:", {
        eventType: data.event.name,
        userHandle: data.userHandle,
      });

      const response = await fetch(API_CONFIG.BASE_URL, {
        method: "POST",
        headers: {
          ...API_CONFIG.HEADERS,
          Origin: chrome.runtime.getURL(""),
          Accept: "application/json",
        },
        body: JSON.stringify(data),
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Check for both success formats
      if (result.success || result.status === 'success') {
        await markEventAsSent(eventType, uniqueId);
        console.log("✅ API call successful:", {
          eventType: data.event.name,
          response: result,
        });
      } else {
        // Remove from pending but keep in unsent for retry
        pendingEvents.delete(key);
        console.log("⚠️ API call returned error:", {
          eventType: data.event.name,
          response: result,
        });
      }
      
      return result;
    } catch (error) {
      // Remove from pending but keep in unsent for retry
      pendingEvents.delete(key);
      
      console.error("❌ API call failed:", {
        eventType: data.event.name,
        error: error.message,
        data: data,
      });

      // Ensure the event is marked for retry
      await markEventAsUnsent(eventType, uniqueId, data);
      
      throw error;
    }
  });
}

// Function to send profile visit data
async function sendProfileVisit(walletAddress, userHandle, visitedHandle) {
  console.log("📤 Preparing to send profile visit:", {
    visitor: userHandle,
    visited: visitedHandle,
  });

  const data = {
    walletAddress,
    userHandle,
    event: {
      name: "VISIT_PROFILE",
      handle: visitedHandle,
    },
  };

  return sendToAPI(data);
}

// Function to send tweet visit data
async function sendTweetVisit(walletAddress, userHandle, tweetId) {
  console.log("📤 Preparing to send tweet visit:", {
    user: userHandle,
    tweetId: tweetId,
  });

  const data = {
    walletAddress,
    userHandle,
    event: {
      name: "VISIT_TWEET",
      id: tweetId,
    },
  };

  return sendToAPI(data);
}

// Function to send like tweet event with deduplication
async function sendLikeTweet(walletAddress, userHandle, tweetId) {
  console.log("📤 Preparing to send like tweet event:", {
    user: userHandle,
    tweetId: tweetId,
  });

  const data = {
    walletAddress,
    userHandle,
    event: {
      name: "LIKE_TWEET",
      id: tweetId,
    },
  };

  return sendToAPI(data);
}

// Batch processing function with deduplication
async function sendBatchEvents(events) {
  console.log("📦 Starting batch processing:", {
    batchSize: events.length,
    eventTypes: events.map((e) => e.event.name),
  });

  // Filter out duplicates before processing
  const uniqueEvents = [];
  for (const event of events) {
    const uniqueId = event.event.id || event.event.handle || event.event.text;
    if (!(await wasEventSent(event.event.name, uniqueId))) {
      uniqueEvents.push(event);
    }
  }

  console.log("📊 Batch stats:", {
    total: events.length,
    unique: uniqueEvents.length,
    duplicates: events.length - uniqueEvents.length,
  });

  const results = await Promise.allSettled(
    uniqueEvents.map((event) => sendToAPI(event))
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log("📊 Batch processing complete:", {
    total: uniqueEvents.length,
    succeeded,
    failed,
    successRate: `${((succeeded / uniqueEvents.length) * 100).toFixed(1)}%`,
  });

  return results;
}

// Function to send unlike tweet event
async function sendUnlikeTweet(walletAddress, userHandle, tweetId) {
  console.log("📤 Preparing to send unlike tweet event:", {
    user: userHandle,
    tweetId: tweetId,
  });

  const data = {
    walletAddress,
    userHandle,
    event: {
      name: "UNLIKE_TWEET",
      id: tweetId,
    },
  };

  return sendToAPI(data);
}

// Function to send retweet event
async function sendRetweet(walletAddress, userHandle, tweetId) {
  console.log("📤 Preparing to send retweet event:", {
    user: userHandle,
    tweetId: tweetId,
  });

  const data = {
    walletAddress,
    userHandle,
    event: {
      name: "RETWEET",
      id: tweetId,
    },
  };

  return sendToAPI(data);
}

// Function to send remove retweet event
async function sendRemoveRetweet(walletAddress, userHandle, tweetId) {
  console.log("📤 Preparing to send remove retweet event:", {
    user: userHandle,
    tweetId: tweetId,
  });

  const data = {
    walletAddress,
    userHandle,
    event: {
      name: "REMOVE_RETWEET",
      id: tweetId,
    },
  };

  return sendToAPI(data);
}

// Function to send follow profile event
async function sendFollowProfile(walletAddress, userHandle, followedHandle) {
  console.log("📤 Preparing to send follow profile event:", {
    follower: userHandle,
    followed: followedHandle,
  });

  const data = {
    walletAddress,
    userHandle,
    event: {
      name: "FOLLOW_PROFILE",
      handle: followedHandle,
    },
  };

  return sendToAPI(data);
}

// Function to send unfollow profile event
async function sendUnfollowProfile(
  walletAddress,
  userHandle,
  unfollowedHandle
) {
  console.log("📤 Preparing to send unfollow profile event:", {
    unfollower: userHandle,
    unfollowed: unfollowedHandle,
  });

  const data = {
    walletAddress,
    userHandle,
    event: {
      name: "UNFOLLOW_PROFILE",
      handle: unfollowedHandle,
    },
  };

  return sendToAPI(data);
}

// Function to send reply tweet event
async function sendReplyTweet(
  walletAddress,
  userHandle,
  replyTweetId,
  replyText,
  originalTweetId,
  originalTweetHandle
) {
  console.log("📤 Preparing to send reply tweet event:", {
    user: userHandle,
    replyTo: originalTweetHandle,
    replyTweetId: replyTweetId,
  });

  const data = {
    walletAddress,
    userHandle,
    event: {
      name: "REPLY_TWEET",
      id: replyTweetId,
      text: replyText,
      originalTweetId: originalTweetId,
      originalTweetHandle: originalTweetHandle,
    },
  };

  return sendToAPI(data);
}

// Function to send create tweet event
async function sendCreateTweet(walletAddress, userHandle, text, tweetId) {
  console.log("📤 Preparing to send create tweet event:", {
    user: userHandle,
    text: text,
    id: tweetId,
  });

  const data = {
    walletAddress,
    userHandle,
    event: {
      name: "CREATE_TWEET",
      text,
      id: tweetId,
    },
  };

  return sendToAPI(data);
}

// Function to send delete tweet event
async function sendDeleteTweet(walletAddress, userHandle, tweetId) {
  console.log("📤 Preparing to send delete tweet event:", {
    user: userHandle,
    tweetId: tweetId,
  });

  const data = {
    walletAddress,
    userHandle,
    event: {
      name: "DELETE_TWEET",
      id: tweetId,
    },
  };

  return sendToAPI(data);
}

// Initialize retry mechanism with more frequent retries for failed events
setInterval(retryUnsentEvents, 2 * 60 * 1000); // Retry every 2 minutes

// Export all functions
export {
  sendProfileVisit,
  sendTweetVisit,
  sendLikeTweet,
  sendBatchEvents,
  sendUnlikeTweet,
  sendRetweet,
  sendRemoveRetweet,
  sendFollowProfile,
  sendUnfollowProfile,
  sendReplyTweet,
  sendCreateTweet,
  sendDeleteTweet,
};
