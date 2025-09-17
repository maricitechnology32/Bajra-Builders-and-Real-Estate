import { Router } from 'express';
import {
  createInquiry,
  getAllInquiries,
  updateInquiryStatus,
  getMyInquiries,
} from '../controllers/inquiry.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply login check to all routes in this file
router.use(verifyJWT);

// --- Routes for Regular Users ---
router.route('/').post(createInquiry);
router.route('/my-inquiries').get(getMyInquiries);

// --- Routes for Admins Only ---
// The path is now just '/', but it's protected by the ADMIN role check
router.route('/').get(verifyRole(['ADMIN']), getAllInquiries);

// The path is now just '/:id'
router.route('/:id').patch(verifyRole(['ADMIN']), updateInquiryStatus);

export default router;