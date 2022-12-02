import styled, { css } from 'styled-components';

import { canvasSettings } from '../config';
import type { Vector2 } from '../types';

export const Wrap = styled.div<{
  width: number;
  height: number;
  ao: boolean;
}>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height + (props.ao ? props.height / 5 + 5 : 0)}px;
  margin: 0 auto;
  position: relative;
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
  pointer-events: none;
  top: 0;
  left: 0;
`;
export const AssetLabel = styled.p<{
  height: number;
  width: number;
}>`
  height: ${(props) => props.height / 2}px;
  width: 100%;
  position: absolute;
  margin: 0;
  top: calc(50% - ${(props) => props.height / 4}px);

  line-height: ${(props) => props.height / 2}px;
  color: #fff;
  font-size: ${(props) => Math.sqrt(props.width) * 2.5}px;
  letter-spacing: ${(props) => Math.sqrt(props.width) * 0.15}px;
  text-align: center;
  font-weight: 100;

  opacity: 0.065;
  z-index: -2;
`;

export const AoCanvas = styled.canvas<{
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
  canvasHeight: number;
}>`
  pointer-events: none;
  width: ${(props) => Math.sqrt(props.canvasWidth) * 2.5 * 5}px;
  justify-content: space-between;
  display: flex;
  align-items: center;
  position: absolute;
  margin: 0;
  left: ${(props) => props.canvasHeight / 30}px;
  top: ${(props) => props.canvasHeight / 40}px;

  p {
    width: ${(props) => Math.sqrt(props.canvasWidth) * 2.5}px;
    white-space: nowrap;
    color: white;
    opacity: 0.65;
    margin: 0;
    font-weight: 200;
    font-size: ${(props) => Math.sqrt(props.canvasWidth) / 2}px;
  }
`;
export const DateLabel = styled.p<{
  height: number;
  width: number;
  cursor: Vector2;
  ao: boolean;
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
  bottom: ${(props) => props.height / 40 + (props.ao ? props.height / 5 : 0)}px;
  color: gray;
  font-size: ${(props) => props.height / 30}px;
  font-weight: 200;
`;
