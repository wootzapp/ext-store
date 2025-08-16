// Minimal XRegExp replacement for the extension
function XRegExp(pattern, flags) {
  // If pattern is already a string, create a regular expression
  if (typeof pattern === 'string') {
    return new RegExp(pattern, flags);
  }
  
  // If pattern is already a RegExp, return it as is
  if (pattern instanceof RegExp) {
    return pattern;
  }
  
  // Fallback
  return new RegExp(pattern, flags);
}

// Make XRegExp available globally
if (typeof window !== 'undefined') {
  window.XRegExp = XRegExp;
} else if (typeof global !== 'undefined') {
  global.XRegExp = XRegExp;
} else if (typeof self !== 'undefined') {
  self.XRegExp = XRegExp;
}