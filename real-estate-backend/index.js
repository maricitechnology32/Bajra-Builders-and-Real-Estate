 
// import dotenv from 'dotenv';
import connectDB from './src/db/index.js';
import { app } from './src/app.js';
import scheduledJobs from './src/cron/index.js'; 
// Configure dotenv at the very top
// dotenv.config({
//   path: './.env',
// });

console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);


const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port: ${PORT}`);
    });
    scheduledJobs();
  })
  .catch((err) => {
    console.log('MONGO db connection failed !!! ', err);
  });