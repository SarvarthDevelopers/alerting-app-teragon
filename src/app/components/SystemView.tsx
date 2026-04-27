import { useState } from 'react';
import { SystemType, Measurement } from '../types';
import { getMeasurementsBySystem, getSystemDisplayName } from '../data/mockData';
import { MeasurementCard } from './MeasurementCard';
import { FilterDrawer, FilterOptions } from './FilterDrawer';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal } from 'lucide-react';

interface SystemViewProps {
  system: SystemType;
}

export function SystemView({ system }: SystemViewProps) {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    anomalyTypes: [],
    severities: [],
    timeSpan: null
  });

  const allMeasurements = getMeasurementsBySystem(system);
  const displayName = getSystemDisplayName(system);

  // Apply filters
  const measurements = allMeasurements.filter(m => {
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

    return true;
  });

  const activeCount = measurements.filter(m =>
    m.alerts.some(a => a.currentState === 'NEW' || a.currentState === 'ESCALATED')
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
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className={`p-2.5 rounded-xl transition-all ${
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
              {measurements.map((measurement) => (
                <motion.div layout key={measurement.id}>
                  <MeasurementCard measurement={measurement} />
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
      />
    </div>
  );
}
