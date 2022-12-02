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
}
export type MountedIndicatorType = keyof Pick<Indicators, 'fractal' | 'revBar'>;
export type IndicatorValue = RevBarIndicator | FractalIndicator;
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
}
export interface CheckedOtherSettings {
  allTradesShown: boolean;
  alligator: boolean;
  ao: boolean;
  mountedIndicators: boolean;
  zoom: boolean;
  scroll: boolean;
}
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
