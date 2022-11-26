export interface CandleToDraw {
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
  trade?: {
    tradeID: number;
    tradeType: 'long' | 'short';
    buyPrice: number;
    sellPrice: number;
    isThisCandleStart: boolean;
    isThisCandleEnd: boolean;
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
        this
      );
    });
    return candles2D;
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
