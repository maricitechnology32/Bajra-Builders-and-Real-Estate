import { Router } from 'express';
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
} from '../controllers/property.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.route('/').get(getAllProperties);
router.route('/:id').get(getPropertyById);

// Admin-only routes
router.route('/').post(verifyJWT, verifyRole(['ADMIN']), createProperty);
router.route('/:id').patch(verifyJWT, verifyRole(['ADMIN']), updateProperty);
router.route('/:id').delete(verifyJWT, verifyRole(['ADMIN']), deleteProperty);

export default router;