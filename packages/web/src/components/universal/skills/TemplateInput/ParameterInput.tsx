import React, { memo } from 'react';
import { Input, Dropdown } from 'semantic-ui-react';

import { entities, utils } from '@as-lab/core';

import { handleChange, HandleType } from '../../../../utils';
import { cardTypeOptions } from '../../../../constants';

interface Props {
  type: entities.Field.Type;
  name: string;
  placeholder: string;
  value: any;
  disabled: boolean;
  onChange: (value: any) => void;
}

export const ParameterInput = memo(Component, (prev, next) => utils.isEqual(prev, next, ['onChange']));

function Component({ type, onChange, disabled, ...props }: Props) {
  switch (type) {
    case entities.Field.Type.Parameter: {
      if (disabled) {
        return parameterOptions.find((opts) => opts.value === props.value)?.text ?? props.value.toLocaleString();
      }
      return (
        <Dropdown
          {...props}
          search
          selection
          options={parameterOptions}
          onChange={(_, data) => handleChange<entities.Parameter>(HandleType.Generic, onChange)(data.value)}
        />
      );
    }
    case entities.Field.Type.Type: {
      if (disabled) {
        return cardTypeOptions.find((opts) => opts.value === props.value)?.text ?? props.value.toLocaleString();
      }
      return (
        <Dropdown
          {...props}
          search
          selection
          options={cardTypeOptions}
          onChange={(_, data) => handleChange<entities.Card.Type>(HandleType.Generic, onChange)(data.value)}
        />
      );
    }
    case entities.Field.Type.Number:
    default: {
      if (disabled) {
        return props.value.toLocaleString();
      }
      return <Input {...props} type={type} min={0} max={10000} onChange={handleChange(HandleType.Number, onChange)} />;
    }
  }
}

const parameterOptions = [
  {
    key: entities.Parameter.Appeal,
    value: entities.Parameter.Appeal,
    text: '自身のアピール',
  },
  {
    key: entities.Parameter.Stamina,
    value: entities.Parameter.Stamina,
    text: '自身のスタミナ',
  },
  {
    key: entities.Parameter.Technique,
    value: entities.Parameter.Technique,
    text: '自身のテクニック',
  },
  {
    key: entities.Parameter.Sp,
    value: entities.Parameter.Sp,
    text: '最大SP',
  },
];
