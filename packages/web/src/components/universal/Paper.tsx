import React from 'react';
import styled from 'styled-components';

import { uiColorMap } from '../../constants';
import { getColor } from '../../utils';

type Div = JSX.IntrinsicElements['div'];
interface Props extends Omit<Div, 'ref'> {
  margin?: string;
}

export function Paper({ children, ...props }: Props) {
  return <StyledPaper {...props}>{children}</StyledPaper>;
}

const StyledPaper = styled.div<Props>`
  width: 100%;
  margin: ${({ margin }) => margin ?? 'auto'};
  padding: 2rem;
  background: ${getColor(uiColorMap.white)};
  border-radius: 0.5rem;
  box-shadow: 0 0.1rem 0.75rem 0 ${getColor(uiColorMap.black, 700, 0.4)};
`;
