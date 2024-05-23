import styled from 'styled-components';
import React, { MouseEvent, memo, useMemo } from 'react';
import { FaHeart, FaMicrophoneAlt, FaSmile } from 'react-icons/fa';
import { entities } from '@as-lab/core';

import { CardAttribute } from './CardAttribute';
import { CardType } from './CardType';
import { Flex } from '../Flex';
import { Gradient, abilityColorMap, deckColorMap, gradientMap, uiColorMap } from '../../../constants';
import { OnClickType } from './SchoolIdolCard';
import { getColor } from '../../../utils';

export interface InspirationSkill {
  id: entities.Skill['id'];
  rank: string;
  target: string;
  condition: string;
  slug: string;
}

interface Props {
  id: Id;
  rarity: entities.Card.Rarity;
  attribute: entities.Card.Attribute;
  type?: entities.Card.Type;
  imgSrc: string;
  title: Title;
  appeal: Value;
  stamina: Value;
  technique: Value;
  onClick?: (id: Id, type: OnClickType) => void;
  children?: React.ReactNode;
  team?: entities.Deck.Team;
  selected?: boolean;
}

export const CardContainer = memo(Component);

function Component({
  id,
  rarity,
  attribute,
  type,
  imgSrc,
  title,
  appeal,
  stamina,
  technique,
  onClick,
  children,
  team,
  selected,
}: Props) {
  const clickable = useMemo(() => !!onClick, [onClick]);
  const handleClick = useMemo(
    () =>
      onClick &&
      ((e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onClick(e.currentTarget.dataset.value!, e.currentTarget.dataset.type as OnClickType);
      }),
    [onClick],
  );

  return (
    <StyledDiv
      selected={selected}
      team={team}
      data-value={id}
      data-type={OnClickType.Select}
      onClick={handleClick}
      clickable={clickable}
    >
      <RarityLabel gradient={gradientMap[rarity]}>{rarity}</RarityLabel>
      <Flex>
        <CardAttribute attribute={attribute} />
        {type && <CardType type={type} />}
      </Flex>

      <TitleContainer justify="flex-start">
        <div data-value={id} data-type={OnClickType.Detail} onClick={handleClick}>
          <StyledImg height={48} alt={title} src={imgSrc} />
        </div>
        <StyledH3>{title}</StyledH3>
      </TitleContainer>

      <Flex justify="flex-start" align="center" wrap="nowrap">
        <Flex>
          <FaSmile color={getColor(abilityColorMap.appeal)} />
          <AbilityText>{appeal}</AbilityText>
        </Flex>
        <Flex>
          <FaHeart color={getColor(abilityColorMap.stamina)} />
          <AbilityText>{stamina}</AbilityText>
        </Flex>
        <Flex>
          <FaMicrophoneAlt color={getColor(abilityColorMap.technique)} />
          <AbilityText>{technique}</AbilityText>
        </Flex>
      </Flex>

      {children}

      {team && <DeckTeam team={team} />}
    </StyledDiv>
  );
}

interface StyledCardProps {
  team?: entities.Deck.Team;
  clickable: boolean;
  selected?: boolean;
}

const StyledDiv = styled.div<StyledCardProps>`
  cursor: pointer;
  position: relative;
  height: 100%;
  padding: ${({ team }) => (team ? '1rem 1rem 1.5rem' : '1rem')};
  background: ${getColor(uiColorMap.white)};
  border-radius: 0.5rem;
  box-shadow: 0 0.1rem 0.75rem 0 ${getColor(uiColorMap.black, 700, 0.4)};
  transition: all 0.3s ease;

  ${({ clickable }) =>
    clickable &&
    `&:hover {
      box-shadow: 0.25rem 0.5rem 2rem 0 ${getColor(uiColorMap.black, 700, 0.6)};
    }`}

    &::after {
      content: "";
      display: ${({ selected }) => (selected ? 'block' : 'none')};
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${getColor(uiColorMap.magenta, 100, 0.3)};
      border-radius: 0.5rem;
    }
}`;

interface RarityLabelProps {
  gradient: Gradient;
}

const RarityLabel = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.75rem 0.75rem 2rem 3rem;
  color: ${getColor(uiColorMap.white)};
  font-size: 1rem;
  font-weight: bolder;
  text-transform: uppercase;
  background: ${({ gradient }: RarityLabelProps) =>
    `linear-gradient(150deg, ${gradient[0]} 0%, ${gradient[1]} 50%, ${gradient[2]} 100%)`};
  border-radius: 0 0.5rem 0 0;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 0;
    border-bottom: 4.2rem solid ${getColor(uiColorMap.white)};
    border-right: 5.25rem solid transparent;
  }
`;

interface DeckTeamProps {
  team?: entities.Deck.Team;
}

const DeckTeam = styled.span`
  display: block;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 0.75rem;
  border-radius: 0 0 0.5rem 0.5rem;
  background:${({ team }: DeckTeamProps) => team && deckColorMap[team][100]}};
`;

const TitleContainer = styled(Flex)`
  margin: 0.5rem 0;
`;

const StyledImg = styled.img`
  margin: 0 0.5rem auto 0;
  background: ${getColor(uiColorMap.black, 900)};
`;

const StyledH3 = styled.h3`
  z-index: 1;
  flex: 1;
  margin: 0;
  color: ${getColor(uiColorMap.black)};
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1.5;
`;

const AbilityText = styled.p`
  margin: 0;
  padding: 0 0.5rem 0 0.25rem;
  color: ${getColor(uiColorMap.black, 300)};
  font-size: 1rem;
  font-weight: bold;
`;
