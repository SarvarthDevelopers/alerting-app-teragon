export const OKABE_ITO_PALETTE = [
  { name: 'Orange', hex: '#E69F00' },
  { name: 'Sky Blue', hex: '#56B4E9' },
  { name: 'Bluish Green', hex: '#009E73' },
  { name: 'Yellow', hex: '#F0E442' },
  { name: 'Blue', hex: '#0072B2' },
  { name: 'Vermilion', hex: '#D55E00' },
  { name: 'Reddish Purple', hex: '#CC79A7' }
];

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function getDistance(color1: RGB, color2: RGB): number {
  return Math.sqrt(
    Math.pow(color2.r - color1.r, 2) +
    Math.pow(color2.g - color1.g, 2) +
    Math.pow(color2.b - color1.b, 2)
  );
}

export function getAccessibleColor(hexColor: string, isAccessibleMode: boolean): string {
  if (!isAccessibleMode) return hexColor;

  const targetRgb = hexToRgb(hexColor);
  let closestHex = OKABE_ITO_PALETTE[0].hex;
  let minDistance = Infinity;

  for (const paletteColor of OKABE_ITO_PALETTE) {
    const paletteRgb = hexToRgb(paletteColor.hex);
    const distance = getDistance(targetRgb, paletteRgb);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestHex = paletteColor.hex;
    }
  }

  return closestHex;
}
