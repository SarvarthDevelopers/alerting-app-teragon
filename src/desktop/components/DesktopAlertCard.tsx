import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { Measurement, Severity, DisplaySettings, AnomalyConfig } from '../../app/types';
import { getAnomalyConfig, getSystemDisplayName } from '../../app/data/mockData';
import { SeverityBadge } from '../../app/components/AlertBadge';
import { getRelativeTime, formatExpandedTime, getSeverityColor } from '../utils/formatters';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, History, X, Check, Info, FileText, ArrowLeft } from 'lucide-react';

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
  const [showMoreShelf, setShowMoreShelf] = useState(false);
  const rulerRef = useRef<HTMLDivElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const dragData = useRef({ isDragging: false, startX: 0, scrollLeft: 0 });

  const handleShelfMouseDown = (e: React.MouseEvent) => {
    if (!shelfRef.current) return;
    dragData.current.isDragging = true;
    dragData.current.startX = e.pageX - shelfRef.current.offsetLeft;
    dragData.current.scrollLeft = shelfRef.current.scrollLeft;
  };

  const handleShelfMouseLeave = () => { dragData.current.isDragging = false; };
  const handleShelfMouseUp = () => { dragData.current.isDragging = false; };

  const handleShelfMouseMove = (e: React.MouseEvent) => {
    if (!dragData.current.isDragging || !shelfRef.current) return;
    e.preventDefault();
    const x = e.pageX - shelfRef.current.offsetLeft;
    const walk = (x - dragData.current.startX) * 2;
    shelfRef.current.scrollLeft = dragData.current.scrollLeft - walk;
  };

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
      setShowMoreShelf(false);
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
      onClick={() => { if (isSelectionMode) onToggleSelect?.(); }}
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
        <div className={`w-64 p-8 border-r border-border/40 flex flex-col justify-center bg-muted/5 group-hover:bg-muted/10 transition-colors ${!hasAlerts ? 'py-6' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
              {getSystemDisplayName(measurement.system)}
            </span>
          </div>
          <h3 className={`text-2xl tracking-tighter transition-all duration-500 ${
            !hasAlerts 
              ? 'text-xl font-medium text-foreground/40' 
              : 'font-black text-foreground'
          }`}>
            {measurement.serialNumber}
          </h3>
          <div className="text-[10px] text-muted-foreground font-bold mt-2 flex items-center gap-2 bg-black/5 self-start px-2 py-1 rounded-lg">
            <span>{measurement.productType}</span>
            <span className="opacity-30">•</span>
            <span className="opacity-80 font-sans">{formatLength(measurement.productLength)}</span>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Anomalies Detected</span>
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

              <div className="relative">
                {/* Ruler Container - removed overflow-hidden for tooltip visibility */}
                <div
                  ref={rulerRef}
                  onMouseMove={handleInteraction}
                  onMouseLeave={() => setScrubberPos(null)}
                  className="h-10 bg-muted/50 rounded-xl relative border border-border/50 cursor-crosshair group/ruler"
                >
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    {/* Scale Markers */}
                    <div className="absolute inset-0 flex justify-between px-1 opacity-[0.07]">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className={`w-px bg-black ${i % 5 === 0 ? 'h-full' : 'h-1/2 mt-auto'}`} />
                      ))}
                    </div>

                    {/* Alerts / Anomalies */}
                    {visibleAlerts.map((alert) => {
                      const startPercent = (alert.startPos / measurement.productLength) * 100;
                      const widthPercent = (alert.length / measurement.productLength) * 100;
                      const isSelected = selectedAlertId === alert.id;
                      
                      return (
                        <motion.div
                          key={alert.id}
                          initial={{ scaleX: 0 }}
                          animate={{ 
                            scaleX: 1,
                            opacity: selectedAlertId && !isSelected ? 0.25 : 1,
                            backgroundColor: getSeverityColor(alert.severity),
                            scaleY: isSelected ? 1.4 : 1,
                            zIndex: isSelected ? 30 : 10,
                          }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className={`absolute top-0 bottom-0 origin-left mix-blend-multiply ${
                            isSelected ? 'ring-2 ring-black ring-inset shadow-lg' : ''
                          }`}
                          style={{
                            left: `${startPercent}%`,
                            width: `${widthPercent}%`,
                            borderRadius: isSelected ? '6px' : '2px'
                          }}
                        />
                      );
                    })}
                  </div>

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
                          {formatLength((scrubberPos / 100) * measurement.productLength)}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-black" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                {(() => {
                  const maxDisplay = 4;
                  const displayedAlerts = visibleAlerts.slice(0, maxDisplay);
                  const remainingCount = visibleAlerts.length - maxDisplay;

                  return (
                    <>
                      {displayedAlerts.map((alert) => {
                        const config = anomalyConfigs.find(c => c.type === alert.anomalyType);
                        const endPos = Math.min(alert.startPos + alert.length, measurement.productLength);
                        const isHovered = hoveredAlertId === alert.id;
                        const hasDetails = !!alert.technicalDetails;
                        const isSelectedForDetail = selectedAlertId === alert.id;

                        return (
                          <motion.div 
                            key={alert.id} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAlertId(alert.id);
                              const hasDetails = !!alert.technicalDetails;
                              
                              if (hasDetails) {
                                setIsExpanded(true);
                              } else {
                                if (!showMoreShelf) {
                                  setIsExpanded(false);
                                }
                                setShowAcknowledgeForm(false);
                              }
                              
                              setShowAcknowledgeForm(false);
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-2xl border backdrop-blur-sm transition-all cursor-pointer ${
                              isSelectedForDetail 
                                ? 'bg-[#0a0a0a] border-black text-white' 
                                : 'bg-black/5 border-black/10 text-foreground/80 hover:border-black/30'
                            }`}
                          >
                            <div 
                              className={`w-2 h-2 rounded-full shadow-sm transition-transform duration-300 ${isSelectedForDetail ? 'scale-125' : ''}`} 
                              style={{ backgroundColor: getSeverityColor(alert.severity) }} 
                            />
                            <span className={`text-[10px] font-black tracking-tight ${isSelectedForDetail ? 'text-white' : 'text-foreground/80'}`}>
                              {config?.displayName || alert.anomalyType}
                            </span>
                            <span className={`text-[10px] font-bold tabular-nums ${isSelectedForDetail ? 'text-white/60' : 'text-muted-foreground'}`}>
                              {formatLength(alert.startPos)} - {formatLength(endPos)}
                            </span>
                            {hasDetails && (
                              <div className={`ml-1 w-4.5 h-4.5 rounded-full flex items-center justify-center transition-colors ${isSelectedForDetail ? 'bg-white/20' : 'bg-black/5'}`}>
                                <Info size={11} className={`${isSelectedForDetail ? 'text-white' : 'text-muted-foreground'}`} />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                      {remainingCount > 0 && (
                        <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (showMoreShelf) {
                            // The Slick Reset: Pack everything away when closing the shelf
                            setShowMoreShelf(false);
                            setIsExpanded(false);
                            setSelectedAlertId(null);
                          } else {
                            setIsExpanded(true);
                            setShowMoreShelf(true);
                            setShowAcknowledgeForm(false);
                            const nextFoldAlerts = visibleAlerts.slice(4);
                            if (nextFoldAlerts.length > 0) {
                              setSelectedAlertId(nextFoldAlerts[0].id);
                            }
                          }
                        }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-foreground/20 bg-foreground/5 cursor-pointer hover:bg-foreground/10 transition-colors"
                        >
                          {showMoreShelf ? (
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-foreground/50 flex items-center gap-1.5">
                              <X size={12} /> CLOSE
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-foreground tracking-tight uppercase">
                              + {remainingCount} MORE
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
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
            {/* Anomaly Pill Shelf (Only if explicitly requested via "+N more") */}
            {showMoreShelf && (
              <motion.div layout="position" className="border-b border-border/40 bg-black/[0.02] w-full relative">
              <div 
                ref={shelfRef}
                onMouseDown={handleShelfMouseDown}
                onMouseLeave={handleShelfMouseLeave}
                onMouseUp={handleShelfMouseUp}
                onMouseMove={handleShelfMouseMove}
                className="flex items-center gap-3 overflow-x-auto px-8 pt-3 pb-[5px] cursor-grab active:cursor-grabbing select-none -scale-y-100 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 hover:[&::-webkit-scrollbar-thumb]:bg-black/20 [&::-webkit-scrollbar-thumb]:rounded-full"
              >
                {visibleAlerts.slice(4).map((alert) => {
                  const isSelected = selectedAlertId === alert.id;
                  const config = anomalyConfigs.find(c => c.type === alert.anomalyType);
                  return (
                    <div key={alert.id} className="-scale-y-100 flex-none">
                      <motion.button
                        layout="position"
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${
                          isSelected 
                            ? 'bg-[#0a0a0a] border-black text-white' 
                            : 'bg-white/80 backdrop-blur-sm border-black/10 hover:border-black/30'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlertId(alert.id);
                          const hasDetails = !!alert.technicalDetails;
                          
                          if (hasDetails) {
                            setIsExpanded(true);
                          } else {
                            setShowAcknowledgeForm(false);
                          }
                        }}
                      >
                        <div 
                          className={`w-2 h-2 rounded-full shadow-sm transition-transform ${isSelected ? 'scale-110' : ''}`} 
                          style={{ backgroundColor: getSeverityColor(alert.severity) }} 
                        />
                        <span className={`text-[10px] font-black tracking-tight ${isSelected ? 'text-white' : 'text-foreground/80'}`}>
                          {config?.displayName || alert.anomalyType}
                        </span>
                          <span className={`text-[10px] font-bold tabular-nums ${isSelected ? 'text-white/60' : 'text-black/40'}`}>
                            {formatLength(alert.startPos)} - {formatLength(Math.min(alert.startPos + alert.length, measurement.productLength))}
                          </span>
                        {!!alert.technicalDetails && (
                          <div className={`ml-1 w-4.5 h-4.5 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-white/10' : 'bg-black/5'}`}>
                            <Info size={11} className={isSelected ? 'text-white' : 'text-muted-foreground'} />
                          </div>
                        )}
                      </motion.button>
                    </div>
                  );
                })}
                 <div className="w-4 shrink-0 -scale-y-100" />
              </div>
            </motion.div>
            )}
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
    </motion.div>
  );
});
