// controllers/userController.js
import User from '../models/User.js';

export const syncUser = async (req, res) => {
  try {
    // req.firebaseUser comes from our authMiddleware!
    const { uid, email, name: firebaseName } = req.firebaseUser;

    // Get the name and FCM token from the request body
    const nameFromBody = req.body.name;
    const fcmToken = req.body.fcmToken; // 🛑 NEW: Grab the token!

    // 1. Check if the user already exists in MongoDB
    let user = await User.findOne({ firebaseUid: uid });

    // 2. If they don't exist, create a new user profile
    if (!user) {
      user = new User({
        firebaseUid: uid,
        email: email,
        name: nameFromBody || firebaseName || 'Campus User',
        role: 'student', 
        fcmToken: fcmToken || null, // 🛑 NEW: Save the token on creation
      });
      
      await user.save();
      
      return res.status(201).json({ message: 'New user created', user });
    }

    // 3. If they DO exist, check if we need to update their info
    let isUpdated = false;

    // Update name if it was never set
    if (nameFromBody && user.name === 'Campus User') {
      user.name = nameFromBody;
      isUpdated = true;
    }

    // 🛑 NEW: Update FCM token if they logged in on a new browser/device
    if (fcmToken && user.fcmToken !== fcmToken) {
      user.fcmToken = fcmToken;
      isUpdated = true;
    }

    // Save changes if anything was updated
    if (isUpdated) {
      await user.save();
    }

    res.status(200).json({ message: 'User synced successfully', user });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};