import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "../ui/drawer";

interface ColorPickerModalProps {
  isOpen: boolean;
  currentColor: string;
  onClose: () => void;
  onSave: (color: string) => void;
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

export function ColorPickerModal({ isOpen, currentColor, onClose, onSave }: ColorPickerModalProps) {
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
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-card border-t border-border outline-none mx-auto max-w-[480px] left-0 right-0">
        <DrawerHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-bold text-foreground">Choose Color</DrawerTitle>
            <DrawerClose asChild>
              <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                <X size={24} />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="px-6 py-4 space-y-8">
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
                  className={`w-14 h-14 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center ${
                    selectedColor.toLowerCase() === preset.value.toLowerCase() 
                      ? 'border-primary scale-110 shadow-lg' 
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.value }}
                >
                  {selectedColor.toLowerCase() === preset.value.toLowerCase() && (
                    <Check size={24} className={preset.value.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'} />
                  )}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight opacity-0 group-hover:opacity-100 transition-opacity">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Hex Input */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
              Custom Hex Code
            </label>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl border border-border shrink-0" 
                style={{ backgroundColor: selectedColor }}
              />
              <input
                type="text"
                value={customHex.toUpperCase()}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#000000"
                className="flex-1 h-12 bg-muted/30 border border-border rounded-xl px-4 font-mono font-bold text-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        <DrawerFooter className="px-6 pt-2 pb-10">
          <button
            onClick={() => {
              onSave(selectedColor);
              onClose();
            }}
            className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform"
          >
            Apply Color
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
