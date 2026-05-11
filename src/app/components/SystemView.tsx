import { useState, useMemo } from 'react';
import { SystemType, Measurement, AnomalyConfig, SeverityConfig, DisplaySettings as DisplaySettingsType } from '../types';
import { getMeasurementsBySystem, getSystemDisplayName } from '../data/mockData';
import { MeasurementCard } from './MeasurementCard';
import { FilterDrawer, FilterOptions } from './FilterDrawer';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal } from 'lucide-react';
import { enhanceMeasurements } from '../utils/dataUtils';

interface SystemViewProps {
  system: SystemType;
  anomalyConfigs: AnomalyConfig[];
  severityConfigs: SeverityConfig[];
  displaySettings: DisplaySettingsType;
  showLargeUnit: boolean;
  setShowLargeUnit: (val: boolean) => void;
}

export function SystemView({ system, anomalyConfigs, severityConfigs, displaySettings, showLargeUnit, setShowLargeUnit }: SystemViewProps) {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    anomalyTypes: [],
    severities: [],
    timeSpan: null
  });
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const measurements = useMemo(() => {
    const rawData = getMeasurementsBySystem(system);
    const enhancedData = enhanceMeasurements(rawData, anomalyConfigs);
    
    return enhancedData.filter(m => {
    // Time span filter
    if (filters.timeSpan !== null) {
      const measurementTime = new Date(m.timestamp);
      const cutoffTime = new Date(Date.now() - filters.timeSpan * 60 * 60 * 1000);
      if (measurementTime < cutoffTime) return false;
    }

    // If no anomaly type or severity filters, show all
    if (filters.anomalyTypes.length === 0 && filters.severities.length === 0) {
      return true;
    }

    // If measurement has no alerts, hide it when filters are active
    if (m.alerts.length === 0 && (filters.anomalyTypes.length > 0 || filters.severities.length > 0)) {
      return false;
    }

    // Check anomaly type filter
    if (filters.anomalyTypes.length > 0) {
      const hasMatchingType = m.alerts.some(a => filters.anomalyTypes.includes(a.anomalyType));
      if (!hasMatchingType) return false;
    }

    // Check severity filter
    if (filters.severities.length > 0) {
      const hasMatchingSeverity = m.alerts.some(a => filters.severities.includes(a.severity));
      if (!hasMatchingSeverity) return false;
    }

    // Filter by active anomaly types in global settings
    const hasActiveType = m.alerts.some(a => {
      const config = anomalyConfigs.find(c => c.type === a.anomalyType);
      return config?.isActive !== false;
    });
    if (m.alerts.length > 0 && !hasActiveType) return false;

      return true;
    }).slice(0, displaySettings.latestNCount);
  }, [system, filters, anomalyConfigs, displaySettings.latestNCount]);

  const displayName = getSystemDisplayName(system);

  const activeCount = measurements.filter((m: any) =>
    m.alerts.some((a: any) => a.currentState === 'NEW' || a.currentState === 'ESCALATED')
  ).length;

  const hasActiveFilters = filters.anomalyTypes.length > 0 ||
                          filters.severities.length > 0 ||
                          filters.timeSpan !== null;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 pb-3 border-b border-border"
      >
        <div className="flex items-center justify-between mb-2 h-14">
          <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className={`w-14 h-14 rounded-xl transition-all flex items-center justify-center shrink-0 ${
              hasActiveFilters
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/70'
            }`}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            {measurements.length} measurement{measurements.length !== 1 ? 's' : ''}
          </span>
          {activeCount > 0 && (
            <span className="px-3 py-1 bg-white text-[#FF3B30] rounded-full font-bold text-sm border border-border/50 shadow-sm">
              {activeCount} active alert{activeCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </motion.div>

      <div className="space-y-4 pb-6">
        <AnimatePresence mode="wait" initial={false}>
          {measurements.length === 0 ? (
            <motion.div
              key={`${system}-empty`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">
                {hasActiveFilters ? 'No measurements match the selected filters' : 'No measurements recorded yet'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`${system}-list`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-4"
            >
              {measurements.map((measurement: any) => (
                <motion.div layout key={measurement.id}>
                  <MeasurementCard 
                    measurement={measurement} 
                    anomalyConfigs={anomalyConfigs}
                    severityConfigs={severityConfigs}
                    displaySettings={displaySettings}
                    isExpanded={expandedCardId === measurement.id}
                    onToggleExpand={(expanded) => setExpandedCardId(expanded ? measurement.id : null)}
                    showLargeUnit={showLargeUnit}
                    setShowLargeUnit={setShowLargeUnit}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        showTimeSpan={true}
        anomalyConfigs={anomalyConfigs}
        severityConfigs={severityConfigs}
      />
    </div>
  );
}
