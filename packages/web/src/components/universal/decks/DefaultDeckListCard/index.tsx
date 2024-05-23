import React, { memo } from 'react';
import styled from 'styled-components';
import { entities } from '@as-lab/core';

import { getColor } from '../../../../utils/color';
import { uiColorMap } from '../../../../constants';
import { Grid } from '../..';
import { TeamCard } from './TeamCard';

const Teams = Object.values(entities.Deck.Team);

interface Props {
  userDeck: entities.UserDeck;
  brief?: boolean;
}

export const DefaultDeckListCard = memo(Component);

function Component({ userDeck: { title, cards, accessories }, brief = false }: Props) {
  const spCardIdSet = new Set(cards.slice(3, 6).map((card) => card.cardId));

  return (
    <StyledDiv>
      <Title>{title}</Title>
      <Grid columns="repeat(3, 1fr)" gap="1rem">
        {Teams.map((team) => (
          <TeamCard
            key={team}
            team={team}
            cards={cards.filter((card) => card.team === team)}
            accessories={brief ? null : accessories.filter((accessory) => accessory.team === team)}
            spCardIdSet={spCardIdSet}
          />
        ))}
      </Grid>
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  cursor: pointer;
  position: relative;
  height: 100%;
  padding: 1.5rem;
  background: ${getColor(uiColorMap.white)};
  border-radius: 0.5rem;
  box-shadow: 0 0.1rem 0.75rem 0 ${getColor(uiColorMap.black, 700, 0.4)};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0.25rem 0.5rem 2rem 0 ${getColor(uiColorMap.black, 700, 0.6)};
  }
`;

const Title = styled.h3`
  color: ${getColor(uiColorMap.black)};
`;
