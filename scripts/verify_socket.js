const { io } = require("socket.io-client");
const logger = require('../src/core/logger');

// Suppress console transport to keep output clean, relying on file or filtered output if needed.
// But we want to see it in terminal, so we keep it.

const verifySocket = () => {
    logger.info('Attempting to connect to socket server at http://localhost:3000...');
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
        logger.info(`CLIENT: Connected with ID: ${socket.id}`);

        // Wait a bit to ensure server logs processed (although they happen on connect)
        setTimeout(() => {
            logger.info('CLIENT: Disconnecting...');
            socket.disconnect();
            logger.info('CLIENT: Verification Script Finished.');
            process.exit(0);
        }, 1000);
    });

    socket.on("connect_error", (err) => {
        logger.error(`CLIENT: Connection error: ${err.message}`);
        process.exit(1);
    });
};

verifySocket();
