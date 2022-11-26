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
    this.width = width;
    this.height = height;
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
    const min = Math.min(...candles.map((candle) => candle.low));
    const max = Math.max(...candles.map((candle) => candle.high));
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
  // positive means
  aboveCandle: boolean;
  yPos: number;
  constructor(type: 'revBar' | 'fractal', above: boolean, yPos: number) {
    this.type = type;
    this.aboveCandle = above;
    this.yPos = yPos;
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
    canvasWidth: number,
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
    this.mountIndicators(canvasWidth, candleIndicators, low, high);
  }
  private mountIndicators(
    canvasWidth: number,
    indicators: Indicators,
    low: number,
    high: number
  ) {
    // mount revBar
    if (indicators.revBar === 'sell') {
      this.mountUp('revBar', canvasWidth, high);
    } else if (indicators.revBar === 'buy') {
      this.mountDown('revBar', canvasWidth, low);
    }
    // mount fractal
    if (indicators.fractal === 'up') {
      this.mountUp('fractal', canvasWidth, high);
    } else if (indicators.fractal === 'down') {
      this.mountDown('fractal', canvasWidth, low);
    }
  }

  private mountUp(
    type: 'fractal' | 'revBar',
    canvasWidth: number,
    high: number
  ) {
    const yGap = canvasWidth * 1.5;
    if (this.above.first === null) {
      this.above.first = {
        type,
        aboveCandle: true,
        yPos: high + yGap,
      };
    } else if (this.above.second === null) {
      this.above.second = {
        type,
        aboveCandle: true,
        yPos: high + yGap * 3,
      };
    }
  }
  private mountDown(
    type: 'fractal' | 'revBar',
    canvasWidth: number,
    low: number
  ) {
    const yGap = canvasWidth * 1.5;
    if (this.below.first === null) {
      this.below.first = {
        type,
        aboveCandle: false,
        yPos: low - yGap,
      };
    } else if (this.below.second === null) {
      this.below.second = {
        type,
        aboveCandle: false,
        yPos: low - yGap * 3,
      };
    }
  }
}

export class Candle2D {
  open: number;
  close: number;
  low: number;
  high: number;
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
      candleCanvas.width,
      originalIndicators,
      this.low,
      this.high
    );
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
  candlesArray.forEach((candle, index) => {
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
    ctx.moveTo(x + canvas.candleWidth / 2, candle.high);
    ctx.lineTo(x + canvas.candleWidth / 2, candle.low);
    ctx.strokeStyle = candleIsRed ? 'red' : 'green';
    ctx.stroke();
    ctx.closePath();
  });
};
