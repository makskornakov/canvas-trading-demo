import Canvas from './tradingCanvas/Canvas/Canvas';
import exampleArray from './output';
import { Description, Header, Wrap } from './app.styled';
import { useState } from 'react';

function App() {
  const [selectedTrade, setSelectedTrade] = useState<number | undefined>(
    undefined
  );
  return (
    <>
      <Header>Trading Canvases</Header>
      <Description>Resizable canvas with Zoom/Scroll functionality</Description>
      <Wrap>
        <Canvas
          width={800}
          height={400}
          candleArray={exampleArray}
          candlesShown={160}
          shift={0}
          allTradesShown={true}
        ></Canvas>
        <Canvas
          width={350}
          height={300}
          candleArray={exampleArray}
          candlesShown={40}
          shift={0}
          allTradesShown={false}
          shownTrade={selectedTrade}
        ></Canvas>
      </Wrap>
      <button
        onClick={() => {
          setSelectedTrade((prev) => (prev === undefined ? 0 : prev + 1));
        }}
      >
        Next trade
      </button>
    </>
  );
}

export default App;
