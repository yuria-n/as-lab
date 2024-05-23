import React from 'react';
import { Modal as SemanticModal, ModalActionsProps } from 'semantic-ui-react';

export function ModalActions({ children }: ModalActionsProps) {
  return <SemanticModal.Actions>{children}</SemanticModal.Actions>;
}
