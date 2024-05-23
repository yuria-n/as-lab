import React from 'react';
import styled from 'styled-components';

import { Grid } from '../Grid';

export function CardGrid({ children }: JSX.IntrinsicElements['div']) {
  return <StyledCardGrid gap="1rem">{children}</StyledCardGrid>;
}

const StyledCardGrid = styled(Grid)`
  grid-template-columns: 1fr;

  @media only screen and (min-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media only screen and (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media only screen and (min-width: 960px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;
