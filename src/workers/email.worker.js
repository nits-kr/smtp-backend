const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const connectDB = require('../core/db');
const { redisConnection } = require('../config/redis');
const { transporter } = require('../config/mailer');
const logger = require('../config/logger');

// Connect to MongoDB
connectDB();


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
            headers,
            campaignId
        } = job.data;

        // --- TRACKING LOGIC START ---
        const trackingId = require('crypto').randomUUID();
        const { Email } = require('../models');

        // Create Email document for tracking
        let emailDoc;
        try {
            emailDoc = await Email.create({
                to,
                from: fromEmail,
                subject,
                body: html || text || 'MIME Content',
                trackingId,
                campaignId: campaignId || null, // Ensure your Email model has this field if you want to link them
                status: 'processing'
            });
        } catch (dbError) {
            logger.error(`Failed to create Email doc for tracking: ${dbError.message}`);
            // Proceed without tracking if DB fails? Or fail job? 
            // We'll proceed but tracking won't work for this email.
        }

        let finalHtml = html;
        const appUrl = process.env.APP_URL || 'http://localhost:3000'; // Default fallback

        if (finalHtml) {
            // 1. Inject Open Pixel
            const openPixel = `<img src="${appUrl}/v1/track/open/${trackingId}" alt="" width="1" height="1" style="display:none" />`;
            if (finalHtml.includes('</body>')) {
                finalHtml = finalHtml.replace('</body>', `${openPixel}</body>`);
            } else {
                finalHtml += openPixel;
            }

            // 2. Wrap Links for Click Tracking
            // Simple regex to find hrefs. 
            // Note: This is a basic implementation. Complex HTML might need a parser, but Cheerio isn't installed.
            finalHtml = finalHtml.replace(/href=["'](http[^"']+)["']/g, (match, url) => {
                const encodedUrl = encodeURIComponent(url);
                return `href="${appUrl}/v1/track/click/${trackingId}?url=${encodedUrl}"`;
            });
        }
        // --- TRACKING LOGIC END ---

        const mailOptions = {
            from: `"${fromName || 'Campaign System'}" <${process.env.SMTP_USERNAME || fromEmail}>`,
            to,
            subject,
            encoding,
            replyTo: fromEmail,
            headers: {
                "X-Mailer": "Campaign-System",
                "X-Tracking-ID": trackingId,
                ...headers
            }
        };

        if (mime) {
            mailOptions.raw = mime;
        } else {
            if (finalHtml) mailOptions.html = finalHtml;
            if (text) mailOptions.text = text;
        }

        try {
            const info = await transporter.sendMail(mailOptions);
            logger.info(`Message sent: ${info.messageId}`);

            // Update status to sent
            if (emailDoc) {
                await Email.findByIdAndUpdate(emailDoc._id, { status: 'sent', messageId: info.messageId });
            }

            return info;
        } catch (error) {
            logger.error(`Error sending email to ${to}: ${error.message}`);

            // Update status to failed
            if (emailDoc) {
                await Email.findByIdAndUpdate(emailDoc._id, { status: 'failed', error: error.message });
            }
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
