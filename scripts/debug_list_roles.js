const mongoose = require('mongoose');
const config = require('../src/core/config');
const Role = require('../src/modules/users/models/role.model');

async function listRoles() {
    try {
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        console.log('Connected to MongoDB');

        const roles = await Role.find({});
        console.log('Total Roles:', roles.length);
        roles.forEach(role => {
            console.log(`- Name: ${role.name}, System: ${role.isSystem}, ID: ${role._id}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

listRoles();
