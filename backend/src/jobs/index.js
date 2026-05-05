const setupGenerateTagihan = require('./generateTagihan');
const setupSendReminder = require('./sendReminder');

// Initialize all cron jobs
setupGenerateTagihan();
setupSendReminder();

console.log('✅ All cron jobs initialized');
