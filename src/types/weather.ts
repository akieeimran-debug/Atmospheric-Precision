export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type SpeedUnit = 'kmh' | 'mph' | 'knots' | 'ms';
export type PressureUnit = 'hpa' | 'inhg';

export type WeatherConditionType = 
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy-rain'
  | 'snow'
  | 'flurries'
  | 'thunderstorm'
  | 'aurora';

export interface HourlyForecast {
  time: string; // e.g. "00:00", "01:00"
  timestamp: number;
  tempC: number;
  feelsLikeC: number;
  condition: WeatherConditionType;
  conditionLabel: string;
  precipProb: number; // 0-100%
  precipVolumeMm: number; // mm/h
  windSpeedKmh: number;
  windDirectionDeg: number;
  windGustKmh: number;
  humidity: number; // 0-100%
  dewPointC: number;
  pressureHpa: number;
  uvIndex: number;
  cloudCoverPct: number;
}

export interface DailyForecast {
  date: string; // e.g. "2026-11-06"
  dayName: string; // e.g. "Fri", "Sat"
  condition: WeatherConditionType;
  conditionLabel: string;
  tempMaxC: number;
  tempMinC: number;
  precipProb: number;
  precipVolumeMm: number;
  humidity: number;
  windSpeedMaxKmh: number;
  windDirectionDeg: number;
  pressureHpa: number;
  uvMax: number;
  sunrise: string;
  sunset: string;
  summary: string;
}

export interface AirQuality {
  aqi: number; // 0-500 US AQI
  category: 'Good' | 'Moderate' | 'Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm25: number; // µg/m³
  pm10: number; // µg/m³
  o3: number; // ppb
  no2: number; // ppb
  so2: number; // ppb
  co: number; // ppm
}

export interface SolarLunarData {
  dawn: string;
  sunrise: string;
  solarNoon: string;
  sunset: string;
  dusk: string;
  dayLength: string;
  sunAltitudeDeg: number;
  moonPhase: 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';
  moonIlluminationPct: number;
}

export interface WeatherAlert {
  id: string;
  severity: 'advisory' | 'watch' | 'warning' | 'emergency';
  title: string;
  agency: string;
  effective: string;
  expires: string;
  description: string;
  instruction: string;
}

export interface AviationMETAR {
  raw: string;
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  cloudBaseFt: number;
  visibilityKm: number;
  altimeterInHg: number;
  windComponent: {
    runwayHeading: number;
    headwindKnots: number;
    crosswindKnots: number;
  };
}

export interface WeatherStation {
  id: string;
  callsign: string;
  name: string;
  region: string;
  country: string;
  coordinates: {
    lat: number;
    lon: number;
    elevationM: number;
  };
  timezone: string;
  current: {
    tempC: number;
    feelsLikeC: number;
    tempMinC: number;
    tempMaxC: number;
    dewPointC: number;
    condition: WeatherConditionType;
    conditionLabel: string;
    description: string;
    humidity: number;
    pressureHpa: number;
    pressureTrend: 'rising' | 'falling' | 'steady';
    pressureDelta3h: number;
    windSpeedKmh: number;
    windGustKmh: number;
    windDirectionDeg: number;
    visibilityKm: number;
    cloudBaseM: number;
    cloudCoverPct: number;
    uvIndex: number;
    uvCategory: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
    precipProb: number;
    precipCurrentMm: number;
    precipAccum24hMm: number;
    airQuality: AirQuality;
    solarLunar: SolarLunarData;
    auroraKp?: number;
  };
  alert?: WeatherAlert;
  metar: AviationMETAR;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  pressureHistory12h: { time: string; pressureHpa: number }[];
}

export type ActiveScreen = 'overview' | 'radar' | 'synoptic' | 'aviation';
export type RadarLayer = 'precipitation' | 'wind' | 'clouds' | 'temperature';
