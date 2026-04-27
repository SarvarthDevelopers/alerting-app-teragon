import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { Severity } from '../types';
import { anomalyConfigs } from '../data/settingsData';

export interface FilterOptions {
  anomalyTypes: string[];
  severities: Severity[];
  timeSpan: number | null; // in hours
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  showTimeSpan?: boolean;
}

const severityOptions: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const timeSpanOptions = [
  { label: '2 hours', value: 2 },
  { label: '6 hours', value: 6 },
  { label: '12 hours', value: 12 },
  { label: 'All', value: null }
];

export function FilterDrawer({ isOpen, onClose, filters, onApplyFilters, showTimeSpan = true }: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const toggleAnomalyType = (type: string) => {
    setLocalFilters(prev => ({
      ...prev,
      anomalyTypes: prev.anomalyTypes.includes(type)
        ? prev.anomalyTypes.filter(t => t !== type)
        : [...prev.anomalyTypes, type]
    }));
  };

  const toggleSeverity = (severity: Severity) => {
    setLocalFilters(prev => ({
      ...prev,
      severities: prev.severities.includes(severity)
        ? prev.severities.filter(s => s !== severity)
        : [...prev.severities, severity]
    }));
  };

  const setTimeSpan = (hours: number | null) => {
    setLocalFilters(prev => ({
      ...prev,
      timeSpan: hours
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: FilterOptions = {
      anomalyTypes: [],
      severities: [],
      timeSpan: null
    };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 mx-auto max-w-[480px] bg-card rounded-t-3xl shadow-2xl z-50 max-h-[85vh] overflow-hidden"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Filters</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X size={24} className="text-foreground" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-4 space-y-6">
              {/* Anomaly Types */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Anomaly Type</h3>
                <div className="space-y-2">
                  {anomalyConfigs.map(config => (
                    <button
                      key={config.id}
                      onClick={() => toggleAnomalyType(config.sourceTypeKey)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                        localFilters.anomalyTypes.includes(config.sourceTypeKey)
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-muted border-2 border-transparent'
                      }`}
                    >
                      <span className="font-medium text-foreground">{config.displayName}</span>
                      {localFilters.anomalyTypes.includes(config.sourceTypeKey) && (
                        <Check size={20} className="text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Severity</h3>
                <div className="grid grid-cols-2 gap-2">
                  {severityOptions.map(severity => (
                    <button
                      key={severity}
                      onClick={() => toggleSeverity(severity)}
                      className={`p-3 rounded-xl font-semibold transition-all ${
                        localFilters.severities.includes(severity)
                          ? 'ring-2 ring-offset-2 ring-foreground'
                          : 'opacity-60'
                      }`}
                      style={{
                        backgroundColor: getSeverityColor(severity),
                        color: '#ffffff'
                      }}
                    >
                      {severity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Span */}
              {showTimeSpan && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Time Span</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSpanOptions.map(option => (
                      <button
                        key={option.label}
                        onClick={() => setTimeSpan(option.value)}
                        className={`p-3 rounded-xl font-semibold transition-all ${
                          localFilters.timeSpan === option.value
                            ? 'bg-[#262626] text-white'
                            : 'bg-[#f5f5f5] text-[#838383]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-border flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 py-3 rounded-xl font-bold text-foreground bg-muted hover:bg-muted/70 transition-colors"
              >
                CLEAR ALL
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-[#262626] hover:opacity-90 transition-opacity"
              >
                APPLY
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
