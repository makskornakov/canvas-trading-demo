import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AoCanvas,
  CursorCanvas,
  MainCanvas,
  PriceLabel,
  DateLabel,
  Wrap,
  OclhLabel,
} from './canvas.styled';

import { CandleCanvas } from '../classes/CandleCanvas';
import { canvasSettings } from '../config';
import { displayTrade, drawAo, drawCursor, drawFunction } from '../draw/draw';
import scrollZoom from '../scrollZoom';
import type {
  CandleToDraw,
  CheckedOtherSettings,
  OtherSettings,
  Vector2,
} from '../types';
import { findCandleWithTrade } from '../draw/drawFunctions';

type CanvasProps = JSX.IntrinsicElements['canvas'] & {
  candleArray: CandleToDraw[];
  lastCandle: CandleToDraw;
  otherSettings?: OtherSettings;
  candlesShown?: number;
  shownTrade?: number;
  shift?: number;
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
  lastCandle: lastCandleProp,
  candlesShown: candlesShownProp,
  shift: shiftProp,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLCanvasElement>(null);
  const aoCanvasRef = useRef<HTMLCanvasElement>(null);

  const properOtherSettings = useMemo<CheckedOtherSettings>(
    () => ({
      allTradesShown: props.otherSettings?.allTradesShown ?? false,
      alligator: props.otherSettings?.alligator ?? true,
      ao: props.otherSettings?.ao ?? true,
      mountedIndicators: props.otherSettings?.mountedIndicators ?? true,
    }),
    [props.otherSettings]
  );

  const [width, setWidth] = usePropState(props.width);
  const [height, setHeight] = usePropState(props.height);
  const [candleArray, setCandleArray] = usePropState(candleArrayProp);
  const [lastCandle, setLastCandle] = usePropState(lastCandleProp);
  const [shift, setShift] = usePropState(shiftProp ?? 0);
  const [candlesShown, setCandlesShown] = usePropState(candlesShownProp ?? 100);
  const [otherSettings, setOtherSettings] = usePropState(properOtherSettings);
  const [shownTrade, setShownTrade] = usePropState(props.shownTrade);

  // canvas elements
  const [displayedPrice, setDisplayedPrice] = useState<number>();
  const [displayedDate, setDisplayedDate] = useState<string>();
  const [displayedOclh, setDisplayedOclh] = useState<{
    o: number;
    c: number;
    l: number;
    h: number;
  }>();
  const [cursor, setCursor] = useState({ x: -5, y: -5 });

  const propsCanvas = useMemo(
    () =>
      new CandleCanvas(
        Number(width),
        Number(height),
        candlesShown,
        shift,
        candleArray,
        lastCandle
      ),
    [candleArray, lastCandle, candlesShown, height, shift, width]
  );

  const cursorFunction = useCallback(
    (position: Vector2, onlyLabels: boolean = false) => {
      if (!canvasRef.current) return;
      if (position.x < 0 || position.y < 0) {
        // No need to update cursor that is not present.
        // Also, resetting cursor labels.
        setDisplayedPrice(undefined);
        setDisplayedDate(undefined);
        setDisplayedOclh(undefined);
        return;
      }

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
      if (candle) {
        setDisplayedDate(new Date(candle.openTime).toLocaleString());
        if (!candle.open || !candle.close || !candle.low || !candle.high)
          return;
        setDisplayedOclh({
          o: candle.open,
          c: candle.close,
          l: candle.low,
          h: candle.high,
        });
      }
      //#endregion
    },
    [candleArray, candlesShown, propsCanvas, shift]
  );
  const initialCandlesShown = useRef(candlesShown);

  // main useEffect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
    if (!ctx) return;
    drawFunction(ctx, propsCanvas, otherSettings);

    if (otherSettings.allTradesShown) {
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

    const aoCanvas = aoCanvasRef.current;
    if (!aoCanvas) return;
    const aoCtx = aoCanvas?.getContext('2d');
    if (otherSettings.ao && aoCtx) drawAo(aoCtx, propsCanvas);

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
    shownTrade,
    propsCanvas,
    cursorFunction,
    otherSettings,
    properOtherSettings.ao,
  ]);

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
    if (shownTrade === undefined) {
      // reset shift and zoom on candleArray change
      setShift(0);
      setCandlesShown(initialCandlesShown.current);
      return;
    }
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
  }, [candleArray, setCandlesShown, setShift, shownTrade]);

  return (
    <Wrap
      width={Number(props.width)}
      height={Number(props.height)}
      style={props.style}
      ao={otherSettings.ao}
    >
      <PriceLabel height={Number(props.height)} cursor={cursor}>
        {displayedPrice}
      </PriceLabel>
      <DateLabel
        width={Number(props.width)}
        height={Number(props.height)}
        cursor={cursor}
        ao={otherSettings.ao}
      >
        {displayedDate}
      </DateLabel>
      <OclhLabel canvasWidth={Number(props.width)}>
        {displayedOclh && (
          <>
            {/* unbreakable space */}

            <p>O: {displayedOclh?.o}</p>
            <p>C: {displayedOclh?.c}</p>
            <p>L: {displayedOclh?.l}</p>
            <p>H: {displayedOclh?.h}</p>
          </>
        )}
      </OclhLabel>
      <MainCanvas
        {...props}
        width={Number(props.width) * canvasSettings.scaleForQuality}
        height={Number(props.height) * canvasSettings.scaleForQuality}
        ref={canvasRef}
        // style undefined because it's not needed
        style={undefined}
      />
      <CursorCanvas
        ref={cursorRef}
        width={Number(props.width) * canvasSettings.scaleForQuality}
        height={Number(props.height) * canvasSettings.scaleForQuality}
      />
      {properOtherSettings.ao && (
        <AoCanvas
          width={Number(props.width) * canvasSettings.scaleForQuality}
          height={(Number(props.height) * canvasSettings.scaleForQuality) / 5}
          ref={aoCanvasRef}
        />
      )}
    </Wrap>
  );
};

export default Canvas;
