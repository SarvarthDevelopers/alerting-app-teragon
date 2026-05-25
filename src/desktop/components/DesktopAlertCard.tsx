import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { Measurement, Severity, DisplaySettings, AnomalyConfig, Alert } from '../../app/types';
import { getAnomalyConfig, getSystemDisplayName } from '../../app/data/mockData';
import { SeverityBadge } from '../../app/components/AlertBadge';
import { getRelativeTime, formatExpandedTime, getSeverityColor } from '../utils/formatters';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, History, X, Check, Info, FileText, ArrowLeft } from 'lucide-react';
import { DesktopInspectionSheet } from './DesktopInspectionSheet';

interface DesktopAlertCardProps {
  measurement: Measurement;
  showLargeUnit: boolean;
  setShowLargeUnit: (val: boolean) => void;
  showExactTime: boolean;
  setShowExactTime: (val: boolean) => void;
  onAcknowledge?: () => void;
  isSessionAck?: boolean;
  displaySettings: DisplaySettings;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  anomalyConfigs: AnomalyConfig[];
}

export const DesktopAlertCard = memo(({ 
  measurement, 
  showLargeUnit, 
  setShowLargeUnit,
  showExactTime,
  setShowExactTime,
  onAcknowledge,
  isSessionAck,
  displaySettings,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
  isExpanded: externalIsExpanded,
  onToggleExpand: externalOnToggleExpand,
  anomalyConfigs,
}: DesktopAlertCardProps) => {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  const setIsExpanded = (val: boolean) => {
    if (externalOnToggleExpand) {
      externalOnToggleExpand(val);
    } else {
      setInternalIsExpanded(val);
    }
  };

  const [scrubberPos, setScrubberPos] = useState<number | null>(null);
  const [isConfirmHighlight, setIsConfirmHighlight] = useState(false);
  const [hoveredAlertId, setHoveredAlertId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [showAcknowledgeForm, setShowAcknowledgeForm] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetActiveAlertId, setSheetActiveAlertId] = useState<string | null>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

  const springTransition = {
    type: 'spring',
    stiffness: 260,
    damping: 26,
    mass: 1
  } as const;

  const triggerHighlight = () => {
    setIsConfirmHighlight(true);
    setTimeout(() => setIsConfirmHighlight(false), 600);
  };

  // Reset internal states if card collapses, but keep selection for ruler persistence
  useEffect(() => {
    if (!isExpanded) {
      setShowAcknowledgeForm(false);
    }
  }, [isExpanded]);

  const handleResolve = () => {
    setIsResolving(true);
    setTimeout(() => {
      onAcknowledge?.();
      setIsExpanded(false);
      setIsResolving(false);
    }, 800);
  };

  const hasAlerts = measurement.alerts.length > 0;
  
  // Filter alerts based on active anomaly types
  const visibleAlerts = useMemo(() => {
    return measurement.alerts.filter(alert => {
      const config = anomalyConfigs.find(c => c.type === alert.anomalyType);
      return config?.isActive !== false;
    });
  }, [measurement.alerts, anomalyConfigs]);

  const hasManyAlerts = visibleAlerts.length > 5;
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 10;

  const totalPages = useMemo(() => {
    if (hasManyAlerts) return 0;
    return Math.ceil(visibleAlerts.length / PAGE_SIZE);
  }, [visibleAlerts, hasManyAlerts]);

  const paginatedAlerts = useMemo(() => {
    if (hasManyAlerts) {
      return [...visibleAlerts].sort((a, b) => a.startPos - b.startPos);
    }
    const sorted = [...visibleAlerts].sort((a, b) => a.startPos - b.startPos);
    const startIdx = currentPage * PAGE_SIZE;
    return sorted.slice(startIdx, startIdx + PAGE_SIZE);
  }, [visibleAlerts, currentPage, hasManyAlerts]);

  const rulerBounds = useMemo(() => {
    return { start: 0, end: measurement.productLength };
  }, [measurement.productLength]);

  interface AlertGroup {
    id: string;
    startPos: number;
    endPos: number;
    alerts: typeof visibleAlerts;
    highestSeverity: Severity;
  }

  const alertGroups = useMemo(() => {
    if (paginatedAlerts.length === 0) return [];
    
    const sorted = [...paginatedAlerts].sort((a, b) => a.startPos - b.startPos);
    
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
  }, [paginatedAlerts, measurement.productLength]);

  const activeAlerts = useMemo(() => visibleAlerts.filter(a => a.currentState === 'NEW'), [visibleAlerts]);
  const isAcknowledged = useMemo(() => isSessionAck || visibleAlerts.every(a => a.currentState === 'ACKNOWLEDGED'), [isSessionAck, visibleAlerts]);

  const timestamp = useMemo(() => new Date(measurement.timestamp), [measurement.timestamp]);
  const isOlderThan24h = useMemo(() => (new Date().getTime() - timestamp.getTime()) > 86400000, [timestamp]);

  const handleInteraction = (e: React.MouseEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setScrubberPos(percent);
  };

  const formatLength = (lengthMm: number, forceLarge?: boolean): string => {
    const isMetric = displaySettings.unitSystem === 'METRIC';
    const useLarge = forceLarge !== undefined ? forceLarge : showLargeUnit;

    if (isMetric) {
      if (useLarge) {
        return `${(lengthMm / 1000).toFixed(2)}m`;
      } else {
        return `${lengthMm.toFixed(2)}mm`;
      }
    } else {
      const inches = lengthMm / 25.4;
      if (useLarge) {
        return `${(inches / 12).toFixed(2)}ft`;
      } else {
        return `${inches.toFixed(2)}in`;
      }
    }
  };

  const timeDisplay = useMemo(() => {
    return isOlderThan24h || showExactTime 
      ? formatExpandedTime(measurement.timestamp)
      : getRelativeTime(measurement.timestamp);
  }, [isOlderThan24h, showExactTime, measurement.timestamp]);

  return (
    <motion.div
      transition={springTransition}
      exit={{ 
        opacity: 0, 
        x: 100,
        filter: 'blur(10px)',
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      }}
      onClick={() => { 
        if (isSelectionMode) {
          onToggleSelect?.(); 
        } else {
          setSelectedAlertId(null);
        }
      }}
      className={`group bg-card/80 backdrop-blur-xl border rounded-[32px] overflow-hidden transition-all duration-500 relative ${
        isSelectionMode && isSelected
          ? 'border-black ring-2 ring-black/10 shadow-2xl z-10 cursor-pointer'
          : isSelectionMode
          ? 'border-border/50 hover:border-black/30 cursor-pointer hover:bg-card shadow-sm'
          : isExpanded
          ? 'ring-4 ring-black/5 border-black/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] z-20'
          : 'border-border/60 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] hover:border-black/40 shadow-sm'
      }`}
    >
      {/* Success Overlay */}
      <AnimatePresence>
        {isResolving && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            className="absolute inset-0 z-[100] bg-emerald-500/90 flex flex-col items-center justify-center gap-6 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.2, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border border-white/30 shadow-2xl shadow-emerald-900/40"
            >
              <CheckCircle2 size={48} className="text-white" />
            </motion.div>
            <div className="text-center">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-black text-white uppercase tracking-[0.25em] block mb-2"
              >
                Resolved
              </motion.span>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 font-bold uppercase text-[10px] tracking-widest"
              >
                System State Updated
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex items-stretch ${hasAlerts ? 'min-h-[120px]' : 'min-h-[90px]'} ${isResolving ? 'blur-sm grayscale opacity-50' : ''} transition-all duration-500`}>

        {/* Selection Rail */}
        <AnimatePresence>
          {isSelectionMode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 48, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              className="flex items-center justify-center border-r border-border/50 shrink-0 overflow-hidden"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                  isSelected
                    ? 'bg-black border-black scale-110'
                    : 'border-muted-foreground/40 group-hover:border-foreground'
                }`}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.12 }}
                    >
                      <Check size={11} className="text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left: Identity */}
        <div className={`w-64 min-w-0 p-8 border-r border-border/40 flex flex-col justify-center bg-muted/5 group-hover:bg-muted/10 transition-colors ${!hasAlerts ? 'py-6' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] truncate">
              {getSystemDisplayName(measurement.system)}
            </span>
          </div>
          <h3 className={`text-2xl tracking-tighter transition-all duration-500 truncate w-full ${
            !hasAlerts 
              ? 'text-xl font-medium text-foreground/40' 
              : 'font-black text-foreground'
          }`} title={measurement.serialNumber}>
            {measurement.serialNumber}
          </h3>
          <div className="text-[10px] text-muted-foreground font-bold mt-2 flex items-center gap-2 bg-black/5 self-start px-2 py-1 rounded-lg max-w-full">
            <span className="truncate">{measurement.productType}</span>
            <span className="opacity-30 shrink-0">•</span>
            <span className="opacity-80 font-sans shrink-0">{formatLength(measurement.productLength)}</span>
          </div>
        </div>

        {/* Middle: Visualization (Ruler) */}
        <div 
          className={`flex-1 px-8 flex flex-col justify-center gap-4 relative ${!hasAlerts ? 'py-4' : 'py-6'}`}
        >
          {!hasAlerts ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-severity-ok shadow-[0_0_8px_var(--severity-ok)]" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Product Quality Verified</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLargeUnit(!showLargeUnit);
                }}
                className="text-[10px] font-bold text-foreground/80 hover:text-black transition-colors tabular-nums underline decoration-dotted underline-offset-4"
              >
                LENGTH: {formatLength(measurement.productLength)}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between w-full">
                {totalPages > 1 ? (
                  <span className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">
                    Viewport: {formatLength(rulerBounds.start)} - {formatLength(rulerBounds.end)}
                  </span>
                ) : <span />}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLargeUnit(!showLargeUnit);
                  }}
                  className="text-[10px] font-bold text-foreground/80 hover:text-black transition-colors tabular-nums underline decoration-dotted underline-offset-4"
                >
                  LENGTH: {formatLength(measurement.productLength)}
                </button>
              </div>

              <div className="relative">
                {/* Ruler Container - removed overflow-hidden for tooltip visibility */}
                <div
                  ref={rulerRef}
                  onMouseMove={handleInteraction}
                  onMouseLeave={() => setScrubberPos(null)}
                  className="h-10 bg-muted/50 rounded-xl relative border border-border/50 cursor-crosshair group/ruler"
                >
                  {/* Ruler background & markers layer */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    {/* Scale Markers */}
                    <div className="absolute inset-0 flex justify-between px-1 opacity-[0.07]">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className={`w-px bg-black ${i % 5 === 0 ? 'h-full' : 'h-1/2 mt-auto'}`} />
                      ))}
                    </div>
                  </div>

                  {/* Interactive Anomaly groups */}
                  {alertGroups.map((group) => {
                    const rulerSpan = rulerBounds.end - rulerBounds.start;
                    const startPercent = ((group.startPos - rulerBounds.start) / rulerSpan) * 100;
                    const endPercent = ((group.endPos - rulerBounds.start) / rulerSpan) * 100;
                    const widthPercent = Math.max(0.5, endPercent - startPercent);
                    const isGroupSelected = group.alerts.some(a => a.id === selectedAlertId);

                    const handleGroupClick = (e: React.MouseEvent) => {
                      e.stopPropagation();

                      if (hasManyAlerts) {
                        setSheetActiveAlertId(group.alerts[0].id);
                        setIsSheetOpen(true);
                        return;
                      }

                      let nextAlert: Alert | null = null;
                      if (group.alerts.length === 1) {
                        const alert = group.alerts[0];
                        setSelectedAlertId(selectedAlertId === alert.id ? null : alert.id);
                        nextAlert = selectedAlertId === alert.id ? null : alert;
                      } else {
                        const currentIndex = group.alerts.findIndex(a => a.id === selectedAlertId);
                        if (currentIndex === -1) {
                          nextAlert = group.alerts[0];
                          setSelectedAlertId(nextAlert.id);
                        } else {
                          const nextIndex = (currentIndex + 1) % group.alerts.length;
                          nextAlert = group.alerts[nextIndex];
                          setSelectedAlertId(nextAlert.id);
                        }
                      }

                      // Expand or sync shelf state
                      if (nextAlert) {
                        const hasDetails = !!nextAlert.technicalDetails;
                        if (hasDetails) {
                          setIsExpanded(true);
                        }
                      }
                      setShowAcknowledgeForm(false);
                    };

                    return (
                      <div
                        key={group.id}
                        className="absolute top-0 bottom-0"
                        style={{
                          left: `${startPercent}%`,
                          width: `${widthPercent}%`,
                          minWidth: '4px',
                          zIndex: isGroupSelected ? 35 : 20,
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
                          animate={{ 
                            opacity: selectedAlertId && !isGroupSelected ? 0.25 : 1,
                            backgroundColor: getSeverityColor(group.highestSeverity),
                            scaleY: isGroupSelected ? 1.3 : 1,
                          }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          onClick={handleGroupClick}
                          className={`w-full h-full rounded-none cursor-pointer ${
                            isGroupSelected ? 'ring-2 ring-black ring-inset shadow-lg' : 'hover:opacity-90'
                          }`}
                        />
                      </div>
                    );
                  })}

                  {/* Scrubber (Black Cursor) */}
                  <AnimatePresence>
                    {scrubberPos !== null && (
                      <motion.div 
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-0 bottom-0 w-[2px] bg-black z-50 pointer-events-none"
                        style={{ left: `${scrubberPos}%` }}
                      >
                        <motion.div 
                          initial={{ y: 10, opacity: 0, scale: 0.8 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          className="absolute top-0 -translate-x-1/2 -translate-y-[calc(100%+12px)] bg-black text-white px-3 py-1.5 rounded-full shadow-2xl text-[10px] font-black whitespace-nowrap flex items-center gap-2"
                        >
                          <span className="opacity-60 font-medium uppercase tracking-tighter">Pos</span>
                          {formatLength(rulerBounds.start + (scrubberPos / 100) * (rulerBounds.end - rulerBounds.start))}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-black" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                {(hasManyAlerts ? visibleAlerts.slice(0, 5) : paginatedAlerts).map((alert) => {
                  const config = anomalyConfigs.find(c => c.type === alert.anomalyType);
                  const endPos = Math.min(alert.startPos + alert.length, measurement.productLength);
                  const isSelectedForDetail = selectedAlertId === alert.id;
                  const hasDetails = !!alert.technicalDetails;

                  return (
                    <motion.div 
                      key={alert.id} 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasManyAlerts) {
                          setSheetActiveAlertId(alert.id);
                          setIsSheetOpen(true);
                        } else {
                          setSelectedAlertId(alert.id);
                          if (hasDetails) {
                            setIsExpanded(true);
                          } else {
                            setIsExpanded(false);
                          }
                          setShowAcknowledgeForm(false);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-2xl border backdrop-blur-sm transition-all cursor-pointer ${
                        isSelectedForDetail && !hasManyAlerts
                          ? 'bg-[#0a0a0a] border-black text-white' 
                          : 'bg-black/5 border-black/10 text-foreground/80 hover:border-black/30'
                      }`}
                    >
                      <div 
                        className={`w-2 h-2 rounded-full shadow-sm transition-transform duration-300 ${isSelectedForDetail && !hasManyAlerts ? 'scale-125' : ''}`} 
                        style={{ backgroundColor: getSeverityColor(alert.severity) }} 
                      />
                      <span className={`text-[10px] font-black tracking-tight ${isSelectedForDetail && !hasManyAlerts ? 'text-white' : 'text-foreground/80'}`}>
                        {config?.displayName || alert.anomalyType}
                      </span>
                      <span className={`text-[10px] font-bold tabular-nums ${isSelectedForDetail && !hasManyAlerts ? 'text-white/60' : 'text-muted-foreground'}`}>
                        {formatLength(alert.startPos)} - {formatLength(endPos)}
                      </span>
                      {hasDetails && (
                        <div className={`ml-1 w-4.5 h-4.5 rounded-full flex items-center justify-center transition-colors ${isSelectedForDetail && !hasManyAlerts ? 'bg-white/20' : 'bg-black/5'}`}>
                          <Info size={11} className={`${isSelectedForDetail && !hasManyAlerts ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {hasManyAlerts && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSheetActiveAlertId(null);
                      setIsSheetOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-black/10 bg-[#dedede] text-foreground font-black text-[10px] hover:bg-black/5 transition-all cursor-pointer font-sans"
                  >
                    + {visibleAlerts.length - 5} MORE / INSPECT ALL
                  </button>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-border/30">
                  <button 
                    disabled={currentPage === 0}
                    onClick={(e) => { e.stopPropagation(); setCurrentPage(p => p - 1); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/5 text-foreground/80 hover:text-black'}`}
                  >
                    <ArrowLeft size={12} /> Prev
                  </button>
                  
                  <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                    Page {currentPage + 1} of {totalPages}
                  </span>

                  <button 
                    disabled={currentPage === totalPages - 1}
                    onClick={(e) => { e.stopPropagation(); setCurrentPage(p => p + 1); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${currentPage === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/5 text-foreground/80 hover:text-black'}`}
                  >
                    Next <ArrowLeft size={12} className="rotate-180" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Status & Actions */}
        <div className={`w-52 p-6 flex flex-col justify-center items-end border-l border-border/50 gap-3 ${!hasAlerts ? 'py-4' : ''}`}>
          <div className="flex flex-col items-end">
            {hasAlerts ? (
              <div className="flex items-center gap-2 mt-1">
                <SeverityBadge severity={measurement.alerts[0].severity} size="sm" />
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1 bg-severity-ok/10 px-3 py-1 rounded-full border border-severity-ok/20">
                <span className="text-[10px] font-black text-severity-ok uppercase tracking-widest">OK</span>
                <CheckCircle2 size={14} className="text-severity-ok" />
              </div>
            )}
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (!isOlderThan24h) setShowExactTime(!showExactTime);
            }}
            className={`text-[10px] font-black text-foreground/80 hover:text-black flex items-center gap-1.5 transition-colors ${!isOlderThan24h ? 'cursor-pointer underline decoration-dotted underline-offset-4' : 'cursor-default'}`}
          >
            <History size={12} />
            {timeDisplay}
          </button>

          {hasAlerts && (
            <div className="w-full">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={isAcknowledged ? 'ack-status' : 'ack-btn'}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle expanded state if clicking the primary status button
                      if (isExpanded && !selectedAlertId) {
                        setIsExpanded(false);
                        setShowAcknowledgeForm(false);
                      } else {
                        setIsExpanded(true);
                        // Only show form if not already acknowledged
                        if (!isAcknowledged) {
                          setShowAcknowledgeForm(true);
                        }
                        setSelectedAlertId(null);
                      }
                    }}
                    className={`mt-2 w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-200 ${
                      isAcknowledged
                        ? 'bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/10 hover:bg-[#0071e3]/20'
                        : (isExpanded && showAcknowledgeForm)
                        ? 'bg-transparent text-black/40 border border-black/10 hover:border-black/20 hover:text-black/60'
                        : 'bg-secondary text-secondary-foreground/80 border border-secondary hover:bg-black hover:text-white hover:border-black'
                    }`}
                  >
                    <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge'}</span>
                    {(isExpanded && (showAcknowledgeForm || isAcknowledged)) && (
                      <X size={14} className={isAcknowledged ? 'text-[#0071e3]/60' : 'text-black/30'} />
                    )}
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            layout
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="border-t border-border/50 bg-white overflow-hidden flex flex-col rounded-b-[32px]"
          >
            {/* Anomaly Pill Shelf Removed in favor of inline pagination */}
            <div className="relative w-full">
            <AnimatePresence mode="popLayout" initial={false}>
            {(() => {
              const selectedAlert = measurement.alerts.find(a => a.id === selectedAlertId);
              
              if (selectedAlertId && selectedAlert?.technicalDetails) {
                return (
                  <motion.div 
                    key={'details-' + selectedAlertId}
                    initial={{ opacity: 0, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(4px)' }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="border-t border-border/40 min-h-[120px] flex items-stretch w-full rounded-b-[32px]"
                  >
                    <div className="flex-1 flex items-stretch">
                      {isSelectionMode && (
                        <div className="border-r border-border/40 shrink-0 w-[48px]" />
                      )}

                      <div className="w-64 px-8 border-r border-border/40 h-full flex flex-col justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-1.5">
                          {anomalyConfigs.find(c => c.type === selectedAlert.anomalyType)?.displayName || selectedAlert.anomalyType}
                        </span>
                        <span className="text-[11px] font-bold text-muted-foreground font-sans">
                          {formatLength(selectedAlert.startPos)} - {formatLength(selectedAlert.startPos + selectedAlert.length)}
                        </span>
                      </div>

                      <div className="flex-1 px-10 py-6 border-r border-border/40 h-full flex items-center">
                        <p className="text-sm font-medium text-foreground/80 italic leading-relaxed">
                          {selectedAlert.technicalDetails}
                        </p>
                      </div>

                      <div className="w-52 px-6 h-full flex items-center justify-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAlertId(null);
                            setIsExpanded(false);
                          }}
                          className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black hover:underline transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              if (isAcknowledged) {
                return (
                  <motion.div 
                    key="ack-details"
                    initial={{ opacity: 0, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(4px)' }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="border-t border-border/40 min-h-[120px] flex items-stretch w-full rounded-b-[32px]"
                  >
                    <div className="flex-1 flex items-stretch">
                      {isSelectionMode && (
                        <div className="border-r border-border/40 shrink-0 w-[48px]" />
                      )}

                      <div className="flex-1 px-12 py-6 border-r border-border/40 flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 shadow-inner bg-[#0071e3]/5 border border-[#0071e3]/10">
                          <CheckCircle2 size={32} className="text-[#0071e3]" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-foreground tracking-tight">
                            Resolution Details
                          </h4>
                          <p className="text-xs text-muted-foreground font-bold mt-1.5 leading-relaxed max-w-2xl">
                            Verified and acknowledged by <span className="text-black underline decoration-emerald-500 decoration-2 underline-offset-4">John Supervisor</span> on {new Date(measurement.timestamp).toLocaleDateString()} at {new Date(measurement.timestamp).toLocaleTimeString()}.
                          </p>
                        </div>
                      </div>

                      <div className="w-52 px-6 h-full flex items-center justify-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(false);
                          }}
                          className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black hover:underline transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              if (showAcknowledgeForm) {
                return (
                  <motion.div 
                    key="ack-form"
                    initial={{ opacity: 0, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(4px)' }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="px-12 py-10 flex items-center justify-between gap-12 min-h-[120px] w-full rounded-b-[32px]"
                  >
                    <div className="flex items-center gap-8 flex-1">
                      <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 shadow-inner bg-black/5 border border-black/10`}>
                        <CheckCircle2 size={32} className="text-black opacity-30" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-foreground tracking-tight">
                          Confirm Acknowledgment
                        </h4>
                        <p className="text-xs text-muted-foreground font-bold mt-1.5 leading-relaxed max-w-xl">
                          Acknowledging these {visibleAlerts.length} anomalies will mark them as reviewed for production line tracking. This action is recorded under your supervisor profile.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <motion.button 
                        animate={isConfirmHighlight ? { scale: [1, 1.05, 1], filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'] } : {}}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve();
                        }}
                        className="px-10 py-4 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 font-sans"
                      >
                        Confirm & Resolve
                      </motion.button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAcknowledgeForm(false);
                          setIsExpanded(false);
                        }}
                        className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-red-500/60 hover:text-red-500 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </motion.div>
                );
              }

              return null;
            })()}
            </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <DesktopInspectionSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        measurement={measurement}
        anomalyConfigs={anomalyConfigs}
        displaySettings={displaySettings}
        onAcknowledge={onAcknowledge}
        isSessionAck={isSessionAck}
        showLargeUnit={showLargeUnit}
        setShowLargeUnit={setShowLargeUnit}
        initialActiveAlertId={sheetActiveAlertId}
      />
    </motion.div>
  );
});
