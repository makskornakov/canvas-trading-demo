import type { CandleCanvas } from '../classes/CandleCanvas';

import { alligatorLinesSettings, candleColors, canvasSettings, tradeColors } from '../config';
import {
  roundedRect,
  line,
  rect,
  drawMountedIndicators,
  drawCurveLine,
  arrowWithHead,
  fibonacciNumbers,
  fibonacciReference,
} from './drawFunctions';
import type { CandleToDraw, CheckedOtherSettings, FoundCandle, Vector2 } from '../types';
import { Candle2D } from '../classes/CandleClasses';

export function displayTrade(
  ctx: CanvasRenderingContext2D,
  candleCanvas: CandleCanvas,
  tradeCandles: {
    startCandle: FoundCandle<CandleToDraw>;
    endCandle: FoundCandle<CandleToDraw>;
  },
):
  | {
      startCandle: FoundCandle<CandleToDraw>;
      endCandle: FoundCandle<CandleToDraw>;
    }
  | undefined {
  const { startCandle, endCandle } = tradeCandles;

  // draw line from buy to sell
  if (
    startCandle.candle &&
    endCandle.candle &&
    candleCanvas.candleArray.length // candleArray is an empty array ([]) for a quick moment right after the first render when: User switches to a shorter (new) candle history and the current scroll and zoom make it so that the user's view zone catches any candles from `the short (old) candle history length` to `candlesShown (zoom) + the short (old) candle history length`. In other words, for a test, you can comment out this length check, go to the 2nd example in the demo, scroll to the maximum left (don't zoom, it's not relevant for this test), switch to the 1st example, scroll ~1-10 candles further left, and switch back to the 2nd example. If the page crashes — then this length check is still relevant. P.S. the page crash reason will be the `candleCanvas.candleArray[0]` evaluating to `undefined`, thus making `.originalIndex` access critically invalid. The `candlesShown (zoom)` on demo for the moment of this test was 160.
  ) {
    const originalIndexOfFirstVisibleCandle = candleCanvas.candleArray[0].originalIndex;
    const startCandleIndex =
      startCandle.index - originalIndexOfFirstVisibleCandle + candleCanvas.candleShift; // will be negative if the candle is not visible

    const originalEndCandleIndex =
      endCandle.index - originalIndexOfFirstVisibleCandle + candleCanvas.candleShift;

    /** if the trade is all the way (fully) hidden outside the viewport borders. */
    const isNotInViewport =
      (originalEndCandleIndex < 0 && startCandleIndex < 0) ||
      (originalEndCandleIndex >= candleCanvas.candlesShown &&
        startCandleIndex >= candleCanvas.candlesShown);

    if (isNotInViewport) return;

    const buyPrice = startCandle.candle.trades?.[startCandle.innerIndex].buyPrice!;
    const sellPrice = endCandle.candle.trades?.[endCandle.innerIndex].sellPrice!;

    const isTradeLong = endCandle.candle.trades?.[endCandle.innerIndex].tradeType === 'long';
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

    const tradeInOneCandle = startCandle.candle.openTime === endCandle.candle.openTime;

    if (!tradeInOneCandle) {
      // draw filled rect behind the line
      roundedRect(
        ctx,
        start.x,
        Math.min(start.y, end.y),
        end.x - start.x,
        Math.abs(end.y - start.y),
        candleCanvas.width / 150,
        isProfit ? tradeColors.positiveRect : tradeColors.negativeRect,
      );
      arrowWithHead(ctx, start, end, tradeColors.arrow, candleCanvas.candleWidth);
    }
  }
  return { startCandle, endCandle };
}

export function drawCursor(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  cursor: Vector2,
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  line(
    ctx,
    { x: cursor.x * canvasSettings.scaleForQuality, y: 0 },
    { x: cursor.x * canvasSettings.scaleForQuality, y: canvasHeight },
    'white',
    0.7,
    0.85,
    [20 - canvasHeight / 100, 20 - canvasHeight / 100],
  );
  line(
    ctx,
    { x: 0, y: cursor.y * canvasSettings.scaleForQuality },
    { x: canvasWidth, y: cursor.y * canvasSettings.scaleForQuality },
    'white',
    0.7,
    0.85,
    [20 - canvasHeight / 100, 20 - canvasHeight / 100],
  );
}

export function drawFibonacciRetracements(
  ctx: CanvasRenderingContext2D,
  candleCanvas: CandleCanvas,
  fiboStartPrice: number,
  fiboEndPrice: number,
  fiboStartIndex: number,
  fiboEndIndex: number,
) {
  // if (candleCanvas.candleArray.length === 0) return;
  // console.log('test', candleCanvas.candleArray.length);
  const originalIndexOfFirstVisibleCandle = candleCanvas.candleArray[0].originalIndex;

  const fiboStartGoodIndex =
    fiboStartIndex - originalIndexOfFirstVisibleCandle + candleCanvas.candleShift;
  const fiboEndGoodIndex =
    fiboEndIndex - originalIndexOfFirstVisibleCandle + candleCanvas.candleShift;
  // console.log('fiboStartGoodIndex', fiboStartGoodIndex, 'fiboEndGoodIndex', fiboEndGoodIndex);
  const fiboStart = {
    x:
      fiboStartGoodIndex * (candleCanvas.candleWidth + candleCanvas.gap) +
      candleCanvas.candleWidth / 2,
    y: Candle2D.getPoint(fiboStartPrice, candleCanvas),
  };
  const fiboEnd = {
    x:
      fiboEndGoodIndex * (candleCanvas.candleWidth + candleCanvas.gap) +
      candleCanvas.candleWidth / 2,
    y: Candle2D.getPoint(fiboEndPrice, candleCanvas),
  };

  const fiboWidth = Math.abs(fiboEnd.x - fiboStart.x);

  const levels = fibonacciNumbers(fiboEndPrice, fiboStartPrice);

  levels.forEach((level, i) => {
    const fibonacciColors = [
      // classical
      // '#797B86',
      // '#F23645',
      // '#FF9800',
      // '#4CAF50',
      // '#049981',
      // '#00BCD4',
      // '#797B86',

      // custom
      '#B2B5BE',
      '#B2B5BE',
      '#B2B5BE',
      '#FFEB3C',
      '#9D27B3',
      '#B2B5BE',
      '#B2B5BE',
    ];
    const y = Candle2D.getPoint(level, candleCanvas);
    line(ctx, { x: fiboStart.x, y }, { x: fiboStart.x + fiboWidth, y }, fibonacciColors[i], 2);

    // draw the % value on the laft of the line
    const text = String(fibonacciReference[i]);
    ctx.beginPath();
    ctx.fillStyle = i === 6 ? '#ddd' : fibonacciColors[i];
    const fontWeight = 250;
    const fontFamily = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`;
    ctx.font = `${fontWeight} ${candleCanvas.height / 30}px ${fontFamily}`;

    const metrics = ctx.measureText(text);
    const x = fiboStart.x - metrics.width - 20;
    const centerYOffset = metrics.actualBoundingBoxAscent / 2 - metrics.actualBoundingBoxDescent;
    const yText = y + centerYOffset;
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 3;
    ctx.fillText(text, x, yText);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.closePath();

    //draw a rectangle with opacity from current line to the next
    if (i === 0) return;
    // if (fiboStartPrice < fiboEndPrice) {
    const prevY = Candle2D.getPoint(levels[i - 1], candleCanvas);
    const rectHeight = Math.abs(y - prevY);
    rect(
      ctx,
      fiboStart.x,
      //? The initial Y depends on the direction of the fibonacci retracement.
      fiboStartPrice < fiboEndPrice ? prevY : y,
      fiboWidth,
      rectHeight,
      fibonacciColors[i],
      0.25,
    );
  });
  // draw fibo line
  line(ctx, fiboStart, fiboEnd, 'white', 1, 0.8, [
    20 - candleCanvas.height / 100,
    20 - candleCanvas.height / 100,
  ]);

  //? draw 2 small circles on the start and end of the fibo line
  [fiboStart, fiboEnd].forEach((circle) => {
    ctx.beginPath();
    ctx.strokeStyle = '#54A3FF';
    ctx.lineWidth = 3;
    ctx.arc(circle.x, circle.y, 15 - candleCanvas.height / 100, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
  });
}

export function drawSimpleLine(
  ctx: CanvasRenderingContext2D,
  candleCanvas: CandleCanvas,
  startPrice: number,
  endPrice: number,
  startIndex: number,
  endIndex: number,
  color: string,
  opacity: number = 0.8,
  dash: number[] = [20, 20],
) {
  const originalIndexOfFirstVisibleCandle = candleCanvas.candleArray[0].originalIndex;

  const startGoodIndex = startIndex - originalIndexOfFirstVisibleCandle + candleCanvas.candleShift;
  const endGoodIndex = endIndex - originalIndexOfFirstVisibleCandle + candleCanvas.candleShift;

  const start = {
    x:
      startGoodIndex * (candleCanvas.candleWidth + candleCanvas.gap) + candleCanvas.candleWidth / 2,
    y: Candle2D.getPoint(startPrice, candleCanvas),
  };
  const end = {
    x: endGoodIndex * (candleCanvas.candleWidth + candleCanvas.gap) + candleCanvas.candleWidth / 2,
    y: Candle2D.getPoint(endPrice, candleCanvas),
  };

  line(ctx, start, end, color, 2, opacity, [
    dash[0] - candleCanvas.height / 100,
    dash[1] - candleCanvas.height / 100,
  ]);
}

export function drawAo(ctx: CanvasRenderingContext2D, candleCanvas: CandleCanvas) {
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
        : candleColors.red,
    );
  });
}

export function drawStdev(
  ctx: CanvasRenderingContext2D,
  // candleCanvas: CandleCanvas
  stdevArray: Vector2[],
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawCurveLine(ctx, stdevArray, '#009EE2', 2, 'round');
}

export const drawFunction = (
  ctx: CanvasRenderingContext2D,
  canvas: CandleCanvas,
  otherSettings: CheckedOtherSettings,
) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // alligator should be probably drawn first as it is at the back
  if (otherSettings.alligator) {
    const alligatorWidth = Math.sqrt(canvas.candleWidth * alligatorLinesSettings.lineWeight);
    const alligatorKeys = Object.keys(canvas.alligatorArray) as Array<
      keyof typeof canvas.alligatorArray
    >;
    alligatorKeys.forEach((key) => {
      drawCurveLine(
        ctx,
        canvas.alligatorArray[key],
        alligatorLinesSettings[key],
        alligatorWidth,
        'round',
      );
    });
  }

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
      candleIsWhite ? fixedWidthIfCandleIsWhite : Math.abs(candle.open - candle.close),
      candleFillColor,
    );

    // draw wick
    const wickX = x + canvas.candleWidth / 2;
    line(
      ctx,
      { x: wickX, y: candle.high },
      { x: wickX, y: candle.low },
      candleFillColor,
      canvas.candleWidth / 6,
    );

    // draw indicators
    if (otherSettings.mountedIndicators)
      drawMountedIndicators(
        ctx,
        candle,
        x,
        canvas.candleWidth,
        otherSettings.drawRevBar,
        otherSettings.drawFractal,
      );
  });

  drawLastCandlePrice(ctx, canvas, otherSettings);
};

function drawLastCandlePrice(
  ctx: CanvasRenderingContext2D,
  canvas: CandleCanvas,
  otherSettings: CheckedOtherSettings,
) {
  if (!otherSettings.showLastCandlePrice) return;

  const lastCandle = canvas.lastCandle;
  if (!lastCandle || !lastCandle.close) return; // lastCandle.close may be undefined on DF3 sometimes. Idk why.

  const alligatorOffset = 8;

  const lastCandle2D =
    canvas.candleArray[canvas.candleArray.length - (1 + alligatorOffset) + canvas.candleShift];
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
  const centerYOffset = metrics.actualBoundingBoxAscent / 2 - metrics.actualBoundingBoxDescent;
  const y = lastCandle2D.close + centerYOffset;
  ctx.fillText(text, x, y);
  ctx.closePath();
}
