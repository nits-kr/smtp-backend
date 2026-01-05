const mongoose = require('mongoose');
const { app, server } = require('./app'); // app now exports { app, server }
const config = require('./core/config');
const logger = require('./core/logger');
const connectDB = require('./core/db');
const { initializeFirebase } = require('./core/firebase');
const { initCronJobs } = require('./modules/cron/cron.service');

// Connect to MongoDB
// connectDB(); // Moved to inside startServer

// Initialize Firebase
initializeFirebase();

// Initialize Cron Jobs
initCronJobs();

let httpServer;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Server is already created in app.js for socket.io
        httpServer = server.listen(config.port, () => {
            logger.info(`Listening to port ${config.port}`);
        });
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
};

startServer();

const exitHandler = () => {
    if (httpServer) {
        httpServer.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (httpServer) {
        httpServer.close();
    }
});
