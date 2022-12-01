import Canvas, { CandleToDraw } from 'canvas-trading';

import exampleArray1 from './exampleData/output.json';
import exampleArray2 from './exampleData/output2.json';
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
    exampleArray1 as CandleToDraw[]
  );
  const [lastCandle, setLastCandle] = useState<CandleToDraw>(
    candleArray[candleArray.length - 9]
  );
  const [maxTrade, setMaxTrade] = useState<number>(0);

  function changeCandle(add: boolean = true) {
    if (lastCandle) {
      let newLastCandle = { ...lastCandle };
      const value = Math.max(
        Math.abs(lastCandle.close - lastCandle.open) * 0.1,
        Math.abs(lastCandle.low - lastCandle.high) * 0.05
      );
      newLastCandle.close += add ? value : -value;
      // if low is higher than close, set low to close
      if (newLastCandle.low > newLastCandle.close) {
        newLastCandle.low = newLastCandle.close;
      }
      // if high is lower than close, set high to close
      if (newLastCandle.high < newLastCandle.close) {
        newLastCandle.high = newLastCandle.close;
      }
      setLastCandle(newLastCandle);
    }
  }

  useEffect(() => {
    let max = findMaxTrade(candleArray);
    setMaxTrade(max);
    setSelectedTrade(undefined);
    setLastCandle(candleArray[candleArray.length - 9]);
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
          lastCandle={lastCandle}
          candlesShown={160}
          shift={0}
          allTradesShown={true}
          style={{
            outline: '0.5px solid rgba(255, 255, 255, 0.2)',
          }}
        ></Canvas>
        <Canvas
          width={350}
          height={300}
          candleArray={candleArray}
          lastCandle={lastCandle}
          candlesShown={40}
          shift={0}
          allTradesShown={false}
          shownTrade={selectedTrade}
          style={{
            outline: '0.5px solid rgba(255, 255, 255, 0.2)',
          }}
        ></Canvas>
      </Wrap>
      <ControlWrap>
        <ControlButton
          onClick={() => {
            setCandleArray(exampleArray1 as CandleToDraw[]);
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
        <ControlButton
          onClick={() => {
            changeCandle();
          }}
        >
          add 10%
        </ControlButton>
        <ControlButton
          onClick={() => {
            changeCandle(false);
          }}
        >
          sub 10%
        </ControlButton>

        <label style={{ color: 'white' }}>
          Selected trade: {selectedTrade}
        </label>
      </ControlWrap>
    </>
  );
}

export default App;
