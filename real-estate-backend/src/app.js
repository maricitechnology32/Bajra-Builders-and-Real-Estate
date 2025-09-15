// src/app.js

import express from 'express';
import cors from 'cors';

const app = express();

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

// A simple route for health check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is healthy!' });
});

export { app };