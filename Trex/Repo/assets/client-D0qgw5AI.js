console.log("[TREX React Client] 🚀 Loading React client bundle...");
var Jc = { exports: {} },
  be = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Bv;
function hd() {
  console.log("[TREX React Client] Initializing JSX runtime...");
  if (Bv) return be;
  Bv = 1;
  var _ = Symbol.for("react.transitional.element"),
    Dl = Symbol.for("react.fragment");
  function P(o, yl, Yl) {
    var rl = null;
    if (
      (Yl !== void 0 && (rl = "" + Yl),
      yl.key !== void 0 && (rl = "" + yl.key),
      "key" in yl)
    ) {
      Yl = {};
      for (var Tl in yl) Tl !== "key" && (Yl[Tl] = yl[Tl]);
    } else Yl = yl;
    return (
      (yl = Yl.ref),
      {
        $$typeof: _,
        type: o,
        key: rl,
        ref: yl !== void 0 ? yl : null,
        props: Yl,
      }
    );
  }
  return (be.Fragment = Dl), (be.jsx = P), (be.jsxs = P), be;
}
var pv;
function md() {
  return pv || ((pv = 1), (Jc.exports = hd())), Jc.exports;
}
var zd = md(),
  wc = { exports: {} },
  Ee = {},
  Wc = { exports: {} },
  $c = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Gv;
function od() {
  console.log("[TREX React Client] Initializing React scheduler...");
  return (
    Gv ||
      ((Gv = 1),
      (function (_) {
        function Dl(z, p) {
          var Y = z.length;
          z.push(p);
          l: for (; 0 < Y; ) {
            var ll = (Y - 1) >>> 1,
              s = z[ll];
            if (0 < yl(s, p)) (z[ll] = p), (z[Y] = s), (Y = ll);
            else break l;
          }
        }
        function P(z) {
          return z.length === 0 ? null : z[0];
        }
        function o(z) {
          if (z.length === 0) return null;
          var p = z[0],
            Y = z.pop();
          if (Y !== p) {
            z[0] = Y;
            l: for (var ll = 0, s = z.length, T = s >>> 1; ll < T; ) {
              var N = 2 * (ll + 1) - 1,
                R = z[N],
                A = N + 1,
                V = z[A];
              if (0 > yl(R, Y))
                A < s && 0 > yl(V, R)
                  ? ((z[ll] = V), (z[A] = Y), (ll = A))
                  : ((z[ll] = R), (z[N] = Y), (ll = N));
              else if (A < s && 0 > yl(V, Y)) (z[ll] = V), (z[A] = Y), (ll = A);
              else break l;
            }
          }
          return p;
        }
        function yl(z, p) {
          var Y = z.sortIndex - p.sortIndex;
          return Y !== 0 ? Y : z.id - p.id;
        }
        if (
          ((_.unstable_now = void 0),
          typeof performance == "object" &&
            typeof performance.now == "function")
        ) {
          var Yl = performance;
          _.unstable_now = function () {
            return Yl.now();
          };
        } else {
          var rl = Date,
            Tl = rl.now();
          _.unstable_now = function () {
            return rl.now() - Tl;
          };
        }
        var M = [],
          E = [],
          J = 1,
          al = null,
          el = 3,
          hl = !1,
          Ql = !1,
          Pl = !1,
          Ll = typeof setTimeout == "function" ? setTimeout : null,
          _t = typeof clearTimeout == "function" ? clearTimeout : null,
          Bl = typeof setImmediate < "u" ? setImmediate : null;
        function dt(z) {
          for (var p = P(E); p !== null; ) {
            if (p.callback === null) o(E);
            else if (p.startTime <= z)
              o(E), (p.sortIndex = p.expirationTime), Dl(M, p);
            else break;
            p = P(E);
          }
        }
        function Kt(z) {
          console.log("[TREX React Client] Scheduler flush work starting...");
          if (((Pl = !1), dt(z), !Ql))
            if (P(M) !== null) (Ql = !0), Mt();
            else {
              var p = P(E);
              p !== null && jl(Kt, p.startTime - z);
            }
        }
        var w = !1,
          Zl = -1,
          Jt = 5,
          wt = -1;
        function q() {
          return !(_.unstable_now() - wt < Jt);
        }
        function W() {
          if (w) {
            console.log("[TREX React Client] Scheduler work loop executing...");
            var z = _.unstable_now();
            wt = z;
            var p = !0;
            try {
              l: {
                (Ql = !1), Pl && ((Pl = !1), _t(Zl), (Zl = -1)), (hl = !0);
                var Y = el;
                try {
                  t: {
                    for (
                      dt(z), al = P(M);
                      al !== null && !(al.expirationTime > z && q());

                    ) {
                      var ll = al.callback;
                      if (typeof ll == "function") {
                        (al.callback = null), (el = al.priorityLevel);
                        var s = ll(al.expirationTime <= z);
                        if (((z = _.unstable_now()), typeof s == "function")) {
                          (al.callback = s), dt(z), (p = !0);
                          break t;
                        }
                        al === P(M) && o(M), dt(z);
                      } else o(M);
                      al = P(M);
                    }
                    if (al !== null) p = !0;
                    else {
                      var T = P(E);
                      T !== null && jl(Kt, T.startTime - z), (p = !1);
                    }
                  }
                  break l;
                } finally {
                  (al = null), (el = Y), (hl = !1);
                }
                p = void 0;
              }
            } finally {
              p ? Il() : (w = !1);
            }
          }
        }
        var Il;
        if (typeof Bl == "function")
          Il = function () {
            Bl(W);
          };
        else if (typeof MessageChannel < "u") {
          var Dt = new MessageChannel(),
            gt = Dt.port2;
          (Dt.port1.onmessage = W),
            (Il = function () {
              gt.postMessage(null);
            });
        } else
          Il = function () {
            Ll(W, 0);
          };
        function Mt() {
          w || ((w = !0), Il());
        }
        function jl(z, p) {
          Zl = Ll(function () {
            z(_.unstable_now());
          }, p);
        }
        (_.unstable_IdlePriority = 5),
          (_.unstable_ImmediatePriority = 1),
          (_.unstable_LowPriority = 4),
          (_.unstable_NormalPriority = 3),
          (_.unstable_Profiling = null),
          (_.unstable_UserBlockingPriority = 2),
          (_.unstable_cancelCallback = function (z) {
            z.callback = null;
          }),
          (_.unstable_continueExecution = function () {
            Ql || hl || ((Ql = !0), Mt());
          }),
          (_.unstable_forceFrameRate = function (z) {
            0 > z || 125 < z
              ? console.error(
                  "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
                )
              : (Jt = 0 < z ? Math.floor(1e3 / z) : 5);
          }),
          (_.unstable_getCurrentPriorityLevel = function () {
            return el;
          }),
          (_.unstable_getFirstCallbackNode = function () {
            return P(M);
          }),
          (_.unstable_next = function (z) {
            switch (el) {
              case 1:
              case 2:
              case 3:
                var p = 3;
                break;
              default:
                p = el;
            }
            var Y = el;
            el = p;
            try {
              return z();
            } finally {
              el = Y;
            }
          }),
          (_.unstable_pauseExecution = function () {}),
          (_.unstable_requestPaint = function () {}),
          (_.unstable_runWithPriority = function (z, p) {
            switch (z) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                break;
              default:
                z = 3;
            }
            var Y = el;
            el = z;
            try {
              return p();
            } finally {
              el = Y;
            }
          }),
          (_.unstable_scheduleCallback = function (z, p, Y) {
            var ll = _.unstable_now();
            switch (
              (typeof Y == "object" && Y !== null
                ? ((Y = Y.delay),
                  (Y = typeof Y == "number" && 0 < Y ? ll + Y : ll))
                : (Y = ll),
              z)
            ) {
              case 1:
                var s = -1;
                break;
              case 2:
                s = 250;
                break;
              case 5:
                s = 1073741823;
                break;
              case 4:
                s = 1e4;
                break;
              default:
                s = 5e3;
            }
            return (
              (s = Y + s),
              (z = {
                id: J++,
                callback: p,
                priorityLevel: z,
                startTime: Y,
                expirationTime: s,
                sortIndex: -1,
              }),
              Y > ll
                ? ((z.sortIndex = Y),
                  Dl(E, z),
                  P(M) === null &&
                    z === P(E) &&
                    (Pl ? (_t(Zl), (Zl = -1)) : (Pl = !0), jl(Kt, Y - ll)))
                : ((z.sortIndex = s), Dl(M, z), Ql || hl || ((Ql = !0), Mt())),
              z
            );
          }),
          (_.unstable_shouldYield = q),
          (_.unstable_wrapCallback = function (z) {
            var p = el;
            return function () {
              var Y = el;
              el = p;
              try {
                return z.apply(this, arguments);
              } finally {
                el = Y;
              }
            };
          });
      })($c)),
    $c
  );
}
var Xv;
function Sd() {
  return Xv || ((Xv = 1), (Wc.exports = od())), Wc.exports;
}
var kc = { exports: {} },
  G = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Qv;
function gd() {
  if (Qv) return G;
  Qv = 1;
  var _ = Symbol.for("react.transitional.element"),
    Dl = Symbol.for("react.portal"),
    P = Symbol.for("react.fragment"),
    o = Symbol.for("react.strict_mode"),
    yl = Symbol.for("react.profiler"),
    Yl = Symbol.for("react.consumer"),
    rl = Symbol.for("react.context"),
    Tl = Symbol.for("react.forward_ref"),
    M = Symbol.for("react.suspense"),
    E = Symbol.for("react.memo"),
    J = Symbol.for("react.lazy"),
    al = Symbol.iterator;
  function el(s) {
    return s === null || typeof s != "object"
      ? null
      : ((s = (al && s[al]) || s["@@iterator"]),
        typeof s == "function" ? s : null);
  }
  var hl = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () {},
      enqueueReplaceState: function () {},
      enqueueSetState: function () {},
    },
    Ql = Object.assign,
    Pl = {};
  function Ll(s, T, N) {
    console.log("[TREX React Client] Creating React component instance...");
    (this.props = s),
      (this.context = T),
      (this.refs = Pl),
      (this.updater = N || hl);
  }
  (Ll.prototype.isReactComponent = {}),
    (Ll.prototype.setState = function (s, T) {
      console.log("[TREX React Client] setState called:", s);
      if (typeof s != "object" && typeof s != "function" && s != null)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables."
        );
      this.updater.enqueueSetState(this, s, T, "setState");
    }),
    (Ll.prototype.forceUpdate = function (s) {
      console.log("[TREX React Client] forceUpdate called");
      this.updater.enqueueForceUpdate(this, s, "forceUpdate");
    });
  function _t() {}
  _t.prototype = Ll.prototype;
  function Bl(s, T, N) {
    console.log("[TREX React Client] Creating PureComponent instance...");
    (this.props = s),
      (this.context = T),
      (this.refs = Pl),
      (this.updater = N || hl);
  }
  var dt = (Bl.prototype = new _t());
  (dt.constructor = Bl), Ql(dt, Ll.prototype), (dt.isPureReactComponent = !0);
  var Kt = Array.isArray,
    w = { H: null, A: null, T: null, S: null },
    Zl = Object.prototype.hasOwnProperty;
  function Jt(s, T, N, R, A, V) {
    console.log("[TREX React Client] Creating React element:", {
      type: s,
      key: T,
    });
    return (
      (N = V.ref),
      { $$typeof: _, type: s, key: T, ref: N !== void 0 ? N : null, props: V }
    );
  }
  function wt(s, T) {
    return Jt(s.type, T, void 0, void 0, void 0, s.props);
  }
  function q(s) {
    return typeof s == "object" && s !== null && s.$$typeof === _;
  }
  function W(s) {
    var T = { "=": "=0", ":": "=2" };
    return (
      "$" +
      s.replace(/[=:]/g, function (N) {
        return T[N];
      })
    );
  }
  var Il = /\/+/g;
  function Dt(s, T) {
    return typeof s == "object" && s !== null && s.key != null
      ? W("" + s.key)
      : T.toString(36);
  }
  function gt() {}
  function Mt(s) {
    switch (s.status) {
      case "fulfilled":
        return s.value;
      case "rejected":
        throw s.reason;
      default:
        switch (
          (typeof s.status == "string"
            ? s.then(gt, gt)
            : ((s.status = "pending"),
              s.then(
                function (T) {
                  s.status === "pending" &&
                    ((s.status = "fulfilled"), (s.value = T));
                },
                function (T) {
                  s.status === "pending" &&
                    ((s.status = "rejected"), (s.reason = T));
                }
              )),
          s.status)
        ) {
          case "fulfilled":
            return s.value;
          case "rejected":
            throw s.reason;
        }
    }
    throw s;
  }
  function jl(s, T, N, R, A) {
    var V = typeof s;
    (V === "undefined" || V === "boolean") && (s = null);
    var X = !1;
    if (s === null) X = !0;
    else
      switch (V) {
        case "bigint":
        case "string":
        case "number":
          X = !0;
          break;
        case "object":
          switch (s.$$typeof) {
            case _:
            case Dl:
              X = !0;
              break;
            case J:
              return (X = s._init), jl(X(s._payload), T, N, R, A);
          }
      }
    if (X)
      return (
        (A = A(s)),
        (X = R === "" ? "." + Dt(s, 0) : R),
        Kt(A)
          ? ((N = ""),
            X != null && (N = X.replace(Il, "$&/") + "/"),
            jl(A, T, N, "", function (ml) {
              return ml;
            }))
          : A != null &&
            (q(A) &&
              (A = wt(
                A,
                N +
                  (A.key == null || (s && s.key === A.key)
                    ? ""
                    : ("" + A.key).replace(Il, "$&/") + "/") +
                  X
              )),
            T.push(A)),
        1
      );
    X = 0;
    var pl = R === "" ? "." : R + ":";
    if (Kt(s))
      for (var $ = 0; $ < s.length; $++)
        (R = s[$]), (V = pl + Dt(R, $)), (X += jl(R, T, N, V, A));
    else if ((($ = el(s)), typeof $ == "function"))
      for (s = $.call(s), $ = 0; !(R = s.next()).done; )
        (R = R.value), (V = pl + Dt(R, $++)), (X += jl(R, T, N, V, A));
    else if (V === "object") {
      if (typeof s.then == "function") return jl(Mt(s), T, N, R, A);
      throw (
        ((T = String(s)),
        Error(
          "Objects are not valid as a React child (found: " +
            (T === "[object Object]"
              ? "object with keys {" + Object.keys(s).join(", ") + "}"
              : T) +
            "). If you meant to render a collection of children, use an array instead."
        ))
      );
    }
    return X;
  }
  function z(s, T, N) {
    if (s == null) return s;
    var R = [],
      A = 0;
    return (
      jl(s, R, "", "", function (V) {
        return T.call(N, V, A++);
      }),
      R
    );
  }
  function p(s) {
    if (s._status === -1) {
      var T = s._result;
      (T = T()),
        T.then(
          function (N) {
            (s._status === 0 || s._status === -1) &&
              ((s._status = 1), (s._result = N));
          },
          function (N) {
            (s._status === 0 || s._status === -1) &&
              ((s._status = 2), (s._result = N));
          }
        ),
        s._status === -1 && ((s._status = 0), (s._result = T));
    }
    if (s._status === 1) return s._result.default;
    throw s._result;
  }
  var Y =
    typeof reportError == "function"
      ? reportError
      : function (s) {
          console.error("[TREX React Client] ❌ React error reported:", s);
          if (
            typeof window == "object" &&
            typeof window.ErrorEvent == "function"
          ) {
            var T = new window.ErrorEvent("error", {
              bubbles: !0,
              cancelable: !0,
              message:
                typeof s == "object" &&
                s !== null &&
                typeof s.message == "string"
                  ? String(s.message)
                  : String(s),
              error: s,
            });
            if (!window.dispatchEvent(T)) return;
          } else if (
            typeof process == "object" &&
            typeof process.emit == "function"
          ) {
            process.emit("uncaughtException", s);
            return;
          }
          console.error(s);
        };
  function ll() {}
  return (
    (G.Children = {
      map: z,
      forEach: function (s, T, N) {
        z(
          s,
          function () {
            T.apply(this, arguments);
          },
          N
        );
      },
      count: function (s) {
        var T = 0;
        return (
          z(s, function () {
            T++;
          }),
          T
        );
      },
      toArray: function (s) {
        return (
          z(s, function (T) {
            return T;
          }) || []
        );
      },
      only: function (s) {
        if (!q(s))
          throw Error(
            "React.Children.only expected to receive a single React element child."
          );
        return s;
      },
    }),
    (G.Component = Ll),
    (G.Fragment = P),
    (G.Profiler = yl),
    (G.PureComponent = Bl),
    (G.StrictMode = o),
    (G.Suspense = M),
    (G.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = w),
    (G.act = function () {
      throw Error("act(...) is not supported in production builds of React.");
    }),
    (G.cache = function (s) {
      return function () {
        return s.apply(null, arguments);
      };
    }),
    (G.cloneElement = function (s, T, N) {
      if (s == null)
        throw Error(
          "The argument must be a React element, but you passed " + s + "."
        );
      var R = Ql({}, s.props),
        A = s.key,
        V = void 0;
      if (T != null)
        for (X in (T.ref !== void 0 && (V = void 0),
        T.key !== void 0 && (A = "" + T.key),
        T))
          !Zl.call(T, X) ||
            X === "key" ||
            X === "__self" ||
            X === "__source" ||
            (X === "ref" && T.ref === void 0) ||
            (R[X] = T[X]);
      var X = arguments.length - 2;
      if (X === 1) R.children = N;
      else if (1 < X) {
        for (var pl = Array(X), $ = 0; $ < X; $++) pl[$] = arguments[$ + 2];
        R.children = pl;
      }
      return Jt(s.type, A, void 0, void 0, V, R);
    }),
    (G.createContext = function (s) {
      return (
        (s = {
          $$typeof: rl,
          _currentValue: s,
          _currentValue2: s,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
        }),
        (s.Provider = s),
        (s.Consumer = { $$typeof: Yl, _context: s }),
        s
      );
    }),
    (G.createElement = function (s, T, N) {
      var R,
        A = {},
        V = null;
      if (T != null)
        for (R in (T.key !== void 0 && (V = "" + T.key), T))
          Zl.call(T, R) &&
            R !== "key" &&
            R !== "__self" &&
            R !== "__source" &&
            (A[R] = T[R]);
      var X = arguments.length - 2;
      if (X === 1) A.children = N;
      else if (1 < X) {
        for (var pl = Array(X), $ = 0; $ < X; $++) pl[$] = arguments[$ + 2];
        A.children = pl;
      }
      if (s && s.defaultProps)
        for (R in ((X = s.defaultProps), X)) A[R] === void 0 && (A[R] = X[R]);
      return Jt(s, V, void 0, void 0, null, A);
    }),
    (G.createRef = function () {
      return { current: null };
    }),
    (G.forwardRef = function (s) {
      return { $$typeof: Tl, render: s };
    }),
    (G.isValidElement = q),
    (G.lazy = function (s) {
      return { $$typeof: J, _payload: { _status: -1, _result: s }, _init: p };
    }),
    (G.memo = function (s, T) {
      return { $$typeof: E, type: s, compare: T === void 0 ? null : T };
    }),
    (G.startTransition = function (s) {
      var T = w.T,
        N = {};
      w.T = N;
      try {
        var R = s(),
          A = w.S;
        A !== null && A(N, R),
          typeof R == "object" &&
            R !== null &&
            typeof R.then == "function" &&
            R.then(ll, Y);
      } catch (V) {
        Y(V);
      } finally {
        w.T = T;
      }
    }),
    (G.unstable_useCacheRefresh = function () {
      return w.H.useCacheRefresh();
    }),
    (G.use = function (s) {
      return w.H.use(s);
    }),
    (G.useActionState = function (s, T, N) {
      return w.H.useActionState(s, T, N);
    }),
    (G.useCallback = function (s, T) {
      return w.H.useCallback(s, T);
    }),
    (G.useContext = function (s) {
      return w.H.useContext(s);
    }),
    (G.useDebugValue = function () {}),
    (G.useDeferredValue = function (s, T) {
      return w.H.useDeferredValue(s, T);
    }),
    (G.useEffect = function (s, T) {
      return w.H.useEffect(s, T);
    }),
    (G.useId = function () {
      return w.H.useId();
    }),
    (G.useImperativeHandle = function (s, T, N) {
      return w.H.useImperativeHandle(s, T, N);
    }),
    (G.useInsertionEffect = function (s, T) {
      return w.H.useInsertionEffect(s, T);
    }),
    (G.useLayoutEffect = function (s, T) {
      return w.H.useLayoutEffect(s, T);
    }),
    (G.useMemo = function (s, T) {
      return w.H.useMemo(s, T);
    }),
    (G.useOptimistic = function (s, T) {
      return w.H.useOptimistic(s, T);
    }),
    (G.useReducer = function (s, T, N) {
      return w.H.useReducer(s, T, N);
    }),
    (G.useRef = function (s) {
      return w.H.useRef(s);
    }),
    (G.useState = function (s) {
      return w.H.useState(s);
    }),
    (G.useSyncExternalStore = function (s, T, N) {
      return w.H.useSyncExternalStore(s, T, N);
    }),
    (G.useTransition = function () {
      return w.H.useTransition();
    }),
    (G.version = "19.0.0"),
    G
  );
}
var Zv;
function Lv() {
  return Zv || ((Zv = 1), (kc.exports = gd())), kc.exports;
}
var Fc = { exports: {} },
  Nl = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var jv;
function rd() {
  if (jv) return Nl;
  jv = 1;
  var _ = Lv();
  function Dl(M) {
    var E = "https://react.dev/errors/" + M;
    if (1 < arguments.length) {
      E += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var J = 2; J < arguments.length; J++)
        E += "&args[]=" + encodeURIComponent(arguments[J]);
    }
    return (
      "Minified React error #" +
      M +
      "; visit " +
      E +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  function P() {}
  var o = {
      d: {
        f: P,
        r: function () {
          throw Error(Dl(522));
        },
        D: P,
        C: P,
        L: P,
        m: P,
        X: P,
        S: P,
        M: P,
      },
      p: 0,
      findDOMNode: null,
    },
    yl = Symbol.for("react.portal");
  function Yl(M, E, J) {
    var al =
      3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: yl,
      key: al == null ? null : "" + al,
      children: M,
      containerInfo: E,
      implementation: J,
    };
  }
  var rl = _.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function Tl(M, E) {
    if (M === "font") return "";
    if (typeof E == "string") return E === "use-credentials" ? E : "";
  }
  return (
    (Nl.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = o),
    (Nl.createPortal = function (M, E) {
      var J =
        2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!E || (E.nodeType !== 1 && E.nodeType !== 9 && E.nodeType !== 11))
        throw Error(Dl(299));
      return Yl(M, E, null, J);
    }),
    (Nl.flushSync = function (M) {
      var E = rl.T,
        J = o.p;
      try {
        if (((rl.T = null), (o.p = 2), M)) return M();
      } finally {
        (rl.T = E), (o.p = J), o.d.f();
      }
    }),
    (Nl.preconnect = function (M, E) {
      typeof M == "string" &&
        (E
          ? ((E = E.crossOrigin),
            (E =
              typeof E == "string"
                ? E === "use-credentials"
                  ? E
                  : ""
                : void 0))
          : (E = null),
        o.d.C(M, E));
    }),
    (Nl.prefetchDNS = function (M) {
      typeof M == "string" && o.d.D(M);
    }),
    (Nl.preinit = function (M, E) {
      if (typeof M == "string" && E && typeof E.as == "string") {
        var J = E.as,
          al = Tl(J, E.crossOrigin),
          el = typeof E.integrity == "string" ? E.integrity : void 0,
          hl = typeof E.fetchPriority == "string" ? E.fetchPriority : void 0;
        J === "style"
          ? o.d.S(M, typeof E.precedence == "string" ? E.precedence : void 0, {
              crossOrigin: al,
              integrity: el,
              fetchPriority: hl,
            })
          : J === "script" &&
            o.d.X(M, {
              crossOrigin: al,
              integrity: el,
              fetchPriority: hl,
              nonce: typeof E.nonce == "string" ? E.nonce : void 0,
            });
      }
    }),
    (Nl.preinitModule = function (M, E) {
      if (typeof M == "string")
        if (typeof E == "object" && E !== null) {
          if (E.as == null || E.as === "script") {
            var J = Tl(E.as, E.crossOrigin);
            o.d.M(M, {
              crossOrigin: J,
              integrity: typeof E.integrity == "string" ? E.integrity : void 0,
              nonce: typeof E.nonce == "string" ? E.nonce : void 0,
            });
          }
        } else E == null && o.d.M(M);
    }),
    (Nl.preload = function (M, E) {
      if (
        typeof M == "string" &&
        typeof E == "object" &&
        E !== null &&
        typeof E.as == "string"
      ) {
        var J = E.as,
          al = Tl(J, E.crossOrigin);
        o.d.L(M, J, {
          crossOrigin: al,
          integrity: typeof E.integrity == "string" ? E.integrity : void 0,
          nonce: typeof E.nonce == "string" ? E.nonce : void 0,
          type: typeof E.type == "string" ? E.type : void 0,
          fetchPriority:
            typeof E.fetchPriority == "string" ? E.fetchPriority : void 0,
          referrerPolicy:
            typeof E.referrerPolicy == "string" ? E.referrerPolicy : void 0,
          imageSrcSet:
            typeof E.imageSrcSet == "string" ? E.imageSrcSet : void 0,
          imageSizes: typeof E.imageSizes == "string" ? E.imageSizes : void 0,
          media: typeof E.media == "string" ? E.media : void 0,
        });
      }
    }),
    (Nl.preloadModule = function (M, E) {
      if (typeof M == "string")
        if (E) {
          var J = Tl(E.as, E.crossOrigin);
          o.d.m(M, {
            as: typeof E.as == "string" && E.as !== "script" ? E.as : void 0,
            crossOrigin: J,
            integrity: typeof E.integrity == "string" ? E.integrity : void 0,
          });
        } else o.d.m(M);
    }),
    (Nl.requestFormReset = function (M) {
      o.d.r(M);
    }),
    (Nl.unstable_batchedUpdates = function (M, E) {
      return M(E);
    }),
    (Nl.useFormState = function (M, E, J) {
      return rl.H.useFormState(M, E, J);
    }),
    (Nl.useFormStatus = function () {
      return rl.H.useHostTransitionStatus();
    }),
    (Nl.version = "19.0.0"),
    Nl
  );
}
var Cv;
function bd() {
  console.log("[TREX React Client] Initializing React DOM...");
  if (Cv) return Fc.exports;
  Cv = 1;
  function _() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(_);
      } catch (Dl) {
        console.error("[TREX React Client] DevTools hook error:", Dl);
      }
  }
  return _(), (Fc.exports = rd()), Fc.exports;
}
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Vv;
function Ed() {
  console.log("[TREX React Client] Setting up React DOM client...");
  if (Vv) return Ee;
  Vv = 1;
  var _ = Sd(),
    Dl = Lv(),
    P = bd();
  function o(l) {
    console.error("[TREX React Client] React error #" + l + " occurred");
    var t = "https://react.dev/errors/" + l;
    if (1 < arguments.length) {
      t += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var u = 2; u < arguments.length; u++)
        t += "&args[]=" + encodeURIComponent(arguments[u]);
    }
    return (
      "Minified React error #" +
      l +
      "; visit " +
      t +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  function yl(l) {
    return !(!l || (l.nodeType !== 1 && l.nodeType !== 9 && l.nodeType !== 11));
  }
  var Yl = Symbol.for("react.element"),
    rl = Symbol.for("react.transitional.element"),
    Tl = Symbol.for("react.portal"),
    M = Symbol.for("react.fragment"),
    E = Symbol.for("react.strict_mode"),
    J = Symbol.for("react.profiler"),
    al = Symbol.for("react.provider"),
    el = Symbol.for("react.consumer"),
    hl = Symbol.for("react.context"),
    Ql = Symbol.for("react.forward_ref"),
    Pl = Symbol.for("react.suspense"),
    Ll = Symbol.for("react.suspense_list"),
    _t = Symbol.for("react.memo"),
    Bl = Symbol.for("react.lazy"),
    dt = Symbol.for("react.offscreen"),
    Kt = Symbol.for("react.memo_cache_sentinel"),
    w = Symbol.iterator;
  function Zl(l) {
    return l === null || typeof l != "object"
      ? null
      : ((l = (w && l[w]) || l["@@iterator"]),
        typeof l == "function" ? l : null);
  }
  var Jt = Symbol.for("react.client.reference");
  function wt(l) {
    if (l == null) return null;
    if (typeof l == "function") {
      var componentName =
        l.$$typeof === Jt ? null : l.displayName || l.name || null;
      console.log(
        "[TREX React Client] Component name resolved:",
        componentName
      );
      return componentName;
    }
    if (typeof l == "string") return l;
    switch (l) {
      case M:
        return "Fragment";
      case Tl:
        return "Portal";
      case J:
        return "Profiler";
      case E:
        return "StrictMode";
      case Pl:
        return "Suspense";
      case Ll:
        return "SuspenseList";
    }
    if (typeof l == "object")
      switch (l.$$typeof) {
        case hl:
          return (l.displayName || "Context") + ".Provider";
        case el:
          return (l._context.displayName || "Context") + ".Consumer";
        case Ql:
          var t = l.render;
          return (
            (l = l.displayName),
            l ||
              ((l = t.displayName || t.name || ""),
              (l = l !== "" ? "ForwardRef(" + l + ")" : "ForwardRef")),
            l
          );
        case _t:
          return (
            (t = l.displayName || null), t !== null ? t : wt(l.type) || "Memo"
          );
        case Bl:
          (t = l._payload), (l = l._init);
          try {
            return wt(l(t));
          } catch {}
      }
    return null;
  }
  var q = Dl.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
    W = Object.assign,
    Il,
    Dt;
  function gt(l) {
    if (Il === void 0)
      try {
        throw Error();
      } catch (u) {
        var t = u.stack.trim().match(/\n( *(at )?)/);
        (Il = (t && t[1]) || ""),
          (Dt =
            -1 <
            u.stack.indexOf(`
    at`)
              ? " (<anonymous>)"
              : -1 < u.stack.indexOf("@")
              ? "@unknown:0:0"
              : "");
      }
    return (
      `
` +
      Il +
      l +
      Dt
    );
  }
  var Mt = !1;
  function jl(l, t) {
    if (!l || Mt) return "";
    Mt = !0;
    var u = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var a = {
        DetermineComponentFrameRoot: function () {
          try {
            if (t) {
              var b = function () {
                throw Error();
              };
              if (
                (Object.defineProperty(b.prototype, "props", {
                  set: function () {
                    throw Error();
                  },
                }),
                typeof Reflect == "object" && Reflect.construct)
              ) {
                try {
                  Reflect.construct(b, []);
                } catch (S) {
                  var m = S;
                }
                Reflect.construct(l, [], b);
              } else {
                try {
                  b.call();
                } catch (S) {
                  m = S;
                }
                l.call(b.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (S) {
                m = S;
              }
              (b = l()) &&
                typeof b.catch == "function" &&
                b.catch(function () {});
            }
          } catch (S) {
            if (S && m && typeof S.stack == "string") return [S.stack, m.stack];
          }
          return [null, null];
        },
      };
      a.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var e = Object.getOwnPropertyDescriptor(
        a.DetermineComponentFrameRoot,
        "name"
      );
      e &&
        e.configurable &&
        Object.defineProperty(a.DetermineComponentFrameRoot, "name", {
          value: "DetermineComponentFrameRoot",
        });
      var n = a.DetermineComponentFrameRoot(),
        f = n[0],
        c = n[1];
      if (f && c) {
        var i = f.split(`
`),
          y = c.split(`
`);
        for (
          e = a = 0;
          a < i.length && !i[a].includes("DetermineComponentFrameRoot");

        )
          a++;
        for (; e < y.length && !y[e].includes("DetermineComponentFrameRoot"); )
          e++;
        if (a === i.length || e === y.length)
          for (
            a = i.length - 1, e = y.length - 1;
            1 <= a && 0 <= e && i[a] !== y[e];

          )
            e--;
        for (; 1 <= a && 0 <= e; a--, e--)
          if (i[a] !== y[e]) {
            if (a !== 1 || e !== 1)
              do
                if ((a--, e--, 0 > e || i[a] !== y[e])) {
                  var g =
                    `
` + i[a].replace(" at new ", " at ");
                  return (
                    l.displayName &&
                      g.includes("<anonymous>") &&
                      (g = g.replace("<anonymous>", l.displayName)),
                    g
                  );
                }
              while (1 <= a && 0 <= e);
            break;
          }
      }
    } finally {
      (Mt = !1), (Error.prepareStackTrace = u);
    }
    return (u = l ? l.displayName || l.name : "") ? gt(u) : "";
  }
  function z(l) {
    switch (l.tag) {
      case 26:
      case 27:
      case 5:
        return gt(l.type);
      case 16:
        return gt("Lazy");
      case 13:
        return gt("Suspense");
      case 19:
        return gt("SuspenseList");
      case 0:
      case 15:
        return (l = jl(l.type, !1)), l;
      case 11:
        return (l = jl(l.type.render, !1)), l;
      case 1:
        return (l = jl(l.type, !0)), l;
      default:
        return "";
    }
  }
  function p(l) {
    try {
      var t = "";
      do (t += z(l)), (l = l.return);
      while (l);
      return t;
    } catch (u) {
      return (
        `
Error generating stack: ` +
        u.message +
        `
` +
        u.stack
      );
    }
  }
  function Y(l) {
    var t = l,
      u = l;
    if (l.alternate) for (; t.return; ) t = t.return;
    else {
      l = t;
      do (t = l), t.flags & 4098 && (u = t.return), (l = t.return);
      while (l);
    }
    return t.tag === 3 ? u : null;
  }
  function ll(l) {
    if (l.tag === 13) {
      var t = l.memoizedState;
      if (
        (t === null && ((l = l.alternate), l !== null && (t = l.memoizedState)),
        t !== null)
      )
        return t.dehydrated;
    }
    return null;
  }
  function s(l) {
    if (Y(l) !== l) throw Error(o(188));
  }
  function T(l) {
    var t = l.alternate;
    if (!t) {
      if (((t = Y(l)), t === null)) throw Error(o(188));
      return t !== l ? null : l;
    }
    for (var u = l, a = t; ; ) {
      var e = u.return;
      if (e === null) break;
      var n = e.alternate;
      if (n === null) {
        if (((a = e.return), a !== null)) {
          u = a;
          continue;
        }
        break;
      }
      if (e.child === n.child) {
        for (n = e.child; n; ) {
          if (n === u) return s(e), l;
          if (n === a) return s(e), t;
          n = n.sibling;
        }
        throw Error(o(188));
      }
      if (u.return !== a.return) (u = e), (a = n);
      else {
        for (var f = !1, c = e.child; c; ) {
          if (c === u) {
            (f = !0), (u = e), (a = n);
            break;
          }
          if (c === a) {
            (f = !0), (a = e), (u = n);
            break;
          }
          c = c.sibling;
        }
        if (!f) {
          for (c = n.child; c; ) {
            if (c === u) {
              (f = !0), (u = n), (a = e);
              break;
            }
            if (c === a) {
              (f = !0), (a = n), (u = e);
              break;
            }
            c = c.sibling;
          }
          if (!f) throw Error(o(189));
        }
      }
      if (u.alternate !== a) throw Error(o(190));
    }
    if (u.tag !== 3) throw Error(o(188));
    return u.stateNode.current === u ? l : t;
  }
  function N(l) {
    var t = l.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return l;
    for (l = l.child; l !== null; ) {
      if (((t = N(l)), t !== null)) return t;
      l = l.sibling;
    }
    return null;
  }
  var R = Array.isArray,
    A = P.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
    V = { pending: !1, data: null, method: null, action: null },
    X = [],
    pl = -1;
  function $(l) {
    return { current: l };
  }
  function ml(l) {
    0 > pl || ((l.current = X[pl]), (X[pl] = null), pl--);
  }
  function nl(l, t) {
    pl++, (X[pl] = l.current), (l.current = t);
  }
  var rt = $(null),
    za = $(null),
    Wt = $(null),
    Te = $(null);
  function ze(l, t) {
    switch ((nl(Wt, t), nl(za, l), nl(rt, null), (l = t.nodeType), l)) {
      case 9:
      case 11:
        t = (t = t.documentElement) && (t = t.namespaceURI) ? sv(t) : 0;
        break;
      default:
        if (
          ((l = l === 8 ? t.parentNode : t),
          (t = l.tagName),
          (l = l.namespaceURI))
        )
          (l = sv(l)), (t = vv(l, t));
        else
          switch (t) {
            case "svg":
              t = 1;
              break;
            case "math":
              t = 2;
              break;
            default:
              t = 0;
          }
    }
    ml(rt), nl(rt, t);
  }
  function ju() {
    ml(rt), ml(za), ml(Wt);
  }
  function Gn(l) {
    l.memoizedState !== null && nl(Te, l);
    var t = rt.current,
      u = vv(t, l.type);
    t !== u && (nl(za, l), nl(rt, u));
  }
  function Ae(l) {
    za.current === l && (ml(rt), ml(za)),
      Te.current === l && (ml(Te), (me._currentValue = V));
  }
  var Xn = Object.prototype.hasOwnProperty,
    Qn = _.unstable_scheduleCallback,
    Zn = _.unstable_cancelCallback,
    Kv = _.unstable_shouldYield,
    Jv = _.unstable_requestPaint,
    bt = _.unstable_now,
    wv = _.unstable_getCurrentPriorityLevel,
    Pc = _.unstable_ImmediatePriority,
    Ic = _.unstable_UserBlockingPriority,
    Oe = _.unstable_NormalPriority,
    Wv = _.unstable_LowPriority,
    li = _.unstable_IdlePriority,
    $v = _.log,
    kv = _.unstable_setDisableYieldValue,
    Aa = null,
    Kl = null;
  function Fv(l) {
    if (Kl && typeof Kl.onCommitFiberRoot == "function")
      try {
        Kl.onCommitFiberRoot(Aa, l, void 0, (l.current.flags & 128) === 128);
      } catch {}
  }
  function $t(l) {
    if (
      (typeof $v == "function" && kv(l),
      Kl && typeof Kl.setStrictMode == "function")
    )
      try {
        Kl.setStrictMode(Aa, l);
      } catch {}
  }
  var Jl = Math.clz32 ? Math.clz32 : ly,
    Pv = Math.log,
    Iv = Math.LN2;
  function ly(l) {
    return (l >>>= 0), l === 0 ? 32 : (31 - ((Pv(l) / Iv) | 0)) | 0;
  }
  var _e = 128,
    De = 4194304;
  function ru(l) {
    var t = l & 42;
    if (t !== 0) return t;
    switch (l & -l) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return l & 4194176;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return l & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return l;
    }
  }
  function Me(l, t) {
    var u = l.pendingLanes;
    if (u === 0) return 0;
    var a = 0,
      e = l.suspendedLanes,
      n = l.pingedLanes,
      f = l.warmLanes;
    l = l.finishedLanes !== 0;
    var c = u & 134217727;
    return (
      c !== 0
        ? ((u = c & ~e),
          u !== 0
            ? (a = ru(u))
            : ((n &= c),
              n !== 0
                ? (a = ru(n))
                : l || ((f = c & ~f), f !== 0 && (a = ru(f)))))
        : ((c = u & ~e),
          c !== 0
            ? (a = ru(c))
            : n !== 0
            ? (a = ru(n))
            : l || ((f = u & ~f), f !== 0 && (a = ru(f)))),
      a === 0
        ? 0
        : t !== 0 &&
          t !== a &&
          !(t & e) &&
          ((e = a & -a),
          (f = t & -t),
          e >= f || (e === 32 && (f & 4194176) !== 0))
        ? t
        : a
    );
  }
  function Oa(l, t) {
    return (l.pendingLanes & ~(l.suspendedLanes & ~l.pingedLanes) & t) === 0;
  }
  function ty(l, t) {
    switch (l) {
      case 1:
      case 2:
      case 4:
      case 8:
        return t + 250;
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function ti() {
    var l = _e;
    return (_e <<= 1), !(_e & 4194176) && (_e = 128), l;
  }
  function ui() {
    var l = De;
    return (De <<= 1), !(De & 62914560) && (De = 4194304), l;
  }
  function jn(l) {
    for (var t = [], u = 0; 31 > u; u++) t.push(l);
    return t;
  }
  function _a(l, t) {
    (l.pendingLanes |= t),
      t !== 268435456 &&
        ((l.suspendedLanes = 0), (l.pingedLanes = 0), (l.warmLanes = 0));
  }
  function uy(l, t, u, a, e, n) {
    var f = l.pendingLanes;
    (l.pendingLanes = u),
      (l.suspendedLanes = 0),
      (l.pingedLanes = 0),
      (l.warmLanes = 0),
      (l.expiredLanes &= u),
      (l.entangledLanes &= u),
      (l.errorRecoveryDisabledLanes &= u),
      (l.shellSuspendCounter = 0);
    var c = l.entanglements,
      i = l.expirationTimes,
      y = l.hiddenUpdates;
    for (u = f & ~u; 0 < u; ) {
      var g = 31 - Jl(u),
        b = 1 << g;
      (c[g] = 0), (i[g] = -1);
      var m = y[g];
      if (m !== null)
        for (y[g] = null, g = 0; g < m.length; g++) {
          var S = m[g];
          S !== null && (S.lane &= -536870913);
        }
      u &= ~b;
    }
    a !== 0 && ai(l, a, 0),
      n !== 0 && e === 0 && l.tag !== 0 && (l.suspendedLanes |= n & ~(f & ~t));
  }
  function ai(l, t, u) {
    (l.pendingLanes |= t), (l.suspendedLanes &= ~t);
    var a = 31 - Jl(t);
    (l.entangledLanes |= t),
      (l.entanglements[a] = l.entanglements[a] | 1073741824 | (u & 4194218));
  }
  function ei(l, t) {
    var u = (l.entangledLanes |= t);
    for (l = l.entanglements; u; ) {
      var a = 31 - Jl(u),
        e = 1 << a;
      (e & t) | (l[a] & t) && (l[a] |= t), (u &= ~e);
    }
  }
  function ni(l) {
    return (
      (l &= -l), 2 < l ? (8 < l ? (l & 134217727 ? 32 : 268435456) : 8) : 2
    );
  }
  function fi() {
    var l = A.p;
    return l !== 0 ? l : ((l = window.event), l === void 0 ? 32 : Uv(l.type));
  }
  function ay(l, t) {
    var u = A.p;
    try {
      return (A.p = l), t();
    } finally {
      A.p = u;
    }
  }
  var kt = Math.random().toString(36).slice(2),
    Hl = "__reactFiber$" + kt,
    Cl = "__reactProps$" + kt,
    Cu = "__reactContainer$" + kt,
    Cn = "__reactEvents$" + kt,
    ey = "__reactListeners$" + kt,
    ny = "__reactHandles$" + kt,
    ci = "__reactResources$" + kt,
    Da = "__reactMarker$" + kt;
  function Vn(l) {
    delete l[Hl], delete l[Cl], delete l[Cn], delete l[ey], delete l[ny];
  }
  function bu(l) {
    var t = l[Hl];
    if (t) return t;
    for (var u = l.parentNode; u; ) {
      if ((t = u[Cu] || u[Hl])) {
        if (
          ((u = t.alternate),
          t.child !== null || (u !== null && u.child !== null))
        )
          for (l = hv(l); l !== null; ) {
            if ((u = l[Hl])) return u;
            l = hv(l);
          }
        return t;
      }
      (l = u), (u = l.parentNode);
    }
    return null;
  }
  function Vu(l) {
    if ((l = l[Hl] || l[Cu])) {
      var t = l.tag;
      if (t === 5 || t === 6 || t === 13 || t === 26 || t === 27 || t === 3)
        return l;
    }
    return null;
  }
  function Ma(l) {
    var t = l.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return l.stateNode;
    throw Error(o(33));
  }
  function xu(l) {
    var t = l[ci];
    return (
      t ||
        (t = l[ci] =
          { hoistableStyles: new Map(), hoistableScripts: new Map() }),
      t
    );
  }
  function zl(l) {
    l[Da] = !0;
  }
  var ii = new Set(),
    si = {};
  function Eu(l, t) {
    Lu(l, t), Lu(l + "Capture", t);
  }
  function Lu(l, t) {
    for (si[l] = t, l = 0; l < t.length; l++) ii.add(t[l]);
  }
  var Ut = !(
      typeof window > "u" ||
      typeof window.document > "u" ||
      typeof window.document.createElement > "u"
    ),
    fy = RegExp(
      "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
    ),
    vi = {},
    yi = {};
  function cy(l) {
    return Xn.call(yi, l)
      ? !0
      : Xn.call(vi, l)
      ? !1
      : fy.test(l)
      ? (yi[l] = !0)
      : ((vi[l] = !0), !1);
  }
  function Ue(l, t, u) {
    if (cy(t))
      if (u === null) l.removeAttribute(t);
      else {
        switch (typeof u) {
          case "undefined":
          case "function":
          case "symbol":
            l.removeAttribute(t);
            return;
          case "boolean":
            var a = t.toLowerCase().slice(0, 5);
            if (a !== "data-" && a !== "aria-") {
              l.removeAttribute(t);
              return;
            }
        }
        l.setAttribute(t, "" + u);
      }
  }
  function Re(l, t, u) {
    if (u === null) l.removeAttribute(t);
    else {
      switch (typeof u) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          l.removeAttribute(t);
          return;
      }
      l.setAttribute(t, "" + u);
    }
  }
  function Rt(l, t, u, a) {
    if (a === null) l.removeAttribute(u);
    else {
      switch (typeof a) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          l.removeAttribute(u);
          return;
      }
      l.setAttributeNS(t, u, "" + a);
    }
  }
  function lt(l) {
    switch (typeof l) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return l;
      case "object":
        return l;
      default:
        return "";
    }
  }
  function di(l) {
    var t = l.type;
    return (
      (l = l.nodeName) &&
      l.toLowerCase() === "input" &&
      (t === "checkbox" || t === "radio")
    );
  }
  function iy(l) {
    var t = di(l) ? "checked" : "value",
      u = Object.getOwnPropertyDescriptor(l.constructor.prototype, t),
      a = "" + l[t];
    if (
      !l.hasOwnProperty(t) &&
      typeof u < "u" &&
      typeof u.get == "function" &&
      typeof u.set == "function"
    ) {
      var e = u.get,
        n = u.set;
      return (
        Object.defineProperty(l, t, {
          configurable: !0,
          get: function () {
            return e.call(this);
          },
          set: function (f) {
            (a = "" + f), n.call(this, f);
          },
        }),
        Object.defineProperty(l, t, { enumerable: u.enumerable }),
        {
          getValue: function () {
            return a;
          },
          setValue: function (f) {
            a = "" + f;
          },
          stopTracking: function () {
            (l._valueTracker = null), delete l[t];
          },
        }
      );
    }
  }
  function He(l) {
    l._valueTracker || (l._valueTracker = iy(l));
  }
  function hi(l) {
    if (!l) return !1;
    var t = l._valueTracker;
    if (!t) return !0;
    var u = t.getValue(),
      a = "";
    return (
      l && (a = di(l) ? (l.checked ? "true" : "false") : l.value),
      (l = a),
      l !== u ? (t.setValue(l), !0) : !1
    );
  }
  function qe(l) {
    if (
      ((l = l || (typeof document < "u" ? document : void 0)), typeof l > "u")
    )
      return null;
    try {
      return l.activeElement || l.body;
    } catch {
      return l.body;
    }
  }
  var sy = /[\n"\\]/g;
  function tt(l) {
    return l.replace(sy, function (t) {
      return "\\" + t.charCodeAt(0).toString(16) + " ";
    });
  }
  function xn(l, t, u, a, e, n, f, c) {
    (l.name = ""),
      f != null &&
      typeof f != "function" &&
      typeof f != "symbol" &&
      typeof f != "boolean"
        ? (l.type = f)
        : l.removeAttribute("type"),
      t != null
        ? f === "number"
          ? ((t === 0 && l.value === "") || l.value != t) &&
            (l.value = "" + lt(t))
          : l.value !== "" + lt(t) && (l.value = "" + lt(t))
        : (f !== "submit" && f !== "reset") || l.removeAttribute("value"),
      t != null
        ? Ln(l, f, lt(t))
        : u != null
        ? Ln(l, f, lt(u))
        : a != null && l.removeAttribute("value"),
      e == null && n != null && (l.defaultChecked = !!n),
      e != null &&
        (l.checked = e && typeof e != "function" && typeof e != "symbol"),
      c != null &&
      typeof c != "function" &&
      typeof c != "symbol" &&
      typeof c != "boolean"
        ? (l.name = "" + lt(c))
        : l.removeAttribute("name");
  }
  function mi(l, t, u, a, e, n, f, c) {
    if (
      (n != null &&
        typeof n != "function" &&
        typeof n != "symbol" &&
        typeof n != "boolean" &&
        (l.type = n),
      t != null || u != null)
    ) {
      if (!((n !== "submit" && n !== "reset") || t != null)) return;
      (u = u != null ? "" + lt(u) : ""),
        (t = t != null ? "" + lt(t) : u),
        c || t === l.value || (l.value = t),
        (l.defaultValue = t);
    }
    (a = a ?? e),
      (a = typeof a != "function" && typeof a != "symbol" && !!a),
      (l.checked = c ? l.checked : !!a),
      (l.defaultChecked = !!a),
      f != null &&
        typeof f != "function" &&
        typeof f != "symbol" &&
        typeof f != "boolean" &&
        (l.name = f);
  }
  function Ln(l, t, u) {
    (t === "number" && qe(l.ownerDocument) === l) ||
      l.defaultValue === "" + u ||
      (l.defaultValue = "" + u);
  }
  function Ku(l, t, u, a) {
    if (((l = l.options), t)) {
      t = {};
      for (var e = 0; e < u.length; e++) t["$" + u[e]] = !0;
      for (u = 0; u < l.length; u++)
        (e = t.hasOwnProperty("$" + l[u].value)),
          l[u].selected !== e && (l[u].selected = e),
          e && a && (l[u].defaultSelected = !0);
    } else {
      for (u = "" + lt(u), t = null, e = 0; e < l.length; e++) {
        if (l[e].value === u) {
          (l[e].selected = !0), a && (l[e].defaultSelected = !0);
          return;
        }
        t !== null || l[e].disabled || (t = l[e]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function oi(l, t, u) {
    if (
      t != null &&
      ((t = "" + lt(t)), t !== l.value && (l.value = t), u == null)
    ) {
      l.defaultValue !== t && (l.defaultValue = t);
      return;
    }
    l.defaultValue = u != null ? "" + lt(u) : "";
  }
  function Si(l, t, u, a) {
    if (t == null) {
      if (a != null) {
        if (u != null) throw Error(o(92));
        if (R(a)) {
          if (1 < a.length) throw Error(o(93));
          a = a[0];
        }
        u = a;
      }
      u == null && (u = ""), (t = u);
    }
    (u = lt(t)),
      (l.defaultValue = u),
      (a = l.textContent),
      a === u && a !== "" && a !== null && (l.value = a);
  }
  function Ju(l, t) {
    if (t) {
      var u = l.firstChild;
      if (u && u === l.lastChild && u.nodeType === 3) {
        u.nodeValue = t;
        return;
      }
    }
    l.textContent = t;
  }
  var vy = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function gi(l, t, u) {
    var a = t.indexOf("--") === 0;
    u == null || typeof u == "boolean" || u === ""
      ? a
        ? l.setProperty(t, "")
        : t === "float"
        ? (l.cssFloat = "")
        : (l[t] = "")
      : a
      ? l.setProperty(t, u)
      : typeof u != "number" || u === 0 || vy.has(t)
      ? t === "float"
        ? (l.cssFloat = u)
        : (l[t] = ("" + u).trim())
      : (l[t] = u + "px");
  }
  function ri(l, t, u) {
    if (t != null && typeof t != "object") throw Error(o(62));
    if (((l = l.style), u != null)) {
      for (var a in u)
        !u.hasOwnProperty(a) ||
          (t != null && t.hasOwnProperty(a)) ||
          (a.indexOf("--") === 0
            ? l.setProperty(a, "")
            : a === "float"
            ? (l.cssFloat = "")
            : (l[a] = ""));
      for (var e in t)
        (a = t[e]), t.hasOwnProperty(e) && u[e] !== a && gi(l, e, a);
    } else for (var n in t) t.hasOwnProperty(n) && gi(l, n, t[n]);
  }
  function Kn(l) {
    if (l.indexOf("-") === -1) return !1;
    switch (l) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var yy = new Map([
      ["acceptCharset", "accept-charset"],
      ["htmlFor", "for"],
      ["httpEquiv", "http-equiv"],
      ["crossOrigin", "crossorigin"],
      ["accentHeight", "accent-height"],
      ["alignmentBaseline", "alignment-baseline"],
      ["arabicForm", "arabic-form"],
      ["baselineShift", "baseline-shift"],
      ["capHeight", "cap-height"],
      ["clipPath", "clip-path"],
      ["clipRule", "clip-rule"],
      ["colorInterpolation", "color-interpolation"],
      ["colorInterpolationFilters", "color-interpolation-filters"],
      ["colorProfile", "color-profile"],
      ["colorRendering", "color-rendering"],
      ["dominantBaseline", "dominant-baseline"],
      ["enableBackground", "enable-background"],
      ["fillOpacity", "fill-opacity"],
      ["fillRule", "fill-rule"],
      ["floodColor", "flood-color"],
      ["floodOpacity", "flood-opacity"],
      ["fontFamily", "font-family"],
      ["fontSize", "font-size"],
      ["fontSizeAdjust", "font-size-adjust"],
      ["fontStretch", "font-stretch"],
      ["fontStyle", "font-style"],
      ["fontVariant", "font-variant"],
      ["fontWeight", "font-weight"],
      ["glyphName", "glyph-name"],
      ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
      ["glyphOrientationVertical", "glyph-orientation-vertical"],
      ["horizAdvX", "horiz-adv-x"],
      ["horizOriginX", "horiz-origin-x"],
      ["imageRendering", "image-rendering"],
      ["letterSpacing", "letter-spacing"],
      ["lightingColor", "lighting-color"],
      ["markerEnd", "marker-end"],
      ["markerMid", "marker-mid"],
      ["markerStart", "marker-start"],
      ["overlinePosition", "overline-position"],
      ["overlineThickness", "overline-thickness"],
      ["paintOrder", "paint-order"],
      ["panose-1", "panose-1"],
      ["pointerEvents", "pointer-events"],
      ["renderingIntent", "rendering-intent"],
      ["shapeRendering", "shape-rendering"],
      ["stopColor", "stop-color"],
      ["stopOpacity", "stop-opacity"],
      ["strikethroughPosition", "strikethrough-position"],
      ["strikethroughThickness", "strikethrough-thickness"],
      ["strokeDasharray", "stroke-dasharray"],
      ["strokeDashoffset", "stroke-dashoffset"],
      ["strokeLinecap", "stroke-linecap"],
      ["strokeLinejoin", "stroke-linejoin"],
      ["strokeMiterlimit", "stroke-miterlimit"],
      ["strokeOpacity", "stroke-opacity"],
      ["strokeWidth", "stroke-width"],
      ["textAnchor", "text-anchor"],
      ["textDecoration", "text-decoration"],
      ["textRendering", "text-rendering"],
      ["transformOrigin", "transform-origin"],
      ["underlinePosition", "underline-position"],
      ["underlineThickness", "underline-thickness"],
      ["unicodeBidi", "unicode-bidi"],
      ["unicodeRange", "unicode-range"],
      ["unitsPerEm", "units-per-em"],
      ["vAlphabetic", "v-alphabetic"],
      ["vHanging", "v-hanging"],
      ["vIdeographic", "v-ideographic"],
      ["vMathematical", "v-mathematical"],
      ["vectorEffect", "vector-effect"],
      ["vertAdvY", "vert-adv-y"],
      ["vertOriginX", "vert-origin-x"],
      ["vertOriginY", "vert-origin-y"],
      ["wordSpacing", "word-spacing"],
      ["writingMode", "writing-mode"],
      ["xmlnsXlink", "xmlns:xlink"],
      ["xHeight", "x-height"],
    ]),
    dy =
      /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function Ne(l) {
    return dy.test("" + l)
      ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      : l;
  }
  var Jn = null;
  function wn(l) {
    return (
      (l = l.target || l.srcElement || window),
      l.correspondingUseElement && (l = l.correspondingUseElement),
      l.nodeType === 3 ? l.parentNode : l
    );
  }
  var wu = null,
    Wu = null;
  function bi(l) {
    var t = Vu(l);
    if (t && (l = t.stateNode)) {
      var u = l[Cl] || null;
      l: switch (((l = t.stateNode), t.type)) {
        case "input":
          if (
            (xn(
              l,
              u.value,
              u.defaultValue,
              u.defaultValue,
              u.checked,
              u.defaultChecked,
              u.type,
              u.name
            ),
            (t = u.name),
            u.type === "radio" && t != null)
          ) {
            for (u = l; u.parentNode; ) u = u.parentNode;
            for (
              u = u.querySelectorAll(
                'input[name="' + tt("" + t) + '"][type="radio"]'
              ),
                t = 0;
              t < u.length;
              t++
            ) {
              var a = u[t];
              if (a !== l && a.form === l.form) {
                var e = a[Cl] || null;
                if (!e) throw Error(o(90));
                xn(
                  a,
                  e.value,
                  e.defaultValue,
                  e.defaultValue,
                  e.checked,
                  e.defaultChecked,
                  e.type,
                  e.name
                );
              }
            }
            for (t = 0; t < u.length; t++)
              (a = u[t]), a.form === l.form && hi(a);
          }
          break l;
        case "textarea":
          oi(l, u.value, u.defaultValue);
          break l;
        case "select":
          (t = u.value), t != null && Ku(l, !!u.multiple, t, !1);
      }
    }
  }
  var Wn = !1;
  function Ei(l, t, u) {
    if (Wn) return l(t, u);
    Wn = !0;
    try {
      var a = l(t);
      return a;
    } finally {
      if (
        ((Wn = !1),
        (wu !== null || Wu !== null) &&
          (Sn(), wu && ((t = wu), (l = Wu), (Wu = wu = null), bi(t), l)))
      )
        for (t = 0; t < l.length; t++) bi(l[t]);
    }
  }
  function Ua(l, t) {
    var u = l.stateNode;
    if (u === null) return null;
    var a = u[Cl] || null;
    if (a === null) return null;
    u = a[t];
    l: switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (a = !a.disabled) ||
          ((l = l.type),
          (a = !(
            l === "button" ||
            l === "input" ||
            l === "select" ||
            l === "textarea"
          ))),
          (l = !a);
        break l;
      default:
        l = !1;
    }
    if (l) return null;
    if (u && typeof u != "function") throw Error(o(231, t, typeof u));
    return u;
  }
  var $n = !1;
  if (Ut)
    try {
      var Ra = {};
      Object.defineProperty(Ra, "passive", {
        get: function () {
          $n = !0;
        },
      }),
        window.addEventListener("test", Ra, Ra),
        window.removeEventListener("test", Ra, Ra);
    } catch {
      $n = !1;
    }
  var Ft = null,
    kn = null,
    Ye = null;
  function Ti() {
    if (Ye) return Ye;
    var l,
      t = kn,
      u = t.length,
      a,
      e = "value" in Ft ? Ft.value : Ft.textContent,
      n = e.length;
    for (l = 0; l < u && t[l] === e[l]; l++);
    var f = u - l;
    for (a = 1; a <= f && t[u - a] === e[n - a]; a++);
    return (Ye = e.slice(l, 1 < a ? 1 - a : void 0));
  }
  function Be(l) {
    var t = l.keyCode;
    return (
      "charCode" in l
        ? ((l = l.charCode), l === 0 && t === 13 && (l = 13))
        : (l = t),
      l === 10 && (l = 13),
      32 <= l || l === 13 ? l : 0
    );
  }
  function pe() {
    return !0;
  }
  function zi() {
    return !1;
  }
  function Vl(l) {
    function t(u, a, e, n, f) {
      (this._reactName = u),
        (this._targetInst = e),
        (this.type = a),
        (this.nativeEvent = n),
        (this.target = f),
        (this.currentTarget = null);
      for (var c in l)
        l.hasOwnProperty(c) && ((u = l[c]), (this[c] = u ? u(n) : n[c]));
      return (
        (this.isDefaultPrevented = (
          n.defaultPrevented != null ? n.defaultPrevented : n.returnValue === !1
        )
          ? pe
          : zi),
        (this.isPropagationStopped = zi),
        this
      );
    }
    return (
      W(t.prototype, {
        preventDefault: function () {
          this.defaultPrevented = !0;
          var u = this.nativeEvent;
          u &&
            (u.preventDefault
              ? u.preventDefault()
              : typeof u.returnValue != "unknown" && (u.returnValue = !1),
            (this.isDefaultPrevented = pe));
        },
        stopPropagation: function () {
          var u = this.nativeEvent;
          u &&
            (u.stopPropagation
              ? u.stopPropagation()
              : typeof u.cancelBubble != "unknown" && (u.cancelBubble = !0),
            (this.isPropagationStopped = pe));
        },
        persist: function () {},
        isPersistent: pe,
      }),
      t
    );
  }
  var Tu = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function (l) {
        return l.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0,
    },
    Ge = Vl(Tu),
    Ha = W({}, Tu, { view: 0, detail: 0 }),
    hy = Vl(Ha),
    Fn,
    Pn,
    qa,
    Xe = W({}, Ha, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: lf,
      button: 0,
      buttons: 0,
      relatedTarget: function (l) {
        return l.relatedTarget === void 0
          ? l.fromElement === l.srcElement
            ? l.toElement
            : l.fromElement
          : l.relatedTarget;
      },
      movementX: function (l) {
        return "movementX" in l
          ? l.movementX
          : (l !== qa &&
              (qa && l.type === "mousemove"
                ? ((Fn = l.screenX - qa.screenX), (Pn = l.screenY - qa.screenY))
                : (Pn = Fn = 0),
              (qa = l)),
            Fn);
      },
      movementY: function (l) {
        return "movementY" in l ? l.movementY : Pn;
      },
    }),
    Ai = Vl(Xe),
    my = W({}, Xe, { dataTransfer: 0 }),
    oy = Vl(my),
    Sy = W({}, Ha, { relatedTarget: 0 }),
    In = Vl(Sy),
    gy = W({}, Tu, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
    ry = Vl(gy),
    by = W({}, Tu, {
      clipboardData: function (l) {
        return "clipboardData" in l ? l.clipboardData : window.clipboardData;
      },
    }),
    Ey = Vl(by),
    Ty = W({}, Tu, { data: 0 }),
    Oi = Vl(Ty),
    zy = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified",
    },
    Ay = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta",
    },
    Oy = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey",
    };
  function _y(l) {
    var t = this.nativeEvent;
    return t.getModifierState
      ? t.getModifierState(l)
      : (l = Oy[l])
      ? !!t[l]
      : !1;
  }
  function lf() {
    return _y;
  }
  var Dy = W({}, Ha, {
      key: function (l) {
        if (l.key) {
          var t = zy[l.key] || l.key;
          if (t !== "Unidentified") return t;
        }
        return l.type === "keypress"
          ? ((l = Be(l)), l === 13 ? "Enter" : String.fromCharCode(l))
          : l.type === "keydown" || l.type === "keyup"
          ? Ay[l.keyCode] || "Unidentified"
          : "";
      },
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: lf,
      charCode: function (l) {
        return l.type === "keypress" ? Be(l) : 0;
      },
      keyCode: function (l) {
        return l.type === "keydown" || l.type === "keyup" ? l.keyCode : 0;
      },
      which: function (l) {
        return l.type === "keypress"
          ? Be(l)
          : l.type === "keydown" || l.type === "keyup"
          ? l.keyCode
          : 0;
      },
    }),
    My = Vl(Dy),
    Uy = W({}, Xe, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0,
    }),
    _i = Vl(Uy),
    Ry = W({}, Ha, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: lf,
    }),
    Hy = Vl(Ry),
    qy = W({}, Tu, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
    Ny = Vl(qy),
    Yy = W({}, Xe, {
      deltaX: function (l) {
        return "deltaX" in l
          ? l.deltaX
          : "wheelDeltaX" in l
          ? -l.wheelDeltaX
          : 0;
      },
      deltaY: function (l) {
        return "deltaY" in l
          ? l.deltaY
          : "wheelDeltaY" in l
          ? -l.wheelDeltaY
          : "wheelDelta" in l
          ? -l.wheelDelta
          : 0;
      },
      deltaZ: 0,
      deltaMode: 0,
    }),
    By = Vl(Yy),
    py = W({}, Tu, { newState: 0, oldState: 0 }),
    Gy = Vl(py),
    Xy = [9, 13, 27, 32],
    tf = Ut && "CompositionEvent" in window,
    Na = null;
  Ut && "documentMode" in document && (Na = document.documentMode);
  var Qy = Ut && "TextEvent" in window && !Na,
    Di = Ut && (!tf || (Na && 8 < Na && 11 >= Na)),
    Mi = " ",
    Ui = !1;
  function Ri(l, t) {
    switch (l) {
      case "keyup":
        return Xy.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function Hi(l) {
    return (l = l.detail), typeof l == "object" && "data" in l ? l.data : null;
  }
  var $u = !1;
  function Zy(l, t) {
    switch (l) {
      case "compositionend":
        return Hi(t);
      case "keypress":
        return t.which !== 32 ? null : ((Ui = !0), Mi);
      case "textInput":
        return (l = t.data), l === Mi && Ui ? null : l;
      default:
        return null;
    }
  }
  function jy(l, t) {
    if ($u)
      return l === "compositionend" || (!tf && Ri(l, t))
        ? ((l = Ti()), (Ye = kn = Ft = null), ($u = !1), l)
        : null;
    switch (l) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
          if (t.char && 1 < t.char.length) return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return Di && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var Cy = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
  };
  function qi(l) {
    var t = l && l.nodeName && l.nodeName.toLowerCase();
    return t === "input" ? !!Cy[l.type] : t === "textarea";
  }
  function Ni(l, t, u, a) {
    wu ? (Wu ? Wu.push(a) : (Wu = [a])) : (wu = a),
      (t = Tn(t, "onChange")),
      0 < t.length &&
        ((u = new Ge("onChange", "change", null, u, a)),
        l.push({ event: u, listeners: t }));
  }
  var Ya = null,
    Ba = null;
  function Vy(l) {
    ev(l, 0);
  }
  function Qe(l) {
    var t = Ma(l);
    if (hi(t)) return l;
  }
  function Yi(l, t) {
    if (l === "change") return t;
  }
  var Bi = !1;
  if (Ut) {
    var uf;
    if (Ut) {
      var af = "oninput" in document;
      if (!af) {
        var pi = document.createElement("div");
        pi.setAttribute("oninput", "return;"),
          (af = typeof pi.oninput == "function");
      }
      uf = af;
    } else uf = !1;
    Bi = uf && (!document.documentMode || 9 < document.documentMode);
  }
  function Gi() {
    Ya && (Ya.detachEvent("onpropertychange", Xi), (Ba = Ya = null));
  }
  function Xi(l) {
    if (l.propertyName === "value" && Qe(Ba)) {
      var t = [];
      Ni(t, Ba, l, wn(l)), Ei(Vy, t);
    }
  }
  function xy(l, t, u) {
    l === "focusin"
      ? (Gi(), (Ya = t), (Ba = u), Ya.attachEvent("onpropertychange", Xi))
      : l === "focusout" && Gi();
  }
  function Ly(l) {
    if (l === "selectionchange" || l === "keyup" || l === "keydown")
      return Qe(Ba);
  }
  function Ky(l, t) {
    if (l === "click") return Qe(t);
  }
  function Jy(l, t) {
    if (l === "input" || l === "change") return Qe(t);
  }
  function wy(l, t) {
    return (l === t && (l !== 0 || 1 / l === 1 / t)) || (l !== l && t !== t);
  }
  var wl = typeof Object.is == "function" ? Object.is : wy;
  function pa(l, t) {
    if (wl(l, t)) return !0;
    if (
      typeof l != "object" ||
      l === null ||
      typeof t != "object" ||
      t === null
    )
      return !1;
    var u = Object.keys(l),
      a = Object.keys(t);
    if (u.length !== a.length) return !1;
    for (a = 0; a < u.length; a++) {
      var e = u[a];
      if (!Xn.call(t, e) || !wl(l[e], t[e])) return !1;
    }
    return !0;
  }
  function Qi(l) {
    for (; l && l.firstChild; ) l = l.firstChild;
    return l;
  }
  function Zi(l, t) {
    var u = Qi(l);
    l = 0;
    for (var a; u; ) {
      if (u.nodeType === 3) {
        if (((a = l + u.textContent.length), l <= t && a >= t))
          return { node: u, offset: t - l };
        l = a;
      }
      l: {
        for (; u; ) {
          if (u.nextSibling) {
            u = u.nextSibling;
            break l;
          }
          u = u.parentNode;
        }
        u = void 0;
      }
      u = Qi(u);
    }
  }
  function ji(l, t) {
    return l && t
      ? l === t
        ? !0
        : l && l.nodeType === 3
        ? !1
        : t && t.nodeType === 3
        ? ji(l, t.parentNode)
        : "contains" in l
        ? l.contains(t)
        : l.compareDocumentPosition
        ? !!(l.compareDocumentPosition(t) & 16)
        : !1
      : !1;
  }
  function Ci(l) {
    l =
      l != null &&
      l.ownerDocument != null &&
      l.ownerDocument.defaultView != null
        ? l.ownerDocument.defaultView
        : window;
    for (var t = qe(l.document); t instanceof l.HTMLIFrameElement; ) {
      try {
        var u = typeof t.contentWindow.location.href == "string";
      } catch {
        u = !1;
      }
      if (u) l = t.contentWindow;
      else break;
      t = qe(l.document);
    }
    return t;
  }
  function ef(l) {
    var t = l && l.nodeName && l.nodeName.toLowerCase();
    return (
      t &&
      ((t === "input" &&
        (l.type === "text" ||
          l.type === "search" ||
          l.type === "tel" ||
          l.type === "url" ||
          l.type === "password")) ||
        t === "textarea" ||
        l.contentEditable === "true")
    );
  }
  function Wy(l, t) {
    var u = Ci(t);
    t = l.focusedElem;
    var a = l.selectionRange;
    if (
      u !== t &&
      t &&
      t.ownerDocument &&
      ji(t.ownerDocument.documentElement, t)
    ) {
      if (a !== null && ef(t)) {
        if (
          ((l = a.start),
          (u = a.end),
          u === void 0 && (u = l),
          "selectionStart" in t)
        )
          (t.selectionStart = l),
            (t.selectionEnd = Math.min(u, t.value.length));
        else if (
          ((u = ((l = t.ownerDocument || document) && l.defaultView) || window),
          u.getSelection)
        ) {
          u = u.getSelection();
          var e = t.textContent.length,
            n = Math.min(a.start, e);
          (a = a.end === void 0 ? n : Math.min(a.end, e)),
            !u.extend && n > a && ((e = a), (a = n), (n = e)),
            (e = Zi(t, n));
          var f = Zi(t, a);
          e &&
            f &&
            (u.rangeCount !== 1 ||
              u.anchorNode !== e.node ||
              u.anchorOffset !== e.offset ||
              u.focusNode !== f.node ||
              u.focusOffset !== f.offset) &&
            ((l = l.createRange()),
            l.setStart(e.node, e.offset),
            u.removeAllRanges(),
            n > a
              ? (u.addRange(l), u.extend(f.node, f.offset))
              : (l.setEnd(f.node, f.offset), u.addRange(l)));
        }
      }
      for (l = [], u = t; (u = u.parentNode); )
        u.nodeType === 1 &&
          l.push({ element: u, left: u.scrollLeft, top: u.scrollTop });
      for (typeof t.focus == "function" && t.focus(), t = 0; t < l.length; t++)
        (u = l[t]),
          (u.element.scrollLeft = u.left),
          (u.element.scrollTop = u.top);
    }
  }
  var $y = Ut && "documentMode" in document && 11 >= document.documentMode,
    ku = null,
    nf = null,
    Ga = null,
    ff = !1;
  function Vi(l, t, u) {
    var a =
      u.window === u ? u.document : u.nodeType === 9 ? u : u.ownerDocument;
    ff ||
      ku == null ||
      ku !== qe(a) ||
      ((a = ku),
      "selectionStart" in a && ef(a)
        ? (a = { start: a.selectionStart, end: a.selectionEnd })
        : ((a = (
            (a.ownerDocument && a.ownerDocument.defaultView) ||
            window
          ).getSelection()),
          (a = {
            anchorNode: a.anchorNode,
            anchorOffset: a.anchorOffset,
            focusNode: a.focusNode,
            focusOffset: a.focusOffset,
          })),
      (Ga && pa(Ga, a)) ||
        ((Ga = a),
        (a = Tn(nf, "onSelect")),
        0 < a.length &&
          ((t = new Ge("onSelect", "select", null, t, u)),
          l.push({ event: t, listeners: a }),
          (t.target = ku))));
  }
  function zu(l, t) {
    var u = {};
    return (
      (u[l.toLowerCase()] = t.toLowerCase()),
      (u["Webkit" + l] = "webkit" + t),
      (u["Moz" + l] = "moz" + t),
      u
    );
  }
  var Fu = {
      animationend: zu("Animation", "AnimationEnd"),
      animationiteration: zu("Animation", "AnimationIteration"),
      animationstart: zu("Animation", "AnimationStart"),
      transitionrun: zu("Transition", "TransitionRun"),
      transitionstart: zu("Transition", "TransitionStart"),
      transitioncancel: zu("Transition", "TransitionCancel"),
      transitionend: zu("Transition", "TransitionEnd"),
    },
    cf = {},
    xi = {};
  Ut &&
    ((xi = document.createElement("div").style),
    "AnimationEvent" in window ||
      (delete Fu.animationend.animation,
      delete Fu.animationiteration.animation,
      delete Fu.animationstart.animation),
    "TransitionEvent" in window || delete Fu.transitionend.transition);
  function Au(l) {
    if (cf[l]) return cf[l];
    if (!Fu[l]) return l;
    var t = Fu[l],
      u;
    for (u in t) if (t.hasOwnProperty(u) && u in xi) return (cf[l] = t[u]);
    return l;
  }
  var Li = Au("animationend"),
    Ki = Au("animationiteration"),
    Ji = Au("animationstart"),
    ky = Au("transitionrun"),
    Fy = Au("transitionstart"),
    Py = Au("transitioncancel"),
    wi = Au("transitionend"),
    Wi = new Map(),
    $i =
      "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll scrollEnd toggle touchMove waiting wheel".split(
        " "
      );
  function ht(l, t) {
    Wi.set(l, t), Eu(t, [l]);
  }
  var ut = [],
    Pu = 0,
    sf = 0;
  function Ze() {
    for (var l = Pu, t = (sf = Pu = 0); t < l; ) {
      var u = ut[t];
      ut[t++] = null;
      var a = ut[t];
      ut[t++] = null;
      var e = ut[t];
      ut[t++] = null;
      var n = ut[t];
      if (((ut[t++] = null), a !== null && e !== null)) {
        var f = a.pending;
        f === null ? (e.next = e) : ((e.next = f.next), (f.next = e)),
          (a.pending = e);
      }
      n !== 0 && ki(u, e, n);
    }
  }
  function je(l, t, u, a) {
    (ut[Pu++] = l),
      (ut[Pu++] = t),
      (ut[Pu++] = u),
      (ut[Pu++] = a),
      (sf |= a),
      (l.lanes |= a),
      (l = l.alternate),
      l !== null && (l.lanes |= a);
  }
  function vf(l, t, u, a) {
    return je(l, t, u, a), Ce(l);
  }
  function Pt(l, t) {
    return je(l, null, null, t), Ce(l);
  }
  function ki(l, t, u) {
    l.lanes |= u;
    var a = l.alternate;
    a !== null && (a.lanes |= u);
    for (var e = !1, n = l.return; n !== null; )
      (n.childLanes |= u),
        (a = n.alternate),
        a !== null && (a.childLanes |= u),
        n.tag === 22 &&
          ((l = n.stateNode), l === null || l._visibility & 1 || (e = !0)),
        (l = n),
        (n = n.return);
    e &&
      t !== null &&
      l.tag === 3 &&
      ((n = l.stateNode),
      (e = 31 - Jl(u)),
      (n = n.hiddenUpdates),
      (l = n[e]),
      l === null ? (n[e] = [t]) : l.push(t),
      (t.lane = u | 536870912));
  }
  function Ce(l) {
    if (50 < ce) throw ((ce = 0), (Sc = null), Error(o(185)));
    for (var t = l.return; t !== null; ) (l = t), (t = l.return);
    return l.tag === 3 ? l.stateNode : null;
  }
  var Iu = {},
    Fi = new WeakMap();
  function at(l, t) {
    if (typeof l == "object" && l !== null) {
      var u = Fi.get(l);
      return u !== void 0
        ? u
        : ((t = { value: l, source: t, stack: p(t) }), Fi.set(l, t), t);
    }
    return { value: l, source: t, stack: p(t) };
  }
  var la = [],
    ta = 0,
    Ve = null,
    xe = 0,
    et = [],
    nt = 0,
    Ou = null,
    Ht = 1,
    qt = "";
  function _u(l, t) {
    (la[ta++] = xe), (la[ta++] = Ve), (Ve = l), (xe = t);
  }
  function Pi(l, t, u) {
    (et[nt++] = Ht), (et[nt++] = qt), (et[nt++] = Ou), (Ou = l);
    var a = Ht;
    l = qt;
    var e = 32 - Jl(a) - 1;
    (a &= ~(1 << e)), (u += 1);
    var n = 32 - Jl(t) + e;
    if (30 < n) {
      var f = e - (e % 5);
      (n = (a & ((1 << f) - 1)).toString(32)),
        (a >>= f),
        (e -= f),
        (Ht = (1 << (32 - Jl(t) + e)) | (u << e) | a),
        (qt = n + l);
    } else (Ht = (1 << n) | (u << e) | a), (qt = l);
  }
  function yf(l) {
    l.return !== null && (_u(l, 1), Pi(l, 1, 0));
  }
  function df(l) {
    for (; l === Ve; )
      (Ve = la[--ta]), (la[ta] = null), (xe = la[--ta]), (la[ta] = null);
    for (; l === Ou; )
      (Ou = et[--nt]),
        (et[nt] = null),
        (qt = et[--nt]),
        (et[nt] = null),
        (Ht = et[--nt]),
        (et[nt] = null);
  }
  var Gl = null,
    Ml = null,
    L = !1,
    mt = null,
    Et = !1,
    hf = Error(o(519));
  function Du(l) {
    var t = Error(o(418, ""));
    throw (Za(at(t, l)), hf);
  }
  function Ii(l) {
    var t = l.stateNode,
      u = l.type,
      a = l.memoizedProps;
    switch (((t[Hl] = l), (t[Cl] = a), u)) {
      case "dialog":
        C("cancel", t), C("close", t);
        break;
      case "iframe":
      case "object":
      case "embed":
        C("load", t);
        break;
      case "video":
      case "audio":
        for (u = 0; u < se.length; u++) C(se[u], t);
        break;
      case "source":
        C("error", t);
        break;
      case "img":
      case "image":
      case "link":
        C("error", t), C("load", t);
        break;
      case "details":
        C("toggle", t);
        break;
      case "input":
        C("invalid", t),
          mi(
            t,
            a.value,
            a.defaultValue,
            a.checked,
            a.defaultChecked,
            a.type,
            a.name,
            !0
          ),
          He(t);
        break;
      case "select":
        C("invalid", t);
        break;
      case "textarea":
        C("invalid", t), Si(t, a.value, a.defaultValue, a.children), He(t);
    }
    (u = a.children),
      (typeof u != "string" && typeof u != "number" && typeof u != "bigint") ||
      t.textContent === "" + u ||
      a.suppressHydrationWarning === !0 ||
      iv(t.textContent, u)
        ? (a.popover != null && (C("beforetoggle", t), C("toggle", t)),
          a.onScroll != null && C("scroll", t),
          a.onScrollEnd != null && C("scrollend", t),
          a.onClick != null && (t.onclick = zn),
          (t = !0))
        : (t = !1),
      t || Du(l);
  }
  function l0(l) {
    for (Gl = l.return; Gl; )
      switch (Gl.tag) {
        case 3:
        case 27:
          Et = !0;
          return;
        case 5:
        case 13:
          Et = !1;
          return;
        default:
          Gl = Gl.return;
      }
  }
  function Xa(l) {
    if (l !== Gl) return !1;
    if (!L) return l0(l), (L = !0), !1;
    var t = !1,
      u;
    if (
      ((u = l.tag !== 3 && l.tag !== 27) &&
        ((u = l.tag === 5) &&
          ((u = l.type),
          (u =
            !(u !== "form" && u !== "button") || Yc(l.type, l.memoizedProps))),
        (u = !u)),
      u && (t = !0),
      t && Ml && Du(l),
      l0(l),
      l.tag === 13)
    ) {
      if (((l = l.memoizedState), (l = l !== null ? l.dehydrated : null), !l))
        throw Error(o(317));
      l: {
        for (l = l.nextSibling, t = 0; l; ) {
          if (l.nodeType === 8)
            if (((u = l.data), u === "/$")) {
              if (t === 0) {
                Ml = St(l.nextSibling);
                break l;
              }
              t--;
            } else (u !== "$" && u !== "$!" && u !== "$?") || t++;
          l = l.nextSibling;
        }
        Ml = null;
      }
    } else Ml = Gl ? St(l.stateNode.nextSibling) : null;
    return !0;
  }
  function Qa() {
    (Ml = Gl = null), (L = !1);
  }
  function Za(l) {
    mt === null ? (mt = [l]) : mt.push(l);
  }
  var ja = Error(o(460)),
    t0 = Error(o(474)),
    mf = { then: function () {} };
  function u0(l) {
    return (l = l.status), l === "fulfilled" || l === "rejected";
  }
  function Le() {}
  function a0(l, t, u) {
    switch (
      ((u = l[u]),
      u === void 0 ? l.push(t) : u !== t && (t.then(Le, Le), (t = u)),
      t.status)
    ) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw ((l = t.reason), l === ja ? Error(o(483)) : l);
      default:
        if (typeof t.status == "string") t.then(Le, Le);
        else {
          if (((l = tl), l !== null && 100 < l.shellSuspendCounter))
            throw Error(o(482));
          (l = t),
            (l.status = "pending"),
            l.then(
              function (a) {
                if (t.status === "pending") {
                  var e = t;
                  (e.status = "fulfilled"), (e.value = a);
                }
              },
              function (a) {
                if (t.status === "pending") {
                  var e = t;
                  (e.status = "rejected"), (e.reason = a);
                }
              }
            );
        }
        switch (t.status) {
          case "fulfilled":
            return t.value;
          case "rejected":
            throw ((l = t.reason), l === ja ? Error(o(483)) : l);
        }
        throw ((Ca = t), ja);
    }
  }
  var Ca = null;
  function e0() {
    if (Ca === null) throw Error(o(459));
    var l = Ca;
    return (Ca = null), l;
  }
  var ua = null,
    Va = 0;
  function Ke(l) {
    var t = Va;
    return (Va += 1), ua === null && (ua = []), a0(ua, l, t);
  }
  function xa(l, t) {
    (t = t.props.ref), (l.ref = t !== void 0 ? t : null);
  }
  function Je(l, t) {
    throw t.$$typeof === Yl
      ? Error(o(525))
      : ((l = Object.prototype.toString.call(t)),
        Error(
          o(
            31,
            l === "[object Object]"
              ? "object with keys {" + Object.keys(t).join(", ") + "}"
              : l
          )
        ));
  }
  function n0(l) {
    var t = l._init;
    return t(l._payload);
  }
  function f0(l) {
    function t(d, v) {
      if (l) {
        var h = d.deletions;
        h === null ? ((d.deletions = [v]), (d.flags |= 16)) : h.push(v);
      }
    }
    function u(d, v) {
      if (!l) return null;
      for (; v !== null; ) t(d, v), (v = v.sibling);
      return null;
    }
    function a(d) {
      for (var v = new Map(); d !== null; )
        d.key !== null ? v.set(d.key, d) : v.set(d.index, d), (d = d.sibling);
      return v;
    }
    function e(d, v) {
      return (d = vu(d, v)), (d.index = 0), (d.sibling = null), d;
    }
    function n(d, v, h) {
      return (
        (d.index = h),
        l
          ? ((h = d.alternate),
            h !== null
              ? ((h = h.index), h < v ? ((d.flags |= 33554434), v) : h)
              : ((d.flags |= 33554434), v))
          : ((d.flags |= 1048576), v)
      );
    }
    function f(d) {
      return l && d.alternate === null && (d.flags |= 33554434), d;
    }
    function c(d, v, h, r) {
      return v === null || v.tag !== 6
        ? ((v = ic(h, d.mode, r)), (v.return = d), v)
        : ((v = e(v, h)), (v.return = d), v);
    }
    function i(d, v, h, r) {
      var O = h.type;
      return O === M
        ? g(d, v, h.props.children, r, h.key)
        : v !== null &&
          (v.elementType === O ||
            (typeof O == "object" &&
              O !== null &&
              O.$$typeof === Bl &&
              n0(O) === v.type))
        ? ((v = e(v, h.props)), xa(v, h), (v.return = d), v)
        : ((v = yn(h.type, h.key, h.props, null, d.mode, r)),
          xa(v, h),
          (v.return = d),
          v);
    }
    function y(d, v, h, r) {
      return v === null ||
        v.tag !== 4 ||
        v.stateNode.containerInfo !== h.containerInfo ||
        v.stateNode.implementation !== h.implementation
        ? ((v = sc(h, d.mode, r)), (v.return = d), v)
        : ((v = e(v, h.children || [])), (v.return = d), v);
    }
    function g(d, v, h, r, O) {
      return v === null || v.tag !== 7
        ? ((v = Gu(h, d.mode, r, O)), (v.return = d), v)
        : ((v = e(v, h)), (v.return = d), v);
    }
    function b(d, v, h) {
      if (
        (typeof v == "string" && v !== "") ||
        typeof v == "number" ||
        typeof v == "bigint"
      )
        return (v = ic("" + v, d.mode, h)), (v.return = d), v;
      if (typeof v == "object" && v !== null) {
        switch (v.$$typeof) {
          case rl:
            return (
              (h = yn(v.type, v.key, v.props, null, d.mode, h)),
              xa(h, v),
              (h.return = d),
              h
            );
          case Tl:
            return (v = sc(v, d.mode, h)), (v.return = d), v;
          case Bl:
            var r = v._init;
            return (v = r(v._payload)), b(d, v, h);
        }
        if (R(v) || Zl(v))
          return (v = Gu(v, d.mode, h, null)), (v.return = d), v;
        if (typeof v.then == "function") return b(d, Ke(v), h);
        if (v.$$typeof === hl) return b(d, cn(d, v), h);
        Je(d, v);
      }
      return null;
    }
    function m(d, v, h, r) {
      var O = v !== null ? v.key : null;
      if (
        (typeof h == "string" && h !== "") ||
        typeof h == "number" ||
        typeof h == "bigint"
      )
        return O !== null ? null : c(d, v, "" + h, r);
      if (typeof h == "object" && h !== null) {
        switch (h.$$typeof) {
          case rl:
            return h.key === O ? i(d, v, h, r) : null;
          case Tl:
            return h.key === O ? y(d, v, h, r) : null;
          case Bl:
            return (O = h._init), (h = O(h._payload)), m(d, v, h, r);
        }
        if (R(h) || Zl(h)) return O !== null ? null : g(d, v, h, r, null);
        if (typeof h.then == "function") return m(d, v, Ke(h), r);
        if (h.$$typeof === hl) return m(d, v, cn(d, h), r);
        Je(d, h);
      }
      return null;
    }
    function S(d, v, h, r, O) {
      if (
        (typeof r == "string" && r !== "") ||
        typeof r == "number" ||
        typeof r == "bigint"
      )
        return (d = d.get(h) || null), c(v, d, "" + r, O);
      if (typeof r == "object" && r !== null) {
        switch (r.$$typeof) {
          case rl:
            return (
              (d = d.get(r.key === null ? h : r.key) || null), i(v, d, r, O)
            );
          case Tl:
            return (
              (d = d.get(r.key === null ? h : r.key) || null), y(v, d, r, O)
            );
          case Bl:
            var Z = r._init;
            return (r = Z(r._payload)), S(d, v, h, r, O);
        }
        if (R(r) || Zl(r)) return (d = d.get(h) || null), g(v, d, r, O, null);
        if (typeof r.then == "function") return S(d, v, h, Ke(r), O);
        if (r.$$typeof === hl) return S(d, v, h, cn(v, r), O);
        Je(v, r);
      }
      return null;
    }
    function D(d, v, h, r) {
      for (
        var O = null, Z = null, U = v, H = (v = 0), _l = null;
        U !== null && H < h.length;
        H++
      ) {
        U.index > H ? ((_l = U), (U = null)) : (_l = U.sibling);
        var K = m(d, U, h[H], r);
        if (K === null) {
          U === null && (U = _l);
          break;
        }
        l && U && K.alternate === null && t(d, U),
          (v = n(K, v, H)),
          Z === null ? (O = K) : (Z.sibling = K),
          (Z = K),
          (U = _l);
      }
      if (H === h.length) return u(d, U), L && _u(d, H), O;
      if (U === null) {
        for (; H < h.length; H++)
          (U = b(d, h[H], r)),
            U !== null &&
              ((v = n(U, v, H)),
              Z === null ? (O = U) : (Z.sibling = U),
              (Z = U));
        return L && _u(d, H), O;
      }
      for (U = a(U); H < h.length; H++)
        (_l = S(U, d, H, h[H], r)),
          _l !== null &&
            (l &&
              _l.alternate !== null &&
              U.delete(_l.key === null ? H : _l.key),
            (v = n(_l, v, H)),
            Z === null ? (O = _l) : (Z.sibling = _l),
            (Z = _l));
      return (
        l &&
          U.forEach(function (gu) {
            return t(d, gu);
          }),
        L && _u(d, H),
        O
      );
    }
    function B(d, v, h, r) {
      if (h == null) throw Error(o(151));
      for (
        var O = null, Z = null, U = v, H = (v = 0), _l = null, K = h.next();
        U !== null && !K.done;
        H++, K = h.next()
      ) {
        U.index > H ? ((_l = U), (U = null)) : (_l = U.sibling);
        var gu = m(d, U, K.value, r);
        if (gu === null) {
          U === null && (U = _l);
          break;
        }
        l && U && gu.alternate === null && t(d, U),
          (v = n(gu, v, H)),
          Z === null ? (O = gu) : (Z.sibling = gu),
          (Z = gu),
          (U = _l);
      }
      if (K.done) return u(d, U), L && _u(d, H), O;
      if (U === null) {
        for (; !K.done; H++, K = h.next())
          (K = b(d, K.value, r)),
            K !== null &&
              ((v = n(K, v, H)),
              Z === null ? (O = K) : (Z.sibling = K),
              (Z = K));
        return L && _u(d, H), O;
      }
      for (U = a(U); !K.done; H++, K = h.next())
        (K = S(U, d, H, K.value, r)),
          K !== null &&
            (l && K.alternate !== null && U.delete(K.key === null ? H : K.key),
            (v = n(K, v, H)),
            Z === null ? (O = K) : (Z.sibling = K),
            (Z = K));
      return (
        l &&
          U.forEach(function (dd) {
            return t(d, dd);
          }),
        L && _u(d, H),
        O
      );
    }
    function vl(d, v, h, r) {
      if (
        (typeof h == "object" &&
          h !== null &&
          h.type === M &&
          h.key === null &&
          (h = h.props.children),
        typeof h == "object" && h !== null)
      ) {
        switch (h.$$typeof) {
          case rl:
            l: {
              for (var O = h.key; v !== null; ) {
                if (v.key === O) {
                  if (((O = h.type), O === M)) {
                    if (v.tag === 7) {
                      u(d, v.sibling),
                        (r = e(v, h.props.children)),
                        (r.return = d),
                        (d = r);
                      break l;
                    }
                  } else if (
                    v.elementType === O ||
                    (typeof O == "object" &&
                      O !== null &&
                      O.$$typeof === Bl &&
                      n0(O) === v.type)
                  ) {
                    u(d, v.sibling),
                      (r = e(v, h.props)),
                      xa(r, h),
                      (r.return = d),
                      (d = r);
                    break l;
                  }
                  u(d, v);
                  break;
                } else t(d, v);
                v = v.sibling;
              }
              h.type === M
                ? ((r = Gu(h.props.children, d.mode, r, h.key)),
                  (r.return = d),
                  (d = r))
                : ((r = yn(h.type, h.key, h.props, null, d.mode, r)),
                  xa(r, h),
                  (r.return = d),
                  (d = r));
            }
            return f(d);
          case Tl:
            l: {
              for (O = h.key; v !== null; ) {
                if (v.key === O)
                  if (
                    v.tag === 4 &&
                    v.stateNode.containerInfo === h.containerInfo &&
                    v.stateNode.implementation === h.implementation
                  ) {
                    u(d, v.sibling),
                      (r = e(v, h.children || [])),
                      (r.return = d),
                      (d = r);
                    break l;
                  } else {
                    u(d, v);
                    break;
                  }
                else t(d, v);
                v = v.sibling;
              }
              (r = sc(h, d.mode, r)), (r.return = d), (d = r);
            }
            return f(d);
          case Bl:
            return (O = h._init), (h = O(h._payload)), vl(d, v, h, r);
        }
        if (R(h)) return D(d, v, h, r);
        if (Zl(h)) {
          if (((O = Zl(h)), typeof O != "function")) throw Error(o(150));
          return (h = O.call(h)), B(d, v, h, r);
        }
        if (typeof h.then == "function") return vl(d, v, Ke(h), r);
        if (h.$$typeof === hl) return vl(d, v, cn(d, h), r);
        Je(d, h);
      }
      return (typeof h == "string" && h !== "") ||
        typeof h == "number" ||
        typeof h == "bigint"
        ? ((h = "" + h),
          v !== null && v.tag === 6
            ? (u(d, v.sibling), (r = e(v, h)), (r.return = d), (d = r))
            : (u(d, v), (r = ic(h, d.mode, r)), (r.return = d), (d = r)),
          f(d))
        : u(d, v);
    }
    return function (d, v, h, r) {
      try {
        Va = 0;
        var O = vl(d, v, h, r);
        return (ua = null), O;
      } catch (U) {
        if (U === ja) throw U;
        var Z = st(29, U, null, d.mode);
        return (Z.lanes = r), (Z.return = d), Z;
      } finally {
      }
    };
  }
  var Mu = f0(!0),
    c0 = f0(!1),
    aa = $(null),
    we = $(0);
  function i0(l, t) {
    (l = Vt), nl(we, l), nl(aa, t), (Vt = l | t.baseLanes);
  }
  function of() {
    nl(we, Vt), nl(aa, aa.current);
  }
  function Sf() {
    (Vt = we.current), ml(aa), ml(we);
  }
  var ft = $(null),
    Tt = null;
  function It(l) {
    var t = l.alternate;
    nl(bl, bl.current & 1),
      nl(ft, l),
      Tt === null &&
        (t === null || aa.current !== null || t.memoizedState !== null) &&
        (Tt = l);
  }
  function s0(l) {
    if (l.tag === 22) {
      if ((nl(bl, bl.current), nl(ft, l), Tt === null)) {
        var t = l.alternate;
        t !== null && t.memoizedState !== null && (Tt = l);
      }
    } else lu();
  }
  function lu() {
    nl(bl, bl.current), nl(ft, ft.current);
  }
  function Nt(l) {
    ml(ft), Tt === l && (Tt = null), ml(bl);
  }
  var bl = $(0);
  function We(l) {
    for (var t = l; t !== null; ) {
      if (t.tag === 13) {
        var u = t.memoizedState;
        if (
          u !== null &&
          ((u = u.dehydrated), u === null || u.data === "$?" || u.data === "$!")
        )
          return t;
      } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
        if (t.flags & 128) return t;
      } else if (t.child !== null) {
        (t.child.return = t), (t = t.child);
        continue;
      }
      if (t === l) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === l) return null;
        t = t.return;
      }
      (t.sibling.return = t.return), (t = t.sibling);
    }
    return null;
  }
  var Iy =
      typeof AbortController < "u"
        ? AbortController
        : function () {
            var l = [],
              t = (this.signal = {
                aborted: !1,
                addEventListener: function (u, a) {
                  l.push(a);
                },
              });
            this.abort = function () {
              (t.aborted = !0),
                l.forEach(function (u) {
                  return u();
                });
            };
          },
    l1 = _.unstable_scheduleCallback,
    t1 = _.unstable_NormalPriority,
    El = {
      $$typeof: hl,
      Consumer: null,
      Provider: null,
      _currentValue: null,
      _currentValue2: null,
      _threadCount: 0,
    };
  function gf() {
    return { controller: new Iy(), data: new Map(), refCount: 0 };
  }
  function La(l) {
    l.refCount--,
      l.refCount === 0 &&
        l1(t1, function () {
          l.controller.abort();
        });
  }
  var Ka = null,
    rf = 0,
    ea = 0,
    na = null;
  function u1(l, t) {
    if (Ka === null) {
      var u = (Ka = []);
      (rf = 0),
        (ea = Oc()),
        (na = {
          status: "pending",
          value: void 0,
          then: function (a) {
            u.push(a);
          },
        });
    }
    return rf++, t.then(v0, v0), t;
  }
  function v0() {
    if (--rf === 0 && Ka !== null) {
      na !== null && (na.status = "fulfilled");
      var l = Ka;
      (Ka = null), (ea = 0), (na = null);
      for (var t = 0; t < l.length; t++) (0, l[t])();
    }
  }
  function a1(l, t) {
    var u = [],
      a = {
        status: "pending",
        value: null,
        reason: null,
        then: function (e) {
          u.push(e);
        },
      };
    return (
      l.then(
        function () {
          (a.status = "fulfilled"), (a.value = t);
          for (var e = 0; e < u.length; e++) (0, u[e])(t);
        },
        function (e) {
          for (a.status = "rejected", a.reason = e, e = 0; e < u.length; e++)
            (0, u[e])(void 0);
        }
      ),
      a
    );
  }
  var y0 = q.S;
  q.S = function (l, t) {
    typeof t == "object" &&
      t !== null &&
      typeof t.then == "function" &&
      u1(l, t),
      y0 !== null && y0(l, t);
  };
  var Uu = $(null);
  function bf() {
    var l = Uu.current;
    return l !== null ? l : tl.pooledCache;
  }
  function $e(l, t) {
    t === null ? nl(Uu, Uu.current) : nl(Uu, t.pool);
  }
  function d0() {
    var l = bf();
    return l === null ? null : { parent: El._currentValue, pool: l };
  }
  var tu = 0,
    Q = null,
    k = null,
    ol = null,
    ke = !1,
    fa = !1,
    Ru = !1,
    Fe = 0,
    Ja = 0,
    ca = null,
    e1 = 0;
  function dl() {
    throw Error(o(321));
  }
  function Ef(l, t) {
    if (t === null) return !1;
    for (var u = 0; u < t.length && u < l.length; u++)
      if (!wl(l[u], t[u])) return !1;
    return !0;
  }
  function Tf(l, t, u, a, e, n) {
    return (
      (tu = n),
      (Q = t),
      (t.memoizedState = null),
      (t.updateQueue = null),
      (t.lanes = 0),
      (q.H = l === null || l.memoizedState === null ? Hu : uu),
      (Ru = !1),
      (n = u(a, e)),
      (Ru = !1),
      fa && (n = m0(t, u, a, e)),
      h0(l),
      n
    );
  }
  function h0(l) {
    q.H = zt;
    var t = k !== null && k.next !== null;
    if (((tu = 0), (ol = k = Q = null), (ke = !1), (Ja = 0), (ca = null), t))
      throw Error(o(300));
    l === null ||
      Al ||
      ((l = l.dependencies), l !== null && fn(l) && (Al = !0));
  }
  function m0(l, t, u, a) {
    Q = l;
    var e = 0;
    do {
      if ((fa && (ca = null), (Ja = 0), (fa = !1), 25 <= e))
        throw Error(o(301));
      if (((e += 1), (ol = k = null), l.updateQueue != null)) {
        var n = l.updateQueue;
        (n.lastEffect = null),
          (n.events = null),
          (n.stores = null),
          n.memoCache != null && (n.memoCache.index = 0);
      }
      (q.H = qu), (n = t(u, a));
    } while (fa);
    return n;
  }
  function n1() {
    var l = q.H,
      t = l.useState()[0];
    return (
      (t = typeof t.then == "function" ? wa(t) : t),
      (l = l.useState()[0]),
      (k !== null ? k.memoizedState : null) !== l && (Q.flags |= 1024),
      t
    );
  }
  function zf() {
    var l = Fe !== 0;
    return (Fe = 0), l;
  }
  function Af(l, t, u) {
    (t.updateQueue = l.updateQueue), (t.flags &= -2053), (l.lanes &= ~u);
  }
  function Of(l) {
    if (ke) {
      for (l = l.memoizedState; l !== null; ) {
        var t = l.queue;
        t !== null && (t.pending = null), (l = l.next);
      }
      ke = !1;
    }
    (tu = 0), (ol = k = Q = null), (fa = !1), (Ja = Fe = 0), (ca = null);
  }
  function xl() {
    var l = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null,
    };
    return ol === null ? (Q.memoizedState = ol = l) : (ol = ol.next = l), ol;
  }
  function Sl() {
    if (k === null) {
      var l = Q.alternate;
      l = l !== null ? l.memoizedState : null;
    } else l = k.next;
    var t = ol === null ? Q.memoizedState : ol.next;
    if (t !== null) (ol = t), (k = l);
    else {
      if (l === null)
        throw Q.alternate === null ? Error(o(467)) : Error(o(310));
      (k = l),
        (l = {
          memoizedState: k.memoizedState,
          baseState: k.baseState,
          baseQueue: k.baseQueue,
          queue: k.queue,
          next: null,
        }),
        ol === null ? (Q.memoizedState = ol = l) : (ol = ol.next = l);
    }
    return ol;
  }
  var Pe;
  Pe = function () {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  };
  function wa(l) {
    var t = Ja;
    return (
      (Ja += 1),
      ca === null && (ca = []),
      (l = a0(ca, l, t)),
      (t = Q),
      (ol === null ? t.memoizedState : ol.next) === null &&
        ((t = t.alternate),
        (q.H = t === null || t.memoizedState === null ? Hu : uu)),
      l
    );
  }
  function Ie(l) {
    if (l !== null && typeof l == "object") {
      if (typeof l.then == "function") return wa(l);
      if (l.$$typeof === hl) return ql(l);
    }
    throw Error(o(438, String(l)));
  }
  function _f(l) {
    var t = null,
      u = Q.updateQueue;
    if ((u !== null && (t = u.memoCache), t == null)) {
      var a = Q.alternate;
      a !== null &&
        ((a = a.updateQueue),
        a !== null &&
          ((a = a.memoCache),
          a != null &&
            (t = {
              data: a.data.map(function (e) {
                return e.slice();
              }),
              index: 0,
            })));
    }
    if (
      (t == null && (t = { data: [], index: 0 }),
      u === null && ((u = Pe()), (Q.updateQueue = u)),
      (u.memoCache = t),
      (u = t.data[t.index]),
      u === void 0)
    )
      for (u = t.data[t.index] = Array(l), a = 0; a < l; a++) u[a] = Kt;
    return t.index++, u;
  }
  function Yt(l, t) {
    return typeof t == "function" ? t(l) : t;
  }
  function ln(l) {
    var t = Sl();
    return Df(t, k, l);
  }
  function Df(l, t, u) {
    var a = l.queue;
    if (a === null) throw Error(o(311));
    a.lastRenderedReducer = u;
    var e = l.baseQueue,
      n = a.pending;
    if (n !== null) {
      if (e !== null) {
        var f = e.next;
        (e.next = n.next), (n.next = f);
      }
      (t.baseQueue = e = n), (a.pending = null);
    }
    if (((n = l.baseState), e === null)) l.memoizedState = n;
    else {
      t = e.next;
      var c = (f = null),
        i = null,
        y = t,
        g = !1;
      do {
        var b = y.lane & -536870913;
        if (b !== y.lane ? (x & b) === b : (tu & b) === b) {
          var m = y.revertLane;
          if (m === 0)
            i !== null &&
              (i = i.next =
                {
                  lane: 0,
                  revertLane: 0,
                  action: y.action,
                  hasEagerState: y.hasEagerState,
                  eagerState: y.eagerState,
                  next: null,
                }),
              b === ea && (g = !0);
          else if ((tu & m) === m) {
            (y = y.next), m === ea && (g = !0);
            continue;
          } else
            (b = {
              lane: 0,
              revertLane: y.revertLane,
              action: y.action,
              hasEagerState: y.hasEagerState,
              eagerState: y.eagerState,
              next: null,
            }),
              i === null ? ((c = i = b), (f = n)) : (i = i.next = b),
              (Q.lanes |= m),
              (yu |= m);
          (b = y.action),
            Ru && u(n, b),
            (n = y.hasEagerState ? y.eagerState : u(n, b));
        } else
          (m = {
            lane: b,
            revertLane: y.revertLane,
            action: y.action,
            hasEagerState: y.hasEagerState,
            eagerState: y.eagerState,
            next: null,
          }),
            i === null ? ((c = i = m), (f = n)) : (i = i.next = m),
            (Q.lanes |= b),
            (yu |= b);
        y = y.next;
      } while (y !== null && y !== t);
      if (
        (i === null ? (f = n) : (i.next = c),
        !wl(n, l.memoizedState) && ((Al = !0), g && ((u = na), u !== null)))
      )
        throw u;
      (l.memoizedState = n),
        (l.baseState = f),
        (l.baseQueue = i),
        (a.lastRenderedState = n);
    }
    return e === null && (a.lanes = 0), [l.memoizedState, a.dispatch];
  }
  function Mf(l) {
    var t = Sl(),
      u = t.queue;
    if (u === null) throw Error(o(311));
    u.lastRenderedReducer = l;
    var a = u.dispatch,
      e = u.pending,
      n = t.memoizedState;
    if (e !== null) {
      u.pending = null;
      var f = (e = e.next);
      do (n = l(n, f.action)), (f = f.next);
      while (f !== e);
      wl(n, t.memoizedState) || (Al = !0),
        (t.memoizedState = n),
        t.baseQueue === null && (t.baseState = n),
        (u.lastRenderedState = n);
    }
    return [n, a];
  }
  function o0(l, t, u) {
    var a = Q,
      e = Sl(),
      n = L;
    if (n) {
      if (u === void 0) throw Error(o(407));
      u = u();
    } else u = t();
    var f = !wl((k || e).memoizedState, u);
    if (
      (f && ((e.memoizedState = u), (Al = !0)),
      (e = e.queue),
      Hf(r0.bind(null, a, e, l), [l]),
      e.getSnapshot !== t || f || (ol !== null && ol.memoizedState.tag & 1))
    ) {
      if (
        ((a.flags |= 2048),
        ia(9, g0.bind(null, a, e, u, t), { destroy: void 0 }, null),
        tl === null)
      )
        throw Error(o(349));
      n || tu & 60 || S0(a, t, u);
    }
    return u;
  }
  function S0(l, t, u) {
    (l.flags |= 16384),
      (l = { getSnapshot: t, value: u }),
      (t = Q.updateQueue),
      t === null
        ? ((t = Pe()), (Q.updateQueue = t), (t.stores = [l]))
        : ((u = t.stores), u === null ? (t.stores = [l]) : u.push(l));
  }
  function g0(l, t, u, a) {
    (t.value = u), (t.getSnapshot = a), b0(t) && E0(l);
  }
  function r0(l, t, u) {
    return u(function () {
      b0(t) && E0(l);
    });
  }
  function b0(l) {
    var t = l.getSnapshot;
    l = l.value;
    try {
      var u = t();
      return !wl(l, u);
    } catch {
      return !0;
    }
  }
  function E0(l) {
    var t = Pt(l, 2);
    t !== null && Xl(t, l, 2);
  }
  function Uf(l) {
    var t = xl();
    if (typeof l == "function") {
      var u = l;
      if (((l = u()), Ru)) {
        $t(!0);
        try {
          u();
        } finally {
          $t(!1);
        }
      }
    }
    return (
      (t.memoizedState = t.baseState = l),
      (t.queue = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Yt,
        lastRenderedState: l,
      }),
      t
    );
  }
  function T0(l, t, u, a) {
    return (l.baseState = u), Df(l, k, typeof a == "function" ? a : Yt);
  }
  function f1(l, t, u, a, e) {
    if (an(l)) throw Error(o(485));
    if (((l = t.action), l !== null)) {
      var n = {
        payload: e,
        action: l,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function (f) {
          n.listeners.push(f);
        },
      };
      q.T !== null ? u(!0) : (n.isTransition = !1),
        a(n),
        (u = t.pending),
        u === null
          ? ((n.next = t.pending = n), z0(t, n))
          : ((n.next = u.next), (t.pending = u.next = n));
    }
  }
  function z0(l, t) {
    var u = t.action,
      a = t.payload,
      e = l.state;
    if (t.isTransition) {
      var n = q.T,
        f = {};
      q.T = f;
      try {
        var c = u(e, a),
          i = q.S;
        i !== null && i(f, c), A0(l, t, c);
      } catch (y) {
        Rf(l, t, y);
      } finally {
        q.T = n;
      }
    } else
      try {
        (n = u(e, a)), A0(l, t, n);
      } catch (y) {
        Rf(l, t, y);
      }
  }
  function A0(l, t, u) {
    u !== null && typeof u == "object" && typeof u.then == "function"
      ? u.then(
          function (a) {
            O0(l, t, a);
          },
          function (a) {
            return Rf(l, t, a);
          }
        )
      : O0(l, t, u);
  }
  function O0(l, t, u) {
    (t.status = "fulfilled"),
      (t.value = u),
      _0(t),
      (l.state = u),
      (t = l.pending),
      t !== null &&
        ((u = t.next),
        u === t ? (l.pending = null) : ((u = u.next), (t.next = u), z0(l, u)));
  }
  function Rf(l, t, u) {
    var a = l.pending;
    if (((l.pending = null), a !== null)) {
      a = a.next;
      do (t.status = "rejected"), (t.reason = u), _0(t), (t = t.next);
      while (t !== a);
    }
    l.action = null;
  }
  function _0(l) {
    l = l.listeners;
    for (var t = 0; t < l.length; t++) (0, l[t])();
  }
  function D0(l, t) {
    return t;
  }
  function M0(l, t) {
    if (L) {
      var u = tl.formState;
      if (u !== null) {
        l: {
          var a = Q;
          if (L) {
            if (Ml) {
              t: {
                for (var e = Ml, n = Et; e.nodeType !== 8; ) {
                  if (!n) {
                    e = null;
                    break t;
                  }
                  if (((e = St(e.nextSibling)), e === null)) {
                    e = null;
                    break t;
                  }
                }
                (n = e.data), (e = n === "F!" || n === "F" ? e : null);
              }
              if (e) {
                (Ml = St(e.nextSibling)), (a = e.data === "F!");
                break l;
              }
            }
            Du(a);
          }
          a = !1;
        }
        a && (t = u[0]);
      }
    }
    return (
      (u = xl()),
      (u.memoizedState = u.baseState = t),
      (a = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: D0,
        lastRenderedState: t,
      }),
      (u.queue = a),
      (u = K0.bind(null, Q, a)),
      (a.dispatch = u),
      (a = Uf(!1)),
      (n = pf.bind(null, Q, !1, a.queue)),
      (a = xl()),
      (e = { state: t, dispatch: null, action: l, pending: null }),
      (a.queue = e),
      (u = f1.bind(null, Q, e, n, u)),
      (e.dispatch = u),
      (a.memoizedState = l),
      [t, u, !1]
    );
  }
  function U0(l) {
    var t = Sl();
    return R0(t, k, l);
  }
  function R0(l, t, u) {
    (t = Df(l, t, D0)[0]),
      (l = ln(Yt)[0]),
      (t =
        typeof t == "object" && t !== null && typeof t.then == "function"
          ? wa(t)
          : t);
    var a = Sl(),
      e = a.queue,
      n = e.dispatch;
    return (
      u !== a.memoizedState &&
        ((Q.flags |= 2048),
        ia(9, c1.bind(null, e, u), { destroy: void 0 }, null)),
      [t, n, l]
    );
  }
  function c1(l, t) {
    l.action = t;
  }
  function H0(l) {
    var t = Sl(),
      u = k;
    if (u !== null) return R0(t, u, l);
    Sl(), (t = t.memoizedState), (u = Sl());
    var a = u.queue.dispatch;
    return (u.memoizedState = l), [t, a, !1];
  }
  function ia(l, t, u, a) {
    return (
      (l = { tag: l, create: t, inst: u, deps: a, next: null }),
      (t = Q.updateQueue),
      t === null && ((t = Pe()), (Q.updateQueue = t)),
      (u = t.lastEffect),
      u === null
        ? (t.lastEffect = l.next = l)
        : ((a = u.next), (u.next = l), (l.next = a), (t.lastEffect = l)),
      l
    );
  }
  function q0() {
    return Sl().memoizedState;
  }
  function tn(l, t, u, a) {
    var e = xl();
    (Q.flags |= l),
      (e.memoizedState = ia(
        1 | t,
        u,
        { destroy: void 0 },
        a === void 0 ? null : a
      ));
  }
  function un(l, t, u, a) {
    var e = Sl();
    a = a === void 0 ? null : a;
    var n = e.memoizedState.inst;
    k !== null && a !== null && Ef(a, k.memoizedState.deps)
      ? (e.memoizedState = ia(t, u, n, a))
      : ((Q.flags |= l), (e.memoizedState = ia(1 | t, u, n, a)));
  }
  function N0(l, t) {
    tn(8390656, 8, l, t);
  }
  function Hf(l, t) {
    un(2048, 8, l, t);
  }
  function Y0(l, t) {
    return un(4, 2, l, t);
  }
  function B0(l, t) {
    return un(4, 4, l, t);
  }
  function p0(l, t) {
    if (typeof t == "function") {
      l = l();
      var u = t(l);
      return function () {
        typeof u == "function" ? u() : t(null);
      };
    }
    if (t != null)
      return (
        (l = l()),
        (t.current = l),
        function () {
          t.current = null;
        }
      );
  }
  function G0(l, t, u) {
    (u = u != null ? u.concat([l]) : null), un(4, 4, p0.bind(null, t, l), u);
  }
  function qf() {}
  function X0(l, t) {
    var u = Sl();
    t = t === void 0 ? null : t;
    var a = u.memoizedState;
    return t !== null && Ef(t, a[1]) ? a[0] : ((u.memoizedState = [l, t]), l);
  }
  function Q0(l, t) {
    var u = Sl();
    t = t === void 0 ? null : t;
    var a = u.memoizedState;
    if (t !== null && Ef(t, a[1])) return a[0];
    if (((a = l()), Ru)) {
      $t(!0);
      try {
        l();
      } finally {
        $t(!1);
      }
    }
    return (u.memoizedState = [a, t]), a;
  }
  function Nf(l, t, u) {
    return u === void 0 || tu & 1073741824
      ? (l.memoizedState = t)
      : ((l.memoizedState = u), (l = js()), (Q.lanes |= l), (yu |= l), u);
  }
  function Z0(l, t, u, a) {
    return wl(u, t)
      ? u
      : aa.current !== null
      ? ((l = Nf(l, u, a)), wl(l, t) || (Al = !0), l)
      : tu & 42
      ? ((l = js()), (Q.lanes |= l), (yu |= l), t)
      : ((Al = !0), (l.memoizedState = u));
  }
  function j0(l, t, u, a, e) {
    var n = A.p;
    A.p = n !== 0 && 8 > n ? n : 8;
    var f = q.T,
      c = {};
    (q.T = c), pf(l, !1, t, u);
    try {
      var i = e(),
        y = q.S;
      if (
        (y !== null && y(c, i),
        i !== null && typeof i == "object" && typeof i.then == "function")
      ) {
        var g = a1(i, a);
        Wa(l, t, g, Fl(l));
      } else Wa(l, t, a, Fl(l));
    } catch (b) {
      Wa(l, t, { then: function () {}, status: "rejected", reason: b }, Fl());
    } finally {
      (A.p = n), (q.T = f);
    }
  }
  function i1() {}
  function Yf(l, t, u, a) {
    if (l.tag !== 5) throw Error(o(476));
    var e = C0(l).queue;
    j0(
      l,
      e,
      t,
      V,
      u === null
        ? i1
        : function () {
            return V0(l), u(a);
          }
    );
  }
  function C0(l) {
    var t = l.memoizedState;
    if (t !== null) return t;
    t = {
      memoizedState: V,
      baseState: V,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Yt,
        lastRenderedState: V,
      },
      next: null,
    };
    var u = {};
    return (
      (t.next = {
        memoizedState: u,
        baseState: u,
        baseQueue: null,
        queue: {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: Yt,
          lastRenderedState: u,
        },
        next: null,
      }),
      (l.memoizedState = t),
      (l = l.alternate),
      l !== null && (l.memoizedState = t),
      t
    );
  }
  function V0(l) {
    var t = C0(l).next.queue;
    Wa(l, t, {}, Fl());
  }
  function Bf() {
    return ql(me);
  }
  function x0() {
    return Sl().memoizedState;
  }
  function L0() {
    return Sl().memoizedState;
  }
  function s1(l) {
    for (var t = l.return; t !== null; ) {
      switch (t.tag) {
        case 24:
        case 3:
          var u = Fl();
          l = nu(u);
          var a = fu(t, l, u);
          a !== null && (Xl(a, t, u), Fa(a, t, u)),
            (t = { cache: gf() }),
            (l.payload = t);
          return;
      }
      t = t.return;
    }
  }
  function v1(l, t, u) {
    var a = Fl();
    (u = {
      lane: a,
      revertLane: 0,
      action: u,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
      an(l)
        ? J0(t, u)
        : ((u = vf(l, t, u, a)), u !== null && (Xl(u, l, a), w0(u, t, a)));
  }
  function K0(l, t, u) {
    var a = Fl();
    Wa(l, t, u, a);
  }
  function Wa(l, t, u, a) {
    var e = {
      lane: a,
      revertLane: 0,
      action: u,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    };
    if (an(l)) J0(t, e);
    else {
      var n = l.alternate;
      if (
        l.lanes === 0 &&
        (n === null || n.lanes === 0) &&
        ((n = t.lastRenderedReducer), n !== null)
      )
        try {
          var f = t.lastRenderedState,
            c = n(f, u);
          if (((e.hasEagerState = !0), (e.eagerState = c), wl(c, f)))
            return je(l, t, e, 0), tl === null && Ze(), !1;
        } catch {
        } finally {
        }
      if (((u = vf(l, t, e, a)), u !== null))
        return Xl(u, l, a), w0(u, t, a), !0;
    }
    return !1;
  }
  function pf(l, t, u, a) {
    if (
      ((a = {
        lane: 2,
        revertLane: Oc(),
        action: a,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
      an(l))
    ) {
      if (t) throw Error(o(479));
    } else (t = vf(l, u, a, 2)), t !== null && Xl(t, l, 2);
  }
  function an(l) {
    var t = l.alternate;
    return l === Q || (t !== null && t === Q);
  }
  function J0(l, t) {
    fa = ke = !0;
    var u = l.pending;
    u === null ? (t.next = t) : ((t.next = u.next), (u.next = t)),
      (l.pending = t);
  }
  function w0(l, t, u) {
    if (u & 4194176) {
      var a = t.lanes;
      (a &= l.pendingLanes), (u |= a), (t.lanes = u), ei(l, u);
    }
  }
  var zt = {
    readContext: ql,
    use: Ie,
    useCallback: dl,
    useContext: dl,
    useEffect: dl,
    useImperativeHandle: dl,
    useLayoutEffect: dl,
    useInsertionEffect: dl,
    useMemo: dl,
    useReducer: dl,
    useRef: dl,
    useState: dl,
    useDebugValue: dl,
    useDeferredValue: dl,
    useTransition: dl,
    useSyncExternalStore: dl,
    useId: dl,
  };
  (zt.useCacheRefresh = dl),
    (zt.useMemoCache = dl),
    (zt.useHostTransitionStatus = dl),
    (zt.useFormState = dl),
    (zt.useActionState = dl),
    (zt.useOptimistic = dl);
  var Hu = {
    readContext: ql,
    use: Ie,
    useCallback: function (l, t) {
      return (xl().memoizedState = [l, t === void 0 ? null : t]), l;
    },
    useContext: ql,
    useEffect: N0,
    useImperativeHandle: function (l, t, u) {
      (u = u != null ? u.concat([l]) : null),
        tn(4194308, 4, p0.bind(null, t, l), u);
    },
    useLayoutEffect: function (l, t) {
      return tn(4194308, 4, l, t);
    },
    useInsertionEffect: function (l, t) {
      tn(4, 2, l, t);
    },
    useMemo: function (l, t) {
      var u = xl();
      t = t === void 0 ? null : t;
      var a = l();
      if (Ru) {
        $t(!0);
        try {
          l();
        } finally {
          $t(!1);
        }
      }
      return (u.memoizedState = [a, t]), a;
    },
    useReducer: function (l, t, u) {
      var a = xl();
      if (u !== void 0) {
        var e = u(t);
        if (Ru) {
          $t(!0);
          try {
            u(t);
          } finally {
            $t(!1);
          }
        }
      } else e = t;
      return (
        (a.memoizedState = a.baseState = e),
        (l = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: l,
          lastRenderedState: e,
        }),
        (a.queue = l),
        (l = l.dispatch = v1.bind(null, Q, l)),
        [a.memoizedState, l]
      );
    },
    useRef: function (l) {
      var t = xl();
      return (l = { current: l }), (t.memoizedState = l);
    },
    useState: function (l) {
      l = Uf(l);
      var t = l.queue,
        u = K0.bind(null, Q, t);
      return (t.dispatch = u), [l.memoizedState, u];
    },
    useDebugValue: qf,
    useDeferredValue: function (l, t) {
      var u = xl();
      return Nf(u, l, t);
    },
    useTransition: function () {
      var l = Uf(!1);
      return (
        (l = j0.bind(null, Q, l.queue, !0, !1)),
        (xl().memoizedState = l),
        [!1, l]
      );
    },
    useSyncExternalStore: function (l, t, u) {
      var a = Q,
        e = xl();
      if (L) {
        if (u === void 0) throw Error(o(407));
        u = u();
      } else {
        if (((u = t()), tl === null)) throw Error(o(349));
        x & 60 || S0(a, t, u);
      }
      e.memoizedState = u;
      var n = { value: u, getSnapshot: t };
      return (
        (e.queue = n),
        N0(r0.bind(null, a, n, l), [l]),
        (a.flags |= 2048),
        ia(9, g0.bind(null, a, n, u, t), { destroy: void 0 }, null),
        u
      );
    },
    useId: function () {
      var l = xl(),
        t = tl.identifierPrefix;
      if (L) {
        var u = qt,
          a = Ht;
        (u = (a & ~(1 << (32 - Jl(a) - 1))).toString(32) + u),
          (t = ":" + t + "R" + u),
          (u = Fe++),
          0 < u && (t += "H" + u.toString(32)),
          (t += ":");
      } else (u = e1++), (t = ":" + t + "r" + u.toString(32) + ":");
      return (l.memoizedState = t);
    },
    useCacheRefresh: function () {
      return (xl().memoizedState = s1.bind(null, Q));
    },
  };
  (Hu.useMemoCache = _f),
    (Hu.useHostTransitionStatus = Bf),
    (Hu.useFormState = M0),
    (Hu.useActionState = M0),
    (Hu.useOptimistic = function (l) {
      var t = xl();
      t.memoizedState = t.baseState = l;
      var u = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null,
      };
      return (
        (t.queue = u), (t = pf.bind(null, Q, !0, u)), (u.dispatch = t), [l, t]
      );
    });
  var uu = {
    readContext: ql,
    use: Ie,
    useCallback: X0,
    useContext: ql,
    useEffect: Hf,
    useImperativeHandle: G0,
    useInsertionEffect: Y0,
    useLayoutEffect: B0,
    useMemo: Q0,
    useReducer: ln,
    useRef: q0,
    useState: function () {
      return ln(Yt);
    },
    useDebugValue: qf,
    useDeferredValue: function (l, t) {
      var u = Sl();
      return Z0(u, k.memoizedState, l, t);
    },
    useTransition: function () {
      var l = ln(Yt)[0],
        t = Sl().memoizedState;
      return [typeof l == "boolean" ? l : wa(l), t];
    },
    useSyncExternalStore: o0,
    useId: x0,
  };
  (uu.useCacheRefresh = L0),
    (uu.useMemoCache = _f),
    (uu.useHostTransitionStatus = Bf),
    (uu.useFormState = U0),
    (uu.useActionState = U0),
    (uu.useOptimistic = function (l, t) {
      var u = Sl();
      return T0(u, k, l, t);
    });
  var qu = {
    readContext: ql,
    use: Ie,
    useCallback: X0,
    useContext: ql,
    useEffect: Hf,
    useImperativeHandle: G0,
    useInsertionEffect: Y0,
    useLayoutEffect: B0,
    useMemo: Q0,
    useReducer: Mf,
    useRef: q0,
    useState: function () {
      return Mf(Yt);
    },
    useDebugValue: qf,
    useDeferredValue: function (l, t) {
      var u = Sl();
      return k === null ? Nf(u, l, t) : Z0(u, k.memoizedState, l, t);
    },
    useTransition: function () {
      var l = Mf(Yt)[0],
        t = Sl().memoizedState;
      return [typeof l == "boolean" ? l : wa(l), t];
    },
    useSyncExternalStore: o0,
    useId: x0,
  };
  (qu.useCacheRefresh = L0),
    (qu.useMemoCache = _f),
    (qu.useHostTransitionStatus = Bf),
    (qu.useFormState = H0),
    (qu.useActionState = H0),
    (qu.useOptimistic = function (l, t) {
      var u = Sl();
      return k !== null
        ? T0(u, k, l, t)
        : ((u.baseState = l), [l, u.queue.dispatch]);
    });
  function Gf(l, t, u, a) {
    (t = l.memoizedState),
      (u = u(a, t)),
      (u = u == null ? t : W({}, t, u)),
      (l.memoizedState = u),
      l.lanes === 0 && (l.updateQueue.baseState = u);
  }
  var Xf = {
    isMounted: function (l) {
      return (l = l._reactInternals) ? Y(l) === l : !1;
    },
    enqueueSetState: function (l, t, u) {
      l = l._reactInternals;
      var a = Fl(),
        e = nu(a);
      (e.payload = t),
        u != null && (e.callback = u),
        (t = fu(l, e, a)),
        t !== null && (Xl(t, l, a), Fa(t, l, a));
    },
    enqueueReplaceState: function (l, t, u) {
      l = l._reactInternals;
      var a = Fl(),
        e = nu(a);
      (e.tag = 1),
        (e.payload = t),
        u != null && (e.callback = u),
        (t = fu(l, e, a)),
        t !== null && (Xl(t, l, a), Fa(t, l, a));
    },
    enqueueForceUpdate: function (l, t) {
      l = l._reactInternals;
      var u = Fl(),
        a = nu(u);
      (a.tag = 2),
        t != null && (a.callback = t),
        (t = fu(l, a, u)),
        t !== null && (Xl(t, l, u), Fa(t, l, u));
    },
  };
  function W0(l, t, u, a, e, n, f) {
    return (
      (l = l.stateNode),
      typeof l.shouldComponentUpdate == "function"
        ? l.shouldComponentUpdate(a, n, f)
        : t.prototype && t.prototype.isPureReactComponent
        ? !pa(u, a) || !pa(e, n)
        : !0
    );
  }
  function $0(l, t, u, a) {
    (l = t.state),
      typeof t.componentWillReceiveProps == "function" &&
        t.componentWillReceiveProps(u, a),
      typeof t.UNSAFE_componentWillReceiveProps == "function" &&
        t.UNSAFE_componentWillReceiveProps(u, a),
      t.state !== l && Xf.enqueueReplaceState(t, t.state, null);
  }
  function Nu(l, t) {
    var u = t;
    if ("ref" in t) {
      u = {};
      for (var a in t) a !== "ref" && (u[a] = t[a]);
    }
    if ((l = l.defaultProps)) {
      u === t && (u = W({}, u));
      for (var e in l) u[e] === void 0 && (u[e] = l[e]);
    }
    return u;
  }
  var en =
    typeof reportError == "function"
      ? reportError
      : function (l) {
          if (
            typeof window == "object" &&
            typeof window.ErrorEvent == "function"
          ) {
            var t = new window.ErrorEvent("error", {
              bubbles: !0,
              cancelable: !0,
              message:
                typeof l == "object" &&
                l !== null &&
                typeof l.message == "string"
                  ? String(l.message)
                  : String(l),
              error: l,
            });
            if (!window.dispatchEvent(t)) return;
          } else if (
            typeof process == "object" &&
            typeof process.emit == "function"
          ) {
            process.emit("uncaughtException", l);
            return;
          }
          console.error(l);
        };
  function k0(l) {
    en(l);
  }
  function F0(l) {
    console.error(l);
  }
  function P0(l) {
    en(l);
  }
  function nn(l, t) {
    try {
      var u = l.onUncaughtError;
      u(t.value, { componentStack: t.stack });
    } catch (a) {
      setTimeout(function () {
        throw a;
      });
    }
  }
  function I0(l, t, u) {
    try {
      var a = l.onCaughtError;
      a(u.value, {
        componentStack: u.stack,
        errorBoundary: t.tag === 1 ? t.stateNode : null,
      });
    } catch (e) {
      setTimeout(function () {
        throw e;
      });
    }
  }
  function Qf(l, t, u) {
    return (
      (u = nu(u)),
      (u.tag = 3),
      (u.payload = { element: null }),
      (u.callback = function () {
        nn(l, t);
      }),
      u
    );
  }
  function ls(l) {
    return (l = nu(l)), (l.tag = 3), l;
  }
  function ts(l, t, u, a) {
    var e = u.type.getDerivedStateFromError;
    if (typeof e == "function") {
      var n = a.value;
      (l.payload = function () {
        return e(n);
      }),
        (l.callback = function () {
          I0(t, u, a);
        });
    }
    var f = u.stateNode;
    f !== null &&
      typeof f.componentDidCatch == "function" &&
      (l.callback = function () {
        I0(t, u, a),
          typeof e != "function" &&
            (du === null ? (du = new Set([this])) : du.add(this));
        var c = a.stack;
        this.componentDidCatch(a.value, {
          componentStack: c !== null ? c : "",
        });
      });
  }
  function y1(l, t, u, a, e) {
    if (
      ((u.flags |= 32768),
      a !== null && typeof a == "object" && typeof a.then == "function")
    ) {
      if (
        ((t = u.alternate),
        t !== null && ka(t, u, e, !0),
        (u = ft.current),
        u !== null)
      ) {
        switch (u.tag) {
          case 13:
            return (
              Tt === null ? bc() : u.alternate === null && sl === 0 && (sl = 3),
              (u.flags &= -257),
              (u.flags |= 65536),
              (u.lanes = e),
              a === mf
                ? (u.flags |= 16384)
                : ((t = u.updateQueue),
                  t === null ? (u.updateQueue = new Set([a])) : t.add(a),
                  Tc(l, a, e)),
              !1
            );
          case 22:
            return (
              (u.flags |= 65536),
              a === mf
                ? (u.flags |= 16384)
                : ((t = u.updateQueue),
                  t === null
                    ? ((t = {
                        transitions: null,
                        markerInstances: null,
                        retryQueue: new Set([a]),
                      }),
                      (u.updateQueue = t))
                    : ((u = t.retryQueue),
                      u === null ? (t.retryQueue = new Set([a])) : u.add(a)),
                  Tc(l, a, e)),
              !1
            );
        }
        throw Error(o(435, u.tag));
      }
      return Tc(l, a, e), bc(), !1;
    }
    if (L)
      return (
        (t = ft.current),
        t !== null
          ? (!(t.flags & 65536) && (t.flags |= 256),
            (t.flags |= 65536),
            (t.lanes = e),
            a !== hf && ((l = Error(o(422), { cause: a })), Za(at(l, u))))
          : (a !== hf && ((t = Error(o(423), { cause: a })), Za(at(t, u))),
            (l = l.current.alternate),
            (l.flags |= 65536),
            (e &= -e),
            (l.lanes |= e),
            (a = at(a, u)),
            (e = Qf(l.stateNode, a, e)),
            If(l, e),
            sl !== 4 && (sl = 2)),
        !1
      );
    var n = Error(o(520), { cause: a });
    if (
      ((n = at(n, u)),
      ne === null ? (ne = [n]) : ne.push(n),
      sl !== 4 && (sl = 2),
      t === null)
    )
      return !0;
    (a = at(a, u)), (u = t);
    do {
      switch (u.tag) {
        case 3:
          return (
            (u.flags |= 65536),
            (l = e & -e),
            (u.lanes |= l),
            (l = Qf(u.stateNode, a, l)),
            If(u, l),
            !1
          );
        case 1:
          if (
            ((t = u.type),
            (n = u.stateNode),
            (u.flags & 128) === 0 &&
              (typeof t.getDerivedStateFromError == "function" ||
                (n !== null &&
                  typeof n.componentDidCatch == "function" &&
                  (du === null || !du.has(n)))))
          )
            return (
              (u.flags |= 65536),
              (e &= -e),
              (u.lanes |= e),
              (e = ls(e)),
              ts(e, l, u, a),
              If(u, e),
              !1
            );
      }
      u = u.return;
    } while (u !== null);
    return !1;
  }
  var us = Error(o(461)),
    Al = !1;
  function Ul(l, t, u, a) {
    t.child = l === null ? c0(t, null, u, a) : Mu(t, l.child, u, a);
  }
  function as(l, t, u, a, e) {
    u = u.render;
    var n = t.ref;
    if ("ref" in a) {
      var f = {};
      for (var c in a) c !== "ref" && (f[c] = a[c]);
    } else f = a;
    return (
      Bu(t),
      (a = Tf(l, t, u, f, n, e)),
      (c = zf()),
      l !== null && !Al
        ? (Af(l, t, e), Bt(l, t, e))
        : (L && c && yf(t), (t.flags |= 1), Ul(l, t, a, e), t.child)
    );
  }
  function es(l, t, u, a, e) {
    if (l === null) {
      var n = u.type;
      return typeof n == "function" &&
        !cc(n) &&
        n.defaultProps === void 0 &&
        u.compare === null
        ? ((t.tag = 15), (t.type = n), ns(l, t, n, a, e))
        : ((l = yn(u.type, null, a, t, t.mode, e)),
          (l.ref = t.ref),
          (l.return = t),
          (t.child = l));
    }
    if (((n = l.child), !wf(l, e))) {
      var f = n.memoizedProps;
      if (
        ((u = u.compare), (u = u !== null ? u : pa), u(f, a) && l.ref === t.ref)
      )
        return Bt(l, t, e);
    }
    return (
      (t.flags |= 1),
      (l = vu(n, a)),
      (l.ref = t.ref),
      (l.return = t),
      (t.child = l)
    );
  }
  function ns(l, t, u, a, e) {
    if (l !== null) {
      var n = l.memoizedProps;
      if (pa(n, a) && l.ref === t.ref)
        if (((Al = !1), (t.pendingProps = a = n), wf(l, e)))
          l.flags & 131072 && (Al = !0);
        else return (t.lanes = l.lanes), Bt(l, t, e);
    }
    return Zf(l, t, u, a, e);
  }
  function fs(l, t, u) {
    var a = t.pendingProps,
      e = a.children,
      n = (t.stateNode._pendingVisibility & 2) !== 0,
      f = l !== null ? l.memoizedState : null;
    if (($a(l, t), a.mode === "hidden" || n)) {
      if (t.flags & 128) {
        if (((a = f !== null ? f.baseLanes | u : u), l !== null)) {
          for (e = t.child = l.child, n = 0; e !== null; )
            (n = n | e.lanes | e.childLanes), (e = e.sibling);
          t.childLanes = n & ~a;
        } else (t.childLanes = 0), (t.child = null);
        return cs(l, t, a, u);
      }
      if (u & 536870912)
        (t.memoizedState = { baseLanes: 0, cachePool: null }),
          l !== null && $e(t, f !== null ? f.cachePool : null),
          f !== null ? i0(t, f) : of(),
          s0(t);
      else
        return (
          (t.lanes = t.childLanes = 536870912),
          cs(l, t, f !== null ? f.baseLanes | u : u, u)
        );
    } else
      f !== null
        ? ($e(t, f.cachePool), i0(t, f), lu(), (t.memoizedState = null))
        : (l !== null && $e(t, null), of(), lu());
    return Ul(l, t, e, u), t.child;
  }
  function cs(l, t, u, a) {
    var e = bf();
    return (
      (e = e === null ? null : { parent: El._currentValue, pool: e }),
      (t.memoizedState = { baseLanes: u, cachePool: e }),
      l !== null && $e(t, null),
      of(),
      s0(t),
      l !== null && ka(l, t, a, !0),
      null
    );
  }
  function $a(l, t) {
    var u = t.ref;
    if (u === null) l !== null && l.ref !== null && (t.flags |= 2097664);
    else {
      if (typeof u != "function" && typeof u != "object") throw Error(o(284));
      (l === null || l.ref !== u) && (t.flags |= 2097664);
    }
  }
  function Zf(l, t, u, a, e) {
    return (
      Bu(t),
      (u = Tf(l, t, u, a, void 0, e)),
      (a = zf()),
      l !== null && !Al
        ? (Af(l, t, e), Bt(l, t, e))
        : (L && a && yf(t), (t.flags |= 1), Ul(l, t, u, e), t.child)
    );
  }
  function is(l, t, u, a, e, n) {
    return (
      Bu(t),
      (t.updateQueue = null),
      (u = m0(t, a, u, e)),
      h0(l),
      (a = zf()),
      l !== null && !Al
        ? (Af(l, t, n), Bt(l, t, n))
        : (L && a && yf(t), (t.flags |= 1), Ul(l, t, u, n), t.child)
    );
  }
  function ss(l, t, u, a, e) {
    if ((Bu(t), t.stateNode === null)) {
      var n = Iu,
        f = u.contextType;
      typeof f == "object" && f !== null && (n = ql(f)),
        (n = new u(a, n)),
        (t.memoizedState =
          n.state !== null && n.state !== void 0 ? n.state : null),
        (n.updater = Xf),
        (t.stateNode = n),
        (n._reactInternals = t),
        (n = t.stateNode),
        (n.props = a),
        (n.state = t.memoizedState),
        (n.refs = {}),
        Ff(t),
        (f = u.contextType),
        (n.context = typeof f == "object" && f !== null ? ql(f) : Iu),
        (n.state = t.memoizedState),
        (f = u.getDerivedStateFromProps),
        typeof f == "function" && (Gf(t, u, f, a), (n.state = t.memoizedState)),
        typeof u.getDerivedStateFromProps == "function" ||
          typeof n.getSnapshotBeforeUpdate == "function" ||
          (typeof n.UNSAFE_componentWillMount != "function" &&
            typeof n.componentWillMount != "function") ||
          ((f = n.state),
          typeof n.componentWillMount == "function" && n.componentWillMount(),
          typeof n.UNSAFE_componentWillMount == "function" &&
            n.UNSAFE_componentWillMount(),
          f !== n.state && Xf.enqueueReplaceState(n, n.state, null),
          Ia(t, a, n, e),
          Pa(),
          (n.state = t.memoizedState)),
        typeof n.componentDidMount == "function" && (t.flags |= 4194308),
        (a = !0);
    } else if (l === null) {
      n = t.stateNode;
      var c = t.memoizedProps,
        i = Nu(u, c);
      n.props = i;
      var y = n.context,
        g = u.contextType;
      (f = Iu), typeof g == "object" && g !== null && (f = ql(g));
      var b = u.getDerivedStateFromProps;
      (g =
        typeof b == "function" ||
        typeof n.getSnapshotBeforeUpdate == "function"),
        (c = t.pendingProps !== c),
        g ||
          (typeof n.UNSAFE_componentWillReceiveProps != "function" &&
            typeof n.componentWillReceiveProps != "function") ||
          ((c || y !== f) && $0(t, n, a, f)),
        (eu = !1);
      var m = t.memoizedState;
      (n.state = m),
        Ia(t, a, n, e),
        Pa(),
        (y = t.memoizedState),
        c || m !== y || eu
          ? (typeof b == "function" && (Gf(t, u, b, a), (y = t.memoizedState)),
            (i = eu || W0(t, u, i, a, m, y, f))
              ? (g ||
                  (typeof n.UNSAFE_componentWillMount != "function" &&
                    typeof n.componentWillMount != "function") ||
                  (typeof n.componentWillMount == "function" &&
                    n.componentWillMount(),
                  typeof n.UNSAFE_componentWillMount == "function" &&
                    n.UNSAFE_componentWillMount()),
                typeof n.componentDidMount == "function" &&
                  (t.flags |= 4194308))
              : (typeof n.componentDidMount == "function" &&
                  (t.flags |= 4194308),
                (t.memoizedProps = a),
                (t.memoizedState = y)),
            (n.props = a),
            (n.state = y),
            (n.context = f),
            (a = i))
          : (typeof n.componentDidMount == "function" && (t.flags |= 4194308),
            (a = !1));
    } else {
      (n = t.stateNode),
        Pf(l, t),
        (f = t.memoizedProps),
        (g = Nu(u, f)),
        (n.props = g),
        (b = t.pendingProps),
        (m = n.context),
        (y = u.contextType),
        (i = Iu),
        typeof y == "object" && y !== null && (i = ql(y)),
        (c = u.getDerivedStateFromProps),
        (y =
          typeof c == "function" ||
          typeof n.getSnapshotBeforeUpdate == "function") ||
          (typeof n.UNSAFE_componentWillReceiveProps != "function" &&
            typeof n.componentWillReceiveProps != "function") ||
          ((f !== b || m !== i) && $0(t, n, a, i)),
        (eu = !1),
        (m = t.memoizedState),
        (n.state = m),
        Ia(t, a, n, e),
        Pa();
      var S = t.memoizedState;
      f !== b ||
      m !== S ||
      eu ||
      (l !== null && l.dependencies !== null && fn(l.dependencies))
        ? (typeof c == "function" && (Gf(t, u, c, a), (S = t.memoizedState)),
          (g =
            eu ||
            W0(t, u, g, a, m, S, i) ||
            (l !== null && l.dependencies !== null && fn(l.dependencies)))
            ? (y ||
                (typeof n.UNSAFE_componentWillUpdate != "function" &&
                  typeof n.componentWillUpdate != "function") ||
                (typeof n.componentWillUpdate == "function" &&
                  n.componentWillUpdate(a, S, i),
                typeof n.UNSAFE_componentWillUpdate == "function" &&
                  n.UNSAFE_componentWillUpdate(a, S, i)),
              typeof n.componentDidUpdate == "function" && (t.flags |= 4),
              typeof n.getSnapshotBeforeUpdate == "function" &&
                (t.flags |= 1024))
            : (typeof n.componentDidUpdate != "function" ||
                (f === l.memoizedProps && m === l.memoizedState) ||
                (t.flags |= 4),
              typeof n.getSnapshotBeforeUpdate != "function" ||
                (f === l.memoizedProps && m === l.memoizedState) ||
                (t.flags |= 1024),
              (t.memoizedProps = a),
              (t.memoizedState = S)),
          (n.props = a),
          (n.state = S),
          (n.context = i),
          (a = g))
        : (typeof n.componentDidUpdate != "function" ||
            (f === l.memoizedProps && m === l.memoizedState) ||
            (t.flags |= 4),
          typeof n.getSnapshotBeforeUpdate != "function" ||
            (f === l.memoizedProps && m === l.memoizedState) ||
            (t.flags |= 1024),
          (a = !1));
    }
    return (
      (n = a),
      $a(l, t),
      (a = (t.flags & 128) !== 0),
      n || a
        ? ((n = t.stateNode),
          (u =
            a && typeof u.getDerivedStateFromError != "function"
              ? null
              : n.render()),
          (t.flags |= 1),
          l !== null && a
            ? ((t.child = Mu(t, l.child, null, e)),
              (t.child = Mu(t, null, u, e)))
            : Ul(l, t, u, e),
          (t.memoizedState = n.state),
          (l = t.child))
        : (l = Bt(l, t, e)),
      l
    );
  }
  function vs(l, t, u, a) {
    return Qa(), (t.flags |= 256), Ul(l, t, u, a), t.child;
  }
  var jf = { dehydrated: null, treeContext: null, retryLane: 0 };
  function Cf(l) {
    return { baseLanes: l, cachePool: d0() };
  }
  function Vf(l, t, u) {
    return (l = l !== null ? l.childLanes & ~u : 0), t && (l |= vt), l;
  }
  function ys(l, t, u) {
    var a = t.pendingProps,
      e = !1,
      n = (t.flags & 128) !== 0,
      f;
    if (
      ((f = n) ||
        (f =
          l !== null && l.memoizedState === null ? !1 : (bl.current & 2) !== 0),
      f && ((e = !0), (t.flags &= -129)),
      (f = (t.flags & 32) !== 0),
      (t.flags &= -33),
      l === null)
    ) {
      if (L) {
        if ((e ? It(t) : lu(), L)) {
          var c = Ml,
            i;
          if ((i = c)) {
            l: {
              for (i = c, c = Et; i.nodeType !== 8; ) {
                if (!c) {
                  c = null;
                  break l;
                }
                if (((i = St(i.nextSibling)), i === null)) {
                  c = null;
                  break l;
                }
              }
              c = i;
            }
            c !== null
              ? ((t.memoizedState = {
                  dehydrated: c,
                  treeContext: Ou !== null ? { id: Ht, overflow: qt } : null,
                  retryLane: 536870912,
                }),
                (i = st(18, null, null, 0)),
                (i.stateNode = c),
                (i.return = t),
                (t.child = i),
                (Gl = t),
                (Ml = null),
                (i = !0))
              : (i = !1);
          }
          i || Du(t);
        }
        if (
          ((c = t.memoizedState),
          c !== null && ((c = c.dehydrated), c !== null))
        )
          return c.data === "$!" ? (t.lanes = 16) : (t.lanes = 536870912), null;
        Nt(t);
      }
      return (
        (c = a.children),
        (a = a.fallback),
        e
          ? (lu(),
            (e = t.mode),
            (c = Lf({ mode: "hidden", children: c }, e)),
            (a = Gu(a, e, u, null)),
            (c.return = t),
            (a.return = t),
            (c.sibling = a),
            (t.child = c),
            (e = t.child),
            (e.memoizedState = Cf(u)),
            (e.childLanes = Vf(l, f, u)),
            (t.memoizedState = jf),
            a)
          : (It(t), xf(t, c))
      );
    }
    if (
      ((i = l.memoizedState), i !== null && ((c = i.dehydrated), c !== null))
    ) {
      if (n)
        t.flags & 256
          ? (It(t), (t.flags &= -257), (t = Kf(l, t, u)))
          : t.memoizedState !== null
          ? (lu(), (t.child = l.child), (t.flags |= 128), (t = null))
          : (lu(),
            (e = a.fallback),
            (c = t.mode),
            (a = Lf({ mode: "visible", children: a.children }, c)),
            (e = Gu(e, c, u, null)),
            (e.flags |= 2),
            (a.return = t),
            (e.return = t),
            (a.sibling = e),
            (t.child = a),
            Mu(t, l.child, null, u),
            (a = t.child),
            (a.memoizedState = Cf(u)),
            (a.childLanes = Vf(l, f, u)),
            (t.memoizedState = jf),
            (t = e));
      else if ((It(t), c.data === "$!")) {
        if (((f = c.nextSibling && c.nextSibling.dataset), f)) var y = f.dgst;
        (f = y),
          (a = Error(o(419))),
          (a.stack = ""),
          (a.digest = f),
          Za({ value: a, source: null, stack: null }),
          (t = Kf(l, t, u));
      } else if (
        (Al || ka(l, t, u, !1), (f = (u & l.childLanes) !== 0), Al || f)
      ) {
        if (((f = tl), f !== null)) {
          if (((a = u & -u), a & 42)) a = 1;
          else
            switch (a) {
              case 2:
                a = 1;
                break;
              case 8:
                a = 4;
                break;
              case 32:
                a = 16;
                break;
              case 128:
              case 256:
              case 512:
              case 1024:
              case 2048:
              case 4096:
              case 8192:
              case 16384:
              case 32768:
              case 65536:
              case 131072:
              case 262144:
              case 524288:
              case 1048576:
              case 2097152:
              case 4194304:
              case 8388608:
              case 16777216:
              case 33554432:
                a = 64;
                break;
              case 268435456:
                a = 134217728;
                break;
              default:
                a = 0;
            }
          if (
            ((a = a & (f.suspendedLanes | u) ? 0 : a),
            a !== 0 && a !== i.retryLane)
          )
            throw ((i.retryLane = a), Pt(l, a), Xl(f, l, a), us);
        }
        c.data === "$?" || bc(), (t = Kf(l, t, u));
      } else
        c.data === "$?"
          ? ((t.flags |= 128),
            (t.child = l.child),
            (t = D1.bind(null, l)),
            (c._reactRetry = t),
            (t = null))
          : ((l = i.treeContext),
            (Ml = St(c.nextSibling)),
            (Gl = t),
            (L = !0),
            (mt = null),
            (Et = !1),
            l !== null &&
              ((et[nt++] = Ht),
              (et[nt++] = qt),
              (et[nt++] = Ou),
              (Ht = l.id),
              (qt = l.overflow),
              (Ou = t)),
            (t = xf(t, a.children)),
            (t.flags |= 4096));
      return t;
    }
    return e
      ? (lu(),
        (e = a.fallback),
        (c = t.mode),
        (i = l.child),
        (y = i.sibling),
        (a = vu(i, { mode: "hidden", children: a.children })),
        (a.subtreeFlags = i.subtreeFlags & 31457280),
        y !== null ? (e = vu(y, e)) : ((e = Gu(e, c, u, null)), (e.flags |= 2)),
        (e.return = t),
        (a.return = t),
        (a.sibling = e),
        (t.child = a),
        (a = e),
        (e = t.child),
        (c = l.child.memoizedState),
        c === null
          ? (c = Cf(u))
          : ((i = c.cachePool),
            i !== null
              ? ((y = El._currentValue),
                (i = i.parent !== y ? { parent: y, pool: y } : i))
              : (i = d0()),
            (c = { baseLanes: c.baseLanes | u, cachePool: i })),
        (e.memoizedState = c),
        (e.childLanes = Vf(l, f, u)),
        (t.memoizedState = jf),
        a)
      : (It(t),
        (u = l.child),
        (l = u.sibling),
        (u = vu(u, { mode: "visible", children: a.children })),
        (u.return = t),
        (u.sibling = null),
        l !== null &&
          ((f = t.deletions),
          f === null ? ((t.deletions = [l]), (t.flags |= 16)) : f.push(l)),
        (t.child = u),
        (t.memoizedState = null),
        u);
  }
  function xf(l, t) {
    return (
      (t = Lf({ mode: "visible", children: t }, l.mode)),
      (t.return = l),
      (l.child = t)
    );
  }
  function Lf(l, t) {
    return Xs(l, t, 0, null);
  }
  function Kf(l, t, u) {
    return (
      Mu(t, l.child, null, u),
      (l = xf(t, t.pendingProps.children)),
      (l.flags |= 2),
      (t.memoizedState = null),
      l
    );
  }
  function ds(l, t, u) {
    l.lanes |= t;
    var a = l.alternate;
    a !== null && (a.lanes |= t), $f(l.return, t, u);
  }
  function Jf(l, t, u, a, e) {
    var n = l.memoizedState;
    n === null
      ? (l.memoizedState = {
          isBackwards: t,
          rendering: null,
          renderingStartTime: 0,
          last: a,
          tail: u,
          tailMode: e,
        })
      : ((n.isBackwards = t),
        (n.rendering = null),
        (n.renderingStartTime = 0),
        (n.last = a),
        (n.tail = u),
        (n.tailMode = e));
  }
  function hs(l, t, u) {
    var a = t.pendingProps,
      e = a.revealOrder,
      n = a.tail;
    if ((Ul(l, t, a.children, u), (a = bl.current), a & 2))
      (a = (a & 1) | 2), (t.flags |= 128);
    else {
      if (l !== null && l.flags & 128)
        l: for (l = t.child; l !== null; ) {
          if (l.tag === 13) l.memoizedState !== null && ds(l, u, t);
          else if (l.tag === 19) ds(l, u, t);
          else if (l.child !== null) {
            (l.child.return = l), (l = l.child);
            continue;
          }
          if (l === t) break l;
          for (; l.sibling === null; ) {
            if (l.return === null || l.return === t) break l;
            l = l.return;
          }
          (l.sibling.return = l.return), (l = l.sibling);
        }
      a &= 1;
    }
    switch ((nl(bl, a), e)) {
      case "forwards":
        for (u = t.child, e = null; u !== null; )
          (l = u.alternate),
            l !== null && We(l) === null && (e = u),
            (u = u.sibling);
        (u = e),
          u === null
            ? ((e = t.child), (t.child = null))
            : ((e = u.sibling), (u.sibling = null)),
          Jf(t, !1, e, u, n);
        break;
      case "backwards":
        for (u = null, e = t.child, t.child = null; e !== null; ) {
          if (((l = e.alternate), l !== null && We(l) === null)) {
            t.child = e;
            break;
          }
          (l = e.sibling), (e.sibling = u), (u = e), (e = l);
        }
        Jf(t, !0, u, null, n);
        break;
      case "together":
        Jf(t, !1, null, null, void 0);
        break;
      default:
        t.memoizedState = null;
    }
    return t.child;
  }
  function Bt(l, t, u) {
    if (
      (l !== null && (t.dependencies = l.dependencies),
      (yu |= t.lanes),
      !(u & t.childLanes))
    )
      if (l !== null) {
        if ((ka(l, t, u, !1), (u & t.childLanes) === 0)) return null;
      } else return null;
    if (l !== null && t.child !== l.child) throw Error(o(153));
    if (t.child !== null) {
      for (
        l = t.child, u = vu(l, l.pendingProps), t.child = u, u.return = t;
        l.sibling !== null;

      )
        (l = l.sibling),
          (u = u.sibling = vu(l, l.pendingProps)),
          (u.return = t);
      u.sibling = null;
    }
    return t.child;
  }
  function wf(l, t) {
    return l.lanes & t ? !0 : ((l = l.dependencies), !!(l !== null && fn(l)));
  }
  function d1(l, t, u) {
    switch (t.tag) {
      case 3:
        ze(t, t.stateNode.containerInfo),
          au(t, El, l.memoizedState.cache),
          Qa();
        break;
      case 27:
      case 5:
        Gn(t);
        break;
      case 4:
        ze(t, t.stateNode.containerInfo);
        break;
      case 10:
        au(t, t.type, t.memoizedProps.value);
        break;
      case 13:
        var a = t.memoizedState;
        if (a !== null)
          return a.dehydrated !== null
            ? (It(t), (t.flags |= 128), null)
            : u & t.child.childLanes
            ? ys(l, t, u)
            : (It(t), (l = Bt(l, t, u)), l !== null ? l.sibling : null);
        It(t);
        break;
      case 19:
        var e = (l.flags & 128) !== 0;
        if (
          ((a = (u & t.childLanes) !== 0),
          a || (ka(l, t, u, !1), (a = (u & t.childLanes) !== 0)),
          e)
        ) {
          if (a) return hs(l, t, u);
          t.flags |= 128;
        }
        if (
          ((e = t.memoizedState),
          e !== null &&
            ((e.rendering = null), (e.tail = null), (e.lastEffect = null)),
          nl(bl, bl.current),
          a)
        )
          break;
        return null;
      case 22:
      case 23:
        return (t.lanes = 0), fs(l, t, u);
      case 24:
        au(t, El, l.memoizedState.cache);
    }
    return Bt(l, t, u);
  }
  function ms(l, t, u) {
    if (l !== null)
      if (l.memoizedProps !== t.pendingProps) Al = !0;
      else {
        if (!wf(l, u) && !(t.flags & 128)) return (Al = !1), d1(l, t, u);
        Al = !!(l.flags & 131072);
      }
    else (Al = !1), L && t.flags & 1048576 && Pi(t, xe, t.index);
    switch (((t.lanes = 0), t.tag)) {
      case 16:
        l: {
          l = t.pendingProps;
          var a = t.elementType,
            e = a._init;
          if (((a = e(a._payload)), (t.type = a), typeof a == "function"))
            cc(a)
              ? ((l = Nu(a, l)), (t.tag = 1), (t = ss(null, t, a, l, u)))
              : ((t.tag = 0), (t = Zf(null, t, a, l, u)));
          else {
            if (a != null) {
              if (((e = a.$$typeof), e === Ql)) {
                (t.tag = 11), (t = as(null, t, a, l, u));
                break l;
              } else if (e === _t) {
                (t.tag = 14), (t = es(null, t, a, l, u));
                break l;
              }
            }
            throw ((t = wt(a) || a), Error(o(306, t, "")));
          }
        }
        return t;
      case 0:
        return Zf(l, t, t.type, t.pendingProps, u);
      case 1:
        return (a = t.type), (e = Nu(a, t.pendingProps)), ss(l, t, a, e, u);
      case 3:
        l: {
          if ((ze(t, t.stateNode.containerInfo), l === null))
            throw Error(o(387));
          var n = t.pendingProps;
          (e = t.memoizedState), (a = e.element), Pf(l, t), Ia(t, n, null, u);
          var f = t.memoizedState;
          if (
            ((n = f.cache),
            au(t, El, n),
            n !== e.cache && kf(t, [El], u, !0),
            Pa(),
            (n = f.element),
            e.isDehydrated)
          )
            if (
              ((e = { element: n, isDehydrated: !1, cache: f.cache }),
              (t.updateQueue.baseState = e),
              (t.memoizedState = e),
              t.flags & 256)
            ) {
              t = vs(l, t, n, u);
              break l;
            } else if (n !== a) {
              (a = at(Error(o(424)), t)), Za(a), (t = vs(l, t, n, u));
              break l;
            } else
              for (
                Ml = St(t.stateNode.containerInfo.firstChild),
                  Gl = t,
                  L = !0,
                  mt = null,
                  Et = !0,
                  u = c0(t, null, n, u),
                  t.child = u;
                u;

              )
                (u.flags = (u.flags & -3) | 4096), (u = u.sibling);
          else {
            if ((Qa(), n === a)) {
              t = Bt(l, t, u);
              break l;
            }
            Ul(l, t, n, u);
          }
          t = t.child;
        }
        return t;
      case 26:
        return (
          $a(l, t),
          l === null
            ? (u = gv(t.type, null, t.pendingProps, null))
              ? (t.memoizedState = u)
              : L ||
                ((u = t.type),
                (l = t.pendingProps),
                (a = An(Wt.current).createElement(u)),
                (a[Hl] = t),
                (a[Cl] = l),
                Rl(a, u, l),
                zl(a),
                (t.stateNode = a))
            : (t.memoizedState = gv(
                t.type,
                l.memoizedProps,
                t.pendingProps,
                l.memoizedState
              )),
          null
        );
      case 27:
        return (
          Gn(t),
          l === null &&
            L &&
            ((a = t.stateNode = mv(t.type, t.pendingProps, Wt.current)),
            (Gl = t),
            (Et = !0),
            (Ml = St(a.firstChild))),
          (a = t.pendingProps.children),
          l !== null || L ? Ul(l, t, a, u) : (t.child = Mu(t, null, a, u)),
          $a(l, t),
          t.child
        );
      case 5:
        return (
          l === null &&
            L &&
            ((e = a = Ml) &&
              ((a = V1(a, t.type, t.pendingProps, Et)),
              a !== null
                ? ((t.stateNode = a),
                  (Gl = t),
                  (Ml = St(a.firstChild)),
                  (Et = !1),
                  (e = !0))
                : (e = !1)),
            e || Du(t)),
          Gn(t),
          (e = t.type),
          (n = t.pendingProps),
          (f = l !== null ? l.memoizedProps : null),
          (a = n.children),
          Yc(e, n) ? (a = null) : f !== null && Yc(e, f) && (t.flags |= 32),
          t.memoizedState !== null &&
            ((e = Tf(l, t, n1, null, null, u)), (me._currentValue = e)),
          $a(l, t),
          Ul(l, t, a, u),
          t.child
        );
      case 6:
        return (
          l === null &&
            L &&
            ((l = u = Ml) &&
              ((u = x1(u, t.pendingProps, Et)),
              u !== null
                ? ((t.stateNode = u), (Gl = t), (Ml = null), (l = !0))
                : (l = !1)),
            l || Du(t)),
          null
        );
      case 13:
        return ys(l, t, u);
      case 4:
        return (
          ze(t, t.stateNode.containerInfo),
          (a = t.pendingProps),
          l === null ? (t.child = Mu(t, null, a, u)) : Ul(l, t, a, u),
          t.child
        );
      case 11:
        return as(l, t, t.type, t.pendingProps, u);
      case 7:
        return Ul(l, t, t.pendingProps, u), t.child;
      case 8:
        return Ul(l, t, t.pendingProps.children, u), t.child;
      case 12:
        return Ul(l, t, t.pendingProps.children, u), t.child;
      case 10:
        return (
          (a = t.pendingProps),
          au(t, t.type, a.value),
          Ul(l, t, a.children, u),
          t.child
        );
      case 9:
        return (
          (e = t.type._context),
          (a = t.pendingProps.children),
          Bu(t),
          (e = ql(e)),
          (a = a(e)),
          (t.flags |= 1),
          Ul(l, t, a, u),
          t.child
        );
      case 14:
        return es(l, t, t.type, t.pendingProps, u);
      case 15:
        return ns(l, t, t.type, t.pendingProps, u);
      case 19:
        return hs(l, t, u);
      case 22:
        return fs(l, t, u);
      case 24:
        return (
          Bu(t),
          (a = ql(El)),
          l === null
            ? ((e = bf()),
              e === null &&
                ((e = tl),
                (n = gf()),
                (e.pooledCache = n),
                n.refCount++,
                n !== null && (e.pooledCacheLanes |= u),
                (e = n)),
              (t.memoizedState = { parent: a, cache: e }),
              Ff(t),
              au(t, El, e))
            : (l.lanes & u && (Pf(l, t), Ia(t, null, null, u), Pa()),
              (e = l.memoizedState),
              (n = t.memoizedState),
              e.parent !== a
                ? ((e = { parent: a, cache: a }),
                  (t.memoizedState = e),
                  t.lanes === 0 &&
                    (t.memoizedState = t.updateQueue.baseState = e),
                  au(t, El, a))
                : ((a = n.cache),
                  au(t, El, a),
                  a !== e.cache && kf(t, [El], u, !0))),
          Ul(l, t, t.pendingProps.children, u),
          t.child
        );
      case 29:
        throw t.pendingProps;
    }
    throw Error(o(156, t.tag));
  }
  var Wf = $(null),
    Yu = null,
    pt = null;
  function au(l, t, u) {
    nl(Wf, t._currentValue), (t._currentValue = u);
  }
  function Gt(l) {
    (l._currentValue = Wf.current), ml(Wf);
  }
  function $f(l, t, u) {
    for (; l !== null; ) {
      var a = l.alternate;
      if (
        ((l.childLanes & t) !== t
          ? ((l.childLanes |= t), a !== null && (a.childLanes |= t))
          : a !== null && (a.childLanes & t) !== t && (a.childLanes |= t),
        l === u)
      )
        break;
      l = l.return;
    }
  }
  function kf(l, t, u, a) {
    var e = l.child;
    for (e !== null && (e.return = l); e !== null; ) {
      var n = e.dependencies;
      if (n !== null) {
        var f = e.child;
        n = n.firstContext;
        l: for (; n !== null; ) {
          var c = n;
          n = e;
          for (var i = 0; i < t.length; i++)
            if (c.context === t[i]) {
              (n.lanes |= u),
                (c = n.alternate),
                c !== null && (c.lanes |= u),
                $f(n.return, u, l),
                a || (f = null);
              break l;
            }
          n = c.next;
        }
      } else if (e.tag === 18) {
        if (((f = e.return), f === null)) throw Error(o(341));
        (f.lanes |= u),
          (n = f.alternate),
          n !== null && (n.lanes |= u),
          $f(f, u, l),
          (f = null);
      } else f = e.child;
      if (f !== null) f.return = e;
      else
        for (f = e; f !== null; ) {
          if (f === l) {
            f = null;
            break;
          }
          if (((e = f.sibling), e !== null)) {
            (e.return = f.return), (f = e);
            break;
          }
          f = f.return;
        }
      e = f;
    }
  }
  function ka(l, t, u, a) {
    l = null;
    for (var e = t, n = !1; e !== null; ) {
      if (!n) {
        if (e.flags & 524288) n = !0;
        else if (e.flags & 262144) break;
      }
      if (e.tag === 10) {
        var f = e.alternate;
        if (f === null) throw Error(o(387));
        if (((f = f.memoizedProps), f !== null)) {
          var c = e.type;
          wl(e.pendingProps.value, f.value) ||
            (l !== null ? l.push(c) : (l = [c]));
        }
      } else if (e === Te.current) {
        if (((f = e.alternate), f === null)) throw Error(o(387));
        f.memoizedState.memoizedState !== e.memoizedState.memoizedState &&
          (l !== null ? l.push(me) : (l = [me]));
      }
      e = e.return;
    }
    l !== null && kf(t, l, u, a), (t.flags |= 262144);
  }
  function fn(l) {
    for (l = l.firstContext; l !== null; ) {
      if (!wl(l.context._currentValue, l.memoizedValue)) return !0;
      l = l.next;
    }
    return !1;
  }
  function Bu(l) {
    (Yu = l),
      (pt = null),
      (l = l.dependencies),
      l !== null && (l.firstContext = null);
  }
  function ql(l) {
    return os(Yu, l);
  }
  function cn(l, t) {
    return Yu === null && Bu(l), os(l, t);
  }
  function os(l, t) {
    var u = t._currentValue;
    if (((t = { context: t, memoizedValue: u, next: null }), pt === null)) {
      if (l === null) throw Error(o(308));
      (pt = t),
        (l.dependencies = { lanes: 0, firstContext: t }),
        (l.flags |= 524288);
    } else pt = pt.next = t;
    return u;
  }
  var eu = !1;
  function Ff(l) {
    l.updateQueue = {
      baseState: l.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null,
    };
  }
  function Pf(l, t) {
    (l = l.updateQueue),
      t.updateQueue === l &&
        (t.updateQueue = {
          baseState: l.baseState,
          firstBaseUpdate: l.firstBaseUpdate,
          lastBaseUpdate: l.lastBaseUpdate,
          shared: l.shared,
          callbacks: null,
        });
  }
  function nu(l) {
    return { lane: l, tag: 0, payload: null, callback: null, next: null };
  }
  function fu(l, t, u) {
    var a = l.updateQueue;
    if (a === null) return null;
    if (((a = a.shared), cl & 2)) {
      var e = a.pending;
      return (
        e === null ? (t.next = t) : ((t.next = e.next), (e.next = t)),
        (a.pending = t),
        (t = Ce(l)),
        ki(l, null, u),
        t
      );
    }
    return je(l, a, t, u), Ce(l);
  }
  function Fa(l, t, u) {
    if (
      ((t = t.updateQueue), t !== null && ((t = t.shared), (u & 4194176) !== 0))
    ) {
      var a = t.lanes;
      (a &= l.pendingLanes), (u |= a), (t.lanes = u), ei(l, u);
    }
  }
  function If(l, t) {
    var u = l.updateQueue,
      a = l.alternate;
    if (a !== null && ((a = a.updateQueue), u === a)) {
      var e = null,
        n = null;
      if (((u = u.firstBaseUpdate), u !== null)) {
        do {
          var f = {
            lane: u.lane,
            tag: u.tag,
            payload: u.payload,
            callback: null,
            next: null,
          };
          n === null ? (e = n = f) : (n = n.next = f), (u = u.next);
        } while (u !== null);
        n === null ? (e = n = t) : (n = n.next = t);
      } else e = n = t;
      (u = {
        baseState: a.baseState,
        firstBaseUpdate: e,
        lastBaseUpdate: n,
        shared: a.shared,
        callbacks: a.callbacks,
      }),
        (l.updateQueue = u);
      return;
    }
    (l = u.lastBaseUpdate),
      l === null ? (u.firstBaseUpdate = t) : (l.next = t),
      (u.lastBaseUpdate = t);
  }
  var lc = !1;
  function Pa() {
    if (lc) {
      var l = na;
      if (l !== null) throw l;
    }
  }
  function Ia(l, t, u, a) {
    lc = !1;
    var e = l.updateQueue;
    eu = !1;
    var n = e.firstBaseUpdate,
      f = e.lastBaseUpdate,
      c = e.shared.pending;
    if (c !== null) {
      e.shared.pending = null;
      var i = c,
        y = i.next;
      (i.next = null), f === null ? (n = y) : (f.next = y), (f = i);
      var g = l.alternate;
      g !== null &&
        ((g = g.updateQueue),
        (c = g.lastBaseUpdate),
        c !== f &&
          (c === null ? (g.firstBaseUpdate = y) : (c.next = y),
          (g.lastBaseUpdate = i)));
    }
    if (n !== null) {
      var b = e.baseState;
      (f = 0), (g = y = i = null), (c = n);
      do {
        var m = c.lane & -536870913,
          S = m !== c.lane;
        if (S ? (x & m) === m : (a & m) === m) {
          m !== 0 && m === ea && (lc = !0),
            g !== null &&
              (g = g.next =
                {
                  lane: 0,
                  tag: c.tag,
                  payload: c.payload,
                  callback: null,
                  next: null,
                });
          l: {
            var D = l,
              B = c;
            m = t;
            var vl = u;
            switch (B.tag) {
              case 1:
                if (((D = B.payload), typeof D == "function")) {
                  b = D.call(vl, b, m);
                  break l;
                }
                b = D;
                break l;
              case 3:
                D.flags = (D.flags & -65537) | 128;
              case 0:
                if (
                  ((D = B.payload),
                  (m = typeof D == "function" ? D.call(vl, b, m) : D),
                  m == null)
                )
                  break l;
                b = W({}, b, m);
                break l;
              case 2:
                eu = !0;
            }
          }
          (m = c.callback),
            m !== null &&
              ((l.flags |= 64),
              S && (l.flags |= 8192),
              (S = e.callbacks),
              S === null ? (e.callbacks = [m]) : S.push(m));
        } else
          (S = {
            lane: m,
            tag: c.tag,
            payload: c.payload,
            callback: c.callback,
            next: null,
          }),
            g === null ? ((y = g = S), (i = b)) : (g = g.next = S),
            (f |= m);
        if (((c = c.next), c === null)) {
          if (((c = e.shared.pending), c === null)) break;
          (S = c),
            (c = S.next),
            (S.next = null),
            (e.lastBaseUpdate = S),
            (e.shared.pending = null);
        }
      } while (!0);
      g === null && (i = b),
        (e.baseState = i),
        (e.firstBaseUpdate = y),
        (e.lastBaseUpdate = g),
        n === null && (e.shared.lanes = 0),
        (yu |= f),
        (l.lanes = f),
        (l.memoizedState = b);
    }
  }
  function Ss(l, t) {
    if (typeof l != "function") throw Error(o(191, l));
    l.call(t);
  }
  function gs(l, t) {
    var u = l.callbacks;
    if (u !== null)
      for (l.callbacks = null, l = 0; l < u.length; l++) Ss(u[l], t);
  }
  function le(l, t) {
    try {
      var u = t.updateQueue,
        a = u !== null ? u.lastEffect : null;
      if (a !== null) {
        var e = a.next;
        u = e;
        do {
          if ((u.tag & l) === l) {
            a = void 0;
            var n = u.create,
              f = u.inst;
            (a = n()), (f.destroy = a);
          }
          u = u.next;
        } while (u !== e);
      }
    } catch (c) {
      I(t, t.return, c);
    }
  }
  function cu(l, t, u) {
    try {
      var a = t.updateQueue,
        e = a !== null ? a.lastEffect : null;
      if (e !== null) {
        var n = e.next;
        a = n;
        do {
          if ((a.tag & l) === l) {
            var f = a.inst,
              c = f.destroy;
            if (c !== void 0) {
              (f.destroy = void 0), (e = t);
              var i = u;
              try {
                c();
              } catch (y) {
                I(e, i, y);
              }
            }
          }
          a = a.next;
        } while (a !== n);
      }
    } catch (y) {
      I(t, t.return, y);
    }
  }
  function rs(l) {
    var t = l.updateQueue;
    if (t !== null) {
      var u = l.stateNode;
      try {
        gs(t, u);
      } catch (a) {
        I(l, l.return, a);
      }
    }
  }
  function bs(l, t, u) {
    (u.props = Nu(l.type, l.memoizedProps)), (u.state = l.memoizedState);
    try {
      u.componentWillUnmount();
    } catch (a) {
      I(l, t, a);
    }
  }
  function pu(l, t) {
    try {
      var u = l.ref;
      if (u !== null) {
        var a = l.stateNode;
        switch (l.tag) {
          case 26:
          case 27:
          case 5:
            var e = a;
            break;
          default:
            e = a;
        }
        typeof u == "function" ? (l.refCleanup = u(e)) : (u.current = e);
      }
    } catch (n) {
      I(l, t, n);
    }
  }
  function Wl(l, t) {
    var u = l.ref,
      a = l.refCleanup;
    if (u !== null)
      if (typeof a == "function")
        try {
          a();
        } catch (e) {
          I(l, t, e);
        } finally {
          (l.refCleanup = null),
            (l = l.alternate),
            l != null && (l.refCleanup = null);
        }
      else if (typeof u == "function")
        try {
          u(null);
        } catch (e) {
          I(l, t, e);
        }
      else u.current = null;
  }
  function Es(l) {
    var t = l.type,
      u = l.memoizedProps,
      a = l.stateNode;
    try {
      l: switch (t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          u.autoFocus && a.focus();
          break l;
        case "img":
          u.src ? (a.src = u.src) : u.srcSet && (a.srcset = u.srcSet);
      }
    } catch (e) {
      I(l, l.return, e);
    }
  }
  function Ts(l, t, u) {
    try {
      var a = l.stateNode;
      X1(a, l.type, u, t), (a[Cl] = t);
    } catch (e) {
      I(l, l.return, e);
    }
  }
  function zs(l) {
    return (
      l.tag === 5 || l.tag === 3 || l.tag === 26 || l.tag === 27 || l.tag === 4
    );
  }
  function tc(l) {
    l: for (;;) {
      for (; l.sibling === null; ) {
        if (l.return === null || zs(l.return)) return null;
        l = l.return;
      }
      for (
        l.sibling.return = l.return, l = l.sibling;
        l.tag !== 5 && l.tag !== 6 && l.tag !== 27 && l.tag !== 18;

      ) {
        if (l.flags & 2 || l.child === null || l.tag === 4) continue l;
        (l.child.return = l), (l = l.child);
      }
      if (!(l.flags & 2)) return l.stateNode;
    }
  }
  function uc(l, t, u) {
    var a = l.tag;
    if (a === 5 || a === 6)
      (l = l.stateNode),
        t
          ? u.nodeType === 8
            ? u.parentNode.insertBefore(l, t)
            : u.insertBefore(l, t)
          : (u.nodeType === 8
              ? ((t = u.parentNode), t.insertBefore(l, u))
              : ((t = u), t.appendChild(l)),
            (u = u._reactRootContainer),
            u != null || t.onclick !== null || (t.onclick = zn));
    else if (a !== 4 && a !== 27 && ((l = l.child), l !== null))
      for (uc(l, t, u), l = l.sibling; l !== null; )
        uc(l, t, u), (l = l.sibling);
  }
  function sn(l, t, u) {
    var a = l.tag;
    if (a === 5 || a === 6)
      (l = l.stateNode), t ? u.insertBefore(l, t) : u.appendChild(l);
    else if (a !== 4 && a !== 27 && ((l = l.child), l !== null))
      for (sn(l, t, u), l = l.sibling; l !== null; )
        sn(l, t, u), (l = l.sibling);
  }
  var Xt = !1,
    il = !1,
    ac = !1,
    As = typeof WeakSet == "function" ? WeakSet : Set,
    Ol = null,
    Os = !1;
  function h1(l, t) {
    if (((l = l.containerInfo), (qc = Rn), (l = Ci(l)), ef(l))) {
      if ("selectionStart" in l)
        var u = { start: l.selectionStart, end: l.selectionEnd };
      else
        l: {
          u = ((u = l.ownerDocument) && u.defaultView) || window;
          var a = u.getSelection && u.getSelection();
          if (a && a.rangeCount !== 0) {
            u = a.anchorNode;
            var e = a.anchorOffset,
              n = a.focusNode;
            a = a.focusOffset;
            try {
              u.nodeType, n.nodeType;
            } catch {
              u = null;
              break l;
            }
            var f = 0,
              c = -1,
              i = -1,
              y = 0,
              g = 0,
              b = l,
              m = null;
            t: for (;;) {
              for (
                var S;
                b !== u || (e !== 0 && b.nodeType !== 3) || (c = f + e),
                  b !== n || (a !== 0 && b.nodeType !== 3) || (i = f + a),
                  b.nodeType === 3 && (f += b.nodeValue.length),
                  (S = b.firstChild) !== null;

              )
                (m = b), (b = S);
              for (;;) {
                if (b === l) break t;
                if (
                  (m === u && ++y === e && (c = f),
                  m === n && ++g === a && (i = f),
                  (S = b.nextSibling) !== null)
                )
                  break;
                (b = m), (m = b.parentNode);
              }
              b = S;
            }
            u = c === -1 || i === -1 ? null : { start: c, end: i };
          } else u = null;
        }
      u = u || { start: 0, end: 0 };
    } else u = null;
    for (
      Nc = { focusedElem: l, selectionRange: u }, Rn = !1, Ol = t;
      Ol !== null;

    )
      if (
        ((t = Ol), (l = t.child), (t.subtreeFlags & 1028) !== 0 && l !== null)
      )
        (l.return = t), (Ol = l);
      else
        for (; Ol !== null; ) {
          switch (((t = Ol), (n = t.alternate), (l = t.flags), t.tag)) {
            case 0:
              break;
            case 11:
            case 15:
              break;
            case 1:
              if (l & 1024 && n !== null) {
                (l = void 0),
                  (u = t),
                  (e = n.memoizedProps),
                  (n = n.memoizedState),
                  (a = u.stateNode);
                try {
                  var D = Nu(u.type, e, u.elementType === u.type);
                  (l = a.getSnapshotBeforeUpdate(D, n)),
                    (a.__reactInternalSnapshotBeforeUpdate = l);
                } catch (B) {
                  I(u, u.return, B);
                }
              }
              break;
            case 3:
              if (l & 1024) {
                if (
                  ((l = t.stateNode.containerInfo), (u = l.nodeType), u === 9)
                )
                  Gc(l);
                else if (u === 1)
                  switch (l.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      Gc(l);
                      break;
                    default:
                      l.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if (l & 1024) throw Error(o(163));
          }
          if (((l = t.sibling), l !== null)) {
            (l.return = t.return), (Ol = l);
            break;
          }
          Ol = t.return;
        }
    return (D = Os), (Os = !1), D;
  }
  function _s(l, t, u) {
    var a = u.flags;
    switch (u.tag) {
      case 0:
      case 11:
      case 15:
        Zt(l, u), a & 4 && le(5, u);
        break;
      case 1:
        if ((Zt(l, u), a & 4))
          if (((l = u.stateNode), t === null))
            try {
              l.componentDidMount();
            } catch (c) {
              I(u, u.return, c);
            }
          else {
            var e = Nu(u.type, t.memoizedProps);
            t = t.memoizedState;
            try {
              l.componentDidUpdate(e, t, l.__reactInternalSnapshotBeforeUpdate);
            } catch (c) {
              I(u, u.return, c);
            }
          }
        a & 64 && rs(u), a & 512 && pu(u, u.return);
        break;
      case 3:
        if ((Zt(l, u), a & 64 && ((a = u.updateQueue), a !== null))) {
          if (((l = null), u.child !== null))
            switch (u.child.tag) {
              case 27:
              case 5:
                l = u.child.stateNode;
                break;
              case 1:
                l = u.child.stateNode;
            }
          try {
            gs(a, l);
          } catch (c) {
            I(u, u.return, c);
          }
        }
        break;
      case 26:
        Zt(l, u), a & 512 && pu(u, u.return);
        break;
      case 27:
      case 5:
        Zt(l, u), t === null && a & 4 && Es(u), a & 512 && pu(u, u.return);
        break;
      case 12:
        Zt(l, u);
        break;
      case 13:
        Zt(l, u), a & 4 && Us(l, u);
        break;
      case 22:
        if (((e = u.memoizedState !== null || Xt), !e)) {
          t = (t !== null && t.memoizedState !== null) || il;
          var n = Xt,
            f = il;
          (Xt = e),
            (il = t) && !f ? iu(l, u, (u.subtreeFlags & 8772) !== 0) : Zt(l, u),
            (Xt = n),
            (il = f);
        }
        a & 512 &&
          (u.memoizedProps.mode === "manual"
            ? pu(u, u.return)
            : Wl(u, u.return));
        break;
      default:
        Zt(l, u);
    }
  }
  function Ds(l) {
    var t = l.alternate;
    t !== null && ((l.alternate = null), Ds(t)),
      (l.child = null),
      (l.deletions = null),
      (l.sibling = null),
      l.tag === 5 && ((t = l.stateNode), t !== null && Vn(t)),
      (l.stateNode = null),
      (l.return = null),
      (l.dependencies = null),
      (l.memoizedProps = null),
      (l.memoizedState = null),
      (l.pendingProps = null),
      (l.stateNode = null),
      (l.updateQueue = null);
  }
  var gl = null,
    $l = !1;
  function Qt(l, t, u) {
    for (u = u.child; u !== null; ) Ms(l, t, u), (u = u.sibling);
  }
  function Ms(l, t, u) {
    if (Kl && typeof Kl.onCommitFiberUnmount == "function")
      try {
        Kl.onCommitFiberUnmount(Aa, u);
      } catch {}
    switch (u.tag) {
      case 26:
        il || Wl(u, t),
          Qt(l, t, u),
          u.memoizedState
            ? u.memoizedState.count--
            : u.stateNode && ((u = u.stateNode), u.parentNode.removeChild(u));
        break;
      case 27:
        il || Wl(u, t);
        var a = gl,
          e = $l;
        for (
          gl = u.stateNode, Qt(l, t, u), u = u.stateNode, t = u.attributes;
          t.length;

        )
          u.removeAttributeNode(t[0]);
        Vn(u), (gl = a), ($l = e);
        break;
      case 5:
        il || Wl(u, t);
      case 6:
        e = gl;
        var n = $l;
        if (((gl = null), Qt(l, t, u), (gl = e), ($l = n), gl !== null))
          if ($l)
            try {
              (l = gl),
                (a = u.stateNode),
                l.nodeType === 8
                  ? l.parentNode.removeChild(a)
                  : l.removeChild(a);
            } catch (f) {
              I(u, t, f);
            }
          else
            try {
              gl.removeChild(u.stateNode);
            } catch (f) {
              I(u, t, f);
            }
        break;
      case 18:
        gl !== null &&
          ($l
            ? ((t = gl),
              (u = u.stateNode),
              t.nodeType === 8
                ? pc(t.parentNode, u)
                : t.nodeType === 1 && pc(t, u),
              re(t))
            : pc(gl, u.stateNode));
        break;
      case 4:
        (a = gl),
          (e = $l),
          (gl = u.stateNode.containerInfo),
          ($l = !0),
          Qt(l, t, u),
          (gl = a),
          ($l = e);
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        il || cu(2, u, t), il || cu(4, u, t), Qt(l, t, u);
        break;
      case 1:
        il ||
          (Wl(u, t),
          (a = u.stateNode),
          typeof a.componentWillUnmount == "function" && bs(u, t, a)),
          Qt(l, t, u);
        break;
      case 21:
        Qt(l, t, u);
        break;
      case 22:
        il || Wl(u, t),
          (il = (a = il) || u.memoizedState !== null),
          Qt(l, t, u),
          (il = a);
        break;
      default:
        Qt(l, t, u);
    }
  }
  function Us(l, t) {
    if (
      t.memoizedState === null &&
      ((l = t.alternate),
      l !== null &&
        ((l = l.memoizedState), l !== null && ((l = l.dehydrated), l !== null)))
    )
      try {
        re(l);
      } catch (u) {
        I(t, t.return, u);
      }
  }
  function m1(l) {
    switch (l.tag) {
      case 13:
      case 19:
        var t = l.stateNode;
        return t === null && (t = l.stateNode = new As()), t;
      case 22:
        return (
          (l = l.stateNode),
          (t = l._retryCache),
          t === null && (t = l._retryCache = new As()),
          t
        );
      default:
        throw Error(o(435, l.tag));
    }
  }
  function ec(l, t) {
    var u = m1(l);
    t.forEach(function (a) {
      var e = M1.bind(null, l, a);
      u.has(a) || (u.add(a), a.then(e, e));
    });
  }
  function ct(l, t) {
    var u = t.deletions;
    if (u !== null)
      for (var a = 0; a < u.length; a++) {
        var e = u[a],
          n = l,
          f = t,
          c = f;
        l: for (; c !== null; ) {
          switch (c.tag) {
            case 27:
            case 5:
              (gl = c.stateNode), ($l = !1);
              break l;
            case 3:
              (gl = c.stateNode.containerInfo), ($l = !0);
              break l;
            case 4:
              (gl = c.stateNode.containerInfo), ($l = !0);
              break l;
          }
          c = c.return;
        }
        if (gl === null) throw Error(o(160));
        Ms(n, f, e),
          (gl = null),
          ($l = !1),
          (n = e.alternate),
          n !== null && (n.return = null),
          (e.return = null);
      }
    if (t.subtreeFlags & 13878)
      for (t = t.child; t !== null; ) Rs(t, l), (t = t.sibling);
  }
  var ot = null;
  function Rs(l, t) {
    var u = l.alternate,
      a = l.flags;
    switch (l.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        ct(t, l),
          it(l),
          a & 4 && (cu(3, l, l.return), le(3, l), cu(5, l, l.return));
        break;
      case 1:
        ct(t, l),
          it(l),
          a & 512 && (il || u === null || Wl(u, u.return)),
          a & 64 &&
            Xt &&
            ((l = l.updateQueue),
            l !== null &&
              ((a = l.callbacks),
              a !== null &&
                ((u = l.shared.hiddenCallbacks),
                (l.shared.hiddenCallbacks = u === null ? a : u.concat(a)))));
        break;
      case 26:
        var e = ot;
        if (
          (ct(t, l),
          it(l),
          a & 512 && (il || u === null || Wl(u, u.return)),
          a & 4)
        ) {
          var n = u !== null ? u.memoizedState : null;
          if (((a = l.memoizedState), u === null))
            if (a === null)
              if (l.stateNode === null) {
                l: {
                  (a = l.type),
                    (u = l.memoizedProps),
                    (e = e.ownerDocument || e);
                  t: switch (a) {
                    case "title":
                      (n = e.getElementsByTagName("title")[0]),
                        (!n ||
                          n[Da] ||
                          n[Hl] ||
                          n.namespaceURI === "http://www.w3.org/2000/svg" ||
                          n.hasAttribute("itemprop")) &&
                          ((n = e.createElement(a)),
                          e.head.insertBefore(
                            n,
                            e.querySelector("head > title")
                          )),
                        Rl(n, a, u),
                        (n[Hl] = l),
                        zl(n),
                        (a = n);
                      break l;
                    case "link":
                      var f = Ev("link", "href", e).get(a + (u.href || ""));
                      if (f) {
                        for (var c = 0; c < f.length; c++)
                          if (
                            ((n = f[c]),
                            n.getAttribute("href") ===
                              (u.href == null ? null : u.href) &&
                              n.getAttribute("rel") ===
                                (u.rel == null ? null : u.rel) &&
                              n.getAttribute("title") ===
                                (u.title == null ? null : u.title) &&
                              n.getAttribute("crossorigin") ===
                                (u.crossOrigin == null ? null : u.crossOrigin))
                          ) {
                            f.splice(c, 1);
                            break t;
                          }
                      }
                      (n = e.createElement(a)),
                        Rl(n, a, u),
                        e.head.appendChild(n);
                      break;
                    case "meta":
                      if (
                        (f = Ev("meta", "content", e).get(
                          a + (u.content || "")
                        ))
                      ) {
                        for (c = 0; c < f.length; c++)
                          if (
                            ((n = f[c]),
                            n.getAttribute("content") ===
                              (u.content == null ? null : "" + u.content) &&
                              n.getAttribute("name") ===
                                (u.name == null ? null : u.name) &&
                              n.getAttribute("property") ===
                                (u.property == null ? null : u.property) &&
                              n.getAttribute("http-equiv") ===
                                (u.httpEquiv == null ? null : u.httpEquiv) &&
                              n.getAttribute("charset") ===
                                (u.charSet == null ? null : u.charSet))
                          ) {
                            f.splice(c, 1);
                            break t;
                          }
                      }
                      (n = e.createElement(a)),
                        Rl(n, a, u),
                        e.head.appendChild(n);
                      break;
                    default:
                      throw Error(o(468, a));
                  }
                  (n[Hl] = l), zl(n), (a = n);
                }
                l.stateNode = a;
              } else Tv(e, l.type, l.stateNode);
            else l.stateNode = bv(e, a, l.memoizedProps);
          else
            n !== a
              ? (n === null
                  ? u.stateNode !== null &&
                    ((u = u.stateNode), u.parentNode.removeChild(u))
                  : n.count--,
                a === null
                  ? Tv(e, l.type, l.stateNode)
                  : bv(e, a, l.memoizedProps))
              : a === null &&
                l.stateNode !== null &&
                Ts(l, l.memoizedProps, u.memoizedProps);
        }
        break;
      case 27:
        if (a & 4 && l.alternate === null) {
          (e = l.stateNode), (n = l.memoizedProps);
          try {
            for (var i = e.firstChild; i; ) {
              var y = i.nextSibling,
                g = i.nodeName;
              i[Da] ||
                g === "HEAD" ||
                g === "BODY" ||
                g === "SCRIPT" ||
                g === "STYLE" ||
                (g === "LINK" && i.rel.toLowerCase() === "stylesheet") ||
                e.removeChild(i),
                (i = y);
            }
            for (var b = l.type, m = e.attributes; m.length; )
              e.removeAttributeNode(m[0]);
            Rl(e, b, n), (e[Hl] = l), (e[Cl] = n);
          } catch (D) {
            I(l, l.return, D);
          }
        }
      case 5:
        if (
          (ct(t, l),
          it(l),
          a & 512 && (il || u === null || Wl(u, u.return)),
          l.flags & 32)
        ) {
          e = l.stateNode;
          try {
            Ju(e, "");
          } catch (D) {
            I(l, l.return, D);
          }
        }
        a & 4 &&
          l.stateNode != null &&
          ((e = l.memoizedProps), Ts(l, e, u !== null ? u.memoizedProps : e)),
          a & 1024 && (ac = !0);
        break;
      case 6:
        if ((ct(t, l), it(l), a & 4)) {
          if (l.stateNode === null) throw Error(o(162));
          (a = l.memoizedProps), (u = l.stateNode);
          try {
            u.nodeValue = a;
          } catch (D) {
            I(l, l.return, D);
          }
        }
        break;
      case 3:
        if (
          ((Dn = null),
          (e = ot),
          (ot = On(t.containerInfo)),
          ct(t, l),
          (ot = e),
          it(l),
          a & 4 && u !== null && u.memoizedState.isDehydrated)
        )
          try {
            re(t.containerInfo);
          } catch (D) {
            I(l, l.return, D);
          }
        ac && ((ac = !1), Hs(l));
        break;
      case 4:
        (a = ot),
          (ot = On(l.stateNode.containerInfo)),
          ct(t, l),
          it(l),
          (ot = a);
        break;
      case 12:
        ct(t, l), it(l);
        break;
      case 13:
        ct(t, l),
          it(l),
          l.child.flags & 8192 &&
            (l.memoizedState !== null) !=
              (u !== null && u.memoizedState !== null) &&
            (hc = bt()),
          a & 4 &&
            ((a = l.updateQueue),
            a !== null && ((l.updateQueue = null), ec(l, a)));
        break;
      case 22:
        if (
          (a & 512 && (il || u === null || Wl(u, u.return)),
          (i = l.memoizedState !== null),
          (y = u !== null && u.memoizedState !== null),
          (g = Xt),
          (b = il),
          (Xt = g || i),
          (il = b || y),
          ct(t, l),
          (il = b),
          (Xt = g),
          it(l),
          (t = l.stateNode),
          (t._current = l),
          (t._visibility &= -3),
          (t._visibility |= t._pendingVisibility & 2),
          a & 8192 &&
            ((t._visibility = i ? t._visibility & -2 : t._visibility | 1),
            i && ((t = Xt || il), u === null || y || t || sa(l)),
            l.memoizedProps === null || l.memoizedProps.mode !== "manual"))
        )
          l: for (u = null, t = l; ; ) {
            if (t.tag === 5 || t.tag === 26 || t.tag === 27) {
              if (u === null) {
                y = u = t;
                try {
                  if (((e = y.stateNode), i))
                    (n = e.style),
                      typeof n.setProperty == "function"
                        ? n.setProperty("display", "none", "important")
                        : (n.display = "none");
                  else {
                    (f = y.stateNode), (c = y.memoizedProps.style);
                    var S =
                      c != null && c.hasOwnProperty("display")
                        ? c.display
                        : null;
                    f.style.display =
                      S == null || typeof S == "boolean" ? "" : ("" + S).trim();
                  }
                } catch (D) {
                  I(y, y.return, D);
                }
              }
            } else if (t.tag === 6) {
              if (u === null) {
                y = t;
                try {
                  y.stateNode.nodeValue = i ? "" : y.memoizedProps;
                } catch (D) {
                  I(y, y.return, D);
                }
              }
            } else if (
              ((t.tag !== 22 && t.tag !== 23) ||
                t.memoizedState === null ||
                t === l) &&
              t.child !== null
            ) {
              (t.child.return = t), (t = t.child);
              continue;
            }
            if (t === l) break l;
            for (; t.sibling === null; ) {
              if (t.return === null || t.return === l) break l;
              u === t && (u = null), (t = t.return);
            }
            u === t && (u = null),
              (t.sibling.return = t.return),
              (t = t.sibling);
          }
        a & 4 &&
          ((a = l.updateQueue),
          a !== null &&
            ((u = a.retryQueue),
            u !== null && ((a.retryQueue = null), ec(l, u))));
        break;
      case 19:
        ct(t, l),
          it(l),
          a & 4 &&
            ((a = l.updateQueue),
            a !== null && ((l.updateQueue = null), ec(l, a)));
        break;
      case 21:
        break;
      default:
        ct(t, l), it(l);
    }
  }
  function it(l) {
    var t = l.flags;
    if (t & 2) {
      try {
        if (l.tag !== 27) {
          l: {
            for (var u = l.return; u !== null; ) {
              if (zs(u)) {
                var a = u;
                break l;
              }
              u = u.return;
            }
            throw Error(o(160));
          }
          switch (a.tag) {
            case 27:
              var e = a.stateNode,
                n = tc(l);
              sn(l, n, e);
              break;
            case 5:
              var f = a.stateNode;
              a.flags & 32 && (Ju(f, ""), (a.flags &= -33));
              var c = tc(l);
              sn(l, c, f);
              break;
            case 3:
            case 4:
              var i = a.stateNode.containerInfo,
                y = tc(l);
              uc(l, y, i);
              break;
            default:
              throw Error(o(161));
          }
        }
      } catch (g) {
        I(l, l.return, g);
      }
      l.flags &= -3;
    }
    t & 4096 && (l.flags &= -4097);
  }
  function Hs(l) {
    if (l.subtreeFlags & 1024)
      for (l = l.child; l !== null; ) {
        var t = l;
        Hs(t),
          t.tag === 5 && t.flags & 1024 && t.stateNode.reset(),
          (l = l.sibling);
      }
  }
  function Zt(l, t) {
    if (t.subtreeFlags & 8772)
      for (t = t.child; t !== null; ) _s(l, t.alternate, t), (t = t.sibling);
  }
  function sa(l) {
    for (l = l.child; l !== null; ) {
      var t = l;
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          cu(4, t, t.return), sa(t);
          break;
        case 1:
          Wl(t, t.return);
          var u = t.stateNode;
          typeof u.componentWillUnmount == "function" && bs(t, t.return, u),
            sa(t);
          break;
        case 26:
        case 27:
        case 5:
          Wl(t, t.return), sa(t);
          break;
        case 22:
          Wl(t, t.return), t.memoizedState === null && sa(t);
          break;
        default:
          sa(t);
      }
      l = l.sibling;
    }
  }
  function iu(l, t, u) {
    for (u = u && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
      var a = t.alternate,
        e = l,
        n = t,
        f = n.flags;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          iu(e, n, u), le(4, n);
          break;
        case 1:
          if (
            (iu(e, n, u),
            (a = n),
            (e = a.stateNode),
            typeof e.componentDidMount == "function")
          )
            try {
              e.componentDidMount();
            } catch (y) {
              I(a, a.return, y);
            }
          if (((a = n), (e = a.updateQueue), e !== null)) {
            var c = a.stateNode;
            try {
              var i = e.shared.hiddenCallbacks;
              if (i !== null)
                for (e.shared.hiddenCallbacks = null, e = 0; e < i.length; e++)
                  Ss(i[e], c);
            } catch (y) {
              I(a, a.return, y);
            }
          }
          u && f & 64 && rs(n), pu(n, n.return);
          break;
        case 26:
        case 27:
        case 5:
          iu(e, n, u), u && a === null && f & 4 && Es(n), pu(n, n.return);
          break;
        case 12:
          iu(e, n, u);
          break;
        case 13:
          iu(e, n, u), u && f & 4 && Us(e, n);
          break;
        case 22:
          n.memoizedState === null && iu(e, n, u), pu(n, n.return);
          break;
        default:
          iu(e, n, u);
      }
      t = t.sibling;
    }
  }
  function nc(l, t) {
    var u = null;
    l !== null &&
      l.memoizedState !== null &&
      l.memoizedState.cachePool !== null &&
      (u = l.memoizedState.cachePool.pool),
      (l = null),
      t.memoizedState !== null &&
        t.memoizedState.cachePool !== null &&
        (l = t.memoizedState.cachePool.pool),
      l !== u && (l != null && l.refCount++, u != null && La(u));
  }
  function fc(l, t) {
    (l = null),
      t.alternate !== null && (l = t.alternate.memoizedState.cache),
      (t = t.memoizedState.cache),
      t !== l && (t.refCount++, l != null && La(l));
  }
  function su(l, t, u, a) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) qs(l, t, u, a), (t = t.sibling);
  }
  function qs(l, t, u, a) {
    var e = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        su(l, t, u, a), e & 2048 && le(9, t);
        break;
      case 3:
        su(l, t, u, a),
          e & 2048 &&
            ((l = null),
            t.alternate !== null && (l = t.alternate.memoizedState.cache),
            (t = t.memoizedState.cache),
            t !== l && (t.refCount++, l != null && La(l)));
        break;
      case 12:
        if (e & 2048) {
          su(l, t, u, a), (l = t.stateNode);
          try {
            var n = t.memoizedProps,
              f = n.id,
              c = n.onPostCommit;
            typeof c == "function" &&
              c(
                f,
                t.alternate === null ? "mount" : "update",
                l.passiveEffectDuration,
                -0
              );
          } catch (i) {
            I(t, t.return, i);
          }
        } else su(l, t, u, a);
        break;
      case 23:
        break;
      case 22:
        (n = t.stateNode),
          t.memoizedState !== null
            ? n._visibility & 4
              ? su(l, t, u, a)
              : te(l, t)
            : n._visibility & 4
            ? su(l, t, u, a)
            : ((n._visibility |= 4),
              va(l, t, u, a, (t.subtreeFlags & 10256) !== 0)),
          e & 2048 && nc(t.alternate, t);
        break;
      case 24:
        su(l, t, u, a), e & 2048 && fc(t.alternate, t);
        break;
      default:
        su(l, t, u, a);
    }
  }
  function va(l, t, u, a, e) {
    for (e = e && (t.subtreeFlags & 10256) !== 0, t = t.child; t !== null; ) {
      var n = l,
        f = t,
        c = u,
        i = a,
        y = f.flags;
      switch (f.tag) {
        case 0:
        case 11:
        case 15:
          va(n, f, c, i, e), le(8, f);
          break;
        case 23:
          break;
        case 22:
          var g = f.stateNode;
          f.memoizedState !== null
            ? g._visibility & 4
              ? va(n, f, c, i, e)
              : te(n, f)
            : ((g._visibility |= 4), va(n, f, c, i, e)),
            e && y & 2048 && nc(f.alternate, f);
          break;
        case 24:
          va(n, f, c, i, e), e && y & 2048 && fc(f.alternate, f);
          break;
        default:
          va(n, f, c, i, e);
      }
      t = t.sibling;
    }
  }
  function te(l, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) {
        var u = l,
          a = t,
          e = a.flags;
        switch (a.tag) {
          case 22:
            te(u, a), e & 2048 && nc(a.alternate, a);
            break;
          case 24:
            te(u, a), e & 2048 && fc(a.alternate, a);
            break;
          default:
            te(u, a);
        }
        t = t.sibling;
      }
  }
  var ue = 8192;
  function ya(l) {
    if (l.subtreeFlags & ue)
      for (l = l.child; l !== null; ) Ns(l), (l = l.sibling);
  }
  function Ns(l) {
    switch (l.tag) {
      case 26:
        ya(l),
          l.flags & ue &&
            l.memoizedState !== null &&
            ud(ot, l.memoizedState, l.memoizedProps);
        break;
      case 5:
        ya(l);
        break;
      case 3:
      case 4:
        var t = ot;
        (ot = On(l.stateNode.containerInfo)), ya(l), (ot = t);
        break;
      case 22:
        l.memoizedState === null &&
          ((t = l.alternate),
          t !== null && t.memoizedState !== null
            ? ((t = ue), (ue = 16777216), ya(l), (ue = t))
            : ya(l));
        break;
      default:
        ya(l);
    }
  }
  function Ys(l) {
    var t = l.alternate;
    if (t !== null && ((l = t.child), l !== null)) {
      t.child = null;
      do (t = l.sibling), (l.sibling = null), (l = t);
      while (l !== null);
    }
  }
  function ae(l) {
    var t = l.deletions;
    if (l.flags & 16) {
      if (t !== null)
        for (var u = 0; u < t.length; u++) {
          var a = t[u];
          (Ol = a), ps(a, l);
        }
      Ys(l);
    }
    if (l.subtreeFlags & 10256)
      for (l = l.child; l !== null; ) Bs(l), (l = l.sibling);
  }
  function Bs(l) {
    switch (l.tag) {
      case 0:
      case 11:
      case 15:
        ae(l), l.flags & 2048 && cu(9, l, l.return);
        break;
      case 3:
        ae(l);
        break;
      case 12:
        ae(l);
        break;
      case 22:
        var t = l.stateNode;
        l.memoizedState !== null &&
        t._visibility & 4 &&
        (l.return === null || l.return.tag !== 13)
          ? ((t._visibility &= -5), vn(l))
          : ae(l);
        break;
      default:
        ae(l);
    }
  }
  function vn(l) {
    var t = l.deletions;
    if (l.flags & 16) {
      if (t !== null)
        for (var u = 0; u < t.length; u++) {
          var a = t[u];
          (Ol = a), ps(a, l);
        }
      Ys(l);
    }
    for (l = l.child; l !== null; ) {
      switch (((t = l), t.tag)) {
        case 0:
        case 11:
        case 15:
          cu(8, t, t.return), vn(t);
          break;
        case 22:
          (u = t.stateNode),
            u._visibility & 4 && ((u._visibility &= -5), vn(t));
          break;
        default:
          vn(t);
      }
      l = l.sibling;
    }
  }
  function ps(l, t) {
    for (; Ol !== null; ) {
      var u = Ol;
      switch (u.tag) {
        case 0:
        case 11:
        case 15:
          cu(8, u, t);
          break;
        case 23:
        case 22:
          if (u.memoizedState !== null && u.memoizedState.cachePool !== null) {
            var a = u.memoizedState.cachePool.pool;
            a != null && a.refCount++;
          }
          break;
        case 24:
          La(u.memoizedState.cache);
      }
      if (((a = u.child), a !== null)) (a.return = u), (Ol = a);
      else
        l: for (u = l; Ol !== null; ) {
          a = Ol;
          var e = a.sibling,
            n = a.return;
          if ((Ds(a), a === u)) {
            Ol = null;
            break l;
          }
          if (e !== null) {
            (e.return = n), (Ol = e);
            break l;
          }
          Ol = n;
        }
    }
  }
  function o1(l, t, u, a) {
    (this.tag = l),
      (this.key = u),
      (this.sibling =
        this.child =
        this.return =
        this.stateNode =
        this.type =
        this.elementType =
          null),
      (this.index = 0),
      (this.refCleanup = this.ref = null),
      (this.pendingProps = t),
      (this.dependencies =
        this.memoizedState =
        this.updateQueue =
        this.memoizedProps =
          null),
      (this.mode = a),
      (this.subtreeFlags = this.flags = 0),
      (this.deletions = null),
      (this.childLanes = this.lanes = 0),
      (this.alternate = null);
  }
  function st(l, t, u, a) {
    return new o1(l, t, u, a);
  }
  function cc(l) {
    return (l = l.prototype), !(!l || !l.isReactComponent);
  }
  function vu(l, t) {
    var u = l.alternate;
    return (
      u === null
        ? ((u = st(l.tag, t, l.key, l.mode)),
          (u.elementType = l.elementType),
          (u.type = l.type),
          (u.stateNode = l.stateNode),
          (u.alternate = l),
          (l.alternate = u))
        : ((u.pendingProps = t),
          (u.type = l.type),
          (u.flags = 0),
          (u.subtreeFlags = 0),
          (u.deletions = null)),
      (u.flags = l.flags & 31457280),
      (u.childLanes = l.childLanes),
      (u.lanes = l.lanes),
      (u.child = l.child),
      (u.memoizedProps = l.memoizedProps),
      (u.memoizedState = l.memoizedState),
      (u.updateQueue = l.updateQueue),
      (t = l.dependencies),
      (u.dependencies =
        t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
      (u.sibling = l.sibling),
      (u.index = l.index),
      (u.ref = l.ref),
      (u.refCleanup = l.refCleanup),
      u
    );
  }
  function Gs(l, t) {
    l.flags &= 31457282;
    var u = l.alternate;
    return (
      u === null
        ? ((l.childLanes = 0),
          (l.lanes = t),
          (l.child = null),
          (l.subtreeFlags = 0),
          (l.memoizedProps = null),
          (l.memoizedState = null),
          (l.updateQueue = null),
          (l.dependencies = null),
          (l.stateNode = null))
        : ((l.childLanes = u.childLanes),
          (l.lanes = u.lanes),
          (l.child = u.child),
          (l.subtreeFlags = 0),
          (l.deletions = null),
          (l.memoizedProps = u.memoizedProps),
          (l.memoizedState = u.memoizedState),
          (l.updateQueue = u.updateQueue),
          (l.type = u.type),
          (t = u.dependencies),
          (l.dependencies =
            t === null
              ? null
              : { lanes: t.lanes, firstContext: t.firstContext })),
      l
    );
  }
  function yn(l, t, u, a, e, n) {
    var f = 0;
    if (((a = l), typeof l == "function")) cc(l) && (f = 1);
    else if (typeof l == "string")
      f = ld(l, u, rt.current)
        ? 26
        : l === "html" || l === "head" || l === "body"
        ? 27
        : 5;
    else
      l: switch (l) {
        case M:
          return Gu(u.children, e, n, t);
        case E:
          (f = 8), (e |= 24);
          break;
        case J:
          return (
            (l = st(12, u, t, e | 2)), (l.elementType = J), (l.lanes = n), l
          );
        case Pl:
          return (l = st(13, u, t, e)), (l.elementType = Pl), (l.lanes = n), l;
        case Ll:
          return (l = st(19, u, t, e)), (l.elementType = Ll), (l.lanes = n), l;
        case dt:
          return Xs(u, e, n, t);
        default:
          if (typeof l == "object" && l !== null)
            switch (l.$$typeof) {
              case al:
              case hl:
                f = 10;
                break l;
              case el:
                f = 9;
                break l;
              case Ql:
                f = 11;
                break l;
              case _t:
                f = 14;
                break l;
              case Bl:
                (f = 16), (a = null);
                break l;
            }
          (f = 29),
            (u = Error(o(130, l === null ? "null" : typeof l, ""))),
            (a = null);
      }
    return (
      (t = st(f, u, t, e)), (t.elementType = l), (t.type = a), (t.lanes = n), t
    );
  }
  function Gu(l, t, u, a) {
    return (l = st(7, l, a, t)), (l.lanes = u), l;
  }
  function Xs(l, t, u, a) {
    (l = st(22, l, a, t)), (l.elementType = dt), (l.lanes = u);
    var e = {
      _visibility: 1,
      _pendingVisibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null,
      _current: null,
      detach: function () {
        var n = e._current;
        if (n === null) throw Error(o(456));
        if (!(e._pendingVisibility & 2)) {
          var f = Pt(n, 2);
          f !== null && ((e._pendingVisibility |= 2), Xl(f, n, 2));
        }
      },
      attach: function () {
        var n = e._current;
        if (n === null) throw Error(o(456));
        if (e._pendingVisibility & 2) {
          var f = Pt(n, 2);
          f !== null && ((e._pendingVisibility &= -3), Xl(f, n, 2));
        }
      },
    };
    return (l.stateNode = e), l;
  }
  function ic(l, t, u) {
    return (l = st(6, l, null, t)), (l.lanes = u), l;
  }
  function sc(l, t, u) {
    return (
      (t = st(4, l.children !== null ? l.children : [], l.key, t)),
      (t.lanes = u),
      (t.stateNode = {
        containerInfo: l.containerInfo,
        pendingChildren: null,
        implementation: l.implementation,
      }),
      t
    );
  }
  function jt(l) {
    l.flags |= 4;
  }
  function Qs(l, t) {
    if (t.type !== "stylesheet" || t.state.loading & 4) l.flags &= -16777217;
    else if (((l.flags |= 16777216), !zv(t))) {
      if (
        ((t = ft.current),
        t !== null &&
          ((x & 4194176) === x
            ? Tt !== null
            : ((x & 62914560) !== x && !(x & 536870912)) || t !== Tt))
      )
        throw ((Ca = mf), t0);
      l.flags |= 8192;
    }
  }
  function dn(l, t) {
    t !== null && (l.flags |= 4),
      l.flags & 16384 &&
        ((t = l.tag !== 22 ? ui() : 536870912), (l.lanes |= t), (ha |= t));
  }
  function ee(l, t) {
    if (!L)
      switch (l.tailMode) {
        case "hidden":
          t = l.tail;
          for (var u = null; t !== null; )
            t.alternate !== null && (u = t), (t = t.sibling);
          u === null ? (l.tail = null) : (u.sibling = null);
          break;
        case "collapsed":
          u = l.tail;
          for (var a = null; u !== null; )
            u.alternate !== null && (a = u), (u = u.sibling);
          a === null
            ? t || l.tail === null
              ? (l.tail = null)
              : (l.tail.sibling = null)
            : (a.sibling = null);
      }
  }
  function fl(l) {
    var t = l.alternate !== null && l.alternate.child === l.child,
      u = 0,
      a = 0;
    if (t)
      for (var e = l.child; e !== null; )
        (u |= e.lanes | e.childLanes),
          (a |= e.subtreeFlags & 31457280),
          (a |= e.flags & 31457280),
          (e.return = l),
          (e = e.sibling);
    else
      for (e = l.child; e !== null; )
        (u |= e.lanes | e.childLanes),
          (a |= e.subtreeFlags),
          (a |= e.flags),
          (e.return = l),
          (e = e.sibling);
    return (l.subtreeFlags |= a), (l.childLanes = u), t;
  }
  function S1(l, t, u) {
    var a = t.pendingProps;
    switch ((df(t), t.tag)) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return fl(t), null;
      case 1:
        return fl(t), null;
      case 3:
        return (
          (u = t.stateNode),
          (a = null),
          l !== null && (a = l.memoizedState.cache),
          t.memoizedState.cache !== a && (t.flags |= 2048),
          Gt(El),
          ju(),
          u.pendingContext &&
            ((u.context = u.pendingContext), (u.pendingContext = null)),
          (l === null || l.child === null) &&
            (Xa(t)
              ? jt(t)
              : l === null ||
                (l.memoizedState.isDehydrated && !(t.flags & 256)) ||
                ((t.flags |= 1024), mt !== null && (gc(mt), (mt = null)))),
          fl(t),
          null
        );
      case 26:
        return (
          (u = t.memoizedState),
          l === null
            ? (jt(t),
              u !== null ? (fl(t), Qs(t, u)) : (fl(t), (t.flags &= -16777217)))
            : u
            ? u !== l.memoizedState
              ? (jt(t), fl(t), Qs(t, u))
              : (fl(t), (t.flags &= -16777217))
            : (l.memoizedProps !== a && jt(t), fl(t), (t.flags &= -16777217)),
          null
        );
      case 27:
        Ae(t), (u = Wt.current);
        var e = t.type;
        if (l !== null && t.stateNode != null) l.memoizedProps !== a && jt(t);
        else {
          if (!a) {
            if (t.stateNode === null) throw Error(o(166));
            return fl(t), null;
          }
          (l = rt.current),
            Xa(t) ? Ii(t) : ((l = mv(e, a, u)), (t.stateNode = l), jt(t));
        }
        return fl(t), null;
      case 5:
        if ((Ae(t), (u = t.type), l !== null && t.stateNode != null))
          l.memoizedProps !== a && jt(t);
        else {
          if (!a) {
            if (t.stateNode === null) throw Error(o(166));
            return fl(t), null;
          }
          if (((l = rt.current), Xa(t))) Ii(t);
          else {
            switch (((e = An(Wt.current)), l)) {
              case 1:
                l = e.createElementNS("http://www.w3.org/2000/svg", u);
                break;
              case 2:
                l = e.createElementNS("http://www.w3.org/1998/Math/MathML", u);
                break;
              default:
                switch (u) {
                  case "svg":
                    l = e.createElementNS("http://www.w3.org/2000/svg", u);
                    break;
                  case "math":
                    l = e.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      u
                    );
                    break;
                  case "script":
                    (l = e.createElement("div")),
                      (l.innerHTML = "<script></script>"),
                      (l = l.removeChild(l.firstChild));
                    break;
                  case "select":
                    (l =
                      typeof a.is == "string"
                        ? e.createElement("select", { is: a.is })
                        : e.createElement("select")),
                      a.multiple
                        ? (l.multiple = !0)
                        : a.size && (l.size = a.size);
                    break;
                  default:
                    l =
                      typeof a.is == "string"
                        ? e.createElement(u, { is: a.is })
                        : e.createElement(u);
                }
            }
            (l[Hl] = t), (l[Cl] = a);
            l: for (e = t.child; e !== null; ) {
              if (e.tag === 5 || e.tag === 6) l.appendChild(e.stateNode);
              else if (e.tag !== 4 && e.tag !== 27 && e.child !== null) {
                (e.child.return = e), (e = e.child);
                continue;
              }
              if (e === t) break l;
              for (; e.sibling === null; ) {
                if (e.return === null || e.return === t) break l;
                e = e.return;
              }
              (e.sibling.return = e.return), (e = e.sibling);
            }
            t.stateNode = l;
            l: switch ((Rl(l, u, a), u)) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                l = !!a.autoFocus;
                break l;
              case "img":
                l = !0;
                break l;
              default:
                l = !1;
            }
            l && jt(t);
          }
        }
        return fl(t), (t.flags &= -16777217), null;
      case 6:
        if (l && t.stateNode != null) l.memoizedProps !== a && jt(t);
        else {
          if (typeof a != "string" && t.stateNode === null) throw Error(o(166));
          if (((l = Wt.current), Xa(t))) {
            if (
              ((l = t.stateNode),
              (u = t.memoizedProps),
              (a = null),
              (e = Gl),
              e !== null)
            )
              switch (e.tag) {
                case 27:
                case 5:
                  a = e.memoizedProps;
              }
            (l[Hl] = t),
              (l = !!(
                l.nodeValue === u ||
                (a !== null && a.suppressHydrationWarning === !0) ||
                iv(l.nodeValue, u)
              )),
              l || Du(t);
          } else (l = An(l).createTextNode(a)), (l[Hl] = t), (t.stateNode = l);
        }
        return fl(t), null;
      case 13:
        if (
          ((a = t.memoizedState),
          l === null ||
            (l.memoizedState !== null && l.memoizedState.dehydrated !== null))
        ) {
          if (((e = Xa(t)), a !== null && a.dehydrated !== null)) {
            if (l === null) {
              if (!e) throw Error(o(318));
              if (
                ((e = t.memoizedState),
                (e = e !== null ? e.dehydrated : null),
                !e)
              )
                throw Error(o(317));
              e[Hl] = t;
            } else
              Qa(),
                !(t.flags & 128) && (t.memoizedState = null),
                (t.flags |= 4);
            fl(t), (e = !1);
          } else mt !== null && (gc(mt), (mt = null)), (e = !0);
          if (!e) return t.flags & 256 ? (Nt(t), t) : (Nt(t), null);
        }
        if ((Nt(t), t.flags & 128)) return (t.lanes = u), t;
        if (
          ((u = a !== null), (l = l !== null && l.memoizedState !== null), u)
        ) {
          (a = t.child),
            (e = null),
            a.alternate !== null &&
              a.alternate.memoizedState !== null &&
              a.alternate.memoizedState.cachePool !== null &&
              (e = a.alternate.memoizedState.cachePool.pool);
          var n = null;
          a.memoizedState !== null &&
            a.memoizedState.cachePool !== null &&
            (n = a.memoizedState.cachePool.pool),
            n !== e && (a.flags |= 2048);
        }
        return (
          u !== l && u && (t.child.flags |= 8192),
          dn(t, t.updateQueue),
          fl(t),
          null
        );
      case 4:
        return ju(), l === null && Uc(t.stateNode.containerInfo), fl(t), null;
      case 10:
        return Gt(t.type), fl(t), null;
      case 19:
        if ((ml(bl), (e = t.memoizedState), e === null)) return fl(t), null;
        if (((a = (t.flags & 128) !== 0), (n = e.rendering), n === null))
          if (a) ee(e, !1);
          else {
            if (sl !== 0 || (l !== null && l.flags & 128))
              for (l = t.child; l !== null; ) {
                if (((n = We(l)), n !== null)) {
                  for (
                    t.flags |= 128,
                      ee(e, !1),
                      l = n.updateQueue,
                      t.updateQueue = l,
                      dn(t, l),
                      t.subtreeFlags = 0,
                      l = u,
                      u = t.child;
                    u !== null;

                  )
                    Gs(u, l), (u = u.sibling);
                  return nl(bl, (bl.current & 1) | 2), t.child;
                }
                l = l.sibling;
              }
            e.tail !== null &&
              bt() > hn &&
              ((t.flags |= 128), (a = !0), ee(e, !1), (t.lanes = 4194304));
          }
        else {
          if (!a)
            if (((l = We(n)), l !== null)) {
              if (
                ((t.flags |= 128),
                (a = !0),
                (l = l.updateQueue),
                (t.updateQueue = l),
                dn(t, l),
                ee(e, !0),
                e.tail === null &&
                  e.tailMode === "hidden" &&
                  !n.alternate &&
                  !L)
              )
                return fl(t), null;
            } else
              2 * bt() - e.renderingStartTime > hn &&
                u !== 536870912 &&
                ((t.flags |= 128), (a = !0), ee(e, !1), (t.lanes = 4194304));
          e.isBackwards
            ? ((n.sibling = t.child), (t.child = n))
            : ((l = e.last),
              l !== null ? (l.sibling = n) : (t.child = n),
              (e.last = n));
        }
        return e.tail !== null
          ? ((t = e.tail),
            (e.rendering = t),
            (e.tail = t.sibling),
            (e.renderingStartTime = bt()),
            (t.sibling = null),
            (l = bl.current),
            nl(bl, a ? (l & 1) | 2 : l & 1),
            t)
          : (fl(t), null);
      case 22:
      case 23:
        return (
          Nt(t),
          Sf(),
          (a = t.memoizedState !== null),
          l !== null
            ? (l.memoizedState !== null) !== a && (t.flags |= 8192)
            : a && (t.flags |= 8192),
          a
            ? u & 536870912 &&
              !(t.flags & 128) &&
              (fl(t), t.subtreeFlags & 6 && (t.flags |= 8192))
            : fl(t),
          (u = t.updateQueue),
          u !== null && dn(t, u.retryQueue),
          (u = null),
          l !== null &&
            l.memoizedState !== null &&
            l.memoizedState.cachePool !== null &&
            (u = l.memoizedState.cachePool.pool),
          (a = null),
          t.memoizedState !== null &&
            t.memoizedState.cachePool !== null &&
            (a = t.memoizedState.cachePool.pool),
          a !== u && (t.flags |= 2048),
          l !== null && ml(Uu),
          null
        );
      case 24:
        return (
          (u = null),
          l !== null && (u = l.memoizedState.cache),
          t.memoizedState.cache !== u && (t.flags |= 2048),
          Gt(El),
          fl(t),
          null
        );
      case 25:
        return null;
    }
    throw Error(o(156, t.tag));
  }
  function g1(l, t) {
    switch ((df(t), t.tag)) {
      case 1:
        return (
          (l = t.flags), l & 65536 ? ((t.flags = (l & -65537) | 128), t) : null
        );
      case 3:
        return (
          Gt(El),
          ju(),
          (l = t.flags),
          l & 65536 && !(l & 128) ? ((t.flags = (l & -65537) | 128), t) : null
        );
      case 26:
      case 27:
      case 5:
        return Ae(t), null;
      case 13:
        if (
          (Nt(t), (l = t.memoizedState), l !== null && l.dehydrated !== null)
        ) {
          if (t.alternate === null) throw Error(o(340));
          Qa();
        }
        return (
          (l = t.flags), l & 65536 ? ((t.flags = (l & -65537) | 128), t) : null
        );
      case 19:
        return ml(bl), null;
      case 4:
        return ju(), null;
      case 10:
        return Gt(t.type), null;
      case 22:
      case 23:
        return (
          Nt(t),
          Sf(),
          l !== null && ml(Uu),
          (l = t.flags),
          l & 65536 ? ((t.flags = (l & -65537) | 128), t) : null
        );
      case 24:
        return Gt(El), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Zs(l, t) {
    switch ((df(t), t.tag)) {
      case 3:
        Gt(El), ju();
        break;
      case 26:
      case 27:
      case 5:
        Ae(t);
        break;
      case 4:
        ju();
        break;
      case 13:
        Nt(t);
        break;
      case 19:
        ml(bl);
        break;
      case 10:
        Gt(t.type);
        break;
      case 22:
      case 23:
        Nt(t), Sf(), l !== null && ml(Uu);
        break;
      case 24:
        Gt(El);
    }
  }
  var r1 = {
      getCacheForType: function (l) {
        var t = ql(El),
          u = t.data.get(l);
        return u === void 0 && ((u = l()), t.data.set(l, u)), u;
      },
    },
    b1 = typeof WeakMap == "function" ? WeakMap : Map,
    cl = 0,
    tl = null,
    j = null,
    x = 0,
    ul = 0,
    kl = null,
    Ct = !1,
    da = !1,
    vc = !1,
    Vt = 0,
    sl = 0,
    yu = 0,
    Xu = 0,
    yc = 0,
    vt = 0,
    ha = 0,
    ne = null,
    At = null,
    dc = !1,
    hc = 0,
    hn = 1 / 0,
    mn = null,
    du = null,
    on = !1,
    Qu = null,
    fe = 0,
    mc = 0,
    oc = null,
    ce = 0,
    Sc = null;
  function Fl() {
    if (cl & 2 && x !== 0) return x & -x;
    if (q.T !== null) {
      var l = ea;
      return l !== 0 ? l : Oc();
    }
    return fi();
  }
  function js() {
    vt === 0 && (vt = !(x & 536870912) || L ? ti() : 536870912);
    var l = ft.current;
    return l !== null && (l.flags |= 32), vt;
  }
  function Xl(l, t, u) {
    ((l === tl && ul === 2) || l.cancelPendingCommit !== null) &&
      (ma(l, 0), xt(l, x, vt, !1)),
      _a(l, u),
      (!(cl & 2) || l !== tl) &&
        (l === tl && (!(cl & 2) && (Xu |= u), sl === 4 && xt(l, x, vt, !1)),
        Ot(l));
  }
  function Cs(l, t, u) {
    if (cl & 6) throw Error(o(327));
    var a = (!u && (t & 60) === 0 && (t & l.expiredLanes) === 0) || Oa(l, t),
      e = a ? z1(l, t) : Ec(l, t, !0),
      n = a;
    do {
      if (e === 0) {
        da && !a && xt(l, t, 0, !1);
        break;
      } else if (e === 6) xt(l, t, 0, !Ct);
      else {
        if (((u = l.current.alternate), n && !E1(u))) {
          (e = Ec(l, t, !1)), (n = !1);
          continue;
        }
        if (e === 2) {
          if (((n = t), l.errorRecoveryDisabledLanes & n)) var f = 0;
          else
            (f = l.pendingLanes & -536870913),
              (f = f !== 0 ? f : f & 536870912 ? 536870912 : 0);
          if (f !== 0) {
            t = f;
            l: {
              var c = l;
              e = ne;
              var i = c.current.memoizedState.isDehydrated;
              if ((i && (ma(c, f).flags |= 256), (f = Ec(c, f, !1)), f !== 2)) {
                if (vc && !i) {
                  (c.errorRecoveryDisabledLanes |= n), (Xu |= n), (e = 4);
                  break l;
                }
                (n = At), (At = e), n !== null && gc(n);
              }
              e = f;
            }
            if (((n = !1), e !== 2)) continue;
          }
        }
        if (e === 1) {
          ma(l, 0), xt(l, t, 0, !0);
          break;
        }
        l: {
          switch (((a = l), e)) {
            case 0:
            case 1:
              throw Error(o(345));
            case 4:
              if ((t & 4194176) === t) {
                xt(a, t, vt, !Ct);
                break l;
              }
              break;
            case 2:
              At = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(o(329));
          }
          if (
            ((a.finishedWork = u),
            (a.finishedLanes = t),
            (t & 62914560) === t && ((n = hc + 300 - bt()), 10 < n))
          ) {
            if ((xt(a, t, vt, !Ct), Me(a, 0) !== 0)) break l;
            a.timeoutHandle = yv(
              Vs.bind(null, a, u, At, mn, dc, t, vt, Xu, ha, Ct, 2, -0, 0),
              n
            );
            break l;
          }
          Vs(a, u, At, mn, dc, t, vt, Xu, ha, Ct, 0, -0, 0);
        }
      }
      break;
    } while (!0);
    Ot(l);
  }
  function gc(l) {
    At === null ? (At = l) : At.push.apply(At, l);
  }
  function Vs(l, t, u, a, e, n, f, c, i, y, g, b, m) {
    var S = t.subtreeFlags;
    if (
      (S & 8192 || (S & 16785408) === 16785408) &&
      ((he = { stylesheets: null, count: 0, unsuspend: td }),
      Ns(t),
      (t = ad()),
      t !== null)
    ) {
      (l.cancelPendingCommit = t($s.bind(null, l, u, a, e, f, c, i, 1, b, m))),
        xt(l, n, f, !y);
      return;
    }
    $s(l, u, a, e, f, c, i, g, b, m);
  }
  function E1(l) {
    for (var t = l; ; ) {
      var u = t.tag;
      if (
        (u === 0 || u === 11 || u === 15) &&
        t.flags & 16384 &&
        ((u = t.updateQueue), u !== null && ((u = u.stores), u !== null))
      )
        for (var a = 0; a < u.length; a++) {
          var e = u[a],
            n = e.getSnapshot;
          e = e.value;
          try {
            if (!wl(n(), e)) return !1;
          } catch {
            return !1;
          }
        }
      if (((u = t.child), t.subtreeFlags & 16384 && u !== null))
        (u.return = t), (t = u);
      else {
        if (t === l) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === l) return !0;
          t = t.return;
        }
        (t.sibling.return = t.return), (t = t.sibling);
      }
    }
    return !0;
  }
  function xt(l, t, u, a) {
    (t &= ~yc),
      (t &= ~Xu),
      (l.suspendedLanes |= t),
      (l.pingedLanes &= ~t),
      a && (l.warmLanes |= t),
      (a = l.expirationTimes);
    for (var e = t; 0 < e; ) {
      var n = 31 - Jl(e),
        f = 1 << n;
      (a[n] = -1), (e &= ~f);
    }
    u !== 0 && ai(l, u, t);
  }
  function Sn() {
    return cl & 6 ? !0 : (ie(0), !1);
  }
  function rc() {
    if (j !== null) {
      if (ul === 0) var l = j.return;
      else (l = j), (pt = Yu = null), Of(l), (ua = null), (Va = 0), (l = j);
      for (; l !== null; ) Zs(l.alternate, l), (l = l.return);
      j = null;
    }
  }
  function ma(l, t) {
    (l.finishedWork = null), (l.finishedLanes = 0);
    var u = l.timeoutHandle;
    u !== -1 && ((l.timeoutHandle = -1), Z1(u)),
      (u = l.cancelPendingCommit),
      u !== null && ((l.cancelPendingCommit = null), u()),
      rc(),
      (tl = l),
      (j = u = vu(l.current, null)),
      (x = t),
      (ul = 0),
      (kl = null),
      (Ct = !1),
      (da = Oa(l, t)),
      (vc = !1),
      (ha = vt = yc = Xu = yu = sl = 0),
      (At = ne = null),
      (dc = !1),
      t & 8 && (t |= t & 32);
    var a = l.entangledLanes;
    if (a !== 0)
      for (l = l.entanglements, a &= t; 0 < a; ) {
        var e = 31 - Jl(a),
          n = 1 << e;
        (t |= l[e]), (a &= ~n);
      }
    return (Vt = t), Ze(), u;
  }
  function xs(l, t) {
    (Q = null),
      (q.H = zt),
      t === ja
        ? ((t = e0()), (ul = 3))
        : t === t0
        ? ((t = e0()), (ul = 4))
        : (ul =
            t === us
              ? 8
              : t !== null &&
                typeof t == "object" &&
                typeof t.then == "function"
              ? 6
              : 1),
      (kl = t),
      j === null && ((sl = 1), nn(l, at(t, l.current)));
  }
  function Ls() {
    var l = q.H;
    return (q.H = zt), l === null ? zt : l;
  }
  function Ks() {
    var l = q.A;
    return (q.A = r1), l;
  }
  function bc() {
    (sl = 4),
      Ct || ((x & 4194176) !== x && ft.current !== null) || (da = !0),
      (!(yu & 134217727) && !(Xu & 134217727)) ||
        tl === null ||
        xt(tl, x, vt, !1);
  }
  function Ec(l, t, u) {
    var a = cl;
    cl |= 2;
    var e = Ls(),
      n = Ks();
    (tl !== l || x !== t) && ((mn = null), ma(l, t)), (t = !1);
    var f = sl;
    l: do
      try {
        if (ul !== 0 && j !== null) {
          var c = j,
            i = kl;
          switch (ul) {
            case 8:
              rc(), (f = 6);
              break l;
            case 3:
            case 2:
            case 6:
              ft.current === null && (t = !0);
              var y = ul;
              if (((ul = 0), (kl = null), oa(l, c, i, y), u && da)) {
                f = 0;
                break l;
              }
              break;
            default:
              (y = ul), (ul = 0), (kl = null), oa(l, c, i, y);
          }
        }
        T1(), (f = sl);
        break;
      } catch (g) {
        xs(l, g);
      }
    while (!0);
    return (
      t && l.shellSuspendCounter++,
      (pt = Yu = null),
      (cl = a),
      (q.H = e),
      (q.A = n),
      j === null && ((tl = null), (x = 0), Ze()),
      f
    );
  }
  function T1() {
    for (; j !== null; ) Js(j);
  }
  function z1(l, t) {
    var u = cl;
    cl |= 2;
    var a = Ls(),
      e = Ks();
    tl !== l || x !== t
      ? ((mn = null), (hn = bt() + 500), ma(l, t))
      : (da = Oa(l, t));
    l: do
      try {
        if (ul !== 0 && j !== null) {
          t = j;
          var n = kl;
          t: switch (ul) {
            case 1:
              (ul = 0), (kl = null), oa(l, t, n, 1);
              break;
            case 2:
              if (u0(n)) {
                (ul = 0), (kl = null), ws(t);
                break;
              }
              (t = function () {
                ul === 2 && tl === l && (ul = 7), Ot(l);
              }),
                n.then(t, t);
              break l;
            case 3:
              ul = 7;
              break l;
            case 4:
              ul = 5;
              break l;
            case 7:
              u0(n)
                ? ((ul = 0), (kl = null), ws(t))
                : ((ul = 0), (kl = null), oa(l, t, n, 7));
              break;
            case 5:
              var f = null;
              switch (j.tag) {
                case 26:
                  f = j.memoizedState;
                case 5:
                case 27:
                  var c = j;
                  if (!f || zv(f)) {
                    (ul = 0), (kl = null);
                    var i = c.sibling;
                    if (i !== null) j = i;
                    else {
                      var y = c.return;
                      y !== null ? ((j = y), gn(y)) : (j = null);
                    }
                    break t;
                  }
              }
              (ul = 0), (kl = null), oa(l, t, n, 5);
              break;
            case 6:
              (ul = 0), (kl = null), oa(l, t, n, 6);
              break;
            case 8:
              rc(), (sl = 6);
              break l;
            default:
              throw Error(o(462));
          }
        }
        A1();
        break;
      } catch (g) {
        xs(l, g);
      }
    while (!0);
    return (
      (pt = Yu = null),
      (q.H = a),
      (q.A = e),
      (cl = u),
      j !== null ? 0 : ((tl = null), (x = 0), Ze(), sl)
    );
  }
  function A1() {
    for (; j !== null && !Kv(); ) Js(j);
  }
  function Js(l) {
    var t = ms(l.alternate, l, Vt);
    (l.memoizedProps = l.pendingProps), t === null ? gn(l) : (j = t);
  }
  function ws(l) {
    var t = l,
      u = t.alternate;
    switch (t.tag) {
      case 15:
      case 0:
        t = is(u, t, t.pendingProps, t.type, void 0, x);
        break;
      case 11:
        t = is(u, t, t.pendingProps, t.type.render, t.ref, x);
        break;
      case 5:
        Of(t);
      default:
        Zs(u, t), (t = j = Gs(t, Vt)), (t = ms(u, t, Vt));
    }
    (l.memoizedProps = l.pendingProps), t === null ? gn(l) : (j = t);
  }
  function oa(l, t, u, a) {
    (pt = Yu = null), Of(t), (ua = null), (Va = 0);
    var e = t.return;
    try {
      if (y1(l, e, t, u, x)) {
        (sl = 1), nn(l, at(u, l.current)), (j = null);
        return;
      }
    } catch (n) {
      if (e !== null) throw ((j = e), n);
      (sl = 1), nn(l, at(u, l.current)), (j = null);
      return;
    }
    t.flags & 32768
      ? (L || a === 1
          ? (l = !0)
          : da || x & 536870912
          ? (l = !1)
          : ((Ct = l = !0),
            (a === 2 || a === 3 || a === 6) &&
              ((a = ft.current),
              a !== null && a.tag === 13 && (a.flags |= 16384))),
        Ws(t, l))
      : gn(t);
  }
  function gn(l) {
    var t = l;
    do {
      if (t.flags & 32768) {
        Ws(t, Ct);
        return;
      }
      l = t.return;
      var u = S1(t.alternate, t, Vt);
      if (u !== null) {
        j = u;
        return;
      }
      if (((t = t.sibling), t !== null)) {
        j = t;
        return;
      }
      j = t = l;
    } while (t !== null);
    sl === 0 && (sl = 5);
  }
  function Ws(l, t) {
    do {
      var u = g1(l.alternate, l);
      if (u !== null) {
        (u.flags &= 32767), (j = u);
        return;
      }
      if (
        ((u = l.return),
        u !== null &&
          ((u.flags |= 32768), (u.subtreeFlags = 0), (u.deletions = null)),
        !t && ((l = l.sibling), l !== null))
      ) {
        j = l;
        return;
      }
      j = l = u;
    } while (l !== null);
    (sl = 6), (j = null);
  }
  function $s(l, t, u, a, e, n, f, c, i, y) {
    var g = q.T,
      b = A.p;
    try {
      (A.p = 2), (q.T = null), O1(l, t, u, a, b, e, n, f, c, i, y);
    } finally {
      (q.T = g), (A.p = b);
    }
  }
  function O1(l, t, u, a, e, n, f, c) {
    do Sa();
    while (Qu !== null);
    if (cl & 6) throw Error(o(327));
    var i = l.finishedWork;
    if (((a = l.finishedLanes), i === null)) return null;
    if (((l.finishedWork = null), (l.finishedLanes = 0), i === l.current))
      throw Error(o(177));
    (l.callbackNode = null),
      (l.callbackPriority = 0),
      (l.cancelPendingCommit = null);
    var y = i.lanes | i.childLanes;
    if (
      ((y |= sf),
      uy(l, a, y, n, f, c),
      l === tl && ((j = tl = null), (x = 0)),
      (!(i.subtreeFlags & 10256) && !(i.flags & 10256)) ||
        on ||
        ((on = !0),
        (mc = y),
        (oc = u),
        U1(Oe, function () {
          return Sa(), null;
        })),
      (u = (i.flags & 15990) !== 0),
      i.subtreeFlags & 15990 || u
        ? ((u = q.T),
          (q.T = null),
          (n = A.p),
          (A.p = 2),
          (f = cl),
          (cl |= 4),
          h1(l, i),
          Rs(i, l),
          Wy(Nc, l.containerInfo),
          (Rn = !!qc),
          (Nc = qc = null),
          (l.current = i),
          _s(l, i.alternate, i),
          Jv(),
          (cl = f),
          (A.p = n),
          (q.T = u))
        : (l.current = i),
      on ? ((on = !1), (Qu = l), (fe = a)) : ks(l, y),
      (y = l.pendingLanes),
      y === 0 && (du = null),
      Fv(i.stateNode),
      Ot(l),
      t !== null)
    )
      for (e = l.onRecoverableError, i = 0; i < t.length; i++)
        (y = t[i]), e(y.value, { componentStack: y.stack });
    return (
      fe & 3 && Sa(),
      (y = l.pendingLanes),
      a & 4194218 && y & 42
        ? l === Sc
          ? ce++
          : ((ce = 0), (Sc = l))
        : (ce = 0),
      ie(0),
      null
    );
  }
  function ks(l, t) {
    (l.pooledCacheLanes &= t) === 0 &&
      ((t = l.pooledCache), t != null && ((l.pooledCache = null), La(t)));
  }
  function Sa() {
    if (Qu !== null) {
      var l = Qu,
        t = mc;
      mc = 0;
      var u = ni(fe),
        a = q.T,
        e = A.p;
      try {
        if (((A.p = 32 > u ? 32 : u), (q.T = null), Qu === null)) var n = !1;
        else {
          (u = oc), (oc = null);
          var f = Qu,
            c = fe;
          if (((Qu = null), (fe = 0), cl & 6)) throw Error(o(331));
          var i = cl;
          if (
            ((cl |= 4),
            Bs(f.current),
            qs(f, f.current, c, u),
            (cl = i),
            ie(0, !1),
            Kl && typeof Kl.onPostCommitFiberRoot == "function")
          )
            try {
              Kl.onPostCommitFiberRoot(Aa, f);
            } catch {}
          n = !0;
        }
        return n;
      } finally {
        (A.p = e), (q.T = a), ks(l, t);
      }
    }
    return !1;
  }
  function Fs(l, t, u) {
    (t = at(u, t)),
      (t = Qf(l.stateNode, t, 2)),
      (l = fu(l, t, 2)),
      l !== null && (_a(l, 2), Ot(l));
  }
  function I(l, t, u) {
    if (l.tag === 3) Fs(l, l, u);
    else
      for (; t !== null; ) {
        if (t.tag === 3) {
          Fs(t, l, u);
          break;
        } else if (t.tag === 1) {
          var a = t.stateNode;
          if (
            typeof t.type.getDerivedStateFromError == "function" ||
            (typeof a.componentDidCatch == "function" &&
              (du === null || !du.has(a)))
          ) {
            (l = at(u, l)),
              (u = ls(2)),
              (a = fu(t, u, 2)),
              a !== null && (ts(u, a, t, l), _a(a, 2), Ot(a));
            break;
          }
        }
        t = t.return;
      }
  }
  function Tc(l, t, u) {
    var a = l.pingCache;
    if (a === null) {
      a = l.pingCache = new b1();
      var e = new Set();
      a.set(t, e);
    } else (e = a.get(t)), e === void 0 && ((e = new Set()), a.set(t, e));
    e.has(u) ||
      ((vc = !0), e.add(u), (l = _1.bind(null, l, t, u)), t.then(l, l));
  }
  function _1(l, t, u) {
    var a = l.pingCache;
    a !== null && a.delete(t),
      (l.pingedLanes |= l.suspendedLanes & u),
      (l.warmLanes &= ~u),
      tl === l &&
        (x & u) === u &&
        (sl === 4 || (sl === 3 && (x & 62914560) === x && 300 > bt() - hc)
          ? !(cl & 2) && ma(l, 0)
          : (yc |= u),
        ha === x && (ha = 0)),
      Ot(l);
  }
  function Ps(l, t) {
    t === 0 && (t = ui()), (l = Pt(l, t)), l !== null && (_a(l, t), Ot(l));
  }
  function D1(l) {
    var t = l.memoizedState,
      u = 0;
    t !== null && (u = t.retryLane), Ps(l, u);
  }
  function M1(l, t) {
    var u = 0;
    switch (l.tag) {
      case 13:
        var a = l.stateNode,
          e = l.memoizedState;
        e !== null && (u = e.retryLane);
        break;
      case 19:
        a = l.stateNode;
        break;
      case 22:
        a = l.stateNode._retryCache;
        break;
      default:
        throw Error(o(314));
    }
    a !== null && a.delete(t), Ps(l, u);
  }
  function U1(l, t) {
    return Qn(l, t);
  }
  var rn = null,
    ga = null,
    zc = !1,
    bn = !1,
    Ac = !1,
    Zu = 0;
  function Ot(l) {
    l !== ga &&
      l.next === null &&
      (ga === null ? (rn = ga = l) : (ga = ga.next = l)),
      (bn = !0),
      zc || ((zc = !0), H1(R1));
  }
  function ie(l, t) {
    if (!Ac && bn) {
      Ac = !0;
      do
        for (var u = !1, a = rn; a !== null; ) {
          if (l !== 0) {
            var e = a.pendingLanes;
            if (e === 0) var n = 0;
            else {
              var f = a.suspendedLanes,
                c = a.pingedLanes;
              (n = (1 << (31 - Jl(42 | l) + 1)) - 1),
                (n &= e & ~(f & ~c)),
                (n = n & 201326677 ? (n & 201326677) | 1 : n ? n | 2 : 0);
            }
            n !== 0 && ((u = !0), tv(a, n));
          } else
            (n = x),
              (n = Me(a, a === tl ? n : 0)),
              !(n & 3) || Oa(a, n) || ((u = !0), tv(a, n));
          a = a.next;
        }
      while (u);
      Ac = !1;
    }
  }
  function R1() {
    bn = zc = !1;
    var l = 0;
    Zu !== 0 && (Q1() && (l = Zu), (Zu = 0));
    for (var t = bt(), u = null, a = rn; a !== null; ) {
      var e = a.next,
        n = Is(a, t);
      n === 0
        ? ((a.next = null),
          u === null ? (rn = e) : (u.next = e),
          e === null && (ga = u))
        : ((u = a), (l !== 0 || n & 3) && (bn = !0)),
        (a = e);
    }
    ie(l);
  }
  function Is(l, t) {
    for (
      var u = l.suspendedLanes,
        a = l.pingedLanes,
        e = l.expirationTimes,
        n = l.pendingLanes & -62914561;
      0 < n;

    ) {
      var f = 31 - Jl(n),
        c = 1 << f,
        i = e[f];
      i === -1
        ? (!(c & u) || c & a) && (e[f] = ty(c, t))
        : i <= t && (l.expiredLanes |= c),
        (n &= ~c);
    }
    if (
      ((t = tl),
      (u = x),
      (u = Me(l, l === t ? u : 0)),
      (a = l.callbackNode),
      u === 0 || (l === t && ul === 2) || l.cancelPendingCommit !== null)
    )
      return (
        a !== null && a !== null && Zn(a),
        (l.callbackNode = null),
        (l.callbackPriority = 0)
      );
    if (!(u & 3) || Oa(l, u)) {
      if (((t = u & -u), t === l.callbackPriority)) return t;
      switch ((a !== null && Zn(a), ni(u))) {
        case 2:
        case 8:
          u = Ic;
          break;
        case 32:
          u = Oe;
          break;
        case 268435456:
          u = li;
          break;
        default:
          u = Oe;
      }
      return (
        (a = lv.bind(null, l)),
        (u = Qn(u, a)),
        (l.callbackPriority = t),
        (l.callbackNode = u),
        t
      );
    }
    return (
      a !== null && a !== null && Zn(a),
      (l.callbackPriority = 2),
      (l.callbackNode = null),
      2
    );
  }
  function lv(l, t) {
    var u = l.callbackNode;
    if (Sa() && l.callbackNode !== u) return null;
    var a = x;
    return (
      (a = Me(l, l === tl ? a : 0)),
      a === 0
        ? null
        : (Cs(l, a, t),
          Is(l, bt()),
          l.callbackNode != null && l.callbackNode === u
            ? lv.bind(null, l)
            : null)
    );
  }
  function tv(l, t) {
    if (Sa()) return null;
    Cs(l, t, !0);
  }
  function H1(l) {
    j1(function () {
      cl & 6 ? Qn(Pc, l) : l();
    });
  }
  function Oc() {
    return Zu === 0 && (Zu = ti()), Zu;
  }
  function uv(l) {
    return l == null || typeof l == "symbol" || typeof l == "boolean"
      ? null
      : typeof l == "function"
      ? l
      : Ne("" + l);
  }
  function av(l, t) {
    var u = t.ownerDocument.createElement("input");
    return (
      (u.name = t.name),
      (u.value = t.value),
      l.id && u.setAttribute("form", l.id),
      t.parentNode.insertBefore(u, t),
      (l = new FormData(l)),
      u.parentNode.removeChild(u),
      l
    );
  }
  function q1(l, t, u, a, e) {
    if (t === "submit" && u && u.stateNode === e) {
      var n = uv((e[Cl] || null).action),
        f = a.submitter;
      f &&
        ((t = (t = f[Cl] || null)
          ? uv(t.formAction)
          : f.getAttribute("formAction")),
        t !== null && ((n = t), (f = null)));
      var c = new Ge("action", "action", null, a, e);
      l.push({
        event: c,
        listeners: [
          {
            instance: null,
            listener: function () {
              if (a.defaultPrevented) {
                if (Zu !== 0) {
                  var i = f ? av(e, f) : new FormData(e);
                  Yf(
                    u,
                    { pending: !0, data: i, method: e.method, action: n },
                    null,
                    i
                  );
                }
              } else
                typeof n == "function" &&
                  (c.preventDefault(),
                  (i = f ? av(e, f) : new FormData(e)),
                  Yf(
                    u,
                    { pending: !0, data: i, method: e.method, action: n },
                    n,
                    i
                  ));
            },
            currentTarget: e,
          },
        ],
      });
    }
  }
  for (var _c = 0; _c < $i.length; _c++) {
    var Dc = $i[_c],
      N1 = Dc.toLowerCase(),
      Y1 = Dc[0].toUpperCase() + Dc.slice(1);
    ht(N1, "on" + Y1);
  }
  ht(Li, "onAnimationEnd"),
    ht(Ki, "onAnimationIteration"),
    ht(Ji, "onAnimationStart"),
    ht("dblclick", "onDoubleClick"),
    ht("focusin", "onFocus"),
    ht("focusout", "onBlur"),
    ht(ky, "onTransitionRun"),
    ht(Fy, "onTransitionStart"),
    ht(Py, "onTransitionCancel"),
    ht(wi, "onTransitionEnd"),
    Lu("onMouseEnter", ["mouseout", "mouseover"]),
    Lu("onMouseLeave", ["mouseout", "mouseover"]),
    Lu("onPointerEnter", ["pointerout", "pointerover"]),
    Lu("onPointerLeave", ["pointerout", "pointerover"]),
    Eu(
      "onChange",
      "change click focusin focusout input keydown keyup selectionchange".split(
        " "
      )
    ),
    Eu(
      "onSelect",
      "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
        " "
      )
    ),
    Eu("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
    Eu(
      "onCompositionEnd",
      "compositionend focusout keydown keypress keyup mousedown".split(" ")
    ),
    Eu(
      "onCompositionStart",
      "compositionstart focusout keydown keypress keyup mousedown".split(" ")
    ),
    Eu(
      "onCompositionUpdate",
      "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
    );
  var se =
      "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
        " "
      ),
    B1 = new Set(
      "beforetoggle cancel close invalid load scroll scrollend toggle"
        .split(" ")
        .concat(se)
    );
  function ev(l, t) {
    t = (t & 4) !== 0;
    for (var u = 0; u < l.length; u++) {
      var a = l[u],
        e = a.event;
      a = a.listeners;
      l: {
        var n = void 0;
        if (t)
          for (var f = a.length - 1; 0 <= f; f--) {
            var c = a[f],
              i = c.instance,
              y = c.currentTarget;
            if (((c = c.listener), i !== n && e.isPropagationStopped()))
              break l;
            (n = c), (e.currentTarget = y);
            try {
              n(e);
            } catch (g) {
              en(g);
            }
            (e.currentTarget = null), (n = i);
          }
        else
          for (f = 0; f < a.length; f++) {
            if (
              ((c = a[f]),
              (i = c.instance),
              (y = c.currentTarget),
              (c = c.listener),
              i !== n && e.isPropagationStopped())
            )
              break l;
            (n = c), (e.currentTarget = y);
            try {
              n(e);
            } catch (g) {
              en(g);
            }
            (e.currentTarget = null), (n = i);
          }
      }
    }
  }
  function C(l, t) {
    var u = t[Cn];
    u === void 0 && (u = t[Cn] = new Set());
    var a = l + "__bubble";
    u.has(a) || (nv(t, l, 2, !1), u.add(a));
  }
  function Mc(l, t, u) {
    var a = 0;
    t && (a |= 4), nv(u, l, a, t);
  }
  var En = "_reactListening" + Math.random().toString(36).slice(2);
  function Uc(l) {
    if (!l[En]) {
      (l[En] = !0),
        ii.forEach(function (u) {
          u !== "selectionchange" && (B1.has(u) || Mc(u, !1, l), Mc(u, !0, l));
        });
      var t = l.nodeType === 9 ? l : l.ownerDocument;
      t === null || t[En] || ((t[En] = !0), Mc("selectionchange", !1, t));
    }
  }
  function nv(l, t, u, a) {
    switch (Uv(t)) {
      case 2:
        var e = fd;
        break;
      case 8:
        e = cd;
        break;
      default:
        e = Cc;
    }
    (u = e.bind(null, t, u, l)),
      (e = void 0),
      !$n ||
        (t !== "touchstart" && t !== "touchmove" && t !== "wheel") ||
        (e = !0),
      a
        ? e !== void 0
          ? l.addEventListener(t, u, { capture: !0, passive: e })
          : l.addEventListener(t, u, !0)
        : e !== void 0
        ? l.addEventListener(t, u, { passive: e })
        : l.addEventListener(t, u, !1);
  }
  function Rc(l, t, u, a, e) {
    var n = a;
    if (!(t & 1) && !(t & 2) && a !== null)
      l: for (;;) {
        if (a === null) return;
        var f = a.tag;
        if (f === 3 || f === 4) {
          var c = a.stateNode.containerInfo;
          if (c === e || (c.nodeType === 8 && c.parentNode === e)) break;
          if (f === 4)
            for (f = a.return; f !== null; ) {
              var i = f.tag;
              if (
                (i === 3 || i === 4) &&
                ((i = f.stateNode.containerInfo),
                i === e || (i.nodeType === 8 && i.parentNode === e))
              )
                return;
              f = f.return;
            }
          for (; c !== null; ) {
            if (((f = bu(c)), f === null)) return;
            if (((i = f.tag), i === 5 || i === 6 || i === 26 || i === 27)) {
              a = n = f;
              continue l;
            }
            c = c.parentNode;
          }
        }
        a = a.return;
      }
    Ei(function () {
      var y = n,
        g = wn(u),
        b = [];
      l: {
        var m = Wi.get(l);
        if (m !== void 0) {
          var S = Ge,
            D = l;
          switch (l) {
            case "keypress":
              if (Be(u) === 0) break l;
            case "keydown":
            case "keyup":
              S = My;
              break;
            case "focusin":
              (D = "focus"), (S = In);
              break;
            case "focusout":
              (D = "blur"), (S = In);
              break;
            case "beforeblur":
            case "afterblur":
              S = In;
              break;
            case "click":
              if (u.button === 2) break l;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              S = Ai;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              S = oy;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              S = Hy;
              break;
            case Li:
            case Ki:
            case Ji:
              S = ry;
              break;
            case wi:
              S = Ny;
              break;
            case "scroll":
            case "scrollend":
              S = hy;
              break;
            case "wheel":
              S = By;
              break;
            case "copy":
            case "cut":
            case "paste":
              S = Ey;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              S = _i;
              break;
            case "toggle":
            case "beforetoggle":
              S = Gy;
          }
          var B = (t & 4) !== 0,
            vl = !B && (l === "scroll" || l === "scrollend"),
            d = B ? (m !== null ? m + "Capture" : null) : m;
          B = [];
          for (var v = y, h; v !== null; ) {
            var r = v;
            if (
              ((h = r.stateNode),
              (r = r.tag),
              (r !== 5 && r !== 26 && r !== 27) ||
                h === null ||
                d === null ||
                ((r = Ua(v, d)), r != null && B.push(ve(v, r, h))),
              vl)
            )
              break;
            v = v.return;
          }
          0 < B.length &&
            ((m = new S(m, D, null, u, g)), b.push({ event: m, listeners: B }));
        }
      }
      if (!(t & 7)) {
        l: {
          if (
            ((m = l === "mouseover" || l === "pointerover"),
            (S = l === "mouseout" || l === "pointerout"),
            m &&
              u !== Jn &&
              (D = u.relatedTarget || u.fromElement) &&
              (bu(D) || D[Cu]))
          )
            break l;
          if (
            (S || m) &&
            ((m =
              g.window === g
                ? g
                : (m = g.ownerDocument)
                ? m.defaultView || m.parentWindow
                : window),
            S
              ? ((D = u.relatedTarget || u.toElement),
                (S = y),
                (D = D ? bu(D) : null),
                D !== null &&
                  ((vl = Y(D)),
                  (B = D.tag),
                  D !== vl || (B !== 5 && B !== 27 && B !== 6)) &&
                  (D = null))
              : ((S = null), (D = y)),
            S !== D)
          ) {
            if (
              ((B = Ai),
              (r = "onMouseLeave"),
              (d = "onMouseEnter"),
              (v = "mouse"),
              (l === "pointerout" || l === "pointerover") &&
                ((B = _i),
                (r = "onPointerLeave"),
                (d = "onPointerEnter"),
                (v = "pointer")),
              (vl = S == null ? m : Ma(S)),
              (h = D == null ? m : Ma(D)),
              (m = new B(r, v + "leave", S, u, g)),
              (m.target = vl),
              (m.relatedTarget = h),
              (r = null),
              bu(g) === y &&
                ((B = new B(d, v + "enter", D, u, g)),
                (B.target = h),
                (B.relatedTarget = vl),
                (r = B)),
              (vl = r),
              S && D)
            )
              t: {
                for (B = S, d = D, v = 0, h = B; h; h = ra(h)) v++;
                for (h = 0, r = d; r; r = ra(r)) h++;
                for (; 0 < v - h; ) (B = ra(B)), v--;
                for (; 0 < h - v; ) (d = ra(d)), h--;
                for (; v--; ) {
                  if (B === d || (d !== null && B === d.alternate)) break t;
                  (B = ra(B)), (d = ra(d));
                }
                B = null;
              }
            else B = null;
            S !== null && fv(b, m, S, B, !1),
              D !== null && vl !== null && fv(b, vl, D, B, !0);
          }
        }
        l: {
          if (
            ((m = y ? Ma(y) : window),
            (S = m.nodeName && m.nodeName.toLowerCase()),
            S === "select" || (S === "input" && m.type === "file"))
          )
            var O = Yi;
          else if (qi(m))
            if (Bi) O = Jy;
            else {
              O = Ly;
              var Z = xy;
            }
          else
            (S = m.nodeName),
              !S ||
              S.toLowerCase() !== "input" ||
              (m.type !== "checkbox" && m.type !== "radio")
                ? y && Kn(y.elementType) && (O = Yi)
                : (O = Ky);
          if (O && (O = O(l, y))) {
            Ni(b, O, u, g);
            break l;
          }
          Z && Z(l, m, y),
            l === "focusout" &&
              y &&
              m.type === "number" &&
              y.memoizedProps.value != null &&
              Ln(m, "number", m.value);
        }
        switch (((Z = y ? Ma(y) : window), l)) {
          case "focusin":
            (qi(Z) || Z.contentEditable === "true") &&
              ((ku = Z), (nf = y), (Ga = null));
            break;
          case "focusout":
            Ga = nf = ku = null;
            break;
          case "mousedown":
            ff = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            (ff = !1), Vi(b, u, g);
            break;
          case "selectionchange":
            if ($y) break;
          case "keydown":
          case "keyup":
            Vi(b, u, g);
        }
        var U;
        if (tf)
          l: {
            switch (l) {
              case "compositionstart":
                var H = "onCompositionStart";
                break l;
              case "compositionend":
                H = "onCompositionEnd";
                break l;
              case "compositionupdate":
                H = "onCompositionUpdate";
                break l;
            }
            H = void 0;
          }
        else
          $u
            ? Ri(l, u) && (H = "onCompositionEnd")
            : l === "keydown" &&
              u.keyCode === 229 &&
              (H = "onCompositionStart");
        H &&
          (Di &&
            u.locale !== "ko" &&
            ($u || H !== "onCompositionStart"
              ? H === "onCompositionEnd" && $u && (U = Ti())
              : ((Ft = g),
                (kn = "value" in Ft ? Ft.value : Ft.textContent),
                ($u = !0))),
          (Z = Tn(y, H)),
          0 < Z.length &&
            ((H = new Oi(H, l, null, u, g)),
            b.push({ event: H, listeners: Z }),
            U ? (H.data = U) : ((U = Hi(u)), U !== null && (H.data = U)))),
          (U = Qy ? Zy(l, u) : jy(l, u)) &&
            ((H = Tn(y, "onBeforeInput")),
            0 < H.length &&
              ((Z = new Oi("onBeforeInput", "beforeinput", null, u, g)),
              b.push({ event: Z, listeners: H }),
              (Z.data = U))),
          q1(b, l, y, u, g);
      }
      ev(b, t);
    });
  }
  function ve(l, t, u) {
    return { instance: l, listener: t, currentTarget: u };
  }
  function Tn(l, t) {
    for (var u = t + "Capture", a = []; l !== null; ) {
      var e = l,
        n = e.stateNode;
      (e = e.tag),
        (e !== 5 && e !== 26 && e !== 27) ||
          n === null ||
          ((e = Ua(l, u)),
          e != null && a.unshift(ve(l, e, n)),
          (e = Ua(l, t)),
          e != null && a.push(ve(l, e, n))),
        (l = l.return);
    }
    return a;
  }
  function ra(l) {
    if (l === null) return null;
    do l = l.return;
    while (l && l.tag !== 5 && l.tag !== 27);
    return l || null;
  }
  function fv(l, t, u, a, e) {
    for (var n = t._reactName, f = []; u !== null && u !== a; ) {
      var c = u,
        i = c.alternate,
        y = c.stateNode;
      if (((c = c.tag), i !== null && i === a)) break;
      (c !== 5 && c !== 26 && c !== 27) ||
        y === null ||
        ((i = y),
        e
          ? ((y = Ua(u, n)), y != null && f.unshift(ve(u, y, i)))
          : e || ((y = Ua(u, n)), y != null && f.push(ve(u, y, i)))),
        (u = u.return);
    }
    f.length !== 0 && l.push({ event: t, listeners: f });
  }
  var p1 = /\r\n?/g,
    G1 = /\u0000|\uFFFD/g;
  function cv(l) {
    return (typeof l == "string" ? l : "" + l)
      .replace(
        p1,
        `
`
      )
      .replace(G1, "");
  }
  function iv(l, t) {
    return (t = cv(t)), cv(l) === t;
  }
  function zn() {}
  function F(l, t, u, a, e, n) {
    switch (u) {
      case "children":
        typeof a == "string"
          ? t === "body" || (t === "textarea" && a === "") || Ju(l, a)
          : (typeof a == "number" || typeof a == "bigint") &&
            t !== "body" &&
            Ju(l, "" + a);
        break;
      case "className":
        Re(l, "class", a);
        break;
      case "tabIndex":
        Re(l, "tabindex", a);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        Re(l, u, a);
        break;
      case "style":
        ri(l, a, n);
        break;
      case "data":
        if (t !== "object") {
          Re(l, "data", a);
          break;
        }
      case "src":
      case "href":
        if (a === "" && (t !== "a" || u !== "href")) {
          l.removeAttribute(u);
          break;
        }
        if (
          a == null ||
          typeof a == "function" ||
          typeof a == "symbol" ||
          typeof a == "boolean"
        ) {
          l.removeAttribute(u);
          break;
        }
        (a = Ne("" + a)), l.setAttribute(u, a);
        break;
      case "action":
      case "formAction":
        if (typeof a == "function") {
          l.setAttribute(
            u,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          typeof n == "function" &&
            (u === "formAction"
              ? (t !== "input" && F(l, t, "name", e.name, e, null),
                F(l, t, "formEncType", e.formEncType, e, null),
                F(l, t, "formMethod", e.formMethod, e, null),
                F(l, t, "formTarget", e.formTarget, e, null))
              : (F(l, t, "encType", e.encType, e, null),
                F(l, t, "method", e.method, e, null),
                F(l, t, "target", e.target, e, null)));
        if (a == null || typeof a == "symbol" || typeof a == "boolean") {
          l.removeAttribute(u);
          break;
        }
        (a = Ne("" + a)), l.setAttribute(u, a);
        break;
      case "onClick":
        a != null && (l.onclick = zn);
        break;
      case "onScroll":
        a != null && C("scroll", l);
        break;
      case "onScrollEnd":
        a != null && C("scrollend", l);
        break;
      case "dangerouslySetInnerHTML":
        if (a != null) {
          if (typeof a != "object" || !("__html" in a)) throw Error(o(61));
          if (((u = a.__html), u != null)) {
            if (e.children != null) throw Error(o(60));
            l.innerHTML = u;
          }
        }
        break;
      case "multiple":
        l.multiple = a && typeof a != "function" && typeof a != "symbol";
        break;
      case "muted":
        l.muted = a && typeof a != "function" && typeof a != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (
          a == null ||
          typeof a == "function" ||
          typeof a == "boolean" ||
          typeof a == "symbol"
        ) {
          l.removeAttribute("xlink:href");
          break;
        }
        (u = Ne("" + a)),
          l.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", u);
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        a != null && typeof a != "function" && typeof a != "symbol"
          ? l.setAttribute(u, "" + a)
          : l.removeAttribute(u);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        a && typeof a != "function" && typeof a != "symbol"
          ? l.setAttribute(u, "")
          : l.removeAttribute(u);
        break;
      case "capture":
      case "download":
        a === !0
          ? l.setAttribute(u, "")
          : a !== !1 &&
            a != null &&
            typeof a != "function" &&
            typeof a != "symbol"
          ? l.setAttribute(u, a)
          : l.removeAttribute(u);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        a != null &&
        typeof a != "function" &&
        typeof a != "symbol" &&
        !isNaN(a) &&
        1 <= a
          ? l.setAttribute(u, a)
          : l.removeAttribute(u);
        break;
      case "rowSpan":
      case "start":
        a == null || typeof a == "function" || typeof a == "symbol" || isNaN(a)
          ? l.removeAttribute(u)
          : l.setAttribute(u, a);
        break;
      case "popover":
        C("beforetoggle", l), C("toggle", l), Ue(l, "popover", a);
        break;
      case "xlinkActuate":
        Rt(l, "http://www.w3.org/1999/xlink", "xlink:actuate", a);
        break;
      case "xlinkArcrole":
        Rt(l, "http://www.w3.org/1999/xlink", "xlink:arcrole", a);
        break;
      case "xlinkRole":
        Rt(l, "http://www.w3.org/1999/xlink", "xlink:role", a);
        break;
      case "xlinkShow":
        Rt(l, "http://www.w3.org/1999/xlink", "xlink:show", a);
        break;
      case "xlinkTitle":
        Rt(l, "http://www.w3.org/1999/xlink", "xlink:title", a);
        break;
      case "xlinkType":
        Rt(l, "http://www.w3.org/1999/xlink", "xlink:type", a);
        break;
      case "xmlBase":
        Rt(l, "http://www.w3.org/XML/1998/namespace", "xml:base", a);
        break;
      case "xmlLang":
        Rt(l, "http://www.w3.org/XML/1998/namespace", "xml:lang", a);
        break;
      case "xmlSpace":
        Rt(l, "http://www.w3.org/XML/1998/namespace", "xml:space", a);
        break;
      case "is":
        Ue(l, "is", a);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < u.length) ||
          (u[0] !== "o" && u[0] !== "O") ||
          (u[1] !== "n" && u[1] !== "N")) &&
          ((u = yy.get(u) || u), Ue(l, u, a));
    }
  }
  function Hc(l, t, u, a, e, n) {
    switch (u) {
      case "style":
        ri(l, a, n);
        break;
      case "dangerouslySetInnerHTML":
        if (a != null) {
          if (typeof a != "object" || !("__html" in a)) throw Error(o(61));
          if (((u = a.__html), u != null)) {
            if (e.children != null) throw Error(o(60));
            l.innerHTML = u;
          }
        }
        break;
      case "children":
        typeof a == "string"
          ? Ju(l, a)
          : (typeof a == "number" || typeof a == "bigint") && Ju(l, "" + a);
        break;
      case "onScroll":
        a != null && C("scroll", l);
        break;
      case "onScrollEnd":
        a != null && C("scrollend", l);
        break;
      case "onClick":
        a != null && (l.onclick = zn);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!si.hasOwnProperty(u))
          l: {
            if (
              u[0] === "o" &&
              u[1] === "n" &&
              ((e = u.endsWith("Capture")),
              (t = u.slice(2, e ? u.length - 7 : void 0)),
              (n = l[Cl] || null),
              (n = n != null ? n[u] : null),
              typeof n == "function" && l.removeEventListener(t, n, e),
              typeof a == "function")
            ) {
              typeof n != "function" &&
                n !== null &&
                (u in l
                  ? (l[u] = null)
                  : l.hasAttribute(u) && l.removeAttribute(u)),
                l.addEventListener(t, a, e);
              break l;
            }
            u in l
              ? (l[u] = a)
              : a === !0
              ? l.setAttribute(u, "")
              : Ue(l, u, a);
          }
    }
  }
  function Rl(l, t, u) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        C("error", l), C("load", l);
        var a = !1,
          e = !1,
          n;
        for (n in u)
          if (u.hasOwnProperty(n)) {
            var f = u[n];
            if (f != null)
              switch (n) {
                case "src":
                  a = !0;
                  break;
                case "srcSet":
                  e = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(o(137, t));
                default:
                  F(l, t, n, f, u, null);
              }
          }
        e && F(l, t, "srcSet", u.srcSet, u, null),
          a && F(l, t, "src", u.src, u, null);
        return;
      case "input":
        C("invalid", l);
        var c = (n = f = e = null),
          i = null,
          y = null;
        for (a in u)
          if (u.hasOwnProperty(a)) {
            var g = u[a];
            if (g != null)
              switch (a) {
                case "name":
                  e = g;
                  break;
                case "type":
                  f = g;
                  break;
                case "checked":
                  i = g;
                  break;
                case "defaultChecked":
                  y = g;
                  break;
                case "value":
                  n = g;
                  break;
                case "defaultValue":
                  c = g;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (g != null) throw Error(o(137, t));
                  break;
                default:
                  F(l, t, a, g, u, null);
              }
          }
        mi(l, n, c, i, y, f, e, !1), He(l);
        return;
      case "select":
        C("invalid", l), (a = f = n = null);
        for (e in u)
          if (u.hasOwnProperty(e) && ((c = u[e]), c != null))
            switch (e) {
              case "value":
                n = c;
                break;
              case "defaultValue":
                f = c;
                break;
              case "multiple":
                a = c;
              default:
                F(l, t, e, c, u, null);
            }
        (t = n),
          (u = f),
          (l.multiple = !!a),
          t != null ? Ku(l, !!a, t, !1) : u != null && Ku(l, !!a, u, !0);
        return;
      case "textarea":
        C("invalid", l), (n = e = a = null);
        for (f in u)
          if (u.hasOwnProperty(f) && ((c = u[f]), c != null))
            switch (f) {
              case "value":
                a = c;
                break;
              case "defaultValue":
                e = c;
                break;
              case "children":
                n = c;
                break;
              case "dangerouslySetInnerHTML":
                if (c != null) throw Error(o(91));
                break;
              default:
                F(l, t, f, c, u, null);
            }
        Si(l, a, e, n), He(l);
        return;
      case "option":
        for (i in u)
          if (u.hasOwnProperty(i) && ((a = u[i]), a != null))
            switch (i) {
              case "selected":
                l.selected =
                  a && typeof a != "function" && typeof a != "symbol";
                break;
              default:
                F(l, t, i, a, u, null);
            }
        return;
      case "dialog":
        C("cancel", l), C("close", l);
        break;
      case "iframe":
      case "object":
        C("load", l);
        break;
      case "video":
      case "audio":
        for (a = 0; a < se.length; a++) C(se[a], l);
        break;
      case "image":
        C("error", l), C("load", l);
        break;
      case "details":
        C("toggle", l);
        break;
      case "embed":
      case "source":
      case "link":
        C("error", l), C("load", l);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (y in u)
          if (u.hasOwnProperty(y) && ((a = u[y]), a != null))
            switch (y) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(o(137, t));
              default:
                F(l, t, y, a, u, null);
            }
        return;
      default:
        if (Kn(t)) {
          for (g in u)
            u.hasOwnProperty(g) &&
              ((a = u[g]), a !== void 0 && Hc(l, t, g, a, u, void 0));
          return;
        }
    }
    for (c in u)
      u.hasOwnProperty(c) && ((a = u[c]), a != null && F(l, t, c, a, u, null));
  }
  function X1(l, t, u, a) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var e = null,
          n = null,
          f = null,
          c = null,
          i = null,
          y = null,
          g = null;
        for (S in u) {
          var b = u[S];
          if (u.hasOwnProperty(S) && b != null)
            switch (S) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                i = b;
              default:
                a.hasOwnProperty(S) || F(l, t, S, null, a, b);
            }
        }
        for (var m in a) {
          var S = a[m];
          if (((b = u[m]), a.hasOwnProperty(m) && (S != null || b != null)))
            switch (m) {
              case "type":
                n = S;
                break;
              case "name":
                e = S;
                break;
              case "checked":
                y = S;
                break;
              case "defaultChecked":
                g = S;
                break;
              case "value":
                f = S;
                break;
              case "defaultValue":
                c = S;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (S != null) throw Error(o(137, t));
                break;
              default:
                S !== b && F(l, t, m, S, a, b);
            }
        }
        xn(l, f, c, i, y, g, n, e);
        return;
      case "select":
        S = f = c = m = null;
        for (n in u)
          if (((i = u[n]), u.hasOwnProperty(n) && i != null))
            switch (n) {
              case "value":
                break;
              case "multiple":
                S = i;
              default:
                a.hasOwnProperty(n) || F(l, t, n, null, a, i);
            }
        for (e in a)
          if (
            ((n = a[e]),
            (i = u[e]),
            a.hasOwnProperty(e) && (n != null || i != null))
          )
            switch (e) {
              case "value":
                m = n;
                break;
              case "defaultValue":
                c = n;
                break;
              case "multiple":
                f = n;
              default:
                n !== i && F(l, t, e, n, a, i);
            }
        (t = c),
          (u = f),
          (a = S),
          m != null
            ? Ku(l, !!u, m, !1)
            : !!a != !!u &&
              (t != null ? Ku(l, !!u, t, !0) : Ku(l, !!u, u ? [] : "", !1));
        return;
      case "textarea":
        S = m = null;
        for (c in u)
          if (
            ((e = u[c]),
            u.hasOwnProperty(c) && e != null && !a.hasOwnProperty(c))
          )
            switch (c) {
              case "value":
                break;
              case "children":
                break;
              default:
                F(l, t, c, null, a, e);
            }
        for (f in a)
          if (
            ((e = a[f]),
            (n = u[f]),
            a.hasOwnProperty(f) && (e != null || n != null))
          )
            switch (f) {
              case "value":
                m = e;
                break;
              case "defaultValue":
                S = e;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (e != null) throw Error(o(91));
                break;
              default:
                e !== n && F(l, t, f, e, a, n);
            }
        oi(l, m, S);
        return;
      case "option":
        for (var D in u)
          if (
            ((m = u[D]),
            u.hasOwnProperty(D) && m != null && !a.hasOwnProperty(D))
          )
            switch (D) {
              case "selected":
                l.selected = !1;
                break;
              default:
                F(l, t, D, null, a, m);
            }
        for (i in a)
          if (
            ((m = a[i]),
            (S = u[i]),
            a.hasOwnProperty(i) && m !== S && (m != null || S != null))
          )
            switch (i) {
              case "selected":
                l.selected =
                  m && typeof m != "function" && typeof m != "symbol";
                break;
              default:
                F(l, t, i, m, a, S);
            }
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var B in u)
          (m = u[B]),
            u.hasOwnProperty(B) &&
              m != null &&
              !a.hasOwnProperty(B) &&
              F(l, t, B, null, a, m);
        for (y in a)
          if (
            ((m = a[y]),
            (S = u[y]),
            a.hasOwnProperty(y) && m !== S && (m != null || S != null))
          )
            switch (y) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (m != null) throw Error(o(137, t));
                break;
              default:
                F(l, t, y, m, a, S);
            }
        return;
      default:
        if (Kn(t)) {
          for (var vl in u)
            (m = u[vl]),
              u.hasOwnProperty(vl) &&
                m !== void 0 &&
                !a.hasOwnProperty(vl) &&
                Hc(l, t, vl, void 0, a, m);
          for (g in a)
            (m = a[g]),
              (S = u[g]),
              !a.hasOwnProperty(g) ||
                m === S ||
                (m === void 0 && S === void 0) ||
                Hc(l, t, g, m, a, S);
          return;
        }
    }
    for (var d in u)
      (m = u[d]),
        u.hasOwnProperty(d) &&
          m != null &&
          !a.hasOwnProperty(d) &&
          F(l, t, d, null, a, m);
    for (b in a)
      (m = a[b]),
        (S = u[b]),
        !a.hasOwnProperty(b) ||
          m === S ||
          (m == null && S == null) ||
          F(l, t, b, m, a, S);
  }
  var qc = null,
    Nc = null;
  function An(l) {
    return l.nodeType === 9 ? l : l.ownerDocument;
  }
  function sv(l) {
    switch (l) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function vv(l, t) {
    if (l === 0)
      switch (t) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return l === 1 && t === "foreignObject" ? 0 : l;
  }
  function Yc(l, t) {
    return (
      l === "textarea" ||
      l === "noscript" ||
      typeof t.children == "string" ||
      typeof t.children == "number" ||
      typeof t.children == "bigint" ||
      (typeof t.dangerouslySetInnerHTML == "object" &&
        t.dangerouslySetInnerHTML !== null &&
        t.dangerouslySetInnerHTML.__html != null)
    );
  }
  var Bc = null;
  function Q1() {
    var l = window.event;
    return l && l.type === "popstate"
      ? l === Bc
        ? !1
        : ((Bc = l), !0)
      : ((Bc = null), !1);
  }
  var yv = typeof setTimeout == "function" ? setTimeout : void 0,
    Z1 = typeof clearTimeout == "function" ? clearTimeout : void 0,
    dv = typeof Promise == "function" ? Promise : void 0,
    j1 =
      typeof queueMicrotask == "function"
        ? queueMicrotask
        : typeof dv < "u"
        ? function (l) {
            return dv.resolve(null).then(l).catch(C1);
          }
        : yv;
  function C1(l) {
    setTimeout(function () {
      throw l;
    });
  }
  function pc(l, t) {
    var u = t,
      a = 0;
    do {
      var e = u.nextSibling;
      if ((l.removeChild(u), e && e.nodeType === 8))
        if (((u = e.data), u === "/$")) {
          if (a === 0) {
            l.removeChild(e), re(t);
            return;
          }
          a--;
        } else (u !== "$" && u !== "$?" && u !== "$!") || a++;
      u = e;
    } while (u);
    re(t);
  }
  function Gc(l) {
    var t = l.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
      var u = t;
      switch (((t = t.nextSibling), u.nodeName)) {
        case "HTML":
        case "HEAD":
        case "BODY":
          Gc(u), Vn(u);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (u.rel.toLowerCase() === "stylesheet") continue;
      }
      l.removeChild(u);
    }
  }
  function V1(l, t, u, a) {
    for (; l.nodeType === 1; ) {
      var e = u;
      if (l.nodeName.toLowerCase() !== t.toLowerCase()) {
        if (!a && (l.nodeName !== "INPUT" || l.type !== "hidden")) break;
      } else if (a) {
        if (!l[Da])
          switch (t) {
            case "meta":
              if (!l.hasAttribute("itemprop")) break;
              return l;
            case "link":
              if (
                ((n = l.getAttribute("rel")),
                n === "stylesheet" && l.hasAttribute("data-precedence"))
              )
                break;
              if (
                n !== e.rel ||
                l.getAttribute("href") !== (e.href == null ? null : e.href) ||
                l.getAttribute("crossorigin") !==
                  (e.crossOrigin == null ? null : e.crossOrigin) ||
                l.getAttribute("title") !== (e.title == null ? null : e.title)
              )
                break;
              return l;
            case "style":
              if (l.hasAttribute("data-precedence")) break;
              return l;
            case "script":
              if (
                ((n = l.getAttribute("src")),
                (n !== (e.src == null ? null : e.src) ||
                  l.getAttribute("type") !== (e.type == null ? null : e.type) ||
                  l.getAttribute("crossorigin") !==
                    (e.crossOrigin == null ? null : e.crossOrigin)) &&
                  n &&
                  l.hasAttribute("async") &&
                  !l.hasAttribute("itemprop"))
              )
                break;
              return l;
            default:
              return l;
          }
      } else if (t === "input" && l.type === "hidden") {
        var n = e.name == null ? null : "" + e.name;
        if (e.type === "hidden" && l.getAttribute("name") === n) return l;
      } else return l;
      if (((l = St(l.nextSibling)), l === null)) break;
    }
    return null;
  }
  function x1(l, t, u) {
    if (t === "") return null;
    for (; l.nodeType !== 3; )
      if (
        ((l.nodeType !== 1 || l.nodeName !== "INPUT" || l.type !== "hidden") &&
          !u) ||
        ((l = St(l.nextSibling)), l === null)
      )
        return null;
    return l;
  }
  function St(l) {
    for (; l != null; l = l.nextSibling) {
      var t = l.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (
          ((t = l.data),
          t === "$" || t === "$!" || t === "$?" || t === "F!" || t === "F")
        )
          break;
        if (t === "/$") return null;
      }
    }
    return l;
  }
  function hv(l) {
    l = l.previousSibling;
    for (var t = 0; l; ) {
      if (l.nodeType === 8) {
        var u = l.data;
        if (u === "$" || u === "$!" || u === "$?") {
          if (t === 0) return l;
          t--;
        } else u === "/$" && t++;
      }
      l = l.previousSibling;
    }
    return null;
  }
  function mv(l, t, u) {
    switch (((t = An(u)), l)) {
      case "html":
        if (((l = t.documentElement), !l)) throw Error(o(452));
        return l;
      case "head":
        if (((l = t.head), !l)) throw Error(o(453));
        return l;
      case "body":
        if (((l = t.body), !l)) throw Error(o(454));
        return l;
      default:
        throw Error(o(451));
    }
  }
  var yt = new Map(),
    ov = new Set();
  function On(l) {
    return typeof l.getRootNode == "function"
      ? l.getRootNode()
      : l.ownerDocument;
  }
  var Lt = A.d;
  A.d = { f: L1, r: K1, D: J1, C: w1, L: W1, m: $1, X: F1, S: k1, M: P1 };
  function L1() {
    var l = Lt.f(),
      t = Sn();
    return l || t;
  }
  function K1(l) {
    var t = Vu(l);
    t !== null && t.tag === 5 && t.type === "form" ? V0(t) : Lt.r(l);
  }
  var ba = typeof document > "u" ? null : document;
  function Sv(l, t, u) {
    var a = ba;
    if (a && typeof t == "string" && t) {
      var e = tt(t);
      (e = 'link[rel="' + l + '"][href="' + e + '"]'),
        typeof u == "string" && (e += '[crossorigin="' + u + '"]'),
        ov.has(e) ||
          (ov.add(e),
          (l = { rel: l, crossOrigin: u, href: t }),
          a.querySelector(e) === null &&
            ((t = a.createElement("link")),
            Rl(t, "link", l),
            zl(t),
            a.head.appendChild(t)));
    }
  }
  function J1(l) {
    Lt.D(l), Sv("dns-prefetch", l, null);
  }
  function w1(l, t) {
    Lt.C(l, t), Sv("preconnect", l, t);
  }
  function W1(l, t, u) {
    Lt.L(l, t, u);
    var a = ba;
    if (a && l && t) {
      var e = 'link[rel="preload"][as="' + tt(t) + '"]';
      t === "image" && u && u.imageSrcSet
        ? ((e += '[imagesrcset="' + tt(u.imageSrcSet) + '"]'),
          typeof u.imageSizes == "string" &&
            (e += '[imagesizes="' + tt(u.imageSizes) + '"]'))
        : (e += '[href="' + tt(l) + '"]');
      var n = e;
      switch (t) {
        case "style":
          n = Ea(l);
          break;
        case "script":
          n = Ta(l);
      }
      yt.has(n) ||
        ((l = W(
          {
            rel: "preload",
            href: t === "image" && u && u.imageSrcSet ? void 0 : l,
            as: t,
          },
          u
        )),
        yt.set(n, l),
        a.querySelector(e) !== null ||
          (t === "style" && a.querySelector(ye(n))) ||
          (t === "script" && a.querySelector(de(n))) ||
          ((t = a.createElement("link")),
          Rl(t, "link", l),
          zl(t),
          a.head.appendChild(t)));
    }
  }
  function $1(l, t) {
    Lt.m(l, t);
    var u = ba;
    if (u && l) {
      var a = t && typeof t.as == "string" ? t.as : "script",
        e =
          'link[rel="modulepreload"][as="' + tt(a) + '"][href="' + tt(l) + '"]',
        n = e;
      switch (a) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          n = Ta(l);
      }
      if (
        !yt.has(n) &&
        ((l = W({ rel: "modulepreload", href: l }, t)),
        yt.set(n, l),
        u.querySelector(e) === null)
      ) {
        switch (a) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (u.querySelector(de(n))) return;
        }
        (a = u.createElement("link")),
          Rl(a, "link", l),
          zl(a),
          u.head.appendChild(a);
      }
    }
  }
  function k1(l, t, u) {
    Lt.S(l, t, u);
    var a = ba;
    if (a && l) {
      var e = xu(a).hoistableStyles,
        n = Ea(l);
      t = t || "default";
      var f = e.get(n);
      if (!f) {
        var c = { loading: 0, preload: null };
        if ((f = a.querySelector(ye(n)))) c.loading = 5;
        else {
          (l = W({ rel: "stylesheet", href: l, "data-precedence": t }, u)),
            (u = yt.get(n)) && Xc(l, u);
          var i = (f = a.createElement("link"));
          zl(i),
            Rl(i, "link", l),
            (i._p = new Promise(function (y, g) {
              (i.onload = y), (i.onerror = g);
            })),
            i.addEventListener("load", function () {
              c.loading |= 1;
            }),
            i.addEventListener("error", function () {
              c.loading |= 2;
            }),
            (c.loading |= 4),
            _n(f, t, a);
        }
        (f = { type: "stylesheet", instance: f, count: 1, state: c }),
          e.set(n, f);
      }
    }
  }
  function F1(l, t) {
    Lt.X(l, t);
    var u = ba;
    if (u && l) {
      var a = xu(u).hoistableScripts,
        e = Ta(l),
        n = a.get(e);
      n ||
        ((n = u.querySelector(de(e))),
        n ||
          ((l = W({ src: l, async: !0 }, t)),
          (t = yt.get(e)) && Qc(l, t),
          (n = u.createElement("script")),
          zl(n),
          Rl(n, "link", l),
          u.head.appendChild(n)),
        (n = { type: "script", instance: n, count: 1, state: null }),
        a.set(e, n));
    }
  }
  function P1(l, t) {
    Lt.M(l, t);
    var u = ba;
    if (u && l) {
      var a = xu(u).hoistableScripts,
        e = Ta(l),
        n = a.get(e);
      n ||
        ((n = u.querySelector(de(e))),
        n ||
          ((l = W({ src: l, async: !0, type: "module" }, t)),
          (t = yt.get(e)) && Qc(l, t),
          (n = u.createElement("script")),
          zl(n),
          Rl(n, "link", l),
          u.head.appendChild(n)),
        (n = { type: "script", instance: n, count: 1, state: null }),
        a.set(e, n));
    }
  }
  function gv(l, t, u, a) {
    var e = (e = Wt.current) ? On(e) : null;
    if (!e) throw Error(o(446));
    switch (l) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof u.precedence == "string" && typeof u.href == "string"
          ? ((t = Ea(u.href)),
            (u = xu(e).hoistableStyles),
            (a = u.get(t)),
            a ||
              ((a = { type: "style", instance: null, count: 0, state: null }),
              u.set(t, a)),
            a)
          : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (
          u.rel === "stylesheet" &&
          typeof u.href == "string" &&
          typeof u.precedence == "string"
        ) {
          l = Ea(u.href);
          var n = xu(e).hoistableStyles,
            f = n.get(l);
          if (
            (f ||
              ((e = e.ownerDocument || e),
              (f = {
                type: "stylesheet",
                instance: null,
                count: 0,
                state: { loading: 0, preload: null },
              }),
              n.set(l, f),
              (n = e.querySelector(ye(l))) &&
                !n._p &&
                ((f.instance = n), (f.state.loading = 5)),
              yt.has(l) ||
                ((u = {
                  rel: "preload",
                  as: "style",
                  href: u.href,
                  crossOrigin: u.crossOrigin,
                  integrity: u.integrity,
                  media: u.media,
                  hrefLang: u.hrefLang,
                  referrerPolicy: u.referrerPolicy,
                }),
                yt.set(l, u),
                n || I1(e, l, u, f.state))),
            t && a === null)
          )
            throw Error(o(528, ""));
          return f;
        }
        if (t && a !== null) throw Error(o(529, ""));
        return null;
      case "script":
        return (
          (t = u.async),
          (u = u.src),
          typeof u == "string" &&
          t &&
          typeof t != "function" &&
          typeof t != "symbol"
            ? ((t = Ta(u)),
              (u = xu(e).hoistableScripts),
              (a = u.get(t)),
              a ||
                ((a = {
                  type: "script",
                  instance: null,
                  count: 0,
                  state: null,
                }),
                u.set(t, a)),
              a)
            : { type: "void", instance: null, count: 0, state: null }
        );
      default:
        throw Error(o(444, l));
    }
  }
  function Ea(l) {
    return 'href="' + tt(l) + '"';
  }
  function ye(l) {
    return 'link[rel="stylesheet"][' + l + "]";
  }
  function rv(l) {
    return W({}, l, { "data-precedence": l.precedence, precedence: null });
  }
  function I1(l, t, u, a) {
    l.querySelector('link[rel="preload"][as="style"][' + t + "]")
      ? (a.loading = 1)
      : ((t = l.createElement("link")),
        (a.preload = t),
        t.addEventListener("load", function () {
          return (a.loading |= 1);
        }),
        t.addEventListener("error", function () {
          return (a.loading |= 2);
        }),
        Rl(t, "link", u),
        zl(t),
        l.head.appendChild(t));
  }
  function Ta(l) {
    return '[src="' + tt(l) + '"]';
  }
  function de(l) {
    return "script[async]" + l;
  }
  function bv(l, t, u) {
    if ((t.count++, t.instance === null))
      switch (t.type) {
        case "style":
          var a = l.querySelector('style[data-href~="' + tt(u.href) + '"]');
          if (a) return (t.instance = a), zl(a), a;
          var e = W({}, u, {
            "data-href": u.href,
            "data-precedence": u.precedence,
            href: null,
            precedence: null,
          });
          return (
            (a = (l.ownerDocument || l).createElement("style")),
            zl(a),
            Rl(a, "style", e),
            _n(a, u.precedence, l),
            (t.instance = a)
          );
        case "stylesheet":
          e = Ea(u.href);
          var n = l.querySelector(ye(e));
          if (n) return (t.state.loading |= 4), (t.instance = n), zl(n), n;
          (a = rv(u)),
            (e = yt.get(e)) && Xc(a, e),
            (n = (l.ownerDocument || l).createElement("link")),
            zl(n);
          var f = n;
          return (
            (f._p = new Promise(function (c, i) {
              (f.onload = c), (f.onerror = i);
            })),
            Rl(n, "link", a),
            (t.state.loading |= 4),
            _n(n, u.precedence, l),
            (t.instance = n)
          );
        case "script":
          return (
            (n = Ta(u.src)),
            (e = l.querySelector(de(n)))
              ? ((t.instance = e), zl(e), e)
              : ((a = u),
                (e = yt.get(n)) && ((a = W({}, u)), Qc(a, e)),
                (l = l.ownerDocument || l),
                (e = l.createElement("script")),
                zl(e),
                Rl(e, "link", a),
                l.head.appendChild(e),
                (t.instance = e))
          );
        case "void":
          return null;
        default:
          throw Error(o(443, t.type));
      }
    else
      t.type === "stylesheet" &&
        !(t.state.loading & 4) &&
        ((a = t.instance), (t.state.loading |= 4), _n(a, u.precedence, l));
    return t.instance;
  }
  function _n(l, t, u) {
    for (
      var a = u.querySelectorAll(
          'link[rel="stylesheet"][data-precedence],style[data-precedence]'
        ),
        e = a.length ? a[a.length - 1] : null,
        n = e,
        f = 0;
      f < a.length;
      f++
    ) {
      var c = a[f];
      if (c.dataset.precedence === t) n = c;
      else if (n !== e) break;
    }
    n
      ? n.parentNode.insertBefore(l, n.nextSibling)
      : ((t = u.nodeType === 9 ? u.head : u), t.insertBefore(l, t.firstChild));
  }
  function Xc(l, t) {
    l.crossOrigin == null && (l.crossOrigin = t.crossOrigin),
      l.referrerPolicy == null && (l.referrerPolicy = t.referrerPolicy),
      l.title == null && (l.title = t.title);
  }
  function Qc(l, t) {
    l.crossOrigin == null && (l.crossOrigin = t.crossOrigin),
      l.referrerPolicy == null && (l.referrerPolicy = t.referrerPolicy),
      l.integrity == null && (l.integrity = t.integrity);
  }
  var Dn = null;
  function Ev(l, t, u) {
    if (Dn === null) {
      var a = new Map(),
        e = (Dn = new Map());
      e.set(u, a);
    } else (e = Dn), (a = e.get(u)), a || ((a = new Map()), e.set(u, a));
    if (a.has(l)) return a;
    for (
      a.set(l, null), u = u.getElementsByTagName(l), e = 0;
      e < u.length;
      e++
    ) {
      var n = u[e];
      if (
        !(
          n[Da] ||
          n[Hl] ||
          (l === "link" && n.getAttribute("rel") === "stylesheet")
        ) &&
        n.namespaceURI !== "http://www.w3.org/2000/svg"
      ) {
        var f = n.getAttribute(t) || "";
        f = l + f;
        var c = a.get(f);
        c ? c.push(n) : a.set(f, [n]);
      }
    }
    return a;
  }
  function Tv(l, t, u) {
    (l = l.ownerDocument || l),
      l.head.insertBefore(
        u,
        t === "title" ? l.querySelector("head > title") : null
      );
  }
  function ld(l, t, u) {
    if (u === 1 || t.itemProp != null) return !1;
    switch (l) {
      case "meta":
      case "title":
        return !0;
      case "style":
        if (
          typeof t.precedence != "string" ||
          typeof t.href != "string" ||
          t.href === ""
        )
          break;
        return !0;
      case "link":
        if (
          typeof t.rel != "string" ||
          typeof t.href != "string" ||
          t.href === "" ||
          t.onLoad ||
          t.onError
        )
          break;
        switch (t.rel) {
          case "stylesheet":
            return (
              (l = t.disabled), typeof t.precedence == "string" && l == null
            );
          default:
            return !0;
        }
      case "script":
        if (
          t.async &&
          typeof t.async != "function" &&
          typeof t.async != "symbol" &&
          !t.onLoad &&
          !t.onError &&
          t.src &&
          typeof t.src == "string"
        )
          return !0;
    }
    return !1;
  }
  function zv(l) {
    return !(l.type === "stylesheet" && !(l.state.loading & 3));
  }
  var he = null;
  function td() {}
  function ud(l, t, u) {
    if (he === null) throw Error(o(475));
    var a = he;
    if (
      t.type === "stylesheet" &&
      (typeof u.media != "string" || matchMedia(u.media).matches !== !1) &&
      !(t.state.loading & 4)
    ) {
      if (t.instance === null) {
        var e = Ea(u.href),
          n = l.querySelector(ye(e));
        if (n) {
          (l = n._p),
            l !== null &&
              typeof l == "object" &&
              typeof l.then == "function" &&
              (a.count++, (a = Mn.bind(a)), l.then(a, a)),
            (t.state.loading |= 4),
            (t.instance = n),
            zl(n);
          return;
        }
        (n = l.ownerDocument || l),
          (u = rv(u)),
          (e = yt.get(e)) && Xc(u, e),
          (n = n.createElement("link")),
          zl(n);
        var f = n;
        (f._p = new Promise(function (c, i) {
          (f.onload = c), (f.onerror = i);
        })),
          Rl(n, "link", u),
          (t.instance = n);
      }
      a.stylesheets === null && (a.stylesheets = new Map()),
        a.stylesheets.set(t, l),
        (l = t.state.preload) &&
          !(t.state.loading & 3) &&
          (a.count++,
          (t = Mn.bind(a)),
          l.addEventListener("load", t),
          l.addEventListener("error", t));
    }
  }
  function ad() {
    if (he === null) throw Error(o(475));
    var l = he;
    return (
      l.stylesheets && l.count === 0 && Zc(l, l.stylesheets),
      0 < l.count
        ? function (t) {
            var u = setTimeout(function () {
              if ((l.stylesheets && Zc(l, l.stylesheets), l.unsuspend)) {
                var a = l.unsuspend;
                (l.unsuspend = null), a();
              }
            }, 6e4);
            return (
              (l.unsuspend = t),
              function () {
                (l.unsuspend = null), clearTimeout(u);
              }
            );
          }
        : null
    );
  }
  function Mn() {
    if ((this.count--, this.count === 0)) {
      if (this.stylesheets) Zc(this, this.stylesheets);
      else if (this.unsuspend) {
        var l = this.unsuspend;
        (this.unsuspend = null), l();
      }
    }
  }
  var Un = null;
  function Zc(l, t) {
    (l.stylesheets = null),
      l.unsuspend !== null &&
        (l.count++,
        (Un = new Map()),
        t.forEach(ed, l),
        (Un = null),
        Mn.call(l));
  }
  function ed(l, t) {
    if (!(t.state.loading & 4)) {
      var u = Un.get(l);
      if (u) var a = u.get(null);
      else {
        (u = new Map()), Un.set(l, u);
        for (
          var e = l.querySelectorAll(
              "link[data-precedence],style[data-precedence]"
            ),
            n = 0;
          n < e.length;
          n++
        ) {
          var f = e[n];
          (f.nodeName === "LINK" || f.getAttribute("media") !== "not all") &&
            (u.set(f.dataset.precedence, f), (a = f));
        }
        a && u.set(null, a);
      }
      (e = t.instance),
        (f = e.getAttribute("data-precedence")),
        (n = u.get(f) || a),
        n === a && u.set(null, e),
        u.set(f, e),
        this.count++,
        (a = Mn.bind(this)),
        e.addEventListener("load", a),
        e.addEventListener("error", a),
        n
          ? n.parentNode.insertBefore(e, n.nextSibling)
          : ((l = l.nodeType === 9 ? l.head : l),
            l.insertBefore(e, l.firstChild)),
        (t.state.loading |= 4);
    }
  }
  var me = {
    $$typeof: hl,
    Provider: null,
    Consumer: null,
    _currentValue: V,
    _currentValue2: V,
    _threadCount: 0,
  };
  function nd(l, t, u, a, e, n, f, c) {
    (this.tag = 1),
      (this.containerInfo = l),
      (this.finishedWork =
        this.pingCache =
        this.current =
        this.pendingChildren =
          null),
      (this.timeoutHandle = -1),
      (this.callbackNode =
        this.next =
        this.pendingContext =
        this.context =
        this.cancelPendingCommit =
          null),
      (this.callbackPriority = 0),
      (this.expirationTimes = jn(-1)),
      (this.entangledLanes =
        this.shellSuspendCounter =
        this.errorRecoveryDisabledLanes =
        this.finishedLanes =
        this.expiredLanes =
        this.warmLanes =
        this.pingedLanes =
        this.suspendedLanes =
        this.pendingLanes =
          0),
      (this.entanglements = jn(0)),
      (this.hiddenUpdates = jn(null)),
      (this.identifierPrefix = a),
      (this.onUncaughtError = e),
      (this.onCaughtError = n),
      (this.onRecoverableError = f),
      (this.pooledCache = null),
      (this.pooledCacheLanes = 0),
      (this.formState = c),
      (this.incompleteTransitions = new Map());
  }
  function Av(l, t, u, a, e, n, f, c, i, y, g, b) {
    return (
      (l = new nd(l, t, u, f, c, i, y, b)),
      (t = 1),
      n === !0 && (t |= 24),
      (n = st(3, null, null, t)),
      (l.current = n),
      (n.stateNode = l),
      (t = gf()),
      t.refCount++,
      (l.pooledCache = t),
      t.refCount++,
      (n.memoizedState = { element: a, isDehydrated: u, cache: t }),
      Ff(n),
      l
    );
  }
  function Ov(l) {
    return l ? ((l = Iu), l) : Iu;
  }
  function _v(l, t, u, a, e, n) {
    (e = Ov(e)),
      a.context === null ? (a.context = e) : (a.pendingContext = e),
      (a = nu(t)),
      (a.payload = { element: u }),
      (n = n === void 0 ? null : n),
      n !== null && (a.callback = n),
      (u = fu(l, a, t)),
      u !== null && (Xl(u, l, t), Fa(u, l, t));
  }
  function Dv(l, t) {
    if (((l = l.memoizedState), l !== null && l.dehydrated !== null)) {
      var u = l.retryLane;
      l.retryLane = u !== 0 && u < t ? u : t;
    }
  }
  function jc(l, t) {
    Dv(l, t), (l = l.alternate) && Dv(l, t);
  }
  function Mv(l) {
    if (l.tag === 13) {
      var t = Pt(l, 67108864);
      t !== null && Xl(t, l, 67108864), jc(l, 67108864);
    }
  }
  var Rn = !0;
  function fd(l, t, u, a) {
    var e = q.T;
    q.T = null;
    var n = A.p;
    try {
      (A.p = 2), Cc(l, t, u, a);
    } finally {
      (A.p = n), (q.T = e);
    }
  }
  function cd(l, t, u, a) {
    var e = q.T;
    q.T = null;
    var n = A.p;
    try {
      (A.p = 8), Cc(l, t, u, a);
    } finally {
      (A.p = n), (q.T = e);
    }
  }
  function Cc(l, t, u, a) {
    if (Rn) {
      var e = Vc(a);
      if (e === null) Rc(l, t, a, Hn, u), Rv(l, a);
      else if (sd(e, l, t, u, a)) a.stopPropagation();
      else if ((Rv(l, a), t & 4 && -1 < id.indexOf(l))) {
        for (; e !== null; ) {
          var n = Vu(e);
          if (n !== null)
            switch (n.tag) {
              case 3:
                if (((n = n.stateNode), n.current.memoizedState.isDehydrated)) {
                  var f = ru(n.pendingLanes);
                  if (f !== 0) {
                    var c = n;
                    for (c.pendingLanes |= 2, c.entangledLanes |= 2; f; ) {
                      var i = 1 << (31 - Jl(f));
                      (c.entanglements[1] |= i), (f &= ~i);
                    }
                    Ot(n), !(cl & 6) && ((hn = bt() + 500), ie(0));
                  }
                }
                break;
              case 13:
                (c = Pt(n, 2)), c !== null && Xl(c, n, 2), Sn(), jc(n, 2);
            }
          if (((n = Vc(a)), n === null && Rc(l, t, a, Hn, u), n === e)) break;
          e = n;
        }
        e !== null && a.stopPropagation();
      } else Rc(l, t, a, null, u);
    }
  }
  function Vc(l) {
    return (l = wn(l)), xc(l);
  }
  var Hn = null;
  function xc(l) {
    if (((Hn = null), (l = bu(l)), l !== null)) {
      var t = Y(l);
      if (t === null) l = null;
      else {
        var u = t.tag;
        if (u === 13) {
          if (((l = ll(t)), l !== null)) return l;
          l = null;
        } else if (u === 3) {
          if (t.stateNode.current.memoizedState.isDehydrated)
            return t.tag === 3 ? t.stateNode.containerInfo : null;
          l = null;
        } else t !== l && (l = null);
      }
    }
    return (Hn = l), null;
  }
  function Uv(l) {
    switch (l) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (wv()) {
          case Pc:
            return 2;
          case Ic:
            return 8;
          case Oe:
          case Wv:
            return 32;
          case li:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var Lc = !1,
    hu = null,
    mu = null,
    ou = null,
    oe = new Map(),
    Se = new Map(),
    Su = [],
    id =
      "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
        " "
      );
  function Rv(l, t) {
    switch (l) {
      case "focusin":
      case "focusout":
        hu = null;
        break;
      case "dragenter":
      case "dragleave":
        mu = null;
        break;
      case "mouseover":
      case "mouseout":
        ou = null;
        break;
      case "pointerover":
      case "pointerout":
        oe.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Se.delete(t.pointerId);
    }
  }
  function ge(l, t, u, a, e, n) {
    return l === null || l.nativeEvent !== n
      ? ((l = {
          blockedOn: t,
          domEventName: u,
          eventSystemFlags: a,
          nativeEvent: n,
          targetContainers: [e],
        }),
        t !== null && ((t = Vu(t)), t !== null && Mv(t)),
        l)
      : ((l.eventSystemFlags |= a),
        (t = l.targetContainers),
        e !== null && t.indexOf(e) === -1 && t.push(e),
        l);
  }
  function sd(l, t, u, a, e) {
    switch (t) {
      case "focusin":
        return (hu = ge(hu, l, t, u, a, e)), !0;
      case "dragenter":
        return (mu = ge(mu, l, t, u, a, e)), !0;
      case "mouseover":
        return (ou = ge(ou, l, t, u, a, e)), !0;
      case "pointerover":
        var n = e.pointerId;
        return oe.set(n, ge(oe.get(n) || null, l, t, u, a, e)), !0;
      case "gotpointercapture":
        return (
          (n = e.pointerId), Se.set(n, ge(Se.get(n) || null, l, t, u, a, e)), !0
        );
    }
    return !1;
  }
  function Hv(l) {
    var t = bu(l.target);
    if (t !== null) {
      var u = Y(t);
      if (u !== null) {
        if (((t = u.tag), t === 13)) {
          if (((t = ll(u)), t !== null)) {
            (l.blockedOn = t),
              ay(l.priority, function () {
                if (u.tag === 13) {
                  var a = Fl(),
                    e = Pt(u, a);
                  e !== null && Xl(e, u, a), jc(u, a);
                }
              });
            return;
          }
        } else if (t === 3 && u.stateNode.current.memoizedState.isDehydrated) {
          l.blockedOn = u.tag === 3 ? u.stateNode.containerInfo : null;
          return;
        }
      }
    }
    l.blockedOn = null;
  }
  function qn(l) {
    if (l.blockedOn !== null) return !1;
    for (var t = l.targetContainers; 0 < t.length; ) {
      var u = Vc(l.nativeEvent);
      if (u === null) {
        u = l.nativeEvent;
        var a = new u.constructor(u.type, u);
        (Jn = a), u.target.dispatchEvent(a), (Jn = null);
      } else return (t = Vu(u)), t !== null && Mv(t), (l.blockedOn = u), !1;
      t.shift();
    }
    return !0;
  }
  function qv(l, t, u) {
    qn(l) && u.delete(t);
  }
  function vd() {
    (Lc = !1),
      hu !== null && qn(hu) && (hu = null),
      mu !== null && qn(mu) && (mu = null),
      ou !== null && qn(ou) && (ou = null),
      oe.forEach(qv),
      Se.forEach(qv);
  }
  function Nn(l, t) {
    l.blockedOn === t &&
      ((l.blockedOn = null),
      Lc ||
        ((Lc = !0),
        _.unstable_scheduleCallback(_.unstable_NormalPriority, vd)));
  }
  var Yn = null;
  function Nv(l) {
    Yn !== l &&
      ((Yn = l),
      _.unstable_scheduleCallback(_.unstable_NormalPriority, function () {
        Yn === l && (Yn = null);
        for (var t = 0; t < l.length; t += 3) {
          var u = l[t],
            a = l[t + 1],
            e = l[t + 2];
          if (typeof a != "function") {
            if (xc(a || u) === null) continue;
            break;
          }
          var n = Vu(u);
          n !== null &&
            (l.splice(t, 3),
            (t -= 3),
            Yf(n, { pending: !0, data: e, method: u.method, action: a }, a, e));
        }
      }));
  }
  function re(l) {
    function t(i) {
      return Nn(i, l);
    }
    hu !== null && Nn(hu, l),
      mu !== null && Nn(mu, l),
      ou !== null && Nn(ou, l),
      oe.forEach(t),
      Se.forEach(t);
    for (var u = 0; u < Su.length; u++) {
      var a = Su[u];
      a.blockedOn === l && (a.blockedOn = null);
    }
    for (; 0 < Su.length && ((u = Su[0]), u.blockedOn === null); )
      Hv(u), u.blockedOn === null && Su.shift();
    if (((u = (l.ownerDocument || l).$$reactFormReplay), u != null))
      for (a = 0; a < u.length; a += 3) {
        var e = u[a],
          n = u[a + 1],
          f = e[Cl] || null;
        if (typeof n == "function") f || Nv(u);
        else if (f) {
          var c = null;
          if (n && n.hasAttribute("formAction")) {
            if (((e = n), (f = n[Cl] || null))) c = f.formAction;
            else if (xc(e) !== null) continue;
          } else c = f.action;
          typeof c == "function" ? (u[a + 1] = c) : (u.splice(a, 3), (a -= 3)),
            Nv(u);
        }
      }
  }
  function Kc(l) {
    this._internalRoot = l;
  }
  (Bn.prototype.render = Kc.prototype.render =
    function (l) {
      console.log("[TREX React Client] Rendering React root...", l);
      var t = this._internalRoot;
      if (t === null) throw Error(o(409));
      var u = t.current,
        a = Fl();
      _v(u, a, l, t, null, null);
    }),
    (Bn.prototype.unmount = Kc.prototype.unmount =
      function () {
        console.log("[TREX React Client] Unmounting React root...");
        var l = this._internalRoot;
        if (l !== null) {
          this._internalRoot = null;
          var t = l.containerInfo;
          l.tag === 0 && Sa(),
            _v(l.current, 2, null, l, null, null),
            Sn(),
            (t[Cu] = null);
        }
      });
  function Bn(l) {
    this._internalRoot = l;
  }
  Bn.prototype.unstable_scheduleHydration = function (l) {
    if (l) {
      var t = fi();
      l = { blockedOn: null, target: l, priority: t };
      for (var u = 0; u < Su.length && t !== 0 && t < Su[u].priority; u++);
      Su.splice(u, 0, l), u === 0 && Hv(l);
    }
  };
  var Yv = Dl.version;
  if (Yv !== "19.0.0") throw Error(o(527, Yv, "19.0.0"));
  A.findDOMNode = function (l) {
    var t = l._reactInternals;
    if (t === void 0)
      throw typeof l.render == "function"
        ? Error(o(188))
        : ((l = Object.keys(l).join(",")), Error(o(268, l)));
    return (
      (l = T(t)),
      (l = l !== null ? N(l) : null),
      (l = l === null ? null : l.stateNode),
      l
    );
  };
  var yd = {
    bundleType: 0,
    version: "19.0.0",
    rendererPackageName: "react-dom",
    currentDispatcherRef: q,
    findFiberByHostInstance: bu,
    reconcilerVersion: "19.0.0",
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var pn = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!pn.isDisabled && pn.supportsFiber)
      try {
        (Aa = pn.inject(yd)), (Kl = pn);
      } catch {}
  }
  return (
    (Ee.createRoot = function (l, t) {
      console.log("[TREX React Client] Creating React root:", l, t);
      if (!yl(l)) throw Error(o(299));
      var u = !1,
        a = "",
        e = k0,
        n = F0,
        f = P0,
        c = null;
      return (
        t != null &&
          (t.unstable_strictMode === !0 && (u = !0),
          t.identifierPrefix !== void 0 && (a = t.identifierPrefix),
          t.onUncaughtError !== void 0 && (e = t.onUncaughtError),
          t.onCaughtError !== void 0 && (n = t.onCaughtError),
          t.onRecoverableError !== void 0 && (f = t.onRecoverableError),
          t.unstable_transitionCallbacks !== void 0 &&
            (c = t.unstable_transitionCallbacks)),
        (t = Av(l, 1, !1, null, null, u, a, e, n, f, c, null)),
        (l[Cu] = t.current),
        Uc(l.nodeType === 8 ? l.parentNode : l),
        new Kc(t)
      );
    }),
    (Ee.hydrateRoot = function (l, t, u) {
      console.log("[TREX React Client] Creating hydrated React root:", l, t, u);
      if (!yl(l)) throw Error(o(299));
      var a = !1,
        e = "",
        n = k0,
        f = F0,
        c = P0,
        i = null,
        y = null;
      return (
        u != null &&
          (u.unstable_strictMode === !0 && (a = !0),
          u.identifierPrefix !== void 0 && (e = u.identifierPrefix),
          u.onUncaughtError !== void 0 && (n = u.onUncaughtError),
          u.onCaughtError !== void 0 && (f = u.onCaughtError),
          u.onRecoverableError !== void 0 && (c = u.onRecoverableError),
          u.unstable_transitionCallbacks !== void 0 &&
            (i = u.unstable_transitionCallbacks),
          u.formState !== void 0 && (y = u.formState)),
        (t = Av(l, 1, !0, t, u ?? null, a, e, n, f, c, i, y)),
        (t.context = Ov(null)),
        (u = t.current),
        (a = Fl()),
        (e = nu(a)),
        (e.callback = null),
        fu(u, e, a),
        (t.current.lanes = a),
        _a(t, a),
        Ot(t),
        (l[Cu] = t.current),
        Uc(l),
        new Bn(t)
      );
    }),
    (Ee.version = "19.0.0"),
    Ee
  );
}
var xv;
function Td() {
  if (xv) return wc.exports;
  xv = 1;
  function _() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(_);
      } catch (Dl) {
        console.error(Dl);
      }
  }
  return _(), (wc.exports = Ed()), wc.exports;
}
var Ad = Td();
console.log(
  "[TREX React Client] ✅ React client bundle fully loaded and exported!"
);
export { Lv as a, Ad as c, zd as j, bd as r };
