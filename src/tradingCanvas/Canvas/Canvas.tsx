import { useEffect, useRef, useState } from 'react';
import {
  AlligatorCanvas,
  CursorCanvas,
  MainCanvas,
  PriceLabel,
  DateLabel,
  Wrap,
} from './canvas.styled';

import { CandleCanvas } from '../classes/CandleCanvas';
import { canvasSettings } from '../config';
import { displayTrade, drawAo, drawCursor, drawFunction } from '../draw/draw';
import scrollZoom from '../scrollZoom';
import { CandleToDraw } from '../types';
import { findCandleWithTrade } from '../draw/drawFunctions';

type CanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
> & {
  candleArray: any[];
  candlesShown: number;
  shift: number;
  allTradesShown: boolean;
  shownTrade?: number;
};

function usePropState<T>(prop: T) {
  const [state, setState] = useState(prop);

  useEffect(() => {
    setState(prop);
  }, [prop]);

  return [state, setState] as const;
}

const Canvas: React.FC<CanvasProps> = ({
  candleArray: candleArrayProp,
  candlesShown: candlesShownProp,
  shift: shiftProp,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLCanvasElement>(null);
  const aoCanvasRef = useRef<HTMLCanvasElement>(null);

  const [width, setWidth] = usePropState(props.width);
  const [height, setHeight] = usePropState(props.height);
  const [candlesShown, setCandlesShown] = usePropState(candlesShownProp);
  const [candleArray, setCandleArray] = usePropState(
    candleArrayProp as CandleToDraw[]
  );
  const [shift, setShift] = usePropState(shiftProp);
  const [allTradesShown, setAllTradesShown] = usePropState(
    props.allTradesShown
  );
  const [shownTrade, setShownTrade] = usePropState(props.shownTrade);
  const [displayedPrice, setDisplayedPrice] = useState<number>();
  const [displayedDate, setDisplayedDate] = useState<string>();
  const [cursor, setCursor] = useState({ x: -5, y: -5 });

  // main useEffect
  useEffect(() => {
    const drawingCandles = candleArray.map((candle) => candle as CandleToDraw);
    const propsCanvas = new CandleCanvas(
      Number(width),
      Number(height),
      candlesShown,
      shift,
      drawingCandles
    );

    const canvas = canvasRef.current;
    const aoCanvas = aoCanvasRef.current;
    if (!canvas || !aoCanvas) return;

    const scrollZoomEventListener = (e: WheelEvent) => {
      e.preventDefault();
      // e.stopPropagation(); // makes it laggy
      scrollZoom(
        { x: e.deltaX, y: e.deltaY },
        shift,
        candlesShown,
        drawingCandles.length,
        setShift,
        setCandlesShown
      );
      return false; // Why does it return false?
    };
    // scroll zoom EventListener
    canvas.addEventListener('wheel', scrollZoomEventListener);

    const cursorMoveEventListener = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setDisplayedPrice(propsCanvas.getDisplayedPrice(e.clientY - rect.top));
      setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      const shiftedCandleArray = drawingCandles.slice(
        0,
        drawingCandles.length - shift
      );

      const zoomedCandleArray = shiftedCandleArray.slice(
        shiftedCandleArray.length - candlesShown,
        shiftedCandleArray.length
      );

      const xPosInPcnt = (e.clientX - rect.left) / rect.width;

      const index = Math.floor(xPosInPcnt * zoomedCandleArray.length);

      const candle = zoomedCandleArray[index];
      console.log(candle);
      if (candle) {
        setDisplayedDate(new Date(candle.openTime).toLocaleString());
      }
    };
    // cursor EventListeners
    canvas.addEventListener('mousemove', cursorMoveEventListener);

    const cursorOutEventListener = () => {
      // reset cursor
      setCursor({ x: -5, y: -5 });
      setDisplayedPrice(undefined);
      setDisplayedDate(undefined);
    };
    canvas.addEventListener('mouseleave', cursorOutEventListener);

    const ctx = canvas.getContext('2d');
    const aoCtx = aoCanvas.getContext('2d');
    if (!ctx || !aoCtx) return;

    drawFunction(ctx, propsCanvas);

    if (allTradesShown) {
      let max = shownTrade ? shownTrade : 0;
      drawingCandles.forEach((candle) => {
        candle.trades?.forEach((trade) => {
          if (trade.tradeID > max) max = trade.tradeID;
        });
      });
      for (let i = 0; i <= max; i++) {
        displayTrade(ctx, propsCanvas, i);
      }
    } else if (shownTrade !== undefined) {
      displayTrade(ctx, propsCanvas, shownTrade);
    }

    drawAo(aoCtx, propsCanvas);

    return () => {
      // Cleanup. Otherwise, the events are duplicated.
      canvas.removeEventListener('wheel', scrollZoomEventListener);
      canvas.removeEventListener('mousemove', cursorMoveEventListener);
      canvas.removeEventListener('mouseleave', cursorOutEventListener);
    };
  }, [
    width,
    candlesShown,
    candleArray,
    shift,
    height,
    setShift,
    setCandlesShown,
    allTradesShown,
    shownTrade,
  ]);

  // useEffect for cursor
  useEffect(() => {
    const canvas = cursorRef.current;
    if (!canvas) return;
    const cursorCtx = canvas.getContext('2d');
    if (!cursorCtx) return;
    drawCursor(cursorCtx, canvas.width, canvas.height, cursor);
  }, [width, height, cursor, candlesShown]);

  // useEffect for to shift graph when shownTrade changes
  useEffect(() => {
    if (shownTrade === undefined) return;
    const startCandle = findCandleWithTrade(candleArray, shownTrade);
    const endCandle = findCandleWithTrade(candleArray, shownTrade, true);
    if (!startCandle.candle || !endCandle.candle) return;

    const newShift = Math.min(
      Math.max(
        candleArray.length - candleArray.indexOf(endCandle.candle) - 10,
        0
      ),
      candleArray.length - 40
    );

    const newCandlesShown =
      candleArray.indexOf(endCandle.candle) -
      candleArray.indexOf(startCandle.candle) +
      20;

    setShift(newShift);
    setCandlesShown(newCandlesShown);
    console.log('would shift now');
  }, [candleArray, setCandlesShown, setShift, shownTrade]);

  return (
    <Wrap
      width={Number(props.width)}
      height={Number(props.height)}
      style={{ position: 'relative' }}
    >
      <PriceLabel height={Number(props.height)} cursor={cursor}>
        {displayedPrice}
      </PriceLabel>
      <DateLabel
        width={Number(props.width)}
        height={Number(props.height)}
        cursor={cursor}
      >
        {displayedDate}
      </DateLabel>
      <MainCanvas
        {...props}
        width={Number(props.width) * canvasSettings.scaleForQuality}
        height={Number(props.height) * canvasSettings.scaleForQuality}
        ref={canvasRef}
      />
      <CursorCanvas
        ref={cursorRef}
        width={Number(props.width) * canvasSettings.scaleForQuality}
        height={Number(props.height) * canvasSettings.scaleForQuality}
      ></CursorCanvas>
      <AlligatorCanvas
        width={Number(props.width) * canvasSettings.scaleForQuality}
        height={(Number(props.height) * canvasSettings.scaleForQuality) / 5}
        ref={aoCanvasRef}
      />
    </Wrap>
  );
};

export default Canvas;
