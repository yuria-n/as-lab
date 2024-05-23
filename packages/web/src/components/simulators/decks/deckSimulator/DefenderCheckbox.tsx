import React, { memo } from 'react';
import { Checkbox } from 'semantic-ui-react';

import { Grid, Tooltip } from '../../../universal';

interface Props {
  checked: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const DefenderCheckbox = memo(Component);

function Component({ checked, onClick, disabled = false }: Props) {
  return (
    <Grid columns="repeat(2, auto)" gap="0.25rem" align="center" justifyContent="start">
      <Checkbox label="回復系を含む" disabled={disabled} checked={checked} onClick={onClick} />
      <Tooltip content="メイン作戦に、スタミナ回復またはシールド獲得の特技を持ったスクールアイドルが必ず選択されます。" />
    </Grid>
  );
}
