export const candleColors = {
  red: '#ff0037',
  green: '#6bc800',
} as const;
export const tradeColors = {
  positiveArrow: '#6bc800',
  negativeArrow: '#ff0037',
  positiveRect: 'rgba(50, 255, 30, 0.35)',
  negativeRect: ' rgba(255, 0, 55, 0.35)',
} as const;

export const alligatorLinesSettings = {
  jaw: 'rgba(25, 118, 210, 0.8)',
  teeth: 'rgba(226, 56, 52, 0.8)',
  lips: 'rgba(76, 175, 80, 0.8)',
  lineWeight: 0.6,
} as const;
export const canvasSettings = {
  zoomStrength: 0.12,
  shiftStrength: 0.15,
  minCandlesShown: 30,
  scaleForQuality: 2,
} as const;
