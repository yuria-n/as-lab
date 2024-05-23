import _ from 'lodash';
import styled from 'styled-components';
import React, { memo, useCallback, useEffect } from 'react';
import { Dropdown, Input } from 'semantic-ui-react';
import { FaTimes } from 'react-icons/fa';
import { entities, libs } from '@as-lab/core';

import { EventType, handleDropdownChange, handleInputChangeData, useEvent } from '../../../../hooks';
import { Flex, Grid } from '../../../universal';
import { cardTypeOptions, reductionParamTypeOptions, uiColorMap } from '../../../../constants';
import { getColor, isNegative, round, roundRate } from '../../../../utils';

enum Sign {
  Minus = 'minus',
  Plus = 'plus',
}

const typeSet = new Set<entities.Card.Type>(Object.values(entities.Card.Type));
const signOptions = Object.values(Sign).map((sign) => ({
  key: sign,
  value: sign,
  text: sign === Sign.Minus ? '減少' : '増加',
}));

interface Props {
  index: number;
  reduction: libs.DeckSimulator.Reduction;
  onChange: (index: number, reduction: libs.DeckSimulator.Reduction) => void;
  onDelete: (index: number) => void;
}

export const ReductionInput = memo(Component);

function Component({ index, reduction, onChange, onDelete }: Props) {
  const type = useEvent(EventType.Generic, handleDropdownChange, {
    initialData: entities.Card.Type.Vo,
    onUpdate: useCallback((type) => onChange(index, { ...reduction, targets: [type] }), [onChange, index, reduction]),
  });
  const param = useEvent(EventType.Generic, handleDropdownChange, {
    initialData: reduction.param,
    onUpdate: useCallback((param) => onChange(index, { ...reduction, param }), [onChange, index, reduction]),
  });
  const value = useEvent(EventType.Integer, handleInputChangeData, {
    initialData: reduction.rate,
    onUpdate: useCallback(
      (value) => {
        const rate = round(value / 100);
        const negative = isNegative(value);
        onChange(index, { ...reduction, targets: [type.data], rate: negative ? -rate : rate });
      },
      [onChange, index, type, reduction],
    ),
  });
  const sign = useEvent(EventType.Generic, handleDropdownChange, {
    initialData: Sign.Minus,
    onUpdate: useCallback(
      (sign) => {
        const rate = Math.abs(reduction.rate);
        onChange(index, { ...reduction, rate: sign === Sign.Minus ? rate : -rate });
      },
      [onChange, index, reduction],
    ),
  });
  const handleDelete = useCallback(() => onDelete(index), [index, onDelete]);

  useEffect(() => {
    const target = _.first(reduction.targets) as entities.Card.Type;
    if (typeSet.has(target)) {
      type.set(target);
    }
    param.set(reduction.param);
    value.set(Math.abs(roundRate(reduction.rate)));
    sign.set(reduction.rate >= 0 ? Sign.Minus : Sign.Plus);
  }, [reduction, type, param, value, sign]);

  return (
    <EffectGrid columns="1fr auto" align="center">
      <Flex align="center" justify="start">
        <Dropdown name="type" selection value={type.data} options={cardTypeOptions} onChange={type.onChange} />
        <span>タイプの</span>
        <Dropdown
          name="team-type"
          selection
          value={param.data}
          options={reductionParamTypeOptions}
          onChange={param.onChange}
        />
        <span>が</span>
        <Input
          name="value"
          type="number"
          min={0}
          max={100}
          placeholder={0}
          value={value.data}
          onChange={value.onChange}
        />
        <span>%</span>
        <Dropdown name="sign" selection value={sign.data} options={signOptions} onChange={sign.onChange} />
      </Flex>
      <CloseIcon onClick={handleDelete}>
        <FaTimes size="1.25rem" />
      </CloseIcon>
    </EffectGrid>
  );
}

const EffectGrid = styled(Grid)`
  padding: 0.5rem;
  border: 1px solid ${getColor(uiColorMap.black, 100, 0.1)};
  background: ${getColor(uiColorMap.white)};
  border-radius: 0.25rem;
`;

const CloseIcon = styled.div`
  cursor: pointer;
  padding: 0.5rem;
  color: ${getColor(uiColorMap.black, 100, 0.6)};
  transition: 0.3s;

  &:hover {
    color: ${getColor(uiColorMap.magenta)};
  }
`;
