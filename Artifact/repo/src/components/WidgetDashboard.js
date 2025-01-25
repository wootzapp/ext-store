import React, { useState, useEffect } from 'react';
import { IoInformationCircleOutline } from "react-icons/io5";
import starIcon from '../images/star.png';
import reliclogo from '../images/RelicDAOLogo.png';
import axios from 'axios';

function WidgetDashboard() {
  // State to hold dynamic points and level data
  const [points, setPoints] = useState(null);
  const [level, setLevel] = useState(null);

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_CORE_API_URL;
    // Fetch points and level data when the component mounts
    const fetchUserData = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await axios.get(`${apiUrl}/v2/xp/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (response.data.success) {
            setPoints(response.data.points);
            setLevel(response.data.level);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };
    fetchUserData();

    // Polling every 30 seconds
    const intervalId = setInterval(fetchUserData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen p-4">
      <div className="flex flex-row items-center justify-between mb-4 w-full">
        <div className="bg-[#272a2f] rounded-xl pl-3 p-2 flex flex-col items-start flex-1 mr-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">500</span>
            <img src={starIcon} alt="Star" className="w-6 h-6" />
          </div>
          <span className="text-gray-400 text-sm mt-1">WootzRelics</span>
        </div>
        <div className="bg-[#272a2f] rounded-xl pl-3 p-2 flex flex-col items-start flex-1 ml-2 relative">
          <div className="flex items-center">
            <span
              className={`font-bold ${
                (points || 0).toString().length > 3 ? "text-xl" : "text-2xl"
              }`}
              style={{ minWidth: "3ch", textAlign: "left" }}
            >
              {points || "0"}
            </span>
            <img
              src={reliclogo}
              alt="Hexagon"
              className="w-6 h-6 rounded-full"                        
            />
          </div>
          <span className="text-gray-400 text-sm mt-1">RelicPoints</span>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center mb-6">
        <div className="flex items-baseline">
          <span className="text-xl font-bold mr-2">Relic Explorer:</span>
          <span className="text-xl font-normal text-gray-400">Level {level || "0"}</span>
        </div>
      </div>
    </div>
  );
}

export default WidgetDashboard;