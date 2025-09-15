import { Router } from 'express';
import {
  createInquiry,
  getAllInquiries,
  updateInquiryStatus,
} from '../controllers/inquiry.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// --- Secured Routes ---
// User can create an inquiry
router.route('/').post(verifyJWT, createInquiry);

// --- Admin Only Routes ---
// Admin can get all inquiries
router.route('/').get(verifyJWT, verifyRole(['ADMIN']), getAllInquiries);

// Admin can update an inquiry's status
router.route('/:id').patch(verifyJWT, verifyRole(['ADMIN']), updateInquiryStatus);

export default router;