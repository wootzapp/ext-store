// Throttle implementation for rate limiting API calls
const createThrottledQueue = (maxRequestsPerInterval, interval, shouldSpaceEvenly = false) => {
  const queue = [];
  let lastExecutionTime = Date.now();
  let executionsThisInterval = 0;
  let timeoutId = null;

  const processQueue = () => {
    const now = Date.now();
    const timeElapsedSinceLastExecution = now - lastExecutionTime;

    // Reset counter if interval has passed
    if (timeElapsedSinceLastExecution >= interval) {
      executionsThisInterval = 0;
      lastExecutionTime = now;
    }

    // Process as many items as we can
    while (queue.length > 0 && executionsThisInterval < maxRequestsPerInterval) {
      const nextItem = queue.shift();
      
      try {
        Promise.resolve(nextItem.fn())
          .then(nextItem.resolve)
          .catch(nextItem.reject);
      } catch (error) {
        nextItem.reject(error);
      }
      
      executionsThisInterval++;
      
      if (shouldSpaceEvenly && queue.length > 0) {
        lastExecutionTime = now;
        const delay = interval / maxRequestsPerInterval;
        setTimeout(processQueue, delay);
        return;
      }
    }

    // If there are still items in the queue, schedule next processing
    if (queue.length > 0) {
      const timeUntilNextInterval = interval - timeElapsedSinceLastExecution;
      timeoutId = setTimeout(processQueue, Math.max(0, timeUntilNextInterval));
    } else {
      timeoutId = null;
    }
  };

  return (fn) => {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      
      if (!timeoutId) {
        processQueue();
      }
    });
  };
};

// Create and export the throttle instance
const throttle = createThrottledQueue(5, 1000, true);
export { throttle as default }; 