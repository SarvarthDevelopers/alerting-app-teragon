export type SystemType = 'SURFACE_INSPECTION' | 'PROFILE_MEASUREMENT' | 'FLATNESS_MEASUREMENT';

export type AlertState = 'NEW' | 'ACKNOWLEDGED' | 'ESCALATED' | 'CLEARED';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type UserRole = 'OPERATOR' | 'LEAD' | 'ADMIN';

export type NetworkType = 'WIFI' | 'LAN' | 'VPN' | 'CELLULAR';

export type UnitSystem = 'METRIC' | 'IMPERIAL';

export type AnomalyType =
  | 'VISUAL_DEFECT'
  | 'DIMENSIONAL_VARIANCE'
  | 'SURFACE_ROUGHNESS'
  | 'FLATNESS_DEVIATION'
  | 'PROFILE_OFFSET';

export interface Alert {
  id: string;
  measurementId: string;
  anomalyType: AnomalyType;
  startPos: number;
  length: number;
  severity: Severity;
  currentState: AlertState;
  priority: number;
  createdAt: string;
  updatedAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface Measurement {
  id: string;
  serialNumber: string;
  system: SystemType;
  timestamp: string;
  productLength: number;
  productType: string;
  alerts: Alert[];
}

export interface AnomalyConfig {
  id: string;
  type: AnomalyType;
  sourceTypeKey: string;
  displayName: string;
  defaultSeverity: Severity;
  color: string;
  audioAlarm: boolean;
  flashlightAlarm: boolean;
  isActive: boolean;
}

export interface AlertHistoryEntry {
  id: string;
  alertId: string;
  user: string;
  action: string;
  previousState?: AlertState;
  newState?: AlertState;
  comment?: string;
  timestamp: string;
}

export interface DisplaySettings {
  latestNCount: number;
  pollingInterval: number;
  screenWakeLock: boolean;
  unitSystem: UnitSystem;
}

export interface NetworkConfig {
  deviceId: string;
  deviceName: string;
  networkType: NetworkType;
  apiBaseUrl: string;
  webSocketUrl: string;
  requireTls: boolean;
  tlsCertificate?: string;
  lastValidated?: string;
  connectionStatus?: 'PENDING' | 'PASSED' | 'FAILED' | 'PARTIAL';
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  forcePinChange: boolean;
  createdAt: string;
}
