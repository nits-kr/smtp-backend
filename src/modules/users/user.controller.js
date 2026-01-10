const httpStatus = require('http-status');
const catchAsync = require('../../core/catchAsync');
const userService = require('./user.service');
const ApiError = require('../../core/ApiError');
const pick = require('../../core/utils/pick');

const createUser = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    res.status(httpStatus.CREATED).send(user);
});

const getUser = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    // Basic Tenant Isolation Check
    if (req.user.tenantId && !req.user.tenantId.equals(user.tenantId)) {
        // Allow if system admin, otherwise deny
        // For now, simpler check:
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }
    res.send(user);
});

const getUsers = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'role']);
    if (req.query.search) {
        filter['$or'] = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
        ];
    }
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    options.page = parseInt(options.page, 10) || 1;
    options.limit = parseInt(options.limit, 10) || 10;

    const result = await userService.queryUsers(filter, options);
    res.send(result);
});

module.exports = {
    createUser,
    getUser,
    getUsers,
};
