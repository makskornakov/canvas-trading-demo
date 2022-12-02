import type { Candle2D } from '../classes/CandleClasses';
import { candleColors } from '../config';
import type { CandleToDraw, FoundCandle, FractalIndicator, RevBarIndicator, Vector2 } from '../types';

export function drawCurveLine(
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

export function drawMountedIndicators(
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

  arr.forEach((indicator) => {
    if (indicator === null) return;

    if (indicator.type === 'revBar') {
      revBar(
        ctx,
        x,
        indicator.yPos,
        indicator.value as RevBarIndicator,
        candleWidth
      );
      return;
    }
    if (indicator.type === 'fractal') {
      fractal(
        ctx,
        x,
        indicator.yPos,
        indicator.value as FractalIndicator,
        candleWidth
      );
    }
  });
}

export function revBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: RevBarIndicator,
  candleWidth: number
) {
  ctx.beginPath();
  ctx.arc(x + candleWidth / 2, y, candleWidth / 3, 0, 2 * Math.PI);
  ctx.fillStyle = type === 'buy' ? candleColors.green : candleColors.red;
  ctx.fill();
  ctx.closePath();
}

export function fractal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: FractalIndicator,
  candleWidth: number
) {
  ctx.beginPath();
  const triangleAdditionalWidthMultiplier = 0.5;
  const triangleWidthShrinker = 1 / triangleAdditionalWidthMultiplier;

  ctx.moveTo(x - candleWidth / triangleWidthShrinker, y);

  const toY = type === 'up' ? y - candleWidth * 1.5 : y + candleWidth * 1.5;
  ctx.lineTo(x + candleWidth / 2, toY);
  ctx.lineTo(x + candleWidth * (1 + triangleAdditionalWidthMultiplier), y);

  ctx.fillStyle = type === 'up' ? candleColors.green : candleColors.red;
  ctx.fill();
  ctx.closePath();
}
export function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor: string = candleColors.green,
  opacity: number = 1
) {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fillStyle = fillColor;
  ctx.globalAlpha = opacity;
  ctx.fill();
  ctx.closePath();
  ctx.globalAlpha = 1;
}
export function line(
  ctx: CanvasRenderingContext2D,
  start: Vector2,
  end: Vector2,
  color: string,
  width: number = 1,
  opacity: number = 1,
  dash: number[] = []
) {
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.globalAlpha = opacity;
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}
export function roundedRect(
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

export function findCandleWithTrade<T extends Candle2D | CandleToDraw>(
  candles: T[],
  id: number,
  end: boolean = false
): FoundCandle<T> {
  const foundObj: FoundCandle<T> = {
    candle: false,
    index: 0,
    innerIndex: 0,
  };
  candles.forEach((candle, index) => {
    candle.trades?.forEach((candleTrade, innerIndex) => {
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
