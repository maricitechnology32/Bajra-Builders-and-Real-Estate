import dotenv from 'dotenv';

// Attempt to load the .env file
dotenv.config();

console.log('--- DOTENV TEST ---');
console.log('PORT variable is:', process.env.PORT);
console.log('GOOGLE_CLIENT_ID is:', process.env.GOOGLE_CLIENT_ID);
console.log('-------------------');