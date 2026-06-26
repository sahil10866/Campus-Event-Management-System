// src/pages/OrganizerDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = 'https://campus-event-management-and-ticketing.onrender.com';

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "", description: "", venue: "", eventDate: "", participantLimit: 100, category: "Cultural",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchMyEvents(user);
    });
    return () => unsubscribe();
  }, []);

  const fetchMyEvents = async (user) => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/api/events/my-events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data.events || []);
    } catch (error) { console.error("Error fetching events:", error); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${BACKEND_URL}/api/events`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Event creation requested! Waiting for Admin approval.");
      setFormData({ title: "", description: "", venue: "", eventDate: "", participantLimit: 100, category: "Cultural" });
      fetchMyEvents(auth.currentUser);
    } catch (error) { alert("Failed to create event"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`${BACKEND_URL}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMyEvents(auth.currentUser);
    } catch (error) { alert("Failed to delete event"); }
  };

  // Helper for consistent input styling
  const inputClass = "w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm";
  const labelClass = "block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1";

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Organizer <span className="text-gradient">Hub</span>
        </h1>
        <p className="text-zinc-400 text-lg">Manage your events and track registrations in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Create Event Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8 rounded-[2rem] sticky top-32">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">✨</span> 
              New Event
            </h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className={labelClass}>Title</label>
                <input type="text" placeholder="E.g. Spring Hackathon" className={inputClass} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea rows="3" placeholder="What's this event about?" className={`${inputClass} resize-none`} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date & Time</label>
                  <input type="datetime-local" className={inputClass} value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} required />
                </div>
                <div>
                  <label className={labelClass}>Capacity</label>
                  <input type="number" min="1" className={inputClass} value={formData.participantLimit} onChange={e => setFormData({...formData, participantLimit: e.target.value})} required />
                </div>
              </div>
              <div>
                <label className={labelClass}>Venue</label>
                <input type="text" placeholder="Main Auditorium" className={inputClass} value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} required />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select className={inputClass} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Cultural" className="bg-zinc-900">Cultural</option>
                  <option value="Technical" className="bg-zinc-900">Technical</option>
                  <option value="Sports" className="bg-zinc-900">Sports</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 mt-4 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 transition-all duration-300">
                Submit for Approval
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Events List */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white">Your Events</h2>
            <span className="text-zinc-500 font-medium">{events.length} Total</span>
          </div>

          {events.length === 0 ? (
            <div className="glass-card rounded-3xl p-16 text-center border-dashed">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-white mb-2">No events yet</h3>
              <p className="text-zinc-500">Create your first event using the panel on the left.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event, index) => (
                <div key={event._id} className="group glass-card rounded-[2rem] p-6 flex flex-col relative overflow-hidden animate-[slide-up_0.5s_ease-out]">
                  {/* Status Indicator */}
                  <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-[1.5rem] text-xs font-bold uppercase tracking-wider ${
                    event.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 
                    event.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {event.status}
                  </div>

                  <div className="mb-4 pr-16">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block">{event.category}</span>
                    <h3 className="text-xl font-bold text-white leading-tight mb-2">{event.title}</h3>
                    <p className="text-sm text-zinc-400 line-clamp-2">{event.description}</p>
                  </div>

                  <div className="space-y-2 mb-6 text-xs text-zinc-500 font-medium">
                    <p>📍 {event.venue}</p>
                    <p>📅 {new Date(event.eventDate).toLocaleString()}</p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Registrations</span>
                      <span className="font-bold text-white">{event.currentRegistrations} / {event.participantLimit}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/event/${event._id}/manage`)} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors">
                        Manage
                      </button>
                      <button onClick={() => handleDelete(event._id)} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}