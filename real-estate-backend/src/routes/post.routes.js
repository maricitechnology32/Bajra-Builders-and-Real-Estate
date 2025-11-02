import { Router } from 'express';
import {
  createPost,
  deletePost,
  getAllPosts,
  getAllPostsForAdmin,
  getPostByIdForAdmin,
  getPostBySlug,
  updatePost
} from '../controllers/post.controller.js';
import { verifyJWT, verifyRole } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// --- Public Routes ---
router.route('/').get(getAllPosts);

// --- Admin Only Routes ---
// The '/all' route is defined before '/:slug' to ensure it's matched correctly.
router.route('/all').get(verifyJWT, verifyRole(['ADMIN']), getAllPostsForAdmin);
router.route('/').post(verifyJWT, verifyRole(['ADMIN']), upload.single('featuredImage'), createPost);
router.route('/:id').patch(verifyJWT, verifyRole(['ADMIN']), upload.single('featuredImage'), updatePost);
router.route('/:id').delete(verifyJWT, verifyRole(['ADMIN']), deletePost);
router.route('/admin/:id').get(getPostByIdForAdmin);

// --- Public Route (Defined Last) ---
// This generic route with a parameter must come after more specific routes like '/all'.
router.route('/:slug').get(getPostBySlug);


export default router;