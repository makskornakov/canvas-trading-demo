import { CandleToDraw, Vector2 } from '../types';
import { Candle2D } from './CandleClasses';

export class CandleCanvas {
  width: number;
  height: number;
  min: number;
  max: number;
  gap: number;
  candleWidth: number;
  candleArray: Candle2D[];
  alligatorArray: {
    jaw: Vector2[];
    lips: Vector2[];
    teeth: Vector2[];
  };

  constructor(
    width: number,
    height: number,
    public candlesShown: number,
    public candleShift: number,
    candlesToDraw: CandleToDraw[]
  ) {
    this.width = width * 3;
    this.height = height * 3;

    const shiftedCandleArray = candlesToDraw.slice(
      0,
      candlesToDraw.length - this.candleShift
    );

    const zoomedCandleArray = shiftedCandleArray.slice(
      shiftedCandleArray.length - this.candlesShown,
      shiftedCandleArray.length
    );

    const minMax = this.minMaxCalc(zoomedCandleArray);
    this.min = minMax.min;
    this.max = minMax.max;

    const gapAndWidth = this.getGapAndCandleWidth();
    this.gap = gapAndWidth.gap;
    this.candleWidth = gapAndWidth.candleWidth;

    this.candleArray = this.getDrawingArray(zoomedCandleArray);
    this.alligatorArray = this.getAlligatorArray(this.candleArray);
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
  private getDrawingArray(slicedArray: CandleToDraw[]) {
    const candles2D = slicedArray.map((candle) => {
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
  private getAlligatorArray(candles: Candle2D[]) {
    const jaw: Vector2[] = [];
    const teeth: Vector2[] = [];
    const lips: Vector2[] = [];
    candles.forEach((candle, index) => {
      const x = index * (this.candleWidth + this.gap) + this.candleWidth / 2;
      if (candle.alligator.jaw !== 0) jaw.push({ x, y: candle.alligator.jaw });

      if (candle.alligator.teeth !== 0)
        teeth.push({ x, y: candle.alligator.teeth });
      if (candle.alligator.lips !== 0)
        lips.push({ x, y: candle.alligator.lips });
    });
    return { jaw, teeth, lips };
  }
}
