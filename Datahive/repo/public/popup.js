document.addEventListener('DOMContentLoaded', () => {
    const statusElement = document.getElementById('status');
    const toggleButton = document.getElementById('toggleButton');

    function updateStatus() {
        chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
            statusElement.textContent = `Status: ${response.status}`;
        });
    }

    function setupEventListeners() {
        toggleButton.addEventListener('click', async () => {
            toggleButton.disabled = true; // Prevent double-clicks
            try {
                const response = await chrome.runtime.sendMessage({ action: 'toggle' });
                toggleButton.textContent = response.status === 'Running' ? 'Stop Fetcher' : 'Start Fetcher';
                updateJobList();
            } catch (error) {
                console.error('Toggle error:', error);
                alert('Failed to toggle fetcher');
            } finally {
                toggleButton.disabled = false;
            }
        });

        clearButton.addEventListener('click', async () => {
            clearButton.disabled = true; // Prevent double-clicks
            try {
                await chrome.runtime.sendMessage({ action: 'clearJobs' });
                toggleButton.textContent = 'Start Fetcher'; // Reset toggle button state
                updateJobList();
            } catch (error) {
                console.error('Clear error:', error);
                alert('Failed to clear jobs');
            } finally {
                clearButton.disabled = false;
            }
        });
    }

    setupEventListeners();
    updateStatus();
});