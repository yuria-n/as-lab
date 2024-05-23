import styled from 'styled-components';
import { FaArrowRight } from 'react-icons/fa';
import { entities } from '@as-lab/core';
import { memo } from 'react';

import { Card, Grid, GridItem } from '../../../universal';
import { getColor } from '../../../../utils';
import { uiColorMap } from '../../../../constants';

export interface SyncCardProps {
  prev: entities.UserCard | null;
  next: entities.UserCard;
  selected: boolean;
  onClick: () => void;
}

export const SyncCard = memo(Component);

function Component({ prev, next, selected, onClick }: SyncCardProps) {
  return (
    <StyledGrid
      columns="1fr auto 1fr"
      justify="stretch"
      align="stretch"
      gap="3rem 1rem"
      selected={selected}
      onClick={onClick}
    >
      <GridItem>
        <Card userCard={prev} />
      </GridItem>
      <StyledIcon>
        <FaArrowRight className="arrow" />
      </StyledIcon>
      <GridItem>
        <Card userCard={next} />
      </GridItem>
    </StyledGrid>
  );
}

interface StyledGridProps {
  selected: boolean;
}

const StyledGrid = styled(Grid)<StyledGridProps>`
  cursor: pointer;
  padding: 0.75rem;
  margin: 0.5rem 0;
  background: ${({ selected }) =>
    selected ? `${getColor(uiColorMap.magenta, 100, 0.15)}` : `${getColor(uiColorMap.white)}`};
  border-radius: 0.5rem;
  transition: 0.3s;

  &:hover {
    background: ${getColor(uiColorMap.magenta, 100, 0.15)};
  }
`;

const StyledIcon = styled(GridItem)`
  color: ${getColor(uiColorMap.magenta)};
  align-self: center;
`;
