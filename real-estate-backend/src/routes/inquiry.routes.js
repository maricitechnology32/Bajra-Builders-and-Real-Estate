import { Router } from 'express';
import {
  createInquiry,
  getAllInquiries,
  updateInquiryStatus,
  getMyInquiries, // 1. Import the new controller
} from '../controllers/inquiry.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// --- User-Facing Routes ---
router.route('/').post(verifyJWT, createInquiry);
router.route('/my-inquiries').get(verifyJWT, getMyInquiries); // 2. Add the new route

// --- Admin-Only Routes ---
router.route('/admin/all').get(verifyJWT, verifyRole(['ADMIN']), getAllInquiries);
router.route('/admin/:id').patch(verifyJWT, verifyRole(['ADMIN']), updateInquiryStatus);

export default router;