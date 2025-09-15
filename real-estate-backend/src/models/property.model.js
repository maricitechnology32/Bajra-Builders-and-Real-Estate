import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      index: true,
    },
    locationAddress: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // Format: [longitude, latitude]
        required: true,
        index: '2dsphere', // Index for efficient location-based queries
      },
    },
    propertyType: {
      type: String,
      required: true,
      enum: ['Land', 'House', 'Apartment', 'Commercial'],
    },
    status: {
      type: String,
      enum: ['Available', 'Sold', 'Pending'],
      default: 'Available',
    },
    area: {
      type: String, // e.g., "4 Aana" or "1200 sq. ft."
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    amenities: {
      type: [String], // e.g., ["Parking", "Garden", "24/7 Water"]
    },
    images: [
      {
        url: { type: String, required: true },
        sourceType: {
          type: String,
          enum: ['upload', 'link'],
          required: true,
        },
        cloudinary_id: { type: String }, // Only for 'upload' type
      },
    ],
    videos: [
      {
        url: { type: String, required: true },
        sourceType: {
          type: String,
          enum: ['upload', 'link'],
          required: true,
        },
        cloudinary_id: { type: String }, // Only for 'upload' type
      },
    ],
    virtualTour: {
      url: { type: String },
      sourceType: { type: String, enum: ['upload', 'link'] },
      cloudinary_id: { type: String }, // Only for 'upload' type
    },
    
    listedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    costDetails: {
      basePrice: { type: Number },
      taxes: { type: Number },
      registrationFees: { type: Number },
      otherCharges: { type: Number },
    },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: [String] },
  },
  {
    timestamps: true,
  }
);

export const Property = mongoose.model('Property', propertySchema);