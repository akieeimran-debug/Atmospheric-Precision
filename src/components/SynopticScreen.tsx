import React, { useState } from 'react';
import { WeatherStation, TemperatureUnit } from '../types/weather';
import { formatTemp } from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';
import { ArrowLeft, Compass, Droplets, Sun, Layers } from 'lucide-react';

interface SynopticScreenProps {
  station: WeatherStation;
  tempUnit: TemperatureUnit;
  onBack: () => void;
}

export const SynopticScreen: React.FC<SynopticScreenProps> = ({
  station,
  tempUnit,
  onBack,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const activeDay = station.daily[selectedDayIndex] || station.daily[0];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
      {/* Top Header */}
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] text-xs font-medium text-slate-800 dark:text-[#DAE2FD] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Cockpit</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-base text-slate-900 dark:text-[#F8FAFC]">
              Synoptic 7-Day Atmospheric Modeling
            </span>
            <span className="text-xs font-mono text-[#0284C7] dark:text-[#00F2FE] bg-[#0284C7]/10 dark:bg-[#00F2FE]/10 px-2 py-0.5 rounded-full border border-[#0284C7]/20 dark:border-[#00F2FE]/30">
              {station.name.toUpperCase()} / {station.callsign}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
          <Layers className="w-4 h-4 text-[#0284C7] dark:text-[#00F2FE]" />
          <span>Resolution: 9km ECMWF / GFS High-Res Grid</span>
        </div>
      </div>

      {/* Synoptic Overview Grid: Left Day Selector + Right Deep Physics Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 cols: Daily Schedule Selector */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94A3B8] px-1">
            Synoptic Daily Predictions
          </span>

          {station.daily.map((day, idx) => {
            const isSelected = idx === selectedDayIndex;

            return (
              <div
                key={day.date}
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 select-none ${
                  isSelected
                    ? 'bg-[#0284C7]/15 dark:bg-[#1E293B] border border-[#0284C7] dark:border-[#00F2FE] shadow-sm dark:shadow-[0_0_24px_rgba(0,242,254,0.2)]'
                    : 'glass-card hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <WeatherIcon condition={day.condition} size={28} />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-sm text-slate-900 dark:text-[#F8FAFC]">
                        {day.dayName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 dark:text-[#475569]">
                        {day.date}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600 dark:text-[#94A3B8] truncate max-w-[180px]">
                      {day.conditionLabel}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end font-mono">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">{formatTemp(day.tempMaxC, tempUnit)}</span>
                    <span className="text-slate-400 dark:text-[#64748B]">/</span>
                    <span className="text-slate-500 dark:text-[#94A3B8]">{formatTemp(day.tempMinC, tempUnit)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#0284C7] dark:text-[#38BDF8]">
                    <Droplets className="w-3 h-3" />
                    <span>{day.precipProb}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 7 cols: Deep Meteorological Physics breakdown for the selected day */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5">
            {/* Day Title & Atmosphere Condition */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.06]">
              <div className="flex flex-col">
                <span className="text-xs font-mono uppercase tracking-wider text-[#0284C7] dark:text-[#00F2FE] font-semibold">
                  Detailed Atmospheric Profile
                </span>
                <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] mt-1">
                  {activeDay.dayName} · {activeDay.conditionLabel}
                </h3>
                <span className="text-xs font-mono text-slate-500 dark:text-[#94A3B8] mt-0.5">
                  Valid Synoptic Window: {activeDay.date} 00:00Z – 23:59Z
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 shrink-0">
                <WeatherIcon condition={activeDay.condition} size={40} />
              </div>
            </div>

            {/* Synopsis prose */}
            <div className="p-4 rounded-xl bg-slate-100/90 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-white/[0.04] text-xs sm:text-sm text-slate-800 dark:text-[#DAE2FD] leading-relaxed">
              <span className="font-semibold text-[#0284C7] dark:text-[#00F2FE] block mb-1">
                Meteorological Synopsis:
              </span>
              {activeDay.summary}
            </div>

            {/* Core Thermodynamic & Dynamic Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-slate-100/90 dark:bg-[#131B2E] border border-slate-200 dark:border-white/[0.04] p-3 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] uppercase text-slate-500 dark:text-[#64748B]">Diurnal Range</span>
                <span className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  {formatTemp(activeDay.tempMinC, tempUnit)} – {formatTemp(activeDay.tempMaxC, tempUnit)}
                </span>
                <span className="text-[10px] text-[#0284C7] dark:text-[#00F2FE]">
                  Δ {Math.round(activeDay.tempMaxC - activeDay.tempMinC)}°
                </span>
              </div>

              <div className="bg-slate-100/90 dark:bg-[#131B2E] border border-slate-200 dark:border-white/[0.04] p-3 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] uppercase text-slate-500 dark:text-[#64748B]">Precipitation</span>
                <span className="text-base font-semibold text-[#0284C7] dark:text-[#38BDF8]">
                  {activeDay.precipProb}%
                </span>
                <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">
                  {activeDay.precipVolumeMm} mm total
                </span>
              </div>

              <div className="bg-slate-100/90 dark:bg-[#131B2E] border border-slate-200 dark:border-white/[0.04] p-3 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] uppercase text-slate-500 dark:text-[#64748B]">Wind Maximum</span>
                <span className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  {activeDay.windSpeedMaxKmh} km/h
                </span>
                <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">
                  Vector {activeDay.windDirectionDeg}°
                </span>
              </div>

              <div className="bg-slate-100/90 dark:bg-[#131B2E] border border-slate-200 dark:border-white/[0.04] p-3 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] uppercase text-slate-500 dark:text-[#64748B]">Solar Radiation</span>
                <span className="text-base font-semibold text-[#EA580C] dark:text-[#FB923C]">
                  UV {activeDay.uvMax}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">
                  Clearance {activeDay.sunrise}
                </span>
              </div>
            </div>

            {/* Air Mass & Frontal Classification */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] flex flex-col gap-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94A3B8]">
                Airmass Classification & Stability
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-[#0B1326] border border-slate-200 dark:border-white/[0.04] flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-[#0284C7] dark:text-[#00F2FE] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-[#F8FAFC]">Barometric Tendency</div>
                    <div className="text-[11px] text-slate-600 dark:text-[#94A3B8] mt-0.5">
                      Mean SLP {activeDay.pressureHpa} hPa with boundary layer inversion.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-[#0B1326] border border-slate-200 dark:border-white/[0.04] flex items-start gap-2.5">
                  <Sun className="w-4 h-4 text-[#EA580C] dark:text-[#FB923C] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-[#F8FAFC]">Photoperiod & Irradiance</div>
                    <div className="text-[11px] text-slate-600 dark:text-[#94A3B8] mt-0.5">
                      Sunrise at {activeDay.sunrise}, Sunset at {activeDay.sunset}.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
