import styled from 'styled-components';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigation } from 'react-navi';
import { mount, route } from 'navi';

import { Analytics, LogType } from '../../../clients';
import { DeckDetail } from './details';
import { DefaultDeckListCard, Grid, InfeedAd, NewCard, ResponsiveAd } from '../../universal';
import { MypageContainer } from '../MypageContainer';
import { Path } from '../../../constants';
import { createSortIterator } from '../../../utils';
import { useUserDeck } from '../../../hooks';

const Deck = memo(Component);

export default mount({
  '/': route({
    view: <Deck />,
  }),
  [Path.New]: route({
    view: <DeckDetail />,
  }),
  '/:id': route(({ params }) => ({
    view: <DeckDetail id={params.id} />,
  })),
});

const currentPath = `${Path.Mypage}${Path.Deck}`;

function Component() {
  const { userDecks } = useUserDeck();
  const { navigate } = useNavigation();

  const onClick = useCallback(() => navigate(`${currentPath}${Path.New}`), [navigate]);
  const sortedUserDecks = useMemo(() => userDecks.sort(createSortIterator('updatedAt', false)), [userDecks]);

  useEffect(() => {
    Analytics.logEvent(LogType.VisitDeck);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MypageContainer active={Path.Deck} description="楽曲シミュレーターに使用する編成を保存、編集できます。">
      <InfeedAd className="mypage-deck-top" slot="6884508360" />

      <Grid columns="1fr" gap="1rem">
        <NewDeckListCard text="新しい編成を追加" onClick={onClick} />
        {sortedUserDecks.map((deck) => (
          <Link key={deck.id} href={`${currentPath}/${deck.id}`}>
            <DefaultDeckListCard userDeck={deck} />
          </Link>
        ))}
      </Grid>

      <ResponsiveAd className="mypage-deck-bottom" slot="6063392073" />
    </MypageContainer>
  );
}

const NewDeckListCard = styled(NewCard)`
  min-height: 160px;
`;
