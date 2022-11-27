import React, { useEffect, useRef } from 'react';
import { Candle2D, CandleCanvas } from './draw';

type CanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
> & {
  draw: (
    ctx: CanvasRenderingContext2D,
    candlesArray: Candle2D[],
    canvas: CandleCanvas
  ) => void;
} & {
  canvas: CandleCanvas;
};

const Canvas: React.FC<CanvasProps> = ({ draw, ...props }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx, props.canvas.candleArray, props.canvas);
  }, [draw, props.canvas.candleArray, props.canvas]);

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
