import React, { useState } from 'react';
import { DailyForecast, TemperatureUnit } from '../types/weather';
import { formatTemp } from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';
import { Droplets, ChevronDown, ChevronUp } from 'lucide-react';

interface DailyForecastTableProps {
  daily: DailyForecast[];
  tempUnit: TemperatureUnit;
}

export const DailyForecastTable: React.FC<DailyForecastTableProps> = ({
  daily,
  tempUnit,
}) => {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Find min and max temp across the 7 days for proper gradient bar scale
  const allMins = daily.map(d => d.tempMinC);
  const allMaxs = daily.map(d => d.tempMaxC);
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const range = globalMax - globalMin === 0 ? 1 : globalMax - globalMin;

  const toggleExpand = (date: string) => {
    setExpandedDay(prev => prev === date ? null : date);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94A3B8]">
            Synoptic 7-Day Precision Outlook
          </span>
          <span className="text-xs text-slate-400 dark:text-[#475569]">· Numerical Prediction</span>
        </div>
        <span className="text-[11px] font-mono text-[#0284C7] dark:text-[#00F2FE]">
          ECMWF / GFS Blended
        </span>
      </div>

      <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/[0.04]">
        {daily.map((day) => {
          const isExpanded = expandedDay === day.date;
          const leftPct = ((day.tempMinC - globalMin) / range) * 100;
          const widthPct = Math.max(12, ((day.tempMaxC - day.tempMinC) / range) * 100);

          return (
            <div key={day.date} className="flex flex-col transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.01]">
              <div
                onClick={() => toggleExpand(day.date)}
                className="py-3 px-2 flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                {/* Day name & date */}
                <div className="w-24 shrink-0 flex flex-col">
                  <span className="font-display font-semibold text-sm text-slate-900 dark:text-[#F8FAFC]">
                    {day.dayName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-[#475569]">
                    {day.date.slice(5)}
                  </span>
                </div>

                {/* Weather icon & condition title */}
                <div className="flex items-center gap-2.5 w-36 shrink-0">
                  <WeatherIcon condition={day.condition} size={20} />
                  <span className="text-xs text-slate-700 dark:text-[#DAE2FD] truncate font-medium">
                    {day.conditionLabel}
                  </span>
                </div>

                {/* Precipitation chance */}
                <div className="w-16 shrink-0 flex items-center gap-1.5 text-xs font-mono text-[#0284C7] dark:text-[#38BDF8]">
                  <Droplets className="w-3.5 h-3.5 shrink-0" />
                  <span>{day.precipProb}%</span>
                </div>

                {/* Temperature Range Bar */}
                <div className="hidden sm:flex items-center gap-3 flex-1 px-4">
                  <span className="text-xs font-mono text-slate-500 dark:text-[#94A3B8] w-8 text-right">
                    {formatTemp(day.tempMinC, tempUnit)}
                  </span>
                  
                  <div className="relative flex-1 h-1.5 bg-slate-200 dark:bg-[#0F172A] rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#0EA5E9] via-[#0284C7] to-[#EA580C] dark:from-[#38BDF8] dark:via-[#00F2FE] dark:to-[#FB923C]"
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-mono font-semibold text-slate-900 dark:text-[#F8FAFC] w-8">
                    {formatTemp(day.tempMaxC, tempUnit)}
                  </span>
                </div>

                {/* Mobile temperature readout */}
                <div className="flex sm:hidden items-center gap-2 text-xs font-mono">
                  <span className="text-slate-500 dark:text-[#94A3B8]">{formatTemp(day.tempMinC, tempUnit)}</span>
                  <span className="text-slate-300 dark:text-[#475569]">/</span>
                  <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{formatTemp(day.tempMaxC, tempUnit)}</span>
                </div>

                {/* Expand Chevron */}
                <button className="text-slate-400 dark:text-[#475569] hover:text-[#0284C7] dark:hover:text-[#00F2FE] transition-colors p-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="py-3 px-4 bg-slate-100/90 dark:bg-[#0B1326]/60 rounded-xl mb-2 flex flex-col gap-2.5 text-xs text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-white/[0.04]">
                  <p className="leading-relaxed text-slate-800 dark:text-[#DAE2FD]">
                    {day.summary}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/80 dark:border-white/[0.04] font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 dark:text-[#475569] block">Precip Volume</span>
                      <span className="text-slate-900 dark:text-[#F8FAFC] font-semibold">{day.precipVolumeMm} mm</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-[#475569] block">Max Wind</span>
                      <span className="text-slate-900 dark:text-[#F8FAFC] font-semibold">{day.windSpeedMaxKmh} km/h</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-[#475569] block">Peak Solar UV</span>
                      <span className="text-[#0284C7] dark:text-[#00F2FE] font-semibold">UV {day.uvMax}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-[#475569] block">Sun Window</span>
                      <span className="text-slate-900 dark:text-[#F8FAFC] font-semibold">{day.sunrise} - {day.sunset}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
