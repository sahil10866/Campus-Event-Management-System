import express from 'express';
import { getAllUsers, updateUserRole, getMetrics } from '../controllers/adminController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/admin/metrics
router.get('/metrics', verifyToken, getMetrics);

// GET /api/admin/users
router.get('/users', verifyToken, getAllUsers);

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', verifyToken, updateUserRole);

export default router;
