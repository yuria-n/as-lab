import styled from 'styled-components';
import { Checkbox, Dropdown, DropdownProps, Input, Tab, TabProps } from 'semantic-ui-react';
import { MouseEvent, SyntheticEvent, memo, useCallback, useEffect, useState } from 'react';
import { entities, libs } from '@as-lab/core';

import { Button, Flex, Grid, InfeedAd, InputLabel, Paper, Tooltip } from '../../../universal';
import { ConditionGrid } from '../SimulatorForm/ConditionGrid';
import { DetailedTeamOptions } from './DetailedTeamOptions';
import {
  EventType,
  handleDropdownChange,
  handleInputChangeData,
  useCallbacks,
  useCard,
  useEvent,
  useSimulator,
  useUserCard,
  useUserIdol,
} from '../../../../hooks';
import { FriendDropdown } from '../SimulatorForm/FriendDropdown';
import { PresetDropdown } from '../../../mypage/cards';
import { RoughTeamOptions } from './RoughTeamOptions';
import { SaveToDeck } from './SaveToDeck';
import {
  attributeColorMap,
  attributeTextMap,
  musicDifficultyMap,
  schoolMap,
  teamNum,
  uiColorMap,
} from '../../../../constants';
import { config } from '../../../../config';
import { getColor } from '../../../../utils';

const options = libs.DeckSimulator.defaultOptions;
const attributes = Object.values(entities.Card.Attribute);

interface Props {
  presetDeckCards: libs.DeckSimulator.DeckCard[];
}

export const DeckSimulatorFrom = memo(Component);

function Component({ presetDeckCards }: Props) {
  const [teams, setTeams] = useState<libs.DeckSimulator.TeamOptions[]>(options.teams);
  const [useKizunaSkills, setUseKizunaSkills] = useState(true);

  const musicDifficulty = useEvent(EventType.Generic, handleDropdownChange, {
    initialData: options?.difficulty ?? libs.DeckSupportSimulator.defaultOptions.difficulty,
  });
  const acCount = useEvent(EventType.Integer, handleInputChangeData, {
    initialData: options.acCount,
  });
  const notes = useEvent(EventType.Integer, handleInputChangeData, {
    initialData: options.notes,
  });
  const damage = useEvent(EventType.Integer, handleInputChangeData, {
    initialData: options.damage,
  });
  const wonderful = useEvent(EventType.Integer, handleInputChangeData, {
    initialData: options.wonderful * 100,
  });
  const changeTeam = useEvent(EventType.Integer, handleInputChangeData, {
    initialData: options.changeTeam,
  });
  const voltageLimit = useEvent(EventType.Number, handleInputChangeData, {
    initialData: options.voltageLimit * 100,
  });

  const [reductionTargets, setReductionTargets] = useState<libs.BaseSimulator.ReductionTarget[]>(
    options?.reduction?.targets ?? [entities.Card.Attribute.None],
  );
  const reductionRate = useEvent(EventType.Integer, handleInputChangeData, {
    initialData: options.reduction.rate * 100,
  });
  const reductionParam = useEvent(EventType.Generic, handleDropdownChange, {
    initialData: options.reduction.param,
  });
  const school = useEvent(EventType.Generic, handleDropdownChange, {
    initialData: '' as entities.School | '',
  });
  const schoolBonus = useEvent(EventType.Integer, handleInputChangeData, {
    initialData: options.schoolBonus * 100,
  });
  const grade = useEvent(EventType.Generic, handleDropdownChange, {
    initialData: '' as entities.Grade | '',
  });
  const gradeBonus = useEvent(EventType.Integer, handleInputChangeData, {
    initialData: options.gradeBonus * 100,
  });

  const [spTeam, setSpTeam] = useState(options.spTeam);
  const [attribute, setAttribute] = useState<entities.Card.Attribute>(entities.Card.Attribute.None);
  const onAttributeClicks = useCallbacks(
    Object.values(entities.Card.Attribute),
    (attribute) => () => {
      setAttribute(attribute);
      setReductionTargets(attributes.filter((attr) => attr !== attribute));
    },
    [setAttribute],
  );
  const [autoSimulation, setAutoSimulation] = useState(true);
  const [presetName, setPresetName] = useState('');
  const [presetOption, setPresetOption] = useState<libs.SimulatorOptions | null>(null);
  const [missionTabIndex, setMissionTabIndex] = useState(0);

  const [friend, setFriend] = useState<entities.UserFriend | null>(null);

  const simulator = useSimulator();
  const { cards, cardMap, getCards } = useCard();
  const { userCards, presetUserCards } = useUserCard();
  const { userIdols } = useUserIdol();

  const executeSimulator = useCallback(() => {
    setAutoSimulation(false);

    const cards =
      presetName || userCards.length === 0
        ? presetUserCards.find((preset) => preset.name === presetName)?.userCards ?? []
        : userCards.filter((card) => cardMap.has(card.id));

    if (cards.length < requirement) {
      return;
    }
    const options: libs.DeckSimulator.Options = {
      ...presetOption,
      deckCards: presetDeckCards,
      difficulty: musicDifficulty.data,
      notes: notes.data,
      acCount: acCount.data,
      teams,
      attribute,
      reduction: {
        targets: reductionTargets,
        param: reductionParam.data,
        rate: reductionRate.data / 100,
      },
      school: school.data !== '' ? school.data : undefined,
      schoolBonus: schoolBonus.data / 100,
      grade: grade.data !== '' ? grade.data : undefined,
      gradeBonus: gradeBonus.data / 100,
      spTeam,
      voltageLimit: voltageLimit.data / 100,
      damage: damage.data,
      changeTeam: changeTeam.data,
      wonderful: wonderful.data / 100,
      friend,
    };
    simulator.simulate({
      userIdols: useKizunaSkills ? userIdols : [],
      userCards: cards,
      options,
      auto: autoSimulation,
      presetName,
    });
  }, [
    presetName,
    presetUserCards,
    userCards,
    simulator,
    acCount,
    attribute,
    autoSimulation,
    cardMap,
    musicDifficulty,
    notes,
    presetDeckCards,
    presetOption,
    reductionTargets,
    reductionParam,
    reductionRate,
    school,
    schoolBonus,
    grade,
    gradeBonus,
    spTeam,
    teams,
    voltageLimit,
    damage,
    changeTeam,
    wonderful,
    useKizunaSkills,
    userIdols,
    friend,
  ]);

  useEffect(getCards, [getCards]);
  useEffect(() => {
    if (!autoSimulation || cards.length < requirement || cardMap.size === 0) {
      return;
    }
    if (userCards.length < requirement && presetUserCards.length === 0) {
      return;
    }
    executeSimulator();
  }, [autoSimulation, cards, cardMap, userCards, presetUserCards, executeSimulator]);
  useEffect(() => {
    if (userCards.length !== 0 || presetUserCards.length === 0) {
      setPresetName('');
      return;
    }
    const [preset] = presetUserCards;
    setPresetName(preset.name);
  }, [userCards, presetUserCards]);

  const onMusicPresetClick = useCallback(
    (_: SyntheticEvent<HTMLElement>, data: DropdownProps) => {
      const preOption = libs.presetSimulationOptions.find((opt) => opt.title === data.value);
      setPresetOption(preOption ?? null);
      setMissionTabIndex(1);

      if (!preOption) {
        return;
      }
      musicDifficulty.set(preOption.difficulty ?? libs.DeckSupportSimulator.defaultOptions.difficulty);
      if (preOption.notes) {
        notes.set(preOption.notes);
      }
      if (preOption.acCount) {
        acCount.set(preOption.acCount);
      }
      if (preOption.attribute) {
        setAttribute(preOption.attribute);
      }
      if (preOption.reduction) {
        setReductionTargets(preOption.reduction.targets ?? attributes.filter((attr) => attr !== preOption.attribute));
        reductionRate.set(preOption.reduction.rate * 100);
        reductionParam.set(preOption.reduction.param);
      }
      school.set(preOption.school ?? '');
      schoolBonus.set((preOption.schoolBonus ?? 0) * 100);
      grade.set(preOption.grade ?? '');
      gradeBonus.set((preOption.gradeBonus ?? 0) * 100);
      if (preOption.teams) {
        setTeams(preOption.teams);
      }
    },
    [
      setPresetOption,
      setMissionTabIndex,
      musicDifficulty,
      notes,
      acCount,
      setAttribute,
      reductionRate,
      reductionParam,
      school,
      schoolBonus,
      grade,
      gradeBonus,
      setTeams,
    ],
  );
  const handleTabChange = useCallback(
    (_: MouseEvent<HTMLDivElement>, { activeIndex }: TabProps) => {
      setMissionTabIndex(Number(activeIndex));
    },
    [setMissionTabIndex],
  );

  const cardShortage = userCards.length <= requirement && presetName === '';
  const mainTeamSet = new Set(teams.filter((team) => team.type !== libs.TeamType.Support).map((team) => team.team));
  const invalidTarget = teams.some((team) => team.type === libs.TeamType.Support && !mainTeamSet.has(team.target));
  const executeButtonDisabled = cardShortage || mainTeamSet.size === 0 || invalidTarget;

  return (
    <>
      <Paper margin="0 0 2.5rem">
        <h3>シミュレーション条件</h3>
        <Grid gap="2rem">
          <ConditionGrid justifyContent="start">
            <Grid gap="1rem">
              <PresetDropdown presetName={presetName} onChange={setPresetName} />
              <Checkbox
                label="キズナボードを考慮する"
                checked={useKizunaSkills}
                onClick={useCallback(() => setUseKizunaSkills((checked) => !checked), [setUseKizunaSkills])}
              />
            </Grid>{' '}
          </ConditionGrid>

          <ConditionGrid gap="1.5rem">
            <Grid>
              <InputLabel>楽曲</InputLabel>
              <Grid gap="0.5rem">
                <Grid columns={presetOption ? '1fr auto' : 'auto'} gap="0.5rem" align="center">
                  <Dropdown
                    name="music-score"
                    placeholder="指定なし"
                    search
                    selection
                    fluid
                    options={presetSimulationOptions}
                    value={presetOption?.title}
                    onChange={onMusicPresetClick}
                  />
                  {presetOption && <Tooltip content={presetOption.description} position="left center" />}
                </Grid>
                <Grid columns="repeat(2, auto)" gap="0.5rem" justifyContent="start">
                  <Flex>
                    <SpacedDropdown
                      name="music-difficulty"
                      placeholder="上級"
                      selection
                      options={musicDifficultyOptions}
                      value={musicDifficulty.data}
                      onChange={musicDifficulty.onChange}
                    />
                    <Flex>
                      <SpacedInput
                        name="notes"
                        type="number"
                        min={0}
                        max={999}
                        placeholder="-"
                        label="ノーツ数"
                        value={notes.data}
                        onChange={notes.onChange}
                      />
                      <SpacedInput
                        name="ac-count"
                        type="number"
                        min={0}
                        max={99}
                        placeholder="-"
                        label="AC回数"
                        value={acCount.data}
                        onChange={acCount.onChange}
                      />
                    </Flex>
                    <SpacedInput
                      name="voltage-limit"
                      type="number"
                      min={0}
                      max={100}
                      placeholder="-"
                      label="ボルテージ上限（％）"
                      value={voltageLimit.data}
                      onChange={voltageLimit.onChange}
                    />
                    <Flex>
                      <SpacedInput
                        name="damage"
                        type="number"
                        min={0}
                        max={9999}
                        placeholder="-"
                        label="1タップあたりのダメージ"
                        value={damage.data}
                        onChange={damage.onChange}
                      />
                      <SpacedInput
                        name="wonderful"
                        type="number"
                        min={0}
                        max={100}
                        placeholder="-"
                        label="作戦切替回数"
                        value={changeTeam.data}
                        onChange={changeTeam.onChange}
                      />
                    </Flex>
                    <SpacedInput
                      name="wonderful"
                      type="number"
                      min={0}
                      max={100}
                      placeholder="-"
                      label="Wonderful率（％）"
                      value={wonderful.data}
                      onChange={wonderful.onChange}
                    />
                  </Flex>
                </Grid>
              </Grid>
            </Grid>

            <Grid>
              <InputLabel>属性</InputLabel>
              <Grid columns="repeat(auto-fill, 6rem)" gap="0.5rem">
                {attributeOptions.map(({ value, label, color }, index) => (
                  <AttributeButton
                    key={value}
                    value={value}
                    checked={attribute === value}
                    color={color}
                    onClick={onAttributeClicks[index]}
                  >
                    {label}
                  </AttributeButton>
                ))}
              </Grid>
              {attribute !== entities.Card.Attribute.None && (
                <Flex padding="0.5rem 0 0" wrap="nowrap">
                  <span>
                    {`${attributeTextMap[attribute]}属性以外の`}
                    <Dropdown
                      name="reduction-type"
                      selection
                      value={reductionParam.data}
                      options={reductionTypeOptions}
                      onChange={reductionParam.onChange}
                    />
                    <Input
                      name="gimmick"
                      type="number"
                      min={0}
                      max={99}
                      placeholder="0"
                      value={reductionRate.data}
                      onChange={reductionRate.onChange}
                    />
                    %減少
                  </span>
                </Flex>
              )}
            </Grid>

            <Grid>
              <InputLabel>学校</InputLabel>
              <Grid columns="repeat(2, auto)" justifyContent="start">
                <Dropdown
                  name="school"
                  placeholder="学校 (例: 音ノ木坂学院)"
                  selection
                  options={schoolOptions}
                  value={school.data}
                  onChange={school.onChange}
                />
                {school && (
                  <span>
                    のボーナス
                    <Input
                      name="gimmick"
                      type="number"
                      min={0}
                      max={99}
                      placeholder="0"
                      value={schoolBonus.data}
                      onChange={schoolBonus.onChange}
                    />
                    ％
                  </span>
                )}
              </Grid>
            </Grid>

            <Grid>
              <InputLabel>学年</InputLabel>
              <Grid columns="repeat(2, auto)" justifyContent="start">
                <Dropdown
                  name="school"
                  placeholder="学年 (例: 2年生)"
                  selection
                  options={gradeOptions}
                  value={grade.data}
                  onChange={grade.onChange}
                />
                {grade && (
                  <span>
                    のボーナス
                    <Input
                      name="gimmick"
                      type="number"
                      min={0}
                      max={99}
                      placeholder="0"
                      value={gradeBonus.data}
                      onChange={gradeBonus.onChange}
                    />
                    ％
                  </span>
                )}
              </Grid>
            </Grid>
          </ConditionGrid>

          <ConditionGrid gap="1.5rem">
            <Grid>
              <InputLabel>作戦</InputLabel>
              <Tab
                menu={{ secondary: true }}
                panes={[
                  {
                    menuItem: 'ざっくり設定',
                    render: () => (
                      <RoughTeamOptions teams={teams} onChange={setTeams} spTeam={spTeam} onSpTeamClick={setSpTeam} />
                    ),
                  },
                  {
                    menuItem: '細かく設定',
                    render: () => (
                      <DetailedTeamOptions
                        teams={teams}
                        onChange={setTeams}
                        spTeam={spTeam}
                        onSpTeamClick={setSpTeam}
                      />
                    ),
                  },
                ]}
                activeIndex={missionTabIndex}
                onTabChange={handleTabChange}
              />
            </Grid>
          </ConditionGrid>

          <FriendDropdown id={friend?.id ?? ''} onChange={setFriend} />

          <ConditionGrid columns="repeat(2, auto)" gap="0.5rem" justifyContent="start">
            <Button onClick={executeSimulator} disabled={executeButtonDisabled}>
              実行
            </Button>
          </ConditionGrid>
        </Grid>
      </Paper>

      <InfeedAd className="simulator-deck-middle" slot="5734228165" />

      <SaveToDeck title={presetOption?.title ?? attributeTextMap[attribute]} />
    </>
  );
}

const requirement = teamNum * 3;

const presetSimulationOptions = [
  { value: '', text: '指定なし' },
  ...libs.presetSimulationOptions.map(({ title }) => ({
    value: title,
    text: title,
  })),
];

const musicDifficultyOptions = Object.values(entities.Music.Difficulty).map((difficulty) => ({
  value: difficulty,
  text: musicDifficultyMap[difficulty],
}));

const attributeOptions = Object.values(entities.Card.Attribute).map((value) => ({
  value,
  label: attributeTextMap[value],
  color: getColor(attributeColorMap[value]),
}));

const schoolOptions = [
  { value: '', text: '指定なし' },
  ...Object.values(entities.School).map((school) => ({ value: school, text: schoolMap[school] })),
];

const gradeOptions = [
  { value: '', text: '指定なし' },
  ...Object.values(entities.Grade)
    .filter((grade) => typeof grade === 'number')
    .map((grade) => ({ value: grade, text: `${grade}年生` })),
];

const reductionTypeOptions = [
  { value: entities.Parameter.Appeal, text: '基本アピール' },
  { value: entities.Parameter.SkillInvocation, text: '特技発動率' },
].filter((option) => config.feature || option.value === entities.Parameter.Appeal);

const focusBlue = '#96c8da';
const white = getColor(uiColorMap.white);

interface ButtonProps {
  checked: boolean;
  color: string;
}

const AttributeButton = styled.button<ButtonProps>`
  cursor: pointer;
  padding: 0.5rem;
  color: ${({ checked, color }) => (checked ? white : color)};
  background: ${({ checked, color }) => (checked ? color : white)};
  border: 2px solid ${({ color }) => color};
  font-size: 0.9rem;
  font-weight: bold;
  border-radius: 2rem;
  white-space: nowrap;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${focusBlue};
  }
`;

const SpacedDropdown = styled(Dropdown)`
  margin: 0 0.5rem 0.5rem 0;
`;

const SpacedInput = styled(Input)`
  margin: 0 0.5rem 0.5rem 0;
`;
