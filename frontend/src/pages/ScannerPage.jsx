// src/pages/ScannerPage.jsx
import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import { auth } from '../firebaseConfig';
import { Link } from 'react-router-dom';

const BACKEND_URL = 'https://campus-event-management-and-ticketing.onrender.com';

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  const handleScan = async (detectedCodes) => {
    if (detectedCodes.length > 0 && isScanning) {
      setIsScanning(false); 
      const qrData = detectedCodes[0].rawValue;
      
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.post(`${BACKEND_URL}/api/registrations/verify`, 
          { qrCodeData: qrData },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setScanResult({
          status: 'success',
          message: response.data.message,
          student: response.data.studentName,
          event: response.data.eventName
        });
      } catch (error) {
        setScanResult({
          status: 'error',
          message: error.response?.data?.message || 'Invalid or Duplicate Ticket!'
        });
      }
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 pt-20 pb-10">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md glass-panel rounded-[2.5rem] overflow-hidden relative z-10 animate-[slide-up_0.4s_ease-out] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="p-8 pb-6 border-b border-white/10 bg-black/20 text-center relative">
          <Link to="/dashboard" className="absolute left-6 top-8 text-zinc-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </Link>
          <h2 className="text-2xl font-black text-white">Entry Scanner</h2>
          <p className="mt-2 text-zinc-400 text-sm font-medium">Position the QR code within the frame.</p>
        </div>

        <div className="p-6 sm:p-8 bg-black/40 min-h-[450px] flex flex-col justify-center items-center">
          {isScanning ? (
            <div className="w-full relative animate-[slide-up_0.3s_ease-out]">
               <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-black aspect-square max-h-[320px] mx-auto w-full max-w-[320px] relative shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                 
                 {/* Corner markers to look like a viewfinder */}
                 <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl z-20 pointer-events-none"></div>
                 <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl z-20 pointer-events-none"></div>
                 <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl z-20 pointer-events-none"></div>
                 <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl z-20 pointer-events-none"></div>

                 <Scanner 
                   onScan={handleScan}
                   components={{ tracker: true, audio: false }}
                 />
                 
                 {/* Glowing scanning laser line */}
                 <div className="absolute inset-x-0 top-1/2 h-[2px] bg-indigo-500 shadow-[0_0_20px_5px_rgba(99,102,241,0.6)] z-10 pointer-events-none transform -translate-y-1/2 animate-[float_2s_ease-in-out_infinite]"></div>
               </div>
            </div>
          ) : (
            <div className={`w-full p-8 rounded-[2rem] border animate-[slide-up_0.3s_ease-out] text-center ${
              scanResult?.status === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]' 
                : 'bg-red-500/10 border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)]'
            }`}>
              
              <div className="mb-6 relative">
                <span className={`absolute inset-0 m-auto w-24 h-24 rounded-full animate-ping opacity-20 ${scanResult?.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                
                <div className={`relative mx-auto w-24 h-24 rounded-full flex items-center justify-center border-4 border-zinc-900 ${scanResult?.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'bg-red-500/20 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)]'}`}>
                  {scanResult?.status === 'success' ? (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                  )}
                </div>
              </div>
              
              <h3 className="text-3xl font-black text-white mb-2">
                {scanResult?.status === 'success' ? 'Access Granted' : 'Access Denied'}
              </h3>
              
              <p className={`font-bold text-sm mb-8 ${scanResult?.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {scanResult?.message}
              </p>
              
              {scanResult?.status === 'success' && (
                <div className="bg-black/30 rounded-2xl p-5 text-left mb-8 border border-white/5">
                  <div className="mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Attendee Name</span>
                    <p className="font-bold text-lg text-white">{scanResult.student}</p>
                  </div>
                  <div className="h-px bg-white/5 w-full mb-4"></div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Registered Event</span>
                    <p className="font-medium text-zinc-300">{scanResult.event}</p>
                  </div>
                </div>
              )}

              <button 
                onClick={resetScanner} 
                className={`w-full py-4 rounded-xl font-bold transition-all text-white hover:-translate-y-1 ${
                  scanResult?.status === 'success' 
                    ? 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                    : 'bg-red-600 hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                }`}
              >
                Scan Next Ticket
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}