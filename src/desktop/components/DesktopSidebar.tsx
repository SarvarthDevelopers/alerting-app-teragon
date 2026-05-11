import { Bell, Activity, Settings, LayoutDashboard, LogOut, User } from 'lucide-react';
import { motion } from 'motion/react';
import logo from '../../assets/logo.svg';

type Tab = 'alerts' | 'systems' | 'settings';

interface DesktopSidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  activeAlertsCount: number;
  onLogout: () => void;
}

export function DesktopSidebar({ activeTab, setActiveTab, activeAlertsCount, onLogout }: DesktopSidebarProps) {
  const menuItems = [
    { id: 'alerts' as Tab, label: 'Alerts', icon: Bell, badge: activeAlertsCount },
    { id: 'systems' as Tab, label: 'Systems', icon: Activity },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-card/80 backdrop-blur-xl border-r border-border/50 flex flex-col h-full z-50 shadow-2xl">
      <div className="p-8">
        <div className="flex items-center justify-center mb-12">
          <div className="w-full px-4">
            <img src={logo} alt="Teragon Logo" className="w-full h-auto" />
          </div>
        </div>

        <nav className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-primary-foreground rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">

        <div className="p-4 bg-card border border-border/50 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-foreground truncate leading-tight">Admin User</p>
              <p className="text-[10px] text-muted-foreground font-bold truncate opacity-60">System Supervisor</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
