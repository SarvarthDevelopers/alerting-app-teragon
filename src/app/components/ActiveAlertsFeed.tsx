import { useState, useEffect } from 'react';
import { getAllActiveAlerts, mockMeasurements } from '../data/mockData';
import { MeasurementCard } from './MeasurementCard';
import { FilterDrawer, FilterOptions } from './FilterDrawer';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, SlidersHorizontal } from 'lucide-react';

type AlertFilter = 'active' | 'acknowledged';

export function ActiveAlertsFeed() {
  const [activeFilter, setActiveFilter] = useState<AlertFilter>('active');
  const [alertCount, setAlertCount] = useState(0);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    anomalyTypes: [],
    severities: [],
    timeSpan: null
  });

  useEffect(() => {
    const activeAlerts = getAllActiveAlerts();
    setAlertCount(activeAlerts.length);

    const interval = setInterval(() => {
      const newAlerts = getAllActiveAlerts();
      if (newAlerts.length > alertCount) {
        setHasNewAlert(true);
        setTimeout(() => setHasNewAlert(false), 2000);
      }
      setAlertCount(newAlerts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [alertCount]);

  const filteredMeasurements = mockMeasurements
    .filter(m => {
      // Filter by alert state
      if (activeFilter === 'active') {
        // Only show if ALL alerts are NEW (not mixed states)
        if (!(m.alerts.length > 0 && m.alerts.every(a => a.currentState === 'NEW'))) {
          return false;
        }
      } else {
        // Only show if ALL alerts are ACKNOWLEDGED (not mixed states)
        if (!(m.alerts.length > 0 && m.alerts.every(a => a.currentState === 'ACKNOWLEDGED'))) {
          return false;
        }
      }

      // Apply additional filters
      // Time span filter
      if (filters.timeSpan !== null) {
        const measurementTime = new Date(m.timestamp);
        const cutoffTime = new Date(Date.now() - filters.timeSpan * 60 * 60 * 1000);
        if (measurementTime < cutoffTime) return false;
      }

      // Anomaly type filter
      if (filters.anomalyTypes.length > 0) {
        const hasMatchingType = m.alerts.some(a => filters.anomalyTypes.includes(a.anomalyType));
        if (!hasMatchingType) return false;
      }

      // Severity filter
      if (filters.severities.length > 0) {
        const hasMatchingSeverity = m.alerts.some(a => filters.severities.includes(a.severity));
        if (!hasMatchingSeverity) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const aHighestPriority = Math.min(...a.alerts.map(alert => alert.priority));
      const bHighestPriority = Math.min(...b.alerts.map(alert => alert.priority));
      return aHighestPriority - bHighestPriority;
    });

  const hasActiveFilters = filters.anomalyTypes.length > 0 ||
                          filters.severities.length > 0 ||
                          filters.timeSpan !== null;

  const tabFilters: { id: AlertFilter; label: string }[] = [
    { id: 'active', label: 'Active' },
    { id: 'acknowledged', label: 'Acknowledged' }
  ];

  return (
    <div>
      <div className="sticky top-0 bg-background z-20 -mx-4 px-4 pt-2 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl p-2 flex gap-2.5 flex-1 relative">
            {tabFilters.map((filter) => {
              const isActive = activeFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold text-base transition-colors relative z-10 ${
                    isActive
                      ? 'text-white'
                      : 'text-[#838383] hover:text-[#525252]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabAlerts"
                      className="absolute inset-0 bg-[#262626] rounded-xl -z-10"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  {filter.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              hasActiveFilters
                ? 'bg-primary text-primary-foreground'
                : 'bg-white text-foreground hover:bg-muted/70'
            }`}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {filteredMeasurements.length === 0 ? (
          <motion.div
            key={`${activeFilter}-empty`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Bell size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {hasActiveFilters
                ? 'No Matching Alerts'
                : activeFilter === 'active' ? 'All Clear' : 'No Acknowledged Alerts'}
            </h3>
            <p className="text-muted-foreground text-center">
              {hasActiveFilters
                ? 'No alerts match the selected filters.'
                : activeFilter === 'active'
                  ? 'No active alerts at the moment. System operating normally.'
                  : 'No acknowledged alerts to display.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`${activeFilter}-list`}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-4 pb-6"
          >
            <AnimatePresence>
              {hasNewAlert && activeFilter === 'active' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-primary text-primary-foreground px-4 py-3 rounded-lg font-semibold text-center"
                >
                  New alert detected!
                </motion.div>
              )}
            </AnimatePresence>

            {filteredMeasurements.map((measurement) => (
              <motion.div layout key={measurement.id}>
                <MeasurementCard
                  measurement={measurement}
                  forceCollapsed={activeFilter === 'acknowledged'}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

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
