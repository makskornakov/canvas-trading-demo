import styled, { css } from 'styled-components';

import { canvasSettings } from '../config';
import type { Vector2 } from '../types';

export const Wrap = styled.div<{
  width: number;
  height: number;
}>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height + props.height / 5 + 5}px;
  margin: 0 auto;
  outline: 0.5px solid gray;
`;
const canvasStyles = css`
  margin: 0 auto;
  padding: 0;
  background: transparent;
  cursor: crosshair;
`;
export const MainCanvas = styled.canvas<{
  width: number;
  height: number;
}>`
  ${canvasStyles}
  width: ${(props) => props.width / canvasSettings.scaleForQuality}px;
  height: ${(props) => props.height / canvasSettings.scaleForQuality}px;
`;
export const CursorCanvas = styled.canvas<{
  width: number;
  height: number;
}>`
  ${canvasStyles}
  width: ${(props) => props.width / canvasSettings.scaleForQuality}px;
  height: ${(props) => props.height / canvasSettings.scaleForQuality}px;
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
`;
export const AlligatorCanvas = styled.canvas<{
  width: number;
  height: number;
}>`
  ${canvasStyles};
  width: ${(props) => props.width / canvasSettings.scaleForQuality}px;
  height: ${(props) => props.height / canvasSettings.scaleForQuality}px;
`;
export const PriceLabel = styled.p<{
  height: number;
  cursor: Vector2;
}>`
  pointer-events: none;
  position: absolute;
  margin: 0;
  top: ${(props) => {
    const above = props.cursor.y < props.height / 2;

    const minimumTopPosition = props.height / 50;

    return Math.max(
      props.cursor.y - (above ? 0 : props.height / 16),
      minimumTopPosition
    );
  }}px;
  right: ${(props) => props.height / 50}px;
  color: gray;
  font-size: ${(props) => props.height / 25}px;
  font-weight: 200;
`;
export const OclhLabel = styled.div<{
  canvasWidth: number;
}>`
  pointer-events: none;
  width: ${(props) => Math.sqrt(props.canvasWidth) * 2.5 * 5}px;
  justify-content: space-between;
  display: flex;
  align-items: center;
  position: absolute;
  margin: 0;
  left: 2%;

  p {
    width: ${(props) => Math.sqrt(props.canvasWidth) * 2.5}px;
    white-space: nowrap;
    color: white;
    opacity: 0.65;
    font-weight: 200;
    font-size: ${(props) => Math.sqrt(props.canvasWidth) / 2}px;
  }
`;
export const DateLabel = styled.p<{
  height: number;
  width: number;
  cursor: Vector2;
}>`
  pointer-events: none;
  position: absolute;
  margin: 0;
  ${(props) => {
    const isOnTheRight = props.cursor.x < props.width / 2;
    const side = isOnTheRight ? 'left' : 'right';

    const minimumSidePosition = props.width / 50;
    const offset = isOnTheRight ? props.cursor.x : props.width - props.cursor.x;
    return css`
      ${side}: ${Math.max(offset + props.height / 40, minimumSidePosition)}px;
    `;
  }}
  bottom: ${(props) => props.height / 5 + props.height / 40}px;
  color: gray;
  font-size: ${(props) => props.height / 30}px;
  font-weight: 200;
`;
