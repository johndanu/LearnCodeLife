import mongoose from 'mongoose';

const TopicExplanationSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
        index: true,
    },
    language: {
        type: String,
        default: 'programming',
    },
    framework: {
        type: String,
        default: null,
    },
    explanation: {
        type: String,
        required: true,
    },
    // We can also tie it to a specific analysis if needed, 
    // but caching globally by topic+language+framework is more efficient 
}, {
    timestamps: true,
});

// Compound index for efficient lookups
TopicExplanationSchema.index({ topic: 1, language: 1, framework: 1 }, { unique: true });

const TopicExplanation = mongoose.models.TopicExplanation || mongoose.model('TopicExplanation', TopicExplanationSchema);

export default TopicExplanation;
