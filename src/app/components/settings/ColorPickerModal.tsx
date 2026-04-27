import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ColorPickerModalProps {
  isOpen: boolean;
  currentColor: string;
  onClose: () => void;
  onSave: (color: string) => void;
}

export function ColorPickerModal({ isOpen, currentColor, onClose, onSave }: ColorPickerModalProps) {
  const [color, setColor] = useState(currentColor);
  const [hexInput, setHexInput] = useState(currentColor);

  const handleHexChange = (value: string) => {
    setHexInput(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setColor(value);
    }
  };

  const handleSave = () => {
    onSave(color);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card w-full md:max-w-md md:rounded-2xl rounded-t-2xl"
          >
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Choose Color</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Color Picker
                  </label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      setHexInput(e.target.value);
                    }}
                    className="w-full h-48 rounded-xl border-2 border-border cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Hex Code
                  </label>
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => handleHexChange(e.target.value.toUpperCase())}
                    placeholder="#FF5733"
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground font-mono text-lg"
                    maxLength={7}
                  />
                </div>

                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-3">Preview</p>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-xl border-2 border-border"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Selected Color</p>
                      <p className="text-xs font-mono text-muted-foreground mt-1">{color}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  SAVE COLOR
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-4 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/70 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
