import { AlertState, Severity } from '../types';
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface AlertBadgeProps {
  state: AlertState;
  size?: 'sm' | 'md' | 'lg';
}

export function AlertBadge({ state, size = 'md' }: AlertBadgeProps) {
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  const stateConfig = {
    NEW: {
      label: 'New',
      className: 'bg-alert-new text-alert-new-foreground',
      icon: AlertCircle
    },
    ACKNOWLEDGED: {
      label: 'Ackd',
      className: 'bg-alert-acknowledged text-alert-acknowledged-foreground',
      icon: CheckCircle
    },
    ESCALATED: {
      label: 'Escalated',
      className: 'bg-alert-escalated text-alert-escalated-foreground',
      icon: AlertTriangle
    },
    CLEARED: {
      label: 'Cleared',
      className: 'bg-alert-cleared text-alert-cleared-foreground',
      icon: CheckCircle
    }
  };

  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md ${sizeClasses[size]} ${config.className}`}
    >
      <Icon size={iconSize} />
      {config.label}
    </span>
  );
}

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
}

export function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const severityConfig = {
    CRITICAL: {
      label: 'Critical',
      style: { backgroundColor: 'var(--severity-critical)' }
    },
    HIGH: {
      label: 'High',
      style: { backgroundColor: 'var(--severity-high)' }
    },
    MEDIUM: {
      label: 'Medium',
      style: { backgroundColor: 'var(--severity-medium)' }
    },
    LOW: {
      label: 'Low',
      style: { backgroundColor: 'var(--severity-low)' }
    }
  };

  const config = severityConfig[severity];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md text-white ${sizeClasses[size]}`}
      style={config.style}
    >
      {config.label}
    </span>
  );
}
