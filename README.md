# 🎓 Campus Event Management & Ticketing System

A full-stack web application for managing campus events end-to-end — from event creation and admin approval to student registration, QR-code ticketing, and real-time push notifications.

---

## ✨ Features

### Role-Based Access Control
Three distinct user roles, each with a dedicated dashboard:

- **Student** — Browse approved events, register/unregister, view QR-code tickets, and receive push notifications.
- **Organizer** — Create and manage events, view registered participants, scan QR codes for check-in, and send targeted notifications to attendees.
- **Admin** — Approve or reject pending events, manage event categories, and oversee all platform activity.

### Core Functionality
- **Event Lifecycle Management** — Organizers create events; admins approve or reject them before they become visible to students.
- **QR Code Ticketing** — Each registration generates a unique QR code (`EVT-{eventId}-STU-{studentId}`). Students present their QR code; organizers scan it at the door.
- **Real-Time Check-In** — Atomic ticket validation prevents double-scanning. Already-checked-in tickets are immediately flagged.
- **Push Notifications (FCM)** — Firebase Cloud Messaging delivers real-time alerts to students via the browser service worker, with in-app toast notifications for foreground messages.
- **Capacity Enforcement** — Registration is blocked atomically once an event hits its participant limit — race conditions are handled with MongoDB transactions.
- **Automated Cleanup** — Scheduled cron jobs run background maintenance tasks (e.g. clearing expired data).

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database & ODM |
| Firebase Admin SDK | Auth token verification & push notifications |
| node-cron | Scheduled background jobs |
| Helmet | Secure HTTP headers |
| CORS | Cross-origin request handling |
| dotenv | Environment variable management |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| React Router v7 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Firebase JS SDK | Authentication & FCM |
| Axios | HTTP client |
| qrcode.react | QR code generation |
| @yudiel/react-qr-scanner | QR code scanning (camera) |

---

## 📁 Project Structure

```
Campus-Event-Management-and-Ticketing-System/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── firebase.js            # Firebase Admin SDK initialization
│   ├── controllers/
│   │   ├── adminController.js     # Admin actions (approve/reject events)
│   │   ├── categoryController.js  # Event category CRUD
│   │   ├── eventController.js     # Event CRUD
│   │   ├── notificationController.js # FCM push notification sending
│   │   ├── registrationController.js # Register, verify tickets, check-in
│   │   └── userController.js      # User profile management
│   ├── middleware/
│   │   └── authMiddleware.js      # Firebase token verification
│   ├── models/
│   │   ├── Category.js
│   │   ├── Events.js
│   │   ├── Registration.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── userRoutes.js
│   ├── cronJobs.js                # Scheduled background tasks
│   ├── index.js                   # App entry point
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── firebase-messaging-sw.js  # Service worker for background FCM
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AuthPage.jsx
    │   │   ├── EventManage.jsx
    │   │   ├── MyTickets.jsx
    │   │   ├── OrganizerDashboard.jsx
    │   │   ├── ScannerPage.jsx
    │   │   └── StudentDashboard.jsx
    │   ├── App.jsx                # Routes & notification toast
    │   ├── firebaseConfig.js
    │   └── main.tsx
    └── package.json
```

---

## 🗄️ Data Models

### User
```
name, email, firebaseUid, role (student | organizer | admin), fcmToken
```

### Event
```
title, description, venue, eventDate, category, participantLimit,
currentRegistrations, organizers[], status (pending | approved | rejected)
```

### Registration
```
student (ref: User), event (ref: Event), qrCodeData (unique), isCheckedIn
```

### Category
```
Name field for admin-managed event categories.
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB instance (local or Atlas)
- Firebase project with Authentication and Cloud Messaging enabled
- A Firebase service account key (for the backend)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Campus-Event-Management-and-Ticketing-System
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_service_account_json_or_path
```

Start the server:
```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5001`.

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:
```env
VITE_API_URL=http://localhost:5001
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=...
```

Start the dev server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🌐 API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/users/` | Create/sync user profile | ✅ |
| GET | `/api/events/` | List all approved events | ✅ |
| POST | `/api/events/` | Create a new event | Organizer/Admin |
| GET | `/api/events/:id` | Get event details | ✅ |
| PUT | `/api/events/:id` | Update event | Organizer/Admin |
| DELETE | `/api/events/:id` | Delete event | Organizer/Admin |
| POST | `/api/registrations/:eventId` | Register for an event | Student |
| GET | `/api/registrations/my` | Get my tickets | Student |
| POST | `/api/registrations/verify` | Verify QR ticket & check in | Organizer/Admin |
| GET | `/api/registrations/:eventId/participants` | List event participants | Organizer/Admin |
| GET | `/api/categories/` | List categories | ✅ |
| POST | `/api/categories/` | Create category | Admin |
| GET | `/api/admin/events` | All events (pending/approved/rejected) | Admin |
| PUT | `/api/admin/events/:id/status` | Approve or reject event | Admin |

---

## 🔒 Authentication Flow

1. Users sign in via Firebase Authentication on the frontend.
2. The Firebase ID token is attached to every API request header.
3. The backend `authMiddleware` verifies the token using the Firebase Admin SDK.
4. The middleware attaches the full MongoDB user object (including role) to `req.user`.
5. Route handlers check `req.user.role` for authorization.

---

## 🔔 Push Notifications

- The frontend registers a Firebase service worker (`firebase-messaging-sw.js`) to receive background notifications.
- When the app is in the foreground, notifications appear as a custom glassmorphism toast in the top-right corner.
- Organizers can send notifications to all registered participants for their event via the notification controller.

---

## 🚢 Deployment

The project is pre-configured for deployment on **Vercel** (frontend) and any Node.js-compatible host (backend).

Frontend `vercel.json` includes SPA rewrite rules so React Router works correctly on refresh.

CORS is already configured to allow:
- `http://localhost:5173` (development)
- `https://campus-event-management-and-ticketi.vercel.app` (production)

Update the `origin` array in `backend/index.js` if you deploy to a different domain.

---

## 👥 User Roles Quick Reference

| Action | Student | Organizer | Admin |
|---|---|---|---|
| Browse approved events | ✅ | ✅ | ✅ |
| Register for events | ✅ | ✅ | — |
| View own QR tickets | ✅ | ✅ | — |
| Create events | — | ✅ | ✅ |
| Manage own events | — | ✅ | ✅ |
| Scan QR / check-in | — | ✅ | ✅ |
| Send notifications | — | ✅ | ✅ |
| Approve / reject events | — | — | ✅ |
| Manage categories | — | — | ✅ |
| View all events & users | — | — | ✅ |
