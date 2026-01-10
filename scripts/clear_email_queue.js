const { Queue } = require('bullmq');
const { redisConnection } = require('../src/config/redis');
const logger = require('../src/config/logger');

const emailQueue = new Queue("email-queue", { connection: redisConnection });

async function clearQueue() {
    console.log('Clearing email queue...');
    try {
        await emailQueue.obliterate({ force: true });
        console.log('Email queue obliterated successfully.');
    } catch (error) {
        console.error('Error clearing queue:', error);
    } finally {
        await emailQueue.close();
        process.exit(0);
    }
}

clearQueue();
