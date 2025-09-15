import { Router } from 'express';
import {
  createSavedSearch,
  getUserSavedSearches,
  deleteSavedSearch,
} from '../controllers/savedSearch.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply login check to all routes in this file
router.use(verifyJWT);

router.route('/').post(createSavedSearch);
router.route('/').get(getUserSavedSearches);
router.route('/:id').delete(deleteSavedSearch);

export default router;