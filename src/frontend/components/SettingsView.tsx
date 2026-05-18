"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { User, Globe, Moon, Sun, Trash2, Download, Shield, Bell, ChevronRight, Sprout, MapPin, Search, X, ChevronDown, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Country, City } from 'country-state-city';
import { useAuth } from "../contexts/AuthContext";

interface Settings {
  farmName: string;
  location: string;
  crops: string;
  language: string;
  expertise: string;
  notifications: boolean;
  darkMode: boolean;
}

interface SettingsViewProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Partial<Settings>) => void;
}

type SectionItem = {
  key: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
  sub?: string;
  isToggle?: boolean;
  isSelect?: boolean;
  isLocation?: boolean;
  options?: string[];
};

type Section = {
  title: string;
  icon: React.ReactNode;
  items: SectionItem[];
};

// Map the library countries to our interface if needed, but we can use the library directly
const COUNTRIES = Country.getAllCountries().map(c => ({
  code: c.isoCode,
  name: c.name
}));

interface CityResult {
  id: string | number;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
}

// ─── Location Picker Modal ────────────────────────────────────────────────────
function LocationPicker({ currentLocation, onSave, onClose }: {
  currentLocation: string;
  onSave: (location: string) => void;
  onClose: () => void;
}) {
  // Parse current location
  const parts = currentLocation.split(", ");
  const initialCity = parts[0] || "";
  const initialCountry = parts.length > 1 ? parts[parts.length - 1] : "";

  const matchedCountry = COUNTRIES.find(c => c.name === initialCountry);

  const [selectedCountry, setSelectedCountry] = useState(matchedCountry?.code || "");
  const [countrySearch, setCountrySearch] = useState("");
  const [citySearch, setCitySearch] = useState(initialCity);
  const [cityResults, setCityResults] = useState<CityResult[]>([]);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const selectedCountryName = COUNTRIES.find(c => c.code === selectedCountry)?.name || "";

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  ).sort((a, b) => {
    const aStartsWith = a.name.toLowerCase().startsWith(countrySearch.toLowerCase());
    const bStartsWith = b.name.toLowerCase().startsWith(countrySearch.toLowerCase());
    
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    return a.name.localeCompare(b.name);
  });

  const searchCities = useCallback((query: string) => {
    if (!selectedCountry) {
      setCityResults([]);
      return;
    }

    // Get all cities for the selected country from our new database
    const allCities = City.getCitiesOfCountry(selectedCountry) || [];
    
    if (!query) {
      // Show top cities or just the first few if no query
      setCityResults(allCities.slice(0, 20).map(c => ({
        id: `${c.name}-${c.latitude}-${c.longitude}`,
        name: c.name,
        country: selectedCountry,
        latitude: parseFloat(c.latitude || "0"),
        longitude: parseFloat(c.longitude || "0")
      })));
      return;
    }

    // Filter locally with prioritization
    const filtered = allCities.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(query.toLowerCase());
      const bStarts = b.name.toLowerCase().startsWith(query.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    }).slice(0, 50); // Limit to 50 results for performance

    setCityResults(filtered.map(c => ({
      id: `${c.name}-${c.latitude}-${c.longitude}`,
      name: c.name,
      country: selectedCountry,
      latitude: parseFloat(c.latitude || "0"),
      longitude: parseFloat(c.longitude || "0")
    })));
  }, [selectedCountry]);

  // Remove the old API-based useEffect and replace it with direct call
  useEffect(() => {
    searchCities(citySearch);
  }, [citySearch, searchCities]);

  const handleSelectCity = (city: CityResult) => {
    setSelectedCity(city.name);
    setCitySearch(city.name);
    setCityResults([]);
  };

  const handleSave = () => {
    if (selectedCity && selectedCountryName) {
      onSave(`${selectedCity}, ${selectedCountryName}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-black text-slate-800 dark:text-white">Select Location</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Country Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Country</label>
            <div className="relative">
              <button
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 text-left hover:border-emerald-400 transition-colors"
              >
                <span className={cn("text-sm font-bold", selectedCountryName ? "text-slate-800 dark:text-white" : "text-slate-400")}>
                  {selectedCountryName || "Choose a country..."}
                </span>
                <ChevronDown size={18} className={cn("text-slate-400 transition-transform", showCountryDropdown && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showCountryDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-600 z-50 overflow-hidden"
                  >
                    {/* Search */}
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-xl px-3 py-2">
                        <Search size={16} className="text-slate-400" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search country..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="flex-1 bg-transparent text-sm font-medium outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    {/* List */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredCountries.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => {
                            setSelectedCountry(c.code);
                            setShowCountryDropdown(false);
                            setCountrySearch("");
                            // Reset city when country changes
                            setSelectedCity("");
                            setCitySearch("");
                            setCityResults([]);
                          }}
                          className={cn(
                            "w-full text-left px-5 py-3 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors",
                            selectedCountry === c.code
                              ? "bg-emerald-50 dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 font-bold"
                              : "text-slate-700 dark:text-slate-300"
                          )}
                        >
                          {c.name}
                        </button>
                      ))}
                      {filteredCountries.length === 0 && (
                        <p className="p-4 text-sm text-slate-400 text-center">No countries found</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* City Search */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">City</label>
            <div className="relative">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-600 focus-within:border-emerald-400 transition-colors">
                <Search size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder={selectedCountry ? "Search for a city..." : "Select a country first"}
                  disabled={!selectedCountry}
                  value={citySearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCitySearch(val);
                    setSelectedCity("");
                    if (!val) setCityResults([]);
                  }}
                  onFocus={() => searchCities(citySearch)}
                  className="flex-1 bg-transparent text-sm font-bold outline-none text-slate-800 dark:text-white placeholder:text-slate-400 disabled:opacity-50"
                />
                {/* Loading spinner removed as search is now local and instant */}
              </div>

              {/* City Results Dropdown */}
              <AnimatePresence>
                {cityResults.length > 0 && !selectedCity && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-600 z-50 overflow-hidden max-h-48 overflow-y-auto"
                  >
                    {cityResults.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleSelectCity(city)}
                        className="w-full text-left px-5 py-3 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-b-0"
                      >
                        <span className="text-sm font-bold text-slate-800 dark:text-white">{city.name}</span>
                        {city.admin1 && (
                          <span className="text-xs text-slate-400 ml-2">{city.admin1}</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Preview */}
          {selectedCity && selectedCountryName && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800"
            >
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-emerald-600" />
                <span className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                  {selectedCity}, {selectedCountryName}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedCity || !selectedCountryName}
            className="flex-1 py-3 rounded-2xl text-sm font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Location
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Settings View ───────────────────────────────────────────────────────
export function SettingsView({ settings, onUpdateSettings }: SettingsViewProps) {
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const { logout } = useAuth();

  const sections: Section[] = [
    {
      title: "Farm Profile",
      icon: <Sprout className="text-emerald-600" size={20} />,
      items: [
        { key: 'farmName', label: "Farm Name", value: settings.farmName },
        { key: 'location', label: "Location", value: settings.location, icon: <MapPin size={14} />, isLocation: true, sub: "Used for weather forecasts" },
        { key: 'crops', label: "Primary Crops", value: settings.crops }
      ]
    },
    {
      title: "Preferences",
      icon: <Globe className="text-blue-600" size={20} />,
      items: [
        { 
          key: 'language', 
          label: "Language", 
          value: settings.language, 
          sub: "AI will respond in this language",
          isSelect: true,
          options: ["English", "Finnish", "Persian", "Spanish", "French", "German", "Arabic", "Hindi", "Russian", "Chinese", "Japanese"]
        },
        { key: 'expertise', label: "Expertise Level", value: settings.expertise }
      ]
    },
    {
      title: "App Settings",
      icon: <Shield className="text-slate-600" size={20} />,
      items: [
        { key: 'darkMode', label: "Dark Mode", value: settings.darkMode ? "On" : "Off", isToggle: true }
      ]
    }
  ];

  const handleItemClick = (item: SectionItem) => {
    if (item.isToggle) {
      onUpdateSettings({ [item.key]: !settings[item.key as keyof Settings] });
    } else if (item.isSelect || item.isLocation) {
      return; // Handled by their own controls
    } else {
      const newValue = prompt(`Enter new ${item.label}:`, item.value);
      if (newValue !== null && newValue.trim() !== '') {
        onUpdateSettings({ [item.key]: newValue });
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white/50 backdrop-blur-md border-b border-slate-200/50">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          Settings
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">Configure your farm profile and app experience.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-24">
        {/* User Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <User size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">{settings.farmName}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{settings.expertise}</p>
            </div>
          </div>
        </div>

        {/* Setting Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              {section.icon}
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{section.title}</h4>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              {section.items.map((item, i) => (
                <div 
                  key={i}
                  onClick={() => {
                    if (item.isLocation) {
                      setShowLocationPicker(true);
                    } else {
                      handleItemClick(item);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between p-5 hover:bg-slate-50 active:bg-slate-100 transition-colors",
                    !item.isSelect && "cursor-pointer",
                    i !== section.items.length - 1 && "border-b border-slate-50"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-slate-800">{item.label}</span>
                    {item.sub && <span className="text-[11px] text-slate-400 font-medium">{item.sub}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.isSelect ? (
                      <select 
                        value={item.value}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdateSettings({ [item.key]: e.target.value })}
                        className="bg-slate-100 text-slate-600 text-[12px] font-black px-3 py-1 rounded-full outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none text-right pr-6"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
                      >
                        {!item.value && <option value="" disabled>Select {item.label}</option>}
                        {item.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <span className={cn(
                        "text-[12px] font-black px-3 py-1 rounded-full transition-colors",
                        item.isToggle && (item.value.includes("En") || item.value === "On")
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-slate-100 text-slate-600"
                      )}>
                        {item.value}
                      </span>
                    )}
                    {!item.isSelect && <ChevronRight size={16} className="text-slate-300" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.removeItem("agri_guest_mode");
            logout();
          }}
          className="w-full flex items-center justify-center gap-2 p-5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-[2rem] font-black text-[14px] transition-all border border-red-100 dark:border-red-500/20"
        >
          <LogOut size={18} />
          Log Out from AgriGuide
        </button>

      </div>

      {/* Location Picker Modal */}
      <AnimatePresence>
        {showLocationPicker && (
          <LocationPicker
            currentLocation={settings.location}
            onSave={(loc) => {
              onUpdateSettings({ location: loc });
              setShowLocationPicker(false);
            }}
            onClose={() => setShowLocationPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
