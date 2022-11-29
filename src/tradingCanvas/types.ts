import { Candle2D } from './classes/CandleClasses';

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
export type MountedIndicatorType = 'fractal' | 'revBar';
export type IndicatorValue = 'buy' | 'sell' | 'up' | 'down';
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
export interface Indicators {
  revBar: 'buy' | 'sell';
  fractal: 'up' | 'down';
  alligator: {
    jaw: number;
    teeth: number;
    lips: number;
  };
  ao: { value: number; vertexValue: number };
}
export type Vector2 = {
  x: number;
  y: number;
};
