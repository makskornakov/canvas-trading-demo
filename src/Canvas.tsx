import React, { useEffect, useRef } from 'react';
import { CandleCanvas, CandleToDraw, drawFunction } from './draw';

type CanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
> & {
  candleArray: CandleToDraw[];
  candlesShown: number;
};

const Canvas: React.FC<CanvasProps> = ({ ...props }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const drawingCandles = props.candleArray.map(
      (candle) => candle as CandleToDraw
    );
    const propsCanvas = new CandleCanvas(
      Number(props.width),
      Number(props.height),
      props.candlesShown,
      drawingCandles
    );
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawFunction(ctx, propsCanvas.candleArray, propsCanvas);
  }, [props.candleArray, props.candlesShown, props.height, props.width]);

  return (
    <canvas
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
