// src/pages/EventManage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const BACKEND_URL = 'https://campus-event-management-and-ticketing.onrender.com';

export default function EventManage() {
  const { id } = useParams();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NEW: Notification States ---
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyStatus, setNotifyStatus] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [id]);

  const fetchData = async (user) => {
    try {
      const token = await user.getIdToken();
      const partRes = await axios.get(`${BACKEND_URL}/api/registrations/event/${id}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setParticipants(partRes.data.participants);
    } catch (error) {
      console.error("Failed to load event data", error);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Send Notification Logic ---
  const handleSendNotification = async (e) => {
    e.preventDefault();
    setNotifyStatus('Sending...');
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post(`${BACKEND_URL}/api/events/notify/${id}`, 
        { title: notifyTitle, message: notifyMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifyStatus(`✅ Sent successfully to ${res.data.successCount} students!`);
      setNotifyTitle(''); 
      setNotifyMessage('');
    } catch (error) {
      setNotifyStatus(`❌ Error: ${error.response?.data?.message || 'Failed to send'}`);
    }
  };

  const checkedInCount = participants.filter(p => p.isCheckedIn).length;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-16 min-h-screen">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-indigo-400 font-bold mb-8 transition-colors text-sm uppercase tracking-wider">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Dashboard
      </Link>

      <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-[slide-up_0.5s_ease-out]">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Event Roster</h2>
          <div className="flex gap-4 text-sm font-bold">
            <span className="px-3 py-1 rounded-lg bg-white/5 text-zinc-300 border border-white/10">Registrations: <span className="text-white">{participants.length}</span></span>
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Checked In: <span className="text-emerald-300">{checkedInCount}</span></span>
          </div>
        </div>
        
        <Link to="/scanner" className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
          Launch Scanner
        </Link>
      </div>

      {/* --- NEW: NOTIFICATION SENDER BLOCK --- */}
      <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] mb-10 animate-[slide-up_0.6s_ease-out]">
        <h3 className="text-xl font-bold text-white mb-6">📢 Send Announcement</h3>
        <form onSubmit={handleSendNotification} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Subject</label>
            <input type="text" value={notifyTitle} onChange={e => setNotifyTitle(e.target.value)} required placeholder="e.g. Room Change" className="w-full p-3.5 bg-black/20 border border-white/10 text-white rounded-xl placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Message</label>
            <input type="text" value={notifyMessage} onChange={e => setNotifyMessage(e.target.value)} required placeholder="e.g. We are moving to Room 101!" className="w-full p-3.5 bg-black/20 border border-white/10 text-white rounded-xl placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors" />
          </div>
          <div className="md:col-span-1">
            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:-translate-y-1 transition-all duration-300">
              Send Push Notification
            </button>
          </div>
        </form>
        {notifyStatus && (
          <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl inline-block">
            <p className={`font-bold text-sm ${notifyStatus.includes('❌') ? 'text-red-400' : 'text-emerald-400'}`}>{notifyStatus}</p>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-[2rem] overflow-hidden animate-[slide-up_0.7s_ease-out]">
        <div className="p-6 border-b border-white/10 bg-black/20">
          <h3 className="text-xl font-bold text-white">Attendee List</h3>
        </div>
        
        {loading ? (
           <div className="p-16 text-center flex flex-col items-center justify-center">
             <div className="animate-spin rounded-full h-10 w-10 border-4 border-zinc-800 border-t-indigo-500 mb-4"></div>
             <p className="text-zinc-500 font-medium">Loading participants...</p>
           </div>
        ) : (
          <div className="overflow-x-auto bg-black/10">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5">
                  <th className="p-5">Student Name</th>
                  <th className="p-5">Email</th>
                  <th className="p-5 hidden sm:table-cell">Reg. Date</th>
                  <th className="p-5">Status</th>
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr><td colSpan="4" className="p-12 text-center text-zinc-500 font-medium">No students registered yet.</td></tr>
                ) : (
                  participants.map(p => (
                    <tr key={p._id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-5 font-bold text-white">{p.student?.name || 'Unknown'}</td>
                      <td className="p-5 text-sm text-zinc-400">{p.student?.email || 'N/A'}</td>
                      <td className="p-5 text-sm text-zinc-500 hidden sm:table-cell">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="p-5">
                        {p.isCheckedIn ? (
                          <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider rounded-lg">Verified</span>
                        ) : (
                          <span className="px-3 py-1.5 bg-zinc-800 text-zinc-400 border border-zinc-700 font-bold text-[10px] uppercase tracking-wider rounded-lg">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}