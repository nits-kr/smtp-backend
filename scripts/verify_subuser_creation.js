const mongoose = require('mongoose');
const User = require('../src/modules/users/models/user.model');
const config = require('../src/core/config');

async function testSubuserCreation() {
    try {
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        console.log('Connected to MongoDB');

        const subuserPayload = {
            name: "Test Sub User",
            email: `subuser_${Date.now()}@test.com`,
            password: "password123",
            role: "subuser",
            permissions: [
                "campaign.create",
                "campaign.read",
                "list.manage",
                "reports.view"
            ]
        };

        console.log('Creating subuser with payload:', subuserPayload);
        const user = await User.create(subuserPayload);
        console.log('Subuser created successfully:', user);

        if (user.role === 'subuser' && user.permissions.length === 4) {
            console.log('VERIFICATION PASSED: Role and Permissions are correct.');
        } else {
            console.error('VERIFICATION FAILED: Role or Permissions mismatch.');
        }

    } catch (error) {
        console.error('Error creating subuser:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testSubuserCreation();
