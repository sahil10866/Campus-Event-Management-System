import express from "express";
import { syncUser } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/users/sync - Sync user data from Firebase to MongoDB
router.post("/sync", verifyToken, syncUser);

export default router;
