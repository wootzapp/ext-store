/* global google */
import { Play } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import styles from "./VideoPlayer.module.sass";
import { scriptUrls, fetchAndInjectScript, executeScript } from '../lib/scriptLoader';

export function VideoPlayer({ adTag, uid2Token, refreshToken, onAdWatched, posterImage }) {
  const videoRef = useRef(null);
  const adContainerRef = useRef(null);
  const adsManagerRef = useRef(null);
  const adsLoaderRef = useRef(null);
  const adDisplayContainerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [hasUserInteraction, setHasUserInteraction] = useState(false);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [gespskReady, setGespskReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [adStatus, setAdStatus] = useState("Waiting for initialization...");
  const [debugState, setDebugState] = useState({
    scriptsLoaded: false,
    uid2Ready: false,
    gespskReady: false
  });
  
  // Cooldown period states
  const [nextRewardAvailable, setNextRewardAvailable] = useState(true);
  const [adLocked, setAdLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [adVideoTimestamp, setAdVideoTimestamp] = useState(null);

  // Format time for display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if ad is available based on cooldown
  const checkAdAvailability = () => {
    const storedTimestamp = localStorage.getItem('adVideoTimestamp');
    if (storedTimestamp) {
      setAdVideoTimestamp(parseInt(storedTimestamp));
      const adVideoWatchedTime = parseInt(storedTimestamp);
      const currentTime = Date.now();
      const timeDifference = currentTime - adVideoWatchedTime;
      const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (timeDifference >= cooldownPeriod) {
        setNextRewardAvailable(true);
        setAdLocked(false);
      } else {
        setNextRewardAvailable(false);
        setAdLocked(true);
        setRemainingTime(Math.ceil((cooldownPeriod - timeDifference) / 1000));
      }
    } else {
      setNextRewardAvailable(true);
      setAdLocked(false);
    }
  };

  // Timer management for ad cooldowns
  useEffect(() => {
    // Initial check
    checkAdAvailability();
    
    // Update timer every second
    const timer = setInterval(() => {
      if (adVideoTimestamp) {
        const adVideoWatchedTime = adVideoTimestamp;
        const currentTime = Date.now();
        const timeDifference = currentTime - adVideoWatchedTime;
        const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours
        
        if (timeDifference >= cooldownPeriod) {
          setNextRewardAvailable(true);
          setAdLocked(false);
        } else {
          setNextRewardAvailable(false);
          setAdLocked(true);
          setRemainingTime(Math.ceil((cooldownPeriod - timeDifference) / 1000));
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [adVideoTimestamp]);

  // Timer countdown effect
  useEffect(() => {
    let timer;
    if (!nextRewardAvailable && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setNextRewardAvailable(true);
            setAdLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [nextRewardAvailable, remainingTime]);

  // Handle ad completion
  const handleAdCompleted = async () => {
    // Set cooldown timestamp
    const timestamp = Date.now();
    setAdVideoTimestamp(timestamp);
    localStorage.setItem('adVideoTimestamp', timestamp.toString());
    
    // Update cooldown states
    setNextRewardAvailable(false);
    setAdLocked(true);
    setRemainingTime(24 * 60 * 60);
    
    // Reset ad states
    setIsAdPlaying(false);
    setHasUserInteraction(false);
    
    // Call the original onAdWatched callback
    try {
      if (onAdWatched) {
        await onAdWatched();
      }
    } catch (error) {
      console.error("Error processing ad completion:", error);
      // If error, reset lock state
      setAdLocked(false);
      setNextRewardAvailable(true);
    }
  };

  const checkGespskStorage = (retryCount = 0, maxRetries = 10) => {
    console.log("🔍 Checking GESPSK storage, attempt:", retryCount + 1, {
      hasToken: !!uid2Token,
      hasStorage: !!localStorage.getItem("_GESPSK-uidapi.com"),
      gespskReady,
      uid2Ready: !!window.__uid2?.advertising_token
    });

    const storage = localStorage.getItem("_GESPSK-uidapi.com");
    const token = window.getUid2AdvertisingToken?.() || window.__uid2?.advertising_token;

    if (storage) {
      console.log("✅ GESPSK Storage found:", storage);
      setGespskReady(true);
      setDebugState(prev => ({ ...prev, gespskReady: true }));
      setAdStatus("Ready - Click to play ad");
      return;
    }

    if (token) {
      console.log("🔄 UID2 token available:", token);
      const gespskData = {
        advertising_token: token,
        refresh_token: refreshToken
      };
      localStorage.setItem("_GESPSK-uidapi.com", JSON.stringify(gespskData));
      console.log("💾 Created GESPSK storage with token");
      setGespskReady(true);
      setDebugState(prev => ({ ...prev, gespskReady: true }));
      setAdStatus("Ready - Click to play ad");
      return;
    }

    console.log("⚠️ No UID2 token or GESPSK storage available yet");
    setAdStatus("Waiting for UID2 initialization...");
    
    if (retryCount < maxRetries) {
      const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`🔄 Retrying in ${backoffDelay}ms...`);
      setTimeout(() => checkGespskStorage(retryCount + 1, maxRetries), backoffDelay);
    } else {
      console.error("❌ Max retries reached waiting for GESPSK storage");
      setAdStatus("Failed to initialize - Please refresh");
    }
  };

  useEffect(() => {
    if (!uid2Token) {
      console.log("⚠️ No uid2Token provided");
      setAdStatus("Waiting for UID2 token...");
      return;
    }

    console.log("🔄 Setting up UID2 callbacks");

    window.__uid2 = window.__uid2 || { callbacks: [] };
    window.__uid2.callbacks.push((eventType, payload) => {
      console.log("🎯 UID2 Event:", eventType, payload);

      switch (eventType) {
        case "SdkLoaded":
          console.log("✅ SDK Loaded, initializing");
          setDebugState(prev => ({ ...prev, uid2Ready: true }));
          if (window.__uid2.init) {
            window.__uid2.init({
              baseUrl: "https://prod.uidapi.com",
            });
            console.log("✅ UID2 SDK initialized");
          } else {
            console.warn("⚠️ window.__uid2.init not available");
          }
          break;

        case "InitCompleted":
          console.log("✅ Init completed, checking login required");
          if (window.__uid2.isLoginRequired?.()) {
            console.log("🔑 Setting identity with token:", uid2Token);
            window.__uid2.setIdentity({
              advertising_token: uid2Token,
              refresh_token: refreshToken,
            });
          }
          checkGespskStorage(0);
          break;

        case "IdentityUpdated":
          console.log("✅ Identity updated, checking GESPSK");
          checkGespskStorage(0);
          break;
      }
    });

    const loadScripts = async () => {
      try {
        setAdStatus("Loading required scripts...");
        console.log('🎬 Starting script loading sequence');
        
        for (const [key, url] of Object.entries(scriptUrls)) {
          console.log(`📦 Loading script ${key} from ${url}`);
          setAdStatus(`Loading ${key}...`);
          
          try {
            const { content } = await fetchAndInjectScript(url);
            console.log(`✅ Script ${key} content loaded`);
            await executeScript(content, url);
            console.log(`✅ Script ${key} executed successfully`);
          } catch (error) {
            console.error(`❌ Error loading script ${key}:`, error);
            setAdStatus(`Error loading ${key} - Please refresh`);
            throw error;
          }
        }

        console.log('🎉 All scripts loaded successfully');
        setIsReady(true);
        setDebugState(prev => ({ ...prev, scriptsLoaded: true }));
        setAdStatus("Scripts loaded - Initializing components...");
        
        // Initialize UID2 immediately after scripts are loaded
        if (uid2Token) {
          console.log('🔑 Initializing UID2 with token:', uid2Token);
          if (window.__uid2?.setIdentity) {
            window.__uid2.setIdentity({
              advertising_token: uid2Token,
              refresh_token: refreshToken,
            });
            console.log('✅ UID2 identity set');
          } else {
            console.warn('⚠️ window.__uid2.setIdentity not available yet');
          }
        }

        // Force check GESPSK storage
        console.log('🔄 Checking GESPSK storage after script load');
        checkGespskStorage(0);
      } catch (error) {
        console.error('❌ Error in script loading sequence:', error);
        setAdStatus("Error loading scripts - Please refresh");
      }
    };

    loadScripts().catch(console.error);

    return () => {
      if (adsManagerRef.current) {
        adsManagerRef.current.destroy();
      }
    };
  }, [uid2Token, refreshToken]);

  // Add debug info display
  useEffect(() => {
    console.log("Current state:", debugState, {
      isReady,
      gespskReady,
      hasUserInteraction: hasUserInteraction,
      isAdPlaying,
      nextRewardAvailable,
      adLocked,
      remainingTime
    });
  }, [debugState, isReady, gespskReady, hasUserInteraction, isAdPlaying, nextRewardAvailable, adLocked, remainingTime]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.parentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handlePlayClick = async () => {
    if (!hasUserInteraction && isReady && gespskReady && nextRewardAvailable && !adLocked) {
      try {
        setHasUserInteraction(true);
        setAdStatus("Loading video player...");
        videoRef.current.load();

        setAdStatus("Initializing ad container...");
        adDisplayContainerRef.current = new google.ima.AdDisplayContainer(adContainerRef.current, videoRef.current);
        adDisplayContainerRef.current.initialize();

        setAdStatus("Setting up ad loader...");
        adsLoaderRef.current = new google.ima.AdsLoader(adDisplayContainerRef.current);
        adsLoaderRef.current.addEventListener(
          google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          onAdsManagerLoaded,
          false
        );
        adsLoaderRef.current.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

        setAdStatus("Requesting ads...");
        const adsRequest = new google.ima.AdsRequest();
        adsRequest.adTagUrl = adTag;
        adsRequest.linearAdSlotWidth = window.innerWidth;
        adsRequest.linearAdSlotHeight = window.innerHeight;
        adsRequest.nonLinearAdSlotWidth = window.innerWidth;
        adsRequest.nonLinearAdSlotHeight = 150;

        adsLoaderRef.current.requestAds(adsRequest);
      } catch (error) {
        console.error("Error initializing ads:", error);
        setAdStatus("Error loading ad");
        onAdError(error);
      }
    } else {
      console.log("Play button clicked but conditions not met:", {
        hasUserInteraction,
        isReady,
        gespskReady,
        nextRewardAvailable,
        adLocked
      });
    }
  };

  const onAdsManagerLoaded = (adsManagerLoadedEvent) => {
    try {
      setAdStatus("Configuring ad manager...");
      const adsRenderingSettings = new google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

      adsManagerRef.current = adsManagerLoadedEvent.getAdsManager(videoRef.current, adsRenderingSettings);

      adsManagerRef.current.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
      adsManagerRef.current.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, () => {
        videoRef.current.pause();
        setIsAdPlaying(true);
        setAdStatus("Playing ad...");
      });
      adsManagerRef.current.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, () => {
        setIsAdPlaying(false);
        setAdStatus("Ad finished");
      });
      adsManagerRef.current.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
        setIsAdPlaying(false);
        setHasUserInteraction(false);
        setAdStatus("All ads completed");
        handleAdCompleted();
      });
      adsManagerRef.current.addEventListener(google.ima.AdEvent.Type.COMPLETE, () => {
        setAdStatus("Ad complete");
        handleAdCompleted();
      });
      adsManagerRef.current.addEventListener(google.ima.AdEvent.Type.SKIPPED, () => {
        setAdStatus("Ad skipped");
        handleAdCompleted();
      });

      setAdStatus("Starting ad playback...");
      adsManagerRef.current.init(window.innerWidth, window.innerHeight, google.ima.ViewMode.NORMAL);
      adsManagerRef.current.start();
    } catch (error) {
      console.error("Error in ads manager loading:", error);
      setAdStatus("Error loading ad manager");
      onAdError(error);
    }
  };

  const onAdError = (adErrorEvent) => {
    console.error("Ad error:", adErrorEvent.getError?.() || adErrorEvent);
    if (adsManagerRef.current) {
      adsManagerRef.current.destroy();
    }
    setIsAdPlaying(false);
    setHasUserInteraction(false);
    setAdStatus("Ad error occurred");
    if (onAdWatched) onAdWatched();
  };

  return (
    <div
      className={styles.mainwrapper}
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)",
        }}
      >
        <video
          ref={videoRef}
          className={styles.adwrapper}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 5,
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
          poster={posterImage || "/api/placeholder/1920/1080"}
          playsInline
          preload="auto"
        >
          <source src="" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div
          ref={adContainerRef}
          style={{
            position: "absolute",
            zIndex: 6,
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        />
        {!hasUserInteraction && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 30,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
              pointerEvents: "none",
              backdropFilter: "blur(8px)",
              padding: "2rem",
              borderRadius: "24px",
              background: "rgba(0, 0, 0, 0.2)",
            }}
          >
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                background: "linear-gradient(145deg, rgba(99, 102, 241, 0.8), rgba(168, 85, 247, 0.8))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                pointerEvents: "auto",
                border: "4px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 4px 8px rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
              }}
            >
              <button
                onClick={handlePlayClick}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: (gespskReady && nextRewardAvailable && !adLocked) ? "pointer" : "not-allowed",
                  opacity: (gespskReady && nextRewardAvailable && !adLocked) ? 1 : 0.5,
                  transition: "all 0.3s ease",
                  transform: (gespskReady && nextRewardAvailable && !adLocked) ? "scale(1)" : "scale(0.95)",
                }}
                disabled={!gespskReady || !nextRewardAvailable || adLocked}
                onMouseEnter={(e) => {
                  if (gespskReady && nextRewardAvailable && !adLocked) {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.parentElement.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 4px 8px rgba(255, 255, 255, 0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (gespskReady && nextRewardAvailable && !adLocked) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.parentElement.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 4px 8px rgba(255, 255, 255, 0.1)";
                  }
                }}
              >
                <Play size={70} color="white" style={{ marginLeft: "8px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
              </button>
            </div>
            <div
              style={{
                color: "white",
                fontSize: "1.25rem",
                fontWeight: "500",
                textAlign: "center",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4))",
                padding: "1rem 2rem",
                borderRadius: "16px",
                pointerEvents: "auto",
                backdropFilter: "blur(4px)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                letterSpacing: "0.5px",
              }}
            >
              {isAdPlaying ? "Loading Ad..." : 
               !gespskReady ? "Initializing..." : 
               adStatus}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPlayer;