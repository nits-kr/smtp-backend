const { emailQueue } = require('../queues/email.queue');

const sendCampaign = async (campaign) => {
    let {
        recipients,
        recipientsText,
        name,
        senderName,
        fromName,
        fromEmail,
        subject,
        html,
        body,
        text,
        encoding,
        mime
    } = campaign;

    // Map frontend fields to internal if internal are missing
    if (!html && body) html = body;

    // Resolve fromName: Priority = fromName (explicit) > senderName > name (campaign name)
    // If senderName is present (even if derived from empty string in some contexts, but here check value), use it.
    // User payload had senderName: "" and name: "AI Product". Probably want "AI Product" as fallback.
    if (!fromName) {
        if (senderName && senderName.trim().length > 0) {
            fromName = senderName;
        } else {
            fromName = name;
        }
    }

    // Parse recipients from text area if array not provided
    if (!recipients && recipientsText) {
        recipients = recipientsText
            .split(/[\n,;]+/) // split by newline, comma, semicolon
            .map(e => e.trim())
            .filter(e => e); // remove empty strings
    }

    // Save campaign to database
    // Dynamically require to avoid circular dependency if any, though likely safe to require at top.
    // However, best practice in this codebase seems to be explicit require or dependency injection.
    // I'll require the Campaign model from models index.
    const { Campaign } = require('../models');

    const campaignDoc = await Campaign.create({
        name: campaign.name || subject, // Default name to subject if missing
        subject,
        body: html || body,
        fromEmail,
        fromName,
        recipients,
        recipientsCount: recipients.length,
        status: 'processing' // Initially processing as we queue immediately
    });

    for (const email of recipients) {
        await emailQueue.add("send-email", {
            to: email,
            fromName,
            fromEmail,
            subject,
            html,
            text,
            encoding,
            mime,
            headers: {
                "List-Unsubscribe": "<mailto:unsubscribe@domain.com>",
                "Precedence": "bulk"
            },
            campaignId: campaignDoc._id // Pass campaign ID to worker for tracking if needed later
        });
    }

    return campaignDoc;
};

/**
 * Get all campaigns
 * @returns {Promise<QueryResult>}
 */
const getCampaigns = async () => {
    const { Campaign } = require('../models');
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return campaigns;
};

/**
 * Get campaign stats
 * @param {ObjectId} campaignId
 * @returns {Promise<Object>}
 */
const getCampaignStats = async (campaignId) => {
    const { Email, Campaign } = require('../models');

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }

    const stats = await Email.aggregate([
        { $match: { campaignId: campaign._id } },
        {
            $group: {
                _id: null,
                totalSent: { $sum: 1 },
                totalOpens: { $sum: { $cond: [{ $gt: ["$openCount", 0] }, 1, 0] } },
                totalClicks: { $sum: { $cond: [{ $gt: ["$clickCount", 0] }, 1, 0] } },
                // Optional: Count specific statuses
                sentCount: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
                failedCount: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } }
            }
        }
    ]);

    const result = stats[0] || {
        totalSent: 0,
        totalOpens: 0,
        totalClicks: 0,
        sentCount: 0,
        failedCount: 0
    };

    return {
        campaign,
        stats: result
    };
};

module.exports = {
    sendCampaign,
    getCampaigns,
    getCampaignStats,
};
