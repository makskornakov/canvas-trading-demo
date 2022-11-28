import styled, { css } from 'styled-components';

export const Wrap = styled.div<{
  width: number;
}>`
  width: ${(props) => props.width}px;
  height: auto;
  margin: 0 auto;
  outline: 0.5px solid white;
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
  width: ${(props) => props.width / 3}px;
  height: ${(props) => props.height / 3}px;
`;
export const AlligatorCanvas = styled.canvas<{
  width: number;
  height: number;
}>`
  ${canvasStyles};
  width: ${(props) => props.width / 3}px;
  height: ${(props) => props.height / 3}px;
`;
