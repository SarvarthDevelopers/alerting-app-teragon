import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { displaySettings as defaultSettings } from '../../data/settingsData';
import { DisplaySettings as DisplaySettingsType, UnitSystem } from '../../types';

interface DisplaySettingsProps {
  onBack: () => void;
}

export function DisplaySettings({ onBack }: DisplaySettingsProps) {
  const [settings, setSettings] = useState<DisplaySettingsType>(defaultSettings);

  return (
    <div className="bg-background">
      <div className="sticky top-0 bg-card border-b border-border z-10">
        <div className="px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back</span>
        </button>
          <h1 className="text-2xl font-bold text-foreground">Display & Preferences</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure app behavior and display options
          </p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Latest Items Count
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Number of recent measurements to display in each system view
            </p>
            <input
              type="number"
              value={settings.latestNCount}
              onChange={(e) => setSettings({ ...settings, latestNCount: parseInt(e.target.value) })}
              min="5"
              max="100"
              className="w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground font-medium"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Polling Interval (seconds)
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              How often to check for new measurements
            </p>
            <input
              type="number"
              value={settings.pollingInterval}
              onChange={(e) => setSettings({ ...settings, pollingInterval: parseInt(e.target.value) })}
              min="1"
              max="60"
              className="w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground font-medium"
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-foreground">Screen Wake Lock</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Prevent screen from sleeping during monitoring
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, screenWakeLock: !settings.screenWakeLock })}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  settings.screenWakeLock ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                    settings.screenWakeLock ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Unit System
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['METRIC', 'IMPERIAL'] as UnitSystem[]).map(unit => (
                <button
                  key={unit}
                  onClick={() => setSettings({ ...settings, unitSystem: unit })}
                  className={`py-3 rounded-lg font-semibold transition-all ${
                    settings.unitSystem === unit
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  }`}
                >
                  {unit === 'METRIC' ? 'Metric (mm)' : 'Imperial (in/ft)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:opacity-90 transition-opacity">
          SAVE CHANGES
        </button>
      </div>
    </div>
  );
}
