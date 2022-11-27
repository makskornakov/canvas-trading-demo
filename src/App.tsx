import Canvas from './tradingCanvas/Canvas';
import exampleArray from './output';
import { CandleToDraw } from './tradingCanvas/types';

function App() {
  return (
    <div
      style={{
        margin: '50px auto',
        display: 'flex',
        outline: '1px solid black',
        justifyContent: 'center',
        alignItems: 'center',
        height: '600px',
        width: '800px',
      }}
    >
      <Canvas
        width={600}
        height={400}
        candleArray={exampleArray.map((candle) => candle as CandleToDraw)}
        candlesShown={100}
      ></Canvas>
    </div>
  );
}

export default App;
