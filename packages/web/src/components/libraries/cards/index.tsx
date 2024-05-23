import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { entities } from '@as-lab/core';

import { Analytics, LogType } from '../../../clients';
import { CardDialog, InfeedAd } from '../../universal';
import { CardSearchInput } from '../../universal/cards/CardSearchInput';
import { CardTableView } from './CardTableView';
import { useCard, useIdol, useSkill } from '../../../hooks';

export const Cards = memo(Component);

function Component() {
  const [selectedCardId, setSelectedCardId] = useState<entities.Card['id'] | null>(null);
  const [cards, setCards] = useState<entities.Card[]>([]);

  const { cards: allCards, getCards } = useCard();
  const { idolMap, getIdols } = useIdol();
  const { skillMap, getSkillMap } = useSkill();
  useEffect(() => {
    Analytics.logEvent(LogType.VisitLibraryCard);
    getCards();
    getIdols();
    getSkillMap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onClick = useCallback(
    (event: React.SyntheticEvent<any>) => setSelectedCardId(event.currentTarget?.dataset?.id ?? null),
    [setSelectedCardId],
  );

  return (
    <>
      <InfeedAd className="infeed-libary-cards" slot="7029329668" />

      <CardSearchInput cards={allCards} onChange={setCards} />
      <CardTableView cards={cards} idolMap={idolMap} skillMap={skillMap} onClick={onClick} />
      <CardDialog
        open={!!selectedCardId}
        card={useMemo(() => cards.find((card) => card.id === selectedCardId) ?? null, [cards, selectedCardId])}
        onClose={useCallback(() => setSelectedCardId(null), [setSelectedCardId])}
      />
    </>
  );
}
