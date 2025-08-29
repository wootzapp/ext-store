/* global chrome */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaStar,
  FaCrown,
  FaShieldAlt,
  FaExclamationTriangle,
  FaSync,
} from "react-icons/fa";
import apiService from "../services/api";
import "../styles/SubscriptionPageAnimations.css";

const SubscriptionPage = ({ onSubscribe, onLogout, onOpenSettings, user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [userData, setUserData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [activeOrganization, setActiveOrganization] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState({});

  useEffect(() => {
    loadSubscriptionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get current user data to find active organization
      const userResponse = await apiService.getCurrentUser();
      console.log("User response:", userResponse);

      if (!userResponse || !userResponse.user) {
        throw new Error("Failed to load user data");
      }

      setUserData(userResponse.user);

      // Find active organization
      const organizations = userResponse.organizations || [];
      const selectedOrgId = userResponse.user?.selectedOrganizationId;
      const activeOrg = selectedOrgId 
        ? organizations.find(org => org.id === selectedOrgId)
        : organizations.find((org) => org.isActive) || organizations[0];

      if (!activeOrg) {
        throw new Error("No active organization found");
      }

      setActiveOrganization(activeOrg);
      setCurrentPlan(activeOrg);

      console.log("Current plan details:", {
        productId: activeOrg.productId,
        subscriptionType: activeOrg.subscriptionType,
        subscriptionStatus: activeOrg.subscriptionStatus,
        name: activeOrg.name,
      });

      // Get currency from the active organization's priceId
      // We'll need to fetch the price details to get the currency
      let currency = "usd"; // Default fallback
      
      if (activeOrg.priceId) {
        try {
          // Get price details to extract currency
          const priceResponse = await apiService.getOrganizationsForPrice(activeOrg.priceId);
          if (priceResponse && priceResponse.priceInfo && priceResponse.priceInfo.currency) {
            currency = priceResponse.priceInfo.currency;
            console.log("Using currency from organization:", currency);
          }
        } catch (error) {
          console.warn("Failed to get price details, using default currency:", error);
        }
      }

      // Fetch pricing data from API
      await loadPricingData(currency);
    } catch (error) {
      console.error("Error loading subscription data:", error);
      setError(error.message || "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const loadPricingData = async (currency) => {
    try {
      setPlansLoading(true);

      const pricingResponse = await apiService.getProductsByCurrency(currency);
      console.log("Pricing response:", pricingResponse);
      console.log("Pricing response structure:", {
        hasResponse: !!pricingResponse,
        hasProducts: !!(pricingResponse && pricingResponse.products),
        productsLength: pricingResponse?.products?.length,
        productsStructure: pricingResponse?.products?.[0]
          ? Object.keys(pricingResponse.products[0])
          : "No products",
        sampleProduct: pricingResponse?.products?.[0]
          ? {
              name: pricingResponse.products[0].name,
              price: pricingResponse.products[0].price,
              priceKeys: pricingResponse.products[0].price
                ? Object.keys(pricingResponse.products[0].price)
                : null,
            }
          : null,
      });

      if (!pricingResponse || !pricingResponse.products) {
        throw new Error("Failed to load pricing data");
      }

      console.log(
        "All products from API:",
        pricingResponse.products.map((p) => ({
          id: p.id,
          name: p.name,
          hasPrice: !!(p.price && typeof p.price === "object"),
          priceStructure: p.price ? Object.keys(p.price) : "No price",
          priceInterval: p.price?.interval || "No interval",
        }))
      );

      if (!pricingResponse || !pricingResponse.products) {
        throw new Error("Failed to load pricing data");
      }

      // Organize products into separate sections
      const mobileAppProducts = pricingResponse.products.filter((product) =>
        product.name.toLowerCase().includes("mobile app")
      );

      const webAppProducts = pricingResponse.products.filter((product) =>
        product.name.toLowerCase().includes("web app")
      );

      const apiAccessProducts = pricingResponse.products.filter((product) =>
        product.name.toLowerCase().includes("api access")
      );

      // Combine all relevant products
      const relevantProducts = [
        ...mobileAppProducts,
        ...webAppProducts,
        ...apiAccessProducts,
      ];

      console.log("Filtered products:", {
        mobileApp: mobileAppProducts.length,
        webApp: webAppProducts.length,
        apiAccess: apiAccessProducts.length,
        total: relevantProducts.length,
      });

      // If no products found, create a fallback plan based on current subscription
      if (relevantProducts.length === 0) {
        console.log("No relevant products found, creating fallback plan");
        const fallbackPlan = {
          id: "fallback",
          name:
            currentPlan?.subscriptionType === "Free"
              ? "Free Plan"
              : "Current Plan",
          description: "Your current subscription plan",
          prices: [],
          monthlyPrice: null,
          yearlyPrice: null,
          features: getFeaturesForPlan(currentPlan?.subscriptionType || "Free"),
          icon: getIconForPlan(currentPlan?.subscriptionType || "Free"),
          color: getColorForPlan(currentPlan?.subscriptionType || "Free"),
          popular: false,
          currentPlan: true,
        };

        setPlans([fallbackPlan]);
        return;
      }

      // Transform products and organize by sections
      const transformProduct = (product) => {
        // Handle the correct API structure where price is an object (not prices array)
        const price = product.price || {};

        // Add safety check for price object
        if (!price || typeof price !== "object") {
          console.warn(
            `Product ${product.name} has invalid price structure:`,
            price
          );
          return null;
        }

        // The API returns a single price object with formattedAmount
        const monthlyPrice = price.interval === "month" ? price : null;
        const yearlyPrice = price.interval === "year" ? price : null;

        // Check if this product matches the current active plan
        const isCurrentPlan = currentPlan && (
          // Match by productId if available
          (currentPlan.productId && currentPlan.productId === product.id) ||
          // Match by priceId if available
          (currentPlan.priceId && currentPlan.priceId === price.id) ||
          // Match by subscription type for free plans
          (currentPlan.subscriptionType === "Free" && product.name.toLowerCase().includes("free")) ||
          // Match by subscription type for paid plans
          (currentPlan.subscriptionType === "Paid" && product.name.toLowerCase().includes("pro"))
        );

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          prices: [price].filter(Boolean),
          monthlyPrice: monthlyPrice
            ? {
                amount:
                  (monthlyPrice.unitAmount || monthlyPrice.unit_amount || 0) /
                  100, // Convert from cents
                currency: monthlyPrice.currency.toUpperCase(),
                interval: monthlyPrice.interval,
                priceId: monthlyPrice.id,
                formattedAmount: monthlyPrice.formattedAmount, // Use the formatted amount from API
              }
            : null,
          yearlyPrice: yearlyPrice
            ? {
                amount:
                  (yearlyPrice.unitAmount || yearlyPrice.unit_amount || 0) /
                  100, // Convert from cents
                currency: yearlyPrice.currency.toUpperCase(),
                interval: yearlyPrice.interval,
                priceId: yearlyPrice.id,
                formattedAmount: yearlyPrice.formattedAmount, // Use the formatted amount from API
              }
            : null,
          features: getFeaturesForPlan(product.name),
          icon: getIconForPlan(product.name),
          color: getColorForPlan(product.name),
          popular: product.name.toLowerCase().includes("pro"),
          currentPlan: isCurrentPlan,
        };
      };

      // Transform all products into a flat array
      const allProducts = [
        ...mobileAppProducts,
        ...webAppProducts,
        ...apiAccessProducts,
      ];

      const transformedPlans = allProducts
        .map(transformProduct)
        .filter(Boolean);

      console.log("Transformed plans:", {
        total: transformedPlans.length,
        mobileApp: mobileAppProducts.length,
        webApp: webAppProducts.length,
        apiAccess: apiAccessProducts.length,
        samplePlan: transformedPlans[0]
          ? {
              name: transformedPlans[0].name,
              monthlyPrice: transformedPlans[0].monthlyPrice,
              formattedAmount:
                transformedPlans[0].monthlyPrice?.formattedAmount,
            }
          : null,
      });

      setPlans(transformedPlans);
    } catch (error) {
      console.error("Error loading pricing data:", error);

      // If API fails, create default plans based on current subscription
      console.log("Creating fallback plans due to API error");

      // Create a fallback plan based on current subscription
      const fallbackPlan = {
        id: "fallback",
        name:
          currentPlan?.subscriptionType === "Free"
            ? "Free Plan"
            : "Current Plan",
        description: "Your current subscription plan",
        prices: [],
        monthlyPrice: null,
        yearlyPrice: null,
        features: getFeaturesForPlan(currentPlan?.subscriptionType || "Free"),
        icon: getIconForPlan(currentPlan?.subscriptionType || "Free"),
        color: getColorForPlan(currentPlan?.subscriptionType || "Free"),
        popular: false,
        currentPlan: true,
      };

      setPlans([fallbackPlan]);
      setError("Using fallback pricing - API temporarily unavailable");
    } finally {
      setPlansLoading(false);
    }
  };

  const getFeaturesForPlan = (planName) => {
    const name = planName.toLowerCase();

    if (name.includes("free")) {
      return [
        "100 Chat Completions/month",
        "10 Image Generations/month",
        "Community Support",
        "Basic API Access",
      ];
    } else if (name.includes("pro")) {
      return [
        "10,000 Chat Completions/month",
        "500 Image Generations/month",
        "Priority Support",
        "Advanced API Access",
        "Usage Analytics",
        "SuperMemory Access",
      ];
    } else if (name.includes("team")) {
      return [
        "25,000 Chat Completions/month",
        "1,000 Image Generations/month",
        "Priority Support",
        "Custom Prompt Templates",
        "Team Management",
        "SuperMemory Access",
        "Advanced Analytics",
      ];
    } else {
      return [
        "Unlimited Chat Completions",
        "Unlimited Image Generations",
        "Priority Support",
        "Advanced API Access",
        "Usage Analytics",
        "SuperMemory Access",
      ];
    }
  };

  const getIconForPlan = (planName) => {
    const name = planName.toLowerCase();

    if (name.includes("free")) return FaStar;
    if (name.includes("pro")) return FaCrown;
    if (name.includes("team")) return FaShieldAlt;
    return FaCrown;
  };

  const getColorForPlan = (planName) => {
    const name = planName.toLowerCase();

    if (name.includes("free")) return "#4ECDC4";
    if (name.includes("pro")) return "#FF6B6B";
    if (name.includes("team")) return "#45B7D1";
    return "#FF6B6B";
  };

  const handleSubscribe = async (plan, interval = "month") => {
    try {
      setCheckoutLoading(prev => ({ ...prev, [plan.id]: true }));
      setError("");

      const priceData =
        interval === "month" ? plan.monthlyPrice : plan.yearlyPrice;

      if (!priceData) {
        throw new Error(`No ${interval} pricing available for this plan`);
      }

      // Get the active organization ID
      const activeOrg = activeOrganization || currentPlan;
      if (!activeOrg || !activeOrg.id) {
        // If no active organization, try to get it from user data
        if (userData && userData.user && userData.user.selectedOrganizationId) {
          // Use the selected organization ID from user data
          const orgId = userData.user.selectedOrganizationId;
          console.log("Using selected organization ID:", orgId);
        } else {
          throw new Error("No active organization found. Please try refreshing the page.");
        }
      }

      const organizationId = activeOrg?.id || userData?.user?.selectedOrganizationId;
      if (!organizationId) {
        throw new Error("No organization ID available for checkout");
      }

      console.log("Creating checkout session for:", {
        planName: plan.name,
        priceId: priceData.priceId,
        organizationId: organizationId,
        priceData: priceData
      });

      // Create checkout session using the payment API
      const checkoutResponse = await apiService.createCheckoutSession(
        priceData.priceId,
        organizationId
      );

      console.log("Checkout response:", checkoutResponse);

      if (checkoutResponse && checkoutResponse.url) {
        // Open the checkout URL in a new tab
        chrome.tabs.create({
          url: checkoutResponse.url,
          active: true,
        });
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError(error.message || "Failed to create checkout session");
    } finally {
      setCheckoutLoading(prev => ({ ...prev, [plan.id]: false }));
    }
  };

  const formatPrice = (priceData) => {
    if (!priceData) return "N/A";

    // If we have formattedAmount from the API, use it
    if (priceData.formattedAmount) {
      return priceData.formattedAmount;
    }

    // Fallback to manual formatting if no formattedAmount
    if (typeof priceData.amount !== "number") return "N/A";

    const currencySymbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
    };

    const symbol = currencySymbols[priceData.currency] || priceData.currency;
    return `${symbol}${priceData.amount.toFixed(2)}`;
  };

  const planCardStyle = (isSelected, isRecommended) => ({
    backgroundColor: isSelected
      ? "rgba(255, 107, 107, 0.1)"
      : "rgba(255, 255, 255, 0.05)",
    border: isSelected
      ? "2px solid #FF6B6B"
      : "1px solid rgba(255, 173, 31, 0.3)",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "8px",
    cursor: "pointer",
    position: "relative",
    backdropFilter: "blur(10px)",
    animation: "slideInUp 0.8s ease-out",
  });

  if (loading) {
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#FFDCDCFF",
          }}
        >
          <div
            className="spinner-loader"
            style={{
              width: "48px",
              height: "48px",
              marginBottom: "20px",
              border: "4px solid transparent",
              borderRightColor: "#FFDCDCFF",
            }}
          />
          <div style={{ fontSize: "16px", fontWeight: "500" }}>
            Loading subscription plans...
          </div>
        </div>
      </div>
    );
  }

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
          onClick={() => navigate("/profile")}
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

        {/* <button
          onClick={() => loadSubscriptionData()}
          className="subscription-refresh-button"
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
            width: "32px",
            height: "32px",
          }}
          title="Refresh Plans"
          disabled={loading || plansLoading}
        >
          <FaSync
            style={{
              animation:
                loading || plansLoading ? "spin 1s linear infinite" : "none",
              opacity: loading || plansLoading ? 0.6 : 1,
              fontSize: "14px",
            }}
          />
        </button> */}
      </div>

        {/* Scrollable Content */}
       <div
         style={{
           flex: 1,
           overflowY: "auto",
           padding: "16px",
           scrollbarWidth: "none",
           msOverflowStyle: "none",
           paddingTop: "24px", // Increased padding at top for popular badges
         }}
       >
        {/* Billing Organization Banner */}
        {currentPlan && (
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 220, 220, 0.2)",
              borderRadius: "12px",
              padding: "12px",
              marginBottom: "12px",
              animation: "slideInUp 0.6s ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#FFDCDCFF",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                Billing Organization
              </p>
              <p
                style={{
                  margin: 0,
                  color: "rgba(255, 220, 220, 0.8)",
                  fontSize: "11px",
                  fontWeight: "500",
                }}
              >
                {currentPlan.name} • {currentPlan.subscriptionStatus}
              </p>
            </div>
          </div>
        )}

        {/* Current Plan Banner */}
        {currentPlan && (
          <div
            style={{
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
              borderRadius: "12px",
              padding: "12px",
              marginBottom: "12px",
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
              ✅ Currently on {currentPlan.subscriptionType} plan (
              {currentPlan.subscriptionStatus}) - {currentPlan.name}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
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
            gap: "8px",
          }}
        >
          {plansLoading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
                color: "#FFDCDCFF",
              }}
            >
              <div
                className="spinner-loader"
                style={{
                  width: "36px",
                  height: "36px",
                  marginBottom: "16px",
                  border: "3px solid transparent",
                  borderRightColor: "#FFDCDCFF",
                }}
              />
              <div style={{ fontSize: "14px", fontWeight: "500" }}>
                Loading plans...
              </div>
            </div>
          ) : plans.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
                color: "rgba(255, 220, 220, 0.7)",
                textAlign: "center",
              }}
            >
              <FaExclamationTriangle
                style={{ fontSize: "32px", marginBottom: "12px" }}
              />
              <div>No plans available</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                Please try again later or contact support
              </div>
            </div>
          ) : (
            plans.map((plan, index) => {
              const IconComponent = plan.icon;
              const isCurrentPlan = plan.currentPlan;

              return (
                <div
                  key={plan.id}
                  className="subscription-plan"
                  style={{
                    ...planCardStyle(selectedPlan === plan.id, plan.popular),
                    animationDelay: `${index * 0.1}s`,
                    marginTop: "0px",
                    position: "relative",
                  }}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div
                      style={{
                        backgroundColor: "#FF6B6B",
                        color: "white",
                        padding: "6px 16px",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontWeight: "700",
                        textAlign: "center",
                        letterSpacing: "0.3px",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        lineHeight: "1.2",
                        marginBottom: "12px",
                        display: "inline-block",
                        boxShadow: "0 2px 8px rgba(255, 107, 107, 0.4)",
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
                      {plan.monthlyPrice ? (
                        <div>
                          <span
                            style={{
                              fontSize: "24px",
                              fontWeight: "700",
                              color: "#FFDCDCFF",
                            }}
                          >
                            {plan.monthlyPrice.amount === 0
                              ? "Free"
                              : formatPrice(plan.monthlyPrice)}
                          </span>
                          {plan.monthlyPrice.amount > 0 && (
                            <span
                              style={{
                                fontSize: "12px",
                                color: "rgba(255, 220, 220, 0.7)",
                                marginLeft: "4px",
                              }}
                            >
                              /month
                            </span>
                          )}
                        </div>
                      ) : (
                        <span
                          style={{
                            fontSize: "24px",
                            fontWeight: "700",
                            color: "#FFDCDCFF",
                          }}
                        >
                          Custom
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

                  <div
                    className="plan-features"
                    style={{ marginBottom: "16px" }}
                  >
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
                          backgroundColor: "rgba(76, 175, 80, 0.15)",
                          border: "1px solid rgba(76, 175, 80, 0.4)",
                          borderRadius: "8px",
                          padding: "12px",
                          color: "#4CAF50",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        Your Current Plan
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubscribe(plan);
                        }}
                        disabled={checkoutLoading[plan.id] || plansLoading}
                        className="plan-button"
                        style={{
                          width: "100%",
                          padding: "10px 16px",
                          backgroundColor: "#FF6B6B",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: (checkoutLoading[plan.id] || plansLoading) ? "not-allowed" : "pointer",
                          opacity: (checkoutLoading[plan.id] || plansLoading) ? 0.6 : 1,
                        }}
                      >
                        {checkoutLoading[plan.id] ? (
                          <>
                            <div className="spinner-loader" style={{
                              width: "12px",
                              height: "12px",
                              border: "2px solid transparent",
                              borderRightColor: "#ffffff",
                              marginRight: "6px"
                            }} />
                            Creating Checkout...
                          </>
                        ) : (
                          "Subscribe"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

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
