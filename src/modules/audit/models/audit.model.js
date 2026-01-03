const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant', // Future proofing
        },
        action: {
            type: String,
            required: true,
        },
        target: {
            type: String, // e.g., 'User:123', 'Email:456'
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        },
        ip: {
            type: String,
        },
        userAgent: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
