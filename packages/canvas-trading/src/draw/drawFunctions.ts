import type { Candle2D } from '../classes/CandleClasses';
import { candleColors, tradeColors } from '../config';
import type {
  CandleToDraw,
  FoundCandle,
  FractalIndicator,
  RevBarIndicator,
  Vector2,
} from '../types';

export function drawCurveLine(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  color: string,
  lineWidth: number,
  lineCap?: CanvasRenderingContext2D['lineCap']
) {
  ctx.beginPath();
  if (lineCap) {
    ctx.lineCap = lineCap;
  }
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
  if (lineCap) {
    // initial value
    ctx.lineCap = 'butt';
  }
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

  /** It also adds to the height a little bit, proportionally */
  const triangleAdditionalWidthMultiplier = 0.1;
  const triangleWidthShrinker = 1 / triangleAdditionalWidthMultiplier;

  const triangleWidthMultiplier = 1 + triangleAdditionalWidthMultiplier;
  const triangleWidth = candleWidth * triangleWidthMultiplier;

  ctx.moveTo(x - candleWidth / triangleWidthShrinker, y);

  const toY = type === 'up' ? y - triangleWidth : y + triangleWidth;
  ctx.lineTo(x + candleWidth / 2, toY);
  ctx.lineTo(x + triangleWidth, y);

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
  dash: number[] = [],
  lineCap?: CanvasRenderingContext2D['lineCap']
) {
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.globalAlpha = opacity;
  if (lineCap) {
    ctx.lineCap = lineCap;
  }
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  if (lineCap) {
    // initial value
    ctx.lineCap = 'butt';
  }
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

export const tradeLetter = function (
  ctx: CanvasRenderingContext2D,
  cords: Vector2,
  gap: number,
  isTradeLong: boolean,
  isProfit: boolean,
  candleAboveMidLine: boolean,
  yPoint: number
) {
  // draw small letter above the arrow

  ctx.font = `${
    gap * 1.3
  }px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif`;
  ctx.fillStyle = isProfit
    ? tradeColors.positiveArrow
    : tradeColors.negativeArrow;
  ctx.textAlign = 'center';

  ctx.shadowColor = 'rgba(255, 255, 255, 1)';
  ctx.shadowBlur = 2;

  ctx.fillText(
    isTradeLong ? 'L' : 'S',
    cords.x,
    candleAboveMidLine ? yPoint + gap * 5 : yPoint - gap * 4
  );

  //reset shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0)';
  ctx.shadowBlur = 0;
};

export const arrowWithHead = function (
  ctx: CanvasRenderingContext2D,
  start: Vector2,
  end: Vector2,
  color: string,
  candleWidth: number
) {
  line(ctx, start, end, color, Math.sqrt(candleWidth), 0.8, [
    candleWidth * 0.7,
    candleWidth * 0.7,
  ]);

  // arrow head
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  const size = candleWidth + Math.sqrt(candleWidth) * 1.5;
  ctx.lineTo(
    end.x - size * Math.cos(angle - Math.PI / 6),
    end.y - size * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    end.x - size * Math.cos(angle + Math.PI / 6),
    end.y - size * Math.sin(angle + Math.PI / 6)
  );
  ctx.lineTo(end.x, end.y);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
};
