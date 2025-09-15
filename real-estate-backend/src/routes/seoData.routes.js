import { Router } from 'express';
import { upsertSeoData, getSeoData } from '../controllers/seoData.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();

// --- Public Route ---
router.route('/:pageIdentifier').get(getSeoData);

// --- Admin Only Route ---
router.route('/').post(verifyJWT, verifyRole(['ADMIN']), upsertSeoData);

export default router;