console.log("🚀 Content script loaded on:", window.location.href);
/*global chrome*/

const scrapedTweetIds = new Set();
let capturedRequestData = null;
let isScrapingStarted = false;
let isProfileScrapingEnabled = false;

const TWEET_SCRAPE_IDENTIFIER = "?q=wootzapp-tweets";
const FOLLOWING_SCRAPE_IDENTIFIER = "?q=wootzapp-following";
const LIKED_TWEETS_SCRAPE_IDENTIFIER = "?q=wootzapp-liked-tweets";
const REPLIES_SCRAPE_IDENTIFIER = "?q=wootzapp-replies";
const MAX_LIKED_TWEETS_REQUESTS_PER_TAB = 15;

let repliesInterceptorInjected = false;
let likedTweetsRequestCount = 0;
let tweetObserver = null;
let scrollListener = null;
let isStoppingBackgroundScrape = false;
let requestCount = 0;
const MAX_REQUESTS_PER_TAB = 15;


const MAX_TWEETS = 150;
let tweetStorage = new Map(); 

let unfollowInterceptorInjected = false;
let unlikeTweetInterceptorInjected = false;
let deleteTweetInterceptorInjected = false;

// Add new function to check Twitter auth status
async function checkTwitterAuth() {
  console.log("🔍 Checking Twitter auth status...");

  try {
    // First check if we're on Twitter
    if (!window.location.href.includes("x.com")) {
      console.log("Not on Twitter, skipping auth check");
      return false;
    }

    // Check for ct0 cookie directly from document.cookies
    const cookies = document.cookie;
    const hasCt0 = cookies.includes("ct0=");

    // Check if this is first-time authentication
    chrome.storage.local.get(["hasInitialAuth"], async (result) => {
      if (hasCt0 && !result.hasInitialAuth) {
        console.log("🎉 First-time Twitter authentication detected!");

        // Set the flag to prevent future initial auth handling
        chrome.storage.local.set({ hasInitialAuth: true }, async () => {
          console.log("✅ Initial auth flag set");

          // Wait for navigation element and extract username
          const communitiesLink = await waitForElement(
            'nav[aria-label="Primary"] a[href*="/communities"]'
          );
          if (communitiesLink) {
            const communitiesHref = communitiesLink.getAttribute("href");
            const username = communitiesHref.split("/")[1];

            // Send username to background script
            chrome.runtime.sendMessage({
              type: "INITIAL_AUTH_USERNAME",
              data: { username },
            });

            console.log("📤 Sent initial username to background:", username);
          }
        });
      }
    });

    // Send regular auth status to background script
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

// Add a new function to check if this is a profile scraping tab
function isProfileScrapingTab() {
  return (
    !window.location.href.includes(TWEET_SCRAPE_IDENTIFIER) &&
    !window.location.href.includes(FOLLOWING_SCRAPE_IDENTIFIER)
  );
}

// Modify scrapeLikesCount function
async function scrapeLikesCount() {
  console.log("🔍 Starting likes count scraping...");

  try {
    // First check if we're on the likes page
    const username = window.location.pathname.split("/")[1];
    if (!window.location.href.includes("/likes")) {
      const likesUrl = `https://x.com/${username}/likes`;
      console.log("🔄 Navigating to likes page:", likesUrl);
      window.location.href = likesUrl;
      return; // Stop here - the page will reload and this function will be called again
    }

    // Now that we're on the likes page, get the count
    const likesCount = await getLikesCount();
    console.log("✅ Found likes count:", likesCount, "for user:", username);

    // Send likes data
    chrome.runtime.sendMessage({
      type: "SCRAPED_DATA",
      data: {
        type: "LIKES_COUNT",
        content: {
          likes: parseInt(likesCount.replace(/,/g, "")) || 0,
          username: username,
        },
      },
    });

    // Set storage flags
    await chrome.storage.local.set({
      hasScrapedLikes: true
    });
    
    chrome.storage.local.get(["isLikedTweetsScrapingEnabled"], (result) => {
      if (result.isLikedTweetsScrapingEnabled) {
        chrome.runtime.sendMessage({
          type: "START_LIKED_TWEETS_SCRAPING",
          data: { username },
        });
      }
    });
  } catch (error) {
    console.error("❌ Error in likes count scraping:", error);
    chrome.runtime.sendMessage({
      type: "SCRAPING_ERROR",
      error: error.message,
    });
  }
}

// Update getLikesCount function to get correct count
async function getLikesCount(maxAttempts = 5, retryDelay = 1000) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      // Try multiple selectors to find likes count
      const selectors = [
        '[data-testid="TopNavBar"] h2[role="heading"] + div',
        'a[href$="/likes"] span span',
        '[data-testid="AppTabBar_Likes_Link"] span span',
        '[data-testid="likesTab"] span span',
        '[href*="/likes"] span span',
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.innerText.trim();
          const match = text.match(/\d+/);
          if (match) {
            console.log(
              `✅ Found likes count using selector: ${selector}, count: ${match[0]}`
            );
            return match[0];
          }
        }
      }

      // If no selector worked, try getting from API response
      const likesElement = document.querySelector('[href*="/likes"]');
      if (likesElement) {
        const likesText = likesElement.textContent;
        const match = likesText.match(/\d+/);
        if (match) {
          console.log(`✅ Found likes count from link text: ${match[0]}`);
          return match[0];
        }
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log(`🔄 Retry ${attempts}/${maxAttempts} for likes element...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    } catch (error) {
      console.error(`❌ Error in attempt ${attempts}:`, error);
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw new Error("Could not find likes count after all attempts");
}

// Initial check with immediate action if needed
chrome.storage.local.get(
  [
    "isProfileScrapingEnabled",
    "isTweetScrapingEnabled",
    "hasScrapedProfile",
    "hasScrapedLikes",
  ],
  (result) => {
    console.log("📊 Initial state check:", {
      url: window.location.href,
      isProfileTab: isProfileScrapingTab(),
      enabled: result.isProfileScrapingEnabled,
      profile: result.hasScrapedProfile,
      likes: result.hasScrapedLikes,
    });

    isProfileScrapingEnabled = result.isProfileScrapingEnabled || false;

    // Only start profile/likes scraping on non-tweet-scraping tabs
    if (
      isProfileScrapingEnabled &&
      isProfileScrapingTab() &&
      (!result.hasScrapedProfile || !result.hasScrapedLikes)
    ) {
      console.log("🔄 Starting profile/likes scraping");
      setTimeout(() => {
        getCommunitiesInfo();
      }, 2000);
    }

    // Only start tweet scraping on tweet-specific tabs
    if (
      result.isTweetScrapingEnabled &&
      window.location.href.includes(TWEET_SCRAPE_IDENTIFIER)
    ) {
      initTweetScraping();
    }
  }
);

// Message listener for scraping toggle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Content script received message:", message);

  if (message.type === "CHECK_TWITTER_AUTH") {
    checkTwitterAuth();
  }

  console.log("📨 Received message:", message);

  if (message.type === "TOGGLE_PROFILE_SCRAPING") {
    isProfileScrapingEnabled = message.enabled;
    console.log("🔄 Scraping profile and visit toggled:", isProfileScrapingEnabled);

    if (isProfileScrapingEnabled) {
      chrome.storage.local.get(
        ["hasScrapedProfile", "hasScrapedLikes"],
        (result) => {
          if (!result.hasScrapedProfile || !result.hasScrapedLikes) {
            console.log("🔄 Starting scraping after toggle");
            getCommunitiesInfo();
          }
        }
      );
    }
  }

  if (message.type === "START_FOLLOWING_SCRAPE") {
    console.log("🔄 Received following scrape request");
    clickFollowingButton()
      .then((results) => {
        console.log(
          "✅ Following scraping complete:",
          results?.length || 0,
          "accounts found"
        );
      })
      .catch((error) => {
        console.error("❌ Following scraping failed:", error);
      });
  }

  if (message.type === "EXECUTE_FOLLOWING_SCRAPE") {
    console.log("📥 Received execute following scrape message");
    clickFollowingButton()
      .then(() => {
        console.log("✅ Following scrape execution complete");
      })
      .catch((error) => {
        console.error("❌ Error executing following scrape:", error);
      });
  }

  if (message.type === "TOGGLE_TWEET_SCRAPING") {
    if (message.enabled) {
      console.log("🔄 Enabling tweet scraping");
      initTweetScraping();
    } else {
      console.log("🔄 Disabling tweet scraping");
      stopTweetScraping();
    }
  }

  if (message.type === "CLICK_HOME_BUTTON") {
    console.log("🏠 Finding and clicking home button...");
    setTimeout(() => {
      const homeButton = document.querySelector('a[href="/home"]');
      if (homeButton) {
        console.log("✅ Found home button, clicking...");
        homeButton.click();
      } else {
        console.log("❌ Home button not found");
      }
    }, 2000);
  }

  if (message.type === "INJECT_TWEET_INTERCEPTOR") {
    console.log("💉 Injecting tweet interceptor...");

    // Inject the interceptor script
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("tweetinterceptor.js");
    script.onload = () => {
      console.log("✅ Tweet interceptor loaded");
      script.remove();

      // After injection, click the home button
      console.log("🏠 Finding and clicking home button...");
      setTimeout(() => {
        const homeButton = document.querySelector('a[href="/home"]');
        if (homeButton) {
          console.log("✅ Found home button, clicking...");
          homeButton.click();
        } else {
          console.log("❌ Home button not found");
        }
      }, 2000);
    };
    (document.head || document.documentElement).appendChild(script);
  }

  if (message.type === "EXECUTE_TWEET_SCRAPING") {
    console.log("🔄 Executing tweet scraping");
    ClickHomeButton().catch((error) => {
      console.error("❌ Tweet scraping failed:", error);
      chrome.runtime.sendMessage({ type: "CLOSE_TAB" });
    });
  }

  if (message.type === "STOP_BACKGROUND_SCRAPING") {
    console.log("🛑 Received stop background scraping signal");
    isStoppingBackgroundScrape = true;
  }

  if (message.type === "EXECUTE_REPLIES_SCRAPING") {
    console.log(
      "📣 Received execute Posts and Replies scraping message:",
      message
    );
    handleRepliesScraping(message.username);
  }

  if (message.type === "EXECUTE_PROFILE_VISIT_SCRAPING") {
    handleProfileVisitScraping();
  }

  if (message.type === "STOP_PROFILE_VISIT_SCRAPING") {
    console.log("🛑 Stopping profile visit scraping");
    // Disconnect the URL observer
    if (urlObserver) {
      urlObserver.disconnect();
    }
    // Reset the last processed URL
    lastProcessedUrl = "";
    // Clean up any other profile visit related state
    chrome.storage.local.set({
      isProfileVisitScrapingEnabled: false,
    });
  }

  return true;
});

async function getCommunitiesInfo() {
  console.log("🔍 Starting communities check on:", window.location.href);

  // Check if this is the initial auth flow
  const result = await new Promise((resolve) => {
    chrome.storage.local.get(["hasInitialAuth", "isProfileScrapingEnabled"], resolve);
  });

  if (!result.isProfileScrapingEnabled || !result.hasInitialAuth) {
    console.log(
      "🚫 Scraping disabled or initial auth in progress, stopping communities check"
    );
    return;
  }

  try {
    // Check if already on profile page
    const currentUrl = window.location.href;
    if (currentUrl.includes("x.com/") && !currentUrl.includes("/communities")) {
      const username = currentUrl.split("x.com/")[1]?.split("/")[0];
      if (username && username !== "home" && username !== "i") {
        console.log("✅ Already on profile page:", username);
        await scrapeProfileData();
        console.log("✅ Profile data scraped");
        chrome.storage.local.get(['isLikedTweetsScrapingEnabled'], (result) => {
          if (result.isLikedTweetsScrapingEnabled) {
            scrapeLikesCount();
            console.log("✅ Likes count scraped");
          }
        });
        return;
      }
    }

    console.log("⏳ Waiting for navigation element...");
    const communitiesLink = document.querySelector(
      'nav[aria-label="Primary"] a[href*="/communities"]'
    );

    if (communitiesLink) {
      const communitiesHref = communitiesLink.getAttribute("href");
      const username = communitiesHref.split("/")[1];
      console.log("✅ Found username:", username);
      window.location.href = `https://x.com/${username}`;
    } else {
      console.log("❌ No communities link found");
    }
  } catch (error) {
    console.error("❌ Error in communities check:", error);
  }
}

// Function to scrape profile data
async function scrapeProfileData() {
  if (!isProfileScrapingEnabled) return;
  
  try {
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['hasScrapedProfile'], resolve);
    });

    // If profile is already scraped, move to likes scraping
    if (result.hasScrapedProfile) {
      console.log('✅ Profile already scraped');
      return;
    }

    console.log('🔍 Starting profile data scraping...');

    // Add retry logic
    let attempts = 0;
    const maxAttempts = 5;
    const retryDelay = 1000;

    while (attempts < maxAttempts) {
      try {
        const schemaElement = document.querySelector('script[type="application/ld+json"]');
        if (!schemaElement) {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`Schema not found, retrying in 1s... (Attempt ${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
          throw new Error('Profile schema not found after all attempts');
        }

        const schemaData = JSON.parse(schemaElement.textContent);
        console.log('📊 Found profile schema:', schemaData);
      
        const profileData = {
          userhandle: schemaData.mainEntity.givenName || 'N/A',
          username: window.location.pathname.split('/')[1],
          followers: schemaData.mainEntity.interactionStatistic?.find(
            stat => stat.interactionType === "https://schema.org/FollowAction"
          )?.userInteractionCount || '0',
          following: schemaData.mainEntity.interactionStatistic?.find(
            stat => stat.interactionType === "https://schema.org/SubscribeAction"
          )?.userInteractionCount || '0',
          posts: schemaData.mainEntity.interactionStatistic?.find(
            stat => stat.interactionType === "https://schema.org/WriteAction"
          )?.userInteractionCount || '0',
          joinedDate: new Date(schemaData.dateCreated).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) || 'N/A',
          timestamp: new Date().toISOString(),
          profileImageUrl: schemaData.mainEntity?.image?.contentUrl || null,
        };
      
        console.log('📊 Full profile data:', profileData);

        // Send profile data and update storage
        await Promise.all([
          new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
              type: 'SCRAPED_DATA',
              data: {
                type: 'PROFILE',
                content: profileData
              }
            }, response => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(response);
              }
            });
          }),
          new Promise(resolve => {
            chrome.storage.local.set({ hasScrapedProfile: true }, resolve);
          })
        ]);

        console.log('✅ Profile data sent and storage updated');
        break; // Exit loop if successful
      } catch (error) {
        console.error(`❌ Error scraping profile (Attempt ${attempts + 1}/${maxAttempts}):`, error);
        if (attempts >= maxAttempts - 1) throw error;
        attempts++;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  } catch (error) {
    console.error('❌ Fatal error in profile scraping:', error);
    chrome.runtime.sendMessage({ type: 'SCRAPING_ERROR', error: error.message });
  }
}

// Function to wait for element
function waitForElement(selectors, timeout = 10000) {
  return new Promise((resolve) => {
    // If selectors is a string, convert to array
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];

    // Check if element already exists
    for (const selector of selectorArray) {
      const element = document.querySelector(selector);
      if (element) {
        return resolve(element);
      }
    }

    const observer = new MutationObserver(() => {
      for (const selector of selectorArray) {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
          return;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

async function clickFollowingButton() {
  // First check if following is already scraped
  const result = await chrome.storage.local.get(["hasScrapedFollowing"]);
  if (result.hasScrapedFollowing) {
    console.log("🚫 Following already scraped, aborting");
    return null;
  }

  // Check if this is a following scrape URL
  if (!window.location.href.includes(FOLLOWING_SCRAPE_IDENTIFIER)) {
    console.log("🚫 Not a following scrape URL, aborting");
    return null;
  }

  console.log("🔍 Starting following scrape on designated URL");
  try {
    setupRequestCapture();
    console.log("✅ Request capture setup complete");

    // Wait for setup to complete
    // await new Promise(resolve => setTimeout(resolve, 2000));

    // Find following button
    const followingButton = await waitForElement(
      '[data-testid="primaryColumn"] a[href$="/following"]'
    );
    if (!followingButton) {
      throw new Error("Following button not found");
    }

    console.log("✅ Found following button, starting scrape process...");

    // Start scraping process before clicking
    scrapeTwitterUsers().then((results) => {
      console.log("Scraping process initiated");
    });

    // Wait a moment for scraping setup
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("currentr url", window.location.href);
    // Click the button
    console.log("👆 Clicking following button...");
    followingButton.click();
    console.log("currentr url", window.location.href);
  } catch (error) {
    console.error("Error in following button process:", error);
    return null;
  }
}

// Function to capture network requests
function setupRequestCapture() {
  return new Promise((resolve) => {
    console.log("🚀 Starting request capture setup...");

    // Listen for captured request data
    window.addEventListener("requestDataCaptured", async function (event) {
      const { type, data } = event.detail;
      console.log(`📡 Received ${type}:`, data);

      if (type === "XHR_COMPLETE" && data.url && data.headers) {
        capturedRequestData = data;
        console.log("✅ Got complete XHR data:", capturedRequestData);

        // Start scraping only after XHR is complete
        if (!isScrapingStarted) {
          isScrapingStarted = true;
          await scrapeTwitterUsers();
        }
      }
    });

    // Inject the interceptor script
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("interceptor.js");
    script.onload = () => {
      console.log("✅ Interceptor script loaded");
      script.remove();
      resolve();
    };
    (document.head || document.documentElement).appendChild(script);
  });
}

// Main scraping function
async function scrapeTwitterUsers() {
  if (!capturedRequestData) {
    console.error("❌ No request data captured yet");
    return;
  }

  console.log("🚀 Starting Twitter scraper with:", capturedRequestData);

  const results = [];
  let hasNextPage = true;
  let cursor = null;
  let batchNumber = 1;

  try {
    while (hasNextPage && batchNumber <= 5) {
      console.log(`\n📑 Processing batch #${batchNumber}...`);

      // Prepare request URL with cursor
      let currentUrl = capturedRequestData.url;
      if (cursor) {
        const urlObj = new URL(currentUrl);
        const params = new URLSearchParams(urlObj.search);
        const variables = JSON.parse(params.get("variables"));
        variables.cursor = cursor;
        params.set("variables", JSON.stringify(variables));
        currentUrl = `${urlObj.origin}${urlObj.pathname}?${params.toString()}`;
      }

      console.log("🔄 Fetching:", currentUrl);
      const response = await fetch(currentUrl, {
        method: capturedRequestData.method || "GET",
        headers: capturedRequestData.headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 Received data batch:", batchNumber);

      // Process the response data
      if (data.data?.user?.result?.timeline?.timeline?.instructions) {
        data.data.user.result.timeline.timeline.instructions
          .filter((instruction) => instruction.type === "TimelineAddEntries")
          .forEach((instruction) => {
            instruction.entries.forEach((entry) => {
              if (entry.entryId.startsWith("user-")) {
                const user = entry.content.itemContent.user_results.result;
                if (user && user.legacy) {
                  results.push({
                    profileImageUrl: user.legacy.profile_image_url_https,
                    username: user.legacy.screen_name,
                    name: user.legacy.name,
                    bio: user.legacy.description,
                    followersCount: user.legacy.followers_count,
                    followingCount: user.legacy.friends_count,
                    verified: user.is_blue_verified,
                    location: user.location,
                  });
                }
              } else if (entry.entryId.startsWith("cursor-bottom-")) {
                cursor = entry.content.value;
                hasNextPage = cursor && cursor.split("|")[0] !== "0";
              }
            });
          });
      }

      console.log(
        `✅ Batch #${batchNumber} complete. Users found: ${results.length}`
      );

      // Send batch results
      chrome.runtime.sendMessage({
        type: "FOLLOWING_USERS_UPDATED",
        data: results,
      });

      batchNumber++;
      // await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log("Scraping complete!");
    console.table(results);

    // After all results are collected, set hasScrapedFollowing to true
    chrome.storage.local.set({ hasScrapedFollowing: true }, () => {
      console.log("✅ Following scraping marked as complete");
      // Close the tab after marking as complete
      chrome.runtime.sendMessage({ type: "CLOSE_TAB" });
    });

    return results;
  } catch (error) {
    console.error("❌ Error during scraping:", error);
    return results;
  }
}

// Add this function after your existing functions
function processTweet(tweet) {
  if (!isProfileScrapingEnabled) return;

  const tweetId =
    tweet.getAttribute("data-tweet-id") ||
    tweet.querySelector('a[href*="/status/"]')?.href.split("/status/")[1];

  if (
    !tweetId ||
    scrapedTweetIds.has(tweetId) ||
    tweet.hasAttribute("data-scraped")
  ) {
    return;
  }

  try {
    const tweetTextElement = tweet.querySelector('[data-testid="tweetText"]');
    let tweetText = "";
    let tweetTextWithEmojis = [];

    if (tweetTextElement) {
      // Process all child elements to preserve structure
      const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          tweetTextWithEmojis.push({
            type: "text",
            content: node.textContent,
          });
        } else if (node.nodeName === "IMG") {
          tweetTextWithEmojis.push({
            type: "emoji",
            content: node.src || "",
            alt: node.alt || "",
          });
        } else if (node.childNodes && node.childNodes.length > 0) {
          // Handle spans and other elements that might contain text/emojis
          node.childNodes.forEach((childNode) => processNode(childNode));
        }
      };

      // Process all nodes recursively
      tweetTextElement.childNodes.forEach((node) => processNode(node));

      // Create plain text version
      tweetText = tweetTextWithEmojis
        .map((item) => (item.type === "text" ? item.content : item.alt))
        .join("");
    }

    const tweetContent = {
      id: tweetId,
      text: tweetText,
      user: {
        handle:
          tweet
            .querySelector('[data-testid="User-Name"] a:first-of-type')
            ?.getAttribute("href")
            ?.split("/")[1] || "",
        name:
          tweet
            .querySelector('[data-testid="User-Name"]')
            ?.innerText?.split("\n")[0]
            ?.trim() || "",
        avatar:
          tweet.querySelector(
            '[data-testid="Tweet-User-Avatar"] img:first-of-type'
          )?.src || "",
      },
      engagement: {
        replies: tweet.querySelector('[data-testid="reply"]')?.innerText || "0",
        retweets:
          tweet.querySelector('[data-testid="retweet"]')?.innerText || "0",
        likes: tweet.querySelector('[data-testid="like"]')?.innerText || "0",
      },
      timestamp: tweet.querySelector("time")?.getAttribute("datetime") || "",
      timeText: tweet.querySelector("time")?.innerText || "",
    };

    // Store in Map instead of just marking as scraped
    tweetStorage.set(tweetId, tweetContent);
    tweet.setAttribute("data-scraped", "true");
    scrapedTweetIds.add(tweetId);

    // Only send updates in batches
    if (tweetStorage.size >= 100 || document.hidden) {
      const tweetsArray = Array.from(tweetStorage.values());

      // Get existing tweets first
      chrome.storage.local.get(["tweets"], (result) => {
        const existingTweets = result.tweets || [];
        const existingIds = new Set(existingTweets.map((t) => t.id));
        const newTweets = tweetsArray.filter((t) => !existingIds.has(t.id));

        // Combine and sort tweets
        const combinedTweets = [...existingTweets, ...newTweets]
          .sort(
            (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
          )
          .slice(0, MAX_TWEETS);

        // Store combined tweets
        chrome.storage.local.set({ tweets: combinedTweets }, () => {
          console.log(
            `✅ Stored ${combinedTweets.length} tweets (${newTweets.length} new)`
          );
        });

        // Send to background script
        chrome.runtime.sendMessage({
          type: "SCRAPED_DATA",
          data: {
            type: "TWEETS",
            content: tweetsArray,
          },
        });
      });

      // Clear the temporary storage
      tweetStorage.clear();
    }
  } catch (error) {
    console.error("Error processing tweet:", error);
  }
}

// Add new function to stop tweet scraping
function stopTweetScraping() {
  console.log("🛑 Stopping tweet scraping...");

  // Remove scroll event listener
  if (scrollListener) {
    window.removeEventListener("scroll", scrollListener);
    scrollListener = null;
    console.log("✅ Scroll listener removed");
  }

  // Disconnect observer
  if (tweetObserver) {
    tweetObserver.disconnect();
    tweetObserver = null;
    console.log("✅ Tweet observer disconnected");
  }

  // Clear any existing tweet IDs
  scrapedTweetIds.clear();
}

function initTweetScraping() {
  chrome.storage.local.get(
    ["hasScrapedProfile", "isTweetScrapingEnabled"],
    (result) => {
      if (result.hasScrapedProfile && result.isTweetScrapingEnabled) {
        console.log(
          "✅ Profile scraped and tweet scraping enabled, initializing tweet scraping"
        );

        // Create new observer if needed
        if (!tweetObserver) {
          tweetObserver = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                  chrome.storage.local.get(
                    ["isTweetScrapingEnabled"],
                    (result) => {
                      if (result.isTweetScrapingEnabled) {
                        processTweet(entry.target);
                      }
                    }
                  );
                }
              });
            },
            {
              threshold: 0.5,
              rootMargin: "0px",
            }
          );
        }

        // Set up scroll listener
        if (!scrollListener) {
          scrollListener = debounce(() => {
            chrome.storage.local.get(["isTweetScrapingEnabled"], (result) => {
              if (result.isTweetScrapingEnabled) {
                console.log("📜 Scroll detected, checking for new tweets...");
                observeNewTweets();
              }
            });
          }, 500);
          window.addEventListener("scroll", scrollListener);
        }

        observeNewTweets();
      } else {
        console.log("⏳ Profile not scraped or tweet scraping disabled");
        stopTweetScraping();
      }
    }
  );
}

// Add debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Update observeNewTweets function
function observeNewTweets() {
  chrome.storage.local.get(["isTweetScrapingEnabled"], (result) => {
    if (!result.isTweetScrapingEnabled) {
      console.log("🛑 Tweet scraping disabled, skipping observation");
      return;
    }

    const tweets = document.querySelectorAll(
      'article[data-testid="tweet"]:not([data-scraped])'
    );
    console.log(`🔍 Found ${tweets.length} new tweets to observe`);

    tweets.forEach((tweet) => {
      if (!tweet.hasAttribute("data-scraped") && tweetObserver) {
        tweetObserver.observe(tweet);
      }
    });
  });
}

// Update the initial setup timeout to handle all scraping types
setTimeout(() => {
  chrome.storage.local.get(
    [
      "isProfileScrapingEnabled",
      "isLikedTweetsScrapingEnabled",
      "isBackgroundTweetScrapingEnabled",
      "hasScrapedProfile",
      "hasScrapedLikes",
      "hasScrapedFollowing",
      "isRepliesScrapingEnabled",
    ],
    (result) => {
      const currentUrl = window.location.href;
      console.log("Current state:", result, "URL:", currentUrl);

      // Handle liked tweets scraping
      if (
        result.isLikedTweetsScrapingEnabled &&
        currentUrl.includes(LIKED_TWEETS_SCRAPE_IDENTIFIER)
      ) {
        console.log("❤️ Starting liked tweets scraping...");
        clickLikesButton();
        return;
      }

      // Handle tweet scraping
      if (
        result.isBackgroundTweetScrapingEnabled &&
        currentUrl.includes(TWEET_SCRAPE_IDENTIFIER)
      ) {
        console.log(
          "🔄 Background tweet scraping enabled, starting tweets scraping..."
        );
        ClickHomeButton();
        return;
      }

      // Handle following scraping
      else if (currentUrl.includes(FOLLOWING_SCRAPE_IDENTIFIER)) {
        if (!result.hasScrapedFollowing) {
          console.log("👥 Starting following scraping...");
          clickFollowingButton();
        }
      }
      // Handle replies scraping
      else if (currentUrl.includes(REPLIES_SCRAPE_IDENTIFIER)) {
        console.log("💬 Starting replies scraping...");
        // Get username from URL
        const username = currentUrl.split("x.com/")[1]?.split("?")[0];
        if (username) {
          handleRepliesScraping(username);
        }
      }
      // Handle normal profile scraping flow (without identifier)
      else if (!result.hasScrapedProfile && result.isProfileScrapingEnabled) {
        console.log("🔍 Starting normal profile scraping...");
        getCommunitiesInfo();
      }

      // Setup unfollow interceptor for all Twitter pages
      if (window.location.href.includes("x.com")) {
        setupUnfollowInterceptor();
      }

      // Setup unlike tweet interceptor for all Twitter pages
      if (window.location.href.includes("x.com")) {
        setupUnlikeTweetInterceptor();
      }

      // Setup delete tweet interceptor for all Twitter pages
      if (window.location.href.includes("x.com")) {
        setupDeleteTweetInterceptor();
      }

      // Setup remove retweet interceptor for all Twitter pages
      if (window.location.href.includes("x.com")) {
        setupRemoveRetweetInterceptor();
      }
    }
  );
}, 1000);

// Start after page load
setTimeout(() => {
  console.log("🚀 Checking if we should start tweet scraping...");
  initTweetScraping();
}, 2000);

// Initial check when script loads
if (window.location.href.includes("x.com")) {
  console.log("🔄 Initial Twitter page load, checking auth...");
  checkTwitterAuth();
}

// Add listener for background tweets
window.addEventListener("backgroundTweetsCaptured", (event) => {
  console.log("📦 Background tweets captured:", event.detail);
  chrome.runtime.sendMessage({
    type: "SCRAPED_DATA",
    data: {
      type: "TWEETS",
      content: event.detail.data,
    },
  });
});

// Update the backgroundTweetsComplete event listener
window.addEventListener("backgroundTweetsComplete", () => {
  console.log("✅ Background tweet scraping complete");
  chrome.storage.local.get(["isBackgroundTweetScrapingEnabled"], (result) => {
    if (
      result.isBackgroundTweetScrapingEnabled &&
      !isStoppingBackgroundScrape
    ) {
      console.log("🔄 Scheduling next scraping session...");

      chrome.runtime.sendMessage({
        type: "SCHEDULE_NEXT_SCRAPING",
        data: {
          username: window.location.pathname.split("/")[1],
        },
      });
    }
    // Always close the tab after completion
    console.log("🔒 Closing tab after completion");
    chrome.runtime.sendMessage({ type: "CLOSE_TAB" });
  });
});

function setupTweetRequestCapture() {
  return new Promise((resolve) => {
    console.log("🚀 Starting request capture setup...");

    // Listen for captured request data
    window.addEventListener(
      "timelinerequestdataCaptured",
      async function (event) {
        const { type, data } = event.detail;
        console.log(`📡 Received ${type}:`, data);

        if (type === "TWEET_XHR_COMPLETE" && data.url && data.headers) {
          capturedRequestData = data;
          console.log("✅ Got complete XHR data:", capturedRequestData);

          // Start scraping only after XHR is complete
          if (!isScrapingStarted) {
            isScrapingStarted = true;
            await makeTimelineRequest(data.url, data.headers);
          }
        }
      }
    );

    // Inject the tweetinterceptor script
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("tweetinterceptor.js");
    script.onload = () => {
      console.log("✅ Interceptor script loaded");
      script.remove();
      resolve();
    };
    (document.head || document.documentElement).appendChild(script);
  });
}

async function ClickHomeButton() {
  // Check if this is a tweet scraping URL
  if (!window.location.href.includes(TWEET_SCRAPE_IDENTIFIER)) {
    console.log("🚫 Not a tweet scraping URL, aborting");
    return null;
  }

  console.log("🔍 Starting tweet scrape on designated URL");
  try {
    await setupTweetRequestCapture();
    console.log("✅ Tweet request capture setup complete");

    // Wait for setup to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Find and click home button
    const homeButton = document.querySelector('a[href="/home"]');
    if (!homeButton) {
      throw new Error("Home button not found");
    }

    console.log("👆 Clicking home button...");
    homeButton.click();
  } catch (error) {
    console.error("Error in tweet scraping process:", error);
    return null;
  }
}

async function makeTimelineRequest(
  originalUrl,
  headers,
  currentVariables = null
) {
  // First check if scraping is still enabled
  const isEnabled = await isTweetScrapingEnabled();
  if (!isEnabled) {
    console.log("🛑 Tweet scraping disabled, stopping requests");
    window.dispatchEvent(new CustomEvent("backgroundTweetsComplete"));
    return;
  }

  // Check request limit
  if (requestCount >= MAX_REQUESTS_PER_TAB) {
    console.log(
      `🛑 Reached maximum requests (${MAX_REQUESTS_PER_TAB}) for this tab`
    );
    window.dispatchEvent(new CustomEvent("backgroundTweetsComplete"));
    return;
  }

  requestCount++;
  console.log(
    `📊 Making timeline request (${requestCount}/${MAX_REQUESTS_PER_TAB})`
  );

  const urlObj = new URL(originalUrl);
  const params = new URLSearchParams(urlObj.search);

  // Extract variables and features from original request
  let variables = currentVariables;
  if (!variables) {
    try {
      variables = JSON.parse(params.get("variables"));
      console.log("📦 Using variables from captured request:", variables);
    } catch (error) {
      console.error("❌ Error parsing variables from URL:", error);
      return;
    }
  }

  // Extract features from original request
  let features;
  try {
    features = JSON.parse(params.get("features"));
    console.log("🔧 Using features from captured request:", features);
  } catch (error) {
    console.error("❌ Error parsing features from URL:", error);
    return;
  }

  // Construct URL with captured variables and features
  const requestUrl = `${urlObj.origin}${
    urlObj.pathname
  }?variables=${encodeURIComponent(
    JSON.stringify(variables)
  )}&features=${encodeURIComponent(JSON.stringify(features))}`;

  console.log("📡 Making request to:", requestUrl);

  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error("Response errors:", data.errors);
      return;
    }

    let entries = [];
    const instructions = data.data?.home?.home_timeline_urt?.instructions || [];

    instructions.forEach((instruction) => {
      if (instruction.type === "TimelineAddEntries") {
        entries = instruction.entries;
      }
    });

    const tweets = [];

    console.log("🔍 Processing entries:", entries.length);

    entries.forEach((entry, index) => {
      if (entry.content?.itemContent?.tweet_results?.result) {
        const tweet = entry.content.itemContent.tweet_results.result;
        const tweetData = {
          id: tweet.rest_id,
          text: tweet.legacy?.full_text || tweet.legacy?.text,
          user: {
            handle: tweet.core?.user_results?.result?.legacy?.screen_name,
            name: tweet.core?.user_results?.result?.legacy?.name,
            avatar:
              tweet.core?.user_results?.result?.legacy?.profile_image_url_https,
          },
          metrics: {
            replies: tweet.legacy?.reply_count,
            retweets: tweet.legacy?.retweet_count,
            likes: tweet.legacy?.favorite_count,
          },
          timestamp: tweet.legacy?.created_at,
        };
        tweets.push(tweetData);

        // Print detailed tweet information
        console.log(` Tweet ${index + 1}:`, {
          id: tweetData.id,
          author: `@${tweetData.user.handle} (${tweetData.user.name})`,
          text: tweetData.text,
          engagement: `💬 ${tweetData.metrics.replies} 🔄 ${tweetData.metrics.retweets} ❤️ ${tweetData.metrics.likes}`,
          time: new Date(tweetData.timestamp).toLocaleString(),
        });
      }
    });

    // Print batch summary
    console.log(`📊 Batch Summary:
        Total tweets: ${tweets.length}
        Time range: ${tweets[0]?.timestamp} to ${
      tweets[tweets.length - 1]?.timestamp
    }
        Users: ${new Set(tweets.map((t) => t.user.handle)).size} unique authors
      `);

    // Send tweets to background
    if (tweets.length > 0) {
      console.log("📤 Sending batch to background script");
      chrome.runtime.sendMessage({
        type: "SCRAPED_DATA",
        data: {
          type: "TWEETS",
          content: tweets,
        },
      });
    }

    // Update the cursor check to include request count
    const bottomEntry = entries.find(
      (entry) => entry.content?.cursorType === "Bottom"
    );
    if (bottomEntry && requestCount < MAX_REQUESTS_PER_TAB) {
      const nextVariables = {
        ...variables,
        cursor: bottomEntry.content.value,
      };

      console.log("⏭️ Next cursor found:", bottomEntry.content.value);
      // setTimeout(() => {
      makeTimelineRequest(originalUrl, headers, nextVariables);
      // }, 2000);
    } else {
      console.log("🏁 No more tweets to fetch or reached request limit");
      window.dispatchEvent(new CustomEvent("backgroundTweetsComplete"));
    }
  } catch (error) {
    console.error("❌ Error fetching timeline:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    window.dispatchEvent(new CustomEvent("backgroundTweetsComplete"));
  }
}


// Add this function to check if tweet scraping is enabled
async function isTweetScrapingEnabled() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["isBackgroundTweetScrapingEnabled"], (result) => {
      resolve(result.isBackgroundTweetScrapingEnabled || false);
    });
  });
}

// Add this function to handle clicking the likes button
async function clickLikesButton() {
  // Check if this is a liked tweets scraping URL
  if (!window.location.href.includes(LIKED_TWEETS_SCRAPE_IDENTIFIER)) {
    console.log("🚫 Not a liked tweets scraping URL, aborting");
    return null;
  }

  console.log("🔍 Starting liked tweets scrape on designated URL");
  try {
    await setupLikedTweetsRequestCapture();
    console.log("✅ Liked tweets request capture setup complete");

    // Wait for setup to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Find and click likes button with multiple selectors
    const likesButton = await waitForElement([
      '[data-testid="ScrollSnap-List"] a[href*="/likes"]',
      'a[href*="/likes"][role="tab"]',
    ]);

    if (!likesButton) {
      throw new Error("Likes button not found");
    }

    console.log("👆 Clicking likes button...");
    likesButton.click();
  } catch (error) {
    console.error("❌ Error in liked tweets scraping process:", error);
    return null;
  }
}

// Simplify setupLikedTweetsRequestCapture to match setupTweetRequestCapture
function setupLikedTweetsRequestCapture() {
  return new Promise((resolve) => {
    console.log("🚀 Starting liked tweets request capture setup...");

    // Listen for captured request data
    window.addEventListener(
      "likedTweetsRequestDataCaptured",
      async function (event) {
        console.log("📥 Received liked tweets request data:", event.detail);
        const { type, data } = event.detail;
        console.log(`📡 Received ${type}:`, data);

        if (type === "LIKED_TWEETS_XHR_COMPLETE" && data.url && data.headers) {
          console.log("✅ Processing liked tweets XHR data:", data);
          await makeLikedTweetsRequest(data.url, data.headers);
        }
      }
    );

    // Inject the interceptor script
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("likedtweetinterceptor.js");
    script.onload = () => {
      console.log("✅ Liked tweets interceptor script loaded");
      script.remove();
      resolve();
    };
    (document.head || document.documentElement).appendChild(script);
  });
}

// Simplify makeLikedTweetsRequest to match makeTimelineRequest
async function makeLikedTweetsRequest(
  originalUrl,
  headers,
  currentVariables = null
) {
  likedTweetsRequestCount++;
  console.log(
    `📊 Making liked tweets request ${likedTweetsRequestCount}/${MAX_LIKED_TWEETS_REQUESTS_PER_TAB}`
  );

  if (likedTweetsRequestCount > MAX_LIKED_TWEETS_REQUESTS_PER_TAB) {
    console.log("🛑 Reached maximum requests per tab");
    window.dispatchEvent(new CustomEvent("likedTweetsComplete"));
    return;
  }

  try {
    const urlObj = new URL(originalUrl);
    const params = new URLSearchParams(urlObj.search);

    let variables = currentVariables || JSON.parse(params.get("variables"));
    const features = JSON.parse(params.get("features"));

    const requestUrl = `${urlObj.origin}${
      urlObj.pathname
    }?variables=${encodeURIComponent(
      JSON.stringify(variables)
    )}&features=${encodeURIComponent(JSON.stringify(features))}`;

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: headers,
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const tweets = processLikedTweetsResponse(data);

    console.log("🔍 Tweets:", tweets);
    console.log("🔍 Length:", tweets.length);

    // Send tweets to background
    if (tweets.length > 0) {
      chrome.runtime.sendMessage({
        type: "SCRAPED_DATA",
        data: {
          type: "LIKED_TWEETS",
          content: tweets,
        },
      });
    }

    // Check for next cursor and continue if needed
    const cursor = findNextCursor(data);
    if (cursor && likedTweetsRequestCount < MAX_LIKED_TWEETS_REQUESTS_PER_TAB) {
      const nextVariables = { ...variables, cursor };
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await makeLikedTweetsRequest(originalUrl, headers, nextVariables);
    } else {
      console.log("🏁 Finished processing liked tweets");
      window.dispatchEvent(new CustomEvent("likedTweetsComplete"));
    }
  } catch (error) {
    console.error("❌ Error in makeLikedTweetsRequest:", error);
    window.dispatchEvent(new CustomEvent("likedTweetsComplete"));
  }
}

function processLikedTweetsResponse(data) {
  const tweets = [];

  const instructions =
    data.data?.user?.result?.timeline?.timeline?.instructions || [];

  instructions.forEach((instruction, idx) => {
    const entries = instruction.entries || [];

    console.log(
      `📑 Processing instruction ${idx + 1}/${instructions.length}:`,
      {
        type: instruction.type,
        entries: entries.length,
      }
    );

    entries.forEach((entry, entryIdx) => {
      if (
        entry.entryId?.startsWith("tweet-") &&
        entry.content?.itemContent?.tweet_results?.result
      ) {
        const tweet = entry.content.itemContent.tweet_results.result;
        const processedTweet = {
          id: tweet.rest_id,
          text: tweet.legacy?.full_text || tweet.legacy?.text,
          user: {
            handle: tweet.core?.user_results?.result?.legacy?.screen_name,
            name: tweet.core?.user_results?.result?.legacy?.name,
            avatar:
              tweet.core?.user_results?.result?.legacy
                ?.profile_image_url_https,
          },
          metrics: {
            replies: tweet.legacy?.reply_count,
            retweets: tweet.legacy?.retweet_count,
            likes: tweet.legacy?.favorite_count,
          },
          timestamp: tweet.legacy?.created_at,
        };
        tweets.push(processedTweet);

        console.log(`Tweet ${entryIdx + 1}:`, {
          id: processedTweet.id,
          author: `@${processedTweet.user.handle}`,
          time: new Date(processedTweet.timestamp).toLocaleString(),
        });
      }
    });
  });

  console.log("✅ Batch processing complete:", {
    tweetsProcessed: tweets.length,
    timestamp: new Date().toISOString(),
  });

  return tweets;
}


function findNextCursor(data) {
  const instructions =
    data.data?.user?.result?.timeline_v2?.timeline?.instructions || [];
  for (const instruction of instructions) {
    if (instruction.type === "TimelineAddEntries") {
      const cursorEntry = instruction.entries.find((e) =>
        e.entryId.startsWith("cursor-bottom-")
      );
      if (cursorEntry) return cursorEntry.content.value;
    }
  }
  return null;
}

// Update handleRepliesScraping function to match liked tweets flow
async function handleRepliesScraping(username) {
  console.log("🔄 Starting replies scraping for:", username);

  try {
    // Check if this is a replies scraping tab
    if (!window.location.href.includes(REPLIES_SCRAPE_IDENTIFIER)) {
      console.log("🚫 Not a replies scraping URL, aborting");
      return;
    }

    // Send immediate response to background script
    chrome.runtime.sendMessage({ type: "REPLIES_SCRAPING_STARTED" });

    // First inject the interceptor
    if (!repliesInterceptorInjected) {
      console.log("💉 Injecting posts and replies interceptor...");
      await setupRepliesRequestCapture();
      repliesInterceptorInjected = true;
      console.log("✅ Posts and replies interceptor setup complete");
    }

    // Wait for setup to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Find and click the replies tab with retry logic
    const maxAttempts = 3;
    let attempt = 0;
    let repliesTab = null;
    const repliesTabSelectors = [
      '[data-testid="ScrollSnap-List"] a[href*="/with_replies"]',
      'a[href*="/with_replies"][role="tab"]',
      '[data-testid="primaryColumn"] a[href*="/with_replies"]',
      'a[href$="/with_replies"]',
    ];

    while (!repliesTab && attempt < maxAttempts) {
      attempt++;
      console.log(
        `🔍 Attempting to find replies tab (Attempt ${attempt}/${maxAttempts})`
      );

      for (const selector of repliesTabSelectors) {
        repliesTab = document.querySelector(selector);
        if (repliesTab) {
          console.log("✅ Found replies tab with selector:", selector);
          break;
        }
      }

      if (!repliesTab) {
        console.log("⏳ Waiting before next attempt...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    if (!repliesTab) {
      throw new Error("Replies tab not found after all attempts");
    }

    console.log("🎯 Found replies tab, clicking...");
    repliesTab.click();

    // Wait for navigation to complete after clicking replies tab
    let navigationComplete = false;
    const navigationTimeout = 10000; // 10 seconds
    const startTime = Date.now();

    while (!navigationComplete && Date.now() - startTime < navigationTimeout) {
      if (window.location.href.includes("/with_replies")) {
        navigationComplete = true;
        console.log("✅ Navigation to replies tab complete");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (!navigationComplete) {
      throw new Error("Navigation to replies tab timed out");
    }

    // Wait for content to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Scroll to trigger data loading with progressive intervals
    const scrollAttempts = 5;
    for (let i = 0; i < scrollAttempts; i++) {
      console.log(`📜 Scroll attempt ${i + 1}/${scrollAttempts}`);
      window.scrollBy(0, 800);
      await new Promise((resolve) => setTimeout(resolve, 1500 + i * 500));
    }

    console.log("✅ Initial replies scraping setup complete");

    // Set up scroll listener for continuous loading
    const scrollListener = debounce(() => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 1000
      ) {
        console.log("📜 Near bottom, scrolling more...");
        window.scrollBy(0, 500);
      }
    }, 500);

    window.addEventListener("scroll", scrollListener);

    // Clean up scroll listener after some time
    setTimeout(() => {
      window.removeEventListener("scroll", scrollListener);
      console.log("🧹 Removed scroll listener");
    }, 30000); // 30 seconds
  } catch (error) {
    console.error("Error in replies scraping:", error);
    chrome.runtime.sendMessage({
      type: "SCRAPING_ERROR",
      error: error.message,
    });
  }
}

// Update setupRepliesRequestCapture function to match liked tweets flow
function setupRepliesRequestCapture() {
  return new Promise((resolve) => {
    console.log("🚀 Starting replies request capture setup...");

    let collectedTweets = new Set(); // Use Set to avoid duplicates
    let allTweets = [];
    let lastRequestTime = 0;
    let consecutiveEmptyResponses = 0;
    let isCapturing = true;

    // Listen for captured request data
    window.addEventListener(
      "postsAndRepliesDataCaptured",
      async function (event) {
        if (!isCapturing) return;

        const { tweets, requestUrl, requestHeaders, extractionSuccess } = event.detail;

        if (!tweets || !Array.isArray(tweets)) {
          console.error("❌ Invalid tweets data received");
          return;
        }

        console.log(`📡 Received posts and replies data:`, {
          tweetsCount: tweets.length,
          extractionSuccess
        });

        // Track empty responses
        if (tweets.length === 0) {
          consecutiveEmptyResponses++;
          console.log(`📭 Empty response #${consecutiveEmptyResponses}`);
          
          // Stop capturing after 2 consecutive empty responses
          if (consecutiveEmptyResponses >= 2) {
            console.log("🛑 Stopping capture - multiple empty responses indicate end of data");
            await finalizeTweetsCapture();
            return;
          }
        } else {
          // Reset empty response counter when we get tweets
          consecutiveEmptyResponses = 0;
        }

        // Process new tweets
        let newTweetsCount = 0;
        tweets.forEach(tweet => {
          if (!collectedTweets.has(tweet.id)) {
            collectedTweets.add(tweet.id);
            allTweets.push(tweet);
            newTweetsCount++;
          }
        });

        console.log(`✨ Added ${newTweetsCount} new tweets (${allTweets.length} total unique)`);
        lastRequestTime = Date.now();

        // If we haven't gotten new tweets in the last few requests, consider stopping
        if (newTweetsCount === 0 && allTweets.length > 0) {
          console.log("📊 No new tweets found, may have reached end of timeline");
        }
      }
    );

    // Function to finalize and send tweets
    async function finalizeTweetsCapture() {
      if (!isCapturing) return;
      isCapturing = false;

      console.log(`🏁 Finalizing capture with ${allTweets.length} total tweets`);

      try {
        // Get wallet and user info
        const storage = await new Promise((resolve) => {
          chrome.storage.local.get(
            ["walletAddress", "initialUsername"],
            resolve
          );
        });

        console.log("🔍 Final tweets:", allTweets);
        console.log("🔍 Final tweets length:", allTweets.length);

        const messageData = {
          type: "SCRAPED_DATA",
          data: {
            type: "REPLIES",
            content: allTweets,
            metadata: {
              totalTweets: allTweets.length,
              captureComplete: true,
              timestamp: new Date().toISOString()
            },
            walletAddress: storage.walletAddress,
            userHandle: storage.initialUsername,
          },
        };
    
        console.log("📤 Sending message to background:", messageData);
    
        // Send message and wait for response
        chrome.runtime.sendMessage(messageData, (response) => {
          if (chrome.runtime.lastError) {
            console.error("❌ Error sending message to background:", chrome.runtime.lastError);
            return;
          }
          
          if (response) {
            console.log("✅ Background script response:", response);
          } else {
            console.warn("⚠️ No response from background script");
          }
        });
    
        console.log("✅ Replies capture completed and sent to background");
      } catch (error) {
        console.error("❌ Error processing posts and replies:", error);
        chrome.runtime.sendMessage({
          type: "SCRAPING_ERROR",
          error: error.message,
        });
      }
    }

    // Inject the interceptor script
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("postsandrepliesinterceptor.js");
    script.onload = () => {
      console.log("✅ Posts and Replies Interceptor script loaded");
      script.remove();
      
      // Start intelligent scrolling
      startIntelligentScrolling();
      resolve();
    };
    (document.head || document.documentElement).appendChild(script);

    // Intelligent scrolling function
    function startIntelligentScrolling() {
      let scrollAttempts = 0;
      const maxScrollAttempts = 10; // Increased from 5
      let lastTweetCount = 0;
      let noProgressCount = 0;

      function performScroll() {
        if (!isCapturing) {
          console.log("🛑 Stopping scroll - capture completed");
          return;
        }

        scrollAttempts++;
        console.log(`📜 Smart scroll attempt ${scrollAttempts}/${maxScrollAttempts}`);

        // Scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);

        // Check progress
        setTimeout(() => {
          const currentTweetCount = allTweets.length;
          
          if (currentTweetCount === lastTweetCount) {
            noProgressCount++;
            console.log(`⏸️ No progress count: ${noProgressCount}`);
          } else {
            noProgressCount = 0;
            lastTweetCount = currentTweetCount;
            console.log(`📈 Progress: ${currentTweetCount} tweets collected`);
          }

          // Stop conditions
          if (scrollAttempts >= maxScrollAttempts) {
            console.log("🏁 Max scroll attempts reached");
            finalizeTweetsCapture();
          } else if (noProgressCount >= 3) {
            console.log("🏁 No progress for 3 attempts - likely end of timeline");
            finalizeTweetsCapture();
          } else if (consecutiveEmptyResponses >= 2) {
            console.log("🏁 Multiple empty responses - end of data");
            finalizeTweetsCapture();
          } else {
            // Continue scrolling
            setTimeout(performScroll, 2000); // Wait 2 seconds between scrolls
          }
        }, 1500); // Wait 1.5 seconds for data to load
      }

      // Start scrolling after initial page load
      setTimeout(performScroll, 1000);
    }

    // Fallback timeout to ensure we don't hang forever
    setTimeout(() => {
      if (isCapturing) {
        console.log("⏰ Timeout reached - finalizing capture");
        finalizeTweetsCapture();
      }
    }, 60000); // 60 second timeout
  });
}

// Function to handle profile visit scraping
async function handleProfileVisitScraping() {
  console.log("🔄 Starting profile visit scraping");

  // Check if profile visit scraping is enabled and get user info
  const storage = await new Promise((resolve) => {
    chrome.storage.local.get(
      [
        "isProfileVisitScrapingEnabled",
        "initialUsername",
        "userHandle",
        "visitedProfiles",
        "lastVisitedProfile",
        "lastVisitTime",
      ],
      resolve
    );
  });

  if (!storage.isProfileVisitScrapingEnabled) {
    console.log("🚫 Profile visit scraping is disabled");
    return;
  }

  // Get current URL and extract handle
  const currentUrl = window.location.href;
  const match = currentUrl.match(/x\.com\/([^/?#]+)$/);

  if (!match) {
    console.log("🚫 Not a valid x.com profile URL");
    return;
  }

  const visitedHandle = match[1];
  const userHandle = storage.initialUsername || storage.userHandle;

  // Skip special paths and own profile
  if (
    !visitedHandle ||
    visitedHandle === userHandle ||
    visitedHandle === storage.initialUsername ||
    visitedHandle === storage.userHandle ||
    [
      "home",
      "explore",
      "notifications",
      "messages",
      "i",
      "settings",
      "jobs",
      "search",
      "lists",
      "communities",
      "login",
      "signup",
      "privacy",
      "tos",
      "help",
      "about",
      "developers",
      "status",
      "account",
      "logout",
      "intent",
      "compose",
      "analytics",
      "moment_maker",
      "live",
      "topics",
      "events",
      "safety",
      "ads",
      "verified",
      "subscriptions",
      "connect",
      "support",
      "download",
      "business",
      "security",
      "pricing",
      "profile",
      "following",
      "followers",
    ].includes(visitedHandle)
  ) {
    console.log(
      ":bust_in_silhouette: Skipping special path or own profile:",
      visitedHandle
    );
    return;
  }

  // Check for duplicate visit within debounce period (5 seconds)
  const now = Date.now();
  if (
    visitedHandle === storage.lastVisitedProfile &&
    now - (storage.lastVisitTime || 0) < 5000
  ) {
    console.log(
      "🔄 Skipping duplicate visit within debounce period:",
      visitedHandle
    );
    return;
  }

  // Update last visit data
  chrome.storage.local.set({
    lastVisitedProfile: visitedHandle,
    lastVisitTime: now,
  });

  // Initialize visited profiles if not exists
  const visitedProfiles = storage.visitedProfiles || [];

  console.log("👤 Processing profile visit:", {
    visitor: userHandle,
    visited: visitedHandle,
  });

  // Get profile photo URL from the page
  const profilePhotoElement = document.querySelector(
    'img[src*="profile_images"]'
  );
  const profilePhotoUrl = profilePhotoElement ? profilePhotoElement.src : null;

  // Get user's name from the page
  const nameElement = document.querySelector(
    '[data-testid="UserName"] div span'
  );
  const userName = nameElement ? nameElement.textContent.trim() : null;

  // Create enriched profile data
  const profileVisitData = {
    handle: visitedHandle,
    visitTime: new Date().toISOString(),
    profileUrl: `https://x.com/${visitedHandle}`,
    profilePhotoUrl: profilePhotoUrl,
    userName: userName,
  };

  // Update visited profiles list with enriched data
  if (!visitedProfiles.some((profile) => profile.handle === visitedHandle)) {
    visitedProfiles.push(profileVisitData);
    chrome.storage.local.set({ visitedProfiles });
    // Notify UI about the update
    chrome.runtime.sendMessage({
      type: "VISITED_PROFILES_UPDATED",
      data: visitedProfiles,
    });
  }

  // Send profile visit data to background script
  chrome.runtime.sendMessage({
    type: "SEND_PROFILE_VISIT",
    data: {
      visitedHandle,
      userHandle: userHandle,
      timestamp: new Date().toISOString(),
    },
  });
}

// Add URL change monitoring for profile visits
let lastProcessedUrl = "";

// Function to check URL changes
function checkUrlChange() {
  const currentUrl = window.location.href;
  if (currentUrl !== lastProcessedUrl) {
    lastProcessedUrl = currentUrl;
    handleProfileVisitScraping();
  }
}

// Set up URL change monitoring
const urlObserver = new MutationObserver(() => {
  checkUrlChange();
});

// Start observing URL changes when profile visit scraping is enabled
chrome.storage.local.get(["isProfileVisitScrapingEnabled"], (result) => {
  if (result.isProfileVisitScrapingEnabled) {
    urlObserver.observe(document, { subtree: true, childList: true });
    // Check initial URL
    checkUrlChange();
  }
});

// Update observer when scraping state changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isProfileVisitScrapingEnabled) {
    if (changes.isProfileVisitScrapingEnabled.newValue) {
      urlObserver.observe(document, { subtree: true, childList: true });
      checkUrlChange();
    } else {
      urlObserver.disconnect();
    }
  }
});

function setupUnfollowInterceptor() {
  if (unfollowInterceptorInjected) return;

  console.log("💉 Setting up unfollow interceptor...");

  // Listen for unfollow events
  window.addEventListener("unfollowProfileCaptured", async (event) => {
    console.log("📥 Received unfollow event:", event.detail);
    
    try {
      const storage = await new Promise((resolve) => {
        chrome.storage.local.get(
          ["unfollowedUsers", "walletAddress", "initialUsername"],
          resolve
        );
      });

      const existingUnfollows = storage.unfollowedUsers || [];
      const walletAddress = storage.walletAddress;
      const userHandle = storage.initialUsername;

      const unfollowData = event.detail.data;

      // Check if we already have this unfollow
      if (!existingUnfollows.some(user => user.userId === unfollowData.userId)) {
        // Add to unfollowed users list
        const updatedUnfollows = [...existingUnfollows, unfollowData];
        
        // Store in chrome.storage
        await chrome.storage.local.set({ unfollowedUsers: updatedUnfollows });

        // Send message to update UI
        chrome.runtime.sendMessage({
          type: "UNFOLLOWED_USERS_UPDATED",
          data: updatedUnfollows
        });

        // Send to API if we have wallet and handle
        if (walletAddress && userHandle) {
          chrome.runtime.sendMessage({
            type: "SEND_UNFOLLOW_EVENT",
            data: {
              walletAddress,
              userHandle,
              unfollowedHandle: unfollowData.screenName
            }
          });
        }
      }
    } catch (error) {
      console.error("❌ Error processing unfollow data:", error);
    }
  });

  // Inject the interceptor script
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("unfollowinterceptor.js");
  script.onload = () => {
    console.log("✅ Unfollow interceptor loaded");
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);

  unfollowInterceptorInjected = true;
}

function setupUnlikeTweetInterceptor() {
  if (unlikeTweetInterceptorInjected) return;

  console.log("💉 Setting up unlike tweet interceptor...");

  // Listen for unlike tweet events
  window.addEventListener("unlikeTweetRequestDataCaptured", async (event) => {
    console.log("📥 Received unlike tweet event:", event.detail);
    
    try {
      const storage = await new Promise((resolve) => {
        chrome.storage.local.get(
          ["unlikedTweets", "walletAddress", "initialUsername"],
          resolve
        );
      });

      const existingUnlikes = storage.unlikedTweets || [];
      const walletAddress = storage.walletAddress;
      const userHandle = storage.initialUsername;

      const unlikeData = event.detail.data;
      const tweetId = unlikeData.tweetId;

      // Check if we already have this unlike
      if (!existingUnlikes.some(tweet => tweet.id === tweetId)) {
        // Format the tweet data
        const unlikedTweet = {
          id: tweetId,
          text: unlikeData.responseData?.text || "",
          timestamp: unlikeData.timestamp || new Date().toISOString(),
          user: {
            name: unlikeData.responseData?.name || "Unknown",
            handle: unlikeData.responseData?.screen_name || "unknown",
            avatar: unlikeData.responseData?.profile_image_url_https || null
          },
          metrics: {
            replies: unlikeData.responseData?.reply_count || 0,
            retweets: unlikeData.responseData?.retweet_count || 0,
            likes: unlikeData.responseData?.favorite_count || 0
          }
        };
        
        const updatedUnlikes = [...existingUnlikes, unlikedTweet];
        
        // Store in chrome.storage
        await chrome.storage.local.set({ unlikedTweets: updatedUnlikes });

        // Send message to update UI
        chrome.runtime.sendMessage({
          type: "UNLIKED_TWEETS_UPDATED",
          data: updatedUnlikes
        });

        // Send to API if we have wallet and handle
        if (walletAddress && userHandle) {
          chrome.runtime.sendMessage({
            type: "SEND_UNLIKE_TWEET_EVENT",
            data: {
              walletAddress,
              userHandle,
              tweetId
            }
          });
        }
      }
    } catch (error) {
      console.error("❌ Error processing unlike tweet data:", error);
    }
  });

  // Inject the interceptor script
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("unliketweetinterceptor.js");
  script.onload = () => {
    console.log("✅ Unlike tweet interceptor loaded");
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);

  unlikeTweetInterceptorInjected = true;
}

function setupDeleteTweetInterceptor() {
  if (deleteTweetInterceptorInjected) return;

  console.log("💉 Setting up delete tweet interceptor...");

  // Listen for delete tweet events
  window.addEventListener("deleteTweetDataCaptured", async (event) => {
    console.log("📥 Received delete tweet event:", event.detail);
    
    try {
      const storage = await new Promise((resolve) => {
        chrome.storage.local.get(
          ["deletedTweets", "walletAddress", "initialUsername"],
          resolve
        );
      });

      const existingDeletes = storage.deletedTweets || [];
      const walletAddress = storage.walletAddress;
      const userHandle = storage.initialUsername;

      const deleteData = event.detail.data;
      const tweetId = deleteData.tweetId;

      // Check if we already have this delete
      if (!existingDeletes.some(tweet => tweet.id === tweetId)) {
        // Format the tweet data
        const deletedTweet = {
          id: tweetId,
          timestamp: new Date().toISOString(),
          requestData: deleteData
        };
        
        const updatedDeletes = [...existingDeletes, deletedTweet];
        
        // Store in chrome.storage
        await chrome.storage.local.set({ deletedTweets: updatedDeletes });

        // Send message to update UI
        chrome.runtime.sendMessage({
          type: "DELETED_TWEETS_UPDATED",
          data: updatedDeletes
        });

        // Send to API if we have wallet and handle
        if (walletAddress && userHandle) {
          chrome.runtime.sendMessage({
            type: "SEND_DELETE_TWEET_EVENT",
            data: {
              walletAddress,
              userHandle,
              tweetId
            }
          });
        }
      }
    } catch (error) {
      console.error("❌ Error processing delete tweet data:", error);
    }
  });

  // Inject the interceptor script
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("deletetweetinterceptor.js");
  script.onload = () => {
    console.log("✅ Delete tweet interceptor loaded");
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);

  deleteTweetInterceptorInjected = true;
}

function setupRemoveRetweetInterceptor() {
    console.log('🔄 Setting up remove retweet interceptor...');
    
    // Inject the interceptor script
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('removeretweetinterceptor.js');
    script.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);

    // Listen for remove retweet events
    window.addEventListener('removeRetweetRequestDataCaptured', function(event) {
        console.log('📨 Remove retweet event captured:', event.detail);
        
        const tweetId = event.detail.data.tweetId;
        if (tweetId) {
            // First store in chrome storage
            chrome.storage.local.get(['removedRetweets'], function(result) {
                const removedRetweets = result.removedRetweets || [];
                const timestamp = new Date().toISOString();
                
                // Add new removed retweet
                const removedRetweet = {
                    id: tweetId,
                    timestamp: timestamp,
                    text: event.detail.data.responseData?.text || '',
                    originalTweet: event.detail.data.responseData || {}
                };

                // Add to storage if not already present
                if (!removedRetweets.some(rt => rt.id === tweetId)) {
                    removedRetweets.push(removedRetweet);
                    
                    // Store updated list
                    chrome.storage.local.set({ removedRetweets: removedRetweets }, function() {
                        console.log('💾 Stored removed retweet:', removedRetweet);
                        
                        // Broadcast update
                        chrome.runtime.sendMessage({
                            type: 'REMOVED_RETWEETS_UPDATED',
                            data: removedRetweets
                        });
                        
                        // Send to background for API call
                        chrome.runtime.sendMessage({
                            type: 'SEND_REMOVE_RETWEET_EVENT',
                            data: {
                                tweetId: tweetId
                            }
                        });
                    });
                }
            });
        }
    });
}
