

import mongoose from 'mongoose';
import { Property } from '../models/property.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';






// const createProperty = asyncHandler(async (req, res) => {
//   // Destructure all fields, including the new costDetails object
//   const {
//     title, description, price, locationAddress, location, propertyType,
//     status, area, bedrooms, bathrooms, amenities, images, videos, virtualTour,
//     costDetails, // Add this
//     metaTitle, metaDescription, metaKeywords
//   } = req.body;

//   if (!title || !description || !price || !locationAddress || !location || !propertyType) {
//     throw new ApiError(400, req.t('errorAllFieldsRequired'));
//   }

//   const property = await Property.create({
//     title, description, price, locationAddress, location, propertyType,
//     status, area, bedrooms, bathrooms, amenities, images, videos, virtualTour,
//     costDetails, // Add this
//     metaTitle,
//     metaDescription,
//     metaKeywords: metaKeywords ? metaKeywords.split(',').map(key => key.trim()) : [],
//     listedBy: req.user._id,
//   });

//   if (!property) {
//     throw new ApiError(500, 'Something went wrong while creating the property');
//   }

//   return res.status(201).json(
//     new ApiResponse(201, property, req.t('propertyListedSuccess'))
//   );
// });


// const createProperty = asyncHandler(async (req, res) => {
//   // 1. Destructure text fields from req.body
//   const {
//     title, description, price, locationAddress, location, propertyType,
//     status, area, bedrooms, bathrooms, amenities, videos, virtualTour,
//     metaTitle, metaDescription, metaKeywords
//   } = req.body;

//   // 2. Get the uploaded image files from req.files
//   const imageFiles = req.files;

//   // 3. Basic Validation
//   if (!title || !description || !price || !locationAddress || !location) {
//     throw new ApiError(400, req.t('errorAllFieldsRequired'));
//   }
//   if (!imageFiles || imageFiles.length === 0) {
//     throw new ApiError(400, 'At least one image is required.');
//   }

//   // 4. Upload all images to Cloudinary in parallel
//   const imageUploadPromises = imageFiles.map(file => uploadOnCloudinary(file.path));
//   const uploadedImages = await Promise.all(imageUploadPromises);

//   if (uploadedImages.some(upload => !upload)) {
//     throw new ApiError(500, 'Failed to upload one or more images to Cloudinary.');
//   }

//   // 5. Format the image data for the database model
//   const imagesForDb = uploadedImages.map(upload => ({
//     url: upload.secure_url,
//     cloudinary_id: upload.public_id,
//     sourceType: 'upload'
//   }));

//   // 6. Create the property with all the data
//   const property = await Property.create({
//     title, description, price, locationAddress, location, propertyType,
//     status, area, bedrooms, bathrooms,
//     amenities: amenities ? amenities.split(',').map(item => item.trim()) : [],
//     images: imagesForDb,
//     videos, // Assuming these are sent as links for now
//     virtualTour,
//     metaTitle,
//     metaDescription,
//     metaKeywords: metaKeywords ? metaKeywords.split(',').map(key => key.trim()) : [],
//     listedBy: req.user._id,
//   });

//   if (!property) {
//     throw new ApiError(500, 'Something went wrong while creating the property');
//   }

//   return res.status(201).json(
//     new ApiResponse(201, property, req.t('propertyListedSuccess'))
//   );
// });

const createProperty = asyncHandler(async (req, res) => {
  const {
    title, description, price, locationAddress, location, propertyType,
    status, area, bedrooms, bathrooms, amenities, 
    videoUrl, virtualTourUrl, // Now accepting URLs as strings
    metaTitle, metaDescription, metaKeywords 
  } = req.body;
  
  const imageFiles = req.files;

  if (!title?.en || !description?.en || !price || !locationAddress?.en || !location) {
    throw new ApiError(400, req.t('errorAllFieldsRequired'));
  }

  // Handle image uploads (this part remains the same)
  let imagesForDb = [];
  if (imageFiles && imageFiles.length > 0) {
      const imageUploadPromises = imageFiles.map(file => uploadOnCloudinary(file.path));
      const uploadedImages = await Promise.all(imageUploadPromises);
      
      if (uploadedImages.some(upload => !upload)) {
        throw new ApiError(500, 'Failed to upload one or more images.');
      }

      imagesForDb = uploadedImages.map(upload => ({
        url: upload.secure_url,
        cloudinary_id: upload.public_id,
        sourceType: 'upload'
      }));
  }

  const property = await Property.create({
    title, description, price, locationAddress, location, propertyType, status, area, 
    bedrooms, bathrooms,
    amenities: amenities ? amenities.split(',').map(item => item.trim()) : [],
    images: imagesForDb,
    videoUrl, // Save the URL string
    virtualTourUrl, // Save the URL string
    metaTitle, metaDescription,
    metaKeywords: metaKeywords ? metaKeywords.split(',').map(key => key.trim()) : [],
    listedBy: req.user._id,
  });

  if (!property) {
    throw new ApiError(500, 'Something went wrong while creating the property');
  }

  return res.status(201).json(
    new ApiResponse(201, property, req.t('propertyListedSuccess'))
  );
});


// const getAllProperties = asyncHandler(async (req, res) => {
//   // --- Filtering & Searching ---
//   const { search, propertyType, status, minPrice, maxPrice } = req.query;
//   const query = {};

//   // Build search query for title and locationAddress (case-insensitive)
//   if (search) {
//     query.$or = [
//       { title: { $regex: search, $options: 'i' } },
//       { locationAddress: { $regex: search, $options: 'i' } },
//     ];
//   }

//   // Build filter query for propertyType
//   if (propertyType) {
//     query.propertyType = propertyType;
//   }

//   // Build filter query for status
//   if (status) {
//     query.status = status;
//   }

//   // Build filter query for price range
//   if (minPrice || maxPrice) {
//     query.price = {};
//     if (minPrice) query.price.$gte = Number(minPrice);
//     if (maxPrice) query.price.$lte = Number(maxPrice);
//   }

//   // --- Pagination ---
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 10;
//   const skip = (page - 1) * limit;

//   // --- Execute Query ---
//   const properties = await Property.find(query)
//     .populate('listedBy', 'fullName avatar')
//     .sort({ createdAt: -1 }) // Sort by newest first
//     .limit(limit)
//     .skip(skip);

//   // Get the total count of documents matching the query for pagination info
//   const totalProperties = await Property.countDocuments(query);
//   const totalPages = Math.ceil(totalProperties / limit);

//   // --- Send Response ---
//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         properties,
//         pagination: {
//           currentPage: page,
//           totalPages,
//           totalProperties,
//         },
//       },
//       req.t('propertiesFetchedSuccess')
//     )
//   );
// });
const getAllProperties = asyncHandler(async (req, res) => {
  const { search, propertyType, status, minPrice, maxPrice, lang } = req.query;
  const query = {};

  // Detect language (default to 'en')
  const langField = lang === 'ne' ? 'ne' : 'en';

  // --- Search ---
  if (search) {
    query.$or = [
      { [`title.${langField}`]: { $regex: search, $options: 'i' } },
      { [`locationAddress.${langField}`]: { $regex: search, $options: 'i' } },
    ];
  }

  // --- Filters ---
  if (propertyType) query.propertyType = propertyType;
  if (status) query.status = status;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // --- Pagination ---
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // --- Query Execution ---
  const properties = await Property.find(query)
    .populate('listedBy', 'fullName avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalProperties = await Property.countDocuments(query);
  const totalPages = Math.ceil(totalProperties / limit);

  res.status(200).json(
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

  const property = await Property.findById(id).populate(
    'listedBy',
    'fullName avatar email phoneNumber'
  );

  if (!property) {
    throw new ApiError(404, req.t('errorPropertyNotFound'));
  }

  // --- NEW LOGIC for finding similar properties ---
  const priceRange = property.price * 0.30; // +/- 30% of the price
  const minPrice = property.price - priceRange;
  const maxPrice = property.price + priceRange;

  const similarProperties = await Property.find({
    _id: { $ne: id }, // Exclude the current property itself
    propertyType: property.propertyType, // Match the same property type
    price: { $gte: minPrice, $lte: maxPrice }, // Match a similar price range
  })
    .limit(4) // Limit to 4 recommendations
    .select('title price locationAddress propertyType images'); // Select only a few key fields

  return res.status(200).json(
    new ApiResponse(
      200,
      { property, similarProperties }, // Return both the main property and the recommendations
      req.t('propertyDetailsFetchedSuccess')
    )
  );
});

// const updateProperty = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, req.t('errorInvalidPropertyId'));
//   }

//   const updatedProperty = await Property.findByIdAndUpdate(
//     id,
//     {
//       $set: req.body,
//     },
//     { new: true, runValidators: true }
//   );

//   if (!updatedProperty) {
//     throw new ApiError(404, req.t('errorPropertyNotFound'));
//   }

//   return res.status(200).json(
//     new ApiResponse(200, updatedProperty, req.t('propertyUpdatedSuccess'))
//   );
// });

// const updateProperty = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { metaKeywords, ...restOfBody } = req.body;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, req.t('errorInvalidPropertyId'));
//   }

//   const updateData = { ...restOfBody };

//   // If metaKeywords are provided as a string, convert them to an array
//   if (metaKeywords) {
//     updateData.metaKeywords = metaKeywords.split(',').map(key => key.trim());
//   }

//   const updatedProperty = await Property.findByIdAndUpdate(
//     id,
//     { $set: updateData },
//     { new: true, runValidators: true }
//   );

//   if (!updatedProperty) {
//     throw new ApiError(404, req.t('errorPropertyNotFound'));
//   }

//   return res.status(200).json(
//     new ApiResponse(200, updatedProperty, req.t('propertyUpdatedSuccess'))
//   );
// });


const updateProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, req.t('errorInvalidPropertyId'));
  }
  
  // Find the property to get existing image data
  const propertyToUpdate = await Property.findById(id);
  if (!propertyToUpdate) {
    throw new ApiError(404, req.t('errorPropertyNotFound'));
  }

  // Handle addition of new images
  let newImagesForDb = [];
  if (req.files && req.files.length > 0) {
    const imageUploadPromises = req.files.map(file => uploadOnCloudinary(file.path));
    const uploadedImages = await Promise.all(imageUploadPromises);

    if (uploadedImages.some(upload => !upload)) {
        throw new ApiError(500, 'Error uploading new images.');
    }
    newImagesForDb = uploadedImages.map(upload => ({
        url: upload.secure_url,
        cloudinary_id: upload.public_id,
        sourceType: 'upload'
    }));
  }

 
  updateData.images = [...(propertyToUpdate.images || []), ...newImagesForDb];
  
   if (updateData.amenities && typeof updateData.amenities === 'string') {
    updateData.amenities = updateData.amenities.split(',').map(item => item.trim());
  }
  if (updateData.metaKeywords && typeof updateData.metaKeywords === 'string') {
    updateData.metaKeywords = updateData.metaKeywords.split(',').map(key => key.trim());
  }

  const updatedProperty = await Property.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedProperty, req.t('propertyUpdatedSuccess'))
  );
});

// const deleteProperty = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, req.t('errorInvalidPropertyId'));
//   }

//   const property = await Property.findById(id);

//   if (!property) {
//     throw new ApiError(404, req.t('errorPropertyNotFound'));
//   }

//   const mediaToDelete = [];
//   property.images.forEach(img => img.sourceType === 'upload' && mediaToDelete.push(deleteFromCloudinary(img.cloudinary_id)));
//   property.videos.forEach(vid => vid.sourceType === 'upload' && mediaToDelete.push(deleteFromCloudinary(vid.cloudinary_id)));
//   if (property.virtualTour?.sourceType === 'upload') {
//     mediaToDelete.push(deleteFromCloudinary(property.virtualTour.cloudinary_id));
//   }

//   await Promise.all(mediaToDelete);
//   await Property.findByIdAndDelete(id);

//   return res.status(200).json(
//     new ApiResponse(200, {}, req.t('propertyDeletedSuccess'))
//   );
// });


const deleteProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, req.t('errorInvalidPropertyId'));
  }

  const property = await Property.findById(id);

  if (!property) {
    throw new ApiError(404, req.t('errorPropertyNotFound'));
  }

  // --- ADD SAFETY CHECKS HERE ---
  const mediaToDelete = [];
  
  // Check if images array exists before looping
  if (property.images && property.images.length > 0) {
    property.images.forEach(img => img.sourceType === 'upload' && mediaToDelete.push(deleteFromCloudinary(img.cloudinary_id)));
  }
  
  // Check if videos array exists before looping
  if (property.videos && property.videos.length > 0) {
    property.videos.forEach(vid => vid.sourceType === 'upload' && mediaToDelete.push(deleteFromCloudinary(vid.cloudinary_id)));
  }
  
  // Check if virtualTour exists and was an upload
  if (property.virtualTour?.sourceType === 'upload') {
    mediaToDelete.push(deleteFromCloudinary(property.virtualTour.cloudinary_id));
  }
  
  if (mediaToDelete.length > 0) {
      await Promise.all(mediaToDelete);
  }

  // Delete the property from the database
  await Property.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, {}, req.t('propertyDeletedSuccess'))
  );
});

const getAdminAllProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find().sort({ createdAt: -1 });
  return res.status(200).json(
    new ApiResponse(200, properties, req.t('propertiesFetchedSuccess'))
  );
});


const getFeaturedProperties = asyncHandler(async (req, res) => {
   const properties = await Property.find({ isFeatured: true, status: 'Available' })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('listedBy', 'fullName avatar');

  return res.status(200).json(
    new ApiResponse(200, properties, req.t('propertiesFetchedSuccess'))
  );
});

const toggleFeaturedStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id);

  if (!property) {
    throw new ApiError(404, req.t('errorPropertyNotFound'));
  }

  property.isFeatured = !property.isFeatured; // Toggle the boolean value
  await property.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, property, "Property featured status updated successfully"));
});
const getLatestProperties = asyncHandler(async (req, res) => {
  // Find up to 6 properties that are available, sorted by newest first
  const properties = await Property.find({ status: 'Available' })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('listedBy', 'fullName avatar');

  return res.status(200).json(
    new ApiResponse(200, properties, req.t('propertiesFetchedSuccess'))
  );
});

export {
  createProperty, deleteProperty,
  getAdminAllProperties,
  getAllProperties,
  getFeaturedProperties, getLatestProperties, getPropertyById, toggleFeaturedStatus, updateProperty
};

