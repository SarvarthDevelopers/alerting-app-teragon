import { useState } from 'react';
import { Search, ChevronDown, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
  hideSystemFilter?: boolean;
}

export function FilterBar({ onFilterChange, hideSystemFilter }: FilterBarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const filterOptions: Record<string, string[]> = {};
  
  if (!hideSystemFilter) {
    filterOptions.system = ['All Systems', 'Surface Inspection', 'Profile Measurement', 'Flatness Measurement'];
  }
  
  filterOptions.anomalyType = ['All Types', 'Visual Defect', 'Dimensional Variance', 'Surface Roughness', 'Flatness Deviation', 'Profile Offset'];
  filterOptions.severity = ['All Severities', 'Critical', 'High', 'Medium', 'Low'];
  filterOptions.time = ['Last 1 Hour', 'Last 24 Hours', 'Last 7 Days', 'All Time'];

  const [selectedFilters, setSelectedFilters] = useState({
    system: 'All Systems',
    anomalyType: 'All Types',
    severity: 'All Severities',
    time: 'Last 24 Hours',
    search: '',
  });

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleSelect = (category: string, option: string) => {
    const newFilters = { ...selectedFilters, [category]: option };
    setSelectedFilters(newFilters);
    setActiveDropdown(null);
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

  return (
    <div className="flex items-center gap-4 mb-8 bg-card/50 backdrop-blur-md border border-border/50 p-2 rounded-2xl shadow-sm relative z-[100]">
      {/* Click-outside backdrop */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/5" 
            onClick={() => setActiveDropdown(null)} 
          />
        )}
      </AnimatePresence>

      {/* Search Input */}
      <div className="flex-1 flex items-center bg-background/50 border border-border/30 rounded-xl px-4 h-11 focus-within:ring-4 focus-within:ring-black/5 focus-within:border-black transition-all">
        <Search size={18} className="text-muted-foreground" />
        <input 
          type="text" 
          value={selectedFilters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by serial, product, anomaly, system..." 
          className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="h-6 w-px bg-border/50 mx-1" />

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-2">
        {Object.entries(filterOptions).map(([key, options]) => (
          <div key={key} className="relative z-50">
            <button
              onClick={() => toggleDropdown(key)}
              className={`flex items-center gap-2 px-4 h-11 rounded-xl text-xs font-bold transition-all border ${
                activeDropdown === key 
                  ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                  : 'bg-card border-border/50 text-foreground hover:border-black'
              }`}
            >
              <span className="opacity-60 uppercase tracking-widest">{key === 'anomalyType' ? 'type' : key}:</span>
              <span>{(selectedFilters as any)[key]}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === key ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === key && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 right-0 w-56 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden p-1"
                >
                  {options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSelect(key, option)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                        (selectedFilters as any)[key] === option
                          ? 'bg-black text-white'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isFilterActive && (
          <>
            <div className="h-6 w-px bg-border/50 mx-1" />
            <motion.button 
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="flex items-center gap-2 pl-3 pr-4 h-11 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all group"
              title="Clear all filters"
              onClick={() => {
                const reset = { system: 'All Systems', anomalyType: 'All Types', severity: 'All Severities', time: 'Last 24 Hours', search: '' };
                setSelectedFilters(reset);
                onFilterChange(reset);
              }}
            >
              <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-[10px] font-black uppercase tracking-widest">Clear</span>
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
