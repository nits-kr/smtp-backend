const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.log('Dotenv Error:', result.error);
}

console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_PRIVATE_KEY Length:', process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 'undefined');
