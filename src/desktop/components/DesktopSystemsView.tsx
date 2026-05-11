import { useState, useEffect, useRef, useMemo } from 'react';
import { SystemType, AnomalyConfig, SeverityConfig, DisplaySettings } from '../../app/types';
import { getMeasurementsBySystem, getSystemDisplayName, getAnomalyConfig } from '../../app/data/mockData';
import { DesktopAlertCard } from './DesktopAlertCard';
import { FilterBar } from './FilterBar';
import { motion, AnimatePresence } from 'motion/react';
import { enhanceMeasurements } from '../../app/utils/dataUtils';

interface DesktopSystemsViewProps {
  showLargeUnit: boolean;
  setShowLargeUnit: (val: boolean) => void;
  showExactTime: boolean;
  setShowExactTime: (val: boolean) => void;
  acknowledgedIds: Set<string>;
  onAcknowledge: (id: string) => void;
  displaySettings: DisplaySettings;
  anomalyConfigs: AnomalyConfig[];
  severityConfigs: SeverityConfig[];
  showHeader: boolean;
  lastScrollY: number;
  onClearFilters?: () => void;
}

export function DesktopSystemsView({ showLargeUnit, setShowLargeUnit, showExactTime, setShowExactTime, acknowledgedIds, onAcknowledge, displaySettings, anomalyConfigs, severityConfigs, showHeader, lastScrollY, onClearFilters }: DesktopSystemsViewProps) {
  const [activeSystem, setActiveSystem] = useState<SystemType>('SURFACE_INSPECTION');
  const [filters, setFilters] = useState({
    system: 'All Systems', // This will be handled by the tabs mainly
    anomalyType: 'All Types',
    severity: 'All Severities',
    time: 'Last 24 Hours',
    search: '',
  });
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  useEffect(() => {
    setExpandedCardId(null);
  }, [activeSystem]);

  const systems: { id: SystemType; label: string }[] = [
    { id: 'SURFACE_INSPECTION', label: 'Surface Inspection' },
    { id: 'PROFILE_MEASUREMENT', label: 'Profile Measurement' },
    { id: 'FLATNESS_MEASUREMENT', label: 'Flatness Measurement' }
  ];

  const measurements = useMemo(() => {
    const rawData = getMeasurementsBySystem(activeSystem);
    const enhancedData = enhanceMeasurements(rawData, anomalyConfigs);
    
    return enhancedData.filter(m => {
    // Enhanced Search Filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const systemName = getSystemDisplayName(m.system).toLowerCase();
      
      const matchesBasic = 
        m.serialNumber.toLowerCase().includes(searchLower) ||
        m.productType.toLowerCase().includes(searchLower) ||
        systemName.includes(searchLower) ||
        m.productLength.toString().includes(searchLower);

      const matchesAnomalies = m.alerts.some(alert => {
        const config = getAnomalyConfig(alert.anomalyType);
        return (
          config?.displayName.toLowerCase().includes(searchLower) ||
          alert.severity.toLowerCase().includes(searchLower)
        );
      });

      if (!matchesBasic && !matchesAnomalies) return false;
    }

    // Filter by Anomaly Type (Category Dropdown)
    if (filters.anomalyType !== 'All Types') {
      const hasMatchingType = m.alerts.some(alert => {
        const config = getAnomalyConfig(alert.anomalyType);
        return config?.displayName === filters.anomalyType;
      });
      if (!hasMatchingType) return false;
    }

    if (filters.severity !== 'All Severities') {
      const hasMatchingSeverity = m.alerts.some(a => a.severity.toLowerCase() === filters.severity.toLowerCase());
      if (!hasMatchingSeverity) return false;
    }

    // Filter by active anomaly types in global settings
    if (m.alerts.length > 0) {
      const hasActiveType = m.alerts.some(alert => {
        const config = anomalyConfigs.find(c => c.type === alert.anomalyType);
        return config?.isActive !== false;
      });
      if (!hasActiveType) return false;
    }

      return true;
    }).slice(0, displaySettings.latestNCount);
  }, [activeSystem, filters, anomalyConfigs, displaySettings.latestNCount]);

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={false}
        animate={{ top: showHeader ? 80 : 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="sticky z-30 py-6 bg-background/60 backdrop-blur-md -mx-10 px-10 border-b border-border/50"
      >
        {/* System Selector Tabs */}
        <div className="bg-muted border border-border/50 p-1.5 rounded-2xl inline-flex gap-1 shadow-sm">
          {systems.map((system) => {
            const isActive = activeSystem === system.id;
            return (
              <button
                key={system.id}
                onClick={() => setActiveSystem(system.id)}
                className={`px-6 h-11 inline-flex items-center rounded-xl text-xs font-black transition-all ${
                  isActive
                    ? 'bg-black text-white shadow-lg shadow-black/10'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {system.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="space-y-6">
        <FilterBar 
          onFilterChange={setFilters} 
          hideSystemFilter={true} 
          anomalyConfigs={anomalyConfigs} 
          severityConfigs={severityConfigs} 
          onClear={onClearFilters}
        />
        
        <motion.div
          key={activeSystem}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {measurements.length === 0 ? (
            <div className="py-20 text-center bg-card/30 border border-dashed border-border/50 rounded-3xl text-muted-foreground font-medium">
              No measurements found for this system.
            </div>
          ) : (
            measurements.map((measurement: any) => (
              <motion.div key={measurement.id} variants={itemVariants}>
                <DesktopAlertCard 
                  measurement={measurement} 
                  showLargeUnit={showLargeUnit} 
                  setShowLargeUnit={setShowLargeUnit} 
                  showExactTime={showExactTime}
                  setShowExactTime={setShowExactTime}
                  onAcknowledge={() => onAcknowledge(measurement.id)}
                  isSessionAck={acknowledgedIds.has(measurement.id)}
                  displaySettings={displaySettings}
                  isExpanded={expandedCardId === measurement.id}
                  onToggleExpand={(expanded) => setExpandedCardId(expanded ? measurement.id : null)}
                  anomalyConfigs={anomalyConfigs}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
