import React, { memo } from 'react';
import { FaTimes } from 'react-icons/fa';

import { Button } from '.';
import { utils } from '@as-lab/core';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  mode?: 'primary' | 'secondary';
}

export const CancelButton = memo(Component, utils.makeEqual(['onClick']));

function Component({ children = 'キャンセル', ...props }: Props) {
  return (
    <Button mode="secondary" {...props}>
      <FaTimes />
      {children}
    </Button>
  );
}
