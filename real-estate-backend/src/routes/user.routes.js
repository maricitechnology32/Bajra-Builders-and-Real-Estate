import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  googleLoginCallback,
  getCurrentUser, // We will add this controller function next
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import passport from 'passport';

const router = Router();

// --- Public Routes (No Authentication Required) ---
router.route('/register').post(registerUser);
router.route('/login').post(loginUser); // For manual email & password login
router.route('/refresh-token').post(refreshAccessToken); // To get a new access token

// --- Google OAuth Routes ---
router
  .route('/google')
  .get(passport.authenticate('google', { scope: ['profile', 'email'] }));

router
  .route('/google/callback')
  .get(passport.authenticate('google', { session: false }), googleLoginCallback);

// --- Secured Routes (Authentication Required) ---
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/me').get(verifyJWT, getCurrentUser); // To get the current logged-in user's details

export default router;