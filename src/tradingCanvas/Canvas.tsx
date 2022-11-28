import { useEffect, useRef, useState } from 'react';

import { CandleCanvas } from './classes/CandleCanvas';
import { drawAo, drawFunction } from './draw';
import { scrollZoom } from './functions';
import { CandleToDraw } from './types';

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
  const aoCanvasRef = useRef<HTMLCanvasElement>(null);

  const [width, setWidth] = usePropState(props.width);
  const [height, setHeight] = usePropState(props.height);
  const [candlesShown, setCandlesShown] = usePropState(candlesShownProp);
  const [candleArray, setCandleArray] = usePropState(candleArrayProp);
  const [shift, setShift] = usePropState(shiftProp);

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
      e.stopPropagation();
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <canvas
        {...props}
        style={{
          outline: '0.5px solid red',
          width: props.width,
          height: props.height,
        }}
        width={Number(props.width) * 3}
        height={Number(props.height) * 3}
        ref={canvasRef}
      />
      <canvas
        width={Number(props.width) * 3}
        height={(Number(props.height) * 3) / 5}
        style={{
          width: props.width,
          height: `${Number(props.height) / 5}`,
          outline: '0.5px solid black',
        }}
        ref={aoCanvasRef}
      />
    </div>
  );
};

export default Canvas;
