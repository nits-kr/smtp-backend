const express = require('express');
const auth = require('../../modules/auth/middlewares/auth.middleware');
const permissionGuard = require('../../modules/auth/middlewares/permissionGuard.middleware');
const validate = require('../../core/middlewares/validate');
const userValidation = require('./user.validation');
const userController = require('./user.controller');

const router = express.Router();

router.post('/createSubuser', auth(), permissionGuard('manageUsers'), validate(userValidation.createUser), userController.createUser);

router
    .route('/')
    // .post(auth(), permissionGuard('manageUsers'), validate(userValidation.createUser), userController.createUser) // Moved to /createSubuser
    .get(auth(), permissionGuard('getUsers'), userController.getUsers); // Assuming a getUsers exists or will exist, keeping structure clean

router
    .route('/:userId')
    .get(auth(), userController.getUser);

module.exports = router;
