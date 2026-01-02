const httpStatus = require('http-status');
const { Email } = require('../models');
const ApiError = require('../utils/ApiError');
const { getIo } = require('../utils/socket');
const { admin, firebaseInitialized } = require('../config/firebase');
const logger = require('../config/logger');

/**
 * Create a email
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
        logger.error(`Socket.IO Error: ${error.message}`);
    }

    // 2. Send Firebase Notification
    if (firebaseInitialized()) {
        try {
            const message = {
                notification: {
                    title: `New Email from ${email.from}`,
                    body: email.subject,
                },
                topic: 'all_users', // Subscribed topic
                data: {
                    emailId: email.id,
                }
            };

            const response = await admin.messaging().send(message);
            logger.info(`Firebase: Notification sent successfully: ${response}`);
        } catch (error) {
            logger.error(`Firebase Error: ${error.message}`);
        }
    }

    return email;
};

/**
 * Query for emails
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryEmails = async (filter, options) => {
    const emails = await Email.find(filter);
    return emails;
};

/**
 * Get email by id
 * @param {ObjectId} id
 * @returns {Promise<Email>}
 */
const getEmailById = async (id) => {
    return Email.findById(id);
};

module.exports = {
    createEmail,
    queryEmails,
    getEmailById,
};
