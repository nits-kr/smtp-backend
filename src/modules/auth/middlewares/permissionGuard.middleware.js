const httpStatus = require('http-status');
const ApiError = require('../../../core/ApiError');

const permissionGuard = (requiredPermission) => (req, res, next) => {
    if (!req.user || !req.user.roles) {
        return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden: No roles assigned'));
    }

    // Flatten all permissions from all roles
    const userPermissions = req.user.roles.flatMap(role =>
        role.permissions.map(p => p.name)
    );

    if (!userPermissions.includes(requiredPermission)) {
        return next(new ApiError(httpStatus.FORBIDDEN, `Forbidden: Requires permission ${requiredPermission}`));
    }

    next();
};

module.exports = permissionGuard;
