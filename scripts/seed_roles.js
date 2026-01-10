const mongoose = require('mongoose');
const config = require('../src/core/config');
const Role = require('../src/modules/users/models/role.model');

const seedRoles = async () => {
    try {
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        console.log('Connected to DB');

        const roles = ['user', 'admin', 'manager'];

        for (const roleName of roles) { // Changed loop variable to avoid conflict with model name
            // Check if role exists
            let roleDoc = await Role.findOne({ name: roleName });
            if (!roleDoc) {
                roleDoc = await Role.create({ name: roleName, isSystem: true });
                console.log(`Created role: ${roleName}`);
            } else {
                console.log(`Role already exists: ${roleName}`);
            }
        }

        const allRoles = await Role.find({});
        console.log('\nCurrent Roles in DB:');
        console.log(JSON.stringify(allRoles.map(r => ({ name: r.name, id: r._id })), null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

seedRoles();
