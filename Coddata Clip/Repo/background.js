!(function () {
  "use strict";
  const e = {
    manifest_version: 3,
    name: "Codatta Clip",
    version: "1.2.1",
    key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx9+n3Q7T+yiDpnlYs5tSrPGYl7TLm4S5Tn5Lu7ibJJgKGG/ccxxgHUxfD+41u+wXFoLyv9I22oBWblmgXbbI8dFYx21KP9vFqpiaCEoT54tIfvav2a7aP1nuUC7CGsCnoaN5XbgzKjHEle4telnzK/39/qoUNOKmMTCwGcUN9erRMelsEzIc3BsN7HBHICqS1tfmT7ehVELlqBQ0aSbRE4fJaQ+/3zfyMHrL5YmDkFZ/9ZPx6dTjTnKq3THKUX6JtRqRQ/VhWuMgGOyoJAZrKr1L6K795g7I0H7A6uC5ncdjTeX4b+SvhJlf2qtKQB/MjpsjNN7oufFiy/r/ZPT6EQIDAQAB",
    description: "Turn Your Intelligence into AI",
    icons: {
      16: "assets/images/logo.png",
      32: "assets/images/logo.png",
      48: "assets/images/logo.png",
    },
    action: {
      default_icon: {
        16: "assets/images/logo.png",
        24: "assets/images/logo.png",
        32: "assets/images/logo.png",
      },
      default_title: "codatta",
    },
    content_scripts: [{ js: ["browser-icon.js"], matches: ["<all_urls>"] }],
    web_accessible_resources: [
      {
        resources: ["assets/*", "signin.js", "browser-icon.js"],
        matches: ["<all_urls>"],
      },
    ],
    externally_connectable: { matches: ["<all_urls>"] },
    permissions: [
      "activeTab",
      "storage",
      "contextMenus",
      "scripting",
      "webRequest",
    ],
    host_permissions: ["<all_urls>"],
    background: { service_worker: "background.js" },
  };

  // Helper function to reset deduplication state
  function resetDeduplicationState(reason = "automation start") {
    console.log(`Background: 🔄 Resetting deduplication state (${reason})`);

    // Clear all tracking maps and sets
    submissionPromises.clear();
    successfulSubmissions.clear();
    activeWebContentTasks.clear();
    completedWebContentTasks.clear();

    // Clear API request deduplication
    activeApiRequests.clear();
    submissionAttempts.clear();

    // Clear UI interference prevention
    activeContentSubmissions.clear();

    // Clear session storage for submitted URLs (but keep persistent storage)
    chrome.storage.local.set({
      submittedUrlsSession: [],
    });

    console.log("Background: ✅ Deduplication state reset complete");
  }

  // Helper function to safely send messages without stopping automation if UI is closed
  function safeSendMessage(message, callback = null) {
    try {
      if (callback) {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            console.log(
              `Background: 🔇 UI not available for message (automation continues):`,
              chrome.runtime.lastError.message
            );
          } else if (callback) {
            callback(response);
          }
        });
      } else {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            console.log(
              `Background: 🔇 UI not available for message (automation continues):`,
              chrome.runtime.lastError.message
            );
          }
        });
      }
    } catch (error) {
      console.log(
        `Background: 🔇 Message sending failed (automation continues):`,
        error.message
      );
    }
  }

  // Enhanced deduplication tracking
  const submissionPromises = new Map(); // Track active submissions
  const successfulSubmissions = new Set(); // Track URLs that got status 1 (successful)
  const activeWebContentTasks = new Map(); // Track active WebContent tasks by URL
  const completedWebContentTasks = new Set(); // Track completed WebContent tasks

  // API request deduplication tracking
  const activeApiRequests = new Map(); // Track active API requests
  const submissionAttempts = new Map(); // Track submission attempts to prevent duplicates

  // UI interference prevention
  const activeContentSubmissions = new Set(); // Track URLs currently being submitted to block UI interference

  // Helper function to get submitted URLs from storage
  async function getSubmittedUrls() {
    const storage = await chrome.storage.local.get(["submittedUrlsSession"]);
    return new Set(storage.submittedUrlsSession || []);
  }

  // Helper function to add URL to submitted list
  async function addSubmittedUrl(urlKey) {
    const submittedUrls = await getSubmittedUrls();
    submittedUrls.add(urlKey);
    await chrome.storage.local.set({
      submittedUrlsSession: Array.from(submittedUrls),
    });
  }

  // Initialize automation state on startup
  async function initializeAutomation() {
    try {
      console.log(
        "Background: 🚀 Initializing automation and recovery systems"
      );

      const stored = await chrome.storage.local.get([
        "automationState",
        "lastContentSubmission",
      ]);
      if (stored.automationState) {
        automationState = { ...automationState, ...stored.automationState };
        console.log(
          "Background: 📁 Restored automation state:",
          automationState
        );

        // If automation was running, we could potentially resume it here
        if (automationState.isRunning) {
          console.log(
            "Background: Automation was running before restart - notifying sidepanel"
          );

          // Notify any open sidepanel that automation is running
          setTimeout(() => {
            notifyAutomationStateChange("automation-started");
          }, 1000); // Delay to ensure sidepanel is ready
        }
      }

      // CHECK FOR FAILED CONTENT SUBMISSIONS
      await checkAndRecoverFailedSubmissions();

      console.log("Background: ✅ Automation initialization complete");
    } catch (error) {
      console.log("Background: ❌ Failed to initialize automation:", error);
    }
  }

  // Function to check and recover failed content submissions
  async function checkAndRecoverFailedSubmissions() {
    try {
      console.log(
        "Background: 🔍 Checking for failed content submissions to recover"
      );

      const storage = await chrome.storage.local.get([
        "lastContentSubmission",
        "auth",
      ]);
      const lastSubmission = storage.lastContentSubmission;
      const currentAuth = storage.auth;

      if (!lastSubmission) {
        console.log("Background: 📝 No previous submission attempts found");
        return;
      }

      console.log(
        "Background: 📋 Last submission status:",
        lastSubmission.status
      );
      console.log(
        "Background: 📅 Last submission time:",
        new Date(lastSubmission.timestamp).toISOString()
      );

      // Check if last submission failed or is still attempting
      if (
        lastSubmission.status === "failed" ||
        lastSubmission.status === "attempting"
      ) {
        console.log(
          "Background: 🔄 Found failed/incomplete submission, attempting recovery"
        );

        // Verify auth is still valid and matches
        if (!currentAuth?.uid || currentAuth.uid !== lastSubmission.authUid) {
          console.log(
            "Background: ⚠️ Auth mismatch or missing, cannot recover submission"
          );
          console.log("Background: Auth comparison:", {
            currentUid: currentAuth?.uid,
            submissionUid: lastSubmission.authUid,
            authMatch: currentAuth?.uid === lastSubmission.authUid,
          });
          return;
        }

        // Check if submission is recent (within last 24 hours)
        const submissionAge = Date.now() - lastSubmission.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (submissionAge > maxAge) {
          console.log("Background: ⏰ Submission too old, skipping recovery");
          return;
        }

        console.log("Background: 🚑 Attempting to recover failed submission");
        console.log("Background: 📄 Payload to retry:", {
          url: lastSubmission.payload?.url,
          env: lastSubmission.payload?.env,
          user_id: lastSubmission.payload?.user_id,
        });

        // Retry the submission
        const retrySuccess = await submitContentToBackend({
          url: lastSubmission.payload.url,
          title: lastSubmission.payload.title,
          content: lastSubmission.payload.content,
          timezone: lastSubmission.payload.timezone,
          env: lastSubmission.payload.env,
        });

        if (retrySuccess) {
          console.log("Background: 🎉 Content submission recovery successful!");
        } else {
          console.log("Background: 💔 Content submission recovery failed");
        }
      } else if (lastSubmission.status === "success") {
        console.log(
          "Background: ✅ Last submission was successful, no recovery needed"
        );
      }
    } catch (error) {
      console.error("Background: ❌ Error during submission recovery:", error);
    }
  }

  // Call initialization
  initializeAutomation();

  // Initialize points sync system
  (async () => {
    await syncPointsWithUI();
    console.log("Background: ✅ Points sync system initialized");
  })();

  console.log("Background: Extension loaded, automation handlers ready");
  console.log("Background: ANDROID CHROMIUM FALLBACK MECHANISM ACTIVE");
  console.log(
    "Background: Extension will use timer-based navigation detection instead of chrome.tabs.onUpdated"
  );
  console.log(
    "Background: This ensures automation continues even when chrome.tabs.onUpdated doesn't work"
  );

  // Helper function to save automation state and ensure persistence
  async function saveAutomationState(reason = "manual save") {
    try {
      await chrome.storage.local.set({ automationState: automationState });
      console.log(`Background: 💾 Automation state saved (${reason}):`, {
        isRunning: automationState.isRunning,
        stopFlag: automationState.stopFlag,
        isProcessingTask: automationState.isProcessingTask,
        currentTaskIndex: automationState.currentTaskIndex,
        tasksCount: automationState.webContentTasks.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Background: ❌ Failed to save automation state:", error);
    }
  }

  // Missing handler functions
  async function handleStartAutomation(data, sender, sendResponse) {
    console.log("Background: 🚀 Starting automation flow");

    // CRITICAL: Reset deduplication state at start of new automation
    resetDeduplicationState("new automation session");

    // CRITICAL: Set automation state immediately when starting
    automationState.isRunning = true;
    automationState.stopFlag = false;
    console.log("Background: 🔄 Set automation state at start:", {
      isRunning: automationState.isRunning,
      stopFlag: automationState.stopFlag,
    });

    // Save state immediately to prevent any resets
    await saveAutomationState("start-automation");

    // Notify UI immediately that automation has started
    notifyAutomationStateChange("automation-started", {
      message: "Automation started successfully",
      timestamp: new Date().toISOString(),
    });

    // ORIGINAL CODE (commented out for debugging):

    try {
      const webContentId = 1; // Use hardcoded ID as per API requirement
      const instagramUrl = "https://www.instagram.com/";

      console.log(
        "Background: 📱 Creating WebContent for Instagram login check"
      );
      console.log("Background: 🔍 Using Instagram URL:", instagramUrl);
      console.log(
        "Background: 🔍 Checking if chrome.wootz API is available:",
        !!chrome.wootz
      );

      // Check if chrome.wootz API is available
      if (!chrome.wootz || !chrome.wootz.createBackgroundWebContents) {
        console.log(
          "Background: ⚠️ chrome.wootz API not available, skipping WebContent method"
        );
        console.log(
          "Background: 🔄 Proceeding directly with automation (fallback mode)"
        );

        // Fallback: proceed directly with automation
        try {
          await continueWithWebContentAutomation(data.config || {});
          sendResponse({
            success: true,
            message: "Automation started with fallback method (no WebContent)",
          });
        } catch (error) {
          console.log("Background: ❌ Fallback automation failed:", error);
          sendResponse({ success: false, error: error.message });
        }
        return;
      }

      // Create WebContent using correct API signature: chrome.wootz.createBackgroundWebContents(webContentsId, url, callback)
      chrome.wootz.createBackgroundWebContents(
        webContentId,
        instagramUrl,
        async (result) => {
          console.log("Background: 🔄 WebContent creation result:", result);

          if (result && result.success) {
            console.log(
              "Background: ✅ WebContent created successfully for Instagram"
            );

            // Wait longer for the page to load completely, then send login check message
            setTimeout(async () => {
              console.log(
                "Background: 🔍 Sending login check message to WebContent ID:",
                webContentId
              );

              // Send message to content script to check login status
              chrome.tabs.sendMessage(
                webContentId,
                {
                  id: "check-instagram-login",
                  purpose: "initial-login-check",
                },
                async (response) => {
                  console.log("Background: 📥 Login check response:", response);

                  // Check for chrome.runtime.lastError
                  if (chrome.runtime.lastError) {
                    console.log(
                      "Background: ⚠️ Chrome runtime error during login check:",
                      chrome.runtime.lastError.message
                    );
                    console.log(
                      "Background: ❌ Login check failed, cannot start automation without Instagram login"
                    );

                    // Stop automation - login check failed
                    automationState.isRunning = false;
                    automationState.stopFlag = true;
                    await saveAutomationState("login-check-failed");

                    sendResponse({
                      success: false,
                      error:
                        "Instagram login check failed. Please log into Instagram first.",
                      message: "Login required - automation stopped",
                    });
                    return;
                  }

                  if (response && response.loggedIn) {
                    console.log(
                      "Background: ✅ Instagram login confirmed, starting automation"
                    );
                    // Continue with automation in WebContent
                    await continueWithWebContentAutomation(data.config || {});
                    sendResponse({
                      success: true,
                      message:
                        "Automation started with WebContent after login confirmation",
                    });
                  } else {
                    console.log(
                      "Background: ❌ Instagram not logged in or no response"
                    );
                    console.log(
                      "Background: ❌ Stopping automation - Instagram login required"
                    );

                    // Stop automation - user not logged in
                    automationState.isRunning = false;
                    automationState.stopFlag = true;
                    await saveAutomationState("instagram-not-logged-in");

                    sendResponse({
                      success: false,
                      error:
                        "Instagram login required. Please log into Instagram first.",
                      message: "Login required - automation stopped",
                    });
                    return;
                  }
                }
              );
            }, 5000); // Increased timeout to 5 seconds
          } else {
            console.error(
              "Background: ❌ Failed to create WebContent:",
              result?.error || "Unknown error"
            );

            // Stop automation - WebContent creation failed and we cannot verify login
            console.log(
              "Background: ❌ Cannot proceed without WebContent - login verification required"
            );

            automationState.isRunning = false;
            automationState.stopFlag = true;
            await saveAutomationState("webcontent-creation-failed");

            sendResponse({
              success: false,
              error:
                "Failed to create WebContent for Instagram. Please try again.",
              message: "WebContent creation failed - automation stopped",
            });
          }
        }
      );
    } catch (error) {
      console.error("Background: ❌ Error starting automation:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async function handleRegisterAutomation(data, sender, sendResponse) {
    console.log("Background: 📋 Registering automation");
    // Implementation for registration
    sendResponse({ success: true, message: "Automation registered" });
  }

  async function handleGetCurrentPoints(data, sender, sendResponse) {
    try {
      const storage = await chrome.storage.local.get([
        "currentPoints",
        "todayPoints",
        "totalEarning",
        "successfulSubmissions",
      ]);

      const currentPoints = storage.currentPoints || 0;
      const todayPoints = storage.todayPoints || 0;
      const totalEarning = storage.totalEarning || 0;
      const successfulSubmissions = storage.successfulSubmissions || [];

      console.log("Background: 📊 Current points data:", {
        currentPoints,
        todayPoints,
        totalEarning,
        successfulSubmissionsCount: successfulSubmissions.length,
      });

      // Return format expected by sidepanel: {success: true, data: {...}}
      sendResponse({
        success: true,
        data: {
          currentPoints: currentPoints,
          todayPoints: todayPoints,
          totalEarning: totalEarning,
          submissions: successfulSubmissions.length,
        },
      });
    } catch (error) {
      console.error("Background: ❌ Error getting points:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async function handleResetClaimedPoints(data, sender, sendResponse) {
    try {
      console.log(
        "Background: 🔄 Resetting all points data after successful claim"
      );

      // Clear all points-related storage
      await chrome.storage.local.remove([
        "currentPoints",
        "todayPoints",
        "totalEarning",
        "claimedPoints",
        "lastPointUpdate",
        "submittedUrls",
        "submittedUrlsSession",
        "successfulSubmissions",
        "recentContentSaves",
      ]);

      // Reset in-memory tracking
      successfulSubmissions.clear();
      submissionPromises.clear();
      activeWebContentTasks.clear();
      completedWebContentTasks.clear();
      activeApiRequests.clear();
      submissionAttempts.clear();
      activeContentSubmissions.clear();

      // Initialize fresh points data
      await chrome.storage.local.set({
        currentPoints: 0,
        todayPoints: 0,
        totalEarning: 0,
        lastPointUpdate: Date.now(),
        submittedUrlsSession: [],
        successfulSubmissions: [],
        recentContentSaves: [],
      });

      console.log(
        "Background: ✅ All points data and submission tracking cleared for new automation"
      );

      // Notify UI about the reset
      safeSendMessage({
        type: "points-updated",
        data: {
          currentPoints: 0,
          todayPoints: 0,
          totalEarning: 0,
          pointsReset: true,
          reason: "claim-completed",
        },
      });

      sendResponse({
        success: true,
        message: "Points data cleared for new automation",
        data: {
          currentPoints: 0,
          todayPoints: 0,
          totalEarning: 0,
        },
      });
    } catch (error) {
      console.error("Background: ❌ Error resetting claimed points:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async function handleVerifySubmissions(data, sender, sendResponse) {
    console.log("Background: 🔍 Verifying submissions");
    // Implementation for submission verification
    sendResponse({ success: true, message: "Submissions verified" });
  }

  async function handleResetAllPoints(data, sender, sendResponse) {
    try {
      await chrome.storage.local.clear();
      console.log("Background: 🔄 All points and data reset");
      sendResponse({ success: true, message: "All data reset" });
    } catch (error) {
      console.error("Background: ❌ Error resetting all data:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async function handleDebugStorage(data, sender, sendResponse) {
    try {
      const storage = await chrome.storage.local.get(null);
      console.log("Background: 🔍 Debug storage:", storage);
      sendResponse({ success: true, data: storage });
    } catch (error) {
      console.error("Background: ❌ Error getting debug storage:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async function handleStopAutomation(sendResponse) {
    console.log("Background: 🛑 Stopping automation");
    automationState.isRunning = false;
    automationState.stopFlag = true;
    automationState.isActive = false;
    automationState.currentStep = "idle";

    // Save the stopped state
    await saveAutomationState("stop-automation");

    // Notify UI immediately that automation has stopped
    notifyAutomationStateChange("automation-stopped", {
      message: "Automation stopped successfully",
      timestamp: new Date().toISOString(),
    });

    // Destroy any active WebContent
    if (automationState.webContentId) {
      try {
        await chrome.wootz.destroyWebContent(automationState.webContentId);
        automationState.webContentId = null;
      } catch (error) {
        console.error("Background: ❌ Error destroying WebContent:", error);
      }
    }

    sendResponse({ success: true, message: "Automation stopped" });
  }

  // Additional missing handler functions
  async function handleUpdateCompletedLinkList(data, sender, sendResponse) {
    console.log(
      "Background: 📋 === ENTERING handleUpdateCompletedLinkList ==="
    );
    console.log("Background: Current automation state:", {
      stopFlag: automationState.stopFlag,
      isRunning: automationState.isRunning,
      isPaused: automationState.isPaused,
      currentTaskIndex: automationState.currentTaskIndex,
      totalTasks: automationState.webContentTasks.length,
    });

    // CRITICAL: Don't fetch new tasks if automation was stopped
    if (
      automationState.stopFlag ||
      !automationState.isRunning ||
      automationState.isPaused
    ) {
      console.log(
        "Background: ⏸️ Automation is stopped/paused - NOT fetching new tasks"
      );
      sendResponse({
        success: true,
        message: "Automation stopped - no new tasks fetched",
        newTasks: [],
      });
      return;
    }

    try {
      console.log("Background: 🎯 Starting task completion and refresh cycle");

      // Step 1: Call the completes API to mark current batch as completed
      console.log(
        "Background: 📤 Calling completes API to mark tasks as completed"
      );

      const completesResult = await callCompletesAPI();
      console.log("Background: 📋 Completes API result:", completesResult);

      // Step 2: Fetch new tasks from the next API
      console.log("Background: 🔄 Fetching new tasks from next API");

      const newTasks = await fetchTasksFromBackend();
      console.log(
        "Background: 📥 New tasks fetched:",
        newTasks ? newTasks.length : 0,
        "tasks"
      );
      console.log("Background: 📋 New tasks data:", newTasks);

      if (newTasks && newTasks.length > 0) {
        // Step 3: Update automation state with new tasks
        automationState.webContentTasks = newTasks;
        automationState.currentTaskIndex = 0;
        automationState.isProcessingTask = false;

        // Save updated state
        await saveAutomationState("new-tasks-fetched");

        console.log("Background: ✅ New tasks loaded, restarting automation");
        console.log("Background: 🆕 New task count:", newTasks.length);
        console.log(
          "Background: 🆕 New task list:",
          newTasks.map((t) => t.url)
        );

        // Step 4: Restart automation with new tasks
        setTimeout(() => {
          console.log("Background: 🚀 Restarting automation with new tasks");
          processNextWebContentTask();
        }, 2000); // Small delay before starting new batch

        sendResponse({
          success: true,
          message: "New tasks fetched and automation restarted",
          newTasks: newTasks,
          taskCount: newTasks.length,
        });
      } else {
        console.log(
          "Background: ⚠️ No new tasks available, stopping automation"
        );

        // No more tasks available - stop automation gracefully
        automationState.isRunning = false;
        automationState.stopFlag = true;
        await saveAutomationState("no-more-tasks");

        sendResponse({
          success: true,
          message: "No more tasks available - automation completed",
          newTasks: [],
          taskCount: 0,
        });
      }
    } catch (error) {
      console.error("Background: ❌ Error in task completion cycle:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // Call the completes API to mark current batch as completed
  async function callCompletesAPI() {
    return new Promise(async (resolve) => {
      console.log("Background: 📤 Calling completes API");

      try {
        // Get auth from storage FIRST
        const storage = await chrome.storage.local.get(["auth"]);
        const auth = storage.auth;

        console.log("Background: 🔍 Completes API call details:", {
          url: "https://spider.codatta.io/api/app/ins/task/completes",
          method: "POST",
          hasAuth: !!auth,
          hasUid: !!auth?.uid,
          hasToken: !!auth?.token,
          userId: auth?.uid,
        });

        console.log("Background: 🔍 Debug auth data for completes API:", {
          hasAuth: !!auth,
          hasToken: !!auth?.token,
          hasUid: !!auth?.uid,
          hasAuthToken: !!auth?.auth_token,
          uid: auth?.uid,
          uidType: typeof auth?.uid,
          uidLength: auth?.uid ? auth.uid.toString().length : 0,
          fullAuth: auth,
        });

        if (!auth || !auth.token || !auth.uid) {
          console.error(
            "Background: ❌ No auth data found for completes API call"
          );
          console.error("Background: 🔍 Missing auth details:", {
            authExists: !!auth,
            tokenExists: !!auth?.token,
            uidExists: !!auth?.uid,
            authData: auth,
          });
          resolve({ success: false, error: "No auth data" });
          return;
        }

        // Use the existing API call system for completes endpoint
        a(
          {
            url: "https://spider.codatta.io/api/app/ins/task/completes",
            params: {
              method: "POST",
              headers: {
                accept: "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                auth_token: auth.auth_token || auth.token,
                token: auth.token,
                uid: auth.uid,
                showinvitercode: "false",
                "x-client": "Codatta Clip@1.2.1",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "none",
              },
              body: JSON.stringify({
                user_id: auth.uid, // CRITICAL: Add user_id parameter for completes API
              }),
            },
            cache: false,
            auth: true,
          },
          (response) => {
            console.log("Background: 📤 Completes API request body sent:", {
              user_id: auth.uid,
              user_id_type: typeof auth.uid,
              user_id_length: auth.uid ? auth.uid.toString().length : 0,
            });
            console.log("Background: 📥 Completes API response:", response);
            console.log("Background: 🔍 Completes API response details:", {
              success: response?.success,
              errorCode: response?.errorCode,
              errorMessage: response?.errorMessage,
              data: response?.data,
            });
            resolve(response);
          }
        );
      } catch (error) {
        console.error("Background: ❌ Error calling completes API:", error);
        resolve({ success: false, error: error.message });
      }
    });
  }

  function n(tabId) {
    console.log("Background: 🖱️ Browser icon clicked for tab:", tabId);
    // Handle browser icon click
  }

  async function handlePauseCrawl(data, sender, sendResponse) {
    console.log(
      "Background: ⏸️ Pausing crawl - STOPPING automation completely"
    );

    // CRITICAL: Stop all automation when pause is requested
    automationState.isRunning = false;
    automationState.stopFlag = true;
    automationState.isPaused = true;
    automationState.isProcessingTask = false;

    // Save the stopped state immediately
    await saveAutomationState("pause-crawl-stop");

    // Destroy any active WebContent
    if (automationState.activeWebContentId) {
      try {
        await chrome.wootz.destroyWebContent(
          automationState.activeWebContentId
        );
        automationState.activeWebContentId = null;
        console.log("Background: ✅ WebContent destroyed on pause");
      } catch (error) {
        console.error(
          "Background: ❌ Error destroying WebContent on pause:",
          error
        );
      }
    }

    // Stop any fallback timers
    stopAutomationFallbackTimer();

    console.log("Background: ✅ Automation completely stopped via pause-crawl");
    sendResponse({ success: true, message: "Automation stopped completely" });
  }

  async function handleInsLogin(data, sendResponse) {
    console.log("Background: 🔐 Instagram login required");
    sendResponse({ success: true, message: "Login required detected" });
  }

  async function handleInsAppeal(data, sendResponse) {
    console.log("Background: ⚠️ Instagram account suspended");
    sendResponse({ success: true, message: "Account suspension detected" });
  }

  async function handleSaveCrawlContent(data, sendResponse) {
    console.log("Background: 💾 Saving crawl content");

    try {
      // Process the content data
      const contentData = data.data;
      console.log("Background: Content to save:", {
        url: contentData.url,
        title: contentData.title,
        env: contentData.env,
      });

      // Submit to backend
      const success = await submitContentToBackend(contentData);

      if (success) {
        console.log("Background: ✅ Content saved successfully");
        sendResponse({ success: true, message: "Content saved" });
      } else {
        console.log("Background: ❌ Content save failed");
        sendResponse({ success: false, message: "Content save failed" });
      }
    } catch (error) {
      console.error("Background: ❌ Error saving content:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async function handleCrawlError(data, sendResponse) {
    console.error("Background: ❌ Crawl error:", data.message);

    // Stop automation on error
    automationState.isActive = false;

    sendResponse({ success: true, message: "Error handled" });
  }

  // Submit content to backend with duplicate prevention and PROPER API INTEGRATION
  async function submitContentToBackend(contentData) {
    console.log(
      "Background: 📤 Submitting content to backend with REAL API call"
    );
    console.log("Background: 🔍 Content data to submit:", {
      url: contentData.url,
      title: contentData.title,
      env: contentData.env,
    });

    try {
      const urlKey = contentData.url;

      // ENHANCED DUPLICATE PREVENTION: Check session and persistent storage
      const sessionSubmittedUrls = await getSubmittedUrls();

      // CRITICAL: Check if this URL already received a successful (status 1) response
      if (successfulSubmissions.has(urlKey)) {
        console.log(
          "Background: ✅ URL already successfully submitted (status 1), skipping API call:",
          urlKey
        );
        return true; // Return true to continue automation
      }

      // Also check persistent storage for already submitted URLs
      const persistentStorage = await chrome.storage.local.get([
        "submittedUrls",
      ]);
      const persistentSubmittedUrls = new Set(
        persistentStorage.submittedUrls || []
      );

      if (
        sessionSubmittedUrls.has(urlKey) ||
        persistentSubmittedUrls.has(urlKey)
      ) {
        console.log(
          "Background: ⚠️ URL already submitted (found in session or persistent storage), skipping:",
          urlKey
        );
        console.log("Background: 🔍 Duplicate check details:", {
          inSession: sessionSubmittedUrls.has(urlKey),
          inPersistent: persistentSubmittedUrls.has(urlKey),
          inSuccessful: successfulSubmissions.has(urlKey),
          urlKey: urlKey,
        });
        return true; // Return true to continue automation
      }

      // PREVENT MULTIPLE SIMULTANEOUS SUBMISSIONS of same URL
      if (submissionPromises.has(urlKey)) {
        console.log(
          "Background: ⚠️ URL submission already in progress, waiting for completion:",
          urlKey
        );
        const existingPromise = submissionPromises.get(urlKey);
        return await existingPromise;
      }

      // Create promise for this submission to prevent duplicates
      const submissionPromise = (async () => {
        try {
          // Store submission attempt
          await chrome.storage.local.set({
            lastContentSubmission: {
              status: "attempting",
              timestamp: Date.now(),
              payload: contentData,
              authUid: (await chrome.storage.local.get(["auth"])).auth?.uid,
            },
          });

          // Get auth for API call
          const storage = await chrome.storage.local.get(["auth"]);
          const auth = storage.auth;

          console.log("Background: 🔍 Debug auth data for parse API:", {
            hasAuth: !!auth,
            hasToken: !!auth?.token,
            hasUid: !!auth?.uid,
            hasAuthToken: !!auth?.auth_token,
            uid: auth?.uid,
            uidType: typeof auth?.uid,
            uidLength: auth?.uid ? auth.uid.toString().length : 0,
            fullAuth: auth,
          });

          if (!auth || !auth.token || !auth.uid) {
            console.error(
              "Background: ❌ No auth data found for content submission"
            );
            console.error("Background: 🔍 Missing auth details:", {
              authExists: !!auth,
              tokenExists: !!auth?.token,
              uidExists: !!auth?.uid,
              authData: auth,
            });
            return false;
          }

          console.log(
            "Background: 🌐 Making REAL API call to parse endpoint..."
          );
          console.log("Background: 🔍 API call details:", {
            url: "https://spider.codatta.io/api/app/ins/parse",
            method: "POST",
            hasAuth: !!auth,
            hasUid: !!auth.uid,
            hasToken: !!auth.token,
            contentUrl: contentData.url,
            contentEnv: contentData.env,
          });

          // Make the REAL API call using the existing API system
          return new Promise((apiResolve) => {
            a(
              {
                url: "https://spider.codatta.io/api/app/ins/parse",
                params: {
                  method: "POST",
                  headers: {
                    accept: "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/json",
                    auth_token: auth.auth_token || auth.token,
                    token: auth.token,
                    uid: auth.uid,
                    showinvitercode: "false",
                    "x-client": "Codatta Clip@1.2.1",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "none",
                  },
                  body: JSON.stringify({
                    url: contentData.url,
                    title: contentData.title,
                    content: contentData.content,
                    timezone: contentData.timezone,
                    env: contentData.env,
                    user_id: auth.uid, // CRITICAL: Add user_id parameter
                  }),
                },
                cache: false,
                auth: true,
                context: "automation", // Mark as automation call
                fromAutomation: true, // Additional flag for clarity
              },
              async (response) => {
                console.log("Background: 📤 REAL API request body sent:", {
                  url: contentData.url,
                  title: contentData.title,
                  content: contentData.content,
                  timezone: contentData.timezone,
                  env: contentData.env,
                  user_id: auth.uid,
                  user_id_type: typeof auth.uid,
                  user_id_length: auth.uid ? auth.uid.toString().length : 0,
                });
                console.log(
                  "Background: 📥 REAL API response received:",
                  response
                );
                console.log("Background: 🔍 Response details:", {
                  success: response?.success,
                  errorCode: response?.errorCode,
                  dataStatus: response?.data?.status,
                  dataInfo: response?.data?.info,
                });

                // CRITICAL: Add to both session and persistent storage to prevent duplicates
                await addSubmittedUrl(urlKey);

                // Also add to persistent storage
                const persistentStorage = await chrome.storage.local.get([
                  "submittedUrls",
                ]);
                const persistentUrls = persistentStorage.submittedUrls || [];
                if (!persistentUrls.includes(urlKey)) {
                  persistentUrls.push(urlKey);
                  await chrome.storage.local.set({
                    submittedUrls: persistentUrls,
                  });
                }

                if (response && response.success && response.data) {
                  if (response.data.status === 1) {
                    // SUCCESS: Valid submission, award points
                    console.log(
                      "Background: 🎉 VALID SUBMISSION (status: 1) - AWARDING POINTS!"
                    );
                    console.log(
                      "Background: ✅ Content accepted by backend:",
                      response.data.info
                    );

                    // CRITICAL: Add to successful submissions to prevent future API calls for this URL
                    successfulSubmissions.add(urlKey);
                    console.log(
                      "Background: 🔒 URL marked as successfully submitted (status 1):",
                      urlKey
                    );

                    // Update submission status as success
                    await chrome.storage.local.set({
                      lastContentSubmission: {
                        status: "success",
                        timestamp: Date.now(),
                        payload: contentData,
                        response: response.data,
                        authUid: auth.uid,
                      },
                    });

                    // AWARD POINTS - Only for status: 1
                    const pointsToAdd = calculatePointsForContent(contentData);
                    console.log(
                      `Background: 💰 Awarding ${pointsToAdd} points for valid submission`
                    );
                    await updateLivePoints(
                      pointsToAdd,
                      "valid-content-submission"
                    );

                    console.log(
                      "Background: ✅ Content submission successful with points awarded"
                    );
                    apiResolve(true);
                  } else if (response.data.status === 0) {
                    // INVALID: Not accepted, don't award points
                    console.log(
                      "Background: ❌ INVALID SUBMISSION (status: 0) - NO POINTS AWARDED"
                    );
                    console.log(
                      "Background: ⚠️ Content rejected by backend:",
                      response.data.info
                    );

                    // CRITICAL: Check if this URL was already successfully submitted
                    if (successfulSubmissions.has(urlKey)) {
                      console.log(
                        "Background: 🚫 IGNORING status 0 response - URL already has status 1:",
                        urlKey
                      );
                      apiResolve(true); // Don't override previous success
                      return;
                    }

                    // Update submission status as invalid (but still successful API call)
                    await chrome.storage.local.set({
                      lastContentSubmission: {
                        status: "invalid-content",
                        timestamp: Date.now(),
                        payload: contentData,
                        response: response.data,
                        authUid: auth.uid,
                      },
                    });

                    console.log(
                      "Background: ⚠️ Content submission completed but no points awarded (invalid content)"
                    );
                    apiResolve(true); // Still return true to continue automation
                  } else {
                    // Unknown status
                    console.log(
                      "Background: ❓ Unknown response status:",
                      response.data.status
                    );

                    await chrome.storage.local.set({
                      lastContentSubmission: {
                        status: "unknown-response",
                        timestamp: Date.now(),
                        payload: contentData,
                        response: response.data,
                        authUid: auth.uid,
                      },
                    });

                    apiResolve(false);
                  }
                } else {
                  // API call failed
                  console.error(
                    "Background: ❌ API call failed or invalid response:",
                    response
                  );
                  console.error("Background: 🔍 Failed API response details:", {
                    success: response?.success,
                    errorCode: response?.errorCode,
                    errorMessage: response?.errorMessage,
                    data: response?.data,
                  });

                  await chrome.storage.local.set({
                    lastContentSubmission: {
                      status: "failed",
                      timestamp: Date.now(),
                      payload: contentData,
                      error: "API call failed",
                      response: response,
                      authUid: auth.uid,
                    },
                  });

                  apiResolve(false);
                }
              }
            );
          });
        } catch (error) {
          console.error("Background: ❌ Error in content submission:", error);

          // Update submission status
          await chrome.storage.local.set({
            lastContentSubmission: {
              status: "failed",
              timestamp: Date.now(),
              payload: contentData,
              error: error.message,
              authUid: (await chrome.storage.local.get(["auth"])).auth?.uid,
            },
          });

          return false;
        }
      })();

      // Store the promise to prevent duplicate submissions
      submissionPromises.set(urlKey, submissionPromise);

      // Execute the submission and clean up
      try {
        const result = await submissionPromise;
        return result;
      } finally {
        // Always clean up the promise, regardless of success or failure
        submissionPromises.delete(urlKey);
        console.log(
          "Background: 🧹 Cleaned up submission promise for:",
          urlKey
        );
      }
    } catch (error) {
      console.error("Background: ❌ Error in content submission:", error);

      // Clean up promise on error
      submissionPromises.delete(urlKey);

      // Update submission status
      await chrome.storage.local.set({
        lastContentSubmission: {
          status: "failed",
          timestamp: Date.now(),
          payload: contentData,
          error: error.message,
          authUid: (await chrome.storage.local.get(["auth"])).auth?.uid,
        },
      });

      return false;
    }
  }

  // Calculate points for content based on type
  function calculatePointsForContent(data) {
    // Basic points calculation - posts worth more than profiles
    return data.env === "2" ? 10 : 5;
  }

  // Trigger API fetch after all tasks completed
  async function triggerApiFetchAfterAllTasksCompleted() {
    console.log(
      "Background: 🔄 All tasks completed, triggering task refresh cycle directly"
    );

    try {
      // Execute the completion cycle directly with proper async handling
      console.log("Background: 🎯 EXECUTING FALLBACK TASK COMPLETION CYCLE");

      // Step 1: Call the completes API
      console.log("Background: 📤 Calling completes API (fallback)");
      const completesResult = await callCompletesAPI();
      console.log(
        "Background: 📋 Completes API result (fallback):",
        completesResult
      );

      // Step 2: Fetch new tasks
      console.log("Background: 🔄 Fetching new tasks (fallback)");
      console.log(
        "Background: 🔍 About to call fetchTasksFromBackend function"
      );

      const newTasks = await fetchTasksFromBackend();

      console.log("Background: 📥 fetchTasksFromBackend returned:", {
        result: newTasks,
        isArray: Array.isArray(newTasks),
        length: newTasks ? newTasks.length : "N/A",
        type: typeof newTasks,
      });

      if (newTasks && Array.isArray(newTasks) && newTasks.length > 0) {
        console.log(
          "Background: ✅ NEW TASKS AVAILABLE - CONTINUING AUTOMATION"
        );
        console.log("Background: 📋 New tasks received:", newTasks);

        // Step 3: Update automation state with new tasks
        automationState.webContentTasks = newTasks;
        automationState.currentTaskIndex = 0;
        automationState.isProcessingTask = false;

        // Save updated state
        await saveAutomationState("new-tasks-fetched-direct");

        console.log(
          "Background: ✅ New tasks loaded directly, restarting automation"
        );
        console.log("Background: 🆕 New task count:", newTasks.length);
        console.log(
          "Background: 🆕 New task URLs:",
          newTasks.map((t) => t.url)
        );

        // Step 4: Restart automation with new tasks
        setTimeout(() => {
          console.log(
            "Background: 🚀 Restarting automation with new tasks (direct)"
          );
          processNextWebContentTask();
        }, 2000);
      } else {
        console.log(
          "Background: ⏳ NO NEW TASKS AVAILABLE - KEEPING AUTOMATION ALIVE FOR RETRY"
        );
        console.log(
          "Background: 🔍 No tasks found, but continuing with fallback timer:",
          {
            newTasksIsNull: newTasks === null,
            newTasksIsUndefined: newTasks === undefined,
            newTasksIsNotArray: !Array.isArray(newTasks),
            newTasksLengthZero:
              newTasks && Array.isArray(newTasks) && newTasks.length === 0,
            actualValue: newTasks,
            fallbackStrategy: "Keep automation running for next check",
          }
        );

        // DO NOT STOP AUTOMATION - just log and let fallback timer continue
        console.log(
          "Background: 🔄 Automation continues running - fallback timer will retry in 30 seconds"
        );

        // Keep automation state as running so fallback timer continues
        // automationState.isRunning remains true
        // automationState.stopFlag remains false

        // Update completion time to reset the inactivity counter
        automationState.lastTaskCompletionTime = Date.now();
        await saveAutomationState("no-tasks-but-retrying");

        // Notify sidepanel about waiting state (not completion)
        safeSendMessage({
          id: "automation-waiting",
          message: "No new tasks available - waiting for next check",
          retryIn: 30,
        });
      }
    } catch (error) {
      console.log("Background: Error in fallback task refresh cycle:", error);
    }
  }

  async function t(s) {
    const { params: t, url: a } = s,
      n = await chrome.storage.local.get("auth");

    t.headers = Object.assign(t.headers, n.auth, {
      "x-client": `${e.name}@${e.version}`,
    });

    const o = await fetch(a, t),
      i = o.headers.get("content-type");

    let c = null;

    try {
      c =
        "application/json" === i
          ? await o.json()
          : (null == i ? void 0 : i.includes("text/"))
          ? await o.text()
          : await o.blob();
    } catch (parseError) {
      console.error(
        "Background API call: Failed to parse response:",
        parseError
      );
      // Try to get response as text
      try {
        c = await o.text();
      } catch (textError) {
        console.error(
          "Background API call: Could not get response as text:",
          textError
        );
      }
    }

    // 🔍 GLOBAL API RESPONSE LOGGER - Catch ALL responses including status: 1
    if (c && typeof c === "object") {
      // DEBUG: Log parse API responses to debug the status mismatch issue
      if (a && a.includes("/parse")) {
        console.log("🔍 RAW PARSE API RESPONSE:", {
          url: a,
          fullResponse: c,
          dataStatus: c.data?.status,
          dataInfo: c.data?.info,
          success: c.success,
          errorCode: c.errorCode,
          timestamp: new Date().toISOString(),
        });
      }

      // Only log critical errors or unexpected responses for other APIs
      if (c.errorCode && c.errorCode !== 0 && !a.includes("/parse")) {
        console.log("🚨 API ERROR RESPONSE:", {
          url: a,
          errorCode: c.errorCode,
          errorMessage: c.errorMessage,
          success: c.success,
        });
      }
    }

    return c;
  }
  async function a(e, s) {
    const { params: a, url: n, cache: o, auth: i = !0 } = e;
    if (!(await chrome.storage.local.get("auth")).auth && i)
      return void s({
        errorCode: 1003,
        errorMessage: "Invalid auth token!",
        success: !1,
      });

    // CRITICAL: Add request deduplication at API wrapper level
    const requestKey = JSON.stringify({
      url: n,
      method: a?.method || "GET",
      body: a?.body || "",
      timestamp: Math.floor(Date.now() / 1000), // Group requests within same second
    });

    // CRITICAL: Block UI-triggered Parse API calls during content submission
    // Only block UI calls, never block automation calls
    if (
      n === "https://spider.codatta.io/api/app/ins/parse" &&
      a?.method === "POST"
    ) {
      const requestBody = a?.body ? JSON.parse(a.body) : {};
      const submissionUrl = requestBody?.url;
      const isAutomationCall =
        e?.context === "automation" || e?.fromAutomation === true;

      if (
        submissionUrl &&
        activeContentSubmissions.has(submissionUrl) &&
        !isAutomationCall
      ) {
        console.log(
          "🚫 BLOCKING UI-TRIGGERED Parse API call during content submission:",
          submissionUrl
        );
        console.log(
          "🔄 Content submission already in progress, ignoring UI request"
        );
        s({
          success: false,
          errorMessage: "Content submission already in progress",
        });
        return;
      }

      if (isAutomationCall) {
        console.log("✅ ALLOWING AUTOMATION Parse API call:", submissionUrl);
      }
    }

    console.log("🔍 API WRAPPER DEDUPLICATION CHECK:", {
      url: n,
      method: a?.method || "GET",
      requestKey: requestKey.substring(0, 100) + "...",
      isActive: activeApiRequests.has(requestKey),
      activeRequestsCount: activeApiRequests.size,
      isAutomationCall:
        e?.context === "automation" || e?.fromAutomation === true,
    });

    // Check if this exact request is already in progress
    // For automation calls, allow them to proceed even if there are duplicates
    const isAutomationCall =
      e?.context === "automation" || e?.fromAutomation === true;

    if (activeApiRequests.has(requestKey) && !isAutomationCall) {
      console.log("🚫 DUPLICATE API REQUEST BLOCKED:", n);
      console.log("🔄 Reusing existing API request result");

      // Get the existing request promise
      const existingRequest = activeApiRequests.get(requestKey);

      // Reuse the existing request result
      try {
        const result = await existingRequest;
        console.log("✅ Reused existing API request result:", n);
        s(result);
        return;
      } catch (error) {
        console.log("❌ Existing API request failed:", error);
        s({ success: false, error: error.message });
        return;
      }
    }

    if (isAutomationCall) {
      console.log(
        "✅ ALLOWING AUTOMATION API call (bypassing deduplication):",
        n
      );
    }

    const c = `${a.method}:${n}`,
      r = await chrome.storage.local.get(c);
    if (o && r[c]) {
      console.log("🔍 Using cached result for:", n);
      s(r[c]);

      // Still make the request in background to update cache
      const requestPromise = t(e).then(async (result) => {
        await chrome.storage.local.set({ [c]: result });
        return result;
      });

      // Store promise briefly to prevent duplicates
      activeApiRequests.set(requestKey, requestPromise);
      setTimeout(() => activeApiRequests.delete(requestKey), 2000);
    } else {
      console.log("🌐 Making new API request to:", n);

      // Create new request promise with deduplication
      const requestPromise = t(e);

      // Store the request promise to prevent duplicates
      activeApiRequests.set(requestKey, requestPromise);

      // Execute the request and cleanup
      try {
        const result = await requestPromise;
        s(result);

        // Store in cache if caching is enabled
        if (o) {
          chrome.storage.local.set({ [c]: result });
        }
      } catch (error) {
        console.log("❌ API request failed:", error);
        s({ success: false, error: error.message });
      } finally {
        // Clean up after a short delay to allow for immediate duplicates
        setTimeout(() => {
          activeApiRequests.delete(requestKey);
          console.log("🧹 Cleaned up API request cache for:", n);
        }, 2000);
      }
    }
  }

  // Automation state variables
  let automationState = {
    isRunning: false,
    currentTabId: null,
    stopFlag: false,
    completedCount: 0,
    environment: "pro",
    pageInfo: null,
    intervalRef: null,
    sidepanelRegistered: false, // Track if sidepanel registered automation
    fallbackTimerId: null,
    lastTaskCompletionTime: null,
    pendingNavigations: new Set(),
    urlProcessingTimeouts: new Map(),
    processedUrls: new Set(),
    completedTasks: new Set(),
    // NEW: WebContent automation properties
    webContentTasks: [],
    currentTaskIndex: 0,
    webContentTabId: null,
    activeWebContentId: null,
    webContentPageType: "3",
    webContentHtmlType: 1,
    webContentTimeout: 5000,
    pageType: "3", // Default to profile
    htmlType: 1,
    timeout: 5000,
    isProcessingTask: false, // Prevent multiple simultaneous tasks
    isProcessingWebContentTask: false, // Prevent duplicate WebContent task processing
  };

  // ROBUST FALLBACK MECHANISM FOR CUSTOM CHROMIUM
  // This mechanism ensures automation continues even when chrome.tabs.onUpdated doesn't work
  function startAutomationFallbackTimer() {
    console.log(
      "Background: Starting automation fallback timer (chrome.tabs.onUpdated workaround)"
    );

    // Clear any existing fallback timer
    if (automationState.fallbackTimerId) {
      clearInterval(automationState.fallbackTimerId);
    }

    // Set up a timer that checks automation state every 30 seconds
    automationState.fallbackTimerId = setInterval(async () => {
      if (!automationState.isRunning || automationState.stopFlag) {
        console.log(
          "Background: Fallback timer - automation not running, clearing timer"
        );
        clearInterval(automationState.fallbackTimerId);
        automationState.fallbackTimerId = null;
        return;
      }

      const now = Date.now();
      const timeSinceLastActivity = automationState.lastTaskCompletionTime
        ? now - automationState.lastTaskCompletionTime
        : 0;

      console.log("Background: Fallback timer check:", {
        isRunning: automationState.isRunning,
        timeSinceLastActivity: timeSinceLastActivity,
        pendingNavigations: automationState.pendingNavigations.size,
        processedUrls: automationState.processedUrls.size,
        completedTasks: automationState.completedTasks.size,
        timestamp: new Date().toISOString(),
      });

      // If no activity for 45 seconds and we have pending navigations, assume they're stuck
      if (
        timeSinceLastActivity > 45000 &&
        automationState.pendingNavigations.size > 0
      ) {
        console.log(
          "Background: Fallback timer - detected stuck navigations, triggering completion"
        );

        // Clear all pending navigations and their timeouts
        automationState.pendingNavigations.forEach((navId) => {
          if (automationState.urlProcessingTimeouts.has(navId)) {
            clearTimeout(automationState.urlProcessingTimeouts.get(navId));
            automationState.urlProcessingTimeouts.delete(navId);
          }
        });
        automationState.pendingNavigations.clear();

        // Trigger API fetch for new tasks
        await triggerApiFetchAfterAllTasksCompleted();
      }

      // If no activity for 60 seconds, force API fetch regardless
      else if (timeSinceLastActivity > 60000) {
        console.log(
          "Background: Fallback timer - no activity for 60s, forcing API fetch"
        );
        await triggerApiFetchAfterAllTasksCompleted();
      }
    }, 30000); // Check every 30 seconds
  }

  function stopAutomationFallbackTimer() {
    console.log("Background: Stopping automation fallback timer");
    if (automationState.fallbackTimerId) {
      clearInterval(automationState.fallbackTimerId);
      automationState.fallbackTimerId = null;
    }

    // Clear all URL processing timeouts
    automationState.urlProcessingTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    automationState.urlProcessingTimeouts.clear();
    automationState.pendingNavigations.clear();
  }

  function trackUrlProcessing(url, tabId) {
    const navId = `${tabId}-${url}`;
    console.log("Background: Tracking URL processing:", navId);

    automationState.pendingNavigations.add(navId);
    automationState.processedUrls.add(url);

    // Set a timeout for this specific URL processing
    const timeoutId = setTimeout(() => {
      console.log("Background: URL processing timeout for:", navId);
      automationState.pendingNavigations.delete(navId);
      automationState.urlProcessingTimeouts.delete(navId);

      // If this was the last pending navigation, trigger API fetch
      if (automationState.pendingNavigations.size === 0) {
        console.log(
          "Background: Last URL timeout completed, triggering API fetch"
        );
        triggerApiFetchAfterAllTasksCompleted();
      }
    }, 30000); // 30 second timeout per URL

    automationState.urlProcessingTimeouts.set(navId, timeoutId);
  }

  function markUrlProcessingComplete(url, tabId, taskIndex) {
    const navId = `${tabId}-${url}`;
    console.log("Background: Marking URL processing complete:", navId);

    automationState.pendingNavigations.delete(navId);
    automationState.completedTasks.add(taskIndex);
    automationState.lastTaskCompletionTime = Date.now();

    if (automationState.urlProcessingTimeouts.has(navId)) {
      clearTimeout(automationState.urlProcessingTimeouts.get(navId));
      automationState.urlProcessingTimeouts.delete(navId);
    }
  }

  // Helper function to notify popup/UI of automation state changes
  function notifyAutomationStateChange(eventType, additionalData = {}) {
    try {
      chrome.runtime.sendMessage({
        id: eventType,
        data: {
          isRunning: automationState.isRunning,
          completedCount: automationState.completedCount,
          tabId: automationState.currentTabId,
          ...additionalData,
        },
      });
      console.log(`Background: Sent ${eventType} notification to popup/UI`);
    } catch (error) {
      // Handle "receiving end does not exist" gracefully - extension might be closed
      if (
        error.message &&
        error.message.includes("Receiving end does not exist")
      ) {
        console.log(
          `Background: UI not available for ${eventType} notification (extension may be closed) - automation continues in background`
        );
      } else {
        console.log(
          `Background: Could not send ${eventType} notification:`,
          error.message || error
        );
      }
    }
  }

  // Message handler functions for automation
  async function handleInsReady(message, sender, sendResponse) {
    console.log(
      "Background: Received ins-ready message from tab:",
      sender.tab?.id
    );

    // If sidepanel registered automation, background takes over completely
    if (automationState.sidepanelRegistered) {
      console.log(
        "Background: Sidepanel registered automation - background taking over ins-ready"
      );
      // Continue with background automation injection
    } else if (!automationState.isRunning) {
      console.log(
        "Background: No automation registered, letting sidepanel handle ins-ready"
      );
      sendResponse({ success: true, message: "Handled by sidepanel" });
      return;
    }

    if (automationState.stopFlag) {
      console.log("Background: Automation stopped, ignoring ins-ready");
      sendResponse({ success: false, message: "Automation stopped" });
      return;
    }

    const tabId = sender.tab?.id || automationState.currentTabId;
    if (!tabId) {
      console.log("Background: No tab ID available for automation");
      sendResponse({ success: false, message: "No tab ID" });
      return;
    }

    try {
      // Get automation config from storage
      const storage = await chrome.storage.local.get([
        "automationConfig",
        "userProfile",
      ]);
      const config = storage.automationConfig || {};
      const userProfile = storage.userProfile || {};

      console.log(
        "Background: Taking over automation from sidepanel with config:",
        config
      );

      // NEW: Start WebContent automation instead of injecting scripts
      console.log("Background: Starting WebContent automation");
      await startWebContentAutomation(tabId, config, userProfile);

      // Notify sidepanel about readiness if it exists
      try {
        chrome.runtime.sendMessage({
          id: "ins-ready-background",
          data: { tabId, config },
        });
      } catch (error) {
        console.log(
          "Background: Sidepanel not available, continuing automation"
        );
      }

      sendResponse({
        success: true,
        message: "Background WebContent automation started",
      });
    } catch (error) {
      console.error("Background: Error in handleInsReady:", error);
      sendResponse({ success: false, message: error.message });
    }
  }

  // NEW: WebContent automation starter
  async function startWebContentAutomation(tabId, config, userProfile) {
    console.log("Background: Starting WebContent automation");
    console.log("Background: Config tasks:", config.tasks);

    // CRITICAL FIX: Clear submitted URLs to allow fresh submissions in new WebContent automation run
    await chrome.storage.local.set({ submittedUrlsSession: [] });
    submissionPromises.clear();
    successfulApiResults.clear();
    processedUrls.clear();
    currentlyProcessing.clear();

    // CRITICAL: Clear API request deduplication caches
    activeApiRequests.clear();
    submissionAttempts.clear();
    activeWebContentTasks.clear();
    completedWebContentTasks.clear();
    successfulSubmissions.clear();
    activeContentSubmissions.clear();

    console.log(
      "Background: 🔄 Cleared ALL submission tracking and API deduplication for WebContent automation"
    );

    // If no tasks are provided, try to get them
    if (!config.tasks || config.tasks.length === 0) {
      console.log(
        "Background: No tasks found in config, trying to fetch from sidepanel API"
      );
      console.log("Background: Full config:", config);

      // Try to get tasks by sending a message to sidepanel
      try {
        const response = await chrome.runtime.sendMessage({
          id: "get-tasks-for-background",
          pageType: config.page_type,
        });

        if (response && response.tasks && response.tasks.length > 0) {
          console.log(
            "Background: Received tasks from sidepanel:",
            response.tasks
          );
          config.tasks = response.tasks;
        } else {
          console.log(
            "Background: ⏳ No tasks received from sidepanel - keeping automation alive for fallback timer"
          );

          // Don't stop automation - just ensure fallback timer is running
          console.log(
            "Background: 🔄 No new tasks available but automation will continue via fallback timer"
          );

          // Ensure automation state stays active for fallback timer
          automationState.isRunning = true;
          automationState.stopFlag = false;
          automationState.lastTaskCompletionTime = Date.now();

          // Ensure fallback timer is active
          if (!automationState.fallbackTimerId) {
            console.log(
              "Background: Starting fallback timer since no tasks but automation should continue"
            );
            startAutomationFallbackTimer();
          }

          // Save the state
          await saveAutomationState("no-tasks-but-waiting");

          console.log(
            "Background: Automation will continue running - fallback timer will check for new tasks"
          );
          return; // Don't proceed with task processing, but keep automation alive
        }
      } catch (error) {
        console.log("Background: Could not get tasks from sidepanel:", error);

        // Don't stop automation on error - keep it alive for retry
        console.log(
          "Background: ⏳ Error getting tasks but keeping automation alive for fallback timer retry"
        );

        // Ensure automation state stays active for fallback timer
        automationState.isRunning = true;
        automationState.stopFlag = false;
        automationState.lastTaskCompletionTime = Date.now();

        // Ensure fallback timer is active
        if (!automationState.fallbackTimerId) {
          console.log(
            "Background: Starting fallback timer due to task fetch error"
          );
          startAutomationFallbackTimer();
        }

        await saveAutomationState("error-but-waiting");
        return; // Don't proceed but keep automation alive
        return;
      }
    }

    // Store the automation state for WebContent processing
    automationState.webContentTasks = config.tasks || [];
    automationState.currentTaskIndex = 0;
    automationState.webContentTabId = tabId;
    automationState.isRunning = true;
    automationState.stopFlag = false;
    automationState.isProcessingTask = false;
    automationState.isProcessingWebContentTask = false; // Reset WebContent task processing flag

    // Save automation state to storage for persistence
    await chrome.storage.local.set({ automationState: automationState });
    console.log("Background: 💾 Saved automation state to storage:", {
      isRunning: automationState.isRunning,
      stopFlag: automationState.stopFlag,
      tasksCount: automationState.webContentTasks.length,
    });

    // Store automation configuration for content script
    automationState.webContentPageType =
      config.page_type === "POST" ? "2" : "3";
    automationState.webContentHtmlType = config.get_html_type || 1;

    // Calculate timeout
    const profileTimeout =
      Number(userProfile.profile_timeout || 5000) +
      Math.floor(6000 + Math.random() * 4000);
    const postTimeout =
      Number(userProfile.post_timeout || 5000) +
      Math.floor(6000 + Math.random() * 4000);
    automationState.webContentTimeout =
      config.page_type === "POST" ? postTimeout : profileTimeout;

    console.log("Background: WebContent automation initialized:", {
      tasks: automationState.webContentTasks.length,
      pageType: automationState.webContentPageType,
      htmlType: automationState.webContentHtmlType,
      timeout: automationState.webContentTimeout,
    });

    console.log(
      "Background: About to call processNextWebContentTask with state:",
      {
        isRunning: automationState.isRunning,
        stopFlag: automationState.stopFlag,
        isProcessingTask: automationState.isProcessingTask,
        tasksLength: automationState.webContentTasks.length,
      }
    );

    // Start processing the first task with WebContent
    if (automationState.webContentTasks.length > 0) {
      processNextWebContentTask();
    } else {
      console.log(
        "Background: ⏳ No tasks to process with WebContent - keeping automation alive for fallback timer"
      );

      // Ensure automation state stays active even with no tasks
      automationState.isRunning = true;
      automationState.stopFlag = false;
      automationState.lastTaskCompletionTime = Date.now();

      // Ensure fallback timer is running to check for new tasks
      if (!automationState.fallbackTimerId) {
        console.log(
          "Background: Starting fallback timer since no tasks but automation should continue"
        );
        startAutomationFallbackTimer();
      }

      console.log(
        "Background: 🔄 Automation remains active - fallback timer will check for new tasks in 30 seconds"
      );
    }
  }

  // NEW: Process tasks using WebContent
  async function processNextWebContentTask() {
    console.log("Background: 🔄 === processNextWebContentTask ENTRY ===");
    console.log(
      "Background: processNextWebContentTask called - checking automation state:",
      {
        stopFlag: automationState.stopFlag,
        isRunning: automationState.isRunning,
        isProcessingTask: automationState.isProcessingTask,
        currentTaskIndex: automationState.currentTaskIndex,
        totalTasks: automationState.webContentTasks.length,
        timestamp: new Date().toISOString(),
      }
    );

    // CRITICAL CHECK: Debug why automation might be stopping
    if (automationState.stopFlag) {
      console.log("Background: ❌ STOPPING - stopFlag is TRUE");
      console.log(
        "Background: 🔍 stopFlag was set to true - automation halted"
      );
      return;
    }

    if (!automationState.isRunning) {
      console.log("Background: ❌ STOPPING - isRunning is FALSE");
      console.log(
        "Background: 🔍 isRunning was set to false - automation halted"
      );
      return;
    }

    console.log("Background: ✅ Automation state checks passed, continuing...");

    if (automationState.stopFlag || !automationState.isRunning) {
      console.log("Background: WebContent automation stopped due to flags:", {
        stopFlag: automationState.stopFlag,
        isRunning: automationState.isRunning,
      });
      return;
    }

    // Prevent multiple simultaneous task processing
    if (automationState.isProcessingTask) {
      console.log("Background: Task already in progress, skipping");
      return;
    }

    if (
      automationState.currentTaskIndex >= automationState.webContentTasks.length
    ) {
      console.log(
        "Background: All WebContent tasks completed! Processed",
        automationState.currentTaskIndex,
        "out of",
        automationState.webContentTasks.length,
        "tasks"
      );

      // Try to get more tasks
      console.log(
        "Background: Sending update-completed-link-list to fetch more tasks"
      );
      try {
        chrome.runtime.sendMessage({ id: "update-completed-link-list" });
      } catch (error) {
        console.log("Background: Could not request more tasks:", error);
      }
      return;
    }

    // Mark task as being processed
    automationState.isProcessingTask = true;

    const task =
      automationState.webContentTasks[automationState.currentTaskIndex];
    console.log(
      "Background: Processing WebContent task",
      automationState.currentTaskIndex + 1,
      "of",
      automationState.webContentTasks.length,
      ":",
      task
    );

    // ENHANCED DEDUPLICATION: Check if task URL was already processed or is being processed
    const taskUrlKey = task.url;

    if (completedWebContentTasks.has(taskUrlKey)) {
      console.log(
        "Background: 🔄 WebContent task URL already completed, skipping:",
        taskUrlKey
      );
      automationState.currentTaskIndex++;
      automationState.isProcessingTask = false;
      setTimeout(() => processNextWebContentTask(), 100);
      return;
    }

    if (activeWebContentTasks.has(taskUrlKey)) {
      console.log(
        "Background: ⚠️ WebContent task URL already being processed, skipping:",
        taskUrlKey
      );
      automationState.currentTaskIndex++;
      automationState.isProcessingTask = false;
      setTimeout(() => processNextWebContentTask(), 100);
      return;
    }

    // Mark this URL as being actively processed
    activeWebContentTasks.set(taskUrlKey, {
      taskIndex: automationState.currentTaskIndex,
      startTime: Date.now(),
      task: task,
    });

    console.log("Background: 🔄 Marked WebContent task as active:", taskUrlKey);

    const webContentId = 1; // Hardcoded as requested

    // Use WebContent API to open the task URL
    chrome.wootz.createBackgroundWebContents(
      webContentId,
      task.url,
      (result) => {
        console.log("Background: WebContent creation result for task:", result);

        if (result.success) {
          console.log(
            "Background: WebContent created successfully for task URL:",
            task.url
          );

          // Wait for WebContent to load, then send task processing message
          setTimeout(() => {
            console.log(
              "Background: WebContent loaded, sending task processing command"
            );

            // Use WebContent messaging API to communicate with the content script
            chrome.tabs.sendMessage(
              webContentId,
              {
                id: "start-task-processing",
                pageType: automationState.webContentPageType || "3",
                htmlType: automationState.webContentHtmlType || 1,
                timeout: automationState.webContentTimeout || 5000,
                taskIndex: automationState.currentTaskIndex,
                task: task,
              },
              (response) => {
                console.log(
                  "Background: WebContent task start response:",
                  response
                );

                if (response && response.success) {
                  console.log(
                    "Background: WebContent script ready, starting content processing"
                  );

                  // Wait a bit more then process the task
                  setTimeout(() => {
                    processCurrentWebContentTask(webContentId);
                  }, 2000);
                } else {
                  console.log(
                    "Background: Failed to start task processing in WebContent"
                  );
                  // Release the processing lock and move to next task
                  automationState.isProcessingTask = false;
                  moveToNextWebContentTask();
                }
              }
            );
          }, 3000); // Wait 3 seconds for WebContent to load
        } else {
          console.error(
            "Background: Failed to create WebContent for task:",
            result.error
          );

          // Release the processing lock and skip this task
          automationState.isProcessingTask = false;
          moveToNextWebContentTask();
        }
      }
    );
  }

  // Process current task in WebContent
  async function processCurrentWebContentTask(webContentId) {
    console.log(
      "Background: Processing current task in WebContent:",
      webContentId
    );

    // CRITICAL FIX: Prevent duplicate calls to the same task
    if (automationState.isProcessingWebContentTask) {
      console.log(
        "Background: ⚠️ WebContent task already being processed, skipping duplicate call"
      );
      return;
    }

    // Set flag to prevent duplicate processing
    automationState.isProcessingWebContentTask = true;

    // Add timeout to reset flag in case content script doesn't respond
    const timeoutId = setTimeout(() => {
      console.log(
        "Background: ⏰ WebContent task processing timeout - resetting flag"
      );
      automationState.isProcessingWebContentTask = false;
      moveToNextWebContentTask();
    }, 30000); // 30 second timeout

    // Send message to content script to process the current task
    chrome.tabs.sendMessage(
      webContentId,
      {
        id: "process-current-task",
        taskIndex: automationState.currentTaskIndex,
      },
      (response) => {
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);

        console.log(
          "Background: WebContent task processing response:",
          response
        );

        // CRITICAL FIX: Always reset the WebContent processing flag
        automationState.isProcessingWebContentTask = false;

        if (response && response.success) {
          console.log("Background: Task processed successfully in WebContent");

          // Wait 5 seconds as requested, then move to next task
          setTimeout(() => {
            moveToNextWebContentTask();
          }, 5000);
        } else {
          console.log(
            "Background: Failed to process task in WebContent, moving to next"
          );
          moveToNextWebContentTask();
        }
      }
    );
  }

  // Move to next WebContent task
  function moveToNextWebContentTask() {
    // Prevent duplicate calls by checking if processing is already released
    if (!automationState.isProcessingTask) {
      console.log(
        "Background: Task already processed, skipping moveToNextWebContentTask"
      );
      return;
    }

    // DEDUPLICATION CLEANUP: Get current task URL before moving to next
    const currentTask =
      automationState.webContentTasks[automationState.currentTaskIndex];
    if (currentTask) {
      const taskUrlKey = currentTask.url;

      // Move from active to completed
      if (activeWebContentTasks.has(taskUrlKey)) {
        activeWebContentTasks.delete(taskUrlKey);
        completedWebContentTasks.add(taskUrlKey);
        console.log(
          "Background: 📝 WebContent task marked as completed:",
          taskUrlKey
        );
      }
    }

    // Release the processing lock first
    automationState.isProcessingTask = false;

    // CRITICAL FIX: Also reset WebContent task processing flag
    automationState.isProcessingWebContentTask = false;

    automationState.currentTaskIndex++;

    console.log("Background: Moving to next WebContent task:", {
      newTaskIndex: automationState.currentTaskIndex,
      totalTasks: automationState.webContentTasks.length,
      isStillRunning: automationState.isRunning,
      stopFlag: automationState.stopFlag,
    });

    // Process next task after a short delay
    setTimeout(() => {
      processNextWebContentTask();
    }, 1000);
  }

  // Handle Instagram automation ready message from content script
  async function handleInstagramAutomationReady(message, sender, sendResponse) {
    console.log("Background: Instagram automation content script is ready");

    // Fix: Use hardcoded webContentId since sender.tab might be undefined for WebContent
    const webContentId = 1; // Hardcoded WebContent ID
    const effectiveTabId = sender.tab?.id || webContentId;

    console.log("Background: Content script location:", {
      url: message.url,
      title: message.title,
      senderId: sender.id,
      senderTabId: sender.tab?.id,
      webContentsId: webContentId,
      effectiveTabId: effectiveTabId,
    });

    // Store the WebContent ID for future messaging
    automationState.activeWebContentId = webContentId;
    console.log(
      "Background: Stored active WebContent ID:",
      automationState.activeWebContentId
    );

    // If we have pending tasks and automation is running, start processing
    if (
      automationState.isRunning &&
      automationState.webContentTasks.length > 0
    ) {
      console.log(
        "Background: Starting WebContent task processing since content script is ready"
      );

      // Send a message to start task processing
      setTimeout(() => {
        chrome.tabs.sendMessage(
          webContentId,
          {
            id: "start-task-processing",
            pageType: automationState.webContentPageType || "3",
            htmlType: automationState.webContentHtmlType || 1,
            timeout: automationState.webContentTimeout || 5000,
          },
          (response) => {
            console.log(
              "Background: Task processing start response:",
              response
            );

            if (response && response.success) {
              console.log("Background: WebContent task processing initialized");

              // Start processing tasks after a short delay
              setTimeout(() => {
                processCurrentWebContentTask(webContentId);
              }, 2000);
            } else {
              console.log(
                "Background: Failed to initialize WebContent task processing"
              );
            }
          }
        );
      }, 1000);
    }

    sendResponse({
      success: true,
      message: "Instagram automation content script registered",
      webContentId: webContentId,
    });
  }

  // Automation script injection functions
  async function injectSearchAutomation(tabId, config, userProfile) {
    console.log("Background: Injecting search automation script");

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      args: [
        automationState.environment,
        config.load_comment_count || 5,
        config.tag?.explore_max_page_count || 10,
        config.tag?.explore_page_timeout || 5000,
        config.tag?.explore_post_count || 50,
        config.get_html_type || 1,
      ],
      func: (
        environment,
        loadCommentCount,
        maxPageCount,
        pageTimeout,
        postCount,
        htmlType
      ) => {
        // Search automation script - navigate to tag URL and process posts
        const main = document.querySelector("main");
        if (!main) {
          return chrome.runtime.sendMessage({ id: "crawl-error" });
        }

        chrome.runtime.onMessage.addListener(
          (message, sender, sendResponse) => {
            if (message.id === "parse-web-result") {
              processWebResults(message.list);
            } else if (message.id === "pause-crawl") {
              window.location.reload();
            }
          }
        );

        let processedCount = 0;
        let currentPage = 0;

        async function processWebResults(linkList) {
          if (linkList.length > 0) {
            const [validLinks, urls] = filterValidLinks(linkList);

            // Click through valid links and extract content
            for (
              let i = 0;
              i < validLinks.length && processedCount < postCount;
              i++
            ) {
              validLinks[i].click();
              await wait(3000 + Math.floor(Math.random() * 1000));
              await loadAndExtractPost(0, loadCommentCount, environment);
            }
          }

          // Continue to next page if needed
          if (currentPage < maxPageCount && processedCount < postCount) {
            const closeButton =
              document.querySelector('[aria-label="Close"]') ||
              document.querySelector('[aria-label="关闭"]');
            if (closeButton) {
              closeButton.parentNode.parentNode.click();
              await wait(2000);
            }

            window.scrollBy(0, 2000);
            await wait(pageTimeout);
            currentPage += 1;
            await scanForNewPosts();
          } else {
            await wait(2000);
            chrome.runtime.sendMessage({ id: "update-completed-link-list" });
          }
        }

        async function scanForNewPosts() {
          const postElements = getPostElements();
          chrome.runtime.sendMessage({
            id: "parse-web",
            data: postElements,
          });
        }

        function filterValidLinks(completedList = []) {
          const validLinks = [];
          const urls = [];
          const allLinks = main.getElementsByTagName("a");

          if (allLinks.length > 0) {
            for (let i = 0; i < allLinks.length; i++) {
              const link = allLinks[i];
              const url = link.href;
              if (
                completedList.length > 0 &&
                completedList.findIndex((item) => item.url === url) > -1
              ) {
                validLinks.push(link);
                urls.push(url);
              }
            }
          }
          return [validLinks, urls];
        }

        async function loadAndExtractPost(currentComments, maxComments, env) {
          let loadMoreButton =
            document.querySelector('[aria-label="Load more comments"]') ||
            document.querySelector('[aria-label="加载更多评论"]');

          while (currentComments < maxComments && loadMoreButton) {
            currentComments += 1;

            if (loadMoreButton && maxComments > currentComments) {
              const parent = loadMoreButton.parentNode?.parentNode;
              if (parent) parent.click();

              const waitTime = 3000 + Math.floor(Math.random() * 7000);
              await wait(waitTime);

              loadMoreButton =
                document.querySelector('[aria-label="Load more comments"]') ||
                document.querySelector('[aria-label="加载更多评论"]');
            }
          }

          await extractAndSaveContent(env);
        }

        async function extractAndSaveContent(env) {
          const content = extractPageContent();
          processedCount += 1;

          await chrome.runtime.sendMessage({
            id: "save-crawl-content",
            data: { env: env, ...content },
          });

          await wait(Math.floor(Math.random() * 40000));
        }

        function extractPageContent() {
          return {
            title: document.title,
            content: getPageHTML(htmlType),
            url: document.URL,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
        }

        function getPageHTML(htmlType) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(
            document.documentElement.outerHTML,
            "text/html"
          );

          if (htmlType !== 4 && htmlType !== 2) {
            doc.querySelectorAll("style").forEach((el) => el.remove());
          }
          if (htmlType !== 4 && htmlType !== 3) {
            doc.querySelectorAll("script").forEach((el) => el.remove());
          }

          return doc.documentElement.outerHTML;
        }

        function getPostElements() {
          return {
            title: document.title,
            content: getPageHTML(htmlType),
            url: document.URL,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
        }

        function wait(ms) {
          return new Promise((resolve) => setTimeout(resolve, ms));
        }

        // Start the process
        scanForNewPosts();
      },
    });
  }

  async function injectTaskAutomation(tabId, config, userProfile) {
    console.log("Background: Injecting task automation script");
    console.log("Background: Config tasks:", config.tasks);

    // If no tasks are provided, this might be a configuration issue
    if (!config.tasks || config.tasks.length === 0) {
      console.log(
        "Background: No tasks found in config, trying to fetch from sidepanel API"
      );
      console.log("Background: Full config:", config);

      // Try to get tasks by sending a message to sidepanel
      try {
        const response = await chrome.runtime.sendMessage({
          id: "get-tasks-for-background",
          pageType: config.page_type,
        });

        if (response && response.tasks && response.tasks.length > 0) {
          console.log(
            "Background: Received tasks from sidepanel:",
            response.tasks
          );
          config.tasks = response.tasks;
        } else {
          console.log(
            "Background: No tasks received from sidepanel, automation cannot proceed"
          );
          chrome.runtime.sendMessage({
            id: "crawl-error",
            message: "No tasks available for automation",
          });
          return;
        }
      } catch (error) {
        console.log("Background: Could not get tasks from sidepanel:", error);
        chrome.runtime.sendMessage({
          id: "crawl-error",
          message: "Failed to get tasks for automation",
        });
        return;
      }
    }

    const profileTimeout =
      Number(userProfile.profile_timeout || 5000) +
      Math.floor(6000 + Math.random() * 4000);
    const postTimeout =
      Number(userProfile.post_timeout || 5000) +
      Math.floor(6000 + Math.random() * 4000);
    const pageType = config.page_type === "POST" ? "2" : "3";

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      args: [
        tabId,
        postTimeout,
        profileTimeout,
        config.tasks || [],
        pageType,
        config.get_html_type || 1,
      ],
      func: (tabId, postTimeout, profileTimeout, tasks, pageType, htmlType) => {
        console.log("Background automation script injected, tasks:", tasks);

        if (!tasks || tasks.length === 0) {
          console.log("Task list is empty");
          chrome.runtime.sendMessage({
            id: "crawl-error",
            message: "No tasks available",
          });
          return;
        }

        let currentTaskIndex = 0;
        let isPaused = false; // Flag to track if automation is paused

        // Start processing tasks
        processNextTask();

        async function processNextTask() {
          if (isPaused) {
            console.log(
              "TASK AUTOMATION: Automation paused, stopping task processing"
            );
            return;
          }

          if (currentTaskIndex >= tasks.length) {
            console.log(
              "TASK AUTOMATION: All tasks completed! Processed",
              currentTaskIndex,
              "out of",
              tasks.length,
              "tasks"
            );
            console.log(
              "TASK AUTOMATION: Sending update-completed-link-list to fetch more tasks"
            );
            await wait(2000);
            chrome.runtime.sendMessage({ id: "update-completed-link-list" });
            return;
          }

          const task = tasks[currentTaskIndex];
          console.log(
            "TASK AUTOMATION: Processing task",
            currentTaskIndex + 1,
            "of",
            tasks.length,
            ":",
            task
          );
          console.log("TASK AUTOMATION: Task details:", {
            taskIndex: currentTaskIndex,
            totalTasks: tasks.length,
            taskUrl: task.url,
            taskData: task,
            timestamp: new Date().toISOString(),
            pageType: pageType,
            currentLocation: window.location.href,
          });

          // Request background to navigate to next URL
          console.log(
            "TASK AUTOMATION: Requesting navigation to task URL:",
            task.url
          );
          chrome.runtime.sendMessage({
            id: "navigate-to-url",
            url: task.url,
            taskIndex: currentTaskIndex,
          });

          console.log(
            "TASK AUTOMATION: Navigation request sent, incrementing task index"
          );
          currentTaskIndex++;
        }

        // Listen for navigation completion and pause signals
        chrome.runtime.onMessage.addListener(
          async (message, sender, sendResponse) => {
            if (message.id === "navigation-complete") {
              console.log(
                "TASK AUTOMATION: Navigation complete notification received"
              );
              console.log("TASK AUTOMATION: Navigation complete details:", {
                currentTaskIndex: currentTaskIndex - 1, // -1 because we already incremented
                currentUrl: window.location.href,
                pageType: pageType,
                timestamp: new Date().toISOString(),
              });
              console.log(
                "TASK AUTOMATION: Starting content extraction process"
              );

              await wait(Math.floor(2000 + Math.random() * 2000));

              if (pageType === "2") {
                console.log(
                  "TASK AUTOMATION: Extracting POST content (pageType 2)"
                );
                await extractPostContent(htmlType);
              } else {
                console.log(
                  "TASK AUTOMATION: Extracting PROFILE content (pageType 3)"
                );
                await extractProfileContent(htmlType);
              }

              console.log(
                "TASK AUTOMATION: Content extraction completed, scheduling next task"
              );
              const nextTaskDelay =
                pageType === "2" ? postTimeout + 5000 : profileTimeout + 3000;
              console.log(
                "TASK AUTOMATION: Next task delay:",
                nextTaskDelay,
                "ms"
              );

              // Process next task after a delay
              setTimeout(() => {
                console.log(
                  "TASK AUTOMATION: Delay completed, processing next task"
                );
                processNextTask();
              }, nextTaskDelay);

              sendResponse({ success: true });
            } else if (message.id === "pause-crawl") {
              console.log("Automation script received pause signal - stopping");
              isPaused = true; // Set the pause flag
              // Stop processing and reload the page to clear any ongoing automation
              window.location.reload();
              sendResponse({ success: true });
            }
          }
        );

        async function extractPostContent(htmlType) {
          console.log("Extracting post content");

          // Scroll through comments if needed
          await scrollAndLoadComments();

          const content = {
            title: document.title,
            content: getPageHTML(htmlType),
            url: document.URL,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };

          chrome.runtime.sendMessage({
            id: "save-crawl-content",
            data: { env: "2", ...content },
          });
        }

        async function extractProfileContent(htmlType) {
          console.log("Extracting profile content");

          const content = {
            title: document.title,
            content: getPageHTML(htmlType),
            url: document.URL,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };

          chrome.runtime.sendMessage({
            id: "save-crawl-content",
            data: { env: "3", ...content },
          });
        }

        async function scrollAndLoadComments() {
          // Find scroll container (for Instagram posts)
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

        function findScrollContainer() {
          // Try different selectors for Instagram
          const selectors = ["main", '[role="main"]', "article", "section"];

          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.scrollHeight > element.clientHeight) {
              return element;
            }
          }

          return document.documentElement;
        }

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

        function wait(ms) {
          return new Promise((resolve) => setTimeout(resolve, ms));
        }
      },
    });
  }

  // DEBUG: Function to reset all points for testing
  async function handleResetAllPoints(message, sender, sendResponse) {
    console.log("Background: 🔄 DEBUGGING - Resetting all points to zero");

    try {
      await chrome.storage.local.set({
        currentPoints: 0,
        todayPoints: 0,
        totalEarning: 0,
        lastPointUpdate: Date.now(),
        submittedUrlsSession: [], // Also clear submitted URLs for fresh testing
        recentContentSaves: [], // Clear recent saves
      });

      console.log(
        "Background: ✅ All points and submission tracking reset to zero"
      );

      // Notify UI about the reset
      notifyAutomationStateChange("points-updated", {
        currentPoints: 0,
        todayPoints: 0,
        totalEarning: 0,
        pointsReset: true,
      });

      sendResponse({
        success: true,
        message: "All points and tracking reset to zero",
      });
    } catch (error) {
      console.error("Background: ❌ Error resetting points:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // DEBUG: Function to check current storage state
  async function handleDebugStorage(message, sender, sendResponse) {
    console.log("Background: 🔍 DEBUGGING - Checking storage state");

    try {
      const storage = await chrome.storage.local.get([
        "currentPoints",
        "todayPoints",
        "totalEarning",
        "automationState",
        "successfulSubmissions",
        "auth",
      ]);

      console.log("Background: 📊 Complete storage state:", storage);

      sendResponse({ success: true, storage: storage });
    } catch (error) {
      console.error("Background: ❌ Error checking storage:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // Helper function to get submitted URLs from storage
  async function getSubmittedUrls() {
    const storage = await chrome.storage.local.get(["submittedUrlsSession"]);
    return new Set(storage.submittedUrlsSession || []);
  }

  // Helper function to add URL to submitted list
  async function addSubmittedUrl(urlKey) {
    const submittedUrls = await getSubmittedUrls();
    submittedUrls.add(urlKey);
    await chrome.storage.local.set({
      submittedUrlsSession: Array.from(submittedUrls),
    });
  }

  // Track successful API results to prevent duplicate calls
  const successfulApiResults = new Map();

  // Helper function to submit content to backend API
  async function submitContentToBackend(contentData) {
    try {
      console.log(
        "Background: 📤 Submitting content to backend API for claiming"
      );
      console.log("Background: Content data to submit:", {
        url: contentData.url,
        title: contentData.title?.length || 0,
        contentLength: contentData.content?.length || 0,
        env: contentData.env,
        timezone: contentData.timezone,
        timestamp: new Date().toISOString(),
        isFirstTimeSubmission: !(await getSubmittedUrls()).has(
          `${contentData.url}_${contentData.env}`
        ),
      });

      // CRITICAL FIX: Prevent duplicate submissions for the same URL
      const urlKey = `${contentData.url}_${contentData.env}`;

      // CRITICAL: Check if we already have a successful API result for this content
      if (successfulApiResults.has(urlKey)) {
        const cachedResult = successfulApiResults.get(urlKey);
        console.log(
          "Background: ✅ Using cached API result to prevent duplicate calls:",
          {
            url: contentData.url,
            cachedStatus: cachedResult.apiResult?.data?.status,
            cachedTimestamp: cachedResult.timestamp,
            shouldAddPoints: cachedResult.shouldAddPoints,
            useCache: true,
          }
        );
        return cachedResult;
      }

      // CRITICAL FIX: Prevent duplicate submissions for the same URL
      const submittedUrls = await getSubmittedUrls();

      console.log("Background: 🔐 Checking submission deduplication:", {
        url: contentData.url,
        env: contentData.env,
        urlKey: urlKey,
        alreadySubmitted: submittedUrls.has(urlKey),
        submissionInProgress: submissionPromises.has(urlKey),
        totalSubmittedUrls: submittedUrls.size,
        activeSubmissions: submissionPromises.size,
      });

      if (submittedUrls.has(urlKey)) {
        console.log(
          "Background: ⚠️ URL already submitted, skipping duplicate:",
          contentData.url
        );
        return {
          success: true, // Changed to true to prevent fallback
          shouldAddPoints: false,
          error: "URL already submitted",
          isDuplicate: true,
          reason: "Duplicate URL - already processed in this session",
        };
      }

      // CRITICAL FIX: If submission is already in progress for this URL, wait for it
      if (submissionPromises.has(urlKey)) {
        console.log(
          "Background: ⏳ Submission already in progress for URL, waiting:",
          contentData.url
        );
        return await submissionPromises.get(urlKey);
      }

      // Mark URL as being processed and create promise
      const submissionPromise = performSubmission(contentData, urlKey);
      submissionPromises.set(urlKey, submissionPromise);

      try {
        const result = await submissionPromise;
        return result;
      } finally {
        // Clean up the promise when done
        submissionPromises.delete(urlKey);
      }
    } catch (error) {
      console.error(
        "Background: ❌ CRITICAL ERROR submitting content to backend:",
        error
      );
      return { success: false, shouldAddPoints: false, error: error.message };
    }
  }

  // Separated submission logic to avoid duplication
  async function performSubmission(contentData, urlKey) {
    // CRITICAL: Add submission-level deduplication
    const submissionKey = `${contentData.url}_${contentData.env}_${Math.floor(
      Date.now() / 5000
    )}`; // 5-second window

    // Check if we're already submitting this exact content
    if (submissionAttempts.has(submissionKey)) {
      console.log("🚫 DUPLICATE SUBMISSION ATTEMPT BLOCKED:", contentData.url);
      console.log("🔄 Reusing existing submission result");
      return submissionAttempts.get(submissionKey);
    }

    console.log("📤 Starting new submission for:", contentData.url);
    console.log("🔑 Submission key:", submissionKey);

    // CRITICAL: Mark URL as actively being submitted to block UI interference
    activeContentSubmissions.add(contentData.url);
    console.log("🔒 Marked URL as active content submission:", contentData.url);

    // Create submission promise and store it to prevent duplicates
    const submissionPromise = (async () => {
      try {
        // Mark this URL as submitted to prevent future duplicates
        await addSubmittedUrl(urlKey);
        console.log("Background: 🔒 URL marked as submitted:", contentData.url);

        // Get and validate user auth
        let authStorage = await chrome.storage.local.get([
          "auth",
          "userProfile",
        ]);
        console.log("Background: 🔐 Auth storage check:", {
          hasAuth: !!authStorage.auth,
          authKeys: authStorage.auth ? Object.keys(authStorage.auth) : [],
          uid: authStorage.auth?.uid,
          tokenLength: authStorage.auth?.token?.length || 0,
          hasAuthToken: !!authStorage.auth?.auth_token,
          authTokenLength: authStorage.auth?.auth_token?.length || 0,
        });

        // If auth is missing, try to wait and retry
        if (!authStorage.auth || !authStorage.auth.uid) {
          console.log(
            "Background: ⏳ Auth not available, waiting 2 seconds and retrying..."
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          authStorage = await chrome.storage.local.get(["auth", "userProfile"]);
          console.log("Background: 🔄 Auth retry result:", {
            hasAuth: !!authStorage.auth,
            uid: authStorage.auth?.uid,
          });
        }

        if (!authStorage.auth || !authStorage.auth.uid) {
          console.error(
            "Background: ❌ No auth available for content submission after retry"
          );
          return { success: false, shouldAddPoints: false };
        }

        // Verify auth is still valid by checking multiple fields
        const authValid =
          authStorage.auth.uid &&
          authStorage.auth.token &&
          authStorage.auth.auth_token;

        if (!authValid) {
          console.error(
            "Background: ❌ Auth incomplete - missing required fields"
          );
          return { success: false, shouldAddPoints: false };
        }

        console.log(
          "Background: ✅ Auth validated - UID:",
          authStorage.auth.uid
        );

        // Prepare the request payload
        const requestPayload = {
          user_id: authStorage.auth.uid,
          title: contentData.title,
          content: contentData.content,
          url: contentData.url,
          timezone: contentData.timezone,
          env: String(contentData.env), // Ensure env is a string
        };

        console.log("Background: 📋 Payload prepared:", {
          user_id: requestPayload.user_id,
          env: requestPayload.env,
          envType: typeof requestPayload.env,
          url: requestPayload.url,
          titleLength: requestPayload.title?.length || 0,
          contentLength: requestPayload.content?.length || 0,
          timezone: requestPayload.timezone,
        });

        // DEBUG: Track URL to ensure it matches what we expect
        console.log("Background: 🔍 URL TRACKING DEBUG:", {
          originalContentDataUrl: contentData.url,
          payloadUrl: requestPayload.url,
          urlsMatch: contentData.url === requestPayload.url,
          expectedUrl: "Should match the current page URL",
          timestamp: new Date().toISOString(),
        });

        // Store content submission attempt for recovery
        const submissionRecord = {
          payload: requestPayload,
          timestamp: Date.now(),
          status: "attempting",
          authUid: authStorage.auth.uid,
        };

        await chrome.storage.local.set({
          lastContentSubmission: submissionRecord,
        });

        console.log(
          "Background: 💾 Content submission attempt recorded for recovery"
        );

        // Enhanced API call with retry logic
        let apiResult = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts && !apiResult) {
          attempts++;
          console.log(`Background: 🔄 API attempt ${attempts}/${maxAttempts}`);
          console.log("Background: 🌐 API Call Details:", {
            url: requestPayload.url,
            env: requestPayload.env,
            userId: requestPayload.user_id,
            attempt: attempts,
            callTimestamp: new Date().toISOString(),
            expectedResponse: "Looking for status: 1 for points award",
          });

          try {
            apiResult = await new Promise((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                console.log(
                  `Background: ⏰ API attempt ${attempts} timed out after 15 seconds`
                );
                resolve({ error: "timeout", success: false });
              }, 15000);

              try {
                console.log("Background: Making API call to parse endpoint...");
                console.log("Background: 🌐 API REQUEST DEBUG:", {
                  endpoint: "https://spider.codatta.io/api/app/ins/parse",
                  payloadUrl: requestPayload.url,
                  payloadEnv: requestPayload.env,
                  attempt: attempts,
                  timestamp: new Date().toISOString(),
                });

                a(
                  {
                    id: "send-request",
                    url: "https://spider.codatta.io/api/app/ins/parse",
                    params: {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(requestPayload),
                    },
                    auth: true, // Ensure auth is enabled
                    context: "automation", // Mark as automation call
                    fromAutomation: true, // Additional flag for clarity
                  },
                  (result) => {
                    clearTimeout(timeoutId);
                    console.log(
                      `Background: API attempt ${attempts} completed, result:`,
                      result
                    );
                    console.log(
                      `Background: 🕐 API Response received at: ${new Date().toISOString()}`
                    );
                    console.log("Background: 🔍 Raw API response analysis:", {
                      hasResult: !!result,
                      resultType: typeof result,
                      hasData: !!result?.data,
                      dataStatus: result?.data?.status,
                      success: result?.success,
                      errorCode: result?.errorCode,
                      requestedUrl: requestPayload.url,
                      responseUrl: result?.data?.url,
                    });
                    resolve(result);
                  }
                );
              } catch (error) {
                clearTimeout(timeoutId);
                console.error(
                  `Background: API attempt ${attempts} failed with error:`,
                  error
                );
                reject(error);
              }
            });

            // Check if we got a valid result - CRITICAL: Stop on ANY valid response
            if (apiResult && apiResult.success !== false && apiResult.data) {
              console.log(
                `Background: ✅ API call successful on attempt ${attempts}`
              );

              // Log the result we're going to use
              console.log("Background: 📊 Using API result:", {
                dataStatus: apiResult.data?.status,
                success: apiResult.success,
                errorCode: apiResult.errorCode,
                willUseThisResult: true,
                url: contentData.url,
                statusInfo: apiResult.data?.info,
              });

              // CRITICAL: Enhanced logging for Status 1 responses
              if (apiResult.data?.status === 1) {
                console.log(
                  "🎉 SUCCESS! API returned Status 1 - Points will be awarded!"
                );
                console.log("🔍 Status 1 captured:", {
                  url: apiResult.data.url,
                  title: apiResult.data.title,
                  info: apiResult.data.info,
                  htmlType: apiResult.data.html_type,
                  timestamp: new Date().toISOString(),
                  shouldAwardPoints: true,
                });
              } else if (apiResult.data?.status === 0) {
                console.log(
                  "⚠️ INFO: API returned Status 0 - Already submitted, no points"
                );
                console.log("📋 Status 0 captured:", {
                  url: apiResult.data.url,
                  info: apiResult.data.info,
                  shouldAwardPoints: false,
                });
              }

              // CRITICAL: Break immediately on ANY valid response - don't retry
              break; // Use this result, don't make additional calls
            } else if (apiResult && apiResult.error === "timeout") {
              console.log(
                `Background: ⏰ API attempt ${attempts} timed out, will retry if attempts remaining`
              );
              apiResult = null; // Reset for retry
            } else {
              console.log(
                `Background: ⚠️ API attempt ${attempts} returned invalid result:`,
                apiResult
              );
              if (attempts < maxAttempts) {
                console.log(
                  "Background: 🔄 Will retry with different approach..."
                );
                apiResult = null; // Reset for retry
                // Wait before retry
                await new Promise((resolve) => setTimeout(resolve, 2000));
              }
            }
          } catch (error) {
            console.error(
              `Background: ❌ API attempt ${attempts} error:`,
              error
            );
            if (attempts >= maxAttempts) {
              // Last attempt failed, return the error
              return {
                success: false,
                shouldAddPoints: false,
                error: error.message,
              };
            }
            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        // Process the API result
        let isSuccess = false;
        let shouldAddPoints = false;
        let errorMessage = "";

        console.log("Background: 🔍 PROCESSING API RESULT FOR POINTS DECISION");
        console.log("Background: 📊 Raw API result analysis:", {
          hasApiResult: !!apiResult,
          apiResultType: typeof apiResult,
          apiSuccess: apiResult?.success,
          errorCode: apiResult?.errorCode,
          hasData: !!apiResult?.data,
          dataStatus: apiResult?.data?.status,
          dataInfo: apiResult?.data?.info,
          fullApiResult: apiResult,
        });

        if (apiResult) {
          console.log("Background: ✅ API result exists, analyzing status...");

          // Check for multiple success indicators
          if (apiResult.data && apiResult.data.status === 1) {
            console.log(
              "Background: 🎉 SUCCESS! API returned status: 1 - POINTS WILL BE AWARDED!"
            );
            console.log("Background: 🔍 Status 1 details:", {
              url: contentData.url,
              env: contentData.env,
              apiDataStatus: apiResult.data.status,
              apiInfo: apiResult.data.info,
              successMessage: "New content successfully submitted to backend",
            });
            isSuccess = true;
            shouldAddPoints = true; // Only add points when API returns status: 1
          } else if (apiResult.data && apiResult.data.status === 0) {
            console.log(
              "Background: ✅ API returned status: 0 - ALREADY SUBMITTED (no points, but not failure)"
            );
            console.log("Background: 🔍 Status 0 details:", {
              url: contentData.url,
              env: contentData.env,
              apiDataStatus: apiResult.data.status,
              apiInfo: apiResult.data.info,
              message: "Content already submitted - no additional points",
            });
            isSuccess = true; // Status 0 is not a failure - it's "already processed"
            shouldAddPoints = false; // Don't add points for already submitted content
          } else if (apiResult.errorCode === 0 && apiResult.success === true) {
            console.log(
              "Background: 🔍 STATUS CHECK: errorCode=0 & success=true, checking data.status..."
            );
            // Alternative success check - API might return success without data.status
            console.log(
              "Background: API returned success=true, checking data status"
            );
            if (apiResult.data && typeof apiResult.data === "object") {
              console.log(
                "Background: 📋 Data object exists, checking status field..."
              );
              // Apply the corrected logic for status 0 vs status 1
              if (apiResult.data.status === 1) {
                isSuccess = true;
                shouldAddPoints = true;
              } else if (apiResult.data.status === 0) {
                isSuccess = true; // Status 0 is NOT a failure
                shouldAddPoints = false;
              } else {
                isSuccess = false;
                shouldAddPoints = false;
              }
              console.log("Background: 🎯 STATUS DECISION:", {
                dataStatus: apiResult.data.status,
                isSuccess: isSuccess,
                shouldAddPoints: shouldAddPoints,
                logic: `data.status (${apiResult.data.status}) - 1=points, 0=no points but success`,
                apiInfo: apiResult.data.info,
                pointsWillBeAwarded: shouldAddPoints ? "YES" : "NO",
              });
            } else {
              console.log(
                "Background: ❌ No data object found, conservative approach"
              );
              // No data object, but API says success - conservative approach
              isSuccess = false;
              shouldAddPoints = false;
            }
          } else {
            console.log(
              "Background: 🚫 STATUS CHECK: API did not return expected success indicators"
            );
            console.log("Background: 📋 Failed status details:", {
              hasData: !!apiResult.data,
              dataStatus: apiResult.data?.status,
              errorCode: apiResult.errorCode,
              success: apiResult.success,
            });
            isSuccess = false;
            shouldAddPoints = false; // Don't add points for actual API failures
          }

          // Log points decision with more detail
          console.log("Background: 🎯 FINAL POINTS DECISION:", {
            isSuccess: isSuccess,
            shouldAddPoints: shouldAddPoints,
            dataStatus: apiResult.data?.status,
            apiErrorCode: apiResult.errorCode,
            apiSuccess: apiResult.success,
            reason: shouldAddPoints
              ? "Parse API returned status: 1"
              : `Parse API returned status: ${apiResult.data?.status} or no valid status`,
          });

          // Capture appropriate message based on status
          if (!shouldAddPoints && isSuccess) {
            // Status 0 case - already submitted, not an error
            errorMessage = apiResult.data?.info || "Content already submitted";
          } else if (!isSuccess) {
            // Actual failure case
            errorMessage =
              apiResult.message ||
              apiResult.errorMessage ||
              apiResult.error ||
              "Content submission failed";
          }
        } else {
          console.error("Background: ❌ NO API RESULT - CRITICAL ERROR");
          console.error(
            "Background: 🚫 API result is null or undefined - NO POINTS WILL BE ADDED"
          );
          errorMessage = "No response from API";
        }

        if (isSuccess) {
          console.log(
            "Background: 🎉 Content successfully submitted to backend for claiming"
          );
          console.log("Background: 🎯 Content is now registered and claimable");

          // UPDATE SUBMISSION RECORD: Mark as successful
          await chrome.storage.local.set({
            lastContentSubmission: {
              ...submissionRecord,
              status: "success",
              successTimestamp: Date.now(),
              apiResponse: apiResult,
            },
          });

          // VERIFICATION: Store successful submission details for claim verification
          const successfulSubmissions = await chrome.storage.local.get(
            "successfulSubmissions"
          );
          const submissions = successfulSubmissions.successfulSubmissions || [];

          // Add current submission to the list
          submissions.push({
            user_id: authStorage.auth.uid,
            url: contentData.url,
            timestamp: Date.now(),
            env: contentData.env,
            apiResponse: apiResult,
          });

          // Keep only last 100 submissions to manage storage
          if (submissions.length > 100) {
            submissions.splice(0, submissions.length - 100);
          }

          await chrome.storage.local.set({
            successfulSubmissions: submissions,
          });

          console.log(
            "Background: � Successful submission recorded for verification"
          );
        } else {
          console.log(
            "Background: ❌ Content submission failed or not recognized by API"
          );
          console.log("Background: 🎯 No points will be added");

          // UPDATE SUBMISSION RECORD: Mark as failed
          await chrome.storage.local.set({
            lastContentSubmission: {
              ...submissionRecord,
              status: "failed",
              failedTimestamp: Date.now(),
              apiResponse: apiResult,
              errorMessage: errorMessage,
            },
          });
        }

        // CRITICAL: Cache successful results to prevent duplicate API calls
        if (
          apiResult &&
          apiResult.data &&
          (apiResult.data.status === 1 || apiResult.data.status === 0)
        ) {
          console.log(
            "Background: 💾 Caching API result to prevent duplicate calls:",
            {
              url: contentData.url,
              status: apiResult.data.status,
              shouldAddPoints: shouldAddPoints,
              cacheKey: `${contentData.url}_${contentData.env}`,
            }
          );
          const cacheKey = `${contentData.url}_${contentData.env}`;

          // CRITICAL: Only cache if no previous result exists, or if this is a Status 1 (higher priority)
          const existingResult = successfulApiResults.get(cacheKey);
          const shouldCache =
            !existingResult ||
            apiResult.data.status === 1 ||
            (existingResult.apiResult?.data?.status !== 1 &&
              apiResult.data.status === 0);

          if (shouldCache) {
            console.log("Background: ✅ Caching result:", {
              status: apiResult.data.status,
              reason: !existingResult
                ? "No previous result"
                : apiResult.data.status === 1
                ? "Status 1 has priority"
                : "Updating with Status 0",
            });

            successfulApiResults.set(cacheKey, {
              success: isSuccess,
              shouldAddPoints: shouldAddPoints,
              apiResult: apiResult,
              errorMessage: errorMessage,
              timestamp: Date.now(),
            });
          } else {
            console.log(
              "Background: 🚫 NOT caching - existing result has higher priority:",
              {
                existingStatus: existingResult.apiResult?.data?.status,
                newStatus: apiResult.data.status,
                reason: "Status 1 results are preserved over Status 0",
              }
            );
          }

          // Clean up old cached results (keep only last 50)
          if (successfulApiResults.size > 50) {
            const entries = Array.from(successfulApiResults.entries());
            entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            successfulApiResults.clear();
            entries.slice(0, 50).forEach(([key, value]) => {
              successfulApiResults.set(key, value);
            });
          }
        }

        return { success: isSuccess, shouldAddPoints, apiResult, errorMessage };
      } catch (error) {
        console.error(
          "Background: ❌ CRITICAL ERROR submitting content to backend:",
          error
        );
        return { success: false, shouldAddPoints: false, error: error.message };
      }
    })(); // End of async function

    // Store the submission promise to prevent duplicates
    submissionAttempts.set(submissionKey, submissionPromise);

    // Execute the submission and cleanup
    try {
      const result = await submissionPromise;
      return result;
    } finally {
      // Clean up after a delay to allow for immediate duplicates
      setTimeout(() => {
        submissionAttempts.delete(submissionKey);
        activeContentSubmissions.delete(contentData.url);
        console.log("🧹 Cleaned up submission cache for:", contentData.url);
      }, 10000);
    }
  }

  function calculatePointsForContent(data) {
    console.log("Background: 🔢 CALCULATING POINTS FOR CONTENT");
    console.log("Background: 📋 Content details for point calculation:", {
      env: data.env,
      envType: typeof data.env,
      url: data.url,
      title: data.title?.substring(0, 50) + "..." || "No title",
    });

    let points = 0;
    let contentType = "unknown";

    // Determine points based on content type (env field)
    if (data.env === "2") {
      // POST content
      points = 5;
      contentType = "POST";
      console.log("Background: 📸 POST content detected - 5 points");
    } else if (data.env === "3") {
      // PROFILE content
      points = 3;
      contentType = "PROFILE";
      console.log("Background: 👤 PROFILE content detected - 3 points");
    } else if (data.env === "1") {
      // SEARCH content
      points = 2;
      contentType = "SEARCH";
      console.log("Background: 🔍 SEARCH content detected - 2 points");
    } else {
      // Default fallback
      points = 1;
      contentType = "UNKNOWN";
      console.log("Background: ❓ UNKNOWN content type - 1 point fallback");
    }

    console.log("Background: 💰 POINT CALCULATION RESULT:", {
      env: data.env,
      contentType: contentType,
      pointsAwarded: points,
      calculation: `env:${data.env} = ${contentType} = ${points} points`,
    });

    return points;
  }

  async function handleNavigateToUrl(message, sender, sendResponse) {
    console.log(
      "Background: Using WebContent API to navigate to URL:",
      message.url
    );
    console.log("Background: Navigation message details:", {
      url: message.url,
      taskIndex: message.taskIndex,
      senderId: sender.id,
      senderTabId: sender.tab?.id,
      senderUrl: sender.tab?.url,
      automationState: automationState,
    });

    // Check if automation is still running before starting navigation
    if (automationState.stopFlag || !automationState.isRunning) {
      console.log(
        "Background: Navigation rejected - automation stopped or not running"
      );
      console.log("Background: Automation state:", {
        stopFlag: automationState.stopFlag,
        isRunning: automationState.isRunning,
        currentTabId: automationState.currentTabId,
      });
      console.log("Background: Automation stopped, skipping navigation");
      sendResponse({ success: false, message: "Automation stopped" });
      return;
    }

    console.log(
      "Background: Automation is active, proceeding with WebContent navigation"
    );
    console.log("Background: Target URL validation:", {
      url: message.url,
      isValidUrl: !!message.url,
      urlLength: message.url ? message.url.length : 0,
      urlDomain: message.url ? new URL(message.url).hostname : null,
    });

    try {
      const tabId = sender.tab.id;
      const webContentId = 1; // Hardcoded as requested

      console.log("Background: Creating WebContent with ID:", webContentId);
      console.log("Background: WebContent target:", {
        webContentId: webContentId,
        targetUrl: message.url,
        taskIndex: message.taskIndex,
        timestamp: new Date().toISOString(),
      });

      // Track this URL processing for fallback mechanism
      trackUrlProcessing(message.url, tabId);

      // Use chrome.wootz.createBackgroundWebContents instead of tab navigation
      chrome.wootz.createBackgroundWebContents(
        webContentId,
        message.url,
        (result) => {
          console.log("Background: WebContent creation result:", result);

          if (result.success) {
            console.log(
              "Background: WebContent created successfully for URL:",
              message.url
            );

            // Wait 5 seconds before proceeding to next task
            setTimeout(() => {
              console.log(
                "Background: 5 second wait completed, proceeding to next task"
              );
              handleWebContentNavigationComplete(
                tabId,
                message.taskIndex,
                message.url
              );
            }, 5000);
          } else {
            console.error(
              "Background: Failed to create WebContent:",
              result.error
            );
            // Fallback to original navigation method if WebContent fails
            console.log(
              "Background: Falling back to original navigation method"
            );
            fallbackToOriginalNavigation(tabId, message.url, message.taskIndex);
          }
        }
      );

      async function handleWebContentNavigationComplete(tabId, taskIndex, url) {
        console.log(
          "Background: WebContent navigation complete, continuing automation"
        );
        console.log("Background: WebContent completion details:", {
          webContentId: webContentId,
          targetUrl: url,
          taskIndex: taskIndex,
          timestamp: new Date().toISOString(),
        });

        // Mark this URL processing as complete in the fallback mechanism
        markUrlProcessingComplete(url, tabId, taskIndex);

        // Continue automation without re-injecting scripts since we're using WebContent
        setTimeout(async () => {
          try {
            // Check if automation is still running
            if (automationState.stopFlag || !automationState.isRunning) {
              console.log(
                "Background: Automation stopped, skipping continuation"
              );
              return;
            }

            const storage = await chrome.storage.local.get([
              "automationConfig",
              "userProfile",
            ]);
            const config = storage.automationConfig || {};

            console.log(
              "Background: WebContent processing complete, moving to next task"
            );

            // Notify the content script to continue to next task
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                  // Signal the content script that WebContent processing is complete
                  console.log(
                    "WebContent processing complete, continuing to next task"
                  );

                  // Trigger next task processing
                  if (
                    window.processNextTask &&
                    typeof window.processNextTask === "function"
                  ) {
                    window.processNextTask();
                  }
                },
              });
            } catch (error) {
              console.log(
                "Background: Could not signal content script:",
                error
              );
            }
          } catch (error) {
            console.error(
              "Background: Error in WebContent completion handler:",
              error
            );
          }
        }, 1000);
      }

      // Fallback function if WebContent API fails
      async function fallbackToOriginalNavigation(tabId, url, taskIndex) {
        console.log("Background: Executing fallback navigation script");

        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: (url, taskIndex, navigationId, tabId) => {
            console.log(
              "[CONTENT_SCRIPT] FALLBACK Navigation ID",
              navigationId,
              "- Task",
              taskIndex,
              "- Navigating via window.location to:",
              url
            );
            window.location.href = url;
          },
          args: [url, taskIndex || "unknown", Date.now(), tabId],
        });

        // Set up basic navigation completion detection for fallback
        setTimeout(() => {
          handleWebContentNavigationComplete(tabId, taskIndex, url);
        }, 8000); // Wait 8 seconds for fallback navigation
      }

      sendResponse({ success: true });
    } catch (error) {
      console.error("Background: Navigation error:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async function handleInsLogin(message, sendResponse) {
    console.log("Background: Received ins-login message - login required");

    // Notify sidepanel if available, otherwise handle directly
    try {
      chrome.runtime.sendMessage({
        id: "ins-login-background",
        data: message.data,
      });
    } catch (error) {
      console.log("Background: Sidepanel not available, login handling needed");
    }

    sendResponse({ success: true });
  }

  async function handleInsAppeal(message, sendResponse) {
    console.log("Background: Received ins-appeal message - account suspended");

    // Stop automation due to account issues
    automationState.stopFlag = true;
    automationState.isRunning = false;

    if (automationState.intervalRef) {
      clearInterval(automationState.intervalRef);
      automationState.intervalRef = null;
    }

    // Stop the fallback timer
    stopAutomationFallbackTimer();

    // Save state
    await chrome.storage.local.set({ automationState });

    // Notify sidepanel if available
    try {
      chrome.runtime.sendMessage({
        id: "ins-appeal-background",
        data: { message: "Account suspended, automation stopped" },
      });

      // Also send proper automation-stopped message
      notifyAutomationStateChange("automation-stopped", {
        reason: "Account suspended",
      });
    } catch (error) {
      console.log("Background: Account appeal detected, automation stopped");
    }

    sendResponse({ success: true });
  }

  // Track URLs currently being processed to prevent duplicates
  const currentlyProcessing = new Set();

  async function handleSaveCrawlContent(message, sendResponse) {
    console.log("Background: Received save-crawl-content message");

    const { data } = message;

    // CRITICAL: Immediate duplicate check using URL + env
    const processingKey = `${data.url}_${data.env}`;

    if (currentlyProcessing.has(processingKey)) {
      console.log(
        "Background: 🚫 REJECTING DUPLICATE - URL currently being processed:",
        data.url
      );
      sendResponse({
        success: true,
        skipped: true,
        reason: "URL currently being processed",
      });
      return;
    }

    // Mark as being processed immediately
    currentlyProcessing.add(processingKey);

    try {
      // CRITICAL: Add deduplication check at the top level to prevent processing same content multiple times
      const contentKey = `${data.url}_${data.env}_${
        data.timestamp || Date.now()
      }`;
      const recentSaves =
        (await chrome.storage.local.get(["recentContentSaves"])) || {};
      const recentSavesList = recentSaves.recentContentSaves || [];

      // Check if we've processed this exact content recently (within last 30 seconds)
      const now = Date.now();
      const recentThreshold = 30000; // 30 seconds
      const recentSave = recentSavesList.find(
        (save) =>
          save.url === data.url &&
          save.env === data.env &&
          now - save.timestamp < recentThreshold
      );

      if (recentSave) {
        console.log(
          "Background: ⚠️ SKIPPING DUPLICATE save-crawl-content call for URL:",
          data.url
        );
        console.log("Background: Content processed recently:", {
          url: data.url,
          env: data.env,
          timeSinceLastSave: now - recentSave.timestamp,
          threshold: recentThreshold,
        });
        sendResponse({
          success: true,
          skipped: true,
          reason: "Duplicate content save",
        });
        return;
      }

      // Add this save to recent saves list
      recentSavesList.push({
        url: data.url,
        env: data.env,
        timestamp: now,
      });

      // Keep only recent saves (last 10 saves or within 5 minutes)
      const fiveMinutesAgo = now - 300000;
      const filteredSaves = recentSavesList
        .filter((save) => now - save.timestamp < 300000)
        .slice(-10); // Keep only last 10

      await chrome.storage.local.set({
        recentContentSaves: filteredSaves,
      });

      // CRITICAL FIX: Submit content to backend API first so it can be claimed
      console.log(
        "Background: Submitting content to backend for claim eligibility"
      );
      console.log("Background: Using BACKGROUND submission method");

      let submitResult = await submitContentToBackend(data);
      let submitSuccess = submitResult.success;
      let shouldAddPoints = submitResult.shouldAddPoints;

      // FALLBACK: If background submission fails, try through sidepanel
      if (!submitSuccess) {
        console.log(
          "Background: Direct submission failed, trying sidepanel fallback..."
        );
        try {
          // Send content to sidepanel for submission
          const fallbackResult = await chrome.runtime.sendMessage({
            id: "submit-content-via-sidepanel",
            data: data,
          });

          console.log(
            "Background: Fallback result from sidepanel:",
            fallbackResult
          );

          if (fallbackResult && fallbackResult.success) {
            console.log("Background: Sidepanel fallback successful");
            submitSuccess = true;

            // Analyze the API result to determine if points should be added
            if (fallbackResult.result && fallbackResult.result.data) {
              shouldAddPoints = fallbackResult.result.data.status === 1;
              console.log("Background: 🎯 FALLBACK POINTS DECISION:", {
                apiDataStatus: fallbackResult.result.data.status,
                shouldAddPoints: shouldAddPoints,
                logic: `data.status (${fallbackResult.result.data.status}) === 1 ? ${shouldAddPoints}`,
              });
            } else if (
              fallbackResult.result &&
              fallbackResult.result.status === 1
            ) {
              shouldAddPoints = true;
              console.log(
                "Background: 🎯 FALLBACK POINTS DECISION: result.status === 1, adding points"
              );
            } else {
              shouldAddPoints = false;
              console.log(
                "Background: 🚫 FALLBACK POINTS DECISION: No valid success status, no points"
              );
            }
          } else {
            console.log("Background: Sidepanel fallback also failed");
            submitSuccess = false;
            shouldAddPoints = false;
          }
        } catch (error) {
          console.log("Background: Sidepanel fallback also failed:", error);
          submitSuccess = false;
          shouldAddPoints = false;
        }
      }

      if (submitSuccess) {
        console.log(
          "Background: ✅ Content successfully registered with backend for claiming"
        );
      } else {
        // Check if this is actually a failure or just "already submitted"
        if (
          submitResult &&
          submitResult.apiResult &&
          submitResult.apiResult.data &&
          submitResult.apiResult.data.status === 0
        ) {
          console.log(
            "Background: ℹ️ Content already submitted - No additional points awarded"
          );
        } else {
          console.log(
            "Background: ❌ CRITICAL: Content submission FAILED - User will not be able to claim points for this content!"
          );
        }
      }

      // Update automation activity timestamp for fallback mechanism
      automationState.lastTaskCompletionTime = Date.now();

      // Update completed count only if background automation is active AND points are actually awarded
      if (automationState.isRunning) {
        // CRITICAL FIX: Only increment completedCount AND add points if parse API returned status: 1
        if (shouldAddPoints) {
          // Only increment count when points are actually awarded
          automationState.completedCount += 1;
          console.log("Background: 🎯 POINTS DECISION - ADDING POINTS");
          console.log("Background: 📊 Point addition details:", {
            shouldAddPoints: shouldAddPoints,
            submitSuccess: submitSuccess,
            dataEnv: data.env,
            dataUrl: data.url,
            apiStatus: submitResult?.apiResult?.data?.status,
            reason: "Parse API returned status: 1",
          });

          // Calculate points based on content type and save
          const pointsEarned = calculatePointsForContent(data);
          console.log(
            `Background: 💰 CALCULATING POINTS - ${pointsEarned} points for env: ${data.env}`
          );

          // Get current points from storage and add new points
          const storage = await chrome.storage.local.get([
            "currentPoints",
            "todayPoints",
            "totalEarning",
          ]);

          const beforePoints = {
            currentPoints: storage.currentPoints || 0,
            todayPoints: storage.todayPoints || 0,
            totalEarning: storage.totalEarning || 0,
          };

          const currentPoints = beforePoints.currentPoints + pointsEarned;
          const todayPoints = beforePoints.todayPoints + pointsEarned;
          const totalEarning = beforePoints.totalEarning + pointsEarned;

          console.log("Background: 📈 POINTS CALCULATION:", {
            before: beforePoints,
            pointsToAdd: pointsEarned,
            after: {
              currentPoints: currentPoints,
              todayPoints: todayPoints,
              totalEarning: totalEarning,
            },
            difference: {
              currentPoints: currentPoints - beforePoints.currentPoints,
              todayPoints: todayPoints - beforePoints.todayPoints,
              totalEarning: totalEarning - beforePoints.totalEarning,
            },
          });

          // Save updated points to storage
          await chrome.storage.local.set({
            currentPoints,
            todayPoints,
            totalEarning,
            lastPointUpdate: Date.now(),
            automationState,
          });

          console.log(
            `Background: ✅ POINTS SUCCESSFULLY UPDATED - Added ${pointsEarned}, Current: ${currentPoints}, Today: ${todayPoints}, Total: ${totalEarning}`
          );

          // Notify sidepanel about point changes immediately
          notifyAutomationStateChange("points-updated", {
            pointsEarned,
            currentPoints,
            todayPoints,
            totalEarning,
            completedCount: automationState.completedCount,
          });
        } else {
          console.log("Background: 🚫 POINTS DECISION - NO POINTS ADDED");
          console.log("Background: ❌ Point rejection details:", {
            shouldAddPoints: shouldAddPoints,
            submitSuccess: submitSuccess,
            dataEnv: data.env,
            dataUrl: data.url,
            apiStatus: submitResult?.apiResult?.data?.status,
            apiResponse: submitResult?.apiResult,
            reason:
              submitResult?.apiResult?.data?.status === 0
                ? "Parse API returned status: 0 (content already submitted)"
                : "API submission failed or returned invalid status",
          });

          if (submitResult?.apiResult?.data?.status === 0) {
            console.log(
              `Background: ℹ️ Parse API status: 0 - NO POINTS ADDED for env: ${data.env} (content already submitted)`
            );
          } else {
            console.log(
              `Background: ⚠️ Parse API status: ${submitResult?.apiResult?.data?.status} - NO POINTS ADDED for env: ${data.env} (submission failed)`
            );
          }

          console.log("Background: 📊 COMPLETED COUNT NOT INCREMENTED:", {
            completedCount: automationState.completedCount,
            reason: "No points awarded, so no task completion counted",
            dataEnv: data.env,
            expectedPoints: data.env === "3" ? 3 : data.env === "2" ? 5 : 2,
            actualPointsAdded: 0,
          });

          // Still notify about completion but without points
          notifyAutomationStateChange("automation-progress", {
            lastContent: data,
            completedCount: automationState.completedCount,
            pointsEarned: 0,
            reason: "Content not recognized as valid for points",
          });
        }
      }

      // Always save the extracted content for both background and sidepanel automation
      await chrome.storage.local.set({
        lastExtractedContent: {
          ...data,
          timestamp: Date.now(),
        },
      });

      // Notify sidepanel about progress if available
      notifyAutomationStateChange("automation-progress", {
        lastContent: data,
        completedCount: automationState.completedCount,
      });

      sendResponse({ success: true });
    } catch (error) {
      console.error("Background: Error in handleSaveCrawlContent:", error);
      sendResponse({ success: false, error: error.message });
    } finally {
      // CRITICAL: Always clean up the processing flag
      currentlyProcessing.delete(processingKey);
    }
  }

  async function handleCrawlError(message, sendResponse) {
    console.log("Background: Received crawl-error message");

    // Log error and potentially stop automation or retry
    const errorData = {
      timestamp: Date.now(),
      tabId: automationState.currentTabId,
      error: message.data || "Unknown crawl error",
    };

    await chrome.storage.local.set({ lastCrawlError: errorData });

    // Notify sidepanel if available
    try {
      chrome.runtime.sendMessage({
        id: "automation-error",
        data: errorData,
      });
    } catch (error) {
      console.log("Background: Crawl error logged locally");
    }

    sendResponse({ success: true });
  }

  // Helper function to register sidepanel automation for background persistence
  async function handleRegisterAutomation(message, sender, sendResponse) {
    console.log(
      "Background: Registering sidepanel automation - background will take over"
    );
    console.log("Background: Registration config:", message.config);
    console.log(
      "Background: Registration config tasks:",
      message.config?.tasks
    );

    const { tabId, config } = message;

    // Mark automation as registered - background will take over ins-ready handling
    automationState.isRunning = true; // Background will handle automation
    automationState.currentTabId = tabId;
    automationState.stopFlag = false;
    automationState.completedCount = 0;
    automationState.environment = config?.environment || "pro";
    automationState.sidepanelRegistered = true; // Background takes over
    automationState.lastTaskCompletionTime = Date.now();

    // Clear any previous state
    automationState.processedUrls.clear();
    automationState.completedTasks.clear();
    automationState.pendingNavigations.clear();

    // CRITICAL FIX: Clear submitted URLs to allow fresh submissions in new automation run
    await chrome.storage.local.set({ submittedUrlsSession: [] });
    submissionPromises.clear();
    console.log(
      "Background: 🔄 Cleared submission tracking for registered automation"
    );

    // Start the fallback timer for robust automation
    startAutomationFallbackTimer();

    // Save state for persistence
    await chrome.storage.local.set({
      automationState,
      automationConfig: config,
    });

    console.log(
      "Background: Automation registered - background will handle ins-ready"
    );
    // Notify sidepanel that automation has been registered and is running
    notifyAutomationStateChange("automation-started");
    sendResponse({
      success: true,
      message: "Background will handle automation",
    });
  }
  async function handleStopAutomation(sendResponse) {
    console.log(
      "Background: Received stop-automation - stopping background automation"
    );

    // Stop background automation completely
    automationState.stopFlag = true;
    automationState.isRunning = false;

    // NEW: Clear WebContent automation state
    automationState.webContentTasks = [];
    automationState.currentTaskIndex = 0;
    automationState.webContentTabId = null;
    automationState.isProcessingTask = false; // Reset processing flag

    // Stop the fallback timer
    stopAutomationFallbackTimer();
    if (automationState.intervalRef) {
      clearInterval(automationState.intervalRef);
      automationState.intervalRef = null;
    }

    // Save the stopped state
    await chrome.storage.local.set({ automationState });

    // Also send the pause message to any active automation scripts
    if (automationState.currentTabId) {
      try {
        await chrome.tabs.sendMessage(automationState.currentTabId, {
          id: "pause-crawl",
        });
        console.log("Background: Sent pause signal to automation script");
      } catch (error) {
        console.log(
          "Background: Could not send pause to automation script:",
          error
        );
      }
    }

    // Notify sidepanel that automation stopped
    notifyAutomationStateChange("automation-stopped");

    sendResponse({ success: true, message: "Automation stopped" });
  }
  // Notify sidepanel that automation paused
  async function handlePauseCrawl(message, sender, sendResponse) {
    console.log(
      "Background: Received pause-crawl from UI - stopping background automation"
    );

    // Stop background automation completely
    automationState.stopFlag = true;
    automationState.isRunning = false;
    // Stop the fallback timer
    stopAutomationFallbackTimer();
    if (automationState.intervalRef) {
      clearInterval(automationState.intervalRef);
      automationState.intervalRef = null;
    }
    // Save the stopped state
    await chrome.storage.local.set({ automationState });
    // Also send the pause message to any active automation scripts
    if (automationState.currentTabId) {
      try {
        await chrome.tabs.sendMessage(automationState.currentTabId, {
          id: "pause-crawl",
        });
        console.log("Background: Sent pause signal to automation script");
      } catch (error) {
        console.log(
          "Background: Could not send pause to automation script:",
          error
        );
      }
    }
    // Notify sidepanel that automation paused
    notifyAutomationStateChange("automation-paused");
    sendResponse({ success: true, message: "Background automation paused" });
  } // Helper function to call the complete API after all URLs are processed
  async function callCompleteAPI() {
    console.log("Background: 🎯 Calling complete API after all URLs processed");

    try {
      // Get auth and user data
      const authStorage = await chrome.storage.local.get([
        "auth",
        "userProfile",
      ]);
      if (!authStorage.auth || !authStorage.auth.uid) {
        console.error("Background: ❌ No auth available for complete API call");
        return false;
      }

      // Prepare the complete API request payload
      const completePayload = {
        page_no: 1,
        page_size: 10,
        user_id: authStorage.auth.uid,
      };

      console.log("Background: 📤 Complete API payload:", completePayload);

      // TODO: Actually make the complete API call here if needed
      // For now, just return success to indicate the function completed
      console.log("Background: ✅ Complete API call placeholder executed");

      return true;
    } catch (error) {
      console.error("Background: ❌ Error in callCompleteAPI:", error);
      return false;
    }
  }

  // Continue with WebContent automation (used both after WebContent login check and tab login)
  async function continueWithWebContentAutomation(config, userProfile = null) {
    console.log(
      "Background: 🎯 === ENTERING continueWithWebContentAutomation ==="
    );
    console.log("Background: 🔍 Received config parameter:", config);
    console.log("Background: 🔍 Config type:", typeof config);
    console.log(
      "Background: 🔍 Config keys:",
      config ? Object.keys(config) : "null"
    );
    console.log("Background: 🔄 Current automation state before continuing:", {
      isRunning: automationState.isRunning,
      stopFlag: automationState.stopFlag,
      isProcessingTask: automationState.isProcessingTask,
    });

    // CRITICAL: Ensure automation state is maintained
    automationState.isRunning = true;
    automationState.stopFlag = false;
    console.log(
      "Background: ✅ Re-confirmed automation state in continueWithWebContentAutomation"
    );

    // Save state to ensure persistence
    await saveAutomationState("continue-webcontent-automation");

    try {
      // Initialize userProfile if not provided
      if (!userProfile) {
        console.log(
          "Background: 🔍 No userProfile provided, fetching from storage"
        );
        const profileStorage = await chrome.storage.local.get(["userProfile"]);
        userProfile = profileStorage.userProfile || {};
        console.log(
          "Background: 🔍 Fetched userProfile from storage:",
          userProfile
        );
      }

      const completeSuccess = await callCompleteAPI();
      if (completeSuccess) {
        console.log("Background: Fallback - Complete API call successful");
      } else {
        console.log(
          "Background: Fallback - Complete API call failed, but continuing"
        );
      }

      // Clear pending navigations since we're moving on
      automationState.pendingNavigations.clear();
      automationState.urlProcessingTimeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      automationState.urlProcessingTimeouts.clear();

      console.log("Background: Fallback - Making API call to get fresh tasks");

      // Make the API call to get fresh page info (same logic as handleUpdateCompletedLinkList)
      const apiRequestData = {
        id: "send-request",
        url: "https://spider.codatta.io/api/app/ins/next",
        params: {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      };

      console.log("Background: Fallback - API request:", apiRequestData);

      const apiResult = await Promise.race([
        new Promise((resolve) => {
          a(apiRequestData, resolve);
        }),
        new Promise((resolve) => {
          setTimeout(() => {
            console.log(
              "Background: Fallback - API call timed out after 10 seconds"
            );
            resolve({ error: "timeout", success: false });
          }, 10000);
        }),
      ]);

      console.log("Background: Fallback - API result:", apiResult);

      // Check for API success
      let isApiSuccess = false;
      if (apiResult) {
        if (
          apiResult.success === true ||
          apiResult.errorCode === 0 ||
          apiResult.status === 1 ||
          (apiResult.data && typeof apiResult.data === "object")
        ) {
          isApiSuccess = true;
        }
      }

      if (!isApiSuccess) {
        console.log(
          "Background: Fallback - API request failed, no new tasks available"
        );
        return;
      }

      console.log("Background: Fallback - API success, processing fresh tasks");

      // Extract fresh page info and tasks (same logic as handleUpdateCompletedLinkList)
      const freshPageInfo = apiResult.data || {};
      let tasks = [];

      if (freshPageInfo.tasks && Array.isArray(freshPageInfo.tasks)) {
        tasks = freshPageInfo.tasks;
      } else if (
        freshPageInfo.data &&
        freshPageInfo.data.tasks &&
        Array.isArray(freshPageInfo.data.tasks)
      ) {
        tasks = freshPageInfo.data.tasks;
      }

      console.log("Background: Fallback - Found tasks:", tasks.length);

      if (tasks.length === 0) {
        console.log("Background: Fallback - No tasks found in API response");
        return;
      }

      // Update automation config with new tasks
      const storage = await chrome.storage.local.get([
        "automationConfig",
        "userProfile",
      ]);
      const config = storage.automationConfig || {};
      // Use existing userProfile if available, otherwise get from storage
      if (!userProfile) {
        userProfile = storage.userProfile || {};
      }

      config.tasks = tasks;
      await chrome.storage.local.set({ automationConfig: config });

      console.log("Background: Fallback - Updated config with new tasks");

      console.log(
        "Background: ✅ WebContent automation - Starting with new tasks"
      );

      // CRITICAL FIX: Instead of using tab navigation, use WebContent automation
      console.log(
        "Background: 🔄 Starting WebContent automation with fresh tasks"
      );

      // Update automation state with new tasks for WebContent
      automationState.webContentTasks = tasks;
      automationState.currentTaskIndex = 0;
      automationState.webContentTabId = automationState.currentTabId || 1;
      automationState.isProcessingTask = false;

      // Save updated state
      await saveAutomationState("new-tasks-for-webcontent");

      console.log("Background: 🔄 WebContent automation state updated:", {
        tasksCount: automationState.webContentTasks.length,
        currentTaskIndex: automationState.currentTaskIndex,
        webContentTabId: automationState.webContentTabId,
      });

      // Start WebContent automation with the new tasks
      setTimeout(() => {
        console.log("Background: 🚀 Starting WebContent task processing");
        processNextWebContentTask();
      }, 2000); // Small delay before starting
    } catch (error) {
      console.error(
        "Background: Error in continueWithWebContentAutomation:",
        error
      );
    }
  }
  async function handleUpdateCompletedLinkList(message, sender, sendResponse) {
    console.log(
      "Background: Received update-completed-link-list - fetching more URLs"
    );
    console.log("Background: API URL fetch request details:", {
      messageData: message,
      senderId: sender.id,
      senderTabId: sender.tab?.id,
      currentAutomationState: automationState,
      timestamp: new Date().toISOString(),
    });

    try {
      // Get config and userProfile from storage
      const storage = await chrome.storage.local.get([
        "automationConfig",
        "userProfile",
      ]);
      const config = storage.automationConfig || {};
      const userProfile = storage.userProfile || {};

      console.log("Background: Fetched config for WebContent automation:", {
        hasConfig: !!config,
        hasTasks: !!(config.tasks && config.tasks.length > 0),
        tasksCount: config.tasks ? config.tasks.length : 0,
        hasUserProfile: !!userProfile,
      });

      // Start the actual WebContent automation with tasks
      await startWebContentAutomation(
        automationState.currentTabId,
        config,
        userProfile
      );

      console.log("Background: ✅ === startWebContentAutomation COMPLETED ===");
      sendResponse({ success: true });
    } catch (error) {
      console.error(
        "Background: Error in handleUpdateCompletedLinkList:",
        error
      );
      sendResponse({ success: false, error: error.message });
    }
  }

  // Fetch tasks from backend 'next' API using correct endpoint and headers
  async function fetchTasksFromBackend() {
    return new Promise(async (resolve) => {
      console.log("Background: 🌐 === FETCHFROM BACKEND ENTRY ===");
      console.log(
        "Background: 🌐 Fetching tasks from backend using correct API endpoint"
      );

      try {
        // Get auth from storage
        const storage = await chrome.storage.local.get(["auth"]);
        const auth = storage.auth;

        console.log("Background: 🔍 Auth storage check:", {
          hasAuth: !!auth,
          hasToken: !!auth?.token,
          hasUid: !!auth?.uid,
          hasAuthToken: !!auth?.auth_token,
          authObject: auth,
        });

        if (!auth || !auth.token || !auth.uid) {
          console.error("Background: ❌ No auth data found for API call");
          console.error("Background: ❌ Auth details:", {
            auth: auth,
            hasToken: !!auth?.token,
            hasUid: !!auth?.uid,
          });
          resolve([]);
          return;
        }

        console.log("Background: 🔑 Using auth data:", {
          hasToken: !!auth.token,
          hasUid: !!auth.uid,
          hasAuthToken: !!auth.auth_token,
        });

        console.log("Background: 🌐 Making API call to tasks endpoint...");

        // Use the existing API call system with correct endpoint and headers
        a(
          {
            url: "https://spider.codatta.io/api/app/ins/next",
            params: {
              method: "GET",
              headers: {
                accept: "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                auth_token: auth.auth_token || auth.token,
                token: auth.token,
                uid: auth.uid,
                showinvitercode: "false",
                "x-client": "Codatta Clip@1.2.1",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "none",
              },
            },
            cache: false,
            auth: true,
          },
          (response) => {
            console.log(
              "Background: 📥 === BACKEND API RESPONSE FOR TASKS ==="
            );
            console.log(
              "Background: 📥 Backend API response for tasks:",
              response
            );

            console.log("Background: 🔍 Response analysis:", {
              hasResponse: !!response,
              responseType: typeof response,
              hasSuccess: !!response?.success,
              hasData: !!response?.data,
              dataType: typeof response?.data,
              isDataArray: Array.isArray(response?.data),
              fullResponse: response,
            });

            if (response && response.success && response.data) {
              console.log("Background: ✅ Valid response with data received");

              // Extract tasks from the response - could be in different formats
              let tasks = [];

              if (Array.isArray(response.data)) {
                console.log("Background: 📋 Data is array format");
                tasks = response.data;
              } else if (
                response.data.tasks &&
                Array.isArray(response.data.tasks)
              ) {
                console.log("Background: 📋 Data has tasks array");
                tasks = response.data.tasks;
              } else if (
                response.data.urls &&
                Array.isArray(response.data.urls)
              ) {
                console.log(
                  "Background: 📋 Data has urls array, converting to tasks"
                );
                // Convert URLs to task format
                tasks = response.data.urls.map((url) => ({ url: url }));
              } else if (typeof response.data === "object") {
                console.log(
                  "Background: 📋 Data is object, searching for arrays"
                );
                // Try to extract any array from the response
                const keys = Object.keys(response.data);
                console.log(
                  "Background: 🔍 Available keys in response.data:",
                  keys
                );

                for (const key of keys) {
                  if (Array.isArray(response.data[key])) {
                    console.log(
                      `Background: ✅ Found array in key '${key}':`,
                      response.data[key]
                    );
                    tasks = response.data[key];
                    break;
                  }
                }
              }

              console.log("Background: ✅ Tasks extracted from API:", tasks);
              console.log("Background: 📊 Total tasks found:", tasks.length);

              if (tasks.length > 0) {
                console.log("Background: 🎯 Sample task:", tasks[0]);
              }

              resolve(Array.isArray(tasks) ? tasks : []);
            } else {
              console.error("Background: ❌ Invalid response from backend:");
              console.error("Background: ❌ Response details:", {
                hasResponse: !!response,
                hasSuccess: !!response?.success,
                successValue: response?.success,
                hasData: !!response?.data,
                dataValue: response?.data,
                errorCode: response?.errorCode,
                errorMessage: response?.errorMessage,
              });
              resolve([]);
            }
          }
        );
      } catch (error) {
        console.error("Background: ❌ Error in fetchTasksFromBackend:", error);
        resolve([]);
      }
    });
  }

  chrome.runtime.onMessageExternal.addListener(
    (e, s, t) => (
      "hello-extension" === e.id
        ? t("success")
        : "send-request" === e.id
        ? a(e, t)
        : "web-login" === e.id &&
          (async function (e, s) {
            const { params: t } = e;
            await chrome.storage.local.set({
              auth: {
                token: t.token,
                uid: t.uid,
                auth_token: t.auth,
                showInviterCode: !!(null == t ? void 0 : t.showInviterCode),
              },
            }),
              chrome.runtime.sendMessage({ id: "inject-reload" }),
              s("success");
          })(e, t),
      !0
    )
  );

  chrome.runtime.onMessage.addListener(function (e, s, t) {
    var o;
    const { id: i } = e,
      c =
        ((null == e ? void 0 : e.tabId) ||
          (null == (o = s.tab) ? void 0 : o.id)) ??
        0;

    console.log("Background: Received message:", i, "from tab:", c);

    // 🔍 GLOBAL MESSAGE LOGGER - Check for status: 1 in any message data
    if (e && e.data && typeof e.data === "object") {
      if (e.data.status === 1) {
        console.log("🎉 GLOBAL MESSAGE STATUS: 1 DETECTED in message:", i);
        console.log("🔍 Message with status 1:", e);
      } else if (e.data.data && e.data.data.status === 1) {
        console.log(
          "🎉 GLOBAL MESSAGE NESTED STATUS: 1 DETECTED in message:",
          i
        );
        console.log("🔍 Nested message with status 1:", e);
      }
    }

    switch (i) {
      case "send-request":
        // CRITICAL: Block UI-triggered API calls during automation to prevent duplicates
        if (
          automationState.isRunning &&
          e.url === "https://spider.codatta.io/api/app/ins/parse"
        ) {
          console.log(
            "🚫 BLOCKING UI-triggered Parse API call during automation"
          );
          console.log("🔄 Automation is running, ignoring UI API request");
          t({
            success: false,
            errorMessage: "Automation in progress, UI API calls blocked",
          });
          break;
        }
        a(e, t);
        break;
      case "screen-capture":
        !(async function (e, s, t) {
          try {
            const [e] = await chrome.windows.getAll({ populate: !0 }),
              s = e.tabs.find((e) => e.active);
            if (!s) return void t({ error: "No active tab found." });
            t(await chrome.tabs.captureVisibleTab(s.windowId));
          } catch (a) {}
        })(0, 0, t);
        break;
      case "inject-logout":
        !(async function (e) {
          await chrome.storage.local.remove("auth"), e("success");
        })(t);
        break;
      case "show-signin":
        !(async function (e, s, t) {
          await chrome.scripting.executeScript({
            target: { tabId: t },
            world: "MAIN",
            files: ["signin.js"],
          }),
            s("success");
        })(0, t, c);
        break;
      case "update-completed-link-list":
        handleUpdateCompletedLinkList(e, s, t);
        break;
      case "click-browser-icon":
        n(c);
        break;
      case "continue-crawl":
        chrome.runtime.sendMessage({ id: "continue-crawl-res" });
        break;
      case "pause-crawl":
        handlePauseCrawl(e, s, t);
        break;
      case "ins-ready":
        handleInsReady(e, s, t);
        break;
      case "instagram-automation-ready":
        handleInstagramAutomationReady(e, s, t);
        break;
      case "ins-login":
        handleInsLogin(e, t);
        break;
      case "ins-appeal":
        handleInsAppeal(e, t);
        break;
      case "tab-instagram-login-confirmed":
        handleTabInstagramLoginConfirmed(e, s, t);
        break;
      case "check-instagram-login":
        // This message will be handled by content script, no background handling needed
        break;
      case "save-crawl-content":
        handleSaveCrawlContent(e, t);
        break;
      case "crawl-error":
        handleCrawlError(e, t);
        break;
      case "start-automation":
        handleStartAutomation(e, s, t);
        break;
      case "register-automation":
        handleRegisterAutomation(e, s, t);
        break;
      case "navigate-to-url":
        handleNavigateToUrl(e, s, t);
        break;
      case "stop-automation":
        handleStopAutomation(t);
        break;
      case "sync-points-with-ui":
        (async () => {
          const result = await syncPointsWithUI();
          t(result);
        })();
        break;
      case "get-automation-status":
      case "get-automation-state": // Added to match sidepanel request
        t({
          success: true,
          data: {
            isRunning: automationState.isRunning,
            stopFlag: automationState.stopFlag,
            isPaused: automationState.isPaused,
            isProcessingTask: automationState.isProcessingTask,
            currentTaskIndex: automationState.currentTaskIndex,
            totalTasks: automationState.webContentTasks.length,
            completedCount: automationState.completedCount,
            timestamp: new Date().toISOString(),
          },
        });
        break;
      case "request-points-update":
        (async () => {
          const storage = await chrome.storage.local.get([
            "todayPoints",
            "totalEarning",
            "submittedUrls",
          ]);
          t({
            success: true,
            data: {
              todayPoints: storage.todayPoints || 0,
              totalEarning: storage.totalEarning || 0,
              submissionCount: (storage.submittedUrls || []).length,
              timestamp: new Date().toISOString(),
            },
          });
        })();
        break;
      case "get-current-points":
        handleGetCurrentPoints(e, s, t);
        break;
      case "reset-claimed-points":
        handleResetClaimedPoints(e, s, t);
        break;
      default:
        t({ data: "miao?" });
    }
    return !0;
  });

  chrome.contextMenus.create({
    contexts: ["all"],
    id: "create-submission",
    title: "create submission",
  });

  chrome.contextMenus.onClicked.addListener(async (e, t) => {
    await chrome.sidePanel.open({ tabId: null == t ? void 0 : t.id }, () => {
      s = !0;
    });
  });

  chrome.webRequest.onCompleted.addListener(
    (e) => {
      chrome.runtime.sendMessage({ id: "check-request", data: e });
    },
    { urls: ["https://www.instagram.com/*", "https://www.facebook.com/*"] }
  );

  // Live points update system for real-time UI synchronization
  async function updateLivePoints(newPoints, reason = "content-submission") {
    try {
      console.log(
        `Background: 🎯 Updating live points: +${newPoints} (${reason})`
      );

      // Get current points from storage
      const storage = await chrome.storage.local.get([
        "todayPoints",
        "totalEarning",
        "submittedUrls",
      ]);

      const currentTodayPoints = storage.todayPoints || 0;
      const currentTotalEarning = storage.totalEarning || 0;
      const submittedUrls = storage.submittedUrls || [];

      // Update points
      const newTodayPoints = currentTodayPoints + newPoints;
      const newTotalEarning = currentTotalEarning + newPoints;

      // Save updated points
      await chrome.storage.local.set({
        todayPoints: newTodayPoints,
        totalEarning: newTotalEarning,
        lastPointsUpdate: Date.now(),
      });

      // Notify UI of points change
      notifyAutomationStateChange("points-updated", {
        todayPoints: newTodayPoints,
        totalEarning: newTotalEarning,
        newPoints: newPoints,
        reason: reason,
        submissionCount: submittedUrls.length,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `Background: ✅ Points updated successfully - Today: ${newTodayPoints}, Total: ${newTotalEarning}`
      );

      return {
        todayPoints: newTodayPoints,
        totalEarning: newTotalEarning,
        success: true,
      };
    } catch (error) {
      console.error("Background: ❌ Error updating live points:", error);
      return { success: false, error: error.message };
    }
  }

  // Function to sync current points with UI
  async function syncPointsWithUI() {
    try {
      const storage = await chrome.storage.local.get([
        "todayPoints",
        "totalEarning",
        "submittedUrls",
      ]);

      const todayPoints = storage.todayPoints || 0;
      const totalEarning = storage.totalEarning || 0;
      const submittedUrls = storage.submittedUrls || [];

      notifyAutomationStateChange("points-sync", {
        todayPoints: todayPoints,
        totalEarning: totalEarning,
        submissionCount: submittedUrls.length,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `Background: 🔄 Points synced with UI - Today: ${todayPoints}, Total: ${totalEarning}`
      );

      return {
        todayPoints,
        totalEarning,
        submissionCount: submittedUrls.length,
        success: true,
      };
    } catch (error) {
      console.error("Background: ❌ Error syncing points with UI:", error);
      return { success: false, error: error.message };
    }
  }
})();
