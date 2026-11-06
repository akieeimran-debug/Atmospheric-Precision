import React from 'react';
import { WeatherStation, TemperatureUnit, SpeedUnit, PressureUnit } from '../types/weather';
import { LeftRail } from './LeftRail';
import { CenterStage } from './CenterStage';
import { RightRail } from './RightRail';

interface StationOverviewProps {
  stations: WeatherStation[];
  selectedStation: WeatherStation;
  onSelectStation: (station: WeatherStation) => void;
  tempUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
  pressureUnit: PressureUnit;
  selectedHourIndex: number;
  onSelectHour: (index: number) => void;
  onOpenRadar: () => void;
  onOpenSearch: () => void;
}

export const StationOverview: React.FC<StationOverviewProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  tempUnit,
  speedUnit,
  pressureUnit,
  selectedHourIndex,
  onSelectHour,
  onOpenRadar,
  onOpenSearch,
}) => {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Left Rail: Multi-location observatory switching & search */}
        <LeftRail
          stations={stations}
          selectedStation={selectedStation}
          onSelectStation={onSelectStation}
          tempUnit={tempUnit}
          onOpenSearch={onOpenSearch}
        />

        {/* Center Stage: Primary atmospheric conditions, temporal charts, 7-day outlook */}
        <CenterStage
          station={selectedStation}
          tempUnit={tempUnit}
          speedUnit={speedUnit}
          pressureUnit={pressureUnit}
          selectedHourIndex={selectedHourIndex}
          onSelectHour={onSelectHour}
          onOpenRadar={onOpenRadar}
        />

        {/* Right Rail: Deep environmental telemetry, live mini-radar, AQI, UV, Barometer */}
        <RightRail
          station={selectedStation}
          tempUnit={tempUnit}
          pressureUnit={pressureUnit}
          speedUnit={speedUnit}
          onOpenRadar={onOpenRadar}
        />
      </div>
    </div>
  );
};
