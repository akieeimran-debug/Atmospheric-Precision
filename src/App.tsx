import React, { useState, useEffect } from 'react';
import { 
  WeatherStation, 
  ActiveScreen, 
  TemperatureUnit, 
  SpeedUnit, 
  PressureUnit 
} from './types/weather';
import { STATIONS } from './data/mockWeatherData';
import { ambientAudio } from './utils/ambientAudio';
import { Header } from './components/Header';
import { StationOverview } from './components/StationOverview';
import { RadarScreen } from './components/RadarScreen';
import { SynopticScreen } from './components/SynopticScreen';
import { AviationScreen } from './components/AviationScreen';
import { LocationSearchModal } from './components/LocationSearchModal';

export default function App() {
  const [stations, setStations] = useState<WeatherStation[]>(STATIONS);
  const [selectedStation, setSelectedStation] = useState<WeatherStation>(STATIONS[0]);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('overview');
  const [tempUnit, setTempUnit] = useState<TemperatureUnit>('celsius');
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>('kmh');
  const [pressureUnit, setPressureUnit] = useState<PressureUnit>('hpa');
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(0);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  
  // Light Mode is default as requested ("make it in light mode")
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Sync dark class on root documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Toggle ambient audio synthesizer
  const handleToggleAudio = () => {
    const newState = ambientAudio.toggle();
    setIsAudioActive(newState);
  };

  // Toggle theme
  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Toggle temperature unit (and sync speed/pressure units)
  const handleToggleTempUnit = () => {
    setTempUnit(prev => {
      const next = prev === 'celsius' ? 'fahrenheit' : 'celsius';
      setSpeedUnit(next === 'celsius' ? 'kmh' : 'mph');
      setPressureUnit(next === 'celsius' ? 'hpa' : 'inhg');
      return next;
    });
  };

  // Add new real-time weather station from search
  const handleAddNewStation = (newStation: WeatherStation) => {
    setStations(prev => {
      const exists = prev.find(s => s.id === newStation.id);
      if (exists) {
        return prev.map(s => s.id === newStation.id ? newStation : s);
      }
      return [newStation, ...prev];
    });
    setSelectedStation(newStation);
    setSelectedHourIndex(0);
  };

  // Global hotkey: '/' to trigger search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans relative transition-colors duration-200">
      {/* Subtle Ambient Background Mesh */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-30 z-0 transition-opacity duration-1000"
        style={{
          backgroundImage: isDarkMode
            ? 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 242, 254, 0.08), transparent 70%)'
            : 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(2, 132, 199, 0.07), transparent 70%)',
        }}
      />

      {/* Top Bar matching Top Bar Contract with Light Mode & Search */}
      <Header
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        tempUnit={tempUnit}
        onToggleTempUnit={handleToggleTempUnit}
        isAudioActive={isAudioActive}
        onToggleAudio={handleToggleAudio}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Screen Views */}
      <div className="flex-1 relative z-10">
        {activeScreen === 'overview' && (
          <StationOverview
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={(st) => {
              setSelectedStation(st);
              setSelectedHourIndex(0);
            }}
            tempUnit={tempUnit}
            speedUnit={speedUnit}
            pressureUnit={pressureUnit}
            selectedHourIndex={selectedHourIndex}
            onSelectHour={setSelectedHourIndex}
            onOpenRadar={() => setActiveScreen('radar')}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeScreen === 'radar' && (
          <RadarScreen
            station={selectedStation}
            stations={stations}
            onSelectStation={(st) => {
              setSelectedStation(st);
              setSelectedHourIndex(0);
            }}
            tempUnit={tempUnit}
            onBack={() => setActiveScreen('overview')}
          />
        )}

        {activeScreen === 'synoptic' && (
          <SynopticScreen
            station={selectedStation}
            tempUnit={tempUnit}
            onBack={() => setActiveScreen('overview')}
          />
        )}

        {activeScreen === 'aviation' && (
          <AviationScreen
            station={selectedStation}
            stations={stations}
            onSelectStation={(st) => {
              setSelectedStation(st);
              setSelectedHourIndex(0);
            }}
            tempUnit={tempUnit}
            onBack={() => setActiveScreen('overview')}
          />
        )}
      </div>

      {/* Global Location / Coordinate Search Modal with Real-time World Weather */}
      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        stations={stations}
        onSelectStation={(st) => {
          setSelectedStation(st);
          setSelectedHourIndex(0);
        }}
        onAddStation={handleAddNewStation}
        tempUnit={tempUnit}
      />

      {/* Clean Quiet Footer */}
      <footer className="w-full border-t border-slate-200/80 dark:border-white/[0.06] bg-white/70 dark:bg-[#060E20]/60 backdrop-blur-md px-6 py-4 mt-auto relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 dark:text-[#475569]">
        <div className="flex items-center gap-2">
          <span className="text-slate-800 dark:text-[#94A3B8] font-semibold">Atmospheric Precision</span>
          <span>·</span>
          <span>Real-Time Global Synoptic Forecasting</span>
          <span>·</span>
          <span>Open-Meteo High-Res Grid</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveScreen('overview')}
            className="hover:text-[#0284C7] dark:hover:text-[#00F2FE] transition-colors"
          >
            Observatory Cockpit
          </button>
          <button 
            onClick={() => setActiveScreen('radar')}
            className="hover:text-[#0284C7] dark:hover:text-[#00F2FE] transition-colors"
          >
            Doppler Sweeper
          </button>
          <button 
            onClick={() => setActiveScreen('aviation')}
            className="hover:text-[#0284C7] dark:hover:text-[#00F2FE] transition-colors"
          >
            Aviation Terminal
          </button>
        </div>
      </footer>
    </div>
  );
}
