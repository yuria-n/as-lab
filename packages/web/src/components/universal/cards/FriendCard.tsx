import React, { memo, useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaBurn, FaLightbulb } from 'react-icons/fa';

import { entities, utils } from '@as-lab/core';

import { Gradient, gradientMap, rankMap, uiColorMap } from '../../../constants';
import { useCard, useCondition, useInspirationSkill, useSkill } from '../../../hooks';
import { Flex } from '../Flex';
import { getCardImageUrl, getColor } from '../../../utils';
import { Grid } from '..';

interface InspirationSkill {
  id: entities.Skill['id'];
  rank: string;
  target: string;
  condition: string;
  slug: string;
}

interface Props {
  userFriend: entities.UserFriend;
  onClick: (id: Id) => void;
}

export const FriendCard = memo(Component);

function Component({ onClick, userFriend: { id, name, card } }: Props) {
  const [inspirationSkillMap, setInspirationSkillMap] = useState(new Map<string, InspirationSkill>());

  const { cardMap, getCards } = useCard();
  const { skillMap, getSkillMap, skillTargetTitleMap, getSkillTargetTitleMap } = useSkill();
  const { inspirationSkills, getInspirationSkills } = useInspirationSkill();
  const { conditions, getConditions } = useCondition();

  useEffect(() => {
    getCards();
    getSkillMap();
    getInspirationSkills();
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

  const masterCard = cardMap.get(card.id);

  if (!masterCard) {
    return <div />;
  }

  const { rarity, personalSkills } = masterCard;
  const imgSrc = getCardImageUrl(card.id);

  return (
    <StyledDiv data-value={id} onClick={(e) => onClick(e.currentTarget.dataset.value!)}>
      <RarityLabel gradient={gradientMap[rarity]}>{rarity}</RarityLabel>

      <Grid style={{ height: '100%' }} rows="auto auto 1fr">
        <Flex padding="1rem 1rem 0" justify="flex-start">
          <StyledImg height={48} alt={card.id} src={imgSrc} />
          <StyledH3>{name.length ? name : id}</StyledH3>
        </Flex>

        <Flex padding="0.5rem 1rem 1rem" justify="flex-start" align="flex-start">
          {personalSkills.map(({ skillId }) => {
            const skill = skillMap.get(skillId);
            if (!skill) {
              return null;
            }
            const target = skill ? skillTargetTitleMap[skill.target] : 'なし';
            const condition = skill ? conditions.find(({ type }) => type === skill.condition) : null;
            const conditionTitle = condition?.title ?? '';
            return (
              <SkillContainer key={skillId} align="flex-start">
                <FaBurn color={getColor(uiColorMap.black, 700)} />
                <SkillText>
                  {`${skill.slug}${
                    /(パッシブ|発動確率)/.test(conditionTitle)
                      ? `${target === 'なし' ? '' : ` : ${target}`}`
                      : ` / ${conditionTitle}${target === 'なし' ? '' : ` : ${target}`}`
                  }`}
                </SkillText>
              </SkillContainer>
            );
          })}
        </Flex>

        {card.inspirationSkillIds.some((id) => id.length > 0) && (
          <BottomHalf padding="0.5rem 1rem 1rem" justify="flex-start" align="flex-start">
            <Flex direction="column">
              {card.inspirationSkillIds.map((id, index) => {
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
          </BottomHalf>
        )}
      </Grid>
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  cursor: pointer;
  position: relative;
  height: 100%;
  padding: 0;
  background: ${getColor(uiColorMap.white)};
  border-radius: 0.5rem;
  box-shadow: 0 0.1rem 0.75rem 0 ${getColor(uiColorMap.black, 700, 0.4)};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0.25rem 0.5rem 2rem 0 ${getColor(uiColorMap.black, 700, 0.6)};
  }
`;

interface RarityLabelProps {
  gradient: Gradient;
}

const RarityLabel = styled.span`
  z-index: -1;
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.75rem 0.75rem 3rem 3.25rem;
  color: ${getColor(uiColorMap.white)};
  font-size: 1rem;
  font-weight: bolder;
  text-transform: uppercase;
  background: ${({ gradient }: RarityLabelProps) =>
    `linear-gradient(150deg, ${gradient[0]} 0%, ${gradient[1]} 50%, ${gradient[2]} 100%)`};
  border-radius 0 0.5rem 0 0;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 0;
    border-bottom: 5.5rem solid ${getColor(uiColorMap.white)};
    border-right: 7rem solid transparent;
  }
`;

const StyledImg = styled.img`
  margin: 0 0.5rem auto 0;
  background: ${getColor(uiColorMap.black, 900)};
`;

const StyledH3 = styled.h3`
  flex: 1;
  margin: 0;
  color: ${getColor(uiColorMap.black)};
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1.5;
`;

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

const BottomHalf = styled(Flex)`
  background: ${getColor(uiColorMap.black, 700, 0.1)};
`;
