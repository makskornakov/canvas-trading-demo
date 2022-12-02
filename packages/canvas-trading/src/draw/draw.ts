import type { CandleCanvas } from '../classes/CandleCanvas';

import {
  alligatorLinesSettings,
  candleColors,
  canvasSettings,
  tradeColors,
} from '../config';
import {
  roundedRect,
  line,
  rect,
  drawMountedIndicators,
  drawCurveLine,
  findCandleWithTrade,
} from './drawFunctions';
import type { CheckedOtherSettings, FoundCandle, Vector2 } from '../types';

export function displayTrade(
  ctx: CanvasRenderingContext2D,
  candleCanvas: CandleCanvas,
  tradeID: number
): {
  startCandle: FoundCandle;
  endCandle: FoundCandle;
} {
  const startCandle = findCandleWithTrade(candleCanvas.candleArray, tradeID);
  const endCandle = findCandleWithTrade(
    candleCanvas.candleArray,
    tradeID,
    true
  );
  // draw line from buy to sell
  if (startCandle.candle && endCandle.candle) {
    const start = {
      x: startCandle.candle.xPosition + candleCanvas.candleWidth / 2,
      y: startCandle.candle.trades[startCandle.innerIndex].buyPrice,
    };
    const end = {
      x: endCandle.candle.xPosition + candleCanvas.candleWidth / 2,
      y: endCandle.candle.trades[endCandle.innerIndex].sellPrice,
    };
    const isProfit =
      endCandle.candle.trades[endCandle.innerIndex].tradeType === 'long'
        ? // canvas cords are inverted
          end.y < start.y
        : end.y > start.y;

    // draw filled rect behind the line
    roundedRect(
      ctx,
      start.x,
      Math.min(start.y, end.y),
      end.x - start.x,
      Math.abs(end.y - start.y),
      10,
      isProfit ? tradeColors.positiveRect : tradeColors.negativeRect
    );

    line(ctx, start, end, 'white', Math.sqrt(candleCanvas.candleWidth), 0.8, [
      candleCanvas.candleWidth,
      candleCanvas.candleWidth,
    ]);

    // arrow head
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    const size =
      candleCanvas.candleWidth + Math.sqrt(candleCanvas.candleWidth) * 3;
    ctx.lineTo(
      end.x - size * Math.cos(angle - Math.PI / 6),
      end.y - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      end.x - size * Math.cos(angle + Math.PI / 6),
      end.y - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(end.x, end.y);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
  }
  return { startCandle, endCandle };
}

export function drawCursor(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  cursor: Vector2
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  line(
    ctx,
    { x: cursor.x * canvasSettings.scaleForQuality, y: 0 },
    { x: cursor.x * canvasSettings.scaleForQuality, y: canvasHeight },
    'white',
    0.7,
    0.8,
    [15 - canvasHeight / 100, 15 - canvasHeight / 100]
  );
  line(
    ctx,
    { x: 0, y: cursor.y * canvasSettings.scaleForQuality },
    { x: canvasWidth, y: cursor.y * canvasSettings.scaleForQuality },
    'white',
    0.7,
    0.8,
    [15 - canvasHeight / 100, 15 - canvasHeight / 100]
  );
}
export function drawAo(
  ctx: CanvasRenderingContext2D,
  candleCanvas: CandleCanvas
) {
  //clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  candleCanvas.aoArray.forEach((ao, i) => {
    rect(
      ctx,
      ao.x,
      ao.y,
      candleCanvas.candleWidth,
      ao.height,
      ao.vertexValue > candleCanvas.aoArray[i - 1]?.vertexValue
        ? candleColors.green
        : candleColors.red
    );
  });
}

export const drawFunction = (
  ctx: CanvasRenderingContext2D,
  canvas: CandleCanvas,
  otherSettings: CheckedOtherSettings
) => {
  // clear ctx
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.candleArray.forEach((candle) => {
    if (candle.noDraw) return;

    const x = candle.xPosition;
    const candleIsRed = candle.open < candle.close;
    const y = candleIsRed ? candle.open : candle.close;

    const candleFillColor = candleIsRed ? candleColors.red : candleColors.green;

    // draw candle
    rect(
      ctx,
      x,
      y,
      canvas.candleWidth,
      Math.abs(candle.open - candle.close),
      candleFillColor
    );

    // draw wick
    const wickX = x + canvas.candleWidth / 2;
    line(
      ctx,
      { x: wickX, y: candle.high },
      { x: wickX, y: candle.low },
      candleFillColor,
      canvas.candleWidth / 6
    );

    // draw indicators
    if (otherSettings.mountedIndicators)
      drawMountedIndicators(ctx, candle, x, canvas.candleWidth);
  });
  if (otherSettings.alligator) {
    // draw alligator
    const alligatorWidth = Math.sqrt(
      canvas.candleWidth * alligatorLinesSettings.lineWeight
    );
    const alligatorKeys = Object.keys(canvas.alligatorArray) as Array<
      keyof typeof canvas.alligatorArray
    >;
    alligatorKeys.forEach((key) => {
      drawCurveLine(
        ctx,
        canvas.alligatorArray[key],
        alligatorLinesSettings[key],
        alligatorWidth
      );
    });
  }

  drawLastCandlePrice(ctx, canvas, otherSettings);
};

function drawLastCandlePrice(
  ctx: CanvasRenderingContext2D,
  canvas: CandleCanvas,
  otherSettings: CheckedOtherSettings,
) {
  if (!otherSettings.showLastCandlePrice) return;

  const lastCandle = canvas.lastCandle;
  if (!lastCandle) return;

  const alligatorOffset = 8;

  const lastCandle2D = canvas.candleArray[canvas.candleArray.length - (1 + alligatorOffset) + canvas.candleShift];
  if (!lastCandle2D) return;

  ctx.beginPath();
  ctx.fillStyle = 'white';
  const fontFamily = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`;
  ctx.font = `${canvas.height / 25}px ${fontFamily}`;
  const text = `-- ${Number(lastCandle.close.toFixed(2))}`;
  const x = lastCandle2D.xPosition + canvas.candleWidth * 2 + canvas.gap;
  /** So that the '--' in the start of the text exactly matches the position of the candle body bottom. */
  const fineTunedYOffset = 7;
  const y = lastCandle2D.close + fineTunedYOffset;
  ctx.fillText(text, x, y);
  ctx.closePath();
}
