import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    // A reference to the user who wrote the testimonial for authenticity
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    // Status for admin moderation
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
   videoUrl: {
  type: String,
  trim: true,
  
},
  },
  {
    timestamps: true,
  }
);

export const Testimonial = mongoose.model('Testimonial', testimonialSchema);