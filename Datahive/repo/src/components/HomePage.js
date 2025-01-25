/* global chrome */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/DataHive-icon-128.png';
import { FaArrowLeft } from 'react-icons/fa';
import { LineWave, ThreeDots } from 'react-loader-spinner';

function HomePage() {
    const navigate = useNavigate();
    const [isServiceRunning, setIsServiceRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [jobStats, setJobStats] = useState({
        fetched: 0,
        executed: 0,
        points: 0
    });

    useEffect(() => {
        fetchStatus();
        const intervalId = setInterval(fetchStatus, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const fetchStatus = () => {
        chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
            setIsServiceRunning(response.status === 'Running');
            setJobStats(response.jobStats);
        });
    };

    const toggleService = async () => {
        setIsLoading(true);
        const intervalId = setInterval(async () => {
            try {
                const response = await new Promise((resolve) => {
                    chrome.runtime.sendMessage({ action: "toggle" }, resolve);
                });
                setIsServiceRunning(response.status === 'Running');
            } catch (error) {
                console.error('Failed to toggle service:', error);
            } finally {
                setIsLoading(false);
            }
            clearInterval(intervalId);
        }, 1000);
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/');
    };

    const handleBack = () => {
        navigate('/');
    };

    const navigateToJobs = () => {
        navigate('/jobs');
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#191d21] text-white font-sans p-4 relative overflow-auto">
            <button
                onClick={handleBack}
                className="absolute top-4 left-4 text-white hover:text-gray-300 transition-colors duration-300"
            >
                <FaArrowLeft size={20} />
            </button>

            <div className="flex flex-col items-center justify-center flex-grow">
                <div className="w-full max-w-md">
                    <img src={logo} alt="Datahive logo" className="w-16 h-16 mx-auto mb-2" />
                    <h1 className="text-xl font-normal text-center mb-4">Datahive Dashboard</h1>

                    <div className="bg-[#2a2f35] rounded-lg p-3 mb-4">
                        <h2 className="text-lg font-semibold mb-2">Job Stats</h2>
                        <ul className="space-y-1 text-sm">
                            <li>Jobs Fetched: {jobStats.fetched}</li>
                            <li>Jobs Executed: {jobStats.executed}</li>
                            <li>Points Accumulated: {jobStats.points}</li>
                        </ul>
                    </div>

                    <button
                        onClick={navigateToJobs}
                        className="w-full bg-[#2a2f35] text-white py-2 px-4 rounded-lg hover:bg-[#3a3f45] transition-colors duration-300 text-sm mb-3"
                    >
                        View Fetched Jobs
                    </button>

                    <button
                        onClick={toggleService}
                        className={`w-full flex items-center justify-center py-2 px-4 rounded-lg mb-3 text-sm font-semibold transition-colors duration-300 ${isServiceRunning
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        {isLoading ?
                            <ThreeDots
                                height="20"
                                width="20"
                                color="#ffffff"
                                ariaLabel="loading" />
                            : isServiceRunning ? 'Stop Service' : 'Start Service'}

                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 text-sm"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
