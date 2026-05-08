import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface SavedToastProps {
  visible: boolean;
}

export function SavedToast({ visible }: SavedToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 bg-foreground text-background px-6 py-4 rounded-2xl shadow-2xl shadow-black/20 pointer-events-none"
        >
          <CheckCircle2 size={16} className="text-primary shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
            Settings saved
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
