import React from 'react';
import { lazy, mount, route } from 'navi';

import { MusicSimulator } from './musics';
import { Path } from '../../constants';

export default mount({
  [Path.Music]: route(({ query: { tab } }) => ({
    view: <MusicSimulator tab={tab ? Number(tab) : 0} />,
  })),
  [Path.Deck]: lazy(() => import('./decks')),
});
