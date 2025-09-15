import { Router } from 'express';
import {
  createTestimonial,
  getApprovedTestimonials,
  getAllTestimonialsForAdmin,
  updateTestimonialStatus,
} from '../controllers/testimonial.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// --- Public Route ---
router.route('/').get(getApprovedTestimonials);

// --- User Route ---
router.route('/').post(verifyJWT, createTestimonial);

// --- Admin Only Routes ---
router.route('/all').get(verifyJWT, verifyRole(['ADMIN']), getAllTestimonialsForAdmin);
router.route('/:id').patch(verifyJWT, verifyRole(['ADMIN']), updateTestimonialStatus);

export default router;