/* global chrome */
class WebScheduler {
  constructor() {
    this.isExtension = typeof chrome !== 'undefined' && chrome.alarms;
    this.intervals = new Map();
  }

  async scheduleRepeating(name, intervalMinutes, callback) {
    if (this.isExtension) {
      // Use Chrome alarms for extension
      chrome.alarms.create(name, {
        delayInMinutes: 1,
        periodInMinutes: intervalMinutes
      });
      
      // Listen for alarms
      if (!chrome.alarms.onAlarm.hasListener(this.handleAlarm)) {
        chrome.alarms.onAlarm.addListener(this.handleAlarm);
      }
      
      // Store callback
      this.intervals.set(name, callback);
    } else {
      // Use setInterval for web app
      const intervalId = setInterval(callback, intervalMinutes * 60 * 1000);
      this.intervals.set(name, {
        intervalId,
        callback
      });
    }
  }

  async cancelSchedule(name) {
    if (this.isExtension) {
      chrome.alarms.clear(name);
      this.intervals.delete(name);
    } else {
      const interval = this.intervals.get(name);
      if (interval && interval.intervalId) {
        clearInterval(interval.intervalId);
        this.intervals.delete(name);
      }
    }
  }

  async cancelAll() {
    if (this.isExtension) {
      chrome.alarms.clearAll();
    } else {
      this.intervals.forEach((interval, name) => {
        if (interval.intervalId) {
          clearInterval(interval.intervalId);
        }
      });
    }
    this.intervals.clear();
  }

  handleAlarm = (alarm) => {
    const callback = this.intervals.get(alarm.name);
    if (callback && typeof callback === 'function') {
      callback();
    }
  };

  async getActiveSchedules() {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.alarms.getAll((alarms) => {
          resolve(alarms.map(alarm => ({
            name: alarm.name,
            scheduledTime: alarm.scheduledTime,
            periodInMinutes: alarm.periodInMinutes
          })));
        });
      });
    } else {
      return Array.from(this.intervals.keys()).map(name => ({
        name,
        active: true
      }));
    }
  }
}

export default WebScheduler;