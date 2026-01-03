const jwt = require('jsonwebtoken');
// const moment = require('moment');
const config = require('../../core/config');
const Token = require('./models/token.model');
const { tokenTypes } = require('../../core/config/tokens');

// Since moment is not installed, I'll use standard Date
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
    const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(expires.getTime() / 1000),
        type,
    };
    return jwt.sign(payload, secret);
};

const saveToken = async (token, userId, expires, type, blacklisted = false) => {
    const tokenDoc = await Token.create({
        token,
        user: userId,
        expires: expires.toDate ? expires.toDate() : expires,
        type,
        blacklisted,
    });
    return tokenDoc;
};

const verifyToken = async (token, type) => {
    const payload = jwt.verify(token, config.jwt.secret);
    const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
    if (!tokenDoc) {
        throw new Error('Token not found');
    }
    return tokenDoc;
};

const generateAuthTokens = async (user) => {
    const accessTokenExpires = new Date(Date.now() + config.jwt.accessExpirationMinutes * 60 * 1000);
    const accessToken = generateToken(user.id, accessTokenExpires, 'access');

    const refreshTokenExpires = new Date(Date.now() + config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000);
    const refreshToken = generateToken(user.id, refreshTokenExpires, 'refresh');
    await saveToken(refreshToken, user.id, refreshTokenExpires, 'refresh');

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires,
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires,
        },
    };
};

module.exports = {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthTokens,
};
