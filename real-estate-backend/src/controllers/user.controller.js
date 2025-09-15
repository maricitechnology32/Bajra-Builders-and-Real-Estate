import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/mail.js'; // Import the email utility
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import crypto from 'crypto';


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

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is missing');
  }

  // Upload to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, 'Error while uploading avatar');
  }

  // Update user's avatar in the database
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: {
          url: avatar.secure_url,
          cloudinary_id: avatar.public_id,
        },
      },
    },
    { new: true }
  ).select('-password -refreshToken');

  // Here you could also add logic to delete the old avatar from Cloudinary

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Avatar updated successfully'));
});



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

const forgotPassword = asyncHandler(async (req, res, next) => {
  // 1. Get user based on posted email
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, 'Please provide an email');
  }
  const user = await User.findOne({ email });

  // Note: We send the same response whether the user is found or not
  // This prevents attackers from guessing which emails are registered.
  if (user) {
    // 2. Generate the random reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3. Create the reset URL and send it via email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/reset-password/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });
    } catch (err) {
      // If email fails, clear the token from the DB and throw an error
      user.forgotPasswordToken = undefined;
      user.forgotPasswordTokenExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApiError(500, 'There was an error sending the email. Try again later.');
    }
  }

  res.status(200).json(new ApiResponse(200, {}, "Token sent to email!"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, phoneNumber, address, bio } = req.body;

  // Check if at least one field to update has been provided.
  if (!fullName && !phoneNumber && !address && !bio) {
    throw new ApiError(400, 'At least one field is required to update');
  }

  // Find the user by the ID from the JWT token and update the provided fields.
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        ...(fullName && { fullName }),
        ...(phoneNumber && { phoneNumber }),
        ...(address && { address }),
        ...(bio && { bio }),
      },
    },
    { new: true } // This option ensures the updated document is returned.
  ).select('-password -refreshToken');

  // Handle the case where the user might not be found.
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Send a success response with the updated user data.
  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Profile updated successfully'));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, 'Old password and new password are required');
  }

  // 1. Find the user. The verifyJWT middleware gives us req.user
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // 2. Check if the old password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid old password');
  }

  // 3. Set the new password and save
  user.password = newPassword;
  await user.save(); // The pre-save hook will automatically hash the new password

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'));
});





const resetPassword = asyncHandler(async (req, res, next) => {
  // 1. Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });

  // 2. If token has not expired and there is a user, set the new password
  if (!user) {
    throw new ApiError(400, 'Token is invalid or has expired');
  }

  const { password } = req.body;
  if (!password) {
    throw new ApiError(400, 'Please provide a new password');
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  await user.save(); // The pre-save hook will hash the new password

  // 3. Log the user in (optional, but good UX)
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(new ApiResponse(200, {}, 'Password reset successfully'));
});



export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  googleLoginCallback,
  forgotPassword,
  resetPassword,
  updateUserAvatar,
  updateUserProfile,
  changePassword,
};