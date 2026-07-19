import { DailyForecast, TempUnit } from '../types';
import { generateIntelligence } from '../weatherUtils';
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';

interface IntelligencePanelProps {
  weathercode: number;
  tempC: number;
  windspeed: number;
  tempUnit: TempUnit;
}

export default function IntelligencePanel({
  weathercode,
  tempC,
  windspeed,
  tempUnit,
}: IntelligencePanelProps) {
  const report = generateIntelligence(weathercode, tempC, windspeed);

  // Helper styles based on overall rating to match High Density theme perfectly
  const getThemeStyle = (rating: 'excellent' | 'good' | 'fair' | 'poor') => {
    switch (rating) {
      case 'excellent':
      case 'good':
        return {
          bg: 'bg-emerald-50/90 border-emerald-100',
          dot: 'bg-emerald-500',
          text: 'text-emerald-900',
          header: 'text-emerald-700 border-emerald-200/30',
          itemBg: 'bg-white/80 border-emerald-200/50',
          itemText: 'text-emerald-800',
          title: 'Optimal Weather',
        };
      case 'fair':
        return {
          bg: 'bg-amber-50/90 border-amber-100',
          dot: 'bg-amber-500',
          text: 'text-amber-900',
          header: 'text-amber-700 border-amber-200/30',
          itemBg: 'bg-white/80 border-amber-200/50',
          itemText: 'text-amber-800',
          title: 'Fair Weather',
        };
      case 'poor':
        return {
          bg: 'bg-rose-50/90 border-rose-100',
          dot: 'bg-rose-500',
          text: 'text-rose-900',
          header: 'text-rose-700 border-rose-200/30',
          itemBg: 'bg-white/80 border-rose-200/50',
          itemText: 'text-rose-800',
          title: 'Advisory Active',
        };
    }
  };

  const theme = getThemeStyle(report.overallRating);

  // Pick top suggestions to map to emojis for high density display
  const getSuggestionEmojis = () => {
    const list: { emoji: string; text: string }[] = [];
    
    // Check activities statuses to produce high density recommendations
    report.activities.forEach(act => {
      if (act.status === 'Perfect' || act.status === 'Good') {
        let emoji = '👍';
        if (act.name.includes('Running')) emoji = '🏃';
        if (act.name.includes('Dining')) emoji = '🍽️';
        if (act.name.includes('Drying')) emoji = '👕';
        if (act.name.includes('Commute')) emoji = '🚗';
        list.push({ emoji, text: `${act.name}: ${act.status}` });
      }
    });

    // Check checklist to add action items
    report.checklist.slice(0, 2).forEach((item, idx) => {
      let emoji = idx === 0 ? '📝' : '⚡';
      if (item.toLowerCase().includes('umbrella')) emoji = '☔';
      if (item.toLowerCase().includes('jacket') || item.toLowerCase().includes('layer')) emoji = '🧥';
      if (item.toLowerCase().includes('water')) emoji = '💧';
      if (item.toLowerCase().includes('sunscreen')) emoji = '🧴';
      list.push({ emoji, text: item });
    });

    // Return unique suggestions
    return list.slice(0, 2);
  };

  const suggestions = getSuggestionEmojis();

  return (
    <div className={`${theme.bg} border rounded-3xl p-6 flex flex-col shadow-sm h-full justify-between transition-all duration-200 hover:shadow-md`}>
      <div>
        <div className="flex items-center gap-2 mb-3.5">
          <div className={`w-2 h-2 rounded-full ${theme.dot} animate-pulse`}></div>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.header}`}>Daily Intelligence</h3>
        </div>
        
        <p className={`${theme.text} font-medium leading-relaxed text-sm`}>
          {report.overallAdvice}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {suggestions.map((sug, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${theme.itemBg} p-2.5 rounded-xl border flex items-center gap-3 transition-colors hover:bg-white`}
          >
            <span className="text-lg shrink-0">{sug.emoji}</span>
            <span className={`text-[11px] font-bold tracking-tight leading-tight ${theme.itemText} truncate`}>
              {sug.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
