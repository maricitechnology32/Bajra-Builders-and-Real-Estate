import { Router } from 'express';
import { getCloudinarySignature } from '../controllers/upload.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// This route is protected. Only logged-in users can get a signature.
router.route('/signature').get(verifyJWT, getCloudinarySignature);

export default router;