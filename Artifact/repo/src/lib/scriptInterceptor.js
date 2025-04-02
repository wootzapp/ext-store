/*global chrome, google */
// Static implementations of required external scripts
const scripts = {
  uid2SecureSignal: {
    init: () => {
      console.log('🔐 Initializing UID2 Secure Signal');
      window.__uid2 = window.__uid2 || { 
        callbacks: [],
        advertising_token: null
      };
      window.getUid2AdvertisingToken = () => {
        console.log('📢 Getting UID2 advertising token:', window.__uid2.advertising_token);
        return window.__uid2.advertising_token;
      };
    }
  },
  uid2Sdk: {
    init: () => {
      console.log('🔄 Initializing UID2 SDK');
      window.__uid2 = {
        callbacks: [],
        advertising_token: null,
        refresh_token: null,
        baseUrl: null,
        init: function(config) {
          console.log('🚀 UID2 SDK init called with config:', config);
          this.baseUrl = config.baseUrl;
          this.callbacks.forEach(callback => callback('InitCompleted'));
        },
        setIdentity: function(identity) {
          console.log('🔑 Setting UID2 identity:', identity);
          this.advertising_token = identity.advertising_token;
          this.refresh_token = identity.refresh_token;
          localStorage.setItem('_GESPSK-uidapi.com', JSON.stringify({
            advertising_token: identity.advertising_token,
            refresh_token: identity.refresh_token
          }));
          this.callbacks.forEach(callback => callback('IdentityUpdated'));
        },
        isLoginRequired: function() {
          return !this.advertising_token;
        }
      };
      window.__uid2.callbacks.forEach(callback => callback('SdkLoaded'));
    }
  },
  gpt: {
    init: () => {
      console.log('📢 Initializing GPT');
      window.googletag = window.googletag || { cmd: [] };
      window.googletag.cmd = window.googletag.cmd || [];
      window.googletag.pubads = () => ({
        enableSingleRequest: () => {},
        enableServices: () => {}
      });
      window.googletag.enableServices = () => {};
    }
  },
  ima: {
    init: () => {
      console.log('🎬 Initializing IMA SDK');
      if (!window.google) window.google = {};
      
      // Create a real video element for ad playback
      let adVideoElement = null;

      // Helper function to fetch ad content through background script
      const fetchAdContent = async (url) => {
        return new Promise((resolve, reject) => {
          console.log('📡 Fetching ad content through background script');
          
          // Function to extract video URL from VAST XML
          const extractVideoUrl = (vastXml) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(vastXml, 'text/xml');
            const mediaFiles = xmlDoc.getElementsByTagName('MediaFile');
            
            console.log('🎥 Found MediaFiles:', mediaFiles.length);
            
            // Find the most suitable video URL
            let selectedUrl = null;
            let selectedBitrate = 0;
            
            for (let i = 0; i < mediaFiles.length; i++) {
              const mediaFile = mediaFiles[i];
              const type = mediaFile.getAttribute('type');
              const bitrate = parseInt(mediaFile.getAttribute('bitrate') || '0');
              
              // Prefer MP4 format with moderate bitrate (around 1000-2000)
              if (type === 'video/mp4' && bitrate > selectedBitrate && bitrate < 2000) {
                selectedUrl = mediaFile.textContent.trim();
                selectedBitrate = bitrate;
                console.log('📼 Found suitable video:', { url: selectedUrl, bitrate, type });
              }
            }
            
            return selectedUrl;
          };

          // First fetch VAST XML
          fetch(url)
            .then(response => response.text())
            .then(vastXml => {
              console.log('📄 Received VAST XML');
              const videoUrl = extractVideoUrl(vastXml);
              
              if (!videoUrl) {
                throw new Error('No suitable video URL found in VAST response');
              }
              
              console.log('🎯 Selected video URL:', videoUrl);
              
              // Set video source directly
              if (adVideoElement) {
                console.log('🎥 Setting video source to:', videoUrl);
                
                // Remove any existing sources
                while (adVideoElement.firstChild) {
                  adVideoElement.removeChild(adVideoElement.firstChild);
                }
                
                // Create and add new source element
                const source = document.createElement('source');
                source.src = videoUrl;
                source.type = 'video/mp4';
                adVideoElement.appendChild(source);
                
                // Set src attribute as fallback
                adVideoElement.src = videoUrl;
                
                // Force reload
                adVideoElement.load();
                
                resolve(videoUrl);
              } else {
                throw new Error('Video element not found');
              }
            })
            .catch(error => {
              console.error('❌ Error processing VAST response:', error);
              reject(error);
            });
        });
      };
      
      window.google.ima = {
        AdDisplayContainer: class AdDisplayContainer {
          constructor(adContainer, video) {
            console.log('🎥 Creating AdDisplayContainer');
            this.adContainer = adContainer;
            this.video = video;
            this.initialize = () => {
              console.log('🎬 Initializing AdDisplayContainer');
              if (!adVideoElement) {
                adVideoElement = document.createElement('video');
                adVideoElement.style.position = 'absolute';
                adVideoElement.style.top = '0';
                adVideoElement.style.left = '0';
                adVideoElement.style.width = '100%';
                adVideoElement.style.height = '100%';
                adVideoElement.style.zIndex = '10';
                adVideoElement.setAttribute('playsinline', '');
                adVideoElement.setAttribute('webkit-playsinline', '');
                adVideoElement.preload = 'auto';
                this.adContainer.appendChild(adVideoElement);

                // Add error listener
                adVideoElement.addEventListener('error', (e) => {
                  console.error('❌ Video error:', {
                    error: e.target.error,
                    code: e.target.error?.code,
                    message: e.target.error?.message,
                    networkState: adVideoElement.networkState,
                    readyState: adVideoElement.readyState,
                    src: adVideoElement.src
                  });
                });

                // Add source error listener
                adVideoElement.addEventListener('stalled', () => {
                  console.warn('⚠️ Video stalled');
                });

                // Add loadedmetadata listener
                adVideoElement.addEventListener('loadedmetadata', () => {
                  console.log('✅ Video metadata loaded');
                });
              }
            };
          }
        },
        AdsLoader: class AdsLoader {
          constructor(adDisplayContainer) {
            console.log('📺 Creating AdsLoader');
            this.adDisplayContainer = adDisplayContainer;
            this.eventHandlers = new Map();
            this.addEventListener = (event, handler) => {
              console.log(`🎯 Adding event listener for: ${event}`);
              this.eventHandlers.set(event, handler);
            };
            this.requestAds = async (adsRequest) => {
              console.log('🔄 Requesting ads with:', {
                adTagUrl: adsRequest.adTagUrl,
                width: adsRequest.linearAdSlotWidth,
                height: adsRequest.linearAdSlotHeight
              });
              
              try {
                // Try to fetch the actual ad content first
                let adUrl;
                try {
                  console.log('🎯 Attempting to fetch actual ad from:', adsRequest.adTagUrl);
                  const adContent = await fetchAdContent(adsRequest.adTagUrl);
                  console.log('✅ Successfully fetched ad content URL:', adContent);
                  adUrl = adContent;
                } catch (error) {
                  console.warn('⚠️ Failed to fetch actual ad, falling back to test video:', error);
                  adUrl = 'https://storage.googleapis.com/gvabox/media/samples/stock.mp4';
                  console.log('🎬 Using fallback test video URL:', adUrl);
                }

                const adsManager = {
                  init: (width, height, viewMode) => {
                    console.log('🎨 Initializing ads manager:', { width, height, viewMode });
                    
                    // Create source element for better control
                    const source = document.createElement('source');
                    source.src = adUrl;
                    source.type = 'video/mp4';
                    
                    // Clear existing sources
                    while (adVideoElement.firstChild) {
                      adVideoElement.removeChild(adVideoElement.firstChild);
                    }
                    
                    // Add new source
                    adVideoElement.appendChild(source);
                    
                    // Set source directly as fallback
                    adVideoElement.src = adUrl;
                    
                    // Force reload
                    adVideoElement.load();
                    
                    // Add loadedmetadata event listener
                    adVideoElement.addEventListener('loadedmetadata', () => {
                      console.log('✅ Video metadata loaded successfully');
                    });
                    
                    // Add error listener with detailed logging
                    adVideoElement.addEventListener('error', (e) => {
                      console.error('❌ Video loading error:', {
                        error: e.target.error,
                        networkState: adVideoElement.networkState,
                        readyState: adVideoElement.readyState,
                        src: adVideoElement.src,
                        currentSrc: adVideoElement.currentSrc
                      });
                    });
                  },
                  start: () => {
                    console.log('▶️ Starting ad playback for URL:', adVideoElement.src);
                    
                    // Trigger content pause
                    const pauseHandler = this.eventHandlers.get(window.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED);
                    if (pauseHandler) {
                      console.log('⏸️ Content pause requested');
                      pauseHandler();
                    }

                    // Start ad playback
                    const playPromise = adVideoElement.play();
                    if (playPromise !== undefined) {
                      playPromise.then(() => {
                        console.log('🎥 Ad playback started successfully');
                        // Log video information
                        console.log('📺 Video Information:', {
                          currentSrc: adVideoElement.currentSrc,
                          videoWidth: adVideoElement.videoWidth,
                          videoHeight: adVideoElement.videoHeight,
                          duration: adVideoElement.duration,
                          readyState: adVideoElement.readyState
                        });
                      }).catch(error => {
                        console.error('❌ Error playing ad:', error);
                        const errorHandler = this.eventHandlers.get(window.google.ima.AdErrorEvent.Type.AD_ERROR);
                        if (errorHandler) errorHandler({ getError: () => error });
                      });
                    }

                    // Set up event listeners
                    adVideoElement.onended = () => {
                      console.log('✅ Ad playback complete');
                      const completeHandler = this.eventHandlers.get(window.google.ima.AdEvent.Type.COMPLETE);
                      if (completeHandler) completeHandler();
                      
                      const resumeHandler = this.eventHandlers.get(window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED);
                      if (resumeHandler) {
                        console.log('▶️ Content resume requested');
                        resumeHandler();
                      }
                      
                      const allAdsHandler = this.eventHandlers.get(window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED);
                      if (allAdsHandler) {
                        console.log('🏁 All ads completed');
                        allAdsHandler();
                      }
                      
                      // Clean up
                      if (adVideoElement && adVideoElement.parentNode) {
                        adVideoElement.parentNode.removeChild(adVideoElement);
                        adVideoElement = null;
                      }
                    };

                    // Add error handling
                    adVideoElement.onerror = (error) => {
                      console.error('❌ Video error:', error);
                      const errorHandler = this.eventHandlers.get(window.google.ima.AdErrorEvent.Type.AD_ERROR);
                      if (errorHandler) errorHandler({ getError: () => error });
                    };
                  },
                  addEventListener: (event, eventHandler) => {
                    console.log(`📝 Adding ads manager event listener for: ${event}`);
                    this.eventHandlers.set(event, eventHandler);
                  },
                  destroy: () => {
                    console.log('🗑️ Destroying ads manager');
                    if (adVideoElement) {
                      adVideoElement.pause();
                      adVideoElement.src = '';
                      adVideoElement.load();
                      if (adVideoElement.parentNode) {
                        adVideoElement.parentNode.removeChild(adVideoElement);
                      }
                      adVideoElement = null;
                    }
                  }
                };

                setTimeout(() => {
                  const adsManagerLoadedEvent = {
                    getAdsManager: () => {
                      console.log('📋 Getting ads manager instance');
                      return adsManager;
                    }
                  };

                  const handler = this.eventHandlers.get(window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED);
                  if (handler) {
                    console.log('🚀 Triggering ADS_MANAGER_LOADED event');
                    handler(adsManagerLoadedEvent);
                  }
                }, 100);

              } catch (error) {
                console.error('❌ Error in requestAds:', error);
                const errorHandler = this.eventHandlers.get(window.google.ima.AdErrorEvent.Type.AD_ERROR);
                if (errorHandler) errorHandler({ getError: () => error });
              }
            };
          }
        },
        AdsManagerLoadedEvent: {
          Type: { ADS_MANAGER_LOADED: 'adsManagerLoaded' }
        },
        AdEvent: {
          Type: {
            CONTENT_PAUSE_REQUESTED: 'contentPauseRequested',
            CONTENT_RESUME_REQUESTED: 'contentResumeRequested',
            ALL_ADS_COMPLETED: 'allAdsCompleted',
            STARTED: 'started',
            COMPLETE: 'complete',
            SKIPPED: 'skipped'
          }
        },
        AdErrorEvent: {
          Type: { AD_ERROR: 'adError' }
        },
        AdsRenderingSettings: class AdsRenderingSettings {
          constructor() {
            this.restoreCustomPlaybackStateOnAdBreakComplete = true;
          }
        },
        AdsRequest: class AdsRequest {
          constructor() {
            this.adTagUrl = '';
            this.linearAdSlotWidth = 0;
            this.linearAdSlotHeight = 0;
            this.nonLinearAdSlotWidth = 0;
            this.nonLinearAdSlotHeight = 0;
          }
        },
        ViewMode: {
          NORMAL: 'normal'
        }
      };
    }
  }
};

// Function to initialize a script
export function injectScript(scriptName) {
  console.log(`🔄 Injecting script: ${scriptName}`);
  const script = scripts[scriptName];
  if (!script) {
    console.error(`❌ No implementation found for script: ${scriptName}`);
    return;
  }
  script.init();
}

// Export script map for reference
export const scriptMap = {
  'https://cdn.integ.uidapi.com/uid2SecureSignal.js': 'uid2SecureSignal',
  'https://cdn.integ.uidapi.com/uid2-sdk-3.9.0.js': 'uid2Sdk',
  'https://securepubads.g.doubleclick.net/tag/js/gpt.js': 'gpt',
  'https://imasdk.googleapis.com/js/sdkloader/ima3.js': 'ima'
}; 