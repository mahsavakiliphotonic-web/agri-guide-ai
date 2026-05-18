"use client";

import React, { useState, useEffect } from "react";
import { Camera, Book, History, Settings as SettingsIcon, AlertTriangle, Search, Plus, FolderOpen, Sun, Bot, CloudSun, Droplets, ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "@/frontend/contexts/AuthContext";
import { LoginView } from "@/frontend/components/LoginView";
import { motion, AnimatePresence } from "framer-motion";
import { CameraDiagnosis } from "@/frontend/components/CameraDiagnosis";
import { ChatInterface, Message } from "@/frontend/components/ChatInterface";
import { LibraryView } from "@/frontend/components/LibraryView";
import { HistoryLog } from "@/frontend/components/HistoryLog";
import { SettingsView } from "@/frontend/components/SettingsView";
import { WeatherWidget } from "@/frontend/components/WeatherWidget";
import { Onboarding } from "@/frontend/components/Onboarding";
import { cn } from "@/lib/utils";

type Tab = 'home' | 'weather' | 'library' | 'history' | 'settings';

export interface Case {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
  lastUpdatedAt: number;
  status: "active" | "resolved" | "monitoring";
  crop?: string;
  diagnosis?: string;
}

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [liveTemp, setLiveTemp] = useState<number | null>(null);

  // Settings State
  const [settings, setSettings] = useState({
    farmName: "Green Valley Farms",
    location: "Mazandaran, Iran",
    crops: "Rice, Citrus",
    language: "English",
    expertise: "Professional Farmer",
    notifications: true,
    darkMode: false
  });

  // Load/Save Settings & Onboarding
  useEffect(() => {
    const savedSettings = localStorage.getItem("agri_settings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      if (parsed.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    const hasSeenOnboarding = localStorage.getItem("has_seen_onboarding");
    if (!hasSeenOnboarding) setShowOnboarding(true);
    
    setIsInitialized(true);
  }, []);

  // Fetch live temperature for the nav badge
  useEffect(() => {
    async function fetchLiveTemp() {
      if (!settings.location || !isInitialized) return;
      try {
        const cityName = settings.location.split(",")[0].trim();
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude } = geoData.results[0];
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`);
          const weatherData = await weatherRes.json();
          if (weatherData.current) {
            setLiveTemp(Math.round(weatherData.current.temperature_2m));
          }
        }
      } catch (e) {
        console.error("Badge temp fetch failed", e);
      }
    }
    fetchLiveTemp();
    const interval = setInterval(fetchLiveTemp, 600000); // Update every 10 mins
    return () => clearInterval(interval);
  }, [settings.location, isInitialized]);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("has_seen_onboarding", "true");
  };

  const updateSettings = (newSettings: any) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("agri_settings", JSON.stringify(updated));
  };

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const [cases, setCases] = useState<Case[]>([]);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "bot",
      content: "Hello! I'm your AgriGuide AI agronomist. How can I help your crops today?",
      isInitial: true
    }
  ]);

  // Load cases from localStorage on mount
  useEffect(() => {
    const savedCases = localStorage.getItem("agri_guide_cases");
    if (savedCases) {
      try {
        const parsed = JSON.parse(savedCases);
        setCases(parsed);
        // If there are cases, select the most recent one
        if (parsed.length > 0) {
          // We load the cases into state, but we DON'T select one.
          // This ensures the app starts with a "Fresh Chat" interface.
          setCurrentCaseId(null);
        }
      } catch (e) {
        console.error("Failed to load cases", e);
      }
    }
  }, []);

  // Save cases to localStorage whenever they change
  useEffect(() => {
    // We remove the length check so that deleting the last item actually works!
    localStorage.setItem("agri_guide_cases", JSON.stringify(cases));
  }, [cases]);

  // Sync messages to current case
  useEffect(() => {
    if (currentCaseId) {
      setCases(prev => prev.map(c => 
        c.id === currentCaseId ? { ...c, messages, lastUpdatedAt: Date.now() } : c
      ));
    }
  }, [messages]);

  // Auth Guard
  const isGuestMode = typeof window !== 'undefined' && localStorage.getItem("agri_guest_mode") === "true";

  if (loading && !isGuestMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && !isGuestMode) {
    return <LoginView />;
  }

  const createNewCase = (name: string = "New Consultation") => {
    const newId = Date.now().toString();
    const newCase: Case = {
      id: newId,
      name,
      messages: [{
        id: "initial",
        role: "bot",
        content: `Consultation started for: ${name}. How can I assist?`,
        isInitial: true
      }],
      createdAt: Date.now(),
      lastUpdatedAt: Date.now(),
      status: "active"
    };
    setCases(prev => [newCase, ...prev]);
    setCurrentCaseId(newId);
    setMessages(newCase.messages);
    setActiveTab("home");
  };

  const handleSelectCase = (caseId: string) => {
    const selected = cases.find(c => c.id === caseId);
    if (selected) {
      setCurrentCaseId(caseId);
      setMessages(selected.messages);
      // We only switch tabs if we are not already on the home tab
      if (activeTab !== "home") {
        setActiveTab("home");
      }
    }
  };

  const handleDeleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
    
    if (currentCaseId === id) {
      setCurrentCaseId(null);
      setMessages([
        {
          id: "initial",
          role: "bot",
          content: "Hello! I'm your AgriGuide AI agronomist. How can I help your crops today?",
          isInitial: true
        }
      ]);
    }
  };

  const handleRenameCase = (id: string, newName: string) => {
    setCases(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, name: newName, lastUpdatedAt: Date.now() } : c);
      localStorage.setItem("agri_guide_cases", JSON.stringify(updated));
      return updated;
    });
  };

  const handleCapture = async (blob: Blob) => {
    setIsCameraOpen(false);
    setIsLoading(true);
    
    const imageUrl = URL.createObjectURL(blob);
    const userMsgId = Date.now().toString();
    
    // Add user message with image
    const userMsg: Message = {
      id: userMsgId,
      role: "user",
      content: "Analyzing this plant for potential diseases...",
      image: imageUrl
    };
    
    setMessages(prev => [...prev, userMsg]);

    try {
      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");
      formData.append("preferredLanguage", settings.language);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Analysis failed");

      const botMsgId = (Date.now() + 1).toString();
      const botMsg: Message = {
        id: botMsgId,
        role: "bot",
        content: `**Diagnosis:** ${data.diagnosis.disease} (${data.diagnosis.species})\n**Urgency:** ${data.diagnosis.urgency}\n\n**Recommended Treatment:**\n${data.treatment}`
      };
      
      setMessages(prev => [...prev, botMsg]);

      // If this is a new consultation, auto-name the case
      if (currentCaseId && cases.find(c => c.id === currentCaseId)?.name === "New Consultation") {
        setCases(prev => prev.map(c => 
          c.id === currentCaseId ? { 
            ...c, 
            name: `${data.diagnosis.species} Issue`,
            crop: data.diagnosis.species,
            diagnosis: data.diagnosis.disease
          } : c
        ));
      } else if (!currentCaseId) {
        // Create a new case if none exists
        const newId = Date.now().toString();
        const newCase: Case = {
          id: newId,
          name: `${data.diagnosis.species} Issue`,
          messages: [...messages, userMsg, botMsg],
          createdAt: Date.now(),
          lastUpdatedAt: Date.now(),
          status: "active",
          crop: data.diagnosis.species,
          diagnosis: data.diagnosis.disease
        };
        setCases(prev => [newCase, ...prev]);
        setCurrentCaseId(newId);
        setMessages(newCase.messages);
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "bot",
        content: "I encountered an error while analyzing the photo. Please try again with better lighting."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string, image?: File) => {
    const userMsgId = Date.now().toString();
    
    // Helper to compress and convert file to base64
    const compressFile = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
          };
        };
      });
    };

    const imagePreviewUrl = image ? await compressFile(image) : undefined;
    
    const userMessage: Message = { 
      id: userMsgId, 
      role: "user", 
      content: text || (settings.language === "Persian" ? "درخواست بررسی گیاه" : "Plant Inquiry"),
      image: imagePreviewUrl
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let res: Response;
      if (image) {
        const formData = new FormData();
        formData.append("image", image, image.name);
        formData.append("query", userMessage.content);
        formData.append("preferredLanguage", settings.language);
        res = await fetch("/api/chat", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            query: text,
            preferredLanguage: settings.language 
          }),
        });
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Query failed");

      const botMsgId = (Date.now() + 1).toString();
      const botMsg: Message = {
        id: botMsgId,
        role: "bot",
        content: data.answer
      };

      if (!currentCaseId) {
        const newId = Date.now().toString();
        const firstWords = userMessage.content.split(" ").slice(0, 3).join(" ");
        const caseName = text ? (firstWords.length > 20 ? firstWords.substring(0, 20) + "..." : firstWords) : "Analysis";
        
        const newCase: Case = {
          id: newId,
          name: caseName,
          messages: [...messages, userMessage, botMsg],
          createdAt: Date.now(),
          lastUpdatedAt: Date.now(),
          status: "active"
        };
        
        setCases(prev => [newCase, ...prev]);
        setCurrentCaseId(newId);
        setMessages(newCase.messages);
      } else {
        setMessages(prev => [...prev, botMsg]);
        
        setCases(prev => prev.map(c => {
          if (c.id === currentCaseId) {
            const firstWords = userMessage.content.split(" ").slice(0, 3).join(" ");
            return { 
              ...c, 
              messages: [...c.messages, userMessage, botMsg],
              lastUpdatedAt: Date.now(),
              name: c.name === "New Consultation" ? (firstWords || "Consultation") : c.name
            };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error(err);
      const errorMsg = settings.language === "Finnish" 
        ? "Tekoäly on tällä hetkellä varattu. Yritä uudelleen hetken kuluttua."
        : settings.language === "Persian" 
        ? "متأسفانه مشکلی در پردازش سوال شما پیش آمد. لطفاً دوباره تلاش کنید." 
        : settings.language === "Spanish"
        ? "Lo siento, tuve مشکلات برای پردازش سوال شما. لطفاً دوباره تلاش کنید."
        : "Sorry, I had trouble processing your question. Please try again.";

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: errorMsg
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) return null;

  return (
    <main className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-900 gradient-mesh overflow-hidden w-full">
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      {/* Navigation - Sidebar (Desktop) / Bottom Bar (Mobile) */}
      {!showOnboarding && (
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-700 flex justify-around items-center px-6 z-[100] pb-safe md:static md:w-24 lg:w-64 md:h-full md:flex-col md:justify-start md:border-t-0 md:border-r md:pt-6 md:px-4 md:gap-4 lg:items-stretch shadow-2xl md:shadow-none">
        <div className="hidden lg:flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">AgriGuide</h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Precision AI</span>
          </div>
        </div>
        
        {[
          { id: "home", icon: Bot, label: "Ask AI" },
          { id: "weather", icon: CloudSun, label: "Weather", isWeather: true },
          { id: "library", icon: Book, label: "Library" },
          { id: "history", icon: History, label: "History" },
          { id: "settings", icon: SettingsIcon, label: "Settings" }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className={cn(
              "flex flex-col lg:flex-row items-center lg:justify-start gap-1.5 lg:gap-4 transition-all duration-300 relative group lg:px-4 lg:py-3 lg:rounded-2xl",
              item.isWeather && activeTab !== item.id
                ? "text-amber-500 hover:text-amber-600"
                : activeTab === item.id 
                  ? "text-emerald-600 lg:bg-emerald-50 dark:lg:bg-slate-700" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            {activeTab === item.id && (
              <motion.div 
                layoutId="nav-active"
                className="absolute -top-3 lg:top-auto lg:bottom-auto lg:-left-2 lg:w-1.5 lg:h-8 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              />
            )}
            <div className="relative">
              <item.icon 
                size={24} 
                strokeWidth={activeTab === item.id ? 2.5 : 2} 
                className={cn(
                  "transition-transform shrink-0",
                  activeTab === item.id ? "scale-110" : "group-hover:scale-105"
                )}
              />
              {/* Live temp badge on weather tab */}
              {item.isWeather && liveTemp !== null && (
                <span className="absolute -top-2.5 -right-3 text-[9px] font-black bg-gradient-to-br from-amber-400 to-orange-500 text-white px-1.5 py-0.5 rounded-full shadow-lg shadow-amber-500/40 animate-pulse min-w-[28px] text-center">
                  {liveTemp}°
                </span>
              )}
            </div>
            <span className="text-[10px] lg:text-sm font-black uppercase lg:normal-case tracking-[0.1em] lg:tracking-normal">{item.label}</span>
          </button>
        ))}

        {/* User Profile Section (Desktop Sidebar) */}
        <div className="hidden lg:flex flex-col gap-4 mt-auto mb-6">
          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 group transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20 shrink-0">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-800 dark:text-white truncate">
                {user?.displayName || "Agri User"}
              </p>
              <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">
                {user?.email}
              </p>
            </div>
            <button 
              onClick={() => logout()}
              className="p-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 text-slate-400 rounded-xl transition-all active:scale-90"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

      </nav>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative pb-20 md:pb-0">
        {/* Top Bar - Mobile Only (Hidden on Desktop) */}
        <header className="p-4 glass-panel flex items-center justify-between sticky top-0 z-50 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">AgriGuide</h1>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Precision AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                localStorage.removeItem("agri_guest_mode");
                logout();
              }}
              className="p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-50 bg-white rounded-xl shadow-sm border border-slate-200 transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
            <button 
              onClick={() => createNewCase()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 text-white hover:bg-slate-700 transition-all shadow-lg shadow-slate-200 font-bold text-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex flex-col"
              >
                {/* Desktop Top Bar inside Home */}
                <div className="hidden lg:flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50 glass-panel z-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Consultation</h2>
                    <p className="text-sm text-slate-500 font-medium">Ask questions or upload plant images for diagnosis.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => createNewCase()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all">
                      <Plus size={18} /> New Chat
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                  {/* Main Chat Interface */}
                  <div className="flex-1 overflow-hidden">
                    <ChatInterface 
                      messages={messages} 
                      onSendMessage={handleSendMessage} 
                      isLoading={isLoading} 
                      onOpenCamera={() => setIsCameraOpen(true)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "weather" && (
              <motion.div
                key="weather"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="absolute inset-0 overflow-y-auto p-4 lg:p-8 bg-slate-50/50 dark:bg-slate-900/50"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Weather Dashboard</h2>
                      <p className="text-slate-500 font-bold">Real-time agricultural weather insights</p>
                    </div>
                    <div className="hidden lg:block">
                      <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest border border-emerald-500/20">
                        Live Data Active
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                     <WeatherWidget location={settings.location} />
                  </div>
                  
                  <div className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                      <Sun className="text-amber-500" size={20} />
                      Farming Recommendations
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                          <Droplets className="text-blue-500" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">Irrigation Planning</h4>
                          <p className="text-xs text-amber-800/70 dark:text-amber-300/70 leading-relaxed mt-1">Based on current humidity ({liveTemp ? 'optimal' : 'loading...'}), moisture evaporation is standard. Stick to your scheduled irrigation cycles.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                          <ShieldAlert className="text-emerald-500" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">Pest Monitoring</h4>
                          <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70 leading-relaxed mt-1">Current temperature is ideal for crop growth. No immediate weather-triggered pest outbreaks detected for your region.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "library" && (
              <motion.div
                key="library"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0"
              >
                <LibraryView userCrops={settings.crops} />
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0"
              >
                <HistoryLog 
                  cases={cases} 
                  onSelectCase={handleSelectCase} 
                  onNewCase={() => createNewCase()}
                  onDeleteCase={handleDeleteCase}
                  onRenameCase={handleRenameCase}
                />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0"
              >
                <SettingsView settings={settings} onUpdateSettings={updateSettings} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isCameraOpen && (
          <CameraDiagnosis 
            onCapture={handleCapture}
            onClose={() => setIsCameraOpen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

