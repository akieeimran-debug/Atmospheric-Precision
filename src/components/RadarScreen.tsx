import React, { useState, useEffect, useRef } from 'react';
import { WeatherStation, TemperatureUnit, RadarLayer } from '../types/weather';
import { formatTemp } from '../utils/weatherUtils';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  ArrowLeft,
  Crosshair,
  Wind,
  CloudRain
} from 'lucide-react';

interface RadarScreenProps {
  station: WeatherStation;
  stations: WeatherStation[];
  onSelectStation: (station: WeatherStation) => void;
  tempUnit: TemperatureUnit;
  onBack: () => void;
}

export const RadarScreen: React.FC<RadarScreenProps> = ({
  station,
  stations,
  onSelectStation,
  tempUnit,
  onBack,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeStep, setTimeStep] = useState(3);
  const [activeLayer, setActiveLayer] = useState<RadarLayer>('precipitation');
  const [zoom, setZoom] = useState(1);
  const layerOpacity = 0.85;

  const timeLabels = ['-3 Hours', '-2 Hours', '-1 Hour', 'LIVE NOW', '+1H Model'];

  // Particle simulation state for wind stream
  const particlesRef = useRef<Array<{ x: number; y: number; age: number; maxAge: number; speed: number }>>([]);

  // Loop timer for playback
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeStep(prev => (prev + 1) % timeLabels.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isPlaying, timeLabels.length]);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let sweepAngle = 0;

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 180; i++) {
        particlesRef.current.push({
          x: Math.random() * 1200,
          y: Math.random() * 800,
          age: Math.floor(Math.random() * 100),
          maxAge: 80 + Math.floor(Math.random() * 60),
          speed: 1.5 + Math.random() * 2,
        });
      }
    }

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);
      ctx.translate(-cx, -cy);

      // Radar tactical deep background
      ctx.fillStyle = '#060E20';
      ctx.fillRect(0, 0, w, h);

      // Synoptic land/sea contours
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx - 150, cy - 80, 280, 0.4, 2.8);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + 220, cy + 120, 240, 3.2, 5.6);
      ctx.stroke();

      // Range rings (25km, 50km, 100km, 150km, 200km)
      const ringRadii = [80, 160, 260, 360, 480];
      ringRadii.forEach((r, idx) => {
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = '10px monospace';
        ctx.fillText(`${(idx + 1) * 35} km`, cx + 6, cy - r + 14);
      });

      // Cardinal axes
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 500, cy);
      ctx.lineTo(cx + 500, cy);
      ctx.moveTo(cx, cy - 500);
      ctx.lineTo(cx, cy + 500);
      ctx.stroke();

      // Atmospheric Layers rendering
      ctx.globalAlpha = layerOpacity;

      if (activeLayer === 'precipitation' || activeLayer === 'clouds') {
        const timeOffset = (timeStep - 3) * 35;
        const echoes = [
          { x: cx + 110 + timeOffset, y: cy - 90, r: 85, color1: '#38BDF8', color2: '#0284C7' },
          { x: cx - 140 + timeOffset * 0.8, y: cy + 70, r: 120, color1: '#00F2FE', color2: '#10B981' },
          { x: cx + 40 + timeOffset * 1.2, y: cy + 130, r: 70, color1: '#FB923C', color2: '#F97316' },
          { x: cx - 60 + timeOffset, y: cy - 160, r: 95, color1: '#10B981', color2: '#38BDF8' },
        ];

        echoes.forEach(e => {
          const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r);
          grad.addColorStop(0, e.color2);
          grad.addColorStop(0.6, e.color1);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (activeLayer === 'wind') {
        const angleRad = (station.current.windDirectionDeg - 90) * (Math.PI / 180);
        const vx = Math.cos(angleRad);
        const vy = Math.sin(angleRad);

        ctx.strokeStyle = '#00F2FE';
        ctx.lineWidth = 1.8;

        particlesRef.current.forEach(p => {
          p.x += vx * p.speed;
          p.y += vy * p.speed;
          p.age++;

          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
          if (p.age > p.maxAge) {
            p.age = 0;
            p.x = Math.random() * w;
            p.y = Math.random() * h;
          }

          const tailLen = p.speed * 8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - vx * tailLen, p.y - vy * tailLen);
          ctx.stroke();
        });
      }

      if (activeLayer === 'temperature') {
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.5)';
        ctx.lineWidth = 1.5;
        [120, 220, 320, 420].forEach((rad, i) => {
          ctx.beginPath();
          ctx.ellipse(cx, cy, rad, rad * 0.7, 0.3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#FB923C';
          ctx.font = '10px monospace';
          ctx.fillText(`${formatTemp(station.current.tempC + (2 - i), tempUnit)} isobar`, cx + rad * 0.6, cy - rad * 0.3);
        });
      }

      ctx.globalAlpha = 1.0;

      // Rotating Doppler Radar Sweep Beam
      sweepAngle = (sweepAngle + 0.02) % (Math.PI * 2);
      const sweepGradient = ctx.createConicGradient(sweepAngle - 0.4, cx, cy);
      sweepGradient.addColorStop(0, 'rgba(2, 132, 199, 0.45)');
      sweepGradient.addColorStop(0.12, 'rgba(2, 132, 199, 0.08)');
      sweepGradient.addColorStop(0.2, 'transparent');
      sweepGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, 480, 0, Math.PI * 2);
      ctx.fill();

      // Sweep Beam Line
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * 480, cy + Math.sin(sweepAngle) * 480);
      ctx.stroke();

      // Station Pins on Map
      stations.forEach(s => {
        const isCurrent = s.id === station.id;
        const dx = isCurrent ? 0 : (s.coordinates.lon - station.coordinates.lon) * 15;
        const dy = isCurrent ? 0 : -(s.coordinates.lat - station.coordinates.lat) * 15;
        const sx = cx + dx;
        const sy = cy + dy;

        ctx.fillStyle = isCurrent ? '#00F2FE' : '#94A3B8';
        ctx.beginPath();
        ctx.arc(sx, sy, isCurrent ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (isCurrent) {
          ctx.strokeStyle = '#00F2FE';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sx, sy, 12, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = isCurrent ? '#F8FAFC' : '#94A3B8';
        ctx.font = isCurrent ? 'bold 12px monospace' : '10px monospace';
        ctx.fillText(
          `${s.name.toUpperCase()} (${formatTemp(s.current.tempC, tempUnit)})`,
          sx + 10,
          sy + 4
        );
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeLayer, isPlaying, layerOpacity, station, stations, tempUnit, timeStep, zoom]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-5">
      {/* Top Controller Bar */}
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
              Doppler Radar Synoptic Sweeper
            </span>
            <span className="text-xs font-mono text-[#0284C7] dark:text-[#00F2FE] bg-[#0284C7]/10 dark:bg-[#00F2FE]/10 px-2 py-0.5 rounded-full border border-[#0284C7]/20 dark:border-[#00F2FE]/30">
              {station.name.toUpperCase()} RADAR-01
            </span>
          </div>
        </div>

        {/* Layer Switches */}
        <div className="flex items-center bg-slate-100 dark:bg-[#060E20] p-1 rounded-xl border border-slate-200 dark:border-white/[0.08]">
          <button
            onClick={() => setActiveLayer('precipitation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeLayer === 'precipitation'
                ? 'bg-white dark:bg-[#1E293B] text-[#0284C7] dark:text-[#00F2FE] shadow-xs border border-slate-200 dark:border-white/[0.1] font-semibold'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Reflectivity (dBZ)</span>
          </button>

          <button
            onClick={() => setActiveLayer('wind')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeLayer === 'wind'
                ? 'bg-white dark:bg-[#1E293B] text-[#0284C7] dark:text-[#00F2FE] shadow-xs border border-slate-200 dark:border-white/[0.1] font-semibold'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind Stream Vector</span>
          </button>

          <button
            onClick={() => setActiveLayer('temperature')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeLayer === 'temperature'
                ? 'bg-white dark:bg-[#1E293B] text-[#0284C7] dark:text-[#00F2FE] shadow-xs border border-slate-200 dark:border-white/[0.1] font-semibold'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Thermal Isobars</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Radar Viewport */}
      <div className="relative w-full h-[620px] rounded-3xl overflow-hidden glass-panel border border-slate-200 dark:border-white/[0.12] shadow-2xl">
        <canvas
          ref={canvasRef}
          width={1280}
          height={620}
          className="w-full h-full object-cover cursor-crosshair select-none"
        />

        {/* Floating HUD - Zoom & Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <button
            onClick={() => setZoom(z => Math.min(2.5, z + 0.25))}
            className="w-9 h-9 rounded-xl bg-white/90 dark:bg-[#0F172A]/80 hover:bg-white dark:hover:bg-[#1E293B] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white flex items-center justify-center transition-all shadow-md"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.75, z - 0.25))}
            className="w-9 h-9 rounded-xl bg-white/90 dark:bg-[#0F172A]/80 hover:bg-white dark:hover:bg-[#1E293B] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white flex items-center justify-center transition-all shadow-md"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="w-9 h-9 rounded-xl bg-white/90 dark:bg-[#0F172A]/80 hover:bg-white dark:hover:bg-[#1E293B] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-md"
            title="Reset Scope"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Station Selector Pill */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 dark:bg-[#0F172A]/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-mono shadow-md">
          <Crosshair className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#00F2FE]" />
          <span className="text-slate-700 dark:text-[#DAE2FD]">Centered Station:</span>
          <select
            value={station.id}
            onChange={(e) => {
              const target = stations.find(s => s.id === e.target.value);
              if (target) onSelectStation(target);
            }}
            className="bg-transparent text-[#0284C7] dark:text-[#00F2FE] font-bold outline-none cursor-pointer"
          >
            {stations.map(s => (
              <option key={s.id} value={s.id} className="bg-white text-slate-900 dark:bg-[#080C14] dark:text-[#DAE2FD]">
                {s.name} ({s.callsign})
              </option>
            ))}
          </select>
        </div>

        {/* Bottom Timeline Loop Player & dBZ Scale */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
          {/* Play/Pause & Time Scrubber */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded-xl bg-[#0284C7] dark:bg-[#00F2FE] text-white dark:text-[#080C14] flex items-center justify-center font-bold shadow-md transition-all shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Time Steps */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {timeLabels.map((lbl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTimeStep(idx);
                    setIsPlaying(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                    timeStep === idx
                      ? 'bg-[#0284C7]/15 dark:bg-[#00F2FE]/20 text-[#0284C7] dark:text-[#00F2FE] font-bold border border-[#0284C7]/30 dark:border-[#00F2FE]/40'
                      : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white bg-slate-100/70 dark:bg-white/[0.03]'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* dBZ Reflectivity Scale Legend */}
          <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
            <span className="text-slate-600 dark:text-[#94A3B8]">Echo Intensity (dBZ):</span>
            <div className="flex items-center h-3 rounded-full overflow-hidden border border-slate-300 dark:border-white/10 w-44">
              <span className="h-full flex-1 bg-[#10B981]" title="Light (<20 dBZ)" />
              <span className="h-full flex-1 bg-[#38BDF8]" title="Moderate (30 dBZ)" />
              <span className="h-full flex-1 bg-[#0284C7]" title="Heavy (40 dBZ)" />
              <span className="h-full flex-1 bg-[#FBBF24]" title="Severe (50 dBZ)" />
              <span className="h-full flex-1 bg-[#EA580C]" title="Intense (60 dBZ)" />
              <span className="h-full flex-1 bg-[#EF4444]" title="Hail (>65 dBZ)" />
            </div>
            <span className="text-slate-900 dark:text-white font-semibold">65+ dBZ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
