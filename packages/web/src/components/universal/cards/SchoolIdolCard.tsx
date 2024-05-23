import React, { memo } from 'react';
import { entities } from '@as-lab/core';

import { DefaultCard } from './DefaultSchoolIdolCard';
import { PlaceholderCard } from './PlaceholderCard';

export enum OnClickType {
  Select = 'select',
  Detail = 'detail',
}

interface Props {
  userCard?: entities.UserCard | null;
  team?: entities.Deck.Team;
  onClick?: (cardId: string, type?: OnClickType) => void;
  selected?: boolean;
}

export const Card = memo(Component);

function Component({ userCard, team, onClick, selected }: Props) {
  return userCard ? (
    <DefaultCard userCard={userCard} team={team} onClick={onClick} selected={selected} />
  ) : (
    <PlaceholderCard onClick={onClick} />
  );
}
