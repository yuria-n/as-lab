import React, { memo, useEffect } from 'react';
import styled from 'styled-components';
import { Dropdown, DropdownItemProps } from 'semantic-ui-react';

import { entities } from '@as-lab/core';

import { InputLabel } from '../../../universal';
import { useCard, useIdol, useUserCard } from '../../../../hooks';
import { Display, getCardTitle } from '../../../../utils';

interface Props {
  cardId: string;
  setter: React.Dispatch<React.SetStateAction<string>>;
  filter?: boolean;
  edit?: boolean;
}

export const CardNameInput = memo(Component);

function Component({ cardId, setter, filter = false, edit = false }: Props) {
  const { userCards } = useUserCard();
  const { cards, getCards } = useCard();
  const { idols, getIdols } = useIdol();

  useEffect(() => {
    getCards();
    getIdols();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cardMap = new Map(cards.map((c) => [c.id, c]));
  const card = cardMap.get(cardId);

  const idolMap = new Map(idols.map((idol) => [idol.id, idol]));
  const idol = card ? idolMap.get(card.idolId) : null;

  const cardListMap: Map<entities.Idol['id'], DropdownItemProps[]> = new Map(idols.map(({ id }) => [id, []]));
  const userCardIdSet = new Set(userCards.map(({ id }) => id));
  for (const card of cards) {
    if ((filter && userCardIdSet.has(card.id)) || card.rarity === entities.Card.Rarity.R) {
      continue;
    }
    const idol = idolMap.get(card.idolId)!;
    cardListMap.get(card.idolId)?.push({
      key: `${card.idolId}-${card.id}`,
      value: card.id,
      text: getCardTitle(card, idol, Display.Both),
    });
  }

  const cardOptions: DropdownItemProps[] = [];
  for (const idol of idols) {
    const list = cardListMap.get(idol.id) ?? [];
    if (list.length) {
      cardOptions.push(...list);
    }
  }

  return (
    <>
      <InputLabel>カード名</InputLabel>
      {edit && card && idol ? (
        <Title>{getCardTitle(card, idol, Display.Both)}</Title>
      ) : (
        <Dropdown
          name="title"
          placeholder="カード名 (例: [はいからロマンス] 高坂 穂乃果)"
          fluid
          search
          selection
          options={cardOptions}
          value={cardId}
          onChange={(_, data) => setter(`${data.value}`)}
        />
      )}
    </>
  );
}

const Title = styled.h4`
  margin: 0 0 1rem;
`;
