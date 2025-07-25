import { g as getDefaultExportFromCjs } from "./_commonjsHelpers-BosuxZz1.js";
import { r as reactExports, R as React } from "./index-D91ASeLC.js";
var lottie$2 = { exports: {} },
  lottie$1 = lottie$2.exports,
  hasRequiredLottie;
function requireLottie() {
  return (
    hasRequiredLottie ||
      ((hasRequiredLottie = 1),
      (function (module, exports) {
        typeof navigator < "u" &&
          (function (t, e) {
            module.exports = e();
          })(lottie$1, function () {
            var svgNS = "http://www.w3.org/2000/svg",
              locationHref = "",
              _useWebWorker = !1,
              initialDefaultFrame = -999999,
              setWebWorker = function (e) {
                _useWebWorker = !!e;
              },
              getWebWorker = function () {
                return _useWebWorker;
              },
              setLocationHref = function (e) {
                locationHref = e;
              },
              getLocationHref = function () {
                return locationHref;
              };
            function createTag(t) {
              return document.createElement(t);
            }
            function extendPrototype(t, e) {
              var r,
                i = t.length,
                s;
              for (r = 0; r < i; r += 1) {
                s = t[r].prototype;
                for (var n in s)
                  Object.prototype.hasOwnProperty.call(s, n) &&
                    (e.prototype[n] = s[n]);
              }
            }
            function getDescriptor(t, e) {
              return Object.getOwnPropertyDescriptor(t, e);
            }
            function createProxyFunction(t) {
              function e() {}
              return (e.prototype = t), e;
            }
            var audioControllerFactory = (function () {
                function t(e) {
                  (this.audios = []),
                    (this.audioFactory = e),
                    (this._volume = 1),
                    (this._isMuted = !1);
                }
                return (
                  (t.prototype = {
                    addAudio: function (r) {
                      this.audios.push(r);
                    },
                    pause: function () {
                      var r,
                        i = this.audios.length;
                      for (r = 0; r < i; r += 1) this.audios[r].pause();
                    },
                    resume: function () {
                      var r,
                        i = this.audios.length;
                      for (r = 0; r < i; r += 1) this.audios[r].resume();
                    },
                    setRate: function (r) {
                      var i,
                        s = this.audios.length;
                      for (i = 0; i < s; i += 1) this.audios[i].setRate(r);
                    },
                    createAudio: function (r) {
                      return this.audioFactory
                        ? this.audioFactory(r)
                        : window.Howl
                        ? new window.Howl({ src: [r] })
                        : {
                            isPlaying: !1,
                            play: function () {
                              this.isPlaying = !0;
                            },
                            seek: function () {
                              this.isPlaying = !1;
                            },
                            playing: function () {},
                            rate: function () {},
                            setVolume: function () {},
                          };
                    },
                    setAudioFactory: function (r) {
                      this.audioFactory = r;
                    },
                    setVolume: function (r) {
                      (this._volume = r), this._updateVolume();
                    },
                    mute: function () {
                      (this._isMuted = !0), this._updateVolume();
                    },
                    unmute: function () {
                      (this._isMuted = !1), this._updateVolume();
                    },
                    getVolume: function () {
                      return this._volume;
                    },
                    _updateVolume: function () {
                      var r,
                        i = this.audios.length;
                      for (r = 0; r < i; r += 1)
                        this.audios[r].volume(
                          this._volume * (this._isMuted ? 0 : 1)
                        );
                    },
                  }),
                  function () {
                    return new t();
                  }
                );
              })(),
              createTypedArray = (function () {
                function t(r, i) {
                  var s = 0,
                    n = [],
                    a;
                  switch (r) {
                    case "int16":
                    case "uint8c":
                      a = 1;
                      break;
                    default:
                      a = 1.1;
                      break;
                  }
                  for (s = 0; s < i; s += 1) n.push(a);
                  return n;
                }
                function e(r, i) {
                  return r === "float32"
                    ? new Float32Array(i)
                    : r === "int16"
                    ? new Int16Array(i)
                    : r === "uint8c"
                    ? new Uint8ClampedArray(i)
                    : t(r, i);
                }
                return typeof Uint8ClampedArray == "function" &&
                  typeof Float32Array == "function"
                  ? e
                  : t;
              })();
            function createSizedArray(t) {
              return Array.apply(null, { length: t });
            }
            function _typeof$6(t) {
              "@babel/helpers - typeof";
              return (
                typeof Symbol == "function" &&
                typeof Symbol.iterator == "symbol"
                  ? (_typeof$6 = function (r) {
                      return typeof r;
                    })
                  : (_typeof$6 = function (r) {
                      return r &&
                        typeof Symbol == "function" &&
                        r.constructor === Symbol &&
                        r !== Symbol.prototype
                        ? "symbol"
                        : typeof r;
                    }),
                _typeof$6(t)
              );
            }
            var subframeEnabled = !0,
              expressionsPlugin = null,
              expressionsInterfaces = null,
              idPrefix$1 = "",
              isSafari = /^((?!chrome|android).)*safari/i.test(
                navigator.userAgent
              ),
              bmPow = Math.pow,
              bmSqrt = Math.sqrt,
              bmFloor = Math.floor,
              bmMax = Math.max,
              bmMin = Math.min,
              BMMath = {};
            (function () {
              var t = [
                  "abs",
                  "acos",
                  "acosh",
                  "asin",
                  "asinh",
                  "atan",
                  "atanh",
                  "atan2",
                  "ceil",
                  "cbrt",
                  "expm1",
                  "clz32",
                  "cos",
                  "cosh",
                  "exp",
                  "floor",
                  "fround",
                  "hypot",
                  "imul",
                  "log",
                  "log1p",
                  "log2",
                  "log10",
                  "max",
                  "min",
                  "pow",
                  "random",
                  "round",
                  "sign",
                  "sin",
                  "sinh",
                  "sqrt",
                  "tan",
                  "tanh",
                  "trunc",
                  "E",
                  "LN10",
                  "LN2",
                  "LOG10E",
                  "LOG2E",
                  "PI",
                  "SQRT1_2",
                  "SQRT2",
                ],
                e,
                r = t.length;
              for (e = 0; e < r; e += 1) BMMath[t[e]] = Math[t[e]];
            })(),
              (BMMath.random = Math.random),
              (BMMath.abs = function (t) {
                var e = _typeof$6(t);
                if (e === "object" && t.length) {
                  var r = createSizedArray(t.length),
                    i,
                    s = t.length;
                  for (i = 0; i < s; i += 1) r[i] = Math.abs(t[i]);
                  return r;
                }
                return Math.abs(t);
              });
            var defaultCurveSegments = 150,
              degToRads = Math.PI / 180,
              roundCorner = 0.5519;
            function styleDiv(t) {
              (t.style.position = "absolute"),
                (t.style.top = 0),
                (t.style.left = 0),
                (t.style.display = "block"),
                (t.style.transformOrigin = "0 0"),
                (t.style.webkitTransformOrigin = "0 0"),
                (t.style.backfaceVisibility = "visible"),
                (t.style.webkitBackfaceVisibility = "visible"),
                (t.style.transformStyle = "preserve-3d"),
                (t.style.webkitTransformStyle = "preserve-3d"),
                (t.style.mozTransformStyle = "preserve-3d");
            }
            function BMEnterFrameEvent(t, e, r, i) {
              (this.type = t),
                (this.currentTime = e),
                (this.totalTime = r),
                (this.direction = i < 0 ? -1 : 1);
            }
            function BMCompleteEvent(t, e) {
              (this.type = t), (this.direction = e < 0 ? -1 : 1);
            }
            function BMCompleteLoopEvent(t, e, r, i) {
              (this.type = t),
                (this.currentLoop = r),
                (this.totalLoops = e),
                (this.direction = i < 0 ? -1 : 1);
            }
            function BMSegmentStartEvent(t, e, r) {
              (this.type = t), (this.firstFrame = e), (this.totalFrames = r);
            }
            function BMDestroyEvent(t, e) {
              (this.type = t), (this.target = e);
            }
            function BMRenderFrameErrorEvent(t, e) {
              (this.type = "renderFrameError"),
                (this.nativeError = t),
                (this.currentTime = e);
            }
            function BMConfigErrorEvent(t) {
              (this.type = "configError"), (this.nativeError = t);
            }
            var createElementID = (function () {
              var t = 0;
              return function () {
                return (t += 1), idPrefix$1 + "__lottie_element_" + t;
              };
            })();
            function HSVtoRGB(t, e, r) {
              var i, s, n, a, h, o, f, d;
              switch (
                ((a = Math.floor(t * 6)),
                (h = t * 6 - a),
                (o = r * (1 - e)),
                (f = r * (1 - h * e)),
                (d = r * (1 - (1 - h) * e)),
                a % 6)
              ) {
                case 0:
                  (i = r), (s = d), (n = o);
                  break;
                case 1:
                  (i = f), (s = r), (n = o);
                  break;
                case 2:
                  (i = o), (s = r), (n = d);
                  break;
                case 3:
                  (i = o), (s = f), (n = r);
                  break;
                case 4:
                  (i = d), (s = o), (n = r);
                  break;
                case 5:
                  (i = r), (s = o), (n = f);
                  break;
              }
              return [i, s, n];
            }
            function RGBtoHSV(t, e, r) {
              var i = Math.max(t, e, r),
                s = Math.min(t, e, r),
                n = i - s,
                a,
                h = i === 0 ? 0 : n / i,
                o = i / 255;
              switch (i) {
                case s:
                  a = 0;
                  break;
                case t:
                  (a = e - r + n * (e < r ? 6 : 0)), (a /= 6 * n);
                  break;
                case e:
                  (a = r - t + n * 2), (a /= 6 * n);
                  break;
                case r:
                  (a = t - e + n * 4), (a /= 6 * n);
                  break;
              }
              return [a, h, o];
            }
            function addSaturationToRGB(t, e) {
              var r = RGBtoHSV(t[0] * 255, t[1] * 255, t[2] * 255);
              return (
                (r[1] += e),
                r[1] > 1 ? (r[1] = 1) : r[1] <= 0 && (r[1] = 0),
                HSVtoRGB(r[0], r[1], r[2])
              );
            }
            function addBrightnessToRGB(t, e) {
              var r = RGBtoHSV(t[0] * 255, t[1] * 255, t[2] * 255);
              return (
                (r[2] += e),
                r[2] > 1 ? (r[2] = 1) : r[2] < 0 && (r[2] = 0),
                HSVtoRGB(r[0], r[1], r[2])
              );
            }
            function addHueToRGB(t, e) {
              var r = RGBtoHSV(t[0] * 255, t[1] * 255, t[2] * 255);
              return (
                (r[0] += e / 360),
                r[0] > 1 ? (r[0] -= 1) : r[0] < 0 && (r[0] += 1),
                HSVtoRGB(r[0], r[1], r[2])
              );
            }
            var rgbToHex = (function () {
                var t = [],
                  e,
                  r;
                for (e = 0; e < 256; e += 1)
                  (r = e.toString(16)), (t[e] = r.length === 1 ? "0" + r : r);
                return function (i, s, n) {
                  return (
                    i < 0 && (i = 0),
                    s < 0 && (s = 0),
                    n < 0 && (n = 0),
                    "#" + t[i] + t[s] + t[n]
                  );
                };
              })(),
              setSubframeEnabled = function (e) {
                subframeEnabled = !!e;
              },
              getSubframeEnabled = function () {
                return subframeEnabled;
              },
              setExpressionsPlugin = function (e) {
                expressionsPlugin = e;
              },
              getExpressionsPlugin = function () {
                return expressionsPlugin;
              },
              setExpressionInterfaces = function (e) {
                expressionsInterfaces = e;
              },
              getExpressionInterfaces = function () {
                return expressionsInterfaces;
              },
              setDefaultCurveSegments = function (e) {
                defaultCurveSegments = e;
              },
              getDefaultCurveSegments = function () {
                return defaultCurveSegments;
              },
              setIdPrefix = function (e) {
                idPrefix$1 = e;
              };
            function createNS(t) {
              return document.createElementNS(svgNS, t);
            }
            function _typeof$5(t) {
              "@babel/helpers - typeof";
              return (
                typeof Symbol == "function" &&
                typeof Symbol.iterator == "symbol"
                  ? (_typeof$5 = function (r) {
                      return typeof r;
                    })
                  : (_typeof$5 = function (r) {
                      return r &&
                        typeof Symbol == "function" &&
                        r.constructor === Symbol &&
                        r !== Symbol.prototype
                        ? "symbol"
                        : typeof r;
                    }),
                _typeof$5(t)
              );
            }
            var dataManager = (function () {
                var t = 1,
                  e = [],
                  r,
                  i,
                  s = {
                    onmessage: function () {},
                    postMessage: function (b) {
                      r({ data: b });
                    },
                  },
                  n = {
                    postMessage: function (b) {
                      s.onmessage({ data: b });
                    },
                  };
                function a(c) {
                  if (window.Worker && window.Blob && getWebWorker()) {
                    var b = new Blob(
                        [
                          "var _workerSelf = self; self.onmessage = ",
                          c.toString(),
                        ],
                        { type: "text/javascript" }
                      ),
                      v = URL.createObjectURL(b);
                    return new Worker(v);
                  }
                  return (r = c), s;
                }
                function h() {
                  i ||
                    ((i = a(function (b) {
                      function v() {
                        function C(I, _) {
                          var T,
                            g,
                            S = I.length,
                            k,
                            M,
                            V,
                            D;
                          for (g = 0; g < S; g += 1)
                            if (((T = I[g]), "ks" in T && !T.completed)) {
                              if (((T.completed = !0), T.hasMask)) {
                                var B = T.masksProperties;
                                for (M = B.length, k = 0; k < M; k += 1)
                                  if (B[k].pt.k.i) E(B[k].pt.k);
                                  else
                                    for (
                                      D = B[k].pt.k.length, V = 0;
                                      V < D;
                                      V += 1
                                    )
                                      B[k].pt.k[V].s && E(B[k].pt.k[V].s[0]),
                                        B[k].pt.k[V].e && E(B[k].pt.k[V].e[0]);
                              }
                              T.ty === 0
                                ? ((T.layers = l(T.refId, _)), C(T.layers, _))
                                : T.ty === 4
                                ? y(T.shapes)
                                : T.ty === 5 && O(T);
                            }
                        }
                        function p(I, _) {
                          if (I) {
                            var T = 0,
                              g = I.length;
                            for (T = 0; T < g; T += 1)
                              I[T].t === 1 &&
                                ((I[T].data.layers = l(I[T].data.refId, _)),
                                C(I[T].data.layers, _));
                          }
                        }
                        function u(I, _) {
                          for (var T = 0, g = _.length; T < g; ) {
                            if (_[T].id === I) return _[T];
                            T += 1;
                          }
                          return null;
                        }
                        function l(I, _) {
                          var T = u(I, _);
                          return T
                            ? T.layers.__used
                              ? JSON.parse(JSON.stringify(T.layers))
                              : ((T.layers.__used = !0), T.layers)
                            : null;
                        }
                        function y(I) {
                          var _,
                            T = I.length,
                            g,
                            S;
                          for (_ = T - 1; _ >= 0; _ -= 1)
                            if (I[_].ty === "sh")
                              if (I[_].ks.k.i) E(I[_].ks.k);
                              else
                                for (S = I[_].ks.k.length, g = 0; g < S; g += 1)
                                  I[_].ks.k[g].s && E(I[_].ks.k[g].s[0]),
                                    I[_].ks.k[g].e && E(I[_].ks.k[g].e[0]);
                            else I[_].ty === "gr" && y(I[_].it);
                        }
                        function E(I) {
                          var _,
                            T = I.i.length;
                          for (_ = 0; _ < T; _ += 1)
                            (I.i[_][0] += I.v[_][0]),
                              (I.i[_][1] += I.v[_][1]),
                              (I.o[_][0] += I.v[_][0]),
                              (I.o[_][1] += I.v[_][1]);
                        }
                        function x(I, _) {
                          var T = _ ? _.split(".") : [100, 100, 100];
                          return I[0] > T[0]
                            ? !0
                            : T[0] > I[0]
                            ? !1
                            : I[1] > T[1]
                            ? !0
                            : T[1] > I[1]
                            ? !1
                            : I[2] > T[2]
                            ? !0
                            : T[2] > I[2]
                            ? !1
                            : null;
                        }
                        var A = (function () {
                            var I = [4, 4, 14];
                            function _(g) {
                              var S = g.t.d;
                              g.t.d = { k: [{ s: S, t: 0 }] };
                            }
                            function T(g) {
                              var S,
                                k = g.length;
                              for (S = 0; S < k; S += 1)
                                g[S].ty === 5 && _(g[S]);
                            }
                            return function (g) {
                              if (x(I, g.v) && (T(g.layers), g.assets)) {
                                var S,
                                  k = g.assets.length;
                                for (S = 0; S < k; S += 1)
                                  g.assets[S].layers && T(g.assets[S].layers);
                              }
                            };
                          })(),
                          F = (function () {
                            var I = [4, 7, 99];
                            return function (_) {
                              if (_.chars && !x(I, _.v)) {
                                var T,
                                  g = _.chars.length;
                                for (T = 0; T < g; T += 1) {
                                  var S = _.chars[T];
                                  S.data &&
                                    S.data.shapes &&
                                    (y(S.data.shapes),
                                    (S.data.ip = 0),
                                    (S.data.op = 99999),
                                    (S.data.st = 0),
                                    (S.data.sr = 1),
                                    (S.data.ks = {
                                      p: { k: [0, 0], a: 0 },
                                      s: { k: [100, 100], a: 0 },
                                      a: { k: [0, 0], a: 0 },
                                      r: { k: 0, a: 0 },
                                      o: { k: 100, a: 0 },
                                    }),
                                    _.chars[T].t ||
                                      (S.data.shapes.push({ ty: "no" }),
                                      S.data.shapes[0].it.push({
                                        p: { k: [0, 0], a: 0 },
                                        s: { k: [100, 100], a: 0 },
                                        a: { k: [0, 0], a: 0 },
                                        r: { k: 0, a: 0 },
                                        o: { k: 100, a: 0 },
                                        sk: { k: 0, a: 0 },
                                        sa: { k: 0, a: 0 },
                                        ty: "tr",
                                      })));
                                }
                              }
                            };
                          })(),
                          w = (function () {
                            var I = [5, 7, 15];
                            function _(g) {
                              var S = g.t.p;
                              typeof S.a == "number" &&
                                (S.a = { a: 0, k: S.a }),
                                typeof S.p == "number" &&
                                  (S.p = { a: 0, k: S.p }),
                                typeof S.r == "number" &&
                                  (S.r = { a: 0, k: S.r });
                            }
                            function T(g) {
                              var S,
                                k = g.length;
                              for (S = 0; S < k; S += 1)
                                g[S].ty === 5 && _(g[S]);
                            }
                            return function (g) {
                              if (x(I, g.v) && (T(g.layers), g.assets)) {
                                var S,
                                  k = g.assets.length;
                                for (S = 0; S < k; S += 1)
                                  g.assets[S].layers && T(g.assets[S].layers);
                              }
                            };
                          })(),
                          z = (function () {
                            var I = [4, 1, 9];
                            function _(g) {
                              var S,
                                k = g.length,
                                M,
                                V;
                              for (S = 0; S < k; S += 1)
                                if (g[S].ty === "gr") _(g[S].it);
                                else if (g[S].ty === "fl" || g[S].ty === "st")
                                  if (g[S].c.k && g[S].c.k[0].i)
                                    for (
                                      V = g[S].c.k.length, M = 0;
                                      M < V;
                                      M += 1
                                    )
                                      g[S].c.k[M].s &&
                                        ((g[S].c.k[M].s[0] /= 255),
                                        (g[S].c.k[M].s[1] /= 255),
                                        (g[S].c.k[M].s[2] /= 255),
                                        (g[S].c.k[M].s[3] /= 255)),
                                        g[S].c.k[M].e &&
                                          ((g[S].c.k[M].e[0] /= 255),
                                          (g[S].c.k[M].e[1] /= 255),
                                          (g[S].c.k[M].e[2] /= 255),
                                          (g[S].c.k[M].e[3] /= 255));
                                  else
                                    (g[S].c.k[0] /= 255),
                                      (g[S].c.k[1] /= 255),
                                      (g[S].c.k[2] /= 255),
                                      (g[S].c.k[3] /= 255);
                            }
                            function T(g) {
                              var S,
                                k = g.length;
                              for (S = 0; S < k; S += 1)
                                g[S].ty === 4 && _(g[S].shapes);
                            }
                            return function (g) {
                              if (x(I, g.v) && (T(g.layers), g.assets)) {
                                var S,
                                  k = g.assets.length;
                                for (S = 0; S < k; S += 1)
                                  g.assets[S].layers && T(g.assets[S].layers);
                              }
                            };
                          })(),
                          R = (function () {
                            var I = [4, 4, 18];
                            function _(g) {
                              var S,
                                k = g.length,
                                M,
                                V;
                              for (S = k - 1; S >= 0; S -= 1)
                                if (g[S].ty === "sh")
                                  if (g[S].ks.k.i) g[S].ks.k.c = g[S].closed;
                                  else
                                    for (
                                      V = g[S].ks.k.length, M = 0;
                                      M < V;
                                      M += 1
                                    )
                                      g[S].ks.k[M].s &&
                                        (g[S].ks.k[M].s[0].c = g[S].closed),
                                        g[S].ks.k[M].e &&
                                          (g[S].ks.k[M].e[0].c = g[S].closed);
                                else g[S].ty === "gr" && _(g[S].it);
                            }
                            function T(g) {
                              var S,
                                k,
                                M = g.length,
                                V,
                                D,
                                B,
                                H;
                              for (k = 0; k < M; k += 1) {
                                if (((S = g[k]), S.hasMask)) {
                                  var j = S.masksProperties;
                                  for (D = j.length, V = 0; V < D; V += 1)
                                    if (j[V].pt.k.i) j[V].pt.k.c = j[V].cl;
                                    else
                                      for (
                                        H = j[V].pt.k.length, B = 0;
                                        B < H;
                                        B += 1
                                      )
                                        j[V].pt.k[B].s &&
                                          (j[V].pt.k[B].s[0].c = j[V].cl),
                                          j[V].pt.k[B].e &&
                                            (j[V].pt.k[B].e[0].c = j[V].cl);
                                }
                                S.ty === 4 && _(S.shapes);
                              }
                            }
                            return function (g) {
                              if (x(I, g.v) && (T(g.layers), g.assets)) {
                                var S,
                                  k = g.assets.length;
                                for (S = 0; S < k; S += 1)
                                  g.assets[S].layers && T(g.assets[S].layers);
                              }
                            };
                          })();
                        function L(I) {
                          I.__complete ||
                            (z(I),
                            A(I),
                            F(I),
                            w(I),
                            R(I),
                            C(I.layers, I.assets),
                            p(I.chars, I.assets),
                            (I.__complete = !0));
                        }
                        function O(I) {
                          I.t.a.length === 0 && "m" in I.t.p;
                        }
                        var G = {};
                        return (
                          (G.completeData = L),
                          (G.checkColors = z),
                          (G.checkChars = F),
                          (G.checkPathProperties = w),
                          (G.checkShapes = R),
                          (G.completeLayers = C),
                          G
                        );
                      }
                      if (
                        (n.dataManager || (n.dataManager = v()),
                        n.assetLoader ||
                          (n.assetLoader = (function () {
                            function C(u) {
                              var l = u.getResponseHeader("content-type");
                              return (l &&
                                u.responseType === "json" &&
                                l.indexOf("json") !== -1) ||
                                (u.response &&
                                  _typeof$5(u.response) === "object")
                                ? u.response
                                : u.response && typeof u.response == "string"
                                ? JSON.parse(u.response)
                                : u.responseText
                                ? JSON.parse(u.responseText)
                                : null;
                            }
                            function p(u, l, y, E) {
                              var x,
                                A = new XMLHttpRequest();
                              try {
                                A.responseType = "json";
                              } catch {}
                              A.onreadystatechange = function () {
                                if (A.readyState === 4)
                                  if (A.status === 200) (x = C(A)), y(x);
                                  else
                                    try {
                                      (x = C(A)), y(x);
                                    } catch (F) {
                                      E && E(F);
                                    }
                              };
                              try {
                                A.open(["G", "E", "T"].join(""), u, !0);
                              } catch {
                                A.open(
                                  ["G", "E", "T"].join(""),
                                  l + "/" + u,
                                  !0
                                );
                              }
                              A.send();
                            }
                            return { load: p };
                          })()),
                        b.data.type === "loadAnimation")
                      )
                        n.assetLoader.load(
                          b.data.path,
                          b.data.fullPath,
                          function (C) {
                            n.dataManager.completeData(C),
                              n.postMessage({
                                id: b.data.id,
                                payload: C,
                                status: "success",
                              });
                          },
                          function () {
                            n.postMessage({ id: b.data.id, status: "error" });
                          }
                        );
                      else if (b.data.type === "complete") {
                        var m = b.data.animation;
                        n.dataManager.completeData(m),
                          n.postMessage({
                            id: b.data.id,
                            payload: m,
                            status: "success",
                          });
                      } else
                        b.data.type === "loadData" &&
                          n.assetLoader.load(
                            b.data.path,
                            b.data.fullPath,
                            function (C) {
                              n.postMessage({
                                id: b.data.id,
                                payload: C,
                                status: "success",
                              });
                            },
                            function () {
                              n.postMessage({ id: b.data.id, status: "error" });
                            }
                          );
                    })),
                    (i.onmessage = function (c) {
                      var b = c.data,
                        v = b.id,
                        m = e[v];
                      (e[v] = null),
                        b.status === "success"
                          ? m.onComplete(b.payload)
                          : m.onError && m.onError();
                    }));
                }
                function o(c, b) {
                  t += 1;
                  var v = "processId_" + t;
                  return (e[v] = { onComplete: c, onError: b }), v;
                }
                function f(c, b, v) {
                  h();
                  var m = o(b, v);
                  i.postMessage({
                    type: "loadAnimation",
                    path: c,
                    fullPath: window.location.origin + window.location.pathname,
                    id: m,
                  });
                }
                function d(c, b, v) {
                  h();
                  var m = o(b, v);
                  i.postMessage({
                    type: "loadData",
                    path: c,
                    fullPath: window.location.origin + window.location.pathname,
                    id: m,
                  });
                }
                function P(c, b, v) {
                  h();
                  var m = o(b, v);
                  i.postMessage({ type: "complete", animation: c, id: m });
                }
                return { loadAnimation: f, loadData: d, completeAnimation: P };
              })(),
              ImagePreloader = (function () {
                var t = (function () {
                  var p = createTag("canvas");
                  (p.width = 1), (p.height = 1);
                  var u = p.getContext("2d");
                  return (
                    (u.fillStyle = "rgba(0,0,0,0)"), u.fillRect(0, 0, 1, 1), p
                  );
                })();
                function e() {
                  (this.loadedAssets += 1),
                    this.loadedAssets === this.totalImages &&
                      this.loadedFootagesCount === this.totalFootages &&
                      this.imagesLoadedCb &&
                      this.imagesLoadedCb(null);
                }
                function r() {
                  (this.loadedFootagesCount += 1),
                    this.loadedAssets === this.totalImages &&
                      this.loadedFootagesCount === this.totalFootages &&
                      this.imagesLoadedCb &&
                      this.imagesLoadedCb(null);
                }
                function i(p, u, l) {
                  var y = "";
                  if (p.e) y = p.p;
                  else if (u) {
                    var E = p.p;
                    E.indexOf("images/") !== -1 && (E = E.split("/")[1]),
                      (y = u + E);
                  } else (y = l), (y += p.u ? p.u : ""), (y += p.p);
                  return y;
                }
                function s(p) {
                  var u = 0,
                    l = setInterval(
                      function () {
                        var y = p.getBBox();
                        (y.width || u > 500) &&
                          (this._imageLoaded(), clearInterval(l)),
                          (u += 1);
                      }.bind(this),
                      50
                    );
                }
                function n(p) {
                  var u = i(p, this.assetsPath, this.path),
                    l = createNS("image");
                  isSafari
                    ? this.testImageLoaded(l)
                    : l.addEventListener("load", this._imageLoaded, !1),
                    l.addEventListener(
                      "error",
                      function () {
                        (y.img = t), this._imageLoaded();
                      }.bind(this),
                      !1
                    ),
                    l.setAttributeNS("http://www.w3.org/1999/xlink", "href", u),
                    this._elementHelper.append
                      ? this._elementHelper.append(l)
                      : this._elementHelper.appendChild(l);
                  var y = { img: l, assetData: p };
                  return y;
                }
                function a(p) {
                  var u = i(p, this.assetsPath, this.path),
                    l = createTag("img");
                  (l.crossOrigin = "anonymous"),
                    l.addEventListener("load", this._imageLoaded, !1),
                    l.addEventListener(
                      "error",
                      function () {
                        (y.img = t), this._imageLoaded();
                      }.bind(this),
                      !1
                    ),
                    (l.src = u);
                  var y = { img: l, assetData: p };
                  return y;
                }
                function h(p) {
                  var u = { assetData: p },
                    l = i(p, this.assetsPath, this.path);
                  return (
                    dataManager.loadData(
                      l,
                      function (y) {
                        (u.img = y), this._footageLoaded();
                      }.bind(this),
                      function () {
                        (u.img = {}), this._footageLoaded();
                      }.bind(this)
                    ),
                    u
                  );
                }
                function o(p, u) {
                  this.imagesLoadedCb = u;
                  var l,
                    y = p.length;
                  for (l = 0; l < y; l += 1)
                    p[l].layers ||
                      (!p[l].t || p[l].t === "seq"
                        ? ((this.totalImages += 1),
                          this.images.push(this._createImageData(p[l])))
                        : p[l].t === 3 &&
                          ((this.totalFootages += 1),
                          this.images.push(this.createFootageData(p[l]))));
                }
                function f(p) {
                  this.path = p || "";
                }
                function d(p) {
                  this.assetsPath = p || "";
                }
                function P(p) {
                  for (var u = 0, l = this.images.length; u < l; ) {
                    if (this.images[u].assetData === p)
                      return this.images[u].img;
                    u += 1;
                  }
                  return null;
                }
                function c() {
                  (this.imagesLoadedCb = null), (this.images.length = 0);
                }
                function b() {
                  return this.totalImages === this.loadedAssets;
                }
                function v() {
                  return this.totalFootages === this.loadedFootagesCount;
                }
                function m(p, u) {
                  p === "svg"
                    ? ((this._elementHelper = u),
                      (this._createImageData = this.createImageData.bind(this)))
                    : (this._createImageData = this.createImgData.bind(this));
                }
                function C() {
                  (this._imageLoaded = e.bind(this)),
                    (this._footageLoaded = r.bind(this)),
                    (this.testImageLoaded = s.bind(this)),
                    (this.createFootageData = h.bind(this)),
                    (this.assetsPath = ""),
                    (this.path = ""),
                    (this.totalImages = 0),
                    (this.totalFootages = 0),
                    (this.loadedAssets = 0),
                    (this.loadedFootagesCount = 0),
                    (this.imagesLoadedCb = null),
                    (this.images = []);
                }
                return (
                  (C.prototype = {
                    loadAssets: o,
                    setAssetsPath: d,
                    setPath: f,
                    loadedImages: b,
                    loadedFootages: v,
                    destroy: c,
                    getAsset: P,
                    createImgData: a,
                    createImageData: n,
                    imageLoaded: e,
                    footageLoaded: r,
                    setCacheType: m,
                  }),
                  C
                );
              })();
            function BaseEvent() {}
            BaseEvent.prototype = {
              triggerEvent: function (e, r) {
                if (this._cbs[e])
                  for (var i = this._cbs[e], s = 0; s < i.length; s += 1)
                    i[s](r);
              },
              addEventListener: function (e, r) {
                return (
                  this._cbs[e] || (this._cbs[e] = []),
                  this._cbs[e].push(r),
                  function () {
                    this.removeEventListener(e, r);
                  }.bind(this)
                );
              },
              removeEventListener: function (e, r) {
                if (!r) this._cbs[e] = null;
                else if (this._cbs[e]) {
                  for (var i = 0, s = this._cbs[e].length; i < s; )
                    this._cbs[e][i] === r &&
                      (this._cbs[e].splice(i, 1), (i -= 1), (s -= 1)),
                      (i += 1);
                  this._cbs[e].length || (this._cbs[e] = null);
                }
              },
            };
            var markerParser = (function () {
                function t(e) {
                  for (
                    var r = e.split(`\r
`),
                      i = {},
                      s,
                      n = 0,
                      a = 0;
                    a < r.length;
                    a += 1
                  )
                    (s = r[a].split(":")),
                      s.length === 2 && ((i[s[0]] = s[1].trim()), (n += 1));
                  if (n === 0) throw new Error();
                  return i;
                }
                return function (e) {
                  for (var r = [], i = 0; i < e.length; i += 1) {
                    var s = e[i],
                      n = { time: s.tm, duration: s.dr };
                    try {
                      n.payload = JSON.parse(e[i].cm);
                    } catch {
                      try {
                        n.payload = t(e[i].cm);
                      } catch {
                        n.payload = { name: e[i].cm };
                      }
                    }
                    r.push(n);
                  }
                  return r;
                };
              })(),
              ProjectInterface = (function () {
                function t(e) {
                  this.compositions.push(e);
                }
                return function () {
                  function e(r) {
                    for (var i = 0, s = this.compositions.length; i < s; ) {
                      if (
                        this.compositions[i].data &&
                        this.compositions[i].data.nm === r
                      )
                        return (
                          this.compositions[i].prepareFrame &&
                            this.compositions[i].data.xt &&
                            this.compositions[i].prepareFrame(
                              this.currentFrame
                            ),
                          this.compositions[i].compInterface
                        );
                      i += 1;
                    }
                    return null;
                  }
                  return (
                    (e.compositions = []),
                    (e.currentFrame = 0),
                    (e.registerComposition = t),
                    e
                  );
                };
              })(),
              renderers = {},
              registerRenderer = function (e, r) {
                renderers[e] = r;
              };
            function getRenderer(t) {
              return renderers[t];
            }
            function getRegisteredRenderer() {
              if (renderers.canvas) return "canvas";
              for (var t in renderers) if (renderers[t]) return t;
              return "";
            }
            function _typeof$4(t) {
              "@babel/helpers - typeof";
              return (
                typeof Symbol == "function" &&
                typeof Symbol.iterator == "symbol"
                  ? (_typeof$4 = function (r) {
                      return typeof r;
                    })
                  : (_typeof$4 = function (r) {
                      return r &&
                        typeof Symbol == "function" &&
                        r.constructor === Symbol &&
                        r !== Symbol.prototype
                        ? "symbol"
                        : typeof r;
                    }),
                _typeof$4(t)
              );
            }
            var AnimationItem = function () {
              (this._cbs = []),
                (this.name = ""),
                (this.path = ""),
                (this.isLoaded = !1),
                (this.currentFrame = 0),
                (this.currentRawFrame = 0),
                (this.firstFrame = 0),
                (this.totalFrames = 0),
                (this.frameRate = 0),
                (this.frameMult = 0),
                (this.playSpeed = 1),
                (this.playDirection = 1),
                (this.playCount = 0),
                (this.animationData = {}),
                (this.assets = []),
                (this.isPaused = !0),
                (this.autoplay = !1),
                (this.loop = !0),
                (this.renderer = null),
                (this.animationID = createElementID()),
                (this.assetsPath = ""),
                (this.timeCompleted = 0),
                (this.segmentPos = 0),
                (this.isSubframeEnabled = getSubframeEnabled()),
                (this.segments = []),
                (this._idle = !0),
                (this._completedLoop = !1),
                (this.projectInterface = ProjectInterface()),
                (this.imagePreloader = new ImagePreloader()),
                (this.audioController = audioControllerFactory()),
                (this.markers = []),
                (this.configAnimation = this.configAnimation.bind(this)),
                (this.onSetupError = this.onSetupError.bind(this)),
                (this.onSegmentComplete = this.onSegmentComplete.bind(this)),
                (this.drawnFrameEvent = new BMEnterFrameEvent(
                  "drawnFrame",
                  0,
                  0,
                  0
                )),
                (this.expressionsPlugin = getExpressionsPlugin());
            };
            extendPrototype([BaseEvent], AnimationItem),
              (AnimationItem.prototype.setParams = function (t) {
                (t.wrapper || t.container) &&
                  (this.wrapper = t.wrapper || t.container);
                var e = "svg";
                t.animType ? (e = t.animType) : t.renderer && (e = t.renderer);
                var r = getRenderer(e);
                (this.renderer = new r(this, t.rendererSettings)),
                  this.imagePreloader.setCacheType(
                    e,
                    this.renderer.globalData.defs
                  ),
                  this.renderer.setProjectInterface(this.projectInterface),
                  (this.animType = e),
                  t.loop === "" ||
                  t.loop === null ||
                  t.loop === void 0 ||
                  t.loop === !0
                    ? (this.loop = !0)
                    : t.loop === !1
                    ? (this.loop = !1)
                    : (this.loop = parseInt(t.loop, 10)),
                  (this.autoplay = "autoplay" in t ? t.autoplay : !0),
                  (this.name = t.name ? t.name : ""),
                  (this.autoloadSegments = Object.prototype.hasOwnProperty.call(
                    t,
                    "autoloadSegments"
                  )
                    ? t.autoloadSegments
                    : !0),
                  (this.assetsPath = t.assetsPath),
                  (this.initialSegment = t.initialSegment),
                  t.audioFactory &&
                    this.audioController.setAudioFactory(t.audioFactory),
                  t.animationData
                    ? this.setupAnimation(t.animationData)
                    : t.path &&
                      (t.path.lastIndexOf("\\") !== -1
                        ? (this.path = t.path.substr(
                            0,
                            t.path.lastIndexOf("\\") + 1
                          ))
                        : (this.path = t.path.substr(
                            0,
                            t.path.lastIndexOf("/") + 1
                          )),
                      (this.fileName = t.path.substr(
                        t.path.lastIndexOf("/") + 1
                      )),
                      (this.fileName = this.fileName.substr(
                        0,
                        this.fileName.lastIndexOf(".json")
                      )),
                      dataManager.loadAnimation(
                        t.path,
                        this.configAnimation,
                        this.onSetupError
                      ));
              }),
              (AnimationItem.prototype.onSetupError = function () {
                this.trigger("data_failed");
              }),
              (AnimationItem.prototype.setupAnimation = function (t) {
                dataManager.completeAnimation(t, this.configAnimation);
              }),
              (AnimationItem.prototype.setData = function (t, e) {
                e && _typeof$4(e) !== "object" && (e = JSON.parse(e));
                var r = { wrapper: t, animationData: e },
                  i = t.attributes;
                (r.path = i.getNamedItem("data-animation-path")
                  ? i.getNamedItem("data-animation-path").value
                  : i.getNamedItem("data-bm-path")
                  ? i.getNamedItem("data-bm-path").value
                  : i.getNamedItem("bm-path")
                  ? i.getNamedItem("bm-path").value
                  : ""),
                  (r.animType = i.getNamedItem("data-anim-type")
                    ? i.getNamedItem("data-anim-type").value
                    : i.getNamedItem("data-bm-type")
                    ? i.getNamedItem("data-bm-type").value
                    : i.getNamedItem("bm-type")
                    ? i.getNamedItem("bm-type").value
                    : i.getNamedItem("data-bm-renderer")
                    ? i.getNamedItem("data-bm-renderer").value
                    : i.getNamedItem("bm-renderer")
                    ? i.getNamedItem("bm-renderer").value
                    : getRegisteredRenderer() || "canvas");
                var s = i.getNamedItem("data-anim-loop")
                  ? i.getNamedItem("data-anim-loop").value
                  : i.getNamedItem("data-bm-loop")
                  ? i.getNamedItem("data-bm-loop").value
                  : i.getNamedItem("bm-loop")
                  ? i.getNamedItem("bm-loop").value
                  : "";
                s === "false"
                  ? (r.loop = !1)
                  : s === "true"
                  ? (r.loop = !0)
                  : s !== "" && (r.loop = parseInt(s, 10));
                var n = i.getNamedItem("data-anim-autoplay")
                  ? i.getNamedItem("data-anim-autoplay").value
                  : i.getNamedItem("data-bm-autoplay")
                  ? i.getNamedItem("data-bm-autoplay").value
                  : i.getNamedItem("bm-autoplay")
                  ? i.getNamedItem("bm-autoplay").value
                  : !0;
                (r.autoplay = n !== "false"),
                  (r.name = i.getNamedItem("data-name")
                    ? i.getNamedItem("data-name").value
                    : i.getNamedItem("data-bm-name")
                    ? i.getNamedItem("data-bm-name").value
                    : i.getNamedItem("bm-name")
                    ? i.getNamedItem("bm-name").value
                    : "");
                var a = i.getNamedItem("data-anim-prerender")
                  ? i.getNamedItem("data-anim-prerender").value
                  : i.getNamedItem("data-bm-prerender")
                  ? i.getNamedItem("data-bm-prerender").value
                  : i.getNamedItem("bm-prerender")
                  ? i.getNamedItem("bm-prerender").value
                  : "";
                a === "false" && (r.prerender = !1),
                  r.path ? this.setParams(r) : this.trigger("destroy");
              }),
              (AnimationItem.prototype.includeLayers = function (t) {
                t.op > this.animationData.op &&
                  ((this.animationData.op = t.op),
                  (this.totalFrames = Math.floor(
                    t.op - this.animationData.ip
                  )));
                var e = this.animationData.layers,
                  r,
                  i = e.length,
                  s = t.layers,
                  n,
                  a = s.length;
                for (n = 0; n < a; n += 1)
                  for (r = 0; r < i; ) {
                    if (e[r].id === s[n].id) {
                      e[r] = s[n];
                      break;
                    }
                    r += 1;
                  }
                if (
                  ((t.chars || t.fonts) &&
                    (this.renderer.globalData.fontManager.addChars(t.chars),
                    this.renderer.globalData.fontManager.addFonts(
                      t.fonts,
                      this.renderer.globalData.defs
                    )),
                  t.assets)
                )
                  for (i = t.assets.length, r = 0; r < i; r += 1)
                    this.animationData.assets.push(t.assets[r]);
                (this.animationData.__complete = !1),
                  dataManager.completeAnimation(
                    this.animationData,
                    this.onSegmentComplete
                  );
              }),
              (AnimationItem.prototype.onSegmentComplete = function (t) {
                this.animationData = t;
                var e = getExpressionsPlugin();
                e && e.initExpressions(this), this.loadNextSegment();
              }),
              (AnimationItem.prototype.loadNextSegment = function () {
                var t = this.animationData.segments;
                if (!t || t.length === 0 || !this.autoloadSegments) {
                  this.trigger("data_ready"),
                    (this.timeCompleted = this.totalFrames);
                  return;
                }
                var e = t.shift();
                this.timeCompleted = e.time * this.frameRate;
                var r =
                  this.path + this.fileName + "_" + this.segmentPos + ".json";
                (this.segmentPos += 1),
                  dataManager.loadData(
                    r,
                    this.includeLayers.bind(this),
                    function () {
                      this.trigger("data_failed");
                    }.bind(this)
                  );
              }),
              (AnimationItem.prototype.loadSegments = function () {
                var t = this.animationData.segments;
                t || (this.timeCompleted = this.totalFrames),
                  this.loadNextSegment();
              }),
              (AnimationItem.prototype.imagesLoaded = function () {
                this.trigger("loaded_images"), this.checkLoaded();
              }),
              (AnimationItem.prototype.preloadImages = function () {
                this.imagePreloader.setAssetsPath(this.assetsPath),
                  this.imagePreloader.setPath(this.path),
                  this.imagePreloader.loadAssets(
                    this.animationData.assets,
                    this.imagesLoaded.bind(this)
                  );
              }),
              (AnimationItem.prototype.configAnimation = function (t) {
                if (this.renderer)
                  try {
                    (this.animationData = t),
                      this.initialSegment
                        ? ((this.totalFrames = Math.floor(
                            this.initialSegment[1] - this.initialSegment[0]
                          )),
                          (this.firstFrame = Math.round(
                            this.initialSegment[0]
                          )))
                        : ((this.totalFrames = Math.floor(
                            this.animationData.op - this.animationData.ip
                          )),
                          (this.firstFrame = Math.round(
                            this.animationData.ip
                          ))),
                      this.renderer.configAnimation(t),
                      t.assets || (t.assets = []),
                      (this.assets = this.animationData.assets),
                      (this.frameRate = this.animationData.fr),
                      (this.frameMult = this.animationData.fr / 1e3),
                      this.renderer.searchExtraCompositions(t.assets),
                      (this.markers = markerParser(t.markers || [])),
                      this.trigger("config_ready"),
                      this.preloadImages(),
                      this.loadSegments(),
                      this.updaFrameModifier(),
                      this.waitForFontsLoaded(),
                      this.isPaused && this.audioController.pause();
                  } catch (e) {
                    this.triggerConfigError(e);
                  }
              }),
              (AnimationItem.prototype.waitForFontsLoaded = function () {
                this.renderer &&
                  (this.renderer.globalData.fontManager.isLoaded
                    ? this.checkLoaded()
                    : setTimeout(this.waitForFontsLoaded.bind(this), 20));
              }),
              (AnimationItem.prototype.checkLoaded = function () {
                if (
                  !this.isLoaded &&
                  this.renderer.globalData.fontManager.isLoaded &&
                  (this.imagePreloader.loadedImages() ||
                    this.renderer.rendererType !== "canvas") &&
                  this.imagePreloader.loadedFootages()
                ) {
                  this.isLoaded = !0;
                  var t = getExpressionsPlugin();
                  t && t.initExpressions(this),
                    this.renderer.initItems(),
                    setTimeout(
                      function () {
                        this.trigger("DOMLoaded");
                      }.bind(this),
                      0
                    ),
                    this.gotoFrame(),
                    this.autoplay && this.play();
                }
              }),
              (AnimationItem.prototype.resize = function (t, e) {
                var r = typeof t == "number" ? t : void 0,
                  i = typeof e == "number" ? e : void 0;
                this.renderer.updateContainerSize(r, i);
              }),
              (AnimationItem.prototype.setSubframe = function (t) {
                this.isSubframeEnabled = !!t;
              }),
              (AnimationItem.prototype.gotoFrame = function () {
                (this.currentFrame = this.isSubframeEnabled
                  ? this.currentRawFrame
                  : ~~this.currentRawFrame),
                  this.timeCompleted !== this.totalFrames &&
                    this.currentFrame > this.timeCompleted &&
                    (this.currentFrame = this.timeCompleted),
                  this.trigger("enterFrame"),
                  this.renderFrame(),
                  this.trigger("drawnFrame");
              }),
              (AnimationItem.prototype.renderFrame = function () {
                if (!(this.isLoaded === !1 || !this.renderer))
                  try {
                    this.expressionsPlugin &&
                      this.expressionsPlugin.resetFrame(),
                      this.renderer.renderFrame(
                        this.currentFrame + this.firstFrame
                      );
                  } catch (t) {
                    this.triggerRenderFrameError(t);
                  }
              }),
              (AnimationItem.prototype.play = function (t) {
                (t && this.name !== t) ||
                  (this.isPaused === !0 &&
                    ((this.isPaused = !1),
                    this.trigger("_play"),
                    this.audioController.resume(),
                    this._idle &&
                      ((this._idle = !1), this.trigger("_active"))));
              }),
              (AnimationItem.prototype.pause = function (t) {
                (t && this.name !== t) ||
                  (this.isPaused === !1 &&
                    ((this.isPaused = !0),
                    this.trigger("_pause"),
                    (this._idle = !0),
                    this.trigger("_idle"),
                    this.audioController.pause()));
              }),
              (AnimationItem.prototype.togglePause = function (t) {
                (t && this.name !== t) ||
                  (this.isPaused === !0 ? this.play() : this.pause());
              }),
              (AnimationItem.prototype.stop = function (t) {
                (t && this.name !== t) ||
                  (this.pause(),
                  (this.playCount = 0),
                  (this._completedLoop = !1),
                  this.setCurrentRawFrameValue(0));
              }),
              (AnimationItem.prototype.getMarkerData = function (t) {
                for (var e, r = 0; r < this.markers.length; r += 1)
                  if (
                    ((e = this.markers[r]), e.payload && e.payload.name === t)
                  )
                    return e;
                return null;
              }),
              (AnimationItem.prototype.goToAndStop = function (t, e, r) {
                if (!(r && this.name !== r)) {
                  var i = Number(t);
                  if (isNaN(i)) {
                    var s = this.getMarkerData(t);
                    s && this.goToAndStop(s.time, !0);
                  } else
                    e
                      ? this.setCurrentRawFrameValue(t)
                      : this.setCurrentRawFrameValue(t * this.frameModifier);
                  this.pause();
                }
              }),
              (AnimationItem.prototype.goToAndPlay = function (t, e, r) {
                if (!(r && this.name !== r)) {
                  var i = Number(t);
                  if (isNaN(i)) {
                    var s = this.getMarkerData(t);
                    s &&
                      (s.duration
                        ? this.playSegments([s.time, s.time + s.duration], !0)
                        : this.goToAndStop(s.time, !0));
                  } else this.goToAndStop(i, e, r);
                  this.play();
                }
              }),
              (AnimationItem.prototype.advanceTime = function (t) {
                if (!(this.isPaused === !0 || this.isLoaded === !1)) {
                  var e = this.currentRawFrame + t * this.frameModifier,
                    r = !1;
                  e >= this.totalFrames - 1 && this.frameModifier > 0
                    ? !this.loop || this.playCount === this.loop
                      ? this.checkSegments(
                          e > this.totalFrames ? e % this.totalFrames : 0
                        ) || ((r = !0), (e = this.totalFrames - 1))
                      : e >= this.totalFrames
                      ? ((this.playCount += 1),
                        this.checkSegments(e % this.totalFrames) ||
                          (this.setCurrentRawFrameValue(e % this.totalFrames),
                          (this._completedLoop = !0),
                          this.trigger("loopComplete")))
                      : this.setCurrentRawFrameValue(e)
                    : e < 0
                    ? this.checkSegments(e % this.totalFrames) ||
                      (this.loop && !(this.playCount-- <= 0 && this.loop !== !0)
                        ? (this.setCurrentRawFrameValue(
                            this.totalFrames + (e % this.totalFrames)
                          ),
                          this._completedLoop
                            ? this.trigger("loopComplete")
                            : (this._completedLoop = !0))
                        : ((r = !0), (e = 0)))
                    : this.setCurrentRawFrameValue(e),
                    r &&
                      (this.setCurrentRawFrameValue(e),
                      this.pause(),
                      this.trigger("complete"));
                }
              }),
              (AnimationItem.prototype.adjustSegment = function (t, e) {
                (this.playCount = 0),
                  t[1] < t[0]
                    ? (this.frameModifier > 0 &&
                        (this.playSpeed < 0
                          ? this.setSpeed(-this.playSpeed)
                          : this.setDirection(-1)),
                      (this.totalFrames = t[0] - t[1]),
                      (this.timeCompleted = this.totalFrames),
                      (this.firstFrame = t[1]),
                      this.setCurrentRawFrameValue(
                        this.totalFrames - 0.001 - e
                      ))
                    : t[1] > t[0] &&
                      (this.frameModifier < 0 &&
                        (this.playSpeed < 0
                          ? this.setSpeed(-this.playSpeed)
                          : this.setDirection(1)),
                      (this.totalFrames = t[1] - t[0]),
                      (this.timeCompleted = this.totalFrames),
                      (this.firstFrame = t[0]),
                      this.setCurrentRawFrameValue(0.001 + e)),
                  this.trigger("segmentStart");
              }),
              (AnimationItem.prototype.setSegment = function (t, e) {
                var r = -1;
                this.isPaused &&
                  (this.currentRawFrame + this.firstFrame < t
                    ? (r = t)
                    : this.currentRawFrame + this.firstFrame > e &&
                      (r = e - t)),
                  (this.firstFrame = t),
                  (this.totalFrames = e - t),
                  (this.timeCompleted = this.totalFrames),
                  r !== -1 && this.goToAndStop(r, !0);
              }),
              (AnimationItem.prototype.playSegments = function (t, e) {
                if (
                  (e && (this.segments.length = 0),
                  _typeof$4(t[0]) === "object")
                ) {
                  var r,
                    i = t.length;
                  for (r = 0; r < i; r += 1) this.segments.push(t[r]);
                } else this.segments.push(t);
                this.segments.length &&
                  e &&
                  this.adjustSegment(this.segments.shift(), 0),
                  this.isPaused && this.play();
              }),
              (AnimationItem.prototype.resetSegments = function (t) {
                (this.segments.length = 0),
                  this.segments.push([
                    this.animationData.ip,
                    this.animationData.op,
                  ]),
                  t && this.checkSegments(0);
              }),
              (AnimationItem.prototype.checkSegments = function (t) {
                return this.segments.length
                  ? (this.adjustSegment(this.segments.shift(), t), !0)
                  : !1;
              }),
              (AnimationItem.prototype.destroy = function (t) {
                (t && this.name !== t) ||
                  !this.renderer ||
                  (this.renderer.destroy(),
                  this.imagePreloader.destroy(),
                  this.trigger("destroy"),
                  (this._cbs = null),
                  (this.onEnterFrame = null),
                  (this.onLoopComplete = null),
                  (this.onComplete = null),
                  (this.onSegmentStart = null),
                  (this.onDestroy = null),
                  (this.renderer = null),
                  (this.expressionsPlugin = null),
                  (this.imagePreloader = null),
                  (this.projectInterface = null));
              }),
              (AnimationItem.prototype.setCurrentRawFrameValue = function (t) {
                (this.currentRawFrame = t), this.gotoFrame();
              }),
              (AnimationItem.prototype.setSpeed = function (t) {
                (this.playSpeed = t), this.updaFrameModifier();
              }),
              (AnimationItem.prototype.setDirection = function (t) {
                (this.playDirection = t < 0 ? -1 : 1), this.updaFrameModifier();
              }),
              (AnimationItem.prototype.setLoop = function (t) {
                this.loop = t;
              }),
              (AnimationItem.prototype.setVolume = function (t, e) {
                (e && this.name !== e) || this.audioController.setVolume(t);
              }),
              (AnimationItem.prototype.getVolume = function () {
                return this.audioController.getVolume();
              }),
              (AnimationItem.prototype.mute = function (t) {
                (t && this.name !== t) || this.audioController.mute();
              }),
              (AnimationItem.prototype.unmute = function (t) {
                (t && this.name !== t) || this.audioController.unmute();
              }),
              (AnimationItem.prototype.updaFrameModifier = function () {
                (this.frameModifier =
                  this.frameMult * this.playSpeed * this.playDirection),
                  this.audioController.setRate(
                    this.playSpeed * this.playDirection
                  );
              }),
              (AnimationItem.prototype.getPath = function () {
                return this.path;
              }),
              (AnimationItem.prototype.getAssetsPath = function (t) {
                var e = "";
                if (t.e) e = t.p;
                else if (this.assetsPath) {
                  var r = t.p;
                  r.indexOf("images/") !== -1 && (r = r.split("/")[1]),
                    (e = this.assetsPath + r);
                } else (e = this.path), (e += t.u ? t.u : ""), (e += t.p);
                return e;
              }),
              (AnimationItem.prototype.getAssetData = function (t) {
                for (var e = 0, r = this.assets.length; e < r; ) {
                  if (t === this.assets[e].id) return this.assets[e];
                  e += 1;
                }
                return null;
              }),
              (AnimationItem.prototype.hide = function () {
                this.renderer.hide();
              }),
              (AnimationItem.prototype.show = function () {
                this.renderer.show();
              }),
              (AnimationItem.prototype.getDuration = function (t) {
                return t ? this.totalFrames : this.totalFrames / this.frameRate;
              }),
              (AnimationItem.prototype.updateDocumentData = function (t, e, r) {
                try {
                  var i = this.renderer.getElementByPath(t);
                  i.updateDocumentData(e, r);
                } catch {}
              }),
              (AnimationItem.prototype.trigger = function (t) {
                if (this._cbs && this._cbs[t])
                  switch (t) {
                    case "enterFrame":
                      this.triggerEvent(
                        t,
                        new BMEnterFrameEvent(
                          t,
                          this.currentFrame,
                          this.totalFrames,
                          this.frameModifier
                        )
                      );
                      break;
                    case "drawnFrame":
                      (this.drawnFrameEvent.currentTime = this.currentFrame),
                        (this.drawnFrameEvent.totalTime = this.totalFrames),
                        (this.drawnFrameEvent.direction = this.frameModifier),
                        this.triggerEvent(t, this.drawnFrameEvent);
                      break;
                    case "loopComplete":
                      this.triggerEvent(
                        t,
                        new BMCompleteLoopEvent(
                          t,
                          this.loop,
                          this.playCount,
                          this.frameMult
                        )
                      );
                      break;
                    case "complete":
                      this.triggerEvent(
                        t,
                        new BMCompleteEvent(t, this.frameMult)
                      );
                      break;
                    case "segmentStart":
                      this.triggerEvent(
                        t,
                        new BMSegmentStartEvent(
                          t,
                          this.firstFrame,
                          this.totalFrames
                        )
                      );
                      break;
                    case "destroy":
                      this.triggerEvent(t, new BMDestroyEvent(t, this));
                      break;
                    default:
                      this.triggerEvent(t);
                  }
                t === "enterFrame" &&
                  this.onEnterFrame &&
                  this.onEnterFrame.call(
                    this,
                    new BMEnterFrameEvent(
                      t,
                      this.currentFrame,
                      this.totalFrames,
                      this.frameMult
                    )
                  ),
                  t === "loopComplete" &&
                    this.onLoopComplete &&
                    this.onLoopComplete.call(
                      this,
                      new BMCompleteLoopEvent(
                        t,
                        this.loop,
                        this.playCount,
                        this.frameMult
                      )
                    ),
                  t === "complete" &&
                    this.onComplete &&
                    this.onComplete.call(
                      this,
                      new BMCompleteEvent(t, this.frameMult)
                    ),
                  t === "segmentStart" &&
                    this.onSegmentStart &&
                    this.onSegmentStart.call(
                      this,
                      new BMSegmentStartEvent(
                        t,
                        this.firstFrame,
                        this.totalFrames
                      )
                    ),
                  t === "destroy" &&
                    this.onDestroy &&
                    this.onDestroy.call(this, new BMDestroyEvent(t, this));
              }),
              (AnimationItem.prototype.triggerRenderFrameError = function (t) {
                var e = new BMRenderFrameErrorEvent(t, this.currentFrame);
                this.triggerEvent("error", e),
                  this.onError && this.onError.call(this, e);
              }),
              (AnimationItem.prototype.triggerConfigError = function (t) {
                var e = new BMConfigErrorEvent(t, this.currentFrame);
                this.triggerEvent("error", e),
                  this.onError && this.onError.call(this, e);
              });
            var animationManager = (function () {
                var t = {},
                  e = [],
                  r = 0,
                  i = 0,
                  s = 0,
                  n = !0,
                  a = !1;
                function h(_) {
                  for (var T = 0, g = _.target; T < i; )
                    e[T].animation === g &&
                      (e.splice(T, 1), (T -= 1), (i -= 1), g.isPaused || P()),
                      (T += 1);
                }
                function o(_, T) {
                  if (!_) return null;
                  for (var g = 0; g < i; ) {
                    if (e[g].elem === _ && e[g].elem !== null)
                      return e[g].animation;
                    g += 1;
                  }
                  var S = new AnimationItem();
                  return c(S, _), S.setData(_, T), S;
                }
                function f() {
                  var _,
                    T = e.length,
                    g = [];
                  for (_ = 0; _ < T; _ += 1) g.push(e[_].animation);
                  return g;
                }
                function d() {
                  (s += 1), z();
                }
                function P() {
                  s -= 1;
                }
                function c(_, T) {
                  _.addEventListener("destroy", h),
                    _.addEventListener("_active", d),
                    _.addEventListener("_idle", P),
                    e.push({ elem: T, animation: _ }),
                    (i += 1);
                }
                function b(_) {
                  var T = new AnimationItem();
                  return c(T, null), T.setParams(_), T;
                }
                function v(_, T) {
                  var g;
                  for (g = 0; g < i; g += 1) e[g].animation.setSpeed(_, T);
                }
                function m(_, T) {
                  var g;
                  for (g = 0; g < i; g += 1) e[g].animation.setDirection(_, T);
                }
                function C(_) {
                  var T;
                  for (T = 0; T < i; T += 1) e[T].animation.play(_);
                }
                function p(_) {
                  var T = _ - r,
                    g;
                  for (g = 0; g < i; g += 1) e[g].animation.advanceTime(T);
                  (r = _), s && !a ? window.requestAnimationFrame(p) : (n = !0);
                }
                function u(_) {
                  (r = _), window.requestAnimationFrame(p);
                }
                function l(_) {
                  var T;
                  for (T = 0; T < i; T += 1) e[T].animation.pause(_);
                }
                function y(_, T, g) {
                  var S;
                  for (S = 0; S < i; S += 1)
                    e[S].animation.goToAndStop(_, T, g);
                }
                function E(_) {
                  var T;
                  for (T = 0; T < i; T += 1) e[T].animation.stop(_);
                }
                function x(_) {
                  var T;
                  for (T = 0; T < i; T += 1) e[T].animation.togglePause(_);
                }
                function A(_) {
                  var T;
                  for (T = i - 1; T >= 0; T -= 1) e[T].animation.destroy(_);
                }
                function F(_, T, g) {
                  var S = [].concat(
                      [].slice.call(document.getElementsByClassName("lottie")),
                      [].slice.call(
                        document.getElementsByClassName("bodymovin")
                      )
                    ),
                    k,
                    M = S.length;
                  for (k = 0; k < M; k += 1)
                    g && S[k].setAttribute("data-bm-type", g), o(S[k], _);
                  if (T && M === 0) {
                    g || (g = "svg");
                    var V = document.getElementsByTagName("body")[0];
                    V.innerText = "";
                    var D = createTag("div");
                    (D.style.width = "100%"),
                      (D.style.height = "100%"),
                      D.setAttribute("data-bm-type", g),
                      V.appendChild(D),
                      o(D, _);
                  }
                }
                function w() {
                  var _;
                  for (_ = 0; _ < i; _ += 1) e[_].animation.resize();
                }
                function z() {
                  !a && s && n && (window.requestAnimationFrame(u), (n = !1));
                }
                function R() {
                  a = !0;
                }
                function L() {
                  (a = !1), z();
                }
                function O(_, T) {
                  var g;
                  for (g = 0; g < i; g += 1) e[g].animation.setVolume(_, T);
                }
                function G(_) {
                  var T;
                  for (T = 0; T < i; T += 1) e[T].animation.mute(_);
                }
                function I(_) {
                  var T;
                  for (T = 0; T < i; T += 1) e[T].animation.unmute(_);
                }
                return (
                  (t.registerAnimation = o),
                  (t.loadAnimation = b),
                  (t.setSpeed = v),
                  (t.setDirection = m),
                  (t.play = C),
                  (t.pause = l),
                  (t.stop = E),
                  (t.togglePause = x),
                  (t.searchAnimations = F),
                  (t.resize = w),
                  (t.goToAndStop = y),
                  (t.destroy = A),
                  (t.freeze = R),
                  (t.unfreeze = L),
                  (t.setVolume = O),
                  (t.mute = G),
                  (t.unmute = I),
                  (t.getRegisteredAnimations = f),
                  t
                );
              })(),
              BezierFactory = (function () {
                var t = {};
                t.getBezierEasing = r;
                var e = {};
                function r(u, l, y, E, x) {
                  var A =
                    x ||
                    ("bez_" + u + "_" + l + "_" + y + "_" + E).replace(
                      /\./g,
                      "p"
                    );
                  if (e[A]) return e[A];
                  var F = new p([u, l, y, E]);
                  return (e[A] = F), F;
                }
                var i = 4,
                  s = 0.001,
                  n = 1e-7,
                  a = 10,
                  h = 11,
                  o = 1 / (h - 1),
                  f = typeof Float32Array == "function";
                function d(u, l) {
                  return 1 - 3 * l + 3 * u;
                }
                function P(u, l) {
                  return 3 * l - 6 * u;
                }
                function c(u) {
                  return 3 * u;
                }
                function b(u, l, y) {
                  return ((d(l, y) * u + P(l, y)) * u + c(l)) * u;
                }
                function v(u, l, y) {
                  return 3 * d(l, y) * u * u + 2 * P(l, y) * u + c(l);
                }
                function m(u, l, y, E, x) {
                  var A,
                    F,
                    w = 0;
                  do
                    (F = l + (y - l) / 2),
                      (A = b(F, E, x) - u),
                      A > 0 ? (y = F) : (l = F);
                  while (Math.abs(A) > n && ++w < a);
                  return F;
                }
                function C(u, l, y, E) {
                  for (var x = 0; x < i; ++x) {
                    var A = v(l, y, E);
                    if (A === 0) return l;
                    var F = b(l, y, E) - u;
                    l -= F / A;
                  }
                  return l;
                }
                function p(u) {
                  (this._p = u),
                    (this._mSampleValues = f
                      ? new Float32Array(h)
                      : new Array(h)),
                    (this._precomputed = !1),
                    (this.get = this.get.bind(this));
                }
                return (
                  (p.prototype = {
                    get: function (l) {
                      var y = this._p[0],
                        E = this._p[1],
                        x = this._p[2],
                        A = this._p[3];
                      return (
                        this._precomputed || this._precompute(),
                        y === E && x === A
                          ? l
                          : l === 0
                          ? 0
                          : l === 1
                          ? 1
                          : b(this._getTForX(l), E, A)
                      );
                    },
                    _precompute: function () {
                      var l = this._p[0],
                        y = this._p[1],
                        E = this._p[2],
                        x = this._p[3];
                      (this._precomputed = !0),
                        (l !== y || E !== x) && this._calcSampleValues();
                    },
                    _calcSampleValues: function () {
                      for (
                        var l = this._p[0], y = this._p[2], E = 0;
                        E < h;
                        ++E
                      )
                        this._mSampleValues[E] = b(E * o, l, y);
                    },
                    _getTForX: function (l) {
                      for (
                        var y = this._p[0],
                          E = this._p[2],
                          x = this._mSampleValues,
                          A = 0,
                          F = 1,
                          w = h - 1;
                        F !== w && x[F] <= l;
                        ++F
                      )
                        A += o;
                      --F;
                      var z = (l - x[F]) / (x[F + 1] - x[F]),
                        R = A + z * o,
                        L = v(R, y, E);
                      return L >= s
                        ? C(l, R, y, E)
                        : L === 0
                        ? R
                        : m(l, A, A + o, y, E);
                    },
                  }),
                  t
                );
              })(),
              pooling = (function () {
                function t(e) {
                  return e.concat(createSizedArray(e.length));
                }
                return { double: t };
              })(),
              poolFactory = (function () {
                return function (t, e, r) {
                  var i = 0,
                    s = t,
                    n = createSizedArray(s),
                    a = { newElement: h, release: o };
                  function h() {
                    var f;
                    return i ? ((i -= 1), (f = n[i])) : (f = e()), f;
                  }
                  function o(f) {
                    i === s && ((n = pooling.double(n)), (s *= 2)),
                      r && r(f),
                      (n[i] = f),
                      (i += 1);
                  }
                  return a;
                };
              })(),
              bezierLengthPool = (function () {
                function t() {
                  return {
                    addedLength: 0,
                    percents: createTypedArray(
                      "float32",
                      getDefaultCurveSegments()
                    ),
                    lengths: createTypedArray(
                      "float32",
                      getDefaultCurveSegments()
                    ),
                  };
                }
                return poolFactory(8, t);
              })(),
              segmentsLengthPool = (function () {
                function t() {
                  return { lengths: [], totalLength: 0 };
                }
                function e(r) {
                  var i,
                    s = r.lengths.length;
                  for (i = 0; i < s; i += 1)
                    bezierLengthPool.release(r.lengths[i]);
                  r.lengths.length = 0;
                }
                return poolFactory(8, t, e);
              })();
            function bezFunction() {
              var t = Math;
              function e(c, b, v, m, C, p) {
                var u = c * m + b * C + v * p - C * m - p * c - v * b;
                return u > -0.001 && u < 0.001;
              }
              function r(c, b, v, m, C, p, u, l, y) {
                if (v === 0 && p === 0 && y === 0) return e(c, b, m, C, u, l);
                var E = t.sqrt(
                    t.pow(m - c, 2) + t.pow(C - b, 2) + t.pow(p - v, 2)
                  ),
                  x = t.sqrt(
                    t.pow(u - c, 2) + t.pow(l - b, 2) + t.pow(y - v, 2)
                  ),
                  A = t.sqrt(
                    t.pow(u - m, 2) + t.pow(l - C, 2) + t.pow(y - p, 2)
                  ),
                  F;
                return (
                  E > x
                    ? E > A
                      ? (F = E - x - A)
                      : (F = A - x - E)
                    : A > x
                    ? (F = A - x - E)
                    : (F = x - E - A),
                  F > -1e-4 && F < 1e-4
                );
              }
              var i = (function () {
                return function (c, b, v, m) {
                  var C = getDefaultCurveSegments(),
                    p,
                    u,
                    l,
                    y,
                    E,
                    x = 0,
                    A,
                    F = [],
                    w = [],
                    z = bezierLengthPool.newElement();
                  for (l = v.length, p = 0; p < C; p += 1) {
                    for (E = p / (C - 1), A = 0, u = 0; u < l; u += 1)
                      (y =
                        bmPow(1 - E, 3) * c[u] +
                        3 * bmPow(1 - E, 2) * E * v[u] +
                        3 * (1 - E) * bmPow(E, 2) * m[u] +
                        bmPow(E, 3) * b[u]),
                        (F[u] = y),
                        w[u] !== null && (A += bmPow(F[u] - w[u], 2)),
                        (w[u] = F[u]);
                    A && ((A = bmSqrt(A)), (x += A)),
                      (z.percents[p] = E),
                      (z.lengths[p] = x);
                  }
                  return (z.addedLength = x), z;
                };
              })();
              function s(c) {
                var b = segmentsLengthPool.newElement(),
                  v = c.c,
                  m = c.v,
                  C = c.o,
                  p = c.i,
                  u,
                  l = c._length,
                  y = b.lengths,
                  E = 0;
                for (u = 0; u < l - 1; u += 1)
                  (y[u] = i(m[u], m[u + 1], C[u], p[u + 1])),
                    (E += y[u].addedLength);
                return (
                  v &&
                    l &&
                    ((y[u] = i(m[u], m[0], C[u], p[0])),
                    (E += y[u].addedLength)),
                  (b.totalLength = E),
                  b
                );
              }
              function n(c) {
                (this.segmentLength = 0), (this.points = new Array(c));
              }
              function a(c, b) {
                (this.partialLength = c), (this.point = b);
              }
              var h = (function () {
                var c = {};
                return function (b, v, m, C) {
                  var p = (
                    b[0] +
                    "_" +
                    b[1] +
                    "_" +
                    v[0] +
                    "_" +
                    v[1] +
                    "_" +
                    m[0] +
                    "_" +
                    m[1] +
                    "_" +
                    C[0] +
                    "_" +
                    C[1]
                  ).replace(/\./g, "p");
                  if (!c[p]) {
                    var u = getDefaultCurveSegments(),
                      l,
                      y,
                      E,
                      x,
                      A,
                      F = 0,
                      w,
                      z,
                      R = null;
                    b.length === 2 &&
                      (b[0] !== v[0] || b[1] !== v[1]) &&
                      e(b[0], b[1], v[0], v[1], b[0] + m[0], b[1] + m[1]) &&
                      e(b[0], b[1], v[0], v[1], v[0] + C[0], v[1] + C[1]) &&
                      (u = 2);
                    var L = new n(u);
                    for (E = m.length, l = 0; l < u; l += 1) {
                      for (
                        z = createSizedArray(E), A = l / (u - 1), w = 0, y = 0;
                        y < E;
                        y += 1
                      )
                        (x =
                          bmPow(1 - A, 3) * b[y] +
                          3 * bmPow(1 - A, 2) * A * (b[y] + m[y]) +
                          3 * (1 - A) * bmPow(A, 2) * (v[y] + C[y]) +
                          bmPow(A, 3) * v[y]),
                          (z[y] = x),
                          R !== null && (w += bmPow(z[y] - R[y], 2));
                      (w = bmSqrt(w)),
                        (F += w),
                        (L.points[l] = new a(w, z)),
                        (R = z);
                    }
                    (L.segmentLength = F), (c[p] = L);
                  }
                  return c[p];
                };
              })();
              function o(c, b) {
                var v = b.percents,
                  m = b.lengths,
                  C = v.length,
                  p = bmFloor((C - 1) * c),
                  u = c * b.addedLength,
                  l = 0;
                if (p === C - 1 || p === 0 || u === m[p]) return v[p];
                for (var y = m[p] > u ? -1 : 1, E = !0; E; )
                  if (
                    (m[p] <= u && m[p + 1] > u
                      ? ((l = (u - m[p]) / (m[p + 1] - m[p])), (E = !1))
                      : (p += y),
                    p < 0 || p >= C - 1)
                  ) {
                    if (p === C - 1) return v[p];
                    E = !1;
                  }
                return v[p] + (v[p + 1] - v[p]) * l;
              }
              function f(c, b, v, m, C, p) {
                var u = o(C, p),
                  l = 1 - u,
                  y =
                    t.round(
                      (l * l * l * c[0] +
                        (u * l * l + l * u * l + l * l * u) * v[0] +
                        (u * u * l + l * u * u + u * l * u) * m[0] +
                        u * u * u * b[0]) *
                        1e3
                    ) / 1e3,
                  E =
                    t.round(
                      (l * l * l * c[1] +
                        (u * l * l + l * u * l + l * l * u) * v[1] +
                        (u * u * l + l * u * u + u * l * u) * m[1] +
                        u * u * u * b[1]) *
                        1e3
                    ) / 1e3;
                return [y, E];
              }
              var d = createTypedArray("float32", 8);
              function P(c, b, v, m, C, p, u) {
                C < 0 ? (C = 0) : C > 1 && (C = 1);
                var l = o(C, u);
                p = p > 1 ? 1 : p;
                var y = o(p, u),
                  E,
                  x = c.length,
                  A = 1 - l,
                  F = 1 - y,
                  w = A * A * A,
                  z = l * A * A * 3,
                  R = l * l * A * 3,
                  L = l * l * l,
                  O = A * A * F,
                  G = l * A * F + A * l * F + A * A * y,
                  I = l * l * F + A * l * y + l * A * y,
                  _ = l * l * y,
                  T = A * F * F,
                  g = l * F * F + A * y * F + A * F * y,
                  S = l * y * F + A * y * y + l * F * y,
                  k = l * y * y,
                  M = F * F * F,
                  V = y * F * F + F * y * F + F * F * y,
                  D = y * y * F + F * y * y + y * F * y,
                  B = y * y * y;
                for (E = 0; E < x; E += 1)
                  (d[E * 4] =
                    t.round((w * c[E] + z * v[E] + R * m[E] + L * b[E]) * 1e3) /
                    1e3),
                    (d[E * 4 + 1] =
                      t.round(
                        (O * c[E] + G * v[E] + I * m[E] + _ * b[E]) * 1e3
                      ) / 1e3),
                    (d[E * 4 + 2] =
                      t.round(
                        (T * c[E] + g * v[E] + S * m[E] + k * b[E]) * 1e3
                      ) / 1e3),
                    (d[E * 4 + 3] =
                      t.round(
                        (M * c[E] + V * v[E] + D * m[E] + B * b[E]) * 1e3
                      ) / 1e3);
                return d;
              }
              return {
                getSegmentsLength: s,
                getNewSegment: P,
                getPointInSegment: f,
                buildBezierData: h,
                pointOnLine2D: e,
                pointOnLine3D: r,
              };
            }
            var bez = bezFunction(),
              initFrame = initialDefaultFrame,
              mathAbs = Math.abs;
            function interpolateValue(t, e) {
              var r = this.offsetTime,
                i;
              this.propType === "multidimensional" &&
                (i = createTypedArray("float32", this.pv.length));
              for (
                var s = e.lastIndex,
                  n = s,
                  a = this.keyframes.length - 1,
                  h = !0,
                  o,
                  f,
                  d;
                h;

              ) {
                if (
                  ((o = this.keyframes[n]),
                  (f = this.keyframes[n + 1]),
                  n === a - 1 && t >= f.t - r)
                ) {
                  o.h && (o = f), (s = 0);
                  break;
                }
                if (f.t - r > t) {
                  s = n;
                  break;
                }
                n < a - 1 ? (n += 1) : ((s = 0), (h = !1));
              }
              d = this.keyframesMetadata[n] || {};
              var P,
                c,
                b,
                v,
                m,
                C,
                p = f.t - r,
                u = o.t - r,
                l;
              if (o.to) {
                d.bezierData ||
                  (d.bezierData = bez.buildBezierData(
                    o.s,
                    f.s || o.e,
                    o.to,
                    o.ti
                  ));
                var y = d.bezierData;
                if (t >= p || t < u) {
                  var E = t >= p ? y.points.length - 1 : 0;
                  for (c = y.points[E].point.length, P = 0; P < c; P += 1)
                    i[P] = y.points[E].point[P];
                } else {
                  d.__fnct
                    ? (C = d.__fnct)
                    : ((C = BezierFactory.getBezierEasing(
                        o.o.x,
                        o.o.y,
                        o.i.x,
                        o.i.y,
                        o.n
                      ).get),
                      (d.__fnct = C)),
                    (b = C((t - u) / (p - u)));
                  var x = y.segmentLength * b,
                    A,
                    F =
                      e.lastFrame < t && e._lastKeyframeIndex === n
                        ? e._lastAddedLength
                        : 0;
                  for (
                    m =
                      e.lastFrame < t && e._lastKeyframeIndex === n
                        ? e._lastPoint
                        : 0,
                      h = !0,
                      v = y.points.length;
                    h;

                  ) {
                    if (
                      ((F += y.points[m].partialLength),
                      x === 0 || b === 0 || m === y.points.length - 1)
                    ) {
                      for (c = y.points[m].point.length, P = 0; P < c; P += 1)
                        i[P] = y.points[m].point[P];
                      break;
                    } else if (
                      x >= F &&
                      x < F + y.points[m + 1].partialLength
                    ) {
                      for (
                        A = (x - F) / y.points[m + 1].partialLength,
                          c = y.points[m].point.length,
                          P = 0;
                        P < c;
                        P += 1
                      )
                        i[P] =
                          y.points[m].point[P] +
                          (y.points[m + 1].point[P] - y.points[m].point[P]) * A;
                      break;
                    }
                    m < v - 1 ? (m += 1) : (h = !1);
                  }
                  (e._lastPoint = m),
                    (e._lastAddedLength = F - y.points[m].partialLength),
                    (e._lastKeyframeIndex = n);
                }
              } else {
                var w, z, R, L, O;
                if (((a = o.s.length), (l = f.s || o.e), this.sh && o.h !== 1))
                  if (t >= p) (i[0] = l[0]), (i[1] = l[1]), (i[2] = l[2]);
                  else if (t <= u)
                    (i[0] = o.s[0]), (i[1] = o.s[1]), (i[2] = o.s[2]);
                  else {
                    var G = createQuaternion(o.s),
                      I = createQuaternion(l),
                      _ = (t - u) / (p - u);
                    quaternionToEuler(i, slerp(G, I, _));
                  }
                else
                  for (n = 0; n < a; n += 1)
                    o.h !== 1 &&
                      (t >= p
                        ? (b = 1)
                        : t < u
                        ? (b = 0)
                        : (o.o.x.constructor === Array
                            ? (d.__fnct || (d.__fnct = []),
                              d.__fnct[n]
                                ? (C = d.__fnct[n])
                                : ((w =
                                    o.o.x[n] === void 0 ? o.o.x[0] : o.o.x[n]),
                                  (z =
                                    o.o.y[n] === void 0 ? o.o.y[0] : o.o.y[n]),
                                  (R =
                                    o.i.x[n] === void 0 ? o.i.x[0] : o.i.x[n]),
                                  (L =
                                    o.i.y[n] === void 0 ? o.i.y[0] : o.i.y[n]),
                                  (C = BezierFactory.getBezierEasing(
                                    w,
                                    z,
                                    R,
                                    L
                                  ).get),
                                  (d.__fnct[n] = C)))
                            : d.__fnct
                            ? (C = d.__fnct)
                            : ((w = o.o.x),
                              (z = o.o.y),
                              (R = o.i.x),
                              (L = o.i.y),
                              (C = BezierFactory.getBezierEasing(
                                w,
                                z,
                                R,
                                L
                              ).get),
                              (o.keyframeMetadata = C)),
                          (b = C((t - u) / (p - u))))),
                      (l = f.s || o.e),
                      (O = o.h === 1 ? o.s[n] : o.s[n] + (l[n] - o.s[n]) * b),
                      this.propType === "multidimensional"
                        ? (i[n] = O)
                        : (i = O);
              }
              return (e.lastIndex = s), i;
            }
            function slerp(t, e, r) {
              var i = [],
                s = t[0],
                n = t[1],
                a = t[2],
                h = t[3],
                o = e[0],
                f = e[1],
                d = e[2],
                P = e[3],
                c,
                b,
                v,
                m,
                C;
              return (
                (b = s * o + n * f + a * d + h * P),
                b < 0 && ((b = -b), (o = -o), (f = -f), (d = -d), (P = -P)),
                1 - b > 1e-6
                  ? ((c = Math.acos(b)),
                    (v = Math.sin(c)),
                    (m = Math.sin((1 - r) * c) / v),
                    (C = Math.sin(r * c) / v))
                  : ((m = 1 - r), (C = r)),
                (i[0] = m * s + C * o),
                (i[1] = m * n + C * f),
                (i[2] = m * a + C * d),
                (i[3] = m * h + C * P),
                i
              );
            }
            function quaternionToEuler(t, e) {
              var r = e[0],
                i = e[1],
                s = e[2],
                n = e[3],
                a = Math.atan2(
                  2 * i * n - 2 * r * s,
                  1 - 2 * i * i - 2 * s * s
                ),
                h = Math.asin(2 * r * i + 2 * s * n),
                o = Math.atan2(
                  2 * r * n - 2 * i * s,
                  1 - 2 * r * r - 2 * s * s
                );
              (t[0] = a / degToRads),
                (t[1] = h / degToRads),
                (t[2] = o / degToRads);
            }
            function createQuaternion(t) {
              var e = t[0] * degToRads,
                r = t[1] * degToRads,
                i = t[2] * degToRads,
                s = Math.cos(e / 2),
                n = Math.cos(r / 2),
                a = Math.cos(i / 2),
                h = Math.sin(e / 2),
                o = Math.sin(r / 2),
                f = Math.sin(i / 2),
                d = s * n * a - h * o * f,
                P = h * o * a + s * n * f,
                c = h * n * a + s * o * f,
                b = s * o * a - h * n * f;
              return [P, c, b, d];
            }
            function getValueAtCurrentTime() {
              var t = this.comp.renderedFrame - this.offsetTime,
                e = this.keyframes[0].t - this.offsetTime,
                r =
                  this.keyframes[this.keyframes.length - 1].t - this.offsetTime;
              if (
                !(
                  t === this._caching.lastFrame ||
                  (this._caching.lastFrame !== initFrame &&
                    ((this._caching.lastFrame >= r && t >= r) ||
                      (this._caching.lastFrame < e && t < e)))
                )
              ) {
                this._caching.lastFrame >= t &&
                  ((this._caching._lastKeyframeIndex = -1),
                  (this._caching.lastIndex = 0));
                var i = this.interpolateValue(t, this._caching);
                this.pv = i;
              }
              return (this._caching.lastFrame = t), this.pv;
            }
            function setVValue(t) {
              var e;
              if (this.propType === "unidimensional")
                (e = t * this.mult),
                  mathAbs(this.v - e) > 1e-5 &&
                    ((this.v = e), (this._mdf = !0));
              else
                for (var r = 0, i = this.v.length; r < i; )
                  (e = t[r] * this.mult),
                    mathAbs(this.v[r] - e) > 1e-5 &&
                      ((this.v[r] = e), (this._mdf = !0)),
                    (r += 1);
            }
            function processEffectsSequence() {
              if (
                !(
                  this.elem.globalData.frameId === this.frameId ||
                  !this.effectsSequence.length
                )
              ) {
                if (this.lock) {
                  this.setVValue(this.pv);
                  return;
                }
                (this.lock = !0), (this._mdf = this._isFirstFrame);
                var t,
                  e = this.effectsSequence.length,
                  r = this.kf ? this.pv : this.data.k;
                for (t = 0; t < e; t += 1) r = this.effectsSequence[t](r);
                this.setVValue(r),
                  (this._isFirstFrame = !1),
                  (this.lock = !1),
                  (this.frameId = this.elem.globalData.frameId);
              }
            }
            function addEffect(t) {
              this.effectsSequence.push(t),
                this.container.addDynamicProperty(this);
            }
            function ValueProperty(t, e, r, i) {
              (this.propType = "unidimensional"),
                (this.mult = r || 1),
                (this.data = e),
                (this.v = r ? e.k * r : e.k),
                (this.pv = e.k),
                (this._mdf = !1),
                (this.elem = t),
                (this.container = i),
                (this.comp = t.comp),
                (this.k = !1),
                (this.kf = !1),
                (this.vel = 0),
                (this.effectsSequence = []),
                (this._isFirstFrame = !0),
                (this.getValue = processEffectsSequence),
                (this.setVValue = setVValue),
                (this.addEffect = addEffect);
            }
            function MultiDimensionalProperty(t, e, r, i) {
              (this.propType = "multidimensional"),
                (this.mult = r || 1),
                (this.data = e),
                (this._mdf = !1),
                (this.elem = t),
                (this.container = i),
                (this.comp = t.comp),
                (this.k = !1),
                (this.kf = !1),
                (this.frameId = -1);
              var s,
                n = e.k.length;
              for (
                this.v = createTypedArray("float32", n),
                  this.pv = createTypedArray("float32", n),
                  this.vel = createTypedArray("float32", n),
                  s = 0;
                s < n;
                s += 1
              )
                (this.v[s] = e.k[s] * this.mult), (this.pv[s] = e.k[s]);
              (this._isFirstFrame = !0),
                (this.effectsSequence = []),
                (this.getValue = processEffectsSequence),
                (this.setVValue = setVValue),
                (this.addEffect = addEffect);
            }
            function KeyframedValueProperty(t, e, r, i) {
              (this.propType = "unidimensional"),
                (this.keyframes = e.k),
                (this.keyframesMetadata = []),
                (this.offsetTime = t.data.st),
                (this.frameId = -1),
                (this._caching = {
                  lastFrame: initFrame,
                  lastIndex: 0,
                  value: 0,
                  _lastKeyframeIndex: -1,
                }),
                (this.k = !0),
                (this.kf = !0),
                (this.data = e),
                (this.mult = r || 1),
                (this.elem = t),
                (this.container = i),
                (this.comp = t.comp),
                (this.v = initFrame),
                (this.pv = initFrame),
                (this._isFirstFrame = !0),
                (this.getValue = processEffectsSequence),
                (this.setVValue = setVValue),
                (this.interpolateValue = interpolateValue),
                (this.effectsSequence = [getValueAtCurrentTime.bind(this)]),
                (this.addEffect = addEffect);
            }
            function KeyframedMultidimensionalProperty(t, e, r, i) {
              this.propType = "multidimensional";
              var s,
                n = e.k.length,
                a,
                h,
                o,
                f;
              for (s = 0; s < n - 1; s += 1)
                e.k[s].to &&
                  e.k[s].s &&
                  e.k[s + 1] &&
                  e.k[s + 1].s &&
                  ((a = e.k[s].s),
                  (h = e.k[s + 1].s),
                  (o = e.k[s].to),
                  (f = e.k[s].ti),
                  ((a.length === 2 &&
                    !(a[0] === h[0] && a[1] === h[1]) &&
                    bez.pointOnLine2D(
                      a[0],
                      a[1],
                      h[0],
                      h[1],
                      a[0] + o[0],
                      a[1] + o[1]
                    ) &&
                    bez.pointOnLine2D(
                      a[0],
                      a[1],
                      h[0],
                      h[1],
                      h[0] + f[0],
                      h[1] + f[1]
                    )) ||
                    (a.length === 3 &&
                      !(a[0] === h[0] && a[1] === h[1] && a[2] === h[2]) &&
                      bez.pointOnLine3D(
                        a[0],
                        a[1],
                        a[2],
                        h[0],
                        h[1],
                        h[2],
                        a[0] + o[0],
                        a[1] + o[1],
                        a[2] + o[2]
                      ) &&
                      bez.pointOnLine3D(
                        a[0],
                        a[1],
                        a[2],
                        h[0],
                        h[1],
                        h[2],
                        h[0] + f[0],
                        h[1] + f[1],
                        h[2] + f[2]
                      ))) &&
                    ((e.k[s].to = null), (e.k[s].ti = null)),
                  a[0] === h[0] &&
                    a[1] === h[1] &&
                    o[0] === 0 &&
                    o[1] === 0 &&
                    f[0] === 0 &&
                    f[1] === 0 &&
                    (a.length === 2 ||
                      (a[2] === h[2] && o[2] === 0 && f[2] === 0)) &&
                    ((e.k[s].to = null), (e.k[s].ti = null)));
              (this.effectsSequence = [getValueAtCurrentTime.bind(this)]),
                (this.data = e),
                (this.keyframes = e.k),
                (this.keyframesMetadata = []),
                (this.offsetTime = t.data.st),
                (this.k = !0),
                (this.kf = !0),
                (this._isFirstFrame = !0),
                (this.mult = r || 1),
                (this.elem = t),
                (this.container = i),
                (this.comp = t.comp),
                (this.getValue = processEffectsSequence),
                (this.setVValue = setVValue),
                (this.interpolateValue = interpolateValue),
                (this.frameId = -1);
              var d = e.k[0].s.length;
              for (
                this.v = createTypedArray("float32", d),
                  this.pv = createTypedArray("float32", d),
                  s = 0;
                s < d;
                s += 1
              )
                (this.v[s] = initFrame), (this.pv[s] = initFrame);
              (this._caching = {
                lastFrame: initFrame,
                lastIndex: 0,
                value: createTypedArray("float32", d),
              }),
                (this.addEffect = addEffect);
            }
            var PropertyFactory = (function () {
              function t(r, i, s, n, a) {
                i.sid && (i = r.globalData.slotManager.getProp(i));
                var h;
                if (!i.k.length) h = new ValueProperty(r, i, n, a);
                else if (typeof i.k[0] == "number")
                  h = new MultiDimensionalProperty(r, i, n, a);
                else
                  switch (s) {
                    case 0:
                      h = new KeyframedValueProperty(r, i, n, a);
                      break;
                    case 1:
                      h = new KeyframedMultidimensionalProperty(r, i, n, a);
                      break;
                  }
                return h.effectsSequence.length && a.addDynamicProperty(h), h;
              }
              var e = { getProp: t };
              return e;
            })();
            function DynamicPropertyContainer() {}
            DynamicPropertyContainer.prototype = {
              addDynamicProperty: function (e) {
                this.dynamicProperties.indexOf(e) === -1 &&
                  (this.dynamicProperties.push(e),
                  this.container.addDynamicProperty(this),
                  (this._isAnimated = !0));
              },
              iterateDynamicProperties: function () {
                this._mdf = !1;
                var e,
                  r = this.dynamicProperties.length;
                for (e = 0; e < r; e += 1)
                  this.dynamicProperties[e].getValue(),
                    this.dynamicProperties[e]._mdf && (this._mdf = !0);
              },
              initDynamicPropertyContainer: function (e) {
                (this.container = e),
                  (this.dynamicProperties = []),
                  (this._mdf = !1),
                  (this._isAnimated = !1);
              },
            };
            var pointPool = (function () {
              function t() {
                return createTypedArray("float32", 2);
              }
              return poolFactory(8, t);
            })();
            function ShapePath() {
              (this.c = !1),
                (this._length = 0),
                (this._maxLength = 8),
                (this.v = createSizedArray(this._maxLength)),
                (this.o = createSizedArray(this._maxLength)),
                (this.i = createSizedArray(this._maxLength));
            }
            (ShapePath.prototype.setPathData = function (t, e) {
              (this.c = t), this.setLength(e);
              for (var r = 0; r < e; )
                (this.v[r] = pointPool.newElement()),
                  (this.o[r] = pointPool.newElement()),
                  (this.i[r] = pointPool.newElement()),
                  (r += 1);
            }),
              (ShapePath.prototype.setLength = function (t) {
                for (; this._maxLength < t; ) this.doubleArrayLength();
                this._length = t;
              }),
              (ShapePath.prototype.doubleArrayLength = function () {
                (this.v = this.v.concat(createSizedArray(this._maxLength))),
                  (this.i = this.i.concat(createSizedArray(this._maxLength))),
                  (this.o = this.o.concat(createSizedArray(this._maxLength))),
                  (this._maxLength *= 2);
              }),
              (ShapePath.prototype.setXYAt = function (t, e, r, i, s) {
                var n;
                switch (
                  ((this._length = Math.max(this._length, i + 1)),
                  this._length >= this._maxLength && this.doubleArrayLength(),
                  r)
                ) {
                  case "v":
                    n = this.v;
                    break;
                  case "i":
                    n = this.i;
                    break;
                  case "o":
                    n = this.o;
                    break;
                  default:
                    n = [];
                    break;
                }
                (!n[i] || (n[i] && !s)) && (n[i] = pointPool.newElement()),
                  (n[i][0] = t),
                  (n[i][1] = e);
              }),
              (ShapePath.prototype.setTripleAt = function (
                t,
                e,
                r,
                i,
                s,
                n,
                a,
                h
              ) {
                this.setXYAt(t, e, "v", a, h),
                  this.setXYAt(r, i, "o", a, h),
                  this.setXYAt(s, n, "i", a, h);
              }),
              (ShapePath.prototype.reverse = function () {
                var t = new ShapePath();
                t.setPathData(this.c, this._length);
                var e = this.v,
                  r = this.o,
                  i = this.i,
                  s = 0;
                this.c &&
                  (t.setTripleAt(
                    e[0][0],
                    e[0][1],
                    i[0][0],
                    i[0][1],
                    r[0][0],
                    r[0][1],
                    0,
                    !1
                  ),
                  (s = 1));
                var n = this._length - 1,
                  a = this._length,
                  h;
                for (h = s; h < a; h += 1)
                  t.setTripleAt(
                    e[n][0],
                    e[n][1],
                    i[n][0],
                    i[n][1],
                    r[n][0],
                    r[n][1],
                    h,
                    !1
                  ),
                    (n -= 1);
                return t;
              }),
              (ShapePath.prototype.length = function () {
                return this._length;
              });
            var shapePool = (function () {
              function t() {
                return new ShapePath();
              }
              function e(s) {
                var n = s._length,
                  a;
                for (a = 0; a < n; a += 1)
                  pointPool.release(s.v[a]),
                    pointPool.release(s.i[a]),
                    pointPool.release(s.o[a]),
                    (s.v[a] = null),
                    (s.i[a] = null),
                    (s.o[a] = null);
                (s._length = 0), (s.c = !1);
              }
              function r(s) {
                var n = i.newElement(),
                  a,
                  h = s._length === void 0 ? s.v.length : s._length;
                for (n.setLength(h), n.c = s.c, a = 0; a < h; a += 1)
                  n.setTripleAt(
                    s.v[a][0],
                    s.v[a][1],
                    s.o[a][0],
                    s.o[a][1],
                    s.i[a][0],
                    s.i[a][1],
                    a
                  );
                return n;
              }
              var i = poolFactory(4, t, e);
              return (i.clone = r), i;
            })();
            function ShapeCollection() {
              (this._length = 0),
                (this._maxLength = 4),
                (this.shapes = createSizedArray(this._maxLength));
            }
            (ShapeCollection.prototype.addShape = function (t) {
              this._length === this._maxLength &&
                ((this.shapes = this.shapes.concat(
                  createSizedArray(this._maxLength)
                )),
                (this._maxLength *= 2)),
                (this.shapes[this._length] = t),
                (this._length += 1);
            }),
              (ShapeCollection.prototype.releaseShapes = function () {
                var t;
                for (t = 0; t < this._length; t += 1)
                  shapePool.release(this.shapes[t]);
                this._length = 0;
              });
            var shapeCollectionPool = (function () {
                var t = { newShapeCollection: s, release: n },
                  e = 0,
                  r = 4,
                  i = createSizedArray(r);
                function s() {
                  var a;
                  return (
                    e ? ((e -= 1), (a = i[e])) : (a = new ShapeCollection()), a
                  );
                }
                function n(a) {
                  var h,
                    o = a._length;
                  for (h = 0; h < o; h += 1) shapePool.release(a.shapes[h]);
                  (a._length = 0),
                    e === r && ((i = pooling.double(i)), (r *= 2)),
                    (i[e] = a),
                    (e += 1);
                }
                return t;
              })(),
              ShapePropertyFactory = (function () {
                var t = -999999;
                function e(p, u, l) {
                  var y = l.lastIndex,
                    E,
                    x,
                    A,
                    F,
                    w,
                    z,
                    R,
                    L,
                    O,
                    G = this.keyframes;
                  if (p < G[0].t - this.offsetTime)
                    (E = G[0].s[0]), (A = !0), (y = 0);
                  else if (p >= G[G.length - 1].t - this.offsetTime)
                    (E = G[G.length - 1].s
                      ? G[G.length - 1].s[0]
                      : G[G.length - 2].e[0]),
                      (A = !0);
                  else {
                    for (
                      var I = y, _ = G.length - 1, T = !0, g, S, k;
                      T &&
                      ((g = G[I]),
                      (S = G[I + 1]),
                      !(S.t - this.offsetTime > p));

                    )
                      I < _ - 1 ? (I += 1) : (T = !1);
                    if (
                      ((k = this.keyframesMetadata[I] || {}),
                      (A = g.h === 1),
                      (y = I),
                      !A)
                    ) {
                      if (p >= S.t - this.offsetTime) L = 1;
                      else if (p < g.t - this.offsetTime) L = 0;
                      else {
                        var M;
                        k.__fnct
                          ? (M = k.__fnct)
                          : ((M = BezierFactory.getBezierEasing(
                              g.o.x,
                              g.o.y,
                              g.i.x,
                              g.i.y
                            ).get),
                            (k.__fnct = M)),
                          (L = M(
                            (p - (g.t - this.offsetTime)) /
                              (S.t - this.offsetTime - (g.t - this.offsetTime))
                          ));
                      }
                      x = S.s ? S.s[0] : g.e[0];
                    }
                    E = g.s[0];
                  }
                  for (
                    z = u._length, R = E.i[0].length, l.lastIndex = y, F = 0;
                    F < z;
                    F += 1
                  )
                    for (w = 0; w < R; w += 1)
                      (O = A
                        ? E.i[F][w]
                        : E.i[F][w] + (x.i[F][w] - E.i[F][w]) * L),
                        (u.i[F][w] = O),
                        (O = A
                          ? E.o[F][w]
                          : E.o[F][w] + (x.o[F][w] - E.o[F][w]) * L),
                        (u.o[F][w] = O),
                        (O = A
                          ? E.v[F][w]
                          : E.v[F][w] + (x.v[F][w] - E.v[F][w]) * L),
                        (u.v[F][w] = O);
                }
                function r() {
                  var p = this.comp.renderedFrame - this.offsetTime,
                    u = this.keyframes[0].t - this.offsetTime,
                    l =
                      this.keyframes[this.keyframes.length - 1].t -
                      this.offsetTime,
                    y = this._caching.lastFrame;
                  return (
                    (y !== t && ((y < u && p < u) || (y > l && p > l))) ||
                      ((this._caching.lastIndex =
                        y < p ? this._caching.lastIndex : 0),
                      this.interpolateShape(p, this.pv, this._caching)),
                    (this._caching.lastFrame = p),
                    this.pv
                  );
                }
                function i() {
                  this.paths = this.localShapeCollection;
                }
                function s(p, u) {
                  if (p._length !== u._length || p.c !== u.c) return !1;
                  var l,
                    y = p._length;
                  for (l = 0; l < y; l += 1)
                    if (
                      p.v[l][0] !== u.v[l][0] ||
                      p.v[l][1] !== u.v[l][1] ||
                      p.o[l][0] !== u.o[l][0] ||
                      p.o[l][1] !== u.o[l][1] ||
                      p.i[l][0] !== u.i[l][0] ||
                      p.i[l][1] !== u.i[l][1]
                    )
                      return !1;
                  return !0;
                }
                function n(p) {
                  s(this.v, p) ||
                    ((this.v = shapePool.clone(p)),
                    this.localShapeCollection.releaseShapes(),
                    this.localShapeCollection.addShape(this.v),
                    (this._mdf = !0),
                    (this.paths = this.localShapeCollection));
                }
                function a() {
                  if (this.elem.globalData.frameId !== this.frameId) {
                    if (!this.effectsSequence.length) {
                      this._mdf = !1;
                      return;
                    }
                    if (this.lock) {
                      this.setVValue(this.pv);
                      return;
                    }
                    (this.lock = !0), (this._mdf = !1);
                    var p;
                    this.kf
                      ? (p = this.pv)
                      : this.data.ks
                      ? (p = this.data.ks.k)
                      : (p = this.data.pt.k);
                    var u,
                      l = this.effectsSequence.length;
                    for (u = 0; u < l; u += 1) p = this.effectsSequence[u](p);
                    this.setVValue(p),
                      (this.lock = !1),
                      (this.frameId = this.elem.globalData.frameId);
                  }
                }
                function h(p, u, l) {
                  (this.propType = "shape"),
                    (this.comp = p.comp),
                    (this.container = p),
                    (this.elem = p),
                    (this.data = u),
                    (this.k = !1),
                    (this.kf = !1),
                    (this._mdf = !1);
                  var y = l === 3 ? u.pt.k : u.ks.k;
                  (this.v = shapePool.clone(y)),
                    (this.pv = shapePool.clone(this.v)),
                    (this.localShapeCollection =
                      shapeCollectionPool.newShapeCollection()),
                    (this.paths = this.localShapeCollection),
                    this.paths.addShape(this.v),
                    (this.reset = i),
                    (this.effectsSequence = []);
                }
                function o(p) {
                  this.effectsSequence.push(p),
                    this.container.addDynamicProperty(this);
                }
                (h.prototype.interpolateShape = e),
                  (h.prototype.getValue = a),
                  (h.prototype.setVValue = n),
                  (h.prototype.addEffect = o);
                function f(p, u, l) {
                  (this.propType = "shape"),
                    (this.comp = p.comp),
                    (this.elem = p),
                    (this.container = p),
                    (this.offsetTime = p.data.st),
                    (this.keyframes = l === 3 ? u.pt.k : u.ks.k),
                    (this.keyframesMetadata = []),
                    (this.k = !0),
                    (this.kf = !0);
                  var y = this.keyframes[0].s[0].i.length;
                  (this.v = shapePool.newElement()),
                    this.v.setPathData(this.keyframes[0].s[0].c, y),
                    (this.pv = shapePool.clone(this.v)),
                    (this.localShapeCollection =
                      shapeCollectionPool.newShapeCollection()),
                    (this.paths = this.localShapeCollection),
                    this.paths.addShape(this.v),
                    (this.lastFrame = t),
                    (this.reset = i),
                    (this._caching = { lastFrame: t, lastIndex: 0 }),
                    (this.effectsSequence = [r.bind(this)]);
                }
                (f.prototype.getValue = a),
                  (f.prototype.interpolateShape = e),
                  (f.prototype.setVValue = n),
                  (f.prototype.addEffect = o);
                var d = (function () {
                    var p = roundCorner;
                    function u(l, y) {
                      (this.v = shapePool.newElement()),
                        this.v.setPathData(!0, 4),
                        (this.localShapeCollection =
                          shapeCollectionPool.newShapeCollection()),
                        (this.paths = this.localShapeCollection),
                        this.localShapeCollection.addShape(this.v),
                        (this.d = y.d),
                        (this.elem = l),
                        (this.comp = l.comp),
                        (this.frameId = -1),
                        this.initDynamicPropertyContainer(l),
                        (this.p = PropertyFactory.getProp(l, y.p, 1, 0, this)),
                        (this.s = PropertyFactory.getProp(l, y.s, 1, 0, this)),
                        this.dynamicProperties.length
                          ? (this.k = !0)
                          : ((this.k = !1), this.convertEllToPath());
                    }
                    return (
                      (u.prototype = {
                        reset: i,
                        getValue: function () {
                          this.elem.globalData.frameId !== this.frameId &&
                            ((this.frameId = this.elem.globalData.frameId),
                            this.iterateDynamicProperties(),
                            this._mdf && this.convertEllToPath());
                        },
                        convertEllToPath: function () {
                          var y = this.p.v[0],
                            E = this.p.v[1],
                            x = this.s.v[0] / 2,
                            A = this.s.v[1] / 2,
                            F = this.d !== 3,
                            w = this.v;
                          (w.v[0][0] = y),
                            (w.v[0][1] = E - A),
                            (w.v[1][0] = F ? y + x : y - x),
                            (w.v[1][1] = E),
                            (w.v[2][0] = y),
                            (w.v[2][1] = E + A),
                            (w.v[3][0] = F ? y - x : y + x),
                            (w.v[3][1] = E),
                            (w.i[0][0] = F ? y - x * p : y + x * p),
                            (w.i[0][1] = E - A),
                            (w.i[1][0] = F ? y + x : y - x),
                            (w.i[1][1] = E - A * p),
                            (w.i[2][0] = F ? y + x * p : y - x * p),
                            (w.i[2][1] = E + A),
                            (w.i[3][0] = F ? y - x : y + x),
                            (w.i[3][1] = E + A * p),
                            (w.o[0][0] = F ? y + x * p : y - x * p),
                            (w.o[0][1] = E - A),
                            (w.o[1][0] = F ? y + x : y - x),
                            (w.o[1][1] = E + A * p),
                            (w.o[2][0] = F ? y - x * p : y + x * p),
                            (w.o[2][1] = E + A),
                            (w.o[3][0] = F ? y - x : y + x),
                            (w.o[3][1] = E - A * p);
                        },
                      }),
                      extendPrototype([DynamicPropertyContainer], u),
                      u
                    );
                  })(),
                  P = (function () {
                    function p(u, l) {
                      (this.v = shapePool.newElement()),
                        this.v.setPathData(!0, 0),
                        (this.elem = u),
                        (this.comp = u.comp),
                        (this.data = l),
                        (this.frameId = -1),
                        (this.d = l.d),
                        this.initDynamicPropertyContainer(u),
                        l.sy === 1
                          ? ((this.ir = PropertyFactory.getProp(
                              u,
                              l.ir,
                              0,
                              0,
                              this
                            )),
                            (this.is = PropertyFactory.getProp(
                              u,
                              l.is,
                              0,
                              0.01,
                              this
                            )),
                            (this.convertToPath = this.convertStarToPath))
                          : (this.convertToPath = this.convertPolygonToPath),
                        (this.pt = PropertyFactory.getProp(
                          u,
                          l.pt,
                          0,
                          0,
                          this
                        )),
                        (this.p = PropertyFactory.getProp(u, l.p, 1, 0, this)),
                        (this.r = PropertyFactory.getProp(
                          u,
                          l.r,
                          0,
                          degToRads,
                          this
                        )),
                        (this.or = PropertyFactory.getProp(
                          u,
                          l.or,
                          0,
                          0,
                          this
                        )),
                        (this.os = PropertyFactory.getProp(
                          u,
                          l.os,
                          0,
                          0.01,
                          this
                        )),
                        (this.localShapeCollection =
                          shapeCollectionPool.newShapeCollection()),
                        this.localShapeCollection.addShape(this.v),
                        (this.paths = this.localShapeCollection),
                        this.dynamicProperties.length
                          ? (this.k = !0)
                          : ((this.k = !1), this.convertToPath());
                    }
                    return (
                      (p.prototype = {
                        reset: i,
                        getValue: function () {
                          this.elem.globalData.frameId !== this.frameId &&
                            ((this.frameId = this.elem.globalData.frameId),
                            this.iterateDynamicProperties(),
                            this._mdf && this.convertToPath());
                        },
                        convertStarToPath: function () {
                          var l = Math.floor(this.pt.v) * 2,
                            y = (Math.PI * 2) / l,
                            E = !0,
                            x = this.or.v,
                            A = this.ir.v,
                            F = this.os.v,
                            w = this.is.v,
                            z = (2 * Math.PI * x) / (l * 2),
                            R = (2 * Math.PI * A) / (l * 2),
                            L,
                            O,
                            G,
                            I,
                            _ = -Math.PI / 2;
                          _ += this.r.v;
                          var T = this.data.d === 3 ? -1 : 1;
                          for (this.v._length = 0, L = 0; L < l; L += 1) {
                            (O = E ? x : A), (G = E ? F : w), (I = E ? z : R);
                            var g = O * Math.cos(_),
                              S = O * Math.sin(_),
                              k =
                                g === 0 && S === 0
                                  ? 0
                                  : S / Math.sqrt(g * g + S * S),
                              M =
                                g === 0 && S === 0
                                  ? 0
                                  : -g / Math.sqrt(g * g + S * S);
                            (g += +this.p.v[0]),
                              (S += +this.p.v[1]),
                              this.v.setTripleAt(
                                g,
                                S,
                                g - k * I * G * T,
                                S - M * I * G * T,
                                g + k * I * G * T,
                                S + M * I * G * T,
                                L,
                                !0
                              ),
                              (E = !E),
                              (_ += y * T);
                          }
                        },
                        convertPolygonToPath: function () {
                          var l = Math.floor(this.pt.v),
                            y = (Math.PI * 2) / l,
                            E = this.or.v,
                            x = this.os.v,
                            A = (2 * Math.PI * E) / (l * 4),
                            F,
                            w = -Math.PI * 0.5,
                            z = this.data.d === 3 ? -1 : 1;
                          for (
                            w += this.r.v, this.v._length = 0, F = 0;
                            F < l;
                            F += 1
                          ) {
                            var R = E * Math.cos(w),
                              L = E * Math.sin(w),
                              O =
                                R === 0 && L === 0
                                  ? 0
                                  : L / Math.sqrt(R * R + L * L),
                              G =
                                R === 0 && L === 0
                                  ? 0
                                  : -R / Math.sqrt(R * R + L * L);
                            (R += +this.p.v[0]),
                              (L += +this.p.v[1]),
                              this.v.setTripleAt(
                                R,
                                L,
                                R - O * A * x * z,
                                L - G * A * x * z,
                                R + O * A * x * z,
                                L + G * A * x * z,
                                F,
                                !0
                              ),
                              (w += y * z);
                          }
                          (this.paths.length = 0), (this.paths[0] = this.v);
                        },
                      }),
                      extendPrototype([DynamicPropertyContainer], p),
                      p
                    );
                  })(),
                  c = (function () {
                    function p(u, l) {
                      (this.v = shapePool.newElement()),
                        (this.v.c = !0),
                        (this.localShapeCollection =
                          shapeCollectionPool.newShapeCollection()),
                        this.localShapeCollection.addShape(this.v),
                        (this.paths = this.localShapeCollection),
                        (this.elem = u),
                        (this.comp = u.comp),
                        (this.frameId = -1),
                        (this.d = l.d),
                        this.initDynamicPropertyContainer(u),
                        (this.p = PropertyFactory.getProp(u, l.p, 1, 0, this)),
                        (this.s = PropertyFactory.getProp(u, l.s, 1, 0, this)),
                        (this.r = PropertyFactory.getProp(u, l.r, 0, 0, this)),
                        this.dynamicProperties.length
                          ? (this.k = !0)
                          : ((this.k = !1), this.convertRectToPath());
                    }
                    return (
                      (p.prototype = {
                        convertRectToPath: function () {
                          var l = this.p.v[0],
                            y = this.p.v[1],
                            E = this.s.v[0] / 2,
                            x = this.s.v[1] / 2,
                            A = bmMin(E, x, this.r.v),
                            F = A * (1 - roundCorner);
                          (this.v._length = 0),
                            this.d === 2 || this.d === 1
                              ? (this.v.setTripleAt(
                                  l + E,
                                  y - x + A,
                                  l + E,
                                  y - x + A,
                                  l + E,
                                  y - x + F,
                                  0,
                                  !0
                                ),
                                this.v.setTripleAt(
                                  l + E,
                                  y + x - A,
                                  l + E,
                                  y + x - F,
                                  l + E,
                                  y + x - A,
                                  1,
                                  !0
                                ),
                                A !== 0
                                  ? (this.v.setTripleAt(
                                      l + E - A,
                                      y + x,
                                      l + E - A,
                                      y + x,
                                      l + E - F,
                                      y + x,
                                      2,
                                      !0
                                    ),
                                    this.v.setTripleAt(
                                      l - E + A,
                                      y + x,
                                      l - E + F,
                                      y + x,
                                      l - E + A,
                                      y + x,
                                      3,
                                      !0
                                    ),
                                    this.v.setTripleAt(
                                      l - E,
                                      y + x - A,
                                      l - E,
                                      y + x - A,
                                      l - E,
                                      y + x - F,
                                      4,
                                      !0
                                    ),
                                    this.v.setTripleAt(
                                      l - E,
                                      y - x + A,
                                      l - E,
                                      y - x + F,
                                      l - E,
                                      y - x + A,
                                      5,
                                      !0
                                    ),
                                    this.v.setTripleAt(
                                      l - E + A,
                                      y - x,
                                      l - E + A,
                                      y - x,
                                      l - E + F,
                                      y - x,
                                      6,
                                      !0
                                    ),
                                    this.v.setTripleAt(
                                      l + E - A,
                                      y - x,
                                      l + E - F,
                                      y - x,
                                      l + E - A,
                                      y - x,
                                      7,
                                      !0
                                    ))
                                  : (this.v.setTripleAt(
                                      l - E,
                                      y + x,
                                      l - E + F,
                                      y + x,
                                      l - E,
                                      y + x,
                                      2
                                    ),
                                    this.v.setTripleAt(
                                      l - E,
                                      y - x,
                                      l - E,
                                      y - x + F,
                                      l - E,
                                      y - x,
                                      3
                                    )))
                              : (this.v.setTripleAt(
                                  l + E,
                                  y - x + A,
                                  l + E,
                                  y - x + F,
                                  l + E,
                                  y - x + A,
                                  0,
                                  !0
                                ),
                                A !== 0
                                  ? (this.v.setTripleAt(
                                      l + E - A,
                                      y - x,
                                      l + E - A,
                                      y - x,
                                      l + E - F,
                                      y - x,
                                      1,
                                      !0
                                    ),
                                    this.v.setTripleAt(
                                      l - E + A,
                                      y - x,
                                      l - E + F,
                                      y - x,
                                      l - E + A,
                                      y - x,
                                      2,
                                      !0
                                    ),
                                    this.v.setTripleAt(
                                      l - E,
                                      y - x + A,
                                      l - E,
                                      y - x + A,
                                      l - E,
                                      y - x + F,
                                      3,
                                      !0
                                    ),
                                    this.v.setTripleAt(
                                      l - E,
                                      y + x - A,
                                      l - E,
                                      y + x - F,
                                      l - E,
                                      y + x - A,
                                      4,
                                      !0
                                    ),
                                    this.v.setTripleAt(
                                      l - E + A,
                                      y + x,
                                      l - E + A,
                                      y + x,
                                      l - E + F,
                                      y + x,
                                      5,
                                      !0
                                    ),
                                    this.v.setTripleAt(
                                      l + E - A,
                                      y + x,
                                      l + E - F,
                                      y + x,
                                      l + E - A,
                                      y + x,
                                      6,
                                      !0
                                    ),
                                    this.v.setTripleAt(
                                      l + E,
                                      y + x - A,
                                      l + E,
                                      y + x - A,
                                      l + E,
                                      y + x - F,
                                      7,
                                      !0
                                    ))
                                  : (this.v.setTripleAt(
                                      l - E,
                                      y - x,
                                      l - E + F,
                                      y - x,
                                      l - E,
                                      y - x,
                                      1,
                                      !0
                                    ),
                                    this.v.setTripleAt(
                                      l - E,
                                      y + x,
                                      l - E,
                                      y + x - F,
                                      l - E,
                                      y + x,
                                      2,
                                      !0
                                    ),
                                    this.v.setTripleAt(
                                      l + E,
                                      y + x,
                                      l + E - F,
                                      y + x,
                                      l + E,
                                      y + x,
                                      3,
                                      !0
                                    )));
                        },
                        getValue: function () {
                          this.elem.globalData.frameId !== this.frameId &&
                            ((this.frameId = this.elem.globalData.frameId),
                            this.iterateDynamicProperties(),
                            this._mdf && this.convertRectToPath());
                        },
                        reset: i,
                      }),
                      extendPrototype([DynamicPropertyContainer], p),
                      p
                    );
                  })();
                function b(p, u, l) {
                  var y;
                  if (l === 3 || l === 4) {
                    var E = l === 3 ? u.pt : u.ks,
                      x = E.k;
                    x.length ? (y = new f(p, u, l)) : (y = new h(p, u, l));
                  } else
                    l === 5
                      ? (y = new c(p, u))
                      : l === 6
                      ? (y = new d(p, u))
                      : l === 7 && (y = new P(p, u));
                  return y.k && p.addDynamicProperty(y), y;
                }
                function v() {
                  return h;
                }
                function m() {
                  return f;
                }
                var C = {};
                return (
                  (C.getShapeProp = b),
                  (C.getConstructorFunction = v),
                  (C.getKeyframedConstructorFunction = m),
                  C
                );
              })();
            /*!
 Transformation Matrix v2.0
 (c) Epistemex 2014-2015
 www.epistemex.com
 By Ken Fyrstenberg
 Contributions by leeoniya.
 License: MIT, header required.
 */ var Matrix = (function () {
              var t = Math.cos,
                e = Math.sin,
                r = Math.tan,
                i = Math.round;
              function s() {
                return (
                  (this.props[0] = 1),
                  (this.props[1] = 0),
                  (this.props[2] = 0),
                  (this.props[3] = 0),
                  (this.props[4] = 0),
                  (this.props[5] = 1),
                  (this.props[6] = 0),
                  (this.props[7] = 0),
                  (this.props[8] = 0),
                  (this.props[9] = 0),
                  (this.props[10] = 1),
                  (this.props[11] = 0),
                  (this.props[12] = 0),
                  (this.props[13] = 0),
                  (this.props[14] = 0),
                  (this.props[15] = 1),
                  this
                );
              }
              function n(g) {
                if (g === 0) return this;
                var S = t(g),
                  k = e(g);
                return this._t(S, -k, 0, 0, k, S, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
              }
              function a(g) {
                if (g === 0) return this;
                var S = t(g),
                  k = e(g);
                return this._t(1, 0, 0, 0, 0, S, -k, 0, 0, k, S, 0, 0, 0, 0, 1);
              }
              function h(g) {
                if (g === 0) return this;
                var S = t(g),
                  k = e(g);
                return this._t(S, 0, k, 0, 0, 1, 0, 0, -k, 0, S, 0, 0, 0, 0, 1);
              }
              function o(g) {
                if (g === 0) return this;
                var S = t(g),
                  k = e(g);
                return this._t(S, -k, 0, 0, k, S, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
              }
              function f(g, S) {
                return this._t(1, S, g, 1, 0, 0);
              }
              function d(g, S) {
                return this.shear(r(g), r(S));
              }
              function P(g, S) {
                var k = t(S),
                  M = e(S);
                return this._t(k, M, 0, 0, -M, k, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
                  ._t(1, 0, 0, 0, r(g), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
                  ._t(k, -M, 0, 0, M, k, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
              }
              function c(g, S, k) {
                return (
                  !k && k !== 0 && (k = 1),
                  g === 1 && S === 1 && k === 1
                    ? this
                    : this._t(g, 0, 0, 0, 0, S, 0, 0, 0, 0, k, 0, 0, 0, 0, 1)
                );
              }
              function b(g, S, k, M, V, D, B, H, j, q, Y, Q, X, $, Z, W) {
                return (
                  (this.props[0] = g),
                  (this.props[1] = S),
                  (this.props[2] = k),
                  (this.props[3] = M),
                  (this.props[4] = V),
                  (this.props[5] = D),
                  (this.props[6] = B),
                  (this.props[7] = H),
                  (this.props[8] = j),
                  (this.props[9] = q),
                  (this.props[10] = Y),
                  (this.props[11] = Q),
                  (this.props[12] = X),
                  (this.props[13] = $),
                  (this.props[14] = Z),
                  (this.props[15] = W),
                  this
                );
              }
              function v(g, S, k) {
                return (
                  (k = k || 0),
                  g !== 0 || S !== 0 || k !== 0
                    ? this._t(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, g, S, k, 1)
                    : this
                );
              }
              function m(g, S, k, M, V, D, B, H, j, q, Y, Q, X, $, Z, W) {
                var N = this.props;
                if (
                  g === 1 &&
                  S === 0 &&
                  k === 0 &&
                  M === 0 &&
                  V === 0 &&
                  D === 1 &&
                  B === 0 &&
                  H === 0 &&
                  j === 0 &&
                  q === 0 &&
                  Y === 1 &&
                  Q === 0
                )
                  return (
                    (N[12] = N[12] * g + N[15] * X),
                    (N[13] = N[13] * D + N[15] * $),
                    (N[14] = N[14] * Y + N[15] * Z),
                    (N[15] *= W),
                    (this._identityCalculated = !1),
                    this
                  );
                var et = N[0],
                  nt = N[1],
                  rt = N[2],
                  tt = N[3],
                  it = N[4],
                  st = N[5],
                  K = N[6],
                  at = N[7],
                  ot = N[8],
                  J = N[9],
                  ht = N[10],
                  U = N[11],
                  lt = N[12],
                  ft = N[13],
                  pt = N[14],
                  ct = N[15];
                return (
                  (N[0] = et * g + nt * V + rt * j + tt * X),
                  (N[1] = et * S + nt * D + rt * q + tt * $),
                  (N[2] = et * k + nt * B + rt * Y + tt * Z),
                  (N[3] = et * M + nt * H + rt * Q + tt * W),
                  (N[4] = it * g + st * V + K * j + at * X),
                  (N[5] = it * S + st * D + K * q + at * $),
                  (N[6] = it * k + st * B + K * Y + at * Z),
                  (N[7] = it * M + st * H + K * Q + at * W),
                  (N[8] = ot * g + J * V + ht * j + U * X),
                  (N[9] = ot * S + J * D + ht * q + U * $),
                  (N[10] = ot * k + J * B + ht * Y + U * Z),
                  (N[11] = ot * M + J * H + ht * Q + U * W),
                  (N[12] = lt * g + ft * V + pt * j + ct * X),
                  (N[13] = lt * S + ft * D + pt * q + ct * $),
                  (N[14] = lt * k + ft * B + pt * Y + ct * Z),
                  (N[15] = lt * M + ft * H + pt * Q + ct * W),
                  (this._identityCalculated = !1),
                  this
                );
              }
              function C(g) {
                var S = g.props;
                return this.transform(
                  S[0],
                  S[1],
                  S[2],
                  S[3],
                  S[4],
                  S[5],
                  S[6],
                  S[7],
                  S[8],
                  S[9],
                  S[10],
                  S[11],
                  S[12],
                  S[13],
                  S[14],
                  S[15]
                );
              }
              function p() {
                return (
                  this._identityCalculated ||
                    ((this._identity = !(
                      this.props[0] !== 1 ||
                      this.props[1] !== 0 ||
                      this.props[2] !== 0 ||
                      this.props[3] !== 0 ||
                      this.props[4] !== 0 ||
                      this.props[5] !== 1 ||
                      this.props[6] !== 0 ||
                      this.props[7] !== 0 ||
                      this.props[8] !== 0 ||
                      this.props[9] !== 0 ||
                      this.props[10] !== 1 ||
                      this.props[11] !== 0 ||
                      this.props[12] !== 0 ||
                      this.props[13] !== 0 ||
                      this.props[14] !== 0 ||
                      this.props[15] !== 1
                    )),
                    (this._identityCalculated = !0)),
                  this._identity
                );
              }
              function u(g) {
                for (var S = 0; S < 16; ) {
                  if (g.props[S] !== this.props[S]) return !1;
                  S += 1;
                }
                return !0;
              }
              function l(g) {
                var S;
                for (S = 0; S < 16; S += 1) g.props[S] = this.props[S];
                return g;
              }
              function y(g) {
                var S;
                for (S = 0; S < 16; S += 1) this.props[S] = g[S];
              }
              function E(g, S, k) {
                return {
                  x:
                    g * this.props[0] +
                    S * this.props[4] +
                    k * this.props[8] +
                    this.props[12],
                  y:
                    g * this.props[1] +
                    S * this.props[5] +
                    k * this.props[9] +
                    this.props[13],
                  z:
                    g * this.props[2] +
                    S * this.props[6] +
                    k * this.props[10] +
                    this.props[14],
                };
              }
              function x(g, S, k) {
                return (
                  g * this.props[0] +
                  S * this.props[4] +
                  k * this.props[8] +
                  this.props[12]
                );
              }
              function A(g, S, k) {
                return (
                  g * this.props[1] +
                  S * this.props[5] +
                  k * this.props[9] +
                  this.props[13]
                );
              }
              function F(g, S, k) {
                return (
                  g * this.props[2] +
                  S * this.props[6] +
                  k * this.props[10] +
                  this.props[14]
                );
              }
              function w() {
                var g =
                    this.props[0] * this.props[5] -
                    this.props[1] * this.props[4],
                  S = this.props[5] / g,
                  k = -this.props[1] / g,
                  M = -this.props[4] / g,
                  V = this.props[0] / g,
                  D =
                    (this.props[4] * this.props[13] -
                      this.props[5] * this.props[12]) /
                    g,
                  B =
                    -(
                      this.props[0] * this.props[13] -
                      this.props[1] * this.props[12]
                    ) / g,
                  H = new Matrix();
                return (
                  (H.props[0] = S),
                  (H.props[1] = k),
                  (H.props[4] = M),
                  (H.props[5] = V),
                  (H.props[12] = D),
                  (H.props[13] = B),
                  H
                );
              }
              function z(g) {
                var S = this.getInverseMatrix();
                return S.applyToPointArray(g[0], g[1], g[2] || 0);
              }
              function R(g) {
                var S,
                  k = g.length,
                  M = [];
                for (S = 0; S < k; S += 1) M[S] = z(g[S]);
                return M;
              }
              function L(g, S, k) {
                var M = createTypedArray("float32", 6);
                if (this.isIdentity())
                  (M[0] = g[0]),
                    (M[1] = g[1]),
                    (M[2] = S[0]),
                    (M[3] = S[1]),
                    (M[4] = k[0]),
                    (M[5] = k[1]);
                else {
                  var V = this.props[0],
                    D = this.props[1],
                    B = this.props[4],
                    H = this.props[5],
                    j = this.props[12],
                    q = this.props[13];
                  (M[0] = g[0] * V + g[1] * B + j),
                    (M[1] = g[0] * D + g[1] * H + q),
                    (M[2] = S[0] * V + S[1] * B + j),
                    (M[3] = S[0] * D + S[1] * H + q),
                    (M[4] = k[0] * V + k[1] * B + j),
                    (M[5] = k[0] * D + k[1] * H + q);
                }
                return M;
              }
              function O(g, S, k) {
                var M;
                return (
                  this.isIdentity()
                    ? (M = [g, S, k])
                    : (M = [
                        g * this.props[0] +
                          S * this.props[4] +
                          k * this.props[8] +
                          this.props[12],
                        g * this.props[1] +
                          S * this.props[5] +
                          k * this.props[9] +
                          this.props[13],
                        g * this.props[2] +
                          S * this.props[6] +
                          k * this.props[10] +
                          this.props[14],
                      ]),
                  M
                );
              }
              function G(g, S) {
                if (this.isIdentity()) return g + "," + S;
                var k = this.props;
                return (
                  Math.round((g * k[0] + S * k[4] + k[12]) * 100) / 100 +
                  "," +
                  Math.round((g * k[1] + S * k[5] + k[13]) * 100) / 100
                );
              }
              function I() {
                for (
                  var g = 0, S = this.props, k = "matrix3d(", M = 1e4;
                  g < 16;

                )
                  (k += i(S[g] * M) / M), (k += g === 15 ? ")" : ","), (g += 1);
                return k;
              }
              function _(g) {
                var S = 1e4;
                return (g < 1e-6 && g > 0) || (g > -1e-6 && g < 0)
                  ? i(g * S) / S
                  : g;
              }
              function T() {
                var g = this.props,
                  S = _(g[0]),
                  k = _(g[1]),
                  M = _(g[4]),
                  V = _(g[5]),
                  D = _(g[12]),
                  B = _(g[13]);
                return (
                  "matrix(" +
                  S +
                  "," +
                  k +
                  "," +
                  M +
                  "," +
                  V +
                  "," +
                  D +
                  "," +
                  B +
                  ")"
                );
              }
              return function () {
                (this.reset = s),
                  (this.rotate = n),
                  (this.rotateX = a),
                  (this.rotateY = h),
                  (this.rotateZ = o),
                  (this.skew = d),
                  (this.skewFromAxis = P),
                  (this.shear = f),
                  (this.scale = c),
                  (this.setTransform = b),
                  (this.translate = v),
                  (this.transform = m),
                  (this.multiply = C),
                  (this.applyToPoint = E),
                  (this.applyToX = x),
                  (this.applyToY = A),
                  (this.applyToZ = F),
                  (this.applyToPointArray = O),
                  (this.applyToTriplePoints = L),
                  (this.applyToPointStringified = G),
                  (this.toCSS = I),
                  (this.to2dCSS = T),
                  (this.clone = l),
                  (this.cloneFromProps = y),
                  (this.equals = u),
                  (this.inversePoints = R),
                  (this.inversePoint = z),
                  (this.getInverseMatrix = w),
                  (this._t = this.transform),
                  (this.isIdentity = p),
                  (this._identity = !0),
                  (this._identityCalculated = !1),
                  (this.props = createTypedArray("float32", 16)),
                  this.reset();
              };
            })();
            function _typeof$3(t) {
              "@babel/helpers - typeof";
              return (
                typeof Symbol == "function" &&
                typeof Symbol.iterator == "symbol"
                  ? (_typeof$3 = function (r) {
                      return typeof r;
                    })
                  : (_typeof$3 = function (r) {
                      return r &&
                        typeof Symbol == "function" &&
                        r.constructor === Symbol &&
                        r !== Symbol.prototype
                        ? "symbol"
                        : typeof r;
                    }),
                _typeof$3(t)
              );
            }
            var lottie = {};
            function setLocation(t) {
              setLocationHref(t);
            }
            function searchAnimations() {
              animationManager.searchAnimations();
            }
            function setSubframeRendering(t) {
              setSubframeEnabled(t);
            }
            function setPrefix(t) {
              setIdPrefix(t);
            }
            function loadAnimation(t) {
              return animationManager.loadAnimation(t);
            }
            function setQuality(t) {
              if (typeof t == "string")
                switch (t) {
                  case "high":
                    setDefaultCurveSegments(200);
                    break;
                  default:
                  case "medium":
                    setDefaultCurveSegments(50);
                    break;
                  case "low":
                    setDefaultCurveSegments(10);
                    break;
                }
              else !isNaN(t) && t > 1 && setDefaultCurveSegments(t);
            }
            function inBrowser() {
              return typeof navigator < "u";
            }
            function installPlugin(t, e) {
              t === "expressions" && setExpressionsPlugin(e);
            }
            function getFactory(t) {
              switch (t) {
                case "propertyFactory":
                  return PropertyFactory;
                case "shapePropertyFactory":
                  return ShapePropertyFactory;
                case "matrix":
                  return Matrix;
                default:
                  return null;
              }
            }
            (lottie.play = animationManager.play),
              (lottie.pause = animationManager.pause),
              (lottie.setLocationHref = setLocation),
              (lottie.togglePause = animationManager.togglePause),
              (lottie.setSpeed = animationManager.setSpeed),
              (lottie.setDirection = animationManager.setDirection),
              (lottie.stop = animationManager.stop),
              (lottie.searchAnimations = searchAnimations),
              (lottie.registerAnimation = animationManager.registerAnimation),
              (lottie.loadAnimation = loadAnimation),
              (lottie.setSubframeRendering = setSubframeRendering),
              (lottie.resize = animationManager.resize),
              (lottie.goToAndStop = animationManager.goToAndStop),
              (lottie.destroy = animationManager.destroy),
              (lottie.setQuality = setQuality),
              (lottie.inBrowser = inBrowser),
              (lottie.installPlugin = installPlugin),
              (lottie.freeze = animationManager.freeze),
              (lottie.unfreeze = animationManager.unfreeze),
              (lottie.setVolume = animationManager.setVolume),
              (lottie.mute = animationManager.mute),
              (lottie.unmute = animationManager.unmute),
              (lottie.getRegisteredAnimations =
                animationManager.getRegisteredAnimations),
              (lottie.useWebWorker = setWebWorker),
              (lottie.setIDPrefix = setPrefix),
              (lottie.__getFactory = getFactory),
              (lottie.version = "5.12.2");
            function checkReady() {
              document.readyState === "complete" &&
                (clearInterval(readyStateCheckInterval), searchAnimations());
            }
            function getQueryVariable(t) {
              for (
                var e = queryString.split("&"), r = 0;
                r < e.length;
                r += 1
              ) {
                var i = e[r].split("=");
                if (decodeURIComponent(i[0]) == t)
                  return decodeURIComponent(i[1]);
              }
              return null;
            }
            var queryString = "";
            {
              var scripts = document.getElementsByTagName("script"),
                index = scripts.length - 1,
                myScript = scripts[index] || { src: "" };
              (queryString = myScript.src
                ? myScript.src.replace(/^[^\?]+\??/, "")
                : ""),
                getQueryVariable("renderer");
            }
            var readyStateCheckInterval = setInterval(checkReady, 100);
            try {
              _typeof$3(exports) !== "object" && (window.bodymovin = lottie);
            } catch (t) {}
            var ShapeModifiers = (function () {
              var t = {},
                e = {};
              (t.registerModifier = r), (t.getModifier = i);
              function r(s, n) {
                e[s] || (e[s] = n);
              }
              function i(s, n, a) {
                return new e[s](n, a);
              }
              return t;
            })();
            function ShapeModifier() {}
            (ShapeModifier.prototype.initModifierProperties = function () {}),
              (ShapeModifier.prototype.addShapeToModifier = function () {}),
              (ShapeModifier.prototype.addShape = function (t) {
                if (!this.closed) {
                  t.sh.container.addDynamicProperty(t.sh);
                  var e = {
                    shape: t.sh,
                    data: t,
                    localShapeCollection:
                      shapeCollectionPool.newShapeCollection(),
                  };
                  this.shapes.push(e),
                    this.addShapeToModifier(e),
                    this._isAnimated && t.setAsAnimated();
                }
              }),
              (ShapeModifier.prototype.init = function (t, e) {
                (this.shapes = []),
                  (this.elem = t),
                  this.initDynamicPropertyContainer(t),
                  this.initModifierProperties(t, e),
                  (this.frameId = initialDefaultFrame),
                  (this.closed = !1),
                  (this.k = !1),
                  this.dynamicProperties.length
                    ? (this.k = !0)
                    : this.getValue(!0);
              }),
              (ShapeModifier.prototype.processKeys = function () {
                this.elem.globalData.frameId !== this.frameId &&
                  ((this.frameId = this.elem.globalData.frameId),
                  this.iterateDynamicProperties());
              }),
              extendPrototype([DynamicPropertyContainer], ShapeModifier);
            function TrimModifier() {}
            extendPrototype([ShapeModifier], TrimModifier),
              (TrimModifier.prototype.initModifierProperties = function (t, e) {
                (this.s = PropertyFactory.getProp(t, e.s, 0, 0.01, this)),
                  (this.e = PropertyFactory.getProp(t, e.e, 0, 0.01, this)),
                  (this.o = PropertyFactory.getProp(t, e.o, 0, 0, this)),
                  (this.sValue = 0),
                  (this.eValue = 0),
                  (this.getValue = this.processKeys),
                  (this.m = e.m),
                  (this._isAnimated =
                    !!this.s.effectsSequence.length ||
                    !!this.e.effectsSequence.length ||
                    !!this.o.effectsSequence.length);
              }),
              (TrimModifier.prototype.addShapeToModifier = function (t) {
                t.pathsData = [];
              }),
              (TrimModifier.prototype.calculateShapeEdges = function (
                t,
                e,
                r,
                i,
                s
              ) {
                var n = [];
                e <= 1
                  ? n.push({ s: t, e })
                  : t >= 1
                  ? n.push({ s: t - 1, e: e - 1 })
                  : (n.push({ s: t, e: 1 }), n.push({ s: 0, e: e - 1 }));
                var a = [],
                  h,
                  o = n.length,
                  f;
                for (h = 0; h < o; h += 1)
                  if (((f = n[h]), !(f.e * s < i || f.s * s > i + r))) {
                    var d, P;
                    f.s * s <= i ? (d = 0) : (d = (f.s * s - i) / r),
                      f.e * s >= i + r ? (P = 1) : (P = (f.e * s - i) / r),
                      a.push([d, P]);
                  }
                return a.length || a.push([0, 0]), a;
              }),
              (TrimModifier.prototype.releasePathsData = function (t) {
                var e,
                  r = t.length;
                for (e = 0; e < r; e += 1) segmentsLengthPool.release(t[e]);
                return (t.length = 0), t;
              }),
              (TrimModifier.prototype.processShapes = function (t) {
                var e, r;
                if (this._mdf || t) {
                  var i = (this.o.v % 360) / 360;
                  if (
                    (i < 0 && (i += 1),
                    this.s.v > 1
                      ? (e = 1 + i)
                      : this.s.v < 0
                      ? (e = 0 + i)
                      : (e = this.s.v + i),
                    this.e.v > 1
                      ? (r = 1 + i)
                      : this.e.v < 0
                      ? (r = 0 + i)
                      : (r = this.e.v + i),
                    e > r)
                  ) {
                    var s = e;
                    (e = r), (r = s);
                  }
                  (e = Math.round(e * 1e4) * 1e-4),
                    (r = Math.round(r * 1e4) * 1e-4),
                    (this.sValue = e),
                    (this.eValue = r);
                } else (e = this.sValue), (r = this.eValue);
                var n,
                  a,
                  h = this.shapes.length,
                  o,
                  f,
                  d,
                  P,
                  c,
                  b = 0;
                if (r === e)
                  for (a = 0; a < h; a += 1)
                    this.shapes[a].localShapeCollection.releaseShapes(),
                      (this.shapes[a].shape._mdf = !0),
                      (this.shapes[a].shape.paths =
                        this.shapes[a].localShapeCollection),
                      this._mdf && (this.shapes[a].pathsData.length = 0);
                else if ((r === 1 && e === 0) || (r === 0 && e === 1)) {
                  if (this._mdf)
                    for (a = 0; a < h; a += 1)
                      (this.shapes[a].pathsData.length = 0),
                        (this.shapes[a].shape._mdf = !0);
                } else {
                  var v = [],
                    m,
                    C;
                  for (a = 0; a < h; a += 1)
                    if (
                      ((m = this.shapes[a]),
                      !m.shape._mdf && !this._mdf && !t && this.m !== 2)
                    )
                      m.shape.paths = m.localShapeCollection;
                    else {
                      if (
                        ((n = m.shape.paths),
                        (f = n._length),
                        (c = 0),
                        !m.shape._mdf && m.pathsData.length)
                      )
                        c = m.totalShapeLength;
                      else {
                        for (
                          d = this.releasePathsData(m.pathsData), o = 0;
                          o < f;
                          o += 1
                        )
                          (P = bez.getSegmentsLength(n.shapes[o])),
                            d.push(P),
                            (c += P.totalLength);
                        (m.totalShapeLength = c), (m.pathsData = d);
                      }
                      (b += c), (m.shape._mdf = !0);
                    }
                  var p = e,
                    u = r,
                    l = 0,
                    y;
                  for (a = h - 1; a >= 0; a -= 1)
                    if (((m = this.shapes[a]), m.shape._mdf)) {
                      for (
                        C = m.localShapeCollection,
                          C.releaseShapes(),
                          this.m === 2 && h > 1
                            ? ((y = this.calculateShapeEdges(
                                e,
                                r,
                                m.totalShapeLength,
                                l,
                                b
                              )),
                              (l += m.totalShapeLength))
                            : (y = [[p, u]]),
                          f = y.length,
                          o = 0;
                        o < f;
                        o += 1
                      ) {
                        (p = y[o][0]),
                          (u = y[o][1]),
                          (v.length = 0),
                          u <= 1
                            ? v.push({
                                s: m.totalShapeLength * p,
                                e: m.totalShapeLength * u,
                              })
                            : p >= 1
                            ? v.push({
                                s: m.totalShapeLength * (p - 1),
                                e: m.totalShapeLength * (u - 1),
                              })
                            : (v.push({
                                s: m.totalShapeLength * p,
                                e: m.totalShapeLength,
                              }),
                              v.push({
                                s: 0,
                                e: m.totalShapeLength * (u - 1),
                              }));
                        var E = this.addShapes(m, v[0]);
                        if (v[0].s !== v[0].e) {
                          if (v.length > 1) {
                            var x =
                              m.shape.paths.shapes[m.shape.paths._length - 1];
                            if (x.c) {
                              var A = E.pop();
                              this.addPaths(E, C),
                                (E = this.addShapes(m, v[1], A));
                            } else
                              this.addPaths(E, C),
                                (E = this.addShapes(m, v[1]));
                          }
                          this.addPaths(E, C);
                        }
                      }
                      m.shape.paths = C;
                    }
                }
              }),
              (TrimModifier.prototype.addPaths = function (t, e) {
                var r,
                  i = t.length;
                for (r = 0; r < i; r += 1) e.addShape(t[r]);
              }),
              (TrimModifier.prototype.addSegment = function (
                t,
                e,
                r,
                i,
                s,
                n,
                a
              ) {
                s.setXYAt(e[0], e[1], "o", n),
                  s.setXYAt(r[0], r[1], "i", n + 1),
                  a && s.setXYAt(t[0], t[1], "v", n),
                  s.setXYAt(i[0], i[1], "v", n + 1);
              }),
              (TrimModifier.prototype.addSegmentFromArray = function (
                t,
                e,
                r,
                i
              ) {
                e.setXYAt(t[1], t[5], "o", r),
                  e.setXYAt(t[2], t[6], "i", r + 1),
                  i && e.setXYAt(t[0], t[4], "v", r),
                  e.setXYAt(t[3], t[7], "v", r + 1);
              }),
              (TrimModifier.prototype.addShapes = function (t, e, r) {
                var i = t.pathsData,
                  s = t.shape.paths.shapes,
                  n,
                  a = t.shape.paths._length,
                  h,
                  o,
                  f = 0,
                  d,
                  P,
                  c,
                  b,
                  v = [],
                  m,
                  C = !0;
                for (
                  r
                    ? ((P = r._length), (m = r._length))
                    : ((r = shapePool.newElement()), (P = 0), (m = 0)),
                    v.push(r),
                    n = 0;
                  n < a;
                  n += 1
                ) {
                  for (
                    c = i[n].lengths,
                      r.c = s[n].c,
                      o = s[n].c ? c.length : c.length + 1,
                      h = 1;
                    h < o;
                    h += 1
                  )
                    if (((d = c[h - 1]), f + d.addedLength < e.s))
                      (f += d.addedLength), (r.c = !1);
                    else if (f > e.e) {
                      r.c = !1;
                      break;
                    } else
                      e.s <= f && e.e >= f + d.addedLength
                        ? (this.addSegment(
                            s[n].v[h - 1],
                            s[n].o[h - 1],
                            s[n].i[h],
                            s[n].v[h],
                            r,
                            P,
                            C
                          ),
                          (C = !1))
                        : ((b = bez.getNewSegment(
                            s[n].v[h - 1],
                            s[n].v[h],
                            s[n].o[h - 1],
                            s[n].i[h],
                            (e.s - f) / d.addedLength,
                            (e.e - f) / d.addedLength,
                            c[h - 1]
                          )),
                          this.addSegmentFromArray(b, r, P, C),
                          (C = !1),
                          (r.c = !1)),
                        (f += d.addedLength),
                        (P += 1);
                  if (s[n].c && c.length) {
                    if (((d = c[h - 1]), f <= e.e)) {
                      var p = c[h - 1].addedLength;
                      e.s <= f && e.e >= f + p
                        ? (this.addSegment(
                            s[n].v[h - 1],
                            s[n].o[h - 1],
                            s[n].i[0],
                            s[n].v[0],
                            r,
                            P,
                            C
                          ),
                          (C = !1))
                        : ((b = bez.getNewSegment(
                            s[n].v[h - 1],
                            s[n].v[0],
                            s[n].o[h - 1],
                            s[n].i[0],
                            (e.s - f) / p,
                            (e.e - f) / p,
                            c[h - 1]
                          )),
                          this.addSegmentFromArray(b, r, P, C),
                          (C = !1),
                          (r.c = !1));
                    } else r.c = !1;
                    (f += d.addedLength), (P += 1);
                  }
                  if (
                    (r._length &&
                      (r.setXYAt(r.v[m][0], r.v[m][1], "i", m),
                      r.setXYAt(
                        r.v[r._length - 1][0],
                        r.v[r._length - 1][1],
                        "o",
                        r._length - 1
                      )),
                    f > e.e)
                  )
                    break;
                  n < a - 1 &&
                    ((r = shapePool.newElement()),
                    (C = !0),
                    v.push(r),
                    (P = 0));
                }
                return v;
              });
            function PuckerAndBloatModifier() {}
            extendPrototype([ShapeModifier], PuckerAndBloatModifier),
              (PuckerAndBloatModifier.prototype.initModifierProperties =
                function (t, e) {
                  (this.getValue = this.processKeys),
                    (this.amount = PropertyFactory.getProp(
                      t,
                      e.a,
                      0,
                      null,
                      this
                    )),
                    (this._isAnimated = !!this.amount.effectsSequence.length);
                }),
              (PuckerAndBloatModifier.prototype.processPath = function (t, e) {
                var r = e / 100,
                  i = [0, 0],
                  s = t._length,
                  n = 0;
                for (n = 0; n < s; n += 1)
                  (i[0] += t.v[n][0]), (i[1] += t.v[n][1]);
                (i[0] /= s), (i[1] /= s);
                var a = shapePool.newElement();
                a.c = t.c;
                var h, o, f, d, P, c;
                for (n = 0; n < s; n += 1)
                  (h = t.v[n][0] + (i[0] - t.v[n][0]) * r),
                    (o = t.v[n][1] + (i[1] - t.v[n][1]) * r),
                    (f = t.o[n][0] + (i[0] - t.o[n][0]) * -r),
                    (d = t.o[n][1] + (i[1] - t.o[n][1]) * -r),
                    (P = t.i[n][0] + (i[0] - t.i[n][0]) * -r),
                    (c = t.i[n][1] + (i[1] - t.i[n][1]) * -r),
                    a.setTripleAt(h, o, f, d, P, c, n);
                return a;
              }),
              (PuckerAndBloatModifier.prototype.processShapes = function (t) {
                var e,
                  r,
                  i = this.shapes.length,
                  s,
                  n,
                  a = this.amount.v;
                if (a !== 0) {
                  var h, o;
                  for (r = 0; r < i; r += 1) {
                    if (
                      ((h = this.shapes[r]),
                      (o = h.localShapeCollection),
                      !(!h.shape._mdf && !this._mdf && !t))
                    )
                      for (
                        o.releaseShapes(),
                          h.shape._mdf = !0,
                          e = h.shape.paths.shapes,
                          n = h.shape.paths._length,
                          s = 0;
                        s < n;
                        s += 1
                      )
                        o.addShape(this.processPath(e[s], a));
                    h.shape.paths = h.localShapeCollection;
                  }
                }
                this.dynamicProperties.length || (this._mdf = !1);
              });
            var TransformPropertyFactory = (function () {
              var t = [0, 0];
              function e(o) {
                var f = this._mdf;
                this.iterateDynamicProperties(),
                  (this._mdf = this._mdf || f),
                  this.a &&
                    o.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]),
                  this.s && o.scale(this.s.v[0], this.s.v[1], this.s.v[2]),
                  this.sk && o.skewFromAxis(-this.sk.v, this.sa.v),
                  this.r
                    ? o.rotate(-this.r.v)
                    : o
                        .rotateZ(-this.rz.v)
                        .rotateY(this.ry.v)
                        .rotateX(this.rx.v)
                        .rotateZ(-this.or.v[2])
                        .rotateY(this.or.v[1])
                        .rotateX(this.or.v[0]),
                  this.data.p.s
                    ? this.data.p.z
                      ? o.translate(this.px.v, this.py.v, -this.pz.v)
                      : o.translate(this.px.v, this.py.v, 0)
                    : o.translate(this.p.v[0], this.p.v[1], -this.p.v[2]);
              }
              function r(o) {
                if (this.elem.globalData.frameId !== this.frameId) {
                  if (
                    (this._isDirty &&
                      (this.precalculateMatrix(), (this._isDirty = !1)),
                    this.iterateDynamicProperties(),
                    this._mdf || o)
                  ) {
                    var f;
                    if (
                      (this.v.cloneFromProps(this.pre.props),
                      this.appliedTransformations < 1 &&
                        this.v.translate(
                          -this.a.v[0],
                          -this.a.v[1],
                          this.a.v[2]
                        ),
                      this.appliedTransformations < 2 &&
                        this.v.scale(this.s.v[0], this.s.v[1], this.s.v[2]),
                      this.sk &&
                        this.appliedTransformations < 3 &&
                        this.v.skewFromAxis(-this.sk.v, this.sa.v),
                      this.r && this.appliedTransformations < 4
                        ? this.v.rotate(-this.r.v)
                        : !this.r &&
                          this.appliedTransformations < 4 &&
                          this.v
                            .rotateZ(-this.rz.v)
                            .rotateY(this.ry.v)
                            .rotateX(this.rx.v)
                            .rotateZ(-this.or.v[2])
                            .rotateY(this.or.v[1])
                            .rotateX(this.or.v[0]),
                      this.autoOriented)
                    ) {
                      var d, P;
                      if (
                        ((f = this.elem.globalData.frameRate),
                        this.p && this.p.keyframes && this.p.getValueAtTime)
                      )
                        this.p._caching.lastFrame + this.p.offsetTime <=
                        this.p.keyframes[0].t
                          ? ((d = this.p.getValueAtTime(
                              (this.p.keyframes[0].t + 0.01) / f,
                              0
                            )),
                            (P = this.p.getValueAtTime(
                              this.p.keyframes[0].t / f,
                              0
                            )))
                          : this.p._caching.lastFrame + this.p.offsetTime >=
                            this.p.keyframes[this.p.keyframes.length - 1].t
                          ? ((d = this.p.getValueAtTime(
                              this.p.keyframes[this.p.keyframes.length - 1].t /
                                f,
                              0
                            )),
                            (P = this.p.getValueAtTime(
                              (this.p.keyframes[this.p.keyframes.length - 1].t -
                                0.05) /
                                f,
                              0
                            )))
                          : ((d = this.p.pv),
                            (P = this.p.getValueAtTime(
                              (this.p._caching.lastFrame +
                                this.p.offsetTime -
                                0.01) /
                                f,
                              this.p.offsetTime
                            )));
                      else if (
                        this.px &&
                        this.px.keyframes &&
                        this.py.keyframes &&
                        this.px.getValueAtTime &&
                        this.py.getValueAtTime
                      ) {
                        (d = []), (P = []);
                        var c = this.px,
                          b = this.py;
                        c._caching.lastFrame + c.offsetTime <= c.keyframes[0].t
                          ? ((d[0] = c.getValueAtTime(
                              (c.keyframes[0].t + 0.01) / f,
                              0
                            )),
                            (d[1] = b.getValueAtTime(
                              (b.keyframes[0].t + 0.01) / f,
                              0
                            )),
                            (P[0] = c.getValueAtTime(c.keyframes[0].t / f, 0)),
                            (P[1] = b.getValueAtTime(b.keyframes[0].t / f, 0)))
                          : c._caching.lastFrame + c.offsetTime >=
                            c.keyframes[c.keyframes.length - 1].t
                          ? ((d[0] = c.getValueAtTime(
                              c.keyframes[c.keyframes.length - 1].t / f,
                              0
                            )),
                            (d[1] = b.getValueAtTime(
                              b.keyframes[b.keyframes.length - 1].t / f,
                              0
                            )),
                            (P[0] = c.getValueAtTime(
                              (c.keyframes[c.keyframes.length - 1].t - 0.01) /
                                f,
                              0
                            )),
                            (P[1] = b.getValueAtTime(
                              (b.keyframes[b.keyframes.length - 1].t - 0.01) /
                                f,
                              0
                            )))
                          : ((d = [c.pv, b.pv]),
                            (P[0] = c.getValueAtTime(
                              (c._caching.lastFrame + c.offsetTime - 0.01) / f,
                              c.offsetTime
                            )),
                            (P[1] = b.getValueAtTime(
                              (b._caching.lastFrame + b.offsetTime - 0.01) / f,
                              b.offsetTime
                            )));
                      } else (P = t), (d = P);
                      this.v.rotate(-Math.atan2(d[1] - P[1], d[0] - P[0]));
                    }
                    this.data.p && this.data.p.s
                      ? this.data.p.z
                        ? this.v.translate(this.px.v, this.py.v, -this.pz.v)
                        : this.v.translate(this.px.v, this.py.v, 0)
                      : this.v.translate(
                          this.p.v[0],
                          this.p.v[1],
                          -this.p.v[2]
                        );
                  }
                  this.frameId = this.elem.globalData.frameId;
                }
              }
              function i() {
                if (
                  ((this.appliedTransformations = 0),
                  this.pre.reset(),
                  !this.a.effectsSequence.length)
                )
                  this.pre.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]),
                    (this.appliedTransformations = 1);
                else return;
                if (!this.s.effectsSequence.length)
                  this.pre.scale(this.s.v[0], this.s.v[1], this.s.v[2]),
                    (this.appliedTransformations = 2);
                else return;
                if (this.sk)
                  if (
                    !this.sk.effectsSequence.length &&
                    !this.sa.effectsSequence.length
                  )
                    this.pre.skewFromAxis(-this.sk.v, this.sa.v),
                      (this.appliedTransformations = 3);
                  else return;
                this.r
                  ? this.r.effectsSequence.length ||
                    (this.pre.rotate(-this.r.v),
                    (this.appliedTransformations = 4))
                  : !this.rz.effectsSequence.length &&
                    !this.ry.effectsSequence.length &&
                    !this.rx.effectsSequence.length &&
                    !this.or.effectsSequence.length &&
                    (this.pre
                      .rotateZ(-this.rz.v)
                      .rotateY(this.ry.v)
                      .rotateX(this.rx.v)
                      .rotateZ(-this.or.v[2])
                      .rotateY(this.or.v[1])
                      .rotateX(this.or.v[0]),
                    (this.appliedTransformations = 4));
              }
              function s() {}
              function n(o) {
                this._addDynamicProperty(o),
                  this.elem.addDynamicProperty(o),
                  (this._isDirty = !0);
              }
              function a(o, f, d) {
                if (
                  ((this.elem = o),
                  (this.frameId = -1),
                  (this.propType = "transform"),
                  (this.data = f),
                  (this.v = new Matrix()),
                  (this.pre = new Matrix()),
                  (this.appliedTransformations = 0),
                  this.initDynamicPropertyContainer(d || o),
                  f.p && f.p.s
                    ? ((this.px = PropertyFactory.getProp(
                        o,
                        f.p.x,
                        0,
                        0,
                        this
                      )),
                      (this.py = PropertyFactory.getProp(o, f.p.y, 0, 0, this)),
                      f.p.z &&
                        (this.pz = PropertyFactory.getProp(
                          o,
                          f.p.z,
                          0,
                          0,
                          this
                        )))
                    : (this.p = PropertyFactory.getProp(
                        o,
                        f.p || { k: [0, 0, 0] },
                        1,
                        0,
                        this
                      )),
                  f.rx)
                ) {
                  if (
                    ((this.rx = PropertyFactory.getProp(
                      o,
                      f.rx,
                      0,
                      degToRads,
                      this
                    )),
                    (this.ry = PropertyFactory.getProp(
                      o,
                      f.ry,
                      0,
                      degToRads,
                      this
                    )),
                    (this.rz = PropertyFactory.getProp(
                      o,
                      f.rz,
                      0,
                      degToRads,
                      this
                    )),
                    f.or.k[0].ti)
                  ) {
                    var P,
                      c = f.or.k.length;
                    for (P = 0; P < c; P += 1)
                      (f.or.k[P].to = null), (f.or.k[P].ti = null);
                  }
                  (this.or = PropertyFactory.getProp(
                    o,
                    f.or,
                    1,
                    degToRads,
                    this
                  )),
                    (this.or.sh = !0);
                } else
                  this.r = PropertyFactory.getProp(
                    o,
                    f.r || { k: 0 },
                    0,
                    degToRads,
                    this
                  );
                f.sk &&
                  ((this.sk = PropertyFactory.getProp(
                    o,
                    f.sk,
                    0,
                    degToRads,
                    this
                  )),
                  (this.sa = PropertyFactory.getProp(
                    o,
                    f.sa,
                    0,
                    degToRads,
                    this
                  ))),
                  (this.a = PropertyFactory.getProp(
                    o,
                    f.a || { k: [0, 0, 0] },
                    1,
                    0,
                    this
                  )),
                  (this.s = PropertyFactory.getProp(
                    o,
                    f.s || { k: [100, 100, 100] },
                    1,
                    0.01,
                    this
                  )),
                  f.o
                    ? (this.o = PropertyFactory.getProp(o, f.o, 0, 0.01, o))
                    : (this.o = { _mdf: !1, v: 1 }),
                  (this._isDirty = !0),
                  this.dynamicProperties.length || this.getValue(!0);
              }
              (a.prototype = {
                applyToMatrix: e,
                getValue: r,
                precalculateMatrix: i,
                autoOrient: s,
              }),
                extendPrototype([DynamicPropertyContainer], a),
                (a.prototype.addDynamicProperty = n),
                (a.prototype._addDynamicProperty =
                  DynamicPropertyContainer.prototype.addDynamicProperty);
              function h(o, f, d) {
                return new a(o, f, d);
              }
              return { getTransformProperty: h };
            })();
            function RepeaterModifier() {}
            extendPrototype([ShapeModifier], RepeaterModifier),
              (RepeaterModifier.prototype.initModifierProperties = function (
                t,
                e
              ) {
                (this.getValue = this.processKeys),
                  (this.c = PropertyFactory.getProp(t, e.c, 0, null, this)),
                  (this.o = PropertyFactory.getProp(t, e.o, 0, null, this)),
                  (this.tr = TransformPropertyFactory.getTransformProperty(
                    t,
                    e.tr,
                    this
                  )),
                  (this.so = PropertyFactory.getProp(
                    t,
                    e.tr.so,
                    0,
                    0.01,
                    this
                  )),
                  (this.eo = PropertyFactory.getProp(
                    t,
                    e.tr.eo,
                    0,
                    0.01,
                    this
                  )),
                  (this.data = e),
                  this.dynamicProperties.length || this.getValue(!0),
                  (this._isAnimated = !!this.dynamicProperties.length),
                  (this.pMatrix = new Matrix()),
                  (this.rMatrix = new Matrix()),
                  (this.sMatrix = new Matrix()),
                  (this.tMatrix = new Matrix()),
                  (this.matrix = new Matrix());
              }),
              (RepeaterModifier.prototype.applyTransforms = function (
                t,
                e,
                r,
                i,
                s,
                n
              ) {
                var a = n ? -1 : 1,
                  h = i.s.v[0] + (1 - i.s.v[0]) * (1 - s),
                  o = i.s.v[1] + (1 - i.s.v[1]) * (1 - s);
                t.translate(i.p.v[0] * a * s, i.p.v[1] * a * s, i.p.v[2]),
                  e.translate(-i.a.v[0], -i.a.v[1], i.a.v[2]),
                  e.rotate(-i.r.v * a * s),
                  e.translate(i.a.v[0], i.a.v[1], i.a.v[2]),
                  r.translate(-i.a.v[0], -i.a.v[1], i.a.v[2]),
                  r.scale(n ? 1 / h : h, n ? 1 / o : o),
                  r.translate(i.a.v[0], i.a.v[1], i.a.v[2]);
              }),
              (RepeaterModifier.prototype.init = function (t, e, r, i) {
                for (
                  this.elem = t,
                    this.arr = e,
                    this.pos = r,
                    this.elemsData = i,
                    this._currentCopies = 0,
                    this._elements = [],
                    this._groups = [],
                    this.frameId = -1,
                    this.initDynamicPropertyContainer(t),
                    this.initModifierProperties(t, e[r]);
                  r > 0;

                )
                  (r -= 1), this._elements.unshift(e[r]);
                this.dynamicProperties.length
                  ? (this.k = !0)
                  : this.getValue(!0);
              }),
              (RepeaterModifier.prototype.resetElements = function (t) {
                var e,
                  r = t.length;
                for (e = 0; e < r; e += 1)
                  (t[e]._processed = !1),
                    t[e].ty === "gr" && this.resetElements(t[e].it);
              }),
              (RepeaterModifier.prototype.cloneElements = function (t) {
                var e = JSON.parse(JSON.stringify(t));
                return this.resetElements(e), e;
              }),
              (RepeaterModifier.prototype.changeGroupRender = function (t, e) {
                var r,
                  i = t.length;
                for (r = 0; r < i; r += 1)
                  (t[r]._render = e),
                    t[r].ty === "gr" && this.changeGroupRender(t[r].it, e);
              }),
              (RepeaterModifier.prototype.processShapes = function (t) {
                var e,
                  r,
                  i,
                  s,
                  n,
                  a = !1;
                if (this._mdf || t) {
                  var h = Math.ceil(this.c.v);
                  if (this._groups.length < h) {
                    for (; this._groups.length < h; ) {
                      var o = {
                        it: this.cloneElements(this._elements),
                        ty: "gr",
                      };
                      o.it.push({
                        a: { a: 0, ix: 1, k: [0, 0] },
                        nm: "Transform",
                        o: { a: 0, ix: 7, k: 100 },
                        p: { a: 0, ix: 2, k: [0, 0] },
                        r: {
                          a: 1,
                          ix: 6,
                          k: [
                            { s: 0, e: 0, t: 0 },
                            { s: 0, e: 0, t: 1 },
                          ],
                        },
                        s: { a: 0, ix: 3, k: [100, 100] },
                        sa: { a: 0, ix: 5, k: 0 },
                        sk: { a: 0, ix: 4, k: 0 },
                        ty: "tr",
                      }),
                        this.arr.splice(0, 0, o),
                        this._groups.splice(0, 0, o),
                        (this._currentCopies += 1);
                    }
                    this.elem.reloadShapes(), (a = !0);
                  }
                  n = 0;
                  var f;
                  for (i = 0; i <= this._groups.length - 1; i += 1) {
                    if (
                      ((f = n < h),
                      (this._groups[i]._render = f),
                      this.changeGroupRender(this._groups[i].it, f),
                      !f)
                    ) {
                      var d = this.elemsData[i].it,
                        P = d[d.length - 1];
                      P.transform.op.v !== 0
                        ? ((P.transform.op._mdf = !0), (P.transform.op.v = 0))
                        : (P.transform.op._mdf = !1);
                    }
                    n += 1;
                  }
                  this._currentCopies = h;
                  var c = this.o.v,
                    b = c % 1,
                    v = c > 0 ? Math.floor(c) : Math.ceil(c),
                    m = this.pMatrix.props,
                    C = this.rMatrix.props,
                    p = this.sMatrix.props;
                  this.pMatrix.reset(),
                    this.rMatrix.reset(),
                    this.sMatrix.reset(),
                    this.tMatrix.reset(),
                    this.matrix.reset();
                  var u = 0;
                  if (c > 0) {
                    for (; u < v; )
                      this.applyTransforms(
                        this.pMatrix,
                        this.rMatrix,
                        this.sMatrix,
                        this.tr,
                        1,
                        !1
                      ),
                        (u += 1);
                    b &&
                      (this.applyTransforms(
                        this.pMatrix,
                        this.rMatrix,
                        this.sMatrix,
                        this.tr,
                        b,
                        !1
                      ),
                      (u += b));
                  } else if (c < 0) {
                    for (; u > v; )
                      this.applyTransforms(
                        this.pMatrix,
                        this.rMatrix,
                        this.sMatrix,
                        this.tr,
                        1,
                        !0
                      ),
                        (u -= 1);
                    b &&
                      (this.applyTransforms(
                        this.pMatrix,
                        this.rMatrix,
                        this.sMatrix,
                        this.tr,
                        -b,
                        !0
                      ),
                      (u -= b));
                  }
                  (i = this.data.m === 1 ? 0 : this._currentCopies - 1),
                    (s = this.data.m === 1 ? 1 : -1),
                    (n = this._currentCopies);
                  for (var l, y; n; ) {
                    if (
                      ((e = this.elemsData[i].it),
                      (r = e[e.length - 1].transform.mProps.v.props),
                      (y = r.length),
                      (e[e.length - 1].transform.mProps._mdf = !0),
                      (e[e.length - 1].transform.op._mdf = !0),
                      (e[e.length - 1].transform.op.v =
                        this._currentCopies === 1
                          ? this.so.v
                          : this.so.v +
                            (this.eo.v - this.so.v) *
                              (i / (this._currentCopies - 1))),
                      u !== 0)
                    ) {
                      for (
                        ((i !== 0 && s === 1) ||
                          (i !== this._currentCopies - 1 && s === -1)) &&
                          this.applyTransforms(
                            this.pMatrix,
                            this.rMatrix,
                            this.sMatrix,
                            this.tr,
                            1,
                            !1
                          ),
                          this.matrix.transform(
                            C[0],
                            C[1],
                            C[2],
                            C[3],
                            C[4],
                            C[5],
                            C[6],
                            C[7],
                            C[8],
                            C[9],
                            C[10],
                            C[11],
                            C[12],
                            C[13],
                            C[14],
                            C[15]
                          ),
                          this.matrix.transform(
                            p[0],
                            p[1],
                            p[2],
                            p[3],
                            p[4],
                            p[5],
                            p[6],
                            p[7],
                            p[8],
                            p[9],
                            p[10],
                            p[11],
                            p[12],
                            p[13],
                            p[14],
                            p[15]
                          ),
                          this.matrix.transform(
                            m[0],
                            m[1],
                            m[2],
                            m[3],
                            m[4],
                            m[5],
                            m[6],
                            m[7],
                            m[8],
                            m[9],
                            m[10],
                            m[11],
                            m[12],
                            m[13],
                            m[14],
                            m[15]
                          ),
                          l = 0;
                        l < y;
                        l += 1
                      )
                        r[l] = this.matrix.props[l];
                      this.matrix.reset();
                    } else
                      for (this.matrix.reset(), l = 0; l < y; l += 1)
                        r[l] = this.matrix.props[l];
                    (u += 1), (n -= 1), (i += s);
                  }
                } else
                  for (n = this._currentCopies, i = 0, s = 1; n; )
                    (e = this.elemsData[i].it),
                      (r = e[e.length - 1].transform.mProps.v.props),
                      (e[e.length - 1].transform.mProps._mdf = !1),
                      (e[e.length - 1].transform.op._mdf = !1),
                      (n -= 1),
                      (i += s);
                return a;
              }),
              (RepeaterModifier.prototype.addShape = function () {});
            function RoundCornersModifier() {}
            extendPrototype([ShapeModifier], RoundCornersModifier),
              (RoundCornersModifier.prototype.initModifierProperties =
                function (t, e) {
                  (this.getValue = this.processKeys),
                    (this.rd = PropertyFactory.getProp(t, e.r, 0, null, this)),
                    (this._isAnimated = !!this.rd.effectsSequence.length);
                }),
              (RoundCornersModifier.prototype.processPath = function (t, e) {
                var r = shapePool.newElement();
                r.c = t.c;
                var i,
                  s = t._length,
                  n,
                  a,
                  h,
                  o,
                  f,
                  d,
                  P = 0,
                  c,
                  b,
                  v,
                  m,
                  C,
                  p;
                for (i = 0; i < s; i += 1)
                  (n = t.v[i]),
                    (h = t.o[i]),
                    (a = t.i[i]),
                    n[0] === h[0] &&
                    n[1] === h[1] &&
                    n[0] === a[0] &&
                    n[1] === a[1]
                      ? (i === 0 || i === s - 1) && !t.c
                        ? (r.setTripleAt(n[0], n[1], h[0], h[1], a[0], a[1], P),
                          (P += 1))
                        : (i === 0 ? (o = t.v[s - 1]) : (o = t.v[i - 1]),
                          (f = Math.sqrt(
                            Math.pow(n[0] - o[0], 2) + Math.pow(n[1] - o[1], 2)
                          )),
                          (d = f ? Math.min(f / 2, e) / f : 0),
                          (C = n[0] + (o[0] - n[0]) * d),
                          (c = C),
                          (p = n[1] - (n[1] - o[1]) * d),
                          (b = p),
                          (v = c - (c - n[0]) * roundCorner),
                          (m = b - (b - n[1]) * roundCorner),
                          r.setTripleAt(c, b, v, m, C, p, P),
                          (P += 1),
                          i === s - 1 ? (o = t.v[0]) : (o = t.v[i + 1]),
                          (f = Math.sqrt(
                            Math.pow(n[0] - o[0], 2) + Math.pow(n[1] - o[1], 2)
                          )),
                          (d = f ? Math.min(f / 2, e) / f : 0),
                          (v = n[0] + (o[0] - n[0]) * d),
                          (c = v),
                          (m = n[1] + (o[1] - n[1]) * d),
                          (b = m),
                          (C = c - (c - n[0]) * roundCorner),
                          (p = b - (b - n[1]) * roundCorner),
                          r.setTripleAt(c, b, v, m, C, p, P),
                          (P += 1))
                      : (r.setTripleAt(
                          t.v[i][0],
                          t.v[i][1],
                          t.o[i][0],
                          t.o[i][1],
                          t.i[i][0],
                          t.i[i][1],
                          P
                        ),
                        (P += 1));
                return r;
              }),
              (RoundCornersModifier.prototype.processShapes = function (t) {
                var e,
                  r,
                  i = this.shapes.length,
                  s,
                  n,
                  a = this.rd.v;
                if (a !== 0) {
                  var h, o;
                  for (r = 0; r < i; r += 1) {
                    if (
                      ((h = this.shapes[r]),
                      (o = h.localShapeCollection),
                      !(!h.shape._mdf && !this._mdf && !t))
                    )
                      for (
                        o.releaseShapes(),
                          h.shape._mdf = !0,
                          e = h.shape.paths.shapes,
                          n = h.shape.paths._length,
                          s = 0;
                        s < n;
                        s += 1
                      )
                        o.addShape(this.processPath(e[s], a));
                    h.shape.paths = h.localShapeCollection;
                  }
                }
                this.dynamicProperties.length || (this._mdf = !1);
              });
            function floatEqual(t, e) {
              return (
                Math.abs(t - e) * 1e5 <= Math.min(Math.abs(t), Math.abs(e))
              );
            }
            function floatZero(t) {
              return Math.abs(t) <= 1e-5;
            }
            function lerp(t, e, r) {
              return t * (1 - r) + e * r;
            }
            function lerpPoint(t, e, r) {
              return [lerp(t[0], e[0], r), lerp(t[1], e[1], r)];
            }
            function quadRoots(t, e, r) {
              if (t === 0) return [];
              var i = e * e - 4 * t * r;
              if (i < 0) return [];
              var s = -e / (2 * t);
              if (i === 0) return [s];
              var n = Math.sqrt(i) / (2 * t);
              return [s - n, s + n];
            }
            function polynomialCoefficients(t, e, r, i) {
              return [
                -t + 3 * e - 3 * r + i,
                3 * t - 6 * e + 3 * r,
                -3 * t + 3 * e,
                t,
              ];
            }
            function singlePoint(t) {
              return new PolynomialBezier(t, t, t, t, !1);
            }
            function PolynomialBezier(t, e, r, i, s) {
              s && pointEqual(t, e) && (e = lerpPoint(t, i, 1 / 3)),
                s && pointEqual(r, i) && (r = lerpPoint(t, i, 2 / 3));
              var n = polynomialCoefficients(t[0], e[0], r[0], i[0]),
                a = polynomialCoefficients(t[1], e[1], r[1], i[1]);
              (this.a = [n[0], a[0]]),
                (this.b = [n[1], a[1]]),
                (this.c = [n[2], a[2]]),
                (this.d = [n[3], a[3]]),
                (this.points = [t, e, r, i]);
            }
            (PolynomialBezier.prototype.point = function (t) {
              return [
                ((this.a[0] * t + this.b[0]) * t + this.c[0]) * t + this.d[0],
                ((this.a[1] * t + this.b[1]) * t + this.c[1]) * t + this.d[1],
              ];
            }),
              (PolynomialBezier.prototype.derivative = function (t) {
                return [
                  (3 * t * this.a[0] + 2 * this.b[0]) * t + this.c[0],
                  (3 * t * this.a[1] + 2 * this.b[1]) * t + this.c[1],
                ];
              }),
              (PolynomialBezier.prototype.tangentAngle = function (t) {
                var e = this.derivative(t);
                return Math.atan2(e[1], e[0]);
              }),
              (PolynomialBezier.prototype.normalAngle = function (t) {
                var e = this.derivative(t);
                return Math.atan2(e[0], e[1]);
              }),
              (PolynomialBezier.prototype.inflectionPoints = function () {
                var t = this.a[1] * this.b[0] - this.a[0] * this.b[1];
                if (floatZero(t)) return [];
                var e =
                    (-0.5 * (this.a[1] * this.c[0] - this.a[0] * this.c[1])) /
                    t,
                  r =
                    e * e -
                    ((1 / 3) *
                      (this.b[1] * this.c[0] - this.b[0] * this.c[1])) /
                      t;
                if (r < 0) return [];
                var i = Math.sqrt(r);
                return floatZero(i)
                  ? i > 0 && i < 1
                    ? [e]
                    : []
                  : [e - i, e + i].filter(function (s) {
                      return s > 0 && s < 1;
                    });
              }),
              (PolynomialBezier.prototype.split = function (t) {
                if (t <= 0) return [singlePoint(this.points[0]), this];
                if (t >= 1)
                  return [
                    this,
                    singlePoint(this.points[this.points.length - 1]),
                  ];
                var e = lerpPoint(this.points[0], this.points[1], t),
                  r = lerpPoint(this.points[1], this.points[2], t),
                  i = lerpPoint(this.points[2], this.points[3], t),
                  s = lerpPoint(e, r, t),
                  n = lerpPoint(r, i, t),
                  a = lerpPoint(s, n, t);
                return [
                  new PolynomialBezier(this.points[0], e, s, a, !0),
                  new PolynomialBezier(a, n, i, this.points[3], !0),
                ];
              });
            function extrema(t, e) {
              var r = t.points[0][e],
                i = t.points[t.points.length - 1][e];
              if (r > i) {
                var s = i;
                (i = r), (r = s);
              }
              for (
                var n = quadRoots(3 * t.a[e], 2 * t.b[e], t.c[e]), a = 0;
                a < n.length;
                a += 1
              )
                if (n[a] > 0 && n[a] < 1) {
                  var h = t.point(n[a])[e];
                  h < r ? (r = h) : h > i && (i = h);
                }
              return { min: r, max: i };
            }
            (PolynomialBezier.prototype.bounds = function () {
              return { x: extrema(this, 0), y: extrema(this, 1) };
            }),
              (PolynomialBezier.prototype.boundingBox = function () {
                var t = this.bounds();
                return {
                  left: t.x.min,
                  right: t.x.max,
                  top: t.y.min,
                  bottom: t.y.max,
                  width: t.x.max - t.x.min,
                  height: t.y.max - t.y.min,
                  cx: (t.x.max + t.x.min) / 2,
                  cy: (t.y.max + t.y.min) / 2,
                };
              });
            function intersectData(t, e, r) {
              var i = t.boundingBox();
              return {
                cx: i.cx,
                cy: i.cy,
                width: i.width,
                height: i.height,
                bez: t,
                t: (e + r) / 2,
                t1: e,
                t2: r,
              };
            }
            function splitData(t) {
              var e = t.bez.split(0.5);
              return [
                intersectData(e[0], t.t1, t.t),
                intersectData(e[1], t.t, t.t2),
              ];
            }
            function boxIntersect(t, e) {
              return (
                Math.abs(t.cx - e.cx) * 2 < t.width + e.width &&
                Math.abs(t.cy - e.cy) * 2 < t.height + e.height
              );
            }
            function intersectsImpl(t, e, r, i, s, n) {
              if (boxIntersect(t, e)) {
                if (
                  r >= n ||
                  (t.width <= i &&
                    t.height <= i &&
                    e.width <= i &&
                    e.height <= i)
                ) {
                  s.push([t.t, e.t]);
                  return;
                }
                var a = splitData(t),
                  h = splitData(e);
                intersectsImpl(a[0], h[0], r + 1, i, s, n),
                  intersectsImpl(a[0], h[1], r + 1, i, s, n),
                  intersectsImpl(a[1], h[0], r + 1, i, s, n),
                  intersectsImpl(a[1], h[1], r + 1, i, s, n);
              }
            }
            (PolynomialBezier.prototype.intersections = function (t, e, r) {
              e === void 0 && (e = 2), r === void 0 && (r = 7);
              var i = [];
              return (
                intersectsImpl(
                  intersectData(this, 0, 1),
                  intersectData(t, 0, 1),
                  0,
                  e,
                  i,
                  r
                ),
                i
              );
            }),
              (PolynomialBezier.shapeSegment = function (t, e) {
                var r = (e + 1) % t.length();
                return new PolynomialBezier(t.v[e], t.o[e], t.i[r], t.v[r], !0);
              }),
              (PolynomialBezier.shapeSegmentInverted = function (t, e) {
                var r = (e + 1) % t.length();
                return new PolynomialBezier(t.v[r], t.i[r], t.o[e], t.v[e], !0);
              });
            function crossProduct(t, e) {
              return [
                t[1] * e[2] - t[2] * e[1],
                t[2] * e[0] - t[0] * e[2],
                t[0] * e[1] - t[1] * e[0],
              ];
            }
            function lineIntersection(t, e, r, i) {
              var s = [t[0], t[1], 1],
                n = [e[0], e[1], 1],
                a = [r[0], r[1], 1],
                h = [i[0], i[1], 1],
                o = crossProduct(crossProduct(s, n), crossProduct(a, h));
              return floatZero(o[2]) ? null : [o[0] / o[2], o[1] / o[2]];
            }
            function polarOffset(t, e, r) {
              return [t[0] + Math.cos(e) * r, t[1] - Math.sin(e) * r];
            }
            function pointDistance(t, e) {
              return Math.hypot(t[0] - e[0], t[1] - e[1]);
            }
            function pointEqual(t, e) {
              return floatEqual(t[0], e[0]) && floatEqual(t[1], e[1]);
            }
            function ZigZagModifier() {}
            extendPrototype([ShapeModifier], ZigZagModifier),
              (ZigZagModifier.prototype.initModifierProperties = function (
                t,
                e
              ) {
                (this.getValue = this.processKeys),
                  (this.amplitude = PropertyFactory.getProp(
                    t,
                    e.s,
                    0,
                    null,
                    this
                  )),
                  (this.frequency = PropertyFactory.getProp(
                    t,
                    e.r,
                    0,
                    null,
                    this
                  )),
                  (this.pointsType = PropertyFactory.getProp(
                    t,
                    e.pt,
                    0,
                    null,
                    this
                  )),
                  (this._isAnimated =
                    this.amplitude.effectsSequence.length !== 0 ||
                    this.frequency.effectsSequence.length !== 0 ||
                    this.pointsType.effectsSequence.length !== 0);
              });
            function setPoint(t, e, r, i, s, n, a) {
              var h = r - Math.PI / 2,
                o = r + Math.PI / 2,
                f = e[0] + Math.cos(r) * i * s,
                d = e[1] - Math.sin(r) * i * s;
              t.setTripleAt(
                f,
                d,
                f + Math.cos(h) * n,
                d - Math.sin(h) * n,
                f + Math.cos(o) * a,
                d - Math.sin(o) * a,
                t.length()
              );
            }
            function getPerpendicularVector(t, e) {
              var r = [e[0] - t[0], e[1] - t[1]],
                i = -Math.PI * 0.5,
                s = [
                  Math.cos(i) * r[0] - Math.sin(i) * r[1],
                  Math.sin(i) * r[0] + Math.cos(i) * r[1],
                ];
              return s;
            }
            function getProjectingAngle(t, e) {
              var r = e === 0 ? t.length() - 1 : e - 1,
                i = (e + 1) % t.length(),
                s = t.v[r],
                n = t.v[i],
                a = getPerpendicularVector(s, n);
              return Math.atan2(0, 1) - Math.atan2(a[1], a[0]);
            }
            function zigZagCorner(t, e, r, i, s, n, a) {
              var h = getProjectingAngle(e, r),
                o = e.v[r % e._length],
                f = e.v[r === 0 ? e._length - 1 : r - 1],
                d = e.v[(r + 1) % e._length],
                P =
                  n === 2
                    ? Math.sqrt(
                        Math.pow(o[0] - f[0], 2) + Math.pow(o[1] - f[1], 2)
                      )
                    : 0,
                c =
                  n === 2
                    ? Math.sqrt(
                        Math.pow(o[0] - d[0], 2) + Math.pow(o[1] - d[1], 2)
                      )
                    : 0;
              setPoint(
                t,
                e.v[r % e._length],
                h,
                a,
                i,
                c / ((s + 1) * 2),
                P / ((s + 1) * 2)
              );
            }
            function zigZagSegment(t, e, r, i, s, n) {
              for (var a = 0; a < i; a += 1) {
                var h = (a + 1) / (i + 1),
                  o =
                    s === 2
                      ? Math.sqrt(
                          Math.pow(e.points[3][0] - e.points[0][0], 2) +
                            Math.pow(e.points[3][1] - e.points[0][1], 2)
                        )
                      : 0,
                  f = e.normalAngle(h),
                  d = e.point(h);
                setPoint(t, d, f, n, r, o / ((i + 1) * 2), o / ((i + 1) * 2)),
                  (n = -n);
              }
              return n;
            }
            (ZigZagModifier.prototype.processPath = function (t, e, r, i) {
              var s = t._length,
                n = shapePool.newElement();
              if (((n.c = t.c), t.c || (s -= 1), s === 0)) return n;
              var a = -1,
                h = PolynomialBezier.shapeSegment(t, 0);
              zigZagCorner(n, t, 0, e, r, i, a);
              for (var o = 0; o < s; o += 1)
                (a = zigZagSegment(n, h, e, r, i, -a)),
                  o === s - 1 && !t.c
                    ? (h = null)
                    : (h = PolynomialBezier.shapeSegment(t, (o + 1) % s)),
                  zigZagCorner(n, t, o + 1, e, r, i, a);
              return n;
            }),
              (ZigZagModifier.prototype.processShapes = function (t) {
                var e,
                  r,
                  i = this.shapes.length,
                  s,
                  n,
                  a = this.amplitude.v,
                  h = Math.max(0, Math.round(this.frequency.v)),
                  o = this.pointsType.v;
                if (a !== 0) {
                  var f, d;
                  for (r = 0; r < i; r += 1) {
                    if (
                      ((f = this.shapes[r]),
                      (d = f.localShapeCollection),
                      !(!f.shape._mdf && !this._mdf && !t))
                    )
                      for (
                        d.releaseShapes(),
                          f.shape._mdf = !0,
                          e = f.shape.paths.shapes,
                          n = f.shape.paths._length,
                          s = 0;
                        s < n;
                        s += 1
                      )
                        d.addShape(this.processPath(e[s], a, h, o));
                    f.shape.paths = f.localShapeCollection;
                  }
                }
                this.dynamicProperties.length || (this._mdf = !1);
              });
            function linearOffset(t, e, r) {
              var i = Math.atan2(e[0] - t[0], e[1] - t[1]);
              return [polarOffset(t, i, r), polarOffset(e, i, r)];
            }
            function offsetSegment(t, e) {
              var r, i, s, n, a, h, o;
              (o = linearOffset(t.points[0], t.points[1], e)),
                (r = o[0]),
                (i = o[1]),
                (o = linearOffset(t.points[1], t.points[2], e)),
                (s = o[0]),
                (n = o[1]),
                (o = linearOffset(t.points[2], t.points[3], e)),
                (a = o[0]),
                (h = o[1]);
              var f = lineIntersection(r, i, s, n);
              f === null && (f = i);
              var d = lineIntersection(a, h, s, n);
              return d === null && (d = a), new PolynomialBezier(r, f, d, h);
            }
            function joinLines(t, e, r, i, s) {
              var n = e.points[3],
                a = r.points[0];
              if (i === 3 || pointEqual(n, a)) return n;
              if (i === 2) {
                var h = -e.tangentAngle(1),
                  o = -r.tangentAngle(0) + Math.PI,
                  f = lineIntersection(
                    n,
                    polarOffset(n, h + Math.PI / 2, 100),
                    a,
                    polarOffset(a, h + Math.PI / 2, 100)
                  ),
                  d = f ? pointDistance(f, n) : pointDistance(n, a) / 2,
                  P = polarOffset(n, h, 2 * d * roundCorner);
                return (
                  t.setXYAt(P[0], P[1], "o", t.length() - 1),
                  (P = polarOffset(a, o, 2 * d * roundCorner)),
                  t.setTripleAt(a[0], a[1], a[0], a[1], P[0], P[1], t.length()),
                  a
                );
              }
              var c = pointEqual(n, e.points[2]) ? e.points[0] : e.points[2],
                b = pointEqual(a, r.points[1]) ? r.points[3] : r.points[1],
                v = lineIntersection(c, n, a, b);
              return v && pointDistance(v, n) < s
                ? (t.setTripleAt(
                    v[0],
                    v[1],
                    v[0],
                    v[1],
                    v[0],
                    v[1],
                    t.length()
                  ),
                  v)
                : n;
            }
            function getIntersection(t, e) {
              var r = t.intersections(e);
              return (
                r.length && floatEqual(r[0][0], 1) && r.shift(),
                r.length ? r[0] : null
              );
            }
            function pruneSegmentIntersection(t, e) {
              var r = t.slice(),
                i = e.slice(),
                s = getIntersection(t[t.length - 1], e[0]);
              return (
                s &&
                  ((r[t.length - 1] = t[t.length - 1].split(s[0])[0]),
                  (i[0] = e[0].split(s[1])[1])),
                t.length > 1 &&
                e.length > 1 &&
                ((s = getIntersection(t[0], e[e.length - 1])), s)
                  ? [[t[0].split(s[0])[0]], [e[e.length - 1].split(s[1])[1]]]
                  : [r, i]
              );
            }
            function pruneIntersections(t) {
              for (var e, r = 1; r < t.length; r += 1)
                (e = pruneSegmentIntersection(t[r - 1], t[r])),
                  (t[r - 1] = e[0]),
                  (t[r] = e[1]);
              return (
                t.length > 1 &&
                  ((e = pruneSegmentIntersection(t[t.length - 1], t[0])),
                  (t[t.length - 1] = e[0]),
                  (t[0] = e[1])),
                t
              );
            }
            function offsetSegmentSplit(t, e) {
              var r = t.inflectionPoints(),
                i,
                s,
                n,
                a;
              if (r.length === 0) return [offsetSegment(t, e)];
              if (r.length === 1 || floatEqual(r[1], 1))
                return (
                  (n = t.split(r[0])),
                  (i = n[0]),
                  (s = n[1]),
                  [offsetSegment(i, e), offsetSegment(s, e)]
                );
              (n = t.split(r[0])), (i = n[0]);
              var h = (r[1] - r[0]) / (1 - r[0]);
              return (
                (n = n[1].split(h)),
                (a = n[0]),
                (s = n[1]),
                [offsetSegment(i, e), offsetSegment(a, e), offsetSegment(s, e)]
              );
            }
            function OffsetPathModifier() {}
            extendPrototype([ShapeModifier], OffsetPathModifier),
              (OffsetPathModifier.prototype.initModifierProperties = function (
                t,
                e
              ) {
                (this.getValue = this.processKeys),
                  (this.amount = PropertyFactory.getProp(
                    t,
                    e.a,
                    0,
                    null,
                    this
                  )),
                  (this.miterLimit = PropertyFactory.getProp(
                    t,
                    e.ml,
                    0,
                    null,
                    this
                  )),
                  (this.lineJoin = e.lj),
                  (this._isAnimated = this.amount.effectsSequence.length !== 0);
              }),
              (OffsetPathModifier.prototype.processPath = function (
                t,
                e,
                r,
                i
              ) {
                var s = shapePool.newElement();
                s.c = t.c;
                var n = t.length();
                t.c || (n -= 1);
                var a,
                  h,
                  o,
                  f = [];
                for (a = 0; a < n; a += 1)
                  (o = PolynomialBezier.shapeSegment(t, a)),
                    f.push(offsetSegmentSplit(o, e));
                if (!t.c)
                  for (a = n - 1; a >= 0; a -= 1)
                    (o = PolynomialBezier.shapeSegmentInverted(t, a)),
                      f.push(offsetSegmentSplit(o, e));
                f = pruneIntersections(f);
                var d = null,
                  P = null;
                for (a = 0; a < f.length; a += 1) {
                  var c = f[a];
                  for (
                    P && (d = joinLines(s, P, c[0], r, i)),
                      P = c[c.length - 1],
                      h = 0;
                    h < c.length;
                    h += 1
                  )
                    (o = c[h]),
                      d && pointEqual(o.points[0], d)
                        ? s.setXYAt(
                            o.points[1][0],
                            o.points[1][1],
                            "o",
                            s.length() - 1
                          )
                        : s.setTripleAt(
                            o.points[0][0],
                            o.points[0][1],
                            o.points[1][0],
                            o.points[1][1],
                            o.points[0][0],
                            o.points[0][1],
                            s.length()
                          ),
                      s.setTripleAt(
                        o.points[3][0],
                        o.points[3][1],
                        o.points[3][0],
                        o.points[3][1],
                        o.points[2][0],
                        o.points[2][1],
                        s.length()
                      ),
                      (d = o.points[3]);
                }
                return f.length && joinLines(s, P, f[0][0], r, i), s;
              }),
              (OffsetPathModifier.prototype.processShapes = function (t) {
                var e,
                  r,
                  i = this.shapes.length,
                  s,
                  n,
                  a = this.amount.v,
                  h = this.miterLimit.v,
                  o = this.lineJoin;
                if (a !== 0) {
                  var f, d;
                  for (r = 0; r < i; r += 1) {
                    if (
                      ((f = this.shapes[r]),
                      (d = f.localShapeCollection),
                      !(!f.shape._mdf && !this._mdf && !t))
                    )
                      for (
                        d.releaseShapes(),
                          f.shape._mdf = !0,
                          e = f.shape.paths.shapes,
                          n = f.shape.paths._length,
                          s = 0;
                        s < n;
                        s += 1
                      )
                        d.addShape(this.processPath(e[s], a, o, h));
                    f.shape.paths = f.localShapeCollection;
                  }
                }
                this.dynamicProperties.length || (this._mdf = !1);
              });
            function getFontProperties(t) {
              for (
                var e = t.fStyle ? t.fStyle.split(" ") : [],
                  r = "normal",
                  i = "normal",
                  s = e.length,
                  n,
                  a = 0;
                a < s;
                a += 1
              )
                switch (((n = e[a].toLowerCase()), n)) {
                  case "italic":
                    i = "italic";
                    break;
                  case "bold":
                    r = "700";
                    break;
                  case "black":
                    r = "900";
                    break;
                  case "medium":
                    r = "500";
                    break;
                  case "regular":
                  case "normal":
                    r = "400";
                    break;
                  case "light":
                  case "thin":
                    r = "200";
                    break;
                }
              return { style: i, weight: t.fWeight || r };
            }
            var FontManager = (function () {
              var t = 5e3,
                e = { w: 0, size: 0, shapes: [], data: { shapes: [] } },
                r = [];
              r = r.concat([
                2304, 2305, 2306, 2307, 2362, 2363, 2364, 2364, 2366, 2367,
                2368, 2369, 2370, 2371, 2372, 2373, 2374, 2375, 2376, 2377,
                2378, 2379, 2380, 2381, 2382, 2383, 2387, 2388, 2389, 2390,
                2391, 2402, 2403,
              ]);
              var i = 127988,
                s = 917631,
                n = 917601,
                a = 917626,
                h = 65039,
                o = 8205,
                f = 127462,
                d = 127487,
                P = [
                  "d83cdffb",
                  "d83cdffc",
                  "d83cdffd",
                  "d83cdffe",
                  "d83cdfff",
                ];
              function c(_) {
                var T = _.split(","),
                  g,
                  S = T.length,
                  k = [];
                for (g = 0; g < S; g += 1)
                  T[g] !== "sans-serif" && T[g] !== "monospace" && k.push(T[g]);
                return k.join(",");
              }
              function b(_, T) {
                var g = createTag("span");
                g.setAttribute("aria-hidden", !0), (g.style.fontFamily = T);
                var S = createTag("span");
                (S.innerText = "giItT1WQy@!-/#"),
                  (g.style.position = "absolute"),
                  (g.style.left = "-10000px"),
                  (g.style.top = "-10000px"),
                  (g.style.fontSize = "300px"),
                  (g.style.fontVariant = "normal"),
                  (g.style.fontStyle = "normal"),
                  (g.style.fontWeight = "normal"),
                  (g.style.letterSpacing = "0"),
                  g.appendChild(S),
                  document.body.appendChild(g);
                var k = S.offsetWidth;
                return (
                  (S.style.fontFamily = c(_) + ", " + T),
                  { node: S, w: k, parent: g }
                );
              }
              function v() {
                var _,
                  T = this.fonts.length,
                  g,
                  S,
                  k = T;
                for (_ = 0; _ < T; _ += 1)
                  this.fonts[_].loaded
                    ? (k -= 1)
                    : this.fonts[_].fOrigin === "n" ||
                      this.fonts[_].origin === 0
                    ? (this.fonts[_].loaded = !0)
                    : ((g = this.fonts[_].monoCase.node),
                      (S = this.fonts[_].monoCase.w),
                      g.offsetWidth !== S
                        ? ((k -= 1), (this.fonts[_].loaded = !0))
                        : ((g = this.fonts[_].sansCase.node),
                          (S = this.fonts[_].sansCase.w),
                          g.offsetWidth !== S &&
                            ((k -= 1), (this.fonts[_].loaded = !0))),
                      this.fonts[_].loaded &&
                        (this.fonts[_].sansCase.parent.parentNode.removeChild(
                          this.fonts[_].sansCase.parent
                        ),
                        this.fonts[_].monoCase.parent.parentNode.removeChild(
                          this.fonts[_].monoCase.parent
                        )));
                k !== 0 && Date.now() - this.initTime < t
                  ? setTimeout(this.checkLoadedFontsBinded, 20)
                  : setTimeout(this.setIsLoadedBinded, 10);
              }
              function m(_, T) {
                var g = document.body && T ? "svg" : "canvas",
                  S,
                  k = getFontProperties(_);
                if (g === "svg") {
                  var M = createNS("text");
                  (M.style.fontSize = "100px"),
                    M.setAttribute("font-family", _.fFamily),
                    M.setAttribute("font-style", k.style),
                    M.setAttribute("font-weight", k.weight),
                    (M.textContent = "1"),
                    _.fClass
                      ? ((M.style.fontFamily = "inherit"),
                        M.setAttribute("class", _.fClass))
                      : (M.style.fontFamily = _.fFamily),
                    T.appendChild(M),
                    (S = M);
                } else {
                  var V = new OffscreenCanvas(500, 500).getContext("2d");
                  (V.font = k.style + " " + k.weight + " 100px " + _.fFamily),
                    (S = V);
                }
                function D(B) {
                  return g === "svg"
                    ? ((S.textContent = B), S.getComputedTextLength())
                    : S.measureText(B).width;
                }
                return { measureText: D };
              }
              function C(_, T) {
                if (!_) {
                  this.isLoaded = !0;
                  return;
                }
                if (this.chars) {
                  (this.isLoaded = !0), (this.fonts = _.list);
                  return;
                }
                if (!document.body) {
                  (this.isLoaded = !0),
                    _.list.forEach(function (Y) {
                      (Y.helper = m(Y)), (Y.cache = {});
                    }),
                    (this.fonts = _.list);
                  return;
                }
                var g = _.list,
                  S,
                  k = g.length,
                  M = k;
                for (S = 0; S < k; S += 1) {
                  var V = !0,
                    D,
                    B;
                  if (
                    ((g[S].loaded = !1),
                    (g[S].monoCase = b(g[S].fFamily, "monospace")),
                    (g[S].sansCase = b(g[S].fFamily, "sans-serif")),
                    !g[S].fPath)
                  )
                    (g[S].loaded = !0), (M -= 1);
                  else if (g[S].fOrigin === "p" || g[S].origin === 3) {
                    if (
                      ((D = document.querySelectorAll(
                        'style[f-forigin="p"][f-family="' +
                          g[S].fFamily +
                          '"], style[f-origin="3"][f-family="' +
                          g[S].fFamily +
                          '"]'
                      )),
                      D.length > 0 && (V = !1),
                      V)
                    ) {
                      var H = createTag("style");
                      H.setAttribute("f-forigin", g[S].fOrigin),
                        H.setAttribute("f-origin", g[S].origin),
                        H.setAttribute("f-family", g[S].fFamily),
                        (H.type = "text/css"),
                        (H.innerText =
                          "@font-face {font-family: " +
                          g[S].fFamily +
                          "; font-style: normal; src: url('" +
                          g[S].fPath +
                          "');}"),
                        T.appendChild(H);
                    }
                  } else if (g[S].fOrigin === "g" || g[S].origin === 1) {
                    for (
                      D = document.querySelectorAll(
                        'link[f-forigin="g"], link[f-origin="1"]'
                      ),
                        B = 0;
                      B < D.length;
                      B += 1
                    )
                      D[B].href.indexOf(g[S].fPath) !== -1 && (V = !1);
                    if (V) {
                      var j = createTag("link");
                      j.setAttribute("f-forigin", g[S].fOrigin),
                        j.setAttribute("f-origin", g[S].origin),
                        (j.type = "text/css"),
                        (j.rel = "stylesheet"),
                        (j.href = g[S].fPath),
                        document.body.appendChild(j);
                    }
                  } else if (g[S].fOrigin === "t" || g[S].origin === 2) {
                    for (
                      D = document.querySelectorAll(
                        'script[f-forigin="t"], script[f-origin="2"]'
                      ),
                        B = 0;
                      B < D.length;
                      B += 1
                    )
                      g[S].fPath === D[B].src && (V = !1);
                    if (V) {
                      var q = createTag("link");
                      q.setAttribute("f-forigin", g[S].fOrigin),
                        q.setAttribute("f-origin", g[S].origin),
                        q.setAttribute("rel", "stylesheet"),
                        q.setAttribute("href", g[S].fPath),
                        T.appendChild(q);
                    }
                  }
                  (g[S].helper = m(g[S], T)),
                    (g[S].cache = {}),
                    this.fonts.push(g[S]);
                }
                M === 0
                  ? (this.isLoaded = !0)
                  : setTimeout(this.checkLoadedFonts.bind(this), 100);
              }
              function p(_) {
                if (_) {
                  this.chars || (this.chars = []);
                  var T,
                    g = _.length,
                    S,
                    k = this.chars.length,
                    M;
                  for (T = 0; T < g; T += 1) {
                    for (S = 0, M = !1; S < k; )
                      this.chars[S].style === _[T].style &&
                        this.chars[S].fFamily === _[T].fFamily &&
                        this.chars[S].ch === _[T].ch &&
                        (M = !0),
                        (S += 1);
                    M || (this.chars.push(_[T]), (k += 1));
                  }
                }
              }
              function u(_, T, g) {
                for (var S = 0, k = this.chars.length; S < k; ) {
                  if (
                    this.chars[S].ch === _ &&
                    this.chars[S].style === T &&
                    this.chars[S].fFamily === g
                  )
                    return this.chars[S];
                  S += 1;
                }
                return (
                  ((typeof _ == "string" && _.charCodeAt(0) !== 13) || !_) &&
                    console &&
                    console.warn &&
                    !this._warned &&
                    ((this._warned = !0),
                    console.warn(
                      "Missing character from exported characters list: ",
                      _,
                      T,
                      g
                    )),
                  e
                );
              }
              function l(_, T, g) {
                var S = this.getFontByName(T),
                  k = _;
                if (!S.cache[k]) {
                  var M = S.helper;
                  if (_ === " ") {
                    var V = M.measureText("|" + _ + "|"),
                      D = M.measureText("||");
                    S.cache[k] = (V - D) / 100;
                  } else S.cache[k] = M.measureText(_) / 100;
                }
                return S.cache[k] * g;
              }
              function y(_) {
                for (var T = 0, g = this.fonts.length; T < g; ) {
                  if (this.fonts[T].fName === _) return this.fonts[T];
                  T += 1;
                }
                return this.fonts[0];
              }
              function E(_) {
                var T = 0,
                  g = _.charCodeAt(0);
                if (g >= 55296 && g <= 56319) {
                  var S = _.charCodeAt(1);
                  S >= 56320 &&
                    S <= 57343 &&
                    (T = (g - 55296) * 1024 + S - 56320 + 65536);
                }
                return T;
              }
              function x(_, T) {
                var g = _.toString(16) + T.toString(16);
                return P.indexOf(g) !== -1;
              }
              function A(_) {
                return _ === o;
              }
              function F(_) {
                return _ === h;
              }
              function w(_) {
                var T = E(_);
                return T >= f && T <= d;
              }
              function z(_) {
                return w(_.substr(0, 2)) && w(_.substr(2, 2));
              }
              function R(_) {
                return r.indexOf(_) !== -1;
              }
              function L(_, T) {
                var g = E(_.substr(T, 2));
                if (g !== i) return !1;
                var S = 0;
                for (T += 2; S < 5; ) {
                  if (((g = E(_.substr(T, 2))), g < n || g > a)) return !1;
                  (S += 1), (T += 2);
                }
                return E(_.substr(T, 2)) === s;
              }
              function O() {
                this.isLoaded = !0;
              }
              var G = function () {
                (this.fonts = []),
                  (this.chars = null),
                  (this.typekitLoaded = 0),
                  (this.isLoaded = !1),
                  (this._warned = !1),
                  (this.initTime = Date.now()),
                  (this.setIsLoadedBinded = this.setIsLoaded.bind(this)),
                  (this.checkLoadedFontsBinded =
                    this.checkLoadedFonts.bind(this));
              };
              (G.isModifier = x),
                (G.isZeroWidthJoiner = A),
                (G.isFlagEmoji = z),
                (G.isRegionalCode = w),
                (G.isCombinedCharacter = R),
                (G.isRegionalFlag = L),
                (G.isVariationSelector = F),
                (G.BLACK_FLAG_CODE_POINT = i);
              var I = {
                addChars: p,
                addFonts: C,
                getCharData: u,
                getFontByName: y,
                measureText: l,
                checkLoadedFonts: v,
                setIsLoaded: O,
              };
              return (G.prototype = I), G;
            })();
            function SlotManager(t) {
              this.animationData = t;
            }
            SlotManager.prototype.getProp = function (t) {
              return this.animationData.slots && this.animationData.slots[t.sid]
                ? Object.assign(t, this.animationData.slots[t.sid].p)
                : t;
            };
            function slotFactory(t) {
              return new SlotManager(t);
            }
            function RenderableElement() {}
            RenderableElement.prototype = {
              initRenderable: function () {
                (this.isInRange = !1),
                  (this.hidden = !1),
                  (this.isTransparent = !1),
                  (this.renderableComponents = []);
              },
              addRenderableComponent: function (e) {
                this.renderableComponents.indexOf(e) === -1 &&
                  this.renderableComponents.push(e);
              },
              removeRenderableComponent: function (e) {
                this.renderableComponents.indexOf(e) !== -1 &&
                  this.renderableComponents.splice(
                    this.renderableComponents.indexOf(e),
                    1
                  );
              },
              prepareRenderableFrame: function (e) {
                this.checkLayerLimits(e);
              },
              checkTransparency: function () {
                this.finalTransform.mProp.o.v <= 0
                  ? !this.isTransparent &&
                    this.globalData.renderConfig.hideOnTransparent &&
                    ((this.isTransparent = !0), this.hide())
                  : this.isTransparent &&
                    ((this.isTransparent = !1), this.show());
              },
              checkLayerLimits: function (e) {
                this.data.ip - this.data.st <= e &&
                this.data.op - this.data.st > e
                  ? this.isInRange !== !0 &&
                    ((this.globalData._mdf = !0),
                    (this._mdf = !0),
                    (this.isInRange = !0),
                    this.show())
                  : this.isInRange !== !1 &&
                    ((this.globalData._mdf = !0),
                    (this.isInRange = !1),
                    this.hide());
              },
              renderRenderable: function () {
                var e,
                  r = this.renderableComponents.length;
                for (e = 0; e < r; e += 1)
                  this.renderableComponents[e].renderFrame(this._isFirstFrame);
              },
              sourceRectAtTime: function () {
                return { top: 0, left: 0, width: 100, height: 100 };
              },
              getLayerSize: function () {
                return this.data.ty === 5
                  ? {
                      w: this.data.textData.width,
                      h: this.data.textData.height,
                    }
                  : { w: this.data.width, h: this.data.height };
              },
            };
            var getBlendMode = (function () {
              var t = {
                0: "source-over",
                1: "multiply",
                2: "screen",
                3: "overlay",
                4: "darken",
                5: "lighten",
                6: "color-dodge",
                7: "color-burn",
                8: "hard-light",
                9: "soft-light",
                10: "difference",
                11: "exclusion",
                12: "hue",
                13: "saturation",
                14: "color",
                15: "luminosity",
              };
              return function (e) {
                return t[e] || "";
              };
            })();
            function SliderEffect(t, e, r) {
              this.p = PropertyFactory.getProp(e, t.v, 0, 0, r);
            }
            function AngleEffect(t, e, r) {
              this.p = PropertyFactory.getProp(e, t.v, 0, 0, r);
            }
            function ColorEffect(t, e, r) {
              this.p = PropertyFactory.getProp(e, t.v, 1, 0, r);
            }
            function PointEffect(t, e, r) {
              this.p = PropertyFactory.getProp(e, t.v, 1, 0, r);
            }
            function LayerIndexEffect(t, e, r) {
              this.p = PropertyFactory.getProp(e, t.v, 0, 0, r);
            }
            function MaskIndexEffect(t, e, r) {
              this.p = PropertyFactory.getProp(e, t.v, 0, 0, r);
            }
            function CheckboxEffect(t, e, r) {
              this.p = PropertyFactory.getProp(e, t.v, 0, 0, r);
            }
            function NoValueEffect() {
              this.p = {};
            }
            function EffectsManager(t, e) {
              var r = t.ef || [];
              this.effectElements = [];
              var i,
                s = r.length,
                n;
              for (i = 0; i < s; i += 1)
                (n = new GroupEffect(r[i], e)), this.effectElements.push(n);
            }
            function GroupEffect(t, e) {
              this.init(t, e);
            }
            extendPrototype([DynamicPropertyContainer], GroupEffect),
              (GroupEffect.prototype.getValue =
                GroupEffect.prototype.iterateDynamicProperties),
              (GroupEffect.prototype.init = function (t, e) {
                (this.data = t),
                  (this.effectElements = []),
                  this.initDynamicPropertyContainer(e);
                var r,
                  i = this.data.ef.length,
                  s,
                  n = this.data.ef;
                for (r = 0; r < i; r += 1) {
                  switch (((s = null), n[r].ty)) {
                    case 0:
                      s = new SliderEffect(n[r], e, this);
                      break;
                    case 1:
                      s = new AngleEffect(n[r], e, this);
                      break;
                    case 2:
                      s = new ColorEffect(n[r], e, this);
                      break;
                    case 3:
                      s = new PointEffect(n[r], e, this);
                      break;
                    case 4:
                    case 7:
                      s = new CheckboxEffect(n[r], e, this);
                      break;
                    case 10:
                      s = new LayerIndexEffect(n[r], e, this);
                      break;
                    case 11:
                      s = new MaskIndexEffect(n[r], e, this);
                      break;
                    case 5:
                      s = new EffectsManager(n[r], e);
                      break;
                    default:
                      s = new NoValueEffect(n[r]);
                      break;
                  }
                  s && this.effectElements.push(s);
                }
              });
            function BaseElement() {}
            BaseElement.prototype = {
              checkMasks: function () {
                if (!this.data.hasMask) return !1;
                for (var e = 0, r = this.data.masksProperties.length; e < r; ) {
                  if (
                    this.data.masksProperties[e].mode !== "n" &&
                    this.data.masksProperties[e].cl !== !1
                  )
                    return !0;
                  e += 1;
                }
                return !1;
              },
              initExpressions: function () {
                var e = getExpressionInterfaces();
                if (e) {
                  var r = e("layer"),
                    i = e("effects"),
                    s = e("shape"),
                    n = e("text"),
                    a = e("comp");
                  (this.layerInterface = r(this)),
                    this.data.hasMask &&
                      this.maskManager &&
                      this.layerInterface.registerMaskInterface(
                        this.maskManager
                      );
                  var h = i.createEffectsInterface(this, this.layerInterface);
                  this.layerInterface.registerEffectsInterface(h),
                    this.data.ty === 0 || this.data.xt
                      ? (this.compInterface = a(this))
                      : this.data.ty === 4
                      ? ((this.layerInterface.shapeInterface = s(
                          this.shapesData,
                          this.itemsData,
                          this.layerInterface
                        )),
                        (this.layerInterface.content =
                          this.layerInterface.shapeInterface))
                      : this.data.ty === 5 &&
                        ((this.layerInterface.textInterface = n(this)),
                        (this.layerInterface.text =
                          this.layerInterface.textInterface));
                }
              },
              setBlendMode: function () {
                var e = getBlendMode(this.data.bm),
                  r = this.baseElement || this.layerElement;
                r.style["mix-blend-mode"] = e;
              },
              initBaseData: function (e, r, i) {
                (this.globalData = r),
                  (this.comp = i),
                  (this.data = e),
                  (this.layerId = createElementID()),
                  this.data.sr || (this.data.sr = 1),
                  (this.effectsManager = new EffectsManager(
                    this.data,
                    this,
                    this.dynamicProperties
                  ));
              },
              getType: function () {
                return this.type;
              },
              sourceRectAtTime: function () {},
            };
            function FrameElement() {}
            FrameElement.prototype = {
              initFrame: function () {
                (this._isFirstFrame = !1),
                  (this.dynamicProperties = []),
                  (this._mdf = !1);
              },
              prepareProperties: function (e, r) {
                var i,
                  s = this.dynamicProperties.length;
                for (i = 0; i < s; i += 1)
                  (r ||
                    (this._isParent &&
                      this.dynamicProperties[i].propType === "transform")) &&
                    (this.dynamicProperties[i].getValue(),
                    this.dynamicProperties[i]._mdf &&
                      ((this.globalData._mdf = !0), (this._mdf = !0)));
              },
              addDynamicProperty: function (e) {
                this.dynamicProperties.indexOf(e) === -1 &&
                  this.dynamicProperties.push(e);
              },
            };
            function FootageElement(t, e, r) {
              this.initFrame(),
                this.initRenderable(),
                (this.assetData = e.getAssetData(t.refId)),
                (this.footageData = e.imageLoader.getAsset(this.assetData)),
                this.initBaseData(t, e, r);
            }
            (FootageElement.prototype.prepareFrame = function () {}),
              extendPrototype(
                [RenderableElement, BaseElement, FrameElement],
                FootageElement
              ),
              (FootageElement.prototype.getBaseElement = function () {
                return null;
              }),
              (FootageElement.prototype.renderFrame = function () {}),
              (FootageElement.prototype.destroy = function () {}),
              (FootageElement.prototype.initExpressions = function () {
                var t = getExpressionInterfaces();
                if (t) {
                  var e = t("footage");
                  this.layerInterface = e(this);
                }
              }),
              (FootageElement.prototype.getFootageData = function () {
                return this.footageData;
              });
            function AudioElement(t, e, r) {
              this.initFrame(),
                this.initRenderable(),
                (this.assetData = e.getAssetData(t.refId)),
                this.initBaseData(t, e, r),
                (this._isPlaying = !1),
                (this._canPlay = !1);
              var i = this.globalData.getAssetsPath(this.assetData);
              (this.audio = this.globalData.audioController.createAudio(i)),
                (this._currentTime = 0),
                this.globalData.audioController.addAudio(this),
                (this._volumeMultiplier = 1),
                (this._volume = 1),
                (this._previousVolume = null),
                (this.tm = t.tm
                  ? PropertyFactory.getProp(this, t.tm, 0, e.frameRate, this)
                  : { _placeholder: !0 }),
                (this.lv = PropertyFactory.getProp(
                  this,
                  t.au && t.au.lv ? t.au.lv : { k: [100] },
                  1,
                  0.01,
                  this
                ));
            }
            (AudioElement.prototype.prepareFrame = function (t) {
              if (
                (this.prepareRenderableFrame(t, !0),
                this.prepareProperties(t, !0),
                this.tm._placeholder)
              )
                this._currentTime = t / this.data.sr;
              else {
                var e = this.tm.v;
                this._currentTime = e;
              }
              this._volume = this.lv.v[0];
              var r = this._volume * this._volumeMultiplier;
              this._previousVolume !== r &&
                ((this._previousVolume = r), this.audio.volume(r));
            }),
              extendPrototype(
                [RenderableElement, BaseElement, FrameElement],
                AudioElement
              ),
              (AudioElement.prototype.renderFrame = function () {
                this.isInRange &&
                  this._canPlay &&
                  (this._isPlaying
                    ? (!this.audio.playing() ||
                        Math.abs(
                          this._currentTime / this.globalData.frameRate -
                            this.audio.seek()
                        ) > 0.1) &&
                      this.audio.seek(
                        this._currentTime / this.globalData.frameRate
                      )
                    : (this.audio.play(),
                      this.audio.seek(
                        this._currentTime / this.globalData.frameRate
                      ),
                      (this._isPlaying = !0)));
              }),
              (AudioElement.prototype.show = function () {}),
              (AudioElement.prototype.hide = function () {
                this.audio.pause(), (this._isPlaying = !1);
              }),
              (AudioElement.prototype.pause = function () {
                this.audio.pause(),
                  (this._isPlaying = !1),
                  (this._canPlay = !1);
              }),
              (AudioElement.prototype.resume = function () {
                this._canPlay = !0;
              }),
              (AudioElement.prototype.setRate = function (t) {
                this.audio.rate(t);
              }),
              (AudioElement.prototype.volume = function (t) {
                (this._volumeMultiplier = t),
                  (this._previousVolume = t * this._volume),
                  this.audio.volume(this._previousVolume);
              }),
              (AudioElement.prototype.getBaseElement = function () {
                return null;
              }),
              (AudioElement.prototype.destroy = function () {}),
              (AudioElement.prototype.sourceRectAtTime = function () {}),
              (AudioElement.prototype.initExpressions = function () {});
            function BaseRenderer() {}
            (BaseRenderer.prototype.checkLayers = function (t) {
              var e,
                r = this.layers.length,
                i;
              for (this.completeLayers = !0, e = r - 1; e >= 0; e -= 1)
                this.elements[e] ||
                  ((i = this.layers[e]),
                  i.ip - i.st <= t - this.layers[e].st &&
                    i.op - i.st > t - this.layers[e].st &&
                    this.buildItem(e)),
                  (this.completeLayers = this.elements[e]
                    ? this.completeLayers
                    : !1);
              this.checkPendingElements();
            }),
              (BaseRenderer.prototype.createItem = function (t) {
                switch (t.ty) {
                  case 2:
                    return this.createImage(t);
                  case 0:
                    return this.createComp(t);
                  case 1:
                    return this.createSolid(t);
                  case 3:
                    return this.createNull(t);
                  case 4:
                    return this.createShape(t);
                  case 5:
                    return this.createText(t);
                  case 6:
                    return this.createAudio(t);
                  case 13:
                    return this.createCamera(t);
                  case 15:
                    return this.createFootage(t);
                  default:
                    return this.createNull(t);
                }
              }),
              (BaseRenderer.prototype.createCamera = function () {
                throw new Error(
                  "You're using a 3d camera. Try the html renderer."
                );
              }),
              (BaseRenderer.prototype.createAudio = function (t) {
                return new AudioElement(t, this.globalData, this);
              }),
              (BaseRenderer.prototype.createFootage = function (t) {
                return new FootageElement(t, this.globalData, this);
              }),
              (BaseRenderer.prototype.buildAllItems = function () {
                var t,
                  e = this.layers.length;
                for (t = 0; t < e; t += 1) this.buildItem(t);
                this.checkPendingElements();
              }),
              (BaseRenderer.prototype.includeLayers = function (t) {
                this.completeLayers = !1;
                var e,
                  r = t.length,
                  i,
                  s = this.layers.length;
                for (e = 0; e < r; e += 1)
                  for (i = 0; i < s; ) {
                    if (this.layers[i].id === t[e].id) {
                      this.layers[i] = t[e];
                      break;
                    }
                    i += 1;
                  }
              }),
              (BaseRenderer.prototype.setProjectInterface = function (t) {
                this.globalData.projectInterface = t;
              }),
              (BaseRenderer.prototype.initItems = function () {
                this.globalData.progressiveLoad || this.buildAllItems();
              }),
              (BaseRenderer.prototype.buildElementParenting = function (
                t,
                e,
                r
              ) {
                for (
                  var i = this.elements, s = this.layers, n = 0, a = s.length;
                  n < a;

                )
                  s[n].ind == e &&
                    (!i[n] || i[n] === !0
                      ? (this.buildItem(n), this.addPendingElement(t))
                      : (r.push(i[n]),
                        i[n].setAsParent(),
                        s[n].parent !== void 0
                          ? this.buildElementParenting(t, s[n].parent, r)
                          : t.setHierarchy(r))),
                    (n += 1);
              }),
              (BaseRenderer.prototype.addPendingElement = function (t) {
                this.pendingElements.push(t);
              }),
              (BaseRenderer.prototype.searchExtraCompositions = function (t) {
                var e,
                  r = t.length;
                for (e = 0; e < r; e += 1)
                  if (t[e].xt) {
                    var i = this.createComp(t[e]);
                    i.initExpressions(),
                      this.globalData.projectInterface.registerComposition(i);
                  }
              }),
              (BaseRenderer.prototype.getElementById = function (t) {
                var e,
                  r = this.elements.length;
                for (e = 0; e < r; e += 1)
                  if (this.elements[e].data.ind === t) return this.elements[e];
                return null;
              }),
              (BaseRenderer.prototype.getElementByPath = function (t) {
                var e = t.shift(),
                  r;
                if (typeof e == "number") r = this.elements[e];
                else {
                  var i,
                    s = this.elements.length;
                  for (i = 0; i < s; i += 1)
                    if (this.elements[i].data.nm === e) {
                      r = this.elements[i];
                      break;
                    }
                }
                return t.length === 0 ? r : r.getElementByPath(t);
              }),
              (BaseRenderer.prototype.setupGlobalData = function (t, e) {
                (this.globalData.fontManager = new FontManager()),
                  (this.globalData.slotManager = slotFactory(t)),
                  this.globalData.fontManager.addChars(t.chars),
                  this.globalData.fontManager.addFonts(t.fonts, e),
                  (this.globalData.getAssetData =
                    this.animationItem.getAssetData.bind(this.animationItem)),
                  (this.globalData.getAssetsPath =
                    this.animationItem.getAssetsPath.bind(this.animationItem)),
                  (this.globalData.imageLoader =
                    this.animationItem.imagePreloader),
                  (this.globalData.audioController =
                    this.animationItem.audioController),
                  (this.globalData.frameId = 0),
                  (this.globalData.frameRate = t.fr),
                  (this.globalData.nm = t.nm),
                  (this.globalData.compSize = { w: t.w, h: t.h });
              });
            var effectTypes = { TRANSFORM_EFFECT: "transformEFfect" };
            function TransformElement() {}
            TransformElement.prototype = {
              initTransform: function () {
                var e = new Matrix();
                (this.finalTransform = {
                  mProp: this.data.ks
                    ? TransformPropertyFactory.getTransformProperty(
                        this,
                        this.data.ks,
                        this
                      )
                    : { o: 0 },
                  _matMdf: !1,
                  _localMatMdf: !1,
                  _opMdf: !1,
                  mat: e,
                  localMat: e,
                  localOpacity: 1,
                }),
                  this.data.ao && (this.finalTransform.mProp.autoOriented = !0),
                  this.data.ty;
              },
              renderTransform: function () {
                if (
                  ((this.finalTransform._opMdf =
                    this.finalTransform.mProp.o._mdf || this._isFirstFrame),
                  (this.finalTransform._matMdf =
                    this.finalTransform.mProp._mdf || this._isFirstFrame),
                  this.hierarchy)
                ) {
                  var e,
                    r = this.finalTransform.mat,
                    i = 0,
                    s = this.hierarchy.length;
                  if (!this.finalTransform._matMdf)
                    for (; i < s; ) {
                      if (this.hierarchy[i].finalTransform.mProp._mdf) {
                        this.finalTransform._matMdf = !0;
                        break;
                      }
                      i += 1;
                    }
                  if (this.finalTransform._matMdf)
                    for (
                      e = this.finalTransform.mProp.v.props,
                        r.cloneFromProps(e),
                        i = 0;
                      i < s;
                      i += 1
                    )
                      r.multiply(this.hierarchy[i].finalTransform.mProp.v);
                }
                this.finalTransform._matMdf &&
                  (this.finalTransform._localMatMdf =
                    this.finalTransform._matMdf),
                  this.finalTransform._opMdf &&
                    (this.finalTransform.localOpacity =
                      this.finalTransform.mProp.o.v);
              },
              renderLocalTransform: function () {
                if (this.localTransforms) {
                  var e = 0,
                    r = this.localTransforms.length;
                  if (
                    ((this.finalTransform._localMatMdf =
                      this.finalTransform._matMdf),
                    !this.finalTransform._localMatMdf ||
                      !this.finalTransform._opMdf)
                  )
                    for (; e < r; )
                      this.localTransforms[e]._mdf &&
                        (this.finalTransform._localMatMdf = !0),
                        this.localTransforms[e]._opMdf &&
                          !this.finalTransform._opMdf &&
                          ((this.finalTransform.localOpacity =
                            this.finalTransform.mProp.o.v),
                          (this.finalTransform._opMdf = !0)),
                        (e += 1);
                  if (this.finalTransform._localMatMdf) {
                    var i = this.finalTransform.localMat;
                    for (
                      this.localTransforms[0].matrix.clone(i), e = 1;
                      e < r;
                      e += 1
                    ) {
                      var s = this.localTransforms[e].matrix;
                      i.multiply(s);
                    }
                    i.multiply(this.finalTransform.mat);
                  }
                  if (this.finalTransform._opMdf) {
                    var n = this.finalTransform.localOpacity;
                    for (e = 0; e < r; e += 1)
                      n *= this.localTransforms[e].opacity * 0.01;
                    this.finalTransform.localOpacity = n;
                  }
                }
              },
              searchEffectTransforms: function () {
                if (this.renderableEffectsManager) {
                  var e = this.renderableEffectsManager.getEffects(
                    effectTypes.TRANSFORM_EFFECT
                  );
                  if (e.length) {
                    (this.localTransforms = []),
                      (this.finalTransform.localMat = new Matrix());
                    var r = 0,
                      i = e.length;
                    for (r = 0; r < i; r += 1) this.localTransforms.push(e[r]);
                  }
                }
              },
              globalToLocal: function (e) {
                var r = [];
                r.push(this.finalTransform);
                for (var i = !0, s = this.comp; i; )
                  s.finalTransform
                    ? (s.data.hasMask && r.splice(0, 0, s.finalTransform),
                      (s = s.comp))
                    : (i = !1);
                var n,
                  a = r.length,
                  h;
                for (n = 0; n < a; n += 1)
                  (h = r[n].mat.applyToPointArray(0, 0, 0)),
                    (e = [e[0] - h[0], e[1] - h[1], 0]);
                return e;
              },
              mHelper: new Matrix(),
            };
            function MaskElement(t, e, r) {
              (this.data = t),
                (this.element = e),
                (this.globalData = r),
                (this.storedData = []),
                (this.masksProperties = this.data.masksProperties || []),
                (this.maskElement = null);
              var i = this.globalData.defs,
                s,
                n = this.masksProperties ? this.masksProperties.length : 0;
              (this.viewData = createSizedArray(n)), (this.solidPath = "");
              var a,
                h = this.masksProperties,
                o = 0,
                f = [],
                d,
                P,
                c = createElementID(),
                b,
                v,
                m,
                C,
                p = "clipPath",
                u = "clip-path";
              for (s = 0; s < n; s += 1)
                if (
                  (((h[s].mode !== "a" && h[s].mode !== "n") ||
                    h[s].inv ||
                    h[s].o.k !== 100 ||
                    h[s].o.x) &&
                    ((p = "mask"), (u = "mask")),
                  (h[s].mode === "s" || h[s].mode === "i") && o === 0
                    ? ((b = createNS("rect")),
                      b.setAttribute("fill", "#ffffff"),
                      b.setAttribute("width", this.element.comp.data.w || 0),
                      b.setAttribute("height", this.element.comp.data.h || 0),
                      f.push(b))
                    : (b = null),
                  (a = createNS("path")),
                  h[s].mode === "n")
                )
                  (this.viewData[s] = {
                    op: PropertyFactory.getProp(
                      this.element,
                      h[s].o,
                      0,
                      0.01,
                      this.element
                    ),
                    prop: ShapePropertyFactory.getShapeProp(
                      this.element,
                      h[s],
                      3
                    ),
                    elem: a,
                    lastPath: "",
                  }),
                    i.appendChild(a);
                else {
                  (o += 1),
                    a.setAttribute(
                      "fill",
                      h[s].mode === "s" ? "#000000" : "#ffffff"
                    ),
                    a.setAttribute("clip-rule", "nonzero");
                  var l;
                  if (
                    (h[s].x.k !== 0
                      ? ((p = "mask"),
                        (u = "mask"),
                        (C = PropertyFactory.getProp(
                          this.element,
                          h[s].x,
                          0,
                          null,
                          this.element
                        )),
                        (l = createElementID()),
                        (v = createNS("filter")),
                        v.setAttribute("id", l),
                        (m = createNS("feMorphology")),
                        m.setAttribute("operator", "erode"),
                        m.setAttribute("in", "SourceGraphic"),
                        m.setAttribute("radius", "0"),
                        v.appendChild(m),
                        i.appendChild(v),
                        a.setAttribute(
                          "stroke",
                          h[s].mode === "s" ? "#000000" : "#ffffff"
                        ))
                      : ((m = null), (C = null)),
                    (this.storedData[s] = {
                      elem: a,
                      x: C,
                      expan: m,
                      lastPath: "",
                      lastOperator: "",
                      filterId: l,
                      lastRadius: 0,
                    }),
                    h[s].mode === "i")
                  ) {
                    P = f.length;
                    var y = createNS("g");
                    for (d = 0; d < P; d += 1) y.appendChild(f[d]);
                    var E = createNS("mask");
                    E.setAttribute("mask-type", "alpha"),
                      E.setAttribute("id", c + "_" + o),
                      E.appendChild(a),
                      i.appendChild(E),
                      y.setAttribute(
                        "mask",
                        "url(" + getLocationHref() + "#" + c + "_" + o + ")"
                      ),
                      (f.length = 0),
                      f.push(y);
                  } else f.push(a);
                  h[s].inv &&
                    !this.solidPath &&
                    (this.solidPath = this.createLayerSolidPath()),
                    (this.viewData[s] = {
                      elem: a,
                      lastPath: "",
                      op: PropertyFactory.getProp(
                        this.element,
                        h[s].o,
                        0,
                        0.01,
                        this.element
                      ),
                      prop: ShapePropertyFactory.getShapeProp(
                        this.element,
                        h[s],
                        3
                      ),
                      invRect: b,
                    }),
                    this.viewData[s].prop.k ||
                      this.drawPath(
                        h[s],
                        this.viewData[s].prop.v,
                        this.viewData[s]
                      );
                }
              for (
                this.maskElement = createNS(p), n = f.length, s = 0;
                s < n;
                s += 1
              )
                this.maskElement.appendChild(f[s]);
              o > 0 &&
                (this.maskElement.setAttribute("id", c),
                this.element.maskedElement.setAttribute(
                  u,
                  "url(" + getLocationHref() + "#" + c + ")"
                ),
                i.appendChild(this.maskElement)),
                this.viewData.length &&
                  this.element.addRenderableComponent(this);
            }
            (MaskElement.prototype.getMaskProperty = function (t) {
              return this.viewData[t].prop;
            }),
              (MaskElement.prototype.renderFrame = function (t) {
                var e = this.element.finalTransform.mat,
                  r,
                  i = this.masksProperties.length;
                for (r = 0; r < i; r += 1)
                  if (
                    ((this.viewData[r].prop._mdf || t) &&
                      this.drawPath(
                        this.masksProperties[r],
                        this.viewData[r].prop.v,
                        this.viewData[r]
                      ),
                    (this.viewData[r].op._mdf || t) &&
                      this.viewData[r].elem.setAttribute(
                        "fill-opacity",
                        this.viewData[r].op.v
                      ),
                    this.masksProperties[r].mode !== "n" &&
                      (this.viewData[r].invRect &&
                        (this.element.finalTransform.mProp._mdf || t) &&
                        this.viewData[r].invRect.setAttribute(
                          "transform",
                          e.getInverseMatrix().to2dCSS()
                        ),
                      this.storedData[r].x && (this.storedData[r].x._mdf || t)))
                  ) {
                    var s = this.storedData[r].expan;
                    this.storedData[r].x.v < 0
                      ? (this.storedData[r].lastOperator !== "erode" &&
                          ((this.storedData[r].lastOperator = "erode"),
                          this.storedData[r].elem.setAttribute(
                            "filter",
                            "url(" +
                              getLocationHref() +
                              "#" +
                              this.storedData[r].filterId +
                              ")"
                          )),
                        s.setAttribute("radius", -this.storedData[r].x.v))
                      : (this.storedData[r].lastOperator !== "dilate" &&
                          ((this.storedData[r].lastOperator = "dilate"),
                          this.storedData[r].elem.setAttribute("filter", null)),
                        this.storedData[r].elem.setAttribute(
                          "stroke-width",
                          this.storedData[r].x.v * 2
                        ));
                  }
              }),
              (MaskElement.prototype.getMaskelement = function () {
                return this.maskElement;
              }),
              (MaskElement.prototype.createLayerSolidPath = function () {
                var t = "M0,0 ";
                return (
                  (t += " h" + this.globalData.compSize.w),
                  (t += " v" + this.globalData.compSize.h),
                  (t += " h-" + this.globalData.compSize.w),
                  (t += " v-" + this.globalData.compSize.h + " "),
                  t
                );
              }),
              (MaskElement.prototype.drawPath = function (t, e, r) {
                var i = " M" + e.v[0][0] + "," + e.v[0][1],
                  s,
                  n;
                for (n = e._length, s = 1; s < n; s += 1)
                  i +=
                    " C" +
                    e.o[s - 1][0] +
                    "," +
                    e.o[s - 1][1] +
                    " " +
                    e.i[s][0] +
                    "," +
                    e.i[s][1] +
                    " " +
                    e.v[s][0] +
                    "," +
                    e.v[s][1];
                if (
                  (e.c &&
                    n > 1 &&
                    (i +=
                      " C" +
                      e.o[s - 1][0] +
                      "," +
                      e.o[s - 1][1] +
                      " " +
                      e.i[0][0] +
                      "," +
                      e.i[0][1] +
                      " " +
                      e.v[0][0] +
                      "," +
                      e.v[0][1]),
                  r.lastPath !== i)
                ) {
                  var a = "";
                  r.elem &&
                    (e.c && (a = t.inv ? this.solidPath + i : i),
                    r.elem.setAttribute("d", a)),
                    (r.lastPath = i);
                }
              }),
              (MaskElement.prototype.destroy = function () {
                (this.element = null),
                  (this.globalData = null),
                  (this.maskElement = null),
                  (this.data = null),
                  (this.masksProperties = null);
              });
            var filtersFactory = (function () {
                var t = {};
                (t.createFilter = e), (t.createAlphaToLuminanceFilter = r);
                function e(i, s) {
                  var n = createNS("filter");
                  return (
                    n.setAttribute("id", i),
                    s !== !0 &&
                      (n.setAttribute("filterUnits", "objectBoundingBox"),
                      n.setAttribute("x", "0%"),
                      n.setAttribute("y", "0%"),
                      n.setAttribute("width", "100%"),
                      n.setAttribute("height", "100%")),
                    n
                  );
                }
                function r() {
                  var i = createNS("feColorMatrix");
                  return (
                    i.setAttribute("type", "matrix"),
                    i.setAttribute("color-interpolation-filters", "sRGB"),
                    i.setAttribute(
                      "values",
                      "0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 1"
                    ),
                    i
                  );
                }
                return t;
              })(),
              featureSupport = (function () {
                var t = {
                  maskType: !0,
                  svgLumaHidden: !0,
                  offscreenCanvas: typeof OffscreenCanvas < "u",
                };
                return (
                  (/MSIE 10/i.test(navigator.userAgent) ||
                    /MSIE 9/i.test(navigator.userAgent) ||
                    /rv:11.0/i.test(navigator.userAgent) ||
                    /Edge\/\d./i.test(navigator.userAgent)) &&
                    (t.maskType = !1),
                  /firefox/i.test(navigator.userAgent) &&
                    (t.svgLumaHidden = !1),
                  t
                );
              })(),
              registeredEffects$1 = {},
              idPrefix = "filter_result_";
            function SVGEffects(t) {
              var e,
                r = "SourceGraphic",
                i = t.data.ef ? t.data.ef.length : 0,
                s = createElementID(),
                n = filtersFactory.createFilter(s, !0),
                a = 0;
              this.filters = [];
              var h;
              for (e = 0; e < i; e += 1) {
                h = null;
                var o = t.data.ef[e].ty;
                if (registeredEffects$1[o]) {
                  var f = registeredEffects$1[o].effect;
                  (h = new f(
                    n,
                    t.effectsManager.effectElements[e],
                    t,
                    idPrefix + a,
                    r
                  )),
                    (r = idPrefix + a),
                    registeredEffects$1[o].countsAsEffect && (a += 1);
                }
                h && this.filters.push(h);
              }
              a &&
                (t.globalData.defs.appendChild(n),
                t.layerElement.setAttribute(
                  "filter",
                  "url(" + getLocationHref() + "#" + s + ")"
                )),
                this.filters.length && t.addRenderableComponent(this);
            }
            (SVGEffects.prototype.renderFrame = function (t) {
              var e,
                r = this.filters.length;
              for (e = 0; e < r; e += 1) this.filters[e].renderFrame(t);
            }),
              (SVGEffects.prototype.getEffects = function (t) {
                var e,
                  r = this.filters.length,
                  i = [];
                for (e = 0; e < r; e += 1)
                  this.filters[e].type === t && i.push(this.filters[e]);
                return i;
              });
            function registerEffect$1(t, e, r) {
              registeredEffects$1[t] = { effect: e, countsAsEffect: r };
            }
            function SVGBaseElement() {}
            SVGBaseElement.prototype = {
              initRendererElement: function () {
                this.layerElement = createNS("g");
              },
              createContainerElements: function () {
                (this.matteElement = createNS("g")),
                  (this.transformedElement = this.layerElement),
                  (this.maskedElement = this.layerElement),
                  (this._sizeChanged = !1);
                var e = null;
                if (this.data.td) {
                  this.matteMasks = {};
                  var r = createNS("g");
                  r.setAttribute("id", this.layerId),
                    r.appendChild(this.layerElement),
                    (e = r),
                    this.globalData.defs.appendChild(r);
                } else
                  this.data.tt
                    ? (this.matteElement.appendChild(this.layerElement),
                      (e = this.matteElement),
                      (this.baseElement = this.matteElement))
                    : (this.baseElement = this.layerElement);
                if (
                  (this.data.ln &&
                    this.layerElement.setAttribute("id", this.data.ln),
                  this.data.cl &&
                    this.layerElement.setAttribute("class", this.data.cl),
                  this.data.ty === 0 && !this.data.hd)
                ) {
                  var i = createNS("clipPath"),
                    s = createNS("path");
                  s.setAttribute(
                    "d",
                    "M0,0 L" +
                      this.data.w +
                      ",0 L" +
                      this.data.w +
                      "," +
                      this.data.h +
                      " L0," +
                      this.data.h +
                      "z"
                  );
                  var n = createElementID();
                  if (
                    (i.setAttribute("id", n),
                    i.appendChild(s),
                    this.globalData.defs.appendChild(i),
                    this.checkMasks())
                  ) {
                    var a = createNS("g");
                    a.setAttribute(
                      "clip-path",
                      "url(" + getLocationHref() + "#" + n + ")"
                    ),
                      a.appendChild(this.layerElement),
                      (this.transformedElement = a),
                      e
                        ? e.appendChild(this.transformedElement)
                        : (this.baseElement = this.transformedElement);
                  } else
                    this.layerElement.setAttribute(
                      "clip-path",
                      "url(" + getLocationHref() + "#" + n + ")"
                    );
                }
                this.data.bm !== 0 && this.setBlendMode();
              },
              renderElement: function () {
                this.finalTransform._localMatMdf &&
                  this.transformedElement.setAttribute(
                    "transform",
                    this.finalTransform.localMat.to2dCSS()
                  ),
                  this.finalTransform._opMdf &&
                    this.transformedElement.setAttribute(
                      "opacity",
                      this.finalTransform.localOpacity
                    );
              },
              destroyBaseElement: function () {
                (this.layerElement = null),
                  (this.matteElement = null),
                  this.maskManager.destroy();
              },
              getBaseElement: function () {
                return this.data.hd ? null : this.baseElement;
              },
              createRenderableComponents: function () {
                (this.maskManager = new MaskElement(
                  this.data,
                  this,
                  this.globalData
                )),
                  (this.renderableEffectsManager = new SVGEffects(this)),
                  this.searchEffectTransforms();
              },
              getMatte: function (e) {
                if (
                  (this.matteMasks || (this.matteMasks = {}),
                  !this.matteMasks[e])
                ) {
                  var r = this.layerId + "_" + e,
                    i,
                    s,
                    n,
                    a;
                  if (e === 1 || e === 3) {
                    var h = createNS("mask");
                    h.setAttribute("id", r),
                      h.setAttribute(
                        "mask-type",
                        e === 3 ? "luminance" : "alpha"
                      ),
                      (n = createNS("use")),
                      n.setAttributeNS(
                        "http://www.w3.org/1999/xlink",
                        "href",
                        "#" + this.layerId
                      ),
                      h.appendChild(n),
                      this.globalData.defs.appendChild(h),
                      !featureSupport.maskType &&
                        e === 1 &&
                        (h.setAttribute("mask-type", "luminance"),
                        (i = createElementID()),
                        (s = filtersFactory.createFilter(i)),
                        this.globalData.defs.appendChild(s),
                        s.appendChild(
                          filtersFactory.createAlphaToLuminanceFilter()
                        ),
                        (a = createNS("g")),
                        a.appendChild(n),
                        h.appendChild(a),
                        a.setAttribute(
                          "filter",
                          "url(" + getLocationHref() + "#" + i + ")"
                        ));
                  } else if (e === 2) {
                    var o = createNS("mask");
                    o.setAttribute("id", r),
                      o.setAttribute("mask-type", "alpha");
                    var f = createNS("g");
                    o.appendChild(f),
                      (i = createElementID()),
                      (s = filtersFactory.createFilter(i));
                    var d = createNS("feComponentTransfer");
                    d.setAttribute("in", "SourceGraphic"), s.appendChild(d);
                    var P = createNS("feFuncA");
                    P.setAttribute("type", "table"),
                      P.setAttribute("tableValues", "1.0 0.0"),
                      d.appendChild(P),
                      this.globalData.defs.appendChild(s);
                    var c = createNS("rect");
                    c.setAttribute("width", this.comp.data.w),
                      c.setAttribute("height", this.comp.data.h),
                      c.setAttribute("x", "0"),
                      c.setAttribute("y", "0"),
                      c.setAttribute("fill", "#ffffff"),
                      c.setAttribute("opacity", "0"),
                      f.setAttribute(
                        "filter",
                        "url(" + getLocationHref() + "#" + i + ")"
                      ),
                      f.appendChild(c),
                      (n = createNS("use")),
                      n.setAttributeNS(
                        "http://www.w3.org/1999/xlink",
                        "href",
                        "#" + this.layerId
                      ),
                      f.appendChild(n),
                      featureSupport.maskType ||
                        (o.setAttribute("mask-type", "luminance"),
                        s.appendChild(
                          filtersFactory.createAlphaToLuminanceFilter()
                        ),
                        (a = createNS("g")),
                        f.appendChild(c),
                        a.appendChild(this.layerElement),
                        f.appendChild(a)),
                      this.globalData.defs.appendChild(o);
                  }
                  this.matteMasks[e] = r;
                }
                return this.matteMasks[e];
              },
              setMatte: function (e) {
                this.matteElement &&
                  this.matteElement.setAttribute(
                    "mask",
                    "url(" + getLocationHref() + "#" + e + ")"
                  );
              },
            };
            function HierarchyElement() {}
            HierarchyElement.prototype = {
              initHierarchy: function () {
                (this.hierarchy = []),
                  (this._isParent = !1),
                  this.checkParenting();
              },
              setHierarchy: function (e) {
                this.hierarchy = e;
              },
              setAsParent: function () {
                this._isParent = !0;
              },
              checkParenting: function () {
                this.data.parent !== void 0 &&
                  this.comp.buildElementParenting(this, this.data.parent, []);
              },
            };
            function RenderableDOMElement() {}
            (function () {
              var t = {
                initElement: function (r, i, s) {
                  this.initFrame(),
                    this.initBaseData(r, i, s),
                    this.initTransform(r, i, s),
                    this.initHierarchy(),
                    this.initRenderable(),
                    this.initRendererElement(),
                    this.createContainerElements(),
                    this.createRenderableComponents(),
                    this.createContent(),
                    this.hide();
                },
                hide: function () {
                  if (!this.hidden && (!this.isInRange || this.isTransparent)) {
                    var r = this.baseElement || this.layerElement;
                    (r.style.display = "none"), (this.hidden = !0);
                  }
                },
                show: function () {
                  if (this.isInRange && !this.isTransparent) {
                    if (!this.data.hd) {
                      var r = this.baseElement || this.layerElement;
                      r.style.display = "block";
                    }
                    (this.hidden = !1), (this._isFirstFrame = !0);
                  }
                },
                renderFrame: function () {
                  this.data.hd ||
                    this.hidden ||
                    (this.renderTransform(),
                    this.renderRenderable(),
                    this.renderLocalTransform(),
                    this.renderElement(),
                    this.renderInnerContent(),
                    this._isFirstFrame && (this._isFirstFrame = !1));
                },
                renderInnerContent: function () {},
                prepareFrame: function (r) {
                  (this._mdf = !1),
                    this.prepareRenderableFrame(r),
                    this.prepareProperties(r, this.isInRange),
                    this.checkTransparency();
                },
                destroy: function () {
                  (this.innerElem = null), this.destroyBaseElement();
                },
              };
              extendPrototype(
                [RenderableElement, createProxyFunction(t)],
                RenderableDOMElement
              );
            })();
            function IImageElement(t, e, r) {
              (this.assetData = e.getAssetData(t.refId)),
                this.assetData &&
                  this.assetData.sid &&
                  (this.assetData = e.slotManager.getProp(this.assetData)),
                this.initElement(t, e, r),
                (this.sourceRect = {
                  top: 0,
                  left: 0,
                  width: this.assetData.w,
                  height: this.assetData.h,
                });
            }
            extendPrototype(
              [
                BaseElement,
                TransformElement,
                SVGBaseElement,
                HierarchyElement,
                FrameElement,
                RenderableDOMElement,
              ],
              IImageElement
            ),
              (IImageElement.prototype.createContent = function () {
                var t = this.globalData.getAssetsPath(this.assetData);
                (this.innerElem = createNS("image")),
                  this.innerElem.setAttribute("width", this.assetData.w + "px"),
                  this.innerElem.setAttribute(
                    "height",
                    this.assetData.h + "px"
                  ),
                  this.innerElem.setAttribute(
                    "preserveAspectRatio",
                    this.assetData.pr ||
                      this.globalData.renderConfig.imagePreserveAspectRatio
                  ),
                  this.innerElem.setAttributeNS(
                    "http://www.w3.org/1999/xlink",
                    "href",
                    t
                  ),
                  this.layerElement.appendChild(this.innerElem);
              }),
              (IImageElement.prototype.sourceRectAtTime = function () {
                return this.sourceRect;
              });
            function ProcessedElement(t, e) {
              (this.elem = t), (this.pos = e);
            }
            function IShapeElement() {}
            IShapeElement.prototype = {
              addShapeToModifiers: function (e) {
                var r,
                  i = this.shapeModifiers.length;
                for (r = 0; r < i; r += 1) this.shapeModifiers[r].addShape(e);
              },
              isShapeInAnimatedModifiers: function (e) {
                for (var r = 0, i = this.shapeModifiers.length; r < i; )
                  if (this.shapeModifiers[r].isAnimatedWithShape(e)) return !0;
                return !1;
              },
              renderModifiers: function () {
                if (this.shapeModifiers.length) {
                  var e,
                    r = this.shapes.length;
                  for (e = 0; e < r; e += 1) this.shapes[e].sh.reset();
                  r = this.shapeModifiers.length;
                  var i;
                  for (
                    e = r - 1;
                    e >= 0 &&
                    ((i = this.shapeModifiers[e].processShapes(
                      this._isFirstFrame
                    )),
                    !i);
                    e -= 1
                  );
                }
              },
              searchProcessedElement: function (e) {
                for (
                  var r = this.processedElements, i = 0, s = r.length;
                  i < s;

                ) {
                  if (r[i].elem === e) return r[i].pos;
                  i += 1;
                }
                return 0;
              },
              addProcessedElement: function (e, r) {
                for (var i = this.processedElements, s = i.length; s; )
                  if (((s -= 1), i[s].elem === e)) {
                    i[s].pos = r;
                    return;
                  }
                i.push(new ProcessedElement(e, r));
              },
              prepareFrame: function (e) {
                this.prepareRenderableFrame(e),
                  this.prepareProperties(e, this.isInRange);
              },
            };
            var lineCapEnum = { 1: "butt", 2: "round", 3: "square" },
              lineJoinEnum = { 1: "miter", 2: "round", 3: "bevel" };
            function SVGShapeData(t, e, r) {
              (this.caches = []),
                (this.styles = []),
                (this.transformers = t),
                (this.lStr = ""),
                (this.sh = r),
                (this.lvl = e),
                (this._isAnimated = !!r.k);
              for (var i = 0, s = t.length; i < s; ) {
                if (t[i].mProps.dynamicProperties.length) {
                  this._isAnimated = !0;
                  break;
                }
                i += 1;
              }
            }
            SVGShapeData.prototype.setAsAnimated = function () {
              this._isAnimated = !0;
            };
            function SVGStyleData(t, e) {
              (this.data = t),
                (this.type = t.ty),
                (this.d = ""),
                (this.lvl = e),
                (this._mdf = !1),
                (this.closed = t.hd === !0),
                (this.pElem = createNS("path")),
                (this.msElem = null);
            }
            SVGStyleData.prototype.reset = function () {
              (this.d = ""), (this._mdf = !1);
            };
            function DashProperty(t, e, r, i) {
              (this.elem = t),
                (this.frameId = -1),
                (this.dataProps = createSizedArray(e.length)),
                (this.renderer = r),
                (this.k = !1),
                (this.dashStr = ""),
                (this.dashArray = createTypedArray(
                  "float32",
                  e.length ? e.length - 1 : 0
                )),
                (this.dashoffset = createTypedArray("float32", 1)),
                this.initDynamicPropertyContainer(i);
              var s,
                n = e.length || 0,
                a;
              for (s = 0; s < n; s += 1)
                (a = PropertyFactory.getProp(t, e[s].v, 0, 0, this)),
                  (this.k = a.k || this.k),
                  (this.dataProps[s] = { n: e[s].n, p: a });
              this.k || this.getValue(!0), (this._isAnimated = this.k);
            }
            (DashProperty.prototype.getValue = function (t) {
              if (
                !(this.elem.globalData.frameId === this.frameId && !t) &&
                ((this.frameId = this.elem.globalData.frameId),
                this.iterateDynamicProperties(),
                (this._mdf = this._mdf || t),
                this._mdf)
              ) {
                var e = 0,
                  r = this.dataProps.length;
                for (
                  this.renderer === "svg" && (this.dashStr = ""), e = 0;
                  e < r;
                  e += 1
                )
                  this.dataProps[e].n !== "o"
                    ? this.renderer === "svg"
                      ? (this.dashStr += " " + this.dataProps[e].p.v)
                      : (this.dashArray[e] = this.dataProps[e].p.v)
                    : (this.dashoffset[0] = this.dataProps[e].p.v);
              }
            }),
              extendPrototype([DynamicPropertyContainer], DashProperty);
            function SVGStrokeStyleData(t, e, r) {
              this.initDynamicPropertyContainer(t),
                (this.getValue = this.iterateDynamicProperties),
                (this.o = PropertyFactory.getProp(t, e.o, 0, 0.01, this)),
                (this.w = PropertyFactory.getProp(t, e.w, 0, null, this)),
                (this.d = new DashProperty(t, e.d || {}, "svg", this)),
                (this.c = PropertyFactory.getProp(t, e.c, 1, 255, this)),
                (this.style = r),
                (this._isAnimated = !!this._isAnimated);
            }
            extendPrototype([DynamicPropertyContainer], SVGStrokeStyleData);
            function SVGFillStyleData(t, e, r) {
              this.initDynamicPropertyContainer(t),
                (this.getValue = this.iterateDynamicProperties),
                (this.o = PropertyFactory.getProp(t, e.o, 0, 0.01, this)),
                (this.c = PropertyFactory.getProp(t, e.c, 1, 255, this)),
                (this.style = r);
            }
            extendPrototype([DynamicPropertyContainer], SVGFillStyleData);
            function SVGNoStyleData(t, e, r) {
              this.initDynamicPropertyContainer(t),
                (this.getValue = this.iterateDynamicProperties),
                (this.style = r);
            }
            extendPrototype([DynamicPropertyContainer], SVGNoStyleData);
            function GradientProperty(t, e, r) {
              (this.data = e), (this.c = createTypedArray("uint8c", e.p * 4));
              var i = e.k.k[0].s
                ? e.k.k[0].s.length - e.p * 4
                : e.k.k.length - e.p * 4;
              (this.o = createTypedArray("float32", i)),
                (this._cmdf = !1),
                (this._omdf = !1),
                (this._collapsable = this.checkCollapsable()),
                (this._hasOpacity = i),
                this.initDynamicPropertyContainer(r),
                (this.prop = PropertyFactory.getProp(t, e.k, 1, null, this)),
                (this.k = this.prop.k),
                this.getValue(!0);
            }
            (GradientProperty.prototype.comparePoints = function (t, e) {
              for (var r = 0, i = this.o.length / 2, s; r < i; ) {
                if (((s = Math.abs(t[r * 4] - t[e * 4 + r * 2])), s > 0.01))
                  return !1;
                r += 1;
              }
              return !0;
            }),
              (GradientProperty.prototype.checkCollapsable = function () {
                if (this.o.length / 2 !== this.c.length / 4) return !1;
                if (this.data.k.k[0].s)
                  for (var t = 0, e = this.data.k.k.length; t < e; ) {
                    if (!this.comparePoints(this.data.k.k[t].s, this.data.p))
                      return !1;
                    t += 1;
                  }
                else if (!this.comparePoints(this.data.k.k, this.data.p))
                  return !1;
                return !0;
              }),
              (GradientProperty.prototype.getValue = function (t) {
                if (
                  (this.prop.getValue(),
                  (this._mdf = !1),
                  (this._cmdf = !1),
                  (this._omdf = !1),
                  this.prop._mdf || t)
                ) {
                  var e,
                    r = this.data.p * 4,
                    i,
                    s;
                  for (e = 0; e < r; e += 1)
                    (i = e % 4 === 0 ? 100 : 255),
                      (s = Math.round(this.prop.v[e] * i)),
                      this.c[e] !== s && ((this.c[e] = s), (this._cmdf = !t));
                  if (this.o.length)
                    for (
                      r = this.prop.v.length, e = this.data.p * 4;
                      e < r;
                      e += 1
                    )
                      (i = e % 2 === 0 ? 100 : 1),
                        (s =
                          e % 2 === 0
                            ? Math.round(this.prop.v[e] * 100)
                            : this.prop.v[e]),
                        this.o[e - this.data.p * 4] !== s &&
                          ((this.o[e - this.data.p * 4] = s),
                          (this._omdf = !t));
                  this._mdf = !t;
                }
              }),
              extendPrototype([DynamicPropertyContainer], GradientProperty);
            function SVGGradientFillStyleData(t, e, r) {
              this.initDynamicPropertyContainer(t),
                (this.getValue = this.iterateDynamicProperties),
                this.initGradientData(t, e, r);
            }
            (SVGGradientFillStyleData.prototype.initGradientData = function (
              t,
              e,
              r
            ) {
              (this.o = PropertyFactory.getProp(t, e.o, 0, 0.01, this)),
                (this.s = PropertyFactory.getProp(t, e.s, 1, null, this)),
                (this.e = PropertyFactory.getProp(t, e.e, 1, null, this)),
                (this.h = PropertyFactory.getProp(
                  t,
                  e.h || { k: 0 },
                  0,
                  0.01,
                  this
                )),
                (this.a = PropertyFactory.getProp(
                  t,
                  e.a || { k: 0 },
                  0,
                  degToRads,
                  this
                )),
                (this.g = new GradientProperty(t, e.g, this)),
                (this.style = r),
                (this.stops = []),
                this.setGradientData(r.pElem, e),
                this.setGradientOpacity(e, r),
                (this._isAnimated = !!this._isAnimated);
            }),
              (SVGGradientFillStyleData.prototype.setGradientData = function (
                t,
                e
              ) {
                var r = createElementID(),
                  i = createNS(e.t === 1 ? "linearGradient" : "radialGradient");
                i.setAttribute("id", r),
                  i.setAttribute("spreadMethod", "pad"),
                  i.setAttribute("gradientUnits", "userSpaceOnUse");
                var s = [],
                  n,
                  a,
                  h;
                for (h = e.g.p * 4, a = 0; a < h; a += 4)
                  (n = createNS("stop")), i.appendChild(n), s.push(n);
                t.setAttribute(
                  e.ty === "gf" ? "fill" : "stroke",
                  "url(" + getLocationHref() + "#" + r + ")"
                ),
                  (this.gf = i),
                  (this.cst = s);
              }),
              (SVGGradientFillStyleData.prototype.setGradientOpacity =
                function (t, e) {
                  if (this.g._hasOpacity && !this.g._collapsable) {
                    var r,
                      i,
                      s,
                      n = createNS("mask"),
                      a = createNS("path");
                    n.appendChild(a);
                    var h = createElementID(),
                      o = createElementID();
                    n.setAttribute("id", o);
                    var f = createNS(
                      t.t === 1 ? "linearGradient" : "radialGradient"
                    );
                    f.setAttribute("id", h),
                      f.setAttribute("spreadMethod", "pad"),
                      f.setAttribute("gradientUnits", "userSpaceOnUse"),
                      (s = t.g.k.k[0].s ? t.g.k.k[0].s.length : t.g.k.k.length);
                    var d = this.stops;
                    for (i = t.g.p * 4; i < s; i += 2)
                      (r = createNS("stop")),
                        r.setAttribute("stop-color", "rgb(255,255,255)"),
                        f.appendChild(r),
                        d.push(r);
                    a.setAttribute(
                      t.ty === "gf" ? "fill" : "stroke",
                      "url(" + getLocationHref() + "#" + h + ")"
                    ),
                      t.ty === "gs" &&
                        (a.setAttribute(
                          "stroke-linecap",
                          lineCapEnum[t.lc || 2]
                        ),
                        a.setAttribute(
                          "stroke-linejoin",
                          lineJoinEnum[t.lj || 2]
                        ),
                        t.lj === 1 &&
                          a.setAttribute("stroke-miterlimit", t.ml)),
                      (this.of = f),
                      (this.ms = n),
                      (this.ost = d),
                      (this.maskId = o),
                      (e.msElem = a);
                  }
                }),
              extendPrototype(
                [DynamicPropertyContainer],
                SVGGradientFillStyleData
              );
            function SVGGradientStrokeStyleData(t, e, r) {
              this.initDynamicPropertyContainer(t),
                (this.getValue = this.iterateDynamicProperties),
                (this.w = PropertyFactory.getProp(t, e.w, 0, null, this)),
                (this.d = new DashProperty(t, e.d || {}, "svg", this)),
                this.initGradientData(t, e, r),
                (this._isAnimated = !!this._isAnimated);
            }
            extendPrototype(
              [SVGGradientFillStyleData, DynamicPropertyContainer],
              SVGGradientStrokeStyleData
            );
            function ShapeGroupData() {
              (this.it = []),
                (this.prevViewData = []),
                (this.gr = createNS("g"));
            }
            function SVGTransformData(t, e, r) {
              (this.transform = { mProps: t, op: e, container: r }),
                (this.elements = []),
                (this._isAnimated =
                  this.transform.mProps.dynamicProperties.length ||
                  this.transform.op.effectsSequence.length);
            }
            var buildShapeString = function (e, r, i, s) {
                if (r === 0) return "";
                var n = e.o,
                  a = e.i,
                  h = e.v,
                  o,
                  f = " M" + s.applyToPointStringified(h[0][0], h[0][1]);
                for (o = 1; o < r; o += 1)
                  f +=
                    " C" +
                    s.applyToPointStringified(n[o - 1][0], n[o - 1][1]) +
                    " " +
                    s.applyToPointStringified(a[o][0], a[o][1]) +
                    " " +
                    s.applyToPointStringified(h[o][0], h[o][1]);
                return (
                  i &&
                    r &&
                    ((f +=
                      " C" +
                      s.applyToPointStringified(n[o - 1][0], n[o - 1][1]) +
                      " " +
                      s.applyToPointStringified(a[0][0], a[0][1]) +
                      " " +
                      s.applyToPointStringified(h[0][0], h[0][1])),
                    (f += "z")),
                  f
                );
              },
              SVGElementsRenderer = (function () {
                var t = new Matrix(),
                  e = new Matrix(),
                  r = { createRenderFunction: i };
                function i(P) {
                  switch (P.ty) {
                    case "fl":
                      return h;
                    case "gf":
                      return f;
                    case "gs":
                      return o;
                    case "st":
                      return d;
                    case "sh":
                    case "el":
                    case "rc":
                    case "sr":
                      return a;
                    case "tr":
                      return s;
                    case "no":
                      return n;
                    default:
                      return null;
                  }
                }
                function s(P, c, b) {
                  (b || c.transform.op._mdf) &&
                    c.transform.container.setAttribute(
                      "opacity",
                      c.transform.op.v
                    ),
                    (b || c.transform.mProps._mdf) &&
                      c.transform.container.setAttribute(
                        "transform",
                        c.transform.mProps.v.to2dCSS()
                      );
                }
                function n() {}
                function a(P, c, b) {
                  var v,
                    m,
                    C,
                    p,
                    u,
                    l,
                    y = c.styles.length,
                    E = c.lvl,
                    x,
                    A,
                    F,
                    w;
                  for (l = 0; l < y; l += 1) {
                    if (((p = c.sh._mdf || b), c.styles[l].lvl < E)) {
                      for (
                        A = e.reset(),
                          F = E - c.styles[l].lvl,
                          w = c.transformers.length - 1;
                        !p && F > 0;

                      )
                        (p = c.transformers[w].mProps._mdf || p),
                          (F -= 1),
                          (w -= 1);
                      if (p)
                        for (
                          F = E - c.styles[l].lvl,
                            w = c.transformers.length - 1;
                          F > 0;

                        )
                          A.multiply(c.transformers[w].mProps.v),
                            (F -= 1),
                            (w -= 1);
                    } else A = t;
                    if (((x = c.sh.paths), (m = x._length), p)) {
                      for (C = "", v = 0; v < m; v += 1)
                        (u = x.shapes[v]),
                          u &&
                            u._length &&
                            (C += buildShapeString(u, u._length, u.c, A));
                      c.caches[l] = C;
                    } else C = c.caches[l];
                    (c.styles[l].d += P.hd === !0 ? "" : C),
                      (c.styles[l]._mdf = p || c.styles[l]._mdf);
                  }
                }
                function h(P, c, b) {
                  var v = c.style;
                  (c.c._mdf || b) &&
                    v.pElem.setAttribute(
                      "fill",
                      "rgb(" +
                        bmFloor(c.c.v[0]) +
                        "," +
                        bmFloor(c.c.v[1]) +
                        "," +
                        bmFloor(c.c.v[2]) +
                        ")"
                    ),
                    (c.o._mdf || b) &&
                      v.pElem.setAttribute("fill-opacity", c.o.v);
                }
                function o(P, c, b) {
                  f(P, c, b), d(P, c, b);
                }
                function f(P, c, b) {
                  var v = c.gf,
                    m = c.g._hasOpacity,
                    C = c.s.v,
                    p = c.e.v;
                  if (c.o._mdf || b) {
                    var u = P.ty === "gf" ? "fill-opacity" : "stroke-opacity";
                    c.style.pElem.setAttribute(u, c.o.v);
                  }
                  if (c.s._mdf || b) {
                    var l = P.t === 1 ? "x1" : "cx",
                      y = l === "x1" ? "y1" : "cy";
                    v.setAttribute(l, C[0]),
                      v.setAttribute(y, C[1]),
                      m &&
                        !c.g._collapsable &&
                        (c.of.setAttribute(l, C[0]),
                        c.of.setAttribute(y, C[1]));
                  }
                  var E, x, A, F;
                  if (c.g._cmdf || b) {
                    E = c.cst;
                    var w = c.g.c;
                    for (A = E.length, x = 0; x < A; x += 1)
                      (F = E[x]),
                        F.setAttribute("offset", w[x * 4] + "%"),
                        F.setAttribute(
                          "stop-color",
                          "rgb(" +
                            w[x * 4 + 1] +
                            "," +
                            w[x * 4 + 2] +
                            "," +
                            w[x * 4 + 3] +
                            ")"
                        );
                  }
                  if (m && (c.g._omdf || b)) {
                    var z = c.g.o;
                    for (
                      c.g._collapsable ? (E = c.cst) : (E = c.ost),
                        A = E.length,
                        x = 0;
                      x < A;
                      x += 1
                    )
                      (F = E[x]),
                        c.g._collapsable ||
                          F.setAttribute("offset", z[x * 2] + "%"),
                        F.setAttribute("stop-opacity", z[x * 2 + 1]);
                  }
                  if (P.t === 1)
                    (c.e._mdf || b) &&
                      (v.setAttribute("x2", p[0]),
                      v.setAttribute("y2", p[1]),
                      m &&
                        !c.g._collapsable &&
                        (c.of.setAttribute("x2", p[0]),
                        c.of.setAttribute("y2", p[1])));
                  else {
                    var R;
                    if (
                      ((c.s._mdf || c.e._mdf || b) &&
                        ((R = Math.sqrt(
                          Math.pow(C[0] - p[0], 2) + Math.pow(C[1] - p[1], 2)
                        )),
                        v.setAttribute("r", R),
                        m && !c.g._collapsable && c.of.setAttribute("r", R)),
                      c.e._mdf || c.h._mdf || c.a._mdf || b)
                    ) {
                      R ||
                        (R = Math.sqrt(
                          Math.pow(C[0] - p[0], 2) + Math.pow(C[1] - p[1], 2)
                        ));
                      var L = Math.atan2(p[1] - C[1], p[0] - C[0]),
                        O = c.h.v;
                      O >= 1 ? (O = 0.99) : O <= -1 && (O = -0.99);
                      var G = R * O,
                        I = Math.cos(L + c.a.v) * G + C[0],
                        _ = Math.sin(L + c.a.v) * G + C[1];
                      v.setAttribute("fx", I),
                        v.setAttribute("fy", _),
                        m &&
                          !c.g._collapsable &&
                          (c.of.setAttribute("fx", I),
                          c.of.setAttribute("fy", _));
                    }
                  }
                }
                function d(P, c, b) {
                  var v = c.style,
                    m = c.d;
                  m &&
                    (m._mdf || b) &&
                    m.dashStr &&
                    (v.pElem.setAttribute("stroke-dasharray", m.dashStr),
                    v.pElem.setAttribute("stroke-dashoffset", m.dashoffset[0])),
                    c.c &&
                      (c.c._mdf || b) &&
                      v.pElem.setAttribute(
                        "stroke",
                        "rgb(" +
                          bmFloor(c.c.v[0]) +
                          "," +
                          bmFloor(c.c.v[1]) +
                          "," +
                          bmFloor(c.c.v[2]) +
                          ")"
                      ),
                    (c.o._mdf || b) &&
                      v.pElem.setAttribute("stroke-opacity", c.o.v),
                    (c.w._mdf || b) &&
                      (v.pElem.setAttribute("stroke-width", c.w.v),
                      v.msElem && v.msElem.setAttribute("stroke-width", c.w.v));
                }
                return r;
              })();
            function SVGShapeElement(t, e, r) {
              (this.shapes = []),
                (this.shapesData = t.shapes),
                (this.stylesList = []),
                (this.shapeModifiers = []),
                (this.itemsData = []),
                (this.processedElements = []),
                (this.animatedContents = []),
                this.initElement(t, e, r),
                (this.prevViewData = []);
            }
            extendPrototype(
              [
                BaseElement,
                TransformElement,
                SVGBaseElement,
                IShapeElement,
                HierarchyElement,
                FrameElement,
                RenderableDOMElement,
              ],
              SVGShapeElement
            ),
              (SVGShapeElement.prototype.initSecondaryElement = function () {}),
              (SVGShapeElement.prototype.identityMatrix = new Matrix()),
              (SVGShapeElement.prototype.buildExpressionInterface =
                function () {}),
              (SVGShapeElement.prototype.createContent = function () {
                this.searchShapes(
                  this.shapesData,
                  this.itemsData,
                  this.prevViewData,
                  this.layerElement,
                  0,
                  [],
                  !0
                ),
                  this.filterUniqueShapes();
              }),
              (SVGShapeElement.prototype.filterUniqueShapes = function () {
                var t,
                  e = this.shapes.length,
                  r,
                  i,
                  s = this.stylesList.length,
                  n,
                  a = [],
                  h = !1;
                for (i = 0; i < s; i += 1) {
                  for (
                    n = this.stylesList[i], h = !1, a.length = 0, t = 0;
                    t < e;
                    t += 1
                  )
                    (r = this.shapes[t]),
                      r.styles.indexOf(n) !== -1 &&
                        (a.push(r), (h = r._isAnimated || h));
                  a.length > 1 && h && this.setShapesAsAnimated(a);
                }
              }),
              (SVGShapeElement.prototype.setShapesAsAnimated = function (t) {
                var e,
                  r = t.length;
                for (e = 0; e < r; e += 1) t[e].setAsAnimated();
              }),
              (SVGShapeElement.prototype.createStyleElement = function (t, e) {
                var r,
                  i = new SVGStyleData(t, e),
                  s = i.pElem;
                if (t.ty === "st") r = new SVGStrokeStyleData(this, t, i);
                else if (t.ty === "fl") r = new SVGFillStyleData(this, t, i);
                else if (t.ty === "gf" || t.ty === "gs") {
                  var n =
                    t.ty === "gf"
                      ? SVGGradientFillStyleData
                      : SVGGradientStrokeStyleData;
                  (r = new n(this, t, i)),
                    this.globalData.defs.appendChild(r.gf),
                    r.maskId &&
                      (this.globalData.defs.appendChild(r.ms),
                      this.globalData.defs.appendChild(r.of),
                      s.setAttribute(
                        "mask",
                        "url(" + getLocationHref() + "#" + r.maskId + ")"
                      ));
                } else t.ty === "no" && (r = new SVGNoStyleData(this, t, i));
                return (
                  (t.ty === "st" || t.ty === "gs") &&
                    (s.setAttribute("stroke-linecap", lineCapEnum[t.lc || 2]),
                    s.setAttribute("stroke-linejoin", lineJoinEnum[t.lj || 2]),
                    s.setAttribute("fill-opacity", "0"),
                    t.lj === 1 && s.setAttribute("stroke-miterlimit", t.ml)),
                  t.r === 2 && s.setAttribute("fill-rule", "evenodd"),
                  t.ln && s.setAttribute("id", t.ln),
                  t.cl && s.setAttribute("class", t.cl),
                  t.bm && (s.style["mix-blend-mode"] = getBlendMode(t.bm)),
                  this.stylesList.push(i),
                  this.addToAnimatedContents(t, r),
                  r
                );
              }),
              (SVGShapeElement.prototype.createGroupElement = function (t) {
                var e = new ShapeGroupData();
                return (
                  t.ln && e.gr.setAttribute("id", t.ln),
                  t.cl && e.gr.setAttribute("class", t.cl),
                  t.bm && (e.gr.style["mix-blend-mode"] = getBlendMode(t.bm)),
                  e
                );
              }),
              (SVGShapeElement.prototype.createTransformElement = function (
                t,
                e
              ) {
                var r = TransformPropertyFactory.getTransformProperty(
                    this,
                    t,
                    this
                  ),
                  i = new SVGTransformData(r, r.o, e);
                return this.addToAnimatedContents(t, i), i;
              }),
              (SVGShapeElement.prototype.createShapeElement = function (
                t,
                e,
                r
              ) {
                var i = 4;
                t.ty === "rc"
                  ? (i = 5)
                  : t.ty === "el"
                  ? (i = 6)
                  : t.ty === "sr" && (i = 7);
                var s = ShapePropertyFactory.getShapeProp(this, t, i, this),
                  n = new SVGShapeData(e, r, s);
                return (
                  this.shapes.push(n),
                  this.addShapeToModifiers(n),
                  this.addToAnimatedContents(t, n),
                  n
                );
              }),
              (SVGShapeElement.prototype.addToAnimatedContents = function (
                t,
                e
              ) {
                for (var r = 0, i = this.animatedContents.length; r < i; ) {
                  if (this.animatedContents[r].element === e) return;
                  r += 1;
                }
                this.animatedContents.push({
                  fn: SVGElementsRenderer.createRenderFunction(t),
                  element: e,
                  data: t,
                });
              }),
              (SVGShapeElement.prototype.setElementStyles = function (t) {
                var e = t.styles,
                  r,
                  i = this.stylesList.length;
                for (r = 0; r < i; r += 1)
                  this.stylesList[r].closed || e.push(this.stylesList[r]);
              }),
              (SVGShapeElement.prototype.reloadShapes = function () {
                this._isFirstFrame = !0;
                var t,
                  e = this.itemsData.length;
                for (t = 0; t < e; t += 1)
                  this.prevViewData[t] = this.itemsData[t];
                for (
                  this.searchShapes(
                    this.shapesData,
                    this.itemsData,
                    this.prevViewData,
                    this.layerElement,
                    0,
                    [],
                    !0
                  ),
                    this.filterUniqueShapes(),
                    e = this.dynamicProperties.length,
                    t = 0;
                  t < e;
                  t += 1
                )
                  this.dynamicProperties[t].getValue();
                this.renderModifiers();
              }),
              (SVGShapeElement.prototype.searchShapes = function (
                t,
                e,
                r,
                i,
                s,
                n,
                a
              ) {
                var h = [].concat(n),
                  o,
                  f = t.length - 1,
                  d,
                  P,
                  c = [],
                  b = [],
                  v,
                  m,
                  C;
                for (o = f; o >= 0; o -= 1) {
                  if (
                    ((C = this.searchProcessedElement(t[o])),
                    C ? (e[o] = r[C - 1]) : (t[o]._render = a),
                    t[o].ty === "fl" ||
                      t[o].ty === "st" ||
                      t[o].ty === "gf" ||
                      t[o].ty === "gs" ||
                      t[o].ty === "no")
                  )
                    C
                      ? (e[o].style.closed = !1)
                      : (e[o] = this.createStyleElement(t[o], s)),
                      t[o]._render &&
                        e[o].style.pElem.parentNode !== i &&
                        i.appendChild(e[o].style.pElem),
                      c.push(e[o].style);
                  else if (t[o].ty === "gr") {
                    if (!C) e[o] = this.createGroupElement(t[o]);
                    else
                      for (P = e[o].it.length, d = 0; d < P; d += 1)
                        e[o].prevViewData[d] = e[o].it[d];
                    this.searchShapes(
                      t[o].it,
                      e[o].it,
                      e[o].prevViewData,
                      e[o].gr,
                      s + 1,
                      h,
                      a
                    ),
                      t[o]._render &&
                        e[o].gr.parentNode !== i &&
                        i.appendChild(e[o].gr);
                  } else
                    t[o].ty === "tr"
                      ? (C || (e[o] = this.createTransformElement(t[o], i)),
                        (v = e[o].transform),
                        h.push(v))
                      : t[o].ty === "sh" ||
                        t[o].ty === "rc" ||
                        t[o].ty === "el" ||
                        t[o].ty === "sr"
                      ? (C || (e[o] = this.createShapeElement(t[o], h, s)),
                        this.setElementStyles(e[o]))
                      : t[o].ty === "tm" ||
                        t[o].ty === "rd" ||
                        t[o].ty === "ms" ||
                        t[o].ty === "pb" ||
                        t[o].ty === "zz" ||
                        t[o].ty === "op"
                      ? (C
                          ? ((m = e[o]), (m.closed = !1))
                          : ((m = ShapeModifiers.getModifier(t[o].ty)),
                            m.init(this, t[o]),
                            (e[o] = m),
                            this.shapeModifiers.push(m)),
                        b.push(m))
                      : t[o].ty === "rp" &&
                        (C
                          ? ((m = e[o]), (m.closed = !0))
                          : ((m = ShapeModifiers.getModifier(t[o].ty)),
                            (e[o] = m),
                            m.init(this, t, o, e),
                            this.shapeModifiers.push(m),
                            (a = !1)),
                        b.push(m));
                  this.addProcessedElement(t[o], o + 1);
                }
                for (f = c.length, o = 0; o < f; o += 1) c[o].closed = !0;
                for (f = b.length, o = 0; o < f; o += 1) b[o].closed = !0;
              }),
              (SVGShapeElement.prototype.renderInnerContent = function () {
                this.renderModifiers();
                var t,
                  e = this.stylesList.length;
                for (t = 0; t < e; t += 1) this.stylesList[t].reset();
                for (this.renderShape(), t = 0; t < e; t += 1)
                  (this.stylesList[t]._mdf || this._isFirstFrame) &&
                    (this.stylesList[t].msElem &&
                      (this.stylesList[t].msElem.setAttribute(
                        "d",
                        this.stylesList[t].d
                      ),
                      (this.stylesList[t].d = "M0 0" + this.stylesList[t].d)),
                    this.stylesList[t].pElem.setAttribute(
                      "d",
                      this.stylesList[t].d || "M0 0"
                    ));
              }),
              (SVGShapeElement.prototype.renderShape = function () {
                var t,
                  e = this.animatedContents.length,
                  r;
                for (t = 0; t < e; t += 1)
                  (r = this.animatedContents[t]),
                    (this._isFirstFrame || r.element._isAnimated) &&
                      r.data !== !0 &&
                      r.fn(r.data, r.element, this._isFirstFrame);
              }),
              (SVGShapeElement.prototype.destroy = function () {
                this.destroyBaseElement(),
                  (this.shapesData = null),
                  (this.itemsData = null);
              });
            function LetterProps(t, e, r, i, s, n) {
              (this.o = t),
                (this.sw = e),
                (this.sc = r),
                (this.fc = i),
                (this.m = s),
                (this.p = n),
                (this._mdf = {
                  o: !0,
                  sw: !!e,
                  sc: !!r,
                  fc: !!i,
                  m: !0,
                  p: !0,
                });
            }
            LetterProps.prototype.update = function (t, e, r, i, s, n) {
              (this._mdf.o = !1),
                (this._mdf.sw = !1),
                (this._mdf.sc = !1),
                (this._mdf.fc = !1),
                (this._mdf.m = !1),
                (this._mdf.p = !1);
              var a = !1;
              return (
                this.o !== t && ((this.o = t), (this._mdf.o = !0), (a = !0)),
                this.sw !== e && ((this.sw = e), (this._mdf.sw = !0), (a = !0)),
                this.sc !== r && ((this.sc = r), (this._mdf.sc = !0), (a = !0)),
                this.fc !== i && ((this.fc = i), (this._mdf.fc = !0), (a = !0)),
                this.m !== s && ((this.m = s), (this._mdf.m = !0), (a = !0)),
                n.length &&
                  (this.p[0] !== n[0] ||
                    this.p[1] !== n[1] ||
                    this.p[4] !== n[4] ||
                    this.p[5] !== n[5] ||
                    this.p[12] !== n[12] ||
                    this.p[13] !== n[13]) &&
                  ((this.p = n), (this._mdf.p = !0), (a = !0)),
                a
              );
            };
            function TextProperty(t, e) {
              (this._frameId = initialDefaultFrame),
                (this.pv = ""),
                (this.v = ""),
                (this.kf = !1),
                (this._isFirstFrame = !0),
                (this._mdf = !1),
                e.d && e.d.sid && (e.d = t.globalData.slotManager.getProp(e.d)),
                (this.data = e),
                (this.elem = t),
                (this.comp = this.elem.comp),
                (this.keysIndex = 0),
                (this.canResize = !1),
                (this.minimumFontSize = 1),
                (this.effectsSequence = []),
                (this.currentData = {
                  ascent: 0,
                  boxWidth: this.defaultBoxWidth,
                  f: "",
                  fStyle: "",
                  fWeight: "",
                  fc: "",
                  j: "",
                  justifyOffset: "",
                  l: [],
                  lh: 0,
                  lineWidths: [],
                  ls: "",
                  of: "",
                  s: "",
                  sc: "",
                  sw: 0,
                  t: 0,
                  tr: 0,
                  sz: 0,
                  ps: null,
                  fillColorAnim: !1,
                  strokeColorAnim: !1,
                  strokeWidthAnim: !1,
                  yOffset: 0,
                  finalSize: 0,
                  finalText: [],
                  finalLineHeight: 0,
                  __complete: !1,
                }),
                this.copyData(this.currentData, this.data.d.k[0].s),
                this.searchProperty() ||
                  this.completeTextData(this.currentData);
            }
            (TextProperty.prototype.defaultBoxWidth = [0, 0]),
              (TextProperty.prototype.copyData = function (t, e) {
                for (var r in e)
                  Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
                return t;
              }),
              (TextProperty.prototype.setCurrentData = function (t) {
                t.__complete || this.completeTextData(t),
                  (this.currentData = t),
                  (this.currentData.boxWidth =
                    this.currentData.boxWidth || this.defaultBoxWidth),
                  (this._mdf = !0);
              }),
              (TextProperty.prototype.searchProperty = function () {
                return this.searchKeyframes();
              }),
              (TextProperty.prototype.searchKeyframes = function () {
                return (
                  (this.kf = this.data.d.k.length > 1),
                  this.kf && this.addEffect(this.getKeyframeValue.bind(this)),
                  this.kf
                );
              }),
              (TextProperty.prototype.addEffect = function (t) {
                this.effectsSequence.push(t),
                  this.elem.addDynamicProperty(this);
              }),
              (TextProperty.prototype.getValue = function (t) {
                if (
                  !(
                    (this.elem.globalData.frameId === this.frameId ||
                      !this.effectsSequence.length) &&
                    !t
                  )
                ) {
                  this.currentData.t = this.data.d.k[this.keysIndex].s.t;
                  var e = this.currentData,
                    r = this.keysIndex;
                  if (this.lock) {
                    this.setCurrentData(this.currentData);
                    return;
                  }
                  (this.lock = !0), (this._mdf = !1);
                  var i,
                    s = this.effectsSequence.length,
                    n = t || this.data.d.k[this.keysIndex].s;
                  for (i = 0; i < s; i += 1)
                    r !== this.keysIndex
                      ? (n = this.effectsSequence[i](n, n.t))
                      : (n = this.effectsSequence[i](this.currentData, n.t));
                  e !== n && this.setCurrentData(n),
                    (this.v = this.currentData),
                    (this.pv = this.v),
                    (this.lock = !1),
                    (this.frameId = this.elem.globalData.frameId);
                }
              }),
              (TextProperty.prototype.getKeyframeValue = function () {
                for (
                  var t = this.data.d.k,
                    e = this.elem.comp.renderedFrame,
                    r = 0,
                    i = t.length;
                  r <= i - 1 && !(r === i - 1 || t[r + 1].t > e);

                )
                  r += 1;
                return (
                  this.keysIndex !== r && (this.keysIndex = r),
                  this.data.d.k[this.keysIndex].s
                );
              }),
              (TextProperty.prototype.buildFinalText = function (t) {
                for (
                  var e = [], r = 0, i = t.length, s, n, a = !1, h = !1, o = "";
                  r < i;

                )
                  (a = h),
                    (h = !1),
                    (s = t.charCodeAt(r)),
                    (o = t.charAt(r)),
                    FontManager.isCombinedCharacter(s)
                      ? (a = !0)
                      : s >= 55296 && s <= 56319
                      ? FontManager.isRegionalFlag(t, r)
                        ? (o = t.substr(r, 14))
                        : ((n = t.charCodeAt(r + 1)),
                          n >= 56320 &&
                            n <= 57343 &&
                            (FontManager.isModifier(s, n)
                              ? ((o = t.substr(r, 2)), (a = !0))
                              : FontManager.isFlagEmoji(t.substr(r, 4))
                              ? (o = t.substr(r, 4))
                              : (o = t.substr(r, 2))))
                      : s > 56319
                      ? ((n = t.charCodeAt(r + 1)),
                        FontManager.isVariationSelector(s) && (a = !0))
                      : FontManager.isZeroWidthJoiner(s) &&
                        ((a = !0), (h = !0)),
                    a ? ((e[e.length - 1] += o), (a = !1)) : e.push(o),
                    (r += o.length);
                return e;
              }),
              (TextProperty.prototype.completeTextData = function (t) {
                t.__complete = !0;
                var e = this.elem.globalData.fontManager,
                  r = this.data,
                  i = [],
                  s,
                  n,
                  a,
                  h = 0,
                  o,
                  f = r.m.g,
                  d = 0,
                  P = 0,
                  c = 0,
                  b = [],
                  v = 0,
                  m = 0,
                  C,
                  p,
                  u = e.getFontByName(t.f),
                  l,
                  y = 0,
                  E = getFontProperties(u);
                (t.fWeight = E.weight),
                  (t.fStyle = E.style),
                  (t.finalSize = t.s),
                  (t.finalText = this.buildFinalText(t.t)),
                  (n = t.finalText.length),
                  (t.finalLineHeight = t.lh);
                var x = (t.tr / 1e3) * t.finalSize,
                  A;
                if (t.sz)
                  for (var F = !0, w = t.sz[0], z = t.sz[1], R, L; F; ) {
                    (L = this.buildFinalText(t.t)),
                      (R = 0),
                      (v = 0),
                      (n = L.length),
                      (x = (t.tr / 1e3) * t.finalSize);
                    var O = -1;
                    for (s = 0; s < n; s += 1)
                      (A = L[s].charCodeAt(0)),
                        (a = !1),
                        L[s] === " "
                          ? (O = s)
                          : (A === 13 || A === 3) &&
                            ((v = 0),
                            (a = !0),
                            (R += t.finalLineHeight || t.finalSize * 1.2)),
                        e.chars
                          ? ((l = e.getCharData(L[s], u.fStyle, u.fFamily)),
                            (y = a ? 0 : (l.w * t.finalSize) / 100))
                          : (y = e.measureText(L[s], t.f, t.finalSize)),
                        v + y > w && L[s] !== " "
                          ? (O === -1 ? (n += 1) : (s = O),
                            (R += t.finalLineHeight || t.finalSize * 1.2),
                            L.splice(s, O === s ? 1 : 0, "\r"),
                            (O = -1),
                            (v = 0))
                          : ((v += y), (v += x));
                    (R += (u.ascent * t.finalSize) / 100),
                      this.canResize &&
                      t.finalSize > this.minimumFontSize &&
                      z < R
                        ? ((t.finalSize -= 1),
                          (t.finalLineHeight = (t.finalSize * t.lh) / t.s))
                        : ((t.finalText = L),
                          (n = t.finalText.length),
                          (F = !1));
                  }
                (v = -x), (y = 0);
                var G = 0,
                  I;
                for (s = 0; s < n; s += 1)
                  if (
                    ((a = !1),
                    (I = t.finalText[s]),
                    (A = I.charCodeAt(0)),
                    A === 13 || A === 3
                      ? ((G = 0),
                        b.push(v),
                        (m = v > m ? v : m),
                        (v = -2 * x),
                        (o = ""),
                        (a = !0),
                        (c += 1))
                      : (o = I),
                    e.chars
                      ? ((l = e.getCharData(
                          I,
                          u.fStyle,
                          e.getFontByName(t.f).fFamily
                        )),
                        (y = a ? 0 : (l.w * t.finalSize) / 100))
                      : (y = e.measureText(o, t.f, t.finalSize)),
                    I === " " ? (G += y + x) : ((v += y + x + G), (G = 0)),
                    i.push({
                      l: y,
                      an: y,
                      add: d,
                      n: a,
                      anIndexes: [],
                      val: o,
                      line: c,
                      animatorJustifyOffset: 0,
                    }),
                    f == 2)
                  ) {
                    if (((d += y), o === "" || o === " " || s === n - 1)) {
                      for ((o === "" || o === " ") && (d -= y); P <= s; )
                        (i[P].an = d),
                          (i[P].ind = h),
                          (i[P].extra = y),
                          (P += 1);
                      (h += 1), (d = 0);
                    }
                  } else if (f == 3) {
                    if (((d += y), o === "" || s === n - 1)) {
                      for (o === "" && (d -= y); P <= s; )
                        (i[P].an = d),
                          (i[P].ind = h),
                          (i[P].extra = y),
                          (P += 1);
                      (d = 0), (h += 1);
                    }
                  } else (i[h].ind = h), (i[h].extra = 0), (h += 1);
                if (((t.l = i), (m = v > m ? v : m), b.push(v), t.sz))
                  (t.boxWidth = t.sz[0]), (t.justifyOffset = 0);
                else
                  switch (((t.boxWidth = m), t.j)) {
                    case 1:
                      t.justifyOffset = -t.boxWidth;
                      break;
                    case 2:
                      t.justifyOffset = -t.boxWidth / 2;
                      break;
                    default:
                      t.justifyOffset = 0;
                  }
                t.lineWidths = b;
                var _ = r.a,
                  T,
                  g;
                p = _.length;
                var S,
                  k,
                  M = [];
                for (C = 0; C < p; C += 1) {
                  for (
                    T = _[C],
                      T.a.sc && (t.strokeColorAnim = !0),
                      T.a.sw && (t.strokeWidthAnim = !0),
                      (T.a.fc || T.a.fh || T.a.fs || T.a.fb) &&
                        (t.fillColorAnim = !0),
                      k = 0,
                      S = T.s.b,
                      s = 0;
                    s < n;
                    s += 1
                  )
                    (g = i[s]),
                      (g.anIndexes[C] = k),
                      ((S == 1 && g.val !== "") ||
                        (S == 2 && g.val !== "" && g.val !== " ") ||
                        (S == 3 && (g.n || g.val == " " || s == n - 1)) ||
                        (S == 4 && (g.n || s == n - 1))) &&
                        (T.s.rn === 1 && M.push(k), (k += 1));
                  r.a[C].s.totalChars = k;
                  var V = -1,
                    D;
                  if (T.s.rn === 1)
                    for (s = 0; s < n; s += 1)
                      (g = i[s]),
                        V != g.anIndexes[C] &&
                          ((V = g.anIndexes[C]),
                          (D = M.splice(
                            Math.floor(Math.random() * M.length),
                            1
                          )[0])),
                        (g.anIndexes[C] = D);
                }
                (t.yOffset = t.finalLineHeight || t.finalSize * 1.2),
                  (t.ls = t.ls || 0),
                  (t.ascent = (u.ascent * t.finalSize) / 100);
              }),
              (TextProperty.prototype.updateDocumentData = function (t, e) {
                e = e === void 0 ? this.keysIndex : e;
                var r = this.copyData({}, this.data.d.k[e].s);
                (r = this.copyData(r, t)),
                  (this.data.d.k[e].s = r),
                  this.recalculate(e),
                  this.setCurrentData(r),
                  this.elem.addDynamicProperty(this);
              }),
              (TextProperty.prototype.recalculate = function (t) {
                var e = this.data.d.k[t].s;
                (e.__complete = !1),
                  (this.keysIndex = 0),
                  (this._isFirstFrame = !0),
                  this.getValue(e);
              }),
              (TextProperty.prototype.canResizeFont = function (t) {
                (this.canResize = t),
                  this.recalculate(this.keysIndex),
                  this.elem.addDynamicProperty(this);
              }),
              (TextProperty.prototype.setMinimumFontSize = function (t) {
                (this.minimumFontSize = Math.floor(t) || 1),
                  this.recalculate(this.keysIndex),
                  this.elem.addDynamicProperty(this);
              });
            var TextSelectorProp = (function () {
              var t = Math.max,
                e = Math.min,
                r = Math.floor;
              function i(n, a) {
                (this._currentTextLength = -1),
                  (this.k = !1),
                  (this.data = a),
                  (this.elem = n),
                  (this.comp = n.comp),
                  (this.finalS = 0),
                  (this.finalE = 0),
                  this.initDynamicPropertyContainer(n),
                  (this.s = PropertyFactory.getProp(
                    n,
                    a.s || { k: 0 },
                    0,
                    0,
                    this
                  )),
                  "e" in a
                    ? (this.e = PropertyFactory.getProp(n, a.e, 0, 0, this))
                    : (this.e = { v: 100 }),
                  (this.o = PropertyFactory.getProp(
                    n,
                    a.o || { k: 0 },
                    0,
                    0,
                    this
                  )),
                  (this.xe = PropertyFactory.getProp(
                    n,
                    a.xe || { k: 0 },
                    0,
                    0,
                    this
                  )),
                  (this.ne = PropertyFactory.getProp(
                    n,
                    a.ne || { k: 0 },
                    0,
                    0,
                    this
                  )),
                  (this.sm = PropertyFactory.getProp(
                    n,
                    a.sm || { k: 100 },
                    0,
                    0,
                    this
                  )),
                  (this.a = PropertyFactory.getProp(n, a.a, 0, 0.01, this)),
                  this.dynamicProperties.length || this.getValue();
              }
              (i.prototype = {
                getMult: function (a) {
                  this._currentTextLength !==
                    this.elem.textProperty.currentData.l.length &&
                    this.getValue();
                  var h = 0,
                    o = 0,
                    f = 1,
                    d = 1;
                  this.ne.v > 0
                    ? (h = this.ne.v / 100)
                    : (o = -this.ne.v / 100),
                    this.xe.v > 0
                      ? (f = 1 - this.xe.v / 100)
                      : (d = 1 + this.xe.v / 100);
                  var P = BezierFactory.getBezierEasing(h, o, f, d).get,
                    c = 0,
                    b = this.finalS,
                    v = this.finalE,
                    m = this.data.sh;
                  if (m === 2)
                    v === b
                      ? (c = a >= v ? 1 : 0)
                      : (c = t(0, e(0.5 / (v - b) + (a - b) / (v - b), 1))),
                      (c = P(c));
                  else if (m === 3)
                    v === b
                      ? (c = a >= v ? 0 : 1)
                      : (c = 1 - t(0, e(0.5 / (v - b) + (a - b) / (v - b), 1))),
                      (c = P(c));
                  else if (m === 4)
                    v === b
                      ? (c = 0)
                      : ((c = t(0, e(0.5 / (v - b) + (a - b) / (v - b), 1))),
                        c < 0.5 ? (c *= 2) : (c = 1 - 2 * (c - 0.5))),
                      (c = P(c));
                  else if (m === 5) {
                    if (v === b) c = 0;
                    else {
                      var C = v - b;
                      a = e(t(0, a + 0.5 - b), v - b);
                      var p = -C / 2 + a,
                        u = C / 2;
                      c = Math.sqrt(1 - (p * p) / (u * u));
                    }
                    c = P(c);
                  } else
                    m === 6
                      ? (v === b
                          ? (c = 0)
                          : ((a = e(t(0, a + 0.5 - b), v - b)),
                            (c =
                              (1 +
                                Math.cos(
                                  Math.PI + (Math.PI * 2 * a) / (v - b)
                                )) /
                              2)),
                        (c = P(c)))
                      : (a >= r(b) &&
                          (a - b < 0
                            ? (c = t(0, e(e(v, 1) - (b - a), 1)))
                            : (c = t(0, e(v - a, 1)))),
                        (c = P(c)));
                  if (this.sm.v !== 100) {
                    var l = this.sm.v * 0.01;
                    l === 0 && (l = 1e-8);
                    var y = 0.5 - l * 0.5;
                    c < y ? (c = 0) : ((c = (c - y) / l), c > 1 && (c = 1));
                  }
                  return c * this.a.v;
                },
                getValue: function (a) {
                  this.iterateDynamicProperties(),
                    (this._mdf = a || this._mdf),
                    (this._currentTextLength =
                      this.elem.textProperty.currentData.l.length || 0),
                    a &&
                      this.data.r === 2 &&
                      (this.e.v = this._currentTextLength);
                  var h = this.data.r === 2 ? 1 : 100 / this.data.totalChars,
                    o = this.o.v / h,
                    f = this.s.v / h + o,
                    d = this.e.v / h + o;
                  if (f > d) {
                    var P = f;
                    (f = d), (d = P);
                  }
                  (this.finalS = f), (this.finalE = d);
                },
              }),
                extendPrototype([DynamicPropertyContainer], i);
              function s(n, a, h) {
                return new i(n, a);
              }
              return { getTextSelectorProp: s };
            })();
            function TextAnimatorDataProperty(t, e, r) {
              var i = { propType: !1 },
                s = PropertyFactory.getProp,
                n = e.a;
              (this.a = {
                r: n.r ? s(t, n.r, 0, degToRads, r) : i,
                rx: n.rx ? s(t, n.rx, 0, degToRads, r) : i,
                ry: n.ry ? s(t, n.ry, 0, degToRads, r) : i,
                sk: n.sk ? s(t, n.sk, 0, degToRads, r) : i,
                sa: n.sa ? s(t, n.sa, 0, degToRads, r) : i,
                s: n.s ? s(t, n.s, 1, 0.01, r) : i,
                a: n.a ? s(t, n.a, 1, 0, r) : i,
                o: n.o ? s(t, n.o, 0, 0.01, r) : i,
                p: n.p ? s(t, n.p, 1, 0, r) : i,
                sw: n.sw ? s(t, n.sw, 0, 0, r) : i,
                sc: n.sc ? s(t, n.sc, 1, 0, r) : i,
                fc: n.fc ? s(t, n.fc, 1, 0, r) : i,
                fh: n.fh ? s(t, n.fh, 0, 0, r) : i,
                fs: n.fs ? s(t, n.fs, 0, 0.01, r) : i,
                fb: n.fb ? s(t, n.fb, 0, 0.01, r) : i,
                t: n.t ? s(t, n.t, 0, 0, r) : i,
              }),
                (this.s = TextSelectorProp.getTextSelectorProp(t, e.s, r)),
                (this.s.t = e.s.t);
            }
            function TextAnimatorProperty(t, e, r) {
              (this._isFirstFrame = !0),
                (this._hasMaskedPath = !1),
                (this._frameId = -1),
                (this._textData = t),
                (this._renderType = e),
                (this._elem = r),
                (this._animatorsData = createSizedArray(
                  this._textData.a.length
                )),
                (this._pathData = {}),
                (this._moreOptions = { alignment: {} }),
                (this.renderedLetters = []),
                (this.lettersChangedFlag = !1),
                this.initDynamicPropertyContainer(r);
            }
            (TextAnimatorProperty.prototype.searchProperties = function () {
              var t,
                e = this._textData.a.length,
                r,
                i = PropertyFactory.getProp;
              for (t = 0; t < e; t += 1)
                (r = this._textData.a[t]),
                  (this._animatorsData[t] = new TextAnimatorDataProperty(
                    this._elem,
                    r,
                    this
                  ));
              this._textData.p && "m" in this._textData.p
                ? ((this._pathData = {
                    a: i(this._elem, this._textData.p.a, 0, 0, this),
                    f: i(this._elem, this._textData.p.f, 0, 0, this),
                    l: i(this._elem, this._textData.p.l, 0, 0, this),
                    r: i(this._elem, this._textData.p.r, 0, 0, this),
                    p: i(this._elem, this._textData.p.p, 0, 0, this),
                    m: this._elem.maskManager.getMaskProperty(
                      this._textData.p.m
                    ),
                  }),
                  (this._hasMaskedPath = !0))
                : (this._hasMaskedPath = !1),
                (this._moreOptions.alignment = i(
                  this._elem,
                  this._textData.m.a,
                  1,
                  0,
                  this
                ));
            }),
              (TextAnimatorProperty.prototype.getMeasures = function (t, e) {
                if (
                  ((this.lettersChangedFlag = e),
                  !(
                    !this._mdf &&
                    !this._isFirstFrame &&
                    !e &&
                    (!this._hasMaskedPath || !this._pathData.m._mdf)
                  ))
                ) {
                  this._isFirstFrame = !1;
                  var r = this._moreOptions.alignment.v,
                    i = this._animatorsData,
                    s = this._textData,
                    n = this.mHelper,
                    a = this._renderType,
                    h = this.renderedLetters.length,
                    o,
                    f,
                    d,
                    P,
                    c = t.l,
                    b,
                    v,
                    m,
                    C,
                    p,
                    u,
                    l,
                    y,
                    E,
                    x,
                    A,
                    F,
                    w,
                    z,
                    R;
                  if (this._hasMaskedPath) {
                    if (
                      ((R = this._pathData.m),
                      !this._pathData.n || this._pathData._mdf)
                    ) {
                      var L = R.v;
                      this._pathData.r.v && (L = L.reverse()),
                        (b = { tLength: 0, segments: [] }),
                        (P = L._length - 1);
                      var O;
                      for (F = 0, d = 0; d < P; d += 1)
                        (O = bez.buildBezierData(
                          L.v[d],
                          L.v[d + 1],
                          [L.o[d][0] - L.v[d][0], L.o[d][1] - L.v[d][1]],
                          [
                            L.i[d + 1][0] - L.v[d + 1][0],
                            L.i[d + 1][1] - L.v[d + 1][1],
                          ]
                        )),
                          (b.tLength += O.segmentLength),
                          b.segments.push(O),
                          (F += O.segmentLength);
                      (d = P),
                        R.v.c &&
                          ((O = bez.buildBezierData(
                            L.v[d],
                            L.v[0],
                            [L.o[d][0] - L.v[d][0], L.o[d][1] - L.v[d][1]],
                            [L.i[0][0] - L.v[0][0], L.i[0][1] - L.v[0][1]]
                          )),
                          (b.tLength += O.segmentLength),
                          b.segments.push(O),
                          (F += O.segmentLength)),
                        (this._pathData.pi = b);
                    }
                    if (
                      ((b = this._pathData.pi),
                      (v = this._pathData.f.v),
                      (l = 0),
                      (u = 1),
                      (C = 0),
                      (p = !0),
                      (x = b.segments),
                      v < 0 && R.v.c)
                    )
                      for (
                        b.tLength < Math.abs(v) &&
                          (v = -Math.abs(v) % b.tLength),
                          l = x.length - 1,
                          E = x[l].points,
                          u = E.length - 1;
                        v < 0;

                      )
                        (v += E[u].partialLength),
                          (u -= 1),
                          u < 0 &&
                            ((l -= 1), (E = x[l].points), (u = E.length - 1));
                    (E = x[l].points),
                      (y = E[u - 1]),
                      (m = E[u]),
                      (A = m.partialLength);
                  }
                  (P = c.length), (o = 0), (f = 0);
                  var G = t.finalSize * 1.2 * 0.714,
                    I = !0,
                    _,
                    T,
                    g,
                    S,
                    k;
                  S = i.length;
                  var M,
                    V = -1,
                    D,
                    B,
                    H,
                    j = v,
                    q = l,
                    Y = u,
                    Q = -1,
                    X,
                    $,
                    Z,
                    W,
                    N,
                    et,
                    nt,
                    rt,
                    tt = "",
                    it = this.defaultPropsArray,
                    st;
                  if (t.j === 2 || t.j === 1) {
                    var K = 0,
                      at = 0,
                      ot = t.j === 2 ? -0.5 : -1,
                      J = 0,
                      ht = !0;
                    for (d = 0; d < P; d += 1)
                      if (c[d].n) {
                        for (K && (K += at); J < d; )
                          (c[J].animatorJustifyOffset = K), (J += 1);
                        (K = 0), (ht = !0);
                      } else {
                        for (g = 0; g < S; g += 1)
                          (_ = i[g].a),
                            _.t.propType &&
                              (ht && t.j === 2 && (at += _.t.v * ot),
                              (T = i[g].s),
                              (M = T.getMult(
                                c[d].anIndexes[g],
                                s.a[g].s.totalChars
                              )),
                              M.length
                                ? (K += _.t.v * M[0] * ot)
                                : (K += _.t.v * M * ot));
                        ht = !1;
                      }
                    for (K && (K += at); J < d; )
                      (c[J].animatorJustifyOffset = K), (J += 1);
                  }
                  for (d = 0; d < P; d += 1) {
                    if ((n.reset(), (X = 1), c[d].n))
                      (o = 0),
                        (f += t.yOffset),
                        (f += I ? 1 : 0),
                        (v = j),
                        (I = !1),
                        this._hasMaskedPath &&
                          ((l = q),
                          (u = Y),
                          (E = x[l].points),
                          (y = E[u - 1]),
                          (m = E[u]),
                          (A = m.partialLength),
                          (C = 0)),
                        (tt = ""),
                        (rt = ""),
                        (et = ""),
                        (st = ""),
                        (it = this.defaultPropsArray);
                    else {
                      if (this._hasMaskedPath) {
                        if (Q !== c[d].line) {
                          switch (t.j) {
                            case 1:
                              v += F - t.lineWidths[c[d].line];
                              break;
                            case 2:
                              v += (F - t.lineWidths[c[d].line]) / 2;
                              break;
                          }
                          Q = c[d].line;
                        }
                        V !== c[d].ind &&
                          (c[V] && (v += c[V].extra),
                          (v += c[d].an / 2),
                          (V = c[d].ind)),
                          (v += r[0] * c[d].an * 0.005);
                        var U = 0;
                        for (g = 0; g < S; g += 1)
                          (_ = i[g].a),
                            _.p.propType &&
                              ((T = i[g].s),
                              (M = T.getMult(
                                c[d].anIndexes[g],
                                s.a[g].s.totalChars
                              )),
                              M.length
                                ? (U += _.p.v[0] * M[0])
                                : (U += _.p.v[0] * M)),
                            _.a.propType &&
                              ((T = i[g].s),
                              (M = T.getMult(
                                c[d].anIndexes[g],
                                s.a[g].s.totalChars
                              )),
                              M.length
                                ? (U += _.a.v[0] * M[0])
                                : (U += _.a.v[0] * M));
                        for (
                          p = !0,
                            this._pathData.a.v &&
                              ((v =
                                c[0].an * 0.5 +
                                ((F -
                                  this._pathData.f.v -
                                  c[0].an * 0.5 -
                                  c[c.length - 1].an * 0.5) *
                                  V) /
                                  (P - 1)),
                              (v += this._pathData.f.v));
                          p;

                        )
                          C + A >= v + U || !E
                            ? ((w = (v + U - C) / m.partialLength),
                              (B = y.point[0] + (m.point[0] - y.point[0]) * w),
                              (H = y.point[1] + (m.point[1] - y.point[1]) * w),
                              n.translate(
                                -r[0] * c[d].an * 0.005,
                                -(r[1] * G) * 0.01
                              ),
                              (p = !1))
                            : E &&
                              ((C += m.partialLength),
                              (u += 1),
                              u >= E.length &&
                                ((u = 0),
                                (l += 1),
                                x[l]
                                  ? (E = x[l].points)
                                  : R.v.c
                                  ? ((u = 0), (l = 0), (E = x[l].points))
                                  : ((C -= m.partialLength), (E = null))),
                              E &&
                                ((y = m), (m = E[u]), (A = m.partialLength)));
                        (D = c[d].an / 2 - c[d].add), n.translate(-D, 0, 0);
                      } else
                        (D = c[d].an / 2 - c[d].add),
                          n.translate(-D, 0, 0),
                          n.translate(
                            -r[0] * c[d].an * 0.005,
                            -r[1] * G * 0.01,
                            0
                          );
                      for (g = 0; g < S; g += 1)
                        (_ = i[g].a),
                          _.t.propType &&
                            ((T = i[g].s),
                            (M = T.getMult(
                              c[d].anIndexes[g],
                              s.a[g].s.totalChars
                            )),
                            (o !== 0 || t.j !== 0) &&
                              (this._hasMaskedPath
                                ? M.length
                                  ? (v += _.t.v * M[0])
                                  : (v += _.t.v * M)
                                : M.length
                                ? (o += _.t.v * M[0])
                                : (o += _.t.v * M)));
                      for (
                        t.strokeWidthAnim && (Z = t.sw || 0),
                          t.strokeColorAnim &&
                            (t.sc
                              ? ($ = [t.sc[0], t.sc[1], t.sc[2]])
                              : ($ = [0, 0, 0])),
                          t.fillColorAnim &&
                            t.fc &&
                            (W = [t.fc[0], t.fc[1], t.fc[2]]),
                          g = 0;
                        g < S;
                        g += 1
                      )
                        (_ = i[g].a),
                          _.a.propType &&
                            ((T = i[g].s),
                            (M = T.getMult(
                              c[d].anIndexes[g],
                              s.a[g].s.totalChars
                            )),
                            M.length
                              ? n.translate(
                                  -_.a.v[0] * M[0],
                                  -_.a.v[1] * M[1],
                                  _.a.v[2] * M[2]
                                )
                              : n.translate(
                                  -_.a.v[0] * M,
                                  -_.a.v[1] * M,
                                  _.a.v[2] * M
                                ));
                      for (g = 0; g < S; g += 1)
                        (_ = i[g].a),
                          _.s.propType &&
                            ((T = i[g].s),
                            (M = T.getMult(
                              c[d].anIndexes[g],
                              s.a[g].s.totalChars
                            )),
                            M.length
                              ? n.scale(
                                  1 + (_.s.v[0] - 1) * M[0],
                                  1 + (_.s.v[1] - 1) * M[1],
                                  1
                                )
                              : n.scale(
                                  1 + (_.s.v[0] - 1) * M,
                                  1 + (_.s.v[1] - 1) * M,
                                  1
                                ));
                      for (g = 0; g < S; g += 1) {
                        if (
                          ((_ = i[g].a),
                          (T = i[g].s),
                          (M = T.getMult(
                            c[d].anIndexes[g],
                            s.a[g].s.totalChars
                          )),
                          _.sk.propType &&
                            (M.length
                              ? n.skewFromAxis(-_.sk.v * M[0], _.sa.v * M[1])
                              : n.skewFromAxis(-_.sk.v * M, _.sa.v * M)),
                          _.r.propType &&
                            (M.length
                              ? n.rotateZ(-_.r.v * M[2])
                              : n.rotateZ(-_.r.v * M)),
                          _.ry.propType &&
                            (M.length
                              ? n.rotateY(_.ry.v * M[1])
                              : n.rotateY(_.ry.v * M)),
                          _.rx.propType &&
                            (M.length
                              ? n.rotateX(_.rx.v * M[0])
                              : n.rotateX(_.rx.v * M)),
                          _.o.propType &&
                            (M.length
                              ? (X += (_.o.v * M[0] - X) * M[0])
                              : (X += (_.o.v * M - X) * M)),
                          t.strokeWidthAnim &&
                            _.sw.propType &&
                            (M.length
                              ? (Z += _.sw.v * M[0])
                              : (Z += _.sw.v * M)),
                          t.strokeColorAnim && _.sc.propType)
                        )
                          for (N = 0; N < 3; N += 1)
                            M.length
                              ? ($[N] += (_.sc.v[N] - $[N]) * M[0])
                              : ($[N] += (_.sc.v[N] - $[N]) * M);
                        if (t.fillColorAnim && t.fc) {
                          if (_.fc.propType)
                            for (N = 0; N < 3; N += 1)
                              M.length
                                ? (W[N] += (_.fc.v[N] - W[N]) * M[0])
                                : (W[N] += (_.fc.v[N] - W[N]) * M);
                          _.fh.propType &&
                            (M.length
                              ? (W = addHueToRGB(W, _.fh.v * M[0]))
                              : (W = addHueToRGB(W, _.fh.v * M))),
                            _.fs.propType &&
                              (M.length
                                ? (W = addSaturationToRGB(W, _.fs.v * M[0]))
                                : (W = addSaturationToRGB(W, _.fs.v * M))),
                            _.fb.propType &&
                              (M.length
                                ? (W = addBrightnessToRGB(W, _.fb.v * M[0]))
                                : (W = addBrightnessToRGB(W, _.fb.v * M)));
                        }
                      }
                      for (g = 0; g < S; g += 1)
                        (_ = i[g].a),
                          _.p.propType &&
                            ((T = i[g].s),
                            (M = T.getMult(
                              c[d].anIndexes[g],
                              s.a[g].s.totalChars
                            )),
                            this._hasMaskedPath
                              ? M.length
                                ? n.translate(
                                    0,
                                    _.p.v[1] * M[0],
                                    -_.p.v[2] * M[1]
                                  )
                                : n.translate(0, _.p.v[1] * M, -_.p.v[2] * M)
                              : M.length
                              ? n.translate(
                                  _.p.v[0] * M[0],
                                  _.p.v[1] * M[1],
                                  -_.p.v[2] * M[2]
                                )
                              : n.translate(
                                  _.p.v[0] * M,
                                  _.p.v[1] * M,
                                  -_.p.v[2] * M
                                ));
                      if (
                        (t.strokeWidthAnim && (et = Z < 0 ? 0 : Z),
                        t.strokeColorAnim &&
                          (nt =
                            "rgb(" +
                            Math.round($[0] * 255) +
                            "," +
                            Math.round($[1] * 255) +
                            "," +
                            Math.round($[2] * 255) +
                            ")"),
                        t.fillColorAnim &&
                          t.fc &&
                          (rt =
                            "rgb(" +
                            Math.round(W[0] * 255) +
                            "," +
                            Math.round(W[1] * 255) +
                            "," +
                            Math.round(W[2] * 255) +
                            ")"),
                        this._hasMaskedPath)
                      ) {
                        if (
                          (n.translate(0, -t.ls),
                          n.translate(0, r[1] * G * 0.01 + f, 0),
                          this._pathData.p.v)
                        ) {
                          z =
                            (m.point[1] - y.point[1]) /
                            (m.point[0] - y.point[0]);
                          var lt = (Math.atan(z) * 180) / Math.PI;
                          m.point[0] < y.point[0] && (lt += 180),
                            n.rotate((-lt * Math.PI) / 180);
                        }
                        n.translate(B, H, 0),
                          (v -= r[0] * c[d].an * 0.005),
                          c[d + 1] &&
                            V !== c[d + 1].ind &&
                            ((v += c[d].an / 2),
                            (v += t.tr * 0.001 * t.finalSize));
                      } else {
                        switch (
                          (n.translate(o, f, 0),
                          t.ps && n.translate(t.ps[0], t.ps[1] + t.ascent, 0),
                          t.j)
                        ) {
                          case 1:
                            n.translate(
                              c[d].animatorJustifyOffset +
                                t.justifyOffset +
                                (t.boxWidth - t.lineWidths[c[d].line]),
                              0,
                              0
                            );
                            break;
                          case 2:
                            n.translate(
                              c[d].animatorJustifyOffset +
                                t.justifyOffset +
                                (t.boxWidth - t.lineWidths[c[d].line]) / 2,
                              0,
                              0
                            );
                            break;
                        }
                        n.translate(0, -t.ls),
                          n.translate(D, 0, 0),
                          n.translate(
                            r[0] * c[d].an * 0.005,
                            r[1] * G * 0.01,
                            0
                          ),
                          (o += c[d].l + t.tr * 0.001 * t.finalSize);
                      }
                      a === "html"
                        ? (tt = n.toCSS())
                        : a === "svg"
                        ? (tt = n.to2dCSS())
                        : (it = [
                            n.props[0],
                            n.props[1],
                            n.props[2],
                            n.props[3],
                            n.props[4],
                            n.props[5],
                            n.props[6],
                            n.props[7],
                            n.props[8],
                            n.props[9],
                            n.props[10],
                            n.props[11],
                            n.props[12],
                            n.props[13],
                            n.props[14],
                            n.props[15],
                          ]),
                        (st = X);
                    }
                    h <= d
                      ? ((k = new LetterProps(st, et, nt, rt, tt, it)),
                        this.renderedLetters.push(k),
                        (h += 1),
                        (this.lettersChangedFlag = !0))
                      : ((k = this.renderedLetters[d]),
                        (this.lettersChangedFlag =
                          k.update(st, et, nt, rt, tt, it) ||
                          this.lettersChangedFlag));
                  }
                }
              }),
              (TextAnimatorProperty.prototype.getValue = function () {
                this._elem.globalData.frameId !== this._frameId &&
                  ((this._frameId = this._elem.globalData.frameId),
                  this.iterateDynamicProperties());
              }),
              (TextAnimatorProperty.prototype.mHelper = new Matrix()),
              (TextAnimatorProperty.prototype.defaultPropsArray = []),
              extendPrototype([DynamicPropertyContainer], TextAnimatorProperty);
            function ITextElement() {}
            (ITextElement.prototype.initElement = function (t, e, r) {
              (this.lettersChangedFlag = !0),
                this.initFrame(),
                this.initBaseData(t, e, r),
                (this.textProperty = new TextProperty(
                  this,
                  t.t,
                  this.dynamicProperties
                )),
                (this.textAnimator = new TextAnimatorProperty(
                  t.t,
                  this.renderType,
                  this
                )),
                this.initTransform(t, e, r),
                this.initHierarchy(),
                this.initRenderable(),
                this.initRendererElement(),
                this.createContainerElements(),
                this.createRenderableComponents(),
                this.createContent(),
                this.hide(),
                this.textAnimator.searchProperties(this.dynamicProperties);
            }),
              (ITextElement.prototype.prepareFrame = function (t) {
                (this._mdf = !1),
                  this.prepareRenderableFrame(t),
                  this.prepareProperties(t, this.isInRange);
              }),
              (ITextElement.prototype.createPathShape = function (t, e) {
                var r,
                  i = e.length,
                  s,
                  n = "";
                for (r = 0; r < i; r += 1)
                  e[r].ty === "sh" &&
                    ((s = e[r].ks.k),
                    (n += buildShapeString(s, s.i.length, !0, t)));
                return n;
              }),
              (ITextElement.prototype.updateDocumentData = function (t, e) {
                this.textProperty.updateDocumentData(t, e);
              }),
              (ITextElement.prototype.canResizeFont = function (t) {
                this.textProperty.canResizeFont(t);
              }),
              (ITextElement.prototype.setMinimumFontSize = function (t) {
                this.textProperty.setMinimumFontSize(t);
              }),
              (ITextElement.prototype.applyTextPropertiesToMatrix = function (
                t,
                e,
                r,
                i,
                s
              ) {
                switch (
                  (t.ps && e.translate(t.ps[0], t.ps[1] + t.ascent, 0),
                  e.translate(0, -t.ls, 0),
                  t.j)
                ) {
                  case 1:
                    e.translate(
                      t.justifyOffset + (t.boxWidth - t.lineWidths[r]),
                      0,
                      0
                    );
                    break;
                  case 2:
                    e.translate(
                      t.justifyOffset + (t.boxWidth - t.lineWidths[r]) / 2,
                      0,
                      0
                    );
                    break;
                }
                e.translate(i, s, 0);
              }),
              (ITextElement.prototype.buildColor = function (t) {
                return (
                  "rgb(" +
                  Math.round(t[0] * 255) +
                  "," +
                  Math.round(t[1] * 255) +
                  "," +
                  Math.round(t[2] * 255) +
                  ")"
                );
              }),
              (ITextElement.prototype.emptyProp = new LetterProps()),
              (ITextElement.prototype.destroy = function () {}),
              (ITextElement.prototype.validateText = function () {
                (this.textProperty._mdf || this.textProperty._isFirstFrame) &&
                  (this.buildNewText(),
                  (this.textProperty._isFirstFrame = !1),
                  (this.textProperty._mdf = !1));
              });
            var emptyShapeData = { shapes: [] };
            function SVGTextLottieElement(t, e, r) {
              (this.textSpans = []),
                (this.renderType = "svg"),
                this.initElement(t, e, r);
            }
            extendPrototype(
              [
                BaseElement,
                TransformElement,
                SVGBaseElement,
                HierarchyElement,
                FrameElement,
                RenderableDOMElement,
                ITextElement,
              ],
              SVGTextLottieElement
            ),
              (SVGTextLottieElement.prototype.createContent = function () {
                this.data.singleShape &&
                  !this.globalData.fontManager.chars &&
                  (this.textContainer = createNS("text"));
              }),
              (SVGTextLottieElement.prototype.buildTextContents = function (t) {
                for (var e = 0, r = t.length, i = [], s = ""; e < r; )
                  t[e] === "\r" || t[e] === ""
                    ? (i.push(s), (s = ""))
                    : (s += t[e]),
                    (e += 1);
                return i.push(s), i;
              }),
              (SVGTextLottieElement.prototype.buildShapeData = function (t, e) {
                if (t.shapes && t.shapes.length) {
                  var r = t.shapes[0];
                  if (r.it) {
                    var i = r.it[r.it.length - 1];
                    i.s && ((i.s.k[0] = e), (i.s.k[1] = e));
                  }
                }
                return t;
              }),
              (SVGTextLottieElement.prototype.buildNewText = function () {
                this.addDynamicProperty(this);
                var t,
                  e,
                  r = this.textProperty.currentData;
                (this.renderedLetters = createSizedArray(r ? r.l.length : 0)),
                  r.fc
                    ? this.layerElement.setAttribute(
                        "fill",
                        this.buildColor(r.fc)
                      )
                    : this.layerElement.setAttribute("fill", "rgba(0,0,0,0)"),
                  r.sc &&
                    (this.layerElement.setAttribute(
                      "stroke",
                      this.buildColor(r.sc)
                    ),
                    this.layerElement.setAttribute("stroke-width", r.sw)),
                  this.layerElement.setAttribute("font-size", r.finalSize);
                var i = this.globalData.fontManager.getFontByName(r.f);
                if (i.fClass) this.layerElement.setAttribute("class", i.fClass);
                else {
                  this.layerElement.setAttribute("font-family", i.fFamily);
                  var s = r.fWeight,
                    n = r.fStyle;
                  this.layerElement.setAttribute("font-style", n),
                    this.layerElement.setAttribute("font-weight", s);
                }
                this.layerElement.setAttribute("aria-label", r.t);
                var a = r.l || [],
                  h = !!this.globalData.fontManager.chars;
                e = a.length;
                var o,
                  f = this.mHelper,
                  d = "",
                  P = this.data.singleShape,
                  c = 0,
                  b = 0,
                  v = !0,
                  m = r.tr * 0.001 * r.finalSize;
                if (P && !h && !r.sz) {
                  var C = this.textContainer,
                    p = "start";
                  switch (r.j) {
                    case 1:
                      p = "end";
                      break;
                    case 2:
                      p = "middle";
                      break;
                    default:
                      p = "start";
                      break;
                  }
                  C.setAttribute("text-anchor", p),
                    C.setAttribute("letter-spacing", m);
                  var u = this.buildTextContents(r.finalText);
                  for (
                    e = u.length, b = r.ps ? r.ps[1] + r.ascent : 0, t = 0;
                    t < e;
                    t += 1
                  )
                    (o = this.textSpans[t].span || createNS("tspan")),
                      (o.textContent = u[t]),
                      o.setAttribute("x", 0),
                      o.setAttribute("y", b),
                      (o.style.display = "inherit"),
                      C.appendChild(o),
                      this.textSpans[t] ||
                        (this.textSpans[t] = { span: null, glyph: null }),
                      (this.textSpans[t].span = o),
                      (b += r.finalLineHeight);
                  this.layerElement.appendChild(C);
                } else {
                  var l = this.textSpans.length,
                    y;
                  for (t = 0; t < e; t += 1) {
                    if (
                      (this.textSpans[t] ||
                        (this.textSpans[t] = {
                          span: null,
                          childSpan: null,
                          glyph: null,
                        }),
                      !h || !P || t === 0)
                    ) {
                      if (
                        ((o =
                          l > t
                            ? this.textSpans[t].span
                            : createNS(h ? "g" : "text")),
                        l <= t)
                      ) {
                        if (
                          (o.setAttribute("stroke-linecap", "butt"),
                          o.setAttribute("stroke-linejoin", "round"),
                          o.setAttribute("stroke-miterlimit", "4"),
                          (this.textSpans[t].span = o),
                          h)
                        ) {
                          var E = createNS("g");
                          o.appendChild(E), (this.textSpans[t].childSpan = E);
                        }
                        (this.textSpans[t].span = o),
                          this.layerElement.appendChild(o);
                      }
                      o.style.display = "inherit";
                    }
                    if (
                      (f.reset(),
                      P &&
                        (a[t].n &&
                          ((c = -m),
                          (b += r.yOffset),
                          (b += v ? 1 : 0),
                          (v = !1)),
                        this.applyTextPropertiesToMatrix(r, f, a[t].line, c, b),
                        (c += a[t].l || 0),
                        (c += m)),
                      h)
                    ) {
                      y = this.globalData.fontManager.getCharData(
                        r.finalText[t],
                        i.fStyle,
                        this.globalData.fontManager.getFontByName(r.f).fFamily
                      );
                      var x;
                      if (y.t === 1)
                        x = new SVGCompElement(y.data, this.globalData, this);
                      else {
                        var A = emptyShapeData;
                        y.data &&
                          y.data.shapes &&
                          (A = this.buildShapeData(y.data, r.finalSize)),
                          (x = new SVGShapeElement(A, this.globalData, this));
                      }
                      if (this.textSpans[t].glyph) {
                        var F = this.textSpans[t].glyph;
                        this.textSpans[t].childSpan.removeChild(F.layerElement),
                          F.destroy();
                      }
                      (this.textSpans[t].glyph = x),
                        (x._debug = !0),
                        x.prepareFrame(0),
                        x.renderFrame(),
                        this.textSpans[t].childSpan.appendChild(x.layerElement),
                        y.t === 1 &&
                          this.textSpans[t].childSpan.setAttribute(
                            "transform",
                            "scale(" +
                              r.finalSize / 100 +
                              "," +
                              r.finalSize / 100 +
                              ")"
                          );
                    } else
                      P &&
                        o.setAttribute(
                          "transform",
                          "translate(" + f.props[12] + "," + f.props[13] + ")"
                        ),
                        (o.textContent = a[t].val),
                        o.setAttributeNS(
                          "http://www.w3.org/XML/1998/namespace",
                          "xml:space",
                          "preserve"
                        );
                  }
                  P && o && o.setAttribute("d", d);
                }
                for (; t < this.textSpans.length; )
                  (this.textSpans[t].span.style.display = "none"), (t += 1);
                this._sizeChanged = !0;
              }),
              (SVGTextLottieElement.prototype.sourceRectAtTime = function () {
                if (
                  (this.prepareFrame(this.comp.renderedFrame - this.data.st),
                  this.renderInnerContent(),
                  this._sizeChanged)
                ) {
                  this._sizeChanged = !1;
                  var t = this.layerElement.getBBox();
                  this.bbox = {
                    top: t.y,
                    left: t.x,
                    width: t.width,
                    height: t.height,
                  };
                }
                return this.bbox;
              }),
              (SVGTextLottieElement.prototype.getValue = function () {
                var t,
                  e = this.textSpans.length,
                  r;
                for (
                  this.renderedFrame = this.comp.renderedFrame, t = 0;
                  t < e;
                  t += 1
                )
                  (r = this.textSpans[t].glyph),
                    r &&
                      (r.prepareFrame(this.comp.renderedFrame - this.data.st),
                      r._mdf && (this._mdf = !0));
              }),
              (SVGTextLottieElement.prototype.renderInnerContent = function () {
                if (
                  (this.validateText(),
                  (!this.data.singleShape || this._mdf) &&
                    (this.textAnimator.getMeasures(
                      this.textProperty.currentData,
                      this.lettersChangedFlag
                    ),
                    this.lettersChangedFlag ||
                      this.textAnimator.lettersChangedFlag))
                ) {
                  this._sizeChanged = !0;
                  var t,
                    e,
                    r = this.textAnimator.renderedLetters,
                    i = this.textProperty.currentData.l;
                  e = i.length;
                  var s, n, a;
                  for (t = 0; t < e; t += 1)
                    i[t].n ||
                      ((s = r[t]),
                      (n = this.textSpans[t].span),
                      (a = this.textSpans[t].glyph),
                      a && a.renderFrame(),
                      s._mdf.m && n.setAttribute("transform", s.m),
                      s._mdf.o && n.setAttribute("opacity", s.o),
                      s._mdf.sw && n.setAttribute("stroke-width", s.sw),
                      s._mdf.sc && n.setAttribute("stroke", s.sc),
                      s._mdf.fc && n.setAttribute("fill", s.fc));
                }
              });
            function ISolidElement(t, e, r) {
              this.initElement(t, e, r);
            }
            extendPrototype([IImageElement], ISolidElement),
              (ISolidElement.prototype.createContent = function () {
                var t = createNS("rect");
                t.setAttribute("width", this.data.sw),
                  t.setAttribute("height", this.data.sh),
                  t.setAttribute("fill", this.data.sc),
                  this.layerElement.appendChild(t);
              });
            function NullElement(t, e, r) {
              this.initFrame(),
                this.initBaseData(t, e, r),
                this.initFrame(),
                this.initTransform(t, e, r),
                this.initHierarchy();
            }
            (NullElement.prototype.prepareFrame = function (t) {
              this.prepareProperties(t, !0);
            }),
              (NullElement.prototype.renderFrame = function () {}),
              (NullElement.prototype.getBaseElement = function () {
                return null;
              }),
              (NullElement.prototype.destroy = function () {}),
              (NullElement.prototype.sourceRectAtTime = function () {}),
              (NullElement.prototype.hide = function () {}),
              extendPrototype(
                [BaseElement, TransformElement, HierarchyElement, FrameElement],
                NullElement
              );
            function SVGRendererBase() {}
            extendPrototype([BaseRenderer], SVGRendererBase),
              (SVGRendererBase.prototype.createNull = function (t) {
                return new NullElement(t, this.globalData, this);
              }),
              (SVGRendererBase.prototype.createShape = function (t) {
                return new SVGShapeElement(t, this.globalData, this);
              }),
              (SVGRendererBase.prototype.createText = function (t) {
                return new SVGTextLottieElement(t, this.globalData, this);
              }),
              (SVGRendererBase.prototype.createImage = function (t) {
                return new IImageElement(t, this.globalData, this);
              }),
              (SVGRendererBase.prototype.createSolid = function (t) {
                return new ISolidElement(t, this.globalData, this);
              }),
              (SVGRendererBase.prototype.configAnimation = function (t) {
                this.svgElement.setAttribute(
                  "xmlns",
                  "http://www.w3.org/2000/svg"
                ),
                  this.svgElement.setAttribute(
                    "xmlns:xlink",
                    "http://www.w3.org/1999/xlink"
                  ),
                  this.renderConfig.viewBoxSize
                    ? this.svgElement.setAttribute(
                        "viewBox",
                        this.renderConfig.viewBoxSize
                      )
                    : this.svgElement.setAttribute(
                        "viewBox",
                        "0 0 " + t.w + " " + t.h
                      ),
                  this.renderConfig.viewBoxOnly ||
                    (this.svgElement.setAttribute("width", t.w),
                    this.svgElement.setAttribute("height", t.h),
                    (this.svgElement.style.width = "100%"),
                    (this.svgElement.style.height = "100%"),
                    (this.svgElement.style.transform = "translate3d(0,0,0)"),
                    (this.svgElement.style.contentVisibility =
                      this.renderConfig.contentVisibility)),
                  this.renderConfig.width &&
                    this.svgElement.setAttribute(
                      "width",
                      this.renderConfig.width
                    ),
                  this.renderConfig.height &&
                    this.svgElement.setAttribute(
                      "height",
                      this.renderConfig.height
                    ),
                  this.renderConfig.className &&
                    this.svgElement.setAttribute(
                      "class",
                      this.renderConfig.className
                    ),
                  this.renderConfig.id &&
                    this.svgElement.setAttribute("id", this.renderConfig.id),
                  this.renderConfig.focusable !== void 0 &&
                    this.svgElement.setAttribute(
                      "focusable",
                      this.renderConfig.focusable
                    ),
                  this.svgElement.setAttribute(
                    "preserveAspectRatio",
                    this.renderConfig.preserveAspectRatio
                  ),
                  this.animationItem.wrapper.appendChild(this.svgElement);
                var e = this.globalData.defs;
                this.setupGlobalData(t, e),
                  (this.globalData.progressiveLoad =
                    this.renderConfig.progressiveLoad),
                  (this.data = t);
                var r = createNS("clipPath"),
                  i = createNS("rect");
                i.setAttribute("width", t.w),
                  i.setAttribute("height", t.h),
                  i.setAttribute("x", 0),
                  i.setAttribute("y", 0);
                var s = createElementID();
                r.setAttribute("id", s),
                  r.appendChild(i),
                  this.layerElement.setAttribute(
                    "clip-path",
                    "url(" + getLocationHref() + "#" + s + ")"
                  ),
                  e.appendChild(r),
                  (this.layers = t.layers),
                  (this.elements = createSizedArray(t.layers.length));
              }),
              (SVGRendererBase.prototype.destroy = function () {
                this.animationItem.wrapper &&
                  (this.animationItem.wrapper.innerText = ""),
                  (this.layerElement = null),
                  (this.globalData.defs = null);
                var t,
                  e = this.layers ? this.layers.length : 0;
                for (t = 0; t < e; t += 1)
                  this.elements[t] &&
                    this.elements[t].destroy &&
                    this.elements[t].destroy();
                (this.elements.length = 0),
                  (this.destroyed = !0),
                  (this.animationItem = null);
              }),
              (SVGRendererBase.prototype.updateContainerSize = function () {}),
              (SVGRendererBase.prototype.findIndexByInd = function (t) {
                var e = 0,
                  r = this.layers.length;
                for (e = 0; e < r; e += 1)
                  if (this.layers[e].ind === t) return e;
                return -1;
              }),
              (SVGRendererBase.prototype.buildItem = function (t) {
                var e = this.elements;
                if (!(e[t] || this.layers[t].ty === 99)) {
                  e[t] = !0;
                  var r = this.createItem(this.layers[t]);
                  if (
                    ((e[t] = r),
                    getExpressionsPlugin() &&
                      (this.layers[t].ty === 0 &&
                        this.globalData.projectInterface.registerComposition(r),
                      r.initExpressions()),
                    this.appendElementInPos(r, t),
                    this.layers[t].tt)
                  ) {
                    var i =
                      "tp" in this.layers[t]
                        ? this.findIndexByInd(this.layers[t].tp)
                        : t - 1;
                    if (i === -1) return;
                    if (!this.elements[i] || this.elements[i] === !0)
                      this.buildItem(i), this.addPendingElement(r);
                    else {
                      var s = e[i],
                        n = s.getMatte(this.layers[t].tt);
                      r.setMatte(n);
                    }
                  }
                }
              }),
              (SVGRendererBase.prototype.checkPendingElements = function () {
                for (; this.pendingElements.length; ) {
                  var t = this.pendingElements.pop();
                  if ((t.checkParenting(), t.data.tt))
                    for (var e = 0, r = this.elements.length; e < r; ) {
                      if (this.elements[e] === t) {
                        var i =
                            "tp" in t.data
                              ? this.findIndexByInd(t.data.tp)
                              : e - 1,
                          s = this.elements[i],
                          n = s.getMatte(this.layers[e].tt);
                        t.setMatte(n);
                        break;
                      }
                      e += 1;
                    }
                }
              }),
              (SVGRendererBase.prototype.renderFrame = function (t) {
                if (!(this.renderedFrame === t || this.destroyed)) {
                  t === null
                    ? (t = this.renderedFrame)
                    : (this.renderedFrame = t),
                    (this.globalData.frameNum = t),
                    (this.globalData.frameId += 1),
                    (this.globalData.projectInterface.currentFrame = t),
                    (this.globalData._mdf = !1);
                  var e,
                    r = this.layers.length;
                  for (
                    this.completeLayers || this.checkLayers(t), e = r - 1;
                    e >= 0;
                    e -= 1
                  )
                    (this.completeLayers || this.elements[e]) &&
                      this.elements[e].prepareFrame(t - this.layers[e].st);
                  if (this.globalData._mdf)
                    for (e = 0; e < r; e += 1)
                      (this.completeLayers || this.elements[e]) &&
                        this.elements[e].renderFrame();
                }
              }),
              (SVGRendererBase.prototype.appendElementInPos = function (t, e) {
                var r = t.getBaseElement();
                if (r) {
                  for (var i = 0, s; i < e; )
                    this.elements[i] &&
                      this.elements[i] !== !0 &&
                      this.elements[i].getBaseElement() &&
                      (s = this.elements[i].getBaseElement()),
                      (i += 1);
                  s
                    ? this.layerElement.insertBefore(r, s)
                    : this.layerElement.appendChild(r);
                }
              }),
              (SVGRendererBase.prototype.hide = function () {
                this.layerElement.style.display = "none";
              }),
              (SVGRendererBase.prototype.show = function () {
                this.layerElement.style.display = "block";
              });
            function ICompElement() {}
            extendPrototype(
              [
                BaseElement,
                TransformElement,
                HierarchyElement,
                FrameElement,
                RenderableDOMElement,
              ],
              ICompElement
            ),
              (ICompElement.prototype.initElement = function (t, e, r) {
                this.initFrame(),
                  this.initBaseData(t, e, r),
                  this.initTransform(t, e, r),
                  this.initRenderable(),
                  this.initHierarchy(),
                  this.initRendererElement(),
                  this.createContainerElements(),
                  this.createRenderableComponents(),
                  (this.data.xt || !e.progressiveLoad) && this.buildAllItems(),
                  this.hide();
              }),
              (ICompElement.prototype.prepareFrame = function (t) {
                if (
                  ((this._mdf = !1),
                  this.prepareRenderableFrame(t),
                  this.prepareProperties(t, this.isInRange),
                  !(!this.isInRange && !this.data.xt))
                ) {
                  if (this.tm._placeholder)
                    this.renderedFrame = t / this.data.sr;
                  else {
                    var e = this.tm.v;
                    e === this.data.op && (e = this.data.op - 1),
                      (this.renderedFrame = e);
                  }
                  var r,
                    i = this.elements.length;
                  for (
                    this.completeLayers || this.checkLayers(this.renderedFrame),
                      r = i - 1;
                    r >= 0;
                    r -= 1
                  )
                    (this.completeLayers || this.elements[r]) &&
                      (this.elements[r].prepareFrame(
                        this.renderedFrame - this.layers[r].st
                      ),
                      this.elements[r]._mdf && (this._mdf = !0));
                }
              }),
              (ICompElement.prototype.renderInnerContent = function () {
                var t,
                  e = this.layers.length;
                for (t = 0; t < e; t += 1)
                  (this.completeLayers || this.elements[t]) &&
                    this.elements[t].renderFrame();
              }),
              (ICompElement.prototype.setElements = function (t) {
                this.elements = t;
              }),
              (ICompElement.prototype.getElements = function () {
                return this.elements;
              }),
              (ICompElement.prototype.destroyElements = function () {
                var t,
                  e = this.layers.length;
                for (t = 0; t < e; t += 1)
                  this.elements[t] && this.elements[t].destroy();
              }),
              (ICompElement.prototype.destroy = function () {
                this.destroyElements(), this.destroyBaseElement();
              });
            function SVGCompElement(t, e, r) {
              (this.layers = t.layers),
                (this.supports3d = !0),
                (this.completeLayers = !1),
                (this.pendingElements = []),
                (this.elements = this.layers
                  ? createSizedArray(this.layers.length)
                  : []),
                this.initElement(t, e, r),
                (this.tm = t.tm
                  ? PropertyFactory.getProp(this, t.tm, 0, e.frameRate, this)
                  : { _placeholder: !0 });
            }
            extendPrototype(
              [SVGRendererBase, ICompElement, SVGBaseElement],
              SVGCompElement
            ),
              (SVGCompElement.prototype.createComp = function (t) {
                return new SVGCompElement(t, this.globalData, this);
              });
            function SVGRenderer(t, e) {
              (this.animationItem = t),
                (this.layers = null),
                (this.renderedFrame = -1),
                (this.svgElement = createNS("svg"));
              var r = "";
              if (e && e.title) {
                var i = createNS("title"),
                  s = createElementID();
                i.setAttribute("id", s),
                  (i.textContent = e.title),
                  this.svgElement.appendChild(i),
                  (r += s);
              }
              if (e && e.description) {
                var n = createNS("desc"),
                  a = createElementID();
                n.setAttribute("id", a),
                  (n.textContent = e.description),
                  this.svgElement.appendChild(n),
                  (r += " " + a);
              }
              r && this.svgElement.setAttribute("aria-labelledby", r);
              var h = createNS("defs");
              this.svgElement.appendChild(h);
              var o = createNS("g");
              this.svgElement.appendChild(o),
                (this.layerElement = o),
                (this.renderConfig = {
                  preserveAspectRatio:
                    (e && e.preserveAspectRatio) || "xMidYMid meet",
                  imagePreserveAspectRatio:
                    (e && e.imagePreserveAspectRatio) || "xMidYMid slice",
                  contentVisibility: (e && e.contentVisibility) || "visible",
                  progressiveLoad: (e && e.progressiveLoad) || !1,
                  hideOnTransparent: !(e && e.hideOnTransparent === !1),
                  viewBoxOnly: (e && e.viewBoxOnly) || !1,
                  viewBoxSize: (e && e.viewBoxSize) || !1,
                  className: (e && e.className) || "",
                  id: (e && e.id) || "",
                  focusable: e && e.focusable,
                  filterSize: {
                    width: (e && e.filterSize && e.filterSize.width) || "100%",
                    height:
                      (e && e.filterSize && e.filterSize.height) || "100%",
                    x: (e && e.filterSize && e.filterSize.x) || "0%",
                    y: (e && e.filterSize && e.filterSize.y) || "0%",
                  },
                  width: e && e.width,
                  height: e && e.height,
                  runExpressions:
                    !e || e.runExpressions === void 0 || e.runExpressions,
                }),
                (this.globalData = {
                  _mdf: !1,
                  frameNum: -1,
                  defs: h,
                  renderConfig: this.renderConfig,
                }),
                (this.elements = []),
                (this.pendingElements = []),
                (this.destroyed = !1),
                (this.rendererType = "svg");
            }
            extendPrototype([SVGRendererBase], SVGRenderer),
              (SVGRenderer.prototype.createComp = function (t) {
                return new SVGCompElement(t, this.globalData, this);
              });
            function ShapeTransformManager() {
              (this.sequences = {}),
                (this.sequenceList = []),
                (this.transform_key_count = 0);
            }
            ShapeTransformManager.prototype = {
              addTransformSequence: function (e) {
                var r,
                  i = e.length,
                  s = "_";
                for (r = 0; r < i; r += 1) s += e[r].transform.key + "_";
                var n = this.sequences[s];
                return (
                  n ||
                    ((n = {
                      transforms: [].concat(e),
                      finalTransform: new Matrix(),
                      _mdf: !1,
                    }),
                    (this.sequences[s] = n),
                    this.sequenceList.push(n)),
                  n
                );
              },
              processSequence: function (e, r) {
                for (var i = 0, s = e.transforms.length, n = r; i < s && !r; ) {
                  if (e.transforms[i].transform.mProps._mdf) {
                    n = !0;
                    break;
                  }
                  i += 1;
                }
                if (n)
                  for (e.finalTransform.reset(), i = s - 1; i >= 0; i -= 1)
                    e.finalTransform.multiply(
                      e.transforms[i].transform.mProps.v
                    );
                e._mdf = n;
              },
              processSequences: function (e) {
                var r,
                  i = this.sequenceList.length;
                for (r = 0; r < i; r += 1)
                  this.processSequence(this.sequenceList[r], e);
              },
              getNewKey: function () {
                return (
                  (this.transform_key_count += 1),
                  "_" + this.transform_key_count
                );
              },
            };
            var lumaLoader = function () {
              var e = "__lottie_element_luma_buffer",
                r = null,
                i = null,
                s = null;
              function n() {
                var o = createNS("svg"),
                  f = createNS("filter"),
                  d = createNS("feColorMatrix");
                return (
                  f.setAttribute("id", e),
                  d.setAttribute("type", "matrix"),
                  d.setAttribute("color-interpolation-filters", "sRGB"),
                  d.setAttribute(
                    "values",
                    "0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0"
                  ),
                  f.appendChild(d),
                  o.appendChild(f),
                  o.setAttribute("id", e + "_svg"),
                  featureSupport.svgLumaHidden && (o.style.display = "none"),
                  o
                );
              }
              function a() {
                r ||
                  ((s = n()),
                  document.body.appendChild(s),
                  (r = createTag("canvas")),
                  (i = r.getContext("2d")),
                  (i.filter = "url(#" + e + ")"),
                  (i.fillStyle = "rgba(0,0,0,0)"),
                  i.fillRect(0, 0, 1, 1));
              }
              function h(o) {
                return (
                  r || a(),
                  (r.width = o.width),
                  (r.height = o.height),
                  (i.filter = "url(#" + e + ")"),
                  r
                );
              }
              return { load: a, get: h };
            };
            function createCanvas(t, e) {
              if (featureSupport.offscreenCanvas)
                return new OffscreenCanvas(t, e);
              var r = createTag("canvas");
              return (r.width = t), (r.height = e), r;
            }
            var assetLoader = (function () {
                return {
                  loadLumaCanvas: lumaLoader.load,
                  getLumaCanvas: lumaLoader.get,
                  createCanvas,
                };
              })(),
              registeredEffects = {};
            function CVEffects(t) {
              var e,
                r = t.data.ef ? t.data.ef.length : 0;
              this.filters = [];
              var i;
              for (e = 0; e < r; e += 1) {
                i = null;
                var s = t.data.ef[e].ty;
                if (registeredEffects[s]) {
                  var n = registeredEffects[s].effect;
                  i = new n(t.effectsManager.effectElements[e], t);
                }
                i && this.filters.push(i);
              }
              this.filters.length && t.addRenderableComponent(this);
            }
            (CVEffects.prototype.renderFrame = function (t) {
              var e,
                r = this.filters.length;
              for (e = 0; e < r; e += 1) this.filters[e].renderFrame(t);
            }),
              (CVEffects.prototype.getEffects = function (t) {
                var e,
                  r = this.filters.length,
                  i = [];
                for (e = 0; e < r; e += 1)
                  this.filters[e].type === t && i.push(this.filters[e]);
                return i;
              });
            function registerEffect(t, e) {
              registeredEffects[t] = { effect: e };
            }
            function CVMaskElement(t, e) {
              (this.data = t),
                (this.element = e),
                (this.masksProperties = this.data.masksProperties || []),
                (this.viewData = createSizedArray(this.masksProperties.length));
              var r,
                i = this.masksProperties.length,
                s = !1;
              for (r = 0; r < i; r += 1)
                this.masksProperties[r].mode !== "n" && (s = !0),
                  (this.viewData[r] = ShapePropertyFactory.getShapeProp(
                    this.element,
                    this.masksProperties[r],
                    3
                  ));
              (this.hasMasks = s),
                s && this.element.addRenderableComponent(this);
            }
            (CVMaskElement.prototype.renderFrame = function () {
              if (this.hasMasks) {
                var t = this.element.finalTransform.mat,
                  e = this.element.canvasContext,
                  r,
                  i = this.masksProperties.length,
                  s,
                  n,
                  a;
                for (e.beginPath(), r = 0; r < i; r += 1)
                  if (this.masksProperties[r].mode !== "n") {
                    this.masksProperties[r].inv &&
                      (e.moveTo(0, 0),
                      e.lineTo(this.element.globalData.compSize.w, 0),
                      e.lineTo(
                        this.element.globalData.compSize.w,
                        this.element.globalData.compSize.h
                      ),
                      e.lineTo(0, this.element.globalData.compSize.h),
                      e.lineTo(0, 0)),
                      (a = this.viewData[r].v),
                      (s = t.applyToPointArray(a.v[0][0], a.v[0][1], 0)),
                      e.moveTo(s[0], s[1]);
                    var h,
                      o = a._length;
                    for (h = 1; h < o; h += 1)
                      (n = t.applyToTriplePoints(a.o[h - 1], a.i[h], a.v[h])),
                        e.bezierCurveTo(n[0], n[1], n[2], n[3], n[4], n[5]);
                    (n = t.applyToTriplePoints(a.o[h - 1], a.i[0], a.v[0])),
                      e.bezierCurveTo(n[0], n[1], n[2], n[3], n[4], n[5]);
                  }
                this.element.globalData.renderer.save(!0), e.clip();
              }
            }),
              (CVMaskElement.prototype.getMaskProperty =
                MaskElement.prototype.getMaskProperty),
              (CVMaskElement.prototype.destroy = function () {
                this.element = null;
              });
            function CVBaseElement() {}
            var operationsMap = {
              1: "source-in",
              2: "source-out",
              3: "source-in",
              4: "source-out",
            };
            (CVBaseElement.prototype = {
              createElements: function () {},
              initRendererElement: function () {},
              createContainerElements: function () {
                if (this.data.tt >= 1) {
                  this.buffers = [];
                  var e = this.globalData.canvasContext,
                    r = assetLoader.createCanvas(
                      e.canvas.width,
                      e.canvas.height
                    );
                  this.buffers.push(r);
                  var i = assetLoader.createCanvas(
                    e.canvas.width,
                    e.canvas.height
                  );
                  this.buffers.push(i),
                    this.data.tt >= 3 &&
                      !document._isProxy &&
                      assetLoader.loadLumaCanvas();
                }
                (this.canvasContext = this.globalData.canvasContext),
                  (this.transformCanvas = this.globalData.transformCanvas),
                  (this.renderableEffectsManager = new CVEffects(this)),
                  this.searchEffectTransforms();
              },
              createContent: function () {},
              setBlendMode: function () {
                var e = this.globalData;
                if (e.blendMode !== this.data.bm) {
                  e.blendMode = this.data.bm;
                  var r = getBlendMode(this.data.bm);
                  e.canvasContext.globalCompositeOperation = r;
                }
              },
              createRenderableComponents: function () {
                (this.maskManager = new CVMaskElement(this.data, this)),
                  (this.transformEffects =
                    this.renderableEffectsManager.getEffects(
                      effectTypes.TRANSFORM_EFFECT
                    ));
              },
              hideElement: function () {
                !this.hidden &&
                  (!this.isInRange || this.isTransparent) &&
                  (this.hidden = !0);
              },
              showElement: function () {
                this.isInRange &&
                  !this.isTransparent &&
                  ((this.hidden = !1),
                  (this._isFirstFrame = !0),
                  (this.maskManager._isFirstFrame = !0));
              },
              clearCanvas: function (e) {
                e.clearRect(
                  this.transformCanvas.tx,
                  this.transformCanvas.ty,
                  this.transformCanvas.w * this.transformCanvas.sx,
                  this.transformCanvas.h * this.transformCanvas.sy
                );
              },
              prepareLayer: function () {
                if (this.data.tt >= 1) {
                  var e = this.buffers[0],
                    r = e.getContext("2d");
                  this.clearCanvas(r),
                    r.drawImage(this.canvasContext.canvas, 0, 0),
                    (this.currentTransform = this.canvasContext.getTransform()),
                    this.canvasContext.setTransform(1, 0, 0, 1, 0, 0),
                    this.clearCanvas(this.canvasContext),
                    this.canvasContext.setTransform(this.currentTransform);
                }
              },
              exitLayer: function () {
                if (this.data.tt >= 1) {
                  var e = this.buffers[1],
                    r = e.getContext("2d");
                  this.clearCanvas(r),
                    r.drawImage(this.canvasContext.canvas, 0, 0),
                    this.canvasContext.setTransform(1, 0, 0, 1, 0, 0),
                    this.clearCanvas(this.canvasContext),
                    this.canvasContext.setTransform(this.currentTransform);
                  var i = this.comp.getElementById(
                    "tp" in this.data ? this.data.tp : this.data.ind - 1
                  );
                  if (
                    (i.renderFrame(!0),
                    this.canvasContext.setTransform(1, 0, 0, 1, 0, 0),
                    this.data.tt >= 3 && !document._isProxy)
                  ) {
                    var s = assetLoader.getLumaCanvas(
                        this.canvasContext.canvas
                      ),
                      n = s.getContext("2d");
                    n.drawImage(this.canvasContext.canvas, 0, 0),
                      this.clearCanvas(this.canvasContext),
                      this.canvasContext.drawImage(s, 0, 0);
                  }
                  (this.canvasContext.globalCompositeOperation =
                    operationsMap[this.data.tt]),
                    this.canvasContext.drawImage(e, 0, 0),
                    (this.canvasContext.globalCompositeOperation =
                      "destination-over"),
                    this.canvasContext.drawImage(this.buffers[0], 0, 0),
                    this.canvasContext.setTransform(this.currentTransform),
                    (this.canvasContext.globalCompositeOperation =
                      "source-over");
                }
              },
              renderFrame: function (e) {
                if (
                  !(this.hidden || this.data.hd) &&
                  !(this.data.td === 1 && !e)
                ) {
                  this.renderTransform(),
                    this.renderRenderable(),
                    this.renderLocalTransform(),
                    this.setBlendMode();
                  var r = this.data.ty === 0;
                  this.prepareLayer(),
                    this.globalData.renderer.save(r),
                    this.globalData.renderer.ctxTransform(
                      this.finalTransform.localMat.props
                    ),
                    this.globalData.renderer.ctxOpacity(
                      this.finalTransform.localOpacity
                    ),
                    this.renderInnerContent(),
                    this.globalData.renderer.restore(r),
                    this.exitLayer(),
                    this.maskManager.hasMasks &&
                      this.globalData.renderer.restore(!0),
                    this._isFirstFrame && (this._isFirstFrame = !1);
                }
              },
              destroy: function () {
                (this.canvasContext = null),
                  (this.data = null),
                  (this.globalData = null),
                  this.maskManager.destroy();
              },
              mHelper: new Matrix(),
            }),
              (CVBaseElement.prototype.hide =
                CVBaseElement.prototype.hideElement),
              (CVBaseElement.prototype.show =
                CVBaseElement.prototype.showElement);
            function CVShapeData(t, e, r, i) {
              (this.styledShapes = []), (this.tr = [0, 0, 0, 0, 0, 0]);
              var s = 4;
              e.ty === "rc"
                ? (s = 5)
                : e.ty === "el"
                ? (s = 6)
                : e.ty === "sr" && (s = 7),
                (this.sh = ShapePropertyFactory.getShapeProp(t, e, s, t));
              var n,
                a = r.length,
                h;
              for (n = 0; n < a; n += 1)
                r[n].closed ||
                  ((h = {
                    transforms: i.addTransformSequence(r[n].transforms),
                    trNodes: [],
                  }),
                  this.styledShapes.push(h),
                  r[n].elements.push(h));
            }
            CVShapeData.prototype.setAsAnimated =
              SVGShapeData.prototype.setAsAnimated;
            function CVShapeElement(t, e, r) {
              (this.shapes = []),
                (this.shapesData = t.shapes),
                (this.stylesList = []),
                (this.itemsData = []),
                (this.prevViewData = []),
                (this.shapeModifiers = []),
                (this.processedElements = []),
                (this.transformsManager = new ShapeTransformManager()),
                this.initElement(t, e, r);
            }
            extendPrototype(
              [
                BaseElement,
                TransformElement,
                CVBaseElement,
                IShapeElement,
                HierarchyElement,
                FrameElement,
                RenderableElement,
              ],
              CVShapeElement
            ),
              (CVShapeElement.prototype.initElement =
                RenderableDOMElement.prototype.initElement),
              (CVShapeElement.prototype.transformHelper = {
                opacity: 1,
                _opMdf: !1,
              }),
              (CVShapeElement.prototype.dashResetter = []),
              (CVShapeElement.prototype.createContent = function () {
                this.searchShapes(
                  this.shapesData,
                  this.itemsData,
                  this.prevViewData,
                  !0,
                  []
                );
              }),
              (CVShapeElement.prototype.createStyleElement = function (t, e) {
                var r = {
                    data: t,
                    type: t.ty,
                    preTransforms:
                      this.transformsManager.addTransformSequence(e),
                    transforms: [],
                    elements: [],
                    closed: t.hd === !0,
                  },
                  i = {};
                if (
                  (t.ty === "fl" || t.ty === "st"
                    ? ((i.c = PropertyFactory.getProp(this, t.c, 1, 255, this)),
                      i.c.k ||
                        (r.co =
                          "rgb(" +
                          bmFloor(i.c.v[0]) +
                          "," +
                          bmFloor(i.c.v[1]) +
                          "," +
                          bmFloor(i.c.v[2]) +
                          ")"))
                    : (t.ty === "gf" || t.ty === "gs") &&
                      ((i.s = PropertyFactory.getProp(
                        this,
                        t.s,
                        1,
                        null,
                        this
                      )),
                      (i.e = PropertyFactory.getProp(this, t.e, 1, null, this)),
                      (i.h = PropertyFactory.getProp(
                        this,
                        t.h || { k: 0 },
                        0,
                        0.01,
                        this
                      )),
                      (i.a = PropertyFactory.getProp(
                        this,
                        t.a || { k: 0 },
                        0,
                        degToRads,
                        this
                      )),
                      (i.g = new GradientProperty(this, t.g, this))),
                  (i.o = PropertyFactory.getProp(this, t.o, 0, 0.01, this)),
                  t.ty === "st" || t.ty === "gs")
                ) {
                  if (
                    ((r.lc = lineCapEnum[t.lc || 2]),
                    (r.lj = lineJoinEnum[t.lj || 2]),
                    t.lj == 1 && (r.ml = t.ml),
                    (i.w = PropertyFactory.getProp(this, t.w, 0, null, this)),
                    i.w.k || (r.wi = i.w.v),
                    t.d)
                  ) {
                    var s = new DashProperty(this, t.d, "canvas", this);
                    (i.d = s),
                      i.d.k ||
                        ((r.da = i.d.dashArray), (r.do = i.d.dashoffset[0]));
                  }
                } else r.r = t.r === 2 ? "evenodd" : "nonzero";
                return this.stylesList.push(r), (i.style = r), i;
              }),
              (CVShapeElement.prototype.createGroupElement = function () {
                var t = { it: [], prevViewData: [] };
                return t;
              }),
              (CVShapeElement.prototype.createTransformElement = function (t) {
                var e = {
                  transform: {
                    opacity: 1,
                    _opMdf: !1,
                    key: this.transformsManager.getNewKey(),
                    op: PropertyFactory.getProp(this, t.o, 0, 0.01, this),
                    mProps: TransformPropertyFactory.getTransformProperty(
                      this,
                      t,
                      this
                    ),
                  },
                };
                return e;
              }),
              (CVShapeElement.prototype.createShapeElement = function (t) {
                var e = new CVShapeData(
                  this,
                  t,
                  this.stylesList,
                  this.transformsManager
                );
                return this.shapes.push(e), this.addShapeToModifiers(e), e;
              }),
              (CVShapeElement.prototype.reloadShapes = function () {
                this._isFirstFrame = !0;
                var t,
                  e = this.itemsData.length;
                for (t = 0; t < e; t += 1)
                  this.prevViewData[t] = this.itemsData[t];
                for (
                  this.searchShapes(
                    this.shapesData,
                    this.itemsData,
                    this.prevViewData,
                    !0,
                    []
                  ),
                    e = this.dynamicProperties.length,
                    t = 0;
                  t < e;
                  t += 1
                )
                  this.dynamicProperties[t].getValue();
                this.renderModifiers(),
                  this.transformsManager.processSequences(this._isFirstFrame);
              }),
              (CVShapeElement.prototype.addTransformToStyleList = function (t) {
                var e,
                  r = this.stylesList.length;
                for (e = 0; e < r; e += 1)
                  this.stylesList[e].closed ||
                    this.stylesList[e].transforms.push(t);
              }),
              (CVShapeElement.prototype.removeTransformFromStyleList =
                function () {
                  var t,
                    e = this.stylesList.length;
                  for (t = 0; t < e; t += 1)
                    this.stylesList[t].closed ||
                      this.stylesList[t].transforms.pop();
                }),
              (CVShapeElement.prototype.closeStyles = function (t) {
                var e,
                  r = t.length;
                for (e = 0; e < r; e += 1) t[e].closed = !0;
              }),
              (CVShapeElement.prototype.searchShapes = function (
                t,
                e,
                r,
                i,
                s
              ) {
                var n,
                  a = t.length - 1,
                  h,
                  o,
                  f = [],
                  d = [],
                  P,
                  c,
                  b,
                  v = [].concat(s);
                for (n = a; n >= 0; n -= 1) {
                  if (
                    ((P = this.searchProcessedElement(t[n])),
                    P ? (e[n] = r[P - 1]) : (t[n]._shouldRender = i),
                    t[n].ty === "fl" ||
                      t[n].ty === "st" ||
                      t[n].ty === "gf" ||
                      t[n].ty === "gs")
                  )
                    P
                      ? (e[n].style.closed = !1)
                      : (e[n] = this.createStyleElement(t[n], v)),
                      f.push(e[n].style);
                  else if (t[n].ty === "gr") {
                    if (!P) e[n] = this.createGroupElement(t[n]);
                    else
                      for (o = e[n].it.length, h = 0; h < o; h += 1)
                        e[n].prevViewData[h] = e[n].it[h];
                    this.searchShapes(
                      t[n].it,
                      e[n].it,
                      e[n].prevViewData,
                      i,
                      v
                    );
                  } else
                    t[n].ty === "tr"
                      ? (P ||
                          ((b = this.createTransformElement(t[n])), (e[n] = b)),
                        v.push(e[n]),
                        this.addTransformToStyleList(e[n]))
                      : t[n].ty === "sh" ||
                        t[n].ty === "rc" ||
                        t[n].ty === "el" ||
                        t[n].ty === "sr"
                      ? P || (e[n] = this.createShapeElement(t[n]))
                      : t[n].ty === "tm" ||
                        t[n].ty === "rd" ||
                        t[n].ty === "pb" ||
                        t[n].ty === "zz" ||
                        t[n].ty === "op"
                      ? (P
                          ? ((c = e[n]), (c.closed = !1))
                          : ((c = ShapeModifiers.getModifier(t[n].ty)),
                            c.init(this, t[n]),
                            (e[n] = c),
                            this.shapeModifiers.push(c)),
                        d.push(c))
                      : t[n].ty === "rp" &&
                        (P
                          ? ((c = e[n]), (c.closed = !0))
                          : ((c = ShapeModifiers.getModifier(t[n].ty)),
                            (e[n] = c),
                            c.init(this, t, n, e),
                            this.shapeModifiers.push(c),
                            (i = !1)),
                        d.push(c));
                  this.addProcessedElement(t[n], n + 1);
                }
                for (
                  this.removeTransformFromStyleList(),
                    this.closeStyles(f),
                    a = d.length,
                    n = 0;
                  n < a;
                  n += 1
                )
                  d[n].closed = !0;
              }),
              (CVShapeElement.prototype.renderInnerContent = function () {
                (this.transformHelper.opacity = 1),
                  (this.transformHelper._opMdf = !1),
                  this.renderModifiers(),
                  this.transformsManager.processSequences(this._isFirstFrame),
                  this.renderShape(
                    this.transformHelper,
                    this.shapesData,
                    this.itemsData,
                    !0
                  );
              }),
              (CVShapeElement.prototype.renderShapeTransform = function (t, e) {
                (t._opMdf || e.op._mdf || this._isFirstFrame) &&
                  ((e.opacity = t.opacity),
                  (e.opacity *= e.op.v),
                  (e._opMdf = !0));
              }),
              (CVShapeElement.prototype.drawLayer = function () {
                var t,
                  e = this.stylesList.length,
                  r,
                  i,
                  s,
                  n,
                  a,
                  h,
                  o = this.globalData.renderer,
                  f = this.globalData.canvasContext,
                  d,
                  P;
                for (t = 0; t < e; t += 1)
                  if (
                    ((P = this.stylesList[t]),
                    (d = P.type),
                    !(
                      ((d === "st" || d === "gs") && P.wi === 0) ||
                      !P.data._shouldRender ||
                      P.coOp === 0 ||
                      this.globalData.currentGlobalAlpha === 0
                    ))
                  ) {
                    for (
                      o.save(),
                        a = P.elements,
                        d === "st" || d === "gs"
                          ? (o.ctxStrokeStyle(d === "st" ? P.co : P.grd),
                            o.ctxLineWidth(P.wi),
                            o.ctxLineCap(P.lc),
                            o.ctxLineJoin(P.lj),
                            o.ctxMiterLimit(P.ml || 0))
                          : o.ctxFillStyle(d === "fl" ? P.co : P.grd),
                        o.ctxOpacity(P.coOp),
                        d !== "st" && d !== "gs" && f.beginPath(),
                        o.ctxTransform(P.preTransforms.finalTransform.props),
                        i = a.length,
                        r = 0;
                      r < i;
                      r += 1
                    ) {
                      for (
                        (d === "st" || d === "gs") &&
                          (f.beginPath(),
                          P.da &&
                            (f.setLineDash(P.da), (f.lineDashOffset = P.do))),
                          h = a[r].trNodes,
                          n = h.length,
                          s = 0;
                        s < n;
                        s += 1
                      )
                        h[s].t === "m"
                          ? f.moveTo(h[s].p[0], h[s].p[1])
                          : h[s].t === "c"
                          ? f.bezierCurveTo(
                              h[s].pts[0],
                              h[s].pts[1],
                              h[s].pts[2],
                              h[s].pts[3],
                              h[s].pts[4],
                              h[s].pts[5]
                            )
                          : f.closePath();
                      (d === "st" || d === "gs") &&
                        (o.ctxStroke(),
                        P.da && f.setLineDash(this.dashResetter));
                    }
                    d !== "st" &&
                      d !== "gs" &&
                      this.globalData.renderer.ctxFill(P.r),
                      o.restore();
                  }
              }),
              (CVShapeElement.prototype.renderShape = function (t, e, r, i) {
                var s,
                  n = e.length - 1,
                  a;
                for (a = t, s = n; s >= 0; s -= 1)
                  e[s].ty === "tr"
                    ? ((a = r[s].transform), this.renderShapeTransform(t, a))
                    : e[s].ty === "sh" ||
                      e[s].ty === "el" ||
                      e[s].ty === "rc" ||
                      e[s].ty === "sr"
                    ? this.renderPath(e[s], r[s])
                    : e[s].ty === "fl"
                    ? this.renderFill(e[s], r[s], a)
                    : e[s].ty === "st"
                    ? this.renderStroke(e[s], r[s], a)
                    : e[s].ty === "gf" || e[s].ty === "gs"
                    ? this.renderGradientFill(e[s], r[s], a)
                    : e[s].ty === "gr"
                    ? this.renderShape(a, e[s].it, r[s].it)
                    : e[s].ty;
                i && this.drawLayer();
              }),
              (CVShapeElement.prototype.renderStyledShape = function (t, e) {
                if (this._isFirstFrame || e._mdf || t.transforms._mdf) {
                  var r = t.trNodes,
                    i = e.paths,
                    s,
                    n,
                    a,
                    h = i._length;
                  r.length = 0;
                  var o = t.transforms.finalTransform;
                  for (a = 0; a < h; a += 1) {
                    var f = i.shapes[a];
                    if (f && f.v) {
                      for (n = f._length, s = 1; s < n; s += 1)
                        s === 1 &&
                          r.push({
                            t: "m",
                            p: o.applyToPointArray(f.v[0][0], f.v[0][1], 0),
                          }),
                          r.push({
                            t: "c",
                            pts: o.applyToTriplePoints(
                              f.o[s - 1],
                              f.i[s],
                              f.v[s]
                            ),
                          });
                      n === 1 &&
                        r.push({
                          t: "m",
                          p: o.applyToPointArray(f.v[0][0], f.v[0][1], 0),
                        }),
                        f.c &&
                          n &&
                          (r.push({
                            t: "c",
                            pts: o.applyToTriplePoints(
                              f.o[s - 1],
                              f.i[0],
                              f.v[0]
                            ),
                          }),
                          r.push({ t: "z" }));
                    }
                  }
                  t.trNodes = r;
                }
              }),
              (CVShapeElement.prototype.renderPath = function (t, e) {
                if (t.hd !== !0 && t._shouldRender) {
                  var r,
                    i = e.styledShapes.length;
                  for (r = 0; r < i; r += 1)
                    this.renderStyledShape(e.styledShapes[r], e.sh);
                }
              }),
              (CVShapeElement.prototype.renderFill = function (t, e, r) {
                var i = e.style;
                (e.c._mdf || this._isFirstFrame) &&
                  (i.co =
                    "rgb(" +
                    bmFloor(e.c.v[0]) +
                    "," +
                    bmFloor(e.c.v[1]) +
                    "," +
                    bmFloor(e.c.v[2]) +
                    ")"),
                  (e.o._mdf || r._opMdf || this._isFirstFrame) &&
                    (i.coOp = e.o.v * r.opacity);
              }),
              (CVShapeElement.prototype.renderGradientFill = function (
                t,
                e,
                r
              ) {
                var i = e.style,
                  s;
                if (
                  !i.grd ||
                  e.g._mdf ||
                  e.s._mdf ||
                  e.e._mdf ||
                  (t.t !== 1 && (e.h._mdf || e.a._mdf))
                ) {
                  var n = this.globalData.canvasContext,
                    a = e.s.v,
                    h = e.e.v;
                  if (t.t === 1)
                    s = n.createLinearGradient(a[0], a[1], h[0], h[1]);
                  else {
                    var o = Math.sqrt(
                        Math.pow(a[0] - h[0], 2) + Math.pow(a[1] - h[1], 2)
                      ),
                      f = Math.atan2(h[1] - a[1], h[0] - a[0]),
                      d = e.h.v;
                    d >= 1 ? (d = 0.99) : d <= -1 && (d = -0.99);
                    var P = o * d,
                      c = Math.cos(f + e.a.v) * P + a[0],
                      b = Math.sin(f + e.a.v) * P + a[1];
                    s = n.createRadialGradient(c, b, 0, a[0], a[1], o);
                  }
                  var v,
                    m = t.g.p,
                    C = e.g.c,
                    p = 1;
                  for (v = 0; v < m; v += 1)
                    e.g._hasOpacity &&
                      e.g._collapsable &&
                      (p = e.g.o[v * 2 + 1]),
                      s.addColorStop(
                        C[v * 4] / 100,
                        "rgba(" +
                          C[v * 4 + 1] +
                          "," +
                          C[v * 4 + 2] +
                          "," +
                          C[v * 4 + 3] +
                          "," +
                          p +
                          ")"
                      );
                  i.grd = s;
                }
                i.coOp = e.o.v * r.opacity;
              }),
              (CVShapeElement.prototype.renderStroke = function (t, e, r) {
                var i = e.style,
                  s = e.d;
                s &&
                  (s._mdf || this._isFirstFrame) &&
                  ((i.da = s.dashArray), (i.do = s.dashoffset[0])),
                  (e.c._mdf || this._isFirstFrame) &&
                    (i.co =
                      "rgb(" +
                      bmFloor(e.c.v[0]) +
                      "," +
                      bmFloor(e.c.v[1]) +
                      "," +
                      bmFloor(e.c.v[2]) +
                      ")"),
                  (e.o._mdf || r._opMdf || this._isFirstFrame) &&
                    (i.coOp = e.o.v * r.opacity),
                  (e.w._mdf || this._isFirstFrame) && (i.wi = e.w.v);
              }),
              (CVShapeElement.prototype.destroy = function () {
                (this.shapesData = null),
                  (this.globalData = null),
                  (this.canvasContext = null),
                  (this.stylesList.length = 0),
                  (this.itemsData.length = 0);
              });
            function CVTextElement(t, e, r) {
              (this.textSpans = []),
                (this.yOffset = 0),
                (this.fillColorAnim = !1),
                (this.strokeColorAnim = !1),
                (this.strokeWidthAnim = !1),
                (this.stroke = !1),
                (this.fill = !1),
                (this.justifyOffset = 0),
                (this.currentRender = null),
                (this.renderType = "canvas"),
                (this.values = {
                  fill: "rgba(0,0,0,0)",
                  stroke: "rgba(0,0,0,0)",
                  sWidth: 0,
                  fValue: "",
                }),
                this.initElement(t, e, r);
            }
            extendPrototype(
              [
                BaseElement,
                TransformElement,
                CVBaseElement,
                HierarchyElement,
                FrameElement,
                RenderableElement,
                ITextElement,
              ],
              CVTextElement
            ),
              (CVTextElement.prototype.tHelper =
                createTag("canvas").getContext("2d")),
              (CVTextElement.prototype.buildNewText = function () {
                var t = this.textProperty.currentData;
                this.renderedLetters = createSizedArray(t.l ? t.l.length : 0);
                var e = !1;
                t.fc
                  ? ((e = !0), (this.values.fill = this.buildColor(t.fc)))
                  : (this.values.fill = "rgba(0,0,0,0)"),
                  (this.fill = e);
                var r = !1;
                t.sc &&
                  ((r = !0),
                  (this.values.stroke = this.buildColor(t.sc)),
                  (this.values.sWidth = t.sw));
                var i = this.globalData.fontManager.getFontByName(t.f),
                  s,
                  n,
                  a = t.l,
                  h = this.mHelper;
                (this.stroke = r),
                  (this.values.fValue =
                    t.finalSize +
                    "px " +
                    this.globalData.fontManager.getFontByName(t.f).fFamily),
                  (n = t.finalText.length);
                var o,
                  f,
                  d,
                  P,
                  c,
                  b,
                  v,
                  m,
                  C,
                  p,
                  u = this.data.singleShape,
                  l = t.tr * 0.001 * t.finalSize,
                  y = 0,
                  E = 0,
                  x = !0,
                  A = 0;
                for (s = 0; s < n; s += 1) {
                  (o = this.globalData.fontManager.getCharData(
                    t.finalText[s],
                    i.fStyle,
                    this.globalData.fontManager.getFontByName(t.f).fFamily
                  )),
                    (f = (o && o.data) || {}),
                    h.reset(),
                    u &&
                      a[s].n &&
                      ((y = -l), (E += t.yOffset), (E += x ? 1 : 0), (x = !1)),
                    (c = f.shapes ? f.shapes[0].it : []),
                    (v = c.length),
                    h.scale(t.finalSize / 100, t.finalSize / 100),
                    u &&
                      this.applyTextPropertiesToMatrix(t, h, a[s].line, y, E),
                    (C = createSizedArray(v - 1));
                  var F = 0;
                  for (b = 0; b < v; b += 1)
                    if (c[b].ty === "sh") {
                      for (
                        P = c[b].ks.k.i.length, m = c[b].ks.k, p = [], d = 1;
                        d < P;
                        d += 1
                      )
                        d === 1 &&
                          p.push(
                            h.applyToX(m.v[0][0], m.v[0][1], 0),
                            h.applyToY(m.v[0][0], m.v[0][1], 0)
                          ),
                          p.push(
                            h.applyToX(m.o[d - 1][0], m.o[d - 1][1], 0),
                            h.applyToY(m.o[d - 1][0], m.o[d - 1][1], 0),
                            h.applyToX(m.i[d][0], m.i[d][1], 0),
                            h.applyToY(m.i[d][0], m.i[d][1], 0),
                            h.applyToX(m.v[d][0], m.v[d][1], 0),
                            h.applyToY(m.v[d][0], m.v[d][1], 0)
                          );
                      p.push(
                        h.applyToX(m.o[d - 1][0], m.o[d - 1][1], 0),
                        h.applyToY(m.o[d - 1][0], m.o[d - 1][1], 0),
                        h.applyToX(m.i[0][0], m.i[0][1], 0),
                        h.applyToY(m.i[0][0], m.i[0][1], 0),
                        h.applyToX(m.v[0][0], m.v[0][1], 0),
                        h.applyToY(m.v[0][0], m.v[0][1], 0)
                      ),
                        (C[F] = p),
                        (F += 1);
                    }
                  u && ((y += a[s].l), (y += l)),
                    this.textSpans[A]
                      ? (this.textSpans[A].elem = C)
                      : (this.textSpans[A] = { elem: C }),
                    (A += 1);
                }
              }),
              (CVTextElement.prototype.renderInnerContent = function () {
                this.validateText();
                var t = this.canvasContext;
                (t.font = this.values.fValue),
                  this.globalData.renderer.ctxLineCap("butt"),
                  this.globalData.renderer.ctxLineJoin("miter"),
                  this.globalData.renderer.ctxMiterLimit(4),
                  this.data.singleShape ||
                    this.textAnimator.getMeasures(
                      this.textProperty.currentData,
                      this.lettersChangedFlag
                    );
                var e,
                  r,
                  i,
                  s,
                  n,
                  a,
                  h = this.textAnimator.renderedLetters,
                  o = this.textProperty.currentData.l;
                r = o.length;
                var f,
                  d = null,
                  P = null,
                  c = null,
                  b,
                  v,
                  m = this.globalData.renderer;
                for (e = 0; e < r; e += 1)
                  if (!o[e].n) {
                    if (
                      ((f = h[e]),
                      f && (m.save(), m.ctxTransform(f.p), m.ctxOpacity(f.o)),
                      this.fill)
                    ) {
                      for (
                        f && f.fc
                          ? d !== f.fc && (m.ctxFillStyle(f.fc), (d = f.fc))
                          : d !== this.values.fill &&
                            ((d = this.values.fill),
                            m.ctxFillStyle(this.values.fill)),
                          b = this.textSpans[e].elem,
                          s = b.length,
                          this.globalData.canvasContext.beginPath(),
                          i = 0;
                        i < s;
                        i += 1
                      )
                        for (
                          v = b[i],
                            a = v.length,
                            this.globalData.canvasContext.moveTo(v[0], v[1]),
                            n = 2;
                          n < a;
                          n += 6
                        )
                          this.globalData.canvasContext.bezierCurveTo(
                            v[n],
                            v[n + 1],
                            v[n + 2],
                            v[n + 3],
                            v[n + 4],
                            v[n + 5]
                          );
                      this.globalData.canvasContext.closePath(), m.ctxFill();
                    }
                    if (this.stroke) {
                      for (
                        f && f.sw
                          ? c !== f.sw && ((c = f.sw), m.ctxLineWidth(f.sw))
                          : c !== this.values.sWidth &&
                            ((c = this.values.sWidth),
                            m.ctxLineWidth(this.values.sWidth)),
                          f && f.sc
                            ? P !== f.sc && ((P = f.sc), m.ctxStrokeStyle(f.sc))
                            : P !== this.values.stroke &&
                              ((P = this.values.stroke),
                              m.ctxStrokeStyle(this.values.stroke)),
                          b = this.textSpans[e].elem,
                          s = b.length,
                          this.globalData.canvasContext.beginPath(),
                          i = 0;
                        i < s;
                        i += 1
                      )
                        for (
                          v = b[i],
                            a = v.length,
                            this.globalData.canvasContext.moveTo(v[0], v[1]),
                            n = 2;
                          n < a;
                          n += 6
                        )
                          this.globalData.canvasContext.bezierCurveTo(
                            v[n],
                            v[n + 1],
                            v[n + 2],
                            v[n + 3],
                            v[n + 4],
                            v[n + 5]
                          );
                      this.globalData.canvasContext.closePath(), m.ctxStroke();
                    }
                    f && this.globalData.renderer.restore();
                  }
              });
            function CVImageElement(t, e, r) {
              (this.assetData = e.getAssetData(t.refId)),
                (this.img = e.imageLoader.getAsset(this.assetData)),
                this.initElement(t, e, r);
            }
            extendPrototype(
              [
                BaseElement,
                TransformElement,
                CVBaseElement,
                HierarchyElement,
                FrameElement,
                RenderableElement,
              ],
              CVImageElement
            ),
              (CVImageElement.prototype.initElement =
                SVGShapeElement.prototype.initElement),
              (CVImageElement.prototype.prepareFrame =
                IImageElement.prototype.prepareFrame),
              (CVImageElement.prototype.createContent = function () {
                if (
                  this.img.width &&
                  (this.assetData.w !== this.img.width ||
                    this.assetData.h !== this.img.height)
                ) {
                  var t = createTag("canvas");
                  (t.width = this.assetData.w), (t.height = this.assetData.h);
                  var e = t.getContext("2d"),
                    r = this.img.width,
                    i = this.img.height,
                    s = r / i,
                    n = this.assetData.w / this.assetData.h,
                    a,
                    h,
                    o =
                      this.assetData.pr ||
                      this.globalData.renderConfig.imagePreserveAspectRatio;
                  (s > n && o === "xMidYMid slice") ||
                  (s < n && o !== "xMidYMid slice")
                    ? ((h = i), (a = h * n))
                    : ((a = r), (h = a / n)),
                    e.drawImage(
                      this.img,
                      (r - a) / 2,
                      (i - h) / 2,
                      a,
                      h,
                      0,
                      0,
                      this.assetData.w,
                      this.assetData.h
                    ),
                    (this.img = t);
                }
              }),
              (CVImageElement.prototype.renderInnerContent = function () {
                this.canvasContext.drawImage(this.img, 0, 0);
              }),
              (CVImageElement.prototype.destroy = function () {
                this.img = null;
              });
            function CVSolidElement(t, e, r) {
              this.initElement(t, e, r);
            }
            extendPrototype(
              [
                BaseElement,
                TransformElement,
                CVBaseElement,
                HierarchyElement,
                FrameElement,
                RenderableElement,
              ],
              CVSolidElement
            ),
              (CVSolidElement.prototype.initElement =
                SVGShapeElement.prototype.initElement),
              (CVSolidElement.prototype.prepareFrame =
                IImageElement.prototype.prepareFrame),
              (CVSolidElement.prototype.renderInnerContent = function () {
                this.globalData.renderer.ctxFillStyle(this.data.sc),
                  this.globalData.renderer.ctxFillRect(
                    0,
                    0,
                    this.data.sw,
                    this.data.sh
                  );
              });
            function CanvasRendererBase() {}
            extendPrototype([BaseRenderer], CanvasRendererBase),
              (CanvasRendererBase.prototype.createShape = function (t) {
                return new CVShapeElement(t, this.globalData, this);
              }),
              (CanvasRendererBase.prototype.createText = function (t) {
                return new CVTextElement(t, this.globalData, this);
              }),
              (CanvasRendererBase.prototype.createImage = function (t) {
                return new CVImageElement(t, this.globalData, this);
              }),
              (CanvasRendererBase.prototype.createSolid = function (t) {
                return new CVSolidElement(t, this.globalData, this);
              }),
              (CanvasRendererBase.prototype.createNull =
                SVGRenderer.prototype.createNull),
              (CanvasRendererBase.prototype.ctxTransform = function (t) {
                (t[0] === 1 &&
                  t[1] === 0 &&
                  t[4] === 0 &&
                  t[5] === 1 &&
                  t[12] === 0 &&
                  t[13] === 0) ||
                  this.canvasContext.transform(
                    t[0],
                    t[1],
                    t[4],
                    t[5],
                    t[12],
                    t[13]
                  );
              }),
              (CanvasRendererBase.prototype.ctxOpacity = function (t) {
                this.canvasContext.globalAlpha *= t < 0 ? 0 : t;
              }),
              (CanvasRendererBase.prototype.ctxFillStyle = function (t) {
                this.canvasContext.fillStyle = t;
              }),
              (CanvasRendererBase.prototype.ctxStrokeStyle = function (t) {
                this.canvasContext.strokeStyle = t;
              }),
              (CanvasRendererBase.prototype.ctxLineWidth = function (t) {
                this.canvasContext.lineWidth = t;
              }),
              (CanvasRendererBase.prototype.ctxLineCap = function (t) {
                this.canvasContext.lineCap = t;
              }),
              (CanvasRendererBase.prototype.ctxLineJoin = function (t) {
                this.canvasContext.lineJoin = t;
              }),
              (CanvasRendererBase.prototype.ctxMiterLimit = function (t) {
                this.canvasContext.miterLimit = t;
              }),
              (CanvasRendererBase.prototype.ctxFill = function (t) {
                this.canvasContext.fill(t);
              }),
              (CanvasRendererBase.prototype.ctxFillRect = function (
                t,
                e,
                r,
                i
              ) {
                this.canvasContext.fillRect(t, e, r, i);
              }),
              (CanvasRendererBase.prototype.ctxStroke = function () {
                this.canvasContext.stroke();
              }),
              (CanvasRendererBase.prototype.reset = function () {
                if (!this.renderConfig.clearCanvas) {
                  this.canvasContext.restore();
                  return;
                }
                this.contextData.reset();
              }),
              (CanvasRendererBase.prototype.save = function () {
                this.canvasContext.save();
              }),
              (CanvasRendererBase.prototype.restore = function (t) {
                if (!this.renderConfig.clearCanvas) {
                  this.canvasContext.restore();
                  return;
                }
                t && (this.globalData.blendMode = "source-over"),
                  this.contextData.restore(t);
              }),
              (CanvasRendererBase.prototype.configAnimation = function (t) {
                if (this.animationItem.wrapper) {
                  this.animationItem.container = createTag("canvas");
                  var e = this.animationItem.container.style;
                  (e.width = "100%"), (e.height = "100%");
                  var r = "0px 0px 0px";
                  (e.transformOrigin = r),
                    (e.mozTransformOrigin = r),
                    (e.webkitTransformOrigin = r),
                    (e["-webkit-transform"] = r),
                    (e.contentVisibility = this.renderConfig.contentVisibility),
                    this.animationItem.wrapper.appendChild(
                      this.animationItem.container
                    ),
                    (this.canvasContext =
                      this.animationItem.container.getContext("2d")),
                    this.renderConfig.className &&
                      this.animationItem.container.setAttribute(
                        "class",
                        this.renderConfig.className
                      ),
                    this.renderConfig.id &&
                      this.animationItem.container.setAttribute(
                        "id",
                        this.renderConfig.id
                      );
                } else this.canvasContext = this.renderConfig.context;
                this.contextData.setContext(this.canvasContext),
                  (this.data = t),
                  (this.layers = t.layers),
                  (this.transformCanvas = {
                    w: t.w,
                    h: t.h,
                    sx: 0,
                    sy: 0,
                    tx: 0,
                    ty: 0,
                  }),
                  this.setupGlobalData(t, document.body),
                  (this.globalData.canvasContext = this.canvasContext),
                  (this.globalData.renderer = this),
                  (this.globalData.isDashed = !1),
                  (this.globalData.progressiveLoad =
                    this.renderConfig.progressiveLoad),
                  (this.globalData.transformCanvas = this.transformCanvas),
                  (this.elements = createSizedArray(t.layers.length)),
                  this.updateContainerSize();
              }),
              (CanvasRendererBase.prototype.updateContainerSize = function (
                t,
                e
              ) {
                this.reset();
                var r, i;
                t
                  ? ((r = t),
                    (i = e),
                    (this.canvasContext.canvas.width = r),
                    (this.canvasContext.canvas.height = i))
                  : (this.animationItem.wrapper && this.animationItem.container
                      ? ((r = this.animationItem.wrapper.offsetWidth),
                        (i = this.animationItem.wrapper.offsetHeight))
                      : ((r = this.canvasContext.canvas.width),
                        (i = this.canvasContext.canvas.height)),
                    (this.canvasContext.canvas.width =
                      r * this.renderConfig.dpr),
                    (this.canvasContext.canvas.height =
                      i * this.renderConfig.dpr));
                var s, n;
                if (
                  this.renderConfig.preserveAspectRatio.indexOf("meet") !==
                    -1 ||
                  this.renderConfig.preserveAspectRatio.indexOf("slice") !== -1
                ) {
                  var a = this.renderConfig.preserveAspectRatio.split(" "),
                    h = a[1] || "meet",
                    o = a[0] || "xMidYMid",
                    f = o.substr(0, 4),
                    d = o.substr(4);
                  (s = r / i),
                    (n = this.transformCanvas.w / this.transformCanvas.h),
                    (n > s && h === "meet") || (n < s && h === "slice")
                      ? ((this.transformCanvas.sx =
                          r / (this.transformCanvas.w / this.renderConfig.dpr)),
                        (this.transformCanvas.sy =
                          r / (this.transformCanvas.w / this.renderConfig.dpr)))
                      : ((this.transformCanvas.sx =
                          i / (this.transformCanvas.h / this.renderConfig.dpr)),
                        (this.transformCanvas.sy =
                          i /
                          (this.transformCanvas.h / this.renderConfig.dpr))),
                    f === "xMid" &&
                    ((n < s && h === "meet") || (n > s && h === "slice"))
                      ? (this.transformCanvas.tx =
                          ((r -
                            this.transformCanvas.w *
                              (i / this.transformCanvas.h)) /
                            2) *
                          this.renderConfig.dpr)
                      : f === "xMax" &&
                        ((n < s && h === "meet") || (n > s && h === "slice"))
                      ? (this.transformCanvas.tx =
                          (r -
                            this.transformCanvas.w *
                              (i / this.transformCanvas.h)) *
                          this.renderConfig.dpr)
                      : (this.transformCanvas.tx = 0),
                    d === "YMid" &&
                    ((n > s && h === "meet") || (n < s && h === "slice"))
                      ? (this.transformCanvas.ty =
                          ((i -
                            this.transformCanvas.h *
                              (r / this.transformCanvas.w)) /
                            2) *
                          this.renderConfig.dpr)
                      : d === "YMax" &&
                        ((n > s && h === "meet") || (n < s && h === "slice"))
                      ? (this.transformCanvas.ty =
                          (i -
                            this.transformCanvas.h *
                              (r / this.transformCanvas.w)) *
                          this.renderConfig.dpr)
                      : (this.transformCanvas.ty = 0);
                } else
                  this.renderConfig.preserveAspectRatio === "none"
                    ? ((this.transformCanvas.sx =
                        r / (this.transformCanvas.w / this.renderConfig.dpr)),
                      (this.transformCanvas.sy =
                        i / (this.transformCanvas.h / this.renderConfig.dpr)),
                      (this.transformCanvas.tx = 0),
                      (this.transformCanvas.ty = 0))
                    : ((this.transformCanvas.sx = this.renderConfig.dpr),
                      (this.transformCanvas.sy = this.renderConfig.dpr),
                      (this.transformCanvas.tx = 0),
                      (this.transformCanvas.ty = 0));
                (this.transformCanvas.props = [
                  this.transformCanvas.sx,
                  0,
                  0,
                  0,
                  0,
                  this.transformCanvas.sy,
                  0,
                  0,
                  0,
                  0,
                  1,
                  0,
                  this.transformCanvas.tx,
                  this.transformCanvas.ty,
                  0,
                  1,
                ]),
                  this.ctxTransform(this.transformCanvas.props),
                  this.canvasContext.beginPath(),
                  this.canvasContext.rect(
                    0,
                    0,
                    this.transformCanvas.w,
                    this.transformCanvas.h
                  ),
                  this.canvasContext.closePath(),
                  this.canvasContext.clip(),
                  this.renderFrame(this.renderedFrame, !0);
              }),
              (CanvasRendererBase.prototype.destroy = function () {
                this.renderConfig.clearCanvas &&
                  this.animationItem.wrapper &&
                  (this.animationItem.wrapper.innerText = "");
                var t,
                  e = this.layers ? this.layers.length : 0;
                for (t = e - 1; t >= 0; t -= 1)
                  this.elements[t] &&
                    this.elements[t].destroy &&
                    this.elements[t].destroy();
                (this.elements.length = 0),
                  (this.globalData.canvasContext = null),
                  (this.animationItem.container = null),
                  (this.destroyed = !0);
              }),
              (CanvasRendererBase.prototype.renderFrame = function (t, e) {
                if (
                  !(
                    (this.renderedFrame === t &&
                      this.renderConfig.clearCanvas === !0 &&
                      !e) ||
                    this.destroyed ||
                    t === -1
                  )
                ) {
                  (this.renderedFrame = t),
                    (this.globalData.frameNum =
                      t - this.animationItem._isFirstFrame),
                    (this.globalData.frameId += 1),
                    (this.globalData._mdf =
                      !this.renderConfig.clearCanvas || e),
                    (this.globalData.projectInterface.currentFrame = t);
                  var r,
                    i = this.layers.length;
                  for (
                    this.completeLayers || this.checkLayers(t), r = i - 1;
                    r >= 0;
                    r -= 1
                  )
                    (this.completeLayers || this.elements[r]) &&
                      this.elements[r].prepareFrame(t - this.layers[r].st);
                  if (this.globalData._mdf) {
                    for (
                      this.renderConfig.clearCanvas === !0
                        ? this.canvasContext.clearRect(
                            0,
                            0,
                            this.transformCanvas.w,
                            this.transformCanvas.h
                          )
                        : this.save(),
                        r = i - 1;
                      r >= 0;
                      r -= 1
                    )
                      (this.completeLayers || this.elements[r]) &&
                        this.elements[r].renderFrame();
                    this.renderConfig.clearCanvas !== !0 && this.restore();
                  }
                }
              }),
              (CanvasRendererBase.prototype.buildItem = function (t) {
                var e = this.elements;
                if (!(e[t] || this.layers[t].ty === 99)) {
                  var r = this.createItem(
                    this.layers[t],
                    this,
                    this.globalData
                  );
                  (e[t] = r), r.initExpressions();
                }
              }),
              (CanvasRendererBase.prototype.checkPendingElements = function () {
                for (; this.pendingElements.length; ) {
                  var t = this.pendingElements.pop();
                  t.checkParenting();
                }
              }),
              (CanvasRendererBase.prototype.hide = function () {
                this.animationItem.container.style.display = "none";
              }),
              (CanvasRendererBase.prototype.show = function () {
                this.animationItem.container.style.display = "block";
              });
            function CanvasContext() {
              (this.opacity = -1),
                (this.transform = createTypedArray("float32", 16)),
                (this.fillStyle = ""),
                (this.strokeStyle = ""),
                (this.lineWidth = ""),
                (this.lineCap = ""),
                (this.lineJoin = ""),
                (this.miterLimit = ""),
                (this.id = Math.random());
            }
            function CVContextData() {
              (this.stack = []), (this.cArrPos = 0), (this.cTr = new Matrix());
              var t,
                e = 15;
              for (t = 0; t < e; t += 1) {
                var r = new CanvasContext();
                this.stack[t] = r;
              }
              (this._length = e),
                (this.nativeContext = null),
                (this.transformMat = new Matrix()),
                (this.currentOpacity = 1),
                (this.currentFillStyle = ""),
                (this.appliedFillStyle = ""),
                (this.currentStrokeStyle = ""),
                (this.appliedStrokeStyle = ""),
                (this.currentLineWidth = ""),
                (this.appliedLineWidth = ""),
                (this.currentLineCap = ""),
                (this.appliedLineCap = ""),
                (this.currentLineJoin = ""),
                (this.appliedLineJoin = ""),
                (this.appliedMiterLimit = ""),
                (this.currentMiterLimit = "");
            }
            (CVContextData.prototype.duplicate = function () {
              var t = this._length * 2,
                e = 0;
              for (e = this._length; e < t; e += 1)
                this.stack[e] = new CanvasContext();
              this._length = t;
            }),
              (CVContextData.prototype.reset = function () {
                (this.cArrPos = 0),
                  this.cTr.reset(),
                  (this.stack[this.cArrPos].opacity = 1);
              }),
              (CVContextData.prototype.restore = function (t) {
                this.cArrPos -= 1;
                var e = this.stack[this.cArrPos],
                  r = e.transform,
                  i,
                  s = this.cTr.props;
                for (i = 0; i < 16; i += 1) s[i] = r[i];
                if (t) {
                  this.nativeContext.restore();
                  var n = this.stack[this.cArrPos + 1];
                  (this.appliedFillStyle = n.fillStyle),
                    (this.appliedStrokeStyle = n.strokeStyle),
                    (this.appliedLineWidth = n.lineWidth),
                    (this.appliedLineCap = n.lineCap),
                    (this.appliedLineJoin = n.lineJoin),
                    (this.appliedMiterLimit = n.miterLimit);
                }
                this.nativeContext.setTransform(
                  r[0],
                  r[1],
                  r[4],
                  r[5],
                  r[12],
                  r[13]
                ),
                  (t ||
                    (e.opacity !== -1 && this.currentOpacity !== e.opacity)) &&
                    ((this.nativeContext.globalAlpha = e.opacity),
                    (this.currentOpacity = e.opacity)),
                  (this.currentFillStyle = e.fillStyle),
                  (this.currentStrokeStyle = e.strokeStyle),
                  (this.currentLineWidth = e.lineWidth),
                  (this.currentLineCap = e.lineCap),
                  (this.currentLineJoin = e.lineJoin),
                  (this.currentMiterLimit = e.miterLimit);
              }),
              (CVContextData.prototype.save = function (t) {
                t && this.nativeContext.save();
                var e = this.cTr.props;
                this._length <= this.cArrPos && this.duplicate();
                var r = this.stack[this.cArrPos],
                  i;
                for (i = 0; i < 16; i += 1) r.transform[i] = e[i];
                this.cArrPos += 1;
                var s = this.stack[this.cArrPos];
                (s.opacity = r.opacity),
                  (s.fillStyle = r.fillStyle),
                  (s.strokeStyle = r.strokeStyle),
                  (s.lineWidth = r.lineWidth),
                  (s.lineCap = r.lineCap),
                  (s.lineJoin = r.lineJoin),
                  (s.miterLimit = r.miterLimit);
              }),
              (CVContextData.prototype.setOpacity = function (t) {
                this.stack[this.cArrPos].opacity = t;
              }),
              (CVContextData.prototype.setContext = function (t) {
                this.nativeContext = t;
              }),
              (CVContextData.prototype.fillStyle = function (t) {
                this.stack[this.cArrPos].fillStyle !== t &&
                  ((this.currentFillStyle = t),
                  (this.stack[this.cArrPos].fillStyle = t));
              }),
              (CVContextData.prototype.strokeStyle = function (t) {
                this.stack[this.cArrPos].strokeStyle !== t &&
                  ((this.currentStrokeStyle = t),
                  (this.stack[this.cArrPos].strokeStyle = t));
              }),
              (CVContextData.prototype.lineWidth = function (t) {
                this.stack[this.cArrPos].lineWidth !== t &&
                  ((this.currentLineWidth = t),
                  (this.stack[this.cArrPos].lineWidth = t));
              }),
              (CVContextData.prototype.lineCap = function (t) {
                this.stack[this.cArrPos].lineCap !== t &&
                  ((this.currentLineCap = t),
                  (this.stack[this.cArrPos].lineCap = t));
              }),
              (CVContextData.prototype.lineJoin = function (t) {
                this.stack[this.cArrPos].lineJoin !== t &&
                  ((this.currentLineJoin = t),
                  (this.stack[this.cArrPos].lineJoin = t));
              }),
              (CVContextData.prototype.miterLimit = function (t) {
                this.stack[this.cArrPos].miterLimit !== t &&
                  ((this.currentMiterLimit = t),
                  (this.stack[this.cArrPos].miterLimit = t));
              }),
              (CVContextData.prototype.transform = function (t) {
                this.transformMat.cloneFromProps(t);
                var e = this.cTr;
                this.transformMat.multiply(e),
                  e.cloneFromProps(this.transformMat.props);
                var r = e.props;
                this.nativeContext.setTransform(
                  r[0],
                  r[1],
                  r[4],
                  r[5],
                  r[12],
                  r[13]
                );
              }),
              (CVContextData.prototype.opacity = function (t) {
                var e = this.stack[this.cArrPos].opacity;
                (e *= t < 0 ? 0 : t),
                  this.stack[this.cArrPos].opacity !== e &&
                    (this.currentOpacity !== t &&
                      ((this.nativeContext.globalAlpha = t),
                      (this.currentOpacity = t)),
                    (this.stack[this.cArrPos].opacity = e));
              }),
              (CVContextData.prototype.fill = function (t) {
                this.appliedFillStyle !== this.currentFillStyle &&
                  ((this.appliedFillStyle = this.currentFillStyle),
                  (this.nativeContext.fillStyle = this.appliedFillStyle)),
                  this.nativeContext.fill(t);
              }),
              (CVContextData.prototype.fillRect = function (t, e, r, i) {
                this.appliedFillStyle !== this.currentFillStyle &&
                  ((this.appliedFillStyle = this.currentFillStyle),
                  (this.nativeContext.fillStyle = this.appliedFillStyle)),
                  this.nativeContext.fillRect(t, e, r, i);
              }),
              (CVContextData.prototype.stroke = function () {
                this.appliedStrokeStyle !== this.currentStrokeStyle &&
                  ((this.appliedStrokeStyle = this.currentStrokeStyle),
                  (this.nativeContext.strokeStyle = this.appliedStrokeStyle)),
                  this.appliedLineWidth !== this.currentLineWidth &&
                    ((this.appliedLineWidth = this.currentLineWidth),
                    (this.nativeContext.lineWidth = this.appliedLineWidth)),
                  this.appliedLineCap !== this.currentLineCap &&
                    ((this.appliedLineCap = this.currentLineCap),
                    (this.nativeContext.lineCap = this.appliedLineCap)),
                  this.appliedLineJoin !== this.currentLineJoin &&
                    ((this.appliedLineJoin = this.currentLineJoin),
                    (this.nativeContext.lineJoin = this.appliedLineJoin)),
                  this.appliedMiterLimit !== this.currentMiterLimit &&
                    ((this.appliedMiterLimit = this.currentMiterLimit),
                    (this.nativeContext.miterLimit = this.appliedMiterLimit)),
                  this.nativeContext.stroke();
              });
            function CVCompElement(t, e, r) {
              (this.completeLayers = !1),
                (this.layers = t.layers),
                (this.pendingElements = []),
                (this.elements = createSizedArray(this.layers.length)),
                this.initElement(t, e, r),
                (this.tm = t.tm
                  ? PropertyFactory.getProp(this, t.tm, 0, e.frameRate, this)
                  : { _placeholder: !0 });
            }
            extendPrototype(
              [CanvasRendererBase, ICompElement, CVBaseElement],
              CVCompElement
            ),
              (CVCompElement.prototype.renderInnerContent = function () {
                var t = this.canvasContext;
                t.beginPath(),
                  t.moveTo(0, 0),
                  t.lineTo(this.data.w, 0),
                  t.lineTo(this.data.w, this.data.h),
                  t.lineTo(0, this.data.h),
                  t.lineTo(0, 0),
                  t.clip();
                var e,
                  r = this.layers.length;
                for (e = r - 1; e >= 0; e -= 1)
                  (this.completeLayers || this.elements[e]) &&
                    this.elements[e].renderFrame();
              }),
              (CVCompElement.prototype.destroy = function () {
                var t,
                  e = this.layers.length;
                for (t = e - 1; t >= 0; t -= 1)
                  this.elements[t] && this.elements[t].destroy();
                (this.layers = null), (this.elements = null);
              }),
              (CVCompElement.prototype.createComp = function (t) {
                return new CVCompElement(t, this.globalData, this);
              });
            function CanvasRenderer(t, e) {
              (this.animationItem = t),
                (this.renderConfig = {
                  clearCanvas:
                    e && e.clearCanvas !== void 0 ? e.clearCanvas : !0,
                  context: (e && e.context) || null,
                  progressiveLoad: (e && e.progressiveLoad) || !1,
                  preserveAspectRatio:
                    (e && e.preserveAspectRatio) || "xMidYMid meet",
                  imagePreserveAspectRatio:
                    (e && e.imagePreserveAspectRatio) || "xMidYMid slice",
                  contentVisibility: (e && e.contentVisibility) || "visible",
                  className: (e && e.className) || "",
                  id: (e && e.id) || "",
                  runExpressions:
                    !e || e.runExpressions === void 0 || e.runExpressions,
                }),
                (this.renderConfig.dpr = (e && e.dpr) || 1),
                this.animationItem.wrapper &&
                  (this.renderConfig.dpr =
                    (e && e.dpr) || window.devicePixelRatio || 1),
                (this.renderedFrame = -1),
                (this.globalData = {
                  frameNum: -1,
                  _mdf: !1,
                  renderConfig: this.renderConfig,
                  currentGlobalAlpha: -1,
                }),
                (this.contextData = new CVContextData()),
                (this.elements = []),
                (this.pendingElements = []),
                (this.transformMat = new Matrix()),
                (this.completeLayers = !1),
                (this.rendererType = "canvas"),
                this.renderConfig.clearCanvas &&
                  ((this.ctxTransform = this.contextData.transform.bind(
                    this.contextData
                  )),
                  (this.ctxOpacity = this.contextData.opacity.bind(
                    this.contextData
                  )),
                  (this.ctxFillStyle = this.contextData.fillStyle.bind(
                    this.contextData
                  )),
                  (this.ctxStrokeStyle = this.contextData.strokeStyle.bind(
                    this.contextData
                  )),
                  (this.ctxLineWidth = this.contextData.lineWidth.bind(
                    this.contextData
                  )),
                  (this.ctxLineCap = this.contextData.lineCap.bind(
                    this.contextData
                  )),
                  (this.ctxLineJoin = this.contextData.lineJoin.bind(
                    this.contextData
                  )),
                  (this.ctxMiterLimit = this.contextData.miterLimit.bind(
                    this.contextData
                  )),
                  (this.ctxFill = this.contextData.fill.bind(this.contextData)),
                  (this.ctxFillRect = this.contextData.fillRect.bind(
                    this.contextData
                  )),
                  (this.ctxStroke = this.contextData.stroke.bind(
                    this.contextData
                  )),
                  (this.save = this.contextData.save.bind(this.contextData)));
            }
            extendPrototype([CanvasRendererBase], CanvasRenderer),
              (CanvasRenderer.prototype.createComp = function (t) {
                return new CVCompElement(t, this.globalData, this);
              });
            function HBaseElement() {}
            (HBaseElement.prototype = {
              checkBlendMode: function () {},
              initRendererElement: function () {
                (this.baseElement = createTag(this.data.tg || "div")),
                  this.data.hasMask
                    ? ((this.svgElement = createNS("svg")),
                      (this.layerElement = createNS("g")),
                      (this.maskedElement = this.layerElement),
                      this.svgElement.appendChild(this.layerElement),
                      this.baseElement.appendChild(this.svgElement))
                    : (this.layerElement = this.baseElement),
                  styleDiv(this.baseElement);
              },
              createContainerElements: function () {
                (this.renderableEffectsManager = new CVEffects(this)),
                  (this.transformedElement = this.baseElement),
                  (this.maskedElement = this.layerElement),
                  this.data.ln &&
                    this.layerElement.setAttribute("id", this.data.ln),
                  this.data.cl &&
                    this.layerElement.setAttribute("class", this.data.cl),
                  this.data.bm !== 0 && this.setBlendMode();
              },
              renderElement: function () {
                var e = this.transformedElement
                  ? this.transformedElement.style
                  : {};
                if (this.finalTransform._matMdf) {
                  var r = this.finalTransform.mat.toCSS();
                  (e.transform = r), (e.webkitTransform = r);
                }
                this.finalTransform._opMdf &&
                  (e.opacity = this.finalTransform.mProp.o.v);
              },
              renderFrame: function () {
                this.data.hd ||
                  this.hidden ||
                  (this.renderTransform(),
                  this.renderRenderable(),
                  this.renderElement(),
                  this.renderInnerContent(),
                  this._isFirstFrame && (this._isFirstFrame = !1));
              },
              destroy: function () {
                (this.layerElement = null),
                  (this.transformedElement = null),
                  this.matteElement && (this.matteElement = null),
                  this.maskManager &&
                    (this.maskManager.destroy(), (this.maskManager = null));
              },
              createRenderableComponents: function () {
                this.maskManager = new MaskElement(
                  this.data,
                  this,
                  this.globalData
                );
              },
              addEffects: function () {},
              setMatte: function () {},
            }),
              (HBaseElement.prototype.getBaseElement =
                SVGBaseElement.prototype.getBaseElement),
              (HBaseElement.prototype.destroyBaseElement =
                HBaseElement.prototype.destroy),
              (HBaseElement.prototype.buildElementParenting =
                BaseRenderer.prototype.buildElementParenting);
            function HSolidElement(t, e, r) {
              this.initElement(t, e, r);
            }
            extendPrototype(
              [
                BaseElement,
                TransformElement,
                HBaseElement,
                HierarchyElement,
                FrameElement,
                RenderableDOMElement,
              ],
              HSolidElement
            ),
              (HSolidElement.prototype.createContent = function () {
                var t;
                this.data.hasMask
                  ? ((t = createNS("rect")),
                    t.setAttribute("width", this.data.sw),
                    t.setAttribute("height", this.data.sh),
                    t.setAttribute("fill", this.data.sc),
                    this.svgElement.setAttribute("width", this.data.sw),
                    this.svgElement.setAttribute("height", this.data.sh))
                  : ((t = createTag("div")),
                    (t.style.width = this.data.sw + "px"),
                    (t.style.height = this.data.sh + "px"),
                    (t.style.backgroundColor = this.data.sc)),
                  this.layerElement.appendChild(t);
              });
            function HShapeElement(t, e, r) {
              (this.shapes = []),
                (this.shapesData = t.shapes),
                (this.stylesList = []),
                (this.shapeModifiers = []),
                (this.itemsData = []),
                (this.processedElements = []),
                (this.animatedContents = []),
                (this.shapesContainer = createNS("g")),
                this.initElement(t, e, r),
                (this.prevViewData = []),
                (this.currentBBox = { x: 999999, y: -999999, h: 0, w: 0 });
            }
            extendPrototype(
              [
                BaseElement,
                TransformElement,
                HSolidElement,
                SVGShapeElement,
                HBaseElement,
                HierarchyElement,
                FrameElement,
                RenderableElement,
              ],
              HShapeElement
            ),
              (HShapeElement.prototype._renderShapeFrame =
                HShapeElement.prototype.renderInnerContent),
              (HShapeElement.prototype.createContent = function () {
                var t;
                if (((this.baseElement.style.fontSize = 0), this.data.hasMask))
                  this.layerElement.appendChild(this.shapesContainer),
                    (t = this.svgElement);
                else {
                  t = createNS("svg");
                  var e = this.comp.data
                    ? this.comp.data
                    : this.globalData.compSize;
                  t.setAttribute("width", e.w),
                    t.setAttribute("height", e.h),
                    t.appendChild(this.shapesContainer),
                    this.layerElement.appendChild(t);
                }
                this.searchShapes(
                  this.shapesData,
                  this.itemsData,
                  this.prevViewData,
                  this.shapesContainer,
                  0,
                  [],
                  !0
                ),
                  this.filterUniqueShapes(),
                  (this.shapeCont = t);
              }),
              (HShapeElement.prototype.getTransformedPoint = function (t, e) {
                var r,
                  i = t.length;
                for (r = 0; r < i; r += 1)
                  e = t[r].mProps.v.applyToPointArray(e[0], e[1], 0);
                return e;
              }),
              (HShapeElement.prototype.calculateShapeBoundingBox = function (
                t,
                e
              ) {
                var r = t.sh.v,
                  i = t.transformers,
                  s,
                  n = r._length,
                  a,
                  h,
                  o,
                  f;
                if (!(n <= 1)) {
                  for (s = 0; s < n - 1; s += 1)
                    (a = this.getTransformedPoint(i, r.v[s])),
                      (h = this.getTransformedPoint(i, r.o[s])),
                      (o = this.getTransformedPoint(i, r.i[s + 1])),
                      (f = this.getTransformedPoint(i, r.v[s + 1])),
                      this.checkBounds(a, h, o, f, e);
                  r.c &&
                    ((a = this.getTransformedPoint(i, r.v[s])),
                    (h = this.getTransformedPoint(i, r.o[s])),
                    (o = this.getTransformedPoint(i, r.i[0])),
                    (f = this.getTransformedPoint(i, r.v[0])),
                    this.checkBounds(a, h, o, f, e));
                }
              }),
              (HShapeElement.prototype.checkBounds = function (t, e, r, i, s) {
                this.getBoundsOfCurve(t, e, r, i);
                var n = this.shapeBoundingBox;
                (s.x = bmMin(n.left, s.x)),
                  (s.xMax = bmMax(n.right, s.xMax)),
                  (s.y = bmMin(n.top, s.y)),
                  (s.yMax = bmMax(n.bottom, s.yMax));
              }),
              (HShapeElement.prototype.shapeBoundingBox = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }),
              (HShapeElement.prototype.tempBoundingBox = {
                x: 0,
                xMax: 0,
                y: 0,
                yMax: 0,
                width: 0,
                height: 0,
              }),
              (HShapeElement.prototype.getBoundsOfCurve = function (
                t,
                e,
                r,
                i
              ) {
                for (
                  var s = [
                      [t[0], i[0]],
                      [t[1], i[1]],
                    ],
                    n,
                    a,
                    h,
                    o,
                    f,
                    d,
                    P,
                    c = 0;
                  c < 2;
                  ++c
                )
                  (a = 6 * t[c] - 12 * e[c] + 6 * r[c]),
                    (n = -3 * t[c] + 9 * e[c] - 9 * r[c] + 3 * i[c]),
                    (h = 3 * e[c] - 3 * t[c]),
                    (a |= 0),
                    (n |= 0),
                    (h |= 0),
                    (n === 0 && a === 0) ||
                      (n === 0
                        ? ((o = -h / a),
                          o > 0 &&
                            o < 1 &&
                            s[c].push(this.calculateF(o, t, e, r, i, c)))
                        : ((f = a * a - 4 * h * n),
                          f >= 0 &&
                            ((d = (-a + bmSqrt(f)) / (2 * n)),
                            d > 0 &&
                              d < 1 &&
                              s[c].push(this.calculateF(d, t, e, r, i, c)),
                            (P = (-a - bmSqrt(f)) / (2 * n)),
                            P > 0 &&
                              P < 1 &&
                              s[c].push(this.calculateF(P, t, e, r, i, c)))));
                (this.shapeBoundingBox.left = bmMin.apply(null, s[0])),
                  (this.shapeBoundingBox.top = bmMin.apply(null, s[1])),
                  (this.shapeBoundingBox.right = bmMax.apply(null, s[0])),
                  (this.shapeBoundingBox.bottom = bmMax.apply(null, s[1]));
              }),
              (HShapeElement.prototype.calculateF = function (
                t,
                e,
                r,
                i,
                s,
                n
              ) {
                return (
                  bmPow(1 - t, 3) * e[n] +
                  3 * bmPow(1 - t, 2) * t * r[n] +
                  3 * (1 - t) * bmPow(t, 2) * i[n] +
                  bmPow(t, 3) * s[n]
                );
              }),
              (HShapeElement.prototype.calculateBoundingBox = function (t, e) {
                var r,
                  i = t.length;
                for (r = 0; r < i; r += 1)
                  t[r] && t[r].sh
                    ? this.calculateShapeBoundingBox(t[r], e)
                    : t[r] && t[r].it
                    ? this.calculateBoundingBox(t[r].it, e)
                    : t[r] &&
                      t[r].style &&
                      t[r].w &&
                      this.expandStrokeBoundingBox(t[r].w, e);
              }),
              (HShapeElement.prototype.expandStrokeBoundingBox = function (
                t,
                e
              ) {
                var r = 0;
                if (t.keyframes) {
                  for (var i = 0; i < t.keyframes.length; i += 1) {
                    var s = t.keyframes[i].s;
                    s > r && (r = s);
                  }
                  r *= t.mult;
                } else r = t.v * t.mult;
                (e.x -= r), (e.xMax += r), (e.y -= r), (e.yMax += r);
              }),
              (HShapeElement.prototype.currentBoxContains = function (t) {
                return (
                  this.currentBBox.x <= t.x &&
                  this.currentBBox.y <= t.y &&
                  this.currentBBox.width + this.currentBBox.x >=
                    t.x + t.width &&
                  this.currentBBox.height + this.currentBBox.y >= t.y + t.height
                );
              }),
              (HShapeElement.prototype.renderInnerContent = function () {
                if (
                  (this._renderShapeFrame(),
                  !this.hidden && (this._isFirstFrame || this._mdf))
                ) {
                  var t = this.tempBoundingBox,
                    e = 999999;
                  if (
                    ((t.x = e),
                    (t.xMax = -e),
                    (t.y = e),
                    (t.yMax = -e),
                    this.calculateBoundingBox(this.itemsData, t),
                    (t.width = t.xMax < t.x ? 0 : t.xMax - t.x),
                    (t.height = t.yMax < t.y ? 0 : t.yMax - t.y),
                    this.currentBoxContains(t))
                  )
                    return;
                  var r = !1;
                  if (
                    (this.currentBBox.w !== t.width &&
                      ((this.currentBBox.w = t.width),
                      this.shapeCont.setAttribute("width", t.width),
                      (r = !0)),
                    this.currentBBox.h !== t.height &&
                      ((this.currentBBox.h = t.height),
                      this.shapeCont.setAttribute("height", t.height),
                      (r = !0)),
                    r ||
                      this.currentBBox.x !== t.x ||
                      this.currentBBox.y !== t.y)
                  ) {
                    (this.currentBBox.w = t.width),
                      (this.currentBBox.h = t.height),
                      (this.currentBBox.x = t.x),
                      (this.currentBBox.y = t.y),
                      this.shapeCont.setAttribute(
                        "viewBox",
                        this.currentBBox.x +
                          " " +
                          this.currentBBox.y +
                          " " +
                          this.currentBBox.w +
                          " " +
                          this.currentBBox.h
                      );
                    var i = this.shapeCont.style,
                      s =
                        "translate(" +
                        this.currentBBox.x +
                        "px," +
                        this.currentBBox.y +
                        "px)";
                    (i.transform = s), (i.webkitTransform = s);
                  }
                }
              });
            function HTextElement(t, e, r) {
              (this.textSpans = []),
                (this.textPaths = []),
                (this.currentBBox = { x: 999999, y: -999999, h: 0, w: 0 }),
                (this.renderType = "svg"),
                (this.isMasked = !1),
                this.initElement(t, e, r);
            }
            extendPrototype(
              [
                BaseElement,
                TransformElement,
                HBaseElement,
                HierarchyElement,
                FrameElement,
                RenderableDOMElement,
                ITextElement,
              ],
              HTextElement
            ),
              (HTextElement.prototype.createContent = function () {
                if (((this.isMasked = this.checkMasks()), this.isMasked)) {
                  (this.renderType = "svg"),
                    (this.compW = this.comp.data.w),
                    (this.compH = this.comp.data.h),
                    this.svgElement.setAttribute("width", this.compW),
                    this.svgElement.setAttribute("height", this.compH);
                  var t = createNS("g");
                  this.maskedElement.appendChild(t), (this.innerElem = t);
                } else
                  (this.renderType = "html"),
                    (this.innerElem = this.layerElement);
                this.checkParenting();
              }),
              (HTextElement.prototype.buildNewText = function () {
                var t = this.textProperty.currentData;
                this.renderedLetters = createSizedArray(t.l ? t.l.length : 0);
                var e = this.innerElem.style,
                  r = t.fc ? this.buildColor(t.fc) : "rgba(0,0,0,0)";
                (e.fill = r),
                  (e.color = r),
                  t.sc &&
                    ((e.stroke = this.buildColor(t.sc)),
                    (e.strokeWidth = t.sw + "px"));
                var i = this.globalData.fontManager.getFontByName(t.f);
                if (!this.globalData.fontManager.chars)
                  if (
                    ((e.fontSize = t.finalSize + "px"),
                    (e.lineHeight = t.finalSize + "px"),
                    i.fClass)
                  )
                    this.innerElem.className = i.fClass;
                  else {
                    e.fontFamily = i.fFamily;
                    var s = t.fWeight,
                      n = t.fStyle;
                    (e.fontStyle = n), (e.fontWeight = s);
                  }
                var a,
                  h,
                  o = t.l;
                h = o.length;
                var f,
                  d,
                  P,
                  c = this.mHelper,
                  b,
                  v = "",
                  m = 0;
                for (a = 0; a < h; a += 1) {
                  if (
                    (this.globalData.fontManager.chars
                      ? (this.textPaths[m]
                          ? (f = this.textPaths[m])
                          : ((f = createNS("path")),
                            f.setAttribute("stroke-linecap", lineCapEnum[1]),
                            f.setAttribute("stroke-linejoin", lineJoinEnum[2]),
                            f.setAttribute("stroke-miterlimit", "4")),
                        this.isMasked ||
                          (this.textSpans[m]
                            ? ((d = this.textSpans[m]), (P = d.children[0]))
                            : ((d = createTag("div")),
                              (d.style.lineHeight = 0),
                              (P = createNS("svg")),
                              P.appendChild(f),
                              styleDiv(d))))
                      : this.isMasked
                      ? (f = this.textPaths[m]
                          ? this.textPaths[m]
                          : createNS("text"))
                      : this.textSpans[m]
                      ? ((d = this.textSpans[m]), (f = this.textPaths[m]))
                      : ((d = createTag("span")),
                        styleDiv(d),
                        (f = createTag("span")),
                        styleDiv(f),
                        d.appendChild(f)),
                    this.globalData.fontManager.chars)
                  ) {
                    var C = this.globalData.fontManager.getCharData(
                        t.finalText[a],
                        i.fStyle,
                        this.globalData.fontManager.getFontByName(t.f).fFamily
                      ),
                      p;
                    if (
                      (C ? (p = C.data) : (p = null),
                      c.reset(),
                      p &&
                        p.shapes &&
                        p.shapes.length &&
                        ((b = p.shapes[0].it),
                        c.scale(t.finalSize / 100, t.finalSize / 100),
                        (v = this.createPathShape(c, b)),
                        f.setAttribute("d", v)),
                      this.isMasked)
                    )
                      this.innerElem.appendChild(f);
                    else {
                      if ((this.innerElem.appendChild(d), p && p.shapes)) {
                        document.body.appendChild(P);
                        var u = P.getBBox();
                        P.setAttribute("width", u.width + 2),
                          P.setAttribute("height", u.height + 2),
                          P.setAttribute(
                            "viewBox",
                            u.x -
                              1 +
                              " " +
                              (u.y - 1) +
                              " " +
                              (u.width + 2) +
                              " " +
                              (u.height + 2)
                          );
                        var l = P.style,
                          y =
                            "translate(" +
                            (u.x - 1) +
                            "px," +
                            (u.y - 1) +
                            "px)";
                        (l.transform = y),
                          (l.webkitTransform = y),
                          (o[a].yOffset = u.y - 1);
                      } else
                        P.setAttribute("width", 1), P.setAttribute("height", 1);
                      d.appendChild(P);
                    }
                  } else if (
                    ((f.textContent = o[a].val),
                    f.setAttributeNS(
                      "http://www.w3.org/XML/1998/namespace",
                      "xml:space",
                      "preserve"
                    ),
                    this.isMasked)
                  )
                    this.innerElem.appendChild(f);
                  else {
                    this.innerElem.appendChild(d);
                    var E = f.style,
                      x = "translate3d(0," + -t.finalSize / 1.2 + "px,0)";
                    (E.transform = x), (E.webkitTransform = x);
                  }
                  this.isMasked
                    ? (this.textSpans[m] = f)
                    : (this.textSpans[m] = d),
                    (this.textSpans[m].style.display = "block"),
                    (this.textPaths[m] = f),
                    (m += 1);
                }
                for (; m < this.textSpans.length; )
                  (this.textSpans[m].style.display = "none"), (m += 1);
              }),
              (HTextElement.prototype.renderInnerContent = function () {
                this.validateText();
                var t;
                if (this.data.singleShape) {
                  if (!this._isFirstFrame && !this.lettersChangedFlag) return;
                  if (this.isMasked && this.finalTransform._matMdf) {
                    this.svgElement.setAttribute(
                      "viewBox",
                      -this.finalTransform.mProp.p.v[0] +
                        " " +
                        -this.finalTransform.mProp.p.v[1] +
                        " " +
                        this.compW +
                        " " +
                        this.compH
                    ),
                      (t = this.svgElement.style);
                    var e =
                      "translate(" +
                      -this.finalTransform.mProp.p.v[0] +
                      "px," +
                      -this.finalTransform.mProp.p.v[1] +
                      "px)";
                    (t.transform = e), (t.webkitTransform = e);
                  }
                }
                if (
                  (this.textAnimator.getMeasures(
                    this.textProperty.currentData,
                    this.lettersChangedFlag
                  ),
                  !(
                    !this.lettersChangedFlag &&
                    !this.textAnimator.lettersChangedFlag
                  ))
                ) {
                  var r,
                    i,
                    s = 0,
                    n = this.textAnimator.renderedLetters,
                    a = this.textProperty.currentData.l;
                  i = a.length;
                  var h, o, f;
                  for (r = 0; r < i; r += 1)
                    a[r].n
                      ? (s += 1)
                      : ((o = this.textSpans[r]),
                        (f = this.textPaths[r]),
                        (h = n[s]),
                        (s += 1),
                        h._mdf.m &&
                          (this.isMasked
                            ? o.setAttribute("transform", h.m)
                            : ((o.style.webkitTransform = h.m),
                              (o.style.transform = h.m))),
                        (o.style.opacity = h.o),
                        h.sw &&
                          h._mdf.sw &&
                          f.setAttribute("stroke-width", h.sw),
                        h.sc && h._mdf.sc && f.setAttribute("stroke", h.sc),
                        h.fc &&
                          h._mdf.fc &&
                          (f.setAttribute("fill", h.fc),
                          (f.style.color = h.fc)));
                  if (
                    this.innerElem.getBBox &&
                    !this.hidden &&
                    (this._isFirstFrame || this._mdf)
                  ) {
                    var d = this.innerElem.getBBox();
                    this.currentBBox.w !== d.width &&
                      ((this.currentBBox.w = d.width),
                      this.svgElement.setAttribute("width", d.width)),
                      this.currentBBox.h !== d.height &&
                        ((this.currentBBox.h = d.height),
                        this.svgElement.setAttribute("height", d.height));
                    var P = 1;
                    if (
                      this.currentBBox.w !== d.width + P * 2 ||
                      this.currentBBox.h !== d.height + P * 2 ||
                      this.currentBBox.x !== d.x - P ||
                      this.currentBBox.y !== d.y - P
                    ) {
                      (this.currentBBox.w = d.width + P * 2),
                        (this.currentBBox.h = d.height + P * 2),
                        (this.currentBBox.x = d.x - P),
                        (this.currentBBox.y = d.y - P),
                        this.svgElement.setAttribute(
                          "viewBox",
                          this.currentBBox.x +
                            " " +
                            this.currentBBox.y +
                            " " +
                            this.currentBBox.w +
                            " " +
                            this.currentBBox.h
                        ),
                        (t = this.svgElement.style);
                      var c =
                        "translate(" +
                        this.currentBBox.x +
                        "px," +
                        this.currentBBox.y +
                        "px)";
                      (t.transform = c), (t.webkitTransform = c);
                    }
                  }
                }
              });
            function HCameraElement(t, e, r) {
              this.initFrame(),
                this.initBaseData(t, e, r),
                this.initHierarchy();
              var i = PropertyFactory.getProp;
              if (
                ((this.pe = i(this, t.pe, 0, 0, this)),
                t.ks.p.s
                  ? ((this.px = i(this, t.ks.p.x, 1, 0, this)),
                    (this.py = i(this, t.ks.p.y, 1, 0, this)),
                    (this.pz = i(this, t.ks.p.z, 1, 0, this)))
                  : (this.p = i(this, t.ks.p, 1, 0, this)),
                t.ks.a && (this.a = i(this, t.ks.a, 1, 0, this)),
                t.ks.or.k.length && t.ks.or.k[0].to)
              ) {
                var s,
                  n = t.ks.or.k.length;
                for (s = 0; s < n; s += 1)
                  (t.ks.or.k[s].to = null), (t.ks.or.k[s].ti = null);
              }
              (this.or = i(this, t.ks.or, 1, degToRads, this)),
                (this.or.sh = !0),
                (this.rx = i(this, t.ks.rx, 0, degToRads, this)),
                (this.ry = i(this, t.ks.ry, 0, degToRads, this)),
                (this.rz = i(this, t.ks.rz, 0, degToRads, this)),
                (this.mat = new Matrix()),
                (this._prevMat = new Matrix()),
                (this._isFirstFrame = !0),
                (this.finalTransform = { mProp: this });
            }
            extendPrototype(
              [BaseElement, FrameElement, HierarchyElement],
              HCameraElement
            ),
              (HCameraElement.prototype.setup = function () {
                var t,
                  e = this.comp.threeDElements.length,
                  r,
                  i,
                  s;
                for (t = 0; t < e; t += 1)
                  if (((r = this.comp.threeDElements[t]), r.type === "3d")) {
                    (i = r.perspectiveElem.style), (s = r.container.style);
                    var n = this.pe.v + "px",
                      a = "0px 0px 0px",
                      h = "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)";
                    (i.perspective = n),
                      (i.webkitPerspective = n),
                      (s.transformOrigin = a),
                      (s.mozTransformOrigin = a),
                      (s.webkitTransformOrigin = a),
                      (i.transform = h),
                      (i.webkitTransform = h);
                  }
              }),
              (HCameraElement.prototype.createElements = function () {}),
              (HCameraElement.prototype.hide = function () {}),
              (HCameraElement.prototype.renderFrame = function () {
                var t = this._isFirstFrame,
                  e,
                  r;
                if (this.hierarchy)
                  for (r = this.hierarchy.length, e = 0; e < r; e += 1)
                    t = this.hierarchy[e].finalTransform.mProp._mdf || t;
                if (
                  t ||
                  this.pe._mdf ||
                  (this.p && this.p._mdf) ||
                  (this.px && (this.px._mdf || this.py._mdf || this.pz._mdf)) ||
                  this.rx._mdf ||
                  this.ry._mdf ||
                  this.rz._mdf ||
                  this.or._mdf ||
                  (this.a && this.a._mdf)
                ) {
                  if ((this.mat.reset(), this.hierarchy))
                    for (r = this.hierarchy.length - 1, e = r; e >= 0; e -= 1) {
                      var i = this.hierarchy[e].finalTransform.mProp;
                      this.mat.translate(-i.p.v[0], -i.p.v[1], i.p.v[2]),
                        this.mat
                          .rotateX(-i.or.v[0])
                          .rotateY(-i.or.v[1])
                          .rotateZ(i.or.v[2]),
                        this.mat
                          .rotateX(-i.rx.v)
                          .rotateY(-i.ry.v)
                          .rotateZ(i.rz.v),
                        this.mat.scale(
                          1 / i.s.v[0],
                          1 / i.s.v[1],
                          1 / i.s.v[2]
                        ),
                        this.mat.translate(i.a.v[0], i.a.v[1], i.a.v[2]);
                    }
                  if (
                    (this.p
                      ? this.mat.translate(
                          -this.p.v[0],
                          -this.p.v[1],
                          this.p.v[2]
                        )
                      : this.mat.translate(-this.px.v, -this.py.v, this.pz.v),
                    this.a)
                  ) {
                    var s;
                    this.p
                      ? (s = [
                          this.p.v[0] - this.a.v[0],
                          this.p.v[1] - this.a.v[1],
                          this.p.v[2] - this.a.v[2],
                        ])
                      : (s = [
                          this.px.v - this.a.v[0],
                          this.py.v - this.a.v[1],
                          this.pz.v - this.a.v[2],
                        ]);
                    var n = Math.sqrt(
                        Math.pow(s[0], 2) +
                          Math.pow(s[1], 2) +
                          Math.pow(s[2], 2)
                      ),
                      a = [s[0] / n, s[1] / n, s[2] / n],
                      h = Math.sqrt(a[2] * a[2] + a[0] * a[0]),
                      o = Math.atan2(a[1], h),
                      f = Math.atan2(a[0], -a[2]);
                    this.mat.rotateY(f).rotateX(-o);
                  }
                  this.mat
                    .rotateX(-this.rx.v)
                    .rotateY(-this.ry.v)
                    .rotateZ(this.rz.v),
                    this.mat
                      .rotateX(-this.or.v[0])
                      .rotateY(-this.or.v[1])
                      .rotateZ(this.or.v[2]),
                    this.mat.translate(
                      this.globalData.compSize.w / 2,
                      this.globalData.compSize.h / 2,
                      0
                    ),
                    this.mat.translate(0, 0, this.pe.v);
                  var d = !this._prevMat.equals(this.mat);
                  if ((d || this.pe._mdf) && this.comp.threeDElements) {
                    r = this.comp.threeDElements.length;
                    var P, c, b;
                    for (e = 0; e < r; e += 1)
                      if (
                        ((P = this.comp.threeDElements[e]), P.type === "3d")
                      ) {
                        if (d) {
                          var v = this.mat.toCSS();
                          (b = P.container.style),
                            (b.transform = v),
                            (b.webkitTransform = v);
                        }
                        this.pe._mdf &&
                          ((c = P.perspectiveElem.style),
                          (c.perspective = this.pe.v + "px"),
                          (c.webkitPerspective = this.pe.v + "px"));
                      }
                    this.mat.clone(this._prevMat);
                  }
                }
                this._isFirstFrame = !1;
              }),
              (HCameraElement.prototype.prepareFrame = function (t) {
                this.prepareProperties(t, !0);
              }),
              (HCameraElement.prototype.destroy = function () {}),
              (HCameraElement.prototype.getBaseElement = function () {
                return null;
              });
            function HImageElement(t, e, r) {
              (this.assetData = e.getAssetData(t.refId)),
                this.initElement(t, e, r);
            }
            extendPrototype(
              [
                BaseElement,
                TransformElement,
                HBaseElement,
                HSolidElement,
                HierarchyElement,
                FrameElement,
                RenderableElement,
              ],
              HImageElement
            ),
              (HImageElement.prototype.createContent = function () {
                var t = this.globalData.getAssetsPath(this.assetData),
                  e = new Image();
                this.data.hasMask
                  ? ((this.imageElem = createNS("image")),
                    this.imageElem.setAttribute(
                      "width",
                      this.assetData.w + "px"
                    ),
                    this.imageElem.setAttribute(
                      "height",
                      this.assetData.h + "px"
                    ),
                    this.imageElem.setAttributeNS(
                      "http://www.w3.org/1999/xlink",
                      "href",
                      t
                    ),
                    this.layerElement.appendChild(this.imageElem),
                    this.baseElement.setAttribute("width", this.assetData.w),
                    this.baseElement.setAttribute("height", this.assetData.h))
                  : this.layerElement.appendChild(e),
                  (e.crossOrigin = "anonymous"),
                  (e.src = t),
                  this.data.ln &&
                    this.baseElement.setAttribute("id", this.data.ln);
              });
            function HybridRendererBase(t, e) {
              (this.animationItem = t),
                (this.layers = null),
                (this.renderedFrame = -1),
                (this.renderConfig = {
                  className: (e && e.className) || "",
                  imagePreserveAspectRatio:
                    (e && e.imagePreserveAspectRatio) || "xMidYMid slice",
                  hideOnTransparent: !(e && e.hideOnTransparent === !1),
                  filterSize: {
                    width: (e && e.filterSize && e.filterSize.width) || "400%",
                    height:
                      (e && e.filterSize && e.filterSize.height) || "400%",
                    x: (e && e.filterSize && e.filterSize.x) || "-100%",
                    y: (e && e.filterSize && e.filterSize.y) || "-100%",
                  },
                }),
                (this.globalData = {
                  _mdf: !1,
                  frameNum: -1,
                  renderConfig: this.renderConfig,
                }),
                (this.pendingElements = []),
                (this.elements = []),
                (this.threeDElements = []),
                (this.destroyed = !1),
                (this.camera = null),
                (this.supports3d = !0),
                (this.rendererType = "html");
            }
            extendPrototype([BaseRenderer], HybridRendererBase),
              (HybridRendererBase.prototype.buildItem =
                SVGRenderer.prototype.buildItem),
              (HybridRendererBase.prototype.checkPendingElements = function () {
                for (; this.pendingElements.length; ) {
                  var t = this.pendingElements.pop();
                  t.checkParenting();
                }
              }),
              (HybridRendererBase.prototype.appendElementInPos = function (
                t,
                e
              ) {
                var r = t.getBaseElement();
                if (r) {
                  var i = this.layers[e];
                  if (!i.ddd || !this.supports3d)
                    if (this.threeDElements) this.addTo3dContainer(r, e);
                    else {
                      for (var s = 0, n, a, h; s < e; )
                        this.elements[s] &&
                          this.elements[s] !== !0 &&
                          this.elements[s].getBaseElement &&
                          ((a = this.elements[s]),
                          (h = this.layers[s].ddd
                            ? this.getThreeDContainerByPos(s)
                            : a.getBaseElement()),
                          (n = h || n)),
                          (s += 1);
                      n
                        ? (!i.ddd || !this.supports3d) &&
                          this.layerElement.insertBefore(r, n)
                        : (!i.ddd || !this.supports3d) &&
                          this.layerElement.appendChild(r);
                    }
                  else this.addTo3dContainer(r, e);
                }
              }),
              (HybridRendererBase.prototype.createShape = function (t) {
                return this.supports3d
                  ? new HShapeElement(t, this.globalData, this)
                  : new SVGShapeElement(t, this.globalData, this);
              }),
              (HybridRendererBase.prototype.createText = function (t) {
                return this.supports3d
                  ? new HTextElement(t, this.globalData, this)
                  : new SVGTextLottieElement(t, this.globalData, this);
              }),
              (HybridRendererBase.prototype.createCamera = function (t) {
                return (
                  (this.camera = new HCameraElement(t, this.globalData, this)),
                  this.camera
                );
              }),
              (HybridRendererBase.prototype.createImage = function (t) {
                return this.supports3d
                  ? new HImageElement(t, this.globalData, this)
                  : new IImageElement(t, this.globalData, this);
              }),
              (HybridRendererBase.prototype.createSolid = function (t) {
                return this.supports3d
                  ? new HSolidElement(t, this.globalData, this)
                  : new ISolidElement(t, this.globalData, this);
              }),
              (HybridRendererBase.prototype.createNull =
                SVGRenderer.prototype.createNull),
              (HybridRendererBase.prototype.getThreeDContainerByPos = function (
                t
              ) {
                for (var e = 0, r = this.threeDElements.length; e < r; ) {
                  if (
                    this.threeDElements[e].startPos <= t &&
                    this.threeDElements[e].endPos >= t
                  )
                    return this.threeDElements[e].perspectiveElem;
                  e += 1;
                }
                return null;
              }),
              (HybridRendererBase.prototype.createThreeDContainer = function (
                t,
                e
              ) {
                var r = createTag("div"),
                  i,
                  s;
                styleDiv(r);
                var n = createTag("div");
                if ((styleDiv(n), e === "3d")) {
                  (i = r.style),
                    (i.width = this.globalData.compSize.w + "px"),
                    (i.height = this.globalData.compSize.h + "px");
                  var a = "50% 50%";
                  (i.webkitTransformOrigin = a),
                    (i.mozTransformOrigin = a),
                    (i.transformOrigin = a),
                    (s = n.style);
                  var h = "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)";
                  (s.transform = h), (s.webkitTransform = h);
                }
                r.appendChild(n);
                var o = {
                  container: n,
                  perspectiveElem: r,
                  startPos: t,
                  endPos: t,
                  type: e,
                };
                return this.threeDElements.push(o), o;
              }),
              (HybridRendererBase.prototype.build3dContainers = function () {
                var t,
                  e = this.layers.length,
                  r,
                  i = "";
                for (t = 0; t < e; t += 1)
                  this.layers[t].ddd && this.layers[t].ty !== 3
                    ? (i !== "3d" &&
                        ((i = "3d"), (r = this.createThreeDContainer(t, "3d"))),
                      (r.endPos = Math.max(r.endPos, t)))
                    : (i !== "2d" &&
                        ((i = "2d"), (r = this.createThreeDContainer(t, "2d"))),
                      (r.endPos = Math.max(r.endPos, t)));
                for (e = this.threeDElements.length, t = e - 1; t >= 0; t -= 1)
                  this.resizerElem.appendChild(
                    this.threeDElements[t].perspectiveElem
                  );
              }),
              (HybridRendererBase.prototype.addTo3dContainer = function (t, e) {
                for (var r = 0, i = this.threeDElements.length; r < i; ) {
                  if (e <= this.threeDElements[r].endPos) {
                    for (var s = this.threeDElements[r].startPos, n; s < e; )
                      this.elements[s] &&
                        this.elements[s].getBaseElement &&
                        (n = this.elements[s].getBaseElement()),
                        (s += 1);
                    n
                      ? this.threeDElements[r].container.insertBefore(t, n)
                      : this.threeDElements[r].container.appendChild(t);
                    break;
                  }
                  r += 1;
                }
              }),
              (HybridRendererBase.prototype.configAnimation = function (t) {
                var e = createTag("div"),
                  r = this.animationItem.wrapper,
                  i = e.style;
                (i.width = t.w + "px"),
                  (i.height = t.h + "px"),
                  (this.resizerElem = e),
                  styleDiv(e),
                  (i.transformStyle = "flat"),
                  (i.mozTransformStyle = "flat"),
                  (i.webkitTransformStyle = "flat"),
                  this.renderConfig.className &&
                    e.setAttribute("class", this.renderConfig.className),
                  r.appendChild(e),
                  (i.overflow = "hidden");
                var s = createNS("svg");
                s.setAttribute("width", "1"),
                  s.setAttribute("height", "1"),
                  styleDiv(s),
                  this.resizerElem.appendChild(s);
                var n = createNS("defs");
                s.appendChild(n),
                  (this.data = t),
                  this.setupGlobalData(t, s),
                  (this.globalData.defs = n),
                  (this.layers = t.layers),
                  (this.layerElement = this.resizerElem),
                  this.build3dContainers(),
                  this.updateContainerSize();
              }),
              (HybridRendererBase.prototype.destroy = function () {
                this.animationItem.wrapper &&
                  (this.animationItem.wrapper.innerText = ""),
                  (this.animationItem.container = null),
                  (this.globalData.defs = null);
                var t,
                  e = this.layers ? this.layers.length : 0;
                for (t = 0; t < e; t += 1)
                  this.elements[t] &&
                    this.elements[t].destroy &&
                    this.elements[t].destroy();
                (this.elements.length = 0),
                  (this.destroyed = !0),
                  (this.animationItem = null);
              }),
              (HybridRendererBase.prototype.updateContainerSize = function () {
                var t = this.animationItem.wrapper.offsetWidth,
                  e = this.animationItem.wrapper.offsetHeight,
                  r = t / e,
                  i = this.globalData.compSize.w / this.globalData.compSize.h,
                  s,
                  n,
                  a,
                  h;
                i > r
                  ? ((s = t / this.globalData.compSize.w),
                    (n = t / this.globalData.compSize.w),
                    (a = 0),
                    (h =
                      (e -
                        this.globalData.compSize.h *
                          (t / this.globalData.compSize.w)) /
                      2))
                  : ((s = e / this.globalData.compSize.h),
                    (n = e / this.globalData.compSize.h),
                    (a =
                      (t -
                        this.globalData.compSize.w *
                          (e / this.globalData.compSize.h)) /
                      2),
                    (h = 0));
                var o = this.resizerElem.style;
                (o.webkitTransform =
                  "matrix3d(" +
                  s +
                  ",0,0,0,0," +
                  n +
                  ",0,0,0,0,1,0," +
                  a +
                  "," +
                  h +
                  ",0,1)"),
                  (o.transform = o.webkitTransform);
              }),
              (HybridRendererBase.prototype.renderFrame =
                SVGRenderer.prototype.renderFrame),
              (HybridRendererBase.prototype.hide = function () {
                this.resizerElem.style.display = "none";
              }),
              (HybridRendererBase.prototype.show = function () {
                this.resizerElem.style.display = "block";
              }),
              (HybridRendererBase.prototype.initItems = function () {
                if ((this.buildAllItems(), this.camera)) this.camera.setup();
                else {
                  var t = this.globalData.compSize.w,
                    e = this.globalData.compSize.h,
                    r,
                    i = this.threeDElements.length;
                  for (r = 0; r < i; r += 1) {
                    var s = this.threeDElements[r].perspectiveElem.style;
                    (s.webkitPerspective =
                      Math.sqrt(Math.pow(t, 2) + Math.pow(e, 2)) + "px"),
                      (s.perspective = s.webkitPerspective);
                  }
                }
              }),
              (HybridRendererBase.prototype.searchExtraCompositions = function (
                t
              ) {
                var e,
                  r = t.length,
                  i = createTag("div");
                for (e = 0; e < r; e += 1)
                  if (t[e].xt) {
                    var s = this.createComp(
                      t[e],
                      i,
                      this.globalData.comp,
                      null
                    );
                    s.initExpressions(),
                      this.globalData.projectInterface.registerComposition(s);
                  }
              });
            function HCompElement(t, e, r) {
              (this.layers = t.layers),
                (this.supports3d = !t.hasMask),
                (this.completeLayers = !1),
                (this.pendingElements = []),
                (this.elements = this.layers
                  ? createSizedArray(this.layers.length)
                  : []),
                this.initElement(t, e, r),
                (this.tm = t.tm
                  ? PropertyFactory.getProp(this, t.tm, 0, e.frameRate, this)
                  : { _placeholder: !0 });
            }
            extendPrototype(
              [HybridRendererBase, ICompElement, HBaseElement],
              HCompElement
            ),
              (HCompElement.prototype._createBaseContainerElements =
                HCompElement.prototype.createContainerElements),
              (HCompElement.prototype.createContainerElements = function () {
                this._createBaseContainerElements(),
                  this.data.hasMask
                    ? (this.svgElement.setAttribute("width", this.data.w),
                      this.svgElement.setAttribute("height", this.data.h),
                      (this.transformedElement = this.baseElement))
                    : (this.transformedElement = this.layerElement);
              }),
              (HCompElement.prototype.addTo3dContainer = function (t, e) {
                for (var r = 0, i; r < e; )
                  this.elements[r] &&
                    this.elements[r].getBaseElement &&
                    (i = this.elements[r].getBaseElement()),
                    (r += 1);
                i
                  ? this.layerElement.insertBefore(t, i)
                  : this.layerElement.appendChild(t);
              }),
              (HCompElement.prototype.createComp = function (t) {
                return this.supports3d
                  ? new HCompElement(t, this.globalData, this)
                  : new SVGCompElement(t, this.globalData, this);
              });
            function HybridRenderer(t, e) {
              (this.animationItem = t),
                (this.layers = null),
                (this.renderedFrame = -1),
                (this.renderConfig = {
                  className: (e && e.className) || "",
                  imagePreserveAspectRatio:
                    (e && e.imagePreserveAspectRatio) || "xMidYMid slice",
                  hideOnTransparent: !(e && e.hideOnTransparent === !1),
                  filterSize: {
                    width: (e && e.filterSize && e.filterSize.width) || "400%",
                    height:
                      (e && e.filterSize && e.filterSize.height) || "400%",
                    x: (e && e.filterSize && e.filterSize.x) || "-100%",
                    y: (e && e.filterSize && e.filterSize.y) || "-100%",
                  },
                  runExpressions:
                    !e || e.runExpressions === void 0 || e.runExpressions,
                }),
                (this.globalData = {
                  _mdf: !1,
                  frameNum: -1,
                  renderConfig: this.renderConfig,
                }),
                (this.pendingElements = []),
                (this.elements = []),
                (this.threeDElements = []),
                (this.destroyed = !1),
                (this.camera = null),
                (this.supports3d = !0),
                (this.rendererType = "html");
            }
            extendPrototype([HybridRendererBase], HybridRenderer),
              (HybridRenderer.prototype.createComp = function (t) {
                return this.supports3d
                  ? new HCompElement(t, this.globalData, this)
                  : new SVGCompElement(t, this.globalData, this);
              });
            var CompExpressionInterface = (function () {
              return function (t) {
                function e(r) {
                  for (var i = 0, s = t.layers.length; i < s; ) {
                    if (t.layers[i].nm === r || t.layers[i].ind === r)
                      return t.elements[i].layerInterface;
                    i += 1;
                  }
                  return null;
                }
                return (
                  Object.defineProperty(e, "_name", { value: t.data.nm }),
                  (e.layer = e),
                  (e.pixelAspect = 1),
                  (e.height = t.data.h || t.globalData.compSize.h),
                  (e.width = t.data.w || t.globalData.compSize.w),
                  (e.pixelAspect = 1),
                  (e.frameDuration = 1 / t.globalData.frameRate),
                  (e.displayStartTime = 0),
                  (e.numLayers = t.layers.length),
                  e
                );
              };
            })();
            function _typeof$2(t) {
              "@babel/helpers - typeof";
              return (
                typeof Symbol == "function" &&
                typeof Symbol.iterator == "symbol"
                  ? (_typeof$2 = function (r) {
                      return typeof r;
                    })
                  : (_typeof$2 = function (r) {
                      return r &&
                        typeof Symbol == "function" &&
                        r.constructor === Symbol &&
                        r !== Symbol.prototype
                        ? "symbol"
                        : typeof r;
                    }),
                _typeof$2(t)
              );
            }
            function seedRandom(t, e) {
              var r = this,
                i = 256,
                s = 6,
                n = 52,
                a = "random",
                h = e.pow(i, s),
                o = e.pow(2, n),
                f = o * 2,
                d = i - 1,
                P;
              function c(l, y, E) {
                var x = [];
                y = y === !0 ? { entropy: !0 } : y || {};
                var A = C(
                    m(y.entropy ? [l, u(t)] : l === null ? p() : l, 3),
                    x
                  ),
                  F = new b(x),
                  w = function () {
                    for (var R = F.g(s), L = h, O = 0; R < o; )
                      (R = (R + O) * i), (L *= i), (O = F.g(1));
                    for (; R >= f; ) (R /= 2), (L /= 2), (O >>>= 1);
                    return (R + O) / L;
                  };
                return (
                  (w.int32 = function () {
                    return F.g(4) | 0;
                  }),
                  (w.quick = function () {
                    return F.g(4) / 4294967296;
                  }),
                  (w.double = w),
                  C(u(F.S), t),
                  (
                    y.pass ||
                    E ||
                    function (z, R, L, O) {
                      return (
                        O &&
                          (O.S && v(O, F),
                          (z.state = function () {
                            return v(F, {});
                          })),
                        L ? ((e[a] = z), R) : z
                      );
                    }
                  )(w, A, "global" in y ? y.global : this == e, y.state)
                );
              }
              e["seed" + a] = c;
              function b(l) {
                var y,
                  E = l.length,
                  x = this,
                  A = 0,
                  F = (x.i = x.j = 0),
                  w = (x.S = []);
                for (E || (l = [E++]); A < i; ) w[A] = A++;
                for (A = 0; A < i; A++)
                  (w[A] = w[(F = d & (F + l[A % E] + (y = w[A])))]), (w[F] = y);
                x.g = function (z) {
                  for (var R, L = 0, O = x.i, G = x.j, I = x.S; z--; )
                    (R = I[(O = d & (O + 1))]),
                      (L =
                        L * i +
                        I[d & ((I[O] = I[(G = d & (G + R))]) + (I[G] = R))]);
                  return (x.i = O), (x.j = G), L;
                };
              }
              function v(l, y) {
                return (y.i = l.i), (y.j = l.j), (y.S = l.S.slice()), y;
              }
              function m(l, y) {
                var E = [],
                  x = _typeof$2(l),
                  A;
                if (y && x == "object")
                  for (A in l)
                    try {
                      E.push(m(l[A], y - 1));
                    } catch {}
                return E.length ? E : x == "string" ? l : l + "\0";
              }
              function C(l, y) {
                for (var E = l + "", x, A = 0; A < E.length; )
                  y[d & A] = d & ((x ^= y[d & A] * 19) + E.charCodeAt(A++));
                return u(y);
              }
              function p() {
                try {
                  var l = new Uint8Array(i);
                  return (r.crypto || r.msCrypto).getRandomValues(l), u(l);
                } catch {
                  var y = r.navigator,
                    E = y && y.plugins;
                  return [+new Date(), r, E, r.screen, u(t)];
                }
              }
              function u(l) {
                return String.fromCharCode.apply(0, l);
              }
              C(e.random(), t);
            }
            function initialize$2(t) {
              seedRandom([], t);
            }
            var propTypes = { SHAPE: "shape" };
            function _typeof$1(t) {
              "@babel/helpers - typeof";
              return (
                typeof Symbol == "function" &&
                typeof Symbol.iterator == "symbol"
                  ? (_typeof$1 = function (r) {
                      return typeof r;
                    })
                  : (_typeof$1 = function (r) {
                      return r &&
                        typeof Symbol == "function" &&
                        r.constructor === Symbol &&
                        r !== Symbol.prototype
                        ? "symbol"
                        : typeof r;
                    }),
                _typeof$1(t)
              );
            }
            var ExpressionManager = (function () {
                var ob = {},
                  Math = BMMath,
                  window = null,
                  document = null,
                  XMLHttpRequest = null,
                  fetch = null,
                  frames = null,
                  _lottieGlobal = {};
                initialize$2(BMMath);
                function resetFrame() {
                  _lottieGlobal = {};
                }
                function $bm_isInstanceOfArray(t) {
                  return (
                    t.constructor === Array || t.constructor === Float32Array
                  );
                }
                function isNumerable(t, e) {
                  return (
                    t === "number" ||
                    e instanceof Number ||
                    t === "boolean" ||
                    t === "string"
                  );
                }
                function $bm_neg(t) {
                  var e = _typeof$1(t);
                  if (e === "number" || t instanceof Number || e === "boolean")
                    return -t;
                  if ($bm_isInstanceOfArray(t)) {
                    var r,
                      i = t.length,
                      s = [];
                    for (r = 0; r < i; r += 1) s[r] = -t[r];
                    return s;
                  }
                  return t.propType ? t.v : -t;
                }
                var easeInBez = BezierFactory.getBezierEasing(
                    0.333,
                    0,
                    0.833,
                    0.833,
                    "easeIn"
                  ).get,
                  easeOutBez = BezierFactory.getBezierEasing(
                    0.167,
                    0.167,
                    0.667,
                    1,
                    "easeOut"
                  ).get,
                  easeInOutBez = BezierFactory.getBezierEasing(
                    0.33,
                    0,
                    0.667,
                    1,
                    "easeInOut"
                  ).get;
                function sum(t, e) {
                  var r = _typeof$1(t),
                    i = _typeof$1(e);
                  if (
                    (isNumerable(r, t) && isNumerable(i, e)) ||
                    r === "string" ||
                    i === "string"
                  )
                    return t + e;
                  if ($bm_isInstanceOfArray(t) && isNumerable(i, e))
                    return (t = t.slice(0)), (t[0] += e), t;
                  if (isNumerable(r, t) && $bm_isInstanceOfArray(e))
                    return (e = e.slice(0)), (e[0] = t + e[0]), e;
                  if ($bm_isInstanceOfArray(t) && $bm_isInstanceOfArray(e)) {
                    for (
                      var s = 0, n = t.length, a = e.length, h = [];
                      s < n || s < a;

                    )
                      (typeof t[s] == "number" || t[s] instanceof Number) &&
                      (typeof e[s] == "number" || e[s] instanceof Number)
                        ? (h[s] = t[s] + e[s])
                        : (h[s] = e[s] === void 0 ? t[s] : t[s] || e[s]),
                        (s += 1);
                    return h;
                  }
                  return 0;
                }
                var add = sum;
                function sub(t, e) {
                  var r = _typeof$1(t),
                    i = _typeof$1(e);
                  if (isNumerable(r, t) && isNumerable(i, e))
                    return (
                      r === "string" && (t = parseInt(t, 10)),
                      i === "string" && (e = parseInt(e, 10)),
                      t - e
                    );
                  if ($bm_isInstanceOfArray(t) && isNumerable(i, e))
                    return (t = t.slice(0)), (t[0] -= e), t;
                  if (isNumerable(r, t) && $bm_isInstanceOfArray(e))
                    return (e = e.slice(0)), (e[0] = t - e[0]), e;
                  if ($bm_isInstanceOfArray(t) && $bm_isInstanceOfArray(e)) {
                    for (
                      var s = 0, n = t.length, a = e.length, h = [];
                      s < n || s < a;

                    )
                      (typeof t[s] == "number" || t[s] instanceof Number) &&
                      (typeof e[s] == "number" || e[s] instanceof Number)
                        ? (h[s] = t[s] - e[s])
                        : (h[s] = e[s] === void 0 ? t[s] : t[s] || e[s]),
                        (s += 1);
                    return h;
                  }
                  return 0;
                }
                function mul(t, e) {
                  var r = _typeof$1(t),
                    i = _typeof$1(e),
                    s;
                  if (isNumerable(r, t) && isNumerable(i, e)) return t * e;
                  var n, a;
                  if ($bm_isInstanceOfArray(t) && isNumerable(i, e)) {
                    for (
                      a = t.length, s = createTypedArray("float32", a), n = 0;
                      n < a;
                      n += 1
                    )
                      s[n] = t[n] * e;
                    return s;
                  }
                  if (isNumerable(r, t) && $bm_isInstanceOfArray(e)) {
                    for (
                      a = e.length, s = createTypedArray("float32", a), n = 0;
                      n < a;
                      n += 1
                    )
                      s[n] = t * e[n];
                    return s;
                  }
                  return 0;
                }
                function div(t, e) {
                  var r = _typeof$1(t),
                    i = _typeof$1(e),
                    s;
                  if (isNumerable(r, t) && isNumerable(i, e)) return t / e;
                  var n, a;
                  if ($bm_isInstanceOfArray(t) && isNumerable(i, e)) {
                    for (
                      a = t.length, s = createTypedArray("float32", a), n = 0;
                      n < a;
                      n += 1
                    )
                      s[n] = t[n] / e;
                    return s;
                  }
                  if (isNumerable(r, t) && $bm_isInstanceOfArray(e)) {
                    for (
                      a = e.length, s = createTypedArray("float32", a), n = 0;
                      n < a;
                      n += 1
                    )
                      s[n] = t / e[n];
                    return s;
                  }
                  return 0;
                }
                function mod(t, e) {
                  return (
                    typeof t == "string" && (t = parseInt(t, 10)),
                    typeof e == "string" && (e = parseInt(e, 10)),
                    t % e
                  );
                }
                var $bm_sum = sum,
                  $bm_sub = sub,
                  $bm_mul = mul,
                  $bm_div = div,
                  $bm_mod = mod;
                function clamp(t, e, r) {
                  if (e > r) {
                    var i = r;
                    (r = e), (e = i);
                  }
                  return Math.min(Math.max(t, e), r);
                }
                function radiansToDegrees(t) {
                  return t / degToRads;
                }
                var radians_to_degrees = radiansToDegrees;
                function degreesToRadians(t) {
                  return t * degToRads;
                }
                var degrees_to_radians = radiansToDegrees,
                  helperLengthArray = [0, 0, 0, 0, 0, 0];
                function length(t, e) {
                  if (typeof t == "number" || t instanceof Number)
                    return (e = e || 0), Math.abs(t - e);
                  e || (e = helperLengthArray);
                  var r,
                    i = Math.min(t.length, e.length),
                    s = 0;
                  for (r = 0; r < i; r += 1) s += Math.pow(e[r] - t[r], 2);
                  return Math.sqrt(s);
                }
                function normalize(t) {
                  return div(t, length(t));
                }
                function rgbToHsl(t) {
                  var e = t[0],
                    r = t[1],
                    i = t[2],
                    s = Math.max(e, r, i),
                    n = Math.min(e, r, i),
                    a,
                    h,
                    o = (s + n) / 2;
                  if (s === n) (a = 0), (h = 0);
                  else {
                    var f = s - n;
                    switch (
                      ((h = o > 0.5 ? f / (2 - s - n) : f / (s + n)), s)
                    ) {
                      case e:
                        a = (r - i) / f + (r < i ? 6 : 0);
                        break;
                      case r:
                        a = (i - e) / f + 2;
                        break;
                      case i:
                        a = (e - r) / f + 4;
                        break;
                    }
                    a /= 6;
                  }
                  return [a, h, o, t[3]];
                }
                function hue2rgb(t, e, r) {
                  return (
                    r < 0 && (r += 1),
                    r > 1 && (r -= 1),
                    r < 1 / 6
                      ? t + (e - t) * 6 * r
                      : r < 1 / 2
                      ? e
                      : r < 2 / 3
                      ? t + (e - t) * (2 / 3 - r) * 6
                      : t
                  );
                }
                function hslToRgb(t) {
                  var e = t[0],
                    r = t[1],
                    i = t[2],
                    s,
                    n,
                    a;
                  if (r === 0) (s = i), (a = i), (n = i);
                  else {
                    var h = i < 0.5 ? i * (1 + r) : i + r - i * r,
                      o = 2 * i - h;
                    (s = hue2rgb(o, h, e + 1 / 3)),
                      (n = hue2rgb(o, h, e)),
                      (a = hue2rgb(o, h, e - 1 / 3));
                  }
                  return [s, n, a, t[3]];
                }
                function linear(t, e, r, i, s) {
                  if (
                    ((i === void 0 || s === void 0) &&
                      ((i = e), (s = r), (e = 0), (r = 1)),
                    r < e)
                  ) {
                    var n = r;
                    (r = e), (e = n);
                  }
                  if (t <= e) return i;
                  if (t >= r) return s;
                  var a = r === e ? 0 : (t - e) / (r - e);
                  if (!i.length) return i + (s - i) * a;
                  var h,
                    o = i.length,
                    f = createTypedArray("float32", o);
                  for (h = 0; h < o; h += 1) f[h] = i[h] + (s[h] - i[h]) * a;
                  return f;
                }
                function random(t, e) {
                  if (
                    (e === void 0 &&
                      (t === void 0
                        ? ((t = 0), (e = 1))
                        : ((e = t), (t = void 0))),
                    e.length)
                  ) {
                    var r,
                      i = e.length;
                    t || (t = createTypedArray("float32", i));
                    var s = createTypedArray("float32", i),
                      n = BMMath.random();
                    for (r = 0; r < i; r += 1) s[r] = t[r] + n * (e[r] - t[r]);
                    return s;
                  }
                  t === void 0 && (t = 0);
                  var a = BMMath.random();
                  return t + a * (e - t);
                }
                function createPath(t, e, r, i) {
                  var s,
                    n = t.length,
                    a = shapePool.newElement();
                  a.setPathData(!!i, n);
                  var h = [0, 0],
                    o,
                    f;
                  for (s = 0; s < n; s += 1)
                    (o = e && e[s] ? e[s] : h),
                      (f = r && r[s] ? r[s] : h),
                      a.setTripleAt(
                        t[s][0],
                        t[s][1],
                        f[0] + t[s][0],
                        f[1] + t[s][1],
                        o[0] + t[s][0],
                        o[1] + t[s][1],
                        s,
                        !0
                      );
                  return a;
                }
                function initiateExpression(elem, data, property) {
                  function noOp(t) {
                    return t;
                  }
                  if (!elem.globalData.renderConfig.runExpressions) return noOp;
                  var val = data.x,
                    needsVelocity = /velocity(?![\w\d])/.test(val),
                    _needsRandom = val.indexOf("random") !== -1,
                    elemType = elem.data.ty,
                    transform,
                    $bm_transform,
                    content,
                    effect,
                    thisProperty = property;
                  (thisProperty.valueAtTime = thisProperty.getValueAtTime),
                    Object.defineProperty(thisProperty, "value", {
                      get: function () {
                        return thisProperty.v;
                      },
                    }),
                    (elem.comp.frameDuration =
                      1 / elem.comp.globalData.frameRate),
                    (elem.comp.displayStartTime = 0);
                  var inPoint = elem.data.ip / elem.comp.globalData.frameRate,
                    outPoint = elem.data.op / elem.comp.globalData.frameRate,
                    width = elem.data.sw ? elem.data.sw : 0,
                    height = elem.data.sh ? elem.data.sh : 0,
                    name = elem.data.nm,
                    loopIn,
                    loop_in,
                    loopOut,
                    loop_out,
                    smooth,
                    toWorld,
                    fromWorld,
                    fromComp,
                    toComp,
                    fromCompToSurface,
                    position,
                    rotation,
                    anchorPoint,
                    scale,
                    thisLayer,
                    thisComp,
                    mask,
                    valueAtTime,
                    velocityAtTime,
                    scoped_bm_rt,
                    expression_function = eval(
                      "[function _expression_function(){" +
                        val +
                        ";scoped_bm_rt=$bm_rt}]"
                    )[0],
                    numKeys = property.kf ? data.k.length : 0,
                    active = !this.data || this.data.hd !== !0,
                    wiggle = function t(e, r) {
                      var i,
                        s,
                        n = this.pv.length ? this.pv.length : 1,
                        a = createTypedArray("float32", n);
                      e = 5;
                      var h = Math.floor(time * e);
                      for (i = 0, s = 0; i < h; ) {
                        for (s = 0; s < n; s += 1)
                          a[s] += -r + r * 2 * BMMath.random();
                        i += 1;
                      }
                      var o = time * e,
                        f = o - Math.floor(o),
                        d = createTypedArray("float32", n);
                      if (n > 1) {
                        for (s = 0; s < n; s += 1)
                          d[s] =
                            this.pv[s] +
                            a[s] +
                            (-r + r * 2 * BMMath.random()) * f;
                        return d;
                      }
                      return (
                        this.pv + a[0] + (-r + r * 2 * BMMath.random()) * f
                      );
                    }.bind(this);
                  thisProperty.loopIn &&
                    ((loopIn = thisProperty.loopIn.bind(thisProperty)),
                    (loop_in = loopIn)),
                    thisProperty.loopOut &&
                      ((loopOut = thisProperty.loopOut.bind(thisProperty)),
                      (loop_out = loopOut)),
                    thisProperty.smooth &&
                      (smooth = thisProperty.smooth.bind(thisProperty));
                  function loopInDuration(t, e) {
                    return loopIn(t, e, !0);
                  }
                  function loopOutDuration(t, e) {
                    return loopOut(t, e, !0);
                  }
                  this.getValueAtTime &&
                    (valueAtTime = this.getValueAtTime.bind(this)),
                    this.getVelocityAtTime &&
                      (velocityAtTime = this.getVelocityAtTime.bind(this));
                  var comp = elem.comp.globalData.projectInterface.bind(
                    elem.comp.globalData.projectInterface
                  );
                  function lookAt(t, e) {
                    var r = [e[0] - t[0], e[1] - t[1], e[2] - t[2]],
                      i =
                        Math.atan2(r[0], Math.sqrt(r[1] * r[1] + r[2] * r[2])) /
                        degToRads,
                      s = -Math.atan2(r[1], r[2]) / degToRads;
                    return [s, i, 0];
                  }
                  function easeOut(t, e, r, i, s) {
                    return applyEase(easeOutBez, t, e, r, i, s);
                  }
                  function easeIn(t, e, r, i, s) {
                    return applyEase(easeInBez, t, e, r, i, s);
                  }
                  function ease(t, e, r, i, s) {
                    return applyEase(easeInOutBez, t, e, r, i, s);
                  }
                  function applyEase(t, e, r, i, s, n) {
                    s === void 0 ? ((s = r), (n = i)) : (e = (e - r) / (i - r)),
                      e > 1 ? (e = 1) : e < 0 && (e = 0);
                    var a = t(e);
                    if ($bm_isInstanceOfArray(s)) {
                      var h,
                        o = s.length,
                        f = createTypedArray("float32", o);
                      for (h = 0; h < o; h += 1)
                        f[h] = (n[h] - s[h]) * a + s[h];
                      return f;
                    }
                    return (n - s) * a + s;
                  }
                  function nearestKey(t) {
                    var e,
                      r = data.k.length,
                      i,
                      s;
                    if (!data.k.length || typeof data.k[0] == "number")
                      (i = 0), (s = 0);
                    else if (
                      ((i = -1),
                      (t *= elem.comp.globalData.frameRate),
                      t < data.k[0].t)
                    )
                      (i = 1), (s = data.k[0].t);
                    else {
                      for (e = 0; e < r - 1; e += 1)
                        if (t === data.k[e].t) {
                          (i = e + 1), (s = data.k[e].t);
                          break;
                        } else if (t > data.k[e].t && t < data.k[e + 1].t) {
                          t - data.k[e].t > data.k[e + 1].t - t
                            ? ((i = e + 2), (s = data.k[e + 1].t))
                            : ((i = e + 1), (s = data.k[e].t));
                          break;
                        }
                      i === -1 && ((i = e + 1), (s = data.k[e].t));
                    }
                    var n = {};
                    return (
                      (n.index = i),
                      (n.time = s / elem.comp.globalData.frameRate),
                      n
                    );
                  }
                  function key(t) {
                    var e, r, i;
                    if (!data.k.length || typeof data.k[0] == "number")
                      throw new Error(
                        "The property has no keyframe at index " + t
                      );
                    (t -= 1),
                      (e = {
                        time: data.k[t].t / elem.comp.globalData.frameRate,
                        value: [],
                      });
                    var s = Object.prototype.hasOwnProperty.call(data.k[t], "s")
                      ? data.k[t].s
                      : data.k[t - 1].e;
                    for (i = s.length, r = 0; r < i; r += 1)
                      (e[r] = s[r]), (e.value[r] = s[r]);
                    return e;
                  }
                  function framesToTime(t, e) {
                    return e || (e = elem.comp.globalData.frameRate), t / e;
                  }
                  function timeToFrames(t, e) {
                    return (
                      !t && t !== 0 && (t = time),
                      e || (e = elem.comp.globalData.frameRate),
                      t * e
                    );
                  }
                  function seedRandom(t) {
                    BMMath.seedrandom(randSeed + t);
                  }
                  function sourceRectAtTime() {
                    return elem.sourceRectAtTime();
                  }
                  function substring(t, e) {
                    return typeof value == "string"
                      ? e === void 0
                        ? value.substring(t)
                        : value.substring(t, e)
                      : "";
                  }
                  function substr(t, e) {
                    return typeof value == "string"
                      ? e === void 0
                        ? value.substr(t)
                        : value.substr(t, e)
                      : "";
                  }
                  function posterizeTime(t) {
                    (time = t === 0 ? 0 : Math.floor(time * t) / t),
                      (value = valueAtTime(time));
                  }
                  var time,
                    velocity,
                    value,
                    text,
                    textIndex,
                    textTotal,
                    selectorValue,
                    index = elem.data.ind,
                    hasParent = !!(elem.hierarchy && elem.hierarchy.length),
                    parent,
                    randSeed = Math.floor(Math.random() * 1e6),
                    globalData = elem.globalData;
                  function executeExpression(t) {
                    return (
                      (value = t),
                      this.frameExpressionId === elem.globalData.frameId &&
                      this.propType !== "textSelector"
                        ? value
                        : (this.propType === "textSelector" &&
                            ((textIndex = this.textIndex),
                            (textTotal = this.textTotal),
                            (selectorValue = this.selectorValue)),
                          thisLayer ||
                            ((text = elem.layerInterface.text),
                            (thisLayer = elem.layerInterface),
                            (thisComp = elem.comp.compInterface),
                            (toWorld = thisLayer.toWorld.bind(thisLayer)),
                            (fromWorld = thisLayer.fromWorld.bind(thisLayer)),
                            (fromComp = thisLayer.fromComp.bind(thisLayer)),
                            (toComp = thisLayer.toComp.bind(thisLayer)),
                            (mask = thisLayer.mask
                              ? thisLayer.mask.bind(thisLayer)
                              : null),
                            (fromCompToSurface = fromComp)),
                          transform ||
                            ((transform = elem.layerInterface(
                              "ADBE Transform Group"
                            )),
                            ($bm_transform = transform),
                            transform && (anchorPoint = transform.anchorPoint)),
                          elemType === 4 &&
                            !content &&
                            (content = thisLayer("ADBE Root Vectors Group")),
                          effect || (effect = thisLayer(4)),
                          (hasParent = !!(
                            elem.hierarchy && elem.hierarchy.length
                          )),
                          hasParent &&
                            !parent &&
                            (parent = elem.hierarchy[0].layerInterface),
                          (time =
                            this.comp.renderedFrame /
                            this.comp.globalData.frameRate),
                          _needsRandom && seedRandom(randSeed + time),
                          needsVelocity && (velocity = velocityAtTime(time)),
                          expression_function(),
                          (this.frameExpressionId = elem.globalData.frameId),
                          (scoped_bm_rt =
                            scoped_bm_rt.propType === propTypes.SHAPE
                              ? scoped_bm_rt.v
                              : scoped_bm_rt),
                          scoped_bm_rt)
                    );
                  }
                  return (
                    (executeExpression.__preventDeadCodeRemoval = [
                      $bm_transform,
                      anchorPoint,
                      time,
                      velocity,
                      inPoint,
                      outPoint,
                      width,
                      height,
                      name,
                      loop_in,
                      loop_out,
                      smooth,
                      toComp,
                      fromCompToSurface,
                      toWorld,
                      fromWorld,
                      mask,
                      position,
                      rotation,
                      scale,
                      thisComp,
                      numKeys,
                      active,
                      wiggle,
                      loopInDuration,
                      loopOutDuration,
                      comp,
                      lookAt,
                      easeOut,
                      easeIn,
                      ease,
                      nearestKey,
                      key,
                      text,
                      textIndex,
                      textTotal,
                      selectorValue,
                      framesToTime,
                      timeToFrames,
                      sourceRectAtTime,
                      substring,
                      substr,
                      posterizeTime,
                      index,
                      globalData,
                    ]),
                    executeExpression
                  );
                }
                return (
                  (ob.initiateExpression = initiateExpression),
                  (ob.__preventDeadCodeRemoval = [
                    window,
                    document,
                    XMLHttpRequest,
                    fetch,
                    frames,
                    $bm_neg,
                    add,
                    $bm_sum,
                    $bm_sub,
                    $bm_mul,
                    $bm_div,
                    $bm_mod,
                    clamp,
                    radians_to_degrees,
                    degreesToRadians,
                    degrees_to_radians,
                    normalize,
                    rgbToHsl,
                    hslToRgb,
                    linear,
                    random,
                    createPath,
                    _lottieGlobal,
                  ]),
                  (ob.resetFrame = resetFrame),
                  ob
                );
              })(),
              Expressions = (function () {
                var t = {};
                (t.initExpressions = e),
                  (t.resetFrame = ExpressionManager.resetFrame);
                function e(r) {
                  var i = 0,
                    s = [];
                  function n() {
                    i += 1;
                  }
                  function a() {
                    (i -= 1), i === 0 && o();
                  }
                  function h(f) {
                    s.indexOf(f) === -1 && s.push(f);
                  }
                  function o() {
                    var f,
                      d = s.length;
                    for (f = 0; f < d; f += 1) s[f].release();
                    s.length = 0;
                  }
                  (r.renderer.compInterface = CompExpressionInterface(
                    r.renderer
                  )),
                    r.renderer.globalData.projectInterface.registerComposition(
                      r.renderer
                    ),
                    (r.renderer.globalData.pushExpression = n),
                    (r.renderer.globalData.popExpression = a),
                    (r.renderer.globalData.registerExpressionProperty = h);
                }
                return t;
              })(),
              MaskManagerInterface = (function () {
                function t(r, i) {
                  (this._mask = r), (this._data = i);
                }
                Object.defineProperty(t.prototype, "maskPath", {
                  get: function () {
                    return (
                      this._mask.prop.k && this._mask.prop.getValue(),
                      this._mask.prop
                    );
                  },
                }),
                  Object.defineProperty(t.prototype, "maskOpacity", {
                    get: function () {
                      return (
                        this._mask.op.k && this._mask.op.getValue(),
                        this._mask.op.v * 100
                      );
                    },
                  });
                var e = function (i) {
                  var s = createSizedArray(i.viewData.length),
                    n,
                    a = i.viewData.length;
                  for (n = 0; n < a; n += 1)
                    s[n] = new t(i.viewData[n], i.masksProperties[n]);
                  var h = function (f) {
                    for (n = 0; n < a; ) {
                      if (i.masksProperties[n].nm === f) return s[n];
                      n += 1;
                    }
                    return null;
                  };
                  return h;
                };
                return e;
              })(),
              ExpressionPropertyInterface = (function () {
                var t = { pv: 0, v: 0, mult: 1 },
                  e = { pv: [0, 0, 0], v: [0, 0, 0], mult: 1 };
                function r(a, h, o) {
                  Object.defineProperty(a, "velocity", {
                    get: function () {
                      return h.getVelocityAtTime(h.comp.currentFrame);
                    },
                  }),
                    (a.numKeys = h.keyframes ? h.keyframes.length : 0),
                    (a.key = function (f) {
                      if (!a.numKeys) return 0;
                      var d = "";
                      "s" in h.keyframes[f - 1]
                        ? (d = h.keyframes[f - 1].s)
                        : "e" in h.keyframes[f - 2]
                        ? (d = h.keyframes[f - 2].e)
                        : (d = h.keyframes[f - 2].s);
                      var P =
                        o === "unidimensional"
                          ? new Number(d)
                          : Object.assign({}, d);
                      return (
                        (P.time =
                          h.keyframes[f - 1].t /
                          h.elem.comp.globalData.frameRate),
                        (P.value = o === "unidimensional" ? d[0] : d),
                        P
                      );
                    }),
                    (a.valueAtTime = h.getValueAtTime),
                    (a.speedAtTime = h.getSpeedAtTime),
                    (a.velocityAtTime = h.getVelocityAtTime),
                    (a.propertyGroup = h.propertyGroup);
                }
                function i(a) {
                  (!a || !("pv" in a)) && (a = t);
                  var h = 1 / a.mult,
                    o = a.pv * h,
                    f = new Number(o);
                  return (
                    (f.value = o),
                    r(f, a, "unidimensional"),
                    function () {
                      return (
                        a.k && a.getValue(),
                        (o = a.v * h),
                        f.value !== o &&
                          ((f = new Number(o)),
                          (f.value = o),
                          r(f, a, "unidimensional")),
                        f
                      );
                    }
                  );
                }
                function s(a) {
                  (!a || !("pv" in a)) && (a = e);
                  var h = 1 / a.mult,
                    o = (a.data && a.data.l) || a.pv.length,
                    f = createTypedArray("float32", o),
                    d = createTypedArray("float32", o);
                  return (
                    (f.value = d),
                    r(f, a, "multidimensional"),
                    function () {
                      a.k && a.getValue();
                      for (var P = 0; P < o; P += 1)
                        (d[P] = a.v[P] * h), (f[P] = d[P]);
                      return f;
                    }
                  );
                }
                function n() {
                  return t;
                }
                return function (a) {
                  return a
                    ? a.propType === "unidimensional"
                      ? i(a)
                      : s(a)
                    : n;
                };
              })(),
              TransformExpressionInterface = (function () {
                return function (t) {
                  function e(a) {
                    switch (a) {
                      case "scale":
                      case "Scale":
                      case "ADBE Scale":
                      case 6:
                        return e.scale;
                      case "rotation":
                      case "Rotation":
                      case "ADBE Rotation":
                      case "ADBE Rotate Z":
                      case 10:
                        return e.rotation;
                      case "ADBE Rotate X":
                        return e.xRotation;
                      case "ADBE Rotate Y":
                        return e.yRotation;
                      case "position":
                      case "Position":
                      case "ADBE Position":
                      case 2:
                        return e.position;
                      case "ADBE Position_0":
                        return e.xPosition;
                      case "ADBE Position_1":
                        return e.yPosition;
                      case "ADBE Position_2":
                        return e.zPosition;
                      case "anchorPoint":
                      case "AnchorPoint":
                      case "Anchor Point":
                      case "ADBE AnchorPoint":
                      case 1:
                        return e.anchorPoint;
                      case "opacity":
                      case "Opacity":
                      case 11:
                        return e.opacity;
                      default:
                        return null;
                    }
                  }
                  Object.defineProperty(e, "rotation", {
                    get: ExpressionPropertyInterface(t.r || t.rz),
                  }),
                    Object.defineProperty(e, "zRotation", {
                      get: ExpressionPropertyInterface(t.rz || t.r),
                    }),
                    Object.defineProperty(e, "xRotation", {
                      get: ExpressionPropertyInterface(t.rx),
                    }),
                    Object.defineProperty(e, "yRotation", {
                      get: ExpressionPropertyInterface(t.ry),
                    }),
                    Object.defineProperty(e, "scale", {
                      get: ExpressionPropertyInterface(t.s),
                    });
                  var r, i, s, n;
                  return (
                    t.p
                      ? (n = ExpressionPropertyInterface(t.p))
                      : ((r = ExpressionPropertyInterface(t.px)),
                        (i = ExpressionPropertyInterface(t.py)),
                        t.pz && (s = ExpressionPropertyInterface(t.pz))),
                    Object.defineProperty(e, "position", {
                      get: function () {
                        return t.p ? n() : [r(), i(), s ? s() : 0];
                      },
                    }),
                    Object.defineProperty(e, "xPosition", {
                      get: ExpressionPropertyInterface(t.px),
                    }),
                    Object.defineProperty(e, "yPosition", {
                      get: ExpressionPropertyInterface(t.py),
                    }),
                    Object.defineProperty(e, "zPosition", {
                      get: ExpressionPropertyInterface(t.pz),
                    }),
                    Object.defineProperty(e, "anchorPoint", {
                      get: ExpressionPropertyInterface(t.a),
                    }),
                    Object.defineProperty(e, "opacity", {
                      get: ExpressionPropertyInterface(t.o),
                    }),
                    Object.defineProperty(e, "skew", {
                      get: ExpressionPropertyInterface(t.sk),
                    }),
                    Object.defineProperty(e, "skewAxis", {
                      get: ExpressionPropertyInterface(t.sa),
                    }),
                    Object.defineProperty(e, "orientation", {
                      get: ExpressionPropertyInterface(t.or),
                    }),
                    e
                  );
                };
              })(),
              LayerExpressionInterface = (function () {
                function t(f) {
                  var d = new Matrix();
                  if (f !== void 0) {
                    var P = this._elem.finalTransform.mProp.getValueAtTime(f);
                    P.clone(d);
                  } else {
                    var c = this._elem.finalTransform.mProp;
                    c.applyToMatrix(d);
                  }
                  return d;
                }
                function e(f, d) {
                  var P = this.getMatrix(d);
                  return (
                    (P.props[12] = 0),
                    (P.props[13] = 0),
                    (P.props[14] = 0),
                    this.applyPoint(P, f)
                  );
                }
                function r(f, d) {
                  var P = this.getMatrix(d);
                  return this.applyPoint(P, f);
                }
                function i(f, d) {
                  var P = this.getMatrix(d);
                  return (
                    (P.props[12] = 0),
                    (P.props[13] = 0),
                    (P.props[14] = 0),
                    this.invertPoint(P, f)
                  );
                }
                function s(f, d) {
                  var P = this.getMatrix(d);
                  return this.invertPoint(P, f);
                }
                function n(f, d) {
                  if (this._elem.hierarchy && this._elem.hierarchy.length) {
                    var P,
                      c = this._elem.hierarchy.length;
                    for (P = 0; P < c; P += 1)
                      this._elem.hierarchy[
                        P
                      ].finalTransform.mProp.applyToMatrix(f);
                  }
                  return f.applyToPointArray(d[0], d[1], d[2] || 0);
                }
                function a(f, d) {
                  if (this._elem.hierarchy && this._elem.hierarchy.length) {
                    var P,
                      c = this._elem.hierarchy.length;
                    for (P = 0; P < c; P += 1)
                      this._elem.hierarchy[
                        P
                      ].finalTransform.mProp.applyToMatrix(f);
                  }
                  return f.inversePoint(d);
                }
                function h(f) {
                  var d = new Matrix();
                  if (
                    (d.reset(),
                    this._elem.finalTransform.mProp.applyToMatrix(d),
                    this._elem.hierarchy && this._elem.hierarchy.length)
                  ) {
                    var P,
                      c = this._elem.hierarchy.length;
                    for (P = 0; P < c; P += 1)
                      this._elem.hierarchy[
                        P
                      ].finalTransform.mProp.applyToMatrix(d);
                    return d.inversePoint(f);
                  }
                  return d.inversePoint(f);
                }
                function o() {
                  return [1, 1, 1, 1];
                }
                return function (f) {
                  var d;
                  function P(m) {
                    b.mask = new MaskManagerInterface(m, f);
                  }
                  function c(m) {
                    b.effect = m;
                  }
                  function b(m) {
                    switch (m) {
                      case "ADBE Root Vectors Group":
                      case "Contents":
                      case 2:
                        return b.shapeInterface;
                      case 1:
                      case 6:
                      case "Transform":
                      case "transform":
                      case "ADBE Transform Group":
                        return d;
                      case 4:
                      case "ADBE Effect Parade":
                      case "effects":
                      case "Effects":
                        return b.effect;
                      case "ADBE Text Properties":
                        return b.textInterface;
                      default:
                        return null;
                    }
                  }
                  (b.getMatrix = t),
                    (b.invertPoint = a),
                    (b.applyPoint = n),
                    (b.toWorld = r),
                    (b.toWorldVec = e),
                    (b.fromWorld = s),
                    (b.fromWorldVec = i),
                    (b.toComp = r),
                    (b.fromComp = h),
                    (b.sampleImage = o),
                    (b.sourceRectAtTime = f.sourceRectAtTime.bind(f)),
                    (b._elem = f),
                    (d = TransformExpressionInterface(f.finalTransform.mProp));
                  var v = getDescriptor(d, "anchorPoint");
                  return (
                    Object.defineProperties(b, {
                      hasParent: {
                        get: function () {
                          return f.hierarchy.length;
                        },
                      },
                      parent: {
                        get: function () {
                          return f.hierarchy[0].layerInterface;
                        },
                      },
                      rotation: getDescriptor(d, "rotation"),
                      scale: getDescriptor(d, "scale"),
                      position: getDescriptor(d, "position"),
                      opacity: getDescriptor(d, "opacity"),
                      anchorPoint: v,
                      anchor_point: v,
                      transform: {
                        get: function () {
                          return d;
                        },
                      },
                      active: {
                        get: function () {
                          return f.isInRange;
                        },
                      },
                    }),
                    (b.startTime = f.data.st),
                    (b.index = f.data.ind),
                    (b.source = f.data.refId),
                    (b.height = f.data.ty === 0 ? f.data.h : 100),
                    (b.width = f.data.ty === 0 ? f.data.w : 100),
                    (b.inPoint = f.data.ip / f.comp.globalData.frameRate),
                    (b.outPoint = f.data.op / f.comp.globalData.frameRate),
                    (b._name = f.data.nm),
                    (b.registerMaskInterface = P),
                    (b.registerEffectsInterface = c),
                    b
                  );
                };
              })(),
              propertyGroupFactory = (function () {
                return function (t, e) {
                  return function (r) {
                    return (r = r === void 0 ? 1 : r), r <= 0 ? t : e(r - 1);
                  };
                };
              })(),
              PropertyInterface = (function () {
                return function (t, e) {
                  var r = { _name: t };
                  function i(s) {
                    return (s = s === void 0 ? 1 : s), s <= 0 ? r : e(s - 1);
                  }
                  return i;
                };
              })(),
              EffectsExpressionInterface = (function () {
                var t = { createEffectsInterface: e };
                function e(s, n) {
                  if (s.effectsManager) {
                    var a = [],
                      h = s.data.ef,
                      o,
                      f = s.effectsManager.effectElements.length;
                    for (o = 0; o < f; o += 1)
                      a.push(r(h[o], s.effectsManager.effectElements[o], n, s));
                    var d = s.data.ef || [],
                      P = function (b) {
                        for (o = 0, f = d.length; o < f; ) {
                          if (b === d[o].nm || b === d[o].mn || b === d[o].ix)
                            return a[o];
                          o += 1;
                        }
                        return null;
                      };
                    return (
                      Object.defineProperty(P, "numProperties", {
                        get: function () {
                          return d.length;
                        },
                      }),
                      P
                    );
                  }
                  return null;
                }
                function r(s, n, a, h) {
                  function o(b) {
                    for (var v = s.ef, m = 0, C = v.length; m < C; ) {
                      if (b === v[m].nm || b === v[m].mn || b === v[m].ix)
                        return v[m].ty === 5 ? d[m] : d[m]();
                      m += 1;
                    }
                    throw new Error();
                  }
                  var f = propertyGroupFactory(o, a),
                    d = [],
                    P,
                    c = s.ef.length;
                  for (P = 0; P < c; P += 1)
                    s.ef[P].ty === 5
                      ? d.push(
                          r(
                            s.ef[P],
                            n.effectElements[P],
                            n.effectElements[P].propertyGroup,
                            h
                          )
                        )
                      : d.push(i(n.effectElements[P], s.ef[P].ty, h, f));
                  return (
                    s.mn === "ADBE Color Control" &&
                      Object.defineProperty(o, "color", {
                        get: function () {
                          return d[0]();
                        },
                      }),
                    Object.defineProperties(o, {
                      numProperties: {
                        get: function () {
                          return s.np;
                        },
                      },
                      _name: { value: s.nm },
                      propertyGroup: { value: f },
                    }),
                    (o.enabled = s.en !== 0),
                    (o.active = o.enabled),
                    o
                  );
                }
                function i(s, n, a, h) {
                  var o = ExpressionPropertyInterface(s.p);
                  function f() {
                    return n === 10 ? a.comp.compInterface(s.p.v) : o();
                  }
                  return (
                    s.p.setGroupProperty &&
                      s.p.setGroupProperty(PropertyInterface("", h)),
                    f
                  );
                }
                return t;
              })(),
              ShapePathInterface = (function () {
                return function (e, r, i) {
                  var s = r.sh;
                  function n(h) {
                    return h === "Shape" ||
                      h === "shape" ||
                      h === "Path" ||
                      h === "path" ||
                      h === "ADBE Vector Shape" ||
                      h === 2
                      ? n.path
                      : null;
                  }
                  var a = propertyGroupFactory(n, i);
                  return (
                    s.setGroupProperty(PropertyInterface("Path", a)),
                    Object.defineProperties(n, {
                      path: {
                        get: function () {
                          return s.k && s.getValue(), s;
                        },
                      },
                      shape: {
                        get: function () {
                          return s.k && s.getValue(), s;
                        },
                      },
                      _name: { value: e.nm },
                      ix: { value: e.ix },
                      propertyIndex: { value: e.ix },
                      mn: { value: e.mn },
                      propertyGroup: { value: i },
                    }),
                    n
                  );
                };
              })(),
              ShapeExpressionInterface = (function () {
                function t(v, m, C) {
                  var p = [],
                    u,
                    l = v ? v.length : 0;
                  for (u = 0; u < l; u += 1)
                    v[u].ty === "gr"
                      ? p.push(r(v[u], m[u], C))
                      : v[u].ty === "fl"
                      ? p.push(i(v[u], m[u], C))
                      : v[u].ty === "st"
                      ? p.push(a(v[u], m[u], C))
                      : v[u].ty === "tm"
                      ? p.push(h(v[u], m[u], C))
                      : v[u].ty === "tr" ||
                        (v[u].ty === "el"
                          ? p.push(f(v[u], m[u], C))
                          : v[u].ty === "sr"
                          ? p.push(d(v[u], m[u], C))
                          : v[u].ty === "sh"
                          ? p.push(ShapePathInterface(v[u], m[u], C))
                          : v[u].ty === "rc"
                          ? p.push(P(v[u], m[u], C))
                          : v[u].ty === "rd"
                          ? p.push(c(v[u], m[u], C))
                          : v[u].ty === "rp"
                          ? p.push(b(v[u], m[u], C))
                          : v[u].ty === "gf"
                          ? p.push(s(v[u], m[u], C))
                          : p.push(n(v[u], m[u])));
                  return p;
                }
                function e(v, m, C) {
                  var p,
                    u = function (E) {
                      for (var x = 0, A = p.length; x < A; ) {
                        if (
                          p[x]._name === E ||
                          p[x].mn === E ||
                          p[x].propertyIndex === E ||
                          p[x].ix === E ||
                          p[x].ind === E
                        )
                          return p[x];
                        x += 1;
                      }
                      return typeof E == "number" ? p[E - 1] : null;
                    };
                  (u.propertyGroup = propertyGroupFactory(u, C)),
                    (p = t(v.it, m.it, u.propertyGroup)),
                    (u.numProperties = p.length);
                  var l = o(
                    v.it[v.it.length - 1],
                    m.it[m.it.length - 1],
                    u.propertyGroup
                  );
                  return (
                    (u.transform = l),
                    (u.propertyIndex = v.cix),
                    (u._name = v.nm),
                    u
                  );
                }
                function r(v, m, C) {
                  var p = function (E) {
                    switch (E) {
                      case "ADBE Vectors Group":
                      case "Contents":
                      case 2:
                        return p.content;
                      default:
                        return p.transform;
                    }
                  };
                  p.propertyGroup = propertyGroupFactory(p, C);
                  var u = e(v, m, p.propertyGroup),
                    l = o(
                      v.it[v.it.length - 1],
                      m.it[m.it.length - 1],
                      p.propertyGroup
                    );
                  return (
                    (p.content = u),
                    (p.transform = l),
                    Object.defineProperty(p, "_name", {
                      get: function () {
                        return v.nm;
                      },
                    }),
                    (p.numProperties = v.np),
                    (p.propertyIndex = v.ix),
                    (p.nm = v.nm),
                    (p.mn = v.mn),
                    p
                  );
                }
                function i(v, m, C) {
                  function p(u) {
                    return u === "Color" || u === "color"
                      ? p.color
                      : u === "Opacity" || u === "opacity"
                      ? p.opacity
                      : null;
                  }
                  return (
                    Object.defineProperties(p, {
                      color: { get: ExpressionPropertyInterface(m.c) },
                      opacity: { get: ExpressionPropertyInterface(m.o) },
                      _name: { value: v.nm },
                      mn: { value: v.mn },
                    }),
                    m.c.setGroupProperty(PropertyInterface("Color", C)),
                    m.o.setGroupProperty(PropertyInterface("Opacity", C)),
                    p
                  );
                }
                function s(v, m, C) {
                  function p(u) {
                    return u === "Start Point" || u === "start point"
                      ? p.startPoint
                      : u === "End Point" || u === "end point"
                      ? p.endPoint
                      : u === "Opacity" || u === "opacity"
                      ? p.opacity
                      : null;
                  }
                  return (
                    Object.defineProperties(p, {
                      startPoint: { get: ExpressionPropertyInterface(m.s) },
                      endPoint: { get: ExpressionPropertyInterface(m.e) },
                      opacity: { get: ExpressionPropertyInterface(m.o) },
                      type: {
                        get: function () {
                          return "a";
                        },
                      },
                      _name: { value: v.nm },
                      mn: { value: v.mn },
                    }),
                    m.s.setGroupProperty(PropertyInterface("Start Point", C)),
                    m.e.setGroupProperty(PropertyInterface("End Point", C)),
                    m.o.setGroupProperty(PropertyInterface("Opacity", C)),
                    p
                  );
                }
                function n() {
                  function v() {
                    return null;
                  }
                  return v;
                }
                function a(v, m, C) {
                  var p = propertyGroupFactory(A, C),
                    u = propertyGroupFactory(x, p);
                  function l(F) {
                    Object.defineProperty(x, v.d[F].nm, {
                      get: ExpressionPropertyInterface(m.d.dataProps[F].p),
                    });
                  }
                  var y,
                    E = v.d ? v.d.length : 0,
                    x = {};
                  for (y = 0; y < E; y += 1)
                    l(y), m.d.dataProps[y].p.setGroupProperty(u);
                  function A(F) {
                    return F === "Color" || F === "color"
                      ? A.color
                      : F === "Opacity" || F === "opacity"
                      ? A.opacity
                      : F === "Stroke Width" || F === "stroke width"
                      ? A.strokeWidth
                      : null;
                  }
                  return (
                    Object.defineProperties(A, {
                      color: { get: ExpressionPropertyInterface(m.c) },
                      opacity: { get: ExpressionPropertyInterface(m.o) },
                      strokeWidth: { get: ExpressionPropertyInterface(m.w) },
                      dash: {
                        get: function () {
                          return x;
                        },
                      },
                      _name: { value: v.nm },
                      mn: { value: v.mn },
                    }),
                    m.c.setGroupProperty(PropertyInterface("Color", p)),
                    m.o.setGroupProperty(PropertyInterface("Opacity", p)),
                    m.w.setGroupProperty(PropertyInterface("Stroke Width", p)),
                    A
                  );
                }
                function h(v, m, C) {
                  function p(l) {
                    return l === v.e.ix || l === "End" || l === "end"
                      ? p.end
                      : l === v.s.ix
                      ? p.start
                      : l === v.o.ix
                      ? p.offset
                      : null;
                  }
                  var u = propertyGroupFactory(p, C);
                  return (
                    (p.propertyIndex = v.ix),
                    m.s.setGroupProperty(PropertyInterface("Start", u)),
                    m.e.setGroupProperty(PropertyInterface("End", u)),
                    m.o.setGroupProperty(PropertyInterface("Offset", u)),
                    (p.propertyIndex = v.ix),
                    (p.propertyGroup = C),
                    Object.defineProperties(p, {
                      start: { get: ExpressionPropertyInterface(m.s) },
                      end: { get: ExpressionPropertyInterface(m.e) },
                      offset: { get: ExpressionPropertyInterface(m.o) },
                      _name: { value: v.nm },
                    }),
                    (p.mn = v.mn),
                    p
                  );
                }
                function o(v, m, C) {
                  function p(l) {
                    return v.a.ix === l || l === "Anchor Point"
                      ? p.anchorPoint
                      : v.o.ix === l || l === "Opacity"
                      ? p.opacity
                      : v.p.ix === l || l === "Position"
                      ? p.position
                      : v.r.ix === l ||
                        l === "Rotation" ||
                        l === "ADBE Vector Rotation"
                      ? p.rotation
                      : v.s.ix === l || l === "Scale"
                      ? p.scale
                      : (v.sk && v.sk.ix === l) || l === "Skew"
                      ? p.skew
                      : (v.sa && v.sa.ix === l) || l === "Skew Axis"
                      ? p.skewAxis
                      : null;
                  }
                  var u = propertyGroupFactory(p, C);
                  return (
                    m.transform.mProps.o.setGroupProperty(
                      PropertyInterface("Opacity", u)
                    ),
                    m.transform.mProps.p.setGroupProperty(
                      PropertyInterface("Position", u)
                    ),
                    m.transform.mProps.a.setGroupProperty(
                      PropertyInterface("Anchor Point", u)
                    ),
                    m.transform.mProps.s.setGroupProperty(
                      PropertyInterface("Scale", u)
                    ),
                    m.transform.mProps.r.setGroupProperty(
                      PropertyInterface("Rotation", u)
                    ),
                    m.transform.mProps.sk &&
                      (m.transform.mProps.sk.setGroupProperty(
                        PropertyInterface("Skew", u)
                      ),
                      m.transform.mProps.sa.setGroupProperty(
                        PropertyInterface("Skew Angle", u)
                      )),
                    m.transform.op.setGroupProperty(
                      PropertyInterface("Opacity", u)
                    ),
                    Object.defineProperties(p, {
                      opacity: {
                        get: ExpressionPropertyInterface(m.transform.mProps.o),
                      },
                      position: {
                        get: ExpressionPropertyInterface(m.transform.mProps.p),
                      },
                      anchorPoint: {
                        get: ExpressionPropertyInterface(m.transform.mProps.a),
                      },
                      scale: {
                        get: ExpressionPropertyInterface(m.transform.mProps.s),
                      },
                      rotation: {
                        get: ExpressionPropertyInterface(m.transform.mProps.r),
                      },
                      skew: {
                        get: ExpressionPropertyInterface(m.transform.mProps.sk),
                      },
                      skewAxis: {
                        get: ExpressionPropertyInterface(m.transform.mProps.sa),
                      },
                      _name: { value: v.nm },
                    }),
                    (p.ty = "tr"),
                    (p.mn = v.mn),
                    (p.propertyGroup = C),
                    p
                  );
                }
                function f(v, m, C) {
                  function p(y) {
                    return v.p.ix === y
                      ? p.position
                      : v.s.ix === y
                      ? p.size
                      : null;
                  }
                  var u = propertyGroupFactory(p, C);
                  p.propertyIndex = v.ix;
                  var l = m.sh.ty === "tm" ? m.sh.prop : m.sh;
                  return (
                    l.s.setGroupProperty(PropertyInterface("Size", u)),
                    l.p.setGroupProperty(PropertyInterface("Position", u)),
                    Object.defineProperties(p, {
                      size: { get: ExpressionPropertyInterface(l.s) },
                      position: { get: ExpressionPropertyInterface(l.p) },
                      _name: { value: v.nm },
                    }),
                    (p.mn = v.mn),
                    p
                  );
                }
                function d(v, m, C) {
                  function p(y) {
                    return v.p.ix === y
                      ? p.position
                      : v.r.ix === y
                      ? p.rotation
                      : v.pt.ix === y
                      ? p.points
                      : v.or.ix === y || y === "ADBE Vector Star Outer Radius"
                      ? p.outerRadius
                      : v.os.ix === y
                      ? p.outerRoundness
                      : v.ir &&
                        (v.ir.ix === y || y === "ADBE Vector Star Inner Radius")
                      ? p.innerRadius
                      : v.is && v.is.ix === y
                      ? p.innerRoundness
                      : null;
                  }
                  var u = propertyGroupFactory(p, C),
                    l = m.sh.ty === "tm" ? m.sh.prop : m.sh;
                  return (
                    (p.propertyIndex = v.ix),
                    l.or.setGroupProperty(PropertyInterface("Outer Radius", u)),
                    l.os.setGroupProperty(
                      PropertyInterface("Outer Roundness", u)
                    ),
                    l.pt.setGroupProperty(PropertyInterface("Points", u)),
                    l.p.setGroupProperty(PropertyInterface("Position", u)),
                    l.r.setGroupProperty(PropertyInterface("Rotation", u)),
                    v.ir &&
                      (l.ir.setGroupProperty(
                        PropertyInterface("Inner Radius", u)
                      ),
                      l.is.setGroupProperty(
                        PropertyInterface("Inner Roundness", u)
                      )),
                    Object.defineProperties(p, {
                      position: { get: ExpressionPropertyInterface(l.p) },
                      rotation: { get: ExpressionPropertyInterface(l.r) },
                      points: { get: ExpressionPropertyInterface(l.pt) },
                      outerRadius: { get: ExpressionPropertyInterface(l.or) },
                      outerRoundness: {
                        get: ExpressionPropertyInterface(l.os),
                      },
                      innerRadius: { get: ExpressionPropertyInterface(l.ir) },
                      innerRoundness: {
                        get: ExpressionPropertyInterface(l.is),
                      },
                      _name: { value: v.nm },
                    }),
                    (p.mn = v.mn),
                    p
                  );
                }
                function P(v, m, C) {
                  function p(y) {
                    return v.p.ix === y
                      ? p.position
                      : v.r.ix === y
                      ? p.roundness
                      : v.s.ix === y ||
                        y === "Size" ||
                        y === "ADBE Vector Rect Size"
                      ? p.size
                      : null;
                  }
                  var u = propertyGroupFactory(p, C),
                    l = m.sh.ty === "tm" ? m.sh.prop : m.sh;
                  return (
                    (p.propertyIndex = v.ix),
                    l.p.setGroupProperty(PropertyInterface("Position", u)),
                    l.s.setGroupProperty(PropertyInterface("Size", u)),
                    l.r.setGroupProperty(PropertyInterface("Rotation", u)),
                    Object.defineProperties(p, {
                      position: { get: ExpressionPropertyInterface(l.p) },
                      roundness: { get: ExpressionPropertyInterface(l.r) },
                      size: { get: ExpressionPropertyInterface(l.s) },
                      _name: { value: v.nm },
                    }),
                    (p.mn = v.mn),
                    p
                  );
                }
                function c(v, m, C) {
                  function p(y) {
                    return v.r.ix === y || y === "Round Corners 1"
                      ? p.radius
                      : null;
                  }
                  var u = propertyGroupFactory(p, C),
                    l = m;
                  return (
                    (p.propertyIndex = v.ix),
                    l.rd.setGroupProperty(PropertyInterface("Radius", u)),
                    Object.defineProperties(p, {
                      radius: { get: ExpressionPropertyInterface(l.rd) },
                      _name: { value: v.nm },
                    }),
                    (p.mn = v.mn),
                    p
                  );
                }
                function b(v, m, C) {
                  function p(y) {
                    return v.c.ix === y || y === "Copies"
                      ? p.copies
                      : v.o.ix === y || y === "Offset"
                      ? p.offset
                      : null;
                  }
                  var u = propertyGroupFactory(p, C),
                    l = m;
                  return (
                    (p.propertyIndex = v.ix),
                    l.c.setGroupProperty(PropertyInterface("Copies", u)),
                    l.o.setGroupProperty(PropertyInterface("Offset", u)),
                    Object.defineProperties(p, {
                      copies: { get: ExpressionPropertyInterface(l.c) },
                      offset: { get: ExpressionPropertyInterface(l.o) },
                      _name: { value: v.nm },
                    }),
                    (p.mn = v.mn),
                    p
                  );
                }
                return function (v, m, C) {
                  var p;
                  function u(y) {
                    if (typeof y == "number")
                      return (y = y === void 0 ? 1 : y), y === 0 ? C : p[y - 1];
                    for (var E = 0, x = p.length; E < x; ) {
                      if (p[E]._name === y) return p[E];
                      E += 1;
                    }
                    return null;
                  }
                  function l() {
                    return C;
                  }
                  return (
                    (u.propertyGroup = propertyGroupFactory(u, l)),
                    (p = t(v, m, u.propertyGroup)),
                    (u.numProperties = p.length),
                    (u._name = "Contents"),
                    u
                  );
                };
              })(),
              TextExpressionInterface = (function () {
                return function (t) {
                  var e;
                  function r(i) {
                    switch (i) {
                      case "ADBE Text Document":
                        return r.sourceText;
                      default:
                        return null;
                    }
                  }
                  return (
                    Object.defineProperty(r, "sourceText", {
                      get: function () {
                        t.textProperty.getValue();
                        var s = t.textProperty.currentData.t;
                        return (
                          (!e || s !== e.value) &&
                            ((e = new String(s)),
                            (e.value = s || new String(s)),
                            Object.defineProperty(e, "style", {
                              get: function () {
                                return {
                                  fillColor: t.textProperty.currentData.fc,
                                };
                              },
                            })),
                          e
                        );
                      },
                    }),
                    r
                  );
                };
              })();
            function _typeof(t) {
              "@babel/helpers - typeof";
              return (
                typeof Symbol == "function" &&
                typeof Symbol.iterator == "symbol"
                  ? (_typeof = function (r) {
                      return typeof r;
                    })
                  : (_typeof = function (r) {
                      return r &&
                        typeof Symbol == "function" &&
                        r.constructor === Symbol &&
                        r !== Symbol.prototype
                        ? "symbol"
                        : typeof r;
                    }),
                _typeof(t)
              );
            }
            var FootageInterface = (function () {
                var t = function (i) {
                    var s = "",
                      n = i.getFootageData();
                    function a() {
                      return (s = ""), (n = i.getFootageData()), h;
                    }
                    function h(o) {
                      if (n[o])
                        return (
                          (s = o), (n = n[o]), _typeof(n) === "object" ? h : n
                        );
                      var f = o.indexOf(s);
                      if (f !== -1) {
                        var d = parseInt(o.substr(f + s.length), 10);
                        return (n = n[d]), _typeof(n) === "object" ? h : n;
                      }
                      return "";
                    }
                    return a;
                  },
                  e = function (i) {
                    function s(n) {
                      return n === "Outline" ? s.outlineInterface() : null;
                    }
                    return (
                      (s._name = "Outline"), (s.outlineInterface = t(i)), s
                    );
                  };
                return function (r) {
                  function i(s) {
                    return s === "Data" ? i.dataInterface : null;
                  }
                  return (i._name = "Data"), (i.dataInterface = e(r)), i;
                };
              })(),
              interfaces = {
                layer: LayerExpressionInterface,
                effects: EffectsExpressionInterface,
                comp: CompExpressionInterface,
                shape: ShapeExpressionInterface,
                text: TextExpressionInterface,
                footage: FootageInterface,
              };
            function getInterface(t) {
              return interfaces[t] || null;
            }
            var expressionHelpers = (function () {
              function t(a, h, o) {
                h.x &&
                  ((o.k = !0),
                  (o.x = !0),
                  (o.initiateExpression = ExpressionManager.initiateExpression),
                  o.effectsSequence.push(
                    o.initiateExpression(a, h, o).bind(o)
                  ));
              }
              function e(a) {
                return (
                  (a *= this.elem.globalData.frameRate),
                  (a -= this.offsetTime),
                  a !== this._cachingAtTime.lastFrame &&
                    ((this._cachingAtTime.lastIndex =
                      this._cachingAtTime.lastFrame < a
                        ? this._cachingAtTime.lastIndex
                        : 0),
                    (this._cachingAtTime.value = this.interpolateValue(
                      a,
                      this._cachingAtTime
                    )),
                    (this._cachingAtTime.lastFrame = a)),
                  this._cachingAtTime.value
                );
              }
              function r(a) {
                var h = -0.01,
                  o = this.getValueAtTime(a),
                  f = this.getValueAtTime(a + h),
                  d = 0;
                if (o.length) {
                  var P;
                  for (P = 0; P < o.length; P += 1)
                    d += Math.pow(f[P] - o[P], 2);
                  d = Math.sqrt(d) * 100;
                } else d = 0;
                return d;
              }
              function i(a) {
                if (this.vel !== void 0) return this.vel;
                var h = -0.001,
                  o = this.getValueAtTime(a),
                  f = this.getValueAtTime(a + h),
                  d;
                if (o.length) {
                  d = createTypedArray("float32", o.length);
                  var P;
                  for (P = 0; P < o.length; P += 1) d[P] = (f[P] - o[P]) / h;
                } else d = (f - o) / h;
                return d;
              }
              function s() {
                return this.pv;
              }
              function n(a) {
                this.propertyGroup = a;
              }
              return {
                searchExpressions: t,
                getSpeedAtTime: r,
                getVelocityAtTime: i,
                getValueAtTime: e,
                getStaticValueAtTime: s,
                setGroupProperty: n,
              };
            })();
            function addPropertyDecorator() {
              function t(c, b, v) {
                if (!this.k || !this.keyframes) return this.pv;
                c = c ? c.toLowerCase() : "";
                var m = this.comp.renderedFrame,
                  C = this.keyframes,
                  p = C[C.length - 1].t;
                if (m <= p) return this.pv;
                var u, l;
                v
                  ? (b
                      ? (u = Math.abs(
                          p - this.elem.comp.globalData.frameRate * b
                        ))
                      : (u = Math.max(0, p - this.elem.data.ip)),
                    (l = p - u))
                  : ((!b || b > C.length - 1) && (b = C.length - 1),
                    (l = C[C.length - 1 - b].t),
                    (u = p - l));
                var y, E, x;
                if (c === "pingpong") {
                  var A = Math.floor((m - l) / u);
                  if (A % 2 !== 0)
                    return this.getValueAtTime(
                      (u - ((m - l) % u) + l) / this.comp.globalData.frameRate,
                      0
                    );
                } else if (c === "offset") {
                  var F = this.getValueAtTime(
                      l / this.comp.globalData.frameRate,
                      0
                    ),
                    w = this.getValueAtTime(
                      p / this.comp.globalData.frameRate,
                      0
                    ),
                    z = this.getValueAtTime(
                      (((m - l) % u) + l) / this.comp.globalData.frameRate,
                      0
                    ),
                    R = Math.floor((m - l) / u);
                  if (this.pv.length) {
                    for (
                      x = new Array(F.length), E = x.length, y = 0;
                      y < E;
                      y += 1
                    )
                      x[y] = (w[y] - F[y]) * R + z[y];
                    return x;
                  }
                  return (w - F) * R + z;
                } else if (c === "continue") {
                  var L = this.getValueAtTime(
                      p / this.comp.globalData.frameRate,
                      0
                    ),
                    O = this.getValueAtTime(
                      (p - 0.001) / this.comp.globalData.frameRate,
                      0
                    );
                  if (this.pv.length) {
                    for (
                      x = new Array(L.length), E = x.length, y = 0;
                      y < E;
                      y += 1
                    )
                      x[y] =
                        L[y] +
                        ((L[y] - O[y]) *
                          ((m - p) / this.comp.globalData.frameRate)) /
                          5e-4;
                    return x;
                  }
                  return L + (L - O) * ((m - p) / 0.001);
                }
                return this.getValueAtTime(
                  (((m - l) % u) + l) / this.comp.globalData.frameRate,
                  0
                );
              }
              function e(c, b, v) {
                if (!this.k) return this.pv;
                c = c ? c.toLowerCase() : "";
                var m = this.comp.renderedFrame,
                  C = this.keyframes,
                  p = C[0].t;
                if (m >= p) return this.pv;
                var u, l;
                v
                  ? (b
                      ? (u = Math.abs(this.elem.comp.globalData.frameRate * b))
                      : (u = Math.max(0, this.elem.data.op - p)),
                    (l = p + u))
                  : ((!b || b > C.length - 1) && (b = C.length - 1),
                    (l = C[b].t),
                    (u = l - p));
                var y, E, x;
                if (c === "pingpong") {
                  var A = Math.floor((p - m) / u);
                  if (A % 2 === 0)
                    return this.getValueAtTime(
                      (((p - m) % u) + p) / this.comp.globalData.frameRate,
                      0
                    );
                } else if (c === "offset") {
                  var F = this.getValueAtTime(
                      p / this.comp.globalData.frameRate,
                      0
                    ),
                    w = this.getValueAtTime(
                      l / this.comp.globalData.frameRate,
                      0
                    ),
                    z = this.getValueAtTime(
                      (u - ((p - m) % u) + p) / this.comp.globalData.frameRate,
                      0
                    ),
                    R = Math.floor((p - m) / u) + 1;
                  if (this.pv.length) {
                    for (
                      x = new Array(F.length), E = x.length, y = 0;
                      y < E;
                      y += 1
                    )
                      x[y] = z[y] - (w[y] - F[y]) * R;
                    return x;
                  }
                  return z - (w - F) * R;
                } else if (c === "continue") {
                  var L = this.getValueAtTime(
                      p / this.comp.globalData.frameRate,
                      0
                    ),
                    O = this.getValueAtTime(
                      (p + 0.001) / this.comp.globalData.frameRate,
                      0
                    );
                  if (this.pv.length) {
                    for (
                      x = new Array(L.length), E = x.length, y = 0;
                      y < E;
                      y += 1
                    )
                      x[y] = L[y] + ((L[y] - O[y]) * (p - m)) / 0.001;
                    return x;
                  }
                  return L + ((L - O) * (p - m)) / 0.001;
                }
                return this.getValueAtTime(
                  (u - (((p - m) % u) + p)) / this.comp.globalData.frameRate,
                  0
                );
              }
              function r(c, b) {
                if (!this.k) return this.pv;
                if (((c = (c || 0.4) * 0.5), (b = Math.floor(b || 5)), b <= 1))
                  return this.pv;
                var v =
                    this.comp.renderedFrame / this.comp.globalData.frameRate,
                  m = v - c,
                  C = v + c,
                  p = b > 1 ? (C - m) / (b - 1) : 1,
                  u = 0,
                  l = 0,
                  y;
                this.pv.length
                  ? (y = createTypedArray("float32", this.pv.length))
                  : (y = 0);
                for (var E; u < b; ) {
                  if (((E = this.getValueAtTime(m + u * p)), this.pv.length))
                    for (l = 0; l < this.pv.length; l += 1) y[l] += E[l];
                  else y += E;
                  u += 1;
                }
                if (this.pv.length)
                  for (l = 0; l < this.pv.length; l += 1) y[l] /= b;
                else y /= b;
                return y;
              }
              function i(c) {
                this._transformCachingAtTime ||
                  (this._transformCachingAtTime = { v: new Matrix() });
                var b = this._transformCachingAtTime.v;
                if (
                  (b.cloneFromProps(this.pre.props),
                  this.appliedTransformations < 1)
                ) {
                  var v = this.a.getValueAtTime(c);
                  b.translate(
                    -v[0] * this.a.mult,
                    -v[1] * this.a.mult,
                    v[2] * this.a.mult
                  );
                }
                if (this.appliedTransformations < 2) {
                  var m = this.s.getValueAtTime(c);
                  b.scale(
                    m[0] * this.s.mult,
                    m[1] * this.s.mult,
                    m[2] * this.s.mult
                  );
                }
                if (this.sk && this.appliedTransformations < 3) {
                  var C = this.sk.getValueAtTime(c),
                    p = this.sa.getValueAtTime(c);
                  b.skewFromAxis(-C * this.sk.mult, p * this.sa.mult);
                }
                if (this.r && this.appliedTransformations < 4) {
                  var u = this.r.getValueAtTime(c);
                  b.rotate(-u * this.r.mult);
                } else if (!this.r && this.appliedTransformations < 4) {
                  var l = this.rz.getValueAtTime(c),
                    y = this.ry.getValueAtTime(c),
                    E = this.rx.getValueAtTime(c),
                    x = this.or.getValueAtTime(c);
                  b.rotateZ(-l * this.rz.mult)
                    .rotateY(y * this.ry.mult)
                    .rotateX(E * this.rx.mult)
                    .rotateZ(-x[2] * this.or.mult)
                    .rotateY(x[1] * this.or.mult)
                    .rotateX(x[0] * this.or.mult);
                }
                if (this.data.p && this.data.p.s) {
                  var A = this.px.getValueAtTime(c),
                    F = this.py.getValueAtTime(c);
                  if (this.data.p.z) {
                    var w = this.pz.getValueAtTime(c);
                    b.translate(
                      A * this.px.mult,
                      F * this.py.mult,
                      -w * this.pz.mult
                    );
                  } else b.translate(A * this.px.mult, F * this.py.mult, 0);
                } else {
                  var z = this.p.getValueAtTime(c);
                  b.translate(
                    z[0] * this.p.mult,
                    z[1] * this.p.mult,
                    -z[2] * this.p.mult
                  );
                }
                return b;
              }
              function s() {
                return this.v.clone(new Matrix());
              }
              var n = TransformPropertyFactory.getTransformProperty;
              TransformPropertyFactory.getTransformProperty = function (
                c,
                b,
                v
              ) {
                var m = n(c, b, v);
                return (
                  m.dynamicProperties.length
                    ? (m.getValueAtTime = i.bind(m))
                    : (m.getValueAtTime = s.bind(m)),
                  (m.setGroupProperty = expressionHelpers.setGroupProperty),
                  m
                );
              };
              var a = PropertyFactory.getProp;
              PropertyFactory.getProp = function (c, b, v, m, C) {
                var p = a(c, b, v, m, C);
                p.kf
                  ? (p.getValueAtTime =
                      expressionHelpers.getValueAtTime.bind(p))
                  : (p.getValueAtTime =
                      expressionHelpers.getStaticValueAtTime.bind(p)),
                  (p.setGroupProperty = expressionHelpers.setGroupProperty),
                  (p.loopOut = t),
                  (p.loopIn = e),
                  (p.smooth = r),
                  (p.getVelocityAtTime =
                    expressionHelpers.getVelocityAtTime.bind(p)),
                  (p.getSpeedAtTime = expressionHelpers.getSpeedAtTime.bind(p)),
                  (p.numKeys = b.a === 1 ? b.k.length : 0),
                  (p.propertyIndex = b.ix);
                var u = 0;
                return (
                  v !== 0 &&
                    (u = createTypedArray(
                      "float32",
                      b.a === 1 ? b.k[0].s.length : b.k.length
                    )),
                  (p._cachingAtTime = {
                    lastFrame: initialDefaultFrame,
                    lastIndex: 0,
                    value: u,
                  }),
                  expressionHelpers.searchExpressions(c, b, p),
                  p.k && C.addDynamicProperty(p),
                  p
                );
              };
              function h(c) {
                return (
                  this._cachingAtTime ||
                    (this._cachingAtTime = {
                      shapeValue: shapePool.clone(this.pv),
                      lastIndex: 0,
                      lastTime: initialDefaultFrame,
                    }),
                  (c *= this.elem.globalData.frameRate),
                  (c -= this.offsetTime),
                  c !== this._cachingAtTime.lastTime &&
                    ((this._cachingAtTime.lastIndex =
                      this._cachingAtTime.lastTime < c
                        ? this._caching.lastIndex
                        : 0),
                    (this._cachingAtTime.lastTime = c),
                    this.interpolateShape(
                      c,
                      this._cachingAtTime.shapeValue,
                      this._cachingAtTime
                    )),
                  this._cachingAtTime.shapeValue
                );
              }
              var o = ShapePropertyFactory.getConstructorFunction(),
                f = ShapePropertyFactory.getKeyframedConstructorFunction();
              function d() {}
              (d.prototype = {
                vertices: function (b, v) {
                  this.k && this.getValue();
                  var m = this.v;
                  v !== void 0 && (m = this.getValueAtTime(v, 0));
                  var C,
                    p = m._length,
                    u = m[b],
                    l = m.v,
                    y = createSizedArray(p);
                  for (C = 0; C < p; C += 1)
                    b === "i" || b === "o"
                      ? (y[C] = [u[C][0] - l[C][0], u[C][1] - l[C][1]])
                      : (y[C] = [u[C][0], u[C][1]]);
                  return y;
                },
                points: function (b) {
                  return this.vertices("v", b);
                },
                inTangents: function (b) {
                  return this.vertices("i", b);
                },
                outTangents: function (b) {
                  return this.vertices("o", b);
                },
                isClosed: function () {
                  return this.v.c;
                },
                pointOnPath: function (b, v) {
                  var m = this.v;
                  v !== void 0 && (m = this.getValueAtTime(v, 0)),
                    this._segmentsLength ||
                      (this._segmentsLength = bez.getSegmentsLength(m));
                  for (
                    var C = this._segmentsLength,
                      p = C.lengths,
                      u = C.totalLength * b,
                      l = 0,
                      y = p.length,
                      E = 0,
                      x;
                    l < y;

                  ) {
                    if (E + p[l].addedLength > u) {
                      var A = l,
                        F = m.c && l === y - 1 ? 0 : l + 1,
                        w = (u - E) / p[l].addedLength;
                      x = bez.getPointInSegment(
                        m.v[A],
                        m.v[F],
                        m.o[A],
                        m.i[F],
                        w,
                        p[l]
                      );
                      break;
                    } else E += p[l].addedLength;
                    l += 1;
                  }
                  return (
                    x ||
                      (x = m.c
                        ? [m.v[0][0], m.v[0][1]]
                        : [m.v[m._length - 1][0], m.v[m._length - 1][1]]),
                    x
                  );
                },
                vectorOnPath: function (b, v, m) {
                  b == 1 ? (b = this.v.c) : b == 0 && (b = 0.999);
                  var C = this.pointOnPath(b, v),
                    p = this.pointOnPath(b + 0.001, v),
                    u = p[0] - C[0],
                    l = p[1] - C[1],
                    y = Math.sqrt(Math.pow(u, 2) + Math.pow(l, 2));
                  if (y === 0) return [0, 0];
                  var E = m === "tangent" ? [u / y, l / y] : [-l / y, u / y];
                  return E;
                },
                tangentOnPath: function (b, v) {
                  return this.vectorOnPath(b, v, "tangent");
                },
                normalOnPath: function (b, v) {
                  return this.vectorOnPath(b, v, "normal");
                },
                setGroupProperty: expressionHelpers.setGroupProperty,
                getValueAtTime: expressionHelpers.getStaticValueAtTime,
              }),
                extendPrototype([d], o),
                extendPrototype([d], f),
                (f.prototype.getValueAtTime = h),
                (f.prototype.initiateExpression =
                  ExpressionManager.initiateExpression);
              var P = ShapePropertyFactory.getShapeProp;
              ShapePropertyFactory.getShapeProp = function (c, b, v, m, C) {
                var p = P(c, b, v, m, C);
                return (
                  (p.propertyIndex = b.ix),
                  (p.lock = !1),
                  v === 3
                    ? expressionHelpers.searchExpressions(c, b.pt, p)
                    : v === 4 &&
                      expressionHelpers.searchExpressions(c, b.ks, p),
                  p.k && c.addDynamicProperty(p),
                  p
                );
              };
            }
            function initialize$1() {
              addPropertyDecorator();
            }
            function addDecorator() {
              function t() {
                return this.data.d.x
                  ? ((this.calculateExpression =
                      ExpressionManager.initiateExpression.bind(this)(
                        this.elem,
                        this.data.d,
                        this
                      )),
                    this.addEffect(this.getExpressionValue.bind(this)),
                    !0)
                  : null;
              }
              (TextProperty.prototype.getExpressionValue = function (e, r) {
                var i = this.calculateExpression(r);
                if (e.t !== i) {
                  var s = {};
                  return (
                    this.copyData(s, e),
                    (s.t = i.toString()),
                    (s.__complete = !1),
                    s
                  );
                }
                return e;
              }),
                (TextProperty.prototype.searchProperty = function () {
                  var e = this.searchKeyframes(),
                    r = this.searchExpressions();
                  return (this.kf = e || r), this.kf;
                }),
                (TextProperty.prototype.searchExpressions = t);
            }
            function initialize() {
              addDecorator();
            }
            function SVGComposableEffect() {}
            SVGComposableEffect.prototype = {
              createMergeNode: function t(e, r) {
                var i = createNS("feMerge");
                i.setAttribute("result", e);
                var s, n;
                for (n = 0; n < r.length; n += 1)
                  (s = createNS("feMergeNode")),
                    s.setAttribute("in", r[n]),
                    i.appendChild(s),
                    i.appendChild(s);
                return i;
              },
            };
            var linearFilterValue =
              "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0";
            function SVGTintFilter(t, e, r, i, s) {
              this.filterManager = e;
              var n = createNS("feColorMatrix");
              n.setAttribute("type", "matrix"),
                n.setAttribute("color-interpolation-filters", "linearRGB"),
                n.setAttribute("values", linearFilterValue + " 1 0"),
                (this.linearFilter = n),
                n.setAttribute("result", i + "_tint_1"),
                t.appendChild(n),
                (n = createNS("feColorMatrix")),
                n.setAttribute("type", "matrix"),
                n.setAttribute("color-interpolation-filters", "sRGB"),
                n.setAttribute(
                  "values",
                  "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"
                ),
                n.setAttribute("result", i + "_tint_2"),
                t.appendChild(n),
                (this.matrixFilter = n);
              var a = this.createMergeNode(i, [
                s,
                i + "_tint_1",
                i + "_tint_2",
              ]);
              t.appendChild(a);
            }
            extendPrototype([SVGComposableEffect], SVGTintFilter),
              (SVGTintFilter.prototype.renderFrame = function (t) {
                if (t || this.filterManager._mdf) {
                  var e = this.filterManager.effectElements[0].p.v,
                    r = this.filterManager.effectElements[1].p.v,
                    i = this.filterManager.effectElements[2].p.v / 100;
                  this.linearFilter.setAttribute(
                    "values",
                    linearFilterValue + " " + i + " 0"
                  ),
                    this.matrixFilter.setAttribute(
                      "values",
                      r[0] -
                        e[0] +
                        " 0 0 0 " +
                        e[0] +
                        " " +
                        (r[1] - e[1]) +
                        " 0 0 0 " +
                        e[1] +
                        " " +
                        (r[2] - e[2]) +
                        " 0 0 0 " +
                        e[2] +
                        " 0 0 0 1 0"
                    );
                }
              });
            function SVGFillFilter(t, e, r, i) {
              this.filterManager = e;
              var s = createNS("feColorMatrix");
              s.setAttribute("type", "matrix"),
                s.setAttribute("color-interpolation-filters", "sRGB"),
                s.setAttribute(
                  "values",
                  "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"
                ),
                s.setAttribute("result", i),
                t.appendChild(s),
                (this.matrixFilter = s);
            }
            SVGFillFilter.prototype.renderFrame = function (t) {
              if (t || this.filterManager._mdf) {
                var e = this.filterManager.effectElements[2].p.v,
                  r = this.filterManager.effectElements[6].p.v;
                this.matrixFilter.setAttribute(
                  "values",
                  "0 0 0 0 " +
                    e[0] +
                    " 0 0 0 0 " +
                    e[1] +
                    " 0 0 0 0 " +
                    e[2] +
                    " 0 0 0 " +
                    r +
                    " 0"
                );
              }
            };
            function SVGStrokeEffect(t, e, r) {
              (this.initialized = !1),
                (this.filterManager = e),
                (this.elem = r),
                (this.paths = []);
            }
            (SVGStrokeEffect.prototype.initialize = function () {
              var t =
                  this.elem.layerElement.children ||
                  this.elem.layerElement.childNodes,
                e,
                r,
                i,
                s;
              for (
                this.filterManager.effectElements[1].p.v === 1
                  ? ((s = this.elem.maskManager.masksProperties.length),
                    (i = 0))
                  : ((i = this.filterManager.effectElements[0].p.v - 1),
                    (s = i + 1)),
                  r = createNS("g"),
                  r.setAttribute("fill", "none"),
                  r.setAttribute("stroke-linecap", "round"),
                  r.setAttribute("stroke-dashoffset", 1),
                  i;
                i < s;
                i += 1
              )
                (e = createNS("path")),
                  r.appendChild(e),
                  this.paths.push({ p: e, m: i });
              if (this.filterManager.effectElements[10].p.v === 3) {
                var n = createNS("mask"),
                  a = createElementID();
                n.setAttribute("id", a),
                  n.setAttribute("mask-type", "alpha"),
                  n.appendChild(r),
                  this.elem.globalData.defs.appendChild(n);
                var h = createNS("g");
                for (
                  h.setAttribute(
                    "mask",
                    "url(" + getLocationHref() + "#" + a + ")"
                  );
                  t[0];

                )
                  h.appendChild(t[0]);
                this.elem.layerElement.appendChild(h),
                  (this.masker = n),
                  r.setAttribute("stroke", "#fff");
              } else if (
                this.filterManager.effectElements[10].p.v === 1 ||
                this.filterManager.effectElements[10].p.v === 2
              ) {
                if (this.filterManager.effectElements[10].p.v === 2)
                  for (
                    t =
                      this.elem.layerElement.children ||
                      this.elem.layerElement.childNodes;
                    t.length;

                  )
                    this.elem.layerElement.removeChild(t[0]);
                this.elem.layerElement.appendChild(r),
                  this.elem.layerElement.removeAttribute("mask"),
                  r.setAttribute("stroke", "#fff");
              }
              (this.initialized = !0), (this.pathMasker = r);
            }),
              (SVGStrokeEffect.prototype.renderFrame = function (t) {
                this.initialized || this.initialize();
                var e,
                  r = this.paths.length,
                  i,
                  s;
                for (e = 0; e < r; e += 1)
                  if (
                    this.paths[e].m !== -1 &&
                    ((i = this.elem.maskManager.viewData[this.paths[e].m]),
                    (s = this.paths[e].p),
                    (t || this.filterManager._mdf || i.prop._mdf) &&
                      s.setAttribute("d", i.lastPath),
                    t ||
                      this.filterManager.effectElements[9].p._mdf ||
                      this.filterManager.effectElements[4].p._mdf ||
                      this.filterManager.effectElements[7].p._mdf ||
                      this.filterManager.effectElements[8].p._mdf ||
                      i.prop._mdf)
                  ) {
                    var n;
                    if (
                      this.filterManager.effectElements[7].p.v !== 0 ||
                      this.filterManager.effectElements[8].p.v !== 100
                    ) {
                      var a =
                          Math.min(
                            this.filterManager.effectElements[7].p.v,
                            this.filterManager.effectElements[8].p.v
                          ) * 0.01,
                        h =
                          Math.max(
                            this.filterManager.effectElements[7].p.v,
                            this.filterManager.effectElements[8].p.v
                          ) * 0.01,
                        o = s.getTotalLength();
                      n = "0 0 0 " + o * a + " ";
                      var f = o * (h - a),
                        d =
                          1 +
                          this.filterManager.effectElements[4].p.v *
                            2 *
                            this.filterManager.effectElements[9].p.v *
                            0.01,
                        P = Math.floor(f / d),
                        c;
                      for (c = 0; c < P; c += 1)
                        n +=
                          "1 " +
                          this.filterManager.effectElements[4].p.v *
                            2 *
                            this.filterManager.effectElements[9].p.v *
                            0.01 +
                          " ";
                      n += "0 " + o * 10 + " 0 0";
                    } else
                      n =
                        "1 " +
                        this.filterManager.effectElements[4].p.v *
                          2 *
                          this.filterManager.effectElements[9].p.v *
                          0.01;
                    s.setAttribute("stroke-dasharray", n);
                  }
                if (
                  ((t || this.filterManager.effectElements[4].p._mdf) &&
                    this.pathMasker.setAttribute(
                      "stroke-width",
                      this.filterManager.effectElements[4].p.v * 2
                    ),
                  (t || this.filterManager.effectElements[6].p._mdf) &&
                    this.pathMasker.setAttribute(
                      "opacity",
                      this.filterManager.effectElements[6].p.v
                    ),
                  (this.filterManager.effectElements[10].p.v === 1 ||
                    this.filterManager.effectElements[10].p.v === 2) &&
                    (t || this.filterManager.effectElements[3].p._mdf))
                ) {
                  var b = this.filterManager.effectElements[3].p.v;
                  this.pathMasker.setAttribute(
                    "stroke",
                    "rgb(" +
                      bmFloor(b[0] * 255) +
                      "," +
                      bmFloor(b[1] * 255) +
                      "," +
                      bmFloor(b[2] * 255) +
                      ")"
                  );
                }
              });
            function SVGTritoneFilter(t, e, r, i) {
              this.filterManager = e;
              var s = createNS("feColorMatrix");
              s.setAttribute("type", "matrix"),
                s.setAttribute("color-interpolation-filters", "linearRGB"),
                s.setAttribute(
                  "values",
                  "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"
                ),
                t.appendChild(s);
              var n = createNS("feComponentTransfer");
              n.setAttribute("color-interpolation-filters", "sRGB"),
                n.setAttribute("result", i),
                (this.matrixFilter = n);
              var a = createNS("feFuncR");
              a.setAttribute("type", "table"),
                n.appendChild(a),
                (this.feFuncR = a);
              var h = createNS("feFuncG");
              h.setAttribute("type", "table"),
                n.appendChild(h),
                (this.feFuncG = h);
              var o = createNS("feFuncB");
              o.setAttribute("type", "table"),
                n.appendChild(o),
                (this.feFuncB = o),
                t.appendChild(n);
            }
            SVGTritoneFilter.prototype.renderFrame = function (t) {
              if (t || this.filterManager._mdf) {
                var e = this.filterManager.effectElements[0].p.v,
                  r = this.filterManager.effectElements[1].p.v,
                  i = this.filterManager.effectElements[2].p.v,
                  s = i[0] + " " + r[0] + " " + e[0],
                  n = i[1] + " " + r[1] + " " + e[1],
                  a = i[2] + " " + r[2] + " " + e[2];
                this.feFuncR.setAttribute("tableValues", s),
                  this.feFuncG.setAttribute("tableValues", n),
                  this.feFuncB.setAttribute("tableValues", a);
              }
            };
            function SVGProLevelsFilter(t, e, r, i) {
              this.filterManager = e;
              var s = this.filterManager.effectElements,
                n = createNS("feComponentTransfer");
              (s[10].p.k ||
                s[10].p.v !== 0 ||
                s[11].p.k ||
                s[11].p.v !== 1 ||
                s[12].p.k ||
                s[12].p.v !== 1 ||
                s[13].p.k ||
                s[13].p.v !== 0 ||
                s[14].p.k ||
                s[14].p.v !== 1) &&
                (this.feFuncR = this.createFeFunc("feFuncR", n)),
                (s[17].p.k ||
                  s[17].p.v !== 0 ||
                  s[18].p.k ||
                  s[18].p.v !== 1 ||
                  s[19].p.k ||
                  s[19].p.v !== 1 ||
                  s[20].p.k ||
                  s[20].p.v !== 0 ||
                  s[21].p.k ||
                  s[21].p.v !== 1) &&
                  (this.feFuncG = this.createFeFunc("feFuncG", n)),
                (s[24].p.k ||
                  s[24].p.v !== 0 ||
                  s[25].p.k ||
                  s[25].p.v !== 1 ||
                  s[26].p.k ||
                  s[26].p.v !== 1 ||
                  s[27].p.k ||
                  s[27].p.v !== 0 ||
                  s[28].p.k ||
                  s[28].p.v !== 1) &&
                  (this.feFuncB = this.createFeFunc("feFuncB", n)),
                (s[31].p.k ||
                  s[31].p.v !== 0 ||
                  s[32].p.k ||
                  s[32].p.v !== 1 ||
                  s[33].p.k ||
                  s[33].p.v !== 1 ||
                  s[34].p.k ||
                  s[34].p.v !== 0 ||
                  s[35].p.k ||
                  s[35].p.v !== 1) &&
                  (this.feFuncA = this.createFeFunc("feFuncA", n)),
                (this.feFuncR ||
                  this.feFuncG ||
                  this.feFuncB ||
                  this.feFuncA) &&
                  (n.setAttribute("color-interpolation-filters", "sRGB"),
                  t.appendChild(n)),
                (s[3].p.k ||
                  s[3].p.v !== 0 ||
                  s[4].p.k ||
                  s[4].p.v !== 1 ||
                  s[5].p.k ||
                  s[5].p.v !== 1 ||
                  s[6].p.k ||
                  s[6].p.v !== 0 ||
                  s[7].p.k ||
                  s[7].p.v !== 1) &&
                  ((n = createNS("feComponentTransfer")),
                  n.setAttribute("color-interpolation-filters", "sRGB"),
                  n.setAttribute("result", i),
                  t.appendChild(n),
                  (this.feFuncRComposed = this.createFeFunc("feFuncR", n)),
                  (this.feFuncGComposed = this.createFeFunc("feFuncG", n)),
                  (this.feFuncBComposed = this.createFeFunc("feFuncB", n)));
            }
            (SVGProLevelsFilter.prototype.createFeFunc = function (t, e) {
              var r = createNS(t);
              return r.setAttribute("type", "table"), e.appendChild(r), r;
            }),
              (SVGProLevelsFilter.prototype.getTableValue = function (
                t,
                e,
                r,
                i,
                s
              ) {
                for (
                  var n = 0,
                    a = 256,
                    h,
                    o = Math.min(t, e),
                    f = Math.max(t, e),
                    d = Array.call(null, { length: a }),
                    P,
                    c = 0,
                    b = s - i,
                    v = e - t;
                  n <= 256;

                )
                  (h = n / 256),
                    h <= o
                      ? (P = v < 0 ? s : i)
                      : h >= f
                      ? (P = v < 0 ? i : s)
                      : (P = i + b * Math.pow((h - t) / v, 1 / r)),
                    (d[c] = P),
                    (c += 1),
                    (n += 256 / (a - 1));
                return d.join(" ");
              }),
              (SVGProLevelsFilter.prototype.renderFrame = function (t) {
                if (t || this.filterManager._mdf) {
                  var e,
                    r = this.filterManager.effectElements;
                  this.feFuncRComposed &&
                    (t ||
                      r[3].p._mdf ||
                      r[4].p._mdf ||
                      r[5].p._mdf ||
                      r[6].p._mdf ||
                      r[7].p._mdf) &&
                    ((e = this.getTableValue(
                      r[3].p.v,
                      r[4].p.v,
                      r[5].p.v,
                      r[6].p.v,
                      r[7].p.v
                    )),
                    this.feFuncRComposed.setAttribute("tableValues", e),
                    this.feFuncGComposed.setAttribute("tableValues", e),
                    this.feFuncBComposed.setAttribute("tableValues", e)),
                    this.feFuncR &&
                      (t ||
                        r[10].p._mdf ||
                        r[11].p._mdf ||
                        r[12].p._mdf ||
                        r[13].p._mdf ||
                        r[14].p._mdf) &&
                      ((e = this.getTableValue(
                        r[10].p.v,
                        r[11].p.v,
                        r[12].p.v,
                        r[13].p.v,
                        r[14].p.v
                      )),
                      this.feFuncR.setAttribute("tableValues", e)),
                    this.feFuncG &&
                      (t ||
                        r[17].p._mdf ||
                        r[18].p._mdf ||
                        r[19].p._mdf ||
                        r[20].p._mdf ||
                        r[21].p._mdf) &&
                      ((e = this.getTableValue(
                        r[17].p.v,
                        r[18].p.v,
                        r[19].p.v,
                        r[20].p.v,
                        r[21].p.v
                      )),
                      this.feFuncG.setAttribute("tableValues", e)),
                    this.feFuncB &&
                      (t ||
                        r[24].p._mdf ||
                        r[25].p._mdf ||
                        r[26].p._mdf ||
                        r[27].p._mdf ||
                        r[28].p._mdf) &&
                      ((e = this.getTableValue(
                        r[24].p.v,
                        r[25].p.v,
                        r[26].p.v,
                        r[27].p.v,
                        r[28].p.v
                      )),
                      this.feFuncB.setAttribute("tableValues", e)),
                    this.feFuncA &&
                      (t ||
                        r[31].p._mdf ||
                        r[32].p._mdf ||
                        r[33].p._mdf ||
                        r[34].p._mdf ||
                        r[35].p._mdf) &&
                      ((e = this.getTableValue(
                        r[31].p.v,
                        r[32].p.v,
                        r[33].p.v,
                        r[34].p.v,
                        r[35].p.v
                      )),
                      this.feFuncA.setAttribute("tableValues", e));
                }
              });
            function SVGDropShadowEffect(t, e, r, i, s) {
              var n = e.container.globalData.renderConfig.filterSize,
                a = e.data.fs || n;
              t.setAttribute("x", a.x || n.x),
                t.setAttribute("y", a.y || n.y),
                t.setAttribute("width", a.width || n.width),
                t.setAttribute("height", a.height || n.height),
                (this.filterManager = e);
              var h = createNS("feGaussianBlur");
              h.setAttribute("in", "SourceAlpha"),
                h.setAttribute("result", i + "_drop_shadow_1"),
                h.setAttribute("stdDeviation", "0"),
                (this.feGaussianBlur = h),
                t.appendChild(h);
              var o = createNS("feOffset");
              o.setAttribute("dx", "25"),
                o.setAttribute("dy", "0"),
                o.setAttribute("in", i + "_drop_shadow_1"),
                o.setAttribute("result", i + "_drop_shadow_2"),
                (this.feOffset = o),
                t.appendChild(o);
              var f = createNS("feFlood");
              f.setAttribute("flood-color", "#00ff00"),
                f.setAttribute("flood-opacity", "1"),
                f.setAttribute("result", i + "_drop_shadow_3"),
                (this.feFlood = f),
                t.appendChild(f);
              var d = createNS("feComposite");
              d.setAttribute("in", i + "_drop_shadow_3"),
                d.setAttribute("in2", i + "_drop_shadow_2"),
                d.setAttribute("operator", "in"),
                d.setAttribute("result", i + "_drop_shadow_4"),
                t.appendChild(d);
              var P = this.createMergeNode(i, [i + "_drop_shadow_4", s]);
              t.appendChild(P);
            }
            extendPrototype([SVGComposableEffect], SVGDropShadowEffect),
              (SVGDropShadowEffect.prototype.renderFrame = function (t) {
                if (t || this.filterManager._mdf) {
                  if (
                    ((t || this.filterManager.effectElements[4].p._mdf) &&
                      this.feGaussianBlur.setAttribute(
                        "stdDeviation",
                        this.filterManager.effectElements[4].p.v / 4
                      ),
                    t || this.filterManager.effectElements[0].p._mdf)
                  ) {
                    var e = this.filterManager.effectElements[0].p.v;
                    this.feFlood.setAttribute(
                      "flood-color",
                      rgbToHex(
                        Math.round(e[0] * 255),
                        Math.round(e[1] * 255),
                        Math.round(e[2] * 255)
                      )
                    );
                  }
                  if (
                    ((t || this.filterManager.effectElements[1].p._mdf) &&
                      this.feFlood.setAttribute(
                        "flood-opacity",
                        this.filterManager.effectElements[1].p.v / 255
                      ),
                    t ||
                      this.filterManager.effectElements[2].p._mdf ||
                      this.filterManager.effectElements[3].p._mdf)
                  ) {
                    var r = this.filterManager.effectElements[3].p.v,
                      i =
                        (this.filterManager.effectElements[2].p.v - 90) *
                        degToRads,
                      s = r * Math.cos(i),
                      n = r * Math.sin(i);
                    this.feOffset.setAttribute("dx", s),
                      this.feOffset.setAttribute("dy", n);
                  }
                }
              });
            var _svgMatteSymbols = [];
            function SVGMatte3Effect(t, e, r) {
              (this.initialized = !1),
                (this.filterManager = e),
                (this.filterElem = t),
                (this.elem = r),
                (r.matteElement = createNS("g")),
                r.matteElement.appendChild(r.layerElement),
                r.matteElement.appendChild(r.transformedElement),
                (r.baseElement = r.matteElement);
            }
            (SVGMatte3Effect.prototype.findSymbol = function (t) {
              for (var e = 0, r = _svgMatteSymbols.length; e < r; ) {
                if (_svgMatteSymbols[e] === t) return _svgMatteSymbols[e];
                e += 1;
              }
              return null;
            }),
              (SVGMatte3Effect.prototype.replaceInParent = function (t, e) {
                var r = t.layerElement.parentNode;
                if (r) {
                  for (
                    var i = r.children, s = 0, n = i.length;
                    s < n && i[s] !== t.layerElement;

                  )
                    s += 1;
                  var a;
                  s <= n - 2 && (a = i[s + 1]);
                  var h = createNS("use");
                  h.setAttribute("href", "#" + e),
                    a ? r.insertBefore(h, a) : r.appendChild(h);
                }
              }),
              (SVGMatte3Effect.prototype.setElementAsMask = function (t, e) {
                if (!this.findSymbol(e)) {
                  var r = createElementID(),
                    i = createNS("mask");
                  i.setAttribute("id", e.layerId),
                    i.setAttribute("mask-type", "alpha"),
                    _svgMatteSymbols.push(e);
                  var s = t.globalData.defs;
                  s.appendChild(i);
                  var n = createNS("symbol");
                  n.setAttribute("id", r),
                    this.replaceInParent(e, r),
                    n.appendChild(e.layerElement),
                    s.appendChild(n);
                  var a = createNS("use");
                  a.setAttribute("href", "#" + r),
                    i.appendChild(a),
                    (e.data.hd = !1),
                    e.show();
                }
                t.setMatte(e.layerId);
              }),
              (SVGMatte3Effect.prototype.initialize = function () {
                for (
                  var t = this.filterManager.effectElements[0].p.v,
                    e = this.elem.comp.elements,
                    r = 0,
                    i = e.length;
                  r < i;

                )
                  e[r] &&
                    e[r].data.ind === t &&
                    this.setElementAsMask(this.elem, e[r]),
                    (r += 1);
                this.initialized = !0;
              }),
              (SVGMatte3Effect.prototype.renderFrame = function () {
                this.initialized || this.initialize();
              });
            function SVGGaussianBlurEffect(t, e, r, i) {
              t.setAttribute("x", "-100%"),
                t.setAttribute("y", "-100%"),
                t.setAttribute("width", "300%"),
                t.setAttribute("height", "300%"),
                (this.filterManager = e);
              var s = createNS("feGaussianBlur");
              s.setAttribute("result", i),
                t.appendChild(s),
                (this.feGaussianBlur = s);
            }
            SVGGaussianBlurEffect.prototype.renderFrame = function (t) {
              if (t || this.filterManager._mdf) {
                var e = 0.3,
                  r = this.filterManager.effectElements[0].p.v * e,
                  i = this.filterManager.effectElements[1].p.v,
                  s = i == 3 ? 0 : r,
                  n = i == 2 ? 0 : r;
                this.feGaussianBlur.setAttribute("stdDeviation", s + " " + n);
                var a =
                  this.filterManager.effectElements[2].p.v == 1
                    ? "wrap"
                    : "duplicate";
                this.feGaussianBlur.setAttribute("edgeMode", a);
              }
            };
            function TransformEffect() {}
            (TransformEffect.prototype.init = function (t) {
              (this.effectsManager = t),
                (this.type = effectTypes.TRANSFORM_EFFECT),
                (this.matrix = new Matrix()),
                (this.opacity = -1),
                (this._mdf = !1),
                (this._opMdf = !1);
            }),
              (TransformEffect.prototype.renderFrame = function (t) {
                if (
                  ((this._opMdf = !1),
                  (this._mdf = !1),
                  t || this.effectsManager._mdf)
                ) {
                  var e = this.effectsManager.effectElements,
                    r = e[0].p.v,
                    i = e[1].p.v,
                    s = e[2].p.v === 1,
                    n = e[3].p.v,
                    a = s ? n : e[4].p.v,
                    h = e[5].p.v,
                    o = e[6].p.v,
                    f = e[7].p.v;
                  this.matrix.reset(),
                    this.matrix.translate(-r[0], -r[1], r[2]),
                    this.matrix.scale(a * 0.01, n * 0.01, 1),
                    this.matrix.rotate(-f * degToRads),
                    this.matrix.skewFromAxis(
                      -h * degToRads,
                      (o + 90) * degToRads
                    ),
                    this.matrix.translate(i[0], i[1], 0),
                    (this._mdf = !0),
                    this.opacity !== e[8].p.v &&
                      ((this.opacity = e[8].p.v), (this._opMdf = !0));
                }
              });
            function SVGTransformEffect(t, e) {
              this.init(e);
            }
            extendPrototype([TransformEffect], SVGTransformEffect);
            function CVTransformEffect(t) {
              this.init(t);
            }
            return (
              extendPrototype([TransformEffect], CVTransformEffect),
              registerRenderer("canvas", CanvasRenderer),
              registerRenderer("html", HybridRenderer),
              registerRenderer("svg", SVGRenderer),
              ShapeModifiers.registerModifier("tm", TrimModifier),
              ShapeModifiers.registerModifier("pb", PuckerAndBloatModifier),
              ShapeModifiers.registerModifier("rp", RepeaterModifier),
              ShapeModifiers.registerModifier("rd", RoundCornersModifier),
              ShapeModifiers.registerModifier("zz", ZigZagModifier),
              ShapeModifiers.registerModifier("op", OffsetPathModifier),
              setExpressionsPlugin(Expressions),
              setExpressionInterfaces(getInterface),
              initialize$1(),
              initialize(),
              registerEffect$1(20, SVGTintFilter, !0),
              registerEffect$1(21, SVGFillFilter, !0),
              registerEffect$1(22, SVGStrokeEffect, !1),
              registerEffect$1(23, SVGTritoneFilter, !0),
              registerEffect$1(24, SVGProLevelsFilter, !0),
              registerEffect$1(25, SVGDropShadowEffect, !0),
              registerEffect$1(28, SVGMatte3Effect, !1),
              registerEffect$1(29, SVGGaussianBlurEffect, !0),
              registerEffect$1(35, SVGTransformEffect, !1),
              registerEffect(35, CVTransformEffect),
              lottie
            );
          });
      })(lottie$2, lottie$2.exports)),
    lottie$2.exports
  );
}
var lottieExports = requireLottie();
const lottie = getDefaultExportFromCjs(lottieExports);
function _arrayLikeToArray(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, i = Array(e); r < e; r++) i[r] = t[r];
  return i;
}
function _arrayWithHoles(t) {
  if (Array.isArray(t)) return t;
}
function _defineProperty(t, e, r) {
  return (
    (e = _toPropertyKey(e)) in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function _iterableToArrayLimit(t, e) {
  var r =
    t == null
      ? null
      : (typeof Symbol < "u" && t[Symbol.iterator]) || t["@@iterator"];
  if (r != null) {
    var i,
      s,
      n,
      a,
      h = [],
      o = !0,
      f = !1;
    try {
      if (((n = (r = r.call(t)).next), e !== 0))
        for (
          ;
          !(o = (i = n.call(r)).done) && (h.push(i.value), h.length !== e);
          o = !0
        );
    } catch (d) {
      (f = !0), (s = d);
    } finally {
      try {
        if (!o && r.return != null && ((a = r.return()), Object(a) !== a))
          return;
      } finally {
        if (f) throw s;
      }
    }
    return h;
  }
}
function _nonIterableRest() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ownKeys(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e &&
      (i = i.filter(function (s) {
        return Object.getOwnPropertyDescriptor(t, s).enumerable;
      })),
      r.push.apply(r, i);
  }
  return r;
}
function _objectSpread2(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? ownKeys(Object(r), !0).forEach(function (i) {
          _defineProperty(t, i, r[i]);
        })
      : Object.getOwnPropertyDescriptors
      ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
      : ownKeys(Object(r)).forEach(function (i) {
          Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(r, i));
        });
  }
  return t;
}
function _objectWithoutProperties(t, e) {
  if (t == null) return {};
  var r,
    i,
    s = _objectWithoutPropertiesLoose(t, e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    for (i = 0; i < n.length; i++)
      (r = n[i]),
        e.includes(r) || ({}.propertyIsEnumerable.call(t, r) && (s[r] = t[r]));
  }
  return s;
}
function _objectWithoutPropertiesLoose(t, e) {
  if (t == null) return {};
  var r = {};
  for (var i in t)
    if ({}.hasOwnProperty.call(t, i)) {
      if (e.includes(i)) continue;
      r[i] = t[i];
    }
  return r;
}
function _slicedToArray(t, e) {
  return (
    _arrayWithHoles(t) ||
    _iterableToArrayLimit(t, e) ||
    _unsupportedIterableToArray(t, e) ||
    _nonIterableRest()
  );
}
function _toPrimitive(t, e) {
  if (typeof t != "object" || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var i = r.call(t, e);
    if (typeof i != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function _toPropertyKey(t) {
  var e = _toPrimitive(t, "string");
  return typeof e == "symbol" ? e : e + "";
}
function _unsupportedIterableToArray(t, e) {
  if (t) {
    if (typeof t == "string") return _arrayLikeToArray(t, e);
    var r = {}.toString.call(t).slice(8, -1);
    return (
      r === "Object" && t.constructor && (r = t.constructor.name),
      r === "Map" || r === "Set"
        ? Array.from(t)
        : r === "Arguments" ||
          /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
        ? _arrayLikeToArray(t, e)
        : void 0
    );
  }
}
var _excluded$1 = [
    "animationData",
    "loop",
    "autoplay",
    "initialSegment",
    "onComplete",
    "onLoopComplete",
    "onEnterFrame",
    "onSegmentStart",
    "onConfigReady",
    "onDataReady",
    "onDataFailed",
    "onLoadedImages",
    "onDOMLoaded",
    "onDestroy",
    "lottieRef",
    "renderer",
    "name",
    "assetsPath",
    "rendererSettings",
  ],
  useLottie = function t(e, r) {
    var i = e.animationData,
      s = e.loop,
      n = e.autoplay,
      a = e.initialSegment,
      h = e.onComplete,
      o = e.onLoopComplete,
      f = e.onEnterFrame,
      d = e.onSegmentStart,
      P = e.onConfigReady,
      c = e.onDataReady,
      b = e.onDataFailed,
      v = e.onLoadedImages,
      m = e.onDOMLoaded,
      C = e.onDestroy;
    e.lottieRef, e.renderer, e.name, e.assetsPath, e.rendererSettings;
    var p = _objectWithoutProperties(e, _excluded$1),
      u = reactExports.useState(!1),
      l = _slicedToArray(u, 2),
      y = l[0],
      E = l[1],
      x = reactExports.useRef(),
      A = reactExports.useRef(null),
      F = function () {
        var V;
        (V = x.current) === null || V === void 0 || V.play();
      },
      w = function () {
        var V;
        (V = x.current) === null || V === void 0 || V.stop();
      },
      z = function () {
        var V;
        (V = x.current) === null || V === void 0 || V.pause();
      },
      R = function (V) {
        var D;
        (D = x.current) === null || D === void 0 || D.setSpeed(V);
      },
      L = function (V, D) {
        var B;
        (B = x.current) === null || B === void 0 || B.goToAndPlay(V, D);
      },
      O = function (V, D) {
        var B;
        (B = x.current) === null || B === void 0 || B.goToAndStop(V, D);
      },
      G = function (V) {
        var D;
        (D = x.current) === null || D === void 0 || D.setDirection(V);
      },
      I = function (V, D) {
        var B;
        (B = x.current) === null || B === void 0 || B.playSegments(V, D);
      },
      _ = function (V) {
        var D;
        (D = x.current) === null || D === void 0 || D.setSubframe(V);
      },
      T = function (V) {
        var D;
        return (D = x.current) === null || D === void 0
          ? void 0
          : D.getDuration(V);
      },
      g = function () {
        var V;
        (V = x.current) === null || V === void 0 || V.destroy(),
          (x.current = void 0);
      },
      S = function () {
        var V =
            arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
          D;
        if (A.current) {
          (D = x.current) === null || D === void 0 || D.destroy();
          var B = _objectSpread2(
            _objectSpread2(_objectSpread2({}, e), V),
            {},
            { container: A.current }
          );
          return (
            (x.current = lottie.loadAnimation(B)),
            E(!!x.current),
            function () {
              var H;
              (H = x.current) === null || H === void 0 || H.destroy(),
                (x.current = void 0);
            }
          );
        }
      };
    reactExports.useEffect(
      function () {
        var M = S();
        return function () {
          return M == null ? void 0 : M();
        };
      },
      [i, s]
    ),
      reactExports.useEffect(
        function () {
          x.current && (x.current.autoplay = !!n);
        },
        [n]
      ),
      reactExports.useEffect(
        function () {
          if (x.current) {
            if (!a) {
              x.current.resetSegments(!0);
              return;
            }
            !Array.isArray(a) ||
              !a.length ||
              ((x.current.currentRawFrame < a[0] ||
                x.current.currentRawFrame > a[1]) &&
                (x.current.currentRawFrame = a[0]),
              x.current.setSegment(a[0], a[1]));
          }
        },
        [a]
      ),
      reactExports.useEffect(
        function () {
          var M = [
              { name: "complete", handler: h },
              { name: "loopComplete", handler: o },
              { name: "enterFrame", handler: f },
              { name: "segmentStart", handler: d },
              { name: "config_ready", handler: P },
              { name: "data_ready", handler: c },
              { name: "data_failed", handler: b },
              { name: "loaded_images", handler: v },
              { name: "DOMLoaded", handler: m },
              { name: "destroy", handler: C },
            ],
            V = M.filter(function (B) {
              return B.handler != null;
            });
          if (V.length) {
            var D = V.map(function (B) {
              var H;
              return (
                (H = x.current) === null ||
                  H === void 0 ||
                  H.addEventListener(B.name, B.handler),
                function () {
                  var j;
                  (j = x.current) === null ||
                    j === void 0 ||
                    j.removeEventListener(B.name, B.handler);
                }
              );
            });
            return function () {
              D.forEach(function (B) {
                return B();
              });
            };
          }
        },
        [h, o, f, d, P, c, b, v, m, C]
      );
    var k = React.createElement("div", _objectSpread2({ style: r, ref: A }, p));
    return {
      View: k,
      play: F,
      stop: w,
      pause: z,
      setSpeed: R,
      goToAndStop: O,
      goToAndPlay: L,
      setDirection: G,
      playSegments: I,
      setSubframe: _,
      getDuration: T,
      destroy: g,
      animationContainerRef: A,
      animationLoaded: y,
      animationItem: x.current,
    };
  };
function getContainerVisibility(t) {
  console.log("[getContainerVisibility] 📏 Calculating container visibility");
  var e = t.getBoundingClientRect(),
    r = e.top,
    i = e.height,
    s = window.innerHeight - r,
    n = window.innerHeight + i;

  var visibility = s / n;
  console.log("[getContainerVisibility] 📊 Container visibility:", {
    top: r,
    height: i,
    visiblePortion: s,
    totalHeight: n,
    visibilityRatio: visibility,
  });

  return visibility;
}

function getContainerCursorPosition(t, e, r) {
  console.log("[getContainerCursorPosition] 🖱️ Calculating cursor position");
  var i = t.getBoundingClientRect(),
    s = i.top,
    n = i.left,
    a = i.width,
    h = i.height,
    o = (e - n) / a,
    f = (r - s) / h;

  console.log("[getContainerCursorPosition] 📍 Cursor position:", {
    containerTop: s,
    containerLeft: n,
    containerWidth: a,
    containerHeight: h,
    mouseX: e,
    mouseY: r,
    relativeX: o,
    relativeY: f,
  });

  return { x: o, y: f };
}
var useInitInteractivity = function t(e) {
    var r = e.wrapperRef,
      i = e.animationItem,
      s = e.mode,
      n = e.actions;

    console.log("[useInitInteractivity] 🔧 Initializing interactivity", {
      mode: s,
      actionsCount: n ? n.length : 0,
      hasAnimationItem: i ? true : false,
      hasWrapper: r && r.current ? true : false,
    });

    reactExports.useEffect(
      function () {
        var a = r.current;
        if (!(!a || !i || !n.length)) {
          console.log(
            "[useInitInteractivity] ▶️ Stopping initial animation to prepare for interactivity mode"
          );
          i.stop();
          var h = function () {
              var d = null,
                P = function () {
                  var b = getContainerVisibility(a),
                    v = n.find(function (C) {
                      var p = C.visibility;
                      return p && b >= p[0] && b <= p[1];
                    });
                  if (v) {
                    if (
                      v.type === "seek" &&
                      v.visibility &&
                      v.frames.length === 2
                    ) {
                      var m =
                        v.frames[0] +
                        Math.ceil(
                          ((b - v.visibility[0]) /
                            (v.visibility[1] - v.visibility[0])) *
                            v.frames[1]
                        ); //! goToAndStop must be relative to the start of the current segment
                      i.goToAndStop(m - i.firstFrame - 1, !0);
                    }
                    v.type === "loop" &&
                      (d === null || d !== v.frames || i.isPaused) &&
                      (i.playSegments(v.frames, !0), (d = v.frames)),
                      v.type === "play" &&
                        i.isPaused &&
                        (i.resetSegments(!0), i.play()),
                      v.type === "stop" &&
                        i.goToAndStop(v.frames[0] - i.firstFrame - 1, !0);
                  }
                };
              return (
                document.addEventListener("scroll", P),
                function () {
                  document.removeEventListener("scroll", P);
                }
              );
            },
            o = function () {
              var d = function (v, m) {
                  var C = v,
                    p = m;
                  if (C !== -1 && p !== -1) {
                    var u = getContainerCursorPosition(a, C, p);
                    (C = u.x), (p = u.y);
                  }
                  var l = n.find(function (x) {
                    var A = x.position;
                    return A && Array.isArray(A.x) && Array.isArray(A.y)
                      ? C >= A.x[0] && C <= A.x[1] && p >= A.y[0] && p <= A.y[1]
                      : A && !Number.isNaN(A.x) && !Number.isNaN(A.y)
                      ? C === A.x && p === A.y
                      : !1;
                  });
                  if (l) {
                    if (
                      l.type === "seek" &&
                      l.position &&
                      Array.isArray(l.position.x) &&
                      Array.isArray(l.position.y) &&
                      l.frames.length === 2
                    ) {
                      var y =
                          (C - l.position.x[0]) /
                          (l.position.x[1] - l.position.x[0]),
                        E =
                          (p - l.position.y[0]) /
                          (l.position.y[1] - l.position.y[0]);
                      i.playSegments(l.frames, !0),
                        i.goToAndStop(
                          Math.ceil(
                            ((y + E) / 2) * (l.frames[1] - l.frames[0])
                          ),
                          !0
                        );
                    }
                    l.type === "loop" && i.playSegments(l.frames, !0),
                      l.type === "play" &&
                        (i.isPaused && i.resetSegments(!1),
                        i.playSegments(l.frames)),
                      l.type === "stop" && i.goToAndStop(l.frames[0], !0);
                  }
                },
                P = function (v) {
                  d(v.clientX, v.clientY);
                },
                c = function () {
                  d(-1, -1);
                };
              return (
                a.addEventListener("mousemove", P),
                a.addEventListener("mouseout", c),
                function () {
                  a.removeEventListener("mousemove", P),
                    a.removeEventListener("mouseout", c);
                }
              );
            };
          switch (s) {
            case "scroll":
              return h();
            case "cursor":
              return o();
          }
        }
      },
      [s, i]
    );
  },
  useLottieInteractivity = function t(e) {
    console.log("[useLottieInteractivity] 🔄 Initializing with mode:", e.mode);
    var r = e.actions,
      i = e.mode,
      s = e.lottieObj,
      n = s.animationItem,
      a = s.View,
      h = s.animationContainerRef;

    console.log("[useLottieInteractivity] ⚙️ Animation details:", {
      hasAnimationItem: n ? true : false,
      hasAnimationContainer: h.current ? true : false,
      actionsCount: r ? r.length : 0,
    });

    return (
      useInitInteractivity({
        actions: r,
        animationItem: n,
        mode: i,
        wrapperRef: h,
      }),
      a
    );
  },
  _excluded = ["style", "interactivity"],
  Lottie = function t(e) {
    console.log("[Lottie] 🎬 Initializing Lottie component", {
      hasInteractivity: e.interactivity ? true : false,
      interactivityMode: e.interactivity?.mode || "none",
      hasStyle: e.style ? Object.keys(e.style).length > 0 : false,
    });

    var r,
      i,
      s,
      n = e.style,
      a = e.interactivity,
      h = _objectWithoutProperties(e, _excluded),
      o = useLottie(h, n),
      f = o.View,
      d = o.play,
      P = o.stop,
      c = o.pause,
      b = o.setSpeed,
      v = o.goToAndStop,
      m = o.goToAndPlay,
      C = o.setDirection,
      p = o.playSegments,
      u = o.setSubframe,
      l = o.getDuration,
      y = o.destroy,
      E = o.animationContainerRef,
      x = o.animationLoaded,
      A = o.animationItem;

    console.log("[Lottie] 🖼️ Animation status:", {
      loaded: x,
      hasAnimationItem: A ? true : false,
      hasContainer: E?.current ? true : false,
    });
    return (
      reactExports.useEffect(
        function () {
          if (e.lottieRef) {
            console.log("[Lottie] 🔗 Setting lottieRef reference");
            e.lottieRef.current = {
              play: d,
              stop: P,
              pause: c,
              setSpeed: b,
              goToAndPlay: m,
              goToAndStop: v,
              setDirection: C,
              playSegments: p,
              setSubframe: u,
              getDuration: l,
              destroy: y,
              animationContainerRef: E,
              animationLoaded: x,
              animationItem: A,
            };
            console.log("[Lottie] ✅ lottieRef successfully updated");
          }
        },
        [(r = e.lottieRef) === null || r === void 0 ? void 0 : r.current]
      ),
      useLottieInteractivity({
        lottieObj: {
          View: f,
          play: d,
          stop: P,
          pause: c,
          setSpeed: b,
          goToAndStop: v,
          goToAndPlay: m,
          setDirection: C,
          playSegments: p,
          setSubframe: u,
          getDuration: l,
          destroy: y,
          animationContainerRef: E,
          animationLoaded: x,
          animationItem: A,
        },
        actions:
          (i = a == null ? void 0 : a.actions) !== null && i !== void 0
            ? i
            : [],
        mode:
          (s = a == null ? void 0 : a.mode) !== null && s !== void 0
            ? s
            : "scroll",
      })
    );
  };
const postToIframe = (t, e, r) => {
  console.log("[postToIframe] 📨 Preparing to post message to iframe", {
    type: e,
    data: r,
    iframe: t ? "exists" : "null",
  });

  return setTimeout(() => {
    var i;
    console.log(
      "[postToIframe] ⏱️ Timeout elapsed, sending message to iframe",
      {
        type: e,
        hasContentWindow: t && t.contentWindow ? true : false,
      }
    );

    if ((i = t == null ? void 0 : t.contentWindow) == null) {
      console.warn(
        "[postToIframe] ❌ Failed to send message - contentWindow is null",
        {
          type: e,
          data: r,
        }
      );
      return;
    }

    try {
      i.postMessage({ type: e, data: r }, "*");
      console.log("[postToIframe] ✅ Message successfully sent to iframe", {
        type: e,
      });
    } catch (error) {
      console.error("[postToIframe] 🔥 Error sending message to iframe", {
        type: e,
        error: error.message,
      });
    }
  }, 500);
};
export { Lottie as L, postToIframe as p };
