// import { Router } from 'express';
// import {
//   createProperty,
//   getAllProperties,
//   getPropertyById,
//   updateProperty,
//   deleteProperty, getAdminAllProperties
// } from '../controllers/property.controller.js';
// import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

// const router = Router();

// // Public routes
// router.route('/').get(getAllProperties);
// router.route('/:id').get(getPropertyById);

// // Admin-only routes
// router.route('/').post(verifyJWT, verifyRole(['ADMIN']), createProperty);
// router.route('/:id').patch(verifyJWT, verifyRole(['ADMIN']), updateProperty);
// router.route('/:id').delete(verifyJWT, verifyRole(['ADMIN']), deleteProperty);
// router.route('/admin/all').get(verifyJWT, verifyRole(['ADMIN']), getAdminAllProperties);


// export default router;

import { Router } from 'express';
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getAdminAllProperties // Make sure this is imported if you're using it
} from '../controllers/property.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js'; // 1. Import multer

const router = Router();

// Public routes
router.route('/').get(getAllProperties);
router.route('/:id').get(getPropertyById);

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