import React, { memo, useEffect, useMemo, useState } from 'react';
import { entities, utils } from '@as-lab/core';

import { InspirationSkill, StyledCard } from './StyledCard';
import { OnClickType } from './SchoolIdolCard';
import { rankMap } from '../../../constants';
import { useCard, useCondition, useIdol, useInspirationSkill, useSkill } from '../../../hooks';

interface Props {
  userCard: entities.UserCard;
  team?: entities.Deck.Team;
  onClick?: (cardId: string, type: OnClickType) => void;
  selected?: boolean;
}

export const DefaultCard = memo(Component);

export function Component({ userCard, team, onClick, selected }: Props) {
  const [inspirationSkillMap, setInspirationSkillMap] = useState(new Map<string, InspirationSkill>());
  const { idols, getIdols } = useIdol();
  const { cards, getCards } = useCard();
  const { skillMap, getSkillMap, skillTargetTitleMap, getSkillTargetTitleMap } = useSkill();
  const { inspirationSkills, getInspirationSkills } = useInspirationSkill();
  const { conditions, getConditions } = useCondition();

  useEffect(() => {
    getIdols();
    getCards();
    getSkillMap();
    getSkillTargetTitleMap();
    getInspirationSkills();
    getConditions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      skillMap.size === 0 ||
      conditions.length === 0 ||
      inspirationSkills.length === 0 ||
      utils.isEmpty(skillTargetTitleMap)
    ) {
      return;
    }
    const conditionMap = new Map(conditions.map((condition) => [condition.type, condition]));
    const map = new Map(
      inspirationSkills
        .filter(({ skillId }) => skillMap.has(skillId))
        .map(({ id, skillId, rank }) => {
          const skill = skillMap.get(skillId)!;
          return [
            id,
            {
              id: skillId,
              rank: rankMap[rank],
              target: skillTargetTitleMap[skill.target] ?? '',
              condition: conditionMap.get(skill.condition)?.title ?? '',
              slug: skill.slug,
            },
          ];
        }),
    );
    setInspirationSkillMap(map);
  }, [skillMap, conditions, inspirationSkills, skillTargetTitleMap]);

  const card = useMemo(() => cards.find((card) => card.id === userCard.id), [cards, userCard]);
  const idol = useMemo(() => idols.find((idol) => idol.id === card?.idolId), [idols, card]);
  if (!card || !idol || inspirationSkillMap.size === 0) {
    return null;
  }
  return (
    <StyledCard
      idol={idol}
      card={card}
      team={team}
      userCard={userCard}
      inspirationSkillMap={inspirationSkillMap}
      onClick={onClick}
      selected={selected}
    />
  );
}
