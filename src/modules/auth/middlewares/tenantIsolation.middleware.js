const httpStatus = require('http-status');
const ApiError = require('../../../core/ApiError');

const tenantIsolation = () => (req, res, next) => {
    if (!req.user) {
        return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'User not found in request (Auth middleware missing?)'));
    }

    // Set the tenantId from the authenticated user
    req.tenantId = req.user.tenantId;

    // In a real multi-tenant app, we might also check headers (e.g., x-tenant-id) 
    // and match it with the user's tenantId to ensure they are accessing the right context.
    // For now, implicit isolation based on user is sufficient.

    // Example check: if a resource ID is passed, we might want to check ownership later in controller/service.
    // This middleware guarantees subsequent handlers know the current tenant context.

    next();
};

module.exports = tenantIsolation;
