import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Measurement, AnomalyConfig, DisplaySettings } from '../types';

interface InspectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  measurement: Measurement;
  anomalyConfigs: AnomalyConfig[];
  displaySettings: DisplaySettings;
  onAcknowledge?: (id: string) => void;
  sessionAckInfo?: { acknowledgedBy: string; acknowledgedAt: string };
  showLargeUnit: boolean;
  setShowLargeUnit: (val: boolean) => void;
}

export function InspectionDrawer({
  isOpen,
  onClose,
  measurement,
  anomalyConfigs,
  displaySettings,
  onAcknowledge,
  sessionAckInfo,
  showLargeUnit,
  setShowLargeUnit
}: InspectionDrawerProps) {
  const [listElement, setListElement] = useState<HTMLDivElement | null>(null);
  const listRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setListElement(node);
    }
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  // References to lock scroll Y-center tracking during programmatically-triggered smooth scrolls
  const isProgrammaticScrolling = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Dynamic ruler window state tracking what is currently visible in the list viewport
  const [visibleWindow, setVisibleWindow] = useState({ start: 0, end: 3000 });
  const [scrubberPos, setScrubberPos] = useState<number | null>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

  const activeAlerts = useMemo(() => measurement.alerts.filter(a => a.currentState === 'NEW'), [measurement.alerts]);
  const hasActiveAlerts = activeAlerts.length > 0 && !sessionAckInfo;

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

  const getSeverityColor = (severity: string): string => {
    return `var(--severity-${severity.toLowerCase()})`;
  };

  // Sort alerts by position
  const sortedAlerts = useMemo(() => {
    return [...measurement.alerts].sort((a, b) => a.startPos - b.startPos);
  }, [measurement.alerts]);

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

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
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
      onAcknowledge?.(measurement.id);
      setIsAcknowledging(false);
      onClose();
    }, 350);
  };

  // Center-tracking scroll logic that dynamically updates the visible window
  useEffect(() => {
    if (!listElement) return;

    const handleScroll = () => {
      const rows = listElement.querySelectorAll<HTMLDivElement>('.anomaly-row');
      if (rows.length === 0) return;

      const listRect = listElement.getBoundingClientRect();
      const listCenterY = listRect.top + listRect.height / 2;

      let closestRowIndex = 0;
      let minDistance = Infinity;
      const visibleIndices: number[] = [];

      rows.forEach((row, i) => {
        const rowRect = row.getBoundingClientRect();
        const rowCenterY = rowRect.top + rowRect.height / 2;
        const distance = Math.abs(rowCenterY - listCenterY);

        if (distance < minDistance) {
          minDistance = distance;
          closestRowIndex = i;
        }

        // Detect if row is visible in viewport
        if (rowRect.bottom > listRect.top + 5 && rowRect.top < listRect.bottom - 5) {
          visibleIndices.push(i);
        }
      });

      // Avoid overriding the selected index while programmatic smooth scroll is animating
      if (!isProgrammaticScrolling.current) {
        setActiveIndex(closestRowIndex);
      }

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
  }, [listElement, sortedAlerts, measurement.productLength]);

  // Click-to-scroll to center of viewport
  const handleItemClick = (index: number) => {
    if (!listElement) return;
    
    // Lock active index updates during smooth scroll animation
    isProgrammaticScrolling.current = true;
    setActiveIndex(index);

    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    
    const rows = listElement.querySelectorAll<HTMLElement>('.anomaly-row');
    const row = rows[index];
    if (row) {
      const containerHeight = listElement.clientHeight;
      const rowHeight = row.clientHeight;
      
      const rowRect = row.getBoundingClientRect();
      const listRect = listElement.getBoundingClientRect();
      const targetScrollTop = listElement.scrollTop + (rowRect.top - listRect.top) - (containerHeight / 2) + (rowHeight / 2);
      
      listElement.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }

    // Release programmatic scroll lock after transition finishes (approx 500ms)
    scrollTimeoutRef.current = window.setTimeout(() => {
      isProgrammaticScrolling.current = false;
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col h-dvh bg-white rounded-t-3xl shadow-2xl overflow-hidden md:max-w-md mx-auto"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight">{measurement.serialNumber}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full">
                    {sortedAlerts.length} Anomalies
                  </span>
                  <span 
                    onClick={() => setShowLargeUnit(!showLargeUnit)}
                    className="text-[10px] font-bold text-foreground/50 hover:text-black cursor-pointer select-none transition-colors"
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

            {/* Ruler with Dynamic Zoom, Sliding Window, and Interactive Scrubber */}
            <div className="shrink-0 relative bg-[#f6f6f6] border-b border-border/40">
              {/* Scrubber Tooltip */}
              {scrubberPos !== null && (
                <div
                  className="absolute bottom-[calc(100%+4px)] -translate-x-1/2 bg-black text-white px-2 py-1 rounded-md text-[10px] font-black z-40 pointer-events-none shadow-lg whitespace-nowrap"
                  style={{ left: `${scrubberPos}%` }}
                >
                  {formatLength(visibleWindow.start + (scrubberPos / 100) * (visibleWindow.end - visibleWindow.start))}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-black" />
                </div>
              )}

              {/* Ruler Track */}
              <div
                ref={rulerRef}
                className="relative w-full overflow-hidden cursor-crosshair touch-none select-none"
                style={{ height: 48 }}
                onMouseMove={handleInteraction}
                onMouseDown={handleInteraction}
                onTouchMove={handleInteraction}
                onTouchStart={handleInteraction}
                onMouseLeave={() => setScrubberPos(null)}
                onTouchEnd={() => setScrubberPos(null)}
              >
                {/* Anomaly coverage bars */}
                {visibleBars.map(({ alert, index: i, leftPct, widthPct }) => {
                  const isSelected = i === activeIndex;
                  return (
                    <div
                      key={alert.id}
                      className="absolute top-0 bottom-0 z-10"
                      style={{
                        left: `${leftPct}%`,
                        width: `max(4px, ${widthPct}%)`,
                        backgroundColor: getSeverityColor(alert.severity),
                        opacity: isSelected ? 1 : 0.25,
                        zIndex: isSelected ? 10 : 5,
                        outline: isSelected ? '2px solid black' : 'none',
                        outlineOffset: isSelected ? '-2px' : '0px',
                        transition: 'left 150ms ease-out, width 150ms ease-out',
                      }}
                    />
                  );
                })}

                {/* Baseline */}
                <div
                  className="absolute inset-x-0 pointer-events-none z-20"
                  style={{ top: '50%', height: 1, backgroundColor: 'rgba(0,0,0,0.12)' }}
                />

                {/* Tick marks & labels */}
                {ticks.map((tick, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 z-20 pointer-events-none"
                    style={{ 
                      left: `${tick.pct}%`, 
                      width: 1, 
                      backgroundColor: 'rgba(0,0,0,0.18)',
                      transition: 'left 150ms ease-out'
                    }}
                  >
                    <span
                      className="absolute text-[8px] font-black tabular-nums"
                      style={{
                        bottom: 3,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: 'rgba(0,0,0,0.38)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tick.label}
                    </span>
                  </div>
                ))}

                {/* Vertical Scrubber Line */}
                {scrubberPos !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-[1.5px] bg-black z-30 pointer-events-none"
                    style={{ left: `${scrubberPos}%` }}
                  />
                )}
              </div>
            </div>

            {/* List Body with Crucial pb-[50vh] padding fix */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fdfdfd] pb-[50vh]"
            >
              {sortedAlerts.map((alert, index) => {
                const config = anomalyConfigs.find(c => c.type === alert.anomalyType);
                const isActive = index === activeIndex;

                return (
                  <div
                    key={alert.id}
                    onClick={() => handleItemClick(index)}
                    className={`anomaly-row px-4 py-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-white border-black shadow-lg shadow-black/5 scale-[1.015] z-10 relative'
                        : 'bg-black/[0.02] border-black/5 scale-100 text-foreground/80 hover:bg-black/[0.04]'
                    }`}
                    data-position={alert.startPos}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: getSeverityColor(alert.severity) }}
                        />
                        <span
                          className={`text-[12px] font-black tracking-tight truncate ${
                            isActive ? 'text-black' : 'text-black/70'
                          }`}
                        >
                          {config?.displayName || alert.anomalyType}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold tabular-nums text-black/50 bg-black/5 px-2 py-0.5 rounded-md ml-2 shrink-0">
                        {formatLength(alert.startPos)} - {formatLength(Math.min(alert.startPos + alert.length, measurement.productLength))}
                      </span>
                    </div>

                    <AnimatePresence initial={false}>
                      {alert.technicalDetails && isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs leading-relaxed text-black/60">
                            {alert.technicalDetails}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Sticky Footer */}
            <div className="px-4 pt-3 pb-5 border-t border-border bg-white shrink-0 shadow-[0_-6px_24px_rgba(0,0,0,0.05)] z-20">
              {hasActiveAlerts ? (
                <>
                  <div
                    style={{ display: 'grid', gridTemplateRows: showConfirmation ? '1fr' : '0fr' }}
                    className="transition-[grid-template-rows] duration-300"
                  >
                    <div className="overflow-hidden">
                      <p className="text-center text-sm font-semibold text-foreground pb-3">
                        Are you sure to acknowledge this?
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {showConfirmation && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowConfirmation(false); }}
                        className="flex-1 py-4 rounded-xl font-bold text-lg border-2 border-[#dedede] text-foreground hover:bg-muted transition-colors"
                      >
                        CANCEL
                      </button>
                    )}
                    <button
                      disabled={isAcknowledging}
                      onClick={(e) => {
                        e.stopPropagation();
                        showConfirmation ? handleAcknowledge() : setShowConfirmation(true);
                      }}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                        isAcknowledging
                          ? 'bg-green-500 text-white cursor-default'
                          : 'bg-[#dedede] text-foreground hover:opacity-90'
                      }`}
                    >
                      {isAcknowledging ? '✓  DONE' : showConfirmation ? 'YES' : 'ACKNOWLEDGE'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full py-4 text-center text-sm font-semibold text-muted-foreground">
                  Acknowledged
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
