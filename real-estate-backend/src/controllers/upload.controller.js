import { v2 as cloudinary } from 'cloudinary';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getCloudinarySignature = asyncHandler(async (req, res) => {
  const timestamp = Math.round((new Date).getTime()/1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
    },
    process.env.CLOUDINARY_API_SECRET
  );
  res.status(200).json(
    new ApiResponse(200, { timestamp, signature }, "Signature generated successfully")
  );
});

export { getCloudinarySignature };
