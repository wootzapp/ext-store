(function () {
  // 定义全局标志，防止重复初始化
  window._twitterApiInterceptorInitialized =
    window._twitterApiInterceptorInitialized || false;

  const TWITTER_API_PATTERNS = [
    "HomeTimeline",
    "HomeLatestTimeline",
    "SidebarUserRecommendations",
    "ConnectTabTimeline",
    "ExploreSidebar",
    "UserByScreenName",
    "Likes",
    "UserTweetsAndReplies",
    "Bookmarks",
    "Following",
    "Followers",
  ];

  // 通用方法：去除URL中的参数，只保留路径部分
  function removeUrlParameters(url) {
    if (!url) return url;
    return url.split("?")[0];
  }

  // 通用的Twitter API URL检测函数
  function isTwitterApiUrl(url) {
    if (!url) return false;
    if (!url.includes("/api/graphql")) {
      return false;
    }
    // 根据类型返回匹配结果
    return TWITTER_API_PATTERNS.some((pattern) => url.includes(pattern));
  }

  // 发送数据到content script，根据URL类型自动确定消息类型
  function sendDataToContentScript(url, responseText) {
    // 去除URL中的参数
    const originUrl = removeUrlParameters(url);

    // 🔍 DETAILED LOGGING: Data capture
    console.log("🔥 [TREX-INJECT] 📊 TWITTER API DATA CAPTURED:");
    console.log("📍 [TREX-INJECT] URL:", originUrl);
    console.log(
      "📏 [TREX-INJECT] Response Size:",
      responseText ? responseText.length : 0,
      "chars"
    );
    console.log("⏰ [TREX-INJECT] Timestamp:", new Date().toISOString());

    // Try to parse response to show data structure
    try {
      const parsedData = JSON.parse(responseText);
      console.log(
        "📋 [TREX-INJECT] Response Structure:",
        Object.keys(parsedData)
      );
      if (parsedData.data) {
        console.log(
          "🎯 [TREX-INJECT] Data Keys:",
          Object.keys(parsedData.data)
        );
      }
    } catch (e) {
      console.log("⚠️ [TREX-INJECT] Response not JSON parseable");
    }

    // 发送消息
    window.postMessage(
      {
        type: "TREX_TWITTER_API_DATA",
        content: {
          originUrl: originUrl,
          response: responseText,
        },
        timestamp: Date.now(),
      },
      "*"
    );

    console.log(
      "📤 [TREX-INJECT] ✅ Data sent to content script via postMessage"
    );
  }

  // 初始化Twitter API拦截器
  function initTwitterApiInterceptor() {
    // 如果已经初始化过，则跳过
    if (window._twitterApiInterceptorInitialized) {
      console.log("⚠️ API拦截器已经初始化过，跳过");
      return;
    }

    console.log("🔄 开始初始化API拦截器...");

    // 1. 拦截XMLHttpRequest
    interceptXHR();

    console.log("🎉 API拦截器已成功注入，等待请求...");
    window._twitterApiInterceptorInitialized = true;
  }

  // 拦截XMLHttpRequest
  function interceptXHR() {
    console.log("🔄 开始拦截XMLHttpRequest...");

    // 保存原始的XMLHttpRequest
    const originalXHR = window.XMLHttpRequest;

    // 创建拦截函数
    function XHRInterceptor() {
      const xhr = new originalXHR();

      // 覆盖open方法
      const originalOpen = xhr.open;
      xhr.open = function () {
        this._method = arguments[0];
        this._url = arguments[1];

        return originalOpen.apply(this, arguments);
      };

      // 覆盖send方法
      const originalSend = xhr.send;
      xhr.send = function () {
        const url = this._url || "";

        // 检查是否是我们关心的API类型
        const isTwitterApi = isTwitterApiUrl(url);

        // 如果是我们关心的API请求，添加响应监听器
        if (isTwitterApi) {
          console.log("🎯 [TREX-INJECT] 🔍 INTERCEPTING TWITTER API CALL:");
          console.log("🌐 [TREX-INJECT] Method:", this._method);
          console.log("🔗 [TREX-INJECT] URL:", url);
          console.log("⏳ [TREX-INJECT] Waiting for response...");

          // 添加单一的响应监听器
          this.addEventListener("load", function () {
            try {
              const responseText = this.responseText;
              console.log("✅ [TREX-INJECT] 📥 RESPONSE RECEIVED:");
              console.log("📊 [TREX-INJECT] Status:", this.status);
              console.log(
                "📏 [TREX-INJECT] Response Length:",
                responseText ? responseText.length : 0
              );

              if (responseText && responseText.length > 0) {
                console.log("🚀 [TREX-INJECT] Processing response data...");
                sendDataToContentScript(url, responseText);
              } else {
                console.log("⚠️ [TREX-INJECT] Empty response, skipping");
              }
            } catch (error) {
              console.error("❌ [TREX-INJECT] 处理XHR响应时出错:", error);
            }
          });
        }

        return originalSend.apply(this, arguments);
      };

      return xhr;
    }

    // 替换原始XMLHttpRequest
    window.XMLHttpRequest = XHRInterceptor;
    console.log("✅ XMLHttpRequest拦截器已安装");
  }

  // 立即尝试初始化，不等待消息
  initTwitterApiInterceptor();

  // 监听来自内容脚本的初始化消息
  window.addEventListener("message", function (event) {
    // 确保消息来自我们的扩展
    if (
      event.data &&
      event.data.type === "TREX_INITIALIZE_TWITTER_INTERCEPTOR"
    ) {
      console.log("🚀 准备初始化Twitter API拦截器");
      initTwitterApiInterceptor();
    }
  });

  console.log("✅ myExtension injected!");

  // Add Twitter login detection for background web content
  console.log("🔍 [TREX-INJECT] Setting up Twitter login detection...");

  // Function to detect Twitter login status
  function detectTwitterLogin() {
    console.log("🔍 [TREX-INJECT] Checking Twitter login status...");
    
    // First check: URL-based authentication check
    const currentUrl = window.location.href;
    console.log("🌐 [TREX-INJECT] Current URL:", currentUrl);
    
    // If URL contains login paths, user is definitely not authenticated
    if (currentUrl.includes("/login") || 
        currentUrl.includes("/i/flow/login") || 
        currentUrl.includes("/authenticate")) {
      console.log("❌ [TREX-INJECT] Login URL detected - user not authenticated");
      return false;
    }
    
    // Multiple detection methods
    const loginChecks = [
      // Check for auth cookies
      () => document.cookie.includes("auth_token"),
      () => document.cookie.includes("ct0"),
      // Check for logged-in UI elements
      () =>
        !!document.querySelector(
          '[data-testid="SideNav_AccountSwitcher_Button"]'
        ),
      () => !!document.querySelector('[data-testid="AppTabBar_Home_Link"]'),
      () => !!document.querySelector('[aria-label="Home timeline"]'),
      () => !!document.querySelector('[data-testid="primaryColumn"]'),
      () =>
        !!document.querySelector(
          '[data-testid="UserAvatar-Container-unknown"]'
        ),
      () => !!document.querySelector('[data-testid="SideNav_NewTweet_Button"]'),
      // Check for user data in window objects
      () => {
        try {
          return (
            window.__INITIAL_STATE__ &&
            window.__INITIAL_STATE__.entities &&
            window.__INITIAL_STATE__.entities.users
          );
        } catch (e) {
          return false;
        }
      },
      // Check for React props that indicate login
      () => {
        try {
          const reactFiber =
            document.querySelector("#react-root")?._reactInternalInstance;
          return (
            reactFiber && JSON.stringify(reactFiber).includes("isLoggedIn")
          );
        } catch (e) {
          return false;
        }
      },
    ];

    const results = loginChecks.map((check, index) => {
      try {
        const result = check();
        console.log(`🔍 [TREX-INJECT] Login check ${index + 1}:`, result);
        return result;
      } catch (e) {
        console.log(`❌ [TREX-INJECT] Login check ${index + 1} failed:`, e);
        return false;
      }
    });

    const isLoggedIn = results.some((result) => result === true);
    console.log("🎯 [TREX-INJECT] Final login status:", isLoggedIn);
    console.log("📊 [TREX-INJECT] Check results:", results);

    return isLoggedIn;
  }

  // Listen for login check requests
  window.addEventListener("message", function (event) {
    if (event.data && event.data.type === "TREX_CHECK_TWITTER_LOGIN_INJECT") {
      console.log("📥 [TREX-INJECT] Received login check request");

      setTimeout(() => {
        const isLoggedIn = detectTwitterLogin();

        window.postMessage(
          {
            type: "TREX_TWITTER_LOGIN_STATUS_INJECT",
            isLoggedIn: isLoggedIn,
            timestamp: Date.now(),
            url: window.location.href,
            source: "x-api-inject",
          },
          "*"
        );

        console.log("📤 [TREX-INJECT] Sent login status response:", isLoggedIn);
      }, 500); // Wait for page to load
    }
  });

  console.log("✅ [TREX-INJECT] Twitter login detection ready");
})();
