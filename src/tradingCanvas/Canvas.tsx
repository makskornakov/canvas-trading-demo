import { useEffect, useRef, useState } from 'react';

import { CandleCanvas } from './classes/CandleCanvas';
import { drawFunction } from './draw';
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
    if (!canvas) return;
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
    if (!ctx) return;
    drawFunction(ctx, propsCanvas.candleArray, propsCanvas);
  }, [width, candlesShown, candleArray, shift, height]);

  return (
    <canvas
      {...props}
      style={{
        outline: '1px solid red',
        width: props.width,
        height: props.height,
      }}
      width={Number(props.width) * 3}
      height={Number(props.height) * 3}
      ref={canvasRef}
    />
  );
};

export default Canvas;
