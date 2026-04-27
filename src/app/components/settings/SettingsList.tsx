import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsListItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick: () => void;
  badge?: string;
}

export function SettingsListItem({ icon, title, description, onClick, badge }: SettingsListItemProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
    >
      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded text-xs font-semibold">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <ChevronRight size={20} className="text-muted-foreground flex-shrink-0" />
    </motion.button>
  );
}
