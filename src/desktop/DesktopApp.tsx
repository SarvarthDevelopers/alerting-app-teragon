import { useState, useEffect } from 'react';
import { DesktopSidebar } from './components/DesktopSidebar';
import { DesktopAlertsFeed } from './components/DesktopAlertsFeed';
import { DesktopSystemsView } from './components/DesktopSystemsView';
import { SettingsMain } from '../app/components/settings/SettingsMain';
import { getAllActiveAlerts } from '../app/data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Activity, Settings, Search, User } from 'lucide-react';

type Tab = 'alerts' | 'systems' | 'settings';

export default function DesktopApp() {
  const [activeTab, setActiveTab] = useState<Tab>('alerts');
  const [alertsView, setAlertsView] = useState<'active' | 'acknowledged'>('active');
  const [activeAlertsCount, setActiveAlertsCount] = useState(getAllActiveAlerts().length);
  const [showLargeUnit, setShowLargeUnit] = useState(true);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());

  const handleAcknowledge = (id: string) => {
    setAcknowledgedIds(prev => new Set(prev).add(id));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAlertsCount(getAllActiveAlerts().length - acknowledgedIds.size);
    }, 5000);
    return () => clearInterval(interval);
  }, [acknowledgedIds]);

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
            />
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-3xl mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-foreground">Global Settings</h2>
              <p className="text-muted-foreground mt-1">Configure system thresholds and notification preferences.</p>
            </header>
            <SettingsMain />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-muted/30 text-foreground font-sans">
      <DesktopSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeAlertsCount={activeAlertsCount} 
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
                setActiveTab('alerts');
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
        <div className="flex-1 overflow-y-auto custom-scrollbar">
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
