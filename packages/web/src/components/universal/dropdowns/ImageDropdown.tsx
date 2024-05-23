import React from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';

export function ImageDropdown(props: DropdownProps) {
  // const option = props.options?.find((option) => option.value === props.value);
  return (
    <Dropdown
      {...props}
      selection
      // trigger={
      //   option && (
      //     <Flex>
      //       <Image width={20} src={(option.image as ImageProps).src} />
      //       <Text>{option.text}</Text>
      //     </Flex>
      //   )
      // }
    />
  );
}

// const Text = styled.p`
//   margin: 0 0 0 0.5rem;
// `;
