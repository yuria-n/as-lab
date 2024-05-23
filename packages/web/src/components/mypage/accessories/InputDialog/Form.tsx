import React, { memo, useEffect, useMemo, useState } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { entities, masters, utils } from '@as-lab/core';

import { AbilityInput } from '../../../universal/cards';
import { DeleteButton, Flex, Grid, InputLabel, ModalActions, ModalContent, RegisterButton } from '../../../universal';
import { TemplateInput } from '../../../universal/skills';
import { attributeTextMap } from '../../../../constants';
import { useAccessory, useCondition, useSkill, useUserAccessory } from '../../../../hooks';

interface Props {
  id?: entities.UserAccessory['id'];
  onUpdate: () => void;
}

export const Form = memo(Component, utils.makeEqual(['onUpdate']));

export function Component({ id, onUpdate }: Props) {
  const edit = !!id;
  const [type, setType] = useState('');
  const [masterAccessory, setMasterAccessory] = useState<entities.MasterAccessory | null>(null);
  const [attribute, setAttribute] = useState<entities.Card.Attribute | ''>('');
  const [rarity, setRarity] = useState<entities.Card.Rarity | ''>('');
  const [accessory, setAccessory] = useState<entities.Accessory | null>(null);
  const [appeal, setAppeal] = useState(-1);
  const [stamina, setStamina] = useState(-1);
  const [technique, setTechnique] = useState(-1);
  const [skillFields, setSkillFields] = useState<any[]>([]);
  const [userAccessory, setUserAccessory] = useState<entities.UserAccessory | null>(null);

  const { masterAccessories, getMasterAccessories, accessoryMap, getAccessoryMap } = useAccessory();
  const { userAccessories, createUserAccessory, updateUserAccessory, deleteUserAccessory } = useUserAccessory();

  const { skillMap, getSkillMap } = useSkill();
  const { conditions, getConditions } = useCondition();

  const disabled = !accessory;
  const skill = skillMap.get(accessory?.skillId ?? '');
  const skillTarget = skill ? masters.skillTargetTitleMap[skill.target] : 'なし';
  const condition = skill ? conditions.find((cond) => cond.type === skill.condition) : null;
  const conditionTitle = condition?.title ?? '';

  useEffect(() => {
    getMasterAccessories();
    getAccessoryMap();
    getSkillMap();
    getConditions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!id) {
      return;
    }
    const userAccessory = userAccessories.find((userAccessory) => userAccessory.id === id);
    if (!userAccessory) {
      return;
    }
    setUserAccessory(userAccessory);
  }, [id, userAccessories]);

  useEffect(() => {
    if (!userAccessory) {
      return;
    }
    const accessory = accessoryMap.get(userAccessory.accessoryId);
    if (!accessory) {
      return;
    }
    setType(accessory.type);
    setAttribute(accessory.attribute);
    setRarity(accessory.rarity);
    setAppeal(userAccessory.appeal);
    setStamina(userAccessory.stamina);
    setTechnique(userAccessory.technique);
  }, [userAccessory, accessoryMap]);

  useEffect(() => {
    const masterAccessory = masterAccessories.find((masterAccessory) => masterAccessory.type === type);
    if (!masterAccessory) {
      return;
    }
    setMasterAccessory(masterAccessory);
  }, [type, masterAccessories]);

  useEffect(() => {
    if (!masterAccessory) {
      return;
    }
    const [attribute] = masterAccessory.attributes;
    const [rarity] = masterAccessory.rarities;
    setAttribute(attribute);
    setRarity(rarity);
    if (appeal === -1) {
      setAppeal(masterAccessory.appeal);
    }
    if (stamina === -1) {
      setStamina(masterAccessory.stamina);
    }
    if (technique === -1) {
      setTechnique(masterAccessory.technique);
    }
  }, [masterAccessory, appeal, stamina, technique]);

  useEffect(() => {
    if (!type || !attribute || !rarity || accessoryMap.size === 0) {
      return;
    }
    const accessory = Array.from(accessoryMap.values()).find(
      (accessory) => accessory.type === type && accessory.attribute === attribute && accessory.rarity === rarity,
    );
    if (!accessory) {
      return;
    }
    setAccessory(accessory);
  }, [type, attribute, rarity, accessoryMap]);

  // update skill fields
  useEffect(() => {
    if (!accessory) {
      return;
    }
    setSkillFields(userAccessory ? [...userAccessory.skillFields] : [...accessory.skillFields]);
  }, [userAccessory, accessory]); // eslint-disable-line react-hooks/exhaustive-deps

  const onClick = () => {
    if (!accessory) {
      return;
    }
    const userAccessory = {
      accessoryId: accessory.id,
      appeal,
      stamina,
      technique,
      skillFields,
    };
    edit ? updateUserAccessory({ id: id!, ...userAccessory }) : createUserAccessory(userAccessory);
    onUpdate();
  };
  const onDelete = () => {
    if (!id) {
      return;
    }
    deleteUserAccessory(id);
    onUpdate();
  };
  const handleTypeChange = (type: entities.Accessory['type']) => {
    setUserAccessory(null);
    setType(type);
  };

  const typeOptions = useMemo(
    () =>
      masterAccessories.map(({ type, title }) => ({
        value: type,
        text: title,
      })),
    [masterAccessories],
  );
  const attributeOptions = useMemo(
    () =>
      masterAccessory?.attributes.map((attribute) => ({
        value: attribute,
        text: attributeTextMap[attribute],
      })) ?? [],
    [masterAccessory],
  );
  const rarityOptions = useMemo(
    () =>
      masterAccessory?.rarities.map((rarity) => ({
        value: rarity,
        text: rarity,
      })) ?? [],
    [masterAccessory],
  );

  return (
    <>
      <ModalContent>
        <Flex>
          <Dropdown
            name="title"
            placeholder="アクセサリー名"
            fluid
            search
            selection
            options={typeOptions}
            value={type}
            onChange={(_, data) => handleTypeChange(`${data.value}`)}
          />
          <Dropdown
            name="attribute"
            placeholder="属性"
            fluid
            search
            selection
            options={attributeOptions}
            value={attribute}
            disabled={!attributeOptions || attributeOptions.length === 0}
            onChange={(_, data) => setAttribute(`${data.value}` as entities.Card.Attribute)}
          />
          <Dropdown
            name="rarity"
            placeholder="レアリティ"
            fluid
            search
            selection
            options={rarityOptions}
            value={rarity}
            disabled={!rarityOptions || rarityOptions.length === 0}
            onChange={(_, data) => setRarity(`${data.value}` as entities.Card.Rarity)}
          />
        </Flex>
        <Flex padding="0.5rem 0 1rem 0" justify="flex-start">
          <AbilityInput name="appeal" label="アピール" value={appeal} disabled={disabled} setter={setAppeal} />
          <AbilityInput name="stamina" label="スタミナ" value={stamina} disabled={disabled} setter={setStamina} />
          <AbilityInput
            name="technique"
            label="テクニック"
            value={technique}
            disabled={disabled}
            setter={setTechnique}
          />
        </Flex>

        <Flex padding="1rem 0 0" direction="column" align="flex-start">
          <InputLabel>スキル</InputLabel>
          {skill && (
            <>
              <p>
                {`${skill.slug}${
                  /(パッシブ|発動確率)/.test(conditionTitle)
                    ? `${skillTarget === 'なし' ? '' : ` : ${skillTarget}`}`
                    : ` : ${conditionTitle}${skillTarget === 'なし' ? '' : ` / ${skillTarget}`}`
                }`}
              </p>
              <TemplateInput
                template={skill.description}
                fields={skill.fields}
                values={skillFields}
                onChange={(index, value) =>
                  setSkillFields((fields) => {
                    fields = [...fields];
                    fields[index] = value;
                    return fields;
                  })
                }
              />
              <Flex padding="1rem 0" justify="flex-start">
                <TemplateInput
                  template={condition?.description ?? ''}
                  fields={condition?.fields}
                  values={accessory?.conditionFields}
                />
              </Flex>
            </>
          )}
        </Flex>
      </ModalContent>

      <ModalActions>
        <Grid columns="repeat(2, auto)" gap="0.5rem" justifyContent="start">
          <RegisterButton disabled={disabled} onClick={onClick}>
            {edit ? '更新' : '登録'}
          </RegisterButton>
          {edit && <DeleteButton onClick={onDelete} />}
        </Grid>
      </ModalActions>
    </>
  );
}
