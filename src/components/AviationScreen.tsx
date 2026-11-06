import React, { useState } from 'react';
import { WeatherStation, TemperatureUnit } from '../types/weather';
import { 
  ArrowLeft, 
  Plane, 
  Compass, 
  Copy, 
  Check
} from 'lucide-react';

interface AviationScreenProps {
  station: WeatherStation;
  stations: WeatherStation[];
  onSelectStation: (station: WeatherStation) => void;
  tempUnit: TemperatureUnit;
  onBack: () => void;
}

export const AviationScreen: React.FC<AviationScreenProps> = ({
  station,
  stations,
  onSelectStation,
  onBack,
}) => {
  const metar = station.metar;
  const current = station.current;

  const [selectedRunway, setSelectedRunway] = useState<number>(metar.windComponent.runwayHeading);
  const [copied, setCopied] = useState(false);

  // Calculate runway wind components based on selected runway heading
  const windAngleDiff = Math.abs(current.windDirectionDeg - selectedRunway * 10) * (Math.PI / 180);
  const headwindKnots = Math.round(current.windSpeedKmh * 0.539957 * Math.cos(windAngleDiff));
  const crosswindKnots = Math.round(current.windSpeedKmh * 0.539957 * Math.sin(windAngleDiff));

  const copyMETAR = () => {
    navigator.clipboard.writeText(metar.raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <Plane className="w-4 h-4 text-[#0284C7] dark:text-[#00F2FE]" />
            <span className="font-display font-semibold text-base text-slate-900 dark:text-[#F8FAFC]">
              Aviation METAR & Terminal Aerodrome Dispatch
            </span>
          </div>
        </div>

        {/* Airport Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#060E20] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-xs font-mono">
          <span className="text-slate-500 dark:text-[#94A3B8]">Aerodrome:</span>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Raw METAR String & Decoded Parameters */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Raw METAR Card */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#0284C7] dark:text-[#00F2FE] font-semibold">
                  Official ICAO METAR Report
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  metar.flightCategory === 'VFR'
                    ? 'bg-[#10B981]/15 text-[#059669] dark:text-[#10B981] border border-[#10B981]/30'
                    : 'bg-[#0284C7]/15 text-[#0284C7] dark:text-[#38BDF8] border border-[#0284C7]/30'
                }`}>
                  {metar.flightCategory} (Visual Flight Rules)
                </span>
              </div>

              <button
                onClick={copyMETAR}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-xs font-mono text-slate-700 dark:text-[#DAE2FD] transition-all"
                title="Copy raw METAR"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Raw String */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#060E20] border border-slate-200 dark:border-white/[0.08] font-mono text-sm sm:text-base text-[#0284C7] dark:text-[#00F2FE] tracking-wide break-all select-all font-semibold">
              {metar.raw}
            </div>

            {/* Human Decoded Items */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-[#131B2E] border border-slate-200 dark:border-white/[0.04]">
                <div className="text-[10px] text-slate-500 dark:text-[#64748B] uppercase">Surface Wind</div>
                <div className="text-slate-900 dark:text-[#F8FAFC] font-semibold text-sm mt-0.5">
                  {current.windDirectionDeg}° at {Math.round(current.windSpeedKmh * 0.54)} kts
                </div>
                <div className="text-[10px] text-[#0284C7] dark:text-[#38BDF8]">Gusts {Math.round(current.windGustKmh * 0.54)} kts</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-[#131B2E] border border-slate-200 dark:border-white/[0.04]">
                <div className="text-[10px] text-slate-500 dark:text-[#64748B] uppercase">Horizontal Visibility</div>
                <div className="text-slate-900 dark:text-[#F8FAFC] font-semibold text-sm mt-0.5">
                  {metar.visibilityKm} km (10+ SM)
                </div>
                <div className="text-[10px] text-[#10B981]">Unrestricted</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-[#131B2E] border border-slate-200 dark:border-white/[0.04]">
                <div className="text-[10px] text-slate-500 dark:text-[#64748B] uppercase">Cloud Base Ceiling</div>
                <div className="text-slate-900 dark:text-[#F8FAFC] font-semibold text-sm mt-0.5">
                  {metar.cloudBaseFt} ft AGL
                </div>
                <div className="text-[10px] text-[#0284C7] dark:text-[#38BDF8]">Scattered / Broken</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-[#131B2E] border border-slate-200 dark:border-white/[0.04]">
                <div className="text-[10px] text-slate-500 dark:text-[#64748B] uppercase">Temp / Dew Point</div>
                <div className="text-slate-900 dark:text-[#F8FAFC] font-semibold text-sm mt-0.5">
                  {Math.round(current.tempC)}°C / {Math.round(current.dewPointC)}°C
                </div>
                <div className="text-[10px] text-slate-500 dark:text-[#94A3B8]">Spread {Math.round(current.tempC - current.dewPointC)}°C</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-[#131B2E] border border-slate-200 dark:border-white/[0.04]">
                <div className="text-[10px] text-slate-500 dark:text-[#64748B] uppercase">Altimeter (QNH)</div>
                <div className="text-slate-900 dark:text-[#F8FAFC] font-semibold text-sm mt-0.5">
                  {metar.altimeterInHg} inHg
                </div>
                <div className="text-[10px] text-[#0284C7] dark:text-[#00F2FE]">Q{Math.round(current.pressureHpa)}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-[#131B2E] border border-slate-200 dark:border-white/[0.04]">
                <div className="text-[10px] text-slate-500 dark:text-[#64748B] uppercase">Trend (NOSIG)</div>
                <div className="text-slate-900 dark:text-[#F8FAFC] font-semibold text-sm mt-0.5">
                  No Sig Change
                </div>
                <div className="text-[10px] text-[#10B981]">Stable Corridor</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Runway Crosswind Calculator & Aerodrome Visualizer */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] font-semibold">
                Runway Crosswind Calculator
              </span>
              <Compass className="w-4 h-4 text-[#0284C7] dark:text-[#00F2FE]" />
            </div>

            {/* Runway Selector Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Active Runway:</span>
              {[10, 19, 28, 1].map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRunway(r)}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                    selectedRunway === r
                      ? 'bg-[#0284C7] dark:bg-[#00F2FE] text-white dark:text-[#080C14] font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  RWY {r < 10 ? `0${r}` : r}
                </button>
              ))}
            </div>

            {/* Visual Runway Heading Diagram */}
            <div className="relative w-full h-44 rounded-xl bg-slate-100 dark:bg-[#060E20] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center overflow-hidden shadow-inner">
              {/* Runway Strip Graphic */}
              <div
                className="w-8 h-36 bg-slate-800 text-white border-2 border-slate-600 rounded relative flex flex-col items-center justify-between py-2 transition-transform duration-500 shadow-md"
                style={{ transform: `rotate(${selectedRunway * 10}deg)` }}
              >
                <span className="text-[9px] font-mono font-bold">
                  {selectedRunway < 10 ? `0${selectedRunway}` : selectedRunway}
                </span>
                <div className="w-1 h-12 border-l border-dashed border-white/50" />
                <span className="text-[9px] font-mono font-bold">
                  {(selectedRunway + 18) % 36 || 36}
                </span>
              </div>

              {/* Wind Vector Arrow */}
              <div
                className="absolute w-24 h-24 flex items-center justify-center pointer-events-none transition-transform duration-700"
                style={{ transform: `rotate(${current.windDirectionDeg}deg)` }}
              >
                <div className="w-1.5 h-20 bg-gradient-to-t from-transparent via-[#0284C7] to-[#0284C7] dark:via-[#00F2FE] dark:to-[#00F2FE] rounded-full shadow-[0_0_12px_currentColor]" />
              </div>

              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-500 dark:text-[#64748B]">
                Wind: {current.windDirectionDeg}° / RWY: {selectedRunway * 10}°
              </div>
            </div>

            {/* Resolved Wind Components */}
            <div className="grid grid-cols-2 gap-3 font-mono text-center">
              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-[#131B2E] border border-slate-200 dark:border-white/[0.04]">
                <div className="text-[10px] text-slate-500 dark:text-[#64748B] uppercase">Headwind Component</div>
                <div className={`text-xl font-bold mt-1 ${headwindKnots >= 0 ? 'text-[#059669] dark:text-[#10B981]' : 'text-[#EA580C] dark:text-[#FB923C]'}`}>
                  {headwindKnots >= 0 ? `${headwindKnots} kts` : `${Math.abs(headwindKnots)} kts Tailwind`}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-[#131B2E] border border-slate-200 dark:border-white/[0.04]">
                <div className="text-[10px] text-slate-500 dark:text-[#64748B] uppercase">Crosswind Component</div>
                <div className={`text-xl font-bold mt-1 ${Math.abs(crosswindKnots) > 15 ? 'text-[#EA580C] dark:text-[#FB923C]' : 'text-[#0284C7] dark:text-[#00F2FE]'}`}>
                  {Math.abs(crosswindKnots)} kts
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
