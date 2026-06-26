import admin from "firebase-admin";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  try {
    // Grab the header (checking both lowercase and uppercase just in case)
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // Check if it exists and is formatted correctly
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token provided, access denied." });
    }

    // Extract just the token string
    const token = authHeader.split(" ")[1];

    // Verify with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Find user in MongoDB
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    req.user = user;
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};
