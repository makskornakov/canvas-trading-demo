import styled, { css } from 'styled-components';

export const Wrap = styled.div<{
  width: number;
}>`
  width: ${(props) => props.width}px;
  height: auto;
  margin: 0 auto;
  outline: 1px solid blue;
`;
const canvasStyles = css`
  outline: 0.5px solid red;
  margin: 0 auto;
  padding: 0;
`;
export const MainCanvas = styled.canvas<{
  width: number;
  height: number;
}>`
  ${canvasStyles}
  width: ${(props) => props.width / 3}px;
  height: ${(props) => props.height / 3}px;
`;
export const AlligatorCanvas = styled.canvas<{
  width: number;
  height: number;
}>`
  ${canvasStyles}
  width: ${(props) => props.width / 3}px;
  height: ${(props) => props.height / 3}px;
`;
