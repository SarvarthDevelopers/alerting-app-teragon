import { DisplaySettings as DisplaySettingsType, UnitSystem } from '../../types';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface DisplaySettingsProps {
  onBack: () => void;
  settings: DisplaySettingsType;
  onUpdate: (settings: DisplaySettingsType) => void;
  onResetApp: () => void;
}

export function DisplaySettings({ settings, onUpdate, onResetApp }: DisplaySettingsProps) {
  const updateSetting = <K extends keyof DisplaySettingsType>(key: K, value: DisplaySettingsType[K]) => {
    onUpdate({ ...settings, [key]: value });
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

      <div className="px-4 py-6 space-y-4 pb-32">
        {/* Card 1: Monitoring Preferences */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-8 shadow-sm hover:border-foreground transition-all duration-200">
          <div className="space-y-6">
            {/* Latest Item Count */}
            <div className="space-y-3">
              <div>
                <label className="text-lg font-bold text-foreground block">
                  Latest Item Count
                </label>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Number of recent measurements to display
                </p>
              </div>
              <input
                type="number"
                value={settings.latestNCount}
                onChange={(e) => updateSetting('latestNCount', parseInt(e.target.value) || 0)}
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
                onChange={(e) => updateSetting('pollingInterval', parseInt(e.target.value) || 0)}
                min="1"
                max="60"
                className="w-full px-4 h-14 bg-background border border-border rounded-xl text-foreground font-bold text-lg focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Measurement Units */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-foreground transition-all duration-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="text-lg font-bold text-foreground block">
                Unit System
              </label>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Metric or Imperial measurements
              </p>
            </div>
            <div className="w-[220px]">
              <Select
                value={settings.unitSystem}
                onValueChange={(val) => updateSetting('unitSystem', val as UnitSystem)}
              >
                <SelectTrigger className="w-full h-14 bg-background border-border rounded-xl px-4 font-bold text-foreground">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="METRIC" className="font-bold">Metric (cm/m)</SelectItem>
                  <SelectItem value="IMPERIAL" className="font-bold">Imperial (in/ft)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Card 3: System Behavior */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-foreground transition-all duration-200">
          <div className="flex items-start justify-between gap-4">
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
                onCheckedChange={(val) => updateSetting('screenWakeLock', val)}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Accessibility */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-foreground transition-all duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <label className="text-lg font-bold text-foreground block">
                Color Blind Safe Mode
              </label>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                High-contrast, accessible palette (Okabe-Ito)
              </p>
            </div>
            <div className="pt-1">
              <Switch 
                checked={settings.colorBlindMode}
                onCheckedChange={(val) => updateSetting('colorBlindMode', val)}
              />
            </div>
          </div>
        </div>

        {/* Card 5: Demo Controls */}
        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 shadow-sm hover:border-red-200 transition-all duration-200">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-black text-red-900 block uppercase tracking-widest">
                Developer / Mock Data Controls
              </label>
              <p className="text-xs text-red-700/70 mt-1 leading-relaxed">
                Reset local mock application state to factory defaults. This clears all session-based acknowledgments for this demo environment.
              </p>
            </div>
            <button 
              onClick={onResetApp}
              className="w-full h-14 bg-red-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all"
            >
              Reset Mock App State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
