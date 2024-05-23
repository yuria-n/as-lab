import { entities } from '@as-lab/core';
import { useCallback, useEffect, useState } from 'react';

import { CardService } from '../services';
import { useAsync } from './async';
import { useObject } from './object';

export type CardMap = Map<entities.Card['id'], entities.Card>;

export function useCard() {
  const [cardMap, setCardMap] = useState<CardMap>(new Map());
  const [cards, setCards] = useState<entities.Card[]>([]);
  const { runAsync } = useAsync();

  useEffect(() => {
    setCardMap(new Map(cards.map((card) => [card.id, card])));
  }, [cards]);

  const getCards = useCallback(() => {
    runAsync(async () => {
      const cards = await CardService.getCards();
      setCards(cards);
    });
  }, [runAsync]);

  return useObject({ cards, cardMap, getCards });
}
