import mongoose from 'mongoose';

const heroImageSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true },
      ne: { type: String, required: true },
    },
    subtitle: {
      en: { type: String },
      ne: { type: String },
    },
     images: [
      {
        url: { type: String, required: true },
        cloudinary_id: { type: String, required: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const HeroImage = mongoose.model('HeroImage', heroImageSchema);