# Interactive trading canvas

### React Typescript open source module

Initially was made for an existing trading bot that provides an analyzed array of candles.

```typescript
interface CandleToDraw {
  open: number;
  openTime: string | Date;
  closeTime: string | Date;
  high: number;
  low: number;
  close: number;
  indicators: Indicators;
  trades?: AssignedTrade[];
}

interface AssignedTrade {
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
  ao: {
    value: number;
    // Custom value used by bot
    vertexValue: number;
    // Starts with 0, goes through array;
    // +1 if green AO bar, -1 if red;
    // Displays the strenfth of AO trend
  };
}
```

#### The logic of assigning the trade

Each trade has an entry time and an exit one. We search for two candles (enter & exit) for each trade and add AssignedTrade to the trades array.

### Simple Usage

```typescript
import  Canvas, { CandleToDraw } from  'canvas-trading';

function  App() {
	return (
		<Canvas
			// Mandatory
			width={800}
			height={400}
			candleArray={candleArray} // CandleToDraw[]
			lastCandle={lastCandle} // CandleToDraw

			// Optioanl
			candlesShown={160}
			shift={0}
			shownTrade={undefind}
			otherSettings={{
				// all optional
				allTradesShown: false, // display all trades
				alligator: true;
				ao: true;
				mountedIndicators: true; // revbar & fractal
			}}
		></Canvas>
	);
}
export default App;
```
