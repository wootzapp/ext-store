/* global chrome */
import React, { useState, useEffect } from "react";
import { FaCrown, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import apiService from "../services/api";

const RequestCounter = ({ subscriptionState, onUpgradeClick }) => {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsageData();
  }, []);

  // Hide request counter when using personal API key
  if (subscriptionState?.usingPersonalAPI) {
    return null;
  }

  const loadUsageData = async () => {
    try {
      setLoading(true);

      // Get user data to get organizations and usage info
      const userData = await apiService.getCurrentUser();
      const organizations = userData.organizations || [];
      
      // Find the user's selected organization or first active one
      const activeOrg = organizations.find(org => org.id === userData.selectedOrganizationId) || 
                       organizations.find(org => org.isActive) || 
                       organizations[0];

      if (activeOrg) {
        // For now, we'll use a default quota based on subscription type
        // In a real implementation, you'd get this from the API
        const quotas = {
          Free: { limit: 100, used: 0 },
          Paid: { limit: 1000, used: 0 },
          Trial: { limit: 1000, used: 0 },
        };

        const quota = quotas[activeOrg.subscriptionType] || quotas["Free"];
        setUsageData({
          plan: activeOrg.subscriptionType,
          limit: quota.limit,
          used: quota.used,
          remaining: quota.limit - quota.used,
          status: activeOrg.subscriptionStatus,
        });
      } else {
        // Default to free plan
        setUsageData({
          plan: "Free",
          limit: 100,
          used: 0,
          remaining: 100,
          status: "active",
        });
      }
    } catch (error) {
      console.error("Error loading usage data:", error);
      setError("Failed to load usage information");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    if (loading) return null;

    const percentage = usageData ? (usageData.used / usageData.limit) * 100 : 0;

    if (percentage >= 90) {
      return <FaExclamationTriangle style={{ color: "#FF6B6B" }} />;
    } else if (usageData?.plan === "Free") {
      return <FaCrown style={{ color: "#FFD93D" }} />;
    } else {
      return <FaCheckCircle style={{ color: "#4CAF50" }} />;
    }
  };

  const handleClick = () => {
    if (
      usageData?.plan === "Free" ||
      usageData?.remaining / usageData?.limit < 0.1
    ) {
      // Open dashboard in new tab using chrome.tabs.create
      if (typeof chrome !== "undefined" && chrome.tabs) {
        chrome.tabs.create({
          url: "https://nextjs-app-410940835135.us-central1.run.app/dashboard",
          active: true,
        });
      }
    } else {
      onUpgradeClick?.();
    }
  };

  const getTooltipText = () => {
    if (loading) return "Loading usage information...";
    if (error) return "Error loading usage data";

    const percentage = usageData ? (usageData.used / usageData.limit) * 100 : 0;

    if (percentage >= 90) {
      return `Warning: ${Math.round(
        percentage
      )}% of requests used. Consider upgrading.`;
    } else if (usageData?.plan === "Free") {
      return `Free plan: ${usageData.remaining} requests remaining. Upgrade for more!`;
    } else {
      return `${usageData?.plan} plan: ${usageData?.remaining} requests remaining`;
    }
  };

  if (loading) {
    return (
      <div
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
      >
        <div
          className="profile-loader"
          style={{
            transform: "scale(0.5)",
          }}
        />
        <span style={{ fontSize: "12px", color: "rgba(255, 220, 220, 0.7)" }}>
          Loading...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
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
      >
        <FaExclamationTriangle style={{ color: "#FF6B6B", fontSize: "12px" }} />
        <span style={{ fontSize: "12px", color: "#FF6B6B" }}>Error</span>
      </div>
    );
  }

  const percentage = usageData ? (usageData.used / usageData.limit) * 100 : 0;
  const isLow = percentage >= 90;
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
        backgroundColor: isLow
          ? "rgba(220, 53, 69, 0.1)"
          : isFree
          ? "rgba(255, 217, 61, 0.1)"
          : "rgba(255, 255, 255, 0.05)",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: isLow
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
          color: isLow
            ? "#FF6B6B"
            : isFree
            ? "#FFD93D"
            : "rgba(255, 220, 220, 0.8)",
          fontWeight: isLow || isFree ? "600" : "400",
        }}
      >
        {usageData?.remaining || 0} requests
      </span>
    </div>
  );
};

export default RequestCounter;
