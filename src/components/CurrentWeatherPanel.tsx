import { CurrentWeather, DailyForecast, TempUnit, WindUnit, City } from '../types';
import { getWeatherCondition, cToF, formatWind } from '../weatherUtils';
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';

interface CurrentWeatherPanelProps {
  current: CurrentWeather;
  daily: DailyForecast;
  city: City;
  tempUnit: TempUnit;
  windUnit: WindUnit;
}

export default function CurrentWeatherPanel({
  current,
  daily,
  city,
  tempUnit,
  windUnit,
}: CurrentWeatherPanelProps) {
  const isDay = current.is_day === 1;
  const condition = getWeatherCondition(current.weathercode, isDay);
  
  // Resolve Lucide Icon dynamically
  const IconComponent = (LucideIcons as any)[condition.iconName] || LucideIcons.HelpCircle;

  // Resolve today's high and low from daily forecast
  const todayHighC = daily.temperature_2m_max[0] ?? current.temperature;
  const todayLowC = daily.temperature_2m_min[0] ?? current.temperature;

  const displayTemp = tempUnit === 'F' ? cToF(current.temperature) : Math.round(current.temperature);
  const displayHigh = tempUnit === 'F' ? cToF(todayHighC) : Math.round(todayHighC);
  const displayLow = tempUnit === 'F' ? cToF(todayLowC) : Math.round(todayLowC);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      id="current-weather-card"
      className={`relative overflow-hidden rounded-3xl p-8 text-white flex flex-col justify-between shadow-lg bg-gradient-to-br ${condition.bgGradient} min-h-[260px] h-full`}
    >
      {/* Decorative Background Blur Sphere */}
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Top Header */}
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider opacity-75">Currently</h2>
          <div className="text-6xl font-extrabold mt-1 tracking-tighter flex items-baseline select-none">
            {displayTemp}
            <span className="text-2xl font-bold ml-1 opacity-90">°{tempUnit}</span>
          </div>
          <p className="text-base font-semibold opacity-90 mt-1">{condition.label}</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <motion.div
            animate={{ rotate: [0, 4, -4, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="mb-1"
          >
            <IconComponent className="w-14 h-14 filter drop-shadow-md" />
          </motion.div>
          <div className="mt-2 text-[10px] font-mono opacity-70 tracking-widest uppercase flex items-center gap-1 bg-black/10 px-2 py-0.5 rounded">
            Wind: {formatWind(current.windspeed, windUnit)}
          </div>
        </div>
      </div>

      {/* Stats row integrated beautifully at the bottom */}
      <div className="relative z-10 grid grid-cols-2 gap-4 border-t border-white/20 pt-5 mt-4">
        <div className="flex items-center gap-2">
          <span className="opacity-60 text-[10px] uppercase font-extrabold tracking-tighter">Low/High</span>
          <span className="font-mono text-xs font-bold text-amber-100">
            {displayLow}° <span className="opacity-50">/</span> {displayHigh}°
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 pl-2 border-l border-white/10">
          <span className="opacity-60 text-[10px] uppercase font-extrabold tracking-tighter">Velocity</span>
          <span className="font-mono text-xs font-bold">
            {current.windspeed} km/h
          </span>
        </div>
      </div>
    </motion.div>
  );
}
