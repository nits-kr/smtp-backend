const mongoose = require('mongoose');
// const { toJSON, paginate } = require('./plugins'); // Removed as file does not exist

const campaignSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        body: {
            type: String,
            required: true,
        },
        fromEmail: {
            type: String,
            required: true,
            trim: true,
        },
        fromName: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending',
        },
        recipientsCount: {
            type: Number,
            default: 0,
        },
        recipients: {
            type: [String],
            default: []
        },
    },
    {
        timestamps: true,
    }
);

// Add plugins
// Check if plugins exist before adding, assuming they might not be in the standardized location or named this way
// Looking at email.model.js, it doesn't import plugins. Let's check src/models directory again or assume standard location if used elsewhere.
// But wait, the user said "without affecting other things". Maybe I shouldn't assume plugins exist if I haven't seen them.
// I'll check `src/models/plugins` first.

/**
 * @typedef Campaign
 */
const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
