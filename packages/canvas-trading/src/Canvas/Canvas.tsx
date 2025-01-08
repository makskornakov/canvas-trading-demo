import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';

import {
  AoCanvas,
  CursorCanvas,
  MainCanvas,
  PriceLabel,
  DateLabel,
  Wrap,
  OclhLabel,
  AssetLabel,
  AOCanvasNameLabel,
  StdevCanvasNameLabel,
} from './canvas.styled';

import { CandleCanvas } from '../classes/CandleCanvas';
import { candleColors, canvasSettings } from '../config';
import {
  displayTrade,
  drawAo,
  drawCursor,
  drawFibonacciRetracements,
  drawFunction,
  drawSimpleLine,
  drawStdev,
} from '../draw/draw';
import scrollZoom from '../scrollZoom';
import type {
  CandleToDraw,
  CheckedOtherSettings,
  FoundCandle,
  OtherSettings,
  Vector2,
  FibonacciRetracement,
} from '../types';
import { findCandleByDate, findCandleWithTrade } from '../draw/drawFunctions';
import { touchEventHasScale } from '../utils/scalingMobileLike';

interface CandlePointer {
  openTime: string;
  param: 'open' | 'close' | 'high' | 'low';
}

interface SimpleLine {
  start: CandlePointer;
  end: CandlePointer;
  color: string;
  opacity?: number;
  dash?: number[];
}

type CanvasProps = JSX.IntrinsicElements['canvas'] & {
  candleArray: CandleToDraw[];
  lastCandle: CandleToDraw | undefined;
  resolution?: string;
  otherSettings?: OtherSettings;
  candlesShown?: number;
  shownTrade?: number;
  shownFibonacci?: number;
  shift?: number;
  initialFibonacciRetracement?: FibonacciRetracement[];
  drawnLines?: SimpleLine[];
};

function usePropState<T>(prop: T) {
  const [state, setState] = useState(prop);

  useEffect(() => {
    setState(prop);
  }, [prop]);

  return [state, setState] as const;
}

const Canvas: React.FC<CanvasProps> = ({
  style,
  candleArray,
  lastCandle,
  candlesShown: candlesShownProp,
  shift: shiftProp,
  initialFibonacciRetracement,
  shownFibonacci = 0,
  drawnLines,
  shownTrade,
  width: widthProp,
  height: heightProp,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLCanvasElement>(null);
  const aoCanvasRef = useRef<HTMLCanvasElement>(null);
  const stdevCanvasRef = useRef<HTMLCanvasElement>(null);

  const otherSettings = useMemo<CheckedOtherSettings>(
    () => ({
      allTradesShown: props.otherSettings?.allTradesShown ?? false,
      alligator: props.otherSettings?.alligator ?? true,
      ao: props.otherSettings?.ao ?? true,
      stdev: props.otherSettings?.stdev ?? false,
      mountedIndicators: props.otherSettings?.mountedIndicators ?? true,
      zoom: props.otherSettings?.zoom ?? true,
      scroll: props.otherSettings?.scroll ?? true,
      showAsset: props.otherSettings?.showAsset ?? false,
      showLastCandlePrice: props.otherSettings?.showLastCandlePrice ?? false,
      cursor: props.otherSettings?.cursor ?? true,
      resizable: props.otherSettings?.resizable ?? false,
      fullscreen: props.otherSettings?.fullscreen ?? false,
      aoCanvasStyle: props.otherSettings?.aoCanvasStyle ?? {},
      onlyShowSelectedFibonacci: props.otherSettings?.onlyShowSelectedFibonacci ?? false,
      autoFocusOnSelectedFibonacci: props.otherSettings?.autoFocusOnSelectedFibonacci ?? false,
      drawRevBar: props.otherSettings?.drawRevBar ?? true,
      drawFractal: props.otherSettings?.drawFractal ?? true,
      dateTimeZone: props.otherSettings?.dateTimeZone ?? 'UTC',
    }),
    [props.otherSettings],
  );
  // canvas settings
  const [width, setWidth] = usePropState(widthProp);
  const [height, setHeight] = usePropState(heightProp);
  const [shift, setShift] = usePropState(shiftProp ?? 0);
  const [candlesShown, setCandlesShown] = usePropState(candlesShownProp ?? 100);
  const [fullscreen, setFullscreen] = usePropState(otherSettings.fullscreen);

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
  const [isDragging, setIsDragging] = useState(false);

  const [
    fibonacciRetracement,
    // setFiboRetracement //? can be set for drawing tools
  ] = useState<FibonacciRetracement[]>(initialFibonacciRetracement ?? []);

  const propsCanvas = useMemo(() => {
    try {
      return new CandleCanvas(
        Number(width),
        Number(height),
        candlesShown,
        shift,
        candleArray,
        lastCandle,
      );
    } catch (error) {
      console.error('Could not create new CandleCanvas()', error);
      return null;
    }
  }, [width, height, candlesShown, shift, candleArray, lastCandle]);

  const cursorFunction = useCallback(
    (position: Vector2, onlyLabels: boolean = false) => {
      if (!canvasRef.current || !propsCanvas) return;

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
        candleArray.length - shift,
      );
      const xPosInPercent = x / rect.width;

      const index = Math.floor(xPosInPercent * zoomedAndShifted.length);

      const candle = zoomedAndShifted[index];
      if (candle) {
        setDisplayedDate(
          otherSettings.dateTimeZone === 'UTC'
            ? new Date(candle.openTime).toLocaleString('en-US', {
                timeZone: 'UTC',
              })
            : new Date(candle.openTime).toLocaleString(),
        );
        if (!candle.open || !candle.close || !candle.low || !candle.high) return;
        setDisplayedOclh({
          o: candle.open,
          h: candle.high,
          l: candle.low,
          c: candle.close,
        });
      }
      //#endregion
    },
    [candleArray, candlesShown, propsCanvas, shift, otherSettings.dateTimeZone],
  );
  const initialCandlesShown = useRef(candlesShown);

  const maxTradeId = useMemo(
    () =>
      Math.max(
        ...(candleArray
          .map((candle) => candle.trades)
          .flat()
          .map((trade) => trade?.tradeID)
          .filter((tradeID) => tradeID !== undefined) as number[]),
        0,
      ),
    [candleArray],
  );

  const candlesForAllTrades = useMemo(() => {
    if (!candleArray) return;
    if (maxTradeId === undefined) return;

    const result: Record<
      number,
      {
        startCandle: FoundCandle<CandleToDraw>;
        endCandle: FoundCandle<CandleToDraw>;
      }
    > = {};

    for (let tradeIDIndex = 0; tradeIDIndex <= maxTradeId; tradeIDIndex++) {
      const startCandle = findCandleWithTrade(candleArray, tradeIDIndex);
      const endCandle = findCandleWithTrade(candleArray, tradeIDIndex, true);
      result[tradeIDIndex] = {
        startCandle,
        endCandle,
      };
    }

    return result;
  }, [maxTradeId, candleArray]);

  // we have candlePointers, we need to draw lines between them
  // we first go through all lines and find candles by date
  // we can then use the candle class point properties to draw the lines
  interface LineToDraw {
    start: {
      candle: FoundCandle<CandleToDraw>;
      param: 'open' | 'close' | 'high' | 'low';
    };
    end: {
      candle: FoundCandle<CandleToDraw>;
      param: 'open' | 'close' | 'high' | 'low';
    };
    color: string;
    opacity?: number;
    dash?: number[];
  }
  const linesToDraw = useMemo(() => {
    if (!drawnLines) return;
    const result: LineToDraw[] = [];
    drawnLines.forEach((line) => {
      const startCandle = findCandleByDate(candleArray, new Date(line.start.openTime));
      const endCandle = findCandleByDate(candleArray, new Date(line.end.openTime));

      if (!startCandle.candle || !endCandle.candle) return;

      result.push({
        start: {
          candle: startCandle,
          param: line.start.param,
        },
        end: {
          candle: endCandle,
          param: line.end.param,
        },
        color: line.color,
        opacity: line.opacity,
        dash: line.dash,
      });
    });

    return result;
  }, [drawnLines, candleArray]);

  const candlesForAllFibonacci = useMemo(() => {
    if (!candleArray) return;
    if (fibonacciRetracement.length === 0) return;

    const result: {
      startPrice: number;
      endPrice: number;
      startCandle: FoundCandle<CandleToDraw>;
      endCandle: FoundCandle<CandleToDraw>;
    }[] = [];
    for (let fibonacciIndex = 0; fibonacciIndex < fibonacciRetracement.length; fibonacciIndex++) {
      const startCandle = findCandleByDate(
        candleArray,
        new Date(fibonacciRetracement[fibonacciIndex].startDate),
      );
      const endCandle = findCandleByDate(
        candleArray,
        new Date(fibonacciRetracement[fibonacciIndex].endDate),
      );

      result.push({
        startPrice: fibonacciRetracement[fibonacciIndex].priceA,
        endPrice: fibonacciRetracement[fibonacciIndex].priceB,
        startCandle,
        endCandle,
      });
    }

    return result;
  }, [fibonacciRetracement, candleArray]);

  // main useEffect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !propsCanvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawFunction(ctx, propsCanvas, otherSettings);

    if (otherSettings.allTradesShown && maxTradeId !== undefined && candlesForAllTrades) {
      for (let i = 0; i <= maxTradeId; i++) {
        displayTrade(ctx, propsCanvas, candlesForAllTrades[i]);
      }
    } else if (shownTrade !== undefined && candlesForAllTrades) {
      displayTrade(ctx, propsCanvas, candlesForAllTrades[shownTrade]);
    }

    // draw ao
    if (otherSettings.ao) {
      const aoCanvas = aoCanvasRef.current;
      if (!aoCanvas) return;
      const aoCtx = aoCanvas.getContext('2d');
      if (!aoCtx) return;
      drawAo(aoCtx, propsCanvas);
    }

    //draw standard deviation
    if (otherSettings.stdev) {
      const stdevCanvas = stdevCanvasRef.current;
      if (!stdevCanvas) return;
      const stdevCtx = stdevCanvas.getContext('2d');
      if (!stdevCtx) return;
      drawStdev(stdevCtx, propsCanvas.standardDeviationArray);
    }

    // draw simple lines from drawnLines
    linesToDraw?.forEach((line) => {
      const startCandle = line.start.candle;
      const endCandle = line.end.candle;
      if (!startCandle.candle || !endCandle.candle) return;

      drawSimpleLine(
        ctx,
        propsCanvas,
        startCandle.candle[line.start.param],
        endCandle.candle[line.end.param],
        startCandle.index,
        endCandle.index,
        line.color,
        line.opacity,
        line.dash,
      );
    });

    if (!candlesForAllFibonacci) return;
    //? if onlyShowSelectedFibonacci is true, we only draw the selected fibonacci, not all of them (cuz they might overlap and look bad)
    const fiboArray = otherSettings.onlyShowSelectedFibonacci
      ? [candlesForAllFibonacci[shownFibonacci]]
      : candlesForAllFibonacci;
    fiboArray.forEach((fibo) => {
      if (!fibo) return;
      drawFibonacciRetracements(
        ctx,
        propsCanvas,
        fibo.startPrice,
        fibo.endPrice,
        fibo.startCandle.index,
        fibo.endCandle.index,
      );
    });
  }, [
    candlesForAllTrades,
    candlesForAllFibonacci,
    maxTradeId,
    otherSettings,
    propsCanvas,
    linesToDraw,
    shownTrade,
    shownFibonacci,
    candleArray,
  ]);

  const [isPinching, setIsPinching] = useState(false);

  useEventListener(
    'wheel',
    (e: WheelEvent) => {
      if (isPinching) return;
      e.preventDefault();
      // prevent other events happening on the parent page
      e.stopPropagation();
      if (!(otherSettings.scroll || otherSettings.zoom)) return;
      scrollZoom(
        {
          x: otherSettings.scroll ? e.deltaX : 0,
          y: otherSettings.zoom ? e.deltaY : 0,
        },
        shift,
        candlesShown,
        candleArray.length,
        setShift,
        setCandlesShown,
      );
    },
    canvasRef,
  );

  // Dragging canvas Effect to scroll
  useEventListener(
    'mousedown',
    () => {
      setIsDragging(true);
    },
    canvasRef,
  );

  useEventListener(
    'mousemove',
    (e: MouseEvent) => {
      if (isDragging) {
        scrollZoom(
          {
            x: -Math.round(e.movementX) * 2,
            y: 0,
          },
          shift,
          candlesShown,
          candleArray.length,
          setShift,
          setCandlesShown,
        );
      }
      if (!otherSettings.cursor) return;
      cursorFunction({ x: e.clientX, y: e.clientY });
    },
    canvasRef,
  );

  const mouseUpOrLeaveListener = () => {
    setIsDragging(false);
  };

  useEventListener('mouseup', mouseUpOrLeaveListener, canvasRef);

  // reset cursor when mouse leaves canvas
  useEventListener(
    'mouseleave',
    () => {
      // reset cursor
      setCursor({ x: -5, y: -5 });
      mouseUpOrLeaveListener();
    },
    canvasRef,
  );

  //#region Pinching for Desktop
  // Does not work in Chrome. Tested in Safari.
  // TODO implement GestureEvent type
  const [lastPinchScale, setLastPinchScale] = useState(0);
  useEventListener(
    // @ts-expect-error 'gesturestart' exists
    'gesturestart',
    (event) => {
      if (!otherSettings.zoom) return;
      if (!touchEventHasScale(event as unknown as TouchEvent)) return;

      event.preventDefault();
      setIsPinching(true);
    },
    canvasRef,
  );
  useEventListener(
    // @ts-expect-error 'gesturechange' exists
    'gesturechange',
    (event) => {
      if (!otherSettings.zoom) return;
      if (!touchEventHasScale(event as unknown as TouchEvent)) return;

      // @ts-expect-error .scale exists
      const pinchScale = event.scale - 1;
      const differenceInPinchScale = pinchScale - lastPinchScale;

      scrollZoom(
        {
          x: 0,
          y: Math.round(-differenceInPinchScale * 1000),
        },
        shift,
        candlesShown,
        candleArray.length,
        setShift,
        setCandlesShown,
      );

      setLastPinchScale(pinchScale);
    },
    canvasRef,
  );
  useEventListener(
    // @ts-expect-error 'gestureend' exists
    'gestureend',
    (event) => {
      if (!otherSettings.zoom) return;
      if (!touchEventHasScale(event as unknown as TouchEvent)) return;

      setLastPinchScale(0);
      setIsPinching(false);
    },
    canvasRef,
  );
  //#endregion

  useEventListener('resize', () => {
    if (!fullscreen) return;

    setWidth(window.innerWidth);
    setHeight(window.innerHeight - (otherSettings.ao ? window.innerHeight / 5 : 0));
  });

  // useEffect for cursor
  useEffect(() => {
    if (!otherSettings.cursor) return;
    const canvas = cursorRef.current;
    if (!canvas) return;
    const cursorCtx = canvas.getContext('2d');
    if (!cursorCtx) return;
    drawCursor(cursorCtx, canvas.width, canvas.height, cursor);
    cursorFunction(cursor, true);
  }, [cursor, cursorFunction, otherSettings.cursor]);

  // useEffect to reset shift and zoom when candleArray shrinks in size (e.g. switching to a smaller data example, or setting smaller history length)
  useEffect(() => {
    const currentlyRequiredLength = shift + candlesShown;
    if (
      candleArray.length < currentlyRequiredLength &&
      candleArray.length >= canvasSettings.minCandlesShown
    ) {
      /**
       * works simpler logic:
       * if somehow the settings that user has set for the previous graph are not possible for the new graph, we just reset them to default.
       * I would even reset them to default every time the candleArray changes, but it will effect when the new candle appears, so we are good for now.
       * the settings that were set for one graph are not convenient either way for any new graph, as you don't want to appear in the middle of the graph unknown to you.
       */

      setShift(0);
      setCandlesShown(Math.min(initialCandlesShown.current, candleArray.length));
    }
  }, [candleArray, candlesShown, setCandlesShown, setShift, shift]);

  // useEffect to reset shift and zoom when unselecting trade.
  useEffect(() => {
    if (shownTrade === undefined) {
      // reset shift and zoom on unselecting trade.
      console.log('resetting shift and zoom');
      setShift(shiftProp ?? 0); //! idk if its actually correct, not working with trades for now
      setCandlesShown(initialCandlesShown.current);
    }
  }, [shownTrade, setShift, setCandlesShown, shiftProp]);

  // useEffect to shift graph when shownTrade changes
  useEffect(() => {
    if (shownTrade === undefined) {
      return;
    }
    const startCandle = findCandleWithTrade(candleArray, shownTrade);
    const endCandle = findCandleWithTrade(candleArray, shownTrade, true);
    if (!startCandle.candle || !endCandle.candle) return;

    const newShift = Math.min(
      Math.max(candleArray.length - candleArray.indexOf(endCandle.candle) - 10, 0),
      candleArray.length - 40,
    );

    const newCandlesShown =
      candleArray.indexOf(endCandle.candle) - candleArray.indexOf(startCandle.candle) + 20;

    setShift(newShift);
    setCandlesShown(newCandlesShown);
  }, [candleArray, setCandlesShown, setShift, shownTrade]);

  // use effect to apply zoom and shift when shownFibonacci changes
  useEffect(() => {
    if (
      shownFibonacci === undefined ||
      !candlesForAllFibonacci ||
      !otherSettings.autoFocusOnSelectedFibonacci
    ) {
      return;
    }
    const fiboCandles = candlesForAllFibonacci[shownFibonacci];
    if (!fiboCandles) return;

    const newShift = Math.min(
      Math.max(candleArray.length - fiboCandles.endCandle.index - 20, 0),
      candleArray.length - 40,
    );
    const newCandlesShown = Math.min(
      fiboCandles.endCandle.index - fiboCandles.startCandle.index + 40,
      candleArray.length - newShift - 3,
    );

    setShift(newShift);
    setCandlesShown(newCandlesShown);
  }, [
    candlesForAllFibonacci,
    candleArray,
    setCandlesShown,
    setShift,
    shownFibonacci,
    otherSettings.autoFocusOnSelectedFibonacci,
  ]);

  return (
    <Wrap
      onMouseMove={
        otherSettings.resizable
          ? (event) => {
              const isMouseDown = event.buttons > 0;
              if (!isMouseDown) return;

              const newWidth = Math.round(event.currentTarget.clientWidth);
              if (width !== newWidth) {
                setWidth(newWidth);
              }

              const aoHeight = otherSettings.ao ? Number(height) / 5 + 5 : 0;
              const newHeight = Math.round(event.currentTarget.clientHeight - aoHeight);
              if (height !== newHeight) {
                setHeight(newHeight);
              }
            }
          : undefined
      }
      resizable={otherSettings.resizable}
      width={Number(width)}
      height={Number(height)}
      style={style}
      stdev={otherSettings.stdev}
      ao={otherSettings.ao}
      fullscreen={fullscreen}
      onDoubleClick={() => {
        setFullscreen((prev) => {
          setWidth(prev ? widthProp : window.innerWidth);
          setHeight(
            prev
              ? heightProp
              : window.innerHeight - (otherSettings.ao ? window.innerHeight / 5 : 0),
          );
          return !prev;
        });
      }}
    >
      {otherSettings.showAsset &&
        (lastCandle?.asset || candleArray[candleArray.length - 1].asset) && (
          <AssetLabel
            height={Number(height)}
            width={Number(width)}
            aoShown={otherSettings.ao}
            opacity={canvasSettings.assetOpacity}
          >
            {lastCandle?.asset || candleArray[candleArray.length - 1].asset}
          </AssetLabel>
        )}
      <PriceLabel height={Number(height)} cursor={cursor}>
        {displayedPrice}
      </PriceLabel>
      <DateLabel
        width={Number(width)}
        height={Number(height)}
        cursor={cursor}
        ao={otherSettings.ao}
        stdev={otherSettings.stdev}
      >
        {displayedDate}
      </DateLabel>
      <OclhLabel canvasWidth={Number(width)} canvasHeight={Number(height)}>
        {(lastCandle?.asset || candleArray[candleArray.length - 1].asset) && (
          <span>
            {lastCandle?.asset || candleArray[candleArray.length - 1].asset}{' '}
            {props.resolution && `• ${props.resolution}`}
          </span>
        )}

        {displayedOclh &&
          Object.keys(displayedOclh).map((key) => (
            <p key={key}>
              {key.toUpperCase()}:
              <label
                style={
                  displayedOclh.c > displayedOclh.o
                    ? { color: candleColors.green }
                    : { color: candleColors.red }
                }
              >
                {/* {' '} */}
                {displayedOclh[key as keyof typeof displayedOclh]}
              </label>
            </p>
          ))}
      </OclhLabel>

      <MainCanvas
        {...props}
        resizable={otherSettings.resizable}
        width={Number(width) * canvasSettings.scaleForQuality}
        height={Number(height) * canvasSettings.scaleForQuality}
        ref={canvasRef}
      />
      <CursorCanvas
        ref={cursorRef}
        width={Number(width) * canvasSettings.scaleForQuality}
        height={Number(height) * canvasSettings.scaleForQuality}
      />

      {/* standard deviation canvas */}
      {otherSettings.stdev && (
        <>
          <StdevCanvasNameLabel
            width={Number(width)}
            height={Number(height)}
            aoShown={otherSettings.ao}
          >
            Stdev
          </StdevCanvasNameLabel>
          <AoCanvas
            style={otherSettings.aoCanvasStyle}
            resizable={otherSettings.resizable}
            width={Number(width) * canvasSettings.scaleForQuality}
            height={(Number(height) * canvasSettings.scaleForQuality) / 5}
            ref={stdevCanvasRef}
          />
        </>
      )}
      {otherSettings.ao && (
        <>
          <AOCanvasNameLabel width={Number(width)} height={Number(height)}>
            AO
          </AOCanvasNameLabel>

          <AoCanvas
            style={otherSettings.aoCanvasStyle}
            resizable={otherSettings.resizable}
            width={Number(width) * canvasSettings.scaleForQuality}
            height={(Number(height) * canvasSettings.scaleForQuality) / 5}
            ref={aoCanvasRef}
          />
        </>
      )}
    </Wrap>
  );
};

export default Canvas;
