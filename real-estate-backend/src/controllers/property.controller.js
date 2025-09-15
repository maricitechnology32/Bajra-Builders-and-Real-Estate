

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Property } from '../models/property.model.js';
import { deleteFromCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

const createProperty = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    locationAddress,
    location,
    propertyType,
    status,
    area,
    bedrooms,
    bathrooms,
    amenities,
    images,
    videos,
    virtualTour,
  } = req.body;

  if (!title || !description || !price || !locationAddress || !location || !propertyType) {
    throw new ApiError(400, req.t('errorAllFieldsRequired'));
  }

  const property = await Property.create({
    title,
    description,
    price,
    locationAddress,
    location,
    propertyType,
    status,
    area,
    bedrooms,
    bathrooms,
    amenities,
    images,
    videos,
    virtualTour,
    listedBy: req.user._id,
  });

  if (!property) {
    throw new ApiError(500, 'Something went wrong while creating the property');
  }

  return res.status(201).json(
    new ApiResponse(201, property, req.t('propertyListedSuccess'))
  );
});

 
const getAllProperties = asyncHandler(async (req, res) => {
  // --- Filtering & Searching ---
  const { search, propertyType, status, minPrice, maxPrice } = req.query;
  const query = {};

  // Build search query for title and locationAddress (case-insensitive)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { locationAddress: { $regex: search, $options: 'i' } },
    ];
  }

  // Build filter query for propertyType
  if (propertyType) {
    query.propertyType = propertyType;
  }

  // Build filter query for status
  if (status) {
    query.status = status;
  }

  // Build filter query for price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // --- Pagination ---
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // --- Execute Query ---
  const properties = await Property.find(query)
    .populate('listedBy', 'fullName avatar')
    .sort({ createdAt: -1 }) // Sort by newest first
    .limit(limit)
    .skip(skip);

  // Get the total count of documents matching the query for pagination info
  const totalProperties = await Property.countDocuments(query);
  const totalPages = Math.ceil(totalProperties / limit);

  // --- Send Response ---
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        properties,
        pagination: {
          currentPage: page,
          totalPages,
          totalProperties,
        },
      },
      req.t('propertiesFetchedSuccess')
    )
  );
});

const getPropertyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, req.t('errorInvalidPropertyId'));
  }

  const property = await Property.findById(id).populate('listedBy', 'fullName avatar');

  if (!property) {
    throw new ApiError(404, req.t('errorPropertyNotFound'));
  }

  return res.status(200).json(
    new ApiResponse(200, property, req.t('propertyDetailsFetchedSuccess'))
  );
});

const updateProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, req.t('errorInvalidPropertyId'));
  }

  const updatedProperty = await Property.findByIdAndUpdate(
    id,
    {
      $set: req.body,
    },
    { new: true, runValidators: true }
  );

  if (!updatedProperty) {
    throw new ApiError(404, req.t('errorPropertyNotFound'));
  }

  return res.status(200).json(
    new ApiResponse(200, updatedProperty, req.t('propertyUpdatedSuccess'))
  );
});

const deleteProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, req.t('errorInvalidPropertyId'));
  }

  const property = await Property.findById(id);

  if (!property) {
    throw new ApiError(404, req.t('errorPropertyNotFound'));
  }

  const mediaToDelete = [];
  property.images.forEach(img => img.sourceType === 'upload' && mediaToDelete.push(deleteFromCloudinary(img.cloudinary_id)));
  property.videos.forEach(vid => vid.sourceType === 'upload' && mediaToDelete.push(deleteFromCloudinary(vid.cloudinary_id)));
  if (property.virtualTour?.sourceType === 'upload') {
    mediaToDelete.push(deleteFromCloudinary(property.virtualTour.cloudinary_id));
  }

  await Promise.all(mediaToDelete);
  await Property.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, {}, req.t('propertyDeletedSuccess'))
  );
});

export {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
};