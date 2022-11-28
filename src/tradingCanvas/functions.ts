import { canvasSettings } from './config';
import { Vector2 } from './types';

export function scrollZoom(
  movement: Vector2,
  shift: number,
  candlesShown: number,
  maxCandles: number,
  setShift: (shift: number) => void,
  setCandlesShown: (candlesShown: number) => void
) {
  maxCandles -= 3;
  const newCandlesShown = yMovement(
    movement,
    candlesShown,
    maxCandles,
    shift,
    setCandlesShown
  );
  xMovement(movement, shift, newCandlesShown, maxCandles, setShift);
}
function yMovement(
  movement: { y: number },
  candlesShown: number,
  maxCandles: number,
  shift: number,
  setCandlesShown: (arg0: number) => void
) {
  if (movement.y !== 0) {
    if (
      (candlesShown > 19 || (candlesShown === 20 && movement.y > 0)) &&
      (candlesShown < maxCandles - shift + 1 ||
        (candlesShown === maxCandles - shift && movement.y < 0))
    ) {
      const newCandlesShown = Math.max(
        Math.min(
          candlesShown + Math.round(movement.y * canvasSettings.zoomStrength),
          maxCandles - shift
        ),
        20
      );
      setCandlesShown(newCandlesShown);
      return newCandlesShown;
    }
  }
  return candlesShown;
}
function xMovement(
  movement: { x: number },
  shift: number,
  candlesShown: number,
  maxCandles: number,
  setShift: (arg0: number) => void
) {
  if (movement.x !== 0) {
    if (
      (shift > 0 || (shift === 0 && movement.x < 0)) &&
      (shift < maxCandles - candlesShown + 1 ||
        (shift === maxCandles - candlesShown && movement.x > 0))
    ) {
      const newShift = Math.max(
        Math.min(
          shift - Math.round(movement.x * canvasSettings.shiftStrength),
          maxCandles - candlesShown
        ),
        0
      );
      setShift(newShift);
      return newShift;
    }
  }
  return shift;
}
