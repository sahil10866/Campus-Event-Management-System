import "dotenv/config";
import express from "express";
import helmet from "helmet";
// import { rateLimit } from "express-rate-limit";
import cors from "cors";
import connectDB from "./config/db.js";
import initFirebase from "./config/firebase.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js"
import registrationRoutes from "./routes/registrationRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { startCronJobs } from "./cronJobs.js";
// Initialize the Express app
const app = express();

// Middleware
app.use(helmet()); // Secure HTTP headers
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://campus-event-management-and-ticketi.vercel.app'
  ]
}));

// Rate Limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
//   message: { message: "Too many requests from this IP, please try again after 15 minutes." }
// });
// app.use(limiter);

app.use(express.json()); // Allows us to parse JSON data sent in request bodies

// DEBUG: Log all requests
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Connect to Database and Initialize Firebase
connectDB();
initFirebase();

// Start Background Jobs (e.g. daily cleanup)
startCronJobs();

// A simple test route
app.get('/', (req, res) => {
  res.send('Campus Event API is running...');
});
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
