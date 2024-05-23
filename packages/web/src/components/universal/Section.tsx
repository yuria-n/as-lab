import React from 'react';
import styled from 'styled-components';

export function Section({ children }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>) {
  return <StyledSection>{children}</StyledSection>;
}

const StyledSection = styled.section`
  width: 100%;
  padding: 2rem 0;
`;
