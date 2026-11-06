import React, { useState } from 'react';
import { WeatherStation, TemperatureUnit } from '../types/weather';
import { formatTemp } from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';
import { Radio, Plus, Bookmark, SlidersHorizontal, AlertTriangle, Wind, Zap } from 'lucide-react';

interface LeftRailProps {
  stations: WeatherStation[];
  selectedStation: WeatherStation;
  onSelectStation: (station: WeatherStation) => void;
  tempUnit: TemperatureUnit;
  onOpenSearch: () => void;
}

export const LeftRail: React.FC<LeftRailProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  tempUnit,
  onOpenSearch,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['reykjavik', 'san-francisco']);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredStations = stations.filter(s => 
    s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.callsign.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.country.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.region.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-5">
      {/* Search & Station Selector Header */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#0284C7] dark:text-[#00F2FE]" />
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94A3B8]">
              Weather Stations
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#0284C7] dark:text-[#00F2FE] bg-[#0284C7]/10 dark:bg-[#00F2FE]/10 px-2 py-0.5 rounded-full border border-[#0284C7]/20 dark:border-[#00F2FE]/20">
            {stations.length} Active
          </span>
        </div>

        {/* Input field (Recessed pill container) */}
        <div className="relative">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter active station..."
            className="w-full bg-slate-100/90 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-white/[0.08] focus:border-[#0284C7] dark:focus:border-[#00F2FE] focus:ring-2 focus:ring-[#0284C7]/15 dark:focus:ring-[#00F2FE]/20 text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#475569] rounded-full px-3.5 py-2 transition-all outline-none"
          />
        </div>
      </div>

      {/* Station List Cards */}
      <div className="flex flex-col gap-2.5">
        <div className="text-[11px] uppercase tracking-wider font-medium text-slate-500 dark:text-[#475569] px-2 flex items-center justify-between">
          <span>Active Stations</span>
          <span>Surface Temp</span>
        </div>

        <div className="flex flex-col gap-2">
          {filteredStations.map((station) => {
            const isSelected = station.id === selectedStation.id;
            const isFav = favorites.includes(station.id);
            const hasAlert = !!station.alert;

            return (
              <div
                key={station.id}
                onClick={() => onSelectStation(station)}
                className={`group cursor-pointer rounded-2xl p-3.5 transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#0284C7]/10 dark:bg-[#1E293B]/70 border border-[#0284C7] dark:border-[#00F2FE] shadow-sm dark:shadow-[0_0_20px_rgba(0,242,254,0.18)]'
                    : 'glass-card hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                {/* Active indicator bar */}
                {isSelected && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#0284C7] dark:bg-[#00F2FE]" />
                )}

                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-medium text-sm text-slate-900 dark:text-[#F8FAFC]">
                        {station.name}
                      </span>
                      {hasAlert && (
                        <span title={station.alert?.title}>
                          <AlertTriangle className="w-3.5 h-3.5 text-[#EA580C] dark:text-[#FB923C]" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">
                      <span>{station.callsign}</span>
                      <span>·</span>
                      <span>{station.country}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                      <WeatherIcon condition={station.current.condition} size={18} />
                      <span className="font-display text-lg font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        {formatTemp(station.current.tempC, tempUnit)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-[#475569]">
                      <span className="font-mono">{station.current.humidity}% RH</span>
                      <button
                        onClick={(e) => toggleFavorite(station.id, e)}
                        className={`transition-colors ${
                          isFav ? 'text-[#0284C7] dark:text-[#00F2FE]' : 'text-slate-400 dark:text-[#475569] group-hover:text-slate-600 dark:group-hover:text-[#94A3B8]'
                        }`}
                      >
                        <Bookmark className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-barometric and wind indicators */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-[#94A3B8]">
                  <div className="flex items-center gap-1.5">
                    <Wind className="w-3 h-3 text-[#0284C7] dark:text-[#38BDF8]" />
                    <span>{Math.round(station.current.windSpeedKmh)} km/h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#0284C7] dark:text-[#38BDF8]">
                      {station.current.pressureTrend === 'rising' ? '▲' : station.current.pressureTrend === 'falling' ? '▼' : '■'}
                    </span>
                    <span>{Math.round(station.current.pressureHpa)} hPa</span>
                  </div>
                  <div>
                    {station.current.auroraKp ? (
                      <span className="text-[#0284C7] dark:text-[#00F2FE]">Kp {station.current.auroraKp}</span>
                    ) : (
                      <span>UV {station.current.uvIndex}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add custom station action */}
        <button
          onClick={onOpenSearch}
          className="mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-white/[0.12] hover:border-[#0284C7] dark:hover:border-[#00F2FE]/50 text-xs font-medium text-slate-600 dark:text-[#94A3B8] hover:text-[#0284C7] dark:hover:text-[#00F2FE] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Search & Add Global Observatory</span>
        </button>
      </div>

      {/* Atmospheric State Calibration Widget */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#00F2FE]" />
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94A3B8]">
              Atmospheric Calibration
            </span>
          </div>
          <Zap className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
        </div>

        <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
          Real-time weather station sampling across global WMO synoptic networks & Open-Meteo satellite feeds.
        </p>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="bg-slate-100/90 dark:bg-[#131B2E] border border-slate-200 dark:border-white/[0.04] p-2 rounded-lg">
            <div className="text-slate-500 dark:text-[#475569] text-[10px] uppercase">Telemetry State</div>
            <div className="text-slate-900 dark:text-[#F8FAFC] font-semibold mt-0.5">Live Synoptic</div>
          </div>
          <div className="bg-slate-100/90 dark:bg-[#131B2E] border border-slate-200 dark:border-white/[0.04] p-2 rounded-lg">
            <div className="text-slate-500 dark:text-[#475569] text-[10px] uppercase">Lapse Precision</div>
            <div className="text-[#0284C7] dark:text-[#00F2FE] font-semibold mt-0.5">0.02 °C/100m</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
