import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Post } from '../models/post.model.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

const createPost = asyncHandler(async (req, res) => {
  const { title, content, excerpt, status, tags, metaTitle, metaDescription, metaKeywords } = req.body;
  const authorId = req.user._id;

  if (!title || !content) {
    throw new ApiError(400, req.t('errorAllFieldsRequired'));
  }

  let featuredImage = {};
  if (req.file) {
    const uploadedImage = await uploadOnCloudinary(req.file.path);
    if (!uploadedImage) {
      throw new ApiError(500, 'Error uploading featured image');
    }
    featuredImage = {
      url: uploadedImage.secure_url,
      cloudinary_id: uploadedImage.public_id,
    };
  }

  const post = await Post.create({
    title,
    content,
    excerpt,
    status,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    metaTitle,
    metaDescription,
    metaKeywords: metaKeywords ? metaKeywords.split(',').map(key => key.trim()) : [],
    featuredImage,
    author: authorId,
  });

  return res.status(201).json(new ApiResponse(201, post, req.t('postCreatedSuccess')));
});

const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, excerpt, status, tags, metaTitle, metaDescription, metaKeywords } = req.body;

  const post = await Post.findById(id);
  if (!post) {
    throw new ApiError(404, req.t('errorPostNotFound'));
  }

  // Handle image update
  if (req.file) {
    // Delete old image if it exists
    if (post.featuredImage?.cloudinary_id) {
      await deleteFromCloudinary(post.featuredImage.cloudinary_id);
    }
    // Upload new image
    const uploadedImage = await uploadOnCloudinary(req.file.path);
    if (!uploadedImage) {
      throw new ApiError(500, 'Error uploading new featured image');
    }
    post.featuredImage = {
      url: uploadedImage.secure_url,
      cloudinary_id: uploadedImage.public_id,
    };
  }

  // Update text fields
  if (title) post.title = title;
  if (content) post.content = content;
  if (excerpt) post.excerpt = excerpt;
  if (status) post.status = status;
  if (tags) post.tags = tags.split(',').map(tag => tag.trim());
  if (metaTitle) post.metaTitle = metaTitle;
  if (metaDescription) post.metaDescription = metaDescription;
  if (metaKeywords) post.metaKeywords = metaKeywords.split(',').map(key => key.trim());

  const updatedPost = await post.save();

  return res.status(200).json(new ApiResponse(200, updatedPost, req.t('postUpdatedSuccess')));
});


const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  if (!post) {
    throw new ApiError(404, req.t('errorPostNotFound'));
  }

  // Delete featured image from Cloudinary if it exists
  if (post.featuredImage?.cloudinary_id) {
    await deleteFromCloudinary(post.featuredImage.cloudinary_id);
  }

  await Post.findByIdAndDelete(id);

  return res.status(200).json(new ApiResponse(200, {}, req.t('postDeletedSuccess')));
});

// --- Public Controllers ---

const getAllPosts = asyncHandler(async (req, res) => {
  console.log('Get all posts hit');

  const { page = 1, limit = 10 } = req.query;
  const posts = await Post.find({ status: 'Published' })
    .populate('author', 'fullName avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const totalPosts = await Post.countDocuments({ status: 'Published' });

  return res.status(200).json(new ApiResponse(200, {
    posts,
    totalPages: Math.ceil(totalPosts / limit),
    currentPage: parseInt(page),
  }, req.t('postsFetchedSuccess')));
});


const getPostBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const post = await Post.findOne({ slug, status: 'Published' }).populate('author', 'fullName avatar');

  if (!post) {
    throw new ApiError(404, req.t('errorPostNotFound'));
  }

  return res.status(200).json(new ApiResponse(200, post, req.t('postFetchedSuccess')));
});

// --- Admin Controller ---

const getAllPostsForAdmin = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate('author', 'fullName').sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, posts, req.t('postsFetchedSuccess')));
});

const getPostByIdForAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid post ID');
    }
    const post = await Post.findById(id).populate('author', 'fullName');
    if (!post) {
        throw new ApiError(404, req.t('errorPostNotFound'));
    }
    return res.status(200).json(new ApiResponse(200, post, req.t('postFetchedSuccess')));
});

export {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getPostBySlug,
  getAllPostsForAdmin,
  getPostByIdForAdmin

};