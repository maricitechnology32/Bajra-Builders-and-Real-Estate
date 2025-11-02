 

import { Router } from 'express';
import {
  createProperty,
  deleteProperty,
  getAdminAllProperties // Make sure this is imported if you're using it
  ,


  getAllProperties,
  getFeaturedProperties,
  getLatestProperties,
  getPropertyById,
  toggleFeaturedStatus,
  updateProperty
} from '../controllers/property.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js'; // 1. Import multer

const router = Router();

// Public routes
router.route('/').get(getAllProperties);
router.route('/featured').get(getFeaturedProperties);
router.route('/latest').get(getLatestProperties);
router.route('/:id').get(getPropertyById);
router.route('/admin/toggle/featured/:id').patch(verifyJWT, verifyRole(['ADMIN']), toggleFeaturedStatus);


// Admin-only routes
router.route('/admin/all').get(verifyJWT, verifyRole(['ADMIN']), getAdminAllProperties);

// 2. Add the 'upload' middleware to the create and update routes
router.route('/').post(
  verifyJWT,
  verifyRole(['ADMIN']),
  upload.array('images', 10), // Handles up to 10 images
  createProperty
);
router.route('/:id').patch(
  verifyJWT,
  verifyRole(['ADMIN']),
  upload.array('images', 10),
  updateProperty
);
router.route('/:id').delete(verifyJWT, verifyRole(['ADMIN']), deleteProperty);

export default router;