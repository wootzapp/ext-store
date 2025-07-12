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
  if (t.type === _.OpenSidePanel) return console.log("[TREX] OpenSidePanel called - now using popup"), e({ success: !0 }), !0;
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
  if (t.type === _.TrexClaimAction) return console.log("[TREX] Claim action triggered - popup will handle UI"), G(), e({ success: !0 }), !0;
  if (t.type === _.TwitterSendApiData) {
    console.log("🔥 [TREX-BG] 📨 SERVICE WORKER RECEIVED TWITTER DATA:");
    console.log("📊 [TREX-BG] Message Type:", t.type);
    console.log("📏 [TREX-BG] Data Object:", t.data);
    console.log("🔗 [TREX-BG] Origin URL:", t.data?.originUrl);
    console.log("📐 [TREX-BG] Response Size:", t.data?.response ? t.data.response.length : 0, "chars");
    console.log("⏰ [TREX-BG] Processing Timestamp:", new Date().toISOString());
    console.log("🚀 [TREX-BG] Calling upload function P...");
    return P(t.data, e), !0;
  }
  if (t.type === _.YouTubeSendApiData) {
    console.log("🔥 [TREX-BG] 📨 SERVICE WORKER RECEIVED YOUTUBE DATA:");
    console.log("📊 [TREX-BG] Message Type:", t.type);
    console.log("📏 [TREX-BG] Data Object:", t.data);
    console.log("🚀 [TREX-BG] Calling upload function P...");
    return P(t.data, e), !0;
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
