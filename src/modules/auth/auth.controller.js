const httpStatus = require('http-status');
const catchAsync = require('../../core/catchAsync');

// Alternatively require explicit paths to avoid circular dep issues in index
const authServiceInstance = require('./auth.service');
const userServiceInstance = require('../users/user.service');
const tokenServiceInstance = require('./token.service');

const register = catchAsync(async (req, res) => {
    console.log('Register Request Body:', req.body);
    console.log('Register Request Type:', req.headers['content-type']);
    const userData = { ...req.body };
    if (req.file) {
        console.log('File detected:', req.file.mimetype);
        userData.photo = req.file.buffer;
        userData.photoContentType = req.file.mimetype;
    }
    const user = await userServiceInstance.createUser(userData);
    const tokens = await tokenServiceInstance.generateAuthTokens(user);
    res.status(201).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await authServiceInstance.loginUserWithEmailAndPassword(email, password);
    const tokens = await tokenServiceInstance.generateAuthTokens(user);
    res.status(200).send({
        code: 200,
        message: 'Login successful',
        user,
        tokens
    });
});

const logout = catchAsync(async (req, res) => {
    await authServiceInstance.logout(req.body.refreshToken);
    res.status(204).send();
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
