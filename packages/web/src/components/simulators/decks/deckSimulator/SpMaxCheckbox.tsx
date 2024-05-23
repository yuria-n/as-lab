import React, { memo } from 'react';
import { Checkbox } from 'semantic-ui-react';

import { Grid, Tooltip } from '../../../universal';

interface Props {
  checked: boolean;
  onClick: (checked: boolean) => void;
  disabled?: boolean;
}

export const SpMaxCheckbox = memo(Component);

function Component({ checked, onClick, disabled = false }: Props) {
  return (
    <Grid columns="repeat(2, auto)" gap="0.25rem" align="center" justifyContent="start">
      <Checkbox
        label="SP特技ボルテージ最大化"
        disabled={disabled}
        checked={checked}
        onClick={() => onClick(!checked)}
      />
      <Tooltip content="メイン作戦をサポートするスクールアイドルよりも、SP特技で獲得するボルテージが最も高くなる中央3人の選択が優先されます。" />
    </Grid>
  );
}
