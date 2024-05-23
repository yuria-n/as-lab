import styled from 'styled-components';
import React, { memo, useCallback, useState } from 'react';
import { FaFileUpload } from 'react-icons/fa';
import { entities } from '@as-lab/core';
import { useDropzone } from 'react-dropzone';

import { BadRequestError, useNotification, useUserData } from '../../hooks';
import { Button, Modal, ModalActions, ModalContent } from '../universal';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ImportDialog = memo(Component);

function Component({ open, onClose }: Props) {
  const [upload, setUpload] = useState(false);
  const [userAccessory, setUserAccessory] = useState<entities.StoredUserAccessories | null>(null);
  const [userCard, setUserCard] = useState<entities.StoredUserCards | null>(null);
  const [userDeck, setUserDeck] = useState<entities.StoredUserDecks | null>(null);
  const [userIdol, setUserIdol] = useState<entities.StoredUserIdols | null>(null);
  const [userFriend, setUserFriend] = useState<entities.StoredUserFriends | null>(null);

  const { setError } = useNotification();
  const onDrop = useCallback((files) => {
    for (const file of files) {
      const reader = new FileReader();
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        try {
          const data = JSON.parse(new TextDecoder().decode(reader.result as ArrayBuffer));
          setUserAccessory(data.userAccessory);
          setUserCard(data.userCard);
          setUserDeck(data.userDeck);
          setUserIdol(data.userIdol);
          setUserFriend(data.userFriend);
          setUpload(true);
        } catch (err) {
          console.error(err);
          setError(new BadRequestError('無効なファイルです'));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const { importUserData } = useUserData();
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const accessorySize = userAccessory?.accessories?.length ?? 0;
  const cardSize = userCard?.cards?.length ?? 0;
  const deckSize = userDeck?.decks?.length ?? 0;
  const idolSize = userIdol?.idols?.length ?? 0;
  const friendSize = userFriend?.friends?.length ?? 0;
  const disabled = accessorySize === 0 && cardSize === 0 && deckSize === 0 && idolSize === 0 && friendSize === 0;
  const handleImport = () => {
    if (disabled) {
      return;
    }
    importUserData({ userAccessory, userCard, userDeck, userIdol, userFriend });
    setUserAccessory(null);
    setUserCard(null);
    setUserDeck(null);
    setUserIdol(null);
    setUserFriend(null);
    setUpload(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} header="データをJSONから復元">
      <ModalContent>
        {!upload ? (
          <Dropzone {...getRootProps()}>
            <input {...getInputProps()} />
            <p>スクスタLabデータバックアップファイルを選択してください。</p>
            <FaFileUpload />
          </Dropzone>
        ) : (
          <>
            <p>既存のカードデータは全て上書きされます。</p>
            <ul>
              <li>ライブ編成登録数: {deckSize}</li>
              <li>カード登録数: {cardSize}</li>
              <li>アクセサリー登録数: {accessorySize}</li>
              <li>キズナボード登録数: {idolSize}</li>
              <li>フレンド登録数: {friendSize}</li>
            </ul>
          </>
        )}
      </ModalContent>
      <ModalActions>
        <Button disabled={disabled} onClick={handleImport}>
          インポート
        </Button>
      </ModalActions>
    </Modal>
  );
}

const Dropzone = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 480px;
  padding-bottom: 1rem;
  border-width: 0.5rem;
  border-radius: 0.5rem;
  border-color: #eeeeee;
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border 0.24s ease-in-out;
`;
