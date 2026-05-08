import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { anomalyConfigs } from '../../data/settingsData';
import { AnomalyConfig, Severity } from '../../types';
import { motion } from 'motion/react';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface AnomalyTypesSettingsProps {
  onBack: () => void;
  configs: AnomalyConfig[];
  onUpdate: (configs: AnomalyConfig[]) => void;
}

export function AnomalyTypesSettings({ onBack, configs, onUpdate }: AnomalyTypesSettingsProps) {
  const toggleActive = (id: string) => {
    onUpdate(configs.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const updateSeverity = (id: string, severity: Severity) => {
    onUpdate(configs.map(c => c.id === id ? { ...c, defaultSeverity: severity } : c));
  };

  return (
    <div className="pb-20">
      {/* Title Section */}
      <div className="px-4 py-6 border-b border-border bg-background">
        <h1 className="text-3xl font-bold text-foreground">Anomaly Type</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure defect type, colors and alerts
        </p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {configs.map((config, index) => (
          <div
            key={config.id}
            className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm hover:border-foreground transition-all duration-200"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground leading-none">{config.displayName}</h3>
                <p className="text-xs font-mono uppercase text-muted-foreground mt-2 tracking-wider">
                  {config.sourceTypeKey}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold transition-colors ${config.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {config.isActive ? 'Active' : 'Inactive'}
                </span>
                <Switch 
                  checked={config.isActive}
                  onCheckedChange={() => toggleActive(config.id)}
                />
              </div>
            </div>

            {/* Severity Configuration */}
            <div className="flex items-center justify-between pt-2">
              <span className="font-bold text-foreground">Anomaly Severity</span>
              <div className="w-[180px]">
                <Select
                  value={config.defaultSeverity}
                  onValueChange={(value) => updateSeverity(config.id, value as Severity)}
                >
                  <SelectTrigger className="h-12 bg-background border-border rounded-xl px-4 font-bold text-foreground">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="CRITICAL" className="font-bold">Critical</SelectItem>
                    <SelectItem value="HIGH" className="font-bold">High</SelectItem>
                    <SelectItem value="MEDIUM" className="font-bold">Medium</SelectItem>
                    <SelectItem value="LOW" className="font-bold">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
