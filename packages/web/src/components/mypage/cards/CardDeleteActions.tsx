import { FaCheck, FaTrash, FaUserMinus } from 'react-icons/fa';
import { entities } from '@as-lab/core';
import { memo, useCallback } from 'react';

import { Button, Grid } from '../../universal';
import { useUserCard } from '../../../hooks';

type CardIdSet = Set<entities.UserCard['id']>;

interface Props {
  edit: boolean;
  onEditChange: (edit: boolean) => void;
  cardIdSet: CardIdSet;
  onCardIdChange: (idSet: CardIdSet) => void;
  userCards: entities.UserCard[];
}

export const CardDeleteActions = memo(Component);

function Component({ edit, onEditChange, cardIdSet, onCardIdChange, userCards }: Props) {
  const { deleteUserCards } = useUserCard();

  const onEditClick = useCallback(() => {
    if (edit) {
      onCardIdChange(new Set());
    }
    onEditChange(!edit);
  }, [edit, onEditChange, onCardIdChange]);
  const onSelectAllClick = useCallback(
    () => onCardIdChange(new Set(cardIdSet.size === userCards.length ? [] : userCards.map((card) => card.id))),
    [onCardIdChange, cardIdSet, userCards],
  );
  const onDeleteClick = useCallback(() => {
    deleteUserCards(Array.from(cardIdSet));
    onEditClick();
  }, [cardIdSet, onEditClick, deleteUserCards]);

  if (!edit) {
    return (
      <Button onClick={onEditClick}>
        <FaUserMinus />
        カードを選択して削除
      </Button>
    );
  }

  return (
    <Grid columns="repeat(3, auto)" gap="0.5rem" justifyContent="end">
      <Button mode="secondary" onClick={onEditClick}>
        キャンセル
      </Button>
      <Button onClick={onSelectAllClick}>
        <FaCheck />
        一括選択
      </Button>
      <Button mode="danger" onClick={onDeleteClick} disabled={cardIdSet.size === 0}>
        <FaTrash />
        {`${cardIdSet.size}枚のカードを削除`}
      </Button>
    </Grid>
  );
}
