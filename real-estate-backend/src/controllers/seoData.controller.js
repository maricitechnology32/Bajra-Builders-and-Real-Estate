import { SeoData } from '../models/seoData.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @description Create or update SEO data for a specific page. Admin access required.
 * @route POST /api/v1/seo
 * @access Private/Admin
 */
const upsertSeoData = asyncHandler(async (req, res) => {
  const { pageIdentifier, metaTitle, metaDescription, metaKeywords } = req.body;

  if (!pageIdentifier || !metaTitle) {
    throw new ApiError(400, req.t('errorAllFieldsRequired'));
  }

  // Find and update, or create if it doesn't exist (upsert)
  const seoData = await SeoData.findOneAndUpdate(
    { pageIdentifier },
    {
      $set: {
        pageIdentifier,
        metaTitle,
        metaDescription,
        metaKeywords,
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, seoData, req.t('seoDataSavedSuccess'))
  );
});

/**
 * @description Get SEO data for a specific page. Public access.
 * @route GET /api/v1/seo/:pageIdentifier
 * @access Public
 */
const getSeoData = asyncHandler(async (req, res) => {
  const { pageIdentifier } = req.params;
  const seoData = await SeoData.findOne({ pageIdentifier });

  if (!seoData) {
    throw new ApiError(404, req.t('errorSeoDataNotFound'));
  }

  return res.status(200).json(
    new ApiResponse(200, seoData, req.t('seoDataFetchedSuccess'))
  );
});

export { getSeoData, upsertSeoData };

