import React, { memo, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Checkbox, Dropdown, Input, Tab } from 'semantic-ui-react';
import { Link } from 'react-navi';

import { entities, libs } from '@as-lab/core';

import { Analytics, LogType } from '../../../clients';
import { Button } from '../../universal/buttons';
import { ChangeTeamTable } from './ChangeTeamTable';
import { config } from '../../../config';
import { Grid, GridItem, Loader, ResponsiveAd } from '../../universal';
import { handleChange, HandleType, round } from '../../../utils';
import { MusicInfo } from './MusicInfo';
import { Path } from '../../../constants';
import { DetailResultView } from './DetailResultView';
import { SpInvocationTable } from './SpInvocationTable';
import { TapRateTable } from './TapRateTable';
import { useMusic, useMusicSimulator, useUserDeck, useUserFriend } from '../../../hooks';
import { SimpleResultView } from './SimpleResultView';

const defaultFriend = { value: 'none', text: 'フレンドなし' };

export const MusicSimulator = memo(Component);

interface Props {
  tab?: Value;
}

function Component({ tab = 0 }: Props) {
  const [musicId, setMusicId] = useState(config.simulator.music.default.musicId);
  const [liveStage, setLiveStage] = useState<entities.Music.LiveStage | null>(null);
  const [selectedId, setSelectedId] = useState(config.simulator.music.default.deckId);
  const [friendId, setFriendId] = useState(libs.MusicSimulator.defaultOptions.friend?.id ?? defaultFriend.value);
  const [logLevel, setLogLevel] = useState(libs.MusicSimulator.defaultOptions.logLevel);
  const [changeTeams, setChangeTeams] = useState(libs.MusicSimulator.defaultOptions.changeTeams);
  const [tapRateMap, setTapRateMap] = useState(libs.MusicSimulator.defaultOptions.tapRateMap);
  const [spSkillInvocationNotes, setSpSkillInvocationNotes] = useState<Value[]>([]);
  const [simulationCount, setSimulationCount] = useState(100);
  const [tabIndex, setTabIndex] = useState(tab);
  const [showLoader, setShowLoader] = useState(false);

  const { userDecks } = useUserDeck();
  const { musics, getMusics, liveStageMap, getLiveStage } = useMusic();
  const { userFriends } = useUserFriend();
  const { info, results, simulate, optionsMap, getOptionsMap, setOptions } = useMusicSimulator();
  const [result] = results;

  useEffect(() => {
    Analytics.logEvent(LogType.VisitMusicSimulator);
    getMusics();
    getOptionsMap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!musicId) {
      return;
    }
    getLiveStage(musicId);
  }, [musicId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const liveStage = liveStageMap.get(musicId);
    if (!liveStage) {
      return;
    }
    setLiveStage(liveStage);
  }, [liveStageMap, musicId]);

  useEffect(() => {
    if (!liveStage) {
      return;
    }
    const options = optionsMap[musicId];
    if (!options) {
      return;
    }
    const { deckId, friendId, changeTeams, tapRateMap, spSkillInvocationNotes, logLevel } = options;
    if (deckId) {
      setSelectedId(deckId);
    }
    if (friendId) {
      setFriendId(friendId);
    }
    if (changeTeams) {
      setChangeTeams(changeTeams);
    }
    if (tapRateMap) {
      setTapRateMap(tapRateMap);
    }
    if (spSkillInvocationNotes) {
      setSpSkillInvocationNotes(spSkillInvocationNotes);
    }
    if (typeof logLevel === 'number') {
      setLogLevel(logLevel);
    }
  }, [musicId, liveStage, optionsMap]);

  useEffect(() => {
    if (results.length === 0) {
      return;
    }
    setTabIndex(1);
    setShowLoader(false);
  }, [results]);

  const disabled = !selectedId || !musicId;
  const userDeck = userDecks.find((userDeck) => userDeck.id === selectedId);

  const handleLogLevelClick = (level: libs.SkillHandler.LogLevel) => {
    setLogLevel((logLevel) => (logLevel === level ? libs.SkillHandler.LogLevel.None : level));
  };
  const handleExecutionClick = () => {
    if (disabled || !userDeck || !liveStage) {
      return;
    }
    setShowLoader(true);
    const friend = userFriends.find(({ id }) => id === friendId) ?? null;
    const options = { tapRateMap, changeTeams, spSkillInvocationNotes, logLevel, friend };
    setOptions(musicId, { deckId: selectedId, friendId, ...options });
    const count = logLevel === libs.SkillHandler.LogLevel.None ? simulationCount : 1;
    setTimeout(() => {
      simulate(userDeck, liveStage, count, options);
    });
  };

  const userDeckOptions = userDecks.map(({ id, title }) => ({
    value: id,
    text: title || id,
  }));
  const musicOptions = musics.map(({ id, title }) => ({
    value: id,
    text: title,
  }));
  const userFriendOptions = [
    defaultFriend,
    ...userFriends.map(({ id, name }) => ({
      value: id,
      text: name || id,
    })),
  ];

  return (
    <StyledDiv>
      {showLoader && <Loader />}
      <h2>楽曲シミュレーター</h2>
      <p>
        β版です。
        <br />
        このシミュレーターを利用するには、まず<Link href={Path.Mypage}>マイページ</Link>
        にてカードおよびアクセサリー、ライブ編成を登録する必要があります。
        <br />
        現在、いくつかのパラメータが仮の値になっています。
        特に毎ターン受けるダメージ値が仮の値になっており、結果に大きな影響を与える可能性があります。
        <br />
        計算式・不明点等近日公開予定です。 ぜひご協力いただけたら嬉しいです
        <span role="img" aria-label="smile">
          🤗
        </span>
      </p>
      <Grid gap="2rem">
        <GridItem>
          <Dropdown
            name="score_title"
            placeholder="楽曲"
            fluid
            search
            selection
            options={musicOptions}
            value={musicId}
            onChange={(_, data) => setMusicId(`${data.value}`)}
          />
          <Dropdown
            name="deck_title"
            placeholder="編成名"
            fluid
            search
            selection
            options={userDeckOptions}
            value={selectedId}
            onChange={(_, data) => setSelectedId(`${data.value}`)}
          />
          <Dropdown
            name="friend_title"
            placeholder="フレンド名"
            fluid
            search
            selection
            options={userFriendOptions}
            value={friendId}
            onChange={(_, data) => setFriendId(`${data.value}`)}
          />
        </GridItem>
        <GridItem>
          <MusicInfo liveStage={liveStage} />
        </GridItem>
        <GridItem>
          <Tab
            activeIndex={tabIndex}
            onTabChange={(_, props) => {
              const nextIndex = props?.activeIndex;
              if (typeof nextIndex !== 'number' || tabIndex === nextIndex) {
                return;
              }
              setTabIndex(nextIndex);
            }}
            panes={[
              {
                menuItem: '設定',
                render: () => (
                  <Tab.Pane>
                    <Grid gap="1.5rem">
                      <GridItem>
                        <ChangeTeamTable changeTeams={changeTeams} onChange={setChangeTeams} />
                      </GridItem>
                      <GridItem>
                        <SpInvocationTable
                          spSkillInvocationNotes={spSkillInvocationNotes}
                          onChange={setSpSkillInvocationNotes}
                        />
                      </GridItem>
                      <GridItem>
                        <TapRateTable tapRateMap={tapRateMap} onChange={setTapRateMap} />
                      </GridItem>
                      <GridItem>
                        <StyledCheckbox
                          label="詳細ログ"
                          checked={logLevel === libs.SkillHandler.LogLevel.Info}
                          onClick={() => handleLogLevelClick(libs.SkillHandler.LogLevel.Info)}
                        />
                      </GridItem>
                      {config.feature && (
                        <GridItem>
                          <StyledCheckbox
                            label="デバッグログ"
                            checked={logLevel === libs.SkillHandler.LogLevel.Debug}
                            onClick={() => handleLogLevelClick(libs.SkillHandler.LogLevel.Debug)}
                          />
                        </GridItem>
                      )}
                      <GridItem>
                        <Grid columns="repeat(auto-fill, 12rem)" gap="0.5rem" align="center">
                          <GridItem>
                            <Input
                              name="試行回数"
                              type="number"
                              min={1}
                              max={99999}
                              label="実行回数"
                              disabled={logLevel !== libs.SkillHandler.LogLevel.None}
                              value={simulationCount}
                              onChange={handleChange(HandleType.Number, setSimulationCount)}
                            />
                          </GridItem>
                          <GridItem>
                            <p>
                              予想計算時間:&nbsp;
                              {info ? round((simulationCount * info.totalLatency) / 1000 / info.totalCount) : 'N/A'}秒
                            </p>
                          </GridItem>
                        </Grid>
                      </GridItem>
                    </Grid>
                  </Tab.Pane>
                ),
              },
              {
                menuItem: '結果',
                render: () => (
                  <Tab.Pane>
                    {liveStage && results.length > 1 ? (
                      <SimpleResultView liveStage={liveStage} results={results} />
                    ) : (
                      <DetailResultView liveStage={liveStage} status={result?.status} histories={result?.histories} />
                    )}
                  </Tab.Pane>
                ),
              },
              // {
              //   menuItem: '計算式',
              //   render: () => (
              //     <Tab.Pane>
              //       <SimulatorDetail />
              //     </Tab.Pane>
              //   ),
              // },
            ]}
          />
        </GridItem>
        <GridItem>
          <Button onClick={handleExecutionClick} disabled={disabled}>
            実行
          </Button>
        </GridItem>
      </Grid>

      <ResponsiveAd className="simulator-music-bottom" slot="5295614628" />
    </StyledDiv>
  );
}

const StyledCheckbox = styled(Checkbox)`
  margin: 0 1rem 0 0;
`;

const StyledDiv = styled.div`
  position: relative;
`;
