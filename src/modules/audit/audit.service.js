const AuditLog = require('./models/audit.model');
const logger = require('../../core/logger');

const logAudit = async (user, action, target, metadata = {}, req = null) => {
    try {
        const auditData = {
            user: user.id || user._id,
            tenantId: user.tenantId,
            action,
            target,
            metadata,
        };

        if (req) {
            auditData.ip = req.ip;
            auditData.userAgent = req.get('User-Agent');
        }

        await AuditLog.create(auditData);
    } catch (error) {
        logger.error(`Audit Log Failed: ${error.message}`);
    }
};

module.exports = {
    logAudit,
};
