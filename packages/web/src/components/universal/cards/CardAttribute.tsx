import styled from 'styled-components';
import React, { memo } from 'react';
import { entities } from '@as-lab/core';

import { Color, attributeColorMap, attributeTextMap, uiColorMap } from '../../../constants';
import { getColor } from '../../../utils';

interface Props {
  attribute: entities.Card.Attribute;
}

export const CardAttribute = memo(Component);

function Component({ attribute }: Props) {
  return <AttributeTag colorMap={attributeColorMap[attribute]}>{attributeTextMap[attribute]}</AttributeTag>;
}

interface AttributeTagProps {
  colorMap: Color;
}

const AttributeTag = styled.span`
  margin: 0 0.5rem 0 0;
  padding: 0 0.5rem;
  color: ${getColor(uiColorMap.white)};
  background: ${({ colorMap }: AttributeTagProps) => getColor(colorMap)};
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: -1px;
  line-height: 1.4rem;
  border-radius: 1rem;
  white-space: nowrap;
`;
