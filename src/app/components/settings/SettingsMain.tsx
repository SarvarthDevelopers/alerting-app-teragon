import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Palette, Monitor, LogOut } from 'lucide-react';
import { SettingsListItem } from './SettingsList';
import { AnomalyTypesSettings } from './AnomalyTypesSettings';
import { DisplaySettings } from './DisplaySettings';
import { SeveritiesSettings } from './SeveritiesSettings';
import { SavedToast } from '../ui/SavedToast';

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
  onLogout: () => void;
  onResetApp: () => void;
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
  setDisplaySettings,
  onLogout,
  onResetApp
}: SettingsMainProps) {
  const [activeScreen, setActiveScreen] = useState<SettingsScreen>('main');
  const [showToast, setShowToast] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const triggerToast = () => {
    clearTimeout(toastTimerRef.current);
    setShowToast(true);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 2500);
  };

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
      <>
        <SeveritiesSettings 
          onBack={() => handleScreenChange('main')} 
          configs={severityConfigs}
          onUpdate={(configs) => { setSeverityConfigs(configs); triggerToast(); }}
        />
        <SavedToast visible={showToast} />
      </>
    );
  }

  if (activeScreen === 'anomaly-types') {
    return (
      <>
        <AnomalyTypesSettings 
          onBack={() => handleScreenChange('main')} 
          configs={anomalyConfigs}
          onUpdate={(configs) => { setAnomalyConfigs(configs); triggerToast(); }}
        />
        <SavedToast visible={showToast} />
      </>
    );
  }

  if (activeScreen === 'display') {
    return (
      <>
        <DisplaySettings 
          onBack={() => handleScreenChange('main')} 
          settings={displaySettings}
          onUpdate={(settings) => { setDisplaySettings(settings); triggerToast(); }}
          onResetApp={() => { onResetApp(); triggerToast(); }}
        />
        <SavedToast visible={showToast} />
      </>
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
          {/* Confirmation question — slides in above via CSS grid */}
          <div
            style={{ display: 'grid', gridTemplateRows: isConfirmingLogout ? '1fr' : '0fr' }}
            className="transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          >
            <div className="overflow-hidden">
              <p className="text-center text-sm font-medium text-foreground pb-3">
                Are you sure you want to log out?
              </p>
            </div>
          </div>

          {/* Main button — becomes CANCEL in confirmation mode */}
          <button
            className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 bg-background border border-foreground text-foreground active:bg-muted/20"
            onClick={() => {
              if (!isConfirmingLogout) {
                setIsConfirmingLogout(true);
              } else {
                setIsConfirmingLogout(false);
              }
            }}
          >
            {isConfirmingLogout ? 'CANCEL' : 'Log Out'}
          </button>

          {/* Confirm Logout button — slides in below via CSS grid */}
          <div
            style={{ display: 'grid', gridTemplateRows: isConfirmingLogout ? '1fr' : '0fr' }}
            className="transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          >
            <div className="overflow-hidden">
              <button
                className="w-full mt-3 py-4 rounded-xl font-bold text-lg bg-red-500 text-white border border-red-500 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
                onClick={() => {
                  onLogout();
                  setIsConfirmingLogout(false);
                }}
              >
                LOG OUT
              </button>
            </div>
          </div>
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
