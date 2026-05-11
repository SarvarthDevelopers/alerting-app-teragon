import { useState } from 'react';
import { mockMeasurements, getAnomalyConfig, getSystemDisplayName } from '../../app/data/mockData';
import { AnomalyConfig, SeverityConfig, DisplaySettings } from '../../app/types';
import { DesktopAlertCard } from './DesktopAlertCard';
import { FilterBar } from './FilterBar';
import { BulkActionBar } from './BulkActionBar';
import { motion, AnimatePresence } from 'motion/react';
import { Bell } from 'lucide-react';

interface DesktopAlertsFeedProps {
  showLargeUnit: boolean;
  setShowLargeUnit: (val: boolean) => void;
  showExactTime: boolean;
  setShowExactTime: (val: boolean) => void;
  acknowledgedIds: Set<string>;
  onAcknowledge: (id: string) => void;
  activeView: 'active' | 'acknowledged';
  setActiveView: (view: 'active' | 'acknowledged') => void;
  displaySettings: DisplaySettings;
  anomalyConfigs: AnomalyConfig[];
  severityConfigs: SeverityConfig[];
}

export function DesktopAlertsFeed({ showLargeUnit, setShowLargeUnit, showExactTime, setShowExactTime, acknowledgedIds, onAcknowledge, activeView, setActiveView, displaySettings, anomalyConfigs, severityConfigs }: DesktopAlertsFeedProps) {
  const [filters, setFilters] = useState({
    system: 'All Systems',
    anomalyType: 'All Types',
    severity: 'All Severities',
    time: 'Last 24 Hours',
    search: '',
  });
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkResolving, setIsBulkResolving] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const enterSelectionMode = () => { setIsSelectionMode(true); setSelectedIds(new Set()); };
  const exitSelectionMode = () => { setIsSelectionMode(false); setSelectedIds(new Set()); setIsBulkResolving(false); };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkAcknowledge = () => {
    setIsBulkResolving(true);
    setTimeout(() => {
      selectedIds.forEach(id => onAcknowledge(id));
      exitSelectionMode();
    }, 1000);
  };

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

  const activeFilteredIds = filteredMeasurements.map(m => m.id);
  const allVisibleSelected = activeFilteredIds.length > 0 && activeFilteredIds.every(id => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activeFilteredIds));
    }
  };

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
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
        <div className="bg-card/50 backdrop-blur-md border border-border/50 p-1.5 rounded-2xl inline-flex gap-1 shadow-sm">
          {views.map((view) => {
            const isActive = activeView === view.id;
            return (
              <button
                key={view.id}
                onClick={() => { setActiveView(view.id); if (isSelectionMode) exitSelectionMode(); }}
                className={`px-8 h-11 inline-flex items-center rounded-xl text-xs font-black transition-all ${
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

        {/* Select Mode Controls — only on Active tab */}
        <AnimatePresence>
          {activeView === 'active' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2"
            >
              {/* Select All / Deselect All — visible only in selection mode */}
              <AnimatePresence>
                {isSelectionMode && (
                  <motion.button
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    onClick={toggleSelectAll}
                    className="px-5 h-11 inline-flex items-center rounded-xl text-xs font-black transition-colors border border-border/50 bg-card/50 text-muted-foreground hover:text-foreground hover:border-foreground whitespace-nowrap overflow-hidden"
                  >
                    {allVisibleSelected ? 'Deselect All' : 'Select All'}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Select / Cancel toggle */}
              <button
                onClick={isSelectionMode ? exitSelectionMode : enterSelectionMode}
                className={`px-5 h-11 inline-flex items-center rounded-xl text-xs font-black transition-all ${
                  isSelectionMode
                    ? 'bg-black text-white'
                    : 'border border-border/50 bg-card/50 text-muted-foreground hover:text-foreground hover:border-foreground'
                }`}
              >
                {isSelectionMode ? 'Cancel' : 'Select'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
        <FilterBar onFilterChange={setFilters} anomalyConfigs={anomalyConfigs} severityConfigs={severityConfigs} />
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
                  showExactTime={showExactTime}
                  setShowExactTime={setShowExactTime}
                  onAcknowledge={() => onAcknowledge(measurement.id)}
                  isSessionAck={acknowledgedIds.has(measurement.id)}
                  displaySettings={displaySettings}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedIds.has(measurement.id)}
                  onToggleSelect={() => toggleSelection(measurement.id)}
                  isExpanded={expandedCardId === measurement.id}
                  onToggleExpand={(expanded) => setExpandedCardId(expanded ? measurement.id : null)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      <BulkActionBar
        selectedCount={selectedIds.size}
        onAcknowledgeAll={handleBulkAcknowledge}
        onCancel={exitSelectionMode}
        isResolving={isBulkResolving}
      />
    </div>
  );
}
