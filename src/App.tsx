import Canvas from './tradingCanvas/Canvas/Canvas';
import exampleArray from './output';
import { CandleToDraw } from './tradingCanvas/types';
import { Description, Header, Wrap } from './app.styled';

function App() {
  return (
    <>
      <Header>Trading Canvases</Header>
      <Description>Resizable canvas with Zoom/Scroll functionality</Description>
      <Wrap>
        <Canvas
          width={800}
          height={400}
          candleArray={exampleArray as CandleToDraw[]}
          candlesShown={160}
          shift={0}
        ></Canvas>
        <Canvas
          width={350}
          height={300}
          candleArray={exampleArray as CandleToDraw[]}
          candlesShown={40}
          shift={0}
        ></Canvas>
      </Wrap>
    </>
  );
}

export default App;
