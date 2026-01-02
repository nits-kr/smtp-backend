const express = require('express');
const validate = require('../../middlewares/validate');
// Note: In a real app, define validation schema in src/validations
// For now, skipping validation middleware or using generic
const emailController = require('../../controllers/email.controller');

const router = express.Router();

router
    .route('/')
    .post(emailController.createEmail)
    .get(emailController.getEmails);

module.exports = router;
