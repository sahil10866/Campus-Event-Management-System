// controllers/notificationController.js
import admin from 'firebase-admin';
import Registration from '../models/Registration.js';
import Event from '../models/Events.js';

export const sendEventNotification = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, message } = req.body;

    // 1. Verify the user is an organizer or admin
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // 2. Find the event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // 3. Find all students registered for this event and get their user profiles
    const registrations = await Registration.find({ event: eventId }).populate('student');
    
    // 4. Extract all valid FCM tokens from those students
    const tokens = registrations
      .map(reg => reg.student?.fcmToken)
      .filter(token => token != null); // Filter out users who haven't enabled notifications

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'No registered users have notifications enabled.' });
    }

    // 5. Build the Firebase Message
    const payload = {
      notification: {
        title: `${event.title}: ${title}`,
        body: message,
      },
      tokens: tokens // Send to this array of device tokens
    };

    // 6. Blast it out using Firebase Admin!
    const response = await admin.messaging().sendEachForMulticast(payload);
    
    res.status(200).json({ 
      message: 'Notifications sent successfully!', 
      successCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Failed to send notifications', error: error.message });
  }
};