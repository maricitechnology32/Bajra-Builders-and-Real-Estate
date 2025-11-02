 

import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
   
    title: {
      en: { type: String, required: true, trim: true },
      ne: { type: String, required: true, trim: true },
    },
    description: {
      en: { type: String, required: true },
      ne: { type: String, required: true },
    },
    locationAddress: {
      en: { type: String, required: true },
      ne: { type: String, required: true },
    },
 
    price: {
      type: Number,
      required: true,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],  
        required: true,
        index: '2dsphere',
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
    area: { type: String },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    amenities: { type: [String] },
    images: [
      {
        url: { type: String, required: true },
        sourceType: { type: String, enum: ['upload', 'link'], required: true },
        cloudinary_id: { type: String },
      },
    ],
        videoUrl: {
      type: String,
      trim: true,
    },
    virtualTourUrl: {
      type: String,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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