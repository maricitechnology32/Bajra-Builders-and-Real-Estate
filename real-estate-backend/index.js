// index.js

import dotenv from 'dotenv';
import { app } from './src/app.js';

// Load environment variables from .env file
dotenv.config({
  path: './.env',
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
});