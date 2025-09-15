import cron from 'node-cron';
import { checkNewPropertiesAndNotify } from './propertyNotifier.js';

// Schedule the task to run once every day at 1:00 AM
const scheduledJobs = () => {
  cron.schedule('0 1 * * *', checkNewPropertiesAndNotify, {
    scheduled: true,
    timezone: "Asia/Kathmandu"
  });
};

export default scheduledJobs;