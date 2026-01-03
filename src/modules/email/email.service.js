const nodemailer = require('nodemailer');
const config = require('../../core/config');
const logger = require('../../core/logger');
const Email = require('./models/email.model');
const { getIo } = require('../../core/socket');
const { admin, initializeFirebase } = require('../../core/firebase');

const transport = nodemailer.createTransport(config.email.smtp);

/* istanbul ignore next */
if (config.env !== 'test') {
    transport
        .verify()
        .then(() => logger.info('Connected to email server'))
        .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} html (optional)
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html = '') => {
    const msg = { from: config.email.from, to, subject, text, html };
    await transport.sendMail(msg);

    // Save to DB as sent
    await Email.create({
        from: config.email.from,
        to,
        subject,
        body: text || html, // Simplified body storage
        status: 'sent',
        sentAt: new Date()
    });
};

/**
 * Create/Receive a email (legacy support for inbound simulation)
 * @param {Object} emailBody
 * @returns {Promise<Email>}
 */
const createEmail = async (emailBody) => {
    const email = await Email.create(emailBody);

    // 1. Emit Socket.IO event
    try {
        const io = getIo();
        io.emit('new_email', email);
        logger.info(`Socket.IO: Emitted new_email event for email ${email.id}`);
    } catch (error) {
        logger.warn(`Socket.IO Error: ${error.message}`);
    }

    // 2. Send Firebase Notification
    try {
        // Ensure firebase is initialized or just use admin if already done in app.js
        if (admin.apps.length > 0) {
            const message = {
                notification: {
                    title: `New Email from ${email.from}`,
                    body: email.subject,
                },
                topic: 'all_users',
                data: {
                    emailId: email.id.toString(),
                }
            };
            const response = await admin.messaging().send(message);
            logger.info(`Firebase: Notification sent successfully: ${response}`);
        }
    } catch (error) {
        logger.warn(`Firebase Error: ${error.message}`);
    }

    return email;
};

module.exports = {
    transport,
    sendEmail,
    createEmail
};
