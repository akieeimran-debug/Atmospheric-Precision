import React from 'react';
import { WeatherConditionType } from '../types/weather';
import { 
  Sun, 
  Moon, 
  CloudSun, 
  CloudMoon, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  Sparkles,
  Wind
} from 'lucide-react';

interface WeatherIconProps {
  condition: WeatherConditionType;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className = 'w-6 h-6', size = 24 }) => {
  switch (condition) {
    case 'clear-day':
      return <Sun className={`${className} text-[#FB923C]`} size={size} strokeWidth={1.5} />;
    case 'clear-night':
      return <Moon className={`${className} text-[#7BD0FF]`} size={size} strokeWidth={1.5} />;
    case 'partly-cloudy-day':
      return <CloudSun className={`${className} text-[#00F2FE]`} size={size} strokeWidth={1.5} />;
    case 'partly-cloudy-night':
      return <CloudMoon className={`${className} text-[#7BD0FF]`} size={size} strokeWidth={1.5} />;
    case 'cloudy':
      return <Cloud className={`${className} text-[#94A3B8]`} size={size} strokeWidth={1.5} />;
    case 'fog':
      return <CloudFog className={`${className} text-[#94A3B8]`} size={size} strokeWidth={1.5} />;
    case 'drizzle':
      return <CloudDrizzle className={`${className} text-[#38BDF8]`} size={size} strokeWidth={1.5} />;
    case 'rain':
    case 'heavy-rain':
      return <CloudRain className={`${className} text-[#00F2FE]`} size={size} strokeWidth={1.5} />;
    case 'thunderstorm':
      return <CloudLightning className={`${className} text-[#FB923C]`} size={size} strokeWidth={1.5} />;
    case 'snow':
    case 'flurries':
      return <Snowflake className={`${className} text-[#E0FDFF]`} size={size} strokeWidth={1.5} />;
    case 'aurora':
      return <Sparkles className={`${className} text-[#00F2FE] animate-pulse`} size={size} strokeWidth={1.5} />;
    default:
      return <Wind className={`${className} text-[#94A3B8]`} size={size} strokeWidth={1.5} />;
  }
};
