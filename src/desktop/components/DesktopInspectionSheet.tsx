import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';
import { Measurement, AnomalyConfig, DisplaySettings, Severity } from '../../app/types';
import { getSystemDisplayName } from '../../app/data/mockData';
import { getSeverityColor } from '../utils/formatters';

interface DesktopInspectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  measurement: Measurement;
  anomalyConfigs: AnomalyConfig[];
  displaySettings: DisplaySettings;
  onAcknowledge?: () => void;
  isSessionAck?: boolean;
  showLargeUnit: boolean;
  setShowLargeUnit: (val: boolean) => void;
  initialActiveAlertId?: string | null;
}

export function DesktopInspectionSheet({
  isOpen,
  onClose,
  measurement,
  anomalyConfigs,
  displaySettings,
  onAcknowledge,
  isSessionAck,
  showLargeUnit,
  setShowLargeUnit,
  initialActiveAlertId
}: DesktopInspectionSheetProps) {
  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);
  const listRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setListElement(node);
    }
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);



  // Filter alerts based on active anomaly types
  const visibleAlerts = useMemo(() => {
    return measurement.alerts.filter(alert => {
      const config = anomalyConfigs.find(c => c.type === alert.anomalyType);
      return config?.isActive !== false;
    });
  }, [measurement.alerts, anomalyConfigs]);

  const isAcknowledged = isSessionAck || visibleAlerts.every(a => a.currentState === 'ACKNOWLEDGED');
  const hasActiveAlerts = visibleAlerts.some(a => a.currentState === 'NEW') && !isSessionAck;

  const formatLength = useCallback((mm: number): string => {
    const isMetric = displaySettings.unitSystem === 'METRIC';
    if (isMetric) {
      if (showLargeUnit) {
        return `${(mm / 1000).toFixed(2)} m`;
      } else {
        return `${Number(mm.toFixed(2)).toLocaleString()} mm`;
      }
    } else {
      const inches = mm / 25.4;
      if (showLargeUnit) {
        return `${(inches / 12).toFixed(2)} ft`;
      } else {
        return `${Number(inches.toFixed(2)).toLocaleString()} in`;
      }
    }
  }, [displaySettings.unitSystem, showLargeUnit]);

  // Sort alerts by position
  const sortedAlerts = useMemo(() => {
    return [...visibleAlerts].sort((a, b) => a.startPos - b.startPos);
  }, [visibleAlerts]);

  // Dynamic ruler window state tracking what is currently visible in the list viewport
  const [visibleWindow, setVisibleWindow] = useState({ start: 0, end: measurement.productLength });
  const [scrubberPos, setScrubberPos] = useState<number | null>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

  // Sync activeIndex with initialActiveAlertId if provided when sheet opens
  useEffect(() => {
    if (isOpen && initialActiveAlertId && sortedAlerts.length > 0) {
      const idx = sortedAlerts.findIndex(a => a.id === initialActiveAlertId);
      if (idx !== -1) {
        setActiveIndex(idx);
        
        // Wait for sheet mounting and transitions
        const timer = setTimeout(() => {
          const element = listElement?.querySelector(`[data-alert-id="${initialActiveAlertId}"]`);
          if (element && listElement) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, initialActiveAlertId, sortedAlerts, listElement]);

  // Reset internal acknowledgment states when opening
  useEffect(() => {
    if (isOpen) {
      setShowConfirmation(false);
      setIsAcknowledging(false);
    }
  }, [isOpen]);

  // Derived active position
  const activeMm = sortedAlerts[activeIndex]?.startPos || 0;

  const windowRange = useMemo(() => {
    return Math.max(100, visibleWindow.end - visibleWindow.start);
  }, [visibleWindow]);

  // Playhead position percent
  const playheadPct = useMemo(() => {
    return ((activeMm - visibleWindow.start) / windowRange) * 100;
  }, [activeMm, visibleWindow.start, windowRange]);

  // Filter visible bars that overlap with the current zoomed window
  const visibleBars = useMemo(() => {
    return sortedAlerts
      .map((alert, i) => {
        const barEnd = alert.startPos + alert.length;
        const overlaps = alert.startPos < visibleWindow.end && barEnd > visibleWindow.start;
        if (!overlaps) return null;

        const leftPct = ((alert.startPos - visibleWindow.start) / windowRange) * 100;
        const widthPct = (alert.length / windowRange) * 100;

        return { alert, index: i, leftPct, widthPct };
      })
      .filter(Boolean) as { alert: typeof sortedAlerts[0]; index: number; leftPct: number; widthPct: number }[];
  }, [sortedAlerts, visibleWindow, windowRange]);

  // Dynamic tick spacing based on current zoom level
  const tickSpacing = useMemo(() => {
    const range = visibleWindow.end - visibleWindow.start;
    if (range <= 1000) return 100; // 10 cm spacing for close zoom
    if (range <= 2500) return 250; // 25 cm spacing
    if (range <= 5000) return 500; // 50 cm spacing
    return 1000; // 1 meter spacing
  }, [visibleWindow]);

  const handleInteraction = (e: React.MouseEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setScrubberPos(percent);
  };

  // Generate tick marks using absolute math
  const ticks = useMemo(() => {
    const firstTick = Math.floor(visibleWindow.start / tickSpacing) * tickSpacing;
    const result = [];

    for (let tickMm = firstTick; tickMm <= visibleWindow.end + tickSpacing; tickMm += tickSpacing) {
      if (tickMm >= 0 && tickMm <= measurement.productLength) {
        const pct = ((tickMm - visibleWindow.start) / windowRange) * 100;
        if (pct >= -10 && pct <= 110) {
          result.push({
            mm: tickMm,
            pct,
            label: formatLength(tickMm),
          });
        }
      }
    }
    return result;
  }, [visibleWindow.start, visibleWindow.end, tickSpacing, windowRange, measurement.productLength, formatLength]);

  const handleAcknowledge = () => {
    setShowConfirmation(false);
    setIsAcknowledging(true);
    setTimeout(() => {
      onAcknowledge?.();
      setIsAcknowledging(false);
      onClose();
    }, 500);
  };

  // Center-tracking scroll logic that dynamically updates the visible window
  // Viewport scroll logic that dynamically updates the visible window
  useEffect(() => {
    if (!listElement) return;

    const handleScroll = () => {
      const rows = listElement.querySelectorAll<HTMLDivElement>('.anomaly-row');
      if (rows.length === 0) return;

      const visibleIndices: number[] = [];
      const listRect = listElement.getBoundingClientRect();

      // Detect if row is visible in viewport
      rows.forEach((row, i) => {
        const rowRect = row.getBoundingClientRect();
        if (rowRect.bottom > listRect.top + 5 && rowRect.top < listRect.bottom - 5) {
          visibleIndices.push(i);
        }
      });

      if (visibleIndices.length > 0) {
        const firstIdx = visibleIndices[0];
        const lastIdx = visibleIndices[visibleIndices.length - 1];
        const firstAlert = sortedAlerts[firstIdx];
        const lastAlert = sortedAlerts[lastIdx];

        if (firstAlert && lastAlert) {
          const visibleStartMm = firstAlert.startPos;
          const visibleEndMm = lastAlert.startPos + lastAlert.length;

          const span = visibleEndMm - visibleStartMm;
          const pad = Math.max(span * 0.15, 200); // 15% padding or min 20cm

          const windowStart = Math.max(0, visibleStartMm - pad);
          const windowEnd = Math.min(measurement.productLength, visibleEndMm + pad);

          setVisibleWindow({ start: windowStart, end: windowEnd });
        }
      }
    };

    // Initialize position
    handleScroll();

    listElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => listElement.removeEventListener('scroll', handleScroll);
  }, [listElement, sortedAlerts, measurement.productLength, isOpen]);

  // Click-to-scroll to start of viewport
  const handleItemClick = (index: number) => {
    if (!listElement) return;

    setActiveIndex(index);

    const rows = listElement.querySelectorAll<HTMLDivElement>('.anomaly-row');
    const targetRow = rows[index];

    if (targetRow) {
      targetRow.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 pointer-events-auto"
            />

            {/* Side Sheet Panel Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl z-50 flex flex-col h-full pointer-events-auto border-l border-border/40"
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between shrink-0 bg-white gap-4">
                <div className="min-w-0 flex-1">
                  <h2 
                    className="text-xl font-black text-foreground tracking-tight truncate font-sans" 
                    title={measurement.serialNumber}
                  >
                    {measurement.serialNumber}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full shrink-0">
                      {sortedAlerts.length} Anomalies
                    </span>
                    <span 
                      onClick={() => setShowLargeUnit(!showLargeUnit)}
                      className="text-[10px] font-bold text-foreground/50 hover:text-black cursor-pointer select-none transition-colors truncate"
                    >
                      Window: {formatLength(visibleWindow.start)} - {formatLength(visibleWindow.end)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-full transition-colors bg-muted/50"
                >
                  <X size={20} className="text-foreground" />
                </button>
              </div>

              {/* Ruler Zoom Visualizer */}
              <div className="p-6 border-b border-border bg-muted/20 shrink-0 select-none">
                <div className="relative">
                  {/* Scrubber tooltips */}
                  {scrubberPos !== null && (
                    <div
                      className="absolute bottom-[calc(100%+8px)] -translate-x-1/2 bg-black text-white px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap z-30 pointer-events-none shadow-lg font-sans"
                      style={{ left: `${scrubberPos}%` }}
                    >
                      {formatLength(visibleWindow.start + (scrubberPos / 100) * windowRange)}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-black" />
                    </div>
                  )}

                  {/* Playhead track cursor line */}
                  {playheadPct >= 0 && playheadPct <= 100 && (
                    <div
                      className="absolute top-0 bottom-0 w-[2px] bg-[#0071e3] opacity-30 z-20 pointer-events-none transition-[left] duration-150 ease-out"
                      style={{ left: `${playheadPct}%` }}
                    />
                  )}

                  {/* Ruler Track */}
                  <div
                    ref={rulerRef}
                    className="relative w-full h-12 cursor-crosshair rounded-xl overflow-hidden border border-border bg-card shadow-inner"
                    onMouseMove={handleInteraction}
                    onMouseLeave={() => setScrubberPos(null)}
                  >
                    {/* Tick scale markers */}
                    <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
                      <div className="absolute inset-0 flex justify-between px-1">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div key={i} className={`w-px bg-black ${i % 5 === 0 ? 'h-full' : 'h-1/2 mt-auto'}`} />
                        ))}
                      </div>
                    </div>

                    {/* Render active zoomed overlapping bars */}
                    {visibleBars.map(({ alert, index, leftPct, widthPct }) => {
                      const isActive = index === activeIndex;
                      return (
                        <div
                          key={alert.id}
                          className={`absolute top-0 bottom-0 transition-[left,width] duration-150 ease-out flex items-center justify-center`}
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            minWidth: '4px',
                            zIndex: isActive ? 25 : 15,
                          }}
                        >
                          <motion.div
                            animate={{
                              opacity: activeIndex !== null && !isActive ? 0.25 : 1,
                              backgroundColor: getSeverityColor(alert.severity),
                              scaleY: isActive ? 1.3 : 1,
                            }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className={`w-full h-full rounded-none cursor-pointer ${
                              isActive ? 'ring-2 ring-black ring-inset shadow-lg' : 'hover:opacity-90'
                            }`}
                            onClick={() => handleItemClick(index)}
                          />
                        </div>
                      );
                    })}

                    {/* Baseline indicator */}
                    <div
                      className="absolute inset-x-0 pointer-events-none z-20"
                      style={{ top: '50%', height: 1, backgroundColor: 'rgba(0,0,0,0.12)' }}
                    />

                    {/* Tick tags */}
                    {ticks.map((tick, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 z-20 pointer-events-none"
                        style={{ 
                          left: `${tick.pct}%`, 
                          width: 1, 
                          backgroundColor: 'rgba(0,0,0,0.15)',
                          transition: 'left 150ms ease-out'
                        }}
                      >
                        <span
                          className="absolute text-[8px] font-black tabular-nums font-sans"
                          style={{
                            bottom: 3,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: 'rgba(0,0,0,0.4)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {tick.label}
                        </span>
                      </div>
                    ))}

                    {/* Live Scrubber Line */}
                    {scrubberPos !== null && (
                      <div
                        className="absolute top-0 bottom-0 w-[1.5px] bg-black z-30 pointer-events-none"
                        style={{ left: `${scrubberPos}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Scrolling List Body */}
              <div
                ref={listRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5 pb-[40vh]"
              >
                {sortedAlerts.map((alert, index) => {
                  const config = anomalyConfigs.find(c => c.type === alert.anomalyType);
                  const isActive = index === activeIndex;

                  return (
                    <div
                      key={alert.id}
                      data-alert-id={alert.id}
                      onClick={() => handleItemClick(index)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`anomaly-row p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'bg-white border-black shadow-lg shadow-black/5 scale-[1.015] z-10 relative'
                          : 'bg-black/[0.02] border-black/5 scale-100 text-foreground/80 hover:bg-black/[0.04]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: getSeverityColor(alert.severity) }}
                          />
                          <span
                            className={`text-sm font-black tracking-tight truncate ${
                              isActive ? 'text-black' : 'text-black/70'
                            }`}
                          >
                            {config?.displayName || alert.anomalyType}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold tabular-nums text-black/50 bg-black/5 px-2 py-0.5 rounded-md ml-2 shrink-0 font-sans">
                          {formatLength(alert.startPos)} - {formatLength(Math.min(alert.startPos + alert.length, measurement.productLength))}
                        </span>
                      </div>

                      <AnimatePresence initial={false}>
                        {alert.technicalDetails && isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 10 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <p className="text-xs leading-relaxed text-black/60 font-medium font-sans">
                              {alert.technicalDetails}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Sticky Action Footer */}
              <div className="p-6 border-t border-border bg-white shrink-0 shadow-[0_-6px_24px_rgba(0,0,0,0.04)] z-20">
                {hasActiveAlerts ? (
                  <>
                    <div
                      style={{ display: 'grid', gridTemplateRows: showConfirmation ? '1fr' : '0fr' }}
                      className="transition-[grid-template-rows] duration-300"
                    >
                      <div className="overflow-hidden">
                        <p className="text-center text-sm font-semibold text-foreground pb-4 font-sans">
                          Are you sure you want to acknowledge these {visibleAlerts.length} anomalies?
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {showConfirmation && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowConfirmation(false); }}
                          className="flex-1 h-12 rounded-xl font-black text-xs uppercase tracking-widest border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        disabled={isAcknowledging}
                        onClick={(e) => {
                          e.stopPropagation();
                          showConfirmation ? handleAcknowledge() : setShowConfirmation(true);
                        }}
                        className={`flex-1 h-12 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                          isAcknowledging
                            ? 'bg-emerald-500 text-white cursor-default shadow-lg shadow-emerald-500/10'
                            : 'bg-black text-white hover:bg-neutral-800 shadow-lg shadow-black/10'
                        }`}
                      >
                        {isAcknowledging ? '✓  Done' : showConfirmation ? 'Yes, Confirm' : 'Acknowledge Alerts'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full py-4 flex items-center justify-center gap-2 border border-emerald-500/10 bg-emerald-500/[0.04] rounded-xl text-xs font-black text-emerald-600 uppercase tracking-widest">
                    <CheckCircle2 size={16} />
                    <span>Resolution Acknowledged</span>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
