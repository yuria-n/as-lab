import React from 'react';
import styled from 'styled-components';

type Div = JSX.IntrinsicElements['div'];
interface Props extends Omit<Div, 'ref'> {
  padding?: string;
  direction?: 'row' | 'column';
  wrap?: string;
  flow?: string;
  justify?: string;
  align?: string;
}

export function Flex({ children, padding, flow, direction, wrap, justify, align, ...props }: Props) {
  return (
    <StyledFlex
      {...props}
      padding={padding}
      direction={direction}
      flow={flow}
      wrap={wrap}
      justify={justify}
      align={align}
    >
      {children}
    </StyledFlex>
  );
}

const StyledFlex = styled.div`
  display: flex;
  width: auto;
  padding: ${({ padding = '0' }: Props) => padding};
  flex-flow: ${({ flow = 'inherit' }: Props) => flow};
  flex-direction: ${({ direction = 'row' }: Props) => direction};
  flex-wrap: ${({ wrap = 'wrap' }: Props) => wrap};
  justify-content: ${({ justify = 'flex-start' }: Props) => justify};
  align-items: ${({ align = 'center' }: Props) => align};
`;
