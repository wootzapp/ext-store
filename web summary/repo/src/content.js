let currentUrl = window.location.href;

console.log('Content script loaded');
setupUrlMonitoring();
setupPageLoadListener();

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
      
    case 'aiProcessingComplete':
      console.log('AI processing completed:', message.data);
      displayAIResults(message.data);
      sendResponse({
        type: 'aiResultsReceived',
        timestamp: new Date().toISOString()
      });
      break;
      
    case 'aiProcessingProgress':
      console.log('AI processing progress:', message.data);
      displayAIProgress(message.data);
      sendResponse({
        type: 'aiProgressReceived',
        timestamp: new Date().toISOString()
      });
      break;

    case 'aiProcessingError':
      console.log('AI processing error:', message.data);
      sendResponse({
        type: 'aiErrorReceived',
        timestamp: new Date().toISOString()
      });
      break;
      
    default:
      console.log('Unknown message type:', message.type);
      break;
  }
  
  return true; 
});

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
    const oldUrl = currentUrl;
    currentUrl = newUrl;
    console.log('URL changed from:', oldUrl, 'to:', currentUrl);
    
    clearStorageForNewPage();
    
    captureAndSendDOM();
    notifyBackgroundOfUrlChange();
  }
}

function clearStorageForNewPage() {
  chrome.storage.local.remove(['currentPage', 'aiResults', 'aiError', 'aiProcessingStatus'], () => {
    console.log('Storage cleared for URL change');
  });
}

function setupUrlMonitoring() {
  setInterval(checkUrlChange, 1000);
}

function captureAndSendDOM() {
  waitForPageLoad().then(() => {
    const domData = {
      url: currentUrl,
      title: document.title,
      html: document.documentElement.outerHTML,
      textContent: document.body ? document.body.textContent : '',
      cleanTextContent: '',
      timestamp: new Date().toISOString()
    };

    cleanDomData(domData);

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

function cleanDomData(domData) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = domData.html;

  console.log('Original HTML length:', tempDiv.innerHTML.length);

  const headElements = tempDiv.querySelectorAll('head');
  headElements.forEach(el => el.remove());

  const styleElements = tempDiv.querySelectorAll('style');
  styleElements.forEach(el => el.remove());

  const scriptElements = tempDiv.querySelectorAll('script');
  scriptElements.forEach(el => el.remove());

  const noscriptElements = tempDiv.querySelectorAll('noscript');
  noscriptElements.forEach(el => el.remove());

  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach(el => {
    if (el.children.length > 0) return;

    const textContent = (el.textContent || '').trim();
    while (el.attributes.length > 0) {
      el.removeAttribute(el.attributes[0].name);
    }
  });

  console.log('After cleaning:', tempDiv.innerHTML.length);

  let cleanText = tempDiv.textContent || tempDiv.innerText || '';


  cleanText = cleanText.replace(/<img[^>]*>/g, '');
  cleanText = cleanText.replace(/<input[^>]*>/g, '');
  cleanText = cleanText.replace(/<meta[^>]*>/g, '');
  cleanText = cleanText.replace(/<link[^>]*>/g, '');
  cleanText = cleanText.replace(/<br[^>]*>/g, '');
  cleanText = cleanText.replace(/<hr[^>]*>/g, '');
  cleanText = cleanText.replace(/<base[^>]*>/g, '');

  cleanText = cleanText
    .replace(/\s+/g, ' ')           
    .replace(/\n\s*\n/g, '\n')      
    .replace(/^\s+|\s+$/g, '')      
    .replace(/\t/g, ' ')            
    .replace(/\r/g, '')             
    .replace(/[^\S\r\n]+/g, ' ')    
    .trim();

  console.log('Text Content cleaned:', cleanText);
  console.log('Text Content cleaned length:', cleanText.length);
  
  const finalImgCheck = tempDiv.querySelectorAll('img');
  console.log('Final img check:', finalImgCheck.length);
  
  domData.cleanTextContent = cleanText;
  domData.html = tempDiv.innerHTML;
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

function displayAIProgress(progressData) {
  console.log('=== AI PROCESSING PROGRESS ===');
  console.log('Status:', progressData.status);
  console.log('Timestamp:', progressData.timestamp);
  console.log('=== END PROGRESS ===');
}

function displayAIResults(aiData) {
  console.log('=== AI RESULTS ===');
  console.log('URL:', aiData.url);
  console.log('Title:', aiData.title);
  console.log('Summary:', aiData.summary);
  console.log('FAQs:', aiData.faqs);
  console.log('Provider:', aiData.provider);
  console.log('Timestamp:', aiData.timestamp);
  console.log('=== END AI RESULTS ===');
}

function getStoredDOMData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['currentPage'], (result) => {
      resolve(result.currentPage || null);
    });
  });
}

function getStoredAIResults() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['aiResults'], (result) => {
      resolve(result.aiResults || null);
    });
  });
}

function getStoredAIError() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['aiError'], (result) => {
      resolve(result.aiError || null);
    });
  });
}
  
async function getAllStoredData() {
  const [domData, aiResults, aiError] = await Promise.all([
    getStoredDOMData(),
    getStoredAIResults(),
    getStoredAIError()
  ]);
  
  return {
    domData,
    aiResults,
    aiError
  };
}



