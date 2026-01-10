const Joi = require('joi');
const { password } = require('../../core/utils/pick'); // Wait, password validator? I'll just use string().min(8)

const register = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required().min(8),
        name: Joi.string().required(),
        phone: Joi.string().allow('', null),
        company: Joi.string().allow('', null),
        jobTitle: Joi.string().allow('', null),
        role: Joi.string().valid('user', 'admin').default('user'),
    }),
};

const login = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
    }),
};

const logout = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

const refreshTokens = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

module.exports = {
    register,
    login,
    logout,
    refreshTokens,
};
