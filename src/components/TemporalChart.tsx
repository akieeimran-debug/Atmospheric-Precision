import React, { useState } from 'react';
import { HourlyForecast, TemperatureUnit, PressureUnit, SpeedUnit } from '../types/weather';
import { formatTemp, formatSpeed, formatPressure } from '../utils/weatherUtils';

interface TemporalChartProps {
  hourly: HourlyForecast[];
  tempUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
  pressureUnit: PressureUnit;
}

type ChartMetric = 'temp' | 'precip' | 'wind' | 'pressure';

export const TemporalChart: React.FC<TemporalChartProps> = ({
  hourly,
  tempUnit,
  speedUnit,
  pressureUnit,
}) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('temp');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take the first 14 hourly points
  const points = hourly.slice(0, 14);

  // SVG dimensions
  const width = 760;
  const height = 180;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates based on active metric
  let values: number[] = [];
  let secondaryValues: number[] = [];

  if (activeMetric === 'temp') {
    values = points.map(p => p.tempC);
    secondaryValues = points.map(p => p.dewPointC);
  } else if (activeMetric === 'precip') {
    values = points.map(p => p.precipProb);
    secondaryValues = points.map(p => p.precipVolumeMm);
  } else if (activeMetric === 'wind') {
    values = points.map(p => p.windSpeedKmh);
    secondaryValues = points.map(p => p.windGustKmh);
  } else if (activeMetric === 'pressure') {
    values = points.map(p => p.pressureHpa);
  }

  const minVal = Math.min(...values, ...(secondaryValues.length ? secondaryValues : []));
  const maxVal = Math.max(...values, ...(secondaryValues.length ? secondaryValues : []));
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const getX = (idx: number) => paddingX + (idx / (points.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;

  // Generate SVG path string
  const primaryPath = points.map((p, idx) => {
    const x = getX(idx);
    const y = getY(values[idx]);
    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Gradient area path
  const areaPath = `${primaryPath} L ${getX(points.length - 1)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z`;

  // Secondary path (e.g. dew point or gusts)
  const secondaryPath = secondaryValues.length ? points.map((p, idx) => {
    const x = getX(idx);
    const y = getY(secondaryValues[idx]);
    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') : null;

  const currentHoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
      {/* Header with Segmented switch */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-[#94A3B8]">
            Temporal Gradient Model
          </span>
          <span className="text-sm font-display font-semibold text-slate-900 dark:text-[#F8FAFC]">
            {activeMetric === 'temp' && 'Surface Temperature vs. Dew Point Inversion'}
            {activeMetric === 'precip' && 'Precipitation Probability & Accumulation Vector'}
            {activeMetric === 'wind' && 'Sustained Wind Velocity vs. Gust Maxima'}
            {activeMetric === 'pressure' && 'Atmospheric Pressure Micro-barograph'}
          </span>
        </div>

        {/* Segmented Switch */}
        <div className="flex items-center bg-slate-100 dark:bg-[#060E20]/80 p-1 rounded-xl border border-slate-200 dark:border-white/[0.08]">
          <button
            onClick={() => setActiveMetric('temp')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeMetric === 'temp'
                ? 'bg-white dark:bg-[#1E293B] text-[#0284C7] dark:text-[#00F2FE] shadow-xs border border-slate-200 dark:border-white/[0.1] font-semibold'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Temperature
          </button>
          <button
            onClick={() => setActiveMetric('precip')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeMetric === 'precip'
                ? 'bg-white dark:bg-[#1E293B] text-[#0284C7] dark:text-[#00F2FE] shadow-xs border border-slate-200 dark:border-white/[0.1] font-semibold'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Precipitation
          </button>
          <button
            onClick={() => setActiveMetric('wind')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeMetric === 'wind'
                ? 'bg-white dark:bg-[#1E293B] text-[#0284C7] dark:text-[#00F2FE] shadow-xs border border-slate-200 dark:border-white/[0.1] font-semibold'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Wind & Gusts
          </button>
          <button
            onClick={() => setActiveMetric('pressure')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeMetric === 'pressure'
                ? 'bg-white dark:bg-[#1E293B] text-[#0284C7] dark:text-[#00F2FE] shadow-xs border border-slate-200 dark:border-white/[0.1] font-semibold'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Barometer
          </button>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="curveGradientLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="curveGradientDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00F2FE" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="currentColor"
            className="text-slate-200 dark:text-white/[0.06]"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingTop + chartHeight / 2}
            x2={width - paddingX}
            y2={paddingTop + chartHeight / 2}
            stroke="currentColor"
            className="text-slate-200 dark:text-white/[0.06]"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="currentColor"
            className="text-slate-300 dark:text-white/[0.12]"
          />

          {/* Area fill */}
          <path d={areaPath} fill="url(#curveGradientLight)" className="dark:hidden" />
          <path d={areaPath} fill="url(#curveGradientDark)" className="hidden dark:block" />

          {/* Secondary curve (e.g. dew point, gusts) */}
          {secondaryPath && (
            <path
              d={secondaryPath}
              fill="none"
              stroke="#0EA5E9"
              className="dark:stroke-[#7BD0FF]"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              strokeOpacity="0.75"
            />
          )}

          {/* Primary curve */}
          <path
            d={primaryPath}
            fill="none"
            stroke="#0284C7"
            className="dark:stroke-[#00F2FE]"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Points & Interactive hover columns */}
          {points.map((p, idx) => {
            const x = getX(idx);
            const y = getY(values[idx]);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={idx}>
                {/* Invisible hover slice */}
                <rect
                  x={x - chartWidth / (points.length * 2)}
                  y={paddingTop}
                  width={chartWidth / points.length}
                  height={chartHeight + 25}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />

                {/* Point circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5 : 3}
                  className={isHovered ? 'fill-[#0284C7] dark:fill-[#00F2FE]' : 'fill-white dark:fill-[#080C14]'}
                  stroke="currentColor"
                  color="#0284C7"
                  strokeWidth="2"
                />

                {/* X-axis time label */}
                <text
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  className={`text-[10px] font-mono select-none ${isHovered ? 'fill-[#0284C7] dark:fill-[#00F2FE] font-bold' : 'fill-slate-500 dark:fill-[#64748B]'}`}
                >
                  {p.time}
                </text>
              </g>
            );
          })}

          {/* Active Crosshair line if hovered */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={paddingTop}
                x2={getX(hoveredIndex)}
                y2={height - paddingBottom}
                stroke="#0284C7"
                className="dark:stroke-[#00F2FE]"
                strokeWidth="1"
                strokeDasharray="2 2"
                strokeOpacity="0.7"
              />
            </g>
          )}
        </svg>

        {/* Legend / Hover Snapshot */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/80 dark:border-white/[0.04] text-xs">
          <div className="flex items-center gap-4 text-slate-500 dark:text-[#94A3B8]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#0284C7] dark:bg-[#00F2FE]" />
              <span>
                {activeMetric === 'temp' && 'Surface Temperature'}
                {activeMetric === 'precip' && 'Precipitation Probability'}
                {activeMetric === 'wind' && 'Sustained Wind Speed'}
                {activeMetric === 'pressure' && 'Atmospheric Pressure'}
              </span>
            </div>
            {secondaryValues.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#0EA5E9] dark:bg-[#7BD0FF] border-t border-dashed" />
                <span>
                  {activeMetric === 'temp' && 'Dew Point'}
                  {activeMetric === 'precip' && 'Volume (mm/h)'}
                  {activeMetric === 'wind' && 'Gust Peak'}
                </span>
              </div>
            )}
          </div>

          {currentHoveredPoint ? (
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-500 dark:text-[#94A3B8]">{currentHoveredPoint.time}:</span>
              <span className="text-[#0284C7] dark:text-[#00F2FE] font-bold">
                {activeMetric === 'temp' && formatTemp(currentHoveredPoint.tempC, tempUnit)}
                {activeMetric === 'precip' && `${currentHoveredPoint.precipProb}%`}
                {activeMetric === 'wind' && formatSpeed(currentHoveredPoint.windSpeedKmh, speedUnit)}
                {activeMetric === 'pressure' && formatPressure(currentHoveredPoint.pressureHpa, pressureUnit)}
              </span>
              {activeMetric === 'temp' && (
                <span className="text-slate-500 dark:text-[#7BD0FF] text-[11px]">
                  (Dew: {formatTemp(currentHoveredPoint.dewPointC, tempUnit)})
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] font-mono text-slate-400 dark:text-[#475569]">
              Hover across timeline to probe atmospheric values
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
