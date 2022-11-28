import { Vector2 } from './types';

export function scrollZoom(
  movement: Vector2,
  shift: number,
  candlesShown: number,
  maxCandles: number,
  setShift: (shift: number) => void,
  setCandlesShown: (candlesShown: number) => void
) {
  if (movement.y !== 0) {
    if (
      (candlesShown > 19 || (candlesShown === 20 && movement.y > 0)) &&
      (candlesShown < maxCandles - shift ||
        (candlesShown === maxCandles - shift && movement.y < 0))
    ) {
      // add
      const newCandlesShown = Math.max(
        Math.min(candlesShown + Math.round(movement.y / 5), maxCandles - shift),
        20
      );
      setCandlesShown(newCandlesShown);
    }
  }
  if (movement.x !== 0) {
    if (
      (shift > 0 || (shift === 0 && movement.x < 0)) &&
      (shift < maxCandles - candlesShown ||
        (shift === maxCandles - candlesShown + 1 && movement.x > 0))
    ) {
      // add
      const newShift = Math.max(
        Math.min(shift - Math.round(movement.x / 5), maxCandles - candlesShown),
        0
      );
      setShift(newShift);
    }
  }
}
