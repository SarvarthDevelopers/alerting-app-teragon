import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Palette, Monitor, LogOut } from 'lucide-react';
import { SettingsListItem } from './SettingsList';
import { AnomalyTypesSettings } from './AnomalyTypesSettings';
import { DisplaySettings } from './DisplaySettings';
import { SeveritiesSettings } from './SeveritiesSettings';

type SettingsScreen = 'main' | 'severities' | 'anomaly-types' | 'display';

import { AnomalyConfig, SeverityConfig, DisplaySettings as DisplaySettingsType } from '../../types';

interface SettingsMainProps {
  onSubViewChange?: (isSubView: boolean) => void;
  requestBack?: number;
  onBackProcessed?: () => void;
  anomalyConfigs: AnomalyConfig[];
  setAnomalyConfigs: (configs: AnomalyConfig[]) => void;
  severityConfigs: SeverityConfig[];
  setSeverityConfigs: (configs: SeverityConfig[]) => void;
  displaySettings: DisplaySettingsType;
  setDisplaySettings: (settings: DisplaySettingsType) => void;
}

export function SettingsMain({ 
  onSubViewChange, 
  requestBack, 
  onBackProcessed,
  anomalyConfigs,
  setAnomalyConfigs,
  severityConfigs,
  setSeverityConfigs,
  displaySettings,
  setDisplaySettings
}: SettingsMainProps) {
  const [activeScreen, setActiveScreen] = useState<SettingsScreen>('main');

  useEffect(() => {
    if (requestBack && requestBack > 0 && activeScreen !== 'main') {
      handleScreenChange('main');
      onBackProcessed?.();
    }
  }, [requestBack]);

  const handleScreenChange = (screen: SettingsScreen) => {
    setActiveScreen(screen);
    onSubViewChange?.(screen !== 'main');
  };

  if (activeScreen === 'severities') {
    return (
      <SeveritiesSettings 
        onBack={() => handleScreenChange('main')} 
        configs={severityConfigs}
        onUpdate={setSeverityConfigs}
      />
    );
  }

  if (activeScreen === 'anomaly-types') {
    return (
      <AnomalyTypesSettings 
        onBack={() => handleScreenChange('main')} 
        configs={anomalyConfigs}
        onUpdate={setAnomalyConfigs}
      />
    );
  }

  if (activeScreen === 'display') {
    return (
      <DisplaySettings 
        onBack={() => handleScreenChange('main')} 
        settings={displaySettings}
        onUpdate={setDisplaySettings}
      />
    );
  }

  return (
    <div>
      <div className="border-b border-border">
        <div className="px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure app, network, and user preferences
          </p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        <SettingsListItem
          icon={<Info size={20} />}
          title="Severities"
          description="Configure severities with colours & alerts"
          onClick={() => handleScreenChange('severities')}
        />

        <SettingsListItem
          icon={<Palette size={20} />}
          title="Anomaly Types"
          description="Assign severity to defect types"
          onClick={() => handleScreenChange('anomaly-types')}
        />

        <SettingsListItem
          icon={<Monitor size={20} />}
          title="Display & Preferences"
          description="App behavior and display settings"
          onClick={() => handleScreenChange('display')}
        />

        <div className="pt-4">
          <button 
            className="w-full bg-background border border-foreground rounded-xl p-4 flex items-center justify-center font-bold text-foreground active:bg-muted/20 transition-colors"
            onClick={() => console.log('Logging out...')}
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="px-4 pt-12 pb-8 text-center opacity-50">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Version 1.0.0</span> • Teragon Alerting System
        </p>
      </div>
    </div>
  );
}
