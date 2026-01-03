const admin = require('firebase-admin');
const config = require('./config');
const logger = require('./logger');

const initializeFirebase = () => {
    try {
        if (config.firebase.projectId) {
            // Use environment variables if available
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: config.firebase.projectId,
                    clientEmail: config.firebase.clientEmail,
                    privateKey: config.firebase.privateKey.replace(/\\n/g, '\n'),
                }),
            });
            logger.info('Firebase initialized with Environment Variables');
        } else {
            // Fallback to service account file
            const serviceAccount = require(config.firebase.serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            logger.info('Firebase initialized with Service Account File');
        }
    } catch (error) {
        logger.warn(`Firebase initialization failed: ${error.message}`);
    }
};

module.exports = {
    initializeFirebase,
    admin
};
