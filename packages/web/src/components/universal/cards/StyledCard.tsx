import styled from 'styled-components';
import React, { memo } from 'react';
import { FaLightbulb } from 'react-icons/fa';
import { entities } from '@as-lab/core';

import { CardContainer } from './CardContainer';
import { Display, getCardImageUrl, getCardTitle, getColor } from '../../../utils';
import { Flex } from '../Flex';
import { OnClickType } from './SchoolIdolCard';
import { uiColorMap } from '../../../constants';

export interface InspirationSkill {
  id: entities.Skill['id'];
  rank: string;
  target: string;
  condition: string;
  slug: string;
}

interface Props {
  idol: entities.Idol;
  card: entities.Card;
  userCard: entities.UserCard;
  team?: entities.Deck.Team;
  inspirationSkillMap: Map<string, InspirationSkill>;
  onClick?: (cardId: string, type: OnClickType) => void;
  selected?: boolean;
}

export const StyledCard = memo(Component);

export function Component({ idol, card, userCard, team, inspirationSkillMap, onClick, selected }: Props) {
  return (
    <CardContainer
      id={card.id}
      rarity={card.rarity}
      attribute={card.attribute}
      type={card.type}
      imgSrc={getCardImageUrl(card.id)}
      title={getCardTitle(card, idol, Display.Evolution)}
      appeal={userCard.appeal}
      stamina={userCard.stamina}
      technique={userCard.technique}
      onClick={onClick}
      team={team}
      selected={selected}
    >
      <Flex padding="0.5rem 0 0" justify="flex-start" align="flex-start">
        <Flex direction="column">
          {userCard.inspirationSkillIds.map((id, index) => {
            const skill = inspirationSkillMap.get(id);
            return (
              skill && (
                <SkillContainer key={`${id}-${index}`} align="flex-start">
                  <FaLightbulb color={getColor(uiColorMap.black, 700)} />
                  <SkillText>
                    {`${skill.slug}[${skill.rank}]${
                      /(パッシブ|発動確率)/.test(skill.condition)
                        ? `${skill.target === 'なし' ? '' : `:${skill.target}`}`
                        : `:${skill.condition}${skill.target === 'なし' ? '' : `/${skill.target}`}`
                    }
                    `}
                  </SkillText>
                </SkillContainer>
              )
            );
          })}
        </Flex>
      </Flex>
    </CardContainer>
  );
}

const SkillText = styled.p`
  flex: 1;
  margin 0 0 0 0.25rem;
  color: ${getColor(uiColorMap.black, 300)};
  font-size: 0.8rem;
  line-height: 1.5;
`;

const SkillContainer = styled(Flex)`
  width: 100%;
  margin: 0.5rem 0 0;
`;
