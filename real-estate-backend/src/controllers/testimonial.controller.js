import mongoose from 'mongoose';
import { Testimonial } from '../models/testimonial.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// const createTestimonial = asyncHandler(async (req, res) => {
//   // Now receives video data directly in the body
//   const { content, rating, video } = req.body;
//   const userId = req.user._id;

//   if (!content) {
//     throw new ApiError(400, req.t('errorTestimonialContentRequired'));
//   }

//   const testimonial = await Testimonial.create({
//     content,
//     rating,
//     user: userId,
//     video, // Save the video object { url, cloudinary_id }
//   });

//   return res.status(201).json(
//     new ApiResponse(201, testimonial, req.t('testimonialSubmittedSuccess'))
//   );
// });

// The createTestimonial function is now much simpler
const createTestimonial = asyncHandler(async (req, res) => {
  const { content, rating, videoUrl } = req.body; // Expect videoUrl string
  const userId = req.user._id;

  if (!content) {
    throw new ApiError(400, req.t('errorTestimonialContentRequired'));
  }

  const testimonial = await Testimonial.create({
    content,
    rating,
    user: userId,
    videoUrl, // Save the URL
  });

  return res.status(201).json(
    new ApiResponse(201, testimonial, req.t('testimonialSubmittedSuccess'))
  );
});

const getApprovedTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ status: 'Approved' }).populate('user', 'fullName avatar').sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, testimonials, req.t('testimonialsFetchedSuccess')));
});

const getAllTestimonialsForAdmin = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().populate('user', 'fullName email').sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, testimonials, req.t('testimonialsFetchedSuccess')));
});

const updateTestimonialStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, req.t('errorInvalidTestimonialId'));
  }
  const allowedStatuses = ['Approved', 'Rejected'];
  if (!status || !allowedStatuses.includes(status)) {
    throw new ApiError(400, req.t('errorInvalidTestimonialStatus'));
  }
  const updatedTestimonial = await Testimonial.findByIdAndUpdate(id, { status }, { new: true });
  if (!updatedTestimonial) {
    throw new ApiError(404, req.t('errorTestimonialNotFound'));
  }
  return res.status(200).json(new ApiResponse(200, updatedTestimonial, req.t('testimonialStatusUpdatedSuccess')));
});

export {
  createTestimonial, getAllTestimonialsForAdmin, getApprovedTestimonials, updateTestimonialStatus
};

