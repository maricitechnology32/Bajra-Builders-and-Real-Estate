import { Router } from 'express';
import {
  createService,
  deleteService,
  getAdminAllServices,
  getPublicServices,
  updateService
} from '../controllers/service.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// --- Public Route ---
router.route('/').get(getPublicServices);

// --- Admin Only Routes ---
router.route('/').post(verifyJWT, verifyRole(['ADMIN']), createService);
router.route('/:id').patch(verifyJWT, verifyRole(['ADMIN']), updateService);
router.route('/:id').delete(verifyJWT, verifyRole(['ADMIN']), deleteService);
router.route('/admin/all').get(verifyJWT, verifyRole(['ADMIN']), getAdminAllServices);

export default router;