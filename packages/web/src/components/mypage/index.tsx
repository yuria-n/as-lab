import { lazy, mount, redirect } from 'navi';

import { Path } from '../../constants';

export default mount({
  '/': redirect(`${Path.Mypage}${Path.Deck}`),
  [Path.Deck]: lazy(() => import('./decks')),
  [Path.Card]: lazy(() => import('./cards')),
  [Path.Accessory]: lazy(() => import('./accessories')),
  [Path.Kizuna]: lazy(() => import('./kizuna')),
  [Path.Friend]: lazy(() => import('./friends')),
});
