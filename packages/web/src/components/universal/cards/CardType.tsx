import React, { memo } from 'react';

import { entities } from '@as-lab/core';

import { Gd, Vo, Sp, Sk } from '../types';

interface Props {
  type: entities.Card.Type;
}

export const CardType = memo(Component);

function Component({ type }: Props) {
  switch (type) {
    case entities.Card.Type.Vo: {
      return <Vo />;
    }
    case entities.Card.Type.Sp: {
      return <Sp />;
    }
    case entities.Card.Type.Gd: {
      return <Gd />;
    }
    case entities.Card.Type.Sk: {
      return <Sk />;
    }
  }
}
