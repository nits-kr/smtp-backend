const Joi = require('joi');

const createUser = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required().min(8),
        name: Joi.string().required(),
        role: Joi.string().valid('user', 'admin', 'subuser').default('user'), // Explicitly allow proper roles
        permissions: Joi.array().items(Joi.string()), // Allow permissions
        phone: Joi.string().allow('', null),
        company: Joi.string().allow('', null),
        jobTitle: Joi.string().allow('', null),
        photo: Joi.string().allow('', null), // If they send base64 or just want to skip
    }),
};

const getUser = {
    params: Joi.object().keys({
        userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // Valid ObjectId
    }),
};

module.exports = {
    createUser,
    getUser,
};
