import mongoose from 'mongoose';

const seoDataSchema = new mongoose.Schema(
  {
    pageIdentifier: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    metaTitle: {
      en: { type: String, required: true },
      ne: { type: String, required: true },
    },
    metaDescription: {
      en: { type: String },
      ne: { type: String },
    },
    metaKeywords: {
      en: { type: [String] },
      ne: { type: [String] },
    },
  },
  {
    timestamps: true,
  }
);

export const SeoData = mongoose.model('SeoData', seoDataSchema);