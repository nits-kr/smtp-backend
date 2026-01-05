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
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            encoding,
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

const { getIo } = require('../core/socket');

logger.info('Email worker started');

worker.on('completed', job => {
    logger.info(`Job ${job.id} has completed!`);
    try {
        const io = getIo();
        io.emit('campaign-progress', {
            campaignId: job.data.campaignId,
            status: 'completed',
            email: job.data.to,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        // Socket might not be initialized if worker runs separately or early
        logger.warn(`Socket emit failed for job ${job.id}: ${e.message}`);
    }
});

worker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} has failed with ${err.message}`);
    try {
        const io = getIo();
        io.emit('campaign-progress', {
            campaignId: job.data.campaignId,
            status: 'failed',
            email: job.data.to,
            error: err.message,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        logger.warn(`Socket emit failed for job ${job.id}: ${e.message}`);
    }
});
