 

import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    // --- UPDATE THESE FIELDS ---
    title: {
      en: { type: String, required: true, trim: true },
      ne: { type: String, required: true, trim: true },
    },
    slug: {
      type: String,
      required: true,
      unique: false,
      lowercase: true,
      index: true,
    },
    content: {
      en: { type: String, required: true },
      ne: { type: String, required: true },
    },
    excerpt: {
      en: { type: String, trim: true },
      ne: { type: String, trim: true },
    },

    // --- The rest of the model is likely correct ---
    featuredImage: {
      url: { type: String },
      cloudinary_id: { type: String },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
    },
    tags: { type: [String] },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: [String] },
  },
  {
    timestamps: true,
  }
);

// This hook automatically creates the slug from the ENGLISH title
postSchema.pre('validate', function (next) {
  if (this.isModified('title.en')) {
    this.slug = (this.title.en || '')
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }
  next();
});

export const Post = mongoose.model('Post', postSchema);