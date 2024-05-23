import React, { memo, useCallback, useEffect, useState } from 'react';
import { entities } from '@as-lab/core';

import { Analytics, LogType } from '../../../../clients';
import { Button, GooglePlayStoreBadge, Modal, ModalActions, ModalContent } from '../../../universal';
import { CardMap, UserCardMap, useCloudUserCard, useStep, useUserCard } from '../../../../hooks';
import { SyncCard, SyncCardProps } from './SyncCard';

interface Props {
  cardMap: CardMap;
  userCardMap: UserCardMap;
  open: boolean;
  onClose: () => void;
}

export const SyncDialog = memo(Component);

enum State {
  None,
  Loading,
  Confirmation,
  Synced,
}

function Component({ cardMap, userCardMap, open, onClose }: Props) {
  const [state, setState] = useState(State.None);
  const [cardStates, setCardStates] = useState<SyncCardProps[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<boolean[]>([]);
  const { updateUserCards } = useUserCard();
  const { syncUserCardMap, getSyncUserCardMap } = useCloudUserCard();
  useEffect(() => {
    if (syncUserCardMap) {
      setState(State.Confirmation);
    }
  }, [syncUserCardMap]);
  useEffect(() => {
    if (!syncUserCardMap) {
      return;
    }
    const cardStates = Object.entries(syncUserCardMap)
      .filter(([cardId, cardState]) => {
        const userCard = userCardMap.get(cardId);
        if (!userCard) {
          return cardMap.has(cardId);
        }
        return (userCard.updatedAt ?? 0) < cardState.updatedAt;
      })
      .map(([cardId, cardState], index) => {
        const userCard = userCardMap.get(cardId);
        const prev = userCard ?? null;
        const base = userCard ?? cardMap.get(cardId)!;
        const next: entities.UserCard = {
          inspirationSkillIds: [],
          ...base,
          ...cardState,
        };
        const selected = selectedIndices[index] ?? false;
        const onClick = () => {
          setSelectedIndices((indices) =>
            Array.from(Object.entries(syncUserCardMap), (_, i) => (i === index ? !indices[i] : !!indices[i])),
          );
        };
        return { prev, next, selected, onClick };
      });
    setCardStates(cardStates);
  }, [syncUserCardMap, cardMap, userCardMap, selectedIndices]);

  const content = useStep(
    state,
    [
      {
        state: State.None,
        node: (
          <>
            <p>スクスタLabのモバイルアプリを使用すると、スクリーンショットから読み込むことができます。</p>
            <p>
              「読み込み」ボタンをクリックすると、モバイルアプリで取り込まれたスクールアイドル情報の同期を開始します。更新日時が新しい情報が優先されます。
            </p>
            <GooglePlayStoreBadge />
          </>
        ),
      },
      {
        state: State.Loading,
        node: <p>読込中…</p>,
      },
      {
        state: State.Confirmation,
        node:
          cardStates.length === 0 ? (
            <p>同期できるカードがありませんでした。</p>
          ) : (
            <>
              <p>同期したいスクールアイドルを選択してください。</p>
              {cardStates.map((state) => (
                <SyncCard key={state.next.id} {...state} />
              ))}
            </>
          ),
      },
      {
        state: State.Synced,
        node: <p>同期が完了しました。</p>,
      },
    ],
    [cardStates],
  );

  const onSyncClick = useCallback(() => {
    getSyncUserCardMap();
    setState(State.Loading);
  }, [getSyncUserCardMap]);
  const onUpdateCards = useCallback(() => {
    Analytics.logEvent(LogType.UserCardSync);
    updateUserCards(cardStates.filter((_, index) => selectedIndices[index]).map((card) => card.next));
    setState(State.Synced);
  }, [cardStates, selectedIndices, updateUserCards]);
  const onDialogClose = useCallback(() => {
    setState(State.None);
    onClose();
  }, [onClose]);
  const button = useStep(
    state,
    [
      {
        state: State.None,
        node: <Button onClick={onSyncClick}>読み込み</Button>,
      },
      {
        state: State.Confirmation,
        node: cardStates.length !== 0 && (
          <Button onClick={onUpdateCards} disabled={!selectedIndices.some((index) => index)}>
            同期
          </Button>
        ),
      },
      {
        state: State.Synced,
        node: <Button onClick={onDialogClose}>閉じる</Button>,
      },
    ],
    [onSyncClick, cardStates, onUpdateCards, onDialogClose, selectedIndices],
  );

  return (
    <Modal open={open} onClose={onDialogClose} header="データを同期">
      <ModalContent>{content}</ModalContent>
      <ModalActions>{button}</ModalActions>
    </Modal>
  );
}
