import styled from 'styled-components';
import React, { memo } from 'react';

import { Flex } from '..';
import { getColor } from '../../../utils/color';
import { uiColorMap } from '../../../constants';

type DivProps = JSX.IntrinsicElements['div'];
interface Props extends DivProps {
  text?: string;
}

export const NewCard = memo(Component);

function Component({ text, ...props }: Props) {
  return (
    <StyledListCard justify="center" {...props}>
      <p>{text ?? '追加'}</p>
    </StyledListCard>
  );
}

const StyledListCard = styled(Flex)<Props>`
  width: 100%;
  cursor: pointer;
  position: relative;
  min-height: 120px;
  height: 100%;
  padding: 1.25rem 1rem 1.5rem;
  border-radius: 0.5rem;
  border: 1px dashed ${getColor(uiColorMap.black, 100, 0.3)};
  color: ${getColor(uiColorMap.black)};
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background: ${getColor(uiColorMap.magenta, 700, 0.15)};
    border: 1px dashed ${getColor(uiColorMap.magenta, 100, 0.6)};
    color: ${getColor(uiColorMap.magenta)};
  }
`;
