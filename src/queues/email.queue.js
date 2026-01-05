const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');

const emailQueue = new Queue("email-queue", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000
        },
        removeOnComplete: true,
        removeOnFail: false
    },
    limiter: {
        max: 50,          // 50 emails
        duration: 60000   // per minute
    }
});

module.exports = { emailQueue };
