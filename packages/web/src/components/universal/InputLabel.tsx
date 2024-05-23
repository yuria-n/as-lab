import React from 'react';
import styled from 'styled-components';

type Props = React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;

export function InputLabel({ children }: Props) {
  return <StyledLabel>{children}</StyledLabel>;
}

const StyledLabel = styled.label`
  margin: 0 0 0.5rem 0;
`;
