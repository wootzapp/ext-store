import {
  b as u,
  E as _,
  h as w,
  c as C,
  d as N,
  e as O,
  f as R,
  i as L,
  j as I,
  k as f,
  m as M,
  n as b,
  o as p,
  p as W,
  s as k,
  q as G,
  r as P,
  t as Y,
  u as X,
  v as m,
  w as v,
  x as s,
  y as q,
  z as B,
  A as U,
  B as D,
  D as Q,
  F as A,
  G as x,
  H as F,
} from "./actions-CxosgIhI.js";
import { f as H, h as V, w as j } from "./YTEventReport-DpdmRFme.js";
import "./_commonjsHelpers-BosuxZz1.js";
const $ = (t) => {
    let a = {};
    try {
      a = JSON.parse(t);
    } catch {
      const o = new URLSearchParams(t);
      for (const [r, c] of o.entries()) a[r] = c;
    }
    return a;
  },
  z = (t) => {
    t.commentText &&
      (console.log("[评论服务 Background] 检测到YouTube评论:", t.commentText),
      chrome.tabs.query({ active: !0, currentWindow: !0 }, async (a) => {
        const e = a[0];
        e != null &&
          e.id &&
          (chrome.tabs
            .sendMessage(e.id, {
              type: "COMMENT_YOUTUBE_MATCHED",
              data: { commentContent: t.commentText, platform: "YouTube" },
            })
            .catch((o) => {
              console.error("[评论服务 Background] 发送消息失败:", o);
            }),
          await u.authProxy.v1.taskSocialEvent({
            type: "replay",
            platform: "YouTube",
            replyContent: t.commentText,
            socialContentId: t.postId,
          }));
      }));
  },
  J = (t) => {
    var r;
    console.log("[评论服务 Background] 检测到Twitter评论:", t);
    const a = t.variables || {},
      e = a.tweet_text || "",
      o = ((r = a.reply) == null ? void 0 : r.in_reply_to_tweet_id) || "";
    e &&
      o &&
      (console.log(
        "[评论服务 Background] 检测到Twitter评论:",
        e,
        "评论目标推文:",
        o
      ),
      chrome.tabs.query({ active: !0, currentWindow: !0 }, async (c) => {
        const i = c[0],
          n = i == null ? void 0 : i.id,
          T = Date.now(),
          E = H({ width: i.width, height: i.height }),
          l = `${o}|${T}|${E}`,
          d = V(l);
        n &&
          u.authProxy.v1
            .taskSocialEvent({
              type: "replay",
              platform: "X",
              replyContent: e,
              socialContentId: o,
              time: T,
              deviceFinger: E,
              signature: d,
            })
            .then((y) => {
              var S, h;
              y.error ||
                !((S = y.data) != null && S.success) ||
                chrome.tabs.sendMessage(n, {
                  type: "COMMENT_TWITTER_MATCHED",
                  data: {
                    ...((h = y.data) == null ? void 0 : h.obj),
                    commentContent: e,
                    postId: o,
                    platform: "X",
                  },
                });
            });
      }));
  };
if (!chrome.webRequest)
  throw (
    (console.error("[Background] webRequest API 不可用"),
    new Error("webRequest API not available"))
  );
chrome.webRequest.onBeforeRequest.addListener(
  (t) => {
    var a, e;
    if (t.method === "POST" && t.requestBody)
      try {
        const o = new TextDecoder("utf-8"),
          r =
            (e = (a = t.requestBody.raw) == null ? void 0 : a[0]) == null
              ? void 0
              : e.bytes;
        if (r) {
          const c = o.decode(r),
            i = $(c);
          /youtube\.com\/youtubei\/v1\/comment\/create_comment/.test(t.url)
            ? z(i)
            : (/twitter\.com\/i\/api\/graphql\/.+\/CreateTweet/.test(t.url) ||
                /x\.com\/i\/api\/graphql\/.+\/CreateTweet/.test(t.url)) &&
              J(i);
        }
      } catch (o) {
        console.error("[评论服务 Background] 处理请求体失败:", o);
      }
    return { cancel: !1 };
  },
  {
    urls: [
      "*://*.youtube.com/youtubei/v1/comment/create_comment*",
      "*://x.com/i/api/graphql/*/CreateTweet*",
      "*://twitter.com/i/api/graphql/*/CreateTweet*",
    ],
  },
  ["requestBody"]
);
chrome.runtime.onMessage.addListener((t, a, e) => {
  var o;
  if (j.handleWSSockMessages(t, a, e))
    return console.log("处理WSSock相关消 handleWSSockMessages", t), !0;

  // Handle WebSocket delegation requests from content scripts
  if (t.type === "TREX_WEBSOCKET_CONNECT_REQUEST") {
    console.log(
      "🔌 [TREX Service Worker] Content script requesting WebSocket connection"
    );

    // Check if WebSocket is already connected to avoid unnecessary connections
    try {
      const isAlreadyConnected =
        j && typeof j.isConnected === "function" ? j.isConnected() : false;

      if (isAlreadyConnected) {
        console.log(
          "✅ [TREX Service Worker] WebSocket already connected, returning success"
        );
        e({
          success: true,
          message: "WebSocket already connected",
          isConnected: true,
        });
        return true;
      }

      // Use the existing WebSocket manager to connect
      if (j && typeof j.connect === "function") {
        j.connect((message) => {
          // Forward WebSocket messages back to content scripts
          chrome.runtime.sendMessage({
            type: "TREX_WEBSOCKET_MESSAGE_FROM_SW",
            data: message,
            timestamp: Date.now(),
          });
        });
        e({ success: true, message: "WebSocket connection initiated" });
      } else {
        console.error(
          "❌ [TREX Service Worker] WebSocket manager not available"
        );
        e({ success: false, error: "WebSocket manager not available" });
      }
    } catch (error) {
      console.error(
        "❌ [TREX Service Worker] WebSocket connection error:",
        error
      );
      e({ success: false, error: error.message });
    }
    return true;
  }

  if (t.type === "TREX_WEBSOCKET_DISCONNECT_REQUEST") {
    console.log(
      "🔌 [TREX Service Worker] Content script requesting WebSocket disconnect"
    );

    // Only disconnect if specifically requested and connected
    try {
      const isConnected =
        j && typeof j.isConnected === "function" ? j.isConnected() : false;

      if (!isConnected) {
        console.log("ℹ️ [TREX Service Worker] WebSocket already disconnected");
        e({
          success: true,
          message: "WebSocket already disconnected",
          isConnected: false,
        });
        return true;
      }

      if (j && typeof j.disconnect === "function") {
        j.disconnect();
        console.log(
          "✅ [TREX Service Worker] WebSocket disconnected successfully"
        );
        e({ success: true, message: "WebSocket disconnected" });
      } else {
        console.error(
          "❌ [TREX Service Worker] WebSocket manager not available for disconnect"
        );
        e({ success: false, error: "WebSocket manager not available" });
      }
    } catch (error) {
      console.error(
        "❌ [TREX Service Worker] WebSocket disconnect error:",
        error
      );
      e({ success: false, error: error.message });
    }
    return true;
  }

  if (t.type === "TREX_WEBSOCKET_STATUS_REQUEST") {
    console.log(
      "🔌 [TREX Service Worker] Content script requesting WebSocket status"
    );
    try {
      const isConnected =
        j && typeof j.isConnected === "function" ? j.isConnected() : false;
      e({ success: true, isConnected: isConnected });
    } catch (error) {
      console.error(
        "❌ [TREX Service Worker] WebSocket status check error:",
        error
      );
      e({ success: false, isConnected: false, error: error.message });
    }
    return true;
  }

  if (t.type === _.TrexExtensionExplore)
    return (
      chrome.tabs.query({ active: !0, currentWindow: !0 }, (r) => {
        var c;
        r[0].id &&
          (chrome.tabs.sendMessage((c = r[0]) == null ? void 0 : c.id, {
            type: "open_content_trex_iframe",
          }),
          e({ success: !0 }));
      }),
      !0
    );
  if (t.type === _.LoginCompleted) return w(t), e({ success: !0 }), !0;
  if (t.type === _.TrexLoginOut) return C(), x(), e({ success: !0 }), !0;
  if (t.type === _.CheckLoginStatus) return N(e), !0;
  if (t.type === _.RewardClaim) return O(t.data, e), !0;
  if (t.type === _.RequestReward) return R(t.data, e), !0;
  if (t.type === _.RequestLastReward) return L(t.data, e), !0;
  if (t.type === _.RequestCustomer) return !0;
  if (t.type === _.OpenPopup) return I(), e({ success: !0 }), !0;
  if (t.type === _.OpenSidePanel)
    return (
      console.log("[TREX] OpenSidePanel called - now using popup"),
      e({ success: !0 }),
      !0
    );
  if (t.type === _.RewardUpdate) return M(t.data), e({ success: !0 }), !0;
  if (t.type === _.OpenContent) {
    const r = (o = a.tab) == null ? void 0 : o.id;
    return (
      r && chrome.tabs.sendMessage(r, { type: "open_content_trex_iframe" }),
      e({ success: !0 }),
      !0
    );
  }
  if (t.type === _.TrexAuthBack) return b(t), !0;
  if (t.type === _.TrexNotification)
    return typeof t.data == "string" && t.data === "fetch_all"
      ? (p(t.data, e), !0)
      : typeof t.data == "object"
      ? (p(t.data, e), !0)
      : (W(t.data), e({ success: !0 }), !0);
  if (t.type === _.TrexNoticesUpdate)
    return (
      console.log("-----收到消息更新消息-----"),
      F() || k(),
      e({ success: !0 }),
      !0
    );
  if (t.type === _.TrexClaimAction)
    return (
      console.log("[TREX] Claim action triggered - popup will handle UI"),
      G(),
      e({ success: !0 }),
      !0
    );
  if (t.type === _.TwitterSendApiData) {
    console.log("🔥 [TREX-BG] 📨 SERVICE WORKER RECEIVED TWITTER DATA:");
    console.log("📊 [TREX-BG] Message Type:", t.type);
    console.log("📏 [TREX-BG] Data Object:", t.data);
    console.log("🔗 [TREX-BG] Origin URL:", t.data?.originUrl);
    console.log(
      "📐 [TREX-BG] Response Size:",
      t.data?.response ? t.data.response.length : 0,
      "chars"
    );
    console.log("⏰ [TREX-BG] Processing Timestamp:", new Date().toISOString());

    // Track data reception for cycle management
    dataReceivedInCurrentCycle = true;
    currentCycleDataCount++;
    console.log(
      "📊 [TREX-BG] Data received in cycle #" + cycleCounter + ", count:",
      currentCycleDataCount
    );

    // Ensure WebSocket is connected before sending data
    try {
      const isWebSocketConnected =
        j && typeof j.isConnected === "function" ? j.isConnected() : false;
      console.log(
        "🔌 [TREX-BG] WebSocket connection status:",
        isWebSocketConnected
      );

      if (!isWebSocketConnected && j && typeof j.connect === "function") {
        console.log(
          "🔄 [TREX-BG] WebSocket not connected, attempting to connect..."
        );
        j.connect((message) => {
          console.log("📡 [TREX-BG] WebSocket message received:", message);
        });

        setTimeout(() => {
          console.log(
            "🚀 [TREX-BG] Calling upload function P with WebSocket..."
          );
          P(t.data, e);
          // Trigger next cycle after successful transmission
          handleDataTransmissionSuccess();
        }, 1000);
      } else {
        console.log(
          "🚀 [TREX-BG] WebSocket connected - uploading data immediately"
        );
        P(t.data, e);
        // Trigger next cycle after successful transmission
        handleDataTransmissionSuccess();
      }
    } catch (error) {
      console.error("❌ [TREX-BG] Error handling Twitter data:", error);
      // Still try to upload data even if WebSocket has issues
      console.log(
        "🔄 [TREX-BG] Attempting data upload despite WebSocket error..."
      );
      P(t.data, e);
      // Even on error, continue to next cycle
      handleDataTransmissionSuccess();
    }

    return true;
  }
  if (t.type === _.YouTubeSendApiData) {
    console.log("🔥 [TREX-BG] 📨 SERVICE WORKER RECEIVED YOUTUBE DATA:");
    console.log("📊 [TREX-BG] Message Type:", t.type);
    console.log("📏 [TREX-BG] Data Object:", t.data);

    // Ensure WebSocket connectivity for YouTube data as well
    try {
      const isWebSocketConnected =
        j && typeof j.isConnected === "function" ? j.isConnected() : false;
      console.log(
        "� [TREX-BG] WebSocket connection status for YouTube:",
        isWebSocketConnected
      );

      console.log("�🚀 [TREX-BG] Calling upload function P for YouTube...");
      P(t.data, e);
    } catch (error) {
      console.error("❌ [TREX-BG] Error handling YouTube data:", error);
      // Still try to upload data even if WebSocket has issues
      console.log(
        "🔄 [TREX-BG] Attempting YouTube data upload despite error..."
      );
      P(t.data, e);
    }

    return true;
  }
  if (t.type === _.TrexExtensionOsDeviceId) {
    const r = t == null ? void 0 : t.data;
    return (
      console.log("---收到设备id---", r == null ? void 0 : r.os_device_id),
      Y(r == null ? void 0 : r.os_device_id),
      e({ success: !0 }),
      !0
    );
  }
  if (t.type === _.TrexGuideStart) return X(), e({ success: !0 }), !0;
  if (t.type === _.TrexGuideHomeClose) return m(), e({ success: !0 }), !0;
  if (t.type === _.TrexGuideRexyClose) return v(), e({ success: !0 }), !0;
  if (t.type === _.TrexTwitterPermSet) {
    const r = t == null ? void 0 : t.data;
    return s("Twitter", r, e), !0;
  }
  if (t.type === _.TrexYouTubePermSet) {
    const r = t == null ? void 0 : t.data;
    return s("YouTube", r, e), !0;
  }
  if (t.type === _.TrexGetPrivacyAuth) return q(e), !0;
  if (t.type === _.TrexAgreePermission) {
    const r = t == null ? void 0 : t.data;
    return B(r == null ? void 0 : r.platform, e), !0;
  }
  if (t.type === _.TrexSessionInit) {
    const r = t == null ? void 0 : t.data;
    return U(r, e), !0;
  }
  if (t.type === _.TrexGetPassportInfo) return D(e), !0;
});
chrome.action.onClicked.addListener((t) => {
  console.log("[TREX] Action clicked - popup will open automatically");
  // Popup opens automatically when action is clicked - no need for manual opening
  // This handler is kept for logging purposes and potential future functionality
});
chrome.notifications.onClicked.addListener((t) => {
  console.log("Notification clicked:", t), Q(t);
});
chrome.notifications.onClosed.addListener((t, a) => {
  console.log("Notification closed:", t, "byUser:", a),
    chrome.storage.local.remove([t]);
});
chrome.storage.local.get("trex_login_data", (t) => {
  var o, r, c, i;
  const a =
      (r =
        (o = t == null ? void 0 : t.trex_login_data) == null
          ? void 0
          : o.token) == null
        ? void 0
        : r.accessToken,
    e =
      (i =
        (c = t == null ? void 0 : t.trex_login_data) == null
          ? void 0
          : c.token) == null
        ? void 0
        : i.refreshToken;
  a
    ? (u.authProxy.setToken(a), u.authProxy.setRefreshToken(e))
    : (u.authProxy.v1.logout(),
      u.authProxy.setToken(""),
      u.authProxy.setRefreshToken(""));
});
chrome.storage.onChanged.addListener((t, a) => {
  var e, o, r, c, i, n, T, E;
  if ((e = t.trex_login_data) != null && e.newValue) {
    console.log(
      "监听到登录成功 ======",
      (o = t == null ? void 0 : t.trex_login_data) == null ? void 0 : o.newValue
    );
    const l =
        (i =
          (c =
            (r = t == null ? void 0 : t.trex_login_data) == null
              ? void 0
              : r.newValue) == null
            ? void 0
            : c.token) == null
          ? void 0
          : i.accessToken,
      d =
        (E =
          (T =
            (n = t == null ? void 0 : t.trex_login_data) == null
              ? void 0
              : n.newValue) == null
            ? void 0
            : T.token) == null
          ? void 0
          : E.refreshToken;
    l
      ? (u.authProxy.setToken(l), u.authProxy.setRefreshToken(d))
      : (u.authProxy.v1.logout(),
        u.authProxy.setToken(""),
        u.authProxy.setRefreshToken(""));
  }
});
chrome.runtime.onSuspend.addListener(() => {
  x();
});
chrome.runtime.onMessage.addListener((t, a, e) => {
  if (t.type === "TREX_WALLET_LOGOUT_RESPONSE")
    return (
      console.log("[TREX] Wallet logout response received"),
      chrome.storage.local
        .remove("trex_wallet_connect_storage")
        .then(() => {
          console.log("[TREX] Wallet connect storage removed");
          return chrome.storage.local.set({
            trex_wallet_connect_state: "disconnected",
          });
        })
        .then(() => {
          console.log("[TREX] Wallet connect state set to disconnected");
          e({ success: !0 });
        })
        .catch((o) => {
          console.error("Wallet logout error:", o),
            e({ success: !1, error: o.message });
        }),
      !0
    );
  if (
    (t.type === "TREX_RESPONSE_TYPE_GET_ACTIVE_WALLET_ADDRESS" &&
      (chrome.runtime.sendMessage({
        type: "TREX_RESPONSE_TYPE_GET_ACTIVE_WALLET_ADDRESS_TO_PANEL",
        payload: t.payload,
      }),
      e({ success: !0 })),
    t.type === "TREX_REQUEST_TYPE_GET_ACTIVE_WALLET_ADDRESS" &&
      (chrome.tabs.query({ active: !0, currentWindow: !0 }, (o) => {
        var r, c;
        (r = o[0]) != null &&
          r.id &&
          chrome.tabs.sendMessage((c = o[0]) == null ? void 0 : c.id, {
            type: "TREX_REQUEST_TYPE_GET_ACTIVE_WALLET_ADDRESS_TO_CONTENT",
          });
      }),
      e({ success: !0 })),
    t.type === "TREX_RESPONSE_TYPE_GET_INSTALLED_WALLETS" &&
      (chrome.runtime.sendMessage({
        type: "TREX_RESPONSE_TYPE_GET_INSTALLED_WALLETS_TO_PANEL",
        payload: t.payload,
      }),
      e({ success: !0 })),
    t.type === "TREX_REQUEST_TYPE_GET_INSTALLED_WALLETS" &&
      (chrome.tabs.query({ active: !0, currentWindow: !0 }, (o) => {
        var r, c;
        (r = o[0]) != null &&
          r.id &&
          chrome.tabs.sendMessage((c = o[0]) == null ? void 0 : c.id, {
            type: "TREX_REQUEST_TYPE_GET_INSTALLED_WALLETS_TO_CONTENT",
          });
      }),
      e({ success: !0 })),
    t.type === "TREX_RESPONSE_TYPE_GET_GAS_PRICE" &&
      (chrome.runtime.sendMessage({
        type: "TREX_RESPONSE_TYPE_GET_GAS_PRICE_TO_PANEL",
        payload: t.payload,
      }),
      e({ success: !0 })),
    t.type === "TREX_REQUEST_TYPE_GET_GAS_PRICE" &&
      (chrome.tabs.query({ active: !0, currentWindow: !0 }, (o) => {
        var r, c;
        (r = o[0]) != null &&
          r.id &&
          chrome.tabs.sendMessage((c = o[0]) == null ? void 0 : c.id, {
            type: "TREX_REQUEST_TYPE_GET_GAS_PRICE_FROM_BG",
          });
      }),
      e({ success: !0 })),
    t.type === "TREX_RESPONSE_TYPE_SWITCH_CHAIN" &&
      (chrome.runtime.sendMessage({
        type: "TREX_RESPONSE_TYPE_SWITCH_CHAIN_TO_PANEL",
        payload: t.payload,
      }),
      e({ success: !0 })),
    t.type === "TREX_REQUEST_TYPE_SWITCH_CHAIN" &&
      (chrome.tabs.query({ active: !0, currentWindow: !0 }, (o) => {
        var r, c;
        (r = o[0]) != null &&
          r.id &&
          chrome.tabs.sendMessage((c = o[0]) == null ? void 0 : c.id, {
            type: "TREX_REQUEST_TYPE_SWITCH_CHAIN_FROM_BG",
          });
      }),
      e({ success: !0 })),
    t.type === "TREX_RESPONSE_TYPE_GET_ACTIVE_WALLET_CONNECTION_STATUS" &&
      (chrome.runtime.sendMessage({
        type: "TREX_RESPONSE_TYPE_GET_ACTIVE_WALLET_CONNECTION_STATUS_TO_PANEL",
        payload: t.payload,
      }),
      e({ success: !0 })),
    t.type === "TREX_REQUEST_TYPE_GET_ACTIVE_WALLET_CONNECTION_STATUS" &&
      (chrome.tabs.query({ active: !0, currentWindow: !0 }, (o) => {
        var r, c;
        (r = o[0]) != null &&
          r.id &&
          chrome.tabs.sendMessage((c = o[0]) == null ? void 0 : c.id, {
            type: "TREX_REQUEST_TYPE_GET_ACTIVE_WALLET_CONNECTION_STATUS_FROM_BG",
            payload: t.data,
          });
      }),
      e({ success: !0 })),
    t.type === "TREX_RESPONSE_TYPE_WAIT_FOR_RECEIPT_TO_BG" &&
      (chrome.runtime.sendMessage({
        type: "TREX_RESPONSE_TYPE_WAIT_FOR_RECEIPT_TO_PANEL",
        payload: t.payload,
      }),
      e({ success: !0 })),
    t.type === "TREX_REQUEST_TYPE_WAIT_FOR_RECEIPT" &&
      (chrome.tabs.query({ active: !0, currentWindow: !0 }, (o) => {
        var r, c;
        (r = o[0]) != null &&
          r.id &&
          chrome.tabs.sendMessage((c = o[0]) == null ? void 0 : c.id, {
            type: "TREX_REQUEST_TYPE_WAIT_FOR_RECEIPT_FROM_BG",
            payload: t.data,
          });
      }),
      e({ success: !0 })),
    t.type === "TREX_RESPONSE_TYPE_SEND_TRANSACTION_TO_BG" &&
      (chrome.runtime.sendMessage({
        type: "TREX_RESPONSE_TYPE_SEND_TRANSACTION_TO_PANEL",
        payload: t.payload,
      }),
      e({ success: !0 })),
    t.type === "TREX_REQUEST_TYPE_SEND_TRANSACTION" &&
      (chrome.tabs.query({ active: !0, currentWindow: !0 }, (o) => {
        var r, c;
        (r = o[0]) != null &&
          r.id &&
          chrome.tabs.sendMessage((c = o[0]) == null ? void 0 : c.id, {
            type: "TREX_REQUEST_TYPE_SEND_TRANSACTION_FROM_BG",
            payload: t.data,
          });
      }),
      e({ success: !0 })),
    t.type === "TREX_RESPONSE_TYPE_ESTIMATE_GAS_TO_BG" &&
      (chrome.runtime.sendMessage({
        type: "TREX_RESPONSE_TYPE_ESTIMATE_GAS_TO_PANEL",
        payload: t.payload,
      }),
      e({ success: !0 })),
    t.type === "TREX_REQUEST_TYPE_ESTIMATE_GAS" &&
      (chrome.tabs.query({ active: !0, currentWindow: !0 }, (o) => {
        var r, c;
        if ((r = o[0]) != null && r.id)
          try {
            chrome.tabs.sendMessage((c = o[0]) == null ? void 0 : c.id, {
              type: "TREX_REQUEST_TYPE_ESTIMATE_GAS_FROM_BG",
              payload: t.data,
            });
          } catch (i) {
            console.log("----error---", i);
          }
      }),
      e({ success: !0 })),
    t.type === "TREX_RESPONSE_TYPE_BALANCE_TO_BG" &&
      (chrome.runtime.sendMessage({
        type: "TREX_RESPONSE_TYPE_BALANCE_FROM_BG",
        payload: t.payload,
      }),
      e({ success: !0 })),
    t.type === "TREX_REQUEST_TYPE_BALANCE" &&
      (chrome.tabs.query({ active: !0, currentWindow: !0 }, (o) => {
        var r, c;
        (r = o[0]) != null &&
          r.id &&
          chrome.tabs.sendMessage((c = o[0]) == null ? void 0 : c.id, {
            type: "TREX_REQUEST_TYPE_BALANCE_FROM_BG",
          });
      }),
      e({ success: !0 })),
    t.type === "trex_extension_install_wallet_login_error" &&
      (chrome.runtime.sendMessage({
        type: "trex_extension_install_wallet_login_error_from_bg",
        payload: t.payload,
      }),
      e({ success: !0 })),
    t.type === "trex_web_get_install_wallet_storage" &&
      (chrome.tabs.query({ active: !0, currentWindow: !0 }, (o) => {
        var r, c;
        (r = o[0]) != null &&
          r.id &&
          chrome.tabs.sendMessage((c = o[0]) == null ? void 0 : c.id, {
            type: "trex_web_get_install_wallet_storage",
          });
      }),
      e({ success: !0 })),
    t.type === "trex_extension_install_wallet_login_loading" &&
      (console.log("[TREX] Wallet login loading state:", t.payload),
      chrome.runtime.sendMessage({
        type: "trex_extension_install_wallet_login_from_content_loading",
        payload: t.payload,
      }),
      e({ success: !0 })),
    t.type === "trex_extension_to_content_trex_token_request")
  )
    return (
      console.log(
        "[TREX] Token request from content script, forwarding to iframe"
      ),
      chrome.runtime.sendMessage({
        type: "trex_extension_to_iframe_trex_token_request",
      }),
      e({ success: !0 }),
      !0
    );
  if (t.type === "trex_extension_wallet_connect_state_response")
    return (
      console.log("[TREX] Wallet connect state response received:", t.payload),
      chrome.storage.local
        .set({ trex_wallet_connect_state: t.payload })
        .then(() => {
          console.log("[TREX] Wallet connect state saved to storage");
          e({ success: !0 });
        })
        .catch((o) => {
          console.error("Wallet connect state error:", o),
            e({ success: !1, error: o.message });
        }),
      !0
    );
  if (t.type === "trex_extension_wallet_connect_storage_response")
    return (
      console.log(
        "[TREX] Wallet connect storage response received:",
        t.payload
      ),
      chrome.storage.local
        .set({ trex_wallet_connect_storage: t.payload.thirdweb_local_storage })
        .then(() => {
          console.log("[TREX] Wallet connect storage saved successfully");
          e({ success: !0 });
        })
        .catch((o) => {
          console.error("Wallet connect storage error:", o),
            e({ success: !1, error: o.message });
        }),
      !0
    );
  t.type === "trex_extension_get_InstallWallet" &&
    (console.log("[TREX] Get InstallWallet request received"),
    chrome.runtime.sendMessage({ type: "trex_extension_get_InstallWallet" }),
    e({ success: !0 })),
    t.type === "trex_extension_get_InstallWallet_response" &&
      (console.log("[TREX] Get InstallWallet response received:", t.payload),
      chrome.tabs.query({ active: !0, currentWindow: !0 }, (o) => {
        var r;
        console.log("[TREX] Active tab for InstallWallet response:", o[0]);
        (r = o[0]) != null &&
          r.id &&
          chrome.runtime.sendMessage({
            type: "trex_extension_get_InstallWallet_response",
            payload: t.payload,
          });
      }),
      e({ success: !0 })),
    t.type === "trex_extension_wallet_connect" &&
      (console.log("[TREX] Wallet connect request received:", t.payload),
      chrome.tabs.query({ active: !0, currentWindow: !0 }, (o) => {
        var r;
        console.log("[TREX] Active tab for wallet connect:", o[0]);
        (r = o[0]) != null &&
          r.id &&
          chrome.runtime.sendMessage({
            type: "trex_extension_wallet_connect",
            payload: t.payload,
          });
      }),
      e({ success: !0 }));
});
chrome.runtime.onInstalled.addListener((details) => {
  console.log("[TREX] Extension installed or updated:", details);
  A();
});
A();

// Twitter automation functionality using Wootz WebContent API
const TWITTER_WEBCONTENT_ID = 5;
let twitterWebContentCreated = false;
let isTwitterAutomationRunning = false;
let twitterScrollInterval = null;

// Cache Twitter authentication status to avoid repeated checks
let twitterAuthCache = {
  isLoggedIn: null,
  lastChecked: 0,
  cacheValidDuration: 5 * 60 * 1000, // 5 minutes cache
};

// Create Twitter web content for automation
const createTwitterWebContent = () => {
  return new Promise((resolve, reject) => {
    console.log(
      "🐦 [TREX Twitter] Creating background web content for x.com..."
    );

    // Use x.com instead of mobile.twitter.com to match manifest content scripts
    const twitterUrl = "https://x.com";

    chrome.wootz.createBackgroundWebContents(
      TWITTER_WEBCONTENT_ID,
      twitterUrl,
      (result) => {
        if (result.success) {
          console.log(
            "✅ [TREX Twitter] Background web content created successfully"
          );
          twitterWebContentCreated = true;
          resolve(result);
        } else {
          console.error(
            "❌ [TREX Twitter] Failed to create web content:",
            result.error
          );
          reject(new Error(result.error));
        }
      }
    );
  });
};

// Check if user is logged into Twitter
const checkTwitterLogin = () => {
  return new Promise((resolve) => {
    console.log("🔍 [TREX Twitter] Checking Twitter login status...");

    // Check cache first to avoid repeated authentication checks
    const now = Date.now();
    if (
      twitterAuthCache.isLoggedIn !== null &&
      now - twitterAuthCache.lastChecked < twitterAuthCache.cacheValidDuration
    ) {
      console.log(
        "✅ [TREX Twitter] Using cached login status:",
        twitterAuthCache.isLoggedIn
      );
      resolve(twitterAuthCache.isLoggedIn);
      return;
    }

    if (!twitterWebContentCreated) {
      console.log("⚠️ [TREX Twitter] Web content not created yet");
      resolve(false);
      return;
    }

    console.log(
      "🔍 [TREX Twitter] Sending login check message to background web content..."
    );

    // Set up a one-time listener for the response
    const messageListener = (message, sender, sendResponse) => {
      if (message.type === "TREX_TWITTER_LOGIN_STATUS_RESPONSE") {
        console.log(
          "📥 [TREX Twitter] Received login status response:",
          message
        );

        // Remove the listener after receiving response
        chrome.runtime.onMessage.removeListener(messageListener);

        const isLoggedIn = message.isLoggedIn || false;
        const currentUrl = message.url || "";
        console.log(
          "🐦 [TREX Twitter] Login status from background web content:",
          isLoggedIn
        );
        console.log("🌐 [TREX Twitter] Current URL:", currentUrl);

        // Additional check: if URL redirected to login page, user is not authenticated
        if (
          currentUrl.includes("/login") ||
          currentUrl.includes("/i/flow/login")
        ) {
          console.log(
            "⚠️ [TREX Twitter] Detected redirect to login page - user not authenticated"
          );
          twitterAuthCache.isLoggedIn = false;
          twitterAuthCache.lastChecked = now;
          resolve(false);
          return;
        }

        // Update cache
        twitterAuthCache.isLoggedIn = isLoggedIn;
        twitterAuthCache.lastChecked = now;
        console.log("💾 [TREX Twitter] Cached login status for 5 minutes");

        resolve(isLoggedIn);

        if (sendResponse) {
          sendResponse({ received: true });
        }
        return true; // Keep message channel open
      }
    };

    // Add the response listener
    chrome.runtime.onMessage.addListener(messageListener);

    // Send message directly to the background web content using tabs.sendMessage
    console.log(
      "📤 [TREX Twitter] Sending message to webContentId:",
      TWITTER_WEBCONTENT_ID
    );
    chrome.tabs.sendMessage(
      TWITTER_WEBCONTENT_ID,
      {
        type: "TREX_CHECK_TWITTER_LOGIN_BACKGROUND",
        targetUrl: "https://x.com",
        timestamp: Date.now(),
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log(
            "⚠️ [TREX Twitter] Error sending message to web content:",
            chrome.runtime.lastError.message
          );
          console.log(
            "🔄 [TREX Twitter] This might be normal if web content is still loading..."
          );
        } else {
          console.log(
            "✅ [TREX Twitter] Message sent successfully to background web content"
          );
          if (response) {
            console.log("📥 [TREX Twitter] Immediate response:", response);
          }
        }
      }
    );

    // Set a longer timeout - 8 seconds instead of 5
    setTimeout(() => {
      chrome.runtime.onMessage.removeListener(messageListener);
      console.log(
        "⏰ [TREX Twitter] Login check timeout after 8 seconds, using cached status or assuming logged in"
      );

      // If we have cached data, use it even if slightly old
      if (twitterAuthCache.isLoggedIn !== null) {
        console.log(
          "💾 [TREX Twitter] Using cached login status due to timeout:",
          twitterAuthCache.isLoggedIn
        );
        resolve(twitterAuthCache.isLoggedIn);
      } else {
        // If no cache and timeout, assume logged in since automation was started
        console.log(
          "🔄 [TREX Twitter] No cache available, assuming logged in since automation was started"
        );
        twitterAuthCache.isLoggedIn = true;
        twitterAuthCache.lastChecked = now;
        resolve(true);
      }
    }, 8000); // Increased from 5000 to 8000
  });
};

// Start cycle-based Twitter automation
const startTwitterCycleAutomation = () => {
  if (isTwitterAutomationRunning) {
    console.log("⚠️ [TREX Twitter] Automation already running");
    return;
  }

  console.log("🚀 [TREX Twitter] Starting cycle-based automation...");
  isTwitterAutomationRunning = true;

  // Start the first cycle
  startNextAutomationCycle();
};

// Backward compatibility alias
const startTwitterScrolling = startTwitterCycleAutomation;

// Track data collection and sending state
let isWaitingForData = false;
let cycleTimeout = null;
let dataCollectionTimeout = null;
let cycleCounter = 0;
let dataReceivedInCurrentCycle = false;
let dataUploadedInCurrentCycle = false;
let currentCycleDataCount = 0;

// Start a new automation cycle
const startNextAutomationCycle = async () => {
  if (!isTwitterAutomationRunning) {
    console.log("🛑 [TREX Twitter] Automation stopped, not starting new cycle");
    return;
  }

  console.log("🔄 [TREX Twitter] ========================================");
  console.log(
    "🔄 [TREX Twitter] STARTING NEW AUTOMATION CYCLE #" + ++cycleCounter
  );
  console.log("🔄 [TREX Twitter] ========================================");

  // Reset cycle data tracking
  dataReceivedInCurrentCycle = false;
  dataUploadedInCurrentCycle = false;
  currentCycleDataCount = 0;

  try {
    // Ensure WebSocket is connected before starting cycle
    const isWebSocketConnected =
      j && typeof j.isConnected === "function" ? j.isConnected() : false;
    console.log(
      "🔌 [TREX Twitter] WebSocket status before cycle:",
      isWebSocketConnected
    );

    if (!isWebSocketConnected && j && typeof j.connect === "function") {
      console.log("🔄 [TREX Twitter] Connecting WebSocket before cycle...");
      j.connect((message) => {
        console.log(
          "📡 [TREX Twitter] WebSocket connected for cycle:",
          message
        );
      });
      // Wait for connection
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Only destroy and recreate webcontent if we have successfully collected data from the previous cycle
    // OR if this is the first cycle OR if we've waited too long without data
    const shouldRecreateWebContent =
      cycleCounter === 1 ||
      (dataUploadedInCurrentCycle && cycleCounter % 3 === 1) ||
      (cycleCounter > 6 && cycleCounter % 5 === 1); // Force recreation every 5 cycles if no data

    if (shouldRecreateWebContent) {
      console.log(
        "🔄 [TREX Twitter] Cycle #" +
          cycleCounter +
          " - Recreating webcontent for fresh data"
      );

      // Destroy existing webcontent if it exists
      if (twitterWebContentCreated) {
        try {
          await chrome.wootz.destroyBackgroundWebContents(
            TWITTER_WEBCONTENT_ID
          );
          twitterWebContentCreated = false;
          console.log("✅ [TREX Twitter] Webcontent destroyed successfully");
        } catch (error) {
          console.log(
            "⚠️ [TREX Twitter] Error destroying webcontent (may not exist):",
            error
          );
        }
      }

      // Create fresh webcontent
      console.log("🌟 [TREX Twitter] Creating fresh webcontent");
      await createTwitterWebContent();

      // Wait for content to load and scripts to initialize
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Increased wait time
    } else {
      console.log(
        "🔄 [TREX Twitter] Cycle #" +
          cycleCounter +
          " - Keeping existing webcontent for data collection"
      );

      // Ensure webcontent exists
      if (!twitterWebContentCreated) {
        console.log("🌟 [TREX Twitter] Creating webcontent as none exists");
        await createTwitterWebContent();
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    }

    // Check authentication
    const isLoggedIn = await checkTwitterLogin();
    if (!isLoggedIn) {
      console.log("❌ [TREX Twitter] Not logged in, stopping automation");
      stopTwitterAutomation();
      return;
    }

    console.log(
      "✅ [TREX Twitter] Auth check passed, triggering data collection"
    );

    // Set up data collection monitoring
    isWaitingForData = true;

    // Progressive data collection - different actions for different cycles
    let actions = [];
    const cycleType = cycleCounter % 3;

    switch (cycleType) {
      case 1: // Fresh webcontent cycle
        actions = ["navigate_home", "scroll_timeline", "trigger_refresh"];
        console.log(
          "🎯 [TREX Twitter] Fresh webcontent cycle - Navigation + Scroll + Refresh"
        );
        break;
      case 2: // Scroll cycle
        actions = ["scroll_timeline", "navigate_following"];
        console.log(
          "🎯 [TREX Twitter] Scroll cycle - Timeline scrolling + Following"
        );
        break;
      case 0: // Refresh cycle
        actions = ["refresh_page", "scroll_timeline"];
        console.log("🎯 [TREX Twitter] Refresh cycle - Page refresh + Scroll");
        break;
    }

    // Send multiple data collection triggers with delays
    console.log(
      "🎯 [TREX Twitter] Sending progressive data collection triggers"
    );

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];

      setTimeout(() => {
        console.log(
          `🎯 [TREX Twitter] Triggering action ${i + 1}/${
            actions.length
          }: ${action}`
        );

        try {
          chrome.tabs.sendMessage(
            TWITTER_WEBCONTENT_ID,
            {
              type: "TREX_TRIGGER_TWITTER_DATA_COLLECTION",
              actions: [action],
              cycleNumber: cycleCounter,
              actionIndex: i,
              timestamp: Date.now(),
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.log(
                  `⚠️ [TREX Twitter] Error with action ${action}:`,
                  chrome.runtime.lastError.message
                );
              } else {
                console.log(
                  `✅ [TREX Twitter] Action ${action} triggered successfully:`,
                  response
                );
              }
            }
          );
        } catch (error) {
          console.log(
            `⚠️ [TREX Twitter] Error sending action ${action}:`,
            error
          );
        }
      }, i * 4000); // 4 second delay between actions for better data collection
    }

    // Set a much longer timeout for data collection - wait until we get data
    // We'll extend this timeout if data is being received
    dataCollectionTimeout = setTimeout(() => {
      if (isWaitingForData) {
        if (dataReceivedInCurrentCycle && !dataUploadedInCurrentCycle) {
          console.log(
            "📊 [TREX Twitter] Data received but not uploaded yet, extending timeout..."
          );
          // Extend timeout if data was received but not uploaded yet
          extendDataCollectionTimeout();
        } else if (dataUploadedInCurrentCycle) {
          console.log(
            "✅ [TREX Twitter] Data uploaded successfully, moving to next cycle"
          );
          isWaitingForData = false;
          scheduleNextCycle();
        } else {
          console.log(
            "⏰ [TREX Twitter] Data collection timeout (40s), no data received in this cycle"
          );
          console.log(
            "📊 [TREX Twitter] Cycle #" +
              cycleCounter +
              " completed without data, moving to next"
          );
          isWaitingForData = false;
          scheduleNextCycle();
        }
      }
    }, 40000); // Extended to 40 seconds for better data collection
  } catch (error) {
    console.error("❌ [TREX Twitter] Error in automation cycle:", error);
    scheduleNextCycle(); // Try again after delay
  }
};

// Extend data collection timeout when data is being received
const extendDataCollectionTimeout = () => {
  if (dataCollectionTimeout) {
    clearTimeout(dataCollectionTimeout);
    dataCollectionTimeout = null;
  }

  console.log(
    "⏰ [TREX Twitter] Extending data collection timeout by 20 seconds..."
  );

  dataCollectionTimeout = setTimeout(() => {
    if (isWaitingForData) {
      if (dataUploadedInCurrentCycle) {
        console.log(
          "✅ [TREX Twitter] Data uploaded during extension, moving to next cycle"
        );
        isWaitingForData = false;
        scheduleNextCycle();
      } else {
        console.log(
          "⏰ [TREX Twitter] Extended timeout reached, moving to next cycle"
        );
        isWaitingForData = false;
        scheduleNextCycle();
      }
    }
  }, 20000); // Additional 20 seconds
};

// Schedule the next cycle after a delay
const scheduleNextCycle = () => {
  if (!isTwitterAutomationRunning) return;

  // Different delays based on cycle type
  const cycleType = cycleCounter % 3;
  let delay = 8000; // Default 8 seconds

  switch (cycleType) {
    case 1: // After fresh webcontent cycle
      delay = 10000; // 10 seconds to allow data collection
      console.log(
        "⏱️ [TREX Twitter] Scheduling next cycle in 10 seconds (after fresh webcontent)..."
      );
      break;
    case 2: // After scroll cycle
      delay = 6000; // 6 seconds for faster iteration
      console.log(
        "⏱️ [TREX Twitter] Scheduling next cycle in 6 seconds (after scroll)..."
      );
      break;
    case 0: // After refresh cycle
      delay = 8000; // 8 seconds standard
      console.log(
        "⏱️ [TREX Twitter] Scheduling next cycle in 8 seconds (after refresh)..."
      );
      break;
  }

  cycleTimeout = setTimeout(() => {
    startNextAutomationCycle();
  }, delay);
};

// Handle successful data transmission (called when data is sent successfully)
const handleDataTransmissionSuccess = () => {
  if (isWaitingForData) {
    console.log(
      "✅ [TREX Twitter] Data transmitted successfully!"
    );
    console.log("📊 [TREX Twitter] Cycle #" + cycleCounter + " completed with data");
    
    // Mark data as uploaded
    dataUploadedInCurrentCycle = true;
    
    // Clear data collection timeout
    if (dataCollectionTimeout) {
      clearTimeout(dataCollectionTimeout);
      dataCollectionTimeout = null;
    }

    // Wait 20 seconds before starting next cycle to ensure proper delay between webcontents
    setTimeout(() => {
      if (isWaitingForData) {
        isWaitingForData = false;
        console.log("🔄 [TREX Twitter] Data uploaded successfully, starting next cycle after 20s delay");
        scheduleNextCycle();
      }
    }, 20000); // Wait 20 seconds before moving to next cycle
  }
};

// Stop Twitter automation
const stopTwitterAutomation = () => {
  console.log("🛑 [TREX Twitter] Stopping cycle-based automation...");
  isTwitterAutomationRunning = false;

  // Clear all timers and intervals
  if (twitterScrollInterval) {
    clearInterval(twitterScrollInterval);
    twitterScrollInterval = null;
  }

  if (cycleTimeout) {
    clearTimeout(cycleTimeout);
    cycleTimeout = null;
  }

  if (dataCollectionTimeout) {
    clearTimeout(dataCollectionTimeout);
    dataCollectionTimeout = null;
  }

  // Reset state
  isWaitingForData = false;
  cycleCounter = 0;
  dataReceivedInCurrentCycle = false;
  dataUploadedInCurrentCycle = false;
  currentCycleDataCount = 0;

  // Clear authentication cache when automation stops
  twitterAuthCache.isLoggedIn = null;
  twitterAuthCache.lastChecked = 0;
  console.log("🔄 [TREX Twitter] Cleared authentication cache");

  // Update storage to reflect stopped state
  chrome.storage.local.set({
    trex_automation_running: false,
    trex_automation_stopped: true,
    trex_last_stop_reason: "Manual stop or error",
    trex_last_stop_time: Date.now(),
  });

  // Destroy webcontent when stopping
  if (twitterWebContentCreated) {
    try {
      chrome.wootz.destroyBackgroundWebContents(TWITTER_WEBCONTENT_ID);
      twitterWebContentCreated = false;
      console.log("✅ [TREX Twitter] Webcontent destroyed on stop");
    } catch (error) {
      console.log(
        "⚠️ [TREX Twitter] Error destroying webcontent on stop:",
        error
      );
    }
  }

  console.log("✅ [TREX Twitter] Cycle-based automation stopped successfully");
};

// Main Twitter automation flow
const handleTwitterAutomation = async () => {
  console.log("🎯 [TREX Twitter] ========================================");
  console.log("🎯 [TREX Twitter] STARTING TWITTER AUTOMATION FLOW");
  console.log("🎯 [TREX Twitter] ========================================");

  // Set automation as running at the start
  chrome.storage.local.set({
    trex_automation_running: true,
    trex_automation_stopped: false,
    trex_twitter_login_required: false,
    trex_last_error: null,
  });
  console.log("✅ [TREX Twitter] Set automation state to running");

  try {
    console.log("🐦 [TREX Twitter] Starting Twitter automation flow...");

    // Check if APIs are available first
    console.log("🔍 [TREX Twitter] Checking API availability...");
    console.log(
      "   chrome.wootz available:",
      typeof chrome.wootz !== "undefined"
    );
    if (typeof chrome.wootz !== "undefined") {
      console.log(
        "   createBackgroundWebContents available:",
        typeof chrome.wootz.createBackgroundWebContents === "function"
      );
    }

    // Step 1: Create background web content
    console.log("📝 [TREX Twitter] Step 1: Creating background web content...");
    await createTwitterWebContent();
    console.log("✅ [TREX Twitter] Step 1 completed successfully");

    // Wait a bit for page to load
    console.log(
      "⏳ [TREX Twitter] Step 2: Waiting 3 seconds for page to load..."
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("✅ [TREX Twitter] Step 2 completed");

    // Step 2: Check if user is logged into Twitter
    console.log("🔍 [TREX Twitter] Step 3: Checking Twitter login status...");
    const isLoggedIn = await checkTwitterLogin();
    console.log("🔍 [TREX Twitter] Login check result:", isLoggedIn);

    if (!isLoggedIn) {
      console.log("❌ [TREX Twitter] User not logged into Twitter");

      // Handle login required directly in service worker to maintain state
      console.log(
        "📤 [TREX Twitter] Handling login required in service worker..."
      );

      // Store the state immediately for popup to check when opened
      chrome.storage.local
        .set({
          trex_automation_running: false,
          trex_automation_stopped: true,
          trex_twitter_login_required: true,
          trex_last_error: "Twitter login required",
        })
        .then(() => {
          console.log("✅ [TREX Twitter] State stored successfully");

          // Try to send message to popup if it's open
          chrome.runtime
            .sendMessage({
              type: "TREX_TWITTER_LOGIN_REQUIRED",
              message: "Please log into Twitter to continue automation",
              stopAutomation: true,
            })
            .then(() => {
              console.log(
                "✅ [TREX Twitter] Login required message sent to popup"
              );
            })
            .catch((error) => {
              console.log(
                "📱 [TREX Twitter] Popup not open - state already stored"
              );
            });
        });

      // Stop the automation
      console.log(
        "🛑 [TREX Twitter] Stopping automation due to login requirement"
      );
      stopTwitterAutomation();
      return false;
    }

    console.log(
      "✅ [TREX Twitter] User is logged into Twitter, starting automation"
    );

    // Step 3: Start scrolling automation
    console.log("📜 [TREX Twitter] Step 4: Starting scrolling automation...");
    startTwitterCycleAutomation();
    console.log("✅ [TREX Twitter] Step 4 completed");

    console.log("🎉 [TREX Twitter] All steps completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ [TREX Twitter] Error in automation flow:", error);
    console.error("💥 [TREX Twitter] Error stack:", error.stack);

    // Send error message to popup
    console.log("📤 [TREX Twitter] Sending error message to popup...");
    chrome.runtime
      .sendMessage({
        type: "TREX_TWITTER_ERROR",
        message: "Twitter automation failed: " + error.message,
      })
      .catch(() => {});

    stopTwitterAutomation();
    return false;
  }
};

// Start Twitter automation when appropriate
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TREX_START_TWITTER_AUTOMATION") {
    console.log("🚀 [TREX Twitter] Automation start requested");
    handleTwitterAutomation();
    sendResponse({ success: true });
    return true;
  }
});

// Handle Twitter automation messages
chrome.runtime.onMessage.addListener((t, a, e) => {
  console.log("📨 [TREX Background] ========================================");
  console.log("📨 [TREX Background] Received message:", t.type);
  console.log("📨 [TREX Background] Full message data:", t);
  console.log("📨 [TREX Background] Sender:", a);
  console.log("📨 [TREX Background] ========================================");

  if (t.type === "TREX_START_TWITTER_AUTOMATION") {
    console.log(
      "🐦 [TREX Background] Received Twitter automation start request"
    );

    // Check if Wootz API is available
    if (typeof chrome.wootz === "undefined") {
      console.error("❌ [TREX Background] chrome.wootz API not available!");
      e({ success: false, error: "Wootz API not available" });
      return !0;
    }

    if (typeof chrome.wootz.createBackgroundWebContents === "undefined") {
      console.error(
        "❌ [TREX Background] chrome.wootz.createBackgroundWebContents not available!"
      );
      e({ success: false, error: "createBackgroundWebContents not available" });
      return !0;
    }

    console.log(
      "✅ [TREX Background] Wootz API is available, starting automation..."
    );

    handleTwitterAutomation()
      .then((success) => {
        console.log(
          "🎯 [TREX Background] handleTwitterAutomation result:",
          success
        );
        e({ success: success });
      })
      .catch((error) => {
        console.error("❌ [TREX Background] Twitter automation failed:", error);
        e({ success: false, error: error.message });
      });
    return !0;
  }

  if (t.type === "TREX_STOP_TWITTER_AUTOMATION") {
    console.log(
      "🛑 [TREX Background] Received Twitter automation stop request"
    );
    stopTwitterAutomation();
    e({ success: !0 });
    return !0;
  }

  if (t.type === "TREX_CHECK_TWITTER_STATUS") {
    console.log("📊 [TREX Background] Checking Twitter automation status");
    e({
      isRunning: isTwitterAutomationRunning,
      webContentCreated: twitterWebContentCreated,
    });
    return !0;
  }
});

// Add handler for data collection trigger
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TREX_TRIGGER_DATA_COLLECTION") {
    console.log("🎯 [TREX Twitter] Received data collection trigger");

    // Send a message to the webcontent to trigger navigation or refresh
    chrome.tabs.sendMessage(
      TWITTER_WEBCONTENT_ID,
      {
        type: "TREX_FORCE_TWITTER_REFRESH",
        timestamp: Date.now(),
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log(
            "⚠️ [TREX Twitter] Error sending refresh trigger:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log("✅ [TREX Twitter] Refresh trigger sent successfully");
        }
      }
    );

    sendResponse({ success: true });
    return true;
  }
});
