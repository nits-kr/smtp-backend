const httpStatus = require('http-status');
const catchAsync = require('../../core/catchAsync');

// Alternatively require explicit paths to avoid circular dep issues in index
const authServiceInstance = require('./auth.service');
const userServiceInstance = require('../users/user.service');
const tokenServiceInstance = require('./token.service');

const register = catchAsync(async (req, res) => {
    const user = await userServiceInstance.createUser(req.body);
    const tokens = await tokenServiceInstance.generateAuthTokens(user);
    res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await authServiceInstance.loginUserWithEmailAndPassword(email, password);
    const tokens = await tokenServiceInstance.generateAuthTokens(user);
    res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
    await authServiceInstance.logout(req.body.refreshToken);
    res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
    const tokens = await authServiceInstance.refreshAuth(req.body.refreshToken);
    res.send({ ...tokens });
});

module.exports = {
    register,
    login,
    logout,
    refreshTokens,
};
