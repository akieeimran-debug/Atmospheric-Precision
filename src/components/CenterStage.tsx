import React from 'react';
import { WeatherStation, TemperatureUnit, SpeedUnit, PressureUnit } from '../types/weather';
import { formatTemp, getWindDirectionCardinal } from '../utils/weatherUtils';
import { WeatherIcon } from './WeatherIcon';
import { HourlyTimeline } from './HourlyTimeline';
import { TemporalChart } from './TemporalChart';
import { DailyForecastTable } from './DailyForecastTable';
import { AlertTriangle, Compass, Wind, Eye, CloudRain, Clock, MapPin } from 'lucide-react';

interface CenterStageProps {
  station: WeatherStation;
  tempUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
  pressureUnit: PressureUnit;
  selectedHourIndex: number;
  onSelectHour: (index: number) => void;
  onOpenRadar: () => void;
}

export const CenterStage: React.FC<CenterStageProps> = ({
  station,
  tempUnit,
  speedUnit,
  pressureUnit,
  selectedHourIndex,
  onSelectHour,
  onOpenRadar,
}) => {
  const current = station.current;
  const alert = station.alert;

  return (
    <main className="flex-1 flex flex-col gap-6 min-w-0">
      {/* Alert Callout (if active) */}
      {alert && (
        <div className="relative rounded-2xl p-4 bg-amber-500/10 dark:bg-[#201511]/90 border border-amber-500/40 shadow-sm flex items-start gap-3.5 transition-all">
          <div className="p-2 rounded-full bg-amber-500/20 text-amber-600 dark:text-[#FB923C] shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-[#FB923C] animate-pulse-dot shrink-0" />
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-700 dark:text-[#FB923C]">
                {alert.title}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8] hidden sm:inline">
                · {alert.agency} ({alert.effective})
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-[#E2E8F0] leading-relaxed">
              {alert.description}
            </p>
            <div className="text-[11px] text-amber-700 dark:text-[#FB923C]/90 font-medium mt-1">
              {alert.instruction}
            </div>
          </div>
        </div>
      )}

      {/* Hero Atmosphere Condition Panel */}
      <div className="relative glass-panel rounded-2xl p-6 sm:p-8 overflow-hidden">
        {/* Dynamic ambient atmospheric gradient glow */}
        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-20 dark:opacity-25"
          style={{
            background: station.current.condition === 'aurora' 
              ? 'radial-gradient(circle, #0284C7 0%, #10B981 50%, transparent 70%)'
              : station.current.condition.includes('rain')
              ? 'radial-gradient(circle, #0284C7 0%, #38BDF8 50%, transparent 70%)'
              : station.current.condition.includes('snow')
              ? 'radial-gradient(circle, #7DD3FC 0%, #38BDF8 50%, transparent 70%)'
              : 'radial-gradient(circle, #FB923C 0%, #0284C7 50%, transparent 70%)'
          }}
        />

        {/* Top telemetry station line */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-200/80 dark:border-white/[0.06] relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#0284C7] dark:text-[#00F2FE] bg-[#0284C7]/10 dark:bg-[#00F2FE]/10 px-2.5 py-1 rounded-full border border-[#0284C7]/20 dark:border-[#00F2FE]/30">
              <MapPin className="w-3.5 h-3.5" />
              <span>{station.name.toUpperCase()} / {station.callsign}</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8] hidden sm:inline font-mono">
              {station.coordinates.lat.toFixed(4)}° N, {Math.abs(station.coordinates.lon).toFixed(4)}° {station.coordinates.lon >= 0 ? 'E' : 'W'} · Elev {station.coordinates.elevationM}m
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {station.timezone.split('/')[1]?.replace(/_/g, ' ') || 'Local'}</span>
            </div>
            <button
              onClick={onOpenRadar}
              className="text-xs text-[#0284C7] dark:text-[#00F2FE] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Radar Sweep</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Hero Temperature & Condition Display */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-8 relative z-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <WeatherIcon condition={current.condition} size={36} />
              <span className="text-base sm:text-lg font-medium text-slate-900 dark:text-[#DAE2FD]">
                {current.conditionLabel}
              </span>
            </div>

            {/* Display Hero: 96px in Space Grotesk */}
            <div className="flex items-baseline gap-2 my-2">
              <span className="font-display text-6xl sm:text-8xl md:text-[96px] font-light tracking-tighter text-slate-900 dark:text-[#F8FAFC] leading-none select-none">
                {formatTemp(current.tempC, tempUnit)}
              </span>
              <div className="flex flex-col text-xs font-mono text-slate-500 dark:text-[#94A3B8] pl-2 gap-0.5">
                <span>Feels {formatTemp(current.feelsLikeC, tempUnit)}</span>
                <span className="text-[#0284C7] dark:text-[#38BDF8]">Dew {formatTemp(current.dewPointC, tempUnit)}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] max-w-xl leading-relaxed mt-1">
              {current.description}
            </p>
          </div>

          {/* Quick Metrics Bar on the Right */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0 font-mono text-xs">
            <div className="bg-slate-100/90 dark:bg-[#131B2E]/70 border border-slate-200 dark:border-white/[0.06] p-3 rounded-xl flex flex-col gap-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 dark:text-[#64748B]">
                <Wind className="w-3 h-3 text-[#0284C7] dark:text-[#38BDF8]" />
                <span>Surface Wind</span>
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {Math.round(current.windSpeedKmh)} km/h
              </div>
              <div className="text-[10px] text-slate-500 dark:text-[#94A3B8]">
                {getWindDirectionCardinal(current.windDirectionDeg)} · Gusts {Math.round(current.windGustKmh)}
              </div>
            </div>

            <div className="bg-slate-100/90 dark:bg-[#131B2E]/70 border border-slate-200 dark:border-white/[0.06] p-3 rounded-xl flex flex-col gap-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 dark:text-[#64748B]">
                <Compass className="w-3 h-3 text-[#0284C7] dark:text-[#00F2FE]" />
                <span>Barometer</span>
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {Math.round(current.pressureHpa)} hPa
              </div>
              <div className="text-[10px] text-[#0284C7] dark:text-[#00F2FE]">
                {current.pressureTrend === 'rising' ? 'Rising +1.2' : current.pressureTrend === 'falling' ? 'Falling -2.1' : 'Steady 0.0'}
              </div>
            </div>

            <div className="bg-slate-100/90 dark:bg-[#131B2E]/70 border border-slate-200 dark:border-white/[0.06] p-3 rounded-xl flex flex-col gap-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 dark:text-[#64748B]">
                <CloudRain className="w-3 h-3 text-[#0284C7] dark:text-[#38BDF8]" />
                <span>Precipitation</span>
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {current.precipProb}% Prob
              </div>
              <div className="text-[10px] text-slate-500 dark:text-[#94A3B8]">
                {current.precipAccum24hMm} mm / 24h
              </div>
            </div>

            <div className="bg-slate-100/90 dark:bg-[#131B2E]/70 border border-slate-200 dark:border-white/[0.06] p-3 rounded-xl flex flex-col gap-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 dark:text-[#64748B]">
                <Eye className="w-3 h-3 text-[#10B981]" />
                <span>Visibility</span>
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {current.visibilityKm} km
              </div>
              <div className="text-[10px] text-[#10B981]">
                Ceiling {current.cloudBaseM}m
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Timeline Strip Capsules */}
      <HourlyTimeline
        hourly={station.hourly}
        tempUnit={tempUnit}
        selectedHourIndex={selectedHourIndex}
        onSelectHour={onSelectHour}
      />

      {/* Temporal Meteorological Interactive Chart */}
      <TemporalChart
        hourly={station.hourly}
        tempUnit={tempUnit}
        speedUnit={speedUnit}
        pressureUnit={pressureUnit}
      />

      {/* Synoptic 7-Day Precision Forecast Table */}
      <DailyForecastTable
        daily={station.daily}
        tempUnit={tempUnit}
      />
    </main>
  );
};
