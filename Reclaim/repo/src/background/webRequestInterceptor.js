// src/background/webRequestInterceptor.js

// Utility to register and unregister chrome.webRequest listeners for a session.
// This lets us monitor network traffic without injecting scripts into the page (CSP-safe).

export function registerRequestInterceptors(ctx) {
  if (ctx.webRequestListenersRegistered) return;

  // Build URL filters from providerData.requestData (paths or regex strings)
  const urlFilters = [];
  if (ctx.providerData && Array.isArray(ctx.providerData.requestData)) {
    ctx.providerData.requestData.forEach((req) => {
      if (req?.url) {
        try {
          const u = new URL(req.url);
          urlFilters.push(u.origin + "/*");
        } catch (_) {}
      }
    });
  }

  // Fallback – if nothing extracted, listen to all requests for provider domain
  if (urlFilters.length === 0 && ctx.providerData?.loginUrl) {
    try {
      const u = new URL(ctx.providerData.loginUrl);
      urlFilters.push(u.origin + "/*");
    } catch (_) {}
  }

  if (urlFilters.length === 0) {
    console.warn("[webRequestInterceptor] No URL filters derived – skipping listener registration.");
    return;
  }

  // Valid request types: https://developer.chrome.com/docs/extensions/reference/webRequest/#type-Rule
  const requestFilter = { urls: urlFilters, types: ["xmlhttprequest", "sub_frame", "websocket"] };

  const onBeforeRequest = (details) => {
    // Store minimal info for later proof creation
    const requestInfo = {
      url: details.url,
      method: details.method,
      requestId: details.requestId,
      timeStamp: details.timeStamp,
    };
    ctx.filteredRequests.set(details.requestId, requestInfo);
  };

  const onCompleted = (details) => {
    if (!ctx.filteredRequests.has(details.requestId)) return;
    const req = ctx.filteredRequests.get(details.requestId);
    req.statusCode = details.statusCode;
    req.responseHeaders = details.responseHeaders || [];
    // Process / create claims as earlier pipeline
    ctx.processFilteredRequest(req, { requestHash: details.requestId }, ctx.sessionId, ctx.providerData.loginUrl);
  };

  chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, requestFilter, []);
  chrome.webRequest.onCompleted.addListener(onCompleted, requestFilter, ["responseHeaders"]);

  ctx.__webRequest_onBefore = onBeforeRequest;
  ctx.__webRequest_onCompleted = onCompleted;
  ctx.webRequestListenersRegistered = true;
}

export function unregisterRequestInterceptors(ctx) {
  if (!ctx.webRequestListenersRegistered) return;
  try {
    chrome.webRequest.onBeforeRequest.removeListener(ctx.__webRequest_onBefore);
    chrome.webRequest.onCompleted.removeListener(ctx.__webRequest_onCompleted);
  } catch (_) {}
  ctx.webRequestListenersRegistered = false;
} 