import { PageContent } from '../models/pageContent.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @description Get content for a specific page.
 * @route GET /api/v1/pages/:pageIdentifier
 * @access Public
 */
const getPageContent = asyncHandler(async (req, res) => {
    const { pageIdentifier } = req.params;
    const content = await PageContent.findOne({ pageIdentifier });

    if (!content) {
        throw new ApiError(404, req.t('errorSeoDataNotFound')); // Using a generic 'content not found' key
    }

    return res.status(200).json(new ApiResponse(200, content, req.t('seoDataFetchedSuccess')));
});

/**
 * @description Create or update content for a specific page.
 * @route POST /api/v1/pages
 * @access Private/Admin
 */
const upsertPageContent = asyncHandler(async (req, res) => {
    const { pageIdentifier, title, content, coreValues } = req.body;
    
    if (!pageIdentifier || !title || !content) {
        throw new ApiError(400, 'Page identifier, title, and content are required.');
    }

    // Find a document with the given identifier and update it,
    // or create a new one if it doesn't exist (upsert: true).
    const pageContent = await PageContent.findOneAndUpdate(
        { pageIdentifier },
        { 
            title, 
            content, 
            coreValues 
        },
        { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json(new ApiResponse(200, pageContent, req.t('seoDataSavedSuccess')));
});


export {
    getPageContent,
    upsertPageContent
};
