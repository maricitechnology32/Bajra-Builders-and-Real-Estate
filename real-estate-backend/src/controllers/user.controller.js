import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
  // 1. Get user details from the request body
  const { fullName, email, password } = req.body;

  // 2. Validate that no fields are empty
  if ([fullName, email, password].some((field) => field?.trim() === '')) {
    throw new ApiError(400, 'All fields are required');
  }

  // 3. Check if the user already exists
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  // 4. Create a new user object and save it to the database
  const user = await User.create({
    fullName,
    email,
    password,
  });

  // 5. Retrieve the created user from the database (excluding password and refresh token)
  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  // 6. Check if user creation was successful
  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering the user');
  }

  // 7. Send a success response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, 'User registered successfully'));
});

export { registerUser };