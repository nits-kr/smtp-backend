const nodemailer = require('nodemailer');
const config = require('./config');

const transporter = nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: false, // true for 465, false for other ports
    auth: {
        user: config.email.smtp.auth.user,
        pass: config.email.smtp.auth.pass,
    },
    pool: true,          // reuse connections
    maxConnections: 5,   // avoid SMTP ban
    maxMessages: 100     // rotate connections
});

module.exports = { transporter };
