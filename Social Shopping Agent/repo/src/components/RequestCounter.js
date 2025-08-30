/* global chrome */
import React, { useState, useEffect, useRef } from "react";
import { FaCrown, FaExclamationTriangle, FaCheckCircle, FaSync } from "react-icons/fa";
import apiService from "../services/api";

// Singleton to prevent multiple instances
let requestCounterInstance = null;

const RequestCounter = ({ subscriptionState, onUpgradeClick, onRefresh, onUsageDataChange }) => {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const refreshTimeoutRef = useRef(null);

  // Ensure only one instance
  useEffect(() => {
    if (requestCounterInstance) {
      console.log("RequestCounter: Multiple instances detected, cleaning up");
      return () => {
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
      };
    }
    requestCounterInstance = true;
    
    return () => {
      requestCounterInstance = null;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Simple load function with debouncing
  const loadUsageData = async (forceRefresh = false) => {
    const now = Date.now();
    
    // Prevent multiple simultaneous calls unless forced
    if (!forceRefresh && now - lastRefreshTime < 1000) {
      console.log("RequestCounter: Skipping refresh, too soon");
      return;
    }

    // Clear any pending timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Debounce the actual API call
    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        setLastRefreshTime(Date.now());

        console.log("RequestCounter - loading usage data (debounced)");
        
        // Clear any cached data to ensure fresh response
        const quotaResponse = await apiService.getActiveOrganizationQuota();
        
        if (quotaResponse && quotaResponse.quotas) {
          const chatQuota = quotaResponse.quotas.find(q => q.featureKey === 'chat');
          
          if (chatQuota) {
            const usageDataObj = {
              plan: quotaResponse.subscriptionStatus === 'active' ? 'Paid' : 'Free',
              limit: chatQuota.limit,
              used: chatQuota.currentUsage,
              remaining: chatQuota.remaining,
              usagePercentage: chatQuota.usagePercentage,
              status: quotaResponse.subscriptionStatus,
              isUnlimited: chatQuota.isUnlimited
            };
            
            console.log("RequestCounter - setting new usage data:", usageDataObj);
            setUsageData(usageDataObj);
          } else {
            setError("Chat quota not found");
          }
        } else {
          setError("No quota data available");
        }
      } catch (error) {
        console.error("Error loading usage data:", error);
        setError("Failed to load usage information");
      } finally {
        setLoading(false);
        refreshTimeoutRef.current = null;
      }
    }, forceRefresh ? 0 : 100); // No delay for forced refresh
  };

  // Load on mount
  useEffect(() => {
    loadUsageData(true); // Force initial load
  }, []);

  // Expose refresh function to parent
  useEffect(() => {
    console.log("RequestCounter: onRefresh prop changed:", !!onRefresh);
    if (onRefresh) {
      const refreshFunction = () => {
        console.log("RequestCounter: Parent requested refresh");
        loadUsageData(true); // Force refresh when parent calls
      };
      console.log("RequestCounter: Setting refresh function for parent");
      onRefresh(refreshFunction);
    }
  }, [onRefresh]);

  // Pass usage data to parent when it changes
  useEffect(() => {
    if (onUsageDataChange && usageData) {
      onUsageDataChange(usageData);
    }
  }, [usageData, onUsageDataChange]);

  // Hide request counter when using personal API key
  if (subscriptionState?.usingPersonalAPI) {
    return null;
  }

  const getIcon = () => {
    if (loading) return null;

    const percentage = usageData ? (usageData.used / usageData.limit) * 100 : 0;

    if (usageData?.remaining <= 0) {
      return <FaExclamationTriangle style={{ color: "#FF6B6B" }} />;
    } else if (percentage >= 90) {
      return <FaExclamationTriangle style={{ color: "#FF6B6B" }} />;
    } else if (usageData?.plan === "Free") {
      return <FaCrown style={{ color: "#FFD93D" }} />;
    } else {
      return <FaCheckCircle style={{ color: "#4CAF50" }} />;
    }
  };

  const handleClick = () => {
    // Check if quota is exhausted and show subscription choice popup
    if (usageData?.remaining <= 0) {
      onUpgradeClick?.();
    } else {
      // Refresh quota data when clicked
      console.log("RequestCounter: User clicked, refreshing");
      loadUsageData(true); // Force refresh on click
    }
  };

  const getTooltipText = () => {
    if (loading) return "Loading usage information...";
    if (error) return "Error loading usage data";

    if (usageData?.remaining <= 0) {
      return "No requests remaining. Click to refresh or upgrade.";
    }

    const percentage = usageData ? (usageData.used / usageData.limit) * 100 : 0;

    if (percentage >= 90) {
      return `Warning: ${Math.round(
        percentage
      )}% of requests used. Click to refresh or upgrade.`;
    } else if (usageData?.plan === "Free") {
      return `Free plan: ${usageData.remaining} requests remaining. Click to refresh or upgrade.`;
    } else {
      return `${usageData?.plan} plan: ${usageData?.remaining} requests remaining. Click to refresh.`;
    }
  };

  if (loading) {
    return (
      <div
        onClick={() => loadUsageData(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 8px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        title="Click to refresh usage data"
      >
        <FaSync
          style={{
            color: "#ffe9e9",
            animation: "spin 1s linear infinite",
            fontSize: "12px",
          }}
        />
        <span style={{ fontSize: "12px", color: "rgba(255, 220, 220, 0.7)" }}>
          Refreshing...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        onClick={() => loadUsageData(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 8px",
          backgroundColor: "rgba(220, 53, 69, 0.1)",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        title="Click to refresh usage data"
      >
        <FaSync style={{ color: "#FF6B6B", fontSize: "12px" }} />
        <span style={{ fontSize: "12px", color: "#FF6B6B" }}>Refresh Usage</span>
      </div>
    );
  }

  const percentage = usageData ? (usageData.used / usageData.limit) * 100 : 0;
  const isExhausted = usageData?.remaining <= 0;
  const isLow = percentage >= 90 || isExhausted;
  const isFree = usageData?.plan === "Free";

  return (
    <div
      className={`request-counter ${isLow ? "low" : ""}`}
      onClick={handleClick}
      title={getTooltipText()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 8px",
        marginLeft: "4px",
        backgroundColor: isExhausted
          ? "rgba(220, 53, 69, 0.2)"
          : isLow
          ? "rgba(220, 53, 69, 0.1)"
          : isFree
          ? "rgba(255, 217, 61, 0.1)"
          : "rgba(255, 255, 255, 0.05)",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: isExhausted
          ? "1px solid rgba(220, 53, 69, 0.5)"
          : isLow
          ? "1px solid rgba(220, 53, 69, 0.3)"
          : isFree
          ? "1px solid rgba(255, 217, 61, 0.3)"
          : "1px solid rgba(255, 255, 255, 0.1)",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-1px)";
        e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "none";
      }}
    >
      {getIcon()}
      <span
        style={{
          fontSize: "11px",
          color: isExhausted
            ? "#FF6B6B"
            : isLow
            ? "#FF6B6B"
            : isFree
            ? "#FFD93D"
            : "rgba(255, 220, 220, 0.8)",
          fontWeight: isExhausted || isLow || isFree ? "600" : "400",
        }}
      >
        {isExhausted 
          ? "0 requests left"
          : `${usageData?.used || 0}/${usageData?.limit || 100} used`
        }
      </span>
    </div>
  );
};

export default RequestCounter;
