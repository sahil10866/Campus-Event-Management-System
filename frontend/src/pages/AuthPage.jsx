// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { auth, requestForToken } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = 'https://campus-event-management-and-ticketing.onrender.com';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const syncUserWithBackend = async (user) => {
    try {
      const token = await user.getIdToken();
      const fcmToken = await requestForToken();
      const response = await axios.post(`${BACKEND_URL}/api/users/sync`, { name: name || user.displayName || '', fcmToken: fcmToken || '' }, { headers: { Authorization: `Bearer ${token}` } });
      const userRole = response.data.user.role;
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('fcmToken', fcmToken);
      navigate(userRole === 'admin' ? '/admin' : userRole === 'organizer' ? '/dashboard' : '/student');
    } catch (err) {
      setError('Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      await syncUserWithBackend(userCredential.user);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Animated Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px] animate-[glow-pulse_6s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] animate-[glow-pulse_8s_ease-in-out_infinite_1s]"></div>

      <div className="w-full max-w-md relative z-10 animate-[slide-up_0.5s_ease-out]">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] mb-6 transform rotate-12 hover:rotate-0 transition-transform duration-500">
            <span className="text-3xl">🎪</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">CampusFests</h1>
          <p className="text-zinc-400 font-medium">Your gateway to campus events.</p>
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-[2.5rem]">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                placeholder="you@campus.edu"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <p className="mt-8 text-center text-zinc-400 text-sm font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors underline decoration-indigo-400/30 underline-offset-4"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}