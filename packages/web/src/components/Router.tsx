import styled from 'styled-components';
import React, { Suspense, useCallback, useEffect } from 'react';
import { Link, Router as NaviRouter, View } from 'react-navi';
import { Matcher, lazy, mount } from 'navi';
import { Message } from 'semantic-ui-react';
import { memo } from 'react';

import logo from '../assets/logo.svg';
import { Button, Flex, GooglePlayStoreBadge, Grid, Loader, NavLink, Tab } from './universal';
import { Path, links, uiColorMap } from '../constants';
import { getColor } from '../utils';
import { useAuth, useMobile, useNotification, useUserConfig } from '../hooks';

export const Router = memo(Component);

const routeMap: Record<string, Matcher<object, object>> = {
  [Path.Home]: lazy(() => import('./home')),
  [Path.Simulator]: lazy(() => import('./simulators')),
  [Path.Gacha]: lazy(() => import('./gachas')),
  [Path.Library]: lazy(() => import('./libraries')),
  [Path.About]: lazy(() => import('./about')),
  [Path.Mypage]: lazy(() => import('./mypage')),
  [Path.Reference]: lazy(() => import('./reference')),
};

function Component() {
  const { notification, onDismiss } = useNotification();
  const { loggedIn, login, logout } = useAuth();
  const { isMobile } = useMobile();
  const { userConfig, updateUserConfig } = useUserConfig();

  useEffect(() => {
    if (!userConfig) {
      return;
    }
    const content = userConfig.mobileView ? 'initial-scale=1' : '';
    document.querySelector('meta[name="viewport"]')?.setAttribute('content', content);
  }, [userConfig]);

  const switchViewPort = useCallback(() => {
    if (!userConfig) {
      return;
    }
    updateUserConfig({ ...userConfig, mobileView: !userConfig.mobileView });
  }, [updateUserConfig, userConfig]);

  return (
    <NaviRouter routes={mount(routeMap)}>
      <Header>
        {isMobile && (
          <Flex padding="2rem 2rem 1rem" justify="center">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a onClick={switchViewPort}>{`${userConfig?.mobileView ? 'PC' : 'モバイル'}表示へ切替`}</a>
          </Flex>
        )}
        <Flex justify="space-between">
          <Link href={Path.Home}>
            <img alt="スクスタ Lab" src={logo} height="40" />
          </Link>
          <Tab>
            {links.map(({ title, ...props }) => (
              <NavLink key={title} {...props}>
                {title}
              </NavLink>
            ))}
            {loggedIn ? (
              <Button margin="0 0 0 12px" onClick={logout}>
                ログアウト
              </Button>
            ) : (
              <Button margin="0 0 0 12px" onClick={login}>
                ログイン
              </Button>
            )}
          </Tab>
        </Flex>
      </Header>

      <Container>
        <Suspense fallback={<Loader />}>
          {notification && (
            <Message
              positive={notification.statusCode === 200}
              negative={notification.statusCode !== 200}
              onDismiss={onDismiss}
            >
              <Message.Header>{notification.message}</Message.Header>
            </Message>
          )}
          <View />
        </Suspense>
      </Container>
      <Footer>
        <Grid gap="1rem 0" justify="center" justifyContent="center">
          <GooglePlayStoreBadge />
          <Grid columns="repeat(2, auto)" gap="1rem">
            <FooterLink href={Path.About}>当サイトについて</FooterLink>
            <FooterLink href={Path.Reference}>スペシャルサンクス</FooterLink>
          </Grid>
          <Copy>{`© ${new Date().getFullYear()} スクスタ Lab`}</Copy>
        </Grid>
      </Footer>
    </NaviRouter>
  );
}

const Container = styled.div`
  max-width: 80rem;
  margin: 0 auto;
  padding 2rem;
`;

const Header = styled.header`
  background: ${getColor(uiColorMap.white)};
  box-shadow: 0 0 0.5rem 0 ${getColor(uiColorMap.black, 700, 0.6)};

  & > div {
    max-width: 80rem;
    margin: 0 auto;
    padding 0.5rem 2rem;
  }
`;

const Footer = styled.footer`
  color: ${getColor(uiColorMap.black, 300)};
  background: ${getColor(uiColorMap.black, 900)};
  font-size: 0.8rem;

  & > div {
    max-width: 80rem;
    margin: 0 auto;
    padding: 2rem;
  }
`;

const FooterLink = styled(Link)`
  font-weight: bold;
  border-bottom: 1px solid transparent;
  transition: 0.3s;

  &:hover {
    border-bottom: 1px solid;
  }
`;

const Copy = styled.span`
  padding: 0 0 0.5rem;
  text-align: center;
  white-space: nowrap;
`;
