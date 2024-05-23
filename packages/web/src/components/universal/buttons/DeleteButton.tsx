import React, { memo } from 'react';
import { FaTrash } from 'react-icons/fa';

import { Button } from '.';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {}

export const DeleteButton = memo(Component);

function Component({ children = '削除', ...props }: Omit<Props, 'ref'>) {
  return (
    <Button mode="danger" {...props}>
      <FaTrash />
      {children}
    </Button>
  );
}
