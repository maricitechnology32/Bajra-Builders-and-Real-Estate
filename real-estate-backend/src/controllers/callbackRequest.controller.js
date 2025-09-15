import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { CallbackRequest } from '../models/callbackRequest.model.js';
import mongoose from 'mongoose';

/**
 * @description Create a new callback request. Public access.
 * @route POST /api/v1/callbacks
 * @access Public
 */
const createCallbackRequest = asyncHandler(async (req, res) => {
  const { name, phone, preferredTime } = req.body;

  if (!name || !phone) {
    throw new ApiError(400, req.t('errorAllFieldsRequired'));
  }

  const callbackRequest = await CallbackRequest.create({
    name,
    phone,
    preferredTime,
  });

  return res.status(201).json(
    new ApiResponse(201, callbackRequest, req.t('callbackRequestSuccess'))
  );
});

/**
 * @description Get all callback requests. Admin access required.
 * @route GET /api/v1/callbacks/all
 * @access Private/Admin
 */
const getAllCallbackRequests = asyncHandler(async (req, res) => {
  const requests = await CallbackRequest.find().sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, requests, req.t('callbackRequestsFetchedSuccess'))
  );
});

/**
 * @description Update a callback request's status or notes. Admin access required.
 * @route PATCH /api/v1/callbacks/:id
 * @access Private/Admin
 */
const updateCallbackRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid request ID');
  }

  const updateData = {};
  if (status) {
    const allowedStatuses = ['Pending', 'Contacted', 'Closed'];
    if (!allowedStatuses.includes(status)) {
      throw new ApiError(400, req.t('errorInvalidStatus'));
    }
    updateData.status = status;
  }

  if (notes) {
    updateData.notes = notes;
  }

  const updatedRequest = await CallbackRequest.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  );

  if (!updatedRequest) {
    throw new ApiError(404, req.t('errorCallbackRequestNotFound'));
  }

  return res.status(200).json(
    new ApiResponse(200, updatedRequest, req.t('callbackRequestUpdatedSuccess'))
  );
});

export {
  createCallbackRequest,
  getAllCallbackRequests,
  updateCallbackRequest,
};