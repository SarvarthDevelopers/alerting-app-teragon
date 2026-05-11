import { useState, useEffect } from 'react';
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
import { AnomalyConfig, SeverityConfig, DisplaySettings } from '../app/types';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Activity, Settings, Search, User } from 'lucide-react';

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

  const navigateToTab = (tab: Tab) => navigate(`/desktop/${tab}`);

  // Redirect bare /desktop → /desktop/alerts
  useEffect(() => {
    if (pathname === '/desktop' || pathname === '/desktop/') {
      navigate('/desktop/alerts', { replace: true });
    }
  }, []);

  const [alertsView, setAlertsView] = useState<'active' | 'acknowledged'>('active');
  const [activeAlertsCount, setActiveAlertsCount] = useState(getAllActiveAlerts().length);
  const [showLargeUnit, setShowLargeUnit] = useState(true);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  const [severityConfigs, setSeverityConfigs] = useState<SeverityConfig[]>(initialSeverityConfigs);
  const [anomalyConfigs, setAnomalyConfigs] = useState<AnomalyConfig[]>(initialAnomalyConfigs);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(initialDisplaySettings);

  const handleAcknowledge = (id: string) => {
    setAcknowledgedIds(prev => new Set(prev).add(id));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAlertsCount(getAllActiveAlerts().length - acknowledgedIds.size);
    }, 5000);
    return () => clearInterval(interval);
  }, [acknowledgedIds]);

  // Sync severity colors → CSS variables so badges/borders update in real time
  useEffect(() => {
    severityConfigs.forEach(config => {
      document.documentElement.style.setProperty(`--severity-${config.id.toLowerCase()}`, config.color);
    });
  }, [severityConfigs]);

  const renderContent = () => {
    switch (activeTab) {
      case 'alerts':
        return (
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h2 className="text-4xl font-black text-foreground tracking-tight">Active Alerts</h2>
              <p className="text-muted-foreground mt-2 font-medium">Real-time monitoring of steel production anomalies.</p>
            </header>
            <DesktopAlertsFeed 
              showLargeUnit={showLargeUnit} 
              setShowLargeUnit={setShowLargeUnit} 
              acknowledgedIds={acknowledgedIds}
              onAcknowledge={handleAcknowledge}
              activeView={alertsView}
              setActiveView={setAlertsView}
              displaySettings={displaySettings}
              anomalyConfigs={anomalyConfigs}
              severityConfigs={severityConfigs}
            />
          </div>
        );
      case 'systems':
        return (
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h2 className="text-4xl font-black text-foreground tracking-tight">Systems Overview</h2>
              <p className="text-muted-foreground mt-2 font-medium">Health and performance status of all production lines.</p>
            </header>
            <DesktopSystemsView 
              showLargeUnit={showLargeUnit} 
              setShowLargeUnit={setShowLargeUnit} 
              acknowledgedIds={acknowledgedIds}
              onAcknowledge={handleAcknowledge}
              displaySettings={displaySettings}
              anomalyConfigs={anomalyConfigs}
              severityConfigs={severityConfigs}
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
        <header className="h-20 bg-background/60 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-10 shrink-0 z-40">
          <div className="flex items-center">
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">anomaly alerting system</span>
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
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-scroll custom-scrollbar">
          <div className="p-10">
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
      </main>
    </div>
  );
}
