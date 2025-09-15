import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Inquiry } from '../models/inquiry.model.js';
import { Property } from '../models/property.model.js';

/**
 * @description Create a new inquiry for a property. User access required.
 * @route POST /api/v1/inquiries
 * @access Private
 */
const createInquiry = asyncHandler(async (req, res) => {
  const { propertyId, message, name, email, phone } = req.body;
  const userId = req.user._id;

  if (!propertyId || !message) {
    throw new ApiError(400, req.t('errorAllFieldsRequired'));
  }

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    throw new ApiError(400, req.t('errorInvalidPropertyId'));
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(404, req.t('errorPropertyNotFound'));
  }

  const inquiry = await Inquiry.create({
    property: propertyId,
    user: userId,
    name: name || req.user.fullName,
    email: email || req.user.email,
    phone,
    message,
  });

  return res.status(201).json(
    new ApiResponse(201, inquiry, req.t('inquirySubmittedSuccess'))
  );
});

/**
 * @description Get all inquiries. Admin access required.
 * @route GET /api/v1/inquiries
 * @access Private/Admin
 */
const getAllInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find()
    .populate('property', 'title locationAddress')
    .populate('user', 'fullName email')
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, inquiries, req.t('inquiriesFetchedSuccess'))
  );
});

/**
 * @description Get all inquiries submitted by the currently logged-in user.
 * @route GET /api/v1/inquiries/my-inquiries
 * @access Private
 */
const getMyInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find({ user: req.user._id })
    .populate('property', 'title images locationAddress status') // Get some details of the property
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, inquiries, req.t('inquiriesFetchedSuccess'))
  );
});



/**
 * @description Update the status of an inquiry. Admin access required.
 * @route PATCH /api/v1/inquiries/:id
 * @access Private/Admin
 */
const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['Submitted', 'Viewed', 'Responded', 'Closed'];
  if (!status || !allowedStatuses.includes(status)) {
    throw new ApiError(400, req.t('errorInvalidStatus'));
  }

  const updatedInquiry = await Inquiry.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!updatedInquiry) {
    throw new ApiError(404, 'Inquiry not found'); // Kept in English for brevity, or add a new key.
  }

  return res.status(200).json(
    new ApiResponse(200, updatedInquiry, req.t('inquiryStatusUpdatedSuccess'))
  );
});

export { createInquiry, getAllInquiries, updateInquiryStatus, getMyInquiries };