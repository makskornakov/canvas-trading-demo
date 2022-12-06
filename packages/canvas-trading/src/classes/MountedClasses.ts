import {
  MountedIndicatorType,
  IndicatorValue,
  Indicators,
  AssignedTrade,
} from '../types';

export class MountedIndicator {
  type: MountedIndicatorType;
  value: IndicatorValue;
  yPos: number;
  constructor(type: MountedIndicatorType, value: IndicatorValue, yPos: number) {
    this.type = type;
    this.yPos = yPos;
    this.value = value;
  }
}
export class MountedTrade {
  type: 'trade' = 'trade';
  tradeType: 'long' | 'short';
  profitable: boolean;
  yPos: number;
  constructor(tradeType: 'long' | 'short', profitable: boolean, yPos: number) {
    this.tradeType = tradeType;
    this.profitable = profitable;
    this.yPos = yPos;
  }
}
export class CandleMountPoints {
  above: (MountedIndicator | MountedTrade | null)[];
  below: (MountedIndicator | MountedTrade | null)[];
  constructor(
    candleWidth: number,
    candleIndicators: Indicators,
    trades: AssignedTrade[],
    low: number,
    high: number,
    above: boolean
  ) {
    this.above = [];
    this.below = [];
    this.mountIndicators(
      candleWidth,
      candleIndicators,
      trades,
      low,
      high,
      above
    );
  }
  private mountIndicators(
    candleWidth: number,
    indicators: Indicators,
    trades: AssignedTrade[],
    low: number,
    high: number,
    above: boolean
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

    // mount trade if both start and end are in this candle
    trades.forEach((trade) => {
      const tradeID = trade.tradeID;
      const foundStart = !trade.isThisCandleEnd && trade.isThisCandleStart;

      const foundEnd = trades.find(
        (trade) =>
          trade.tradeID === tradeID &&
          trade.isThisCandleEnd &&
          !trade.isThisCandleStart
      );

      if (foundStart && foundEnd) {
        const profit = trade.profit;

        if (above)
          this.mountDown('trade', profit, candleWidth, low, trade.tradeType);
        else this.mountUp('trade', profit, candleWidth, high, trade.tradeType);
      }
    });
  }

  private mountUp(
    type: MountedIndicatorType,
    value: IndicatorValue,
    candleWidth: number,
    high: number,
    tradeType?: 'long' | 'short'
  ) {
    const yGap = candleWidth;
    const retObj = {
      type,
      value,
      yPos: high - yGap * (1 + this.above.length),
    };
    const isTrade = type === 'trade' && tradeType;
    this.above.push(
      isTrade
        ? ({
            ...retObj,
            tradeType,
            profitable: value > 0,
          } as MountedTrade)
        : retObj
    );
  }

  private mountDown(
    type: MountedIndicatorType,
    value: IndicatorValue,
    candleWidth: number,
    low: number,
    tradeType?: 'long' | 'short'
  ) {
    const yGap = candleWidth;
    const retObj = {
      type,
      value,
      yPos: low + yGap * (1 + this.below.length),
    };
    const isTrade = type === 'trade' && tradeType;
    this.below.push(
      isTrade
        ? ({
            ...retObj,
            tradeType,
            profitable: value > 0,
          } as MountedTrade)
        : retObj
    );
  }
}
