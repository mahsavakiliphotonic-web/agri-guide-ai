"use client";

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { LogIn, Sparkles, Sprout, ShieldCheck, Globe, AlertCircle } from "lucide-react";

export const LoginView: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setErrorMsg(null);
      await loginWithGoogle();
    } catch (error: any) {
      setErrorMsg(error.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-6 font-inter">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] shadow-2xl p-8 md:p-12 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-600/30 mx-auto mb-6 transform rotate-3">
            <Sprout size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">AgriGuide AI</h1>
          <p className="text-slate-500 font-medium">Your Expert AI Agronomist</p>
        </div>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">AI Plant Diagnosis</h3>
              <p className="text-[12px] text-slate-500">Expert analysis of crop diseases in seconds.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Multi-Language Support</h3>
              <p className="text-[12px] text-slate-500">Available in Persian, English, and more.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Secure Consultation</h3>
              <p className="text-[12px] text-slate-500">Your farm data is protected and private.</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 active:scale-[0.98]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
          Continue with Google
        </button>

        {errorMsg && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span className="break-words">{errorMsg}</span>
          </div>
        )}

        <p className="text-center text-slate-400 text-xs mt-8">
          By continuing, you agree to AgriGuide Terms of Service.
        </p>
      </motion.div>
    </div>
  );
};
