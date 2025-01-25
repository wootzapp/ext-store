
import React, { useState } from "react";
import "../styles/EmailInput.css"; // Add this line to import the CSS

const EmailInput = ({ onOtpSent }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Initiating email verification for:", email);
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Email validation failed");
      setError("Please enter a valid email address.");
      return;
    }

    try {

      console.log("Making API call to passwordless/init");

      console.log("Initiating OTP send for email:", email);
      // authenticate

      const response = await fetch("https://auth.privy.io/api/v1/passwordless/init", {
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "privy-app-id": "cm668wd7e0162w7562xb9xnhu",
          "privy-ca-id": "b63f2350-b686-4f70-894a-0d8f1f870592",
          "privy-client": "react-auth:1.98.4",
        },
        method: "POST",
        body: JSON.stringify({ email }),
      });

      console.log("OTP Init Response:", response);
      console.log("Response status:", response.status);

      const result = await response.json();

      console.log("OTP Init Result:", result);

      if (result.success) {
        console.log("OTP sent successfully to:", email);
        console.log("Calling onOtpSent callback...");
        onOtpSent(email);
        console.log("onOtpSent callback completed");
      } else {
        console.error("Failed to send OTP:", result.error);
        setError(result.error || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="email-input-container">
      <h5>Email Login</h5>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send OTP</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default EmailInput;