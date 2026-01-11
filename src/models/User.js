import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    name: {
        type: String,
        default: null,
    },
    image: {
        type: String,
        default: null,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allows null values but enforces uniqueness when present
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
});

// Prevent model overwrite during hot reloads
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
