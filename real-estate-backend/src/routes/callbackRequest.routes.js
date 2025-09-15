import { Router } from 'express';
import {
  createCallbackRequest,
  getAllCallbackRequests,
  updateCallbackRequest,
} from '../controllers/callbackRequest.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// --- Public Route ---
router.route('/').post(createCallbackRequest);

// --- Admin Only Routes ---
router.route('/all').get(verifyJWT, verifyRole(['ADMIN']), getAllCallbackRequests);
router.route('/:id').patch(verifyJWT, verifyRole(['ADMIN']), updateCallbackRequest);

export default router;