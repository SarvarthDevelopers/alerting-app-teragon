import { Measurement, AnomalyConfig, Alert } from '../types';

/**
 * Enhances measurements by overriding alert severities and labels based on global anomaly configurations.
 */
export function enhanceMeasurements(
  measurements: Measurement[],
  anomalyConfigs: AnomalyConfig[]
): Measurement[] {
  return measurements.map(m => ({
    ...m,
    alerts: m.alerts.map(alert => {
      const config = anomalyConfigs.find(c => c.type === alert.anomalyType);
      
      return {
        ...alert,
        // Override severity with defaultSeverity from config if it exists
        severity: config ? config.defaultSeverity : alert.severity,
        // We could also override priority here if we wanted, 
        // but the user specifically mentioned severity.
      };
    })
  }));
}

/**
 * Single measurement version of enhanceMeasurements
 */
export function enhanceMeasurement(
  measurement: Measurement,
  anomalyConfigs: AnomalyConfig[]
): Measurement {
  return enhanceMeasurements([measurement], anomalyConfigs)[0];
}
