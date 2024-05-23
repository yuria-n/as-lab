import React, { memo, useState } from 'react';
import { Menu } from 'semantic-ui-react';

import { Form } from './Form';
import { ListForm } from './ListForm';
import { Modal } from '../../../universal';

interface Props {
  open: boolean;
  cardId: string;
  onClick: () => void;
}

enum Title {
  Detail = '詳細登録',
  List = '一括登録',
}
const titles = Object.values(Title);

export const CardInputDialog = memo(Component);

function Component({ open, cardId, onClick }: Props) {
  const edit = !!cardId;
  const [activeItem, setActiveItem] = useState(Title.Detail);
  return (
    <Modal open={open} onClose={onClick} header={edit ? '既存のカードを編集' : '新しいカードを登録'}>
      {!edit && (
        <Menu stackable pointing fluid>
          {titles.map((title) => (
            <Menu.Item
              key={title}
              name={title}
              active={activeItem === title}
              onClick={(event, { name }) => setActiveItem(name as Title)}
            />
          ))}
        </Menu>
      )}
      {edit || activeItem === Title.Detail ? (
        <Form updateCardId={cardId} onClick={onClick} />
      ) : (
        <ListForm onClick={onClick} />
      )}
    </Modal>
  );
}
