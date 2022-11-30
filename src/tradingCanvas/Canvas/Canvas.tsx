import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import type { CandleToDraw, Vector2 } from '../types';
import { findCandleWithTrade } from '../draw/drawFunctions';

type CanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
> & {
  candleArray: CandleToDraw[];
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
  const [candleArray, setCandleArray] = usePropState(candleArrayProp);
  const [shift, setShift] = usePropState(shiftProp);
  const [allTradesShown, setAllTradesShown] = usePropState(
    props.allTradesShown
  );
  const [shownTrade, setShownTrade] = usePropState(props.shownTrade);
  const [displayedPrice, setDisplayedPrice] = useState<number>();
  const [displayedDate, setDisplayedDate] = useState<string>();
  const [cursor, setCursor] = useState({ x: -5, y: -5 });

  const propsCanvas = useMemo(() => new CandleCanvas(
    Number(width),
    Number(height),
    candlesShown,
    shift,
    candleArray,
  ), [candleArray, candlesShown, height, shift, width]);

  const cursorFunction = useCallback((
    position: Vector2,
    onlyLabels: boolean = false
  ) => {
    if (!canvasRef.current) return;
    if (position.x < 0 || position.y < 0) {
      // No need to update cursor that is not present.
      // Also, resetting cursor labels.
      setDisplayedPrice(undefined);
      setDisplayedDate(undefined);
      return;
    };

    const rect = canvasRef.current.getBoundingClientRect();
    const x = onlyLabels ? position.x : position.x - rect.left;
    const y = onlyLabels ? position.y : position.y - rect.top;
    setDisplayedPrice(propsCanvas.getDisplayedPrice(y));
    if (!onlyLabels) setCursor({ x, y });

    //#region finding date for displayed date
    const zoomedAndShifted = candleArray.slice(
      candleArray.length - candlesShown - shift,
      candleArray.length - shift
    );
    const xPosInPercent = x / rect.width;

    const index = Math.floor(xPosInPercent * zoomedAndShifted.length);

    const candle = zoomedAndShifted[index];
    // console.log(candle);
    if (candle) {
      setDisplayedDate(new Date(candle.openTime).toLocaleString());
    }
    //#endregion
  }, [candleArray, candlesShown, propsCanvas, shift]);

  // main useEffect
  useEffect(() => {
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
        candleArray.length,
        setShift,
        setCandlesShown
      );
      return false; // Why does it return false?
    };
    // scroll zoom EventListener
    canvas.addEventListener('wheel', scrollZoomEventListener);

    const cursorMoveEventListener = (e: MouseEvent) => {
      cursorFunction({ x: e.clientX, y: e.clientY });
    };
    // cursor EventListeners
    canvas.addEventListener('mousemove', cursorMoveEventListener);

    const cursorOutEventListener = () => {
      // reset cursor
      setCursor({ x: -5, y: -5 });
    };
    canvas.addEventListener('mouseleave', cursorOutEventListener);

    const ctx = canvas.getContext('2d');
    const aoCtx = aoCanvas.getContext('2d');
    if (!ctx || !aoCtx) return;

    drawFunction(ctx, propsCanvas);

    if (allTradesShown) {
      let max = shownTrade ? shownTrade : 0;
      candleArray.forEach((candle) => {
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
  }, [width, candlesShown, candleArray, shift, height, setShift, setCandlesShown, allTradesShown, shownTrade, propsCanvas, cursorFunction]);

  // useEffect for cursor
  useEffect(() => {
    const canvas = cursorRef.current;
    if (!canvas) return;
    const cursorCtx = canvas.getContext('2d');
    if (!cursorCtx) return;
    drawCursor(cursorCtx, canvas.width, canvas.height, cursor);
    cursorFunction(cursor, true);
  }, [width, height, cursor, candlesShown, cursorFunction]);

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
