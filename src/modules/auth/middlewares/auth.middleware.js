const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const config = require('../../../core/config');
const ApiError = require('../../../core/ApiError');
const { tokenTypes } = require('../../../core/config/tokens');
const User = require('../../users/models/user.model');

const auth = () => async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
        }

        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, config.jwt.secret);

        if (payload.type !== tokenTypes.ACCESS) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
        }

        const user = await User.findById(payload.sub).populate({
            path: 'roles',
            populate: { path: 'permissions' }
        });

        if (!user) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
        }

        req.user = user;
        next();
    } catch (error) {
        next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
};

module.exports = auth;
