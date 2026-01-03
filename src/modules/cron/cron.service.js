const cron = require('node-cron');
const logger = require('../../core/logger');
const Email = require('../email/models/email.model');
// const emailService = require('../email/email.service'); // Circular dependency risk if not careful, but okay here.

// Task 1: Spam Detection (Runs every 10 minutes)
const spamDetectionJob = cron.schedule('*/10 * * * *', async () => {
    logger.info('Running Spam Detection Job...');
    try {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const failedCount = await Email.countDocuments({
            status: 'failed',
            updatedAt: { $gte: tenMinutesAgo }
        });

        if (failedCount > 50) { // Threshold
            logger.warn(`HIGH FAILURE RATE DETECTED: ${failedCount} failures in last 10 mins. Pausing system or alerting admin.`);
            // Logic to pause system or block tenant could go here
            // e.g. await configService.set('SYSTEM_PAUSED', true);
        }
    } catch (error) {
        logger.error(`Spam Detection Job Failed: ${error.message}`);
    }
});

// Task 2: Send Scheduled Emails (Runs every 1 minute)
const sendScheduledEmailsJob = cron.schedule('* * * * *', async () => {
    logger.info('Running Scheduled Emails Job...');
    // Implementation would fetch emails with status='scheduled' and scheduledAt <= now
    // And call emailService.sendEmail()
    // For now logging placeholder as no actual scheduling UI exists yet
});

const initCronJobs = () => {
    spamDetectionJob.start();
    sendScheduledEmailsJob.start();
    logger.info('Cron Jobs Initialized');
};

module.exports = {
    initCronJobs
};
