import styled from 'styled-components';
import React, { memo, useMemo } from 'react';
import { AiFillPushpin } from 'react-icons/all';
import { Container, Grid } from 'semantic-ui-react';
import { entities } from '@as-lab/core';

import { Card } from '../cards';
import { OnClickType } from '../cards/SchoolIdolCard';
import { getColor } from '../../../utils';
import { spColor, teamNum, uiColorMap } from '../../../constants';

export const DeckCards = memo(Component);

interface Props {
  userCards: entities.UserCard[];
  deckCards: (entities.Deck.Card | null)[];
  pinned?: boolean[];
  onClick: (index: number, type?: OnClickType) => void;
}

function Component({ userCards, deckCards, pinned, onClick }: Props) {
  const userCardMap = useMemo(() => new Map(userCards.map((userCard) => [userCard.id, userCard])), [userCards]);
  const onClicks = useMemo(
    () => deckCards.map((_, index) => (__: string, type?: OnClickType) => onClick(index, type)),
    [deckCards, onClick],
  );

  return (
    <Container fluid>
      <Grid stackable columns={teamNum} stretched>
        {deckCards.map((deckCard, index) => {
          const pin = pinned?.[index] ?? false;
          return (
            <Grid.Column key={index} stretched>
              {pin && (
                <Pin>
                  <AiFillPushpin />
                </Pin>
              )}
              <StyledBorder pinned={Number(pin)} sp={Number(Math.floor(index / 3) === 1)}>
                <Card
                  userCard={userCardMap.get(deckCard?.cardId ?? '')}
                  team={deckCard?.team}
                  onClick={onClicks[index]}
                />
              </StyledBorder>
            </Grid.Column>
          );
        })}
      </Grid>
    </Container>
  );
}

const Pin = styled.span`
  z-index: 1;
  position: absolute;
  top: 0;
  left: calc((100% - 2rem) / 2);

  svg {
    color: ${getColor(uiColorMap.black)};
    font-size: 2rem;
    transition: all 0.3s ease;
  }
`;

interface StyledBorderProps {
  pinned: number;
  sp: number;
}

const StyledBorder = styled(Grid.Column)`
  margin: -0.5rem;
  background: ${({ pinned }: StyledBorderProps) => (pinned ? getColor(uiColorMap.black, 700, 0.15) : '')};
  border: 0.75rem solid ${({ sp }: StyledBorderProps) => (sp ? getColor(spColor, 100, 0.6) : getColor(spColor, 100, 0))};
  border-radius: 1rem;
`;
