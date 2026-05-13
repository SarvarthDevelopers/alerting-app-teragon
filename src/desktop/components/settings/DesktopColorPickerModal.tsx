import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../../../app/components/ui/dialog";
import { Button } from "../../../app/components/ui/button";

interface DesktopColorPickerModalProps {
  isOpen: boolean;
  currentColor: string;
  onClose: () => void;
  onSave: (color: string) => void;
  severityLabel: string;
}

const PRESET_COLORS = [
  { name: 'Critical Red', value: '#FF3B30' },
  { name: 'High Orange', value: '#FF9500' },
  { name: 'Medium Yellow', value: '#FFCC00' },
  { name: 'Low Blue', value: '#007AFF' },
  { name: 'System Green', value: '#34C759' },
  { name: 'Teal', value: '#5AC8FA' },
  { name: 'Indigo', value: '#5856D6' },
  { name: 'Purple', value: '#AF52DE' },
  { name: 'Pink', value: '#FF2D55' },
  { name: 'Gray', value: '#8E8E93' },
  { name: 'Black', value: '#000000' },
  { name: 'Neon', value: '#CFFF00' },
];

export function DesktopColorPickerModal({ 
  isOpen, 
  currentColor, 
  onClose, 
  onSave,
  severityLabel 
}: DesktopColorPickerModalProps) {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [customHex, setCustomHex] = useState(currentColor);

  useEffect(() => {
    setSelectedColor(currentColor);
    setCustomHex(currentColor);
  }, [currentColor, isOpen]);

  const handleHexChange = (val: string) => {
    const formatted = val.startsWith('#') ? val : `#${val}`;
    setCustomHex(formatted);
    if (/^#[0-9A-F]{6}$/i.test(formatted)) {
      setSelectedColor(formatted);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[32px] border-border bg-card p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-black tracking-tight">Choose Color</DialogTitle>
          <p className="text-sm text-muted-foreground font-bold mt-1">
            Select a theme color for <span className="text-foreground underline decoration-primary decoration-2 underline-offset-4">{severityLabel}</span> severity.
          </p>
        </DialogHeader>

        <div className="space-y-8">
          {/* Preset Grid */}
          <div className="grid grid-cols-4 gap-4">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  setSelectedColor(preset.value);
                  setCustomHex(preset.value);
                }}
                className="group relative flex flex-col items-center gap-2"
              >
                <div 
                  className={`w-16 h-16 rounded-[20px] border-2 transition-all duration-300 flex items-center justify-center shadow-sm ${
                    selectedColor.toLowerCase() === preset.value.toLowerCase() 
                      ? 'border-black scale-110 shadow-xl z-10' 
                      : 'border-transparent hover:scale-105 hover:shadow-md'
                  }`}
                  style={{ backgroundColor: preset.value }}
                >
                  {selectedColor.toLowerCase() === preset.value.toLowerCase() && (
                    <div className="w-6 h-6 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                      <Check size={14} className={preset.value.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'} />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Hex Input */}
          <div className="space-y-3 pt-6 border-t border-border/50">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">
              Custom Hex Code
            </label>
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl border border-border/50 shadow-inner shrink-0 transition-colors duration-300" 
                style={{ backgroundColor: selectedColor }}
              />
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customHex.toUpperCase()}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#000000"
                  className="w-full h-14 bg-muted/30 border border-border/50 rounded-2xl px-6 font-mono font-bold text-xl text-foreground focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all"
                  maxLength={7}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest pointer-events-none">
                  HEX
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-10 gap-3">
          <Button
            autoFocus
            variant="outline"
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] border-border/50 hover:bg-muted/50 transition-all focus:border-black focus:ring-black/50 focus:ring-[3px] outline-none"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(selectedColor);
              onClose();
            }}
            className="flex-1 h-14 bg-black hover:bg-black/90 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all"
          >
            Apply Color
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
