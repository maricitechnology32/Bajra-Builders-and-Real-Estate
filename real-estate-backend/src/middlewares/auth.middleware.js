// import { ApiError } from '../utils/ApiError.js';
// import { asyncHandler } from '../utils/asyncHandler.js';
// import jwt from 'jsonwebtoken';
// import { User } from '../models/user.model.js';

// export const verifyJWT = asyncHandler(async (req, _, next) => {
//   try {
//     // 1. Get the access token from the user's cookies or Authorization header
//     const token =
//       req.cookies?.accessToken ||
//       req.header('Authorization')?.replace('Bearer ', '');

//     // 2. If no token is found, throw an unauthorized error
//     if (!token) {
//       throw new ApiError(401, 'Unauthorized request');
//     }

//     // 3. Verify the token using the secret key
//     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//     // 4. Find the user in the database based on the ID from the token
//     // Exclude sensitive fields like password and refreshToken
//     const user = await User.findById(decodedToken?._id).select(
//       '-password -refreshToken'
//     );

//     // 5. If no user is found, the token is invalid
//     if (!user) {
//       throw new ApiError(401, 'Invalid Access Token');
//     }

//     // 6. Attach the user object to the request for use in subsequent controllers
//     req.user = user;
//     next();
//   } catch (error) {
//     // Handle specific JWT errors like expiration or malformed tokens
//     throw new ApiError(401, error?.message || 'Invalid access token');
//   }
// });


// export const verifyRole = (allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user || !allowedRoles.includes(req.user.role)) {
//       throw new ApiError(403, 'Forbidden: You do not have permission to access this resource');
//     }
//     next();
//   };
// };

import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

/**
 * @description Verifies the JWT token from cookies or headers to authenticate a user.
 * Attaches the user object to the request if authentication is successful.
 */
export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unauthorized request');
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken'
    );

    if (!user) {
      throw new ApiError(401, 'Invalid Access Token');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid access token');
  }
});

/**
 * @description Verifies if the user's role is included in the list of allowed roles.
 * This middleware should be used AFTER verifyJWT.
 * @param {string[]} allowedRoles - An array of roles that are allowed to access the route.
 * @returns Express middleware function.
 */
export const verifyRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized request');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403, // 403 Forbidden is more appropriate than 401 Unauthorized here
        'You do not have permission to perform this action'
      );
    }
    next();
  };
};