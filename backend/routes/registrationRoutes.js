import express from "express";
import { registerForEvent, getMyRegistrations, verifyTicket, getEventParticipants } from "../controllers/registrationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/registrations/my-tickets - Get my registrations (protected route) - Optional, can be implemented later
router.get('/my-tickets', verifyToken, getMyRegistrations);

// POST /api/registrations/verify 
router.post('/verify', verifyToken, verifyTicket);

// POST /api/registrations/:eventId - Register for an event (protected route)
router.post('/:eventId', verifyToken, registerForEvent);

// GET /api/registrations/event/:eventId/participants - Get all participants for an event (protected route)
router.get('/event/:eventId/participants', verifyToken, getEventParticipants);
export default router;