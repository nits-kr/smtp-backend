const mongoose = require('mongoose');
const config = require('../src/core/config');
const Role = require('../src/modules/users/models/role.model');
const Permission = require('../src/modules/users/models/permission.model');

const permissionsList = [
    { name: 'getUsers', description: 'Get all users' },
    { name: 'manageUsers', description: 'Create and manage users' },
    { name: 'manageCampaigns', description: 'Create and manage campaigns' },
    { name: 'manageEmail', description: 'Send and manage emails' },
    { name: 'manageLists', description: 'Manage attributes and lists' },
    { name: 'viewReports', description: 'View analytics' },
];

const rolesList = [
    {
        name: 'admin',
        isSystem: true,
        permissions: ['getUsers', 'manageUsers', 'manageCampaigns', 'manageEmail', 'manageLists', 'viewReports']
    },
    {
        name: 'user',
        isSystem: true,
        permissions: ['manageCampaigns', 'manageEmail', 'manageLists', 'viewReports']
    },
    {
        name: 'subuser',
        isSystem: true, // Assuming subuser is a base role type, specific permissions might be additive or it starts empty
        permissions: [] // Starts empty, per user payload logic? Or maybe basic read access? 
        // The user payload allows *assigning* permissions, but the 'subuser' role doc itself might just be a shell if the logic pushes specific permission docs to the user?
        // Wait, user model has `roles: [ref]` AND `permissions: [String]`.
        // The middleware checks: `const userPermissions = req.user.roles.flatMap...`
        // So if I assign permissions in the payload `["campaign.create"]`, where do they go?
        // The current Schema has `permissions: [{type: String}]`.
        // But the middleware ONLY checks `req.user.roles`.
        // FIX: Middleware should also check `req.user.permissions`.
    }
];

async function seedRoles() {
    try {
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        console.log('Connected to MongoDB');

        // 1. Create Permissions
        const permMap = {};
        for (const p of permissionsList) {
            let perm = await Permission.findOne({ name: p.name });
            if (!perm) {
                console.log(`Creating permission: ${p.name}`);
                perm = await Permission.create(p);
            }
            permMap[p.name] = perm._id;
        }

        // 2. Create Roles
        for (const r of rolesList) {
            let role = await Role.findOne({ name: r.name });
            if (!role) {
                console.log(`Creating role: ${r.name}`);
                const rolePerms = r.permissions.map(name => permMap[name]);
                role = await Role.create({
                    name: r.name,
                    isSystem: r.isSystem,
                    permissions: rolePerms
                });
            } else {
                console.log(`Updating role: ${r.name}`);
                // Ensure permissions are up to date
                const rolePerms = r.permissions.map(name => permMap[name]);
                // Add missing
                rolePerms.forEach(pid => {
                    if (!role.permissions.includes(pid)) {
                        role.permissions.push(pid);
                    }
                });
                await role.save();
            }
        }
        console.log('Seeding completed.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedRoles();
