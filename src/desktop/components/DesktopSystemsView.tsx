import { useState } from 'react';
import { SystemType, AnomalyConfig, SeverityConfig, DisplaySettings } from '../../app/types';
import { getMeasurementsBySystem, getSystemDisplayName, getAnomalyConfig } from '../../app/data/mockData';
import { DesktopAlertCard } from './DesktopAlertCard';
import { FilterBar } from './FilterBar';
import { motion, AnimatePresence } from 'motion/react';

interface DesktopSystemsViewProps {
  showLargeUnit: boolean;
  setShowLargeUnit: (val: boolean) => void;
  acknowledgedIds: Set<string>;
  onAcknowledge: (id: string) => void;
  displaySettings: DisplaySettings;
  anomalyConfigs: AnomalyConfig[];
  severityConfigs: SeverityConfig[];
}

export function DesktopSystemsView({ showLargeUnit, setShowLargeUnit, acknowledgedIds, onAcknowledge, displaySettings, anomalyConfigs, severityConfigs }: DesktopSystemsViewProps) {
  const [activeSystem, setActiveSystem] = useState<SystemType>('SURFACE_INSPECTION');
  const [filters, setFilters] = useState({
    system: 'All Systems', // This will be handled by the tabs mainly
    anomalyType: 'All Types',
    severity: 'All Severities',
    time: 'Last 24 Hours',
    search: '',
  });

  const systems: { id: SystemType; label: string }[] = [
    { id: 'SURFACE_INSPECTION', label: 'Surface Inspection' },
    { id: 'PROFILE_MEASUREMENT', label: 'Profile Measurement' },
    { id: 'FLATNESS_MEASUREMENT', label: 'Flatness Measurement' }
  ];

  const measurements = getMeasurementsBySystem(activeSystem).filter(m => {
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
    return true;
  }).slice(0, displaySettings.latestNCount);

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
      {/* System Selector Tabs */}
      <div className="bg-card/50 backdrop-blur-md border border-border/50 p-1.5 rounded-2xl inline-flex gap-1 shadow-sm">
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

      <div className="space-y-6">
        <FilterBar onFilterChange={setFilters} hideSystemFilter={true} anomalyConfigs={anomalyConfigs} severityConfigs={severityConfigs} />
        
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
            measurements.map((measurement) => (
              <motion.div key={measurement.id} variants={itemVariants}>
                <DesktopAlertCard 
                  measurement={measurement} 
                  showLargeUnit={showLargeUnit} 
                  setShowLargeUnit={setShowLargeUnit} 
                  onAcknowledge={() => onAcknowledge(measurement.id)}
                  isSessionAck={acknowledgedIds.has(measurement.id)}
                  displaySettings={displaySettings}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
