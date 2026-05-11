import { useState, useEffect } from 'react';
import { getAllActiveAlerts, mockMeasurements } from '../data/mockData';
import { MeasurementCard } from './MeasurementCard';
import { FilterDrawer, FilterOptions } from './FilterDrawer';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { SavedToast } from './ui/SavedToast';

type AlertFilter = 'active' | 'acknowledged';

import { AnomalyConfig, SeverityConfig, DisplaySettings as DisplaySettingsType } from '../types';

interface ActiveAlertsFeedProps {
  anomalyConfigs: AnomalyConfig[];
  severityConfigs: SeverityConfig[];
  displaySettings: DisplaySettingsType;
  showLargeUnit: boolean;
  setShowLargeUnit: (val: boolean) => void;
}

export function ActiveAlertsFeed({ anomalyConfigs, severityConfigs, displaySettings, showLargeUnit, setShowLargeUnit }: ActiveAlertsFeedProps) {
  const [activeFilter, setActiveFilter] = useState<AlertFilter>('active');
  const [alertCount, setAlertCount] = useState(0);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Filters applied');
  const [filters, setFilters] = useState<FilterOptions>({
    anomalyTypes: [],
    severities: [],
    timeSpan: null
  });
  // Track session-acknowledged cards with who/when metadata
  const [sessionAcked, setSessionAcked] = useState<Map<string, { acknowledgedBy: string; acknowledgedAt: string }>>(new Map());
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const handleAcknowledge = (id: string) => {
    setSessionAcked(prev => {
      const next = new Map(prev);
      next.set(id, { acknowledgedBy: 'You', acknowledgedAt: new Date().toISOString() });
      return next;
    });
  };

  const applyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setToastMessage('Filters applied');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleResetFilters = () => {
    const defaultFilters = { anomalyTypes: [], severities: [], timeSpan: null };
    setFilters(defaultFilters);
    setToastMessage('Filters removed');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  useEffect(() => {
    const activeAlerts = getAllActiveAlerts();
    setAlertCount(activeAlerts.length);

    // Expand the first card by default on load if nothing is expanded
    if (filteredMeasurements.length > 0 && !expandedCardId && activeFilter === 'active') {
      setExpandedCardId(filteredMeasurements[0].id);
    }

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
      const isSessionAcked = sessionAcked.has(m.id);
      const isDataAcked = m.alerts.length > 0 && m.alerts.every(a => a.currentState === 'ACKNOWLEDGED');
      const isAcked = isSessionAcked || isDataAcked;

      // Filter by alert state
      if (activeFilter === 'active') {
        if (isAcked || m.alerts.length === 0) return false;
        if (!m.alerts.every(a => a.currentState === 'NEW')) return false;
      } else {
        if (!isAcked || m.alerts.length === 0) return false;
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

      // Filter by active anomaly types in global settings
      const hasActiveType = m.alerts.some(a => {
        const config = anomalyConfigs.find(c => c.type === a.anomalyType);
        return config?.isActive !== false;
      });
      if (m.alerts.length > 0 && !hasActiveType) return false;

      return true;
    })
    .sort((a, b) => {
      const aHighestPriority = Math.min(...a.alerts.map(alert => alert.priority));
      const bHighestPriority = Math.min(...b.alerts.map(alert => alert.priority));
      return aHighestPriority - bHighestPriority;
    })
    .slice(0, displaySettings.latestNCount);

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
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="mt-6 flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-bold text-sm shadow-lg shadow-black/10 active:scale-95 transition-all"
              >
                <RotateCcw size={14} strokeWidth={3} />
                Reset all filters
              </button>
            )}
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

            <AnimatePresence initial={false}>
              {filteredMeasurements.map((measurement) => (
                <motion.div
                  layout
                  key={measurement.id}
                  exit={{ opacity: 0, x: 40, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
                >
                  <MeasurementCard
                    measurement={measurement}
                    forceCollapsed={activeFilter === 'acknowledged'}
                    anomalyConfigs={anomalyConfigs}
                    severityConfigs={severityConfigs}
                    displaySettings={displaySettings}
                    onAcknowledge={handleAcknowledge}
                    sessionAckInfo={sessionAcked.get(measurement.id)}
                    isExpanded={expandedCardId === measurement.id}
                    onToggleExpand={(expanded) => setExpandedCardId(expanded ? measurement.id : null)}
                    showLargeUnit={showLargeUnit}
                    setShowLargeUnit={setShowLargeUnit}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <SavedToast visible={showToast} message={toastMessage} />

      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onApplyFilters={applyFilters}
        showTimeSpan={true}
      />
    </div>
  );
}
