export function createProviderVerificationPopup(providerName, description, dataRequired, sessionId) {
    // ⭐ DEBUG: Log popup creation ⭐
    console.log('[Reclaim Debug] Creating ProviderVerificationPopup:', {
        providerName,
        description,
        dataRequired,
        sessionId
    });
    
    // Inject CSS styles directly instead of importing them
    injectStyles();
    
    const popup = document.createElement('div');
    popup.id = 'reclaim-protocol-popup';
    popup.className = 'reclaim-popup';
    popup.style.animation = 'reclaim-appear 0.3s ease-out';

    // Track the state of claim generation
    const state = {
        totalClaims: 0,
        completedClaims: 0,
        proofSubmitted: false,
        inProgress: false,
        error: null,
        loadingStartTime: null,
        loadingDuration: 4000, // 4 seconds loading duration
        pendingZKProof: null, // Store ZK proof to show after loading
        loadingTimer: null
    };

    // Drag state
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    // Create initial HTML content
    renderInitialContent().then(() => {
        // Initialize drag and copy functionality after content is rendered
        initializeDragFunctionality();
        initializeCopyFunctionality();
        initializeTooltipFunctionality();
    });

    // Drag and copy functionality will be initialized after content is rendered

    // Function to load CSS from external file
    async function loadCSS() {
        // Check if styles are already injected
        if (document.getElementById('reclaim-popup-styles')) {
            return;
        }
        
        try {
            const cssUrl = chrome.runtime.getURL('content/components/ProviderVerificationPopup.css');
            const response = await fetch(cssUrl);
            const cssText = await response.text();
            
            const styleEl = document.createElement('style');
            styleEl.id = 'reclaim-popup-styles';
            styleEl.textContent = cssText;
            
            // Handle document.head not being available yet
            const appendStyle = () => {
                if (document.head) {
                    document.head.appendChild(styleEl);
                } else if (document.body) {
                    document.body.appendChild(styleEl);
                } else {
                    // If neither head nor body is available, try again later
                    setTimeout(appendStyle, 10);
                }
            };
            
            appendStyle();
        } catch (error) {
            console.error('Failed to load Reclaim popup CSS:', error);
        }
    }

    // Function to load HTML template from external file
    async function loadHTMLTemplate() {
        try {
            const htmlUrl = chrome.runtime.getURL('content/components/ProviderVerificationPopup.html');
            const response = await fetch(htmlUrl);
            const htmlText = await response.text();
            return htmlText;
        } catch (error) {
            console.error('Failed to load Reclaim popup HTML template:', error);
            return '';
        }
    }

    // Function to inject CSS styles
    function injectStyles() {
        loadCSS();
    }

        // Function to render the initial content
    async function renderInitialContent() {
        const htmlTemplate = await loadHTMLTemplate();
        
        if (!htmlTemplate) {
            console.error('Failed to load HTML template - popup will not render correctly');
            return;
        }
        
        // Replace template placeholders with actual values
        const renderedHTML = htmlTemplate
            .replace(/\{\{logoUrl\}\}/g, chrome.runtime.getURL('assets/img/logo.png'))
            .replace(/\{\{providerName\}\}/g, providerName)
            .replace(/\{\{description\}\}/g, description)
            .replace(/\{\{dataRequired\}\}/g, dataRequired)
            .replace(/\{\{sessionId\}\}/g, sessionId);
        
        popup.innerHTML = renderedHTML;
    }

    // Function to initialize drag functionality
    function initializeDragFunctionality() {
        const header = popup.querySelector('.reclaim-popup-header');
        
        function handleMouseDown(e) {
            // Only allow dragging on left mouse button
            if (e.button !== 0) return;
            
            isDragging = true;
            popup.classList.add('dragging');
            
            // Calculate offset from mouse position to popup top-left corner
            const rect = popup.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            // Prevent text selection while dragging
            e.preventDefault();
            
            // Add global mouse event listeners
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        
        function handleMouseMove(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            
            // Calculate new position
            let newX = e.clientX - dragOffset.x;
            let newY = e.clientY - dragOffset.y;
            
            // Get viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const popupWidth = popup.offsetWidth;
            const popupHeight = popup.offsetHeight;
            
            // Keep popup within viewport bounds
            newX = Math.max(0, Math.min(newX, viewportWidth - popupWidth));
            newY = Math.max(0, Math.min(newY, viewportHeight - popupHeight));
            
            // Update popup position
            popup.style.left = newX + 'px';
            popup.style.top = newY + 'px';
            popup.style.right = 'auto';
            popup.style.bottom = 'auto';
        }
        
        function handleMouseUp(e) {
            if (!isDragging) return;
            
            isDragging = false;
            popup.classList.remove('dragging');
            
            // Remove global mouse event listeners
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
        
        // Add mousedown listener to header (with null check)
        if (header) {
            header.addEventListener('mousedown', handleMouseDown);
            
            // Prevent context menu on header to avoid interference
            header.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }
    }

    // Function to show copy feedback (moved outside for reuse)
    function showCopyFeedback(message, isError = false) {
        const copyFeedback = popup.querySelector('#reclaim-copy-feedback');
        if (copyFeedback) {
            copyFeedback.textContent = message;
            copyFeedback.style.color = isError ? '#ffffff' : '#ffffff';
            copyFeedback.style.background = isError ? 
                'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 
                'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            copyFeedback.classList.add('show');
            
            // Hide feedback after 2 seconds for more compact UX
            setTimeout(() => {
                copyFeedback.classList.remove('show');
            }, 2000);
        }
    }

    // Function to initialize copy functionality
    function initializeCopyFunctionality() {
        const copyFeedback = popup.querySelector('#reclaim-copy-feedback');
        
        // Use event delegation to handle all copy buttons, including dynamically created ones
        popup.addEventListener('click', async (e) => {
            const copyButton = e.target.closest('.reclaim-copy-icon');
            
            if (copyButton) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetId = copyButton.getAttribute('data-copy-target');
                const targetElement = popup.querySelector(`#${targetId}`);
                
                if (targetElement) {
                    try {
                        const textToCopy = targetElement.textContent.trim();
                        
                        console.log('[Reclaim Debug] Copying text:', {
                            targetId: targetId,
                            textLength: textToCopy.length,
                            textPreview: textToCopy.substring(0, 100) + '...'
                        });
                        
                        // Use the Clipboard API if available
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            await navigator.clipboard.writeText(textToCopy);
                            showCopyFeedback('Copied!');
                        } else {
                            // Fallback for older browsers
                            const textArea = document.createElement('textarea');
                            textArea.value = textToCopy;
                            textArea.style.position = 'fixed';
                            textArea.style.left = '-9999px';
                            textArea.style.top = '-9999px';
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();
                            
                            try {
                                const successful = document.execCommand('copy');
                                if (successful) {
                                    showCopyFeedback('Copied!');
                                } else {
                                    showCopyFeedback('Failed to copy', true);
                                }
                            } catch (err) {
                                showCopyFeedback('Failed to copy', true);
                            }
                            
                            document.body.removeChild(textArea);
                        }
                    } catch (err) {
                        console.error('[Reclaim Debug] Copy error:', err);
                        showCopyFeedback('Failed to copy', true);
                    }
                } else {
                    console.error('[Reclaim Debug] Target element not found:', targetId);
                    showCopyFeedback('Failed to copy - element not found', true);
                }
            }
        });
    }

    // Function to initialize tooltip functionality for long text
    function initializeTooltipFunctionality() {
        const infoValues = popup.querySelectorAll('.reclaim-info-value[data-tooltip]');
        
        infoValues.forEach(element => {
            const tooltipText = element.getAttribute('data-tooltip');
            const displayText = element.textContent.trim();
            
            // Only show tooltip if text is truncated
            if (tooltipText && tooltipText.length > 25) {
                let tooltip = null;
                let hoverTimeout = null;
                
                function showTooltip() {
                    if (!tooltip) {
                        tooltip = document.createElement('div');
                        tooltip.className = 'reclaim-info-tooltip';
                        tooltip.textContent = tooltipText;
                        element.appendChild(tooltip);
                    }
                    
                    tooltip.classList.add('show');
                }
                
                function hideTooltip() {
                    if (tooltip) {
                        tooltip.classList.remove('show');
                    }
                }
                
                if (element) {
                    element.addEventListener('mouseenter', () => {
                        clearTimeout(hoverTimeout);
                        hoverTimeout = setTimeout(showTooltip, 500);
                    });
                    
                    element.addEventListener('mouseleave', () => {
                        clearTimeout(hoverTimeout);
                        hideTooltip();
                    });
                    
                    // Also show tooltip on click for mobile
                    element.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (tooltip && tooltip.classList.contains('show')) {
                            hideTooltip();
                        } else {
                            showTooltip();
                        }
                    });
                }
            }
        });
        
        // Hide all tooltips when clicking outside
        document.addEventListener('click', () => {
            const tooltips = popup.querySelectorAll('.reclaim-info-tooltip.show');
            tooltips.forEach(tooltip => {
                tooltip.classList.remove('show');
            });
        });
    }

    // Function to complete loading and show results
    function completeLoading() {
        console.log('[Reclaim Debug] Completing loading process...');
        
        // Clear the loading timer
        if (state.loadingTimer) {
            clearTimeout(state.loadingTimer);
            state.loadingTimer = null;
        }
        
        // Show success state
        showSuccess();
        
        // Show pending ZK proof if available
        if (state.pendingZKProof) {
            console.log('[Reclaim Debug] Showing pending ZK proof after loading...');
            showZKProof(state.pendingZKProof);
            state.pendingZKProof = null; // Clear the pending proof
        }
    }

    // Function to show loader with 4-second loading state
    function showLoader(message = "Verifying, please wait...") {
        const stepsContainer = popup.querySelector('#reclaim-steps-container');
        const statusContainer = popup.querySelector('#reclaim-status-container');
        const circularLoader = popup.querySelector('#reclaim-circular-loader');
        const progressContainer = popup.querySelector('#reclaim-status-progress');
        const statusText = popup.querySelector('#reclaim-status-text');
        const successIcon = popup.querySelector('#reclaim-success-icon');
        const errorIcon = popup.querySelector('#reclaim-error-icon');
        const contentContainer = popup.querySelector('.reclaim-popup-content');
        
        // Hide the steps using CSS classes instead of style manipulation
        if (stepsContainer) {
            stepsContainer.classList.add('hidden');
        }
        
        // Hide status icons
        if (successIcon) {
            successIcon.style.display = 'none';
        }
        if (errorIcon) {
            errorIcon.style.display = 'none';
        }
        
        // Show the status container using CSS classes (with null checks)
        if (statusContainer) {
            statusContainer.classList.add('visible');
        }
        if (contentContainer) {
            contentContainer.classList.add('status-active');
        }
        if (circularLoader) {
            circularLoader.style.display = 'flex';
        }
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
        if (statusText) {
            statusText.textContent = message;
        }
        
        state.inProgress = true;
        state.loadingStartTime = Date.now();
        
        // Clear any existing timer
        if (state.loadingTimer) {
            clearTimeout(state.loadingTimer);
        }
        
        // Set up the 4-second loading timer
        state.loadingTimer = setTimeout(() => {
            completeLoading();
        }, state.loadingDuration);
        
        updateProgressBar();
        
        console.log('[Reclaim Debug] Started 4-second loading process...');
    }

    // Function to update the progress bar
    function updateProgressBar() {
        const progressBar = popup.querySelector('#reclaim-progress-bar');
        const progressCounter = popup.querySelector('#reclaim-progress-counter');
        
        if (progressBar && progressCounter) {
            if (state.totalClaims > 0) {
                const percentage = (state.completedClaims / state.totalClaims);
                // Use transform instead of width to avoid layout recalculations
                progressBar.style.transform = `scaleX(${percentage})`;
                progressCounter.textContent = `${state.completedClaims}/${state.totalClaims}`;
            } else {
                progressBar.style.transform = 'scaleX(1)';
                progressBar.style.animation = 'reclaim-progress-pulse 2s infinite';
                progressCounter.textContent = '';
            }
        }
    }

    // Function to update status message
    function updateStatusMessage(message, isError = false) {
        const statusMessage = popup.querySelector('#reclaim-status-message');
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.style.color = isError ? '#ef4444' : 'rgba(255, 255, 255, 0.8)';
        }
    }

    // Function to show success state
    function showSuccess() {
        const stepsContainer = popup.querySelector('#reclaim-steps-container');
        const statusContainer = popup.querySelector('#reclaim-status-container');
        const circularLoader = popup.querySelector('#reclaim-circular-loader');
        const progressContainer = popup.querySelector('#reclaim-status-progress');
        const statusText = popup.querySelector('#reclaim-status-text');
        const progressBar = popup.querySelector('#reclaim-progress-bar');
        const progressCounter = popup.querySelector('#reclaim-progress-counter');
        const contentContainer = popup.querySelector('.reclaim-popup-content');
        
        // Hide the steps using CSS classes
        if (stepsContainer) {
            stepsContainer.classList.add('hidden');
        }
        
        // Hide circular loader
        circularLoader.style.display = 'none';
        
        // Show success UI
        statusContainer.classList.add('visible');
        contentContainer.classList.add('status-active');
        progressContainer.style.display = 'block';
        statusText.textContent = "Verification complete!";
        
        // Ensure progress bar is fully filled - use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
            progressBar.style.width = '100%';
            progressBar.style.transform = 'scaleX(1)';
            progressBar.classList.add('success');
            progressBar.style.animation = 'none';
        });
        
        // Update progress counter to show completion
        if (state.totalClaims > 0) {
            progressCounter.textContent = `${state.totalClaims}/${state.totalClaims}`;
        } else {
            progressCounter.textContent = '100%';
        }
        
        updateStatusMessage("ZK proof generated and submitted successfully! Verification complete.");
        
        // Show success icon
        const successIcon = popup.querySelector('#reclaim-success-icon');
        const errorIcon = popup.querySelector('#reclaim-error-icon');
        if (successIcon) {
            successIcon.style.display = 'flex';
        }
        if (errorIcon) {
            errorIcon.style.display = 'none';
        }
    }

    // Function to show ZK proof (now with loading delay)
    function showZKProof(proofData) {
        // If we're still in loading state, store the proof to show later
        if (state.inProgress && state.loadingTimer) {
            console.log('[Reclaim Debug] ZK proof received during loading - storing for later display...');
            state.pendingZKProof = proofData;
            return;
        }
        
        console.log('[Reclaim Debug] Showing ZK proof immediately...');
        
        const proofViewer = popup.querySelector('#reclaim-proof-viewer');
        const proofContent = popup.querySelector('#reclaim-proof-content');
        
        if (proofViewer && proofContent) {
            // Format the proof data for display
            let formattedProof;
            if (typeof proofData === 'string') {
                try {
                    // Try to parse and format JSON
                    const parsed = JSON.parse(proofData);
                    formattedProof = JSON.stringify(parsed, null, 2);
                } catch {
                    // If not JSON, display as is
                    formattedProof = proofData;
                }
            } else if (typeof proofData === 'object') {
                formattedProof = JSON.stringify(proofData, null, 2);
            } else {
                formattedProof = String(proofData);
            }
            
            // Set the proof content
            proofContent.textContent = formattedProof;
            
            // Show the proof viewer
            proofViewer.style.display = 'block';
            
            // Verify copy button exists and is properly set up
            const copyButton = proofViewer.querySelector('.reclaim-copy-icon');
            if (copyButton) {
                console.log('[Reclaim Debug] ZK proof copy button found:', {
                    hasDataCopyTarget: !!copyButton.getAttribute('data-copy-target'),
                    targetId: copyButton.getAttribute('data-copy-target'),
                    targetElement: !!popup.querySelector(`#${copyButton.getAttribute('data-copy-target')}`)
                });
                
                // Add a specific click handler for the ZK proof copy button as a fallback
                copyButton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('[Reclaim Debug] ZK proof copy button clicked');
                    
                    try {
                        const textToCopy = proofContent.textContent.trim();
                        
                        console.log('[Reclaim Debug] Copying ZK proof:', {
                            textLength: textToCopy.length,
                            textPreview: textToCopy.substring(0, 100) + '...'
                        });
                        
                        // Use the Clipboard API if available
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            await navigator.clipboard.writeText(textToCopy);
                            showCopyFeedback('ZK Proof Copied!');
                        } else {
                            // Fallback for older browsers
                            const textArea = document.createElement('textarea');
                            textArea.value = textToCopy;
                            textArea.style.position = 'fixed';
                            textArea.style.left = '-9999px';
                            textArea.style.top = '-9999px';
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();
                            
                            try {
                                const successful = document.execCommand('copy');
                                if (successful) {
                                    showCopyFeedback('ZK Proof Copied!');
                                } else {
                                    showCopyFeedback('Failed to copy ZK proof', true);
                                }
                            } catch (err) {
                                showCopyFeedback('Failed to copy ZK proof', true);
                            }
                            
                            document.body.removeChild(textArea);
                        }
                    } catch (err) {
                        console.error('[Reclaim Debug] ZK proof copy error:', err);
                        showCopyFeedback('Failed to copy ZK proof', true);
                    }
                });
                
            } else {
                console.error('[Reclaim Debug] ZK proof copy button not found!');
            }
            
            // Scroll to the proof viewer
            setTimeout(() => {
                proofViewer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
            
            console.log('[Reclaim Debug] ZK proof displayed in popup:', {
                proofLength: formattedProof.length,
                hasCopyButton: !!copyButton,
                hasCopyTarget: !!popup.querySelector('[data-copy-target="reclaim-proof-content"]'),
                proofContentExists: !!proofContent,
                proofContentLength: proofContent.textContent.length
            });
        } else {
            console.error('[Reclaim Debug] ZK proof viewer elements not found:', {
                hasProofViewer: !!proofViewer,
                hasProofContent: !!proofContent
            });
        }
    }

    // Function to show error state
    function showError(errorMessage) {
        // Clear any pending loading timer
        if (state.loadingTimer) {
            clearTimeout(state.loadingTimer);
            state.loadingTimer = null;
        }
        
        const stepsContainer = popup.querySelector('#reclaim-steps-container');
        const statusContainer = popup.querySelector('#reclaim-status-container');
        const circularLoader = popup.querySelector('#reclaim-circular-loader');
        const progressContainer = popup.querySelector('#reclaim-status-progress');
        const statusText = popup.querySelector('#reclaim-status-text');
        const progressBar = popup.querySelector('#reclaim-progress-bar');
        const contentContainer = popup.querySelector('.reclaim-popup-content');
        
        // Hide the steps using CSS classes
        if (stepsContainer) {
            stepsContainer.classList.add('hidden');
        }
        
        // Hide circular loader
        circularLoader.style.display = 'none';
        
        // Show error UI
        statusContainer.classList.add('visible');
        contentContainer.classList.add('status-active');
        progressContainer.style.display = 'block';
        statusText.textContent = "Verification failed";
        progressBar.style.transform = 'scaleX(1)';
        progressBar.classList.add('error');
        progressBar.style.animation = 'none';
        
        updateStatusMessage(errorMessage, true);
        
        // Show error icon
        const errorIcon = popup.querySelector('#reclaim-error-icon');
        const successIcon = popup.querySelector('#reclaim-success-icon');
        if (errorIcon) {
            errorIcon.style.display = 'flex';
        }
        if (successIcon) {
            successIcon.style.display = 'none';
        }
    }

    // Function to increment the total claims count
    function incrementTotalClaims() {
        state.totalClaims += 1;
        updateProgressBar();
    }

    // Function to increment the completed claims count
    function incrementCompletedClaims() {
        state.completedClaims += 1;
        updateProgressBar();
    }

    // Expose the public API for the popup
    return {
        element: popup,
        showLoader,
        updateStatusMessage,
        showSuccess,
        showError,
        showZKProof,
        incrementTotalClaims,
        incrementCompletedClaims,
        
        // Handle various status updates from background
        handleClaimCreationRequested: (requestHash) => {
            incrementTotalClaims();
            showLoader("Verifying, please wait...");
        },
        
        handleClaimCreationSuccess: (requestHash) => {
            updateStatusMessage("Claim created successfully. Verifying...");
        },
        
        handleClaimCreationFailed: (requestHash) => {
            showError("Failed to create claim. Please try again.");
        },
        
        handleProofGenerationStarted: (requestHash) => {
            updateStatusMessage("Verifying cryptographic proof...");
        },
        
        handleProofGenerationSuccess: (requestHash, proofData) => {
            incrementCompletedClaims();
            updateStatusMessage(`ZK proof generated successfully! (${state.completedClaims}/${state.totalClaims})`);
            
            // Show the ZK proof if provided (will be delayed if still loading)
            if (proofData) {
                showZKProof(proofData);
            }
        },
        
        handleProofGenerationFailed: (requestHash) => {
            showError("Failed to generate proof. Please try again.");
        },
        
        handleProofSubmitted: (proofData) => {
            state.proofSubmitted = true;
            
            // Show the ZK proof if provided (will be delayed if still loading)
            if (proofData) {
                showZKProof(proofData);
            }
            
            // Note: showSuccess() will be called by completeLoading() after 4 seconds
        },
        
        handleProofSubmissionFailed: (error) => {
            showError(`Failed to submit proof: ${error}`);
        }
    };
}