import React from 'react';
import styled from 'styled-components';
import { useActive, useLinkProps } from 'react-navi';

import { Path, uiColorMap } from '../../constants';
import { UserIconButton } from './UserIconButton';
import { getColor } from '../../utils';

interface Props {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ children, href }: Props) {
  const active = useActive(href, { exact: href === Path.Home });
  const linkProps = useLinkProps({ href });

  if (href === Path.Mypage) {
    return <UserIconButton />;
  }

  return (
    <StyledTabLink {...linkProps} active={active}>
      {children}
    </StyledTabLink>
  );
}

interface StyledTabLinkProps
  extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
  active: boolean;
}

const StyledTabLink = styled.a<StyledTabLinkProps>`
  cursor: ${({ active }) => (active ? 'default' : 'pointer')};
  padding: 0.5rem 1rem;
  color: ${({ active }) => (active ? getColor(uiColorMap.magenta) : getColor(uiColorMap.black, 300))};
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  text-transform: capitalize;
  transition: all 0.3s ease;

  &:hover {
    color: ${getColor(uiColorMap.magenta)};
    background: ${({ active }) => !active && getColor(uiColorMap.magenta, 900)};
  }
`;
