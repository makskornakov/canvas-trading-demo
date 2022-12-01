import styled from 'styled-components';

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
  width: 1200px;
`;
export const ControlWrap = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 450px;
  margin: 0 auto;
`;
export const ControlButton = styled.button`
  width: 80px;
  height: 30px;
  border: 1px solid white;
  background: transparent;
  border-radius: 5px;
  color: white;
  font-size: 12px;
  transition-duration: 0.4s;
  cursor: pointer;
  transition-property: background-color color;

  &:hover {
    background: white;
    color: black;
  }
`;
// use Header
export const Description = styled(Header)`
  font-size: 1em;
  margin: 0;
`;
