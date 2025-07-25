let currentUrl = window.location.href;

console.log('Content script loaded');
setupUrlMonitoring();
setupPageLoadListener();

async function waitForPageLoad() {
  if (document.readyState === 'complete') {
    return;
  }
  
  return new Promise((resolve) => {
    const checkLoad = () => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        setTimeout(checkLoad, 100);
      }
    };
    checkLoad();
  });
}

function checkUrlChange() {
  const newUrl = window.location.href;
  if (newUrl !== currentUrl) {
    currentUrl = newUrl;
    console.log('URL changed to:', currentUrl);
    captureAndSendDOM();
    notifyBackgroundOfUrlChange();
  }
}

function setupUrlMonitoring() {
  setInterval(checkUrlChange, 1000);
}

function captureAndSendDOM() {
  // Wait for page to be fully loaded before capturing DOM
  waitForPageLoad().then(() => {
    const domData = {
      url: currentUrl,
      title: document.title,
      html: document.documentElement.outerHTML,
      textContent: document.body ? document.body.textContent.substring(0, 1000) : '', // First 1000 chars
      timestamp: new Date().toISOString()
    };
    
    chrome.runtime.sendMessage({
      type: 'domCaptured',
      data: domData
    }).then(response => {
      console.log('Background acknowledged DOM capture:', response);
    }).catch(err => {
      console.log('Could not send DOM to background:', err);
    });
  });
}

function notifyBackgroundOfUrlChange() {
  chrome.runtime.sendMessage({
    type: 'urlChanged',
    url: currentUrl,
    timestamp: new Date().toISOString()
  }).then(response => {
    console.log('Background acknowledged URL change:', response);
  }).catch(err => {
    console.log('Could not notify background about URL change:', err);
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  switch (message.type) {
    case 'ping':
      console.log('Background ping received');
      sendResponse({
        type: 'pong',
        status: 'initialized',
        timestamp: new Date().toISOString()
      });
      break;
      
    case 'getCurrentUrl':
      console.log('Background requested current URL');
      sendResponse({
        type: 'currentUrlResponse',
        url: currentUrl,
        timestamp: new Date().toISOString()
      });
      break;
      
    case 'captureDOM':
      console.log('Background requested DOM capture');
      captureAndSendDOM();
      sendResponse({
        type: 'domCaptureRequested',
        timestamp: new Date().toISOString()
      });
      break;
      
    default:
      console.log('Unknown message type:', message.type);
      break;
  }
  
  return true; 
});

function setupPageLoadListener() {
  if (document.readyState === 'complete') {
    captureAndSendDOM();
    notifyBackgroundOfPageLoad();
  } else {
    window.addEventListener('load', () => {
      captureAndSendDOM();
      notifyBackgroundOfPageLoad();
    });
  }
}

function notifyBackgroundOfPageLoad() {
  chrome.runtime.sendMessage({
    type: 'pageLoaded',
    url: currentUrl,
    timestamp: new Date().toISOString()
  });
}



