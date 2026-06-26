// controllers/adminController.js
import User from '../models/User.js';
import Event from '../models/Events.js';
import Registration from '../models/Registration.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admin only' });
    }

    const users = await User.find().select('-firebaseUid').sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admin only' });
    }

    const { role } = req.body;
    
    if (!['student', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    // Optional: Prevent admin from demoting themselves (failsafe)
    if (req.params.id === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot demote yourself' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-firebaseUid');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: `User role updated to ${role}`, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

// Get Dashboard Metrics
export const getMetrics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admin only' });
    }

    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments({ status: 'approved' });
    const totalRegistrations = await Registration.countDocuments();

    res.status(200).json({
      totalUsers,
      totalEvents,
      totalRegistrations
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching metrics', error: error.message });
  }
};
