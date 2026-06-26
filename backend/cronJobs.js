import mongoose from 'mongoose';
import cron from 'node-cron';
import Event from './models/Events.js';
import Registration from './models/Registration.js';

const cleanupPastEvents = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log('Running cleanup of past events...');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Find events that happened before today
    const pastEvents = await Event.find({ eventDate: { $lt: today } }).session(session);

    if (pastEvents.length > 0) {
      const eventIds = pastEvents.map(event => event._id);

      // Delete all registrations associated with these events
      const regResult = await Registration.deleteMany({ event: { $in: eventIds } }, { session });

      // Delete the events
      await Event.deleteMany({ _id: { $in: eventIds } }, { session });

      await session.commitTransaction();
      console.log(`Cleanup complete: Deleted ${pastEvents.length} past events and ${regResult.deletedCount} related registrations.`);
    } else {
      await session.commitTransaction();
      console.log('Cleanup complete: No past events to clean up.');
    }
  } catch (error) {
    await session.abortTransaction();
    console.error('Error during cleanup of past events:', error);
  } finally {
    session.endSession();
  }
}

// Run every day at midnight
export const startCronJobs = () => {
  // Run immediately on boot
  cleanupPastEvents();

  // Schedule to run daily at 00:00
  cron.schedule('0 0 * * *', cleanupPastEvents);
};
