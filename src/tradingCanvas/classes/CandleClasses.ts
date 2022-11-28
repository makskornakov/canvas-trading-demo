import { Indicators } from '../types';
import { CandleCanvas } from './CandleCanvas';

export class MountedIndicator {
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

export class CandleMountPoints {
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
  alligator: Indicators['alligator'];

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
    this.alligator = this.getAlligatorPoints(
      originalIndicators.alligator,
      candleCanvas
    );
  }
  // private arrow function with original point as an argument
  private getPoint = (originalPoint: number, candleCanvas: CandleCanvas) => {
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
        alligator[key] !== 0 ? this.getPoint(alligator[key], candleCanvas) : 0;
    });
    return points;
  };
}
