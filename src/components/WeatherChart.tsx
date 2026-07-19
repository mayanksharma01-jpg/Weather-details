import { useState } from 'react';
import { DailyForecast, TempUnit } from '../types';
import { cToF, getDayNameShort, getWeatherCondition } from '../weatherUtils';
import * as LucideIcons from 'lucide-react';

interface WeatherChartProps {
  daily: DailyForecast;
  tempUnit: TempUnit;
}

export default function WeatherChart({ daily, tempUnit }: WeatherChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const times = daily.time;
  const maxTempsCelsius = daily.temperature_2m_max;
  const minTempsCelsius = daily.temperature_2m_min;

  // Convert values based on tempUnit
  const maxTemps = maxTempsCelsius.map(t => (tempUnit === 'F' ? cToF(t) : Math.round(t)));
  const minTemps = minTempsCelsius.map(t => (tempUnit === 'F' ? cToF(t) : Math.round(t)));

  const allTemps = [...maxTemps, ...minTemps];
  const absoluteMax = Math.max(...allTemps);
  const absoluteMin = Math.min(...allTemps);

  // Pad the range slightly so the curves don't touch the edges of the plotting canvas
  const tempRange = Math.max(absoluteMax - absoluteMin, 4); // avoid divide by zero
  const paddingFactor = tempRange * 0.15;
  const graphMax = absoluteMax + paddingFactor;
  const graphMin = absoluteMin - paddingFactor;

  // SVG dimensions
  const viewBoxWidth = 700;
  const viewBoxHeight = 260;
  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = 35;
  const paddingBottom = 40;

  const chartWidth = viewBoxWidth - paddingLeft - paddingRight;
  const chartHeight = viewBoxHeight - paddingTop - paddingBottom;

  // X coordinate mapper
  const getX = (index: number) => {
    return paddingLeft + (index / 6) * chartWidth;
  };

  // Y coordinate mapper
  const getY = (temp: number) => {
    const relativeVal = (temp - graphMin) / (graphMax - graphMin);
    return viewBoxHeight - paddingBottom - relativeVal * chartHeight;
  };

  // Create smooth SVG Bezier path for points
  const getCurvePath = (temps: number[]) => {
    let path = `M ${getX(0)} ${getY(temps[0])}`;
    for (let i = 0; i < temps.length - 1; i++) {
      const x1 = getX(i);
      const y1 = getY(temps[i]);
      const x2 = getX(i + 1);
      const y2 = getY(temps[i + 1]);
      
      // Control points for a smooth Bezier
      const cx1 = x1 + (x2 - x1) / 3;
      const cy1 = y1;
      const cx2 = x1 + (2 * (x2 - x1)) / 3;
      const cy2 = y2;
      
      path += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
    }
    return path;
  };

  // Create closed SVG area path under a curve (for color gradient fills)
  const getAreaPath = (temps: number[]) => {
    const curve = getCurvePath(temps);
    const bottomY = viewBoxHeight - paddingBottom;
    return `${curve} L ${getX(temps.length - 1)} ${bottomY} L ${getX(0)} ${bottomY} Z`;
  };

  // Grid lines
  const gridLineCount = 4;
  const gridLines = Array.from({ length: gridLineCount }).map((_, i) => {
    const tempValue = graphMin + (i / (gridLineCount - 1)) * (graphMax - graphMin);
    return {
      temp: Math.round(tempValue),
      y: getY(tempValue),
    };
  });

  // Dynamically render icons inside the chart
  const renderWeatherIcon = (code: number, className: string) => {
    const condition = getWeatherCondition(code, true);
    const IconComponent = (LucideIcons as any)[condition.iconName] || LucideIcons.HelpCircle;
    return <IconComponent className={className} size={16} />;
  };

  return (
    <div id="temperature-trend-card" className="bg-white border border-slate-200 rounded-3xl p-6 flex-grow flex flex-col shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
            <LucideIcons.TrendingUp size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">7-Day Temperature Trend</h3>
            <p className="text-xs text-slate-500">Smooth forecast curve tracking daily extremes</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Max
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Min
          </span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="maxAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="minAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((line, i) => (
            <g key={i} className="opacity-40">
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={viewBoxWidth - paddingRight}
                y2={line.y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray={i === 0 || i === gridLineCount - 1 ? 'none' : '4 4'}
              />
              <text
                x={paddingLeft - 8}
                y={line.y + 4}
                textAnchor="end"
                className="font-mono text-[10px] fill-slate-400 font-medium"
              >
                {line.temp}°
              </text>
            </g>
          ))}

          {/* Hover Column Highlights */}
          {times.map((_, i) => {
            const x = getX(i);
            const isHovered = hoveredIdx === i;
            return (
              <g key={i}>
                {/* Visual guideline */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop - 10}
                    x2={x}
                    y2={viewBoxHeight - paddingBottom + 5}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}
                {/* Hotspot rect for mouse interactions */}
                <rect
                  x={x - (chartWidth / 12)}
                  y={paddingTop - 15}
                  width={chartWidth / 6}
                  height={chartHeight + paddingTop}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}

          {/* Area under Min line */}
          <path
            d={getAreaPath(minTemps)}
            fill="url(#minAreaGrad)"
            className="pointer-events-none transition-all duration-300"
          />

          {/* Area under Max line */}
          <path
            d={getAreaPath(maxTemps)}
            fill="url(#maxAreaGrad)"
            className="pointer-events-none transition-all duration-300"
          />

          {/* Min Temp Curve */}
          <path
            d={getCurvePath(minTemps)}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            className="pointer-events-none transition-all duration-300"
          />

          {/* Max Temp Curve */}
          <path
            d={getCurvePath(maxTemps)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            className="pointer-events-none transition-all duration-300"
          />

          {/* Data Nodes & Values */}
          {times.map((time, i) => {
            const x = getX(i);
            const yMax = getY(maxTemps[i]);
            const yMin = getY(minTemps[i]);
            const isHovered = hoveredIdx === i;

            return (
              <g key={i} className="pointer-events-none">
                {/* Max nodes */}
                <circle
                  cx={x}
                  cy={yMax}
                  r={isHovered ? 6 : 4}
                  fill="#ffffff"
                  stroke="#f59e0b"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-200"
                />
                {!isHovered && (
                  <text
                    x={x}
                    y={yMax - 10}
                    textAnchor="middle"
                    className="font-mono text-[10px] font-bold fill-slate-700"
                  >
                    {maxTemps[i]}°
                  </text>
                )}

                {/* Min nodes */}
                <circle
                  cx={x}
                  cy={yMin}
                  r={isHovered ? 6 : 4}
                  fill="#ffffff"
                  stroke="#6366f1"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-200"
                />
                {!isHovered && (
                  <text
                    x={x}
                    y={yMin + 16}
                    textAnchor="middle"
                    className="font-mono text-[10px] font-bold fill-slate-500"
                  >
                    {minTemps[i]}°
                  </text>
                )}

                {/* Bottom X labels */}
                <text
                  x={x}
                  y={viewBoxHeight - 12}
                  textAnchor="middle"
                  className={`text-[10px] font-semibold transition-colors duration-200 ${
                    isHovered ? 'fill-indigo-600 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {i === 0 ? 'Today' : getDayNameShort(time)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Float HTML interactive tooltip on Hover */}
        {hoveredIdx !== null && (
          <div
            className="absolute bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-xl p-3 shadow-xl border border-white/10 flex flex-col gap-1 pointer-events-none transition-all duration-150"
            style={{
              left: `${Math.max(10, Math.min(90, (hoveredIdx / 6) * 100))}%`,
              transform: 'translateX(-50%)',
              bottom: '45px',
              width: '135px',
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
              <span className="font-semibold text-[10px] text-slate-300">
                {hoveredIdx === 0 ? 'TODAY' : getDayNameShort(times[hoveredIdx]).toUpperCase()}
              </span>
              <span className="opacity-90">
                {renderWeatherIcon(daily.weathercode[hoveredIdx], 'text-amber-400')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Max Temp:</span>
              <span className="font-mono font-bold text-amber-400">{maxTemps[hoveredIdx]}°{tempUnit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Min Temp:</span>
              <span className="font-mono font-bold text-indigo-400">{minTemps[hoveredIdx]}°{tempUnit}</span>
            </div>
            <div className="text-[10px] text-slate-300 italic truncate mt-0.5 pt-0.5 border-t border-white/5 text-center">
              {getWeatherCondition(daily.weathercode[hoveredIdx]).label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
