/* global chrome */
!(function () {
  "use strict";
  const e = {
    manifest_version: 3,
    name: "Codatta Clip",
    version: "1.1.9",
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
    content_scripts: [
      {
        js: ["browser-icon.js"],
        matches: ["<all_urls>"],
      },
    ],

    web_accessible_resources: [
      {
        resources: ["assets/*", "signin.js", "browser-icon.js"],
        matches: ["<all_urls>"],
      },
    ],
    externally_connectable: {
      matches: ["<all_urls>"],
    },
    permissions: [
      "activeTab",
      "storage",
      "contextMenus",
      "scripting",
      "webRequest",
    ],
    host_permissions: ["<all_urls>"],
    background: {
      service_worker: "background.js",
    },
  };
  let s = !1;
  async function t(s) {
    console.log("[BACKGROUND] Making fetch request to:", s.url);
    const { params: t, url: a } = s,
      n = await chrome.storage.local.get("auth");
    console.log("[BACKGROUND] Auth token exists:", !!n.auth);
    console.log(
      "[BACKGROUND] Auth token details:",
      n.auth ? "Present" : "Missing"
    );
    t.headers = Object.assign(t.headers, n.auth, {
      "x-client": `${e.name}@${e.version}`,
    });
    console.log("[BACKGROUND] Request headers:", t.headers);
    const o = await fetch(a, t),
      i = o.headers.get("content-type");
    let c = null;
    console.log("[BACKGROUND] Response status:", o.status);
    console.log("[BACKGROUND] Response content-type:", i);
    return (
      (c =
        "application/json" === i
          ? await o.json()
          : (null == i ? void 0 : i.includes("text/"))
          ? await o.text()
          : await o.blob()),
      console.log("[BACKGROUND] Response data:", c),
      c
    );
  }
  async function a(e, s) {
    console.log(
      "[BACKGROUND] API request received:",
      e.id || "unnamed",
      "URL:",
      e.url
    );
    const { params: a, url: n, cache: o, auth: i = !0 } = e;

    const authData = await chrome.storage.local.get("auth");
    console.log(
      "[BACKGROUND] Chrome storage - auth retrieval for API request:",
      {
        hasAuth: !!authData.auth,
        hasToken: !!(authData.auth && authData.auth.token),
        hasAuthToken: !!(authData.auth && authData.auth.auth_token),
        hasUid: !!(authData.auth && authData.auth.uid),
        timestamp: new Date().toISOString(),
      }
    );

    console.log("[BACKGROUND] Auth check - token exists:", !!authData.auth);
    console.log("[BACKGROUND] Auth required for this request:", i);

    if (!authData.auth && i) {
      console.log("[BACKGROUND] No auth token found, returning error 1003");
      return void s({
        errorCode: 1003,
        errorMessage: "Invalid auth token!",
        success: !1,
      });
    }
    const c = `${a.method}:${n}`,
      r = await chrome.storage.local.get(c);
    console.log("[BACKGROUND] Cache key:", c, "Cache exists:", !!r[c]);

    if (o && r[c]) {
      console.log("[BACKGROUND] Serving from cache");
      s(r[c]);
      const a = await t(e);
      await chrome.storage.local.set({
        [c]: a,
      });
    } else {
      console.log("[BACKGROUND] Making fresh API call");
      const a = await t(e);
      s(a),
        o &&
          chrome.storage.local.set({
            [c]: a,
          });
    }
  }
  function n(e) {
    // Popup mode - no side panel opening needed
    // Extension popup will open automatically when icon is clicked
  }
  chrome.runtime.onMessageExternal.addListener((e, s, t) => {
    console.log(
      "[BACKGROUND] External message received:",
      e.id,
      "from:",
      s.origin,
      "sender:",
      s
    );
    console.log("[BACKGROUND] Full message object:", e);
    console.log(
      "[BACKGROUND] Callback function exists:",
      typeof t === "function"
    );

    if ("hello-extension" === e.id) {
      console.log(
        "[BACKGROUND] Hello extension message - responding with success"
      );
      t("success");
      return true;
    } else if ("send-request" === e.id) {
      console.log("[BACKGROUND] Send request message");
      a(e, t);
      return true;
    } else if ("web-login" === e.id) {
      console.log("[BACKGROUND] Web login message received");
      (async function (e, s) {
        const { params: t } = e;
        console.log("[BACKGROUND] Storing auth token:", {
          token: t.token ? "Present" : "Missing",
          uid: t.uid ? "Present" : "Missing",
          auth: t.auth ? "Present" : "Missing",
        });

        console.log(
          "[BACKGROUND] Chrome storage - before auth save (web-login):",
          {
            timestamp: new Date().toISOString(),
          }
        );

        await chrome.storage.local.set({
          auth: {
            token: t.token,
            uid: t.uid,
            auth_token: t.auth,
            showInviterCode: !!(null == t ? void 0 : t.showInviterCode),
          },
        });

        console.log(
          "[BACKGROUND] Chrome storage - auth saved successfully (web-login):",
          {
            hasToken: !!t.token,
            hasUid: !!t.uid,
            hasAuthToken: !!t.auth,
            showInviterCode: !!(null == t ? void 0 : t.showInviterCode),
            timestamp: new Date().toISOString(),
          }
        );

        console.log("[BACKGROUND] Auth token stored successfully");
        chrome.runtime.sendMessage({
          id: "inject-reload",
        });
        s("success");
      })(e, t);
      return true;
    } else {
      console.log("[BACKGROUND] Unknown external message type:", e.id);
      return false;
    }
  }),
    chrome.runtime.onMessage.addListener(function (e, s, t) {
      var o;
      const { id: i } = e,
        c =
          ((null == e ? void 0 : e.tabId) ||
            (null == (o = s.tab) ? void 0 : o.id)) ??
          0;
      console.log("[BACKGROUND] Internal message received:", i, "from tab:", c);

      switch (i) {
        case "send-request":
          console.log("[BACKGROUND] Handling send-request");
          a(e, t);
          break;
        case "screen-capture":
          console.log("[BACKGROUND] Handling screen-capture");
          !(async function (e, s, t) {
            try {
              const [e] = await chrome.windows.getAll({
                  populate: !0,
                }),
                s = e.tabs.find((e) => e.active);
              if (!s) {
                console.log(
                  "[BACKGROUND] No active tab found for screen capture"
                );
                return void t({
                  error: "No active tab found.",
                });
              }
              console.log("[BACKGROUND] Capturing screen from tab:", s.id);
              t(await chrome.tabs.captureVisibleTab(s.windowId));
            } catch (a) {
              console.error("[BACKGROUND] Screen capture error:", a);
            }
          })(0, 0, t);
          break;
        case "inject-logout":
          console.log("[BACKGROUND] Handling logout - removing auth token");
          !(async function (e) {
            console.log("[BACKGROUND] Chrome storage - before auth removal:", {
              timestamp: new Date().toISOString(),
            });

            // Check current auth state before removal
            const currentAuth = await chrome.storage.local.get("auth");
            console.log(
              "[BACKGROUND] Chrome storage - current auth before removal:",
              {
                hasAuth: !!currentAuth.auth,
                hasToken: !!(currentAuth.auth && currentAuth.auth.token),
                hasAuthToken: !!(
                  currentAuth.auth && currentAuth.auth.auth_token
                ),
                hasUid: !!(currentAuth.auth && currentAuth.auth.uid),
                timestamp: new Date().toISOString(),
              }
            );

            await chrome.storage.local.remove("auth");

            console.log(
              "[BACKGROUND] Chrome storage - auth removed successfully:",
              {
                timestamp: new Date().toISOString(),
              }
            );

            // Verify removal
            const verifyAuth = await chrome.storage.local.get("auth");
            console.log(
              "[BACKGROUND] Chrome storage - verification after removal:",
              {
                hasAuth: !!verifyAuth.auth,
                timestamp: new Date().toISOString(),
              }
            );

            console.log("[BACKGROUND] Auth token removed successfully");
            e("success");
          })(t);
          break;
        case "show-signin":
          console.log(
            "[BACKGROUND] Handling show-signin - injecting signin script"
          );
          !(async function (e, s, t) {
            await chrome.scripting.executeScript({
              target: {
                tabId: t,
              },
              world: "MAIN",
              files: ["signin.js"],
            });
            console.log("[BACKGROUND] Signin script injected successfully");
            s("success");
          })(0, t, c);
          break;
        case "update-completed-link-list":
          console.log("[BACKGROUND] Handling update-completed-link-list");
          !(function (e, s, t) {
            chrome.runtime.sendMessage({
              id: "update-completed-result",
              data: t,
            });
            s("success");
          })(0, t, e.data);
          break;
        case "click-browser-icon":
          console.log("[BACKGROUND] Handling click-browser-icon");
          n(c);
          break;
        case "continue-crawl":
          console.log("[BACKGROUND] Handling continue-crawl");
          chrome.runtime.sendMessage({
            id: "continue-crawl-res",
          });
          break;
        default:
          console.log("[BACKGROUND] Unknown message type:", i);
          t({
            data: "miao?",
          });
      }
      return !0;
    }),
    chrome.action.onClicked.addListener(async (e) => {
      console.log(
        "[BACKGROUND] Extension icon clicked - popup mode, no action needed"
      );
      // Popup mode - popup opens automatically, no additional action needed
    }),
    chrome.contextMenus.create({
      contexts: ["all"],
      id: "create-submission",
      title: "create submission",
    }),
    chrome.contextMenus.onClicked.addListener(async (e, t) => {
      console.log("[BACKGROUND] Context menu clicked:", e.menuItemId);
      // Popup mode - context menu could potentially open popup programmatically if needed
      // For now, user needs to click extension icon to open popup
    }),
    chrome.webRequest.onCompleted.addListener(
      (e) => {
        console.log("[BACKGROUND] Web request completed:", e.url);
        console.log(
          "[BACKGROUND] Full request event object:",
          JSON.stringify(e, null, 2)
        );
        chrome.runtime.sendMessage({
          id: "check-request",
          data: e,
        });
      },
      {
        urls: ["https://www.instagram.com/*", "https://www.facebook.com/*"],
      }
    );

  // Add startup logging
  console.log("[BACKGROUND] Background script loaded and initialized");
  console.log("[BACKGROUND] Extension ID:", chrome.runtime.id);
  console.log("[BACKGROUND] Manifest version:", e.manifest_version);

  // Log extension startup and check initial auth state
  chrome.storage.local.get("auth").then((result) => {
    console.log("[BACKGROUND] Initial auth state check:", {
      hasAuth: !!result.auth,
      hasToken: !!(result.auth && result.auth.auth_token),
      timestamp: new Date().toISOString(),
    });
  });

  // Test the external message listener setup
  console.log("[BACKGROUND] External message listener registered");
  console.log("[BACKGROUND] Externally connectable matches: <all_urls>");
})();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[BACKGROUND] Received message:", message);

  if (message.url && message.tabId) {
    console.log("[BACKGROUND] URL:", message.url);
    console.log("[BACKGROUND] Tab ID:", message.tabId);

    // Use the tab ID that was sent
    chrome.tabs.update(message.tabId, { url: message.url });

    sendResponse({ success: true });
  }

  return true;
});
