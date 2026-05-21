import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { Measurement, Severity, AnomalyConfig, SeverityConfig, DisplaySettings as DisplaySettingsType } from '../types';
import { getSystemDisplayName } from '../data/mockData';
import { SeverityBadge } from './AlertBadge';
import { ChevronDown, ChevronUp, Info, ArrowLeft, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} min ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

const formatExpandedTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
           ` at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
};

interface MeasurementCardProps {
  measurement: Measurement;
  forceCollapsed?: boolean;
  anomalyConfigs: AnomalyConfig[];
  severityConfigs: SeverityConfig[];
  displaySettings: DisplaySettingsType;
  onAcknowledge?: (id: string) => void;
  sessionAckInfo?: { acknowledgedBy: string; acknowledgedAt: string };
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  showLargeUnit: boolean;
  setShowLargeUnit: (val: boolean) => void;
}

export const MeasurementCard = memo(({ 
  measurement, 
  forceCollapsed = false,
  anomalyConfigs,
  severityConfigs,
  displaySettings,
  onAcknowledge,
  sessionAckInfo,
  isExpanded: externalIsExpanded,
  onToggleExpand: externalOnToggleExpand,
  showLargeUnit,
  setShowLargeUnit
}: MeasurementCardProps) => {
  const hasAlerts = measurement.alerts.length > 0;
  const activeAlerts = useMemo(() => measurement.alerts.filter(a => a.currentState === 'NEW'), [measurement.alerts]);
  const hasActiveAlerts = activeAlerts.length > 0 && !sessionAckInfo;
  const acknowledgedAlerts = useMemo(() => measurement.alerts.filter(a => a.currentState === 'ACKNOWLEDGED'), [measurement.alerts]);
  const hasAcknowledgedAlerts = acknowledgedAlerts.length > 0;

  // Filter alerts based on active anomaly types
  const visibleAlerts = useMemo(() => {
    return measurement.alerts.filter(alert => {
      const config = anomalyConfigs.find(c => c.type === alert.anomalyType);
      return config?.isActive !== false;
    });
  }, [measurement.alerts, anomalyConfigs]);

  interface AlertGroup {
    id: string;
    startPos: number;
    endPos: number;
    alerts: typeof visibleAlerts;
    highestSeverity: Severity;
  }

  const alertGroups = useMemo(() => {
    if (visibleAlerts.length === 0) return [];
    
    const sorted = [...visibleAlerts].sort((a, b) => a.startPos - b.startPos);
    
    const groups: AlertGroup[] = [];
    let currentGroup: AlertGroup = {
      id: sorted[0].id,
      startPos: sorted[0].startPos,
      endPos: Math.min(sorted[0].startPos + sorted[0].length, measurement.productLength),
      alerts: [sorted[0]],
      highestSeverity: sorted[0].severity
    };
    
    const severityValue = (s: Severity): number => {
      switch (s) {
        case 'CRITICAL': return 4;
        case 'HIGH': return 3;
        case 'MEDIUM': return 2;
        case 'LOW': return 1;
        default: return 0;
      }
    };
    
    for (let i = 1; i < sorted.length; i++) {
      const alert = sorted[i];
      const alertEnd = Math.min(alert.startPos + alert.length, measurement.productLength);
      
      if (alert.startPos <= currentGroup.endPos) {
        currentGroup.endPos = Math.max(currentGroup.endPos, alertEnd);
        currentGroup.alerts.push(alert);
        if (severityValue(alert.severity) > severityValue(currentGroup.highestSeverity)) {
          currentGroup.highestSeverity = alert.severity;
        }
      } else {
        groups.push(currentGroup);
        currentGroup = {
          id: alert.id,
          startPos: alert.startPos,
          endPos: alertEnd,
          alerts: [alert],
          highestSeverity: alert.severity
        };
      }
    }
    groups.push(currentGroup);
    return groups;
  }, [visibleAlerts, measurement.productLength]);

  const [internalIsExpanded, setInternalIsExpanded] = useState(forceCollapsed ? false : hasAlerts);
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  const setIsExpanded = (val: boolean) => {
    if (externalOnToggleExpand) {
      externalOnToggleExpand(val);
    } else {
      setInternalIsExpanded(val);
    }
  };
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [showMoreAlerts, setShowMoreAlerts] = useState(false);
  const [scrubberPos, setScrubberPos] = useState<number | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

  // Reset selected detail if card collapses
  useEffect(() => {
    if (!isExpanded) {
      setSelectedAlertId(null);
    }
  }, [isExpanded]);

  // Auto-expand the alerts list if the selected alert is hidden under "+ N more"
  useEffect(() => {
    if (selectedAlertId) {
      const idx = visibleAlerts.findIndex(a => a.id === selectedAlertId);
      if (idx >= 3) {
        setShowMoreAlerts(true);
      }
    }
  }, [selectedAlertId, visibleAlerts]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setScrubberPos(percent);
  };

  const formatLength = (lengthMm: number): string => {
    const unitSystem = displaySettings.unitSystem;

    if (unitSystem === 'METRIC') {
      if (showLargeUnit) {
        return `${(lengthMm / 1000).toFixed(1)} m`;
      } else {
        return `${lengthMm.toLocaleString()} mm`;
      }
    } else {
      // Imperial: convert mm to inches
      const inches = lengthMm / 25.4;
      if (showLargeUnit) {
        const feet = inches / 12;
        return `${feet.toFixed(1)} ft`;
      } else {
        return `${inches.toFixed(1)} in`;
      }
    }
  };

  const highestSeverity = useMemo(() => {
    if (!hasAlerts) return null;

    const severityOrder: { [key in Severity]: number } = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3
    };

    return measurement.alerts.reduce((highest, alert) => {
      return severityOrder[alert.severity] < severityOrder[highest.severity]
        ? alert
        : highest;
    }).severity;
  }, [measurement.alerts, hasAlerts]);

  const statusColor = useMemo(() => {
    if (!hasAlerts) return 'var(--severity-ok)';
    return highestSeverity ? `var(--severity-${highestSeverity.toLowerCase()})` : 'var(--severity-ok)';
  }, [hasAlerts, highestSeverity]);

  const borderColor = useMemo(() => {
    if (!hasAlerts) return 'var(--border)';
    if (highestSeverity === 'CRITICAL' || highestSeverity === 'HIGH') {
      return `var(--severity-${highestSeverity.toLowerCase()})`;
    }
    return 'var(--border)';
  }, [hasAlerts, highestSeverity]);

  const displayTime = useMemo(() => {
    if (!hasAlerts) return measurement.timestamp;

    const latestAlert = measurement.alerts.reduce((latest, alert) => {
      return new Date(alert.createdAt) > new Date(latest.createdAt) ? alert : latest;
    });

    return latestAlert.createdAt;
  }, [measurement.alerts, measurement.timestamp, hasAlerts]);

  const handleAcknowledge = () => {
    setShowConfirmation(false);
    setIsAcknowledging(true);
    // Brief green success flash before card exits
    setTimeout(() => {
      onAcknowledge?.(measurement.id);
    }, 350);
  };

  const getSeverityColor = (severity: Severity): string => {
    return `var(--severity-${severity.toLowerCase()})`;
  };

  const segments = 30;

  return (
    <div
      className="bg-card rounded-xl border relative overflow-hidden"
      onClick={() => setSelectedAlertId(null)}
      style={{
        borderColor: borderColor,
      }}
    >

      <div className="p-4">
        <div
          className="flex items-start justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">
              {getSystemDisplayName(measurement.system)}
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              {measurement.serialNumber}
            </h3>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {(hasAcknowledgedAlerts || !!sessionAckInfo) && (
                <span className="px-4 py-1 bg-[#dedede] text-foreground rounded text-xs font-semibold">
                  ACK
                </span>
              )}
              {highestSeverity ? (
                <SeverityBadge severity={highestSeverity} size="sm" />
              ) : (
                <div className="w-[18px] h-[18px] bg-severity-ok rounded-full" />
              )}
              {isExpanded ? (
                <ChevronUp size={24} className="text-foreground" />
              ) : (
                <ChevronDown size={24} className="text-foreground" />
              )}
            </div>
            <div className="text-sm text-muted-foreground font-semibold">
              {isExpanded ? formatExpandedTime(displayTime) : getRelativeTime(displayTime)}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`px-4 pt-0 border-t border-border ${hasAlerts ? 'pb-5' : 'pb-0'}`}>
              <div className="flex items-center justify-between mb-2 mt-4">
                <div className="text-sm text-muted-foreground font-semibold">
                  {measurement.productType}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLargeUnit(!showLargeUnit);
                  }}
                  className="text-sm text-muted-foreground font-semibold underline decoration-dotted hover:text-foreground transition-colors"
                >
                  {formatLength(measurement.productLength)}
                </button>
              </div>

              <div className="mb-4 relative">
                {scrubberPos !== null && (
                  <div
                    className="absolute bottom-[calc(100%+8px)] -translate-x-1/2 bg-black text-white px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap z-30 pointer-events-none shadow-lg"
                    style={{ left: `${scrubberPos}%` }}
                  >
                    {formatLength((scrubberPos / 100) * measurement.productLength)}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-black" />
                  </div>
                )}
                <div
                  ref={rulerRef}
                  className="relative w-full h-12 cursor-crosshair touch-none"
                  onMouseMove={handleInteraction}
                  onMouseDown={handleInteraction}
                  onTouchMove={handleInteraction}
                  onTouchStart={handleInteraction}
                  onMouseLeave={() => setScrubberPos(null)}
                  onTouchEnd={() => setScrubberPos(null)}
                >
                  {/* Ruler track background layer with scale markers */}
                  <div className="absolute inset-0 bg-muted/30 rounded-xl overflow-hidden pointer-events-none">
                    {/* Scale Markers Layer */}
                    <div className="absolute inset-0 flex justify-between px-1 opacity-10">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className={`w-px bg-foreground ${i % 5 === 0 ? 'h-full' : 'h-1/2 mt-auto'}`} />
                      ))}
                    </div>
                  </div>

                   {/* Anomaly groups */}
                  {alertGroups.map(group => {
                    const startPercent = (group.startPos / measurement.productLength) * 100;
                    const endPercent = (group.endPos / measurement.productLength) * 100;
                    const widthPercent = Math.max(0.5, endPercent - startPercent); // ensure tiny anomalies are visible
                    const isGroupSelected = group.alerts.some(a => a.id === selectedAlertId);

                    const handleGroupTap = (e: React.MouseEvent | React.TouchEvent) => {
                      e.stopPropagation();
                      e.preventDefault();

                      if (group.alerts.length === 1) {
                        const alert = group.alerts[0];
                        setSelectedAlertId(selectedAlertId === alert.id ? null : alert.id);
                      } else {
                        const currentIndex = group.alerts.findIndex(a => a.id === selectedAlertId);
                        if (currentIndex === -1) {
                          setSelectedAlertId(group.alerts[0].id);
                        } else {
                          const nextIndex = (currentIndex + 1) % group.alerts.length;
                          setSelectedAlertId(group.alerts[nextIndex].id);
                        }
                      }
                    };

                    return (
                      <div
                        key={group.id}
                        className="absolute top-0 bottom-0"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          left: `${startPercent}%`,
                          width: `${widthPercent}%`,
                          zIndex: isGroupSelected ? 15 : 10
                        }}
                      >
                        {/* Overlap Count Badge directly above the ruler segment */}
                        {group.alerts.length > 1 && (
                          <div
                            className="absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 bg-black text-white px-1.5 py-0.5 rounded-full text-[9px] font-black z-30 pointer-events-none shadow flex items-center justify-center border whitespace-nowrap"
                            style={{
                              borderColor: getSeverityColor(group.highestSeverity)
                            }}
                          >
                            +{group.alerts.length - 1}
                          </div>
                        )}

                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ 
                            scaleX: 1, 
                            backgroundColor: getSeverityColor(group.highestSeverity),
                          }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          onMouseDown={handleGroupTap}
                          onTouchStart={handleGroupTap}
                          onClick={(e) => e.stopPropagation()}
                          className={`w-full h-full rounded cursor-pointer ${
                            isGroupSelected ? 'ring-2 ring-black shadow-lg scale-y-110' : 'hover:opacity-90'
                          }`}
                          style={{
                            originX: 0,
                            border: isGroupSelected ? '2px solid black' : 'none'
                          }}
                        />
                      </div>
                    );
                  })}

                  {/* Scrubber Line */}
                  {scrubberPos !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-[2px] bg-black z-20 pointer-events-none"
                      style={{ left: `${scrubberPos}%` }}
                    />
                  )}
                </div>
              </div>

              {hasAlerts && (
                <div className="space-y-2 mb-4">
                  {(() => {
                    const maxDisplay = 3;
                    const displayedAlerts = showMoreAlerts ? visibleAlerts : visibleAlerts.slice(0, maxDisplay);
                    const remainingCount = visibleAlerts.length - maxDisplay;

                    return (
                      <>
                        {displayedAlerts.map(alert => {
                          const config = anomalyConfigs.find(c => c.type === alert.anomalyType);
                          const endPos = Math.min(
                            alert.startPos + alert.length,
                            measurement.productLength
                          );
                          const hasDetails = !!alert.technicalDetails;
                          const isSelected = selectedAlertId === alert.id;

                          const isAnyAlertSelected = selectedAlertId !== null;
                          const isDimmed = isAnyAlertSelected && !isSelected;

                          return (
                            <div 
                              key={alert.id} 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAlertId(isSelected ? null : alert.id);
                              }}
                              className="py-1.5 transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200" 
                                  style={{ 
                                    backgroundColor: getSeverityColor(alert.severity),
                                    opacity: isDimmed ? 0.35 : 1
                                  }} 
                                />
                                <div className="flex-1 text-sm transition-all duration-200">
                                  <span className={`transition-all duration-200 ${
                                    isDimmed 
                                      ? 'font-normal text-muted-foreground/50' 
                                      : 'font-bold text-foreground'
                                  } ${hasDetails ? 'border-b-[1.5px] border-dotted border-foreground/80' : ''}`}>
                                    {config?.displayName || alert.anomalyType}:
                                  </span>
                                  <span className={`text-muted-foreground ml-1 font-sans transition-all duration-200 ${
                                    isDimmed ? 'opacity-35' : 'opacity-100'
                                  }`}>
                                    {formatLength(alert.startPos)} - {formatLength(endPos)}
                                  </span>
                                </div>
                              </div>
                              <AnimatePresence>
                                {isSelected && hasDetails && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="ml-3.5 mt-1.5 pb-1">
                                      <p className="text-sm font-normal leading-relaxed text-foreground/70 italic font-sans">
                                        {alert.technicalDetails}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                        
                        {remainingCount > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMoreAlerts(!showMoreAlerts);
                            }}
                            className="mt-2 text-[10px] font-black text-foreground uppercase tracking-widest bg-foreground/5 px-3 py-2 rounded-xl border border-foreground/10 hover:bg-foreground/10 transition-colors flex items-center gap-2"
                          >
                            {showMoreAlerts ? (
                              <>
                                Show Less <ChevronUp size={12} />
                              </>
                            ) : (
                              <>
                                + {remainingCount} more anomalies <ChevronDown size={12} />
                              </>
                            )}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {(() => {
                const ackData = sessionAckInfo
                  ? sessionAckInfo
                  : hasAcknowledgedAlerts
                    ? { acknowledgedBy: acknowledgedAlerts[0].acknowledgedBy || 'Unknown', acknowledgedAt: acknowledgedAlerts[0].acknowledgedAt }
                    : null;
                return ackData ? (
                  <div className="text-sm font-medium text-alert-acknowledged">
                    Ackd by {ackData.acknowledgedBy} at{' '}
                    {ackData.acknowledgedAt && new Date(ackData.acknowledgedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}{' '}
                    on{' '}
                    {ackData.acknowledgedAt && new Date(ackData.acknowledgedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                ) : null;
              })()}

              {hasActiveAlerts && (
                <div className="mt-4">
                  <div
                    style={{ display: 'grid', gridTemplateRows: showConfirmation ? '1fr' : '0fr' }}
                    className="transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  >
                    <div className="overflow-hidden">
                      <p className="text-center text-sm font-medium text-foreground pb-3">
                        Are you sure to acknowledge this?
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isAcknowledging}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!showConfirmation) {
                        setShowConfirmation(true);
                      } else {
                        handleAcknowledge();
                      }
                    }}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isAcknowledging
                        ? 'bg-green-500 text-white cursor-default'
                        : 'bg-[#dedede] text-foreground hover:opacity-90'
                    }`}
                  >
                    {isAcknowledging ? '✓  DONE' : showConfirmation ? 'YES' : 'ACKNOWLEDGE'}
                  </button>

                  <div
                    style={{ display: 'grid', gridTemplateRows: showConfirmation ? '1fr' : '0fr' }}
                    className="transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  >
                    <div className="overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowConfirmation(false);
                        }}
                        className="w-full mt-3 py-4 rounded-xl font-bold text-lg border-2 border-[#dedede] text-foreground transition-all hover:bg-muted"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isExpanded && hasAlerts && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 16 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="relative h-4 w-full bg-card border-t border-[#dedede] overflow-hidden"
          >
            <div className="absolute inset-0">
              {alertGroups.map(group => {
                const startPercent = (group.startPos / measurement.productLength) * 100;
                const endPercent = (group.endPos / measurement.productLength) * 100;
                const widthPercent = Math.max(0.5, endPercent - startPercent);

                return (
                  <div
                    key={group.id}
                    className="absolute top-0 bottom-0"
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: getSeverityColor(group.highestSeverity)
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
