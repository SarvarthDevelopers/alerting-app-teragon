import { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Zap, ZapOff, ChevronDown } from 'lucide-react';
import { anomalyConfigs } from '../../data/settingsData';
import { AnomalyConfig, Severity } from '../../types';
import { ColorPickerModal } from './ColorPickerModal';
import { motion } from 'motion/react';

interface AnomalyTypesSettingsProps {
  onBack: () => void;
}

export function AnomalyTypesSettings({ onBack }: AnomalyTypesSettingsProps) {
  const [configs, setConfigs] = useState<AnomalyConfig[]>(anomalyConfigs);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);

  const toggleAudioAlarm = (id: string) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, audioAlarm: !c.audioAlarm } : c));
  };

  const toggleFlashlightAlarm = (id: string) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, flashlightAlarm: !c.flashlightAlarm } : c));
  };

  const toggleActive = (id: string) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const updateSeverity = (id: string, severity: Severity) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, defaultSeverity: severity } : c));
  };

  const updateColor = (id: string, color: string) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, color } : c));
  };

  const openColorPicker = (id: string) => {
    setEditingConfigId(id);
    setColorPickerOpen(true);
  };

  const getSeverityColor = (severity: Severity): string => {
    switch (severity) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      case 'LOW': return '#3b82f6';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-card border-b border-border z-10">
        <div className="px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors mb-3"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-foreground">Anomaly Types</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure defect detection and alert behavior
          </p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {configs.map((config, index) => (
          <motion.div
            key={config.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl p-5 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">{config.displayName}</h3>
                <p className="text-sm text-muted-foreground font-mono mt-0.5">{config.sourceTypeKey}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Active</span>
                <button
                  onClick={() => toggleActive(config.id)}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    config.isActive ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                      config.isActive ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Default Severity
                </label>
                <div className="relative">
                  <select
                    value={config.defaultSeverity}
                    onChange={(e) => updateSeverity(config.id, e.target.value as Severity)}
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground font-semibold appearance-none cursor-pointer pr-10"
                    style={{
                      backgroundColor: getSeverityColor(config.defaultSeverity),
                      color: '#ffffff',
                      borderColor: getSeverityColor(config.defaultSeverity)
                    }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                  <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  UI Color
                </label>
                <button
                  onClick={() => openColorPicker(config.id)}
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg flex items-center gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg border-2 border-border flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="font-mono text-sm text-foreground">{config.color}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => toggleAudioAlarm(config.id)}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                  config.audioAlarm
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {config.audioAlarm ? <Volume2 size={18} /> : <VolumeX size={18} />}
                Audio Alarm
              </button>
              <button
                onClick={() => toggleFlashlightAlarm(config.id)}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                  config.flashlightAlarm
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {config.flashlightAlarm ? <Zap size={18} /> : <ZapOff size={18} />}
                Flashlight
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <ColorPickerModal
        isOpen={colorPickerOpen}
        currentColor={editingConfigId ? configs.find(c => c.id === editingConfigId)?.color || '#000000' : '#000000'}
        onClose={() => {
          setColorPickerOpen(false);
          setEditingConfigId(null);
        }}
        onSave={(color) => {
          if (editingConfigId) {
            updateColor(editingConfigId, color);
          }
        }}
      />
    </div>
  );
}
