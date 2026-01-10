const httpStatus = require('http-status');
const ApiError = require('../../../core/ApiError');

const permissionGuard = (requiredPermission) => (req, res, next) => {
    if (!req.user || !req.user.roles) {
        return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden: No roles assigned'));
    }

    // Flatten all permissions from all roles
    const rolePermissions = req.user.roles ? req.user.roles.flatMap(role =>
        role.permissions.map(p => p.name)
    ) : [];

    // Get direct user permissions
    // Assuming req.user.permissions is an array of strings (based on schema) or objects? 
    // Schema says: permissions: [{ type: String }] -> So it's an array of subdocuments with _id and value? 
    // Wait, simple type: String in array like that usually creates objects in Mongoose unless just [String].
    // Let's check model again.
    // permissions: [{ type: String }] -> Mongoose wraps primitives in objects if defined like this? No, usually [String] is cleaner.
    // If it's [{type: String}], then row is { _id: ..., type: 'val' }? No, that's invalid schema def for value. 
    // Usually it's `permissions: [String]` or `permissions: [{ type: String }]` (maybe interpreted as object with field type?).
    // Let's assume it works as array of strings for now or map it.

    // Safety check:
    const directPermissions = req.user.permissions ? req.user.permissions.map(p => {
        return typeof p === 'string' ? p : (p.name || p.toString()); // Handle potential object wrapper
    }) : [];

    const userPermissions = [...new Set([...rolePermissions, ...directPermissions])];

    console.log(`[PermissionGuard] User: ${req.user._id}`);
    console.log(`[PermissionGuard] Roles: ${req.user.roles ? req.user.roles.map(r => r.name) : 'None'}`);
    console.log(`[PermissionGuard] Resolved Permissions: ${userPermissions}`);
    console.log(`[PermissionGuard] Required: ${requiredPermission}`);

    if (!userPermissions.includes(requiredPermission)) {
        return next(new ApiError(httpStatus.FORBIDDEN, `Forbidden: Requires permission ${requiredPermission}`));
    }

    next();
};

module.exports = permissionGuard;
