import styled from 'styled-components';
import React, { MouseEvent, memo, useCallback, useMemo, useState } from 'react';

import { Flex } from '..';
import { OnClickType } from './SchoolIdolCard';
import { getColor } from '../../../utils';
import { uiColorMap } from '../../../constants';

interface Props {
  onClick?: (value: string, type: OnClickType) => void;
}

export const PlaceholderCard = memo(Component);

export function Component({ onClick }: Props) {
  const [hover, setHover] = useState(false);

  const clickable = useMemo(() => !!onClick, [onClick]);

  return (
    <StyledPlaceholderCard
      align="center"
      justify="center"
      onClick={useCallback(
        (e: MouseEvent<HTMLDivElement>) => onClick?.(e.currentTarget.dataset.value!, OnClickType.Select),
        [onClick],
      )}
      onMouseOver={useCallback(() => setHover(true), [setHover])}
      onMouseLeave={useCallback(() => setHover(false), [setHover])}
      clickable={clickable}
    >
      {clickable && <StyledText hover={hover}>選択</StyledText>}
    </StyledPlaceholderCard>
  );
}

interface StyledPlaceholderCardProps {
  clickable: boolean;
}

const StyledPlaceholderCard = styled(Flex)<StyledPlaceholderCardProps>`
  width: 100%;
  cursor: pointer;
  position: relative;
  min-height: 130px;
  height: 100%;
  padding: 1.25rem 1rem 1.5rem;
  border-radius: 0.5rem;
  border: 1px dashed ${getColor(uiColorMap.black, 100, 0.3)};
  transition: all 0.3s ease;

  ${({ clickable }) =>
    clickable &&
    `&:hover {
        background: ${getColor(uiColorMap.black, 700, 0.15)};
        box-shadow: -0.25rem -0.5rem -2rem 0 ${getColor(uiColorMap.black, 700, 0.6)};
    }`}
`;

interface TextProps {
  hover: boolean;
}

const StyledText = styled.p<TextProps>`
  padding: 2rem 0;
  text-align: center;
  color: ${({ hover }) => (hover ? getColor(uiColorMap.black, 700) : uiColorMap.white[100])};
`;
