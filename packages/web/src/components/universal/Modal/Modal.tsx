import React, { memo } from 'react';
import { Modal as SemanticModal, ModalProps, ModalHeader } from 'semantic-ui-react';

export const Modal = memo(Component);

function Component({ open, onClose, header, children }: ModalProps) {
  return (
    <SemanticModal closeIcon open={open} onClose={onClose}>
      <ModalHeader>{header}</ModalHeader>
      {children}
    </SemanticModal>
  );
}
