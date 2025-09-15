import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { Property } from '../models/property.model.js';

 
const toggleWishlistItem = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    throw new ApiError(400, req.t('errorInvalidPropertyId'));
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(404, req.t('errorPropertyNotFound'));
  }

  const user = await User.findById(userId);
  const isWishlisted = user.wishlist.includes(propertyId);

  let updatedUser;
  if (isWishlisted) {
    // Remove from wishlist
    updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: propertyId } },
      { new: true }
    );
  } else {
    // Add to wishlist
    updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: propertyId } }, // $addToSet prevents duplicates
      { new: true }
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { wishlist: updatedUser.wishlist },
      `Property ${isWishlisted ? 'removed from' : 'added to'} wishlist successfully`
    )
  );
});

 
const getWishlist = asyncHandler(async (req, res) => {
  const userWithWishlist = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'title price locationAddress propertyType images area', // Select which property fields to return
  });

  if (!userWithWishlist) {
    throw new ApiError(404, req.t('errorUserNotFound'));
  }

  return res.status(200).json(
    new ApiResponse(200, userWithWishlist.wishlist, "Wishlist fetched successfully")
  );
});

export { toggleWishlistItem, getWishlist };