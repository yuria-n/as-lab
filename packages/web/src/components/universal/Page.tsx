import React, { memo } from 'react';
import { Link as NaviLink } from 'react-navi';
import { Menu } from 'semantic-ui-react';

import { Link } from '../../constants';
import { Flex } from './Flex';

interface Props {
  title?: string;
  actions?: React.ReactNode;
  links: Link[];
  active: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export const Page = memo(Component);

function Component({ title, actions, links, active, description, children }: Props) {
  return (
    <>
      <Flex justify="space-between" align="center">
        <h2>{title}</h2>
        {actions}
      </Flex>

      <Menu stackable pointing>
        {links.map(({ href, title }) => (
          <NaviLink key={href} href={href}>
            <Menu.Item name={title} active={href === active} />
          </NaviLink>
        ))}
      </Menu>

      <p>{description}</p>

      {children}
    </>
  );
}
