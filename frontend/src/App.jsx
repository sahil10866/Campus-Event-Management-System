// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import MyTickets from './pages/MyTickets';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ScannerPage from './pages/ScannerPage';
import EventManage from './pages/EventManage';

import { messaging } from './firebaseConfig';
import { onMessage } from 'firebase/messaging';

export default function App() {
  // 🛑 NEW: State to hold our beautiful toast notification
  const [toast, setToast] = useState(null);
  
  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground Message received! ", payload);
        
        // 🛑 NEW: Instead of alert(), we set our custom toast!
        // The backend already includes the Event Name in the payload.notification.title
        setToast({
          title: payload.notification.title, // E.g. "Tech Symposium: Room Change"
          body: payload.notification.body
        });

        // Automatically hide the notification after 6 seconds
        setTimeout(() => {
          setToast(null);
        }, 6000);
      });

      return () => unsubscribe();
    }
  }, []);

  return (
    <BrowserRouter>
      <Navbar />

      {/* 🛑 NEW: The Beautiful Glassmorphism Toast Notification UI */}
      {toast && (
        <div className="fixed top-24 right-6 z-[9999] bg-black/60 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] w-full max-w-sm transition-all duration-500 animate-[slide-down_0.4s_ease-out]">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </div>
            <div className="flex-1">
              {/* Title contains the Event Name */}
              <h4 className="text-white font-bold text-sm mb-1 leading-snug">{toast.title}</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">{toast.body}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-zinc-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<AuthPage />} />
        
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><OrganizerDashboard /></ProtectedRoute>} />
        <Route path="/event/:id/manage" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><EventManage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute allowedRoles={['student', 'organizer']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute allowedRoles={['student', 'organizer']}><MyTickets /></ProtectedRoute>} />
        <Route path="/scanner" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><ScannerPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}