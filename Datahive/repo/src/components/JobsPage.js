/* global chrome */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import Jobs from './Jobs';
import ConfirmModal from './ConfirmModal';

function JobsPage() {
    const navigate = useNavigate();
    const [fetchedJobs, setFetchedJobs] = useState([]);
    const [processedJobs, setProcessedJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('current');
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const JOBS_PER_PAGE = 50;

    const handleCleanupProcessedJobs = async () => {
        try {
            const data = await chrome.storage.local.get(['processedJobs']);
            let processedJobs = data.processedJobs || [];

            // Keep only the most recent entry for each job ID
            const uniqueJobs = Array.from(
                processedJobs.reduce((map, job) => {
                    if (!map.has(job.id) || map.get(job.id).timestamp < job.timestamp) {
                        map.set(job.id, job);
                    }
                    return map;
                }, new Map()).values()
            );

            // Sort by timestamp, most recent first
            uniqueJobs.sort((a, b) => b.timestamp - a.timestamp);

            await chrome.storage.local.set({ processedJobs: uniqueJobs });
            setProcessedJobs(uniqueJobs);
        } catch (error) {
            console.error('Error cleaning up processed jobs:', error);
        }
    };

    useEffect(() => {
        fetchJobs();
        loadProcessedJobs();
        handleCleanupProcessedJobs(); // Clean up on component mount

        const messageHandler = (message) => {
            switch (message.action) {
                case 'jobStatusUpdate':
                    setFetchedJobs(prevJobs =>
                        prevJobs.map(job =>
                            job.id === message.jobId
                                ? { ...job, status: message.status, result: message.result }
                                : job
                        )
                    );
                    break;

                case 'jobAdded':
                    setFetchedJobs(prevJobs => {
                        if (!prevJobs.some(job => job.id === message.job.id)) {
                            return [message.job, ...prevJobs];
                        }
                        return prevJobs;
                    });
                    break;

                case 'jobsCleared':
                    setFetchedJobs([]);
                    setPage(0);
                    break;

                case 'jobDeleted':
                    setFetchedJobs(prevJobs =>
                        prevJobs.filter(job => job.id !== message.jobId)
                    );
                    break;

                case 'jobProcessed':
                    loadProcessedJobs(); // Reload processed jobs when new one is added
                    break;
                default:
                    break;
            }
        };

        chrome.runtime.onMessage.addListener(messageHandler);
        return () => chrome.runtime.onMessage.removeListener(messageHandler);
    }, [page]);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const jobs = await chrome.wootz.getJobs();
            if (jobs.length > 0) {
                setFetchedJobs(prevJobs => {
                    const parsedJobs = jobs.map(job => {
                        try {
                            return JSON.parse(job.response);
                        } catch (e) {
                            return null;
                        }
                    }).filter(Boolean);
                    return parsedJobs;
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loadProcessedJobs = async () => {
        try {
            const data = await chrome.storage.local.get(['processedJobs']);
            setProcessedJobs(data.processedJobs || []);
        } catch (error) {
            console.error('Error loading processed jobs:', error);
        }
    };

    const handleBack = () => {
        navigate('/home');
    };

    const handleClearAllJobs = () => {
        setIsConfirmModalOpen(true);
    };

    const confirmClearAllJobs = () => {
        chrome.runtime.sendMessage({ action: "clearAllJobs" }, () => {
            setFetchedJobs([]);
            setPage(0);
            setIsConfirmModalOpen(false);
        });
    };

    const handleDeleteJob = (jobId) => {
        chrome.runtime.sendMessage({ action: "deleteJob", jobId });
    };

    const handleClearProcessedJobs = () => {
        // Only clear the UI state
        setProcessedJobs([]);
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#191d21] text-white font-sans p-4 relative overflow-auto">
            <button
                onClick={handleBack}
                className="absolute top-4 left-4 text-white hover:text-gray-300 transition-colors duration-300"
            >
                <FaArrowLeft size={20} />
            </button>

            <div className="flex flex-col items-center justify-start flex-grow">
                <div className="w-full max-w-md">
                    <h1 className="text-xl font-normal text-center mb-4">Jobs</h1>

                    <div className="flex mb-4">
                        <button
                            className={`flex-1 py-2 px-4 ${activeTab === 'current' ? 'bg-blue-500' : 'bg-gray-700'}`}
                            onClick={() => setActiveTab('current')}
                        >
                            Current Jobs
                        </button>
                        <button
                            className={`flex-1 py-2 px-4 ${activeTab === 'processed' ? 'bg-blue-500' : 'bg-gray-700'}`}
                            onClick={() => setActiveTab('processed')}
                        >
                            Processed Jobs
                        </button>
                    </div>

                    {activeTab === 'current' ? (
                        <>
                            {/* <button
                                onClick={handleClearAllJobs}
                                className="mb-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-300 flex items-center justify-center w-full"
                            >
                                <FaTrash className="mr-2" /> Clear All Jobs
                            </button> */}
                            <Jobs jobs={fetchedJobs} onDeleteJob={handleDeleteJob} />
                        </>
                    ) : (
                        <>
                            {/* <button
                                onClick={handleClearProcessedJobs}
                                className="mb-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-300 flex items-center justify-center w-full"
                            >
                                <FaTrash className="mr-2" /> Clear Processed History
                            </button> */}
                            <Jobs jobs={processedJobs} isProcessedList={true} />
                        </>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onConfirm={confirmClearAllJobs}
                onCancel={() => setIsConfirmModalOpen(false)}
                message="Are you sure you want to clear all jobs?"
            />
        </div>
    );
}

export default JobsPage;