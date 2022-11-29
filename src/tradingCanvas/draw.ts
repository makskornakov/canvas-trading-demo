import { CandleCanvas } from './classes/CandleCanvas';
import { Candle2D } from './classes/CandleClasses';
import {
  alligatorLinesSettings,
  candleColors,
  canvasSettings,
  tradeColors,
} from './config';
import { Vector2 } from './types';
interface FoundCandle {
  candle: Candle2D | false;
  index: number;
  innerIndex: number;
}
function findCandleWithTrade(
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
    const rectWidth = end.x - start.x;
    const rectHeight = Math.abs(end.y - start.y);

    roundedRect(
      ctx,
      start.x,
      Math.min(start.y, end.y),
      rectWidth,
      rectHeight,
      10,
      isProfit ? tradeColors.positiveRect : tradeColors.negativeRect
    );

    ctx.beginPath();
    // line with arrow head
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.closePath();
    ctx.setLineDash([]);

    // arrow head
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - 15 * Math.cos(angle - Math.PI / 6),
      end.y - 15 * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      end.x - 15 * Math.cos(angle + Math.PI / 6),
      end.y - 15 * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(end.x, end.y);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
  }
}
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor: string = 'white'
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.closePath();
}
export function drawCursor(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  cursor: Vector2
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.beginPath();
  ctx.lineWidth = 0.7;
  ctx.moveTo(0, cursor.y * canvasSettings.scaleForQuality);
  ctx.lineTo(
    canvasWidth * canvasSettings.scaleForQuality,
    cursor.y * canvasSettings.scaleForQuality
  );
  ctx.moveTo(cursor.x * canvasSettings.scaleForQuality, 0);
  ctx.lineTo(
    cursor.x * canvasSettings.scaleForQuality,
    canvasHeight * canvasSettings.scaleForQuality
  );
  ctx.strokeStyle = 'white';
  ctx.globalAlpha = 0.8;
  ctx.stroke();
  ctx.closePath();
}
export function drawAo(
  ctx: CanvasRenderingContext2D,
  candleCanvas: CandleCanvas
) {
  //clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  candleCanvas.aoArray.forEach((ao, i) => {
    const positive = ao.vertexValue > candleCanvas.aoArray[i - 1]?.vertexValue;

    const x = ao.x;
    const y = ao.y;

    ctx.fillStyle = positive ? candleColors.green : candleColors.red;
    ctx.beginPath();

    ctx.fillRect(x, y, candleCanvas.candleWidth, ao.height);
    ctx.closePath();
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
    ctx.beginPath();
    ctx.rect(
      x,
      y,
      canvas.candleWidth,
      candleIsRed ? candle.close - candle.open : candle.open - candle.close
    );
    ctx.fillStyle = candleIsRed ? candleColors.red : candleColors.green;
    ctx.fill();
    ctx.closePath();

    // draw wick
    ctx.beginPath();
    ctx.lineWidth = canvas.candleWidth / 6;
    ctx.moveTo(x + canvas.candleWidth / 2, candle.high);
    ctx.lineTo(x + canvas.candleWidth / 2, candle.low);
    ctx.strokeStyle = candleIsRed ? candleColors.red : candleColors.green;
    ctx.stroke();
    ctx.closePath();

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

function drawCurveLine(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  color: string,
  lineWidth: number
) {
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;

  for (const point of points) {
    const xMid = (point.x + point.x) / 2;
    const yMid = (point.y + point.y) / 2;
    const cpX1 = (xMid + point.x) / 2;
    const cpX2 = (xMid + point.x) / 2;
    ctx.quadraticCurveTo(cpX1, point.y, xMid, yMid);
    ctx.quadraticCurveTo(cpX2, point.y, point.x, point.y);
  }

  ctx.stroke();
  ctx.closePath();
}

function drawMountedIndicators(
  ctx: CanvasRenderingContext2D,
  candle: Candle2D,
  x: number,
  candleWidth: number
) {
  const arr = [
    candle.mountPoints.above.first,
    candle.mountPoints.above.second,
    candle.mountPoints.below.first,
    candle.mountPoints.below.second,
  ];

  arr.forEach((indicator, i) => {
    if (indicator !== null) {
      if (indicator.type === 'revBar') {
        drawRevBar(
          ctx,
          x,
          indicator.yPos,
          indicator.value as 'buy' | 'sell',
          candleWidth
        );
      } else if (indicator.type === 'fractal') {
        drawFractal(
          ctx,
          x,
          indicator.yPos,
          indicator.value as 'up' | 'down',
          candleWidth
        );
      }
    }
  });
}

function drawRevBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: 'buy' | 'sell',
  candleWidth: number
) {
  ctx.beginPath();
  ctx.arc(x + candleWidth / 2, y, candleWidth / 3, 0, 2 * Math.PI);
  ctx.fillStyle = type === 'buy' ? candleColors.green : candleColors.red;
  ctx.fill();
  ctx.closePath();
}

function drawFractal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: 'up' | 'down',
  candleWidth: number
) {
  ctx.beginPath();
  ctx.moveTo(x - candleWidth / 2, y);

  const toY = type === 'up' ? y - candleWidth * 1.5 : y + candleWidth * 1.5;
  ctx.lineTo(x + candleWidth / 2, toY);
  ctx.lineTo(x + candleWidth * 1.5, y);

  ctx.fillStyle = type === 'up' ? candleColors.green : candleColors.red;
  ctx.fill();
  ctx.closePath();
}
