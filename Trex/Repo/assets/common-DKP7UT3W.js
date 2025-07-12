const a = (t, e) => {
    const s = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/i.test(t);
    if (!s || !e) return s;
    try {
      const c = new URL(t.startsWith("http") ? t : `https://${t}`);
      return o(e).test(c.pathname);
    } catch {
      return !1;
    }
  },
  o = (t) => {
    const e = t.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]+");
    return new RegExp(`^${e}$`);
  },
  u = (t, e) => {
    const s = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)/i.test(t);
    if (!s || !e) return s;
    try {
      const c = new URL(t.startsWith("http") ? t : `https://${t}`);
      return o(e).test(c.pathname);
    } catch {
      return !1;
    }
  },
  h = (t) => {
    const e = t.match(/status\/(\d+)/);
    return e ? e[1] : "";
  },
  x = (t) => {
    const e = t.match(/v=([^&]+)/);
    return e ? e[1] : "";
  };
export { x as a, a as b, h as e, u as i };
