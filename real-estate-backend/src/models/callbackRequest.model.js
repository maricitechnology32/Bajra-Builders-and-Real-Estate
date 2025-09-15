import mongoose from 'mongoose';

const callbackRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please fill a valid 10-digit phone number'],
    },
    // A text field for the user to specify a convenient time, e.g., "Morning" or "4 PM - 5 PM"
    preferredTime: {
      type: String,
      trim: true,
    },
    // Status for admin management
    status: {
      type: String,
      enum: ['Pending', 'Contacted', 'Closed'],
      default: 'Pending',
    },
    // Optional notes for the admin
    notes: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

export const CallbackRequest = mongoose.model(
  'CallbackRequest',
  callbackRequestSchema
);