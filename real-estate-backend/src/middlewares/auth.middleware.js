import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // 1. Get the access token from the user's cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    // 2. If no token is found, throw an unauthorized error
    if (!token) {
      throw new ApiError(401, 'Unauthorized request');
    }

    // 3. Verify the token using the secret key
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 4. Find the user in the database based on the ID from the token
    // Exclude sensitive fields like password and refreshToken
    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken'
    );

    // 5. If no user is found, the token is invalid
    if (!user) {
      throw new ApiError(401, 'Invalid Access Token');
    }

    // 6. Attach the user object to the request for use in subsequent controllers
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors like expiration or malformed tokens
    throw new ApiError(401, error?.message || 'Invalid access token');
  }
});