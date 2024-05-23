import React from 'react';
import styled from 'styled-components';

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

export function Tab({ children }: Props) {
  return <StyledNav>{children}</StyledNav>;
}

const StyledNav = styled.nav`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;
