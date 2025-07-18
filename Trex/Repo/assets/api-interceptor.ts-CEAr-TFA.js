var w = Object.defineProperty;
var g = (o, e, t) =>
  e in o
    ? w(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t })
    : (o[e] = t);
var r = (o, e, t) => g(o, typeof e != "symbol" ? e + "" : e, t);
import { i as l, b as u } from "./common-DKP7UT3W.js";
import { E as a } from "./actions-CxosgIhI.js";
import "./_commonjsHelpers-BosuxZz1.js";
class p {
  constructor() {
    r(this, "interceptorInjected", !1);
    r(this, "messageHandler", null);
    r(this, "isInitialized", !1);
  }
  injectApiInterceptor() {
    if (!this.interceptorInjected)
      try {
        const e = document.getElementById("trex-youtube-interceptor");
        e &&
          (console.log("[YouTube API] 发现已存在的脚本标签，先移除"),
          e.remove(),
          (this.interceptorInjected = !1));
        const t = document.createElement("script");
        if (
          ((t.src = chrome.runtime.getURL("youtube-api-inject.js")),
          (t.id = "trex-youtube-interceptor"),
          (t.onload = () => {
            console.log("[YouTube API] ✅ 脚本加载成功，即将移除script标签"),
              t.remove(),
              window.postMessage(
                {
                  type: "TREX_INITIALIZE_YOUTUBE_INTERCEPTOR",
                  timestamp: Date.now(),
                },
                "*"
              ),
              (this.interceptorInjected = !0);
          }),
          (t.onerror = (i) => {
            console.error("[YouTube API] ❌ 脚本加载失败:", i);
          }),
          document.documentElement)
        )
          document.documentElement.appendChild(t);
        else {
          const i = new MutationObserver(() => {
            document.documentElement &&
              (document.documentElement.appendChild(t), i.disconnect());
          });
          i.observe(document, { childList: !0, subtree: !0 });
        }
        console.log("[YouTube API] 📝 已添加脚本标签或设置监听器");
      } catch (e) {
        console.error("[YouTube API] ❌ 脚本注入失败:", e);
      }
  }
  async handleYouTubeRequestData(e, t = 0) {
    try {
      await new Promise((i, n) => {
        chrome.runtime.sendMessage(
          { type: a.YouTubeSendApiData, data: e },
          (I) => {
            if (chrome.runtime.lastError) {
              n(chrome.runtime.lastError);
              return;
            }
            i();
          }
        ),
          setTimeout(() => {
            n(new Error("消息发送超时"));
          }, 3e3);
      }),
        console.log("[YouTube API] ✅ 数据发送成功");
    } catch {
      if (t < 2)
        return (
          await new Promise((n) => setTimeout(n, 1e3)),
          this.handleYouTubeRequestData(e, t + 1)
        );
      console.log("[YouTube API] ❌ 达到最大重试次数，放弃发送");
    }
  }
  async ensureInitialized(e) {
    if (this.isInitialized) {
      console.log("[YouTube API] 拦截器已初始化，无需重复初始化");
      return;
    }
    await this.init(e);
  }
  async init(e) {
    if (
      (console.log("[YouTube API] 🚀 开始初始化，URL:", e),
      !e.includes("youtube.com"))
    ) {
      console.log("[YouTube API] ⚠️ 不是YouTube网站，跳过初始化");
      return;
    }
    if (this.isInitialized) {
      console.log("[YouTube API] ⚠️ 已经初始化过，跳过");
      return;
    }
    try {
      this.cleanup(),
        this.injectApiInterceptor(),
        (this.messageHandler = (t) => {
          var i;
          t.source !== window ||
            t.data.type !== "TREX_YOUTUBE_API_DATA" ||
            this.handleYouTubeRequestData(
              (i = t.data) == null ? void 0 : i.content
            );
        }),
        window.addEventListener("message", this.messageHandler),
        console.log("[YouTube API] 👂 已添加消息监听器"),
        console.log("[YouTube API] 📣 发送初始化消息到页面脚本"),
        window.postMessage(
          {
            type: "TREX_INITIALIZE_YOUTUBE_INTERCEPTOR",
            timestamp: Date.now(),
          },
          "*"
        ),
        (this.isInitialized = !0),
        console.log("[YouTube API] ✅ 初始化完成");
    } catch (t) {
      console.error("[YouTube API] ❌ 初始化失败:", t);
    }
  }
  cleanup() {
    console.log("[YouTube API] 开始清理"),
      window.postMessage(
        { type: "TREX_CLEANUP_YOUTUBE_INTERCEPTOR", timestamp: Date.now() },
        "*"
      ),
      this.messageHandler &&
        (console.log("[YouTube API] 移除消息监听器"),
        window.removeEventListener("message", this.messageHandler),
        (this.messageHandler = null));
    const e = document.getElementById("trex-youtube-interceptor");
    e && (console.log("[YouTube API] 移除脚本标签"), e.remove()),
      (this.interceptorInjected = !1),
      (this.isInitialized = !1),
      console.log("[YouTube API] 清理完成");
  }
}
const s = new p();
class h {
  constructor() {
    r(this, "interceptorInjected", !1);
    r(this, "messageHandler", null);
    r(this, "isInitialized", !1);
  }
  injectApiInterceptor() {
    console.log("🔥 [FLOW-TRACE] 📋 INJECT API INTERCEPTOR CALLED:");

    if (this.interceptorInjected) {
      console.log("⚠️ [FLOW-TRACE] Interceptor already injected - skipping");
      return;
    }

    console.log("🚀 [FLOW-TRACE] Starting API interceptor injection...");

    try {
      // Check for existing script
      const e = document.getElementById("trex-twitter-interceptor");
      if (e) {
        console.log("🔄 [FLOW-TRACE] Found existing script tag - removing...");
        e.remove();
        this.interceptorInjected = !1;
      }

      // Create new script element
      console.log("🔄 [FLOW-TRACE] Creating new script element...");
      const t = document.createElement("script");

      const scriptUrl = chrome.runtime.getURL("x-api-inject.js");
      console.log("📍 [FLOW-TRACE] Script URL:", scriptUrl);

      t.src = scriptUrl;
      t.id = "trex-twitter-interceptor";

      t.onload = () => {
        console.log("✅ [FLOW-TRACE] 🎉 INJECT SCRIPT LOADED SUCCESSFULLY!");
        console.log("🔄 [FLOW-TRACE] Removing script tag after load...");
        t.remove();

        console.log(
          "🔄 [FLOW-TRACE] Sending initialization message to inject script..."
        );
        window.postMessage(
          {
            type: "TREX_INITIALIZE_TWITTER_INTERCEPTOR",
            timestamp: Date.now(),
          },
          "*"
        );

        this.interceptorInjected = !0;
        console.log("✅ [FLOW-TRACE] Interceptor injection complete!");
      };

      t.onerror = (i) => {
        console.error("❌ [FLOW-TRACE] 💥 INJECT SCRIPT FAILED TO LOAD:", i);
      };

      // Append to document
      if (document.documentElement) {
        console.log(
          "🔄 [FLOW-TRACE] Appending script to document.documentElement..."
        );
        document.documentElement.appendChild(t);
      } else {
        console.log(
          "⚠️ [FLOW-TRACE] document.documentElement not ready - using MutationObserver..."
        );
        const i = new MutationObserver(() => {
          if (document.documentElement) {
            console.log(
              "✅ [FLOW-TRACE] document.documentElement ready - appending script..."
            );
            document.documentElement.appendChild(t);
            i.disconnect();
          }
        });
        i.observe(document, { childList: !0, subtree: !0 });
      }
    } catch (e) {
      console.error("❌ [FLOW-TRACE] 💥 SCRIPT INJECTION FAILED:", e);
    }
  }
  async handleTwitterRequestData(e, t = 0) {
    console.log("🔥 [FLOW-TRACE] ⭐ HANDLE TWITTER REQUEST DATA CALLED!");
    console.log(
      "🎉 [FLOW-TRACE] SUCCESS! Flow reached handleTwitterRequestData function"
    );
    console.log("📊 [FLOW-TRACE] Data Object:", e);
    console.log("🔄 [FLOW-TRACE] Retry Attempt:", t);
    console.log("📏 [FLOW-TRACE] Data exists:", !!e);

    if (e) {
      console.log("🌐 [FLOW-TRACE] Origin URL:", e.originUrl);
      console.log(
        "📐 [FLOW-TRACE] Response length:",
        e.response ? e.response.length : 0
      );

      // Try to parse and show response structure
      if (e.response) {
        try {
          const parsed = JSON.parse(e.response);
          console.log("📋 [FLOW-TRACE] Response keys:", Object.keys(parsed));
        } catch (err) {
          console.log("⚠️ [FLOW-TRACE] Response not JSON:", err.message);
        }
      }
    }

    console.log("🚀 [FLOW-TRACE] Starting chrome.runtime.sendMessage...");

    try {
      await new Promise((i, n) => {
        console.log("📡 [FLOW-TRACE] 🚀 chrome.runtime.sendMessage called");
        console.log("📋 [FLOW-TRACE] Message Type:", a.TwitterSendApiData);
        console.log(
          "📏 [FLOW-TRACE] Data Size:",
          JSON.stringify(e).length,
          "chars"
        );

        chrome.runtime.sendMessage(
          { type: a.TwitterSendApiData, data: e },
          (I) => {
            if (chrome.runtime.lastError) {
              console.error(
                "❌ [FLOW-TRACE] Service Worker Error:",
                chrome.runtime.lastError
              );
              n(chrome.runtime.lastError);
              return;
            }
            console.log("✅ [FLOW-TRACE] Service Worker Response:", I);
            console.log(
              "🎉 [FLOW-TRACE] Message successfully sent to service worker!"
            );
            i();
          }
        );

        setTimeout(() => {
          console.error("⏰ [FLOW-TRACE] Message timeout after 3 seconds");
          n(new Error("消息发送超时"));
        }, 3e3);
      });
    } catch (error) {
      console.error("❌ [FLOW-TRACE] Send failed:", error);
      if (t < 2) {
        console.log("🔄 [FLOW-TRACE] Retrying in 1 second...");
        return (
          await new Promise((n) => setTimeout(n, 1e3)),
          this.handleTwitterRequestData(e, t + 1)
        );
      }
      console.log("❌ [FLOW-TRACE] Max retries reached - giving up");
    }
  }
  async ensureInitialized(e) {
    if (this.isInitialized) {
      console.log("[Twitter时间线] 拦截器已初始化，无需重复初始化");
      return;
    }
    await this.init(e);
  }
  
  executeDataCollectionActions(actions) {
    console.log("🎯 [FLOW-TRACE] 🚀 EXECUTING DATA COLLECTION ACTIONS:", actions);
    
    actions.forEach((action, index) => {
      setTimeout(() => {
        console.log(`🎯 [FLOW-TRACE] Executing action ${index + 1}: ${action}`);
        
        switch (action) {
          case "scroll_timeline":
            console.log("📜 [FLOW-TRACE] Triggering scroll to load timeline...");
            // Progressive scrolling to trigger more API calls
            this.performProgressiveScroll();
            break;
            
          case "navigate_home":
            console.log("🏠 [FLOW-TRACE] Navigating to home timeline...");
            if (window.location.pathname !== "/home") {
              window.location.href = "https://x.com/home";
            }
            break;
            
          case "navigate_following":
            console.log("👥 [FLOW-TRACE] Navigating to following timeline...");
            window.location.href = "https://x.com/following";
            break;
            
          case "refresh_page":
            console.log("🔄 [FLOW-TRACE] Refreshing page to trigger new API calls...");
            window.location.reload();
            break;
            
          case "trigger_refresh":
            console.log("🔄 [FLOW-TRACE] Triggering soft refresh...");
            // Soft refresh by navigating to same page
            const currentUrl = window.location.href;
            window.location.href = currentUrl + "?t=" + Date.now();
            break;
            
          default:
            console.log(`⚠️ [FLOW-TRACE] Unknown action: ${action}`);
        }
      }, index * 2000); // 2 second delay between actions
    });
  }
  
  performProgressiveScroll() {
    console.log("📜 [FLOW-TRACE] Starting progressive scroll sequence...");
    
    // Scroll sequence designed to trigger HomeTimeline API calls
    const scrollSequence = [
      { top: 0, delay: 0 },
      { top: 300, delay: 1000 },
      { top: 600, delay: 2000 },
      { top: 900, delay: 3000 },
      { top: 1200, delay: 4000 },
      { top: 800, delay: 5000 },
      { top: 400, delay: 6000 },
      { top: 0, delay: 7000 },
    ];
    
    scrollSequence.forEach(({ top, delay }) => {
      setTimeout(() => {
        console.log(`📜 [FLOW-TRACE] Scrolling to ${top}px`);
        window.scrollTo({ top: top, behavior: 'smooth' });
        
        // Trigger a small additional scroll to ensure API calls
        setTimeout(() => {
          window.scrollTo({ top: top + 50, behavior: 'smooth' });
        }, 500);
      }, delay);
    });
    
    // Final scroll to top after sequence
    setTimeout(() => {
      console.log("📜 [FLOW-TRACE] Final scroll to top");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 8000);
  }
  
  async init(e) {
    console.log("🔥 [FLOW-TRACE] 🐦 TWITTER INIT CALLED:");
    console.log("📍 [FLOW-TRACE] h.init() called with URL:", e);

    // URL validation
    const isTwitterUrl = e.includes("twitter.com");
    const isXUrl = e.includes("x.com");
    console.log("🔍 [FLOW-TRACE] URL contains 'twitter.com':", isTwitterUrl);
    console.log("🔍 [FLOW-TRACE] URL contains 'x.com':", isXUrl);
    console.log(
      "🔍 [FLOW-TRACE] URL validation passed:",
      isTwitterUrl || isXUrl
    );

    if (!isTwitterUrl && !isXUrl) {
      console.log(
        "❌ [FLOW-TRACE] URL validation FAILED - not Twitter/X website"
      );
      return;
    }

    // Initialization check
    console.log("🔍 [FLOW-TRACE] Is already initialized:", this.isInitialized);
    if (this.isInitialized) {
      console.log("⚠️ [FLOW-TRACE] Already initialized - skipping");
      return;
    }

    console.log(
      "🚀 [FLOW-TRACE] Starting Twitter interceptor initialization..."
    );

    try {
      console.log("🔄 [FLOW-TRACE] Step 1: Calling this.cleanup()...");
      this.cleanup();

      console.log(
        "🔄 [FLOW-TRACE] Step 2: Calling this.injectApiInterceptor()..."
      );
      this.injectApiInterceptor();

      console.log("🔄 [FLOW-TRACE] Step 3: Setting up message handler...");
      this.messageHandler = (t) => {
        var i;
        console.log("🔥 [FLOW-TRACE] 📨 MESSAGE RECEIVED:");
        console.log("📍 [FLOW-TRACE] Message source:", t.source);
        console.log("📍 [FLOW-TRACE] Message origin:", t.origin);
        console.log("📋 [FLOW-TRACE] Message type:", t.data?.type);
        console.log("🔍 [FLOW-TRACE] Is from window:", t.source === window);
        console.log(
          "🔍 [FLOW-TRACE] Is Twitter API data:",
          t.data.type === "TREX_TWITTER_API_DATA"
        );

        if (t.source !== window || t.data.type !== "TREX_TWITTER_API_DATA") {
          console.log("❌ [FLOW-TRACE] Message ignored - wrong source or type");
          return;
        }

        console.log("✅ [FLOW-TRACE] 🎉 TWITTER API DATA MESSAGE ACCEPTED!");
        console.log("📍 [FLOW-TRACE] Source:", t.origin);
        console.log("⏰ [FLOW-TRACE] Timestamp:", new Date().toISOString());

        const content = (i = t.data) == null ? void 0 : i.content;
        if (content) {
          console.log("🌐 [FLOW-TRACE] URL:", content.originUrl);
          console.log(
            "📏 [FLOW-TRACE] Response Size:",
            content.response ? content.response.length : 0,
            "chars"
          );
          console.log("🚀 [FLOW-TRACE] ⭐ CALLING handleTwitterRequestData...");
        }

        this.handleTwitterRequestData(content);
      };

      // Add Chrome runtime message listener for data collection triggers
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "TREX_TRIGGER_TWITTER_DATA_COLLECTION") {
          console.log("🎯 [FLOW-TRACE] 📨 DATA COLLECTION TRIGGER RECEIVED!");
          console.log("📋 [FLOW-TRACE] Actions:", message.actions);
          
          // Execute data collection actions
          this.executeDataCollectionActions(message.actions);
          
          sendResponse({ success: true, message: "Data collection triggered" });
          return true;
        }
      });

      console.log("🔄 [FLOW-TRACE] Step 4: Adding message event listener...");
      window.addEventListener("message", this.messageHandler);

      console.log(
        "🔄 [FLOW-TRACE] Step 5: Sending initialization message to inject script..."
      );
      window.postMessage(
        {
          type: "TREX_INITIALIZE_TWITTER_INTERCEPTOR",
          timestamp: Date.now(),
        },
        "*"
      );

      console.log("🔄 [FLOW-TRACE] Step 6: Setting isInitialized = true...");
      this.isInitialized = !0;

      console.log("✅ [FLOW-TRACE] 🎉 TWITTER INITIALIZATION COMPLETE!");
    } catch (t) {
      console.error("❌ [FLOW-TRACE] 💥 TWITTER INITIALIZATION FAILED:", t);
      console.error("🔍 [FLOW-TRACE] Error details:", t.message);
      console.error("🔍 [FLOW-TRACE] Error stack:", t.stack);
    }
  }
  cleanup() {
    console.log("[Twitter时间线] 开始清理"),
      window.postMessage(
        { type: "TREX_CLEANUP_TWITTER_INTERCEPTOR", timestamp: Date.now() },
        "*"
      ),
      this.messageHandler &&
        (console.log("[Twitter时间线] 移除消息监听器"),
        window.removeEventListener("message", this.messageHandler),
        (this.messageHandler = null));
    const e = document.getElementById("trex-twitter-interceptor");
    e && (console.log("[Twitter时间线] 移除脚本标签"), e.remove()),
      (this.interceptorInjected = !1),
      (this.isInitialized = !1),
      console.log("[Twitter时间线] 清理完成");
  }
}
const c = new h();
let m = null,
  T = null;
const A = () => {
    console.log("🔥 [FLOW-TRACE] 🚀 MAIN INITIALIZATION STARTING:");
    console.log(
      "📍 [FLOW-TRACE] Function A() called - API拦截器 开始初始化API拦截器..."
    );
    console.log("🔄 [FLOW-TRACE] Calling P() for login check...");
    P();
    console.log("🔄 [FLOW-TRACE] Calling f() for URL monitoring...");
    f();
    console.log("🔄 [FLOW-TRACE] Calling b() for storage listeners...");
    b();
    console.log("✅ [FLOW-TRACE] Main initialization complete");
  },
  P = () => {
    console.log("🔥 [FLOW-TRACE] 📋 LOGIN CHECK STARTING:");
    console.log(
      "📡 [FLOW-TRACE] Sending CheckLoginStatus message to background..."
    );

    chrome.runtime.sendMessage({ type: a.CheckLoginStatus }, (o) => {
      const e = o == null ? void 0 : o.success;
      console.log("🔥 [FLOW-TRACE] 📥 LOGIN CHECK RESPONSE:");
      console.log("📊 [FLOW-TRACE] Raw response:", o);
      console.log("✅ [FLOW-TRACE] Login success:", e);

      if (e) {
        const t = window.location.href;
        console.log("🌐 [FLOW-TRACE] Current URL:", t);
        console.log(
          "🚀 [FLOW-TRACE] User is logged in - calling d() with URL..."
        );
        d(t);
      } else {
        console.log(
          "❌ [FLOW-TRACE] User NOT logged in - skipping API interceptor initialization"
        );
      }
    });
  },
  b = () => {
    chrome.storage.onChanged.addListener((o, e) => {
      if (e === "local" && o.trex_login_data) {
        const t = o.trex_login_data.newValue;
        if (t && t.token) {
          console.log("[API拦截器] 检测到用户登录，初始化API拦截器");
          const i = window.location.href;
          d(i);
        } else
          t ||
            (console.log("[API拦截器] 检测到用户登出，清理API拦截器"),
            y(window.location.href));
      }
      if (e === "local" && o.trex_twitter_permission) {
        const t = o.trex_twitter_permission.newValue;
        m && clearTimeout(m),
          (m = setTimeout(() => {
            Y(t);
          }, 100));
      }
      if (e === "local" && o.trex_youtube_permission) {
        const t = o.trex_youtube_permission.newValue;
        T && clearTimeout(T),
          (T = setTimeout(() => {
            R(t);
          }, 100));
      }
    });
  },
  f = () => {
    let o = window.location.href;
    new MutationObserver(() => {
      const t = window.location.href;
      t !== o &&
        (console.log("[API拦截器] URL变化:", { from: o, to: t }),
        (o = t),
        E(t));
    }).observe(document, { subtree: !0, childList: !0 });
  },
  E = (o) => {
    chrome.runtime.sendMessage({ type: a.CheckLoginStatus }, (e) => {
      (e == null ? void 0 : e.success) && _(o);
    });
  },
  _ = (o) => {
    l(o) &&
      chrome.storage.local.get("trex_twitter_permission", (e) => {
        const t = e.trex_twitter_permission;
        t === !0 || t === "true"
          ? (console.log(
              "[API拦截器] Twitter权限开启，初始化Twitter API拦截器"
            ),
            c.ensureInitialized(o))
          : console.log(
              "[API拦截器] Twitter权限未开启，跳过Twitter API拦截器初始化"
            );
      }),
      u(o) &&
        chrome.storage.local.get("trex_youtube_permission", (e) => {
          const t = e.trex_youtube_permission;
          t === !0 || t === "true"
            ? (console.log(
                "[API拦截器] YouTube权限开启，初始化YouTube API拦截器"
              ),
              s.ensureInitialized(o))
            : console.log(
                "[API拦截器] YouTube权限未开启，跳过YouTube API拦截器初始化"
              );
        });
  },
  y = (o) => {
    l(o) && c.cleanup(), u(o) && s.cleanup();
  },
  Y = (o) => {
    const e = window.location.href;
    l(e)
      ? o === !0 || o === "true"
        ? (console.log("[API拦截器] Twitter权限开启，初始化Twitter API拦截器"),
          c.init(e))
        : (console.log("[API拦截器] Twitter权限关闭，清理Twitter API拦截器"),
          c.cleanup())
      : console.log("[API拦截器] 当前不在Twitter网站，跳过Twitter权限处理");
  },
  R = (o) => {
    const e = window.location.href;
    u(e)
      ? o === !0 || o === "true"
        ? (console.log("[API拦截器] YouTube权限开启，初始化YouTube API拦截器"),
          s.init(e))
        : (console.log("[API拦截器] YouTube权限关闭，清理YouTube API拦截器"),
          s.cleanup())
      : console.log("[API拦截器] 当前不在YouTube网站，跳过YouTube权限处理");
  },
  d = (o) => {
    console.log("🔥 [FLOW-TRACE] 🌐 URL-BASED INITIALIZATION:");
    console.log("📍 [FLOW-TRACE] Function d() called with URL:", o);

    // Check if it's Twitter/X
    const isTwitterSite = l(o);
    console.log("🐦 [FLOW-TRACE] Is Twitter/X site (l(o)):", isTwitterSite);

    if (isTwitterSite) {
      console.log(
        "✅ [FLOW-TRACE] Twitter/X site detected - checking permissions..."
      );
      console.log(
        "📡 [FLOW-TRACE] Getting trex_twitter_permission from storage..."
      );

      chrome.storage.local.get("trex_twitter_permission", (e) => {
        const t = e.trex_twitter_permission;
        console.log("🔥 [FLOW-TRACE] 📥 TWITTER PERMISSION CHECK:");
        console.log("📊 [FLOW-TRACE] Raw storage result:", e);
        console.log("🎯 [FLOW-TRACE] Twitter permission value:", t);
        console.log("🔍 [FLOW-TRACE] Permission type:", typeof t);
        console.log("🔍 [FLOW-TRACE] Is true (===):", t === !0);
        console.log("🔍 [FLOW-TRACE] Is 'true' string:", t === "true");
        console.log(
          "🔍 [FLOW-TRACE] Boolean evaluation:",
          t === !0 || t === "true"
        );

        if (t === !0 || t === "true") {
          console.log("✅ [FLOW-TRACE] 🎉 TWITTER PERMISSION ENABLED!");
          console.log(
            "🚀 [FLOW-TRACE] Calling c.init() to initialize Twitter interceptor..."
          );
          c.init(o);
        } else {
          console.log(
            "❌ [FLOW-TRACE] 🚫 TWITTER PERMISSION DISABLED OR MISSING"
          );
          console.log(
            "⚠️ [FLOW-TRACE] This is why Twitter API is not being intercepted!"
          );
        }
      });
    } else {
      console.log(
        "❌ [FLOW-TRACE] Not a Twitter/X site - skipping Twitter check"
      );
    }

    // Check if it's YouTube
    const isYouTubeSite = u(o);
    console.log("📺 [FLOW-TRACE] Is YouTube site (u(o)):", isYouTubeSite);

    if (isYouTubeSite) {
      console.log(
        "✅ [FLOW-TRACE] YouTube site detected - checking permissions..."
      );
      chrome.storage.local.get("trex_youtube_permission", (e) => {
        const t = e.trex_youtube_permission;
        console.log("🔥 [FLOW-TRACE] YouTube permission:", t);

        if (t === !0 || t === "true") {
          console.log(
            "✅ [FLOW-TRACE] YouTube permission enabled - initializing..."
          );
          s.init(o);
        } else {
          console.log("❌ [FLOW-TRACE] YouTube permission disabled");
        }
      });
    } else {
      console.log(
        "❌ [FLOW-TRACE] Not a YouTube site - skipping YouTube check"
      );
    }
  };
console.log("🔥 [FLOW-TRACE] 🚀 API INTERCEPTOR MODULE LOADED!");
console.log("📍 [FLOW-TRACE] Current URL:", window.location.href);

// Check storage immediately to debug permissions
console.log("🔍 [FLOW-TRACE] 🔎 INSPECTING CURRENT STORAGE STATE:");
chrome.storage.local.get(null, (result) => {
  console.log("📊 [FLOW-TRACE] Full storage contents:", result);
  console.log(
    "🐦 [FLOW-TRACE] Twitter permission:",
    result.trex_twitter_permission
  );
  console.log(
    "📺 [FLOW-TRACE] YouTube permission:",
    result.trex_youtube_permission
  );
  console.log("👤 [FLOW-TRACE] Login data exists:", !!result.trex_login_data);
});

console.log("🔄 [FLOW-TRACE] Calling main initialization function A()...");
A();
console.log("✅ [FLOW-TRACE] Module initialization complete");
export { y as cleanupApiInterceptors, A as initApiInterceptors };
