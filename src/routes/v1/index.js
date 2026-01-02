const express = require('express');
const healthController = require('../../controllers/health.controller');

const emailRoute = require('./email.route');

const router = express.Router();

router.get('/health', healthController.getHealth);
router.use('/emails', emailRoute);

module.exports = router;
