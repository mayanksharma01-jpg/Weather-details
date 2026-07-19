import React, { useState, useEffect, useRef } from 'react';
import { City, WeatherData, TempUnit, WindUnit } from './types';
import CurrentWeatherPanel from './components/CurrentWeatherPanel';
import WeatherChart from './components/WeatherChart';
import ForecastSection from './components/ForecastSection';
import IntelligencePanel from './components/IntelligencePanel';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Predefined cities for instant exploration
const PRESET_CITIES: City[] = [
  { id: 1, name: 'New York', latitude: 40.7128, longitude: -74.0060, country_code: 'US', country: 'United States', admin1: 'New York' },
  { id: 2, name: 'Tokyo', latitude: 35.6895, longitude: 139.6917, country_code: 'JP', country: 'Japan', admin1: 'Tokyo' },
  { id: 3, name: 'London', latitude: 51.5074, longitude: -0.1278, country_code: 'GB', country: 'United Kingdom', admin1: 'England' },
  { id: 4, name: 'Paris', latitude: 48.8566, longitude: 2.3522, country_code: 'FR', country: 'France', admin1: 'Île-de-France' },
  { id: 5, name: 'Sydney', latitude: -33.8688, longitude: 151.2093, country_code: 'AU', country: 'Australia', admin1: 'New South Wales' },
  { id: 6, name: 'Mumbai', latitude: 19.0760, longitude: 72.8777, country_code: 'IN', country: 'India', admin1: 'Maharashtra' },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City>(PRESET_CITIES[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geocodingResults, setGeocodingResults] = useState<City[]>([]);
  const [searchHistory, setSearchHistory] = useState<City[]>([]);
  
  // Settings
  const [tempUnit, setTempUnit] = useState<TempUnit>('C');
  const [windUnit, setWindUnit] = useState<WindUnit>('kmh');
  const [showConfig, setShowConfig] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('weather_intelligence_history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse search history', e);
      }
    }
  }, []);

  // Fetch weather when selected city changes
  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  // Click outside listener to close search results dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setGeocodingResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Weather Data from Open-Meteo Forecast API
  const fetchWeather = async (city: City) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to retrieve forecast data. Please try again.');
      }
      const data: WeatherData = await response.json();
      setWeatherData(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching weather forecast.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Geocoding Search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsGeocoding(true);
    setError(null);
    setGeocodingResults([]);

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=8&language=en`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Geocoding service unavailable.');
      }
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        throw new Error(`No matches found for "${searchQuery}". Please verify the spelling.`);
      }

      const results: City[] = data.results;
      setGeocodingResults(results);

      // If there is exactly one perfect match, auto-select it
      if (results.length === 1) {
        selectCity(results[0]);
      }
    } catch (err: any) {
      setError(err.message || 'City geocoding search failed. Try another spelling.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Select a City & update history
  const selectCity = (city: City) => {
    setSelectedCity(city);
    setSearchQuery('');
    setGeocodingResults([]);

    // Update history, keeping max 5 recent items, avoiding duplicates
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.latitude !== city.latitude || item.longitude !== city.longitude);
      const updated = [city, ...filtered].slice(0, 5);
      localStorage.setItem('weather_intelligence_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Clear a history item
  const removeHistoryItem = (e: React.MouseEvent, cityToClear: City) => {
    e.stopPropagation();
    setSearchHistory(prev => {
      const updated = prev.filter(item => item.latitude !== cityToClear.latitude || item.longitude !== cityToClear.longitude);
      localStorage.setItem('weather_intelligence_history', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 flex flex-col antialiased">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 inset-x-0 h-[380px] bg-gradient-to-b from-blue-50/30 to-transparent pointer-events-none -z-10" />

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <LucideIcons.CloudSun size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-slate-800 uppercase font-display">
                AETHER <span className="font-normal text-slate-500 underline decoration-blue-500 decoration-2 underline-offset-4">INTELLIGENCE</span>
              </span>
            </div>
          </div>

          {/* Active City Meta Display in Navbar */}
          <div className="flex items-center gap-6">
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-xs font-bold text-slate-800">{selectedCity.name}, {selectedCity.country_code || selectedCity.country}</div>
              <div className="text-[10px] text-slate-400 font-mono font-medium">
                {Math.abs(selectedCity.latitude).toFixed(4)}° {selectedCity.latitude >= 0 ? 'N' : 'S'} · {Math.abs(selectedCity.longitude).toFixed(4)}° {selectedCity.longitude >= 0 ? 'E' : 'W'}
              </div>
            </div>

            {/* Settings button */}
            <div className="relative">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className={`p-2 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold ${
                  showConfig
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LucideIcons.SlidersHorizontal size={14} />
                <span className="hidden sm:inline">Settings</span>
              </button>

              <AnimatePresence>
                {showConfig && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 p-4 shadow-xl z-50 flex flex-col gap-3.5"
                  >
                    <div>
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">Temperature Unit</h4>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
                        <button
                          onClick={() => setTempUnit('C')}
                          className={`py-1 text-xs font-bold rounded-md transition-all ${
                            tempUnit === 'C' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Celsius (°C)
                        </button>
                        <button
                          onClick={() => setTempUnit('F')}
                          className={`py-1 text-xs font-bold rounded-md transition-all ${
                            tempUnit === 'F' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Fahrenheit (°F)
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">Wind Velocity Unit</h4>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
                        <button
                          onClick={() => setWindUnit('kmh')}
                          className={`py-1 text-[10px] font-bold rounded-md transition-all ${
                            windUnit === 'kmh' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          km/h
                        </button>
                        <button
                          onClick={() => setWindUnit('mph')}
                          className={`py-1 text-[10px] font-bold rounded-md transition-all ${
                            windUnit === 'mph' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          mph
                        </button>
                        <button
                          onClick={() => setWindUnit('ms')}
                          className={`py-1 text-[10px] font-bold rounded-md transition-all ${
                            windUnit === 'ms' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          m/s
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-6 mt-6 flex-grow w-full flex flex-col gap-6">
        
        {/* Compact Search Bar Area */}
        <div ref={dropdownRef} className="relative w-full max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              {isGeocoding ? (
                <LucideIcons.RefreshCw size={16} className="animate-spin text-blue-500" />
              ) : (
                <LucideIcons.Search size={16} />
              )}
            </div>
            <input
              type="text"
              placeholder="Search worldwide cities (e.g. San Francisco, Tokyo, Zurich)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-slate-800 placeholder-slate-400 pl-11 pr-24 py-3 rounded-2xl border border-slate-200 outline-none text-sm font-medium transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={isGeocoding}
              className="absolute right-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Search suggestions dropdown */}
          <AnimatePresence>
            {geocodingResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden divide-y divide-slate-100"
              >
                <div className="px-4 py-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Results</span>
                  <button onClick={() => setGeocodingResults([])} className="text-slate-400 hover:text-slate-600">
                    <LucideIcons.X size={12} />
                  </button>
                </div>
                {geocodingResults.map((item) => (
                  <button
                    key={`${item.latitude}-${item.longitude}-${item.id}`}
                    onClick={() => selectCity(item)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50/40 transition-colors flex items-center justify-between group text-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <LucideIcons.MapPin size={15} className="text-slate-400 group-hover:text-blue-500 shrink-0" />
                      <span className="font-semibold text-slate-700 group-hover:text-blue-950">
                        {item.name}
                      </span>
                      {item.admin1 && (
                        <span className="text-xs text-slate-400 font-medium">({item.admin1})</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase font-mono group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                      {item.country_code || '??'}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl w-full mx-auto p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium flex items-start gap-2.5 shadow-sm"
            >
              <LucideIcons.AlertTriangle className="shrink-0 text-rose-500" size={16} />
              <div>
                <p className="font-bold">Error Occurred</p>
                <p className="mt-0.5 opacity-90">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Skeletons vs High Density Bento Grid Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full"
            >
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-slate-100 rounded-3xl h-[260px] animate-pulse" />
                  <div className="md:col-span-1 bg-slate-100 rounded-3xl h-[260px] animate-pulse" />
                </div>
                <div className="bg-slate-100 rounded-3xl h-[330px] animate-pulse" />
              </div>
              <div className="lg:col-span-4 bg-slate-100 rounded-3xl h-[614px] animate-pulse" />
            </motion.div>
          ) : weatherData ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch"
            >
              {/* Left Column (8 cols): Currents & Intelligence + Trend Curve */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Row 1: Highlights grid (3 cols inside left column) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  {/* Current Temp panel (2 cols) */}
                  <div className="md:col-span-2">
                    <CurrentWeatherPanel
                      current={weatherData.current_weather}
                      daily={weatherData.daily}
                      city={selectedCity}
                      tempUnit={tempUnit}
                      windUnit={windUnit}
                    />
                  </div>

                  {/* Daily Intelligence panel (1 col) */}
                  <div className="md:col-span-1">
                    <IntelligencePanel
                      weathercode={weatherData.current_weather.weathercode}
                      tempC={weatherData.current_weather.temperature}
                      windspeed={weatherData.current_weather.windspeed}
                      tempUnit={tempUnit}
                    />
                  </div>
                </div>

                {/* Row 2: 7-Day Temperature Trend Chart (flex-grow) */}
                <div className="flex-grow flex flex-col">
                  <WeatherChart
                    daily={weatherData.daily}
                    tempUnit={tempUnit}
                  />
                </div>
              </div>

              {/* Right Column (4 cols): Vertical 7-day forecast & presets list */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* 7-Day Forecast section */}
                <div className="flex-grow">
                  <ForecastSection
                    daily={weatherData.daily}
                    tempUnit={tempUnit}
                  />
                </div>

                {/* Presets and History details panel */}
                <div id="metadata-details-card" className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
                  <div>
                    <h4 className="font-extrabold text-slate-400 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <LucideIcons.History size={13} />
                      Recent Explorations
                    </h4>
                    {searchHistory.length === 0 ? (
                      <div className="py-4 text-center text-slate-400 text-xs font-medium bg-slate-50/50 rounded-2xl border border-slate-100">
                        History is currently empty
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {searchHistory.map((item) => {
                          const isCurrentlySelected = item.latitude === selectedCity.latitude && item.longitude === selectedCity.longitude;
                          return (
                            <div
                              key={`${item.latitude}-${item.longitude}-${item.id}`}
                              onClick={() => setSelectedCity(item)}
                              className={`group flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                isCurrentlySelected
                                  ? 'bg-blue-50/80 border-blue-200 text-blue-700'
                                  : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <LucideIcons.MapPin size={13} className={isCurrentlySelected ? 'text-blue-500' : 'text-slate-400'} />
                                <span className="truncate">{item.name}</span>
                                {item.country_code && (
                                  <span className="text-[9px] opacity-65 font-semibold uppercase font-mono bg-slate-100 group-hover:bg-white text-slate-500 px-1 rounded">{item.country_code}</span>
                                )}
                              </div>
                              <button
                                onClick={(e) => removeHistoryItem(e, item)}
                                className="p-1 rounded-md hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              >
                                <LucideIcons.X size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="font-extrabold text-slate-400 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <LucideIcons.Compass size={13} />
                      Aether Presets
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_CITIES.map((city) => {
                        const isSelected = selectedCity.name === city.name && selectedCity.country_code === city.country_code;
                        return (
                          <button
                            key={city.name}
                            onClick={() => selectCity(city)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {city.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto">
              <LucideIcons.CloudSun size={48} className="mx-auto text-blue-400 mb-4" />
              <h3 className="font-bold text-slate-800 text-lg">No Weather Data Loaded</h3>
              <p className="text-xs text-slate-400 max-w-[280px] mx-auto mt-1">Please select or search a city from the panel above to begin forecasting.</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern footer */}
      <footer className="max-w-7xl mx-auto px-6 text-center mt-12 text-[10px] text-slate-400 font-semibold tracking-wide">
        Powered by Public <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Open-Meteo API</a> • Handcrafted with React, Tailwind CSS, & smooth SVG graph elements.
      </footer>
    </div>
  );
}
