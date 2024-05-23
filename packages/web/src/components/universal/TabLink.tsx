import React from 'react';
import { useActive, useLinkProps } from 'react-navi';
import styled from 'styled-components';

import { uiColorMap, Color } from '../../constants';
import { getColor } from '../../utils';

interface Props extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
  active?: boolean;
  colorMap: Color;
}

export function TabLink({ children, href = '', colorMap }: Props) {
  let active = useActive(href);
  let linkProps = useLinkProps({ href });
  return (
    <StyledTabLink {...linkProps} active={active} colorMap={colorMap}>
      {children}
    </StyledTabLink>
  );
}

const white = getColor(uiColorMap.white, 100);

const StyledTabLink = styled.a`
  padding: 1rem 2rem;
  margin-right: 0.5rem;
  color: ${({ active, colorMap }: Props) => (active ? white : colorMap[100])};
  background: ${({ active, colorMap }: Props) => (active ? colorMap[100] : white)};
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  text-transform: capitalize;
  border-radius: 0.5rem 0.5rem 0 0;
  transition: all 0.3s ease;

  &:hover {
    color: ${({ active, colorMap }: Props) => (active ? white : colorMap[100])};
    background: ${({ active, colorMap }: Props) => !active && colorMap[700]};
  }
`;
