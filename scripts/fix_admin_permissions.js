const mongoose = require('mongoose');
const config = require('../src/core/config');
const User = require('../src/modules/users/models/user.model');
const Role = require('../src/modules/users/models/role.model');
const Permission = require('../src/modules/users/models/permission.model');

async function fixPermissions() {
    try {
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        console.log('Connected to MongoDB');

        // 1. Find Admin Role
        const adminRole = await Role.findOne({ name: 'admin' }).populate('permissions');
        if (!adminRole) {
            console.log('Admin role not found!');
            return;
        }
        console.log('Current Admin Permissions:', adminRole.permissions.map(p => p.name));

        // 2. Define permissions to add
        const permissionsToAdd = [
            { name: 'getUsers', description: 'Get all users' },
            { name: 'manageUsers', description: 'Create and manage users' }
        ];

        for (const permDef of permissionsToAdd) {
            let permission = await Permission.findOne({ name: permDef.name });

            if (!permission) {
                console.log(`Permission '${permDef.name}' not found. Creating it...`);
                permission = await Permission.create(permDef);
            } else {
                console.log(`Permission '${permDef.name}' exists.`);
            }

            // 3. Add to Admin Role if missing
            // We compare ObjectIds as strings or check name presence if populated (but populating new ones is tricky without refresh)
            // Simpler: Check if adminRole.permissions (array of docs) contains the permission._id

            const alreadyHas = adminRole.permissions.some(p => p._id.equals(permission._id));

            if (!alreadyHas) {
                console.log(`Adding '${permDef.name}' to admin role...`);
                adminRole.permissions.push(permission._id);
            } else {
                console.log(`Admin role already has '${permDef.name}'.`);
            }
        }

        await adminRole.save();
        console.log('Admin role updated successfully.');

        // 4. Verify user has the role (just in case)
        const adminUser = await User.findOne({ email: 'admin@example.com' }).populate('roles');
        if (adminUser) {
            const hasRole = adminUser.roles.some(r => r._id.equals(adminRole._id));
            if (!hasRole) {
                console.log('User does not have admin Role reference! Fixing...');
                adminUser.roles.push(adminRole._id);
                await adminUser.save();
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixPermissions();
