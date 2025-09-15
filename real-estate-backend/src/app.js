// src/app.js

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
import passport from 'passport';
import './config/passport.setup.js';
import i18next from './config/i18next.config.js'; // Import i18next config
import i18nextMiddleware from 'i18next-http-middleware'; // Import the middleware
import propertyRouter from './routes/property.routes.js';
import inquiryRouter from './routes/inquiry.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
// Use CORS middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Define allowed origin in .env
    credentials: true,
  })
);

// Middleware for parsing JSON request bodies
app.use(express.json({ limit: '16kb' }));
// Middleware for parsing URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser()); // Use cookie-parser middleware
app.use(passport.initialize());
app.use(i18nextMiddleware.handle(i18next));

// --- Routes ---
import userRouter from './routes/user.routes.js';
// Route declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/properties', propertyRouter);
app.use('/api/v1/inquiries', inquiryRouter);
app.use('/api/v1/wishlist', wishlistRouter); 

// A simple route for health check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is healthy!' });
});

export { app };