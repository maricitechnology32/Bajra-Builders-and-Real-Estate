import { Router } from 'express';
import {
  changePassword,
  deleteUserByAdmin,
  forgotPassword,
  getAllUsersForAdmin,
  getCurrentUser,
  getUserByIdForAdmin,
  googleLoginCallback,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
  updateUserAvatar,
  updateUserProfile,
  updateUserRoleByAdmin
} from '../controllers/user.controller.js';
// console.log('Is the changePassword controller a function?', typeof changePassword);

import passport from 'passport';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';


const router = Router();

// --- Public Routes (No Authentication Required) ---
router.route('/register').post(registerUser);
router.route('/login').post(loginUser); // For manual email & password login
router.route('/refresh-token').post(refreshAccessToken); // To get a new access token
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').post(resetPassword);



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
router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar);
router.route('/update-profile').patch(verifyJWT, updateUserProfile);
router.route('/change-password').post(verifyJWT, changePassword)
router.route('/admin/all-users').get(verifyJWT, verifyRole(['ADMIN']), getAllUsersForAdmin);
router.route('/admin/update-role/:id').patch(verifyJWT, verifyRole(['ADMIN']), updateUserRoleByAdmin);
router.route('/admin/:id').delete(verifyJWT, verifyRole(['ADMIN']), deleteUserByAdmin);
router.route('/admin/:id').get(verifyJWT, verifyRole(['ADMIN']), getUserByIdForAdmin);
// router.route('/password-update-test').post(verifyJWT, changePassword);
router.route('/admin/analytics').get(
  verifyJWT,              // 1. Checks if the user is logged in.
  verifyRole(['ADMIN']),  // 2. Checks if the logged-in user is an ADMIN.
  // getAdminAnalytics       // 3. Only runs if both checks pass.
);
router.route('/shared-feature').get(
  verifyJWT,
  verifyRole(['ADMIN', 'BUYER']), // Both roles are allowed
  // getSharedFeatureData
);

export default router;