import React, { useRef } from 'react';
import { HourlyForecast, TemperatureUnit } from '../types/weather';
import { formatTemp } from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';
import { ChevronLeft, ChevronRight, Droplets } from 'lucide-react';

interface HourlyTimelineProps {
  hourly: HourlyForecast[];
  tempUnit: TemperatureUnit;
  selectedHourIndex: number;
  onSelectHour: (index: number) => void;
}

export const HourlyTimeline: React.FC<HourlyTimelineProps> = ({
  hourly,
  tempUnit,
  selectedHourIndex,
  onSelectHour,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94A3B8]">
            Hourly Atmospheric Trajectory
          </span>
          <span className="text-xs text-slate-400 dark:text-[#475569]">· 24-Hour Continuous Projection</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="w-7 h-7 rounded-full bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white transition-all shadow-xs"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-7 h-7 rounded-full bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white transition-all shadow-xs"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Flex-Rail of Glass Capsules */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scroll-smooth no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {hourly.map((item, idx) => {
          const isSelected = idx === selectedHourIndex;
          const isNow = idx === 0;

          return (
            <div
              key={idx}
              onClick={() => onSelectHour(idx)}
              style={{ scrollSnapAlign: 'start' }}
              className={`shrink-0 w-[96px] py-4 px-2.5 rounded-2xl flex flex-col items-center justify-between gap-3 cursor-pointer transition-all duration-200 select-none ${
                isSelected
                  ? 'bg-[#0284C7]/15 dark:bg-[#1E293B]/90 border border-[#0284C7] dark:border-[#00F2FE] shadow-sm dark:shadow-[0_0_20px_rgba(0,242,254,0.22)] scale-[1.02]'
                  : isNow
                  ? 'bg-white dark:bg-[#131B2E]/80 border border-[#0284C7]/50 dark:border-[#00F2FE]/50 hover:border-[#0284C7] dark:hover:border-[#00F2FE]'
                  : 'glass-card hover:bg-white dark:hover:bg-[#1E293B]/50 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              {/* Hour Label */}
              <div className="flex flex-col items-center">
                <span className={`text-[11px] font-mono font-medium ${isNow ? 'text-[#0284C7] dark:text-[#00F2FE] font-bold' : 'text-slate-500 dark:text-[#94A3B8]'}`}>
                  {isNow ? 'NOW' : item.time}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-[#475569]">
                  {item.conditionLabel.split(' ')[0]}
                </span>
              </div>

              {/* Monoline Weather Glyph */}
              <div className="my-0.5">
                <WeatherIcon condition={item.condition} size={26} />
              </div>

              {/* Precipitation Probability */}
              <div className="flex items-center gap-1 text-[11px] font-mono font-medium text-[#0284C7] dark:text-[#38BDF8]">
                <Droplets className="w-3 h-3" />
                <span>{item.precipProb}%</span>
              </div>

              {/* Temperature in Space Grotesk */}
              <span className="font-display font-semibold text-lg text-slate-900 dark:text-[#F8FAFC]">
                {formatTemp(item.tempC, tempUnit)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
