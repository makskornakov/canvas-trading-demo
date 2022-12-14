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
} from './canvas.styled';

import { CandleCanvas } from '../classes/CandleCanvas';
import { canvasSettings } from '../config';
import { displayTrade, drawAo, drawCursor, drawFunction } from '../draw/draw';
import scrollZoom from '../scrollZoom';
import type {
  CandleToDraw,
  CheckedOtherSettings,
  FoundCandle,
  OtherSettings,
  Vector2,
} from '../types';
import { findCandleWithTrade } from '../draw/drawFunctions';
import { touchEventHasScale } from '../utils/scalingMobileLike';

type CanvasProps = JSX.IntrinsicElements['canvas'] & {
  candleArray: CandleToDraw[];
  lastCandle: CandleToDraw | undefined;
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
  style,
  candleArray,
  lastCandle,
  candlesShown: candlesShownProp,
  shift: shiftProp,
  shownTrade,
  width: widthProp,
  height: heightProp,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLCanvasElement>(null);
  const aoCanvasRef = useRef<HTMLCanvasElement>(null);

  const otherSettings = useMemo<CheckedOtherSettings>(
    () => ({
      allTradesShown: props.otherSettings?.allTradesShown ?? false,
      alligator: props.otherSettings?.alligator ?? true,
      ao: props.otherSettings?.ao ?? true,
      mountedIndicators: props.otherSettings?.mountedIndicators ?? true,
      zoom: props.otherSettings?.zoom ?? true,
      scroll: props.otherSettings?.scroll ?? true,
      showAsset: props.otherSettings?.showAsset ?? false,
      showLastCandlePrice: props.otherSettings?.showLastCandlePrice ?? false,
      cursor: props.otherSettings?.cursor ?? true,
      resizable: props.otherSettings?.resizable ?? false,
      fullscreen: props.otherSettings?.fullscreen ?? false,
    }),
    [props.otherSettings]
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

  const propsCanvas = useMemo(() => {
    try {
      return new CandleCanvas(
        Number(width),
        Number(height),
        candlesShown,
        shift,
        candleArray,
        lastCandle
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

  const maxTradeId = useMemo(
    () =>
      Math.max(
        ...(candleArray
          .map((candle) => candle.trades)
          .flat()
          .map((trade) => trade?.tradeID)
          .filter((tradeID) => tradeID !== undefined) as number[]),
        0
      ),
    [candleArray]
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

  // main useEffect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !propsCanvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawFunction(ctx, propsCanvas, otherSettings);

    if (
      otherSettings.allTradesShown &&
      maxTradeId !== undefined &&
      candlesForAllTrades
    ) {
      for (let i = 0; i <= maxTradeId; i++) {
        displayTrade(ctx, propsCanvas, candlesForAllTrades[i]);
      }
    } else if (shownTrade !== undefined && candlesForAllTrades) {
      displayTrade(ctx, propsCanvas, candlesForAllTrades[shownTrade]);
    }

    if (otherSettings.ao) {
      const aoCanvas = aoCanvasRef.current;
      if (!aoCanvas) return;
      const aoCtx = aoCanvas.getContext('2d');
      if (!aoCtx) return;
      drawAo(aoCtx, propsCanvas);
    }
  }, [candlesForAllTrades, maxTradeId, otherSettings, propsCanvas, shownTrade]);

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
        setCandlesShown
      );
    },
    canvasRef
  );

  // Dragging canvas Effect to scroll
  useEventListener(
    'mousedown',
    () => {
      setIsDragging(true);
    },
    canvasRef
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
          setCandlesShown
        );
      }
      if (!otherSettings.cursor) return;
      cursorFunction({ x: e.clientX, y: e.clientY });
    },
    canvasRef
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
    canvasRef
  );

  //#region Pinching for Desktop
  // Does not work in Chrome. Tested in Safari.
  // TODO implement GestureEvent type
  const [lastPinchScale, setLastPinchScale] = useState(0);
  // @ts-expect-error 'gesturechange' exists
  useEventListener('gesturestart', (event) => {
    if (!(otherSettings.zoom)) return;
    if (!touchEventHasScale(event as unknown as TouchEvent)) return;

    event.preventDefault();
    setIsPinching(true);
  }, canvasRef);
  // @ts-expect-error 'gesturechange' exists
  useEventListener('gesturechange', (event) => {
    if (!(otherSettings.zoom)) return;
    if (!touchEventHasScale(event as unknown as TouchEvent)) return;

    // @ts-expect-error .scale exists
    const pinchScale = (event.scale - 1);
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
      setCandlesShown
    );

    setLastPinchScale(pinchScale);
  }, canvasRef);
  // @ts-expect-error 'gesturechange' exists
  useEventListener('gestureend', (event) => {
    if (!(otherSettings.zoom)) return;
    if (!touchEventHasScale(event as unknown as TouchEvent)) return;

    setLastPinchScale(0);
    setIsPinching(false);
  }, canvasRef);
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
      setCandlesShown(
        Math.min(initialCandlesShown.current, candleArray.length)
      );
    }
  }, [candleArray, candlesShown, setCandlesShown, setShift, shift]);

  // useEffect to reset shift and zoom when unselecting trade.
  useEffect(() => {
    if (shownTrade === undefined) {
      // reset shift and zoom on unselecting trade.
      setShift(0);
      setCandlesShown(initialCandlesShown.current);
    }
  }, [shownTrade, setShift, setCandlesShown]);

  // useEffect to shift graph when shownTrade changes
  useEffect(() => {
    if (shownTrade === undefined) {
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
              const newHeight = Math.round(
                event.currentTarget.clientHeight - aoHeight
              );
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
      ao={otherSettings.ao}
      fullscreen={fullscreen}
      onDoubleClick={() => {
        setFullscreen(prev => {
          setWidth(prev ? widthProp : window.innerWidth);
          setHeight(prev ? heightProp : window.innerHeight - (otherSettings.ao ? window.innerHeight / 5 : 0));
          return !prev;
        });
      }}
    >
      {otherSettings.showAsset && lastCandle?.asset && (
        <AssetLabel
          height={Number(height)}
          width={Number(width)}
          aoShown={otherSettings.ao}
        >
          {lastCandle.asset}
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
      >
        {displayedDate}
      </DateLabel>
      <OclhLabel canvasWidth={Number(width)} canvasHeight={Number(height)}>
        {displayedOclh &&
          Object.keys(displayedOclh).map((key) => (
            <p key={key}>
              {key.toUpperCase()}:{' '}
              {displayedOclh[key as keyof typeof displayedOclh].toFixed(2)}
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
      {otherSettings.ao && (
        <AoCanvas
          resizable={otherSettings.resizable}
          width={Number(width) * canvasSettings.scaleForQuality}
          height={(Number(height) * canvasSettings.scaleForQuality) / 5}
          ref={aoCanvasRef}
        />
      )}
    </Wrap>
  );
};

export default Canvas;
