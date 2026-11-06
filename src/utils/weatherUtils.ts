import { TemperatureUnit, SpeedUnit, PressureUnit } from '../types/weather';

export function formatTemp(tempC: number, unit: TemperatureUnit): string {
  if (unit === 'fahrenheit') {
    const f = Math.round((tempC * 9) / 5 + 32);
    return `${f}°`;
  }
  return `${Math.round(tempC)}°`;
}

export function formatTempNumber(tempC: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return Math.round((tempC * 9) / 5 + 32);
  }
  return Math.round(tempC);
}

export function formatSpeed(speedKmh: number, unit: SpeedUnit): string {
  if (unit === 'mph') {
    const mph = Math.round(speedKmh * 0.621371);
    return `${mph} mph`;
  }
  if (unit === 'knots') {
    const kts = Math.round(speedKmh * 0.539957);
    return `${kts} kts`;
  }
  if (unit === 'ms') {
    const ms = (speedKmh / 3.6).toFixed(1);
    return `${ms} m/s`;
  }
  return `${Math.round(speedKmh)} km/h`;
}

export function formatPressure(hpa: number, unit: PressureUnit): string {
  if (unit === 'inhg') {
    const inhg = (hpa * 0.02953).toFixed(2);
    return `${inhg} inHg`;
  }
  return `${Math.round(hpa)} hPa`;
}

export function getWindDirectionCardinal(deg: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(((deg % 360) / 22.5)) % 16;
  return directions[index];
}

export function getBeaufortScale(speedKmh: number): { scale: number; description: string } {
  if (speedKmh < 1) return { scale: 0, description: 'Calm' };
  if (speedKmh <= 5) return { scale: 1, description: 'Light air' };
  if (speedKmh <= 11) return { scale: 2, description: 'Light breeze' };
  if (speedKmh <= 19) return { scale: 3, description: 'Gentle breeze' };
  if (speedKmh <= 28) return { scale: 4, description: 'Moderate breeze' };
  if (speedKmh <= 38) return { scale: 5, description: 'Fresh breeze' };
  if (speedKmh <= 49) return { scale: 6, description: 'Strong breeze' };
  if (speedKmh <= 61) return { scale: 7, description: 'Near gale' };
  if (speedKmh <= 74) return { scale: 8, description: 'Gale' };
  if (speedKmh <= 88) return { scale: 9, description: 'Strong gale' };
  if (speedKmh <= 102) return { scale: 10, description: 'Storm' };
  if (speedKmh <= 117) return { scale: 11, description: 'Violent storm' };
  return { scale: 12, description: 'Hurricane force' };
}

export function getUvCategory(uv: number): { label: string; color: string; burnTimeMin: number | null } {
  if (uv < 3) return { label: 'Low', color: '#38BDF8', burnTimeMin: null };
  if (uv < 6) return { label: 'Moderate', color: '#00F2FE', burnTimeMin: 45 };
  if (uv < 8) return { label: 'High', color: '#FB923C', burnTimeMin: 25 };
  if (uv < 11) return { label: 'Very High', color: '#F97316', burnTimeMin: 15 };
  return { label: 'Extreme', color: '#EF4444', burnTimeMin: 10 };
}

export function getAqiCategory(aqi: number): { label: string; color: string; advice: string } {
  if (aqi <= 50) return { label: 'Good', color: '#10B981', advice: 'Air quality is satisfactory with little or no risk.' };
  if (aqi <= 100) return { label: 'Moderate', color: '#FBBF24', advice: 'Acceptable; sensitive individuals may experience mild symptoms.' };
  if (aqi <= 150) return { label: 'Sensitive', color: '#FB923C', advice: 'Members of sensitive groups may experience health effects.' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#F87171', advice: 'Everyone may begin to experience health effects.' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#A855F7', advice: 'Health alert: serious health effects for all persons.' };
  return { label: 'Hazardous', color: '#881337', advice: 'Health warning of emergency conditions.' };
}
