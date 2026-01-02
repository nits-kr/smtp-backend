const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoose.url, {
            // These options are no longer needed in Mongoose 6+, but good to be explicit if using older versions or specific needs
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
