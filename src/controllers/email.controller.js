const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { emailService } = require('../services');

const createEmail = catchAsync(async (req, res) => {
    const email = await emailService.createEmail(req.body);
    res.status(httpStatus.CREATED).send(email);
});

const getEmails = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['from', 'to']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await emailService.queryEmails(filter, options);
    res.send(result);
});

module.exports = {
    createEmail,
    getEmails,
};
