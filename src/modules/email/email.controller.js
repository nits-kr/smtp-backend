const httpStatus = require('http-status');
const catchAsync = require('../../core/catchAsync');
const emailService = require('./email.service');
const pick = require('../../core/utils/pick');

const sendEmail = catchAsync(async (req, res) => {
    const { to, subject, text, html } = req.body;
    // TODO: Add validation that 'to' matches allowed domains or limit spam
    await emailService.sendEmail(to, subject, text, html);
    res.status(httpStatus.NO_CONTENT).send();
});

const getEmails = catchAsync(async (req, res) => {
    // Implement listing emails from DB
    res.send([]);
});

module.exports = {
    sendEmail,
    getEmails
};
