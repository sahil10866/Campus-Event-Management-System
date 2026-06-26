import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firebaseUid: {
    type: String,
    required: true,
    unique: true, // Links this user to their Firebase Authentication account
  },
  role: {
    type: String,
    enum: ['student', 'organizer', 'admin'], // Restricts roles to only these three
    default: 'student',
  },
  fcmToken: {
    type: String,
    default: null
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt dates

const User = mongoose.model('User', userSchema);
export default User;