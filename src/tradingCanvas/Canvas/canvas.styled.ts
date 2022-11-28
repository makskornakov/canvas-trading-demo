import styled, { css } from 'styled-components';
import { canvasSettings } from '../config';

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
  size: number;
}>`
  position: absolute;
  margin: 0;
  top: ${(props) => props.size / 50}px;
  right: ${(props) => props.size / 50}px;
  color: gray;
  font-size: ${(props) => props.size / 20}px;
  font-weight: 200;
`;
