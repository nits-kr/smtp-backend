const express = require('express');
const auth = require('../../modules/auth/middlewares/auth.middleware');
const emailController = require('./email.controller');

const router = express.Router();

router.post('/send', auth(), emailController.sendEmail);
router.get('/', auth(), emailController.getEmails);

module.exports = router;
