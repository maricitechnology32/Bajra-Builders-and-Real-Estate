// src/app.js

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
import passport from 'passport';
import './config/passport.setup.js';

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

// --- Routes ---
import userRouter from './routes/user.routes.js';
// Route declaration
app.use('/api/v1/users', userRouter);

// A simple route for health check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is healthy!' });
});

export { app };