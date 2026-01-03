const mongoose = require('mongoose');
const config = require('../src/core/config');
const connectDB = require('../src/core/db');
require('../src/modules/users/models/permission.model'); // Register Permission
require('../src/modules/users/models/role.model');       // Register Role
require('../src/modules/users/models/user.model');       // Register User
// Imports fixed below manually
// const { userService, authService, tokenService } = require('../src/modules/auth');
// Ah, only authService is in src/modules/auth. userService is in src/modules/users.
// I need to import them correctly.

const userServiceInstance = require('../src/modules/users/user.service');
const authServiceInstance = require('../src/modules/auth/auth.service');
const tokenServiceInstance = require('../src/modules/auth/token.service');
const logger = require('../src/core/logger');

const verify = async () => {
    logger.info('Starting Verification...');

    // Connect DB
    await connectDB();

    const testUser = {
        name: 'Test Verify User',
        email: `verify_${Date.now()}@test.com`,
        password: 'password123'
    };

    try {
        // 1. Register
        logger.info('1. Testing Registration...');
        const user = await userServiceInstance.createUser(testUser);
        logger.info(`   User created: ${user.email}`);

        // 2. Login
        logger.info('2. Testing Login...');
        const loginUser = await authServiceInstance.loginUserWithEmailAndPassword(testUser.email, testUser.password);
        logger.info('   Login successful');

        // 3. Generate Tokens
        logger.info('3. Testing Token Generation...');
        const tokens = await tokenServiceInstance.generateAuthTokens(loginUser);
        logger.info(`   Access Token generated: ${tokens.access.token.substring(0, 20)}...`);

        // 4. Verify Access Token (Stateless)
        // Manual verification via jwt
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(tokens.access.token, config.jwt.secret);
        if (payload.sub === user.id) {
            logger.info('   Access Token Verified successfully');
        } else {
            throw new Error('Token payload mismatch');
        }

        // 5. Cleanup
        logger.info('5. Cleanup...');
        await userServiceInstance.deleteUserById(user.id);
        logger.info('   User deleted');

        logger.info('VERIFICATION PASSED!');
        process.exit(0);

    } catch (error) {
        const fs = require('fs');
        fs.writeFileSync('verify_error.txt', error.stack);
        logger.error(`VERIFICATION FAILED: ${error.message}`);
        logger.error(error.stack);
        process.exit(1);
    }
};

verify();
