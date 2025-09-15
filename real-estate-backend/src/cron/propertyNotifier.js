import { Property } from '../models/property.model.js';
import { SavedSearch } from '../models/savedSearch.model.js';
import sendEmail from '../utils/mail.js';

const checkNewPropertiesAndNotify = async () => {
  console.log('🤖 Starting daily property check...');
  try {
    // 1. Define the time frame (e.g., last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 2. Find all new properties
    const newProperties = await Property.find({ createdAt: { $gte: yesterday } });

    if (newProperties.length === 0) {
      console.log('✅ No new properties found in the last 24 hours.');
      return;
    }

    console.log(`🔍 Found ${newProperties.length} new properties. Checking for matches...`);

    // 3. For each new property, find matching saved searches
    for (const property of newProperties) {
      const filters = [];
      const { search, propertyType, minPrice, maxPrice, bedrooms, bathrooms } = property;

      // Build a query based on the property's details
      const matchingQuery = {
        'filters.propertyType': property.propertyType,
        'filters.minPrice': { $lte: property.price },
        'filters.maxPrice': { $gte: property.price },
        'filters.bedrooms': { $lte: property.bedrooms },
        'filters.bathrooms': { $lte: property.bathrooms },
        emailNotification: true, // Only notify users who have alerts enabled
      };

      const savedSearches = await SavedSearch.find(matchingQuery).populate('user', 'email fullName');

      if (savedSearches.length > 0) {
        // 4. Send email notifications
        for (const search of savedSearches) {
          const user = search.user;
          const message = `Hi ${user.fullName},\n\nA new property matching your saved search "${search.name}" has been listed!\n\nTitle: ${property.title}\nPrice: Rs. ${property.price}\nLocation: ${property.locationAddress}\n\nView it here: ${process.env.FRONTEND_URL}/properties/${property._id}\n\nThank you,\nYour Real Estate Team`;

          await sendEmail({
            email: user.email,
            subject: `New Property Alert: ${property.title}`,
            message,
          });
          console.log(`📧 Notification sent to ${user.email} for property ${property.title}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error in property notification cron job:', error);
  }
};

export { checkNewPropertiesAndNotify };