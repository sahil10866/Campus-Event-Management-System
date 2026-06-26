// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const BACKEND_URL = 'https://campus-event-management-and-ticketing.onrender.com';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [eventMessage, setEventMessage] = useState('Loading...');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalEvents: 0, totalRegistrations: 0 });
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventMetrics, setEventMetrics] = useState(null);
  const [loadingEventMetrics, setLoadingEventMetrics] = useState(false);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [loadingApproved, setLoadingApproved] = useState(true);
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catMessage, setCatMessage] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) { fetchPendingEvents(user); fetchApprovedEvents(user); fetchCategories(user); fetchUsers(user); fetchMetrics(user); }
      else { setLoadingEvents(false); setLoadingApproved(false); setLoadingCategories(false); setLoadingUsers(false); setLoadingMetrics(false); }
    });
    return () => unsubscribe();
  }, []);

  const fetchPendingEvents = async (user) => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/api/events/pending`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.pendingEvents) { setEvents(res.data.pendingEvents); setEventMessage(''); }
      else { setEvents([]); setEventMessage('Error loading.'); }
    } catch (e) { setEventMessage('Failed to load.'); }
    finally { setLoadingEvents(false); }
  };

  const fetchMetrics = async (user) => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/api/admin/metrics`, { headers: { Authorization: `Bearer ${token}` } });
      setMetrics(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingMetrics(false); }
  };

  const fetchApprovedEvents = async (user) => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/api/events/approved`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.approvedEvents) setApprovedEvents(res.data.approvedEvents);
    } catch (e) { console.error(e); }
    finally { setLoadingApproved(false); }
  };

  const handleStatusUpdate = async (eventId, newStatus) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.patch(`${BACKEND_URL}/api/events/${eventId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      if (newStatus === 'approved') {
        const evt = events.find(e => e._id === eventId);
        if (evt) setApprovedEvents([...approvedEvents, { ...evt, status: 'approved' }]);
      }
      setEvents(events.filter(e => e._id !== eventId));
    } catch (e) { setEventMessage('Failed.'); }
  };

  const fetchCategories = async (user) => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/api/categories`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.categories) setCategories(res.data.categories);
    } catch (e) { setCatMessage('Failed to load.'); }
    finally { setLoadingCategories(false); }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault(); setCatMessage('Creating...');
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post(`${BACKEND_URL}/api/categories`, { name: newCatName, description: newCatDesc }, { headers: { Authorization: `Bearer ${token}` } });
      setCategories([...categories, res.data.category]); setNewCatName(''); setNewCatDesc('');
      setCatMessage('Created!'); setTimeout(() => setCatMessage(''), 3000);
    } catch (e) { setCatMessage(e.response?.data?.message || 'Failed.'); }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`${BACKEND_URL}/api/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(categories.filter(c => c._id !== id));
    } catch (e) { setCatMessage('Failed.'); }
  };

  const fetchUsers = async (user) => {
    try {
      const token = await user.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.users) setUsers(res.data.users);
    } catch (e) { setUserMessage('Failed.'); }
    finally { setLoadingUsers(false); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.patch(`${BACKEND_URL}/api/admin/users/${userId}/role`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setUserMessage(`Role updated to ${newRole}`); setTimeout(() => setUserMessage(''), 3000);
    } catch (e) { setUserMessage('Failed.'); }
  };

  const downloadReportFromModal = () => {
    if (!eventMetrics?.participants?.length) { alert("No participants found."); return; }
    const h = ["Name,Email,Ticket ID,Checked In"];
    const r = eventMetrics.participants.map(p => `"${p.student?.name || '?'}","${p.student?.email || '?'}","${p.qrCodeData || 'N/A'}","${p.isCheckedIn ? 'Yes' : 'No'}"`);
    const blob = new Blob([h.concat(r).join("\n")], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.download = `${selectedEvent.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const openEventModal = async (event) => {
    setSelectedEvent(event); setLoadingEventMetrics(true); setEventMetrics(null);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(`${BACKEND_URL}/api/registrations/event/${event._id}/participants`, { headers: { Authorization: `Bearer ${token}` } });
      const p = res.data.participants || [];
      setEventMetrics({ registered: p.length, checkedIn: p.filter(x => x.isCheckedIn).length, capacity: event.participantLimit, participants: p });
    } catch (e) { alert('Failed to load metrics.'); }
    finally { setLoadingEventMetrics(false); }
  };

  const closeEventModal = () => { setSelectedEvent(null); setEventMetrics(null); };

  const filteredUsers = users.filter(u => (u.name || '').toLowerCase().includes(userSearchTerm.toLowerCase()) || (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase()));
  const filteredApproved = approvedEvents.filter(e => {
    const s = (e.title || '').toLowerCase().includes(eventSearchTerm.toLowerCase()) || (e.venue || '').toLowerCase().includes(eventSearchTerm.toLowerCase());
    return s && (eventCategoryFilter === '' || e.category === eventCategoryFilter);
  });

  const inputClass = "w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all";
  const roleColor = (r) => r === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' : r === 'organizer' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 min-h-screen">
      {/* Header */}
      <div className="mb-10 text-center animate-[slide-up_0.5s_ease-out]">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
          Admin <span className="text-gradient">Command Center</span>
        </h1>
        <p className="text-zinc-400 text-lg">Oversee the entire platform from one place.</p>
      </div>

       {/* KPIs */}
      {!loadingMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-[slide-up_0.6s_ease-out]">
          {[
            {
              icon: '👥',
              label: 'Total Platform Users',
              value: metrics.totalUsers,
              color: 'indigo',
              trend: '+12%',
              desc: 'Active accounts'
            },
            {
              icon: '✨',
              label: 'Live Campus Events',
              value: metrics.totalEvents,
              color: 'purple',
              trend: '+5',
              desc: 'Approved & active'
            },
            {
              icon: '🎫',
              label: 'Total Ticket Sales',
              value: metrics.totalRegistrations,
              color: 'pink',
              trend: '+24%',
              desc: 'Confirmed bookings'
            },
          ].map((m, idx) => (
            <div key={m.label}
              className="group relative overflow-hidden glass-panel rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-white/5 hover:border-white/20"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Animated Background Glow */}
              <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-${m.color}-500/10 blur-[80px] group-hover:bg-${m.color}-500/20 transition-all duration-700`}></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl bg-${m.color}-500/10 border border-${m.color}-500/20 text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                    {m.icon}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1 ml-0.5">
                    {m.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-5xl font-black text-white tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-500 transition-all duration-500">
                      {m.value.toLocaleString()}
                    </h3>
                  </div>
                  <p className="text-xs font-medium text-zinc-600 mt-2 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full bg-${m.color}-500/50`}></span>
                    {m.desc}
                  </p>
                </div>
              </div>

              {/* Progress-like bar at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                <div
                  className={`h-full bg-gradient-to-r from-${m.color}-500 to-${m.color}-400 w-0 group-hover:w-full transition-all duration-1000 ease-out`}
                  style={{ transitionDelay: '200ms' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )} 

      {/* Tabs Menu */}
      <div className="flex justify-start md:justify-center mb-10 animate-[slide-up_0.7s_ease-out] w-full overflow-x-auto hide-scrollbar pb-2">
        <div className="glass-panel p-1.5 rounded-full inline-flex flex-nowrap gap-1 shadow-lg min-w-max">
          {[
            { key: 'events', label: `Pending Reviews (${events.length})` },
            { key: 'approved', label: 'Event Analytics' },
            { key: 'categories', label: 'Categories' },
            { key: 'users', label: 'Users' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`whitespace-nowrap flex-shrink-0 px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${activeTab === t.key
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-[slide-up_0.8s_ease-out]">
        {/* === PENDING REVIEWS === */}
        {activeTab === 'events' && (
          <div>
            {loadingEvents ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-zinc-800 border-t-indigo-500"></div></div> : events.length === 0 ? (
              <div className="glass-card rounded-[2rem] p-16 text-center border-dashed">
                <div className="text-5xl mb-4">✅</div><h3 className="text-xl font-bold text-white mb-2">Inbox Zero</h3><p className="text-zinc-500">All events have been reviewed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                  <div key={event._id} className="glass-card rounded-[2rem] overflow-hidden flex flex-col group">
                    <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 opacity-80 group-hover:opacity-100"></div>
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">{event.category || 'General'}</span>
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Requires Review</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{event.title}</h3>
                      <div className="text-sm text-zinc-400 space-y-1.5 mb-4 font-medium">
                        <p>📍 {event.venue}</p>
                        <p>👤 {event.organizers?.name || 'Unknown'}</p>
                      </div>
                      <p className="text-sm text-zinc-500 line-clamp-3">{event.description}</p>
                    </div>
                    <div className="p-4 border-t border-white/5 flex gap-3 bg-black/10">
                      <button onClick={() => handleStatusUpdate(event._id, 'rejected')} className="flex-1 py-3 text-sm font-bold rounded-xl bg-white/5 border border-white/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all">Decline</button>
                      <button onClick={() => handleStatusUpdate(event._id, 'approved')} className="flex-1 py-3 text-sm font-bold rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all">Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === EVENT ANALYTICS === */}
        {activeTab === 'approved' && (
          <div>
            <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col sm:flex-row gap-4">
              <input type="text" placeholder="🔍 Search approved events..." value={eventSearchTerm} onChange={e => setEventSearchTerm(e.target.value)} className={inputClass + " flex-grow"} />
              <select value={eventCategoryFilter} onChange={e => setEventCategoryFilter(e.target.value)} className={inputClass + " sm:w-48 cursor-pointer"}>
                <option value="" className="bg-zinc-900">All Categories</option>
                {categories.map(c => <option key={c._id} value={c.name} className="bg-zinc-900">{c.name}</option>)}
              </select>
            </div>
            {loadingApproved ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-zinc-800 border-t-indigo-500"></div></div> : filteredApproved.length === 0 ? (
              <div className="glass-card rounded-[2rem] p-16 text-center border-dashed"><p className="text-zinc-500">No events found.</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApproved.map(event => (
                  <div key={event._id} className="glass-card rounded-[2rem] p-6 flex flex-col group hover:-translate-y-1">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">{event.category || 'General'}</span>
                      <span className="text-xs font-bold text-zinc-400 bg-white/5 px-2 py-1 rounded-lg border border-white/5">{event.currentRegistrations}/{event.participantLimit}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-1 group-hover:text-indigo-300 transition-colors">{event.title}</h3>
                    <div className="text-sm text-zinc-500 font-medium space-y-1.5 mb-6 flex-grow">
                      <p>📅 {new Date(event.eventDate).toLocaleDateString()}</p>
                      <p>📍 {event.venue}</p>
                    </div>
                    <button onClick={() => openEventModal(event)} className="w-full py-3 text-sm font-bold rounded-xl bg-white/5 border border-white/10 text-white hover:bg-indigo-500 hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all">
                      View Analytics →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === CATEGORIES === */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="glass-panel rounded-[2rem] p-6 sticky top-32">
                <h3 className="text-xl font-bold text-white mb-6">New Category</h3>
                {catMessage && <div className="mb-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm font-medium text-indigo-300">{catMessage}</div>}
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div><label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Name</label><input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="E.g. Workshop" required className={inputClass} /></div>
                  <div><label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Description</label><textarea value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} placeholder="Brief overview..." rows="3" className={`${inputClass} resize-none`}></textarea></div>
                  <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">Add Category</button>
                </form>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="glass-panel rounded-[2rem] overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-black/10"><h3 className="font-bold text-white text-lg">Active Categories</h3></div>
                {loadingCategories ? <div className="p-16 text-center text-zinc-500 font-medium">Loading...</div> : categories.length === 0 ? <div className="p-16 text-center text-zinc-500 font-medium">No categories created.</div> : (
                  <div className="overflow-x-auto bg-black/20">
                    <table className="w-full text-left">
                      <thead><tr className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-white/5"><th className="p-5">Name</th><th className="p-5 hidden md:table-cell">Description</th><th className="p-5 w-16"></th></tr></thead>
                      <tbody>
                        {categories.map(cat => (
                          <tr key={cat._id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-5 font-bold text-white">{cat.name}</td>
                            <td className="p-5 text-sm text-zinc-400 font-medium hidden md:table-cell">{cat.description || <span className="opacity-50">—</span>}</td>
                            <td className="p-5 text-right"><button onClick={() => handleDeleteCategory(cat._id)} className="p-2 rounded-lg text-zinc-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === USERS === */}
        {activeTab === 'users' && (
          <div className="glass-panel rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-black/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-white text-lg">Platform Users</h3>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <input type="text" placeholder="🔍 Search by name or email..." value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} className={inputClass + " md:min-w-[300px]"} />
                {userMessage && <span className="text-xs font-bold text-emerald-400 shrink-0 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">{userMessage}</span>}
              </div>
            </div>
            {loadingUsers ? <div className="p-16 text-center text-zinc-500 font-medium">Loading network...</div> : filteredUsers.length === 0 ? (
              <div className="p-16 text-center text-zinc-500 font-medium">No users found matching your search.</div>
            ) : (
              <div className="overflow-x-auto bg-black/20">
                <table className="w-full text-left">
                  <thead><tr className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5"><th className="p-5">User Details</th><th className="p-5 hidden sm:table-cell">Joined</th><th className="p-5">Role</th><th className="p-5 text-right">Manage</th></tr></thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-5"><p className="font-bold text-white text-sm">{u.name}</p><p className="text-xs text-zinc-500 mt-1">{u.email}</p></td>
                        <td className="p-5 text-sm font-medium text-zinc-400 hidden sm:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="p-5"><span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${roleColor(u.role)}`}>{u.role}</span></td>
                        <td className="p-5 text-right">
                          <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} className="py-2 px-3 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer">
                            <option value="student" className="bg-zinc-900">Student</option>
                            <option value="organizer" className="bg-zinc-900">Organizer</option>
                            <option value="admin" className="bg-zinc-900">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* === EVENT MODAL === */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={closeEventModal}>
          <div className="glass-panel border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-y-auto p-10 relative animate-[slide-up_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
            <button onClick={closeEventModal} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">✕</button>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">{selectedEvent.category || 'Event'}</span>
            <h2 className="text-3xl font-black text-white mt-2 mb-2">{selectedEvent.title}</h2>
            <p className="text-sm font-medium text-zinc-400 mb-10">📍 {selectedEvent.venue} <span className="mx-2 opacity-50">|</span> 📅 {new Date(selectedEvent.eventDate).toLocaleString()}</p>

            {loadingEventMetrics ? (
              <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-zinc-800 border-t-indigo-500"></div></div>
            ) : eventMetrics ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                  {[
                    { label: 'Registered', value: `${eventMetrics.registered}/${eventMetrics.capacity}`, color: 'from-indigo-500 to-purple-500' },
                    { label: 'Checked In', value: eventMetrics.checkedIn, color: 'from-emerald-500 to-teal-500' },
                    { label: 'Turnout', value: `${eventMetrics.registered > 0 ? Math.round((eventMetrics.checkedIn / eventMetrics.registered) * 100) : 0}%`, color: 'from-pink-500 to-rose-500' },
                  ].map(m => (
                    <div key={m.label} className="rounded-2xl bg-black/20 border border-white/10 p-6 text-center relative overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${m.color}`}></div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">{m.label}</p>
                      <p className="text-3xl font-black text-white">{m.value}</p>
                    </div>
                  ))}
                </div>
                <button onClick={downloadReportFromModal} className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] flex justify-center items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download CSV Report
                </button>
              </>
            ) : <div className="text-center py-10 text-zinc-500">Could not load metrics.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
