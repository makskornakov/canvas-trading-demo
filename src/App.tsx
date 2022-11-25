import React, { useEffect } from 'react';
import Canvas from './Canvas';
import { CandleToDraw, drawFunction, getDrawingArray } from './draw';
import exampleArray from './output';

function App() {
  const drawingCandles = exampleArray.map((candle) => candle as CandleToDraw);
  const result = getDrawingArray(drawingCandles);
  const canvas = result.canvas;
  const candles = result.candles2D;
  console.log(candles, canvas);

  return (
    <>
      <div
        style={{
          margin: '0 auto',
          display: 'flex',
          outline: '1px solid black',
          justifyContent: 'center',
          alignItems: 'center',
          height: '600px',
          width: '800px',
        }}
      >
        <Canvas
          draw={drawFunction}
          width={600}
          height={400}
          candlesArray={candles}
          canvas={canvas}
        ></Canvas>
      </div>
    </>
  );
}

export default App;
