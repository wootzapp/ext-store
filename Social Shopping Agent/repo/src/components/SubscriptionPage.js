/* global chrome */
import React, { useState } from "react";
import { 
  FaArrowLeft,
  FaCheck,
  FaStar,
  FaCrown, 
  // FaRocket,
  FaShieldAlt,
  // FaInfinity,
} from "react-icons/fa";
import "../styles/SubscriptionPageAnimations.css";

const SubscriptionPage = ({ onSubscribe, onLogout, onOpenSettings, user }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState("");

  const handleSubscribe = async (planName) => {
    try {
    setLoading(true);
      setError("");

      // Open pricing page in new tab using chrome.tabs.create
      if (typeof chrome !== "undefined" && chrome.tabs) {
        chrome.tabs.create({
          url: "https://nextjs-app-410940835135.us-central1.run.app/pricing",
          active: true,
        });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setError(error.message || "Failed to subscribe to plan");
    } finally {
      setLoading(false);
    }
  };

  const handleTrial = async (planName) => {
    try {
    setLoading(true);
      setError("");

      // Open pricing page in new tab using chrome.tabs.create
      if (typeof chrome !== "undefined" && chrome.tabs) {
        chrome.tabs.create({
          url: "https://nextjs-app-410940835135.us-central1.run.app/pricing",
          active: true,
        });
      }
    } catch (error) {
      console.error("Trial error:", error);
      setError(error.message || "Failed to start trial");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlan = () => {
    // For now, return null since we're not using organizations API
    return null;
  };

  const currentPlan = getCurrentPlan();

  const plans = [
    {
      id: "free",
      name: "Web App - Free Plan",
      price: "₹0",
      period: "forever",
      description: "Free tier for web users with basic features",
      features: [
        "100 Chat Completions/month",
        "10 Image Generations/month",
        "Community Support",
        "Basic API Access",
      ],
      icon: FaStar,
      color: "#4ECDC4",
      popular: false,
      currentPlan: true,
    },
    {
      id: "pro",
      name: "Web App - Pro Plan",
      price: "₹999.00",
      period: "month",
      description: "Professional plan for web users with enhanced features",
      features: [
        "10,000 Chat Completions/month",
        "500 Image Generations/month",
        "Priority Support",
        "Advanced API Access",
        "Usage Analytics",
        "SuperMemory Access",
      ],
      icon: FaCrown,
      color: "#FF6B6B",
      popular: true,
    },
    {
      id: "team",
      name: "Web App - Team Plan",
      price: "₹2,499.00",
      period: "month",
      description: "Team plan for web users with collaboration features",
      features: [
        "25,000 Chat Completions/month",
        "1,000 Image Generations/month",
        "Priority Support",
        "Custom Prompt Templates",
        "Team Management",
        "SuperMemory Access",
        "Advanced Analytics",
      ],
      icon: FaShieldAlt,
      color: "#45B7D1",
      popular: false,
    },
  ];

  const planCardStyle = (isSelected, isRecommended) => ({
    backgroundColor: isSelected
      ? "rgba(255, 107, 107, 0.1)"
      : "rgba(255, 255, 255, 0.05)",
    border: isSelected
      ? "2px solid #FF6B6B"
      : "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
    backdropFilter: "blur(10px)",
    animation: "slideInUp 0.8s ease-out",
    animationDelay: `${
      plans.indexOf(plans.find((p) => p.id === plans[0]?.id)) * 0.1
    }s`,
  });

    return (
    <div
      className="subscription-container"
      style={{
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
      }}
    >
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
          className="subscription-orb-1"
          style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #FF6B6B, #FF8E8E)",
            filter: "blur(40px)",
            opacity: 0.3,
            top: "10%",
            left: "10%",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="subscription-orb-2"
          style={{
            position: "absolute",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #4ECDC4, #6EE7DF)",
            filter: "blur(40px)",
            opacity: 0.3,
            top: "60%",
            right: "15%",
            animation: "float 6s ease-in-out infinite 2s",
          }}
        />
        <div
          className="subscription-orb-3"
          style={{
            position: "absolute",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #45B7D1, #67C9E1)",
            filter: "blur(40px)",
            opacity: 0.3,
            bottom: "20%",
            left: "20%",
            animation: "float 6s ease-in-out infinite 4s",
          }}
        />
      </div>

      {/* Header */}
      <div
        className="subscription-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255, 220, 220, 0.3)",
          background: "linear-gradient(0deg, #002550FF 0%, #764ba2 100%)",
          flexShrink: 0,
          minHeight: "56px",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
        }}
      >
          <button 
          onClick={() => window.history.back()}
            className="subscription-back-button"
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
            title="Back to Profile"
          >
            <FaArrowLeft />
          </button>
          
        <div style={{ minWidth: 0, flex: 1, textAlign: "center" }}>
          <h1
            className="subscription-title"
            style={{
              margin: 0,
              color: "#FFDCDCFF",
              fontSize: "18px",
              fontWeight: "700",
              lineHeight: "22px",
            }}
          >
            Choose Your Plan
          </h1>
          <p
            className="subscription-subtitle"
            style={{
              margin: 0,
              color: "rgba(255, 220, 220, 0.8)",
              fontSize: "12px",
              lineHeight: "14px",
              marginTop: "2px",
            }}
          >
            Select the perfect plan for your needs
        </p>
      </div>

        <div style={{ width: "32px" }}></div>
          </div>

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Current Plan Banner */}
        {currentPlan && (
          <div
            style={{
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
              borderRadius: "12px",
              padding: "12px",
              marginBottom: "16px",
              textAlign: "center",
              animation: "slideInUp 0.6s ease-out",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#4CAF50",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              ✅ Currently on {currentPlan.name} plan ({currentPlan.status})
            </p>
              </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: "rgba(220, 53, 69, 0.1)",
              border: "1px solid rgba(220, 53, 69, 0.3)",
              borderRadius: "12px",
              padding: "12px",
              marginBottom: "16px",
              color: "#FF6B6B",
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            {error}
                </div>
              )}
              
        {/* Plans Grid */}
        <div
          className="subscription-plans"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            const isCurrentPlan = plan.currentPlan;

            return (
              <div
                key={plan.id}
                className="subscription-plan"
                style={{
                  ...planCardStyle(selectedPlan === plan.id, plan.popular),
                  animationDelay: `${index * 0.1}s`,
                  marginTop: plan.popular ? "40px" : "0px", // Further increased margin for popular plan to show banner completely
                }}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-25px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "#FF6B6B",
                      color: "white",
                      padding: "10px 28px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      zIndex: 10,
                      boxShadow: "0 2px 8px rgba(255, 107, 107, 0.3)",
                    }}
                  >
                    MOST POPULAR
                    </div>
                  )}

                <div
                  className="plan-header"
                  style={{ textAlign: "center", marginBottom: "16px" }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: `${plan.color}20`,
                      color: plan.color,
                      fontSize: "16px",
                      marginBottom: "8px",
                    }}
                  >
                    <IconComponent />
                </div>

                  <h3
                    className="plan-title"
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#FFDCDCFF",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {plan.name}
                  </h3>

                  <div className="plan-price" style={{ marginBottom: "4px" }}>
                    <span
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#FFDCDCFF",
                      }}
                    >
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "rgba(255, 220, 220, 0.7)",
                          marginLeft: "4px",
                        }}
                      >
                        /{plan.period}
                    </span>
                  )}
                </div>

                  <p
                    className="plan-description"
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 220, 220, 0.8)",
                      margin: 0,
                    }}
                  >
                    {plan.description}
                  </p>
              </div>

                <div className="plan-features" style={{ marginBottom: "16px" }}>
                  {plan.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="plan-feature"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                        fontSize: "12px",
                        color: "#FFDCDCFF",
                      }}
                    >
                      <FaCheck
                        style={{
                          color: "#4CAF50",
                          marginRight: "8px",
                          flexShrink: 0,
                          fontSize: "10px",
                        }}
                      />
                      <span>{feature}</span>
            </div>
          ))}
        </div>

                <div className="plan-actions" style={{ textAlign: "center" }}>
                  {isCurrentPlan ? (
                    <div
                      style={{
                        backgroundColor: "rgba(76, 175, 80, 0.1)",
                        border: "1px solid rgba(76, 175, 80, 0.3)",
                        borderRadius: "8px",
                        padding: "12px",
                        color: "#4CAF50",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Current Plan
          </div>
                  ) : plan.id === "free" ? (
        <button
                      onClick={() => handleSubscribe(plan.name)}
          disabled={loading}
                      className="plan-button"
          style={{
                        width: "100%",
                        padding: "8px 16px",
                        backgroundColor: "#4ECDC4",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1,
                        transition: "all 0.3s ease",
                      }}
                    >
                      {loading ? "Processing..." : "Get Started"}
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleTrial(plan.name)}
                        disabled={loading}
                        className="plan-button"
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          backgroundColor: "transparent",
                          color: "#FF6B6B",
                          border: "1px solid #FF6B6B",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: "600",
                          cursor: loading ? "not-allowed" : "pointer",
                          opacity: loading ? 0.6 : 1,
                          transition: "all 0.3s ease",
                        }}
                      >
                        {loading ? "Processing..." : "Start Trial"}
        </button>
        <button
                        onClick={() => handleSubscribe(plan.name)}
          disabled={loading}
                        className="plan-button"
          style={{
                          flex: 1,
                          padding: "8px 12px",
                          backgroundColor: "#FF6B6B",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: "600",
                          cursor: loading ? "not-allowed" : "pointer",
                          opacity: loading ? 0.6 : 1,
                          transition: "all 0.3s ease",
                        }}
                      >
                        {loading ? "Processing..." : "Subscribe"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* OR Separator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "0px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                backgroundColor: "rgba(255, 220, 220, 0.3)",
              }}
            />
            <div
              style={{
                padding: "0 8px",
                color: "rgba(255, 220, 220, 0.8)",
                fontSize: "14px",
                fontWeight: "600",
                backgroundColor: "#00255000",
              }}
            >
              OR
            </div>
            <div
              style={{
                flex: 1,
                height: "1px",
                backgroundColor: "rgba(255, 220, 220, 0.3)",
              }}
            />
          </div>

          {/* API Key Option */}
          <div
            style={{
              backgroundColor: "rgba(255, 220, 220, 0.08)",
              border: "1px solid rgba(255, 220, 220, 0.2)",
              borderRadius: "12px",
              padding: "16px",
              marginTop: "16px",
              textAlign: "center",
            }}
          >
            <h4
              style={{
                color: "#FFDCDCFF",
                fontSize: "14px",
                fontWeight: "600",
                margin: "0 0 8px 0",
              }}
            >
              Use Your Own API Key
            </h4>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(255, 220, 220, 0.8)",
                margin: "0 0 12px 0",
              }}
            >
              Configure your personal API keys for unlimited usage
            </p>
        <button
          onClick={onOpenSettings}
          style={{
                width: "100%",
                padding: "10px 16px",
                backgroundColor: "transparent",
                color: "#FF6B6B",
                border: "1px solid #FF6B6B",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              Open Settings
        </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            padding: "12px 16px",
            color: "rgba(255, 220, 220, 0.6)",
            fontSize: "10px",
            borderTop: "1px solid rgba(255, 220, 220, 0.2)",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <p style={{ margin: "0 0 4px 0" }}>
            All plans include secure authentication and data protection
          </p>
          <p style={{ margin: 0 }}>Need help? Contact our support team</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
