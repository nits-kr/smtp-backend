const mongoose = require('mongoose');
const config = require('../src/core/config');
const Role = require('../src/modules/users/models/role.model');

const listRoles = async () => {
    try {
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        console.log('Connected to DB');

        const roles = await Role.find({});
        console.log(`Found ${roles.length} roles.`);
        roles.forEach(role => {
            console.log(`- Name: ${role.name}, ID: ${role._id}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

listRoles();
