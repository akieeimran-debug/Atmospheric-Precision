import React from 'react';
import { ActiveScreen, TemperatureUnit } from '../types/weather';
import { Search, Volume2, VolumeX, Compass, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  tempUnit: TemperatureUnit;
  onToggleTempUnit: () => void;
  isAudioActive: boolean;
  onToggleAudio: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  onSelectScreen,
  tempUnit,
  onToggleTempUnit,
  isAudioActive,
  onToggleAudio,
  isDarkMode,
  onToggleTheme,
  onOpenSearch,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#080C14]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] px-4 md:px-8 py-3.5 flex items-center justify-between gap-8 transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div 
        onClick={() => onSelectScreen('overview')}
        className="cursor-pointer flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
      >
        <div className="w-8 h-8 rounded-lg bg-[#0284C7]/10 dark:bg-[#00F2FE]/10 border border-[#0284C7]/30 dark:border-[#00F2FE]/30 flex items-center justify-center text-[#0284C7] dark:text-[#00F2FE] group-hover:border-[#0284C7] dark:group-hover:border-[#00F2FE] transition-all">
          <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
        </div>
        <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          ATMOSPHERIC PRECISION
        </span>
      </div>

      {/* Zone 2: 4-5 concise single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-[#94A3B8]">
        <button
          onClick={() => onSelectScreen('overview')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
            activeScreen === 'overview'
              ? 'text-[#0284C7] dark:text-[#00F2FE] font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Station Overview
          {activeScreen === 'overview' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0284C7] dark:bg-[#00F2FE] rounded-full shadow-[0_0_8px_currentColor]" />
          )}
        </button>

        <button
          onClick={() => onSelectScreen('radar')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
            activeScreen === 'radar'
              ? 'text-[#0284C7] dark:text-[#00F2FE] font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Doppler Radar
          {activeScreen === 'radar' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0284C7] dark:bg-[#00F2FE] rounded-full shadow-[0_0_8px_currentColor]" />
          )}
        </button>

        <button
          onClick={() => onSelectScreen('synoptic')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
            activeScreen === 'synoptic'
              ? 'text-[#0284C7] dark:text-[#00F2FE] font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          7-Day Synoptic
          {activeScreen === 'synoptic' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0284C7] dark:bg-[#00F2FE] rounded-full shadow-[0_0_8px_currentColor]" />
          )}
        </button>

        <button
          onClick={() => onSelectScreen('aviation')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
            activeScreen === 'aviation'
              ? 'text-[#0284C7] dark:text-[#00F2FE] font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Aviation METAR
          {activeScreen === 'aviation' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0284C7] dark:bg-[#00F2FE] rounded-full shadow-[0_0_8px_currentColor]" />
          )}
        </button>
      </nav>

      {/* Zone 3: Primary action controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Light / Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-full border border-slate-200 dark:border-white/[0.08] bg-slate-100/80 dark:bg-white/[0.04] text-slate-700 dark:text-[#94A3B8] hover:text-[#0284C7] dark:hover:text-white transition-all shadow-xs"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-[#FB923C]" /> : <Moon className="w-4 h-4 text-[#0284C7]" />}
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleAudio}
          title={isAudioActive ? 'Mute atmospheric soundscape' : 'Enable ambient weather soundscape'}
          className={`p-2 rounded-full border transition-all ${
            isAudioActive
              ? 'bg-[#0284C7]/15 dark:bg-[#00F2FE]/15 border-[#0284C7]/50 dark:border-[#00F2FE]/50 text-[#0284C7] dark:text-[#00F2FE]'
              : 'bg-slate-100/80 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {isAudioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Temperature unit switch */}
        <div className="flex items-center bg-slate-100 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-white/[0.08] rounded-full p-0.5 text-xs font-mono">
          <button
            onClick={() => tempUnit !== 'celsius' && onToggleTempUnit()}
            className={`px-2.5 py-1 rounded-full transition-all ${
              tempUnit === 'celsius'
                ? 'bg-[#0284C7] dark:bg-[#00F2FE] text-white dark:text-[#080C14] font-bold shadow-xs'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            °C
          </button>
          <button
            onClick={() => tempUnit !== 'fahrenheit' && onToggleTempUnit()}
            className={`px-2.5 py-1 rounded-full transition-all ${
              tempUnit === 'fahrenheit'
                ? 'bg-[#0284C7] dark:bg-[#00F2FE] text-white dark:text-[#080C14] font-bold shadow-xs'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            °F
          </button>
        </div>

        {/* Station Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-white/[0.05] hover:bg-slate-200/90 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.1] text-xs font-medium text-slate-800 dark:text-[#DAE2FD] transition-all hover:border-[#0284C7]/40 dark:hover:border-[#00F2FE]/40"
        >
          <Search className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#00F2FE]" />
          <span className="hidden sm:inline">Search World Cities</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded text-slate-500 dark:text-[#94A3B8]">
            /
          </kbd>
        </button>
      </div>
    </header>
  );
};
