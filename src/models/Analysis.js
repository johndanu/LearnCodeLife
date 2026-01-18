import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true, // Index for faster queries
    },
    code: {
        type: String,
        required: true,
    },
    learningPath: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        default: null,
    },
    framework: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    labels: {
        type: [String],
        default: [],
        index: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
});

// Prevent model overwrite during hot reloads
const Analysis = mongoose.models.Analysis || mongoose.model('Analysis', AnalysisSchema);

export default Analysis;
