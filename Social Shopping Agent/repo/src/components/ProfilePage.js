/* global chrome */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaArrowLeft,
  // FaEnvelope,
  FaCrown,
  FaCalendarAlt,
  FaChartBar,
  FaSignOutAlt,
  FaKey,
  FaInfinity,
  FaClock,
  FaStar,
  FaCog,
  FaToggleOn,
  FaToggleOff,
  FaBuilding,
  FaChevronDown,
  FaChevronUp,
  FaIdCard,
  FaTag,
  FaCheckCircle,
  FaTimesCircle,
  FaCreditCard,
  FaCalendarCheck,
  FaShieldAlt,
  FaSync,
} from "react-icons/fa";
import apiService from "../services/api";

const ProfilePage = ({ user, subscription, onLogout }) => {
  const navigate = useNavigate();
  const [isToggling, setIsToggling] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllOrganizations, setShowAllOrganizations] = useState(false);
  const [quotaData, setQuotaData] = useState(null);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [lastProfileUpdate, setLastProfileUpdate] = useState(0);
  const PROFILE_CACHE_DURATION = 30000; // 30 seconds

  useEffect(() => {
    loadUserDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (organizations.length > 0) {
      loadQuotaData();
    }
  }, [organizations.length]); // Only depend on length, not the array itself

  const loadUserDetails = async () => {
    try {
      setLoading(true);

      // Check if we need to refresh based on cache duration
      const now = Date.now();
      // eslint-disable-next-line no-use-before-define
      if (now - lastProfileUpdate < PROFILE_CACHE_DURATION && userDetails && organizations.length > 0) {
        console.log("Using cached profile data");
        setLoading(false);
        return;
      }

      // First, check if we have user data in chrome.storage.local
      let storedUserData = null;
      let storedOrganizations = [];
      try {
        const storageData = await new Promise((resolve) => {
          chrome.storage.local.get(["userAuth", "authData"], (result) => {
            resolve({
              userAuth: result.userAuth || null,
              authData: result.authData || null,
            });
          });
        });

        // Use stored data if available
        if (storageData.userAuth?.user) {
          storedUserData = storageData.userAuth.user;
          storedOrganizations = storageData.userAuth.organizations || [];
        } else if (storageData.authData?.user) {
          storedUserData = storageData.authData.user;
          storedOrganizations = storageData.authData.organizations || [];
        }
      } catch (storageError) {
        console.log("Could not get stored user data:", storageError);
      }

      // If we have stored data, use it and don't make API call
      if (storedUserData && storedOrganizations.length > 0) {
        console.log("Using stored user data:", storedUserData);
        console.log("Using stored organizations:", storedOrganizations);
        setUserDetails(storedUserData);
        setOrganizations(storedOrganizations);
        setLastProfileUpdate(now);
        setLoading(false);
        return;
      } else if (storedUserData) {
        // If we have user data but no organizations, clear the storage and fetch fresh data
        console.log(
          "Stored user data found but no organizations, clearing storage and fetching fresh data"
        );
        try {
          await new Promise((resolve) => {
            chrome.storage.local.remove(["userAuth", "authData"], resolve);
          });
        } catch (storageError) {
          console.log("Could not clear stored data:", storageError);
        }
      }

      // Only make API call if no stored data
      console.log("No stored user data found, making API call");
      const userData = await apiService.getCurrentUser();
      console.log("Full API response:", userData);
      console.log("Response type:", typeof userData);
      console.log("Response keys:", Object.keys(userData || {}));

      // Extract user and organizations from the API response
      const user = userData?.user || userData;
      const organizations = userData?.organizations || [];

      console.log("Extracted user:", user);
      console.log("Extracted organizations:", organizations);
      console.log("Organizations length:", organizations.length);

      setUserDetails(user);
      setOrganizations(organizations);
      setLastProfileUpdate(now);

      // Store the fetched data for future use
      if (userData) {
        try {
          await new Promise((resolve) => {
            chrome.storage.local.set(
              {
                userAuth: {
                  user: user,
                  organizations: organizations,
                },
              },
              resolve
            );
          });
        } catch (storageError) {
          console.log("Could not store user data:", storageError);
        }
      }
    } catch (error) {
      console.error("Error loading user details:", error);
      setError("Failed to load user information");
    } finally {
      setLoading(false);
    }
  };

  // Add rate limiting for quota data loading
  const quotaLoadTimeoutRef = useRef(null);
  const quotaLoadRunningRef = useRef(false);
  
  const loadQuotaData = async () => {
    // Prevent multiple simultaneous calls
    if (quotaLoadRunningRef.current) {
      return;
    }
    
    // Clear any pending timeout
    if (quotaLoadTimeoutRef.current) {
      clearTimeout(quotaLoadTimeoutRef.current);
    }
    
    quotaLoadTimeoutRef.current = setTimeout(async () => {
      // Double-check if already running
      if (quotaLoadRunningRef.current) {
        return;
      }
      
      quotaLoadRunningRef.current = true;
      
      try {
        setQuotaLoading(true);

        // Use the new method to get quota for active organization
        console.log("ProfilePage - calling getActiveOrganizationQuota");
        const quotaResponse = await apiService.getActiveOrganizationQuota();
        
        console.log("ProfilePage - quota response:", quotaResponse);
        
        if (quotaResponse && quotaResponse.quotas) {
          // Find the chat quota
          const chatQuota = quotaResponse.quotas.find(q => q.featureKey === 'chat') || {
            featureKey: 'chat',
            featureName: 'Chat',
            currentUsage: 0,
            limit: 100,
            remaining: 100,
            usagePercentage: 0,
            isUnlimited: false
          };

          console.log("ProfilePage chat quota:", chatQuota);

          const quotaDataObj = {
            plan: quotaResponse.subscriptionStatus === 'active' ? 'Paid' : 'Free',
            limit: chatQuota.limit,
            used: chatQuota.currentUsage,
            remaining: chatQuota.remaining,
            usagePercentage: chatQuota.usagePercentage,
            status: quotaResponse.subscriptionStatus,
            isUnlimited: chatQuota.isUnlimited
          };
          
          console.log("ProfilePage setting quota data:", quotaDataObj);
          setQuotaData(quotaDataObj);
        } else {
          // Fallback to default quota
          const fallbackQuota = {
            plan: "Free",
            limit: 100,
            used: 0,
            remaining: 100,
            status: "active",
            isUnlimited: false
          };
          
          console.log("ProfilePage using fallback quota:", fallbackQuota);
          setQuotaData(fallbackQuota);
        }
      } catch (error) {
        console.error("Error loading quota data:", error);
        // Set default quota data on error
        setQuotaData({
          plan: "Free",
          limit: 100,
          used: 0,
          remaining: 100,
          status: "active",
          isUnlimited: false
        });
      } finally {
        setQuotaLoading(false);
        quotaLoadRunningRef.current = false;
        quotaLoadTimeoutRef.current = null;
      }
    }, 500); // Increased debounce to 500ms
  };

  // Refresh subscription data when component gains focus (returning from settings)
  useEffect(() => {
    const handleFocus = () => {
      // Add debouncing to prevent excessive calls
      if (subscription.loadSubscriptionData && !subscription.loading) {
        setTimeout(() => {
          subscription.loadSubscriptionData();
        }, 100);
      }
      // Also refresh quota data with debouncing
      if (organizations.length > 0) {
        loadQuotaData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [subscription, organizations.length]);

  // Monitor subscription changes for toggle button updates
  useEffect(() => {
    // This effect will run whenever subscription data changes
    // The toggle button state will automatically update based on subscription.hasPersonalKeys
  }, [subscription.hasPersonalKeys, subscription.userPreferPersonalAPI]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (quotaLoadTimeoutRef.current) {
        clearTimeout(quotaLoadTimeoutRef.current);
      }
    };
  }, []);

  // Refresh subscription data when component mounts or when returning from settings
  useEffect(() => {
    if (subscription.loadSubscriptionData) {
      subscription.loadSubscriptionData();
    }
  }, [subscription]);

  const handleBack = () => {
    navigate("/chat");
  };

  // const forceRefreshData = async () => {
  //   console.log("Force refreshing user data...");
  //   try {
  //     // Clear stored data
  //     await new Promise((resolve) => {
  //       chrome.storage.local.remove(["userAuth", "authData"], resolve);
  //     });

  //     // Reload data
  //     await loadUserDetails();
  //   } catch (error) {
  //     console.error("Error force refreshing data:", error);
  //   }
  // };

  const handleTogglePersonalAPI = async () => {
    if (isToggling) return;

    setIsToggling(true);

    try {
      const newPreference = !subscription.userPreferPersonalAPI;

      // If turning ON and no API keys, redirect to settings
      if (newPreference && !subscription.hasPersonalKeys) {
        navigate("/settings");
        setIsToggling(false);
        return;
      }

      // Set the preference
      const success = await subscription.setUserAPIPreference(newPreference);

      if (success) {
        console.log(
          `API preference set to: ${
            newPreference ? "Personal API" : "DeepHUD API"
          }`
        );
      }
    } catch (error) {
      console.error("Error toggling API preference:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSubscriptionStatus = () => {
    // Don't show loading if we have subscription data
    if (
      subscription.loading &&
      !subscription.status &&
      !subscription.usingPersonalAPI
    ) {
      return { text: "Loading...", color: "#657786", icon: <FaClock /> };
    }

    if (subscription.usingPersonalAPI) {
      return {
        text: `Personal API`,
        color: "#17bf63",
        icon: <FaKey />,
      };
    }

    // Get subscription status from selected organization
    const selectedOrgId = userDetails?.selectedOrganizationId;
    const selectedOrganization = selectedOrgId 
      ? organizations.find(org => org.id === selectedOrgId)
      : organizations.find(org => org.isActive) || organizations[0];
    
    if (selectedOrganization) {
      const { subscriptionStatus, subscriptionType, subExpiry } = selectedOrganization;
      
      if (subscriptionStatus === "active") {
        return {
          text: subscriptionType === "Paid" ? "Premium Subscription" : "Free Plan",
          color: "#17bf63",
          icon: <FaCrown />,
          subExpiry: subExpiry
        };
      }
      
      if (subscriptionStatus === "trialing") {
        return {
          text: "Free Trial",
          color: "#ffad1f",
          icon: <FaStar />,
          subExpiry: subExpiry
        };
      }
      
      if (subscriptionStatus === "inactive") {
        return {
          text: "Subscription Expired",
          color: "#e0245e",
          icon: <FaClock />,
          subExpiry: subExpiry
        };
      }
    }

    return {
      text: "No Active Subscription",
      color: "#e0245e",
      icon: <FaClock />,
    };
  };

  const status = getSubscriptionStatus();

  // Consistent styling with other pages
  const containerStyle = {
    width: "100vw",
    height: "100vh",
    maxWidth: "500px",
    maxHeight: "600px",
    display: "flex",
    flexDirection: "column",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: "#002550FF",
    overflow: "hidden",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "manipulation",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255, 220, 220, 0.3)",
    background: "linear-gradient(0deg, #002550FF 0%, #764ba2 100%)",
    flexShrink: 0,
    minHeight: "56px",
    boxSizing: "border-box",
  };

  const contentStyle = {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  };

  const sectionStyle = {
    marginBottom: "24px",
  };

  const cardStyle = {
    backgroundColor: "rgba(255, 220, 220, 0.08)",
    border: "1px solid rgba(255, 220, 220, 0.2)",
    borderRadius: "12px",
    padding: "16px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };

  return (
    <div className="profile-container" style={containerStyle}>
      {/* Background Animation */}
      <div
        className="background-animation"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          className="profile-orb-1"
          style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #FF6B6B, #FF8E8E)",
            filter: "blur(40px)",
            opacity: 0.2,
            top: "10%",
            left: "10%",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="profile-orb-2"
          style={{
            position: "absolute",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #4ECDC4, #6EE7DF)",
            filter: "blur(40px)",
            opacity: 0.2,
            top: "60%",
            right: "15%",
            animation: "float 6s ease-in-out infinite 2s",
          }}
        />
        <div
          className="profile-orb-3"
          style={{
            position: "absolute",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #45B7D1, #67C9E1)",
            filter: "blur(40px)",
            opacity: 0.2,
            bottom: "20%",
            left: "20%",
            animation: "float 6s ease-in-out infinite 4s",
          }}
        />
      </div>

      {/* Header */}
      <div className="profile-header" style={headerStyle}>
        <button
          onClick={handleBack}
          className="profile-back-button"
          style={{
            padding: "6px 8px",
            backgroundColor: "rgba(255, 220, 220, 0.2)",
            border: "1px solid rgba(255, 220, 220, 0.3)",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            color: "#FFDCDCFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Back"
        >
          <FaArrowLeft />
        </button>

        <div style={{ minWidth: 0, flex: 1, textAlign: "center" }}>
          <h3
            className="profile-title"
            style={{
              margin: 0,
              color: "#FFDCDCFF",
              fontSize: "18px",
              fontWeight: "700",
              lineHeight: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <FaUser />
            PROFILE
          </h3>
          <p
            className="profile-subtitle"
            style={{
              margin: 0,
              color: "rgba(255, 220, 220, 0.8)",
              fontSize: "12px",
              lineHeight: "14px",
              marginTop: "2px",
            }}
          >
            Account details and usage
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
          }}
        >
          {/* <button 
            onClick={forceRefreshData}
            className="profile-button"
            style={{ 
              padding: "6px 8px",
              backgroundColor: "rgba(255, 220, 220, 0.2)",
              border: "1px solid rgba(255, 220, 220, 0.3)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              color: "#FFDCDCFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Refresh Data"
          >
            🔄
          </button> */}
          {/* Add placeholder div with same width when button is hidden */}
          {subscription.userPreferPersonalAPI &&
          subscription.hasPersonalKeys ? (
            <button
              onClick={() => navigate("/settings")}
              className="profile-button"
              style={{
                padding: "6px 8px",
                backgroundColor: "rgba(255, 220, 220, 0.2)",
                border: "1px solid rgba(255, 220, 220, 0.3)",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                color: "#FFDCDCFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Settings"
            >
              <FaCog />
            </button>
          ) : (
            <div style={{ width: "35px" }} />
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="profile-content" style={contentStyle}>
        {/* User Info */}
        <div
          className="profile-user-info"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            animation: "slideInUp 0.6s ease-out",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: "20px",
            }}
          >
            <div
              className="profile-avatar"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#FF6B6B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                color: "white",
                marginRight: "16px",
                overflow: "hidden",
                backgroundImage: userDetails?.avatarUrl
                  ? `url(${userDetails.avatarUrl})`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                flexShrink: 0,
              }}
            >
              {!userDetails?.avatarUrl &&
                (userDetails?.name?.charAt(0) || user?.name?.charAt(0) || "U")}
            </div>
            <div className="profile-user-details" style={{ flex: 1 }}>
              <h3
                className="profile-user-name"
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  textAlign: "left",
                  color: "#FFDCDCFF",
                  margin: "0 0 4px 0",
                  animation: "slideInUp 0.6s ease-out 0.1s both",
                }}
              >
                {userDetails?.name || user?.name || "User"}
              </h3>
              <p
                className="profile-user-email"
                style={{
                  fontSize: "14px",
                  textAlign: "left",
                  color: "rgba(255, 220, 220, 0.9)",
                  margin: "0 0 8px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  animation: "slideInUp 0.6s ease-out 0.2s both",
                }}
              >
                {/* <FaEnvelope style={{ fontSize: "12px" }} /> */}
                {userDetails?.email || user?.email || "user@example.com"}
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                gap: "12px" 
              }}>
                <div style={{ transform: "scale(0.7)" }}>
                  <div className="profile-loader" />
                </div>
                <p
                  style={{ 
                    color: "rgba(255, 220, 220, 0.7)", 
                    margin: "0",
                    fontSize: "13px"
                  }}
                >
                  Loading user details...
                </p>
              </div>
            </div>
          ) : error ? (
            <div
              style={{
                backgroundColor: "rgba(220, 53, 69, 0.1)",
                border: "1px solid rgba(220, 53, 69, 0.3)",
                borderRadius: "8px",
                padding: "12px",
                color: "#FF6B6B",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          ) : (
            <div>
              {/* User Details */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    marginBottom: "8px",
                    fontSize: "12px",
                    color: "rgba(255, 220, 220, 0.7)",
                    animation: "slideInUp 0.6s ease-out 0.3s both",
                  }}
                >
                  <FaIdCard
                    style={{
                      fontSize: "10px",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ textAlign: "left" }}>
                    <div>User ID:</div>
                    <div
                      style={{
                        wordBreak: "break-all",
                        fontSize: "11px",
                        color: "rgba(255, 220, 220, 0.8)",
                        marginTop: "2px",
                      }}
                    >
                      {userDetails?.id || "N/A"}
                    </div>
                  </div>
                </div>

                {userDetails?.role && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                      fontSize: "12px",
                      color: "rgba(255, 220, 220, 0.7)",
                      animation: "slideInUp 0.6s ease-out 0.4s both",
                    }}
                  >
                    <FaTag style={{ fontSize: "10px" }} />
                    Role:{" "}
                    {userDetails.role.charAt(0).toUpperCase() +
                      userDetails.role.slice(1)}
                  </div>
                )}

                {userDetails?.createdAt && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "0px",
                      fontSize: "12px",
                      color: "rgba(255, 220, 220, 0.7)",
                      animation: "slideInUp 0.6s ease-out 0.5s both",
                    }}
                  >
                    <FaCalendarAlt style={{ fontSize: "10px" }} />
                    Joined: {formatDateTime(userDetails.createdAt)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Subscription Status */}
        <div style={sectionStyle}>
          <h4
            style={{
              color: "#FFDCDCFF",
              fontSize: "16px",
              fontWeight: "600",
              margin: "0 0 16px 0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaCrown />
            Subscription Status
          </h4>

          <div
            style={{
              ...cardStyle,
              animation: "slideInUp 0.6s ease-out 0.8s both",
            }}
          >
            {/* Only show status display if NOT on Free Plan */}
            {status.text !== "Free Plan" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ color: status.color, fontSize: "20px", flexShrink: 0 }}>
                  {status.icon}
                </div>
                <div style={{ flex: 1, paddingRight: "6px" }}>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#FFDCDCFF",
                      marginBottom: "2px",
                    }}
                  >
                    {status.text}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 220, 220, 0.8)",
                    }}
                  >
                    {subscription.usingPersonalAPI
                      ? "Unlimited usage with your API key"
                      : status.text === "Premium Subscription"
                      ? "Monthly/yearly billing with higher quotas"
                      : status.text === "Free Trial"
                      ? `30-day trial period - Expires ${formatDate(status.subExpiry)}`
                      : status.subExpiry
                      ? `Expires ${formatDate(status.subExpiry)}`
                      : "No expiry date available"}
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Warning for Free Trial and Free Plan */}
            {(status.text === "Free Trial" || status.text === "Free Plan") && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 173, 31, 0.1)",
                  border: "1px solid rgba(255, 173, 31, 0.3)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    color: "#ffad1f",
                    fontSize: "16px",
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                >
                  ⚠️
                </div>
                <div style={{ flex: 1, paddingRight: "6px" }}>
                  <div
                    style={{ 
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#ffad1f",
                      marginBottom: "4px",
                    }}
                  >
                    {status.text === "Free Trial" ? "Trial Period" : "Free Plan"}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 220, 220, 0.8)",
                      lineHeight: "1.4",
                    }}
                  >
                    {status.text === "Free Trial" 
                      ? `You are on a free trial. Expires ${formatDate(status.subExpiry)}. Upgrade to continue after trial ends.`
                      : "You are on the Free plan with limited quotas. Upgrade to a paid plan for higher quotas."
                    }
                  </div>
                </div>
              </div>
            )}

            {!subscription.usingPersonalAPI && (
              <>
                <button
                  onClick={() => {
                    navigate('/subscription');
                  }}
                  style={{
                    ...buttonStyle,
                    backgroundColor:
                      status.text === "No Active Subscription" || status.text === "Subscription Expired"
                        ? "#e0245e"
                        : "#3b82f6",
                    color: "white",
                    marginBottom: "12px",
                  }}
                >
                  <FaChartBar />
                  {status.text === "No Active Subscription" || status.text === "Subscription Expired"
                    ? "Upgrade Plan"
                    : "View Plans"}
                </button>
                
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      backgroundColor: "rgba(255, 220, 220, 0.2)",
                    }}
                  />
                  <span
                    style={{
                      padding: "0 10px",
                      fontSize: "12px",
                      color: "rgba(255, 220, 220, 0.6)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    or
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      backgroundColor: "rgba(255, 220, 220, 0.2)",
                    }}
                  />
                </div>
                
                <button
                  onClick={() => {
                    // Scroll to the API Configuration section
                    const apiSection = document.querySelector('[data-section="api-config"]');
                    if (apiSection) {
                      apiSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                      });
                    }
                  }}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "rgba(255, 220, 220, 0.1)",
                    border: "1px solid rgba(255, 220, 220, 0.3)",
                    color: "#FFDCDCFF",
                  }}
                >
                  <FaKey />
                  Use Your Own API Key
                </button>
              </>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        <div style={sectionStyle}>
          <h4
            style={{
              color: "#FFDCDCFF",
              fontSize: "16px",
              fontWeight: "600",
              margin: "0 0 16px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FaChartBar />
              Usage Statistics
            </div>
            {!subscription.usingPersonalAPI && (
              <button
                onClick={loadQuotaData}
                disabled={quotaLoading}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "rgba(255, 220, 220, 0.1)",
                  border: "1px solid rgba(255, 220, 220, 0.3)",
                  borderRadius: "6px",
                  cursor: quotaLoading ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  color: "#FFDCDCFF",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  opacity: quotaLoading ? 0.6 : 1,
                }}
                title="Sync usage data"
              >
                <FaSync style={{ 
                  animation: quotaLoading ? "spin 1s linear infinite" : "none",
                  fontSize: "10px"
                }} />
                Sync
              </button>
            )}
          </h4>

          <div style={cardStyle}>
            {subscription.usingPersonalAPI ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "10px",
                  color: "#17bf63",
                }}
              >
                <FaInfinity style={{ fontSize: "28px", marginBottom: "6px" }} />
                <div style={{ fontSize: "16px", fontWeight: "600" }}>
                  Unlimited Usage
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255, 220, 220, 0.8)",
                  }}
                >
                  Using your personal API key
                </div>
              </div>
            ) : quotaLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  gap: "12px" 
                }}>
                  <div style={{ transform: "scale(0.7)" }}>
                    <div className="profile-loader" />
                  </div>
                  <p
                    style={{ 
                      color: "rgba(255, 220, 220, 0.7)", 
                      margin: "0",
                      fontSize: "13px"
                    }}
                  >
                    Loading usage data...
                  </p>
                </div>
              </div>
            ) : quotaData ? (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "#FFDCDCFF" }}>
                    Requests Used
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color:
                        quotaData.remaining <= 0
                          ? "#e0245e"
                          : "#FFDCDCFF",
                    }}
                  >
                    {quotaData.used} /{" "}
                    {quotaData.isUnlimited ? "∞" : quotaData.limit}
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    backgroundColor: "rgba(255, 220, 220, 0.2)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(
                        quotaData.isUnlimited ? 0 : (quotaData.used / quotaData.limit) * 100,
                        100
                      )}%`,
                      height: "100%",
                      backgroundColor:
                        quotaData.remaining <= 0
                          ? "#e0245e"
                          : quotaData.remaining <= 2
                          ? "#ffad1f"
                          : "#17bf63",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255, 220, 220, 0.8)",
                    marginTop: "8px",
                    textAlign: "center",
                  }}
                >
                  {quotaData.isUnlimited 
                    ? "Unlimited requests available"
                    : quotaData.remaining > 0 
                    ? `${quotaData.remaining} requests remaining (${quotaData.usagePercentage || Math.round((quotaData.used / quotaData.limit) * 100)}% used)`
                    : "No requests remaining - upgrade or use personal API"}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "rgba(255, 220, 220, 0.7)" }}>
                Unable to load usage data
              </div>
            )}
          </div>
        </div>

        {/* API Key Toggle Section */}
        <div style={sectionStyle} data-section="api-config">
          <h4
            style={{
              color: "#FFDCDCFF",
              fontSize: "16px",
              fontWeight: "600",
              margin: "0 0 16px 0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaKey />
            API Configuration
          </h4>

          <div
            style={{
              ...cardStyle,
              animation: "slideInUp 0.6s ease-out 0.6s both",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ flex: 1, paddingLeft: "6px" }}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#FFDCDCFF",
                    marginBottom: "4px",
                  }}
                >
                  Use Personal API Key
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255, 220, 220, 0.8)",
                    lineHeight: "1.4",
                  }}
                >
                  Turn on to use your own API key for unlimited usage
                </div>
              </div>
              <button
                onClick={handleTogglePersonalAPI}
                disabled={isToggling}
                style={{
                  background: "none",
                  border: "none",
                  cursor: isToggling ? "wait" : "pointer",
                  fontSize: "28px",
                  color:
                    subscription.userPreferPersonalAPI &&
                    subscription.hasPersonalKeys
                      ? "#17bf63"
                      : "#A0BFD8FF",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                  opacity: isToggling ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
                title={
                  subscription.userPreferPersonalAPI &&
                  subscription.hasPersonalKeys
                    ? "Click to use DeepHUD API"
                    : !subscription.hasPersonalKeys
                    ? "Configure API keys in settings first"
                    : "Click to use personal API key"
                }
              >
                {subscription.userPreferPersonalAPI &&
                subscription.hasPersonalKeys ? (
                  <FaToggleOn />
                ) : (
                  <FaToggleOff />
                )}
              </button>
            </div>

            {/* Status indicator */}
            <div
              style={{
                marginTop: "12px",
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: subscription.usingPersonalAPI
                  ? "rgba(23, 191, 99, 0.1)"
                  : subscription.remaining_requests <= 0
                  ? "rgba(224, 36, 94, 0.1)"
                  : "rgba(255, 173, 31, 0.1)",
                border: subscription.usingPersonalAPI
                  ? "1px solid rgba(23, 191, 99, 0.3)"
                  : subscription.remaining_requests <= 0
                  ? "1px solid rgba(224, 36, 94, 0.3)"
                  : "1px solid rgba(255, 173, 31, 0.3)",
                fontSize: "12px",
                color: subscription.usingPersonalAPI
                  ? "#17bf63"
                  : subscription.remaining_requests <= 0
                  ? "#e0245e"
                  : "#ffad1f",
              }}
            >
              {subscription.usingPersonalAPI
                ? "✅ Currently using your personal API key"
                : subscription.hasPersonalKeys
                ? "🔄 Currently using DeepHUD API"
                : "⚠️ Configure API keys in settings to enable personal API"}
            </div>
          </div>
        </div>

        {/* Organizations Section */}
        <div style={sectionStyle}>
          <h4
            style={{
              color: "#FFDCDCFF",
              fontSize: "16px",
              fontWeight: "600",
              margin: "0 0 16px 0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaBuilding />
            Organizations
          </h4>

          <div
            style={{
              ...cardStyle,
              overflow: "hidden",
              animation: "slideInUp 0.6s ease-out 0.7s both",
            }}
          >
            {organizations.length > 0 ? (
              <div>
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#FFDCDCFF",
                      marginBottom: "4px",
                    }}
                  >
                    Your Organizations
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 220, 220, 0.8)",
                      lineHeight: "1.4",
                      marginBottom: "12px",
                    }}
                  >
                    Manage your organization memberships and subscriptions
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {organizations.length > 1 && (
                      <button
                        onClick={() =>
                          setShowAllOrganizations(!showAllOrganizations)
                        }
                        style={{
                          background: "rgba(255, 107, 107, 0.1)",
                          border: "1px solid rgba(255, 107, 107, 0.3)",
                          color: "#FF6B6B",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {showAllOrganizations ? "Show Less" : "View All"}
                        {showAllOrganizations ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        chrome.tabs.create({
                          url: "https://nextjs-app-410940835135.us-central1.run.app/dashboard",
                          active: true,
                        });
                      }}
                      style={{
                        background: "rgba(255, 220, 220, 0.1)",
                        border: "1px solid rgba(255, 220, 220, 0.3)",
                        color: "#FFDCDCFF",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <FaBuilding />
                      Manage
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    maxHeight: showAllOrganizations ? "none" : "200px",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    paddingRight: "4px", // Add padding to prevent cut-off
                  }}
                >
                  {(showAllOrganizations
                    ? organizations
                    : organizations.slice(0, 1)
                  ).map((org, index) => (
                    <div
                      key={org.id}
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        borderRadius: "12px",
                        padding: "16px",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        animation: `slideInUp 0.6s ease-out ${index * 0.1}s`,
                        minWidth: 0, // Ensure proper flex behavior
                        overflow: "hidden", // Prevent content overflow
                      }}
                    >
                      {/* Organization Header */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "12px",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h5
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#FFDCDCFF",
                              margin: "0 0 4px 0",
                              textAlign: "left",
                            }}
                          >
                            {org.name}
                          </h5>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "8px",
                            }}
                          >
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "10px",
                                fontWeight: "600",
                                backgroundColor: "rgba(255, 173, 31, 0.2)",
                                color: "#ffad1f",
                                textTransform: "uppercase",
                              }}
                            >
                              {org.role}
                            </span>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "10px",
                                fontWeight: "600",
                                backgroundColor: (userDetails?.selectedOrganizationId === org.id)
                                  ? "rgba(76, 175, 80, 0.2)"
                                  : "rgba(158, 158, 158, 0.2)",
                                color: (userDetails?.selectedOrganizationId === org.id) ? "#4CAF50" : "#9E9E9E",
                                textTransform: "uppercase",
                              }}
                            >
                              {(userDetails?.selectedOrganizationId === org.id) ? "Selected" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Organization Details */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px",
                          fontSize: "11px",
                          color: "rgba(255, 220, 220, 0.7)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            minWidth: 0,
                          }}
                        >
                          <FaIdCard
                            style={{ fontSize: "8px", flexShrink: 0 }}
                          />
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            ID: {org.id}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            minWidth: 0,
                          }}
                        >
                          <FaCreditCard
                            style={{ fontSize: "8px", flexShrink: 0 }}
                          />
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Product: {org.productId}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            minWidth: 0,
                          }}
                        >
                          <FaCalendarAlt
                            style={{ fontSize: "8px", flexShrink: 0 }}
                          />
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Joined: {formatDate(org.joinedAt)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            minWidth: 0,
                          }}
                        >
                          <FaCalendarCheck
                            style={{ fontSize: "8px", flexShrink: 0 }}
                          />
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Expires: {formatDate(org.subExpiry)}
                          </span>
                        </div>
                      </div>

                      {/* Subscription Details */}
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "8px 12px",
                          backgroundColor: "rgba(255, 255, 255, 0.02)",
                          borderRadius: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#FFDCDCFF",
                            }}
                          >
                            Subscription Details
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {org.subscriptionStatus === "active" ? (
                              <FaCheckCircle
                                style={{ fontSize: "12px", color: "#4CAF50" }}
                              />
                            ) : (
                              <FaTimesCircle
                                style={{ fontSize: "12px", color: "#f44336" }}
                              />
                            )}
                            <span
                              style={{
                                fontSize: "11px",
                                color:
                                  org.subscriptionStatus === "active"
                                    ? "#4CAF50"
                                    : "#f44336",
                                textTransform: "capitalize",
                              }}
                            >
                              {org.subscriptionStatus}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            fontSize: "11px",
                            color: "rgba(255, 220, 220, 0.7)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              minWidth: 0,
                            }}
                          >
                            <FaShieldAlt
                              style={{ fontSize: "8px", flexShrink: 0 }}
                            />
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Type: {org.subscriptionType}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              minWidth: 0,
                            }}
                          >
                            <FaCreditCard
                              style={{ fontSize: "8px", flexShrink: 0 }}
                            />
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Price ID: {org.priceId}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "rgba(255, 220, 220, 0.7)",
                  fontSize: "14px",
                }}
              >
                No organizations found
              </div>
            )}
          </div>
        </div>

        {/* Manage Organizations Button */}
        {/* <div style={sectionStyle}>
          <button
            onClick={() => {
              chrome.tabs.create({
                url: "https://nextjs-app-410940835135.us-central1.run.app/dashboard",
                active: true,
              });
            }}
            style={{
              ...buttonStyle,
              backgroundColor: "rgba(255, 220, 220, 0.1)",
              border: "1px solid rgba(255, 220, 220, 0.3)",
              color: "#FFDCDCFF",
              animation: "slideInUp 0.6s ease-out 0.8s both",
              padding: "10px 16px",
              fontSize: "13px",
            }}
          >
            <FaBuilding />
            Manage Organizations
          </button>
        </div> */}

        {/* Logout Button */}
        <div style={sectionStyle}>
          <button
            onClick={onLogout}
            style={{
              ...buttonStyle,
              backgroundColor: "#e0245e",
              color: "white",
              animation: "slideInUp 0.6s ease-out 0.9s both",
            }}
          >
            <FaSignOutAlt />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
