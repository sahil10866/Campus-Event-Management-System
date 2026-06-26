import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true, // Covers the description requirement 
  },
  venue: {
    type: String,
    required: true, // Covers the venue requirement 
  },
  eventDate: {
    type: Date,
    required: true, // Covers the time requirement 
  },
  category: {
    type: String,
    required: true, // Admins manage these categories 
  },
  participantLimit: {
    type: Number,
    required: true, // Organizers can set participant limits 
  },
  currentRegistrations: {
    type: Number,
    default: 0,
  },
  organizers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'], // Admins must approve/reject 
    default: 'pending',
  }
}, { timestamps: true, optimisticConcurrency: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;