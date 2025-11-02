import { Router } from 'express';
import { getHomepageData } from '../controllers/homepage.controller.js';
const router = Router();

router.route('/').get(getHomepageData);

export default router;