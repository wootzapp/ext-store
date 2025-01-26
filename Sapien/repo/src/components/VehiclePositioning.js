import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/VehiclePositioning.css';

const VehiclePositioning = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sapienData, setSapienData] = useState(location.state?.sapienData || null);

  useEffect(() => {
    if (!sapienData) {
      // If no data is passed, navigate back to the dashboard
      navigate('/dashboard');
    }
  }, [sapienData, navigate]);

  const handleSubmit = async () => {
    try {
      // Call the same API again
      const response = await fetch('https://server.sapien.io/graphql', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'origin': 'https://app.sapien.io',
          'referer': 'https://app.sapien.io/',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          query: `query dataForTagging($tagFlowNodeId: String) {
            dataForTagging(input: {tagFlowNodeId: $tagFlowNodeId}) {
              id
              taxonomy
              provisionedInputData
              provisionedTagData
              expiresAt
              tagFlowNodeModuleType
              tagFlowNodeInProgressDailyGoal
              tagFlowNodeTypeInProgress
              botProtection
              dataPoint {
                id
                projectType
                projectDataset {
                  id
                  project {
                    id
                    projectName
                    personalDailyQaMetrics {
                      id
                      totalReviews
                    }
                  }
                }
              }
              inProgressTaggerReview {
                id
              }
              tagFlowNode {
                id
                rewardDetails {
                  rewardType
                  weight
                }
                activeAttributes {
                  id
                  key
                  value
                }
              }
            }
          }`,
          variables: { tagFlowNodeId: sapienData.dataForTagging.id }
        })
      });

      const result = await response.json();
      if (result.data) {
        setSapienData(result.data);
        alert('Data submitted successfully!');
      } else {
        throw new Error('Failed to submit data');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to submit data. Please try again.');
    }
  };

  if (!sapienData) {
    return null;
  }

  const imageUrl = sapienData.dataForTagging.provisionedInputData.image.url.forViewing;

  return (
    <div className="vehicle-positioning-page">
      <Navbar />
      <div className="content">
        <h1>Vehicle Positioning</h1>
        <div className="image-container">
          <img src={imageUrl} alt="Vehicle" />
        </div>
        <button className="submit-button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default VehiclePositioning;