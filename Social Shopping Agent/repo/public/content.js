/* global chrome */
(function () {
  function tryHistoryBack() {
    console.log('🔍 Trying history back');
    try {
      window.history.back();
      console.log('🔍 History back successful');
      return true;
    } catch (e) {
      console.log('🔍 History back failed:', e);
      return false;
    }
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || !msg.type) return;
    if (msg.type === '__agent_history_back') {
      console.log('🔍 __agent_history_back');
      const ok = tryHistoryBack();
      sendResponse({ ok });
      return true; // keep channel open if needed
    }
  });
})();


