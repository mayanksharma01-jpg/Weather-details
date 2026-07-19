import { DailyForecast, TempUnit } from '../types';
import { getWeatherCondition, cToF, getDayName } from '../weatherUtils';
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';

interface ForecastSectionProps {
  daily: DailyForecast;
  tempUnit: TempUnit;
}

export default function ForecastSection({ daily, tempUnit }: ForecastSectionProps) {
  const times = daily.time;
  const maxTempsCelsius = daily.temperature_2m_max;
  const minTempsCelsius = daily.temperature_2m_min;
  const codes = daily.weathercode;

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 10 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-display">7-Day Forecast</h3>
        <span className="text-[10px] font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-md font-mono uppercase">
          7 Days Live
        </span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col flex-grow divide-y divide-slate-100"
      >
        {times.map((time, idx) => {
          const code = codes[idx];
          const condition = getWeatherCondition(code, true);
          const IconComponent = (LucideIcons as any)[condition.iconName] || LucideIcons.HelpCircle;

          const highTemp = tempUnit === 'F' ? cToF(maxTempsCelsius[idx]) : Math.round(maxTempsCelsius[idx]);
          const lowTemp = tempUnit === 'F' ? cToF(minTempsCelsius[idx]) : Math.round(minTempsCelsius[idx]);
          const isToday = idx === 0;

          // Short weekday name (Today or Mon, Tue, etc.)
          const dayName = isToday ? 'Today' : getDayName(time).substring(0, 3);

          return (
            <motion.div
              key={time}
              variants={itemVariants}
              className="flex items-center justify-between py-3.5 transition-all hover:bg-slate-50/50 -mx-2 px-2 rounded-xl"
            >
              <div className="w-14">
                <span className={`font-bold text-sm ${isToday ? 'text-blue-600' : 'text-slate-800'}`}>
                  {dayName}
                </span>
                <span className="block text-[10px] text-slate-400 font-mono -mt-0.5">
                  {time.substring(5, 10).replace('-', '/')}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-1 px-2">
                <div className="relative">
                  <div className={`absolute inset-0 rounded-full blur-sm opacity-20 bg-${condition.accentColor}-400 w-6 h-6`} />
                  <IconComponent className="w-5 h-5 text-slate-700 relative z-10" />
                </div>
                <span className="text-xs font-semibold text-slate-500 truncate max-w-[80px] sm:max-w-none">
                  {condition.label}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-sm shrink-0">
                <span className="text-slate-800 font-bold w-8 text-right">{highTemp}°</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-400 w-8 text-left">{lowTemp}°</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
