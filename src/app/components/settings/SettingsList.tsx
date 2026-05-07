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
      className="w-full bg-card border border-border rounded-[var(--radius)] p-[17px] flex items-center justify-between hover:border-foreground transition-all duration-200"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0 w-10 h-10 bg-foreground rounded-[var(--radius-md)] flex items-center justify-center text-background">
          {icon}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-foreground leading-tight">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded text-[10px] font-bold uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
          )}
        </div>
      </div>
      <ChevronRight size={20} className="text-muted-foreground flex-shrink-0 ml-2" />
    </motion.button>
  );
}
