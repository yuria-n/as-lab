import React, { memo } from 'react';
import { mount, route, redirect } from 'navi';

import { libraryLinks, Path, titleMap } from '../../constants';
import { Page, ResponsiveAd } from '../universal';
import { InspirationSkills } from './inspirationSkills';
import { Cards } from './cards';

export default mount({
  '/': redirect(`${Path.Library}${Path.Card}`),
  '/:title': route(({ params }) => ({
    view: <Libraries title={params.title} />,
  })),
});

interface Props {
  title: string;
}

const Libraries = memo(Component);

function Component({ title }: Props) {
  const isCard = title === Path.Card.slice(1);
  const active = `${Path.Library}${isCard ? Path.Card : Path.InspirationSkill}`;

  return (
    <Page title={titleMap[Path.Library]} links={libraryLinks} active={active}>
      {isCard ? <Cards /> : <InspirationSkills />}

      <ResponsiveAd className="simulator-library-bottom" slot="8669056884" />
    </Page>
  );
}
