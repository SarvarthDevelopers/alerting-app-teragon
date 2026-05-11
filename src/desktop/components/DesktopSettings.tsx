import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Palette, Zap, Monitor, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SeveritiesSettings } from '../../app/components/settings/SeveritiesSettings';
import { AnomalyTypesSettings } from '../../app/components/settings/AnomalyTypesSettings';
import { DesktopDisplaySettings } from './settings/DesktopDisplaySettings';
import { DesktopUserManagement } from './settings/DesktopUserManagement';
import { SavedToast } from '../../app/components/ui/SavedToast';
import { AnomalyConfig, SeverityConfig, DisplaySettings as DisplaySettingsType, User } from '../../app/types';

type SettingsSection = 'severities' | 'anomaly-types' | 'display' | 'user-management';

interface DesktopSettingsProps {
  anomalyConfigs: AnomalyConfig[];
  setAnomalyConfigs: (c: AnomalyConfig[]) => void;
  severityConfigs: SeverityConfig[];
  setSeverityConfigs: (c: SeverityConfig[]) => void;
  displaySettings: DisplaySettingsType;
  setDisplaySettings: (s: DisplaySettingsType) => void;
  users: User[];
  setUsers: (u: User[]) => void;
  showHeader: boolean;
  onResetApp: () => void;
}

const NAV_ITEMS: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: 'severities',    label: 'Severities',           icon: Palette },
  { id: 'anomaly-types', label: 'Anomaly Types',         icon: Zap     },
  { id: 'display',       label: 'Display & Preferences', icon: Monitor },
  { id: 'user-management', label: 'User Management',       icon: Users   },
];

export function DesktopSettings({
  anomalyConfigs, setAnomalyConfigs,
  severityConfigs, setSeverityConfigs,
  displaySettings, setDisplaySettings,
  users, setUsers,
  showHeader,
  onResetApp,
}: DesktopSettingsProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Derive active section from URL
  const activeSection: SettingsSection = pathname.includes('/anomaly-types') ? 'anomaly-types'
    : pathname.includes('/display') ? 'display'
    : pathname.includes('/user-management') ? 'user-management'
    : 'severities';

  const setActiveSection = (section: SettingsSection) =>
    navigate(`/desktop/settings/${section}`);

  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const triggerToast = () => {
    clearTimeout(toastTimerRef.current);
    setShowToast(true);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <div className="grid grid-cols-[auto_1fr] gap-8 items-start">

      {/* ── Left Navigation ── */}
      <motion.div 
        initial={false}
        animate={{ top: showHeader ? 104 : 24 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="bg-card/50 backdrop-blur-md border border-border/50 rounded-3xl p-3 shadow-sm sticky"
      >

        <div className="space-y-1 py-3">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3.5 px-4 h-12 rounded-2xl transition-all text-left group ${
                  isActive
                    ? 'bg-black text-white shadow-lg shadow-black/10'
                    : 'text-foreground hover:bg-muted/60'
                }`}
              >
                <Icon
                  size={17}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                <div className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
                  {label}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Right Content Panel ── */}
      <div className="bg-card/50 border border-border/50 rounded-3xl overflow-hidden shadow-sm min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeSection === 'severities' && (
              <SeveritiesSettings
                onBack={() => {}}
                configs={severityConfigs}
                onUpdate={(configs) => { setSeverityConfigs(configs); triggerToast(); }}
              />
            )}

            {activeSection === 'anomaly-types' && (
              <AnomalyTypesSettings
                onBack={() => {}}
                configs={anomalyConfigs}
                onUpdate={(configs) => { setAnomalyConfigs(configs); triggerToast(); }}
              />
            )}

            {activeSection === 'display' && (
              <DesktopDisplaySettings
                settings={displaySettings}
                onUpdate={(settings) => { setDisplaySettings(settings); triggerToast(); }}
                onResetApp={onResetApp}
              />
            )}
            
            {activeSection === 'user-management' && (
              <DesktopUserManagement
                users={users}
                setUsers={(u) => { setUsers(u); triggerToast(); }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <SavedToast visible={showToast} />
    </div>
  );
}
