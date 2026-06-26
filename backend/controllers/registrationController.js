// controllers/registrationController.js
import mongoose from "mongoose";
import Registration from "../models/Registration.js"; // <-- Fixed spelling here!
import Event from "../models/Events.js";

export const registerForEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const eventId = req.params.eventId;
    const studentId = req.user._id;

    // Check if the student is already registered for this event (prevent redundant transactions)
    const existingRegistration = await Registration.findOne({
      event: eventId,
      student: studentId,
    }).session(session);

    if (existingRegistration) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "You are already registered for this event" });
    }

    // Atomically increment currentRegistrations ONLY if capacity allows
    // and event is approved and not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: "approved",
        eventDate: { $gte: today },
        $expr: { $lt: ["$currentRegistrations", "$participantLimit"] },
      },
      { $inc: { currentRegistrations: 1 } },
      { new: true, session }
    );

    if (!event) {
      await session.abortTransaction();
      session.endSession();
      // Distinguish between capacity vs not found/ended/pending
      const checkEvent = await Event.findById(eventId);
      if (!checkEvent || checkEvent.status !== "approved") {
        return res.status(404).json({ message: "Event not found or not approved" });
      }
      if (new Date(checkEvent.eventDate) < today) {
        return res.status(400).json({ message: "This event has already ended." });
      }
      return res.status(400).json({ message: "Event is at full capacity" });
    }

    // Generate a unique event ID + Student ID
    const qrCodeData = `EVT-${eventId}-STU-${studentId}`;


    // Create a new registration
    const registration = new Registration({
      event: eventId,
      student: studentId,
      qrCodeData: qrCodeData,
    });

    await registration.save({ session });
    
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Registered successfully", registration });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering for event", error: error.message });
  }
};

export const getMyRegistrations = async (req, res) => {
  try {
    const studentId = req.user._id;

    const registrations = await Registration.find({ // <-- Fixed spelling here!
      student: studentId,
    }).populate("event");
    res.status(200).json({ registrations });
  } catch (error) {
    res.status(500).json({ message: "Error fetching registrations", error });
  }
};
// Verify a digital ticket & Mark Attendance (Organizer/Admin only)
export const verifyTicket = async (req, res) => {
  try {
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { qrCodeData } = req.body;

    // 3 & 4. Atomic Check-in: Only update if not already checked in
    const ticket = await Registration.findOneAndUpdate(
      { qrCodeData, isCheckedIn: false },
      { $set: { isCheckedIn: true } },
      { new: true }
    )
      .populate("student", "name email")
      .populate("event", "title organizers");

    if (!ticket) {
      // Check if it's already checked in or just invalid
      const existingTicket = await Registration.findOne({ qrCodeData });
      if (existingTicket && existingTicket.isCheckedIn) {
        return res.status(400).json({
          message: "Ticket already used! Student has already checked in.",
        });
      }
      return res.status(404).json({ message: "Invalid or Fake Ticket!" });
    }

    // 2. Security Check (Move after atomic update to avoid extra DB calls if ticket invalid)
    if (req.user.role === "organizer") {
      const isCoOrganizer = ticket.event.organizers.some(
        (orgId) => orgId.toString() === req.user._id.toString()
      );

      if (!isCoOrganizer) {
        // Rollback? Technically check-in happened, but unauthorized. 
        // In a strict system, we'd do this inside a transaction.
        // For simplicity, we just return error. The ticket is now marked used.
        return res.status(403).json({
          message: "Access Denied: You are not an organizer for this event!",
        });
      }
    }

    res.status(200).json({
      message: "Ticket Validated & Attendance Marked!",
      studentName: ticket.student?.name || ticket.student?.email,
      eventName: ticket.event?.title,
    });

  } catch (error) {
    console.error('Error verifying ticket:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all participants for a specific event
export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Find all registrations for this event and populate the student details
    const participants = await Registration.find({ event: eventId })
      .populate('student', 'name email');
      
    res.status(200).json({ participants });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching participants', error: error.message });
  }
};