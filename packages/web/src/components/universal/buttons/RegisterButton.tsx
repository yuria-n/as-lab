import React, { memo } from 'react';
import { FaCheck } from 'react-icons/fa';

import { Button } from '.';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  mode?: 'primary' | 'secondary';
}

export const RegisterButton = memo(Component);

function Component({ children = '登録', onClick, ...props }: Props) {
  return (
    <Button onClick={onClick} {...props}>
      <FaCheck />
      {children}
    </Button>
  );
}
