import { useState, useRef } from 'react';
import { Measurement, Severity } from '../../app/types';
import { getAnomalyConfig, getSystemDisplayName } from '../../app/data/mockData';
import { displaySettings } from '../../app/data/settingsData';
import { SeverityBadge } from '../../app/components/AlertBadge';
import { getRelativeTime, formatExpandedTime, getSeverityColor } from '../utils/formatters';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Maximize2, CheckCircle2, History, X } from 'lucide-react';

interface DesktopAlertCardProps {
  measurement: Measurement;
  showLargeUnit: boolean;
  setShowLargeUnit: (val: boolean) => void;
  onAcknowledge?: () => void;
  isSessionAck?: boolean;
}

export function DesktopAlertCard({ 
  measurement, 
  showLargeUnit, 
  setShowLargeUnit,
  onAcknowledge,
  isSessionAck 
}: DesktopAlertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [scrubberPos, setScrubberPos] = useState<number | null>(null);
  const [showExactTime, setShowExactTime] = useState(false);
  const [isConfirmHighlight, setIsConfirmHighlight] = useState(false);
  const [hoveredAlertId, setHoveredAlertId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const rulerRef = useRef<HTMLDivElement>(null);

  const triggerHighlight = () => {
    setIsConfirmHighlight(true);
    setTimeout(() => setIsConfirmHighlight(false), 600);
  };

  const handleResolve = () => {
    setIsResolving(true);
    setTimeout(() => {
      onAcknowledge?.();
      setIsExpanded(false);
    }, 800);
  };

  const hasAlerts = measurement.alerts.length > 0;
  const activeAlerts = measurement.alerts.filter(a => a.currentState === 'NEW');
  const isAcknowledged = isSessionAck || measurement.alerts.every(a => a.currentState === 'ACKNOWLEDGED');

  const timestamp = new Date(measurement.timestamp);
  const isOlderThan24h = (new Date().getTime() - timestamp.getTime()) > 86400000;

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
        return `${lengthMm.toLocaleString()}mm`;
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

  const timeDisplay = isOlderThan24h || showExactTime 
    ? formatExpandedTime(measurement.timestamp)
    : getRelativeTime(measurement.timestamp);

  return (
    <motion.div
      layout
      exit={{ 
        opacity: 0, 
        x: 100,
        filter: 'blur(10px)',
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      }}
      className={`group bg-card border border-border/50 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:border-black relative ${
        isExpanded ? 'ring-2 ring-black/5 border-black shadow-xl' : ''
      }`}
    >
      {/* Success Overlay */}
      <AnimatePresence>
        {isResolving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[100] bg-emerald-500 flex items-center justify-center gap-4 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 size={32} className="text-white" />
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-black text-white uppercase tracking-widest"
            >
              Resolved
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex items-stretch ${hasAlerts ? 'min-h-[120px]' : 'min-h-[90px]'} ${isResolving ? 'blur-sm grayscale opacity-50' : ''} transition-all duration-500`}>
        {/* Left: Identity */}
        <div className={`w-64 p-6 border-r border-border/50 flex flex-col justify-center bg-muted/5 group-hover:bg-transparent transition-colors ${!hasAlerts ? 'py-4' : ''}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {getSystemDisplayName(measurement.system)}
            </span>
          </div>
          <h3 className={`text-xl tracking-tight transition-colors ${
            !hasAlerts 
              ? 'text-lg font-normal text-foreground/60' 
              : 'font-black text-foreground'
          }`}>
            {measurement.serialNumber}
          </h3>
          <div className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1">
            <span>{measurement.productType}</span>
            <span>•</span>
            <span className="opacity-60">{measurement.productLength}mm</span>
          </div>
        </div>

        {/* Middle: Visualization (Ruler) */}
        <div 
          className={`flex-1 px-8 flex flex-col justify-center gap-4 relative ${!hasAlerts ? 'py-4' : 'py-6'}`}
        >
          {!hasAlerts ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
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
                    <div className="absolute inset-0 flex justify-between px-1 opacity-20">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className={`w-px bg-foreground ${i % 5 === 0 ? 'h-full' : 'h-1/2 mt-auto'}`} />
                      ))}
                    </div>

                    {/* Alerts / Anomalies */}
                    {measurement.alerts.map((alert) => {
                      const startPercent = (alert.startPos / measurement.productLength) * 100;
                      const widthPercent = (alert.length / measurement.productLength) * 100;
                      const isHovered = hoveredAlertId === alert.id;
                      return (
                        <motion.div
                          key={alert.id}
                          initial={{ scaleX: 0 }}
                          animate={{ 
                            scaleX: 1,
                            scaleY: isHovered ? 1.2 : 1,
                            opacity: hoveredAlertId && !isHovered ? 0.4 : 1,
                            backgroundColor: getSeverityColor(alert.severity)
                          }}
                          transition={{ 
                            duration: 0.2,
                            ease: 'easeOut'
                          }}
                          onMouseEnter={() => setHoveredAlertId(alert.id)}
                          onMouseLeave={() => setHoveredAlertId(null)}
                          className="absolute top-0 bottom-0 origin-left mix-blend-multiply cursor-help pointer-events-auto"
                          style={{
                            left: `${startPercent}%`,
                            width: `${widthPercent}%`,
                            zIndex: isHovered ? 10 : 1
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Scrubber (Black Cursor) */}
                  {scrubberPos !== null && (
                    <div 
                      className="absolute top-0 bottom-0 w-[2px] bg-black z-50 pointer-events-none"
                      style={{ left: `${scrubberPos}%` }}
                    >
                      <div className="absolute top-0 -translate-x-1/2 -translate-y-[calc(100%+8px)] bg-black text-white px-2 py-1 rounded shadow-2xl text-[10px] font-black whitespace-nowrap">
                        {formatLength((scrubberPos / 100) * measurement.productLength)}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                {measurement.alerts.map((alert) => {
                  const config = getAnomalyConfig(alert.anomalyType);
                  const endPos = Math.min(alert.startPos + alert.length, measurement.productLength);
                  const isHovered = hoveredAlertId === alert.id;
                  return (
                    <motion.div 
                      key={alert.id} 
                      onMouseEnter={() => setHoveredAlertId(alert.id)}
                      onMouseLeave={() => setHoveredAlertId(null)}
                      animate={{
                        scale: isHovered ? 1.05 : 1,
                        backgroundColor: isHovered ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.05)',
                        borderColor: isHovered ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.05)',
                        opacity: hoveredAlertId && !isHovered ? 0.6 : 1,
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border cursor-default"
                    >
                      <div 
                        className="w-2 h-2 rounded-full shadow-sm" 
                        style={{ backgroundColor: getSeverityColor(alert.severity) }} 
                      />
                      <span className="text-[10px] font-black text-foreground/80 tracking-tight">
                        {config?.displayName}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                        {alert.startPos} - {endPos}mm
                      </span>
                    </motion.div>
                  );
                })}
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
                {isAcknowledged && <CheckCircle2 size={16} className="text-emerald-500" />}
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">OK</span>
                <CheckCircle2 size={14} className="text-emerald-500" />
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
                  {!isExpanded ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(true);
                      }}
                      className={`mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                        isAcknowledged
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                          : 'bg-[#eeeeee] text-foreground hover:bg-black hover:text-white shadow-sm hover:shadow-black/5'
                      }`}
                    >
                      {isAcknowledged ? 'Acknowledged' : 'Acknowledge'}
                      <CheckCircle2 size={14} className={isAcknowledged ? 'text-emerald-500' : ''} />
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHighlight();
                      }}
                      className="mt-2 w-full h-[44px] flex items-center justify-center bg-black/5 rounded-2xl border border-black/5 cursor-pointer hover:bg-black/10 transition-colors"
                    >
                       <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Awaiting</p>
                    </button>
                  )}
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="border-t border-border/50 bg-muted/5 overflow-hidden"
          >
            {isAcknowledged ? (
              <div className="p-8 flex items-center justify-between max-w-5xl mx-auto gap-12">
                <div className="flex items-center gap-6 flex-1">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-foreground tracking-tight">Resolution Details</h4>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      This measurement was acknowledged by <span className="text-foreground font-bold">John Supervisor</span> on {new Date(measurement.timestamp).toLocaleDateString()} at {new Date(measurement.timestamp).toLocaleTimeString()}.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                    className="px-8 py-3 rounded-xl bg-card border border-border text-[10px] font-black uppercase tracking-widest hover:border-black transition-all"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 flex items-center justify-between max-w-5xl mx-auto gap-12">
                <div className="flex items-center gap-6 flex-1">
                  <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center shrink-0">
                    <CheckCircle2 size={28} className="text-black opacity-30" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-foreground tracking-tight">Confirm Acknowledgment</h4>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      Validated by supervisor. Acknowledging {measurement.alerts.length} anomalies for {measurement.serialNumber}.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                <motion.button 
                  animate={isConfirmHighlight ? { scale: [1, 1.05, 1], filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'] } : {}}
                  transition={{ duration: 0.4, repeat: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResolve();
                  }}
                  className="px-8 py-3 rounded-xl bg-[#10b981] text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:scale-[1.05] active:scale-95 transition-all"
                >
                  Confirm & Resolve
                </motion.button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                    className="px-6 py-3 rounded-xl bg-red-50 text-red-500 border border-red-100 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
