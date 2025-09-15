import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { SavedSearch } from '../models/savedSearch.model.js';
import mongoose from 'mongoose';

const createSavedSearch = asyncHandler(async (req, res) => {
  const { name, filters } = req.body;
  const userId = req.user._id;

  if (!name || !filters) {
    throw new ApiError(400, req.t('errorAllFieldsRequired'));
  }

  const savedSearch = await SavedSearch.create({
    user: userId,
    name,
    filters,
  });

  return res.status(201).json(
    new ApiResponse(201, savedSearch, req.t('savedSearchCreatedSuccess'))
  );
});

const getUserSavedSearches = asyncHandler(async (req, res) => {
  const savedSearches = await SavedSearch.find({ user: req.user._id }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, savedSearches, req.t('savedSearchesFetchedSuccess'))
  );
});

const deleteSavedSearch = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid ID');
  }

  // Find and delete the search, ensuring it belongs to the logged-in user
  const savedSearch = await SavedSearch.findOneAndDelete({
    _id: id,
    user: req.user._id,
  });

  if (!savedSearch) {
    throw new ApiError(404, req.t('errorSavedSearchNotFound'));
  }

  return res.status(200).json(
    new ApiResponse(200, {}, req.t('savedSearchDeletedSuccess'))
  );
});

export {
  createSavedSearch,
  getUserSavedSearches,
  deleteSavedSearch,
};