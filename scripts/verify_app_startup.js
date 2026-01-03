const { app } = require('../src/app');
const logger = require('../src/core/logger');

async function testStartup() {
    try {
        logger.info('App loaded successfully!');
        // If we reached here, app.js executed without throwing PathError
        process.exit(0);
    } catch (error) {
        logger.error(`Startup Test Failed: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

testStartup();
