import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onAcknowledgeAll: () => void;
  onCancel: () => void;
  isResolving: boolean;
}

export function BulkActionBar({ selectedCount, onAcknowledgeAll, onCancel, isResolving }: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 32, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] pointer-events-auto"
        >
          <motion.div
            layout
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl shadow-black/25 transition-colors duration-500 ${
              isResolving ? 'bg-emerald-500' : 'bg-foreground text-background'
            }`}
          >
            <AnimatePresence mode="wait">
              {isResolving ? (
                <motion.div
                  key="resolving"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 px-2"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12 }}
                  >
                    <CheckCircle2 size={18} className="text-white" />
                  </motion.div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-white whitespace-nowrap">
                    {selectedCount} Alert{selectedCount !== 1 ? 's' : ''} Resolved
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center gap-2.5 pr-3 border-r border-background/20">
                    <div className="w-7 h-7 bg-background/15 rounded-lg flex items-center justify-center">
                      <span className="text-[12px] font-black tabular-nums">{selectedCount}</span>
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
                      {selectedCount === 1 ? 'alert' : 'alerts'} selected
                    </span>
                  </div>

                  <button
                    onClick={onAcknowledgeAll}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/30"
                  >
                    <CheckCircle2 size={14} />
                    Acknowledge All
                  </button>

                  <button
                    onClick={onCancel}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-background/10 hover:bg-background/20 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
