const request = require('supertest');
const { app } = require('../src/app');
const mongoose = require('mongoose');
const config = require('../src/core/config');

const debugRegister = async () => {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);

    const userPayload = {
        name: 'Debug User',
        email: 'debug@example.com',
        password: 'password123',
        phone: '1234567890',
        company: 'Debug Corp',
        jobTitle: 'Debugger'
    };

    console.log('Sending registration request...');

    // Create a dummy buffer for photo
    const buffer = Buffer.from('fake image data');

    try {
        const res = await request(app)
            .post('/v1/auth/register')
            // .set('Content-Type', 'multipart/form-data') // supertest handles this with .attach / .field
            .field('name', userPayload.name)
            .field('email', userPayload.email)
            .field('password', userPayload.password)
            .field('phone', userPayload.phone)
            .field('company', userPayload.company)
            .field('jobTitle', userPayload.jobTitle)
            .attach('photo', buffer, 'photo.jpg');

        const fs = require('fs');
        fs.writeFileSync('debug_output.json', JSON.stringify(res.body, null, 2));
        console.log('Output written to debug_output.json');
    } catch (e) {
        console.error('Request failed:', e);
    } finally {
        await mongoose.disconnect();
    }
};

debugRegister();
