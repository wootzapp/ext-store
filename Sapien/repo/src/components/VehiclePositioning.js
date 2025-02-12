/* global chrome */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/VehiclePositioning.css';
import wootzapp_icon from '../assets/wootzapp.png';
import multiplierIcon from '../assets/multiplier.png';
import dollarIcon from '../assets/dollar.png';
import pointsIcon from '../assets/points.png';

const VehiclePositioning = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sapienData, setSapienData] = useState(null);
  const [selectedOption, setSelectedOption] = useState('Interior / Close Up');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    try {
      console.log('Location state:', location.state);
      if (location.state?.sapienData) {
        console.log('Sapien data received:', location.state.sapienData);
        setSapienData(location.state.sapienData);
        
        // Get the image URL
        const url = location.state.sapienData?.data?.dataForTagging?.provisionedInputData?.image?.url?.forViewing;
        console.log('Image URL:', url);
        if (url) {
          setImageUrl(url);
        }
      } else {
        console.error('No sapien data in location state');
        setError('No data available. Please try again from the dashboard.');
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (err) {
      console.error('Error in initialization:', err);
      setError('Error initializing page. Please try again.');
      setTimeout(() => navigate('/dashboard'), 3000);
    }
  }, [location.state, navigate]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('Starting submission with data:', sapienData);
      
      if (!sapienData?.data?.dataForTagging?.id) {
        throw new Error('Invalid data: Missing task ID');
      }

      // Get the auth token from storage
      const token = await new Promise((resolve, reject) => {
        chrome.storage.local.get(null, function(result) {
          console.log('🔍 All storage data:', result);
          
          if (chrome.runtime.lastError) {
            console.error('❌ Storage error:', chrome.runtime.lastError);
            reject(new Error('Failed to get auth token: ' + chrome.runtime.lastError.message));
            return;
          }
          
          // Check authData structure
          if (result.authData) {
            console.log('📦 Auth data found:', {
              hasToken: !!result.authData.token,
              hasPrivyToken: !!result.authData.privyAccessToken,
              timestamp: result.authData.timestamp
            });
          } else {
            console.log('⚠️ No authData found in storage');
          }
          
          // Try to get token from different possible locations
          const token = result.authData?.token || 
                       result.authData?.privyAccessToken || 
                       result.authToken || 
                       result.privyAccessToken;
          
          if (token) {
            console.log('✅ Found valid token');
            resolve(token);
            return;
          }
          
          // If no token found
          console.error('❌ No valid token found in storage');
          reject(new Error('Auth token not found in storage'));
        });
      });

      console.log('🔑 Using auth token:', { tokenLength: token?.length });

      // Make the submission API call
      const response = await fetch('https://server.sapien.io/graphql', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'authorization': `Bearer ${token}`,
          'origin': 'https://app.sapien.io',
          'referer': 'https://app.sapien.io/',
        },
        body: JSON.stringify({
          query: `mutation submitTaggerReview($input: SubmitTaggerReviewInput!) {
            submitTaggerReview(input: $input) {
              success
              message
              data {
                id
                status
              }
            }
          }`,
          variables: {
            input: {
              tagFlowNodeId: sapienData.data.dataForTagging.id,
              tagData: {
                position: selectedOption.toUpperCase().replace(/ /g, '_')
              }
            }
          }
        })
      });

      const result = await response.json();
      console.log('Submission response:', result);
      
      if (result.data?.submitTaggerReview?.success) {
        alert('Position submitted successfully!');
        navigate('/dashboard');
      } else {
        throw new Error('Submission failed: ' + (result.errors?.[0]?.message || result.data?.submitTaggerReview?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting position:', error);
      setError(error.message || 'Failed to submit position. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="vp-page">
      <header className="vp-header">
        <button className="vp-back-button" onClick={handleBack}>
          ⟪
        </button>
        <div className="vp-header-right">
          <div className="vp-stats">
            <div className="vp-stat-item">
              <img src={multiplierIcon} alt="Multiplier" className="vp-stat-icon" />
              <span>1.00X</span>
            </div>
            <div className="vp-stat-item">
              <img src={dollarIcon} alt="Dollar" className="vp-stat-icon" />
              <span>0</span>
            </div>
            <div className="vp-stat-item">
              <img src={pointsIcon} alt="Points" className="vp-stat-icon" />
              <span>101</span>
            </div>
          </div>
          <button className="vp-wallet-button">
            <img src={wootzapp_icon} alt="Connect to Wallet" className="vp-wallet-icon" />
            Connect Wallet
          </button>
        </div>
      </header>

      <div className="vp-content">
        <div className="vp-card vp-image-card">
          {imageUrl ? (
            <img 
              src={imageUrl}
              alt="Vehicle"
              className="vp-vehicle-image"
            />
          ) : (
            <div className="vp-image-placeholder">
              <p>Image not available</p>
            </div>
          )}
        </div>
        
        <div className="vp-card vp-options-card">
          {error && (
            <div className="vp-error-message">
              {error}
            </div>
          )}
          
          <h2 className="vp-options-title">Select an option that best describes the image position</h2>
          
          <div className="vp-options-grid">
            <button 
              className={`vp-option-button ${selectedOption === 'Back' ? 'selected' : ''}`}
              onClick={() => handleOptionSelect('Back')}
              disabled={isSubmitting}
            >
              Back
            </button>
            
            <button 
              className={`vp-option-button ${selectedOption === 'Front' ? 'selected' : ''}`}
              onClick={() => handleOptionSelect('Front')}
              disabled={isSubmitting}
            >
              Front
            </button>

            <button 
              className={`vp-option-button ${selectedOption === 'Side' ? 'selected' : ''}`}
              onClick={() => handleOptionSelect('Side')}
              disabled={isSubmitting}
            >
              Side
            </button>
          </div>

          <div className="vp-options-grid vp-options-grid-second">
            <button 
              className={`vp-option-button ${selectedOption === 'Interior / Close Up' ? 'selected' : ''}`}
              onClick={() => handleOptionSelect('Interior / Close Up')}
              disabled={isSubmitting}
            >
              Interior / Close Up
            </button>
            
            <button 
              className={`vp-option-button ${selectedOption === 'Front Angle' ? 'selected' : ''}`}
              onClick={() => handleOptionSelect('Front Angle')}
              disabled={isSubmitting}
            >
              Front Angle
            </button>
          </div>

          <button 
            className="vp-submit-button" 
            onClick={handleSubmit}
            disabled={isSubmitting || !sapienData?.data?.dataForTagging?.id}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehiclePositioning;