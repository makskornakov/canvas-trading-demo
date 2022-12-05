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
  arrowWithHead,
} from './drawFunctions';
import type {
  CandleToDraw,
  CheckedOtherSettings,
  FoundCandle,
  Vector2,
} from '../types';
import { Candle2D } from '../classes/CandleClasses';

export function displayTrade(
  ctx: CanvasRenderingContext2D,
  candleCanvas: CandleCanvas,
  tradeCandles: {
    startCandle: FoundCandle<CandleToDraw>;
    endCandle: FoundCandle<CandleToDraw>;
  }
):
  | {
      startCandle: FoundCandle<CandleToDraw>;
      endCandle: FoundCandle<CandleToDraw>;
    }
  | undefined {
  const { startCandle, endCandle } = tradeCandles;

  // draw line from buy to sell
  if (startCandle.candle && endCandle.candle) {
    const originalIndexOfFirstVisibleCandle =
      candleCanvas.candleArray[0].originalIndex;
    const startCandleIndex =
      startCandle.index -
      originalIndexOfFirstVisibleCandle +
      candleCanvas.candleShift; // will be negative if the candle is not visible

    const originalEndCandleIndex =
      endCandle.index -
      originalIndexOfFirstVisibleCandle +
      candleCanvas.candleShift;

    /** if the trade is all the way (fully) hidden outside the viewport borders. */
    const isNotInViewport =
      (originalEndCandleIndex < 0 && startCandleIndex < 0) ||
      (originalEndCandleIndex >= candleCanvas.candlesShown &&
        startCandleIndex >= candleCanvas.candlesShown);

    if (isNotInViewport) return;

    const buyPrice =
      startCandle.candle.trades?.[startCandle.innerIndex].buyPrice!;
    const sellPrice =
      endCandle.candle.trades?.[endCandle.innerIndex].sellPrice!;

    const isTradeLong =
      endCandle.candle.trades?.[endCandle.innerIndex].tradeType === 'long';
    const isProfit = isTradeLong ? buyPrice < sellPrice : buyPrice > sellPrice;

    const start = {
      x:
        startCandleIndex * (candleCanvas.candleWidth + candleCanvas.gap) +
        candleCanvas.candleWidth / 2,
      y: Candle2D.getPoint(buyPrice, candleCanvas),
    };
    const end = {
      x:
        originalEndCandleIndex * (candleCanvas.candleWidth + candleCanvas.gap) +
        candleCanvas.candleWidth / 2,
      y: Candle2D.getPoint(sellPrice, candleCanvas),
    };

    const tradeInOneCandle =
      startCandle.candle.openTime === endCandle.candle.openTime;

    if (!tradeInOneCandle) {
      // draw filled rect behind the line
      roundedRect(
        ctx,
        start.x,
        Math.min(start.y, end.y),
        end.x - start.x,
        Math.abs(end.y - start.y),
        candleCanvas.width / 150,
        isProfit ? tradeColors.positiveRect : tradeColors.negativeRect
      );
      arrowWithHead(
        ctx,
        start,
        end,
        tradeColors.arrow,
        candleCanvas.candleWidth
      );
    }
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

    /** Should be white when it closed at the same price it opened. */
    const candleIsWhite = candle.open === candle.close;
    const fixedWidthIfCandleIsWhite = 3;

    const candleFillColor = candleIsWhite
      ? 'white'
      : candleIsRed
      ? candleColors.red
      : candleColors.green;

    // draw candle
    rect(
      ctx,
      x,
      y,
      canvas.candleWidth,
      candleIsWhite
        ? fixedWidthIfCandleIsWhite
        : Math.abs(candle.open - candle.close),
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
        alligatorWidth,
        'round'
      );
    });
  }

  drawLastCandlePrice(ctx, canvas, otherSettings);
};

function drawLastCandlePrice(
  ctx: CanvasRenderingContext2D,
  canvas: CandleCanvas,
  otherSettings: CheckedOtherSettings
) {
  if (!otherSettings.showLastCandlePrice) return;

  const lastCandle = canvas.lastCandle;
  if (!lastCandle || !lastCandle.close) return; // lastCandle.close may be undefined on DF3 sometimes. Idk why.

  const alligatorOffset = 8;

  const lastCandle2D =
    canvas.candleArray[
      canvas.candleArray.length - (1 + alligatorOffset) + canvas.candleShift
    ];
  if (!lastCandle2D) return;

  ctx.beginPath();
  ctx.fillStyle = 'gray';
  const fontWeight = 200;
  const fontFamily = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`;
  ctx.font = `${fontWeight} ${canvas.height / 25}px ${fontFamily}`;
  const text = `-- ${Number(lastCandle.close.toFixed(2))}`;
  const metrics = ctx.measureText(text);
  const x = lastCandle2D.xPosition + canvas.candleWidth * 2 + canvas.gap;
  /** So that the '--' in the start of the text exactly matches the position of the candle body bottom. */
  const centerYOffset =
    metrics.actualBoundingBoxAscent / 2 - metrics.actualBoundingBoxDescent;
  const y = lastCandle2D.close + centerYOffset;
  ctx.fillText(text, x, y);
  ctx.closePath();
}
