import React from 'react';

const VehicleTagging = ({ taggingData }) => {
  // Extract image data from the GraphQL response
  const imageData = taggingData?.provisionedInputData?.image;

  if (!imageData?.url?.forViewing) {
    return <div>No image available</div>;
  }

  const handleOptionSelect = (option) => {
    console.log('Selected option:', option);
    // Add your submission logic here
  };

  return (
    <div className="tagging-container">
      <div className="content-wrapper">
        <div className="image-section">
          <img
            src={imageData.url.forViewing}
            alt="Vehicle"
            width={imageData.width}
            height={imageData.height}
          />
        </div>
        <div className="options-section">
          <h2>Select an option that best describes the image position</h2>
          <div className="options-list">
            <button onClick={() => handleOptionSelect('interior')}>Interior / Close Up</button>
            <button onClick={() => handleOptionSelect('back')}>Back</button>
            <button onClick={() => handleOptionSelect('side')}>Side</button>
            <button onClick={() => handleOptionSelect('front')}>Front</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .tagging-container {
          min-height: 100vh;
          background-color: #0a0f1f;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .content-wrapper {
          display: flex;
          gap: 40px;
          align-items: center;
          max-width: 1200px;
        }

        .image-section img {
          border-radius: 8px;
          max-width: 100%;
          height: auto;
        }

        .options-section {
          color: white;
        }

        .options-section h2 {
          font-size: 24px;
          margin-bottom: 20px;
          font-weight: normal;
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .options-list button {
          background-color: #002366;
          color: white;
          border: none;
          padding: 15px 20px;
          font-size: 16px;
          cursor: pointer;
          text-align: left;
          border-radius: 4px;
          width: 100%;
          transition: background-color 0.2s;
        }

        .options-list button:hover {
          background-color: #003399;
        }
      `}</style>
    </div>
  );
};

export default VehicleTagging;