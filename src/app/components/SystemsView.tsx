import { useState } from 'react';
import { SystemType } from '../types';
import { SystemView } from './SystemView';
import { motion } from 'motion/react';

export function SystemsView() {
  const [activeSystem, setActiveSystem] = useState<SystemType>('SURFACE_INSPECTION');

  const systems: { id: SystemType; label: string }[] = [
    { id: 'SURFACE_INSPECTION', label: 'Surface' },
    { id: 'PROFILE_MEASUREMENT', label: 'Profile' },
    { id: 'FLATNESS_MEASUREMENT', label: 'Flatness' }
  ];

  return (
    <div>
      <div className="sticky top-0 bg-background z-20 -mx-4 px-4 pt-2 pb-4">
        <div className="bg-white rounded-xl p-2 flex gap-2.5 relative">
          {systems.map((system) => {
            const isActive = activeSystem === system.id;

            return (
              <button
                key={system.id}
                onClick={() => setActiveSystem(system.id)}
                className={`flex-1 px-4 py-2 rounded-xl font-semibold text-base transition-colors relative z-10 ${
                  isActive
                    ? 'text-white'
                    : 'text-[#838383] hover:text-[#525252]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabSystems"
                    className="absolute inset-0 bg-[#262626] rounded-xl -z-10"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}
                {system.label}
              </button>
            );
          })}
        </div>
      </div>

      <SystemView system={activeSystem} />
    </div>
  );
}
