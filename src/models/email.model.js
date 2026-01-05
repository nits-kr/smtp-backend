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
