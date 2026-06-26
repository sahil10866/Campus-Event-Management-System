// src/pages/MyTickets.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';

const BACKEND_URL = 'https://campus-event-management-and-ticketing.onrender.com';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedQR, setSelectedQR] = useState(null); // State for full-screen QR view

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchMyTickets(user);
      else { setMessage('You must be logged in.'); setLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  const fetchMyTickets = async (user) => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/api/registrations/my-tickets`, { headers: { Authorization: `Bearer ${token}` } });
      const t = res.data.registrations || res.data.tickets || [];
      setTickets(t); setMessage(t.length === 0 ? "No tickets yet." : "");
    } catch (e) { setMessage('Failed to load.'); }
    finally { setLoading(false); }
  };

  const now = new Date();
  const upcoming = tickets.filter(t => t.event && new Date(t.event.eventDate) >= now);
  const past = tickets.filter(t => t.event && new Date(t.event.eventDate) < now);
  const displayed = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 min-h-screen">
      <div className="mb-10 text-center animate-[slide-up_0.5s_ease-out]">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
          Digital <span className="text-gradient">Wallet</span>
        </h1>
        <p className="text-lg text-zinc-400">Your VIP passes to campus events.</p>
      </div>

      {!loading && tickets.length > 0 && (
        <div className="flex justify-center mb-10 animate-[slide-up_0.6s_ease-out]">
          <div className="glass-panel p-1.5 rounded-full inline-flex gap-1 shadow-lg">
            {['upcoming', 'past'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-sm font-bold rounded-full capitalize transition-all duration-300 ${
                  activeTab === tab ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}>
                {tab} <span className="ml-2 px-2 py-0.5 rounded-full bg-black/20 text-xs">{tab === 'upcoming' ? upcoming.length : past.length}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-zinc-800 border-t-indigo-500"></div></div>
      ) : (
        <div className="animate-[slide-up_0.8s_ease-out]">
          {message && tickets.length === 0 && (
            <div className="glass-card rounded-[2rem] p-16 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
                <span className="text-4xl">🎫</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Your wallet is empty</h3>
              <p className="text-zinc-400 mb-8">{message}</p>
              <Link to="/student" className="inline-flex px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-1 transition-all duration-300">
                Browse Events
              </Link>
            </div>
          )}

          {tickets.length > 0 && displayed.length === 0 && (
            <div className="glass-panel rounded-[2rem] p-12 text-center border-dashed">
              <p className="text-zinc-500 text-lg font-medium">{activeTab === 'upcoming' ? 'No upcoming events on your radar.' : 'No past events to show.'}</p>
            </div>
          )}

          {displayed.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayed.map(ticket => {
                const isPast = ticket.event && new Date(ticket.event.eventDate) < now;
                return (
                  <div key={ticket._id} className={`group glass-card rounded-[2rem] overflow-hidden flex flex-col transition-all duration-500 ${
                    isPast ? 'opacity-70 grayscale-[30%]' : 'hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]'
                  }`}>
                    {/* Glowing gradient strip */}
                    <div className={`h-1.5 w-full ${isPast ? 'bg-zinc-700' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80 group-hover:opacity-100'}`}></div>
                    
                    <div className="p-8 flex-grow">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                          isPast ? 'bg-white/5 text-zinc-400 border-white/10' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                        }`}>
                          {!isPast && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>}
                          {isPast ? 'Expired Pass' : 'Active Pass'}
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors">{ticket.event?.title || 'Event Removed'}</h3>
                      
                      <div className="space-y-3 text-sm text-zinc-400 font-medium">
                        <p className="flex items-center gap-3"><span className="p-1.5 rounded-full bg-white/5 text-sm">📍</span> {ticket.event?.venue || 'TBA'}</p>
                        <p className="flex items-center gap-3"><span className="p-1.5 rounded-full bg-white/5 text-sm">📅</span> {ticket.event ? new Date(ticket.event.eventDate).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                      </div>
                    </div>

                    {/* QR Section */}
                    <div 
                      className="border-t border-white/10 p-8 flex flex-col items-center bg-black/20 relative cursor-pointer group/qr"
                      onClick={() => !isPast && ticket.qrCodeData && setSelectedQR({ data: ticket.qrCodeData, title: ticket.event?.title })}
                    >
                      {isPast ? (
                        <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 py-6">{ticket.isCheckedIn ? '✓ Verified Entry' : 'Event Ended'}</p>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent opacity-0 group-hover/qr:opacity-100 transition-opacity"></div>
                          <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] relative z-10 transition-transform duration-500 group-hover/qr:scale-105">
                            {ticket.qrCodeData ? <QRCodeSVG value={ticket.qrCodeData} size={150} level="H" /> : <div className="w-[150px] h-[150px] bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs rounded-xl font-bold">No QR Data</div>}
                          </div>
                          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 relative z-10 group-hover/qr:text-indigo-300 transition-colors">Tap to Enlarge</p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Full Screen QR Modal */}
      {selectedQR && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-[fade-in_0.3s_ease-out]"
          onClick={() => setSelectedQR(null)}
        >
          <div 
            className="glass-panel border-white/10 p-10 rounded-[3rem] w-full max-w-sm flex flex-col items-center relative animate-[slide-up_0.3s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedQR(null)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              ✕
            </button>
            <h3 className="text-xl font-black text-white text-center mb-2">{selectedQR.title}</h3>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-8">Digital Pass</p>
            
            <div className="p-6 bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.2)] mb-8">
              <QRCodeSVG value={selectedQR.data} size={280} level="H" />
            </div>
            
            <p className="text-zinc-400 text-sm font-medium text-center">Center this QR code within the <br/> event scanner frame.</p>
          </div>
        </div>
      )}
    </div>
  );
}