import React from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import '../styles/Instructions.css';

const Instructions = () => {
  const navigate = useNavigate(); // Add this hook

  // Add this handler
  const handleNextClick = () => {
    navigate('/upload'); // This will route to the UploadFile component
  };

  return (
    <div className="instructions-container">
      <div className="instructions-card">
        <h1 className="instructions-title">Instructions</h1>
        
        <p className="instructions-text">
          We're looking for road scenery images that capture diverse elements like vehicles,
          pedestrians, bicycles, motorcycles, and other objects commonly found on or near
          roads. PLEASE NOTE: In order to be paid for this task, you need to link your email in your
          user profile. If your email is not linked to your account, you will not be able to receive
          payment.
        </p>

        <div className="details-link">
          More Details Here <span className="external-link-icon">↗</span>
        </div>

        {/* Add onClick handler to the Next button */}
        <button 
          className="next-button"
          onClick={handleNextClick}
        >
          Next
        </button>
      </div>

      <div className="expiration-text">
        Tag Expiration: in 60 minutes
      </div>
    </div>
  );
};

export default Instructions;