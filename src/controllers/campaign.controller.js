const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { campaignService } = require('../services');

const createCampaign = catchAsync(async (req, res) => {
    const campaign = await campaignService.sendCampaign(req.body);
    // res.status(httpStatus.CREATED).send({ success: true, message: "Campaign queued successfully" });
    res.status(201).send({ success: true, message: "Campaign queued successfully", campaign });
});

const getCampaigns = catchAsync(async (req, res) => {
    const campaigns = await campaignService.getCampaigns();
    res.send({ results: campaigns, message: "Campaigns fetched successfully", success: true });
});

const getCampaignStats = catchAsync(async (req, res) => {
    const stats = await campaignService.getCampaignStats(req.params.id);
    res.send({ success: true, data: stats });
});

module.exports = {
    createCampaign,
    getCampaigns,
    getCampaignStats
};
