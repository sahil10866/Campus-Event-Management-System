import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Who is attending?
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', // What event are they attending?
    required: true,
  },
  qrCodeData: {
    type: String,
    required: true, // This string will be converted into the visual QR code 
    unique: true,
  },
  isCheckedIn: {
    type: Boolean,
    default: false, // Will turn to true when the organizer scans the QR code 
  }
}, { timestamps: true });

// Ensure a student can only register for an exact event once
registrationSchema.index({ student: 1, event: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;