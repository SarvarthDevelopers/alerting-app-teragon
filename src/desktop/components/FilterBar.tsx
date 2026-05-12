import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnomalyConfig, SeverityConfig } from '../../app/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../app/components/ui/select';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
  hideSystemFilter?: boolean;
  anomalyConfigs: AnomalyConfig[];
  severityConfigs: SeverityConfig[];
  onClear?: () => void;
}

const DEFAULT_FILTERS = {
  system: 'All Systems',
  anomalyType: 'All Types',
  severity: 'All Severities',
  time: 'Last 24 Hours',
  search: '',
};

const TRIGGER_CLASS = 'h-11 w-auto rounded-xl border-border/50 bg-card text-xs font-bold gap-1.5 px-3 focus-visible:ring-4 focus-visible:ring-black/5 focus-visible:border-black transition-all outline-none';

export function FilterBar({ onFilterChange, hideSystemFilter, anomalyConfigs, severityConfigs, onClear }: FilterBarProps) {
  const [selectedFilters, setSelectedFilters] = useState(DEFAULT_FILTERS);

  const handleSelect = (category: string, value: string) => {
    const newFilters = { ...selectedFilters, [category]: value };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    const newFilters = { ...selectedFilters, search: value };
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const isFilterActive =
    selectedFilters.system !== 'All Systems' ||
    selectedFilters.anomalyType !== 'All Types' ||
    selectedFilters.severity !== 'All Severities' ||
    selectedFilters.time !== 'Last 24 Hours' ||
    selectedFilters.search !== '';

  const systemOptions = ['All Systems', 'Surface Inspection', 'Profile Measurement', 'Flatness Measurement'];
  const anomalyOptions = ['All Types', ...anomalyConfigs.filter(c => c.isActive).map(c => c.displayName)];
  const severityOptions = ['All Severities', ...severityConfigs.map(c => c.label)];
  const timeOptions = ['Last 1 Hour', 'Last 24 Hours', 'Last 7 Days', 'All Time'];

  return (
    <div className="flex items-center gap-3 mb-8 bg-card/50 backdrop-blur-md border border-border/50 p-2 rounded-2xl shadow-sm">
      {/* Search Input */}
      <div className="flex-1 flex items-center bg-background/50 border border-border/30 rounded-xl px-4 h-11 focus-within:ring-4 focus-within:ring-black/5 focus-within:border-black transition-all">
        <Search size={18} className="text-muted-foreground shrink-0" />
        <input
          type="text"
          value={selectedFilters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by serial, product, anomaly, system..."
          className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="h-6 w-px bg-border/50 mx-1 shrink-0" />

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-2 shrink-0">
        {!hideSystemFilter && (
          <Select value={selectedFilters.system} onValueChange={(val) => handleSelect('system', val)}>
            <SelectTrigger className={TRIGGER_CLASS}>
              <span className="opacity-50 uppercase tracking-widest text-[9px] font-black">System:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border rounded-xl">
              {systemOptions.map(opt => (
                <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={selectedFilters.anomalyType} onValueChange={(val) => handleSelect('anomalyType', val)}>
          <SelectTrigger className={TRIGGER_CLASS}>
            <span className="opacity-50 uppercase tracking-widest text-[9px] font-black">Type:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border rounded-xl">
            {anomalyOptions.map(opt => (
              <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedFilters.severity} onValueChange={(val) => handleSelect('severity', val)}>
          <SelectTrigger className={TRIGGER_CLASS}>
            <span className="opacity-50 uppercase tracking-widest text-[9px] font-black">Severity:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border rounded-xl">
            {severityOptions.map(opt => {
              const severityId = opt === 'All Severities' ? null : opt.toUpperCase();
              return (
                <SelectItem key={opt} value={opt} className="font-bold">
                  <div className="flex items-center gap-2">
                    {severityId && (
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: `var(--severity-${severityId.toLowerCase()})` }}
                      />
                    )}
                    {opt}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select value={selectedFilters.time} onValueChange={(val) => handleSelect('time', val)}>
          <SelectTrigger className={TRIGGER_CLASS}>
            <span className="opacity-50 uppercase tracking-widest text-[9px] font-black">Time:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border rounded-xl">
            {timeOptions.map(opt => (
              <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence>
        {isFilterActive && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center shrink-0"
          >
            <div className="h-6 w-px bg-border/50 mx-2 shrink-0" />
            <button
              className="flex items-center gap-2 pl-3 pr-4 h-11 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all group shrink-0"
              title="Clear all filters"
              onClick={() => {
                setSelectedFilters(DEFAULT_FILTERS);
                onFilterChange(DEFAULT_FILTERS);
                onClear?.();
              }}
            >
              <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-[10px] font-black uppercase tracking-widest">Clear</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
