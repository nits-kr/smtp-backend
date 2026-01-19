const mongoose = require('mongoose');

const emailSchema = mongoose.Schema(
    {
        from: {
            type: String,
            required: true,
            trim: true,
        },
        to: {
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
        isRead: {
            type: Boolean,
            default: false,
        },
        trackingId: {
            type: String,
            unique: true,
            sparse: true, // Allows null/undefined for old emails
        },
        opens: [{
            timestamp: Date,
            ip: String,
            userAgent: String,
        }],
        clicks: [{
            timestamp: Date,
            url: String,
            ip: String,
            userAgent: String,
        }],
        openCount: {
            type: Number,
            default: 0,
        },
        clickCount: {
            type: Number,
            default: 0,
        },
        campaignId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campaign',
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'sent', 'failed'],
            default: 'pending',
        },
        messageId: String,
        error: String,
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
// add plugin that converts mongoose to json

/**
 * @typedef Email
 */
const Email = mongoose.models.Email || mongoose.model('Email', emailSchema);

module.exports = Email;
