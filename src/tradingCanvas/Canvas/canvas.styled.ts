import styled, { css } from 'styled-components';
import { canvasSettings } from '../config';

export const Wrap = styled.div<{
  width: number;
}>`
  width: ${(props) => props.width}px;
  height: auto;
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
export const AlligatorCanvas = styled.canvas<{
  width: number;
  height: number;
}>`
  ${canvasStyles};
  width: ${(props) => props.width / canvasSettings.scaleForQuality}px;
  height: ${(props) => props.height / canvasSettings.scaleForQuality}px;
`;
