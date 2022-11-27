export interface CandleToDraw {
  open: number;
  high: number;
  low: number;
  close: number;
  indicators: Indicators;
  trade?: {
    tradeID: number;
    tradeType: 'long' | 'short';
    buyPrice: number;
    sellPrice: number;
    isThisCandleStart: boolean;
    isThisCandleEnd: boolean;
  };
}
export interface Indicators {
  revBar: 'buy' | 'sell';
  fractal: 'up' | 'down';
  alligator: {
    jaw: number;
    teeth: number;
    lips: number;
  };
}
