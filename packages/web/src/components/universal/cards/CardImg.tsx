import React, { memo } from 'react';
import styled from 'styled-components';

import { entities } from '@as-lab/core';

import { getCardImageUrl, getColor } from '../../../utils';
import { uiColorMap } from '../../../constants';

export const CardImg = memo(Component);

interface Props {
  id: entities.Card['id'];
  className?: string;
}

function Component({ id, className }: Props) {
  const imagePath = getCardImageUrl(id);
  return <StyledImg className={className} src={imagePath} />;
}

export const StyledImg = styled.img`
  cursor: pointer;
  width: 5rem;
  height: 5rem;
  border: 2px solid;
  border-color: ${getColor(uiColorMap.black, 900)};
  border-radius: 8px;
`;
