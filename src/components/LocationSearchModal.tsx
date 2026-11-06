import React, { useState, useEffect, useRef } from 'react';
import { WeatherStation, TemperatureUnit } from '../types/weather';
import { formatTemp } from '../utils/weatherUtils';
import { 
  searchGlobalLocations, 
  fetchLiveWeatherStation, 
  GeocodingResult, 
  CURATED_WORLD_CITIES 
} from '../services/weatherService';
import { WeatherIcon } from './WeatherIcon';
import { 
  Search, 
  X, 
  MapPin, 
  Compass, 
  Loader2, 
  Globe2, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: WeatherStation[];
  onSelectStation: (station: WeatherStation) => void;
  onAddStation: (station: WeatherStation) => void;
  tempUnit: TemperatureUnit;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  stations,
  onSelectStation,
  onAddStation,
  tempUnit,
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [fetchingCityName, setFetchingCityName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSearchResults([]);
      setErrorMsg(null);
      setIsFetchingWeather(false);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search for global cities and countries
  const handleQueryChange = (val: string) => {
    setQuery(val);
    setErrorMsg(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length < 2) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = window.setTimeout(async () => {
      try {
        const results = await searchGlobalLocations(val);
        setSearchResults(results);
      } catch {
        setErrorMsg('Unable to reach geocoding index. Please verify your connection.');
      } finally {
        setIsLoading(false);
      }
    }, 280);
  };

  // Fetch real-time weather and select location
  const handleSelectLocation = async (loc: GeocodingResult) => {
    setIsFetchingWeather(true);
    setFetchingCityName(`${loc.name}, ${loc.country}`);
    setErrorMsg(null);

    try {
      const liveStation = await fetchLiveWeatherStation(loc);
      onAddStation(liveStation);
      onSelectStation(liveStation);
      onClose();
    } catch (err) {
      console.error('Failed to load live weather:', err);
      setErrorMsg(`Could not load real-time telemetry for ${loc.name}. Please try again.`);
    } finally {
      setIsFetchingWeather(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl glass-modal rounded-3xl p-6 flex flex-col gap-5 border border-slate-200 dark:border-white/[0.15] shadow-2xl relative max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header & Close Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0284C7]/10 dark:bg-[#00F2FE]/10 border border-[#0284C7]/30 dark:border-[#00F2FE]/30 flex items-center justify-center text-[#0284C7] dark:text-[#00F2FE]">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] font-semibold">
                Global Meteorological Observatory Dispatch
              </span>
              <div className="text-sm font-display font-bold text-slate-900 dark:text-white">
                Worldwide Real-Time Weather Forecasting
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Loading Overlay during API fetch */}
        {isFetchingWeather && (
          <div className="absolute inset-0 bg-white/85 dark:bg-[#080C14]/90 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-3 p-6 text-center animate-fade-in">
            <Loader2 className="w-8 h-8 text-[#0284C7] dark:text-[#00F2FE] animate-spin" />
            <div className="text-sm font-display font-semibold text-slate-900 dark:text-white">
              Connecting to WMO Weather Station...
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-[#94A3B8] max-w-sm">
              Retrieving live atmospheric sensors, ECMWF/GFS numerical forecast, and Doppler telemetry for <span className="text-[#0284C7] dark:text-[#00F2FE] font-bold">{fetchingCityName}</span>.
            </p>
          </div>
        )}

        {/* Input Field matching Design System Spec */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0284C7] dark:text-[#00F2FE]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Type any country, city, state, or province (e.g. Paris, Austin, Tokyo, Bavaria, Cairo)..."
            className="w-full bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-white/20 focus:border-[#0284C7] dark:focus:border-[#00F2FE] focus:ring-4 focus:ring-[#0284C7]/15 dark:focus:ring-[#00F2FE]/20 text-sm text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#475569] rounded-full pl-11 pr-10 py-3.5 outline-none transition-all shadow-inner font-sans"
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0284C7] dark:text-[#00F2FE] animate-spin" />
          )}
          {!isLoading && query && (
            <button
              onClick={() => handleQueryChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-200 font-mono">
            {errorMsg}
          </div>
        )}

        {/* Results Container */}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
          {/* 1. Live Geocoding Search Results */}
          {query.trim().length >= 2 && searchResults.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] px-2 font-semibold flex items-center justify-between">
                <span>Matching Global Locations ({searchResults.length})</span>
                <span className="text-[#0284C7] dark:text-[#00F2FE]">Live Synoptic Available</span>
              </span>

              {searchResults.map((loc) => {
                const subTitle = [loc.admin1, loc.country].filter(Boolean).join(', ');

                return (
                  <div
                    key={`${loc.id}-${loc.latitude}-${loc.longitude}`}
                    onClick={() => handleSelectLocation(loc)}
                    className="group cursor-pointer p-3.5 rounded-2xl bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.06] hover:border-[#0284C7]/40 dark:hover:border-[#00F2FE]/40 flex items-center justify-between transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0284C7]/10 dark:bg-[#00F2FE]/10 border border-[#0284C7]/20 dark:border-[#00F2FE]/20 flex items-center justify-center text-[#0284C7] dark:text-[#00F2FE] group-hover:scale-105 transition-transform">
                        <MapPin className="w-4 h-4" />
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold text-sm text-slate-900 dark:text-[#F8FAFC]">
                            {loc.name}
                          </span>
                          {loc.country_code && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                              {loc.country_code}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                          {subTitle} · Lat {loc.latitude.toFixed(2)}°, Lon {loc.longitude.toFixed(2)}°
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-[#0284C7] dark:text-[#00F2FE] font-medium group-hover:translate-x-1 transition-transform">
                      <span>Fetch Live</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No results message */}
          {query.trim().length >= 2 && !isLoading && searchResults.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-[#94A3B8] font-mono">
              No matching world cities or countries found for "{query}". Try typing a different spelling or major regional center.
            </div>
          )}

          {/* 2. Currently Monitored Stations in App */}
          {query.trim().length < 2 && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] px-2 font-semibold">
                Active Observatory Stations ({stations.length})
              </span>

              {stations.map((st) => (
                <div
                  key={st.id}
                  onClick={() => {
                    onSelectStation(st);
                    onClose();
                  }}
                  className="group cursor-pointer p-3 rounded-2xl bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.06] hover:border-[#0284C7]/40 dark:hover:border-[#00F2FE]/40 flex items-center justify-between transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#080C14] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-[#00F2FE]">
                      <WeatherIcon condition={st.current.condition} size={20} />
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-medium text-sm text-slate-900 dark:text-[#F8FAFC]">
                          {st.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#0284C7] dark:text-[#00F2FE] bg-[#0284C7]/10 dark:bg-[#00F2FE]/10 px-2 py-0.5 rounded border border-[#0284C7]/20 dark:border-[#00F2FE]/20">
                          {st.callsign}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                        {st.region}, {st.country} · {st.coordinates.elevationM}m MSL
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end font-mono">
                    <span className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                      {formatTemp(st.current.tempC, tempUnit)}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">
                      {st.current.conditionLabel.split(' ')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Curated World Hubs across All Continents */}
          {query.trim().length < 2 && (
            <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-200 dark:border-white/[0.06]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] px-2 font-semibold flex items-center justify-between">
                <span>World Continents & Major Capitals (1-Click Real-Time Sync)</span>
                <Sparkles className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#00F2FE]" />
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CURATED_WORLD_CITIES.slice(0, 12).map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelectLocation(city)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-white dark:bg-white/[0.02] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.06] hover:border-[#0284C7] dark:hover:border-[#00F2FE] text-left transition-all flex flex-col group"
                  >
                    <span className="font-display font-medium text-xs text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#0284C7] dark:group-hover:text-[#00F2FE]">
                      {city.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] truncate">
                      {city.country}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Hotkeys */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-[#475569]">
          <span>Open-Meteo ECMWF/GFS High-Resolution Grid</span>
          <span>[ESC] to dismiss</span>
        </div>
      </div>
    </div>
  );
};
