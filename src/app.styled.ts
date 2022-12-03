import styled, { css } from 'styled-components';

export const Header = styled.h1`
  color: white;
  font-size: 1.5em;
  text-align: center;
  margin-top: 30px;
  font-weight: 300;
`;
export const Wrap = styled.div`
  margin: 30px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
  width: 1300px;
`;
export const ControlWrap = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 650px;
  margin: 0 auto;
`;

export const ReadmeLink = styled.a`
  color: white;
  font-size: 0.9em;
  text-decoration: none;
  position: absolute;
  top: 1em;
  right: 1.5em;
  margin: 0;
  font-weight: 300;
  transition: 0.2s;
  transition-property: color;

  &:hover {
    color: #6bc800;
  }
`;

const buttonStyles = css`
  border: 1px solid white;
  background-color: transparent;
  border-radius: 5px;
  color: white;
  font-size: 12px;
  transition-duration: 0.4s;
  font-weight: 400;
  cursor: pointer;
  transition-property: background-color color;

  &:hover {
    background-color: white !important;
    color: black;
  }
`;
export const ControlButton = styled.button`
  ${buttonStyles}
  width: 80px;
  height: 30px;
`;
export const IndicatorButton = styled.button`
  ${buttonStyles}
  height: 25px;
  text-transform: capitalize;
`;
export const IndicatorWrap = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 7px;
`;
// use Header
export const Description = styled(Header)`
  font-size: 1em;
  margin: 0;
`;
