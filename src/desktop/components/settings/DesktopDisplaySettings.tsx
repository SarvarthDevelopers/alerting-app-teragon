import { DisplaySettings as DisplaySettingsType, UnitSystem } from '../../../app/types';
import { Switch } from '../../../app/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../app/components/ui/select";
import { Label } from '../../../app/components/ui/label';
import { Input } from '../../../app/components/ui/input';

interface DesktopDisplaySettingsProps {
  settings: DisplaySettingsType;
  onUpdate: (settings: DisplaySettingsType) => void;
  onResetApp: () => void;
}

export function DesktopDisplaySettings({ settings, onUpdate, onResetApp }: DesktopDisplaySettingsProps) {
  const updateSetting = <K extends keyof DisplaySettingsType>(key: K, value: DisplaySettingsType[K]) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="pb-20">
      {/* Title Section */}
      <div className="px-4 py-6 border-b border-border bg-background">
        <h1 className="text-3xl font-bold text-foreground">Display & Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure app behavior and display settings
        </p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Card 1: Monitoring Preferences */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-8 shadow-sm hover:border-foreground transition-all duration-200">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground block">
                  Latest Item Count
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Number of recent measurements to display
                </p>
                <Input
                  type="number"
                  value={settings.latestNCount}
                  onChange={(e) => updateSetting('latestNCount', parseInt(e.target.value) || 0)}
                  min="5"
                  max="100"
                  className="h-12 bg-background/50 border-border/50 rounded-xl px-4 font-bold focus-visible:ring-4 focus-visible:ring-black/5 focus-visible:border-black transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground block">
                  Polling Interval (seconds)
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  How often to check for new data
                </p>
                <Input
                  type="number"
                  value={settings.pollingInterval}
                  onChange={(e) => updateSetting('pollingInterval', parseInt(e.target.value) || 0)}
                  min="1"
                  max="60"
                  className="h-12 bg-background/50 border-border/50 rounded-xl px-4 font-bold focus-visible:ring-4 focus-visible:ring-black/5 focus-visible:border-black transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Measurement Units */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-foreground transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-bold text-foreground block">
                Unit System
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose between Metric and Imperial measurements
              </p>
            </div>
            <div className="w-[240px]">
              <Select
                value={settings.unitSystem}
                onValueChange={(val) => updateSetting('unitSystem', val as UnitSystem)}
              >
                <SelectTrigger className="h-12 bg-background/50 border-border/50 rounded-xl px-4 font-bold focus-visible:ring-4 focus-visible:ring-black/5 focus-visible:border-black transition-all outline-none">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-card">
                  <SelectItem value="METRIC" className="font-bold">Metric (cm/m)</SelectItem>
                  <SelectItem value="IMPERIAL" className="font-bold">Imperial (in/ft)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Card 3: System Behavior */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-foreground transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-bold text-foreground block">
                Screen Wake Lock
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Prevents screen from sleeping during monitoring
              </p>
            </div>
            <Switch 
              checked={settings.screenWakeLock}
              onCheckedChange={(val) => updateSetting('screenWakeLock', val)}
            />
          </div>
        </div>

        {/* Card 4: Accessibility */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-foreground transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-bold text-foreground block">
                Color Blind Safe Mode
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Shifts severity colors to a high-contrast, accessible palette (Okabe-Ito)
              </p>
            </div>
            <Switch 
              checked={settings.colorBlindMode}
              onCheckedChange={(val) => updateSetting('colorBlindMode', val)}
            />
          </div>
        </div>

        {/* Card 5: Demo Controls */}
        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 shadow-sm hover:border-red-200 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-bold text-red-900 block uppercase tracking-widest">
                Developer / Demo Controls
              </Label>
              <p className="text-xs text-red-700/70 leading-relaxed">
                Restore application to factory default state. This clears all session acknowledgments.
              </p>
            </div>
            <button 
              onClick={onResetApp}
              className="h-12 px-8 rounded-xl bg-red-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Reset App State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
