import { lazy, mount } from 'navi';

import { Path } from '../../../constants';

export default mount({
  [Path.Home]: lazy(() => import('./deckSimulator')),
  [Path.Support]: lazy(() => import('./deckSupportSimulator')),
});
