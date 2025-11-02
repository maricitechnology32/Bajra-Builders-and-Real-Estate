import { HeroImage } from '../models/heroImage.model.js';
import { Property } from '../models/property.model.js';
import { Service } from '../models/service.model.js';
import { Testimonial } from '../models/testimonial.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getHomepageData = asyncHandler(async (req, res) => {
  // Run all database queries in parallel for maximum efficiency
  const [
    heroImages,
    featuredProperties,
    latestListings,
    services,
    testimonials,
    propertiesByType,
  ] = await Promise.all([
    HeroImage.find({ isActive: true }).sort({ createdAt: -1 }),
    Property.find({ isFeatured: true, status: 'Available' }).limit(6).sort({ createdAt: -1 }),
    Property.find({ status: 'Available' }).limit(6).sort({ createdAt: -1 }),
    Service.find({ isActive: true }),
    Testimonial.find({ status: 'Approved' }).populate('user', 'fullName avatar').limit(3).sort({ createdAt: -1 }),
    // Fetch a few properties for each type
    Promise.all([
        Property.find({ propertyType: 'House', status: 'Available' }).limit(4).sort({ createdAt: -1 }),
        Property.find({ propertyType: 'Apartment', status: 'Available' }).limit(4).sort({ createdAt: -1 }),
        Property.find({ propertyType: 'Land', status: 'Available' }).limit(4).sort({ createdAt: -1 }),
    ])
  ]);
  
  const homepageData = {
    heroImages,
    featuredProperties,
    latestListings,
    services,
    testimonials,
    propertiesByType: {
        houses: propertiesByType[0],
        apartments: propertiesByType[1],
        lands: propertiesByType[2],
    }
  };

  return res.status(200).json(new ApiResponse(200, homepageData, "Homepage data fetched successfully"));
});

export { getHomepageData };
