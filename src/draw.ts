export const drawFunction = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 100, 100);
};

interface candleToDraw {
  open: number;
  high: number;
  low: number;
  close: number;
  indicators: {
    revBar: 'buy' | 'sell';
    fractal: 'up' | 'down';
    alligator: {
      jaw: number;
      teeth: number;
      lips: number;
    };
  };
}
class CandleCanvas {
  width: number;
  height: number;
  candlesShown: number;
  candlesToDraw: candleToDraw[] = [];
  min: number;
  max: number;
  gap: number;
  candleWidth: number;

  constructor(
    width: number,
    height: number,
    candlesShown: number,
    candlesToDraw: candleToDraw[]
  ) {
    this.width = width;
    this.height = height;
    this.candlesShown = candlesShown;

    const minMax = this.minMaxCalc(candlesToDraw);
    this.min = minMax.min;
    this.max = minMax.max;

    const gapAndWidth = this.getGapAndCandleWidth();
    this.gap = gapAndWidth.gap;
    this.candleWidth = gapAndWidth.candleWidth;
  }
  private getGapAndCandleWidth() {
    const gap = this.width / this.candlesShown / 10;
    const candleWidth = (this.width / this.candlesShown - gap) / 2;
    return { gap, candleWidth };
  }
  private minMaxCalc(candles: candleToDraw[]) {
    const min = Math.min(...candles.map((candle) => candle.low));
    const max = Math.max(...candles.map((candle) => candle.high));
    return { min, max };
  }
}

interface CandleMountPoints {
  above: {
    first: number;
    second: number;
  };
  below: {
    first: number;
    second: number;
  };
}

class Candle2D {
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
    candleCanvas: CandleCanvas
  ) {
    this.open = this.getPoint(originalOpen, candleCanvas);
    this.close = this.getPoint(originalClose, candleCanvas);
    this.low = this.getPoint(originalLow, candleCanvas);
    this.high = this.getPoint(originalHigh, candleCanvas);
    this.mountPoints = this.getMountPoints(candleCanvas);
  }
  // private arrow function with original point as an argument
  private getPoint = (originalPoint: number, candleCanvas: CandleCanvas) => {
    const point =
      ((candleCanvas.max - originalPoint) /
        (candleCanvas.max - candleCanvas.min)) *
      candleCanvas.height;
    return point;
  };

  private getMountPoints(candleCanvas: CandleCanvas): CandleMountPoints {
    const yGap = candleCanvas.candleWidth * 1.5;
    const above = {
      first: this.high + yGap,
      second: this.high + yGap * 3,
    };
    const below = {
      first: this.low - yGap,
      second: this.low - yGap * 3,
    };
    return {
      above,
      below,
    };
  }
}
