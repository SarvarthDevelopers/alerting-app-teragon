import { useState } from 'react';
import { Volume2, Zap } from 'lucide-react';
import { Switch } from '../../../app/components/ui/switch';
import { DesktopColorPickerModal } from './DesktopColorPickerModal';
import { Severity, SeverityConfig } from '../../../app/types';

interface DesktopSeveritiesSettingsProps {
  onBack: () => void;
  configs: SeverityConfig[];
  onUpdate: (configs: SeverityConfig[]) => void;
}

export function DesktopSeveritiesSettings({ configs, onUpdate }: DesktopSeveritiesSettingsProps) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [editingSeverity, setEditingSeverity] = useState<Severity | null>(null);

  const handleToggle = (id: Severity, field: 'audioAlarm' | 'flashlight') => {
    onUpdate(configs.map(s => 
      s.id === id ? { ...s, [field]: !s[field] } : s
    ));
  };

  const handleColorSave = (color: string) => {
    if (editingSeverity) {
      onUpdate(configs.map(s => 
        s.id === editingSeverity ? { ...s, color } : s
      ));
    }
  };

  return (
    <div>
      {/* Title Section - Matching Mobile Layout but using desktop spacing */}
      <div className="px-6 py-8 border-b border-border bg-background">
        <h1 className="text-3xl font-bold text-foreground">Severities</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure severities with colours & alert types
        </p>
      </div>

      {/* Severity Cards - Matching Mobile Style */}
      <div className="p-6 space-y-4">
        {configs.map((severity) => (
          <div
            key={severity.id}
            className="bg-card border border-border rounded-2xl p-6 space-y-6 hover:border-foreground/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground tracking-tight">{severity.label}</h3>
            </div>

            {/* UI Color Row */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">UI Color</span>
              <button 
                onClick={() => {
                  setEditingSeverity(severity.id);
                  setIsColorPickerOpen(true);
                }}
                className="flex items-center gap-4 bg-background border border-border rounded-xl px-4 py-2 hover:bg-muted/10 transition-colors"
              >
                <div 
                  className="w-8 h-8 rounded-lg border border-border/50" 
                  style={{ backgroundColor: severity.color }}
                />
                <span className="font-mono font-bold text-sm">{severity.color.toUpperCase()}</span>
              </button>
            </div>

            {/* Audio Alarm Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground">
                <Volume2 size={18} />
                <span className="font-bold">Audio Alarm</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {severity.audioAlarm ? 'Active' : 'Inactive'}
                </span>
                <Switch 
                  checked={severity.audioAlarm}
                  onCheckedChange={() => handleToggle(severity.id, 'audioAlarm')}
                />
              </div>
            </div>

            {/* Flashlight Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground">
                <Zap size={18} />
                <span className="font-bold">Flashlight</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {severity.flashlight ? 'Active' : 'Inactive'}
                </span>
                <Switch 
                  checked={severity.flashlight}
                  onCheckedChange={() => handleToggle(severity.id, 'flashlight')}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <DesktopColorPickerModal 
        isOpen={isColorPickerOpen}
        currentColor={configs.find(s => s.id === editingSeverity)?.color || '#000000'}
        severityLabel={configs.find(s => s.id === editingSeverity)?.label || ''}
        onClose={() => setIsColorPickerOpen(false)}
        onSave={handleColorSave}
      />
    </div>
  );
}
