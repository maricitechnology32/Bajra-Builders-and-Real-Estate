import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true, trim: true },
      ne: { type: String, required: true, trim: true },
    },
    description: {
      en: { type: String, required: true, trim: true },
      ne: { type: String, required: true, trim: true },
    },
    // This will store the name of an icon (e.g., from an icon library) for the frontend to use
    icon: {
      type: String,
      required: true,
    },
    // Allows an admin to toggle a service on or off without deleting it
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Service = mongoose.model('Service', serviceSchema);