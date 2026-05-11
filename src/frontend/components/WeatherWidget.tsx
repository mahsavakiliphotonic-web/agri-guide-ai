"use client";

import React, { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Snowflake, CloudLightning, Wind, Droplets, AlertTriangle, Flame, Thermometer, ShieldAlert, CloudSun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WeatherWidgetProps {
  location: string;
}

interface WeatherAlert {
  type: "frost" | "fire" | "storm" | "disease" | "wind" | "heat" | "rain" | "info";
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
}

function generateAlerts(temp: number, humidity: number, wind: number, weatherCode: number): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  // ❄️ Frost Warning
  if (temp <= 0) {
    alerts.push({
      type: "frost",
      severity: "critical",
      title: "Frost Warning",
      message: `Temperature is ${temp}°C. Protect sensitive crops immediately. Cover seedlings and irrigate to prevent frost damage.`
    });
  } else if (temp > 0 && temp <= 4) {
    alerts.push({
      type: "frost",
      severity: "warning",
      title: "Near-Freezing Conditions",
      message: `Temperature is ${temp}°C. Risk of ground frost overnight. Monitor tender crops and delay planting.`
    });
  }

  // 🔥 Fire Risk (high temp + low humidity + wind)
  if (temp >= 30 && humidity < 30 && wind > 15) {
    alerts.push({
      type: "fire",
      severity: "critical",
      title: "Fire Risk — Extreme",
      message: "High temperature, low humidity, and strong winds create extreme wildfire conditions. Avoid open burning and machinery near dry vegetation."
    });
  } else if (temp >= 28 && humidity < 40) {
    alerts.push({
      type: "fire",
      severity: "warning",
      title: "Elevated Fire Risk",
      message: "Hot and dry conditions increase fire danger. Ensure firebreaks are clear and irrigation systems are operational."
    });
  }

  // 🌡️ Heat Stress
  if (temp >= 35) {
    alerts.push({
      type: "heat",
      severity: "critical",
      title: "Heat Stress Alert",
      message: `Extreme heat at ${temp}°C. Increase irrigation frequency, provide shade for livestock, and avoid fieldwork during midday.`
    });
  } else if (temp >= 30 && temp < 35) {
    alerts.push({
      type: "heat",
      severity: "warning",
      title: "High Temperature",
      message: `Temperature is ${temp}°C. Monitor crops for wilting and ensure adequate soil moisture.`
    });
  }

  // ⛈️ Storm Warning (based on WMO weather codes)
  if (weatherCode >= 95) {
    alerts.push({
      type: "storm",
      severity: "critical",
      title: "Severe Storm Warning",
      message: "Thunderstorm with possible hail detected. Secure farm equipment, protect greenhouses, and stay indoors."
    });
  } else if (weatherCode >= 80 && weatherCode < 95) {
    alerts.push({
      type: "storm",
      severity: "warning",
      title: "Heavy Rain Warning",
      message: "Intense rain showers expected. Risk of waterlogging and soil erosion. Ensure drainage channels are clear."
    });
  }

  // 🌧️ Rain Advisory
  if (weatherCode >= 51 && weatherCode <= 67) {
    alerts.push({
      type: "rain",
      severity: "info",
      title: "Rain Advisory",
      message: "Rainfall detected. Delay pesticide and fertilizer spraying. Postpone irrigation to conserve water."
    });
  }

  // 🍄 Disease Risk (high humidity + warm temp)
  if (humidity >= 85 && temp >= 15 && temp <= 25) {
    alerts.push({
      type: "disease",
      severity: "critical",
      title: "High Disease Risk",
      message: "Warm, humid conditions are ideal for Late Blight and fungal diseases. Apply preventive fungicides and inspect crops."
    });
  } else if (humidity >= 75 && temp >= 10) {
    alerts.push({
      type: "disease",
      severity: "warning",
      title: "Fungal Disease Risk",
      message: `Humidity at ${humidity}%. Monitor crops for powdery mildew, rust, and other fungal infections.`
    });
  }

  // 💨 Wind Warning
  if (wind >= 40) {
    alerts.push({
      type: "wind",
      severity: "critical",
      title: "Dangerous Winds",
      message: `Wind speed ${wind} km/h. Do not spray chemicals. Secure structures, greenhouses, and tall crops.`
    });
  } else if (wind >= 25) {
    alerts.push({
      type: "wind",
      severity: "warning",
      title: "Strong Wind Advisory",
      message: `Wind at ${wind} km/h. Avoid pesticide spraying to prevent drift. Check plant supports.`
    });
  }

  // ✅ All Clear
  if (alerts.length === 0) {
    alerts.push({
      type: "info",
      severity: "info",
      title: "Conditions Favorable",
      message: "No weather warnings. Good conditions for irrigation, spraying, and field operations."
    });
  }

  return alerts;
}

function getAlertIcon(type: WeatherAlert["type"]) {
  switch (type) {
    case "frost": return <Snowflake size={16} />;
    case "fire": return <Flame size={16} />;
    case "storm": return <CloudLightning size={16} />;
    case "heat": return <Thermometer size={16} />;
    case "wind": return <Wind size={16} />;
    case "rain": return <CloudRain size={16} />;
    case "disease": return <ShieldAlert size={16} />;
    default: return <Sun size={16} />;
  }
}

function getAlertColors(severity: WeatherAlert["severity"]) {
  switch (severity) {
    case "critical": return { bg: "bg-rose-50 dark:bg-rose-900/30", border: "border-rose-300 dark:border-rose-800", text: "text-rose-700 dark:text-rose-300", icon: "text-rose-500", badge: "bg-rose-500" };
    case "warning": return { bg: "bg-amber-50 dark:bg-amber-900/30", border: "border-amber-300 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", icon: "text-amber-500", badge: "bg-amber-500" };
    default: return { bg: "bg-emerald-50 dark:bg-emerald-900/30", border: "border-emerald-300 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", icon: "text-emerald-500", badge: "bg-emerald-500" };
  }
}

function getWeatherIcon(condition: string) {
  switch (condition) {
    case "Rainy": return <CloudRain size={28} className="text-blue-200" />;
    case "Partly Cloudy": return <CloudSun size={28} className="text-white" />;
    case "Snow": return <Snowflake size={28} className="text-blue-100" />;
    case "Storm": return <CloudLightning size={28} className="text-yellow-200" />;
    default: return <Sun size={28} className="text-amber-300 animate-pulse" />;
  }
}

export function WeatherWidget({ location }: WeatherWidgetProps) {
  const [weather, setWeather] = useState({
    temp: 0,
    apparentTemp: 0,
    condition: "Loading...",
    humidity: 0,
    wind: 0,
  });
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedName, setResolvedName] = useState("");

  useEffect(() => {
    async function fetchWeather() {
      if (!location) return;
      try {
        setLoading(true);
        // Extract city name (first part before comma)
        const cityName = location.split(",")[0].trim();
        
        // Step 1: Geocoding
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
          setWeather(prev => ({ ...prev, condition: "Location not found" }));
          setLoading(false);
          return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        setResolvedName(`${name}, ${country}`);

        // Step 2: Weather Forecast
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature`);
        const weatherData = await weatherRes.json();

        if (weatherData.current) {
          const w = weatherData.current;
          let condition = "Clear";
          
          if (w.weather_code >= 1 && w.weather_code <= 3) condition = "Partly Cloudy";
          if (w.weather_code >= 51 && w.weather_code <= 67) condition = "Rainy";
          if (w.weather_code >= 71 && w.weather_code <= 77) condition = "Snow";
          if (w.weather_code >= 80 && w.weather_code <= 82) condition = "Rainy";
          if (w.weather_code >= 95) condition = "Storm";

          const temp = Math.round(w.temperature_2m);
          const apparentTemp = Math.round(w.apparent_temperature);
          const humidity = Math.round(w.relative_humidity_2m);
          const wind = Math.round(w.wind_speed_10m);

          setWeather({ temp, apparentTemp, condition, humidity, wind });
          setAlerts(generateAlerts(temp, humidity, wind, w.weather_code));
        }
      } catch (error) {
        console.error("Failed to fetch weather", error);
        setWeather(prev => ({ ...prev, condition: "Network Error" }));
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [location]);

  return (
    <div className="space-y-3">
      {/* Main Weather Card */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-4 mb-2 p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group"
      >
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Live Forecast</p>
              <h3 className="text-lg font-black tracking-tight">{resolvedName || location || "Nearby Farm"}</h3>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              {getWeatherIcon(weather.condition)}
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl font-black tracking-tighter">{loading ? "--" : weather.temp}°</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold opacity-80">{weather.condition}</span>
                {!loading && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Feels like {weather.apparentTemp}°</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-6 pt-2 border-t border-white/15">
            <div className="flex items-center gap-1.5">
              <Droplets size={14} className="text-blue-200" />
              <span className="text-xs font-bold">{loading ? "--" : weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wind size={14} className="text-slate-200" />
              <span className="text-xs font-bold">{loading ? "--" : weather.wind} km/h</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Smart Alerts */}
      <AnimatePresence>
        {!loading && alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 space-y-2"
          >
            <div className="flex items-center gap-2 px-1 mb-1">
              <AlertTriangle size={12} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Weather Alerts ({alerts.length})
              </span>
            </div>
            {alerts.map((alert, i) => {
              const colors = getAlertColors(alert.severity);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-3.5 rounded-2xl border ${colors.bg} ${colors.border}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 ${colors.icon}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-black ${colors.text}`}>{alert.title}</span>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full text-white ${colors.badge}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed font-medium ${colors.text} opacity-80`}>
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
