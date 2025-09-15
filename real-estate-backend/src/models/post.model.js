import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String, // A short summary for display in lists
      trim: true,
    },
    featuredImage: {
      url: { type: String },
      cloudinary_id: { type: String },
    },
    // Reference to the Admin who wrote the post
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
    tags: {
      type: [String],
    },
    // Fields for SEO Management (User Story 37)
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: [String] },
  },
  {
    timestamps: true,
  }
);

// Mongoose hook to automatically generate a slug from the title before saving
postSchema.pre('validate', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
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