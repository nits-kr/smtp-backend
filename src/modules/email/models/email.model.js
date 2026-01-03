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
        // For outbound emails
        sentAt: {
            type: Date
        },
        scheduledAt: {
            type: Date
        },
        status: {
            type: String,
            enum: ['draft', 'sent', 'failed', 'received', 'scheduled'],
            default: 'received'
        }
    },
    {
        timestamps: true,
    }
);

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
