const express = require('express');
const campaignController = require('../../controllers/campaign.controller');

const router = express.Router();

router
    .route('/send')
    .post(campaignController.createCampaign);

router
    .route('/')
    .get(campaignController.getCampaigns);

module.exports = router;
