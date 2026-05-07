import { useState, useEffect } from 'react';
import { mockMeasurements } from '../../app/data/mockData';
import { DesktopAlertCard } from './DesktopAlertCard';
import { FilterBar } from './FilterBar';
import { motion, AnimatePresence } from 'motion/react';
import { Bell } from 'lucide-react';

interface DesktopAlertsFeedProps {
  showLargeUnit: boolean;
  setShowLargeUnit: (val: boolean) => void;
  acknowledgedIds: Set<string>;
  onAcknowledge: (id: string) => void;
  activeView: 'active' | 'acknowledged';
  setActiveView: (view: 'active' | 'acknowledged') => void;
}

export function DesktopAlertsFeed({ showLargeUnit, setShowLargeUnit, acknowledgedIds, onAcknowledge, activeView, setActiveView }: DesktopAlertsFeedProps) {
  const [filters, setFilters] = useState({
    system: 'All Systems',
    anomalyType: 'All Types',
    severity: 'All Severities',
    time: 'Last 24 Hours',
    search: '',
  });

  const filteredMeasurements = mockMeasurements.filter((m) => {
    // Logic for "Active" vs "Acknowledged" based on props
    const isAck = acknowledgedIds.has(m.id) || m.alerts.every(a => a.currentState === 'ACKNOWLEDGED');
    
    // ACTIVE: Must have alerts and NOT be acknowledged
    if (activeView === 'active' && (isAck || m.alerts.length === 0)) return false;
    
    // ACKNOWLEDGED: Must have alerts AND be acknowledged
    if (activeView === 'acknowledged' && (!isAck || m.alerts.length === 0)) return false;

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

    // Filter by System (Category Dropdown)
    if (filters.system !== 'All Systems') {
      const systemMap: { [key: string]: string } = {
        'Surface Inspection': 'SURFACE_INSPECTION',
        'Profile Measurement': 'PROFILE_MEASUREMENT',
        'Flatness Measurement': 'FLATNESS_MEASUREMENT',
      };
      if (m.system !== systemMap[filters.system]) return false;
    }

    // Filter by Anomaly Type (Category Dropdown)
    if (filters.anomalyType !== 'All Types') {
      const hasMatchingType = m.alerts.some(alert => {
        const config = getAnomalyConfig(alert.anomalyType);
        return config?.displayName === filters.anomalyType;
      });
      if (!hasMatchingType) return false;
    }

    // Filter by Severity (Category Dropdown)
    if (filters.severity !== 'All Severities') {
      const hasMatchingSeverity = m.alerts.some(a => a.severity.toLowerCase() === filters.severity.toLowerCase());
      if (!hasMatchingSeverity) return false;
    }

    return true;
  });

  const views: { id: 'active' | 'acknowledged'; label: string }[] = [
    { id: 'active', label: 'Active Alerts' },
    { id: 'acknowledged', label: 'Acknowledged' }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
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
      <div className="flex flex-col gap-6">
        <div className="bg-card/50 backdrop-blur-md border border-border/50 p-1.5 rounded-2xl inline-flex gap-1 shadow-sm self-start">
          {views.map((view) => {
            const isActive = activeView === view.id;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${
                  isActive
                    ? 'bg-black text-white shadow-lg shadow-black/10'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {view.label}
              </button>
            );
          })}
        </div>
        <FilterBar onFilterChange={setFilters} />
      </div>

      <motion.div
        key={activeView}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredMeasurements.length === 0 ? (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 bg-card/30 border border-dashed border-border/50 rounded-3xl"
            >
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-4">
                <Bell className="text-muted-foreground opacity-30" size={32} />
              </div>
              <h3 className="text-lg font-bold text-foreground">No alerts match your criteria</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
            </motion.div>
          ) : (
            filteredMeasurements.map((measurement) => (
              <motion.div 
                key={measurement.id} 
                variants={itemVariants}
                layout
              >
                <DesktopAlertCard 
                  measurement={measurement} 
                  showLargeUnit={showLargeUnit} 
                  setShowLargeUnit={setShowLargeUnit} 
                  onAcknowledge={() => onAcknowledge(measurement.id)}
                  isSessionAck={acknowledgedIds.has(measurement.id)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
