import React from 'react';
import styled from 'styled-components';

import { getColor } from '../../utils';
import { uiColorMap } from '../../constants';

interface Props {
  count: number;
}

export function GachaResultPlaceholder({ count }: Props) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <StyledPlaceholder key={index} />
      ))}
    </>
  );
}

const StyledPlaceholder = styled.span`
  width: 5rem;
  height: 5rem;
  margin: 0 0.5rem 0.5rem 0;
  background: ${getColor(uiColorMap.black, 900)};
  border-radius: 4px;
`;
