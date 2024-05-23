import React, { memo, useEffect, useState } from 'react';
import { Dropdown, DropdownItemProps } from 'semantic-ui-react';

import { entities, libs } from '@as-lab/core';

import { useCard, useIdol, useSkill } from '../../../hooks';
import { Grid, GridItem } from '../../universal';
import { Display, getCardTitle, roundRate } from '../../../utils';
import { config } from '../../../config';

export const DetailResultView = memo(Component);

interface Props {
  liveStage: entities.Music.LiveStage | null;
  status: libs.PlayerStatusInterface | null;
  histories: libs.MusicSimulator.History[] | null;
}

function Component({ liveStage, status, histories }: Props) {
  const [historyOptions, setHistoryOptions] = useState<DropdownItemProps[]>([]);
  const [eventOptions, setEventOptions] = useState<DropdownItemProps[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);

  const { cardMap, getCards } = useCard();
  const { idolMap, getIdols } = useIdol();
  const { masterSkillMap, getMasterSkills } = useSkill();
  useEffect(() => {
    getCards();
    getIdols();
    getMasterSkills();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!liveStage || !histories) {
      return;
    }
    const historyOptions = histories.map((history, index) => {
      switch (index) {
        case 0: {
          return {
            value: index,
            text: 'パッシブスキル',
          };
        }
        case 1: {
          return {
            value: index,
            text: '楽曲開始',
          };
        }
      }
      const note = liveStage.notes[index - 2];
      if (!note) {
        return {
          value: index,
          text: '楽曲終了時',
        };
      }
      return {
        value: index,
        text: `${config.feature ? `${index}: ` : ''}ノーツ${note.count}${
          note.type === entities.Music.NoteType.AcStart ? ': AC開始' : ''
        }${note.type === entities.Music.NoteType.AcEnd ? ': AC終了' : ''}`,
      };
    });
    setHistoryIndex(0);
    setHistoryOptions(historyOptions);
  }, [liveStage, histories]);

  useEffect(() => {
    setEventIndex(0);
  }, [historyIndex]);

  useEffect(() => {
    const history = histories?.[historyIndex];
    if (!history || cardMap.size === 0 || idolMap.size === 0 || masterSkillMap.size === 0) {
      return;
    }
    const eventOptions = history.events.map(({ actor, event, cardId, payload }, index) => {
      const card = cardId ? cardMap.get(cardId) : null;
      const idol = card ? idolMap.get(card.idolId) : null;
      const actorName = card && idol ? getCardTitle(card, idol, Display.Evolution) : actorNameMap[actor];
      const effect = payload?.effect;
      const masterSkill = masterSkillMap.get(effect?.type);
      const until = effect?.until;
      const effectText = !masterSkill
        ? ''
        : ` ${until ? `ノーツ${until}まで` : ''}${effect?.rate ? ` ${roundRate(effect.rate)}％ ` : ''}${
            effect?.value ? ` ${effect.value} ` : ''
          }${masterSkill.title}`;
      return {
        value: index,
        text: `【${eventMap[event]}】 ${actorName} / ${effectText}`.trim(),
      };
    });
    setEventIndex(0);
    setEventOptions(eventOptions);
  }, [histories, historyIndex, cardMap, idolMap, masterSkillMap]);

  const history = histories?.[historyIndex];
  return (
    <Grid gap="1.5rem">
      <GridItem>
        <h4>最終ステータス</h4>
        <Status liveStage={liveStage} status={status} />
      </GridItem>
      <GridItem>
        <h4>ログ</h4>
        <Dropdown
          name="log"
          placeholder=""
          fluid
          search
          selection
          options={historyOptions}
          value={historyIndex}
          onChange={(_, data) => {
            setHistoryIndex(data.value as number);
            setEventIndex(0);
          }}
        />
        <h5>ステータス</h5>
        {history && <Status liveStage={liveStage} status={history.status} />}
        <Dropdown
          name="event_log"
          placeholder=""
          fluid
          search
          selection
          options={eventOptions}
          value={eventIndex}
          onChange={(_, data) => setEventIndex(data.value as number)}
        />
      </GridItem>
    </Grid>
  );
}

const actorNameMap = {
  [libs.SkillHandler.Actor.System]: 'システム',
  [libs.SkillHandler.Actor.Idol]: 'アイドル',
  [libs.SkillHandler.Actor.Accessory]: 'アクセサリー',
};

const eventMap: Record<entities.Music.Event, Title> = {
  [entities.Music.Event.Passive]: 'パッシブ',
  [entities.Music.Event.Music]: '楽曲中',
  [entities.Music.Event.MusicStart]: '楽曲開始',
  [entities.Music.Event.MusicFailed]: '楽曲失敗',
  [entities.Music.Event.TapFailed]: 'タップ失敗',
  [entities.Music.Event.TapSucceeded]: 'タップ成功',
  [entities.Music.Event.Damage]: 'ダメージ',
  [entities.Music.Event.VoltageGain]: 'ボルテージ獲得',
  [entities.Music.Event.AcStart]: 'AC開始',
  [entities.Music.Event.AcSuccess]: 'AC成功',
  [entities.Music.Event.AcEnd]: 'AC終了',
  [entities.Music.Event.AcFailed]: 'AC失敗',
  [entities.Music.Event.SpSkill]: 'SP発動',
  [entities.Music.Event.Critical]: 'クリティカル',
  [entities.Music.Event.ChangeTeam]: '作戦変更',
  [entities.Music.Event.TeamEffect]: '作戦効果',
};

interface StatusProps {
  liveStage: entities.Music.LiveStage | null;
  status: libs.PlayerStatusInterface | null;
}

function Status({ liveStage, status }: StatusProps) {
  return (
    <>
      <p>
        ボルテージ: {status?.totalVoltage.toLocaleString() ?? 0} / {liveStage?.targetVoltage.toLocaleString() ?? 0}
      </p>
      <p>
        スタミナ: {status?.stamina.toLocaleString() ?? 0} / {status?.maxStamina.toLocaleString() ?? 0}
      </p>
      <p>
        シールド: {status?.shield.toLocaleString() ?? 0} / {status?.maxStamina.toLocaleString() ?? 0}
      </p>
    </>
  );
}
