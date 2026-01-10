const express = require('express');
const validate = require('../../core/middlewares/validate');
const authValidation = require('./auth.validation');
const authController = require('./auth.controller');

const { upload } = require('../../core/middlewares/upload');

const router = express.Router();

router.post('/register', upload.single('photo'), validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);

module.exports = router;
