import { useEffect, useRef, useState } from 'react';
import {
  AlligatorCanvas,
  CursorCanvas,
  MainCanvas,
  PriceLabel,
  Wrap,
} from './canvas.styled';

import { CandleCanvas } from '../classes/CandleCanvas';
import { canvasSettings } from '../config';
import { drawAo, drawCursor, drawFunction } from '../draw';
import scrollZoom from '../scrollZoom';
import { CandleToDraw } from '../types';

type CanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
> & {
  candleArray: CandleToDraw[];
  candlesShown: number;
  shift: number;
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
  const [displayedPrice, setDisplayedPrice] = useState(0);

  const [cursor, setCursor] = useState({ x: 0, y: 0 });
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

    canvas.addEventListener('wheel', (e) => {
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
      return false;
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDisplayedPrice(propsCanvas.getDisplayedPrice(y));
      setCursor({ x, y });
    });
    canvas.onmouseleave = () => {
      setCursor({ x: 0, y: 0 });
    };

    const ctx = canvas.getContext('2d');
    const aoCtx = aoCanvas.getContext('2d');
    if (!ctx || !aoCtx) return;

    drawFunction(ctx, propsCanvas);
    drawAo(aoCtx, propsCanvas);
  }, [
    width,
    candlesShown,
    candleArray,
    shift,
    height,
    setShift,
    setCandlesShown,
  ]);

  // useEffect for cursor
  useEffect(() => {
    const canvas = cursorRef.current;
    // const aoCanvas = aoCanvasRef.current;
    if (!canvas) return;
    const cursorCtx = canvas.getContext('2d');
    if (!cursorCtx) return;
    drawCursor(cursorCtx, canvas.width, canvas.height, cursor);
  }, [width, height, cursor, candlesShown]);

  return (
    <Wrap
      width={Number(props.width)}
      height={Number(props.height)}
      style={{ position: 'relative' }}
    >
      <PriceLabel size={Number(props.height)}>{displayedPrice}</PriceLabel>
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
