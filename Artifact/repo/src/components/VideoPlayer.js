/* global google */
import { Play } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import styles from "./VideoPlayer.module.sass";

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

  const checkGespskStorage = (retryCount = 0, maxRetries = 10) => {
    console.log("Checking GESPSK storage, attempt:", retryCount + 1);

    const storage = localStorage.getItem("_GESPSK-uidapi.com");
    const token = window.getUid2AdvertisingToken?.();

    if (storage) {
      console.log("✅ GESPSK Storage found:", JSON.parse(storage));
      setGespskReady(true);
      return;
    }

    if (token) {
      console.log("🔄 UID2 token available but waiting for GESPSK storage:", token);
    } else {
      console.log("⚠️ No UID2 token available yet");
    }

    if (retryCount < maxRetries) {
      const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      setTimeout(() => checkGespskStorage(retryCount + 1, maxRetries), backoffDelay);
    } else {
      console.error("❌ Max retries reached waiting for GESPSK storage");
    }
  };

  useEffect(() => {
    if (!uid2Token) {
      console.log("⚠️ No uid2Token provided");
      return;
    }

    console.log("🔄 Initializing with token:", uid2Token);

    window.googletag = window.googletag || { cmd: [] };
    window.getUid2AdvertisingToken = () => {
      console.log("🔍 Getting UID2 token");
      return uid2Token;
    };

    window.__uid2 = window.__uid2 || { callbacks: [] };
    window.__uid2.callbacks.push((eventType, payload) => {
      console.log("🎯 UID2 Event:", eventType, payload);

      switch (eventType) {
        case "SdkLoaded":
          console.log("✅ SDK Loaded, initializing");
          window.__uid2.init({
            baseUrl: "https://prod.uidapi.com",
          });
          break;

        case "InitCompleted":
          console.log("✅ Init completed, checking login required:", window.__uid2.isLoginRequired());
          if (window.__uid2.isLoginRequired()) {
            window.__uid2.setIdentity({
              advertising_token: uid2Token,
              refresh_token: refreshToken,
            });
            checkGespskStorage();
          }
          break;

        case "IdentityUpdated":
          console.log("✅ Identity updated, checking GESPSK");
          checkGespskStorage();
          break;
      }
    });

    const loadScripts = async () => {
      const scripts = [
        {
          src: "https://cdn.integ.uidapi.com/uid2SecureSignal.js",
          id: "uid2-secure-signal-script",
        },
        {
          src: "https://cdn.integ.uidapi.com/uid2-sdk-3.9.0.js",
          id: "uid2-sdk-script",
        },
        {
          src: "https://securepubads.g.doubleclick.net/tag/js/gpt.js",
          id: "gpt-script",
        },
        {
          src: "https://imasdk.googleapis.com/js/sdkloader/ima3.js",
          id: "ima-script",
        },
      ];

      for (const script of scripts) {
        await new Promise((resolve, reject) => {
          if (document.getElementById(script.id)) {
            resolve();
            return;
          }

          const scriptElement = document.createElement("script");
          scriptElement.src = script.src;
          scriptElement.id = script.id;
          scriptElement.async = true;
          scriptElement.onload = () => {
            if (script.id === "gpt-script") {
              window.googletag.cmd.push(() => {
                window.googletag.pubads().enableSingleRequest();
                window.googletag.enableServices();
                resolve();
              });
            } else {
              resolve();
            }
          };
          scriptElement.onerror = reject;
          document.body.appendChild(scriptElement);
        });
      }
      setIsReady(true);
    };

    loadScripts().catch(console.error);

    return () => {
      if (adsManagerRef.current) {
        adsManagerRef.current.destroy();
      }
    };
  }, [uid2Token, refreshToken]);

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
    if (!hasUserInteraction && isReady && gespskReady) {
      try {
        setHasUserInteraction(true);
        videoRef.current.load();
        // toggleFullscreen();

        adDisplayContainerRef.current = new google.ima.AdDisplayContainer(adContainerRef.current, videoRef.current);
        adDisplayContainerRef.current.initialize();

        adsLoaderRef.current = new google.ima.AdsLoader(adDisplayContainerRef.current);
        adsLoaderRef.current.addEventListener(
          google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          onAdsManagerLoaded,
          false
        );
        adsLoaderRef.current.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

        const adsRequest = new google.ima.AdsRequest();
        adsRequest.adTagUrl = adTag;
        adsRequest.linearAdSlotWidth = window.innerWidth;
        adsRequest.linearAdSlotHeight = window.innerHeight;
        adsRequest.nonLinearAdSlotWidth = window.innerWidth;
        adsRequest.nonLinearAdSlotHeight = 150;

        adsLoaderRef.current.requestAds(adsRequest);
      } catch (error) {
        console.error("Error initializing ads:", error);
        onAdError(error);
      }
    } else {
      console.log("Play button clicked but conditions not met:", {
        hasUserInteraction,
        isReady,
        gespskReady,
      });
    }
  };

  const onAdsManagerLoaded = (adsManagerLoadedEvent) => {
    try {
      const adsRenderingSettings = new google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

      adsManagerRef.current = adsManagerLoadedEvent.getAdsManager(videoRef.current, adsRenderingSettings);

      adsManagerRef.current.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
      adsManagerRef.current.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, () => {
        videoRef.current.pause();
        setIsAdPlaying(true);
      });
      adsManagerRef.current.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, () => {
        setIsAdPlaying(false);
      });
      adsManagerRef.current.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
        setIsAdPlaying(false);
        setHasUserInteraction(false);
        if (onAdWatched) onAdWatched();
      });
      adsManagerRef.current.addEventListener(google.ima.AdEvent.Type.COMPLETE, () => {
        if (onAdWatched) onAdWatched();
      });
      adsManagerRef.current.addEventListener(google.ima.AdEvent.Type.SKIPPED, () => {
        if (onAdWatched) onAdWatched();
      });

      adsManagerRef.current.init(window.innerWidth, window.innerHeight, google.ima.ViewMode.NORMAL);
      adsManagerRef.current.start();
    } catch (error) {
      console.error("Error in ads manager loading:", error);
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
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
              gap: "1rem",
              pointerEvents: "none", // This ensures clicks pass through to the button
            }}
          >
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                pointerEvents: "auto", // Re-enable pointer events for this div
                border: "3px solid rgba(255, 255, 255, 0.8)",
                boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
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
                  cursor: gespskReady ? "pointer" : "not-allowed",
                  opacity: gespskReady ? 1 : 0.5,
                  transition: "transform 0.2s ease",
                  transform: gespskReady ? "scale(1)" : "scale(0.95)",
                }}
                disabled={!gespskReady}
                onMouseEnter={(e) => {
                  if (gespskReady) {
                    e.currentTarget.style.transform = "scale(1.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (gespskReady) {
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                <Play size={60} color="white" style={{ marginLeft: "8px" }} />
              </button>
            </div>
            <div
              style={{
                color: "white",
                fontSize: "1.125rem",
                fontWeight: "500",
                textAlign: "center",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                pointerEvents: "auto", // Re-enable pointer events for this div
              }}
            >
              {isAdPlaying ? "Loading Ad..." : gespskReady ? "" : "Initializing..."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPlayer;