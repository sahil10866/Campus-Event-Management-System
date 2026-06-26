// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu
  const userRole = localStorage.getItem('userRole');

  const handleLogout = async () => {
    try { 
      await signOut(auth); 
      localStorage.removeItem('userRole'); 
      setIsOpen(false);
      navigate('/'); 
    } catch (error) { 
      console.error('Error logging out:', error); 
    }
  };

  if (location.pathname === '/') return null;

  // Desktop Link Styling
  const navLink = (to, label) => (
    <Link 
      to={to} 
      onClick={() => setIsOpen(false)}
      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
      location.pathname === to 
        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
        : 'text-zinc-400 hover:text-white hover:bg-white/10'
    }`}>{label}</Link>
  );

  // Mobile Link Styling
  const mobileNavLink = (to, label) => (
    <Link 
      to={to} 
      onClick={() => setIsOpen(false)}
      className={`block w-full text-left px-5 py-3.5 rounded-xl text-base font-bold transition-all duration-300 ${
      location.pathname === to 
        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
        : 'text-zinc-400 bg-white/5 border border-white/5 hover:text-white hover:bg-white/10'
    }`}>{label}</Link>
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-4 px-4 pointer-events-none">
      
      {/* Main Floating Navbar */}
      <header className="pointer-events-auto w-full max-w-4xl glass-panel rounded-full px-4 md:px-6 py-3 flex justify-between items-center animate-[slide-up_0.5s_ease-out]">
        
        {/* Logo */}
        <Link to={userRole === 'student' ? '/student' : '/dashboard'} onClick={() => setIsOpen(false)} className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
            <span className="text-sm">🎪</span>
          </div>
          <span className="text-[16px] font-black tracking-tight text-gradient hidden sm:block">CampusFests</span>
        </Link>

        {/* Desktop Navigation (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1 rounded-full border border-white/5">
          {(userRole === 'student' || userRole === 'organizer') && (
            <>{navLink('/student', 'Events')}{navLink('/tickets', 'Tickets')}</>
          )}
          {userRole === 'organizer' && navLink('/dashboard', 'My Events')}
          {userRole === 'admin' && (
            <>{navLink('/dashboard', 'Organize')}{navLink('/admin', 'Admin')}</>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop Logout Button */}
          <button onClick={handleLogout} className="hidden md:block px-5 py-2 text-sm font-semibold rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300">
            Log Out
          </button>
          
          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden p-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white focus:outline-none transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      <div className={`pointer-events-auto w-full max-w-4xl mt-3 glass-panel rounded-[2rem] p-4 md:hidden flex flex-col gap-3 transition-all duration-300 origin-top ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 absolute pointer-events-none'}`}>
        {(userRole === 'student' || userRole === 'organizer') && (
          <>{mobileNavLink('/student', 'Discover Events')}{mobileNavLink('/tickets', 'My Digital Tickets')}</>
        )}
        {userRole === 'organizer' && mobileNavLink('/dashboard', 'Manage My Events')}
        {userRole === 'admin' && (
          <>{mobileNavLink('/dashboard', 'Organize Mode')}{mobileNavLink('/admin', 'Admin Command Center')}</>
        )}
        
        <div className="h-px w-full bg-white/10 my-1"></div>
        
        <button onClick={handleLogout} className="w-full text-left px-5 py-3.5 rounded-xl text-base font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all">
          Log Out
        </button>
      </div>

    </div>
  );
}