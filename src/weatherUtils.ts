import { WeatherCondition } from './types';

// Map WMO weather codes to human-readable terms, Lucide icon strings, and beautiful custom styles.
export function getWeatherCondition(code: number, isDay: boolean = true): WeatherCondition {
  switch (code) {
    case 0:
      return {
        label: 'Clear Sky',
        iconName: isDay ? 'Sun' : 'Moon',
        description: 'Bright and clear conditions.',
        bgGradient: isDay 
          ? 'from-amber-400 via-orange-400 to-amber-500' 
          : 'from-slate-900 via-indigo-950 to-slate-900',
        textTone: 'text-white',
        accentColor: 'amber',
      };
    case 1:
    case 2:
    case 3:
      const labels = { 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast' };
      const icons = { 1: 'CloudSun', 2: 'CloudSun', 3: 'Cloud' };
      const nightIcons = { 1: 'CloudMoon', 2: 'CloudMoon', 3: 'Cloud' };
      return {
        label: labels[code as 1 | 2 | 3] || 'Cloudy',
        iconName: (isDay ? icons[code as 1 | 2 | 3] : nightIcons[code as 1 | 2 | 3]) || 'Cloud',
        description: code === 3 ? 'Gray, fully overcast skies.' : 'Some clouds in the sky.',
        bgGradient: isDay
          ? 'from-sky-400 via-blue-400 to-slate-300'
          : 'from-slate-950 via-slate-900 to-indigo-950',
        textTone: 'text-white',
        accentColor: 'sky',
      };
    case 45:
    case 48:
      return {
        label: 'Foggy',
        iconName: 'CloudFog',
        description: 'Reduced visibility due to mist or fog.',
        bgGradient: 'from-slate-300 via-zinc-400 to-slate-400',
        textTone: 'text-zinc-900',
        accentColor: 'zinc',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: 'Drizzle',
        iconName: 'CloudDrizzle',
        description: 'Light, steady misting rain.',
        bgGradient: 'from-blue-300 via-slate-400 to-zinc-400',
        textTone: 'text-zinc-900',
        accentColor: 'blue',
      };
    case 56:
    case 57:
      return {
        label: 'Freezing Drizzle',
        iconName: 'CloudSnow',
        description: 'Light freezing rain, slippery surfaces.',
        bgGradient: 'from-slate-300 via-cyan-100 to-blue-200',
        textTone: 'text-slate-900',
        accentColor: 'cyan',
      };
    case 61:
    case 63:
    case 65:
      const rainLabels = { 61: 'Light Rain', 63: 'Moderate Rain', 65: 'Heavy Rain' };
      return {
        label: rainLabels[code as 61 | 63 | 65] || 'Rainy',
        iconName: 'CloudRain',
        description: 'Steady rainfall. Don\'t forget your umbrella!',
        bgGradient: 'from-slate-700 via-blue-800 to-slate-900',
        textTone: 'text-white',
        accentColor: 'indigo',
      };
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        iconName: 'CloudHail',
        description: 'Rain freezing instantly on contact, severe ice hazards.',
        bgGradient: 'from-slate-600 via-cyan-900 to-slate-800',
        textTone: 'text-white',
        accentColor: 'cyan',
      };
    case 71:
    case 73:
    case 75:
      const snowLabels = { 71: 'Light Snow', 73: 'Moderate Snow', 75: 'Heavy Snow' };
      return {
        label: snowLabels[code as 71 | 73 | 75] || 'Snowy',
        iconName: 'Snowflake',
        description: 'Snow accumulation. Cozy winter wonderland.',
        bgGradient: 'from-sky-100 via-indigo-50 to-cyan-100',
        textTone: 'text-slate-850',
        accentColor: 'cyan',
      };
    case 77:
      return {
        label: 'Snow Grains',
        iconName: 'Snowflake',
        description: 'Very small, frozen white particles.',
        bgGradient: 'from-slate-200 via-indigo-100 to-slate-300',
        textTone: 'text-slate-800',
        accentColor: 'indigo',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'Rain Showers',
        iconName: 'CloudRainWind',
        description: 'Sudden, heavy bursts of rain.',
        bgGradient: 'from-indigo-900 via-slate-800 to-indigo-950',
        textTone: 'text-white',
        accentColor: 'indigo',
      };
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        iconName: 'CloudSnow',
        description: 'Brief, heavy snow flurries.',
        bgGradient: 'from-blue-100 via-slate-200 to-cyan-50',
        textTone: 'text-slate-800',
        accentColor: 'cyan',
      };
    case 95:
    case 96:
    case 99:
      return {
        label: 'Thunderstorm',
        iconName: 'CloudLightning',
        description: 'Severe weather with lightning, wind, and heavy rain.',
        bgGradient: 'from-slate-900 via-purple-950 to-indigo-950',
        textTone: 'text-white',
        accentColor: 'purple',
      };
    default:
      return {
        label: 'Unknown Condition',
        iconName: 'HelpCircle',
        description: 'No details available for this weather code.',
        bgGradient: 'from-slate-400 via-zinc-500 to-slate-500',
        textTone: 'text-white',
        accentColor: 'zinc',
      };
  }
}

export interface IntelligenceReport {
  overallRating: 'excellent' | 'good' | 'fair' | 'poor';
  overallAdvice: string;
  activities: { name: string; status: 'Perfect' | 'Good' | 'Risky' | 'Avoid'; note: string }[];
  checklist: string[];
}

export function generateIntelligence(code: number, tempC: number, windspeed: number): IntelligenceReport {
  let overallRating: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
  let overallAdvice = '';
  let activities: IntelligenceReport['activities'] = [];
  let checklist: string[] = [];

  // Group WMO weather types
  const isClear = code === 0 || code === 1;
  const isCloudy = code === 2 || code === 3;
  const isFoggy = code === 45 || code === 48;
  const isRainy = (code >= 51 && code <= 65) || (code >= 80 && code <= 82);
  const isFreezingRain = code === 56 || code === 57 || code === 66 || code === 67;
  const isSnowy = (code >= 71 && code <= 77) || (code >= 85 && code <= 86);
  const isStormy = code >= 95 && code <= 99;

  // Temperature checks
  const isExtremelyHot = tempC > 33;
  const isVeryHot = tempC > 28 && tempC <= 33;
  const isComfortable = tempC >= 15 && tempC <= 26;
  const isChilly = tempC >= 5 && tempC < 15;
  const isFreezing = tempC < 5;

  // Wind check
  const isWindy = windspeed > 25;

  // 1. Determine Overall Rating & Advice
  if (isStormy || isFreezingRain) {
    overallRating = 'poor';
    overallAdvice = isStormy 
      ? 'Severe thunderstorm hazard. Seek sturdy shelter immediately and avoid all outdoor activities.' 
      : 'Dangerous freezing rain. Ice accumulation on pathways and roads makes traveling highly hazardous.';
  } else if (isRainy) {
    overallRating = 'fair';
    overallAdvice = 'Persistent rainfall expected. Excellent for indoor planning, museum visits, or cozy cafe sessions.';
  } else if (isSnowy) {
    overallRating = tempC < 0 ? 'fair' : 'good';
    overallAdvice = 'Snowfall active. Great for winter sports or enjoying hot cocoa indoors. Dress in heavy insulating layers!';
  } else if (isFoggy) {
    overallRating = 'fair';
    overallAdvice = 'Low visibility due to dense fog. Exercise extra caution if driving or cycling today.';
  } else if (isExtremelyHot) {
    overallRating = 'fair';
    overallAdvice = 'Intense summer heat. Stay hydrated, wear light clothing, and restrict outdoor activities to early morning or late evening.';
  } else if (isComfortable && isClear && !isWindy) {
    overallRating = 'excellent';
    overallAdvice = 'Stellar outdoor conditions! Perfect temperature with clear blue skies. Highly recommended to get outside.';
  } else if (isComfortable && isCloudy) {
    overallRating = 'good';
    overallAdvice = 'Mild, comfortable weather under partial clouds. Excellent for walking, running, or outdoor errands.';
  } else if (isChilly) {
    overallRating = 'good';
    overallAdvice = 'Brisk and cool. A light-to-medium jacket will keep you perfectly comfortable.';
  } else if (isFreezing) {
    overallRating = 'fair';
    overallAdvice = 'Freezing temperatures. Frost risk is high; wear hats, gloves, and thick thermal outerwear.';
  } else {
    overallRating = 'good';
    overallAdvice = 'Pleasant, stable weather. Standard day-to-day conditions are favorable for most plans.';
  }

  // 2. Activities Analysis
  // Activity 1: Running & Cardio
  let runningStatus: 'Perfect' | 'Good' | 'Risky' | 'Avoid' = 'Good';
  let runningNote = 'Standard conditions for a jog.';
  if (isStormy || isFreezingRain || isExtremelyHot) {
    runningStatus = 'Avoid';
    runningNote = isExtremelyHot ? 'Risk of heat exhaustion.' : 'Extreme weather hazard.';
  } else if (isRainy || isSnowy) {
    runningStatus = 'Risky';
    runningNote = isRainy ? 'Slippery paths, wet gear.' : 'Cold wind chill, wet underfoot.';
  } else if (isComfortable && isClear && !isWindy) {
    runningStatus = 'Perfect';
    runningNote = 'Ideal temperature and breeze.';
  } else if (isChilly && !isRainy) {
    runningStatus = 'Good';
    runningNote = 'Wear light layers to stay warm.';
  }
  activities.push({ name: 'Outdoor Running', status: runningStatus, note: runningNote });

  // Activity 2: Driving/Commuting
  let drivingStatus: 'Perfect' | 'Good' | 'Risky' | 'Avoid' = 'Good';
  let drivingNote = 'Clear dry roads.';
  if (isFreezingRain) {
    drivingStatus = 'Avoid';
    drivingNote = 'Black ice hazard. High accident risk.';
  } else if (isStormy || isFoggy) {
    drivingStatus = 'Risky';
    drivingNote = isFoggy ? 'Extremely low visibility.' : 'Hydroplaning risk and high winds.';
  } else if (isRainy || isSnowy) {
    drivingStatus = 'Risky';
    drivingNote = 'Wet or snowy lanes require extra braking distance.';
  }
  activities.push({ name: 'Road Commute', status: drivingStatus, note: drivingNote });

  // Activity 3: Outdoor Dining / Patio
  let diningStatus: 'Perfect' | 'Good' | 'Risky' | 'Avoid' = 'Good';
  let diningNote = 'Pleasant weather for a patio lunch.';
  if (isRainy || isStormy || isSnowy || isFreezing || isExtremelyHot || isFreezingRain) {
    diningStatus = 'Avoid';
    diningNote = 'Head indoors. Atmospheric factors are highly unfavorable.';
  } else if (isWindy || isVeryHot || isChilly) {
    diningStatus = 'Risky';
    diningNote = isWindy ? 'Wind flurries might disturb setting.' : isChilly ? 'A bit too brisk for sitting still.' : 'Very warm, find some shade.';
  } else if (isComfortable && isClear) {
    diningStatus = 'Perfect';
    diningNote = 'Absolutely gorgeous patio climate.';
  }
  activities.push({ name: 'Al Fresco Dining', status: diningStatus, note: diningNote });

  // Activity 4: Laundry Drying
  let laundryStatus: 'Perfect' | 'Good' | 'Risky' | 'Avoid' = 'Good';
  let laundryNote = 'Normal drying speed.';
  if (isRainy || isStormy || isSnowy || isFreezingRain) {
    laundryStatus = 'Avoid';
    laundryNote = 'Rain/snow will wet clothes immediately.';
  } else if (isClear && isComfortable && isWindy) {
    laundryStatus = 'Perfect';
    laundryNote = 'Warm sun and strong breeze will dry items in record time!';
  } else if (isCloudy || isFoggy || isFreezing) {
    laundryStatus = 'Risky';
    laundryNote = 'High humidity or cold will stall drying.';
  }
  activities.push({ name: 'Line Drying Clothes', status: laundryStatus, note: laundryNote });

  // 3. Checklist Items
  if (isRainy) {
    checklist.push('Grab a waterproof umbrella or raincoat');
    checklist.push('Choose slip-resistant footwear');
    checklist.push('Keep windows closed at home');
  } else if (isStormy) {
    checklist.push('Unplug sensitive electronic appliances');
    checklist.push('Secure loose objects on balconies/patios');
    checklist.push('Have a backup light source (flashlight) ready');
  } else if (isSnowy) {
    checklist.push('Wear thermal insulated socks and gloves');
    checklist.push('Shovel walkways before ice solidifies');
    checklist.push('Check heating and pipes insulation');
  } else if (isFoggy) {
    checklist.push('Turn on vehicle fog lights (avoid high beams)');
    checklist.push('Allow extra time for travel schedules');
  } else if (isExtremelyHot) {
    checklist.push('Drink at least 2.5L of water today');
    checklist.push('Apply high protection SPF sunscreen');
    checklist.push('Keep indoor curtains drawn to block heat');
  } else if (isFreezing) {
    checklist.push('Dress in three layers (base, insulating, outer shell)');
    checklist.push('Protect exposed pipes from frost cracking');
    checklist.push('Check in on pets to ensure warmth');
  } else {
    checklist.push('Perfect weather to walk or cycle instead of drive');
    checklist.push('Ventilate the house to refresh indoor air');
    checklist.push('Apply daily UV skin protection');
  }

  if (isWindy && !isStormy) {
    checklist.push('Be mindful of falling leaves, branches, or dust');
    checklist.push('Secure lightweight outdoor chairs or items');
  }

  return { overallRating, overallAdvice, activities, checklist };
}

// Convert Celsius to Fahrenheit
export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

// Convert windspeed in km/h to mph or m/s
export function formatWind(kmh: number, unit: 'kmh' | 'mph' | 'ms'): string {
  if (unit === 'mph') {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  if (unit === 'ms') {
    return `${Math.round(kmh / 3.6)} m/s`;
  }
  return `${Math.round(kmh)} km/h`;
}

// Get day name (Monday, Tuesday, etc.) from date string
export function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
}

// Get short day name (Mon, Tue, etc.) from date string
export function getDayNameShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

// Format weather time to simple readable format
export function formatLocalTime(timeStr: string): string {
  const date = new Date(timeStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
