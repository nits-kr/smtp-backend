const { Worker } = require('bullmq');
const { redisConnection } = require('../config/redis');
const { transporter } = require('../config/mailer');
const logger = require('../config/logger');

const worker = new Worker(
    "email-queue",
    async (job) => {
        logger.info(`Processing job ${job.id} for ${job.data.to}`);
        const {
            to,
            fromName,
            fromEmail,
            subject,
            html,
            text,
            encoding,
            mime,
            headers
        } = job.data;

        const mailOptions = {
            // FORCE OVERRIDE: consistently use the authenticated email for "from" to avoid 436 errors
            // We append the original "fromName" to the friendly name if needed, or just use the config one.
            // But usually, SMTP servers require the exact authenticated email in the "From" header.
            // We can put the original "sender" in the Reply-To if valid.
            from: `"${fromName || 'Campaign System'}" <${process.env.SMTP_USERNAME || fromEmail}>`,
            to,
            subject,
            encoding,
            replyTo: fromEmail, // Set Reply-To to the original sender so replies go to them
            headers: {
                "X-Mailer": "Campaign-System",
                ...headers
            }
        };

        if (mime) {
            mailOptions.raw = mime;       // MIME MODE
        } else {
            if (html) mailOptions.html = html;
            if (text) mailOptions.text = text;
        }

        try {
            const info = await transporter.sendMail(mailOptions);
            logger.info(`Message sent: ${info.messageId}`);
            return info;
        } catch (error) {
            logger.error(`Error sending email to ${to}: ${error.message}`);
            throw error;
        }
    },
    { connection: redisConnection }
);

const redisPublisher = redisConnection.duplicate();

logger.info('Email worker started');

worker.on('completed', job => {
    logger.info(`Job ${job.id} has completed!`);
    try {
        const payload = {
            event: 'campaign-progress',
            data: {
                campaignId: job.data.campaignId,
                status: 'completed',
                email: job.data.to,
                timestamp: new Date().toISOString()
            }
        };
        redisPublisher.publish('worker-events', JSON.stringify(payload));
    } catch (e) {
        logger.warn(`Redis publish failed for job ${job.id}: ${e.message}`);
    }
});

worker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} has failed with ${err.message}`);
    try {
        const payload = {
            event: 'campaign-progress',
            data: {
                campaignId: job.data.campaignId,
                status: 'failed',
                email: job.data.to,
                error: err.message,
                timestamp: new Date().toISOString()
            }
        };
        redisPublisher.publish('worker-events', JSON.stringify(payload));
    } catch (e) {
        logger.warn(`Redis publish failed for job ${job.id}: ${e.message}`);
    }
});
