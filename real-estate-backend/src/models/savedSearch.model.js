import mongoose from 'mongoose';

const savedSearchSchema = new mongoose.Schema(
  {
    // A reference to the user who created this saved search
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // A user-defined name for their search, e.g., "Apartments in Lazimpat"
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // A nested object containing all the filter criteria
    filters: {
      search: { type: String, trim: true },
      propertyType: {
        type: String,
        enum: ['Land', 'House', 'Apartment', 'Commercial'],
      },
      minPrice: { type: Number },
      maxPrice: { type: Number },
      bedrooms: { type: Number },
      bathrooms: { type: Number },
    },
    // A flag to enable or disable email alerts for this specific search
    emailNotification: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SavedSearch = mongoose.model('SavedSearch', savedSearchSchema);