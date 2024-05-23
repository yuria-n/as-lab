import React, { memo } from 'react';
import { entities, utils } from '@as-lab/core';

import { Form } from './Form';
import { Modal } from '../../../universal';

interface Props {
  open: boolean;
  onUpdate: () => void;
  onClose?: () => void;
  id?: entities.UserFriend['id'];
}

export const InputDialog = memo(Component, utils.makeEqual(['onUpdate', 'onClose']));

function Component({ open, id, onUpdate, onClose }: Props) {
  const edit = !!id;
  return (
    <Modal open={open} onClose={onClose} header={edit ? '既存のフレンドを編集' : '新しいフレンドを登録'}>
      <Form id={id} onUpdate={onUpdate} />
    </Modal>
  );
}
