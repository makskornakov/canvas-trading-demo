import type { AssignedTrade, Indicators } from '../types';
import type { CandleCanvas } from './CandleCanvas';
import { CandleMountPoints } from './MountedClasses';

export class Candle2D {
  open: number;
  close: number;
  low: number;
  high: number;
  noDraw: boolean;
  mountPoints: CandleMountPoints;
  alligator: Indicators['alligator'];
  trades: AssignedTrade[];
  constructor(
    originalOpen: number,
    originalClose: number,
    originalLow: number,
    originalHigh: number,
    originalIndicators: Indicators,
    candleCanvas: CandleCanvas,
    originalTrades: AssignedTrade[],
    public xPosition: number,
    public originalIndex: number
  ) {
    this.open = Candle2D.getPoint(originalOpen, candleCanvas);
    this.close = Candle2D.getPoint(originalClose, candleCanvas);
    this.low = Candle2D.getPoint(originalLow, candleCanvas);
    this.high = Candle2D.getPoint(originalHigh, candleCanvas);
    this.mountPoints = new CandleMountPoints(
      candleCanvas.candleWidth,
      originalIndicators,
      originalTrades,
      this.low,
      this.high,
      (this.low + this.high) / 2 <=
        (candleCanvas.height - candleCanvas.candleWidth * 4.5) / 2
    );
    this.open === 0 || this.close === 0 || this.low === 0 || this.high === 0
      ? (this.noDraw = true)
      : (this.noDraw = false);
    this.alligator = this.getAlligatorPoints(
      originalIndicators.alligator,
      candleCanvas
    );

    this.trades = [] as AssignedTrade[];
    originalTrades.forEach((trade) => {
      const tradeCopy = { ...trade };
      if (tradeCopy.isThisCandleStart) {
        tradeCopy.buyPrice = Candle2D.getPoint(
          tradeCopy.buyPrice,
          candleCanvas
        );
      }
      if (tradeCopy.isThisCandleEnd) {
        tradeCopy.sellPrice = Candle2D.getPoint(
          tradeCopy.sellPrice,
          candleCanvas
        );
      }
      this.trades.push(tradeCopy);
    });
  }
  // private arrow function with original point as an argument
  public static getPoint = (
    originalPoint: number,
    candleCanvas: CandleCanvas
  ) => {
    const gapSpace = candleCanvas.candleWidth * 4.5;
    const point =
      ((candleCanvas.minMax.max - originalPoint) /
        (candleCanvas.minMax.max - candleCanvas.minMax.min)) *
        (candleCanvas.height - gapSpace * 2) +
      gapSpace;
    return point;
  };

  private getAlligatorPoints = (
    alligator: Indicators['alligator'],
    candleCanvas: CandleCanvas
  ) => {
    const keys = Object.keys(alligator) as Array<keyof Indicators['alligator']>;
    const points = {} as Indicators['alligator'];
    keys.forEach((key) => {
      points[key] =
        alligator[key] !== 0
          ? Candle2D.getPoint(alligator[key], candleCanvas)
          : 0;
    });
    return points;
  };
}
