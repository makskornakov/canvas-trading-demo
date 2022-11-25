import React, { useEffect, useRef } from 'react';

type CanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
> & { draw: (ctx: CanvasRenderingContext2D) => void };

const Canvas: React.FC<CanvasProps> = ({ draw, ...props }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx);
  }, [draw]);

  return (
    <canvas
      style={{
        outline: '1px solid red',
      }}
      width={props.width}
      height={props.height}
      ref={canvasRef}
    />
  );
};

export default Canvas;
