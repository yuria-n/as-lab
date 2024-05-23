import React, { memo, useCallback, useMemo, useState } from 'react';
import { Pagination, PaginationProps } from 'semantic-ui-react';
import { entities } from '@as-lab/core';

import { Card, CardGrid, Grid, NewCard } from '../../universal';
import { HandleType, handleChange } from '../../../utils';

interface Props {
  userCards: entities.UserCard[];
  selectedUserCardIdSet: Set<entities.UserCard['id']>;
  onClick: (cardId: string) => void;
  onNewClick: () => void;
  disabledNew: boolean;
}

export const CardList = memo(Component);

function Component({ userCards, onClick, onNewClick, disabledNew, selectedUserCardIdSet }: Props) {
  const [activePage, setActivePage] = useState(1);

  const slicedUserCards = useMemo(() => {
    const index = maxPageItem * (activePage - 1);
    return userCards.slice(index, index + maxPageItem);
  }, [userCards, activePage]);
  const onTablePageChange = useCallback(
    (_, data: PaginationProps) => handleChange(HandleType.Number, setActivePage)(data.activePage),
    [setActivePage],
  );
  const tableTotalPages = useMemo(() => Math.ceil(userCards.length / maxPageItem), [userCards]);

  return (
    <>
      <CardGrid>
        {!disabledNew && <NewCard text="新しいカードを追加" onClick={onNewClick} />}
        {slicedUserCards.map((userCard) => (
          <Card
            key={userCard.id}
            userCard={userCard}
            onClick={onClick}
            selected={selectedUserCardIdSet.has(userCard.id)}
          />
        ))}
      </CardGrid>
      <Grid justifyContent="center">
        <Pagination activePage={activePage} onPageChange={onTablePageChange} totalPages={tableTotalPages} />
      </Grid>
    </>
  );
}

const maxPageItem = 24 - 1;
