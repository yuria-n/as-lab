import React from 'react';
import styled from 'styled-components';
import { Link, useActive } from 'react-navi';
import { Image } from 'semantic-ui-react';
import { FaUser } from 'react-icons/fa';

import { getColor } from '../../utils';
import { uiColorMap, Path } from '../../constants';
import { useAuth } from '../../hooks';

export function UserIconButton() {
  const active = useActive(Path.Mypage, { exact: false });
  const { user, loggedIn } = useAuth();

  return (
    <CircleButton title="マイページ" active={active} href={Path.Mypage}>
      {loggedIn ? <Image circular size="mini" src={user?.photoURL} /> : <FaUser size="1.25rem" />}
    </CircleButton>
  );
}

const CircleButton = styled(Link)`
  cursor: ${({ active }) => (active ? 'default' : 'pointer')};
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 35px;
  width: 35px;
  min-height: 35px;
  height: 35px;
  margin: 0 0 0 0.5rem;
  border-radius: 50%;
  color: ${({ active }) => (active ? getColor(uiColorMap.magenta) : getColor(uiColorMap.black, 300))};
  background: ${({ active }) => (active ? getColor(uiColorMap.magenta, 700) : getColor(uiColorMap.black, 900))};
  transform: 0.3s;

  &:hover {
    color: ${getColor(uiColorMap.magenta)};
    background: ${({ active }) => !active && getColor(uiColorMap.magenta, 900)};
  }
`;
