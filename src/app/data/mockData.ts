import { Measurement, Alert, AnomalyConfig, SystemType, AlertHistoryEntry } from '../types';

function generateSerialNumber(timestampStr: string, id: string): string {
  const date = new Date(timestampStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const numPart = id.replace(/\D/g, '');
  const seq = numPart.padStart(6, '0') || '000001';
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}_${seq}`;
}

export const anomalyConfigs: AnomalyConfig[] = [
  {
    id: 'ac1',
    type: 'VISUAL_DEFECT',
    sourceTypeKey: 'VISUAL_DEFECT',
    displayName: 'Visual Defect',
    defaultSeverity: 'HIGH',
    color: '#ef4444',
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
    color: '#f97316',
    audioAlarm: false,
    flashlightAlarm: true,
    isActive: true
  },
  {
    id: 'ac3',
    type: 'SURFACE_ROUGHNESS',
    sourceTypeKey: 'SURFACE_ROUGHNESS',
    displayName: 'Surface Roughness',
    defaultSeverity: 'MEDIUM',
    color: '#eab308',
    audioAlarm: false,
    flashlightAlarm: false,
    isActive: true
  },
  {
    id: 'ac4',
    type: 'FLATNESS_DEVIATION',
    sourceTypeKey: 'FLATNESS_DEVIATION',
    displayName: 'Flatness Deviation',
    defaultSeverity: 'HIGH',
    color: '#8b5cf6',
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

const baseMeasurements: Measurement[] = [
  {
    id: 'm23',
    serialNumber: 'SN-98674-SN-98674-SN-98674',
    system: 'SURFACE_INSPECTION',
    timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    productLength: 20000,
    productType: 'Heavy Gauge Plate',
    alerts: Array.from({ length: 18 }).map((_, i) => ({
      id: `a_high_${i}`,
      measurementId: 'm23',
      anomalyType: i % 3 === 0 ? 'VISUAL_DEFECT' : i % 3 === 1 ? 'SURFACE_ROUGHNESS' : 'DIMENSIONAL_VARIANCE',
      startPos: 500 + (i * 1000),
      length: 200 + (Math.random() * 300),
      severity: i % 5 === 0 ? 'CRITICAL' : i % 5 === 1 ? 'HIGH' : 'MEDIUM',
      currentState: 'NEW',
      priority: i % 5 === 0 ? 1 : 2,
      createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      technicalDetails: i % 4 === 0 ? `High-density anomaly #${i+1}: Detailed inspection required due to localized cluster pattern.` : undefined
    }))
  },
  {
    id: 'm1',
    serialNumber: 'SN-98652-SN-98652-SN-98652',
    system: 'SURFACE_INSPECTION',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    productLength: 12000,
    productType: 'Hot Rolled Coil',
    alerts: [
      {
        id: 'a1',
        measurementId: 'm1',
        anomalyType: 'VISUAL_DEFECT',
        startPos: 2400,
        length: 450,
        severity: 'CRITICAL',
        currentState: 'NEW',
        priority: 1,
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        technicalDetails: 'Thermal gradient deviation detected. Surface temperature reached 1240°C, exceeding safety threshold by 45°C. Immediate cooling adjustment required.'
      },
      {
        id: 'a1_overlap_1',
        measurementId: 'm1',
        anomalyType: 'DIMENSIONAL_VARIANCE',
        startPos: 2500,
        length: 200,
        severity: 'HIGH',
        currentState: 'NEW',
        priority: 2,
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        technicalDetails: 'Localized thickness variation detected in the thermal gradient area.'
      },
      {
        id: 'a1_overlap_2',
        measurementId: 'm1',
        anomalyType: 'SURFACE_ROUGHNESS',
        startPos: 2400,
        length: 450,
        severity: 'MEDIUM',
        currentState: 'NEW',
        priority: 3,
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        technicalDetails: 'Surface roughness deviation overlapping visual defect zone.'
      },
      {
        id: 'a2',
        measurementId: 'm1',
        anomalyType: 'SURFACE_ROUGHNESS',
        startPos: 8100,
        length: 320,
        severity: 'MEDIUM',
        currentState: 'NEW',
        priority: 3,
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      },
      {
        id: 'a1_hairline_1',
        measurementId: 'm1',
        anomalyType: 'VISUAL_DEFECT',
        startPos: 6200,
        length: 2,
        severity: 'CRITICAL',
        currentState: 'NEW',
        priority: 1,
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        technicalDetails: 'Hairline crack detected. Visual width: 0.15mm. Structural depth: 0.05mm. Extremely fine superficial defect.'
      }
    ]
  },
  {
    id: 'm2',
    serialNumber: 'SN-98653-SN-98653-SN-98653',
    system: 'SURFACE_INSPECTION',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    productLength: 10500,
    productType: 'Cold Rolled Sheet',
    alerts: [
      {
        id: 'a3',
        measurementId: 'm2',
        anomalyType: 'VISUAL_DEFECT',
        startPos: 5200,
        length: 280,
        severity: 'HIGH',
        currentState: 'NEW',
        priority: 2,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        technicalDetails: 'Edge crack pattern identified. Correlation found with roll vibration sensor RSV-04. Potential bearing fatigue in Finishing Stand 2.'
      },
      {
        id: 'a2_hairline_1',
        measurementId: 'm2',
        anomalyType: 'SURFACE_ROUGHNESS',
        startPos: 1200,
        length: 5,
        severity: 'MEDIUM',
        currentState: 'NEW',
        priority: 3,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        technicalDetails: 'Localized micro-abrasion patch. Length: 5mm. Roughness index Ra: 3.2μm.'
      }
    ]
  },
  {
    id: 'm3',
    serialNumber: 'SN-98654-SN-98654-SN-98654',
    system: 'PROFILE_MEASUREMENT',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    productLength: 15000,
    productType: 'Structural Beam',
    alerts: [
      {
        id: 'a4',
        measurementId: 'm3',
        anomalyType: 'PROFILE_OFFSET',
        startPos: 3500,
        length: 650,
        severity: 'CRITICAL',
        currentState: 'NEW',
        priority: 1,
        createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
        acknowledgedBy: 'Operator Smith',
        acknowledgedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString()
      },
      {
        id: 'a3_hairline_1',
        measurementId: 'm3',
        anomalyType: 'DIMENSIONAL_VARIANCE',
        startPos: 8500,
        length: 8,
        severity: 'HIGH',
        currentState: 'NEW',
        priority: 2,
        createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        technicalDetails: 'Point deviation on flange height. Variance: +0.45mm. Extremely localized variance.'
      }
    ]
  },
  {
    id: 'm4',
    serialNumber: 'SN-98655-SN-98655-SN-98655',
    system: 'PROFILE_MEASUREMENT',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    productLength: 8900,
    productType: 'Rail Section',
    alerts: []
  },
  {
    id: 'm5',
    serialNumber: 'SN-98656-SN-98656-SN-98656',
    system: 'FLATNESS_MEASUREMENT',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    productLength: 11200,
    productType: 'Flat Plate',
    alerts: [
      {
        id: 'a5',
        measurementId: 'm5',
        anomalyType: 'FLATNESS_DEVIATION',
        startPos: 1800,
        length: 420,
        severity: 'HIGH',
        currentState: 'NEW',
        priority: 2,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: 'a5_overlap',
        measurementId: 'm5',
        anomalyType: 'FLATNESS_DEVIATION',
        startPos: 1850,
        length: 150,
        severity: 'CRITICAL',
        currentState: 'NEW',
        priority: 1,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        technicalDetails: 'Severe localized flatness deviation exceeding maximum allowable structural tolerance.'
      },
      {
        id: 'a6',
        measurementId: 'm5',
        anomalyType: 'FLATNESS_DEVIATION',
        startPos: 6400,
        length: 190,
        severity: 'LOW',
        currentState: 'ACKNOWLEDGED',
        priority: 4,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        acknowledgedBy: 'Operator Jones',
        acknowledgedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        id: 'a5_hairline_1',
        measurementId: 'm5',
        anomalyType: 'FLATNESS_DEVIATION',
        startPos: 9200,
        length: 3,
        severity: 'LOW',
        currentState: 'NEW',
        priority: 4,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        technicalDetails: 'Localized micro-ripple. Amplitude: 0.12mm. Near edge boundary.'
      }
    ]
  },
  {
    id: 'm6',
    serialNumber: 'SN-98657-SN-98657-SN-98657',
    system: 'FLATNESS_MEASUREMENT',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    productLength: 9800,
    productType: 'Sheet Metal',
    alerts: []
  },
  {
    id: 'm7',
    serialNumber: 'SN-98658-SN-98658-SN-98658',
    system: 'SURFACE_INSPECTION',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    productLength: 13400,
    productType: 'Hot Rolled Coil',
    alerts: [
      {
        id: 'a7',
        measurementId: 'm7',
        anomalyType: 'DIMENSIONAL_VARIANCE',
        startPos: 4200,
        length: 310,
        severity: 'MEDIUM',
        currentState: 'ACKNOWLEDGED',
        priority: 3,
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
        acknowledgedBy: 'Operator Davis',
        acknowledgedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString()
      },
      {
        id: 'a7_hairline_1',
        measurementId: 'm7',
        anomalyType: 'PROFILE_OFFSET',
        startPos: 11500,
        length: 1,
        severity: 'CRITICAL',
        currentState: 'NEW',
        priority: 1,
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        technicalDetails: 'Extreme point offset detected. Sudden profile deviation. Duration: <0.1s.'
      }
    ]
  },
  // OK measurements - Surface Inspection
  {
    id: 'm8',
    serialNumber: 'SN-98659-SN-98659-SN-98659',
    system: 'SURFACE_INSPECTION',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    productLength: 11800,
    productType: 'Cold Rolled Sheet',
    alerts: []
  },
  {
    id: 'm9',
    serialNumber: 'SN-98660-SN-98660-SN-98660',
    system: 'SURFACE_INSPECTION',
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    productLength: 9500,
    productType: 'Hot Rolled Coil',
    alerts: []
  },
  {
    id: 'm10',
    serialNumber: 'SN-98661-SN-98661-SN-98661',
    system: 'SURFACE_INSPECTION',
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    productLength: 12300,
    productType: 'Galvanized Sheet',
    alerts: []
  },
  {
    id: 'm11',
    serialNumber: 'SN-98662-SN-98662-SN-98662',
    system: 'SURFACE_INSPECTION',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    productLength: 10100,
    productType: 'Cold Rolled Sheet',
    alerts: []
  },
  {
    id: 'm12',
    serialNumber: 'SN-98663-SN-98663-SN-98663',
    system: 'SURFACE_INSPECTION',
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    productLength: 13700,
    productType: 'Hot Rolled Coil',
    alerts: []
  },
  // OK measurements - Profile Measurement
  {
    id: 'm13',
    serialNumber: 'SN-98664-SN-98664-SN-98664',
    system: 'PROFILE_MEASUREMENT',
    timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    productLength: 14200,
    productType: 'Structural Beam',
    alerts: []
  },
  {
    id: 'm14',
    serialNumber: 'SN-98665-SN-98665-SN-98665',
    system: 'PROFILE_MEASUREMENT',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    productLength: 9100,
    productType: 'Rail Section',
    alerts: []
  },
  {
    id: 'm15',
    serialNumber: 'SN-98666-SN-98666-SN-98666',
    system: 'PROFILE_MEASUREMENT',
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    productLength: 11900,
    productType: 'Angle Iron',
    alerts: []
  },
  {
    id: 'm16',
    serialNumber: 'SN-98667-SN-98667-SN-98667',
    system: 'PROFILE_MEASUREMENT',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    productLength: 8600,
    productType: 'Channel Section',
    alerts: []
  },
  {
    id: 'm17',
    serialNumber: 'SN-98668-SN-98668-SN-98668',
    system: 'PROFILE_MEASUREMENT',
    timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    productLength: 13100,
    productType: 'Structural Beam',
    alerts: []
  },
  // OK measurements - Flatness Measurement
  {
    id: 'm18',
    serialNumber: 'SN-98669-SN-98669-SN-98669',
    system: 'FLATNESS_MEASUREMENT',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    productLength: 10700,
    productType: 'Flat Plate',
    alerts: []
  },
  {
    id: 'm19',
    serialNumber: 'SN-98670-SN-98670-SN-98670',
    system: 'FLATNESS_MEASUREMENT',
    timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    productLength: 12500,
    productType: 'Sheet Metal',
    alerts: []
  },
  {
    id: 'm20',
    serialNumber: 'SN-98671-SN-98671-SN-98671',
    system: 'FLATNESS_MEASUREMENT',
    timestamp: new Date(Date.now() - 17 * 60 * 1000).toISOString(),
    productLength: 9300,
    productType: 'Flat Plate',
    alerts: []
  },
  {
    id: 'm21',
    serialNumber: 'SN-98672-SN-98672-SN-98672',
    system: 'FLATNESS_MEASUREMENT',
    timestamp: new Date(Date.now() - 26 * 60 * 1000).toISOString(),
    productLength: 11600,
    productType: 'Steel Plate',
    alerts: []
  },
  {
    id: 'm22',
    serialNumber: 'SN-98673-SN-98673-SN-98673',
    system: 'FLATNESS_MEASUREMENT',
    timestamp: new Date(Date.now() - 33 * 60 * 1000).toISOString(),
    productLength: 10400,
    productType: 'Sheet Metal',
    alerts: []
  },
  {
    id: 'm24',
    serialNumber: 'SN-98675-SN-98675-SN-98675',
    system: 'SURFACE_INSPECTION',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    productLength: 20000,
    productType: 'Heavy Gauge Plate',
    alerts: Array.from({ length: 320 }).map((_, i) => {
      const anomalyTypes: ('VISUAL_DEFECT' | 'SURFACE_ROUGHNESS' | 'DIMENSIONAL_VARIANCE')[] = ['VISUAL_DEFECT', 'SURFACE_ROUGHNESS', 'DIMENSIONAL_VARIANCE'];
      const severities: ('CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
      return {
        id: `a_high_density_${i}`,
        measurementId: 'm24',
        anomalyType: anomalyTypes[i % 3],
        startPos: (i * 60) + (Math.random() * 20),
        length: 15 + (Math.random() * 25),
        severity: severities[i % 4],
        currentState: 'NEW',
        priority: (i % 4) + 1,
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        technicalDetails: i % 10 === 0 ? `High-density inspection detail for anomaly ${i}. Micro-fracture detected in zone ${Math.floor(i / 10)}.` : undefined
      };
    })
  }
];

export const mockMeasurements: Measurement[] = baseMeasurements.map(m => ({
  ...m,
  serialNumber: generateSerialNumber(m.timestamp, m.id)
}));

export const mockAlertHistory: AlertHistoryEntry[] = [
  {
    id: 'h1',
    alertId: 'a1',
    user: 'Operator Smith',
    action: 'Created',
    newState: 'NEW',
    comment: 'Detected by automated inspection',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: 'h2',
    alertId: 'a3',
    user: 'Operator Smith',
    action: 'Acknowledged',
    previousState: 'NEW',
    newState: 'ACKNOWLEDGED',
    comment: 'Inspecting defect location',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString()
  },
];

export function getSystemDisplayName(system: SystemType): string {
  switch (system) {
    case 'SURFACE_INSPECTION':
      return 'Surface Inspection';
    case 'PROFILE_MEASUREMENT':
      return 'Profile Measurement';
    case 'FLATNESS_MEASUREMENT':
      return 'Flatness Measurement';
  }
}

export function getMeasurementsBySystem(system: SystemType): Measurement[] {
  return mockMeasurements.filter(m => m.system === system);
}

export function getAllActiveAlerts(): Alert[] {
  return mockMeasurements
    .flatMap(m => m.alerts)
    .filter(a => a.currentState === 'NEW')
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export function getMeasurementById(id: string): Measurement | undefined {
  return mockMeasurements.find(m => m.id === id);
}

export function getAnomalyConfig(type: string): AnomalyConfig | undefined {
  return anomalyConfigs.find(c => c.type === type);
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
