import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { DesktopSidebar } from './components/DesktopSidebar';
import { DesktopAlertsFeed } from './components/DesktopAlertsFeed';
import { DesktopSystemsView } from './components/DesktopSystemsView';
import { DesktopSettings } from './components/DesktopSettings';
import { getAllActiveAlerts } from '../app/data/mockData';
import {
  severityConfigs as initialSeverityConfigs,
  anomalyConfigs as initialAnomalyConfigs,
  displaySettings as initialDisplaySettings,
} from '../app/data/settingsData';
import { AnomalyConfig, SeverityConfig, DisplaySettings, User } from '../app/types';
import { users as initialUsers } from '../app/data/settingsData';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Activity, Settings, Search, User as UserIcon, RefreshCw } from 'lucide-react';
import { getAccessibleColor } from '../app/utils/colorUtils';
import { SavedToast } from '../app/components/ui/SavedToast';

type Tab = 'alerts' | 'systems' | 'settings';

interface DesktopAppProps {
  onLogout: () => void;
}

export default function DesktopApp({ onLogout }: DesktopAppProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Derive active tab from URL
  const activeTab: Tab = pathname.startsWith('/desktop/systems') ? 'systems'
    : pathname.startsWith('/desktop/settings') ? 'settings'
    : 'alerts';

  const navigateToTab = (tab: Tab) => {
    navigate(`/desktop/${tab}`);
    if (tab === 'alerts') {
      setAlertsView('active');
    }
  };


  const [alertsView, setAlertsView] = useState<'active' | 'acknowledged'>('active');
  const [showLargeUnit, setShowLargeUnit] = useState(() => localStorage.getItem('desktop_showLargeUnit') !== 'false');
  const [showExactTime, setShowExactTime] = useState(() => localStorage.getItem('desktop_showExactTime') === 'true');
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('desktop_showLargeUnit', showLargeUnit.toString());
  }, [showLargeUnit]);

  useEffect(() => {
    localStorage.setItem('desktop_showExactTime', showExactTime.toString());
  }, [showExactTime]);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set(['m1', 'm2', 'm5', 'm23']));
  const activeAlertsCount = getAllActiveAlerts().length - acknowledgedIds.size;
  const [severityConfigs, setSeverityConfigs] = useState<SeverityConfig[]>(() => {
    const saved = localStorage.getItem('desktop_severityConfigs');
    return saved ? JSON.parse(saved) : initialSeverityConfigs;
  });
  const [anomalyConfigs, setAnomalyConfigs] = useState<AnomalyConfig[]>(() => {
    const saved = localStorage.getItem('desktop_anomalyConfigs');
    return saved ? JSON.parse(saved) : initialAnomalyConfigs;
  });
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(() => {
    const saved = localStorage.getItem('desktop_displaySettings');
    return saved ? JSON.parse(saved) : initialDisplaySettings;
  });
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const [connectionStatus, setConnectionStatus] = useState<'operational' | 'reconnecting'>('operational');

  // Subtle background simulation of network drops
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const simulateConnectionCycle = () => {
      // Stay operational for 15s - 45s randomly
      const operationalTime = Math.random() * 30000 + 15000;
      
      timeoutId = setTimeout(() => {
        setConnectionStatus('reconnecting');
        
        // Reconnect after 2s - 5s
        const reconnectTime = Math.random() * 3000 + 2000;
        timeoutId = setTimeout(() => {
          setConnectionStatus('operational');
          simulateConnectionCycle();
        }, reconnectTime);
      }, operationalTime);
    };

    simulateConnectionCycle();

    return () => clearTimeout(timeoutId);
  }, []);

  // Reset header state and scroll position on navigation
  useEffect(() => {
    setShowHeader(true);
    setLastScrollY(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    
    if (pathname === '/desktop' || pathname === '/desktop/') {
      navigate('/desktop/alerts', { replace: true });
    }
  }, [pathname, navigate]);

  const triggerToast = (message: string) => {
    clearTimeout(toastTimerRef.current);
    setToast({ visible: true, message });
    toastTimerRef.current = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2500);
  };

  const handleAcknowledge = (id: string) => {
    setAcknowledgedIds(prev => new Set(prev).add(id));
  };


  const handleResetAppState = () => {
    setAcknowledgedIds(new Set());
    setSeverityConfigs(initialSeverityConfigs);
    setAnomalyConfigs(initialAnomalyConfigs);
    setDisplaySettings(initialDisplaySettings);
    setShowLargeUnit(true);
    triggerToast('App state restored to factory defaults');
  };

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    // Quick exit for settings tab
    if (activeTab === 'settings') {
      if (!showHeader) setShowHeader(true);
      setLastScrollY(currentScrollY);
      return;
    }

    const diff = currentScrollY - lastScrollY;

    if (currentScrollY <= 10) {
      // Only show if we were previously scrolled down and are now at top
      if (!showHeader && lastScrollY > 10) setShowHeader(true);
      setLastScrollY(currentScrollY);
    } else {
      const diff = currentScrollY - lastScrollY;
      
      // Ignore small movements to prevent jitter from layout reflows (especially when clicking tabs)
      if (Math.abs(diff) < 20) return;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & passed threshold
        if (showHeader) setShowHeader(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        if (!showHeader) setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    }
  };

  useEffect(() => {
    setLastScrollY(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);


  // Sync severity colors → CSS variables so badges/borders update in real time
  useEffect(() => {
    severityConfigs.forEach(config => {
      const finalColor = getAccessibleColor(config.color, displaySettings.colorBlindMode);
      document.documentElement.style.setProperty(`--severity-${config.id.toLowerCase()}`, finalColor);
    });

    const okColor = getAccessibleColor('#10b981', displaySettings.colorBlindMode);
    document.documentElement.style.setProperty('--severity-ok', okColor);
  }, [severityConfigs, displaySettings.colorBlindMode]);

  useEffect(() => {
    localStorage.setItem('desktop_anomalyConfigs', JSON.stringify(anomalyConfigs));
  }, [anomalyConfigs]);

  useEffect(() => {
    localStorage.setItem('desktop_severityConfigs', JSON.stringify(severityConfigs));
  }, [severityConfigs]);

  useEffect(() => {
    localStorage.setItem('desktop_displaySettings', JSON.stringify(displaySettings));
  }, [displaySettings]);

  const renderContent = () => {
    switch (activeTab) {
      case 'alerts':
        return (
          <div className="max-w-6xl mx-auto">
            <header>
              <h2 className="text-4xl font-black text-foreground tracking-tight">Active Alerts</h2>
              <p className="text-muted-foreground mt-2 font-medium">Real-time monitoring of steel production anomalies.</p>
            </header>
            <DesktopAlertsFeed 
              showLargeUnit={showLargeUnit} 
              setShowLargeUnit={setShowLargeUnit} 
              showExactTime={showExactTime}
              setShowExactTime={setShowExactTime}
              acknowledgedIds={acknowledgedIds}
              onAcknowledge={handleAcknowledge}
              activeView={alertsView}
              setActiveView={setAlertsView}
              displaySettings={displaySettings}
              anomalyConfigs={anomalyConfigs}
              severityConfigs={severityConfigs}
              showHeader={showHeader}
              lastScrollY={lastScrollY}
              onClearFilters={() => triggerToast('Filters reset to default')}
            />
          </div>
        );
      case 'systems':
        return (
          <div className="max-w-6xl mx-auto">
            <header>
              <h2 className="text-4xl font-black text-foreground tracking-tight">Systems Overview</h2>
              <p className="text-muted-foreground mt-2 font-medium">Health and performance status of all production lines.</p>
            </header>
            <DesktopSystemsView 
              showLargeUnit={showLargeUnit} 
              setShowLargeUnit={setShowLargeUnit} 
              showExactTime={showExactTime}
              setShowExactTime={setShowExactTime}
              acknowledgedIds={acknowledgedIds}
              onAcknowledge={handleAcknowledge}
              displaySettings={displaySettings}
              anomalyConfigs={anomalyConfigs}
              severityConfigs={severityConfigs}
              showHeader={showHeader}
              lastScrollY={lastScrollY}
              onClearFilters={() => triggerToast('Filters reset to default')}
            />
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h2 className="text-4xl font-black text-foreground tracking-tight">Settings</h2>
              <p className="text-muted-foreground mt-2 font-medium">Configure system thresholds and alert preferences.</p>
            </header>
            <DesktopSettings 
              anomalyConfigs={anomalyConfigs}
              setAnomalyConfigs={setAnomalyConfigs}
              severityConfigs={severityConfigs}
              setSeverityConfigs={setSeverityConfigs}
              displaySettings={displaySettings}
              setDisplaySettings={setDisplaySettings}
              users={users}
              setUsers={setUsers}
              showHeader={showHeader}
              onResetApp={handleResetAppState}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-muted/30 text-foreground font-sans">
      <DesktopSidebar 
        activeTab={activeTab} 
        setActiveTab={navigateToTab} 
        activeAlertsCount={activeAlertsCount} 
        onLogout={onLogout}
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        {/* Top Header */}
        <motion.header 
          initial={false}
          animate={{ y: showHeader ? 0 : '-100%' }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="absolute top-0 left-0 right-0 h-20 bg-background/60 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-10 shrink-0 z-40"
        >
          <div className="flex items-center gap-6 min-w-max">
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">anomaly alerting system</span>
             <div className="h-4 w-px bg-border/50" />
             <div className="flex items-center gap-2 min-w-[120px]">
               <AnimatePresence mode="wait">
                 {connectionStatus === 'operational' ? (
                   <motion.div 
                     key="op"
                     initial={{ opacity: 0, x: -5 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 5 }}
                     transition={{ duration: 0.2 }}
                     className="flex items-center gap-2"
                   >
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     <span className="text-[10px] font-black text-foreground uppercase tracking-widest opacity-60">Operational</span>
                   </motion.div>
                 ) : (
                   <motion.div 
                     key="recon"
                     initial={{ opacity: 0, x: -5 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 5 }}
                     transition={{ duration: 0.2 }}
                     className="flex items-center gap-1.5"
                   >
                     <RefreshCw size={10} className="text-amber-500 animate-spin" />
                     <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Reconnecting</span>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigate('/desktop/alerts');
                setAlertsView('active');
              }}
              className="flex items-center gap-3 bg-primary text-black px-6 py-2.5 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all border border-primary/20 group cursor-pointer"
            >
              <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">{activeAlertsCount} Live Alerts</span>
            </motion.button>
          </div>
        </motion.header>

        {/* Content Area */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-scroll custom-scrollbar"
        >
          <div className="h-20 shrink-0" />
          <div className="px-10 pb-10 pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <SavedToast visible={toast.visible} message={toast.message} />
      </main>
    </div>
  );
}
