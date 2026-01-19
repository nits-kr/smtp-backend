const express = require('express');
const trackingController = require('../../controllers/tracking.controller');

const router = express.Router();

router.get('/open/:trackingId', trackingController.trackOpen);
router.get('/click/:trackingId', trackingController.trackClick);

module.exports = router;
