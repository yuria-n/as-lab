import { mount, redirect } from 'navi';

import { Path } from '../../constants';

export default mount({
  [Path.Home]: redirect(`${Path.Simulator}${Path.Deck}`),
});
