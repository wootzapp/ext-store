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
    side_panel: { default_path: "sidepanel-views/index.html" },
    web_accessible_resources: [
      {
        resources: ["assets/*", "signin.js", "browser-icon.js"],
        matches: ["<all_urls>"],
      },
    ],
    externally_connectable: { matches: ["<all_urls>"] },
    permissions: [
      "sidePanel",
      "activeTab",
      "storage",
      "contextMenus",
      "scripting",
      "webRequest",
    ],
    host_permissions: ["<all_urls>"],
    background: { service_worker: "background.js" },
  };
  let s = !1;

  // Initialize automation state on startup
  async function initializeAutomation() {
    try {
      const stored = await chrome.storage.local.get("automationState");
      if (stored.automationState) {
        automationState = { ...automationState, ...stored.automationState };
        console.log("Background: Restored automation state:", automationState);

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
    } catch (error) {
      console.log("Background: Failed to restore automation state:", error);
    }
  }

  // Call initialization
  initializeAutomation();

  console.log("Background: Extension loaded, automation handlers ready");
  async function t(s) {
    const { params: t, url: a } = s,
      n = await chrome.storage.local.get("auth");
    t.headers = Object.assign(t.headers, n.auth, {
      "x-client": `${e.name}@${e.version}`,
    });
    const o = await fetch(a, t),
      i = o.headers.get("content-type");
    let c = null;
    return (
      (c =
        "application/json" === i
          ? await o.json()
          : (null == i ? void 0 : i.includes("text/"))
          ? await o.text()
          : await o.blob()),
      c
    );
  }
  async function a(e, s) {
    const { params: a, url: n, cache: o, auth: i = !0 } = e;
    if (!(await chrome.storage.local.get("auth")).auth && i)
      return void s({
        errorCode: 1003,
        errorMessage: "Invalid auth token!",
        success: !1,
      });
    const c = `${a.method}:${n}`,
      r = await chrome.storage.local.get(c);
    if (o && r[c]) {
      s(r[c]);
      const a = await t(e);
      await chrome.storage.local.set({ [c]: a });
    } else {
      const a = await t(e);
      s(a), o && chrome.storage.local.set({ [c]: a });
    }
  }
  function n(e) {
    s
      ? chrome.sidePanel.setOptions({ enabled: !1 }).then(() => {
          (s = !1), chrome.sidePanel.setOptions({ enabled: !0 });
        })
      : chrome.sidePanel.open({ tabId: e }, () => {
          (s = !0), chrome.storage.local.set({ startBtnAnimation: !0 });
        });
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
  };

  // Helper function to notify sidepanel of automation state changes
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
      console.log(`Background: Sent ${eventType} notification to sidepanel`);
    } catch (error) {
      console.log(
        `Background: Could not send ${eventType} notification:`,
        error
      );
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

      // Inject the main automation script based on page type
      if (config.page_type === "SEARCH") {
        await injectSearchAutomation(tabId, config, userProfile);
      } else {
        await injectTaskAutomation(tabId, config, userProfile);
      }

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
        message: "Background automation script injected",
      });
    } catch (error) {
      console.error("Background: Error in handleInsReady:", error);
      sendResponse({ success: false, message: error.message });
    }
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
            domain: document.URL,
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
            domain: document.URL,
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
            console.log("Automation paused, stopping task processing");
            return;
          }

          if (currentTaskIndex >= tasks.length) {
            console.log("All tasks completed");
            await wait(2000);
            chrome.runtime.sendMessage({ id: "update-completed-link-list" });
            return;
          }

          const task = tasks[currentTaskIndex];
          console.log("Processing task:", currentTaskIndex, task);

          // Request background to navigate to next URL
          chrome.runtime.sendMessage({
            id: "navigate-to-url",
            url: task.url,
            taskIndex: currentTaskIndex,
          });

          currentTaskIndex++;
        }

        // Listen for navigation completion and pause signals
        chrome.runtime.onMessage.addListener(
          async (message, sender, sendResponse) => {
            if (message.id === "navigation-complete") {
              console.log("Navigation complete, extracting content");
              await wait(Math.floor(2000 + Math.random() * 2000));

              if (pageType === "2") {
                await extractPostContent(htmlType);
              } else {
                await extractProfileContent(htmlType);
              }

              // Process next task after a delay
              setTimeout(
                () => {
                  processNextTask();
                },
                pageType === "2" ? postTimeout + 5000 : profileTimeout + 3000
              );

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
            domain: document.URL,
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
            domain: document.URL,
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

  // Helper function to calculate points based on content type
  function calculatePointsForContent(data) {
    // Determine points based on content type (env field)
    if (data.env === "2") {
      // POST content
      return 5; // 5 points per post
    } else if (data.env === "3") {
      // PROFILE content
      return 3; // 3 points per profile
    } else if (data.env === "1") {
      // SEARCH content
      return 2; // 2 points per search result
    }
    return 1; // Default points for any other content
  }

  async function handleNavigateToUrl(message, sender, sendResponse) {
    console.log("Background: Navigating to URL:", message.url);

    // Check if automation is still running before starting navigation
    if (automationState.stopFlag || !automationState.isRunning) {
      console.log("Background: Automation stopped, skipping navigation");
      sendResponse({ success: false, message: "Automation stopped" });
      return;
    }

    try {
      const tabId = sender.tab.id;
      await chrome.tabs.update(tabId, { url: message.url });

      // Wait for navigation to complete, then re-inject automation script
      chrome.tabs.onUpdated.addListener(function listener(
        updatedTabId,
        changeInfo,
        tab
      ) {
        if (updatedTabId === tabId && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);

          console.log(
            "Background: Navigation complete, re-injecting automation script"
          );

          // Re-inject the automation script with the remaining tasks
          setTimeout(async () => {
            try {
              // Check if automation is still running before re-injecting
              if (automationState.stopFlag || !automationState.isRunning) {
                console.log(
                  "Background: Automation stopped, skipping re-injection"
                );
                return;
              }

              const storage = await chrome.storage.local.get([
                "automationConfig",
                "userProfile",
              ]);
              const config = storage.automationConfig || {};
              const userProfile = storage.userProfile || {};

              // Re-inject the single task processor
              await chrome.scripting.executeScript({
                target: { tabId: tabId },
                args: [
                  config.page_type === "POST" ? "2" : "3",
                  config.get_html_type || 1,
                  message.taskIndex,
                  config.tasks || [],
                  config.page_type === "POST"
                    ? Number(userProfile.post_timeout || 5000) +
                      Math.floor(6000 + Math.random() * 4000)
                    : Number(userProfile.profile_timeout || 5000) +
                      Math.floor(6000 + Math.random() * 4000),
                ],
                func: (pageType, htmlType, currentIndex, allTasks, timeout) => {
                  console.log(
                    "Re-injected automation script - processing task",
                    currentIndex,
                    "of",
                    allTasks.length
                  );

                  let isPaused = false; // Flag to track if automation is paused

                  // Listen for pause signals from background
                  chrome.runtime.onMessage.addListener(
                    (message, sender, sendResponse) => {
                      if (message.id === "pause-crawl") {
                        console.log(
                          "Re-injected script: Received pause signal, stopping"
                        );
                        isPaused = true;
                        sendResponse({
                          success: true,
                          message: "Re-injected script paused",
                        });
                      }
                    }
                  );

                  async function processCurrentTask() {
                    if (isPaused) {
                      console.log(
                        "Re-injected script: Paused, not processing task"
                      );
                      return;
                    }

                    await wait(Math.floor(2000 + Math.random() * 2000));

                    if (isPaused) {
                      console.log(
                        "Re-injected script: Paused during wait, stopping"
                      );
                      return;
                    }

                    if (pageType === "2") {
                      await extractPostContent(htmlType);
                    } else {
                      await extractProfileContent(htmlType);
                    }

                    if (isPaused) {
                      console.log(
                        "Re-injected script: Paused after extraction, stopping"
                      );
                      return;
                    }

                    // Move to next task after processing current one
                    setTimeout(() => {
                      if (!isPaused) {
                        processNextTask();
                      } else {
                        console.log(
                          "Re-injected script: Paused, not proceeding to next task"
                        );
                      }
                    }, timeout + 5000);
                  }

                  async function processNextTask() {
                    if (isPaused) {
                      console.log(
                        "Re-injected script: Paused, not processing next task"
                      );
                      return;
                    }
                    const nextIndex = currentIndex + 1;

                    if (nextIndex >= allTasks.length) {
                      console.log("All tasks completed");
                      await wait(2000);
                      chrome.runtime.sendMessage({
                        id: "update-completed-link-list",
                      });
                      return;
                    }

                    const nextTask = allTasks[nextIndex];
                    console.log("Processing next task:", nextIndex, nextTask);

                    // Request background to navigate to next URL
                    chrome.runtime.sendMessage({
                      id: "navigate-to-url",
                      url: nextTask.url,
                      taskIndex: nextIndex,
                    });
                  }

                  async function extractPostContent(htmlType) {
                    console.log("Extracting post content");

                    // Scroll through comments if needed
                    await scrollAndLoadComments();

                    const content = {
                      title: document.title,
                      content: getPageHTML(htmlType),
                      url: document.URL,
                      domain: document.URL,
                      timezone:
                        Intl.DateTimeFormat().resolvedOptions().timeZone,
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
                      domain: document.URL,
                      timezone:
                        Intl.DateTimeFormat().resolvedOptions().timeZone,
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
                    const selectors = [
                      "main",
                      '[role="main"]',
                      "article",
                      "section",
                    ];

                    for (const selector of selectors) {
                      const element = document.querySelector(selector);
                      if (
                        element &&
                        element.scrollHeight > element.clientHeight
                      ) {
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
                      clonedDoc
                        .querySelectorAll("style")
                        .forEach((el) => el.remove());
                    }

                    if (htmlType !== 4 && htmlType !== 3) {
                      clonedDoc
                        .querySelectorAll("script")
                        .forEach((el) => el.remove());
                    }

                    return clonedDoc.documentElement.outerHTML;
                  }

                  function wait(ms) {
                    return new Promise((resolve) => setTimeout(resolve, ms));
                  }

                  // Start processing the current task
                  processCurrentTask();
                },
              });
            } catch (error) {
              console.error(
                "Background: Error re-injecting automation script:",
                error
              );
            }
          }, 1000);
        }
      });

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

  async function handleSaveCrawlContent(message, sendResponse) {
    console.log("Background: Received save-crawl-content message");

    const { data } = message;

    // Update completed count only if background automation is active
    if (automationState.isRunning) {
      automationState.completedCount += 1;

      // Calculate points based on content type and save
      const pointsEarned = calculatePointsForContent(data);
      console.log(
        `Background: Content processed - Points earned: ${pointsEarned} for env: ${data.env}`
      );

      // Get current points from storage and add new points
      const storage = await chrome.storage.local.get([
        "currentPoints",
        "todayPoints",
        "totalEarning",
      ]);
      const currentPoints = (storage.currentPoints || 0) + pointsEarned;
      const todayPoints = (storage.todayPoints || 0) + pointsEarned;
      const totalEarning = (storage.totalEarning || 0) + pointsEarned;

      // Save updated points to storage
      await chrome.storage.local.set({
        currentPoints,
        todayPoints,
        totalEarning,
        lastPointUpdate: Date.now(),
        automationState,
      });

      console.log(
        `Background: Points updated - Added ${pointsEarned}, Current: ${currentPoints}, Today: ${todayPoints}, Total: ${totalEarning}`
      );

      // Notify sidepanel about point changes immediately
      notifyAutomationStateChange("points-updated", {
        pointsEarned,
        currentPoints,
        todayPoints,
        totalEarning,
        completedCount: automationState.completedCount,
      });
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

  async function handleStartAutomation(message, sender, sendResponse) {
    console.log("Background: Received start-automation message");

    const { tabId, config } = message;

    // Initialize automation state
    automationState.isRunning = true;
    automationState.currentTabId = tabId;
    automationState.stopFlag = false;
    automationState.completedCount = 0;
    automationState.environment = config?.environment || "pro";

    // Save automation config and state
    await chrome.storage.local.set({
      automationState,
      automationConfig: config,
    });

    console.log("Background: Automation started with config:", config);

    // Notify that automation has started
    notifyAutomationStateChange("automation-started");

    sendResponse({
      success: true,
      message: "Automation started in background",
    });
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
    automationState.sidepanelRegistered = false; // Reset registration

    if (automationState.intervalRef) {
      clearInterval(automationState.intervalRef);
      automationState.intervalRef = null;
    }

    // Save the stopped state
    await chrome.storage.local.set({ automationState });

    console.log(
      "Background: Automation stopped due to stop-automation request"
    );

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

  async function handlePauseCrawl(message, sender, sendResponse) {
    console.log(
      "Background: Received pause-crawl from UI - stopping background automation"
    );

    // Stop background automation completely
    automationState.stopFlag = true;
    automationState.isRunning = false;
    automationState.sidepanelRegistered = false; // Reset registration so sidepanel can take over again if needed

    if (automationState.intervalRef) {
      clearInterval(automationState.intervalRef);
      automationState.intervalRef = null;
    }

    // Save the stopped state
    await chrome.storage.local.set({ automationState });

    console.log("Background: Automation stopped due to UI pause request");

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
  }

  async function handleUpdateCompletedLinkList(message, sender, sendResponse) {
    console.log(
      "Background: Received update-completed-link-list - fetching more URLs"
    );

    try {
      // Forward the message to sidepanel for UI updates
      try {
        chrome.runtime.sendMessage({
          id: "update-completed-result",
          data: message.data || {},
        });
      } catch (error) {
        console.log("Background: Sidepanel not available for UI updates");
      }

      // Wait a bit, then fetch new URLs directly from API (not sidepanel)
      setTimeout(async () => {
        // Check if automation is still running before proceeding
        if (automationState.stopFlag || !automationState.isRunning) {
          console.log(
            "Background: Automation stopped, canceling URL fetch and navigation"
          );
          return;
        }

        console.log("Background: Fetching fresh URLs directly from API");

        try {
          // Double-check automation state right before API call
          if (automationState.stopFlag || !automationState.isRunning) {
            console.log(
              "Background: Automation stopped during API preparation, aborting"
            );
            return;
          }
          // Make the API call to get fresh page info (same as TJ.getInsPageInfo)
          const apiRequestData = {
            id: "send-request",
            url: "https://spider.codatta.io/api/app/ins/next",
            params: {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            },
          };

          console.log("Background: Making API request:", apiRequestData);

          // Wrap the callback-based API call in a Promise
          const apiResult = await new Promise((resolve) => {
            a(apiRequestData, resolve);
          });

          console.log("Background: API result:", apiResult);

          // Check automation state after API call completes
          if (automationState.stopFlag || !automationState.isRunning) {
            console.log(
              "Background: Automation stopped during API call, aborting"
            );
            return;
          }

          if (!apiResult || !apiResult.success) {
            console.log("Background: API request failed:", apiResult);
            return;
          }

          const freshPageInfo = apiResult.data || apiResult;
          console.log(
            "Background: Received fresh page info from API:",
            freshPageInfo
          );

          if (
            freshPageInfo &&
            freshPageInfo.tasks &&
            freshPageInfo.tasks.length > 0
          ) {
            // Final check before restarting automation
            if (automationState.stopFlag || !automationState.isRunning) {
              console.log(
                "Background: Automation stopped before restarting with new tasks, aborting"
              );
              return;
            }

            console.log(
              "Background: Got new tasks, continuing automation:",
              freshPageInfo.tasks
            );

            // Update config with new tasks
            const storage = await chrome.storage.local.get([
              "automationConfig",
            ]);
            const config = storage.automationConfig || {};
            config.tasks = freshPageInfo.tasks;

            // Update other config parameters from fresh API response
            config.load_comment_count = freshPageInfo.load_comment_count;
            config.profile_timeout = freshPageInfo.profile_timeout;
            config.post_timeout = freshPageInfo.post_timeout;
            config.next_step_timeout = freshPageInfo.next_step_timeout;
            config.get_html_type = freshPageInfo.get_html_type;

            await chrome.storage.local.set({ automationConfig: config });

            // Get the automation tab and restart automation with new tasks
            const currentTabId = automationState.currentTabId;

            if (currentTabId) {
              // Check automation state right before navigation
              if (automationState.stopFlag || !automationState.isRunning) {
                console.log(
                  "Background: Automation stopped before navigation to new tasks, aborting"
                );
                return;
              }

              console.log(
                "Background: Restarting automation with new tasks on tab:",
                currentTabId
              );

              // Navigate directly to the first new task
              const firstTask = freshPageInfo.tasks[0];
              console.log(
                "Background: Navigating to first new task:",
                firstTask.url
              );

              try {
                await chrome.tabs.update(currentTabId, {
                  url: firstTask.url,
                });

                // Set current task index for the navigation handler
                automationState.currentTaskIndex = 0;
                await chrome.storage.local.set({ automationState });
                console.log("Background: Set task index to 0 for new batch");

                // Wait for navigation and inject automation script
                setTimeout(async () => {
                  // Check if automation is still running before setting up listener
                  if (automationState.stopFlag || !automationState.isRunning) {
                    console.log(
                      "Background: Automation stopped, skipping navigation listener setup"
                    );
                    return;
                  }

                  console.log(
                    "Background: Injecting automation script for new batch"
                  );

                  // Listen for navigation completion and inject script
                  chrome.tabs.onUpdated.addListener(function newBatchListener(
                    updatedTabId,
                    changeInfo,
                    tab
                  ) {
                    if (
                      updatedTabId === currentTabId &&
                      changeInfo.status === "complete"
                    ) {
                      chrome.tabs.onUpdated.removeListener(newBatchListener);

                      // Check automation state when navigation completes
                      if (
                        automationState.stopFlag ||
                        !automationState.isRunning
                      ) {
                        console.log(
                          "Background: Automation stopped during navigation, skipping script injection"
                        );
                        return;
                      }

                      console.log(
                        "Background: Navigation to new batch complete, injecting script"
                      );

                      setTimeout(async () => {
                        // Final check before script injection
                        if (
                          automationState.stopFlag ||
                          !automationState.isRunning
                        ) {
                          console.log(
                            "Background: Automation stopped before script injection, aborting"
                          );
                          return;
                        }

                        try {
                          const storage = await chrome.storage.local.get([
                            "automationConfig",
                            "userProfile",
                          ]);
                          const config = storage.automationConfig || {};
                          const userProfile = storage.userProfile || {};

                          // Inject automation script for the new batch
                          await injectTaskAutomation(
                            currentTabId,
                            config,
                            userProfile
                          );
                        } catch (error) {
                          console.error(
                            "Background: Error injecting script for new batch:",
                            error
                          );
                        }
                      }, 1000);
                    }
                  });
                }, 500);
              } catch (navigationError) {
                console.error(
                  "Background: Error navigating to new task:",
                  navigationError
                );
                // Try to get the tab info to see if it still exists
                try {
                  const tab = await chrome.tabs.get(currentTabId);
                  console.log(
                    "Background: Tab exists, retrying navigation:",
                    tab
                  );
                  await chrome.tabs.update(currentTabId, {
                    url: firstTask.url,
                  });

                  // Inject script after navigation
                  setTimeout(() => {
                    chrome.tabs.onUpdated.addListener(function retryListener(
                      updatedTabId,
                      changeInfo,
                      tab
                    ) {
                      if (
                        updatedTabId === currentTabId &&
                        changeInfo.status === "complete"
                      ) {
                        chrome.tabs.onUpdated.removeListener(retryListener);
                        setTimeout(async () => {
                          try {
                            const storage = await chrome.storage.local.get([
                              "automationConfig",
                              "userProfile",
                            ]);
                            const config = storage.automationConfig || {};
                            const userProfile = storage.userProfile || {};
                            await injectTaskAutomation(
                              currentTabId,
                              config,
                              userProfile
                            );
                          } catch (error) {
                            console.error(
                              "Background: Error injecting script after retry:",
                              error
                            );
                          }
                        }, 1000);
                      }
                    });
                  }, 500);
                } catch (tabError) {
                  console.error("Background: Tab no longer exists:", tabError);
                  // Find any Instagram tab or create new one
                  const tabs = await chrome.tabs.query({
                    url: "*://www.instagram.com/*",
                  });
                  if (tabs.length > 0) {
                    const instagramTab = tabs[0];
                    console.log(
                      "Background: Using existing Instagram tab:",
                      instagramTab.id
                    );
                    automationState.currentTabId = instagramTab.id;
                    await chrome.tabs.update(instagramTab.id, {
                      url: firstTask.url,
                    });

                    // Inject script after navigation
                    setTimeout(() => {
                      chrome.tabs.onUpdated.addListener(
                        function existingTabListener(
                          updatedTabId,
                          changeInfo,
                          tab
                        ) {
                          if (
                            updatedTabId === instagramTab.id &&
                            changeInfo.status === "complete"
                          ) {
                            chrome.tabs.onUpdated.removeListener(
                              existingTabListener
                            );
                            setTimeout(async () => {
                              try {
                                const storage = await chrome.storage.local.get([
                                  "automationConfig",
                                  "userProfile",
                                ]);
                                const config = storage.automationConfig || {};
                                const userProfile = storage.userProfile || {};
                                await injectTaskAutomation(
                                  instagramTab.id,
                                  config,
                                  userProfile
                                );
                              } catch (error) {
                                console.error(
                                  "Background: Error injecting script on existing tab:",
                                  error
                                );
                              }
                            }, 1000);
                          }
                        }
                      );
                    }, 500);
                  } else {
                    console.log("Background: Creating new tab for automation");
                    const newTab = await chrome.tabs.create({
                      url: firstTask.url,
                    });
                    automationState.currentTabId = newTab.id;

                    // Inject script after new tab loads
                    setTimeout(() => {
                      chrome.tabs.onUpdated.addListener(function newTabListener(
                        updatedTabId,
                        changeInfo,
                        tab
                      ) {
                        if (
                          updatedTabId === newTab.id &&
                          changeInfo.status === "complete"
                        ) {
                          chrome.tabs.onUpdated.removeListener(newTabListener);
                          setTimeout(async () => {
                            try {
                              const storage = await chrome.storage.local.get([
                                "automationConfig",
                                "userProfile",
                              ]);
                              const config = storage.automationConfig || {};
                              const userProfile = storage.userProfile || {};
                              await injectTaskAutomation(
                                newTab.id,
                                config,
                                userProfile
                              );
                            } catch (error) {
                              console.error(
                                "Background: Error injecting script on new tab:",
                                error
                              );
                            }
                          }, 1000);
                        }
                      });
                    }, 500);
                  }
                  await chrome.storage.local.set({ automationState });
                }
              }
            } else {
              console.log(
                "Background: No current tab ID, trying to find automation tab"
              );
              // Try to find an Instagram tab
              const tabs = await chrome.tabs.query({
                url: "*://www.instagram.com/*",
              });
              if (tabs.length > 0) {
                const instagramTab = tabs[0];
                console.log(
                  "Background: Found Instagram tab:",
                  instagramTab.id
                );
                automationState.currentTabId = instagramTab.id;
                const firstTask = freshPageInfo.tasks[0];
                await chrome.tabs.update(instagramTab.id, {
                  url: firstTask.url,
                });
                automationState.currentTaskIndex = 0;
                await chrome.storage.local.set({ automationState });

                // Inject script after navigation
                setTimeout(() => {
                  chrome.tabs.onUpdated.addListener(function foundTabListener(
                    updatedTabId,
                    changeInfo,
                    tab
                  ) {
                    if (
                      updatedTabId === instagramTab.id &&
                      changeInfo.status === "complete"
                    ) {
                      chrome.tabs.onUpdated.removeListener(foundTabListener);
                      setTimeout(async () => {
                        try {
                          const storage = await chrome.storage.local.get([
                            "automationConfig",
                            "userProfile",
                          ]);
                          const config = storage.automationConfig || {};
                          const userProfile = storage.userProfile || {};
                          await injectTaskAutomation(
                            instagramTab.id,
                            config,
                            userProfile
                          );
                        } catch (error) {
                          console.error(
                            "Background: Error injecting script on found tab:",
                            error
                          );
                        }
                      }, 1000);
                    }
                  });
                }, 500);
              } else {
                console.log("Background: Creating new tab for automation");
                const firstTask = freshPageInfo.tasks[0];
                const newTab = await chrome.tabs.create({ url: firstTask.url });
                automationState.currentTabId = newTab.id;
                automationState.currentTaskIndex = 0;
                await chrome.storage.local.set({ automationState });

                // Inject script after new tab loads
                setTimeout(() => {
                  chrome.tabs.onUpdated.addListener(
                    function finalNewTabListener(
                      updatedTabId,
                      changeInfo,
                      tab
                    ) {
                      if (
                        updatedTabId === newTab.id &&
                        changeInfo.status === "complete"
                      ) {
                        chrome.tabs.onUpdated.removeListener(
                          finalNewTabListener
                        );
                        setTimeout(async () => {
                          try {
                            const storage = await chrome.storage.local.get([
                              "automationConfig",
                              "userProfile",
                            ]);
                            const config = storage.automationConfig || {};
                            const userProfile = storage.userProfile || {};
                            await injectTaskAutomation(
                              newTab.id,
                              config,
                              userProfile
                            );
                          } catch (error) {
                            console.error(
                              "Background: Error injecting script on final new tab:",
                              error
                            );
                          }
                        }, 1000);
                      }
                    }
                  );
                }, 500);
              }
            }
          } else {
            console.log(
              "Background: No new tasks available from API, automation completed"
            );

            // Notify completion
            try {
              chrome.runtime.sendMessage({
                id: "automation-completed",
                data: {
                  message: "All tasks completed, no more URLs available",
                },
              });
            } catch (error) {
              console.log("Background: Automation fully completed");
            }
          }
        } catch (error) {
          console.error(
            "Background: Error fetching fresh URLs from API:",
            error
          );
          console.log(
            "Background: No API available or error - automation completed"
          );

          // Notify completion - no fallback to sidepanel for true independence
          try {
            chrome.runtime.sendMessage({
              id: "automation-completed",
              data: {
                message: "All tasks completed, API unavailable for new URLs",
              },
            });
          } catch (error) {
            console.log("Background: Automation fully completed");
          }
        }
      }, 2000);

      sendResponse({ success: true });
    } catch (error) {
      console.error(
        "Background: Error in handleUpdateCompletedLinkList:",
        error
      );
      sendResponse({ success: false, error: error.message });
    }
  }

  async function handleGetCurrentPoints(message, sender, sendResponse) {
    console.log("Background: Received get-current-points message");

    try {
      const storage = await chrome.storage.local.get([
        "currentPoints",
        "todayPoints",
        "totalEarning",
      ]);

      console.log("Background: Retrieved points from storage:", storage);

      sendResponse({
        success: true,
        data: {
          currentPoints: storage.currentPoints || 0,
          todayPoints: storage.todayPoints || 0,
          totalEarning: storage.totalEarning || 0,
        },
      });
    } catch (error) {
      console.error("Background: Error getting current points:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async function handleResetClaimedPoints(message, sender, sendResponse) {
    console.log("Background: Received reset-claimed-points message");

    try {
      // Reset current points after successful claim
      await chrome.storage.local.set({
        currentPoints: 0,
        lastClaim: Date.now(),
      });

      console.log("Background: Points reset after claim");

      // Notify sidepanel about the points reset
      notifyAutomationStateChange("points-updated", {
        currentPoints: 0,
        pointsReset: true,
      });

      sendResponse({ success: true });
    } catch (error) {
      console.error("Background: Error resetting claimed points:", error);
      sendResponse({ success: false, error: error.message });
    }
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
  ),
    chrome.runtime.onMessage.addListener(function (e, s, t) {
      var o;
      const { id: i } = e,
        c =
          ((null == e ? void 0 : e.tabId) ||
            (null == (o = s.tab) ? void 0 : o.id)) ??
          0;

      console.log("Background: Received message:", i, "from tab:", c);

      switch (i) {
        case "send-request":
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
        case "ins-login":
          handleInsLogin(e, t);
          break;
        case "ins-appeal":
          handleInsAppeal(e, t);
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
        case "get-automation-state":
          t({ success: true, data: automationState });
          break;
        case "stop-automation":
          handleStopAutomation(t);
          break;
        case "navigate-to-url":
          handleNavigateToUrl(e, s, t);
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
    }),
    chrome.action.onClicked.addListener(async (e) => {
      n(e.id);
    }),
    chrome.contextMenus.create({
      contexts: ["all"],
      id: "create-submission",
      title: "create submission",
    }),
    chrome.contextMenus.onClicked.addListener(async (e, t) => {
      await chrome.sidePanel.open({ tabId: null == t ? void 0 : t.id }, () => {
        s = !0;
      });
    }),
    chrome.webRequest.onCompleted.addListener(
      (e) => {
        chrome.runtime.sendMessage({ id: "check-request", data: e });
      },
      { urls: ["https://www.instagram.com/*", "https://www.facebook.com/*"] }
    );
})();
