import styled, { css } from 'styled-components';

import { canvasSettings } from '../config';
import type { Vector2 } from '../types';

export const Wrap = styled.div<{
  width: number;
  height: number;
  ao: boolean;
  stdev: boolean;
  resizable: boolean;
  fullscreen: boolean;
}>`
  // add some padding on top to fit the labels easily
  /* padding-top: ${(props) => Math.sqrt(props.height) * 1.5}px; */
  width: ${(props) => props.width}px;
  height: ${(props) =>
    props.height +
    (props.ao ? props.height / 5 + 5 : 0) +
    (props.stdev ? props.height / 5 + 5 : 0)}px;

  font-family: '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  margin: 0 auto;
  position: relative;

  ${({ resizable }) =>
    resizable &&
    css`
      resize: both;
      /* The property below is needed so that the resize icon is visible. */
      overflow: hidden;
    `}

  ${({ fullscreen }) =>
    fullscreen &&
    css`
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      background-color: #111;
      height: 100%;
      width: 100%;
    `}
`;

const labelStyles = css`
  pointer-events: none;
  position: absolute;
  margin: 0;
  color: gray;
`;

const canvasStyles = css`
  margin: 0 auto;
  padding: 0;
  background: transparent;
  cursor: crosshair;
  font-family: inherit;
`;

export const MainCanvas = styled.canvas<{
  width: number;
  height: number;
  resizable: boolean;
}>`
  ${canvasStyles}
  width: ${(props) => props.width / canvasSettings.scaleForQuality}px;
  height: ${(props) => props.height / canvasSettings.scaleForQuality}px;

  :active {
    cursor: grabbing;
    ${({ resizable }) =>
      resizable &&
      css`
        /* This is a hack to make the resize icon clickable. */
        border-bottom-right-radius: 50px;
      `}
  }
`;
export const CursorCanvas = styled.canvas<{
  width: number;
  height: number;
}>`
  ${canvasStyles}
  ${labelStyles}
  width: ${(props) => props.width / canvasSettings.scaleForQuality}px;
  height: ${(props) => props.height / canvasSettings.scaleForQuality}px;
  top: 0;
  left: 0;
`;

export const AssetLabel = styled.p<{
  height: number;
  width: number;
  aoShown: boolean;
  opacity: number;
}>`
  ${labelStyles}
  height: ${(props) => props.height / 2}px;
  width: 100%;

  top: calc(50% - ${(props) => props.height / 4 + (props.aoShown ? props.height / 10 + 2.5 : 0)}px);

  line-height: ${(props) => props.height / 2}px;
  height: ${(props) => props.height / 2}px;
  color: #fff;
  font-size: ${(props) => Math.sqrt(props.width) * 2.5}px;
  letter-spacing: ${(props) => Math.sqrt(props.width) * 0.15}px;
  text-align: center;
  font-weight: 100;
  opacity: ${(props) => props.opacity};
`;

export const AoCanvas = styled.canvas<{
  width: number;
  height: number;
  resizable: boolean;
}>`
  ${canvasStyles};
  width: ${(props) => props.width / canvasSettings.scaleForQuality}px;
  height: ${(props) => props.height / canvasSettings.scaleForQuality}px;

  ${({ resizable }) =>
    resizable &&
    css`
      /* This makes the resize icon larger for easier click */
      pointer-events: none;
    `}
`;

export const PriceLabel = styled.p<{
  height: number;
  cursor: Vector2;
}>`
  ${labelStyles}
  top: ${(props) => {
    const above = props.cursor.y < props.height / 2;
    const minimumTopPosition = props.height / 50;
    return Math.max(props.cursor.y - (above ? 0 : props.height / 16), minimumTopPosition);
  }}px;

  right: ${(props) => props.height / 50}px;
  font-size: ${(props) => props.height / 25}px;
  font-weight: 200;
`;

export const OclhLabel = styled.div<{
  canvasWidth: number;
  canvasHeight: number;
}>`
  ${labelStyles}
  /* width: ${(props) => Math.sqrt(props.canvasWidth) * 2.5 * 6}px; */
  /* justify-content: space-between; */
  column-gap: ${(props) => Math.sqrt(props.canvasWidth) / 5}px;
  display: flex;
  align-items: center;
  left: ${(props) => props.canvasHeight / 30}px;
  top: ${(props) => props.canvasHeight / 40}px;
  /* font-size: ${(props) => Math.sqrt(props.canvasWidth) / 2}px; */
  opacity: 0.7;

  > p {
    width: ${(props) => (Math.sqrt(props.canvasWidth) / 2) * 5.3}px;
    white-space: nowrap;
    color: white;
    margin: 0;
    margin-top: 1px; //? make it look a little bit better
    font-weight: 400;
    /* outline: 1px solid red; */
    display: flex;
    column-gap: ${(props) => Math.sqrt(props.canvasWidth) / 10}px;
    flex-direction: row;

    font-size: ${(props) => Math.sqrt(props.canvasWidth) / 2.3}px;
  }
  span {
    font-weight: 400;
    width: ${(props) => Math.sqrt(props.canvasWidth) * 5.5}px;
    /* outline: 1px solid red; */
    color: white;
    font-size: ${(props) => Math.sqrt(props.canvasWidth) / 2}px;
  }
`;

export const DateLabel = styled.p<{
  height: number;
  width: number;
  cursor: Vector2;
  ao: boolean;
  stdev: boolean;
}>`
  ${labelStyles}
  ${(props) => {
    const isOnTheRight = props.cursor.x < props.width / 2;
    const side = isOnTheRight ? 'left' : 'right';

    const minimumSidePosition = props.width / 50;
    const offset = isOnTheRight ? props.cursor.x : props.width - props.cursor.x;
    return css`
      ${side}: ${Math.max(offset + props.height / 40, minimumSidePosition)}px;
    `;
  }}
  bottom: ${(props) =>
    props.height / 40 + (props.ao ? props.height / 5 : 0) + (props.stdev ? props.height / 5 : 0)}px;
  font-size: ${(props) => props.height / 30}px;
  font-weight: 200;
`;

export const AOCanvasNameLabel = styled.p<{
  height: number;
  width: number;
  // stdev: boolean;
}>`
  ${labelStyles}

  bottom: ${(props) => props.height / 5 - props.height / 30}px;
  left: ${(props) => props.width / 150}px;
  font-size: ${(props) => props.height / 30}px;
  font-weight: 400;
`;

export const StdevCanvasNameLabel = styled.p<{
  height: number;
  width: number;
  aoShown: boolean;
}>`
  ${labelStyles}

  bottom: ${(props) => (props.height / 5) * (props.aoShown ? 2 : 1) - props.height / 30}px;
  left: ${(props) => props.width / 150}px;
  font-size: ${(props) => props.height / 30}px;
  font-weight: 400;
`;
