import { CandleCanvas } from '../classes/CandleCanvas';
import { Candle2D } from '../classes/CandleClasses';
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
} from './drawFunctions';
import { FoundCandle, Vector2 } from '../types';

export function findCandleWithTrade(
  candles: Candle2D[],
  id: number,
  end: boolean = false
): FoundCandle {
  const foundObj: FoundCandle = {
    candle: false,
    index: 0,
    innerIndex: 0,
  };
  candles.forEach((candle, index) => {
    candle.trades.forEach((candleTrade, innerIndex) => {
      const rightType = !end
        ? candleTrade.isThisCandleStart && !candleTrade.isThisCandleEnd
        : !candleTrade.isThisCandleStart && candleTrade.isThisCandleEnd;
      if (candleTrade.tradeID === id && rightType) {
        foundObj.candle = candle;
        foundObj.index = index;
        foundObj.innerIndex = innerIndex;
        return foundObj;
      }
    });
  });
  return foundObj;
}

export function displayTrade(
  ctx: CanvasRenderingContext2D,
  candleCanvas: CandleCanvas,
  tradeID: number
) {
  // console.log(candleCanvas.candleArray);
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
        ? end.y > start.y
        : end.y < start.y;

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
    0.8
  );
  line(
    ctx,
    { x: 0, y: cursor.y * canvasSettings.scaleForQuality },
    { x: canvasWidth, y: cursor.y * canvasSettings.scaleForQuality },
    'white',
    0.7,
    0.8
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
  canvas: CandleCanvas
) => {
  // clear ctx
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.candleArray.forEach((candle) => {
    if (candle.noDraw) return;
    const x = candle.xPosition;
    const candleIsRed = candle.open < candle.close;
    const y = candleIsRed ? candle.open : candle.close;

    // draw candle
    rect(
      ctx,
      x,
      y,
      canvas.candleWidth,
      Math.abs(candle.open - candle.close),
      candleIsRed ? candleColors.red : candleColors.green
    );

    // draw wick
    line(
      ctx,
      { x: x + canvas.candleWidth / 2, y: candle.high },
      { x: x + canvas.candleWidth / 2, y: candle.low },
      candleIsRed ? candleColors.red : candleColors.green,
      canvas.candleWidth / 6
    );

    // draw indicators
    drawMountedIndicators(ctx, candle, x, canvas.candleWidth);
  });

  // draw alligator
  const alligatorKeys = Object.keys(canvas.alligatorArray) as Array<
    keyof typeof canvas.alligatorArray
  >;
  alligatorKeys.forEach((key) => {
    drawCurveLine(
      ctx,
      canvas.alligatorArray[key],
      alligatorLinesSettings[key],
      canvas.candleWidth / alligatorLinesSettings.lineWeight
    );
  });
};
