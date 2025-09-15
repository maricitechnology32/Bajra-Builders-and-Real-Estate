import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

/**
 * @description Generates JWT access and refresh tokens for a user.
 * @param {string} userId - The ID of the user for whom to generate tokens.
 * @returns {object} An object containing the accessToken and refreshToken.
 */
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token to the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      'Something went wrong while generating tokens',
      error
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if ([fullName, email, password].some((field) => field?.trim() === '')) {
    throw new ApiError(400, 'All fields are required');
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const user = await User.create({
    fullName,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering the user');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, 'User registered successfully'));
});

/**
 * @description Handles manual user login with email and password.
 */
const loginUser = asyncHandler(async (req, res) => {
  // 1. Get email and password from request body
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // 2. Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // 3. Verify the password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid user credentials');
  }

  // 4. Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // 5. Send tokens in cookies and response
  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        'User logged in successfully'
      )
    );
});

/**
 * @description Handles user logout by clearing tokens.
 */
const logoutUser = asyncHandler(async (req, res) => {
  // The verifyJWT middleware provides req.user
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 }, // Remove refreshToken from the document
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

/**
 * @description Refreshes an expired access token using a refresh token.
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized request: No refresh token');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired or used');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          'Access token refreshed'
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token');
  }
});

/**
 * @description Gets the details of the currently logged-in user.
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  // The verifyJWT middleware already attached the user object to the request
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'User details fetched successfully'));
});

const googleLoginCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, 'User authentication failed');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .redirect('http://localhost:3000/dashboard');
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  googleLoginCallback,
};