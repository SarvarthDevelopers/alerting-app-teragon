import { useState } from 'react';
import { ActiveAlertsFeed } from './components/ActiveAlertsFeed';
import { SystemsView } from './components/SystemsView';
import { SettingsMain } from './components/settings/SettingsMain';
import { getAllActiveAlerts } from './data/mockData';
import { motion } from 'motion/react';
import { Bell, Activity, Settings } from 'lucide-react';

type Tab = 'alerts' | 'systems' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('alerts');
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const activeAlertsCount = getAllActiveAlerts().length;

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    if (currentScrollY > lastScrollY && currentScrollY > 60) {
      // Scrolling down
      setShowHeader(false);
    } else {
      // Scrolling up
      setShowHeader(true);
    }
    setLastScrollY(currentScrollY);
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
    <div className="min-h-screen bg-muted/20 md:flex md:items-center md:justify-center md:p-2">
      <div className="w-full max-w-[480px] h-[100dvh] md:h-[96vh] bg-background flex flex-col relative md:rounded-2xl md:border-4 md:border-card md:shadow-xl overflow-hidden">
        <motion.header 
          initial={false}
          animate={{ 
            height: showHeader ? 'auto' : 0,
            opacity: showHeader ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-card border-b border-border px-4 py-4 sticky top-0 z-40 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Teragon
                </h1>
                <p className="text-sm text-muted-foreground">Steel Quality Monitoring</p>
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
        </motion.header>

        <main 
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto pb-20 md:pb-6"
        >
          {activeTab === 'settings' ? (
            <SettingsMain />
          ) : (
            <div className="max-w-7xl mx-auto px-4">
              {activeTab === 'alerts' && <ActiveAlertsFeed />}
              {activeTab === 'systems' && <SystemsView />}
            </div>
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 md:absolute bg-card border-t border-border z-40">
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
                        ? 'bg-primary text-primary-foreground'
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
