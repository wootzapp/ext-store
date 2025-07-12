console.log("[CommonJSHelpers] 🌍 Initializing CommonJS helpers");
var u =
  typeof globalThis < "u"
    ? globalThis
    : typeof window < "u"
    ? window
    : typeof global < "u"
    ? global
    : typeof self < "u"
    ? self
    : {};
console.log(
  "[CommonJSHelpers] 🔍 Global context resolved to:",
  typeof globalThis < "u"
    ? "globalThis"
    : typeof window < "u"
    ? "window"
    : typeof global < "u"
    ? "global"
    : typeof self < "u"
    ? "self"
    : "empty object"
);
function f(e) {
  console.log("[CommonJSHelpers] 📦 getDefaultExportFromCjs called with:", {
    isObject: typeof e === "object",
    isNull: e === null,
    isModule: e && e.__esModule,
    hasDefaultExport:
      e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default"),
  });

  const result =
    e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default")
      ? e.default
      : e;

  console.log("[CommonJSHelpers] 📤 getDefaultExportFromCjs returning:", {
    resultType: typeof result,
    isResultNull: result === null,
  });

  return result;
}
function l(e) {
  console.log("[CommonJSHelpers] 🔄 createCommonjsModule called with:", {
    isObject: typeof e === "object",
    isNull: e === null,
    isModule: e && e.__esModule,
  });

  if (e.__esModule) {
    console.log(
      "[CommonJSHelpers] ✅ Module is already an ES module, returning as is"
    );
    return e;
  }

  var r = e.default;
  console.log("[CommonJSHelpers] 🧩 Module default export type:", typeof r);

  var t;
  if (typeof r == "function") {
    console.log(
      "[CommonJSHelpers] 🏗️ Creating constructor wrapper for function"
    );
    t = function o() {
      const isNewInstance = this instanceof o;
      console.log(
        "[CommonJSHelpers] 🔧 Constructor wrapper called with new:",
        isNewInstance
      );
      return isNewInstance
        ? Reflect.construct(r, arguments, this.constructor)
        : r.apply(this, arguments);
    };
    t.prototype = r.prototype;
  } else {
    console.log(
      "[CommonJSHelpers] 📝 Creating empty object for non-function default"
    );
    t = {};
  }

  Object.defineProperty(t, "__esModule", { value: !0 });

  const keys = Object.keys(e);
  console.log(
    `[CommonJSHelpers] 🔑 Copying ${keys.length} properties from module`
  );

  keys.forEach(function (o) {
    var n = Object.getOwnPropertyDescriptor(e, o);
    Object.defineProperty(
      t,
      o,
      n.get
        ? n
        : {
            enumerable: !0,
            get: function () {
              console.log(
                `[CommonJSHelpers] ⚡ Getting property "${o}" from module`
              );
              return e[o];
            },
          }
    );
  });

  console.log("[CommonJSHelpers] ✅ createCommonjsModule complete");
  return t;
}
console.log("[CommonJSHelpers] 📤 Exporting helper functions");
export { l as a, u as c, f as g };
