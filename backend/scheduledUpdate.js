const cron = require('node-cron');
const { updatePostcodeDatabase } = require('./updatePostcodes');
const fs = require('fs').promises;
const path = require('path');

/**
 * Scheduled Postcode Database Updater
 * 
 * This script sets up a cron job to regularly update the postcode database 
 * with the latest information from official sources.
 */

// Configuration
const CONFIG = {
  // Schedule: By default, run once a month (on the 1st at 3:00 AM)
  scheduleCron: '0 3 1 * *',
  
  // Log file path
  logFile: path.join(__dirname, 'update_logs.json'),
  
  // Max number of log entries to keep
  maxLogEntries: 50
};

/**
 * Log the update results
 */
async function logUpdateResult(success, message) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, success, message };
  
  try {
    // Load existing logs
    let logs = [];
    try {
      const logData = await fs.readFile(CONFIG.logFile, 'utf8');
      logs = JSON.parse(logData);
    } catch (error) {
      // If file doesn't exist or is invalid, start with empty logs
      logs = [];
    }
    
    // Add new entry
    logs.unshift(logEntry);
    
    // Trim logs to max size
    if (logs.length > CONFIG.maxLogEntries) {
      logs = logs.slice(0, CONFIG.maxLogEntries);
    }
    
    // Save logs
    await fs.writeFile(CONFIG.logFile, JSON.stringify(logs, null, 2), 'utf8');
    
    console.log(`[${timestamp}] Update log saved.`);
  } catch (error) {
    console.error('Error saving update log:', error);
  }
}

/**
 * Run the update process
 */
async function runUpdate() {
  console.log(`Starting scheduled update at ${new Date().toISOString()}`);
  
  try {
    const success = await updatePostcodeDatabase();
    
    if (success) {
      await logUpdateResult(true, 'Postcode database updated successfully');
      console.log('Update completed successfully');
    } else {
      await logUpdateResult(false, 'Postcode database update failed');
      console.error('Update failed');
    }
  } catch (error) {
    await logUpdateResult(false, `Error during update: ${error.message}`);
    console.error('Unhandled error during update:', error);
  }
}

/**
 * Schedule the update job
 */
function scheduleUpdateJob() {
  console.log(`Scheduling postcode database updates with cron pattern: ${CONFIG.scheduleCron}`);
  
  cron.schedule(CONFIG.scheduleCron, runUpdate, {
    scheduled: true,
    timezone: 'Australia/Sydney' // Use appropriate timezone
  });
  
  console.log('Update job scheduled successfully.');
  console.log(`Next update will run at the specified schedule: ${CONFIG.scheduleCron}`);
  console.log('For monthly updates, this is at 3:00 AM on the 1st of each month.');
}

// Schedule the job when the script starts
scheduleUpdateJob();

// Also immediately run an update if requested via command line argument
if (process.argv.includes('--update-now')) {
  console.log('Running immediate update due to --update-now flag');
  runUpdate();
}

// Log startup
console.log(`Scheduled update service started at ${new Date().toISOString()}`);
console.log('Press Ctrl+C to stop the service');

// Keep process alive
process.stdin.resume();

// Export functions for potential use in other parts of the application
module.exports = {
  runUpdate,
  scheduleUpdateJob
};
