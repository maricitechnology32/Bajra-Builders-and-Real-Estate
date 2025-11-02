import mongoose from 'mongoose';

const valueSchema = new mongoose.Schema({
    icon: { type: String, required: true },
    title: {
        en: { type: String, required: true },
        ne: { type: String, required: true },
    },
    description: {
        en: { type: String, required: true },
        ne: { type: String, required: true },
    },
});

const pageContentSchema = new mongoose.Schema({
    pageIdentifier: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    title: {
        en: { type: String, required: true },
        ne: { type: String, required: true },
    },
    content: {
        en: { type: String, required: true },
        ne: { type: String, required: true },
    },
    coreValues: [valueSchema],
}, { timestamps: true });

export const PageContent = mongoose.model('PageContent', pageContentSchema);