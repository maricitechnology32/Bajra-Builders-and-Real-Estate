import { Router } from 'express';
import {
  toggleWishlistItem,
  getWishlist,
} from '../controllers/wishlist.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All wishlist routes require a user to be logged in
router.use(verifyJWT);

router.route('/').get(getWishlist);
router.route('/toggle/:propertyId').post(toggleWishlistItem);

export default router;