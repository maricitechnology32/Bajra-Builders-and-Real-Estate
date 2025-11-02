import { Router } from 'express';
import { getPageContent, upsertPageContent } from '../controllers/pageContent.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';

const router = Router();
// Public route to get page content
router.route('/:pageIdentifier').get(getPageContent);
// Admin route to create/update page content
router.route('/').post(verifyJWT, verifyRole(['ADMIN']), upsertPageContent);
export default router;

