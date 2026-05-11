import { useState, useRef, useEffect } from 'react';
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

export function MeasurementCard({ 
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
}: MeasurementCardProps) {
  const hasAlerts = measurement.alerts.length > 0;
  const activeAlerts = measurement.alerts.filter(a => a.currentState === 'NEW');
  const hasActiveAlerts = activeAlerts.length > 0 && !sessionAckInfo;
  const acknowledgedAlerts = measurement.alerts.filter(a => a.currentState === 'ACKNOWLEDGED');
  const hasAcknowledgedAlerts = acknowledgedAlerts.length > 0;

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

  const getHighestSeverity = (): Severity | null => {
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
  };

  const getStatusColor = () => {
    if (!hasAlerts) return '#9fe870';
    const highest = getHighestSeverity();
    return highest ? `var(--severity-${highest.toLowerCase()})` : '#9fe870';
  };

  const getBorderColor = () => {
    if (!hasAlerts) return 'var(--border)';
    const highest = getHighestSeverity();
    if (highest === 'CRITICAL' || highest === 'HIGH') {
      return `var(--severity-${highest.toLowerCase()})`;
    }
    return 'var(--border)';
  };

  const highestSeverity = getHighestSeverity();

  const getDisplayTime = (): string => {
    if (!hasAlerts) return measurement.timestamp;

    const latestAlert = measurement.alerts.reduce((latest, alert) => {
      return new Date(alert.createdAt) > new Date(latest.createdAt) ? alert : latest;
    });

    return latestAlert.createdAt;
  };

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
  const displayTime = getDisplayTime();

  return (
    <div
      className="bg-card rounded-xl border relative overflow-hidden"
      style={{
        borderColor: getBorderColor(),
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
                <div className="w-[18px] h-[18px] bg-[#34c759] rounded-full" />
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
                  className="relative w-full h-12 bg-muted/30 rounded-xl overflow-hidden cursor-crosshair touch-none"
                  onMouseMove={handleInteraction}
                  onMouseDown={handleInteraction}
                  onTouchMove={handleInteraction}
                  onTouchStart={handleInteraction}
                  onMouseLeave={() => setScrubberPos(null)}
                  onTouchEnd={() => setScrubberPos(null)}
                >
                  {/* Scale Markers Layer */}
                  <div className="absolute inset-0 flex justify-between px-1 opacity-10 pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className={`w-px bg-foreground ${i % 5 === 0 ? 'h-full' : 'h-1/2 mt-auto'}`} />
                    ))}
                  </div>

                  {/* Anomaly bars */}
                  {measurement.alerts.map(alert => {
                    const startPercent = (alert.startPos / measurement.productLength) * 100;
                    const widthPercent = (alert.length / measurement.productLength) * 100;
                    const hasDetails = !!alert.technicalDetails;
                    const isSelected = selectedAlertId === alert.id;

                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ scaleX: 0 }}
                        animate={{ 
                          scaleX: 1, 
                          backgroundColor: getSeverityColor(alert.severity),
                        }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        onClick={(e) => {
                          if (hasDetails) {
                            e.stopPropagation();
                            setSelectedAlertId(isSelected ? null : alert.id);
                          }
                        }}
                        className={`absolute top-0 bottom-0 origin-left mix-blend-multiply ${hasDetails ? 'cursor-pointer active:opacity-60' : ''}`}
                        style={{
                          left: `${startPercent}%`,
                          width: `${widthPercent}%`,
                          zIndex: isSelected ? 10 : 1,
                          border: isSelected ? '2px solid black' : 'none'
                        }}
                      />
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
                    const displayedAlerts = showMoreAlerts ? measurement.alerts : measurement.alerts.slice(0, maxDisplay);
                    const remainingCount = measurement.alerts.length - maxDisplay;

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

                          return (
                            <div 
                              key={alert.id} 
                              onClick={(e) => {
                                if (hasDetails) {
                                  e.stopPropagation();
                                  setSelectedAlertId(isSelected ? null : alert.id);
                                }
                              }}
                              className={`py-1.5 transition-all ${hasDetails ? 'active:opacity-60' : ''}`}
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-1.5 h-1.5 rounded-full shrink-0" 
                                  style={{ backgroundColor: getSeverityColor(alert.severity) }} 
                                />
                                <div className="flex-1 text-sm">
                                  <span className={`font-bold text-foreground ${hasDetails ? 'border-b-[1.5px] border-dotted border-foreground/80' : ''}`}>
                                    {config?.displayName || alert.anomalyType}:
                                  </span>
                                  <span className="text-muted-foreground ml-1 font-mono">
                                    {alert.startPos.toFixed(2)} - {endPos.toFixed(2)} mm
                                  </span>
                                </div>
                              </div>

                              <AnimatePresence>
                                {isSelected && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="ml-3.5 mt-1 pb-1">
                                      <p className="text-sm font-normal leading-relaxed text-foreground/70 italic">
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
                        ? 'bg-green-500 text-white'
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
              {measurement.alerts.map(alert => {
                const startPercent = (alert.startPos / measurement.productLength) * 100;
                const widthPercent = (alert.length / measurement.productLength) * 100;

                return (
                  <div
                    key={alert.id}
                    className="absolute top-0 bottom-0"
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: getSeverityColor(alert.severity)
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
}
