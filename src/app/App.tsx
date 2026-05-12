import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Bell, Activity, Settings } from 'lucide-react';
import { getAccessibleColor } from './utils/colorUtils';
import { ActiveAlertsFeed } from './components/ActiveAlertsFeed';
import { SystemsView } from './components/SystemsView';
import { SettingsMain } from './components/settings/SettingsMain';
import { getAllActiveAlerts } from './data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import logo from '../assets/logo.svg';

import { 
  anomalyConfigs as initialAnomalyConfigs, 
  severityConfigs as initialSeverityConfigs, 
  displaySettings as initialDisplaySettings 
} from './data/settingsData';
import { AnomalyConfig, SeverityConfig, DisplaySettings as DisplaySettingsType } from './types';

type Tab = 'alerts' | 'systems' | 'settings';

interface AppProps {
  onLogout: () => void;
}

export default function App({ onLogout }: AppProps) {
  const [activeTab, setActiveTab] = useState<Tab>('alerts');
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSettingsSubView, setIsSettingsSubView] = useState(false);
  const [backTrigger, setBackTrigger] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  // Global Settings State
  const [anomalyConfigs, setAnomalyConfigs] = useState<AnomalyConfig[]>(() => {
    const saved = localStorage.getItem('anomalyConfigs');
    return saved ? JSON.parse(saved) : initialAnomalyConfigs;
  });
  const [severityConfigs, setSeverityConfigs] = useState<SeverityConfig[]>(() => {
    const saved = localStorage.getItem('severityConfigs');
    return saved ? JSON.parse(saved) : initialSeverityConfigs;
  });
  const [displaySettings, setDisplaySettings] = useState<DisplaySettingsType>(() => {
    const saved = localStorage.getItem('displaySettings');
    return saved ? JSON.parse(saved) : initialDisplaySettings;
  });
  const [showLargeUnit, setShowLargeUnit] = useState(() => localStorage.getItem('mobile_showLargeUnit') !== 'false');
  const [sessionAcked, setSessionAcked] = useState<Map<string, { acknowledgedBy: string; acknowledgedAt: string }>>(new Map());

  const handleAcknowledge = (id: string) => {
    setSessionAcked(prev => {
      const next = new Map(prev);
      next.set(id, { acknowledgedBy: 'You', acknowledgedAt: new Date().toISOString() });
      return next;
    });
  };

  const handleResetAppState = () => {
    setSessionAcked(new Map());
    setAnomalyConfigs(initialAnomalyConfigs);
    setSeverityConfigs(initialSeverityConfigs);
    setDisplaySettings(initialDisplaySettings);
    setShowLargeUnit(true);
  };

  useEffect(() => {
    localStorage.setItem('mobile_showLargeUnit', showLargeUnit.toString());
  }, [showLargeUnit]);

  useEffect(() => {
    localStorage.setItem('anomalyConfigs', JSON.stringify(anomalyConfigs));
  }, [anomalyConfigs]);

  useEffect(() => {
    localStorage.setItem('severityConfigs', JSON.stringify(severityConfigs));
  }, [severityConfigs]);

  useEffect(() => {
    localStorage.setItem('displaySettings', JSON.stringify(displaySettings));
  }, [displaySettings]);

  // Sync CSS variables with severity colors
  useEffect(() => {
    severityConfigs.forEach(config => {
      const finalColor = getAccessibleColor(config.color, displaySettings.colorBlindMode);
      document.documentElement.style.setProperty(`--severity-${config.id.toLowerCase()}`, finalColor);
    });
    
    // Sync OK status color
    const okColor = getAccessibleColor('#10b981', displaySettings.colorBlindMode);
    document.documentElement.style.setProperty('--severity-ok', okColor);
  }, [severityConfigs, displaySettings.colorBlindMode]);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setShowHeader(true);
    setLastScrollY(0);
    setIsSettingsSubView(false);
  }, [activeTab]);

  const activeAlertsCount = getAllActiveAlerts().length;

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    // Quick exit for settings tab
    if (activeTab === 'settings') {
      if (!showHeader) setShowHeader(true);
      setLastScrollY(currentScrollY);
      return;
    }

    const scrollHeight = e.currentTarget.scrollHeight;
    const clientHeight = e.currentTarget.clientHeight;
    const maxScroll = scrollHeight - clientHeight;
    const diff = currentScrollY - lastScrollY;

    // Ignore rubber-banding
    if (currentScrollY < 0 || currentScrollY > maxScroll) return;

    if (currentScrollY <= 10) {
      if (!showHeader) setShowHeader(true);
    } else if (Math.abs(diff) > 15) { // Increased threshold slightly
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        if (showHeader) setShowHeader(false);
      } else if (currentScrollY < lastScrollY) {
        if (!showHeader) setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    }
  };

  const tabs = [
    {
      id: 'alerts' as Tab,
      label: 'Alerts',
      icon: Bell,
      badge: activeAlertsCount
    },
    {
      id: 'systems' as Tab,
      label: 'Systems',
      icon: Activity
    },
    {
      id: 'settings' as Tab,
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <div 
      className="min-h-screen bg-muted/20 md:flex md:items-center md:justify-center md:p-2"
      onWheel={(e) => {
        // Forward wheel events to main container if not hovering it directly
        if (mainRef.current && !mainRef.current.contains(e.target as Node)) {
          mainRef.current.scrollTop += e.deltaY;
        }
      }}
    >
      <div className="w-full max-w-[480px] h-[100dvh] md:h-[96vh] bg-background flex flex-col relative md:rounded-2xl md:border-4 md:border-card md:shadow-xl overflow-hidden">
        <motion.header
          initial={false}
          animate={{
            y: showHeader ? 0 : '-100%',
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="absolute top-0 left-0 right-0 bg-card border-b border-border z-50 shrink-0"
        >
          <div className="px-4 py-3">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between h-12">
                <div className="relative w-[180px] h-10 shrink-0">
                  <AnimatePresence initial={false}>
                    {isSettingsSubView ? (
                      <motion.button
                        key="back-button"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        onClick={() => setBackTrigger(prev => prev + 1)}
                        className="absolute inset-0 flex items-center gap-2 text-foreground font-bold hover:opacity-70 whitespace-nowrap"
                      >
                        <ChevronLeft size={24} className="shrink-0" />
                        <span>Go Back</span>
                      </motion.button>
                    ) : (
                      <motion.div
                        key="logo"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute inset-0 flex items-center"
                      >
                        <img src={logo} alt="Teragon Logo" className="h-10 w-auto" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {activeAlertsCount > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setActiveTab('alerts')}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
                    aria-label={`View ${activeAlertsCount} active alerts`}
                  >
                    <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
                    {activeAlertsCount} Active
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        <main 
          ref={mainRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-background scrollbar-hidden"
        >
          <div className="h-[72px] shrink-0" /> {/* Fixed spacer to prevent layout shift */}
          {activeTab === 'settings' ? (
            <SettingsMain 
              onSubViewChange={setIsSettingsSubView} 
              requestBack={backTrigger}
              onBackProcessed={() => setBackTrigger(0)}
              anomalyConfigs={anomalyConfigs}
              setAnomalyConfigs={setAnomalyConfigs}
              severityConfigs={severityConfigs}
              setSeverityConfigs={setSeverityConfigs}
              displaySettings={displaySettings}
              setDisplaySettings={setDisplaySettings}
              onLogout={onLogout}
              onResetApp={handleResetAppState}
            />
          ) : (
            <div className="max-w-7xl mx-auto px-4">
              {activeTab === 'alerts' && (
                <ActiveAlertsFeed 
                  anomalyConfigs={anomalyConfigs}
                  severityConfigs={severityConfigs}
                  displaySettings={displaySettings}
                  showLargeUnit={showLargeUnit}
                  setShowLargeUnit={setShowLargeUnit}
                  sessionAcked={sessionAcked}
                  onAcknowledge={handleAcknowledge}
                />
              )}
              {activeTab === 'systems' && (
                <SystemsView 
                  anomalyConfigs={anomalyConfigs}
                  severityConfigs={severityConfigs}
                  displaySettings={displaySettings}
                  showLargeUnit={showLargeUnit}
                  setShowLargeUnit={setShowLargeUnit}
                />
              )}
            </div>
          )}
        </main>

        <nav className="shrink-0 bg-card border-t border-border z-40">
          <div className="max-w-7xl mx-auto px-2 py-2">
            <div className="flex items-center justify-around gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all relative ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="relative">
                      <Icon size={22} />
                      {tab.badge && tab.badge > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center"
                        >
                          {tab.badge > 9 ? '9+' : tab.badge}
                        </motion.div>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
