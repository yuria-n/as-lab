import React, { memo, useEffect, useState } from 'react';
import { DropdownItemProps } from 'semantic-ui-react';
import { entities, utils } from '@as-lab/core';

import {
  DeleteButton,
  Flex,
  Grid,
  ImageDropdown,
  InputLabel,
  Modal,
  ModalActions,
  ModalContent,
  RegisterButton,
  TeamColorDropdown,
} from '../../../universal';
import { HandleType, getAccessoryImageUrl, getAccessoryTitle, handleChange } from '../../../../utils';
import { attributeTextMap, teamNum } from '../../../../constants';
import { useAccessory, useUserAccessory } from '../../../../hooks';

type DeckAccessory = entities.Deck.Accessory | null;
type DeckTeam = entities.Deck.Team;

interface Props {
  open: boolean;
  selectedAccessory: DeckAccessory;
  deckAccessories: DeckAccessory[];
  onChange: (deckAccessory: DeckAccessory) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const DeckAccessoryDialog = memo(Component, utils.makeEqual(['onChange', 'onClose']));

function Component({ open, onChange, onDelete, onClose, ...props }: Props) {
  const [accessoryOptions, setAccessoryOptions] = useState<DropdownItemProps[]>([]);
  const [userAccessoryId, setUserAccessoryId] = useState<entities.UserAccessory['id']>('');
  const [availableTeamSet, setAvailableTeamSet] = useState(new Set<DeckTeam>());
  const [team, setTeam] = useState<DeckTeam | ''>('');
  const [deckAccessories, setDeckAccessories] = useState<DeckAccessory[]>([]);

  const { accessoryMap, getAccessoryMap } = useAccessory();
  const { userAccessories } = useUserAccessory();

  useEffect(() => {
    getAccessoryMap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const selectedId = props.selectedAccessory?.id ?? '';
    setDeckAccessories(props.deckAccessories.filter((accessory) => accessory?.id !== selectedId));
    setUserAccessoryId(selectedId);
    setTeam(props.selectedAccessory?.team ?? '');
  }, [props.selectedAccessory, props.deckAccessories]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (userAccessories.length === 0 || accessoryMap.size === 0) {
      return;
    }
    const deckAccessorySet = new Set(deckAccessories.map((deckAccessory) => deckAccessory?.id));
    const options = userAccessories
      .filter((userAccessory) => !deckAccessorySet.has(userAccessory.id))
      .filter((userAccessory) => accessoryMap.has(userAccessory.accessoryId))
      .map((userAccessory) => ({
        ...accessoryMap.get(userAccessory.accessoryId)!,
        id: userAccessory.id,
        skillFields: userAccessory.skillFields,
      }))
      .map((accessory) => ({
        key: accessory.id,
        value: accessory.id,
        text: getAccessoryTitle(accessory, attributeTextMap),
        image: { src: getAccessoryImageUrl(accessory.type, accessory.attribute) },
      }));
    setAccessoryOptions(options);
  }, [userAccessories, deckAccessories, accessoryMap]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const deckAccessoryMap = utils.groupBy(deckAccessories, (deckAccessory) => deckAccessory?.team);
    const teams = Object.values(entities.Deck.Team).filter(
      (team) => (deckAccessoryMap.get(team)?.length ?? 0) < teamNum,
    );
    setAvailableTeamSet(new Set(teams));
    if (teams.length) {
      setTeam(teams[0]);
    }
  }, [deckAccessories]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRegister = () => {
    if (!userAccessoryId || !team) {
      return;
    }
    onChange({ team, id: userAccessoryId });
  };

  return (
    <Modal open={open} onClose={onClose} header="アクセサリーを選択">
      <ModalContent>
        <Flex padding="0 0 2rem 0" direction="column" align="flex-start">
          <InputLabel>アクセサリー名</InputLabel>
          <ImageDropdown
            name="title"
            placeholder="アクセサリー名 (例: 音符のブローチ)"
            openOnFocus
            autoFocus
            fluid
            search
            value={userAccessoryId}
            options={accessoryOptions}
            onChange={(_, data) => handleChange(HandleType.String, setUserAccessoryId)(data.value)}
          />
        </Flex>

        <Flex padding="0 0 2rem 0" direction="column" align="flex-start">
          <InputLabel>作戦カラー</InputLabel>
          <TeamColorDropdown team={team} availableTeamSet={availableTeamSet} onChange={setTeam} />
        </Flex>
      </ModalContent>

      <ModalActions>
        <Grid columns="repeat(3, auto)" gap="0.5rem" justifyContent="start">
          <RegisterButton disabled={!userAccessoryId || !team} onClick={handleRegister}>
            選択
          </RegisterButton>
          <DeleteButton onClick={onDelete} />
        </Grid>
      </ModalActions>
    </Modal>
  );
}
