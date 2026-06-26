import express from "express";
import { createEvent, getPendingEvents, updateEventStatus, getApprovedEvents, getMyEvents, deleteEvent } from "../controllers/eventController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { sendEventNotification } from '../controllers/notificationController.js';

const router = express.Router();

// POST /api/events - Create a new event (protected route)
router.post('/', verifyToken, createEvent);

// Admin routes
router.get('/pending', verifyToken, getPendingEvents);
router.patch('/:id/status', verifyToken, updateEventStatus);

// Discovery & Organizer routes
router.get('/approved', verifyToken, getApprovedEvents);
router.get('/my-events', verifyToken, getMyEvents);
router.delete('/:id', verifyToken, deleteEvent);


// POST /api/events/notify/:eventId - Send push notification
router.post('/notify/:eventId', verifyToken, sendEventNotification);

export default router;