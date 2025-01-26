class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        console.log('🔧 ApiClient initialized with base URL:', baseUrl);
    }

    async getJob() {
        console.log('🎯 Fetching job from API...');
        const response = await fetch(`${this.baseUrl}/mobile/job`);
        if (!response.ok) throw new Error('Failed to fetch job');
        const job = await response.json();
        console.log('📦 Received job:', job);
        return job;
    }

    async completeJob(jobId, result) {
        console.log(`✅ Completing job ${jobId} with result:`, result);
        const response = await fetch(`${this.baseUrl}/mobile/job/${jobId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result, metadata: {} }),
        });
        if (!response.ok) throw new Error('Failed to complete job');
        console.log(`🎉 Job ${jobId} completed successfully`);
    }

    async reportError(jobId, error, metadata = {}) {
        console.log(`❌ Reporting error for job ${jobId}:`, error);
        const response = await fetch(`${this.baseUrl}/mobile/job/${jobId}/error`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: JSON.stringify({ error, metadata }), metadata: {} }),
        });
        if (!response.ok) throw new Error('Failed to report error');
        console.log(`📝 Error reported for job ${jobId}`);
    }
}

class JobExecutor {
    async executeJob(job) {
        console.group(`🚀 Executing Job ${job.id}`);
        console.log('📋 Job details:', job);

        const url = this.ensureAbsoluteUrl(job.url);
        if (!url) {
            console.error('❌ Invalid job URL');
            console.groupEnd();
            throw new Error('Invalid job URL');
        }

        return new Promise((resolve, reject) => {
            chrome.tabs.create({ url: url, active: false }, async (tab) => {
                const tabId = tab.id;
                console.log(`📑 Created tab ${tabId} for job ${job.id}`);

                try {
                    await this.waitForTabLoad(tabId);
                    console.log(`✅ Tab ${tabId} loaded, sending message to content script`);

                    const result = await this.sendMessageToContentScript(tabId, job);
                    console.log(`🎉 Content script execution complete in tab ${tabId}`);
                    console.log('📊 Result:', result);

                    await this.closeTab(tabId);
                    console.log(`🚫 Closed tab ${tabId}`);
                    console.groupEnd();
                    resolve(result);
                } catch (error) {
                    console.error(`❌ Error in tab ${tabId}:`, error);
                    await this.closeTab(tabId);
                    console.log(`🚫 Closed tab ${tabId} due to error`);
                    console.groupEnd();
                    reject(error);
                }
            });
        });
    }

    async sendMessageToContentScript(tabId, job) {
        console.log(`📤 Sending extraction message to tab ${tabId}`);
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, {
                action: 'extractData',
                job: {
                    ...job,
                    extractImages: true,
                    extractLinks: true,
                    extractText: true,
                    extractMetadata: true
                }
            }, response => {
                if (chrome.runtime.lastError) {
                    console.error('❌ Message response failed:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('✅ Received extraction response:', response);
                    resolve(response);
                }
            });
        });
    }

    async waitForTabLoad(tabId) {
        console.log(`⏳ Waiting for tab ${tabId} to load...`);
        return new Promise((resolve, reject) => {
            const checkTab = () => {
                chrome.tabs.get(tabId, tab => {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Tab check failed:', chrome.runtime.lastError);
                        reject(chrome.runtime.lastError);
                        return;
                    }
                    if (tab.status === 'complete') {
                        console.log(`✅ Tab ${tabId} loaded successfully`);
                        resolve();
                    } else {
                        setTimeout(checkTab, 100);
                    }
                });
            };
            checkTab();
        });
    }

    ensureAbsoluteUrl(url) {
        if (/^(https?:\/\/|ftp:\/\/|file:\/\/)/i.test(url)) {
            return url;
        }

        if (/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i.test(url)) {
            return `https://${url}`;
        }

        console.error(`❌ Invalid URL: ${url}`);
        return null;
    }

    async closeTab(tabId) {
        console.log(`🚫 Closing tab ${tabId}`);
        return new Promise((resolve) => {
            chrome.tabs.remove(tabId, () => {
                if (chrome.runtime.lastError) {
                    console.warn(`⚠️ Error closing tab ${tabId}:`, chrome.runtime.lastError);
                }
                resolve();
            });
        });
    }
}

class JobFetcher {
    constructor(apiUrl, checkInterval = 60000) {
        this.apiUrl = apiUrl;
        this.checkInterval = checkInterval;
        this.isRunning = false;
        this.intervalId = null;
        this.jobStats = { fetched: 0, executed: 0, points: 0 };
        this.processedJobIds = new Set();
    }

    async start() {
        if (this.isRunning) return;
        console.log('🚀 Starting job fetcher');

        try {
            // Clean up any existing duplicates
            await this.cleanupProcessedJobs();

            await chrome.wootz.setJob(this.apiUrl);
            console.log('✅ API job setup complete');

            this.isRunning = true;
            this.updateStorage();
            this.intervalId = setInterval(() => this.checkForJobs(), this.checkInterval);
        } catch (error) {
            console.error('❌ Error starting job fetcher:', error);
            await this.stop();
        }
    }

    async stop() {
        if (!this.isRunning) return;
        console.log('🛑 Stopping job fetcher');

        try {
            await chrome.wootz.removeJob(this.apiUrl);
            console.log('✅ API job removed successfully');
        } catch (error) {
            console.error('❌ Error removing API job:', error);
        }

        this.isRunning = false;
        this.updateStorage();
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    async checkForJobs() {
        try {
            const jobs = await chrome.wootz.getJobs();
            console.log(`📦 Found ${jobs.length} jobs`);

                        // Update fetched count with new unprocessed jobs
            const newJobs = jobs.filter(job => {
                try {
                    const jobData = JSON.parse(job.response);
                    return jobData && jobData.id && !this.processedJobIds.has(jobData.id);
                } catch (e) {
                    return false;
                }
            });

            if (newJobs.length > 0) {
                this.jobStats.fetched += newJobs.length;
                this.updateStorage();
                console.log(`📊 Updated job stats - Fetched: ${this.jobStats.fetched}`);
            }

            for (const job of jobs) {
                console.log('🔍 Checking job:', job.response);
                const jobData = JSON.parse(job.response);
                if (!jobData || !jobData.id) continue;

                if (this.processedJobIds.has(jobData.id)) {
                    console.log(`⏭️ Skipping already processed job: ${jobData.id}`);
                    continue;
                }

                await this.processJob(job);
            }
        } catch (error) {
            console.error('❌ Error checking jobs:', error);
        }
    }

    async processJob(job) {
        const jobData = JSON.parse(job.response);
        if (!jobData || !jobData.id) return;

        try {
            console.log(`🔄 Processing job: ${jobData.id}`);
            const result = await jobExecutor.executeJob(jobData);
            await apiClient.completeJob(jobData.id, result);

            const processedJob = {
                id: jobData.id,
                url: jobData.url,
                timestamp: Date.now()
            };

            await this.addProcessedJob(processedJob);
            this.jobStats.executed++;
            this.jobStats.points += jobData.points || 1;
            this.updateStorage();

            console.log(`✅ Job ${jobData.id} processed and marked as complete`);
        } catch (error) {
            console.error(`❌ Error processing job: ${error}`);
            if (jobData.id) {
                await apiClient.reportError(jobData.id, error.message);
                await this.addProcessedJob({
                    id: jobData.id,
                    url: jobData.url,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        }
    }

    async addProcessedJob(jobInfo) {
        const data = await chrome.storage.local.get(['processedJobs']);
        let processedJobs = data.processedJobs || [];

        // Remove any existing entries with the same ID
        processedJobs = processedJobs.filter(job => job.id !== jobInfo.id);

        // Add the new job to the beginning
        processedJobs.unshift(jobInfo);

        // Store the updated array
        await chrome.storage.local.set({ processedJobs });
        this.processedJobIds.add(jobInfo.id);

        console.log(`✅ Added/Updated processed job ${jobInfo.id}`);
    }

    // Optional: Add a method to clean up existing duplicates
    async cleanupProcessedJobs() {
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
        console.log(`🧹 Cleaned up processed jobs. Now storing ${uniqueJobs.length} unique jobs`);

        // Update the Set of processed job IDs
        this.processedJobIds = new Set(uniqueJobs.map(job => job.id));
    }

    updateStorage() {
        chrome.storage.local.set({
            isServiceRunning: this.isRunning,
            jobStats: this.jobStats
        });
    }

    async clearProcessedJobs() {
        this.processedJobIds.clear();
        this.jobStats = { fetched: 0, executed: 0, points: 0 };
        await this.updateStorage();
        console.log('🧹 Cleared processed job history');
    }
}

// Initialize
const API_BASE_URL = 'https://api.dev.datahive.xyz/api';
const API_URL = `${API_BASE_URL}/mobile/job`;
const apiClient = new ApiClient(API_BASE_URL);
const jobExecutor = new JobExecutor();
const jobFetcher = new JobFetcher(API_URL, 5000);

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📩 Received message:', message);

    if (message.action === 'getStatus') {
        chrome.storage.local.get(['isServiceRunning', 'jobStats'], (data) => {
            sendResponse({
                status: data.isServiceRunning ? 'Running' : 'Stopped',
                jobStats: data.jobStats || { fetched: 0, executed: 0, points: 0 }
            });
        });
        return true;
    } else if (message.action === 'toggle') {
        if (jobFetcher.isRunning) {
            jobFetcher.stop().then(() => sendResponse({ status: 'Stopped' }));
        } else {
            jobFetcher.start().then(() => sendResponse({ status: 'Running' }));
        }
        return true;
    } else if (message.action === 'getJobs') {
        chrome.wootz.getJobs().then(sendResponse);
        return true;
    } else if (message.action === 'clearJobs') {
        Promise.all([
            chrome.wootz.cleanJobs(),
            jobFetcher.clearProcessedJobs(),
            jobFetcher.isRunning ? jobFetcher.stop() : Promise.resolve()
        ]).then(() => sendResponse({ success: true }));
        return true;
    }
    return true;
});

// Start if previously running
chrome.storage.local.get('isServiceRunning', (data) => {
    if (data.isServiceRunning) {
        console.log('🔄 Resuming service from previous state');
        jobFetcher.start();
    }
});
