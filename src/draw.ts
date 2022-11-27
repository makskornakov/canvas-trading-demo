export interface CandleToDraw {
  open: number;
  high: number;
  low: number;
  close: number;
  indicators: Indicators;
  trade?: {
    tradeID: number;
    tradeType: 'long' | 'short';
    buyPrice: number;
    sellPrice: number;
    isThisCandleStart: boolean;
    isThisCandleEnd: boolean;
  };
}
interface Indicators {
  revBar: 'buy' | 'sell';
  fractal: 'up' | 'down';
  alligator: {
    jaw: number;
    teeth: number;
    lips: number;
  };
}
export class CandleCanvas {
  width: number;
  height: number;
  candlesShown: number;
  min: number;
  max: number;
  gap: number;
  candleWidth: number;
  candleArray: Candle2D[];

  constructor(
    width: number,
    height: number,
    candlesShown: number,
    candlesToDraw: CandleToDraw[]
  ) {
    this.width = width * 3;
    this.height = height * 3;
    this.candlesShown = candlesShown;

    const forMinMax = candlesToDraw.slice(-candlesShown);
    const minMax = this.minMaxCalc(forMinMax);
    this.min = minMax.min;
    this.max = minMax.max;

    const gapAndWidth = this.getGapAndCandleWidth();
    this.gap = gapAndWidth.gap;
    this.candleWidth = gapAndWidth.candleWidth;

    this.candleArray = this.getDrawingArray(candlesToDraw);
  }
  private getGapAndCandleWidth() {
    const gap = this.width / this.candlesShown / 5;
    const candleWidth =
      (this.width - (this.candlesShown - 1) * gap) / this.candlesShown;
    return { gap, candleWidth };
  }
  private minMaxCalc(candles: CandleToDraw[]) {
    // not if value is 0
    const min = Math.min(
      ...candles.map((candle) => (candle.low !== 0 ? candle.low : Infinity)) // if candle.low is 0, wont be used
    );
    const max = Math.max(
      ...candles.map((candle) => (candle.high !== 0 ? candle.high : -Infinity)) // if candle.high is 0, wont be used
    );

    return { min, max };
  }
  private getDrawingArray(candlesArray: CandleToDraw[]) {
    const sliced = candlesArray.slice(-this.candlesShown);
    const candles2D = sliced.map((candle) => {
      return new Candle2D(
        candle.open,
        candle.close,
        candle.low,
        candle.high,
        candle.indicators,
        this
      );
    });
    return candles2D;
  }
}
class MountedIndicator {
  type: 'revBar' | 'fractal';
  value: 'buy' | 'sell' | 'up' | 'down';
  // positive means
  yPos: number;
  constructor(
    type: 'revBar' | 'fractal',
    value: 'buy' | 'sell' | 'up' | 'down',
    yPos: number
  ) {
    this.type = type;
    this.yPos = yPos;
    this.value = value;
  }
}

class CandleMountPoints {
  above: {
    first: MountedIndicator | null;
    second: MountedIndicator | null;
  };
  below: {
    first: MountedIndicator | null;
    second: MountedIndicator | null;
  };
  constructor(
    candleWidth: number,
    candleIndicators: Indicators,
    low: number,
    high: number
  ) {
    this.above = {
      first: null,
      second: null,
    };
    this.below = {
      first: null,
      second: null,
    };
    this.mountIndicators(candleWidth, candleIndicators, low, high);
  }
  private mountIndicators(
    candleWidth: number,
    indicators: Indicators,
    low: number,
    high: number
  ) {
    // mount revBar
    if (indicators.revBar === 'sell') {
      this.mountUp('revBar', 'sell', candleWidth, high);
    } else if (indicators.revBar === 'buy') {
      this.mountDown('revBar', 'buy', candleWidth, low);
    }
    // mount fractal
    if (indicators.fractal === 'up') {
      this.mountUp('fractal', 'up', candleWidth, high);
    } else if (indicators.fractal === 'down') {
      this.mountDown('fractal', 'down', candleWidth, low);
    }
  }

  private mountUp(
    type: 'fractal' | 'revBar',
    value: 'buy' | 'sell' | 'up' | 'down',
    candleWidth: number,
    high: number
  ) {
    const yGap = candleWidth;
    if (this.above.first === null) {
      this.above.first = {
        type,
        value,
        yPos: high - yGap,
      };
    } else if (this.above.second === null) {
      this.above.second = {
        type,
        value,
        yPos: high - yGap * 2,
      };
    }
  }
  private mountDown(
    type: 'fractal' | 'revBar',
    value: 'buy' | 'sell' | 'up' | 'down',
    candleWidth: number,
    low: number
  ) {
    const yGap = candleWidth;
    if (this.below.first === null) {
      this.below.first = {
        type,
        value,
        yPos: low + yGap,
      };
    } else if (this.below.second === null) {
      this.below.second = {
        type,
        value,
        yPos: low + yGap * 2,
      };
    }
  }
}

export class Candle2D {
  open: number;
  close: number;
  low: number;
  high: number;
  noDraw: boolean;
  mountPoints: CandleMountPoints;

  constructor(
    originalOpen: number,
    originalClose: number,
    originalLow: number,
    originalHigh: number,
    originalIndicators: Indicators,
    candleCanvas: CandleCanvas
  ) {
    this.open = this.getPoint(originalOpen, candleCanvas);
    this.close = this.getPoint(originalClose, candleCanvas);
    this.low = this.getPoint(originalLow, candleCanvas);
    this.high = this.getPoint(originalHigh, candleCanvas);
    this.mountPoints = new CandleMountPoints(
      candleCanvas.candleWidth,
      originalIndicators,
      this.low,
      this.high
    );
    this.open === 0 || this.close === 0 || this.low === 0 || this.high === 0
      ? (this.noDraw = true)
      : (this.noDraw = false);
  }
  // private arrow function with original point as an argument
  private getPoint = (originalPoint: number, candleCanvas: CandleCanvas) => {
    const gapSpace = candleCanvas.candleWidth * 4.5;

    const point =
      ((candleCanvas.max - originalPoint) /
        (candleCanvas.max - candleCanvas.min)) *
        (candleCanvas.height - gapSpace * 2) +
      gapSpace;
    return point;
  };
}

export const drawFunction = (
  ctx: CanvasRenderingContext2D,
  candlesArray: Candle2D[],
  canvas: CandleCanvas
) => {
  // clear ctx
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  candlesArray.forEach((candle, index) => {
    if (candle.noDraw) return;
    const x = index * (canvas.candleWidth + canvas.gap);
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
    ctx.fillStyle = candleIsRed ? 'red' : 'green';
    ctx.fill();
    ctx.closePath();

    // draw wick
    ctx.beginPath();
    // line thickness
    ctx.lineWidth = canvas.candleWidth / 6;
    ctx.moveTo(x + canvas.candleWidth / 2, candle.high);
    ctx.lineTo(x + canvas.candleWidth / 2, candle.low);
    ctx.strokeStyle = candleIsRed ? 'red' : 'green';
    ctx.stroke();
    ctx.closePath();

    // draw indicators
    drawMountedIndicators(ctx, candle, x, canvas.candleWidth);
  });
};
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
  ctx.fillStyle = type === 'buy' ? 'green' : 'red';
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

  ctx.fillStyle = type === 'up' ? 'green' : 'red';
  ctx.fill();
  ctx.closePath();
}
