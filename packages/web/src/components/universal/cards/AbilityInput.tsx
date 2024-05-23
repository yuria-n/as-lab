import React, { memo } from 'react';
import { Input, InputProps } from 'semantic-ui-react';
import styled from 'styled-components';

import { handleChange, HandleType } from '../../../utils';
import { AbilityInputLabel } from './AbilityInputLabel';

interface Props extends InputProps {
  label: string;
  setter?: React.Dispatch<React.SetStateAction<number>>;
  tip?: boolean;
}

export const AbilityInput = memo(Component);

function Component({ setter, label, tip, ...props }: Props) {
  return (
    <StyledInput
      labelPosition="left"
      type="number"
      min={0}
      max={19999}
      placeholder="-"
      {...props}
      onChange={setter && handleChange(HandleType.Number, setter)}
    >
      <AbilityInputLabel label={label} tip={tip} />
      <input />
    </StyledInput>
  );
}

const StyledInput = styled(Input)`
  margin: 0 1rem 0 0;
`;
