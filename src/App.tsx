import React, { useEffect } from 'react';
import Canvas from './Canvas';
import { CandleCanvas, CandleToDraw, drawFunction } from './draw';
import exampleArray from './output';

function App() {
  const drawingCandles = exampleArray.map((candle) => candle as CandleToDraw);
  console.log(exampleArray.length);
  const canvas = new CandleCanvas(600, 400, 150, drawingCandles);
  console.log(canvas);

  return (
    <>
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
          draw={drawFunction}
          width={600}
          height={400}
          canvas={canvas}
        ></Canvas>
      </div>
    </>
  );
}

export default App;
