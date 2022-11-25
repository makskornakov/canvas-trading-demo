import React from 'react';
import Canvas from './Canvas';
import { drawFunction } from './draw';

function App() {
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
        <Canvas draw={drawFunction} width={600} height={400}></Canvas>
      </div>
    </>
  );
}

export default App;
