import React from 'react';
import { Modal as SemanticModal, ModalContentProps } from 'semantic-ui-react';

export function ModalContent({ children }: ModalContentProps) {
  return <SemanticModal.Content>{children}</SemanticModal.Content>;
}
