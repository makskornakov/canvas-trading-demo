import { canvasSettings } from '../config';
import type { AoCandle, CandleToDraw, Vector2 } from '../types';
import { Candle2D } from './CandleClasses';

type MinMax = { min: number; max: number; aoMin: number; aoMax: number };

export class CandleCanvas {
  width: number;
  height: number;
  minMax: MinMax;
  gap: number;
  candleWidth: number;
  candleArray: Candle2D[];
  lastCandle: CandleToDraw | undefined;
  alligatorArray: {
    jaw: Vector2[];
    lips: Vector2[];
    teeth: Vector2[];
  };
  aoArray: AoCandle[];

  constructor(
    width: number,
    height: number,
    public candlesShown: number,
    public candleShift: number,
    public candlesToDraw: CandleToDraw[],
    lastCandle: CandleToDraw | undefined
  ) {
    if (candlesToDraw.length < canvasSettings.minCandlesShown)
      throw new Error('Not enough candles to draw');

    this.width = width * canvasSettings.scaleForQuality;
    this.height = height * canvasSettings.scaleForQuality;
    this.lastCandle = lastCandle;

    if (lastCandle !== undefined)
      candlesToDraw[candlesToDraw.length - 9] = lastCandle;

    const zoomedAndShifted = candlesToDraw.slice(
      candlesToDraw.length - this.candlesShown - this.candleShift,
      candlesToDraw.length - this.candleShift
    );

    const minMax = this.minMaxCalc(zoomedAndShifted);
    this.minMax = minMax;

    const gapAndWidth = this.getGapAndCandleWidth();
    this.gap = gapAndWidth.gap;
    this.candleWidth = gapAndWidth.candleWidth;

    this.candleArray = this.getDrawingArray(zoomedAndShifted);
    this.alligatorArray = this.getAlligatorArray(this.candleArray);
    this.aoArray = this.getAOArray(zoomedAndShifted, minMax);
  }
  private getGapAndCandleWidth() {
    const gap = this.width / this.candlesShown / 5;
    const candleWidth =
      (this.width - (this.candlesShown - 1) * gap) / this.candlesShown;
    return { gap, candleWidth };
  }
  private minMaxCalc(candles: CandleToDraw[]): MinMax {
    // not if value is 0
    const min = Math.min(
      ...candles.map((candle) => (candle.low !== 0 ? candle.low : Infinity)) // if candle.low is 0, wont be used
    );
    const max = Math.max(
      ...candles.map((candle) => (candle.high !== 0 ? candle.high : -Infinity)) // if candle.high is 0, wont be used
    );
    const aoMin = Math.min(
      ...candles.map((candle) =>
        candle.indicators.ao.value !== 0 ? candle.indicators.ao.value : Infinity
      ) // if candle.low is 0, wont be set
    );
    const aoMax = Math.max(
      ...candles.map((candle) =>
        candle.indicators.ao.value !== 0
          ? candle.indicators.ao.value
          : -Infinity
      ) // if candle.high is 0, wont be set
    );
    return {
      min,
      max,
      aoMin,
      aoMax,
    };
  }
  private getDrawingArray(slicedArray: CandleToDraw[]) {
    const indexInTheOriginalArray =
      this.candlesToDraw.length - slicedArray.length;
    const candles2D = slicedArray.map((candle, i) => {
      return new Candle2D(
        candle.open,
        candle.close,
        candle.low,
        candle.high,
        candle.indicators,
        this,
        candle.trades ? candle.trades : [],
        i * (this.candleWidth + this.gap),
        i + indexInTheOriginalArray
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
  private getAOArray(candles: CandleToDraw[], minMax: MinMax) {
    const aoArray: AoCandle[] = [];

    const min = minMax.aoMin * 1.1;
    const max = minMax.aoMax * 1.1;

    const allHeight = this.height / 5;
    const maxPercentOfMin = minMax.aoMax / (Math.abs(min) + max);

    const newMidLine = allHeight * maxPercentOfMin;

    candles.forEach((candle, index) => {
      const newValue =
        candle.indicators.ao.value > 0
          ? candle.indicators.ao.value / max
          : candle.indicators.ao.value / min;

      const aboveLine = candle.indicators.ao.value > 0;

      aoArray.push({
        x: index * (this.candleWidth + this.gap),
        y: aboveLine ? newMidLine - newValue * newMidLine : newMidLine,
        vertexValue: candle.indicators.ao.vertexValue,
        height: aboveLine
          ? newValue * newMidLine
          : newValue * (allHeight - newMidLine),
      });
    });
    return aoArray;
  }
  public getDisplayedPrice(y: number) {
    const minMaxRange = this.minMax.max - this.minMax.min;
    const gapSpace = this.candleWidth * 4.5;

    // % that both gaps take in relation to useful space on the canvas
    // value that is taken by gaps (in relation to minMaxRange)
    const gapInPrice = minMaxRange * (gapSpace / (this.height - gapSpace * 2));

    // imagine that our minMax takes all the Y space to calculate the price
    // imagine value that is exactly on the top edge on the canvas - correct % multiplied by newMinMaxRange
    const price =
      this.minMax.max +
      gapInPrice -
      (minMaxRange + gapInPrice * 2) *
        (y / (this.height / canvasSettings.scaleForQuality));

    return Math.round(price * 1000) / 1000;
  }
}
