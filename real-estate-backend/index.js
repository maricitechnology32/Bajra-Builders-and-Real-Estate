 
// import dotenv from 'dotenv';
import { app } from './src/app.js';
import scheduledJobs from './src/cron/index.js';
import connectDB from './src/db/index.js';
// Configure dotenv at the very top
// dotenv.config({
//   path: './.env',
// });

// console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servers is running on port: ${PORT}`);
    });
    scheduledJobs();
  })
  .catch((err) => {
    console.log('MONGO db connection failed !!! ', err);
  });