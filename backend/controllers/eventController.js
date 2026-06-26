// controllers/eventController.js
import Event from "../models/Events.js";
import Registration from "../models/Registration.js";


export const createEvent = async (req, res) => {
    try {
        
        // Security check: Only organizers should be able to create events
        if(req.user.role === 'student'){
            return res.status(403).json({ message: 'Only organizers can create events' });
        }

        // Extract event details from the request body
        const {title, description, venue, eventDate, category, participantLimit} = req.body;

        // Create a new event document in MongoDB
        const newEvent = new Event({
            title,
            description,
            venue,
            eventDate,
            category,
            participantLimit,

            organizers: [req.user._id], 
            status: 'pending' // New events start as pending and require admin approval
        })

        // Save the new event to the database
        await newEvent.save();

        // Return a success response
        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
        // Return an error response
        res.status(500).json({ message: 'Error creating event', error });
    }
};

// Get all events that are pending approval (Admin only)
export const getPendingEvents = async (req, res) => {
    try {
        if(req.user.role !== 'admin'){
            return res.status(403).json({ message: 'Access Denied: Admin only' });
        }
        const pendingEvents = await Event.find({ status: 'pending' }).populate('organizers', 'name email');
        res.status(200).json({ pendingEvents });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending events', error });
    }
};

// Approve or reject an event (Admin only)
export const updateEventStatus = async (req, res) => {
    try {
        if(req.user.role !== 'admin'){
            return res.status(403).json({ message: 'Access Denied: Admin only' });
        }

        const {status} = req.body; // expected to be 'approved' or 'rejected'
        if(!['approved', 'rejected'].includes(status)){
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Update the event's status only if it is currently pending
        const updatedEvent = await Event.findOneAndUpdate(
            { _id: req.params.id, status: 'pending' }, // Status guard
            { status },
           { new: true } // Return the updated document
        );

        if(!updatedEvent){
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: `Event ${status} successfully`, event: updatedEvent });

    } catch (error) {
        res.status(500).json({ message: 'Error updating event status', error });
    }
};

export const getApprovedEvents = async (req, res) => {
    try {
        // Fetch events that are approved
        const approvedEvents = await Event.find({ status: 'approved' }).populate('organizers', 'name email');
        res.status(200).json({ approvedEvents });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching approved events', error });
    }
};

// Get events created by the logged-in organizer
export const getMyEvents = async (req, res) => {
  try {
    // Find events where this user's ID is inside the 'organizers' array
    const events = await Event.find({ organizers: req.user._id });
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your events', error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Authorization check: Only the organizer of this event (or an admin) can delete it
    const isOrganizer = event.organizers.includes(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Delete all registrations for this event
    await Registration.deleteMany({ event: eventId });

    // Delete the event itself
    await Event.findByIdAndDelete(eventId);

    res.status(200).json({ message: 'Event and associated registrations deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};