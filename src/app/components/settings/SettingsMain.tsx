import { useState } from 'react';
import { Palette, Monitor, Wifi, Users, ChevronRight } from 'lucide-react';
import { SettingsListItem } from './SettingsList';
import { AnomalyTypesSettings } from './AnomalyTypesSettings';
import { DisplaySettings } from './DisplaySettings';
import { NetworkSettings } from './NetworkSettings';
import { UserManagement } from './UserManagement';

type SettingsScreen = 'main' | 'anomaly-types' | 'display' | 'network' | 'users';

export function SettingsMain() {
  const [activeScreen, setActiveScreen] = useState<SettingsScreen>('main');

  if (activeScreen === 'anomaly-types') {
    return <AnomalyTypesSettings onBack={() => setActiveScreen('main')} />;
  }

  if (activeScreen === 'display') {
    return <DisplaySettings onBack={() => setActiveScreen('main')} />;
  }

  if (activeScreen === 'network') {
    return <NetworkSettings onBack={() => setActiveScreen('main')} />;
  }

  if (activeScreen === 'users') {
    return <UserManagement onBack={() => setActiveScreen('main')} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-card border-b border-border z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure app, network, and user preferences
          </p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-3">
        <SettingsListItem
          icon={<Palette size={20} />}
          title="Anomaly Types"
          description="Configure defect types, colors, and alerts"
          badge="ADMIN"
          onClick={() => setActiveScreen('anomaly-types')}
        />

        <SettingsListItem
          icon={<Monitor size={20} />}
          title="Display & Preferences"
          description="App behavior and display settings"
          onClick={() => setActiveScreen('display')}
        />

        <SettingsListItem
          icon={<Wifi size={20} />}
          title="Network Configuration"
          description="Database connectivity and TLS settings"
          badge="ADMIN"
          onClick={() => setActiveScreen('network')}
        />

        <SettingsListItem
          icon={<Users size={20} />}
          title="User Management"
          description="Manage operator accounts and permissions"
          badge="ADMIN"
          onClick={() => setActiveScreen('users')}
        />
      </div>

      <div className="px-4 pt-8 pb-4">
        <div className="bg-muted/30 border border-border rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Version 1.0.0</span> • Teragon Alerting System
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2026 Sarvārth Engineering & Design
          </p>
        </div>
      </div>
    </div>
  );
}
