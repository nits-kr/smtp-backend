const express = require('express');
const auth = require('../../modules/auth/middlewares/auth.middleware');
const permissionGuard = require('../../modules/auth/middlewares/permissionGuard.middleware');
const validate = require('../../core/middlewares/validate');
// const userValidation = require('./user.validation'); // Skipping for brevity, would be similar to auth
const userController = require('./user.controller');

const router = express.Router();

router
    .route('/')
    .post(auth(), permissionGuard('manageUsers'), userController.createUser); // Only admins

router
    .route('/:userId')
    .get(auth(), userController.getUser);

module.exports = router;
