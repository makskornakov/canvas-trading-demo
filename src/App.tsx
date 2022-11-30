import Canvas, { CandleToDraw } from 'canvas-trading';

import exampleArray from './output.json';
import exampleArray2 from './output2.json';
import {
  Description,
  Header,
  Wrap,
  ControlWrap,
  ControlButton,
} from './app.styled';
import { useState, useEffect } from 'react';

function findMaxTrade(candleArray: CandleToDraw[]) {
  let max = 0;
  candleArray.forEach((candle) => {
    if (candle.trades) {
      if (candle.trades[0].tradeID > max) {
        max = candle.trades[0].tradeID;
      }
    }
  });
  return max;
}

function App() {
  const [selectedTrade, setSelectedTrade] = useState<number | undefined>(
    undefined
  );
  const [candleArray, setCandleArray] = useState<CandleToDraw[]>(
    exampleArray as CandleToDraw[]
  );
  const [maxTrade, setMaxTrade] = useState<number>(0);

  useEffect(() => {
    let max = findMaxTrade(candleArray);
    setMaxTrade(max);
    setSelectedTrade(undefined);
  }, [candleArray]);
  return (
    <>
      <Header>Trading Canvases</Header>
      <Description>Resizable canvas with Zoom/Scroll functionality</Description>
      <Wrap>
        <Canvas
          width={800}
          height={400}
          candleArray={candleArray}
          candlesShown={160}
          shift={0}
          allTradesShown={true}
        ></Canvas>
        <Canvas
          width={350}
          height={300}
          candleArray={candleArray}
          candlesShown={40}
          shift={0}
          allTradesShown={false}
          shownTrade={selectedTrade}
        ></Canvas>
      </Wrap>
      <ControlWrap>
        <ControlButton
          onClick={() => {
            setCandleArray(exampleArray as CandleToDraw[]);
          }}
        >
          Example 1
        </ControlButton>
        <ControlButton
          onClick={() => {
            setCandleArray(exampleArray2 as CandleToDraw[]);
          }}
        >
          Example 2
        </ControlButton>
        <ControlButton
          onClick={() => {
            // next but if max trade is reached, go to 0
            if (selectedTrade === maxTrade) {
              setSelectedTrade(0);
            } else
              setSelectedTrade(
                selectedTrade !== undefined ? selectedTrade + 1 : 0
              );
          }}
        >
          Next trade
        </ControlButton>
        <label style={{ color: 'white' }}>
          Selected trade: {selectedTrade}
        </label>
      </ControlWrap>
    </>
  );
}

export default App;
