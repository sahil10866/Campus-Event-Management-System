// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const BACKEND_URL = 'https://campus-event-management-and-ticketing.onrender.com';

export default function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [message, setMessage] = useState("Loading events...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchApprovedEvents(user);
        fetchCategories(user);
      }
      else { setMessage("You must be logged in."); setLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  const fetchCategories = async (user) => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/api/categories`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.categories) setCategories(res.data.categories);
    } catch (e) { console.error("Failed to load categories", e); }
  };

  const fetchApprovedEvents = async (user) => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/api/events/approved`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.approvedEvents) { 
        setEvents(res.data.approvedEvents); 
        setMessage(res.data.approvedEvents.length === 0 ? "No events right now." : ""); 
      }
      else { setEvents([]); setMessage("No events available."); }
    } catch (e) { setMessage("Failed to load events."); }
    finally { setLoading(false); }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = (event.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (event.venue || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleRegister = async (eventId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post(`${BACKEND_URL}/api/registrations/${eventId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message || "Registered!");
      fetchApprovedEvents(auth.currentUser);
    } catch (e) { alert(`Error: ${e.response?.data?.message || "Failed"}`); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 min-h-screen">
      
      {/* Aurora Hero Section */}
      <div className="relative mb-20 rounded-[2.5rem] p-12 md:p-20 text-center flex flex-col items-center justify-center overflow-hidden glass-panel border-white/10 shadow-2xl">
        {/* Animated Background Blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/40 rounded-full blur-[100px] animate-[glow-pulse_5s_ease-in-out_infinite]"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-600/30 rounded-full blur-[100px] animate-[glow-pulse_7s_ease-in-out_infinite_1s]"></div>
        
        <div className="relative z-10 animate-[slide-up_0.8s_ease-out]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 mb-8 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
            <span className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Live Now</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-tight">
            Discover Your Next <br/> <span className="text-gradient">Campus Adventure</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-medium">
            Join the most exciting events, connect with peers, and make memories that last a lifetime.
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-12 animate-[slide-up_1s_ease-out]">
        <div className="flex-grow relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search events by title or venue..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all backdrop-blur-md"
          />
        </div>
        <div className="md:w-64 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all backdrop-blur-md cursor-pointer"
          >
            <option value="" className="bg-zinc-900">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.name} className="bg-zinc-900">{cat.name}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="mb-8 flex justify-between items-end">
        <h2 className="text-3xl font-black text-white">Upcoming Events</h2>
        <span className="text-zinc-500 font-medium">{filteredEvents.length} events found</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-800 border-t-indigo-500"></div></div>
      ) : (
        <>
          {message && events.length === 0 && (
            <div className="glass-card rounded-3xl p-16 text-center border-dashed">
              <div className="text-6xl mb-4">🛸</div>
              <h3 className="text-xl font-bold text-white mb-2">It's quiet here...</h3>
              <p className="text-zinc-500">{message}</p>
            </div>
          )}

          {events.length > 0 && filteredEvents.length === 0 && (
            <div className="glass-card rounded-[2.5rem] p-20 text-center border-dashed border-white/5 animate-[fade-in_0.5s_ease-out]">
              <div className="text-5xl mb-6 opacity-50">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No matching events</h3>
              <p className="text-zinc-500 mb-8 max-w-sm mx-auto">We couldn't find any events matching your current filters. Try adjusting your search term or category.</p>
              <button 
                onClick={() => { setSearchTerm(""); setCategoryFilter(""); }}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => {
              const isFull = event.currentRegistrations >= event.participantLimit;
              const isPast = new Date(event.eventDate) < new Date();
              const pct = Math.round((event.currentRegistrations / event.participantLimit) * 100);
              
              return (
                <div 
                  key={event._id} 
                  className={`group glass-card rounded-[2rem] overflow-hidden flex flex-col transform transition-all duration-500 ${isPast ? 'opacity-70 grayscale-[20%]' : 'hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]'}`}
                  style={{ animation: `slide-up 0.5s ease-out ${index * 0.1}s both` }}
                >
                  {/* Glowing Top Border */}
                  <div className={`h-1.5 w-full transition-all duration-500 ${isPast || isFull ? 'bg-zinc-800' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70 group-hover:opacity-100'}`}></div>
                  
                  <div className="p-8 flex flex-col flex-grow relative">
                    {/* Background accent on hover */}
                    {!isPast && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>}

                    <div className="relative z-10 flex-grow">
                      <div className="flex justify-between items-center mb-6">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${isPast ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'}`}>
                          {isPast ? 'Ended' : (event.category || 'General')}
                        </span>
                        <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-lg border ${isPast ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : isFull ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                          {event.currentRegistrations}/{event.participantLimit}
                        </div>
                      </div>

                      <h3 className={`text-2xl font-bold mb-4 line-clamp-2 leading-tight transition-colors ${isPast ? 'text-zinc-400' : 'text-white group-hover:text-indigo-200'}`}>{event.title}</h3>

                      <div className="space-y-3 text-sm text-zinc-400 mb-6 font-medium">
                        <p className="flex items-center gap-3"><span className="p-2 rounded-full bg-white/5 text-lg">📍</span> {event.venue}</p>
                        <p className="flex items-center gap-3"><span className="p-2 rounded-full bg-white/5 text-lg">📅</span> {new Date(event.eventDate).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      
                      <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed mb-6">{event.description}</p>
                    </div>

                    <div className="relative z-10 mt-auto pt-6 border-t border-white/5">
                      <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2">
                        <span>Capacity</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden mb-6">
                        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isPast ? 'bg-zinc-600' : isFull ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                      </div>

                      <button onClick={() => handleRegister(event._id)} disabled={isFull || isPast}
                        className={`w-full py-4 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                          isPast 
                          ? 'bg-zinc-800/50 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                          : isFull 
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                            : 'bg-white text-zinc-900 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-1 active:translate-y-0'
                        }`}>
                        {isPast ? "Event Ended" : isFull ? "Tickets Sold Out" : "Secure Your Spot"}
                        {!(isFull || isPast) && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}