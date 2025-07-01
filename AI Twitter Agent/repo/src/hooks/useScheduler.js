import { useState, useEffect } from 'react';
import WebScheduler from '../services/scheduler/webScheduler';

const useScheduler = () => {
  const [scheduler] = useState(new WebScheduler());
  const [activeSchedules, setActiveSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const schedules = await scheduler.getActiveSchedules();
      setActiveSchedules(schedules);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const createSchedule = async (name, intervalMinutes, callback) => {
    setLoading(true);
    try {
      await scheduler.scheduleRepeating(name, intervalMinutes, callback);
      await loadSchedules();
      return { success: true };
    } catch (error) {
      console.error('Error creating schedule:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const cancelSchedule = async (name) => {
    setLoading(true);
    try {
      await scheduler.cancelSchedule(name);
      await loadSchedules();
      return { success: true };
    } catch (error) {
      console.error('Error canceling schedule:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const cancelAllSchedules = async () => {
    setLoading(true);
    try {
      await scheduler.cancelAll();
      await loadSchedules();
      return { success: true };
    } catch (error) {
      console.error('Error canceling all schedules:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    scheduler,
    activeSchedules,
    loading,
    createSchedule,
    cancelSchedule,
    cancelAllSchedules,
    loadSchedules
  };
};

export default useScheduler;