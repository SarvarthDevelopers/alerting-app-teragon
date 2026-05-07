import { useState } from 'react';
import { displaySettings as defaultSettings } from '../../data/settingsData';
import { DisplaySettings as DisplaySettingsType, UnitSystem } from '../../types';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { motion } from 'motion/react';

interface DisplaySettingsProps {
  onBack: () => void;
  settings: DisplaySettingsType;
  onUpdate: (settings: DisplaySettingsType) => void;
}

export function DisplaySettings({ onBack, settings: initialSettings, onUpdate }: DisplaySettingsProps) {
  const [settings, setSettings] = useState<DisplaySettingsType>(initialSettings);

  const handleSave = () => {
    onUpdate(settings);
    onBack();
  };

  return (
    <div>
      {/* Title Section */}
      <div className="px-6 py-8 border-b border-border bg-background">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Display & Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure app behavior and display settings
        </p>
      </div>

      <div className="px-4 py-6 space-y-6 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-8 shadow-sm hover:border-foreground transition-all duration-200"
        >
          {/* Latest Item Count */}
          <div className="space-y-3">
            <div>
              <label className="text-lg font-bold text-foreground block">
                Latest Item Count
              </label>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Number of recent measurements to display in each system view
              </p>
            </div>
            <input
              type="number"
              value={settings.latestNCount}
              onChange={(e) => setSettings({ ...settings, latestNCount: parseInt(e.target.value) || 0 })}
              min="5"
              max="100"
              className="w-full px-4 h-14 bg-background border border-border rounded-xl text-foreground font-bold text-lg focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Polling Interval */}
          <div className="space-y-3">
            <div>
              <label className="text-lg font-bold text-foreground block">
                Polling Interval (seconds)
              </label>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                How often to check for new measurements
              </p>
            </div>
            <input
              type="number"
              value={settings.pollingInterval}
              onChange={(e) => setSettings({ ...settings, pollingInterval: parseInt(e.target.value) || 0 })}
              min="1"
              max="60"
              className="w-full px-4 h-14 bg-background border border-border rounded-xl text-foreground font-bold text-lg focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Unit System */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-lg font-bold text-foreground whitespace-nowrap">
              Unit System
            </label>
            <div className="w-[200px]">
              <Select
                value={settings.unitSystem}
                onValueChange={(val) => setSettings({ ...settings, unitSystem: val as UnitSystem })}
              >
                <SelectTrigger className="h-14 bg-background border-border rounded-xl px-4 font-bold text-foreground">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="METRIC" className="font-bold">Metric (cm/m)</SelectItem>
                  <SelectItem value="IMPERIAL" className="font-bold">Imperial (in/ft)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Screen Wake Lock */}
          <div className="flex items-start justify-between gap-4 pt-2 border-t border-border/50">
            <div className="flex-1">
              <label className="text-lg font-bold text-foreground block">
                Screen Wake Lock
              </label>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Prevents screen from sleeping during monitoring
              </p>
            </div>
            <div className="pt-1">
              <Switch 
                checked={settings.screenWakeLock}
                onCheckedChange={() => setSettings({ ...settings, screenWakeLock: !settings.screenWakeLock })}
              />
            </div>
          </div>
        </motion.div>

        <button 
          onClick={handleSave}
          className="w-full h-16 bg-[#1a1a1a] text-white rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform uppercase tracking-wider"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
