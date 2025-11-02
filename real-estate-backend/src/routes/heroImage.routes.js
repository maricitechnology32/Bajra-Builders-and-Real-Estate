import { Router } from 'express';
import { addHeroImage, deleteHeroImage, getAdminAllHeroImages, getPublicHeroImages, updateHeroImage } from '../controllers/heroImage.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Public Route
router.route('/public').get(getPublicHeroImages);
// Admin Routes
router.route('/').post(verifyJWT, verifyRole(['ADMIN']), upload.array('images', 10), addHeroImage);  
router.route('/admin/all').get(verifyJWT, verifyRole(['ADMIN']), getAdminAllHeroImages);
router.route('/:id').patch(verifyJWT, verifyRole(['ADMIN']), updateHeroImage);

router.route('/:id').delete(verifyJWT, verifyRole(['ADMIN']), deleteHeroImage);
export default router;