/* global chrome */
import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaExternalLinkAlt, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Jobs = ({ jobs, onDeleteJob, isProcessedList = false }) => {
    const [expandedJobs, setExpandedJobs] = useState(new Set());

    const getStatusIcon = (status, isProcessed) => {
        if (isProcessed) return <FaCheckCircle className="text-green-500" />;

        switch (status?.toLowerCase()) {
            case 'completed':
                return <FaCheckCircle className="text-green-500" />;
            case 'failed':
                return <FaTimesCircle className="text-red-500" />;
            case 'pending':
                return <FaSpinner className="text-yellow-500 animate-spin" />;
            default:
                return null;
        }
    };

    const toggleJob = (jobId) => {
        setExpandedJobs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(jobId)) {
                newSet.delete(jobId);
            } else {
                newSet.add(jobId);
            }
            return newSet;
        });
    };

    const openInNewTab = (url) => {
        if (/^(https?:\/\/|ftp:\/\/|file:\/\/)/i.test(url)) {
            url = url;
        }

        if (/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i.test(url)) {
            url = `https://${url}`;
        }

        chrome.tabs.create({ url: url, active: true });
    };

    return (
        <div className="bg-[#2a2f35] rounded-lg p-3 mb-4 max-h-[70vh] overflow-y-auto">
            {jobs.length === 0 ? (
                <p className="text-center text-gray-400">
                    {isProcessedList ? 'No processed jobs yet.' : 'No jobs fetched yet.'}
                </p>
            ) : (
                jobs.map((job) => {
                    const isExpanded = expandedJobs.has(job.id);
                    return (
                        <div key={job.id} className="mb-2 bg-[#3a3f45] rounded-lg overflow-hidden">
                            {/* Collapsed View */}
                            <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#4a4f55]"
                                onClick={() => toggleJob(job.id)}>
                                <div className="flex items-center flex-grow mr-2">
                                    <div className="mr-2">
                                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="text-sm font-medium">
                                            Job ID: {job.id}
                                        </div>
                                        {isProcessedList && (
                                            <div className="text-xs text-gray-400">
                                                {new Date(job.timestamp).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center">
                                        {getStatusIcon(job.status, isProcessedList)}
                                        <span className="text-xs ml-1">
                                            {isProcessedList ? 'Processed' : job.status}
                                        </span>
                                    </div>
                                    {/* {!isProcessedList && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteJob(job.id);
                                            }}
                                            className="text-red-500 hover:text-red-600 p-1"
                                            title="Delete job"
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    )} */}
                                </div>
                            </div>

                            {/* Expanded View */}
                            {isExpanded && (
                                <div className="px-3 pb-3 pt-1 border-t border-[#2a2f35]">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-400 truncate mr-2">
                                            <strong>URL:</strong> {job.url}
                                        </p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openInNewTab(job.url);
                                            }}
                                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded transition duration-300 flex items-center"
                                        >
                                            Open <FaExternalLinkAlt className="ml-1" size={10} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default Jobs;
