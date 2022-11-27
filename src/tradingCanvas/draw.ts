import { CandleCanvas } from './classes/CandleCanvas';
import { Candle2D } from './classes/CandleClasses';

export const drawFunction = (
  ctx: CanvasRenderingContext2D,
  candlesArray: Candle2D[],
  canvas: CandleCanvas
) => {
  // clear ctx
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  candlesArray.forEach((candle, index) => {
    if (candle.noDraw) return;
    const x = index * (canvas.candleWidth + canvas.gap);
    const candleIsRed = candle.open < candle.close;
    const y = candleIsRed ? candle.open : candle.close;

    // draw candle
    ctx.beginPath();
    ctx.rect(
      x,
      y,
      canvas.candleWidth,
      candleIsRed ? candle.close - candle.open : candle.open - candle.close
    );
    ctx.fillStyle = candleIsRed ? 'red' : 'green';
    ctx.fill();
    ctx.closePath();

    // draw wick
    ctx.beginPath();
    // line thickness
    ctx.lineWidth = canvas.candleWidth / 6;
    ctx.moveTo(x + canvas.candleWidth / 2, candle.high);
    ctx.lineTo(x + canvas.candleWidth / 2, candle.low);
    ctx.strokeStyle = candleIsRed ? 'red' : 'green';
    ctx.stroke();
    ctx.closePath();

    // draw indicators
    drawMountedIndicators(ctx, candle, x, canvas.candleWidth);
  });

  // draw alligator
  drawCurveLine(
    ctx,
    canvas.alligatorArray.jaw,
    'blue',
    canvas.candleWidth / 10
  );
  drawCurveLine(
    ctx,
    canvas.alligatorArray.teeth,
    'red',
    canvas.candleWidth / 10
  );
  drawCurveLine(
    ctx,
    canvas.alligatorArray.lips,
    'green',
    canvas.candleWidth / 10
  );
};
function drawCurveLine(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  color: string,
  lineWidth: number
) {
  // ctx.moveTo(0, candlesArray[0].alligator.jaw);
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  for (const point of points) {
    const xMid = (point.x + point.x) / 2;
    const yMid = (point.y + point.y) / 2;
    const cpX1 = (xMid + point.x) / 2;
    const cpX2 = (xMid + point.x) / 2;
    ctx.quadraticCurveTo(cpX1, point.y, xMid, yMid);
    ctx.quadraticCurveTo(cpX2, point.y, point.x, point.y);
  }
  ctx.stroke();
  ctx.closePath();
}
function drawMountedIndicators(
  ctx: CanvasRenderingContext2D,
  candle: Candle2D,
  x: number,
  candleWidth: number
) {
  const arr = [
    candle.mountPoints.above.first,
    candle.mountPoints.above.second,
    candle.mountPoints.below.first,
    candle.mountPoints.below.second,
  ];
  arr.forEach((indicator, i) => {
    if (indicator !== null) {
      if (indicator.type === 'revBar') {
        drawRevBar(
          ctx,
          x,
          indicator.yPos,
          indicator.value as 'buy' | 'sell',
          candleWidth
        );
      } else if (indicator.type === 'fractal') {
        drawFractal(
          ctx,
          x,
          indicator.yPos,
          indicator.value as 'up' | 'down',
          candleWidth
        );
      }
    }
  });
}
function drawRevBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: 'buy' | 'sell',
  candleWidth: number
) {
  ctx.beginPath();
  ctx.arc(x + candleWidth / 2, y, candleWidth / 3, 0, 2 * Math.PI);
  ctx.fillStyle = type === 'buy' ? 'green' : 'red';
  ctx.fill();
  ctx.closePath();
}
function drawFractal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: 'up' | 'down',
  candleWidth: number
) {
  ctx.beginPath();
  ctx.moveTo(x - candleWidth / 2, y);

  const toY = type === 'up' ? y - candleWidth * 1.5 : y + candleWidth * 1.5;
  ctx.lineTo(x + candleWidth / 2, toY);
  ctx.lineTo(x + candleWidth * 1.5, y);

  ctx.fillStyle = type === 'up' ? 'green' : 'red';
  ctx.fill();
  ctx.closePath();
}
