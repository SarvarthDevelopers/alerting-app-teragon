import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { networkConfig as defaultConfig } from '../../data/settingsData';
import { NetworkConfig, NetworkType } from '../../types';
import { formatTimestamp } from '../../data/mockData';

interface NetworkSettingsProps {
  onBack: () => void;
}

export function NetworkSettings({ onBack }: NetworkSettingsProps) {
  const [config, setConfig] = useState<NetworkConfig>(defaultConfig);
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setConfig({ ...config, connectionStatus: 'PENDING' });

    // Simulate connection test
    setTimeout(() => {
      setConfig({
        ...config,
        connectionStatus: 'PASSED',
        lastValidated: new Date().toISOString()
      });
      setTesting(false);
    }, 2000);
  };

  const getStatusIcon = () => {
    switch (config.connectionStatus) {
      case 'PASSED':
        return <CheckCircle size={20} className="text-primary" />;
      case 'FAILED':
        return <XCircle size={20} className="text-destructive" />;
      case 'PARTIAL':
        return <AlertCircle size={20} className="text-alert-escalated" />;
      case 'PENDING':
        return <Clock size={20} className="text-muted-foreground animate-pulse" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-background pb-20">
      <div className="sticky top-0 bg-card border-b border-border z-10">
        <div className="px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back</span>
        </button>
          <h1 className="text-2xl font-bold text-foreground">Network Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Database connectivity and security settings
          </p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Device ID
            </label>
            <input
              type="text"
              value={config.deviceId}
              onChange={(e) => setConfig({ ...config, deviceId: e.target.value })}
              className="w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground font-mono"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Device Name
            </label>
            <input
              type="text"
              value={config.deviceName}
              onChange={(e) => setConfig({ ...config, deviceName: e.target.value })}
              className="w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Network Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['WIFI', 'LAN', 'VPN', 'CELLULAR'] as NetworkType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setConfig({ ...config, networkType: type })}
                  className={`py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    config.networkType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              API Base URL
            </label>
            <input
              type="url"
              value={config.apiBaseUrl}
              onChange={(e) => setConfig({ ...config, apiBaseUrl: e.target.value })}
              className="w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground font-mono text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              WebSocket URL
            </label>
            <input
              type="url"
              value={config.webSocketUrl}
              onChange={(e) => setConfig({ ...config, webSocketUrl: e.target.value })}
              className="w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground font-mono text-sm"
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-foreground">Require TLS</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enforce encrypted connections
                </p>
              </div>
              <button
                onClick={() => setConfig({ ...config, requireTls: !config.requireTls })}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  config.requireTls ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                    config.requireTls ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {config.requireTls && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                TLS Certificate
              </label>
              <textarea
                value={config.tlsCertificate}
                onChange={(e) => setConfig({ ...config, tlsCertificate: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground font-mono text-xs resize-none"
              />
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <button
              onClick={testConnection}
              disabled={testing}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {testing ? 'TESTING CONNECTION...' : 'TEST CONNECTION'}
            </button>

            {config.connectionStatus && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon()}
                  <span className="font-semibold text-foreground">
                    {config.connectionStatus === 'PASSED' && 'Connection Successful'}
                    {config.connectionStatus === 'FAILED' && 'Connection Failed'}
                    {config.connectionStatus === 'PARTIAL' && 'Partial Connection'}
                    {config.connectionStatus === 'PENDING' && 'Testing...'}
                  </span>
                </div>
                {config.lastValidated && config.connectionStatus !== 'PENDING' && (
                  <p className="text-sm text-muted-foreground">
                    Last validated: {formatTimestamp(config.lastValidated)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <button className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:opacity-90 transition-opacity">
          SAVE CHANGES
        </button>
      </div>
    </div>
  );
}
