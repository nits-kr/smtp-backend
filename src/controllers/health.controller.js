const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const getHealth = catchAsync(async (req, res) => {
    res.status(httpStatus.OK).send({ status: 'UP' });
});

module.exports = {
    getHealth,
};
