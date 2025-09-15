import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload the file on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    // File has been uploaded successfully
    fs.unlinkSync(localFilePath); // Remove the locally saved temporary file
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // Remove the temp file as the upload failed
    return null;
  }
};
const deleteFromCloudinary = async (cloudinary_id) => {
  try {
    if (!cloudinary_id) return null;
    // Delete the file from Cloudinary
    await cloudinary.uploader.destroy(cloudinary_id);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };