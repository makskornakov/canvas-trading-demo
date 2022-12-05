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
export type MountedIndicatorType =
  | keyof Pick<Indicators, 'fractal' | 'revBar'>
  | 'trade';
export type IndicatorValue = RevBarIndicator | FractalIndicator | number;
export interface FoundCandle<T extends Candle2D | CandleToDraw = Candle2D> {
  candle: T | false;
  index: number;
  innerIndex: number;
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
}
export type CheckedOtherSettings = Required<OtherSettings>;
export interface Indicators {
  revBar: RevBarIndicator | '';
  fractal: FractalIndicator | '';
  alligator: {
    jaw: number;
    teeth: number;
    lips: number;
  };
  ao: { value: number; vertexValue: number };
}
export type RevBarIndicator = 'buy' | 'sell';
export type FractalIndicator = 'up' | 'down';
export type Vector2 = {
  x: number;
  y: number;
};
