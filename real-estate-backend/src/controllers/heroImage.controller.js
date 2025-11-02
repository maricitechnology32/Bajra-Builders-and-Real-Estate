import { HeroImage } from '../models/heroImage.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';

// This function must be defined
const getPublicHeroImages = asyncHandler(async (req, res) => {
  const images = await HeroImage.find({ isActive: true }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, images, "Hero images fetched successfully"));
});
const addHeroImage = asyncHandler(async (req, res) => {
  const { title, subtitle } = req.body;
  const imageFiles = req.files;

  if (!imageFiles || imageFiles.length === 0) {
    throw new ApiError(400, "At least one image file is required");
  }
  const imageUploadPromises = imageFiles.map(file => uploadOnCloudinary(file.path));
  const uploadedImages = await Promise.all(imageUploadPromises);
  if (uploadedImages.some(upload => !upload)) {
    throw new ApiError(500, 'Failed to upload one or more images');
  }
  const imagesForDb = uploadedImages.map(upload => ({
    url: upload.secure_url,
    cloudinary_id: upload.public_id,
  }));
  const heroImage = await HeroImage.create({
    title: JSON.parse(title),
    subtitle: JSON.parse(subtitle),
    images: imagesForDb,
  });
  return res.status(201).json(new ApiResponse(201, heroImage, "Hero slide added successfully"));
});

const deleteHeroImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const heroSlide = await HeroImage.findById(id);

    if (!heroSlide) {
      throw new ApiError(404, "Hero slide not found");
    }
    if (heroSlide.images && heroSlide.images.length > 0) {
        const deletePromises = heroSlide.images.map(img => deleteFromCloudinary(img.cloudinary_id));
        await Promise.all(deletePromises);
    }
    await HeroImage.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, {}, "Hero slide deleted successfully"));
});

// Admin: Get all hero images (both active and inactive)
const getAdminAllHeroImages = asyncHandler(async (req, res) => {
    const images = await HeroImage.find({}).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, images, "Admin hero images fetched successfully"));
});

// Admin: Update a hero image (e.g., to toggle isActive status)
const updateHeroImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, subtitle, isActive } = req.body;
    const updatedImage = await HeroImage.findByIdAndUpdate(id, { title, subtitle, isActive }, { new: true });

    if (!updatedImage) {
      throw new ApiError(404, "Image not found");
    }
    return res.status(200).json(new ApiResponse(200, updatedImage, "Hero image updated successfully"));
});
// The names here must exactly match the functions defined above
export { addHeroImage, deleteHeroImage, getAdminAllHeroImages, getPublicHeroImages, updateHeroImage };

