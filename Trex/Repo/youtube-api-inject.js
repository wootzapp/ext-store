(function () {
  // 定义全局标志，防止重复初始化
  window._youtubeApiInterceptorInitialized =
    window._youtubeApiInterceptorInitialized || false;

    const YOUTUBE_API_PATTERNS = [
      "guide?prettyPrint",
      "player?prettyPrint",
    ]

    // 通用方法：去除URL中的参数，只保留路径部分
  function removeUrlParameters(url) {
    if (!url) return url;
    return url.split('?')[0];
  }

  // 通用的YouTube API URL检测函数
  function isYouTubeApiUrl(url) {
    if (!url) return false;
    if (!url.includes("/youtubei/v1")) {
      return false;
    }
    return YOUTUBE_API_PATTERNS.some((pattern) => url.includes(pattern));
  }

  // 发送数据到content script，根据URL类型自动确定消息类型
  function sendDataToContentScript(url, responseText) {
    const originUrl = removeUrlParameters(url);
    // 发送消息
    window.postMessage(
      {
        type: "TREX_YOUTUBE_API_DATA",
        content: {
          originUrl: originUrl,
          response: responseText,
        },
        timestamp: Date.now(),
      },
      "*"
    );
  }

  // 初始化YouTube API拦截器
  function initYouTubeApiInterceptor() {
    // 如果已经初始化过，则跳过
    if (window._youtubeApiInterceptorInitialized) {
      console.log("⚠️ YouTube API拦截器已经初始化过，跳过");
      return;
    }

    console.log("🔄 开始初始化YouTube API拦截器...");
    // 拦截Fetch API
    interceptFetch();

    console.log("🎉 YouTube API拦截器已成功注入，等待请求...");
    window._youtubeApiInterceptorInitialized = true;
  }

  // 拦截Fetch API
  function interceptFetch() {
    console.log("🔄 开始拦截Fetch API...");

    // 保存原始的fetch
    const originalFetch = window.fetch;

    // 创建拦截函数
    window.fetch = async function (input, init) {
      // 获取URL
      const url = typeof input === "string" ? input : input.url;

      // 检查是否是我们关心的API类型
      const isYoutubeApi = isYouTubeApiUrl(url)

      // 如果不是我们关心的API，直接调用原始fetch
      if (!isYoutubeApi) {
        return originalFetch.apply(window, arguments);
      }

      try {
        // 调用原始fetch
        const response = await originalFetch.apply(window, arguments);

        // 克隆响应以便读取内容
        const clonedResponse = response.clone();
        // 读取响应内容
        clonedResponse
          .text()
          .then((responseText) => {
            if (responseText && responseText.length > 0) {
              sendDataToContentScript(url, responseText);
            }
          })
          .catch((error) => {
            console.error("❌ 处理Fetch响应时出错:", error);
          });

        // 返回原始响应
        return response;
      } catch (error) {
        console.error("❌ 拦截Fetch时出错:", error);
        // 出错时调用原始fetch
        return originalFetch.apply(window, arguments);
      }
    };

    console.log("✅ Fetch API拦截器已安装");
  }

  // 立即尝试初始化，不等待消息
  console.log("🟢 youtube-api-inject.js已加载，立即初始化拦截器");
  initYouTubeApiInterceptor();

  // 监听来自内容脚本的初始化消息
  window.addEventListener("message", function (event) {
    // 确保消息来自我们的扩展
    if (
      event.data &&
      event.data.type === "TREX_INITIALIZE_YOUTUBE_INTERCEPTOR"
    ) {
      console.log("🚀 准备初始化YouTube API拦截器");
      initYouTubeApiInterceptor();
    }
  });

  console.log("✅ YouTube API interceptor injected!");
})();