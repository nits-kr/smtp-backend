const admin = require('firebase-admin');
const config = require('./config');
const logger = require('./logger');

let firebaseInitialized = false;

try {
    // Check if service account key exists or env vars are set
    // This is a placeholder. In a real app, strict checks would be here.
    // For now, we try to initialize with default credentials (likely failing locally without setup)
    // or a specific file if present.

    // Check for environment variables first
    if (config.firebase.projectId && config.firebase.clientEmail && config.firebase.privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: config.firebase.projectId,
                clientEmail: config.firebase.clientEmail,
                privateKey: config.firebase.privateKey.replace(/\\n/g, '\n') // Handle escaped newlines
            })
        });
        firebaseInitialized = true;
        logger.info('Firebase Admin initialized successfully using environment variables');
    } else {
        // Fallback to service account file
        const serviceAccountPath = config.firebase.serviceAccountPath;
        let serviceAccount;
        try {
            serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            firebaseInitialized = true;
            logger.info('Firebase Admin initialized successfully using service account file');
        } catch (e) {
            logger.warn(`Firebase Service Account not found or invalid. Notification features will be disabled. Error: ${e.message}`);
        }
    }

} catch (error) {
    logger.error('Error initializing Firebase Admin:', error);
}

module.exports = {
    admin,
    firebaseInitialized: () => firebaseInitialized
};
