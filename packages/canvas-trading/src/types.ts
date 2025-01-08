import type { Candle2D } from './classes/CandleClasses';

export interface CandleToDraw {
  open: number;
  openTime: string | Date;
  closeTime: string | Date;
  high: number;
  low: number;
  close: number;
  indicators: Indicators;
  trades?: AssignedTrade[];
  asset?: string;
}
export type MountedIndicatorType = keyof Pick<Indicators, 'fractal' | 'revBar'> | 'trade';
export type IndicatorValue = RevBarIndicator | FractalIndicator | number;
export interface FoundCandle<T extends Candle2D | CandleToDraw = Candle2D> {
  candle: T | false;
  index: number;
  innerIndex: number;
}
export interface AoCandle {
  x: number;
  y: number;
  vertexValue: number;
  height: number;
}
export interface AssignedTrade {
  tradeID: number;
  tradeType: 'long' | 'short';
  buyPrice: number;
  sellPrice: number;
  profit: number;
  isThisCandleStart: boolean;
  isThisCandleEnd: boolean;
}
export interface OtherSettings {
  allTradesShown?: boolean;
  alligator?: boolean;
  ao?: boolean;
  stdev?: boolean;
  mountedIndicators?: boolean;
  /** @default true */
  zoom?: boolean;
  /** @default true */
  scroll?: boolean;
  /** @default false */
  showAsset?: boolean;
  showLastCandlePrice?: boolean;
  cursor?: boolean;
  /** @default false */
  resizable?: boolean;
  /** @default false */
  fullscreen?: boolean;
  // CSSProperties
  aoCanvasStyle?: React.CSSProperties;
  onlyShowSelectedFibonacci?: boolean;
  autoFocusOnSelectedFibonacci?: boolean;

  drawRevBar?: boolean;
  drawFractal?: boolean;
  dateTimeZone?: 'local' | 'UTC';
}
export type CheckedOtherSettings = Required<OtherSettings>;
export interface Indicators {
  revBar: RevBarIndicator | '';
  fractal: FractalIndicator | '';
  hOrL: HighOrLow | '';
  alligator: {
    jaw: number;
    teeth: number;
    lips: number;
  };
  ao: { value: number; vertexValue: number };
  stdev: number;
}
export type HighOrLow = 'high' | 'low';
export type RevBarIndicator = 'buy' | 'sell';
export type FractalIndicator = 'up' | 'down';
export type Vector2 = {
  x: number;
  y: number;
};

export interface FibonacciRetracement {
  priceA: number;
  priceB: number;
  startDate: Date;
  endDate: Date;
}
