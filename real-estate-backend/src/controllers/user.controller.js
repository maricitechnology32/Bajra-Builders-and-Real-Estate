 

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/mail.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// This helper function does not have access to `req`, so its error messages remain in English.
// The controllers that call it will provide the translated error messages to the user.
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found in token generation');
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating tokens', error);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if ([fullName, email, password].some((field) => field?.trim() === '')) {
    throw new ApiError(400, req.t('errorAllFieldsRequired'));
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, req.t('errorEmailExists'));
  }

  const user = await User.create({ fullName, email, password });
  const createdUser = await User.findById(user._id).select('-password -refreshToken');

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering the user');
  }

  return res.status(201).json(new ApiResponse(201, createdUser, req.t('registrationSuccess')));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, req.t('errorAllFieldsRequired'));
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, req.t('errorUserNotFound'));
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, req.t('errorInvalidCredentials'));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production' };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(new ApiResponse(200, { user: loggedInUser }, req.t('loginSuccess')));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production' };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, req.t('logoutSuccess')));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, req.t('errorUnauthorized'));
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    if (!user || incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, req.t('errorInvalidToken'));
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production' };

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, req.t('accessTokenRefreshed')));
  } catch (error) {
    throw new ApiError(401, req.t('errorInvalidToken'));
  }
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is missing');
  }

  const oldAvatarId = req.user.avatar?.cloudinary_id;
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, 'Error while uploading avatar');
  }

  if (oldAvatarId) {
    await deleteFromCloudinary(oldAvatarId);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: { url: avatar.secure_url, cloudinary_id: avatar.public_id } } },
    { new: true }
  ).select('-password -refreshToken');

  return res.status(200).json(new ApiResponse(200, user, req.t('avatarUpdatedSuccess')));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, req.t('userDetailsFetched')));
});

const googleLoginCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, 'User authentication failed');
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production' };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .redirect('http://localhost:3000/dashboard');
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, 'Please provide an email');
  }
  const user = await User.findOne({ email });

  if (user) {
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `Forgot your password? Click the following link to reset it: ${resetURL}\nIf you didn't forget your password, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });
    } catch (err) {
      user.forgotPasswordToken = undefined;
      user.forgotPasswordTokenExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApiError(500, 'There was an error sending the email. Try again later.');
    }
  }

  res.status(200).json(new ApiResponse(200, {}, req.t('tokenSentToEmail')));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, phoneNumber, address, bio } = req.body;
  if (!fullName && !phoneNumber && !address && !bio) {
    throw new ApiError(400, 'At least one field is required to update');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { ...(fullName && { fullName }), ...(phoneNumber && { phoneNumber }), ...(address && { address }), ...(bio && { bio }) } },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(404, req.t('errorUserNotFound'));
  }

  return res.status(200).json(new ApiResponse(200, user, req.t('profileUpdatedSuccess')));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, 'Old and new passwords are required');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, req.t('errorUserNotFound'));
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid old password');
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, req.t('passwordChangedSuccess')));
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, req.t('errorInvalidToken'));
  }

  const { password } = req.body;
  if (!password) {
    throw new ApiError(400, 'Please provide a new password');
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  await user.save();

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production' };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(new ApiResponse(200, {}, req.t('passwordResetSuccess')));
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