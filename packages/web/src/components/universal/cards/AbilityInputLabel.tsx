import React, { memo } from 'react';
import { Label } from 'semantic-ui-react';

import { Tooltip } from '../';

interface Props {
  label: string;
  tip?: boolean;
}

export const AbilityInputLabel = memo(Component);

function Component({ label, tip }: Props) {
  return (
    <Label>
      {label}&nbsp;
      {tip && (
        <Tooltip
          content={
            <>
              {label}値は<strong>黒字の値のみ</strong>
              を入力します。緑字のボーナス値は自動で計算されます。
            </>
          }
        />
      )}
    </Label>
  );
}
