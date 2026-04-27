import { AnomalyConfig, DisplaySettings, NetworkConfig, User } from '../types';

export const anomalyConfigs: AnomalyConfig[] = [
  {
    id: 'ac1',
    type: 'VISUAL_DEFECT',
    sourceTypeKey: 'VISUAL_DEFECT',
    displayName: 'Visual Defect',
    defaultSeverity: 'HIGH',
    color: '#f97316',
    audioAlarm: true,
    flashlightAlarm: true,
    isActive: true
  },
  {
    id: 'ac2',
    type: 'DIMENSIONAL_VARIANCE',
    sourceTypeKey: 'DIMENSIONAL_VARIANCE',
    displayName: 'Dimensional Variance',
    defaultSeverity: 'MEDIUM',
    color: '#eab308',
    audioAlarm: true,
    flashlightAlarm: false,
    isActive: true
  },
  {
    id: 'ac3',
    type: 'SURFACE_ROUGHNESS',
    sourceTypeKey: 'SURFACE_ROUGHNESS',
    displayName: 'Surface Roughness',
    defaultSeverity: 'MEDIUM',
    color: '#eab308',
    audioAlarm: true,
    flashlightAlarm: false,
    isActive: true
  },
  {
    id: 'ac4',
    type: 'FLATNESS_DEVIATION',
    sourceTypeKey: 'FLATNESS_DEVIATION',
    displayName: 'Flatness Deviation',
    defaultSeverity: 'HIGH',
    color: '#f97316',
    audioAlarm: true,
    flashlightAlarm: true,
    isActive: true
  },
  {
    id: 'ac5',
    type: 'PROFILE_OFFSET',
    sourceTypeKey: 'PROFILE_OFFSET',
    displayName: 'Profile Offset',
    defaultSeverity: 'CRITICAL',
    color: '#dc2626',
    audioAlarm: true,
    flashlightAlarm: true,
    isActive: true
  }
];

export const displaySettings: DisplaySettings = {
  latestNCount: 25,
  pollingInterval: 2,
  screenWakeLock: true,
  unitSystem: 'METRIC'
};

export const networkConfig: NetworkConfig = {
  deviceId: 'DEVICE-001',
  deviceName: 'Mill Floor Tablet 1',
  networkType: 'WIFI',
  apiBaseUrl: 'https://api.teragon.local',
  webSocketUrl: 'wss://ws.teragon.local',
  requireTls: true,
  tlsCertificate: '-----BEGIN CERTIFICATE-----\nMIIC...',
  lastValidated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  connectionStatus: 'PASSED'
};

export const users: User[] = [
  {
    id: 'u1',
    username: 'operator.smith',
    fullName: 'John Smith',
    role: 'OPERATOR',
    isActive: true,
    forcePinChange: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'u2',
    username: 'operator.jones',
    fullName: 'Sarah Jones',
    role: 'OPERATOR',
    isActive: true,
    forcePinChange: false,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'u3',
    username: 'lead.davis',
    fullName: 'Mike Davis',
    role: 'LEAD',
    isActive: true,
    forcePinChange: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'u4',
    username: 'admin',
    fullName: 'Admin User',
    role: 'ADMIN',
    isActive: true,
    forcePinChange: false,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
];
