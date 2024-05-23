import React, { memo, useCallback, useMemo } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { utils } from '@as-lab/core';

import { Grid, InputLabel } from '../../universal';
import { HandleType, handleChange } from '../../../utils';
import { useUserCard } from '../../../hooks';

export interface PresetDropdownProps {
  presetName: string;
  onChange: (presetName: string) => void;
  disabled?: boolean;
}

export const PresetDropdown = memo(Component, utils.makeEqual(['onChange']));

function Component({ presetName, onChange, disabled }: PresetDropdownProps) {
  const { presetUserCards } = useUserCard();

  return (
    <Grid>
      <InputLabel>使用するカードセット</InputLabel>
      <Dropdown
        name="support-parameter"
        selection
        placeholder="あなたのカード"
        value={presetName}
        options={useMemo(
          () => [
            { value: '', text: 'あなたのカード' },
            ...presetUserCards.map(({ name }) => ({
              value: name,
              text: name,
              label: 'sample',
            })),
          ],
          [presetUserCards],
        )}
        onChange={useCallback((_, data) => handleChange(HandleType.String, onChange)(data.value), [onChange])}
        disabled={disabled}
      />
    </Grid>
  );
}
