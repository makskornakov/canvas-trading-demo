# Demo-project of an Interactive trading canvas

### React Typescript open source module

Initially was made for an existing trading bot that provides an analyzed array of candles.

[GitHub repository](https://github.com/makskornakov/canvas-trading-demo)
[Demo application](https://makskornakov.github.io/canvas-trading-demo/)

## Candle type

```typescript
interface CandleToDraw {
  open: number;
  openTime: string | Date;
  closeTime: string | Date;
  high: number;
  low: number;
  close: number;
  indicators: Indicators; //bellow
  trades?: AssignedTrade[];
  asset?: string;
}
```

### Trade in the candle.trades[]

```typescript
interface AssignedTrade {
  tradeID: number;
  tradeType: 'long' | 'short';
  buyPrice: number;
  sellPrice: number;
  profit: number;
  isThisCandleStart: boolean;
  isThisCandleEnd: boolean;
}
```

### Indicators in candle.indicators

```typescript
interface Indicators {
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
    // Displays the strength of AO trend
  };
}
```

### The logic of assigning the trade

Each trade has an entry time and an exit one. We search for two candles (enter & exit) for each trade and add AssignedTrade to the trades array.

## Simple Usage

```typescript
import Canvas, { CandleToDraw } from 'canvas-trading';

function App() {
  return (
    <Canvas
      // Mandatory
        width={800}
        height={400}
        candleArray={candleArray} // CandleToDraw[]
        lastCandle={lastCandle} // CandleToDraw

        // Optional
        candlesShown={160}
        shift={0}
        shownTrade={undefined}
        otherSettings={{
          // all optional
          allTradesShown: false, // display all trades
          alligator: true;
          ao: true;
          mountedIndicators: true; // revbar & fractal
          shift: true;
          scroll: true;
          showAsset: false; // shows big asset label
          showLastCandlePrice: false,
          cursor: true,
          resizable: false, // beta version to resize the canvas
        }}
        styles={
          // any styles are applied to the Main wrap of the canvas and fonts are used through the hole canvas
        }
      ></Canvas>
   );
}
export default App;
```

## How to develop local packages with Hot Reload

> Reference: https://pnpm.io/cli/link

In a terminal, execute the following commands (assuming [`canvas-trading`][canvas-trading] is the package we want to develop):

```ps1
pnpm link ./packages/canvas-trading # `./` in the start is important — this is how `pnpm link` knows that it is a relative path.

cd packages/canvas-trading

pnpm i

pnpm tsc --watch

# Leave this terminal running for Hot Reload.
```

In another terminal, just execute `pnpm start`, or restart if it's already running. Good to go!

Update anything in [`canvas-trading`][canvas-trading] for a test.

#### When you're done

In project root execute:

```ps1
pnpm unlink canvas-trading
```

You may also want to stop the terminal running `pnpm tsc --watch`.

No need to stop the `pnpm start` terminal (if you have it running).

[canvas-trading]: ./packages/canvas-trading/
