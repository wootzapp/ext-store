import "./modulepreload-polyfill-B5Qt9EMX.js";
import { j as n, c as F } from "./client-D0qgw5AI.js";
import { g as Z } from "./_commonjsHelpers-BosuxZz1.js";
import { r as $ } from "./index-D91ASeLC.js";
/* empty css                 */ var T = { exports: {} },
  G = T.exports,
  _;
function V() {
  return (
    _ ||
      ((_ = 1),
      (function (g, x) {
        (function (d, u) {
          u(g);
        })(
          typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : G,
          function (d) {
            if (
              !(
                globalThis.chrome &&
                globalThis.chrome.runtime &&
                globalThis.chrome.runtime.id
              )
            )
              throw new Error(
                "This script should only be loaded in a browser extension."
              );
            if (
              globalThis.browser &&
              globalThis.browser.runtime &&
              globalThis.browser.runtime.id
            )
              d.exports = globalThis.browser;
            else {
              const u =
                  "The message port closed before a response was received.",
                f = (h) => {
                  const k = {
                    alarms: {
                      clear: { minArgs: 0, maxArgs: 1 },
                      clearAll: { minArgs: 0, maxArgs: 0 },
                      get: { minArgs: 0, maxArgs: 1 },
                      getAll: { minArgs: 0, maxArgs: 0 },
                    },
                    bookmarks: {
                      create: { minArgs: 1, maxArgs: 1 },
                      get: { minArgs: 1, maxArgs: 1 },
                      getChildren: { minArgs: 1, maxArgs: 1 },
                      getRecent: { minArgs: 1, maxArgs: 1 },
                      getSubTree: { minArgs: 1, maxArgs: 1 },
                      getTree: { minArgs: 0, maxArgs: 0 },
                      move: { minArgs: 2, maxArgs: 2 },
                      remove: { minArgs: 1, maxArgs: 1 },
                      removeTree: { minArgs: 1, maxArgs: 1 },
                      search: { minArgs: 1, maxArgs: 1 },
                      update: { minArgs: 2, maxArgs: 2 },
                    },
                    browserAction: {
                      disable: {
                        minArgs: 0,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      enable: {
                        minArgs: 0,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      getBadgeBackgroundColor: { minArgs: 1, maxArgs: 1 },
                      getBadgeText: { minArgs: 1, maxArgs: 1 },
                      getPopup: { minArgs: 1, maxArgs: 1 },
                      getTitle: { minArgs: 1, maxArgs: 1 },
                      openPopup: { minArgs: 0, maxArgs: 0 },
                      setBadgeBackgroundColor: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      setBadgeText: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      setIcon: { minArgs: 1, maxArgs: 1 },
                      setPopup: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      setTitle: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                    },
                    browsingData: {
                      remove: { minArgs: 2, maxArgs: 2 },
                      removeCache: { minArgs: 1, maxArgs: 1 },
                      removeCookies: { minArgs: 1, maxArgs: 1 },
                      removeDownloads: { minArgs: 1, maxArgs: 1 },
                      removeFormData: { minArgs: 1, maxArgs: 1 },
                      removeHistory: { minArgs: 1, maxArgs: 1 },
                      removeLocalStorage: { minArgs: 1, maxArgs: 1 },
                      removePasswords: { minArgs: 1, maxArgs: 1 },
                      removePluginData: { minArgs: 1, maxArgs: 1 },
                      settings: { minArgs: 0, maxArgs: 0 },
                    },
                    commands: { getAll: { minArgs: 0, maxArgs: 0 } },
                    contextMenus: {
                      remove: { minArgs: 1, maxArgs: 1 },
                      removeAll: { minArgs: 0, maxArgs: 0 },
                      update: { minArgs: 2, maxArgs: 2 },
                    },
                    cookies: {
                      get: { minArgs: 1, maxArgs: 1 },
                      getAll: { minArgs: 1, maxArgs: 1 },
                      getAllCookieStores: { minArgs: 0, maxArgs: 0 },
                      remove: { minArgs: 1, maxArgs: 1 },
                      set: { minArgs: 1, maxArgs: 1 },
                    },
                    devtools: {
                      inspectedWindow: {
                        eval: { minArgs: 1, maxArgs: 2, singleCallbackArg: !1 },
                      },
                      panels: {
                        create: {
                          minArgs: 3,
                          maxArgs: 3,
                          singleCallbackArg: !0,
                        },
                        elements: {
                          createSidebarPane: { minArgs: 1, maxArgs: 1 },
                        },
                      },
                    },
                    downloads: {
                      cancel: { minArgs: 1, maxArgs: 1 },
                      download: { minArgs: 1, maxArgs: 1 },
                      erase: { minArgs: 1, maxArgs: 1 },
                      getFileIcon: { minArgs: 1, maxArgs: 2 },
                      open: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      pause: { minArgs: 1, maxArgs: 1 },
                      removeFile: { minArgs: 1, maxArgs: 1 },
                      resume: { minArgs: 1, maxArgs: 1 },
                      search: { minArgs: 1, maxArgs: 1 },
                      show: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                    },
                    extension: {
                      isAllowedFileSchemeAccess: { minArgs: 0, maxArgs: 0 },
                      isAllowedIncognitoAccess: { minArgs: 0, maxArgs: 0 },
                    },
                    history: {
                      addUrl: { minArgs: 1, maxArgs: 1 },
                      deleteAll: { minArgs: 0, maxArgs: 0 },
                      deleteRange: { minArgs: 1, maxArgs: 1 },
                      deleteUrl: { minArgs: 1, maxArgs: 1 },
                      getVisits: { minArgs: 1, maxArgs: 1 },
                      search: { minArgs: 1, maxArgs: 1 },
                    },
                    i18n: {
                      detectLanguage: { minArgs: 1, maxArgs: 1 },
                      getAcceptLanguages: { minArgs: 0, maxArgs: 0 },
                    },
                    identity: { launchWebAuthFlow: { minArgs: 1, maxArgs: 1 } },
                    idle: { queryState: { minArgs: 1, maxArgs: 1 } },
                    management: {
                      get: { minArgs: 1, maxArgs: 1 },
                      getAll: { minArgs: 0, maxArgs: 0 },
                      getSelf: { minArgs: 0, maxArgs: 0 },
                      setEnabled: { minArgs: 2, maxArgs: 2 },
                      uninstallSelf: { minArgs: 0, maxArgs: 1 },
                    },
                    notifications: {
                      clear: { minArgs: 1, maxArgs: 1 },
                      create: { minArgs: 1, maxArgs: 2 },
                      getAll: { minArgs: 0, maxArgs: 0 },
                      getPermissionLevel: { minArgs: 0, maxArgs: 0 },
                      update: { minArgs: 2, maxArgs: 2 },
                    },
                    pageAction: {
                      getPopup: { minArgs: 1, maxArgs: 1 },
                      getTitle: { minArgs: 1, maxArgs: 1 },
                      hide: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      setIcon: { minArgs: 1, maxArgs: 1 },
                      setPopup: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      setTitle: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                      show: {
                        minArgs: 1,
                        maxArgs: 1,
                        fallbackToNoCallback: !0,
                      },
                    },
                    permissions: {
                      contains: { minArgs: 1, maxArgs: 1 },
                      getAll: { minArgs: 0, maxArgs: 0 },
                      remove: { minArgs: 1, maxArgs: 1 },
                      request: { minArgs: 1, maxArgs: 1 },
                    },
                    runtime: {
                      getBackgroundPage: { minArgs: 0, maxArgs: 0 },
                      getPlatformInfo: { minArgs: 0, maxArgs: 0 },
                      openOptionsPage: { minArgs: 0, maxArgs: 0 },
                      requestUpdateCheck: { minArgs: 0, maxArgs: 0 },
                      sendMessage: { minArgs: 1, maxArgs: 3 },
                      sendNativeMessage: { minArgs: 2, maxArgs: 2 },
                      setUninstallURL: { minArgs: 1, maxArgs: 1 },
                    },
                    sessions: {
                      getDevices: { minArgs: 0, maxArgs: 1 },
                      getRecentlyClosed: { minArgs: 0, maxArgs: 1 },
                      restore: { minArgs: 0, maxArgs: 1 },
                    },
                    storage: {
                      local: {
                        clear: { minArgs: 0, maxArgs: 0 },
                        get: { minArgs: 0, maxArgs: 1 },
                        getBytesInUse: { minArgs: 0, maxArgs: 1 },
                        remove: { minArgs: 1, maxArgs: 1 },
                        set: { minArgs: 1, maxArgs: 1 },
                      },
                      managed: {
                        get: { minArgs: 0, maxArgs: 1 },
                        getBytesInUse: { minArgs: 0, maxArgs: 1 },
                      },
                      sync: {
                        clear: { minArgs: 0, maxArgs: 0 },
                        get: { minArgs: 0, maxArgs: 1 },
                        getBytesInUse: { minArgs: 0, maxArgs: 1 },
                        remove: { minArgs: 1, maxArgs: 1 },
                        set: { minArgs: 1, maxArgs: 1 },
                      },
                    },
                    tabs: {
                      captureVisibleTab: { minArgs: 0, maxArgs: 2 },
                      create: { minArgs: 1, maxArgs: 1 },
                      detectLanguage: { minArgs: 0, maxArgs: 1 },
                      discard: { minArgs: 0, maxArgs: 1 },
                      duplicate: { minArgs: 1, maxArgs: 1 },
                      executeScript: { minArgs: 1, maxArgs: 2 },
                      get: { minArgs: 1, maxArgs: 1 },
                      getCurrent: { minArgs: 0, maxArgs: 0 },
                      getZoom: { minArgs: 0, maxArgs: 1 },
                      getZoomSettings: { minArgs: 0, maxArgs: 1 },
                      goBack: { minArgs: 0, maxArgs: 1 },
                      goForward: { minArgs: 0, maxArgs: 1 },
                      highlight: { minArgs: 1, maxArgs: 1 },
                      insertCSS: { minArgs: 1, maxArgs: 2 },
                      move: { minArgs: 2, maxArgs: 2 },
                      query: { minArgs: 1, maxArgs: 1 },
                      reload: { minArgs: 0, maxArgs: 2 },
                      remove: { minArgs: 1, maxArgs: 1 },
                      removeCSS: { minArgs: 1, maxArgs: 2 },
                      sendMessage: { minArgs: 2, maxArgs: 3 },
                      setZoom: { minArgs: 1, maxArgs: 2 },
                      setZoomSettings: { minArgs: 1, maxArgs: 2 },
                      update: { minArgs: 1, maxArgs: 2 },
                    },
                    topSites: { get: { minArgs: 0, maxArgs: 0 } },
                    webNavigation: {
                      getAllFrames: { minArgs: 1, maxArgs: 1 },
                      getFrame: { minArgs: 1, maxArgs: 1 },
                    },
                    webRequest: {
                      handlerBehaviorChanged: { minArgs: 0, maxArgs: 0 },
                    },
                    windows: {
                      create: { minArgs: 0, maxArgs: 1 },
                      get: { minArgs: 1, maxArgs: 2 },
                      getAll: { minArgs: 0, maxArgs: 1 },
                      getCurrent: { minArgs: 0, maxArgs: 1 },
                      getLastFocused: { minArgs: 0, maxArgs: 1 },
                      remove: { minArgs: 1, maxArgs: 1 },
                      update: { minArgs: 2, maxArgs: 2 },
                    },
                  };
                  if (Object.keys(k).length === 0)
                    throw new Error(
                      "api-metadata.json has not been included in browser-polyfill"
                    );
                  class P extends WeakMap {
                    constructor(s, a = void 0) {
                      super(a), (this.createItem = s);
                    }
                    get(s) {
                      return (
                        this.has(s) || this.set(s, this.createItem(s)),
                        super.get(s)
                      );
                    }
                  }
                  const O = (e) =>
                      e && typeof e == "object" && typeof e.then == "function",
                    S =
                      (e, s) =>
                      (...a) => {
                        h.runtime.lastError
                          ? e.reject(new Error(h.runtime.lastError.message))
                          : s.singleCallbackArg ||
                            (a.length <= 1 && s.singleCallbackArg !== !1)
                          ? e.resolve(a[0])
                          : e.resolve(a);
                      },
                    w = (e) => (e == 1 ? "argument" : "arguments"),
                    W = (e, s) =>
                      function (t, ...o) {
                        if (o.length < s.minArgs)
                          throw new Error(
                            `Expected at least ${s.minArgs} ${w(
                              s.minArgs
                            )} for ${e}(), got ${o.length}`
                          );
                        if (o.length > s.maxArgs)
                          throw new Error(
                            `Expected at most ${s.maxArgs} ${w(
                              s.maxArgs
                            )} for ${e}(), got ${o.length}`
                          );
                        return new Promise((m, l) => {
                          if (s.fallbackToNoCallback)
                            try {
                              t[e](...o, S({ resolve: m, reject: l }, s));
                            } catch (r) {
                              console.warn(
                                `${e} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `,
                                r
                              ),
                                t[e](...o),
                                (s.fallbackToNoCallback = !1),
                                (s.noCallback = !0),
                                m();
                            }
                          else
                            s.noCallback
                              ? (t[e](...o), m())
                              : t[e](...o, S({ resolve: m, reject: l }, s));
                        });
                      },
                    M = (e, s, a) =>
                      new Proxy(s, {
                        apply(t, o, m) {
                          return a.call(o, e, ...m);
                        },
                      });
                  let y = Function.call.bind(Object.prototype.hasOwnProperty);
                  const N = (e, s = {}, a = {}) => {
                      let t = Object.create(null),
                        o = {
                          has(l, r) {
                            return r in e || r in t;
                          },
                          get(l, r, A) {
                            if (r in t) return t[r];
                            if (!(r in e)) return;
                            let i = e[r];
                            if (typeof i == "function")
                              if (typeof s[r] == "function")
                                i = M(e, e[r], s[r]);
                              else if (y(a, r)) {
                                let b = W(r, a[r]);
                                i = M(e, e[r], b);
                              } else i = i.bind(e);
                            else if (
                              typeof i == "object" &&
                              i !== null &&
                              (y(s, r) || y(a, r))
                            )
                              i = N(i, s[r], a[r]);
                            else if (y(a, "*")) i = N(i, s[r], a["*"]);
                            else
                              return (
                                Object.defineProperty(t, r, {
                                  configurable: !0,
                                  enumerable: !0,
                                  get() {
                                    return e[r];
                                  },
                                  set(b) {
                                    e[r] = b;
                                  },
                                }),
                                i
                              );
                            return (t[r] = i), i;
                          },
                          set(l, r, A, i) {
                            return r in t ? (t[r] = A) : (e[r] = A), !0;
                          },
                          defineProperty(l, r, A) {
                            return Reflect.defineProperty(t, r, A);
                          },
                          deleteProperty(l, r) {
                            return Reflect.deleteProperty(t, r);
                          },
                        },
                        m = Object.create(e);
                      return new Proxy(m, o);
                    },
                    j = (e) => ({
                      addListener(s, a, ...t) {
                        s.addListener(e.get(a), ...t);
                      },
                      hasListener(s, a) {
                        return s.hasListener(e.get(a));
                      },
                      removeListener(s, a) {
                        s.removeListener(e.get(a));
                      },
                    }),
                    U = new P((e) =>
                      typeof e != "function"
                        ? e
                        : function (a) {
                            const t = N(
                              a,
                              {},
                              { getContent: { minArgs: 0, maxArgs: 0 } }
                            );
                            e(t);
                          }
                    ),
                    L = new P((e) =>
                      typeof e != "function"
                        ? e
                        : function (a, t, o) {
                            let m = !1,
                              l,
                              r = new Promise((v) => {
                                l = function (c) {
                                  (m = !0), v(c);
                                };
                              }),
                              A;
                            try {
                              A = e(a, t, l);
                            } catch (v) {
                              A = Promise.reject(v);
                            }
                            const i = A !== !0 && O(A);
                            if (A !== !0 && !i && !m) return !1;
                            const b = (v) => {
                              v.then(
                                (c) => {
                                  o(c);
                                },
                                (c) => {
                                  let E;
                                  c &&
                                  (c instanceof Error ||
                                    typeof c.message == "string")
                                    ? (E = c.message)
                                    : (E = "An unexpected error occurred"),
                                    o({
                                      __mozWebExtensionPolyfillReject__: !0,
                                      message: E,
                                    });
                                }
                              ).catch((c) => {
                                console.error(
                                  "Failed to send onMessage rejected reply",
                                  c
                                );
                              });
                            };
                            return b(i ? A : r), !0;
                          }
                    ),
                    z = ({ reject: e, resolve: s }, a) => {
                      h.runtime.lastError
                        ? h.runtime.lastError.message === u
                          ? s()
                          : e(new Error(h.runtime.lastError.message))
                        : a && a.__mozWebExtensionPolyfillReject__
                        ? e(new Error(a.message))
                        : s(a);
                    },
                    R = (e, s, a, ...t) => {
                      if (t.length < s.minArgs)
                        throw new Error(
                          `Expected at least ${s.minArgs} ${w(
                            s.minArgs
                          )} for ${e}(), got ${t.length}`
                        );
                      if (t.length > s.maxArgs)
                        throw new Error(
                          `Expected at most ${s.maxArgs} ${w(
                            s.maxArgs
                          )} for ${e}(), got ${t.length}`
                        );
                      return new Promise((o, m) => {
                        const l = z.bind(null, { resolve: o, reject: m });
                        t.push(l), a.sendMessage(...t);
                      });
                    },
                    H = {
                      devtools: { network: { onRequestFinished: j(U) } },
                      runtime: {
                        onMessage: j(L),
                        onMessageExternal: j(L),
                        sendMessage: R.bind(null, "sendMessage", {
                          minArgs: 1,
                          maxArgs: 3,
                        }),
                      },
                      tabs: {
                        sendMessage: R.bind(null, "sendMessage", {
                          minArgs: 2,
                          maxArgs: 3,
                        }),
                      },
                    },
                    C = {
                      clear: { minArgs: 1, maxArgs: 1 },
                      get: { minArgs: 1, maxArgs: 1 },
                      set: { minArgs: 1, maxArgs: 1 },
                    };
                  return (
                    (k.privacy = {
                      network: { "*": C },
                      services: { "*": C },
                      websites: { "*": C },
                    }),
                    N(h, H, k)
                  );
                };
              d.exports = f(chrome);
            }
          }
        );
      })(T)),
    T.exports
  );
}
var J = V();
const p = Z(J);
function B() {
  const [g, x] = $.useState({
    url: "Loading...",
    title: "Loading...",
    status: "Loading...",
    loadTime: "Loading...",
  });
  return (
    $.useEffect(() => {
      (async () => {
        try {
          const f = (await p.tabs.query({ active: !0, currentWindow: !0 }))[0];
          f &&
            x({
              url: f.url || "N/A",
              title: f.title || "N/A",
              status: f.status || "N/A",
              loadTime: `${performance.now().toFixed(2)}ms`,
            });
        } catch (u) {
          console.error("Error getting page info:", u);
        }
      })();
    }, []),
    n.jsxs("div", {
      className: "devtools-container",
      children: [
        n.jsxs("div", {
          className: "section",
          children: [
            n.jsx("div", {
              className: "section-title",
              children: "Page Information",
            }),
            n.jsxs("div", {
              className: "info-item",
              children: [
                n.jsx("span", { className: "info-label", children: "URL:" }),
                n.jsx("span", { className: "info-value", children: g.url }),
              ],
            }),
            n.jsxs("div", {
              className: "info-item",
              children: [
                n.jsx("span", { className: "info-label", children: "Title:" }),
                n.jsx("span", { className: "info-value", children: g.title }),
              ],
            }),
            n.jsxs("div", {
              className: "info-item",
              children: [
                n.jsx("span", { className: "info-label", children: "Status:" }),
                n.jsx("span", { className: "info-value", children: g.status }),
              ],
            }),
            n.jsxs("div", {
              className: "info-item",
              children: [
                n.jsx("span", {
                  className: "info-label",
                  children: "Load Time:",
                }),
                n.jsx("span", {
                  className: "info-value",
                  children: g.loadTime,
                }),
              ],
            }),
          ],
        }),
        n.jsxs("div", {
          className: "section",
          children: [
            n.jsx("div", {
              className: "section-title",
              children: "Performance",
            }),
            n.jsxs("div", {
              className: "info-item",
              children: [
                n.jsx("span", {
                  className: "info-label",
                  children: "Memory Usage:",
                }),
                n.jsx("span", {
                  className: "info-value",
                  children: performance.memory
                    ? `${Math.round(
                        performance.memory.usedJSHeapSize / 1048576
                      )}MB`
                    : "N/A",
                }),
              ],
            }),
            n.jsxs("div", {
              className: "info-item",
              children: [
                n.jsx("span", { className: "info-label", children: "FPS:" }),
                n.jsx("span", { className: "info-value", children: "60" }),
              ],
            }),
          ],
        }),
        n.jsxs("div", {
          className: "section",
          children: [
            n.jsx("div", { className: "section-title", children: "Network" }),
            n.jsxs("div", {
              className: "info-item",
              children: [
                n.jsx("span", {
                  className: "info-label",
                  children: "Requests:",
                }),
                n.jsx("span", { className: "info-value", children: "0" }),
              ],
            }),
            n.jsxs("div", {
              className: "info-item",
              children: [
                n.jsx("span", { className: "info-label", children: "Errors:" }),
                n.jsx("span", { className: "info-value", children: "0" }),
              ],
            }),
          ],
        }),
      ],
    })
  );
}
p.devtools.panels
  .create("Dev Tools", "icon-32.png", "src/pages/devtools/index.html")
  .then((g) => {
    console.log("DevTools panel created");
  })
  .catch(console.error);
async function K() {
  return (await p.tabs.query({ active: !0, currentWindow: !0 }))[0];
}
async function Q() {
  const g = await K();
  if (!g) return;
  const x = {
    url: g.url || "N/A",
    title: g.title || "N/A",
    status: g.status || "N/A",
    loadTime: performance.now().toFixed(2) + "ms",
  };
  try {
    const d = await p.tabs.sendMessage(g.id, { action: "getPageInfo" });
    console.log("Page info:", { ...x, ...d });
  } catch (d) {
    console.error("Error getting page info:", d);
  }
}
var q;
(q = p.devtools.panels.onShown) == null ||
  q.addListener(() => {
    console.log("DevTools panel shown"), Q();
  });
var D;
(D = p.devtools.panels.onHidden) == null ||
  D.addListener(() => {
    console.log("DevTools panel hidden");
  });
function I() {
  const g = document.querySelector("#__root");
  if (g) F.createRoot(g).render(n.jsx(B, {}));
  else {
    const x = document.createElement("div");
    (x.id = "__root"),
      document.body.appendChild(x),
      F.createRoot(x).render(n.jsx(B, {}));
  }
}
document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", I)
  : I();
