import React, { useEffect, useRef } from 'react';
import { WeatherStation, TemperatureUnit, PressureUnit, SpeedUnit } from '../types/weather';
import { 
  formatPressure, 
  formatSpeed, 
  getWindDirectionCardinal, 
  getBeaufortScale, 
  getAqiCategory, 
  getUvCategory 
} from '../utils/weatherUtils';
import { 
  Radio, 
  Sun, 
  Moon, 
  Gauge, 
  Wind, 
  Maximize2, 
  Plane, 
  ShieldCheck
} from 'lucide-react';

interface RightRailProps {
  station: WeatherStation;
  tempUnit: TemperatureUnit;
  pressureUnit: PressureUnit;
  speedUnit: SpeedUnit;
  onOpenRadar: () => void;
}

export const RightRail: React.FC<RightRailProps> = ({
  station,
  pressureUnit,
  speedUnit,
  onOpenRadar,
}) => {
  const current = station.current;
  const aqiInfo = getAqiCategory(current.airQuality.aqi);
  const uvInfo = getUvCategory(current.uvIndex);
  const beaufort = getBeaufortScale(current.windSpeedKmh);

  // Mini Radar Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(cx, cy) - 10;

      ctx.clearRect(0, 0, w, h);

      // Radar base circle
      ctx.fillStyle = '#060E20';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Range rings
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.25)';
      ctx.lineWidth = 1;
      [0.33, 0.66, 1.0].forEach(factor => {
        ctx.beginPath();
        ctx.arc(cx, cy, r * factor, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();

      // Synthetic precipitation echo blobs
      const echoBlobs = [
        { x: cx + 25, y: cy - 20, rad: 14, color: 'rgba(56, 189, 248, 0.4)' },
        { x: cx - 35, y: cy + 15, rad: 20, color: 'rgba(2, 132, 199, 0.35)' },
        { x: cx + 15, y: cy + 30, rad: 10, color: 'rgba(16, 185, 129, 0.3)' },
      ];

      echoBlobs.forEach(b => {
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.rad);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.rad, 0, Math.PI * 2);
        ctx.fill();
      });

      // Rotating Radar Sweep beam
      angle = (angle + 0.03) % (Math.PI * 2);
      const sweepGradient = ctx.createConicGradient(angle - 0.5, cx, cy);
      sweepGradient.addColorStop(0, 'rgba(2, 132, 199, 0.4)');
      sweepGradient.addColorStop(0.15, 'rgba(2, 132, 199, 0.05)');
      sweepGradient.addColorStop(0.2, 'transparent');
      sweepGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Sweep line
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      ctx.stroke();

      // Center blip
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <aside className="w-full lg:w-[340px] shrink-0 flex flex-col gap-4">
      {/* 1. Doppler Radar Mini Monitor */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#00F2FE] animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94A3B8]">
              Live Doppler Radar Scan
            </span>
          </div>
          <button
            onClick={onOpenRadar}
            className="flex items-center gap-1 text-[11px] font-mono text-[#0284C7] dark:text-[#00F2FE] hover:underline font-semibold"
          >
            <span>Full Radar</span>
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        <div 
          onClick={onOpenRadar}
          className="relative w-full h-44 rounded-xl overflow-hidden cursor-pointer group border border-slate-200 dark:border-white/[0.08] shadow-sm"
        >
          <canvas
            ref={canvasRef}
            width={300}
            height={176}
            className="w-full h-full object-cover"
          />

          <div className="absolute top-2 left-2 text-[10px] font-mono bg-black/70 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 text-[#00F2FE]">
            SWEEP: 4.2 RPM · 100km
          </div>

          <div className="absolute bottom-2 right-2 text-[10px] font-mono bg-black/70 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 text-slate-300 group-hover:text-white transition-colors">
            Click to expand
          </div>
        </div>
      </div>

      {/* 2. Wind Velocity & Compass Vector */}
      <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94A3B8]">
            Wind Velocity & Compass Vector
          </span>
          <Wind className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Rotating Compass Graphic */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full border border-slate-200 dark:border-white/[0.1] bg-slate-100 dark:bg-[#060E20] flex items-center justify-center relative shadow-inner">
              <span className="absolute top-1 text-[9px] font-mono text-slate-500 dark:text-[#64748B]">N</span>
              <span className="absolute bottom-1 text-[9px] font-mono text-slate-500 dark:text-[#64748B]">S</span>
              <span className="absolute left-1.5 text-[9px] font-mono text-slate-500 dark:text-[#64748B]">W</span>
              <span className="absolute right-1.5 text-[9px] font-mono text-slate-500 dark:text-[#64748B]">E</span>

              {/* Dynamic pointer needle */}
              <div
                className="w-full h-full absolute top-0 left-0 flex items-center justify-center pointer-events-none transition-transform duration-700"
                style={{ transform: `rotate(${current.windDirectionDeg}deg)` }}
              >
                <div className="w-1 h-9 bg-gradient-to-t from-transparent via-[#0284C7] to-[#0284C7] dark:via-[#00F2FE] dark:to-[#00F2FE] rounded-full shadow-[0_0_8px_currentColor]" />
              </div>

              <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-[#080C14] border border-[#0284C7] dark:border-[#00F2FE] z-10" />
            </div>
          </div>

          {/* Numerical Wind Vector Details */}
          <div className="flex-1 flex flex-col gap-1 font-mono">
            <div className="text-xl font-display font-semibold text-slate-900 dark:text-[#F8FAFC]">
              {formatSpeed(current.windSpeedKmh, speedUnit)}
            </div>
            <div className="text-xs text-[#0284C7] dark:text-[#00F2FE] font-medium">
              Bearing {current.windDirectionDeg}° ({getWindDirectionCardinal(current.windDirectionDeg)})
            </div>
            <div className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
              Gusts up to {formatSpeed(current.windGustKmh, speedUnit)}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-[#475569] mt-0.5">
              Beaufort F{beaufort.scale} · {beaufort.description}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Barometric Pressure & 12h History */}
      <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94A3B8]">
            Atmospheric Pressure
          </span>
          <Gauge className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#00F2FE]" />
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-display font-semibold text-slate-900 dark:text-[#F8FAFC]">
            {formatPressure(current.pressureHpa, pressureUnit)}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#0284C7] dark:text-[#00F2FE]">
            <span>{current.pressureTrend === 'rising' ? '▲ Rising' : current.pressureTrend === 'falling' ? '▼ Falling' : '■ Steady'}</span>
            <span className="text-slate-500 dark:text-[#94A3B8]">({current.pressureDelta3h > 0 ? '+' : ''}{current.pressureDelta3h} hPa)</span>
          </div>
        </div>

        {/* 12-Hour Micro-barograph sparkline */}
        <div className="h-10 w-full flex items-end gap-1 pt-2">
          {station.pressureHistory12h.map((item, idx) => {
            const hpas = station.pressureHistory12h.map(x => x.pressureHpa);
            const minH = Math.min(...hpas);
            const maxH = Math.max(...hpas);
            const hRange = maxH - minH === 0 ? 1 : maxH - minH;
            const barHeightPct = Math.max(15, ((item.pressureHpa - minH) / hRange) * 100);

            return (
              <div
                key={idx}
                className="flex-1 bg-slate-200 dark:bg-[#1E293B] hover:bg-[#0284C7] dark:hover:bg-[#00F2FE] rounded-t transition-colors relative group"
                style={{ height: `${barHeightPct}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white dark:bg-[#0F172A] border border-white/20 px-1.5 py-0.5 rounded text-[9px] font-mono pointer-events-none whitespace-nowrap z-20">
                  {item.pressureHpa} hPa
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Air Quality Index (AQI) */}
      <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94A3B8]">
            Air Quality Index (AQI)
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-semibold text-slate-900 dark:text-[#F8FAFC]">
              {current.airQuality.aqi}
            </span>
            <span 
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${aqiInfo.color}20`, color: aqiInfo.color }}
            >
              {aqiInfo.label}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-[#94A3B8]">EPA AQI Scale</span>
        </div>

        {/* Breakdown of Pollutants */}
        <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-center">
          <div className="bg-slate-100/90 dark:bg-[#131B2E] p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.04]">
            <div className="text-[9px] text-slate-500 dark:text-[#64748B]">PM2.5</div>
            <div className="text-xs text-slate-800 dark:text-[#DAE2FD] font-semibold">{current.airQuality.pm25}</div>
          </div>
          <div className="bg-slate-100/90 dark:bg-[#131B2E] p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.04]">
            <div className="text-[9px] text-slate-500 dark:text-[#64748B]">PM10</div>
            <div className="text-xs text-slate-800 dark:text-[#DAE2FD] font-semibold">{current.airQuality.pm10}</div>
          </div>
          <div className="bg-slate-100/90 dark:bg-[#131B2E] p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.04]">
            <div className="text-[9px] text-slate-500 dark:text-[#64748B]">O₃</div>
            <div className="text-xs text-slate-800 dark:text-[#DAE2FD] font-semibold">{current.airQuality.o3}</div>
          </div>
          <div className="bg-slate-100/90 dark:bg-[#131B2E] p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.04]">
            <div className="text-[9px] text-slate-500 dark:text-[#64748B]">NO₂</div>
            <div className="text-xs text-slate-800 dark:text-[#DAE2FD] font-semibold">{current.airQuality.no2}</div>
          </div>
        </div>
      </div>

      {/* 5. UV Solar Index & Ephemeris */}
      <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94A3B8]">
            Solar Flux & Lunar Ephemeris
          </span>
          <Sun className="w-3.5 h-3.5 text-[#EA580C] dark:text-[#FB923C]" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-xs text-slate-500 dark:text-[#94A3B8]">UV Radiation Index</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-display font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {current.uvIndex}
              </span>
              <span className="text-xs font-semibold text-[#EA580C] dark:text-[#FB923C]">
                {uvInfo.label}
              </span>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">
            <div>Dawn {current.solarLunar.dawn}</div>
            <div className="text-[#EA580C] dark:text-[#FB923C] font-semibold">Noon {current.solarLunar.solarNoon}</div>
            <div>Dusk {current.solarLunar.dusk}</div>
          </div>
        </div>

        {/* Moon Phase & Day Length */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
          <div className="flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#7BD0FF]" />
            <span>{current.solarLunar.moonPhase} ({current.solarLunar.moonIlluminationPct}%)</span>
          </div>
          <span>Day {current.solarLunar.dayLength}</span>
        </div>
      </div>

      {/* 6. Aviation METAR & Flight Rules */}
      <div className="glass-card rounded-2xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#00F2FE]" />
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94A3B8]">
              Aviation METAR Status
            </span>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
            station.metar.flightCategory === 'VFR'
              ? 'bg-[#10B981]/15 text-[#059669] dark:text-[#10B981] border border-[#10B981]/30'
              : 'bg-[#0284C7]/15 text-[#0284C7] dark:text-[#38BDF8] border border-[#0284C7]/30'
          }`}>
            {station.metar.flightCategory}
          </span>
        </div>

        <div className="bg-slate-100 dark:bg-[#080C14] p-2.5 rounded-lg border border-slate-200 dark:border-white/[0.06] font-mono text-[11px] text-slate-800 dark:text-[#DAE2FD] break-all select-all">
          {station.metar.raw}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">
          <span>Ceiling: {station.metar.cloudBaseFt} ft</span>
          <span>Altimeter: {station.metar.altimeterInHg} inHg</span>
        </div>
      </div>
    </aside>
  );
};
