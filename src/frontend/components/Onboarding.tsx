"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Camera, Mic, Library, ChevronRight, X } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to AgriGuide AI",
      description: "Your digital agronomist for healthier crops and higher yields.",
      icon: <Sprout size={48} className="text-emerald-500" />,
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "Instant Diagnosis",
      description: "Snap a photo of any plant disease and get expert analysis in seconds.",
      icon: <Camera size={48} className="text-blue-500" />,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Talk to the Expert",
      description: "Just speak your problem. Our AI understands your language and context.",
      icon: <Mic size={48} className="text-purple-500" />,
      color: "from-purple-500 to-pink-600"
    }
  ];

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-white dark:bg-slate-900 flex flex-col">
      <div className="absolute top-6 right-6">
        <button onClick={onComplete} className="p-2 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            className="flex flex-col items-center"
          >
            <div className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center shadow-2xl shadow-emerald-500/20 text-white mb-8`}>
              {steps[currentStep].icon}
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">
              {steps[currentStep].title}
            </h2>
            <p className="text-slate-500 text-lg font-medium max-w-xs leading-relaxed">
              {steps[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-12 flex flex-col items-center gap-8">
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-200'}`} 
            />
          ))}
        </div>

        <button 
          onClick={next}
          className="w-full max-w-xs py-5 bg-slate-900 text-white rounded-[2rem] font-black tracking-widest uppercase flex items-center justify-center gap-3 shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
        >
          {currentStep === steps.length - 1 ? "Get Started" : "Next Step"}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
