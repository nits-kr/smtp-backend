const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const connectDB = require('./config/db');

let server;
const startServer = (port) => {
    server = app.listen(port, () => {
        logger.info(`Listening to port ${port}`);

        // Initialize Socket.IO
        const { initSocket } = require('./utils/socket');
        const io = initSocket(server);
        logger.info('Socket.IO initialized successfully');
        io.on('connection', (socket) => {
            logger.info('Socket.IO client connected');
            socket.on('disconnect', () => {
                logger.info('Socket.IO client disconnected');
            });
        });
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            logger.info(`Port ${port} is currently in use, retrying with port ${port + 1}...`);
            startServer(port + 1);
        } else {
            logger.error(err);
        }
    });
};

connectDB().then(() => {
    startServer(config.port);
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
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
    if (server) {
        server.close();
    }
});
