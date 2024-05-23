import React, { useEffect, useState } from 'react';
import { entities } from '@as-lab/core';
import { mount, route } from 'navi';

import { DeckSupportSimulatorFilter } from './DeckSupportSimulatorFilter';
import { DeckSupportSimulatorForm } from './DeckSupportSimulatorForm';
import { DeckSupportSimulatorTable } from './DeckSupportSimulatorTable';
import { Page } from '../../../universal';
import { Path, deckSimulatorLinks, titleMap } from '../../../../constants';

export interface DeckSupportSimulatorCardFilter {
  attributeSet: Set<entities.Card.Attribute>;
  typeSet: Set<entities.Card.Type>;
  schoolSet: Set<entities.School>;
  gradeSet: Set<number>;
}

export default mount({
  '/': route({ view: <Component /> }),
});

function Component() {
  const [selectedCardIds, setSelectedCardIds] = useState<entities.UserCard['id'][]>([]);
  const [centerCardId, setCenterCardId] = useState('');
  const [filter, setFilter] = useState<DeckSupportSimulatorCardFilter>(defaultFilter);

  useEffect(() => {
    if (!centerCardId || selectedCardIds.length === 0) {
      setCenterCardId('');
      return;
    }
    if (selectedCardIds.some((id) => id === centerCardId)) {
      return;
    }
    setCenterCardId(selectedCardIds[0]);
  }, [selectedCardIds, centerCardId]);

  return (
    <Page
      title={title}
      links={deckSimulatorLinks}
      active={active}
      description="選択されたスクールアイドルと、相性の良いスクールアイドルを一覧で表示します。スコアやSPボルテージ獲得量などを最大化するための参考になれば幸いです。"
    >
      <DeckSupportSimulatorForm selectedCardIds={selectedCardIds} centerCardId={centerCardId} />
      <DeckSupportSimulatorFilter onChange={setFilter} />
      <DeckSupportSimulatorTable
        centerCardId={centerCardId}
        onCenterCardIdChange={setCenterCardId}
        selectedCardIds={selectedCardIds}
        onCardIdChange={setSelectedCardIds}
        filter={filter}
      />
    </Page>
  );
}

const title = `${titleMap[Path.Deck]}${titleMap[Path.Simulator]}`;
const active = `${Path.Simulator}${Path.Deck}${Path.Support}`;

const defaultFilter: DeckSupportSimulatorCardFilter = {
  attributeSet: new Set(Object.values(entities.Card.Attribute)),
  typeSet: new Set(Object.values(entities.Card.Type)),
  schoolSet: new Set(Object.values(entities.School)),
  gradeSet: new Set([entities.Grade.First, entities.Grade.Second, entities.Grade.Third]),
};
